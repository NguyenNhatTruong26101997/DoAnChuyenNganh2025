const db = require('../config/database');

// Get all coupons (Admin)
exports.getAllCoupons = async (req, res) => {
    try {
        const [coupons] = await db.query(`
            SELECT * FROM MaGiamGia 
            ORDER BY NgayTao DESC
        `);

        res.json({
            success: true,
            data: coupons
        });
    } catch (error) {
        console.error('Get all coupons error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách mã giảm giá'
        });
    }
};

// Get active coupons (User - only valid coupons)
exports.getActiveCoupons = async (req, res) => {
    try {
        const [coupons] = await db.query(`
            SELECT * FROM MaGiamGia 
            WHERE TrangThai = 'HoatDong' 
            AND NgayBatDau <= NOW() 
            AND NgayKetThuc >= NOW()
            ORDER BY PhanTramGiam DESC
        `);

        res.json({
            success: true,
            data: coupons
        });
    } catch (error) {
        console.error('Get active coupons error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách mã giảm giá'
        });
    }
};

// Validate and apply coupon
exports.validateCoupon = async (req, res) => {
    try {
        const { maMaGiamGia, tongTien } = req.body;

        const [coupons] = await db.query(`
            SELECT * FROM MaGiamGia 
            WHERE MaMaGiamGia = ? 
            AND TrangThai = 'HoatDong'
            AND NgayBatDau <= NOW() 
            AND NgayKetThuc >= NOW()
        `, [maMaGiamGia]);

        if (coupons.length === 0) {
            return res.json({
                success: false,
                message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn'
            });
        }

        const coupon = coupons[0];

        // Check minimum order value
        if (tongTien < coupon.GiaTriDonHangToiThieu) {
            return res.json({
                success: false,
                message: `Đơn hàng tối thiểu ${coupon.GiaTriDonHangToiThieu.toLocaleString('vi-VN')}đ để sử dụng mã này`
            });
        }

        // Calculate discount based on type
        let tienGiam = 0;
        
        if (coupon.LoaiGiam === 'PhanTram') {
            // Percentage discount
            tienGiam = (tongTien * coupon.PhanTramGiam) / 100;
            
            // Apply max discount if exists
            if (coupon.GiamToiDa && tienGiam > coupon.GiamToiDa) {
                tienGiam = coupon.GiamToiDa;
            }
        } else {
            // Fixed amount discount
            tienGiam = coupon.SoTienGiam;
            
            // Cannot exceed order total
            if (tienGiam > tongTien) {
                tienGiam = tongTien;
            }
        }

        res.json({
            success: true,
            data: {
                coupon,
                tienGiam,
                tongTienSauGiam: tongTien - tienGiam
            }
        });
    } catch (error) {
        console.error('Validate coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi kiểm tra mã giảm giá'
        });
    }
};

// Create coupon (Admin)
exports.createCoupon = async (req, res) => {
    try {
        const {
            maMaGiamGia,
            loaiGiam,
            phanTramGiam,
            soTienGiam,
            ngayBatDau,
            ngayKetThuc
        } = req.body;

        // Validate based on discount type
        if (loaiGiam === 'PhanTram' && !phanTramGiam) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập phần trăm giảm'
            });
        }
        
        if (loaiGiam === 'SoTien' && !soTienGiam) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập số tiền giảm'
            });
        }

        // Check if code already exists
        const [existing] = await db.query(
            'SELECT * FROM MaGiamGia WHERE MaMaGiamGia = ?',
            [maMaGiamGia]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Mã giảm giá đã tồn tại'
            });
        }

        // Use code as name, set defaults for optional fields
        await db.query(`
            INSERT INTO MaGiamGia (
                MaMaGiamGia, TenMaGiamGia, MoTa, LoaiGiam,
                PhanTramGiam, SoTienGiam, GiamToiDa, 
                GiaTriDonHangToiThieu, NgayBatDau, NgayKetThuc, TrangThai
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'HoatDong')
        `, [
            maMaGiamGia, 
            maMaGiamGia, // Use code as name
            '', // Empty description
            loaiGiam,
            loaiGiam === 'PhanTram' ? phanTramGiam : null,
            loaiGiam === 'SoTien' ? soTienGiam : null,
            null, // No max discount limit
            0, // No minimum order value
            ngayBatDau, 
            ngayKetThuc
        ]);

        res.json({
            success: true,
            message: 'Tạo mã giảm giá thành công'
        });
    } catch (error) {
        console.error('Create coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo mã giảm giá'
        });
    }
};

// Update coupon (Admin)
exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            loaiGiam,
            phanTramGiam,
            soTienGiam,
            ngayBatDau,
            ngayKetThuc
        } = req.body;

        await db.query(`
            UPDATE MaGiamGia SET
                LoaiGiam = ?,
                PhanTramGiam = ?,
                SoTienGiam = ?,
                NgayBatDau = ?,
                NgayKetThuc = ?
            WHERE MaGiamGiaId = ?
        `, [
            loaiGiam,
            loaiGiam === 'PhanTram' ? phanTramGiam : null,
            loaiGiam === 'SoTien' ? soTienGiam : null,
            ngayBatDau, 
            ngayKetThuc, 
            id
        ]);

        res.json({
            success: true,
            message: 'Cập nhật mã giảm giá thành công'
        });
    } catch (error) {
        console.error('Update coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật mã giảm giá'
        });
    }
};

// Delete coupon (Admin)
exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('DELETE FROM MaGiamGia WHERE MaGiamGiaId = ?', [id]);

        res.json({
            success: true,
            message: 'Xóa mã giảm giá thành công'
        });
    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa mã giảm giá'
        });
    }
};

// Toggle coupon status (Admin)
exports.toggleCouponStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const [coupon] = await db.query(
            'SELECT TrangThai FROM MaGiamGia WHERE MaGiamGiaId = ?',
            [id]
        );

        if (coupon.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy mã giảm giá'
            });
        }

        const newStatus = coupon[0].TrangThai === 'HoatDong' ? 'KhongHoatDong' : 'HoatDong';

        await db.query(
            'UPDATE MaGiamGia SET TrangThai = ? WHERE MaGiamGiaId = ?',
            [newStatus, id]
        );

        res.json({
            success: true,
            message: `${newStatus === 'HoatDong' ? 'Kích hoạt' : 'Vô hiệu hóa'} mã giảm giá thành công`
        });
    } catch (error) {
        console.error('Toggle coupon status error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thay đổi trạng thái mã giảm giá'
        });
    }
};

module.exports = exports;
