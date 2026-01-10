// Check notifications for specific user
const db = require('./config/database');

async function checkUserNotifications() {
    try {
        const userId = 5; // Change to your user ID
        
        console.log(`Checking notifications for user ${userId}...\n`);
        
        const [notifications] = await db.query(`
            SELECT 
                IdThongBao,
                TieuDe,
                NoiDung,
                LoaiThongBao,
                LienKet,
                DaDoc,
                NgayTao
            FROM ThongBao
            WHERE UserId = ?
            ORDER BY NgayTao DESC
            LIMIT 10
        `, [userId]);
        
        if (notifications.length > 0) {
            console.log('✅ User notifications:');
            console.table(notifications);
            
            const unread = notifications.filter(n => n.DaDoc === 0).length;
            console.log(`\n📬 Unread: ${unread}/${notifications.length}`);
        } else {
            console.log('❌ No notifications for this user');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkUserNotifications();
