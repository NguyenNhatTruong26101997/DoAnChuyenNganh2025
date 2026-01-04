const db = require('../config/database');

// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query(
            'SELECT IdDanhMuc, TenDanhMuc, MoTaDanhMuc FROM DanhMuc ORDER BY TenDanhMuc ASC'
        );

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh mục'
        });
    }
};

// Create category (Admin only)
const createCategory = async (req, res) => {
    try {
        const { tenDanhMuc, moTaDanhMuc } = req.body;

        if (!tenDanhMuc) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tên danh mục'
            });
        }

        const [result] = await db.query(
            'INSERT INTO DanhMuc (TenDanhMuc, MoTaDanhMuc) VALUES (?, ?)',
            [tenDanhMuc, moTaDanhMuc || null]
        );

        res.status(201).json({
            success: true,
            message: 'Thêm danh mục thành công',
            data: { categoryId: result.insertId }
        });
    } catch (error) {
        console.error('Create category error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Tên danh mục đã tồn tại'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi thêm danh mục'
        });
    }
};

// Update category (Admin only)
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenDanhMuc, moTaDanhMuc } = req.body;

        if (!tenDanhMuc) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tên danh mục'
            });
        }

        const [result] = await db.query(
            'UPDATE DanhMuc SET TenDanhMuc = ?, MoTaDanhMuc = ? WHERE IdDanhMuc = ?',
            [tenDanhMuc, moTaDanhMuc, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật danh mục thành công'
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật danh mục'
        });
    }
};

// Delete category (Admin only)
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM DanhMuc WHERE IdDanhMuc = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục'
            });
        }

        res.json({
            success: true,
            message: 'Xóa danh mục thành công'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa danh mục'
        });
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
