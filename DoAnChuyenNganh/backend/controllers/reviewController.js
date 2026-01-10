const db = require('../config/database');
const { createAdminNotification } = require('../utils/notificationHelper');

// Get product reviews with replies
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        // Get all reviews for product (including replies)
        const [reviews] = await db.query(
            `SELECT 
                dg.IdDanhGia,
                dg.UserId,
                dg.ParentId,
                dg.XepLoai,
                dg.BinhLuan,
                dg.NgayTao,
                dg.CapNhat,
                u.HoTen,
                u.VaiTro
            FROM DanhGia dg
            JOIN user u ON dg.UserId = u.IdUser
            WHERE dg.SanPhamId = ?
            ORDER BY dg.NgayTao ASC`,
            [productId]
        );

        // Organize reviews into tree structure (parent reviews with replies)
        const reviewMap = {};
        const rootReviews = [];

        reviews.forEach(review => {
            review.replies = [];
            reviewMap[review.IdDanhGia] = review;
        });

        reviews.forEach(review => {
            if (review.ParentId) {
                if (reviewMap[review.ParentId]) {
                    reviewMap[review.ParentId].replies.push(review);
                }
            } else {
                rootReviews.push(review);
            }
        });

        // Calculate average rating (only from root reviews with rating)
        const ratedReviews = rootReviews.filter(r => r.XepLoai);
        const avgRating = ratedReviews.length > 0
            ? ratedReviews.reduce((sum, r) => sum + r.XepLoai, 0) / ratedReviews.length
            : 0;

        res.json({
            success: true,
            data: {
                reviews: rootReviews,
                averageRating: avgRating.toFixed(1),
                totalReviews: rootReviews.length
            }
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy đánh giá'
        });
    }
};

// Create review or reply
const createReview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { sanPhamId, xepLoai, binhLuan, parentId } = req.body;

        if (!sanPhamId) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn sản phẩm'
            });
        }

        // If it's a reply (has parentId), rating is optional
        // If it's a root review, rating is required
        if (!parentId && !xepLoai) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn xếp loại'
            });
        }

        if (xepLoai && (xepLoai < 1 || xepLoai > 5)) {
            return res.status(400).json({
                success: false,
                message: 'Xếp loại phải từ 1 đến 5 sao'
            });
        }

        if (!binhLuan || !binhLuan.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập nội dung bình luận'
            });
        }

        // Check if product exists
        const [products] = await db.query(
            'SELECT IdSanPham FROM SanPham WHERE IdSanPham = ?',
            [sanPhamId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Only check purchase history for root reviews (not replies)
        if (!parentId) {
            // Check if user has purchased this product
            const [purchases] = await db.query(
                `SELECT COUNT(*) as count 
                 FROM DonHang dh
                 JOIN ChiTietDonHang ctdh ON dh.IdDonHang = ctdh.DonHangId
                 WHERE dh.UserId = ? 
                 AND ctdh.SanPhamId = ?
                 AND dh.TrangThaiDonHang IN ('Dang giao', 'Da giao')`,
                [userId, sanPhamId]
            );

            if (purchases[0].count === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn chỉ có thể đánh giá sản phẩm đã mua'
                });
            }

            // Check if user already reviewed this product
            const [existingReview] = await db.query(
                'SELECT IdDanhGia FROM DanhGia WHERE UserId = ? AND SanPhamId = ? AND ParentId IS NULL',
                [userId, sanPhamId]
            );

            if (existingReview.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Bạn đã đánh giá sản phẩm này rồi'
                });
            }
        }

        // If replying, check if parent review exists
        if (parentId) {
            const [parentReview] = await db.query(
                'SELECT IdDanhGia FROM DanhGia WHERE IdDanhGia = ?',
                [parentId]
            );
            if (parentReview.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy bình luận gốc'
                });
            }
        }

        // Create review/reply
        const [result] = await db.query(
            'INSERT INTO DanhGia (UserId, SanPhamId, ParentId, XepLoai, BinhLuan) VALUES (?, ?, ?, ?, ?)',
            [userId, sanPhamId, parentId || null, xepLoai || null, binhLuan.trim()]
        );

        // Get the created review with user info
        const [newReview] = await db.query(
            `SELECT dg.*, u.HoTen, u.VaiTro, sp.TenSanPham
             FROM DanhGia dg 
             JOIN user u ON dg.UserId = u.IdUser 
             JOIN SanPham sp ON dg.SanPhamId = sp.IdSanPham
             WHERE dg.IdDanhGia = ?`,
            [result.insertId]
        );

        // Create notification for admin (only for root reviews, not replies)
        if (!parentId) {
            const stars = xepLoai ? `${xepLoai}⭐` : '';
            createAdminNotification(
                'Đánh giá mới',
                `${newReview[0].HoTen} đánh giá ${stars} - ${newReview[0].TenSanPham}`,
                'DanhGia',
                'admin.html#reviews'
            ).catch(err => console.error('Failed to create notification:', err));
        }

        res.status(201).json({
            success: true,
            message: parentId ? 'Trả lời bình luận thành công' : 'Thêm đánh giá thành công',
            data: newReview[0]
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi thêm đánh giá'
        });
    }
};

