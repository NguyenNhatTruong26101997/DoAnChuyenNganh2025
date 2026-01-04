const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isValidEmail, isValidPhone } = require('../utils/helpers');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/emailService');
require('dotenv').config();

// Generate JWT token helper
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.IdUser,
            email: user.Email,
            vaiTro: user.VaiTro
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Register new user
const register = async (req, res) => {
    try {
        const { hoTen, email, matKhau, soDienThoai } = req.body;

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
            [hoTen, email, hashedPassword, soDienThoai || null, 'user']
        );

        // Send welcome email (async, don't wait)
        sendWelcomeEmail(email, hoTen).catch(err => 
            console.error('Failed to send welcome email:', err)
        );

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                userId: result.insertId,
                hoTen,
                email
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đăng ký'
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, matKhau } = req.body;

        // Validate input
        if (!email || !matKhau) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email và mật khẩu'
            });
        }

        // Get user from database
        const [users] = await db.query(
            'SELECT IdUser, HoTen, Email, MatKhau, SoDienThoai, VaiTro, TrangThai FROM user WHERE Email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        const user = users[0];

        // Check if user is active
        if (user.TrangThai === 0) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đã bị khóa'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(matKhau, user.MatKhau);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Generate JWT token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                token,
                user: {
                    userId: user.IdUser,
                    hoTen: user.HoTen,
                    email: user.Email,
                    soDienThoai: user.SoDienThoai,
                    vaiTro: user.VaiTro
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đăng nhập'
        });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [users] = await db.query(
            'SELECT IdUser, HoTen, Email, SoDienThoai, VaiTro, ThoiDiemTao FROM user WHERE IdUser = ?',
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
            message: 'Lỗi server khi lấy thông tin người dùng'
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { hoTen, soDienThoai, matKhauCu, matKhauMoi } = req.body;

        // Build update query dynamically
        let updateFields = [];
        let updateValues = [];

        if (hoTen) {
            updateFields.push('HoTen = ?');
            updateValues.push(hoTen);
        }

        if (soDienThoai) {
            if (!isValidPhone(soDienThoai)) {
                return res.status(400).json({
                    success: false,
                    message: 'Số điện thoại không hợp lệ'
                });
            }
            updateFields.push('SoDienThoai = ?');
            updateValues.push(soDienThoai);
        }

        // Handle password change
        if (matKhauMoi) {
            if (!matKhauCu) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập mật khẩu cũ'
                });
            }

            // Verify old password
            const [users] = await db.query(
                'SELECT MatKhau FROM user WHERE IdUser = ?',
                [userId]
            );

            const isPasswordValid = await bcrypt.compare(matKhauCu, users[0].MatKhau);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Mật khẩu cũ không đúng'
                });
            }

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
        updateValues.push(userId);

        // Execute update
        await db.query(
            `UPDATE user SET ${updateFields.join(', ')} WHERE IdUser = ?`,
            updateValues
        );

        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật thông tin'
        });
    }
};

// Google OAuth Success Handler
const googleAuthSuccess = async (req, res) => {
    try {
        const user = req.user;
        
        // Generate JWT token
        const token = generateToken(user);

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
        res.redirect(`${frontendUrl}/frontend/login.html?googleAuth=success&token=${token}&user=${encodeURIComponent(JSON.stringify({
            userId: user.IdUser,
            hoTen: user.HoTen,
            email: user.Email,
            vaiTro: user.VaiTro
        }))}`);
    } catch (error) {
        console.error('Google auth success error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
        res.redirect(`${frontendUrl}/frontend/login.html?googleAuth=error`);
    }
};

// Google OAuth Failure Handler
const googleAuthFailure = (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
    res.redirect(`${frontendUrl}/frontend/login.html?googleAuth=error`);
};

// Request password reset
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ'
            });
        }

        // Check if user exists
        const [users] = await db.query(
            'SELECT IdUser, HoTen FROM user WHERE Email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản với email này'
            });
        }

        const user = users[0];

        // Generate 6-digit reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Set expiration time (15 minutes from now)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Save reset token to database
        await db.query(
            'INSERT INTO password_reset_tokens (UserId, Email, ResetCode, ExpiresAt) VALUES (?, ?, ?, ?)',
            [user.IdUser, email, resetCode, expiresAt]
        );

        // Send email with reset code
        const emailResult = await sendPasswordResetEmail(email, resetCode, user.HoTen);

        if (!emailResult.success) {
            console.error('Failed to send email:', emailResult.error);
            // Still return success but with a note
            return res.json({
                success: true,
                message: 'Mã xác nhận đã được tạo nhưng không thể gửi email. Vui lòng liên hệ admin.',
                data: {
                    resetCode, // Show code if email fails (for development)
                    expiresIn: '15 phút'
                }
            });
        }

        res.json({
            success: true,
            message: 'Mã xác nhận đã được gửi đến email của bạn',
            data: {
                expiresIn: '15 phút'
            }
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xử lý yêu cầu'
        });
    }
};

// Reset password with code
const resetPassword = async (req, res) => {
    try {
        const { email, resetCode, newPassword } = req.body;

        // Validation
        if (!email || !resetCode || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        if (newPassword.length < 6 || newPassword.length > 12) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có từ 6-12 ký tự'
            });
        }

        // Find valid reset token
        const [tokens] = await db.query(
            `SELECT IdToken, UserId FROM password_reset_tokens 
            WHERE Email = ? AND ResetCode = ? AND Used = 0 AND ExpiresAt > NOW()
            ORDER BY CreatedAt DESC LIMIT 1`,
            [email, resetCode]
        );

        if (tokens.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Mã xác nhận không đúng hoặc đã hết hạn'
            });
        }

        const token = tokens[0];

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        await db.query(
            'UPDATE user SET MatKhau = ? WHERE IdUser = ?',
            [hashedPassword, token.UserId]
        );

        // Mark token as used
        await db.query(
            'UPDATE password_reset_tokens SET Used = 1 WHERE IdToken = ?',
            [token.IdToken]
        );

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

// Change password (for logged-in users)
const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { matKhauCu, matKhauMoi } = req.body;

        // Validation
        if (!matKhauCu || !matKhauMoi) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        if (matKhauMoi.length < 6 || matKhauMoi.length > 12) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có từ 6-12 ký tự'
            });
        }

        // Get current password
        const [users] = await db.query(
            'SELECT MatKhau FROM user WHERE IdUser = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Verify old password
        const isPasswordValid = await bcrypt.compare(matKhauCu, users[0].MatKhau);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(matKhauMoi, 10);

        // Update password
        await db.query(
            'UPDATE user SET MatKhau = ? WHERE IdUser = ?',
            [hashedPassword, userId]
        );

        res.json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đổi mật khẩu'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    googleAuthSuccess,
    googleAuthFailure,
    forgotPassword,
    resetPassword,
    changePassword
};
