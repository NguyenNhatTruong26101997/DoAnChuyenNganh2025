const db = require('../config/database');

// Get all products with filtering and pagination
const getAllProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            danhMuc,
            thuongHieu,
            minPrice,
            maxPrice,
            search,
            sort = 'newest'
        } = req.query;

        const offset = (page - 1) * limit;

        // Build WHERE clause - Show all products (including NgungBan)
        let whereConditions = ['1=1']; // Always true, show all products
        let queryParams = [];

        if (danhMuc) {
            whereConditions.push('sp.DanhMucId = ?');
            queryParams.push(danhMuc);
        }

        if (thuongHieu) {
            whereConditions.push('sp.ThuongHieuId = ?');
            queryParams.push(thuongHieu);
        }

        if (minPrice) {
            whereConditions.push('sp.GiaSanPham >= ?');
            queryParams.push(minPrice);
        }

        if (maxPrice) {
            whereConditions.push('sp.GiaSanPham <= ?');
            queryParams.push(maxPrice);
        }

        if (search) {
            whereConditions.push('(sp.TenSanPham LIKE ? OR sp.MoTaSanPham LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        const whereClause = whereConditions.join(' AND ');

        // Determine sorting
        let orderBy = 'sp.IdSanPham DESC'; // Default: newest
        if (sort === 'price_asc') orderBy = 'sp.GiaSanPham ASC';
        if (sort === 'price_desc') orderBy = 'sp.GiaSanPham DESC';
        if (sort === 'name_asc') orderBy = 'sp.TenSanPham ASC';
        if (sort === 'name_desc') orderBy = 'sp.TenSanPham DESC';

        // Get total count
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM SanPham sp WHERE ${whereClause}`,
            queryParams
        );

        const totalProducts = countResult[0].total;
        const totalPages = Math.ceil(totalProducts / limit);

        // Get products with category, brand, and main image
        const [products] = await db.query(
            `SELECT 
                sp.IdSanPham,
                sp.TenSanPham,
                sp.MoTaSanPham,
                sp.GiaSanPham,
                sp.SoLuongSanPham,
                sp.TrangThaiSanPham,
                sp.DanhMucId,
                sp.ThuongHieuId,
                dm.TenDanhMuc,
                th.TenThuongHieu,
                (SELECT Url FROM HinhAnhSanPham WHERE SanPhamId = sp.IdSanPham AND AnhMacDinh = 1 LIMIT 1) as AnhChinh
            FROM SanPham sp
            LEFT JOIN DanhMuc dm ON sp.DanhMucId = dm.IdDanhMuc
            LEFT JOIN ThuongHieu th ON sp.ThuongHieuId = th.IdThuongHieu
            WHERE ${whereClause}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?`,
            [...queryParams, parseInt(limit), parseInt(offset)]
        );

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalProducts,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách sản phẩm'
        });
    }
};

// Get product by ID with all images
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get product details
        const [products] = await db.query(
            `SELECT 
                sp.IdSanPham,
                sp.TenSanPham,
                sp.MoTaSanPham,
                sp.GiaSanPham,
                sp.SoLuongSanPham,
                sp.TrangThaiSanPham,
                sp.KieuOCung,
                sp.DungLuongOCung,
                sp.CongNgheManHinh,
                sp.TanSoQuet,
                sp.DoPhanGiai,
                sp.Pin,
                sp.XuatXu,
                sp.TrongLuong,
                dm.IdDanhMuc,
                dm.TenDanhMuc,
                th.IdThuongHieu,
                th.TenThuongHieu
            FROM SanPham sp
            LEFT JOIN DanhMuc dm ON sp.DanhMucId = dm.IdDanhMuc
            LEFT JOIN ThuongHieu th ON sp.ThuongHieuId = th.IdThuongHieu
            WHERE sp.IdSanPham = ?`,
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Get all images for the product
        const [images] = await db.query(
            'SELECT IdHinhAnhSanPham, Url, AnhMacDinh FROM HinhAnhSanPham WHERE SanPhamId = ? ORDER BY AnhMacDinh DESC',
            [id]
        );

        const product = {
            ...products[0],
            images
        };

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin sản phẩm'
        });
    }
};

// Create new product (Admin only)
const createProduct = async (req, res) => {
    try {
        const { tenSanPham, moTaSanPham, giaSanPham, soLuongSanPham, thuongHieuId, danhMucId, images,
                kieuOCung, dungLuongOCung, congNgheManHinh, tanSoQuet, doPhanGiai, pin, xuatXu, trongLuong } = req.body;

        // Validate input
        if (!tenSanPham || !giaSanPham) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tên và giá sản phẩm'
            });
        }

        // Validate numeric values
        const price = parseFloat(giaSanPham);
        const quantity = parseInt(soLuongSanPham) || 0;

        if (isNaN(price) || price < 5000000 || price > 100000000) {
            return res.status(400).json({
                success: false,
                message: 'Giá phải từ 5,000,000 đến 100,000,000'
            });
        }

        if (quantity <= 0 || quantity > 50) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng phải lớn hơn 0 và nhỏ hơn hoặc bằng 50'
            });
        }

        // Insert product
        const [result] = await db.query(
            `INSERT INTO SanPham (TenSanPham, MoTaSanPham, GiaSanPham, SoLuongSanPham, ThuongHieuId, DanhMucId,
                                  KieuOCung, DungLuongOCung, CongNgheManHinh, TanSoQuet, DoPhanGiai, Pin, XuatXu, TrongLuong)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tenSanPham, moTaSanPham || null, price, quantity, thuongHieuId || null, danhMucId || null,
             kieuOCung || null, dungLuongOCung || null, congNgheManHinh || null, tanSoQuet || null,
             doPhanGiai || null, pin || null, xuatXu || null, trongLuong || null]
        );

        const productId = result.insertId;

        // Insert images if provided
        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                const isMain = images[i].isMain !== undefined ? images[i].isMain : (i === 0);
                await db.query(
                    'INSERT INTO HinhAnhSanPham (SanPhamId, Url, AnhMacDinh) VALUES (?, ?, ?)',
                    [productId, images[i].url, isMain ? 1 : 0]
                );
            }
        }

        res.status(201).json({
            success: true,
            message: 'Thêm sản phẩm thành công',
            data: { productId }
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi thêm sản phẩm'
        });
    }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenSanPham, moTaSanPham, giaSanPham, soLuongSanPham, thuongHieuId, danhMucId, trangThaiSanPham, images,
                kieuOCung, dungLuongOCung, congNgheManHinh, tanSoQuet, doPhanGiai, pin, xuatXu, trongLuong } = req.body;

        // Check if product exists
        const [existing] = await db.query('SELECT IdSanPham FROM SanPham WHERE IdSanPham = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Validate numeric values
        const price = parseFloat(giaSanPham);
        const quantity = parseInt(soLuongSanPham) || 0;

        if (isNaN(price) || price < 5000000 || price > 100000000) {
            return res.status(400).json({
                success: false,
                message: 'Giá phải từ 5,000,000 đến 100,000,000'
            });
        }

        if (quantity <= 0 || quantity > 50) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng phải lớn hơn 0 và nhỏ hơn hoặc bằng 50'
            });
        }

        // Update product
        await db.query(
            `UPDATE SanPham 
            SET TenSanPham = ?, MoTaSanPham = ?, GiaSanPham = ?, SoLuongSanPham = ?, 
                ThuongHieuId = ?, DanhMucId = ?, TrangThaiSanPham = ?,
                KieuOCung = ?, DungLuongOCung = ?, CongNgheManHinh = ?, TanSoQuet = ?,
                DoPhanGiai = ?, Pin = ?, XuatXu = ?, TrongLuong = ?
            WHERE IdSanPham = ?`,
            [tenSanPham, moTaSanPham, price, quantity, thuongHieuId, danhMucId, trangThaiSanPham || 'DangBan',
             kieuOCung || null, dungLuongOCung || null, congNgheManHinh || null, tanSoQuet || null,
             doPhanGiai || null, pin || null, xuatXu || null, trongLuong || null, id]
        );

        // Handle images update if provided
        if (images && images.length > 0) {
            // Delete existing images
            await db.query('DELETE FROM HinhAnhSanPham WHERE SanPhamId = ?', [id]);

            // Insert new images
            for (let i = 0; i < images.length; i++) {
                const isMain = images[i].isMain !== undefined ? images[i].isMain : (i === 0);
                await db.query(
                    'INSERT INTO HinhAnhSanPham (SanPhamId, Url, AnhMacDinh) VALUES (?, ?, ?)',
                    [id, images[i].url, isMain ? 1 : 0]
                );
            }
        }

        res.json({
            success: true,
            message: 'Cập nhật sản phẩm thành công'
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật sản phẩm'
        });
    }
};

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if product exists
        const [existing] = await db.query('SELECT IdSanPham FROM SanPham WHERE IdSanPham = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Delete product (images will be deleted automatically due to CASCADE)
        await db.query('DELETE FROM SanPham WHERE IdSanPham = ?', [id]);

        res.json({
            success: true,
            message: 'Xóa sản phẩm thành công'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa sản phẩm'
        });
    }
};

