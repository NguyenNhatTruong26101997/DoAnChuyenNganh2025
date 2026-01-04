const db = require('../config/database');

// Get all brands
const getAllBrands = async (req, res) => {
    try {
        const [brands] = await db.query(
            'SELECT IdThuongHieu, TenThuongHieu, MoTaThuongHieu FROM ThuongHieu ORDER BY TenThuongHieu ASC'
        );

        res.json({
            success: true,
            data: brands
        });
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thương hiệu'
        });
    }
};

// Create brand (Admin only)
const createBrand = async (req, res) => {
    try {
        const { tenThuongHieu, moTaThuongHieu } = req.body;

        if (!tenThuongHieu) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tên thương hiệu'
            });
        }

        const [result] = await db.query(
            'INSERT INTO ThuongHieu (TenThuongHieu, MoTaThuongHieu) VALUES (?, ?)',
            [tenThuongHieu, moTaThuongHieu || null]
        );

        res.status(201).json({
            success: true,
            message: 'Thêm thương hiệu thành công',
            data: { brandId: result.insertId }
        });
    } catch (error) {
        console.error('Create brand error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi thêm thương hiệu'
        });
    }
};

// Update brand (Admin only)
const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenThuongHieu, moTaThuongHieu } = req.body;

        if (!tenThuongHieu) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tên thương hiệu'
            });
        }

        const [result] = await db.query(
            'UPDATE ThuongHieu SET TenThuongHieu = ?, MoTaThuongHieu = ? WHERE IdThuongHieu = ?',
            [tenThuongHieu, moTaThuongHieu, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thương hiệu'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật thương hiệu thành công'
        });
    } catch (error) {
        console.error('Update brand error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật thương hiệu'
        });
    }
};

// Delete brand (Admin only)
const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM ThuongHieu WHERE IdThuongHieu = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thương hiệu'
            });
        }

        res.json({
            success: true,
            message: 'Xóa thương hiệu thành công'
        });
    } catch (error) {
        console.error('Delete brand error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa thương hiệu'
        });
    }
};

module.exports = {
    getAllBrands,
    createBrand,
    updateBrand,
    deleteBrand
};
