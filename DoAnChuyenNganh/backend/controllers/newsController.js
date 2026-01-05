const db = require('../config/database');
const { sanitizeInput, isValidLength } = require('../utils/helpers');
const path = require('path');
const fs = require('fs');

// Get all news (public - requires login)
const getAllNews = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        const [news] = await db.query(`
            SELECT 
                tn.IdTinTuc,
                tn.TieuDe,
                tn.NoiDung,
                tn.AnhBia,
                tn.NgayTao,
                tn.LuotXem,
                u.HoTen as TacGia,
                u.AnhDaiDien as AnhTacGia,
                COUNT(DISTINCT bl.IdBinhLuan) as SoBinhLuan
            FROM TinTuc tn
            JOIN user u ON tn.UserId = u.IdUser
            LEFT JOIN BinhLuanTinTuc bl ON tn.IdTinTuc = bl.TinTucId
            WHERE tn.TrangThai = 'HienThi'
            GROUP BY tn.IdTinTuc, tn.TieuDe, tn.NoiDung, tn.AnhBia, tn.NgayTao, tn.LuotXem, u.HoTen, u.AnhDaiDien
            ORDER BY tn.NgayTao DESC
            LIMIT ? OFFSET ?
        `, [limitNum, offset]);

        // Get total count
        const [countResult] = await db.query(
            'SELECT COUNT(*) as total FROM TinTuc WHERE TrangThai = ?',
            ['HienThi']
        );

        res.json({
            success: true,
            data: news,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: countResult[0].total
            }
        });
    } catch (error) {
        console.error('Get all news error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách tin tức'
        });
    }
};

// Get news by ID
const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;

        const [news] = await db.query(`
            SELECT 
                tn.IdTinTuc,
                tn.TieuDe,
                tn.NoiDung,
                tn.AnhBia,
                tn.NgayTao,
                tn.NgayCapNhat,
                tn.LuotXem,
                tn.UserId,
                u.HoTen as TacGia,
                u.AnhDaiDien as AnhTacGia
            FROM TinTuc tn
            JOIN user u ON tn.UserId = u.IdUser
            WHERE tn.IdTinTuc = ? AND tn.TrangThai = 'HienThi'
        `, [id]);

        if (news.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin tức'
            });
        }

        // Increment view count
        await db.query(
            'UPDATE TinTuc SET LuotXem = LuotXem + 1 WHERE IdTinTuc = ?',
            [id]
        );

        res.json({
            success: true,
            data: news[0]
        });
    } catch (error) {
        console.error('Get news by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy chi tiết tin tức'
        });
    }
};

// Create news (Admin only)
const createNews = async (req, res) => {
    try {
        const { tieuDe, noiDung } = req.body;
        const userId = req.user.userId;
        const anhBia = req.file ? `/uploads/news/${req.file.filename}` : null;

        // Validation
        if (!tieuDe || !isValidLength(tieuDe, 5, 255)) {
            return res.status(400).json({
                success: false,
                message: 'Tiêu đề không hợp lệ (5-255 ký tự)'
            });
        }

        if (!noiDung || !isValidLength(noiDung, 10, 50000)) {
            return res.status(400).json({
                success: false,
                message: 'Nội dung không hợp lệ (10-50000 ký tự)'
            });
        }

        const safeTieuDe = sanitizeInput(tieuDe);
        const safeNoiDung = sanitizeInput(noiDung);

        const [result] = await db.query(
            'INSERT INTO TinTuc (TieuDe, NoiDung, AnhBia, UserId) VALUES (?, ?, ?, ?)',
            [safeTieuDe, safeNoiDung, anhBia, userId]
        );

        res.status(201).json({
            success: true,
            message: 'Tạo tin tức thành công',
            data: {
                idTinTuc: result.insertId
            }
        });
    } catch (error) {
        console.error('Create news error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tạo tin tức'
        });
    }
};

// Update news (Admin only)
const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { tieuDe, noiDung } = req.body;
        const anhBia = req.file ? `/uploads/news/${req.file.filename}` : null;

        // Check if news exists
        const [news] = await db.query('SELECT AnhBia FROM TinTuc WHERE IdTinTuc = ?', [id]);
        if (news.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin tức'
            });
        }

        // Validation
        if (tieuDe && !isValidLength(tieuDe, 5, 255)) {
            return res.status(400).json({
                success: false,
                message: 'Tiêu đề không hợp lệ (5-255 ký tự)'
            });
        }

        if (noiDung && !isValidLength(noiDung, 10, 50000)) {
            return res.status(400).json({
                success: false,
                message: 'Nội dung không hợp lệ (10-50000 ký tự)'
            });
        }

        let updateQuery = 'UPDATE TinTuc SET ';
        const updateParams = [];

        if (tieuDe) {
            updateQuery += 'TieuDe = ?, ';
            updateParams.push(sanitizeInput(tieuDe));
        }

        if (noiDung) {
            updateQuery += 'NoiDung = ?, ';
            updateParams.push(sanitizeInput(noiDung));
        }

        if (anhBia) {
            updateQuery += 'AnhBia = ?, ';
            updateParams.push(anhBia);

            // Delete old image
            if (news[0].AnhBia) {
                const oldImagePath = path.join(__dirname, '..', news[0].AnhBia);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        updateQuery = updateQuery.slice(0, -2); // Remove last comma
        updateQuery += ' WHERE IdTinTuc = ?';
        updateParams.push(id);

        await db.query(updateQuery, updateParams);

        res.json({
            success: true,
            message: 'Cập nhật tin tức thành công'
        });
    } catch (error) {
        console.error('Update news error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật tin tức'
        });
    }
};

