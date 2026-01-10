// Check notifications in database
const db = require('./config/database');

async function checkNotifications() {
    try {
        console.log('Checking notifications...\n');
        
        // Get all notifications
        const [notifications] = await db.query(`
            SELECT 
                tb.IdThongBao,
                tb.UserId,
                u.HoTen,
                u.VaiTro,
                tb.TieuDe,
                tb.NoiDung,
                tb.LoaiThongBao,
                tb.DaDoc,
                tb.NgayTao
            FROM ThongBao tb
            JOIN user u ON tb.UserId = u.IdUser
            ORDER BY tb.NgayTao DESC
            LIMIT 10
        `);
        
        if (notifications.length > 0) {
            console.log('✅ Recent notifications:');
            console.table(notifications);
        } else {
            console.log('❌ No notifications found');
            
            // Check if admin users exist
            const [admins] = await db.query("SELECT IdUser, HoTen, Email FROM user WHERE VaiTro = 'admin'");
            console.log('\nAdmin users:');
            console.table(admins);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkNotifications();
