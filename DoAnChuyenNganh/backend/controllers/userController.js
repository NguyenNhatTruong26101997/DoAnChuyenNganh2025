const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { isValidEmail, isValidPhone } = require('../utils/helpers');

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, vaiTro, trangThai, search } = req.query;
        const offset = (page - 1) * limit;

        // Build WHERE clause
        let whereConditions = [];
        let queryParams = [];

        if (vaiTro) {
            whereConditions.push('VaiTro = ?');
            queryParams.push(vaiTro);
        }

        if (trangThai !== undefined) {
            whereConditions.push('TrangThai = ?');
            queryParams.push(trangThai);
        }

        if (search) {
            whereConditions.push('(HoTen LIKE ? OR Email LIKE ? OR SoDienThoai LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereClause = whereConditions.length > 0
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        // Get total count
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM user ${whereClause}`,
            queryParams
        );

        const totalUsers = countResult[0].total;
        const totalPages = Math.ceil(totalUsers / limit);

        // Get users
        const [users] = await db.query(
            `SELECT 
                IdUser,
                HoTen,
                Email,
                SoDienThoai,
                VaiTro,
                TrangThai,
                ThoiDiemTao,
                CapNhat
            FROM user
            ${whereClause}
            ORDER BY ThoiDiemTao DESC
            LIMIT ? OFFSET ?`,
            [...queryParams, parseInt(limit), parseInt(offset)]
        );

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalUsers,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách người dùng'
        });
    }
};

// Get user by ID (Admin only)
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await db.query(
            `SELECT 
                IdUser,
                HoTen,
                Email,
                SoDienThoai,
                VaiTro,
                TrangThai,
                ThoiDiemTao,
                CapNhat
            FROM user
            WHERE IdUser = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Get user statistics
        const [orderStats] = await db.query(
            `SELECT 
                COUNT(*) as totalOrders,
                SUM(TongTien) as totalSpent
            FROM DonHang
            WHERE UserId = ?`,
            [id]
        );

        const [reviewCount] = await db.query(
            'SELECT COUNT(*) as totalReviews FROM DanhGia WHERE UserId = ?',
            [id]
        );

        res.json({
            success: true,
            data: {
                user: users[0],
                statistics: {
                    totalOrders: orderStats[0].totalOrders || 0,
                    totalSpent: orderStats[0].totalSpent || 0,
                    totalReviews: reviewCount[0].totalReviews || 0
                }
            }
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin người dùng'
        });
    }
};

// Create user (Admin only)
const createUser = async (req, res) => {
    try {
        const { hoTen, email, matKhau, soDienThoai, vaiTro = 'user' } = req.body;

        // Validate input
        if (!hoTen || !email || !matKhau) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin (Họ tên, Email, Mật khẩu)'
            });
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ'
            });
        }

        // Validate phone if provided
        if (soDienThoai && !isValidPhone(soDienThoai)) {
            return res.status(400).json({
                success: false,
                message: 'Số điện thoại không hợp lệ'
            });
        }

        // Validate role
        if (!['user', 'admin'].includes(vaiTro)) {
            return res.status(400).json({
                success: false,
                message: 'Vai trò không hợp lệ'
            });
        }

        // Check if user already exists
        const [existingUser] = await db.query(
            'SELECT IdUser FROM user WHERE Email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(matKhau, 10);

        // Insert new user
        const [result] = await db.query(
            'INSERT INTO user (HoTen, Email, MatKhau, SoDienThoai, VaiTro) VALUES (?, ?, ?, ?, ?)',
            [hoTen, email, hashedPassword, soDienThoai || null, vaiTro]
        );

        res.status(201).json({
            success: true,
            message: 'Thêm người dùng thành công',
            data: {
                userId: result.insertId,
                hoTen,
                email,
                vaiTro
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi thêm người dùng'
        });
    }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { hoTen, email, soDienThoai, vaiTro, trangThai, matKhauMoi } = req.body;

        // Check if user exists
        const [existing] = await db.query('SELECT IdUser FROM user WHERE IdUser = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Build update query dynamically
        let updateFields = [];
        let updateValues = [];

        if (hoTen) {
            updateFields.push('HoTen = ?');
            updateValues.push(hoTen);
        }

        if (email) {
            if (!isValidEmail(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Email không hợp lệ'
                });
            }

            // Check if email is already used by another user
            const [emailCheck] = await db.query(
                'SELECT IdUser FROM user WHERE Email = ? AND IdUser != ?',
                [email, id]
            );

            if (emailCheck.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Email đã được sử dụng bởi người dùng khác'
                });
            }

            updateFields.push('Email = ?');
            updateValues.push(email);
        }

        if (soDienThoai !== undefined) {
            if (soDienThoai && !isValidPhone(soDienThoai)) {
                return res.status(400).json({
                    success: false,
                    message: 'Số điện thoại không hợp lệ'
                });
            }
            updateFields.push('SoDienThoai = ?');
            updateValues.push(soDienThoai || null);
        }

        if (vaiTro) {
            if (!['user', 'admin'].includes(vaiTro)) {
                return res.status(400).json({
                    success: false,
                    message: 'Vai trò không hợp lệ'
                });
            }
            updateFields.push('VaiTro = ?');
            updateValues.push(vaiTro);
        }

        if (trangThai !== undefined) {
            updateFields.push('TrangThai = ?');
            updateValues.push(trangThai ? 1 : 0);
        }

        // Handle password change
        if (matKhauMoi) {
            const hashedPassword = await bcrypt.hash(matKhauMoi, 10);
            updateFields.push('MatKhau = ?');
            updateValues.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có thông tin nào được cập nhật'
            });
        }

        // Add userId to values array
        updateValues.push(id);

        // Execute update
        await db.query(
            `UPDATE user SET ${updateFields.join(', ')} WHERE IdUser = ?`,
            updateValues
        );

        res.json({
            success: true,
            message: 'Cập nhật người dùng thành công'
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật người dùng'
        });
    }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        // Prevent admin from deleting themselves
        if (parseInt(id) === adminId) {
            return res.status(400).json({
                success: false,
                message: 'Bạn không thể xóa chính mình'
            });
        }

        // Check if user exists
        const [existing] = await db.query('SELECT IdUser FROM user WHERE IdUser = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Delete user (related data will be handled by CASCADE)
        await db.query('DELETE FROM user WHERE IdUser = ?', [id]);

        res.json({
            success: true,
            message: 'Xóa người dùng thành công'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa người dùng'
        });
    }
};

