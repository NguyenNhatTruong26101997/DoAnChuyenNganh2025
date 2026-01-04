const db = require('../config/database');

// Get or create cart for user
const getCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get or create cart
        let [carts] = await db.query(
            'SELECT IdGioHang FROM GioHang WHERE UserId = ?',
            [userId]
        );

        let cartId;
        if (carts.length === 0) {
            // Create new cart
            const [result] = await db.query(
                'INSERT INTO GioHang (UserId) VALUES (?)',
                [userId]
            );
            cartId = result.insertId;
        } else {
            cartId = carts[0].IdGioHang;
        }

        // Get cart items with product details
        const [items] = await db.query(
            `SELECT 
                ct.IdChiTietGioHang,
                ct.SoLuongChiTietGioHang,
                sp.IdSanPham,
                sp.TenSanPham,
                sp.GiaSanPham,
                sp.SoLuongSanPham,
                (SELECT Url FROM HinhAnhSanPham WHERE SanPhamId = sp.IdSanPham AND AnhMacDinh = 1 LIMIT 1) as AnhChinh
            FROM ChiTietGioHang ct
            JOIN SanPham sp ON ct.SanPhamId = sp.IdSanPham
            WHERE ct.GioHangId = ?`,
            [cartId]
        );

        // Calculate total
        const total = items.reduce((sum, item) =>
            sum + (item.GiaSanPham * item.SoLuongChiTietGioHang), 0
        );

        res.json({
            success: true,
            data: {
                cartId,
                items,
                total,
                itemCount: items.length
            }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy giỏ hàng'
        });
    }
};

// Add item to cart
const addToCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { sanPhamId, soLuong = 1 } = req.body;

        if (!sanPhamId) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn sản phẩm'
            });
        }

        // Check if product exists and is available
        const [products] = await db.query(
            'SELECT IdSanPham, SoLuongSanPham, TrangThaiSanPham FROM SanPham WHERE IdSanPham = ?',
            [sanPhamId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        if (products[0].TrangThaiSanPham !== 'DangBan') {
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm không còn bán'
            });
        }

        if (products[0].SoLuongSanPham < soLuong) {
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm không đủ số lượng'
            });
        }

        // Get or create cart
        let [carts] = await db.query(
            'SELECT IdGioHang FROM GioHang WHERE UserId = ?',
            [userId]
        );

        let cartId;
        if (carts.length === 0) {
            const [result] = await db.query(
                'INSERT INTO GioHang (UserId) VALUES (?)',
                [userId]
            );
            cartId = result.insertId;
        } else {
            cartId = carts[0].IdGioHang;
        }

        // Check if item already in cart
        const [existingItems] = await db.query(
            'SELECT IdChiTietGioHang, SoLuongChiTietGioHang FROM ChiTietGioHang WHERE GioHangId = ? AND SanPhamId = ?',
            [cartId, sanPhamId]
        );

        if (existingItems.length > 0) {
            // Update quantity
            const newQuantity = existingItems[0].SoLuongChiTietGioHang + soLuong;

            if (products[0].SoLuongSanPham < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Sản phẩm không đủ số lượng'
                });
            }

            await db.query(
                'UPDATE ChiTietGioHang SET SoLuongChiTietGioHang = ? WHERE IdChiTietGioHang = ?',
                [newQuantity, existingItems[0].IdChiTietGioHang]
            );
        } else {
            // Add new item
            await db.query(
                'INSERT INTO ChiTietGioHang (GioHangId, SanPhamId, SoLuongChiTietGioHang) VALUES (?, ?, ?)',
                [cartId, sanPhamId, soLuong]
            );
        }

        res.json({
            success: true,
            message: 'Đã thêm vào giỏ hàng'
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi thêm vào giỏ hàng'
        });
    }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { itemId } = req.params;
        const { soLuong } = req.body;

        if (!soLuong || soLuong < 1) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng không hợp lệ'
            });
        }

        // Verify item belongs to user's cart
        const [items] = await db.query(
            `SELECT ct.IdChiTietGioHang, ct.SanPhamId, sp.SoLuongSanPham
            FROM ChiTietGioHang ct
            JOIN GioHang gh ON ct.GioHangId = gh.IdGioHang
            JOIN SanPham sp ON ct.SanPhamId = sp.IdSanPham
            WHERE ct.IdChiTietGioHang = ? AND gh.UserId = ?`,
            [itemId, userId]
        );

        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm trong giỏ hàng'
            });
        }

        if (items[0].SoLuongSanPham < soLuong) {
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm không đủ số lượng'
            });
        }

        // Update quantity
        await db.query(
            'UPDATE ChiTietGioHang SET SoLuongChiTietGioHang = ? WHERE IdChiTietGioHang = ?',
            [soLuong, itemId]
        );

        res.json({
            success: true,
            message: 'Cập nhật giỏ hàng thành công'
        });
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật giỏ hàng'
        });
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { itemId } = req.params;

        // Verify and delete
        const [result] = await db.query(
            `DELETE ct FROM ChiTietGioHang ct
            JOIN GioHang gh ON ct.GioHangId = gh.IdGioHang
            WHERE ct.IdChiTietGioHang = ? AND gh.UserId = ?`,
            [itemId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm trong giỏ hàng'
            });
        }

        res.json({
            success: true,
            message: 'Đã xóa sản phẩm khỏi giỏ hàng'
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa sản phẩm'
        });
    }
};

// Clear cart
const clearCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get cart
        const [carts] = await db.query(
            'SELECT IdGioHang FROM GioHang WHERE UserId = ?',
            [userId]
        );

        if (carts.length > 0) {
            await db.query(
                'DELETE FROM ChiTietGioHang WHERE GioHangId = ?',
                [carts[0].IdGioHang]
            );
        }

        res.json({
            success: true,
            message: 'Đã xóa toàn bộ giỏ hàng'
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa giỏ hàng'
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