// Delete news (Admin only)
const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;

        // Get news info
        const [news] = await db.query('SELECT AnhBia FROM TinTuc WHERE IdTinTuc = ?', [id]);
        if (news.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin tức'
            });
        }

        // Delete image if exists
        if (news[0].AnhBia) {
            const imagePath = path.join(__dirname, '..', news[0].AnhBia);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Delete news (cascade will delete comments)
        await db.query('DELETE FROM TinTuc WHERE IdTinTuc = ?', [id]);

        res.json({
            success: true,
            message: 'Xóa tin tức thành công'
        });
    } catch (error) {
        console.error('Delete news error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa tin tức'
        });
    }
};

// Get comments for news
const getComments = async (req, res) => {
    try {
        const { id } = req.params;

        const [comments] = await db.query(`
            SELECT 
                bl.IdBinhLuan,
                bl.NoiDung,
                bl.NgayTao,
                bl.NgayCapNhat,
                bl.UserId,
                u.HoTen,
                u.AnhDaiDien
            FROM BinhLuanTinTuc bl
            JOIN user u ON bl.UserId = u.IdUser
            WHERE bl.TinTucId = ?
            ORDER BY bl.NgayTao DESC
        `, [id]);

        res.json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy bình luận'
        });
    }
};

// Add comment
const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { noiDung } = req.body;
        const userId = req.user.userId;

        // Validation
        if (!noiDung || !isValidLength(noiDung, 1, 1000)) {
            return res.status(400).json({
                success: false,
                message: 'Nội dung bình luận không hợp lệ (1-1000 ký tự)'
            });
        }

        const safeNoiDung = sanitizeInput(noiDung);

        const [result] = await db.query(
            'INSERT INTO BinhLuanTinTuc (TinTucId, UserId, NoiDung) VALUES (?, ?, ?)',
            [id, userId, safeNoiDung]
        );

        // Get the created comment with user info
        const [comment] = await db.query(`
            SELECT 
                bl.IdBinhLuan,
                bl.NoiDung,
                bl.NgayTao,
                bl.UserId,
                u.HoTen,
                u.AnhDaiDien
            FROM BinhLuanTinTuc bl
            JOIN user u ON bl.UserId = u.IdUser
            WHERE bl.IdBinhLuan = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Thêm bình luận thành công',
            data: comment[0]
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi thêm bình luận'
        });
    }
};

// Update comment (own comment only)
const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { noiDung } = req.body;
        const userId = req.user.userId;

        // Check if comment exists and belongs to user
        const [comments] = await db.query(
            'SELECT UserId FROM BinhLuanTinTuc WHERE IdBinhLuan = ?',
            [commentId]
        );

        if (comments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bình luận'
            });
        }

        if (comments[0].UserId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền sửa bình luận này'
            });
        }

        // Validation
        if (!noiDung || !isValidLength(noiDung, 1, 1000)) {
            return res.status(400).json({
                success: false,
                message: 'Nội dung bình luận không hợp lệ (1-1000 ký tự)'
            });
        }

        const safeNoiDung = sanitizeInput(noiDung);

        await db.query(
            'UPDATE BinhLuanTinTuc SET NoiDung = ? WHERE IdBinhLuan = ?',
            [safeNoiDung, commentId]
        );

        res.json({
            success: true,
            message: 'Cập nhật bình luận thành công'
        });
    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật bình luận'
        });
    }
};

// Delete comment (own comment only)
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.userId;

        // Check if comment exists and belongs to user
        const [comments] = await db.query(
            'SELECT UserId FROM BinhLuanTinTuc WHERE IdBinhLuan = ?',
            [commentId]
        );

        if (comments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bình luận'
            });
        }

        if (comments[0].UserId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xóa bình luận này'
            });
        }

        await db.query('DELETE FROM BinhLuanTinTuc WHERE IdBinhLuan = ?', [commentId]);

        res.json({
            success: true,
            message: 'Xóa bình luận thành công'
        });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa bình luận'
        });
    }
};

module.exports = {
    getAllNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    getComments,
    addComment,
    updateComment,
    deleteComment
};