// Toggle user status (Admin only)
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        // Prevent admin from disabling themselves
        if (parseInt(id) === adminId) {
            return res.status(400).json({
                success: false,
                message: 'Bạn không thể khóa chính mình'
            });
        }

        // Get current status
        const [users] = await db.query(
            'SELECT TrangThai FROM user WHERE IdUser = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        const newStatus = users[0].TrangThai === 1 ? 0 : 1;

        // Update status
        await db.query(
            'UPDATE user SET TrangThai = ? WHERE IdUser = ?',
            [newStatus, id]
        );

        res.json({
            success: true,
            message: newStatus === 1 ? 'Đã kích hoạt người dùng' : 'Đã khóa người dùng',
            data: { trangThai: newStatus }
        });
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi thay đổi trạng thái người dùng'
        });
    }
};

// Reset user password (Admin only)
const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { matKhau } = req.body;

        if (!matKhau || matKhau.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 6 ký tự'
            });
        }

        // Check if user exists
        const [users] = await db.query('SELECT IdUser FROM user WHERE IdUser = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(matKhau, 10);

        // Update password
        await db.query('UPDATE user SET MatKhau = ? WHERE IdUser = ?', [hashedPassword, id]);

        res.json({
            success: true,
            message: 'Đặt lại mật khẩu thành công'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đặt lại mật khẩu'
        });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [users] = await db.query(
            `SELECT 
                IdUser,
                HoTen,
                Email,
                SoDienThoai,
                DiaChi,
                AnhDaiDien,
                VaiTro,
                ThoiDiemTao
            FROM user
            WHERE IdUser = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin hồ sơ'
        });
    }
};

// Update current user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { hoTen, email, soDienThoai, diaChi } = req.body;

        // Build update query dynamically
        let updateFields = [];
        let updateValues = [];

        if (hoTen) {
            if (hoTen.length < 2 || hoTen.length > 255) {
                return res.status(400).json({
                    success: false,
                    message: 'Họ tên phải từ 2-255 ký tự'
                });
            }
            updateFields.push('HoTen = ?');
            updateValues.push(hoTen);
        }

        if (email) {
            if (!isValidEmail(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Email không hợp lệ'
                });
            }

            // Check if email is already used by another user
            const [emailCheck] = await db.query(
                'SELECT IdUser FROM user WHERE Email = ? AND IdUser != ?',
                [email, userId]
            );

            if (emailCheck.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Email đã được sử dụng bởi người dùng khác'
                });
            }

            updateFields.push('Email = ?');
            updateValues.push(email);
        }

        if (soDienThoai !== undefined) {
            if (soDienThoai && !isValidPhone(soDienThoai)) {
                return res.status(400).json({
                    success: false,
                    message: 'Số điện thoại không hợp lệ'
                });
            }
            updateFields.push('SoDienThoai = ?');
            updateValues.push(soDienThoai || null);
        }

        if (diaChi !== undefined) {
            if (diaChi && diaChi.length > 1000) {
                return res.status(400).json({
                    success: false,
                    message: 'Địa chỉ quá dài (tối đa 1000 ký tự)'
                });
            }
            updateFields.push('DiaChi = ?');
            updateValues.push(diaChi || null);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có thông tin nào được cập nhật'
            });
        }

        // Add userId to values array
        updateValues.push(userId);

        // Execute update
        await db.query(
            `UPDATE user SET ${updateFields.join(', ')} WHERE IdUser = ?`,
            updateValues
        );

        // Get updated user info
        const [users] = await db.query(
            'SELECT IdUser, HoTen, Email, SoDienThoai, DiaChi, AnhDaiDien, VaiTro FROM user WHERE IdUser = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'Cập nhật hồ sơ thành công',
            data: users[0]
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật hồ sơ'
        });
    }
};

// Upload avatar
const uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn ảnh để tải lên'
            });
        }

        const avatarUrl = `/uploads/${req.file.filename}`;

        // Update avatar in database
        await db.query(
            'UPDATE user SET AnhDaiDien = ? WHERE IdUser = ?',
            [avatarUrl, userId]
        );

        res.json({
            success: true,
            message: 'Tải ảnh đại diện thành công',
            data: {
                anhDaiDien: avatarUrl
            }
        });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tải ảnh đại diện'
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    resetUserPassword,
    getProfile,
    updateProfile,
    uploadAvatar
};
