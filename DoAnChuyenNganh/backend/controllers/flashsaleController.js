const db = require('../config/database');

/**
 * Get all flash sales (Admin)
 */
const getAllFlashSales = async (req, res) => {
    try {
        const [flashsales] = await db.query(`
            SELECT fs.*, 
                   COUNT(fsp.IdFlashSaleProduct) as TotalProducts
            FROM FlashSale fs
            LEFT JOIN FlashSaleProducts fsp ON fs.IdFlashSale = fsp.FlashSaleId
            GROUP BY fs.IdFlashSale
            ORDER BY fs.NgayBatDau DESC
        `);

        res.json({
            success: true,
            data: flashsales
        });
    } catch (error) {
        console.error('Get all flash sales error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách flash sale'
        });
    }
};

/**
 * Get active flash sale (Public)
 */
const getActiveFlashSale = async (req, res) => {
    try {
        const now = new Date();

        // Get active flash sale
        const [flashsales] = await db.query(`
            SELECT * FROM FlashSale
            WHERE NgayBatDau <= ? AND NgayKetThuc >= ?
            AND TrangThai = 'DangDien'
            LIMIT 1
        `, [now, now]);

        if (flashsales.length === 0) {
            return res.json({
                success: true,
                data: null,
                message: 'Không có flash sale đang diễn ra'
            });
        }

        const flashSale = flashsales[0];

        // Get products in this flash sale
        const [products] = await db.query(`
            SELECT fsp.*, 
                   sp.TenSanPham, sp.MoTaSanPham, sp.SoLuongSanPham,
                   th.TenThuongHieu,
                   dm.TenDanhMuc,
                   ha.Url as HinhAnh
            FROM FlashSaleProducts fsp
            JOIN SanPham sp ON fsp.SanPhamId = sp.IdSanPham
            LEFT JOIN ThuongHieu th ON sp.ThuongHieuId = th.IdThuongHieu
            LEFT JOIN DanhMuc dm ON sp.DanhMucId = dm.IdDanhMuc
            LEFT JOIN HinhAnhSanPham ha ON sp.IdSanPham = ha.SanPhamId AND ha.AnhMacDinh = 1
            WHERE fsp.FlashSaleId = ?
            AND sp.TrangThaiSanPham = 'DangBan'
        `, [flashSale.IdFlashSale]);

        // Nếu không có sản phẩm, không trả về flash sale
        if (products.length === 0) {
            return res.json({
                success: true,
                data: null,
                message: 'Flash sale không có sản phẩm'
            });
        }

        flashSale.products = products;

        res.json({
            success: true,
            data: flashSale
        });
    } catch (error) {
        console.error('Get active flash sale error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy flash sale'
        });
    }
};

/**
 * Create flash sale
 */
const createFlashSale = async (req, res) => {
    try {
        const { tenFlashSale, moTa, ngayBatDau, ngayKetThuc } = req.body;

        // Validation
        if (!tenFlashSale || !ngayBatDau || !ngayKetThuc) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        // Determine status
        const now = new Date();
        const start = new Date(ngayBatDau);
        const end = new Date(ngayKetThuc);

        let trangThai = 'SapDien';
        if (now >= start && now <= end) {
            trangThai = 'DangDien';
        } else if (now > end) {
            trangThai = 'DaKetThuc';
        }

        const [result] = await db.query(`
            INSERT INTO FlashSale (TenFlashSale, MoTa, NgayBatDau, NgayKetThuc, TrangThai)
            VALUES (?, ?, ?, ?, ?)
        `, [tenFlashSale, moTa, ngayBatDau, ngayKetThuc, trangThai]);

        res.json({
            success: true,
            message: 'Tạo flash sale thành công',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Create flash sale error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo flash sale'
        });
    }
};

/**
 * Update flash sale
 */
const updateFlashSale = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenFlashSale, moTa, ngayBatDau, ngayKetThuc } = req.body;

        // Determine status
        const now = new Date();
        const start = new Date(ngayBatDau);
        const end = new Date(ngayKetThuc);

        let trangThai = 'SapDien';
        if (now >= start && now <= end) {
            trangThai = 'DangDien';
        } else if (now > end) {
            trangThai = 'DaKetThuc';
        }

        await db.query(`
            UPDATE FlashSale
            SET TenFlashSale = ?, MoTa = ?, NgayBatDau = ?, NgayKetThuc = ?, TrangThai = ?
            WHERE IdFlashSale = ?
        `, [tenFlashSale, moTa, ngayBatDau, ngayKetThuc, trangThai, id]);

        res.json({
            success: true,
            message: 'Cập nhật flash sale thành công'
        });
    } catch (error) {
        console.error('Update flash sale error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật flash sale'
        });
    }
};