// Update review
const updateReview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const isAdmin = req.user.vaiTro === 'admin';
        const { id } = req.params;
        const { xepLoai, binhLuan } = req.body;

        if (!binhLuan || !binhLuan.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập nội dung bình luận'
            });
        }

        if (xepLoai && (xepLoai < 1 || xepLoai > 5)) {
            return res.status(400).json({
                success: false,
                message: 'Xếp loại phải từ 1 đến 5 sao'
            });
        }

        // Check ownership (admin can edit any)
        let query = 'UPDATE DanhGia SET BinhLuan = ?';
        const params = [binhLuan.trim()];

        if (xepLoai) {
            query += ', XepLoai = ?';
            params.push(xepLoai);
        }

        query += ' WHERE IdDanhGia = ?';
        params.push(id);

        if (!isAdmin) {
            query += ' AND UserId = ?';
            params.push(userId);
        }

        const [result] = await db.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá hoặc bạn không có quyền sửa'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật đánh giá thành công'
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật đánh giá'
        });
    }
};

// Delete review (and all replies)
const deleteReview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const isAdmin = req.user.vaiTro === 'admin';
        const { id } = req.params;

        let query = 'DELETE FROM DanhGia WHERE IdDanhGia = ?';
        const params = [id];

        if (!isAdmin) {
            query += ' AND UserId = ?';
            params.push(userId);
        }

        const [result] = await db.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá hoặc bạn không có quyền xóa'
            });
        }

        res.json({
            success: true,
            message: 'Xóa đánh giá thành công'
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa đánh giá'
        });
    }
};

// Admin: Get all reviews (for management)
const getAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', productId = '' } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE 1=1';
        const params = [];

        if (search) {
            whereClause += ' AND (u.HoTen LIKE ? OR dg.BinhLuan LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (productId) {
            whereClause += ' AND dg.SanPhamId = ?';
            params.push(productId);
        }

        // Get total count
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM DanhGia dg 
             JOIN user u ON dg.UserId = u.IdUser 
             ${whereClause}`,
            params
        );

        // Get reviews
        const [reviews] = await db.query(
            `SELECT 
                dg.IdDanhGia,
                dg.UserId,
                dg.SanPhamId,
                dg.ParentId,
                dg.XepLoai,
                dg.BinhLuan,
                dg.NgayTao,
                dg.CapNhat,
                u.HoTen,
                u.Email,
                sp.TenSanPham
            FROM DanhGia dg
            JOIN user u ON dg.UserId = u.IdUser
            LEFT JOIN SanPham sp ON dg.SanPhamId = sp.IdSanPham
            ${whereClause}
            ORDER BY dg.NgayTao DESC
            LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        res.json({
            success: true,
            data: {
                reviews,
                pagination: {
                    total: countResult[0].total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(countResult[0].total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách đánh giá'
        });
    }
};

// Admin: Reply to review
const adminReplyReview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { binhLuan } = req.body;

        if (!binhLuan || !binhLuan.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập nội dung trả lời'
            });
        }

        // Get parent review to get sanPhamId and userId
        const [parentReview] = await db.query(
            'SELECT SanPhamId, UserId, sp.TenSanPham FROM DanhGia dg JOIN SanPham sp ON dg.SanPhamId = sp.IdSanPham WHERE dg.IdDanhGia = ?',
            [id]
        );

        if (parentReview.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bình luận'
            });
        }

        const reviewOwner = parentReview[0];

        // Create admin reply
        const [result] = await db.query(
            'INSERT INTO DanhGia (UserId, SanPhamId, ParentId, BinhLuan) VALUES (?, ?, ?, ?)',
            [userId, reviewOwner.SanPhamId, id, binhLuan.trim()]
        );

        // Notify the review owner
        const { createUserNotification } = require('../utils/notificationHelper');
        createUserNotification(
            reviewOwner.UserId,
            'Admin trả lời đánh giá',
            `Admin đã trả lời đánh giá của bạn về "${reviewOwner.TenSanPham}"`,
            'DanhGia',
            `product-detail.html?id=${reviewOwner.SanPhamId}`
        ).catch(err => console.error('Failed to create user notification:', err));

        res.status(201).json({
            success: true,
            message: 'Trả lời bình luận thành công',
            data: { reviewId: result.insertId }
        });
    } catch (error) {
        console.error('Admin reply error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi trả lời bình luận'
        });
    }
};

module.exports = {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    getAllReviews,
    adminReplyReview
};
