const db = require('../config/database');
const { createAdminNotification } = require('../utils/notificationHelper');

// Create contact message
const createContact = async (req, res) => {
    try {
        const userId = req.user ? req.user.userId : null;
        const { hoTen, email, soDienThoai, tieuDe, noiDung, hinhAnh } = req.body;

        // Validation
        if (!tieuDe || !noiDung) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tiêu đề và nội dung'
            });
        }

        // Nếu không đăng nhập, bắt buộc nhập họ tên và email
        if (!userId && (!hoTen || !email)) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập họ tên và email'
            });
        }

        // Validate word count (max 100 words)
        const wordCount = noiDung.trim().split(/\s+/).filter(word => word.length > 0).length;
        if (wordCount > 100) {
            return res.status(400).json({
                success: false,
                message: 'Nội dung không được vượt quá 100 từ'
            });
        }

        const [result] = await db.query(
            `INSERT INTO LienHe (UserId, HoTen, Email, SoDienThoai, TieuDe, NoiDung, HinhAnh) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, hoTen || null, email || null, soDienThoai || null, tieuDe, noiDung, hinhAnh || null]
        );

        // Create notification for admin
        createAdminNotification(
            'Liên hệ mới',
            `${hoTen || email} - ${tieuDe}`,
            'LienHe',
            'admin.html#contacts'
        ).catch(err => console.error('Failed to create notification:', err));

        res.status(201).json({
            success: true,
            message: 'Gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất!',
            data: { contactId: result.insertId }
        });
    } catch (error) {
        console.error('Create contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi gửi liên hệ'
        });
    }
};

// Get all contacts (Admin only)
const getAllContacts = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        const queryParams = [];

        if (status) {
            whereClause = 'WHERE lh.TrangThai = ?';
            queryParams.push(status);
        }

        // Get total count
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM LienHe lh ${whereClause}`,
            queryParams
        );

        const [contacts] = await db.query(
            `SELECT 
                lh.IdLienHe,
                lh.UserId,
                lh.HoTen as HoTenLienHe,
                lh.Email as EmailLienHe,
                lh.SoDienThoai,
                lh.TieuDe,
                lh.NoiDung,
                lh.HinhAnh,
                lh.TrangThai,
                lh.NgayTao,
                lh.PhanHoi,
                lh.NgayPhanHoi,
                u.HoTen as HoTenUser,
                u.Email as EmailUser,
                admin.HoTen as AdminName
            FROM LienHe lh
            LEFT JOIN user u ON lh.UserId = u.IdUser
            LEFT JOIN user admin ON lh.AdminId = admin.IdUser
            ${whereClause}
            ORDER BY lh.TrangThai ASC, lh.NgayTao DESC
            LIMIT ? OFFSET ?`,
            [...queryParams, parseInt(limit), parseInt(offset)]
        );

        // Format data
        const formattedContacts = contacts.map(c => ({
            ...c,
            HoTen: c.HoTenLienHe || c.HoTenUser,
            Email: c.EmailLienHe || c.EmailUser
        }));

        res.json({
            success: true,
            data: {
                contacts: formattedContacts,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(countResult[0].total / limit),
                    total: countResult[0].total,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách liên hệ'
        });
    }
};

// Update contact status (Admin only)
const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { trangThai } = req.body;

        const validStatuses = ['Moi', 'Da Doc', 'Da tra loi'];

        if (!validStatuses.includes(trangThai)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        const [result] = await db.query(
            'UPDATE LienHe SET TrangThai = ? WHERE IdLienHe = ?',
            [trangThai, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy liên hệ'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật trạng thái thành công'
        });
    } catch (error) {
        console.error('Update contact status error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật trạng thái'
        });
    }
};

// Reply to contact (Admin only)
const replyContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { phanHoi } = req.body;
        const adminId = req.user.userId;

        if (!phanHoi) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập nội dung phản hồi'
            });
        }

        // Validate word count (max 100 words)
        const wordCount = phanHoi.trim().split(/\s+/).filter(word => word.length > 0).length;
        if (wordCount > 100) {
            return res.status(400).json({
                success: false,
                message: 'Nội dung phản hồi không được vượt quá 100 từ'
            });
        }

        // Get contact info and admin name
        const [contacts] = await db.query(
            `SELECT 
                lh.UserId,
                lh.HoTen as HoTenLienHe,
                lh.Email as EmailLienHe,
                lh.TieuDe,
                lh.NoiDung,
                u.HoTen as HoTenUser,
                u.Email as EmailUser,
                admin.HoTen as AdminName
            FROM LienHe lh
            LEFT JOIN user u ON lh.UserId = u.IdUser
            LEFT JOIN user admin ON admin.IdUser = ?
            WHERE lh.IdLienHe = ?`,
            [adminId, id]
        );

        if (contacts.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy liên hệ'
            });
        }

        const contact = contacts[0];
        const recipientEmail = contact.EmailLienHe || contact.EmailUser;
        const recipientName = contact.HoTenLienHe || contact.HoTenUser;

        if (!recipientEmail) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy email người nhận'
            });
        }

        // Update contact with reply
        const [result] = await db.query(
            `UPDATE LienHe 
             SET PhanHoi = ?, NgayPhanHoi = NOW(), AdminId = ?, TrangThai = 'Da tra loi'
             WHERE IdLienHe = ?`,
            [phanHoi, adminId, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy liên hệ'
            });
        }

        // Send email notification to user
        const { sendContactReplyEmail } = require('../utils/emailService');
        sendContactReplyEmail(recipientEmail, {
            hoTen: recipientName,
            tieuDe: contact.TieuDe,
            noiDungGoc: contact.NoiDung,
            phanHoi: phanHoi,
            adminName: contact.AdminName
        }).catch(err => console.error('Failed to send contact reply email:', err));

        // Create notification for user if they have account
        if (contact.UserId) {
            const { createUserNotification } = require('../utils/notificationHelper');
            createUserNotification(
                contact.UserId,
                'Phản hồi liên hệ',
                `Admin đã trả lời liên hệ của bạn: "${contact.TieuDe}"`,
                'LienHe',
                'contact.html'
            ).catch(err => console.error('Failed to create user notification:', err));
        }

        res.json({
            success: true,
            message: 'Phản hồi thành công. Email đã được gửi đến người dùng.'
        });
    } catch (error) {
        console.error('Reply contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi phản hồi'
        });
    }
};

// Get contact count by status (Admin only)
const getContactStats = async (req, res) => {
    try {
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN TrangThai = 'Moi' THEN 1 ELSE 0 END) as \`new\`,
                SUM(CASE WHEN TrangThai = 'Da Doc' THEN 1 ELSE 0 END) as \`read\`,
                SUM(CASE WHEN TrangThai = 'Da tra loi' THEN 1 ELSE 0 END) as replied
            FROM LienHe
        `);

        res.json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        console.error('Get contact stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Delete contact (Admin only)
const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM LienHe WHERE IdLienHe = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy liên hệ'
            });
        }

        res.json({
            success: true,
            message: 'Xóa liên hệ thành công'
        });
    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa liên hệ'
        });
    }
};

module.exports = {
    createContact,
    getAllContacts,
    updateContactStatus,
    replyContact,
    getContactStats,
    deleteContact
};