// Search products
const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập từ khóa tìm kiếm'
            });
        }

        const [products] = await db.query(
            `SELECT 
                sp.IdSanPham,
                sp.TenSanPham,
                sp.GiaSanPham,
                (SELECT Url FROM HinhAnhSanPham WHERE SanPhamId = sp.IdSanPham AND AnhMacDinh = 1 LIMIT 1) as AnhChinh
            FROM SanPham sp
            WHERE sp.TrangThaiSanPham = 'DangBan' 
            AND (sp.TenSanPham LIKE ? OR sp.MoTaSanPham LIKE ?)
            LIMIT 10`,
            [`%${q}%`, `%${q}%`]
        );

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tìm kiếm sản phẩm'
        });
    }
};

// Get all products for admin (including all statuses)
const getAllProductsAdmin = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            danhMuc,
            thuongHieu,
            trangThai
        } = req.query;

        const offset = (page - 1) * limit;

        // Build WHERE clause - NOTE: No default status filter for admin
        let whereConditions = [];
        let queryParams = [];

        if (danhMuc) {
            whereConditions.push('sp.DanhMucId = ?');
            queryParams.push(danhMuc);
        }

        if (thuongHieu) {
            whereConditions.push('sp.ThuongHieuId = ?');
            queryParams.push(thuongHieu);
        }

        if (trangThai) {
            whereConditions.push('sp.TrangThaiSanPham = ?');
            queryParams.push(trangThai);
        }

        if (search) {
            whereConditions.push('(sp.TenSanPham LIKE ? OR sp.MoTaSanPham LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        const whereClause = whereConditions.length > 0 ? whereConditions.join(' AND ') : '1=1';

        // Get total count
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM SanPham sp WHERE ${whereClause}`,
            queryParams
        );

        const totalProducts = countResult[0].total;
        const totalPages = Math.ceil(totalProducts / limit);

        // Get products with category, brand, and main image
        const [products] = await db.query(
            `SELECT 
                sp.IdSanPham,
                sp.TenSanPham,
                sp.MoTaSanPham,
                sp.GiaSanPham,
                sp.SoLuongSanPham,
                sp.TrangThaiSanPham,
                sp.DanhMucId,
                sp.ThuongHieuId,
                dm.TenDanhMuc,
                th.TenThuongHieu,
                (SELECT Url FROM HinhAnhSanPham WHERE SanPhamId = sp.IdSanPham AND AnhMacDinh = 1 LIMIT 1) as AnhChinh
            FROM SanPham sp
            LEFT JOIN DanhMuc dm ON sp.DanhMucId = dm.IdDanhMuc
            LEFT JOIN ThuongHieu th ON sp.ThuongHieuId = th.IdThuongHieu
            WHERE ${whereClause}
            ORDER BY sp.IdSanPham DESC
            LIMIT ? OFFSET ?`,
            [...queryParams, parseInt(limit), parseInt(offset)]
        );

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalProducts,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get admin products error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách sản phẩm'
        });
    }
};

// Toggle product status (DangBan <-> NgungBan)
const toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Get current status
        const [product] = await db.query(
            'SELECT TrangThaiSanPham FROM SanPham WHERE IdSanPham = ?',
            [id]
        );

        if (product.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Toggle status
        const currentStatus = product[0].TrangThaiSanPham;
        const newStatus = currentStatus === 'DangBan' ? 'NgungBan' : 'DangBan';

        await db.query(
            'UPDATE SanPham SET TrangThaiSanPham = ? WHERE IdSanPham = ?',
            [newStatus, id]
        );

        res.json({
            success: true,
            message: `Đã ${newStatus === 'DangBan' ? 'bật' : 'tắt'} bán sản phẩm`,
            data: {
                status: newStatus
            }
        });
    } catch (error) {
        console.error('Toggle product status error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật trạng thái sản phẩm'
        });
    }
};

// Get low stock products (quantity <= 5)
const getLowStockProducts = async (req, res) => {
    try {
        const threshold = 5; // Fixed threshold at 5

        const query = `
            SELECT 
                sp.SanPhamId,
                sp.TenSanPham,
                sp.SoLuongTonKho,
                sp.GiaSanPham,
                sp.HinhAnh,
                sp.TrangThaiSanPham,
                dm.TenDanhMuc,
                th.TenThuongHieu
            FROM SanPham sp
            LEFT JOIN DanhMuc dm ON sp.DanhMucId = dm.DanhMucId
            LEFT JOIN ThuongHieu th ON sp.ThuongHieuId = th.ThuongHieuId
            WHERE sp.SoLuongTonKho <= ? AND sp.TrangThaiSanPham = 'DangBan'
            ORDER BY sp.SoLuongTonKho ASC
        `;

        const [products] = await db.query(query, [threshold]);

        res.json({
            success: true,
            data: {
                products,
                count: products.length,
                threshold
            }
        });
    } catch (error) {
        console.error('Get low stock products error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách sản phẩm sắp hết hàng'
        });
    }
};

module.exports = {
    getAllProducts,
    getAllProductsAdmin,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    toggleProductStatus,
    getLowStockProducts
};
