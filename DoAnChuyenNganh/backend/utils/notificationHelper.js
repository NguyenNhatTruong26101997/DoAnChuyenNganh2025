const db = require('../config/database');

/**
 * Create notification for admin users
 * @param {string} tieuDe - Notification title
 * @param {string} noiDung - Notification content
 * @param {string} loaiThongBao - Type: 'DonHang', 'DanhGia', 'BinhLuan', 'LienHe'
 * @param {string} lienKet - Link to related page
 */
async function createAdminNotification(tieuDe, noiDung, loaiThongBao, lienKet = null) {
    try {
        // Get all admin users
        const [admins] = await db.query(
            "SELECT IdUser FROM user WHERE VaiTro = 'admin'"
        );

        if (admins.length === 0) {
            console.log('No admin users found');
            return;
        }

        // Create notification for each admin
        const values = admins.map(admin => [
            admin.IdUser,
            tieuDe,
            noiDung,
            loaiThongBao,
            lienKet
        ]);

        await db.query(
            `INSERT INTO ThongBao (UserId, TieuDe, NoiDung, LoaiThongBao, LienKet) 
             VALUES ?`,
            [values]
        );

        console.log(`✅ Created ${loaiThongBao} notification for ${admins.length} admin(s)`);
    } catch (error) {
        console.error('Error creating admin notification:', error);
    }
}

/**
 * Create notification for specific user
 */
async function createUserNotification(userId, tieuDe, noiDung, loaiThongBao, lienKet = null) {
    try {
        await db.query(
            `INSERT INTO ThongBao (UserId, TieuDe, NoiDung, LoaiThongBao, LienKet) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, tieuDe, noiDung, loaiThongBao, lienKet]
        );

        console.log(`✅ Created ${loaiThongBao} notification for user ${userId}`);
    } catch (error) {
        console.error('Error creating user notification:', error);
    }
}

module.exports = {
    createAdminNotification,
    createUserNotification
};
