const db = require('../config/database');

const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const [notifications] = await db.query(
            'SELECT * FROM ThongBao WHERE UserId = ? ORDER BY NgayTao DESC LIMIT 20',
            [userId]
        );
        const [countResult] = await db.query(
            'SELECT COUNT(*) as unreadCount FROM ThongBao WHERE UserId = ? AND DaDoc = FALSE',
            [userId]
        );
        res.json({ success: true, data: notifications, unreadCount: countResult[0].unreadCount });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE ThongBao SET DaDoc = TRUE WHERE IdThongBao = ? AND UserId = ?', [id, req.user.userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        await db.query('UPDATE ThongBao SET DaDoc = TRUE WHERE UserId = ?', [req.user.userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM ThongBao WHERE IdThongBao = ? AND UserId = ?', [id, req.user.userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

module.exports = { getUserNotifications, markAsRead, markAllAsRead, deleteNotification };