/**
 * Delete flash sale
 */
const deleteFlashSale = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('DELETE FROM FlashSale WHERE IdFlashSale = ?', [id]);

        res.json({
            success: true,
            message: 'Xóa flash sale thành công'
        });
    } catch (error) {
        console.error('Delete flash sale error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa flash sale'
        });
    }
};

/**
 * Get products in flash sale
 */
const getFlashSaleProducts = async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await db.query(`
            SELECT fsp.*, 
                   sp.TenSanPham, sp.MoTaSanPham, sp.GiaSanPham, sp.SoLuongSanPham,
                   th.TenThuongHieu,
                   dm.TenDanhMuc,
                   ha.Url as HinhAnh
            FROM FlashSaleProducts fsp
            JOIN SanPham sp ON fsp.SanPhamId = sp.IdSanPham
            LEFT JOIN ThuongHieu th ON sp.ThuongHieuId = th.IdThuongHieu
            LEFT JOIN DanhMuc dm ON sp.DanhMucId = dm.IdDanhMuc
            LEFT JOIN HinhAnhSanPham ha ON sp.IdSanPham = ha.SanPhamId AND ha.AnhMacDinh = 1
            WHERE fsp.FlashSaleId = ?
        `, [id]);

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get flash sale products error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy sản phẩm'
        });
    }
};

/**
 * Add product to flash sale
 */
const addProductToFlashSale = async (req, res) => {
    try {
        const { id } = req.params;
        const { sanPhamId, giaGoc, giaFlashSale, soLuongGioiHan } = req.body;

        // Validation
        if (!sanPhamId || !giaGoc || !giaFlashSale) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        if (giaFlashSale >= giaGoc) {
            return res.status(400).json({
                success: false,
                message: 'Giá flash sale phải nhỏ hơn giá gốc'
            });
        }

        await db.query(`
            INSERT INTO FlashSaleProducts (FlashSaleId, SanPhamId, GiaGoc, GiaFlashSale, SoLuongGioiHan, DaBan)
            VALUES (?, ?, ?, ?, ?, 0)
            ON DUPLICATE KEY UPDATE 
                GiaGoc = VALUES(GiaGoc),
                GiaFlashSale = VALUES(GiaFlashSale),
                SoLuongGioiHan = VALUES(SoLuongGioiHan)
        `, [id, sanPhamId, giaGoc, giaFlashSale, soLuongGioiHan || 0]);

        res.json({
            success: true,
            message: 'Thêm sản phẩm vào flash sale thành công'
        });
    } catch (error) {
        console.error('Add product to flash sale error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm sản phẩm'
        });
    }
};

/**
 * Remove product from flash sale
 */
const removeProductFromFlashSale = async (req, res) => {
    try {
        const { flashsaleId, productId } = req.params;

        await db.query(`
            DELETE FROM FlashSaleProducts 
            WHERE FlashSaleId = ? AND SanPhamId = ?
        `, [flashsaleId, productId]);

        res.json({
            success: true,
            message: 'Xóa sản phẩm khỏi flash sale thành công'
        });
    } catch (error) {
        console.error('Remove product from flash sale error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa sản phẩm'
        });
    }
};

// ============ SIMPLIFIED FLASH SALE PRODUCT MANAGEMENT ============

/**
 * Get all flash sale products (simplified - no program needed)
 */
const getAllFlashSaleProducts = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT fsp.IdFlashSaleProduct as Id, fsp.SanPhamId, fsp.GiaGoc, fsp.GiaFlashSale, 
                   fsp.SoLuongGioiHan, fsp.DaBan,
                   sp.TenSanPham, sp.MoTaSanPham,
                   th.TenThuongHieu,
                   ha.Url as HinhAnh
            FROM FlashSaleProducts fsp
            JOIN SanPham sp ON fsp.SanPhamId = sp.IdSanPham
            LEFT JOIN ThuongHieu th ON sp.ThuongHieuId = th.IdThuongHieu
            LEFT JOIN HinhAnhSanPham ha ON sp.IdSanPham = ha.SanPhamId AND ha.AnhMacDinh = 1
            ORDER BY fsp.IdFlashSaleProduct DESC
        `);

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get all flash sale products error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách sản phẩm flash sale'
        });
    }
};

/**
 * Add product to flash sale (simplified)
 */
const addFlashSaleProduct = async (req, res) => {
    try {
        const { sanPhamId, giaGoc, giaFlashSale, soLuongGioiHan, ngayBatDau, ngayKetThuc } = req.body;

        if (!sanPhamId || !giaGoc || !giaFlashSale || !ngayBatDau || !ngayKetThuc) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        if (parseInt(giaFlashSale) >= parseInt(giaGoc)) {
            return res.status(400).json({
                success: false,
                message: 'Giá flash sale phải nhỏ hơn giá gốc'
            });
        }

        // Check if product already in flash sale
        const [existing] = await db.query(
            'SELECT * FROM FlashSaleProducts WHERE SanPhamId = ?',
            [sanPhamId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm đã có trong flash sale'
            });
        }

        // Get or create default flash sale
        let flashSaleId = 1;
        const [flashSales] = await db.query('SELECT IdFlashSale FROM FlashSale LIMIT 1');
        
        if (flashSales.length === 0) {
            // Create default flash sale with provided dates
            const [result] = await db.query(`
                INSERT INTO FlashSale (TenFlashSale, MoTa, NgayBatDau, NgayKetThuc, TrangThai)
                VALUES ('Flash Sale', 'Chương trình Flash Sale', ?, ?, 'DangDien')
            `, [ngayBatDau, ngayKetThuc]);
            flashSaleId = result.insertId;
        } else {
            // Update existing flash sale dates
            flashSaleId = flashSales[0].IdFlashSale;
            await db.query(`
                UPDATE FlashSale 
                SET NgayBatDau = ?, NgayKetThuc = ?, TrangThai = 'DangDien'
                WHERE IdFlashSale = ?
            `, [ngayBatDau, ngayKetThuc, flashSaleId]);
        }

        await db.query(`
            INSERT INTO FlashSaleProducts (FlashSaleId, SanPhamId, GiaGoc, GiaFlashSale, SoLuongGioiHan, DaBan)
            VALUES (?, ?, ?, ?, ?, 0)
        `, [flashSaleId, sanPhamId, giaGoc, giaFlashSale, soLuongGioiHan || 10]);

        res.json({
            success: true,
            message: 'Thêm sản phẩm flash sale thành công'
        });
    } catch (error) {
        console.error('Add flash sale product error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm sản phẩm'
        });
    }
};

/**
 * Update flash sale product (by IdFlashSaleProduct or SanPhamId)
 */
const updateFlashSaleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { giaFlashSale, soLuongGioiHan, ngayBatDau, ngayKetThuc } = req.body;

        // Update product
        await db.query(`
            UPDATE FlashSaleProducts
            SET GiaFlashSale = ?, SoLuongGioiHan = ?
            WHERE IdFlashSaleProduct = ? OR SanPhamId = ?
        `, [giaFlashSale, soLuongGioiHan || 10, id, id]);

        // Update flash sale dates if provided
        if (ngayBatDau && ngayKetThuc) {
            await db.query(`
                UPDATE FlashSale 
                SET NgayBatDau = ?, NgayKetThuc = ?
                WHERE IdFlashSale = (SELECT FlashSaleId FROM FlashSaleProducts WHERE IdFlashSaleProduct = ? OR SanPhamId = ? LIMIT 1)
            `, [ngayBatDau, ngayKetThuc, id, id]);
        }

        res.json({
            success: true,
            message: 'Cập nhật thành công'
        });
    } catch (error) {
        console.error('Update flash sale product error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật'
        });
    }
};

/**
 * Delete flash sale product (by IdFlashSaleProduct or SanPhamId)
 */
const deleteFlashSaleProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Try delete by IdFlashSaleProduct first, then by SanPhamId
        await db.query('DELETE FROM FlashSaleProducts WHERE IdFlashSaleProduct = ? OR SanPhamId = ?', [id, id]);

        res.json({
            success: true,
            message: 'Xóa thành công'
        });
    } catch (error) {
        console.error('Delete flash sale product error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa'
        });
    }
};

module.exports = {
    getAllFlashSales,
    getActiveFlashSale,
    createFlashSale,
    updateFlashSale,
    deleteFlashSale,
    getFlashSaleProducts,
    addProductToFlashSale,
    removeProductFromFlashSale,
    // Simplified endpoints
    getAllFlashSaleProducts,
    addFlashSaleProduct,
    updateFlashSaleProduct,
    deleteFlashSaleProduct
};
