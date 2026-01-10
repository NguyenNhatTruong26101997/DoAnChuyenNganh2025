// Clear old notifications
const db = require('./config/database');

async function clearNotifications() {
    try {
        console.log('Clearing old notifications...\n');
        
        const [result] = await db.query('DELETE FROM ThongBao');
        
        console.log(`✅ Deleted ${result.affectedRows} old notifications`);
        console.log('\nNow test:');
        console.log('1. User đặt hàng → Admin thấy "Đơn hàng mới"');
        console.log('2. User đánh giá → Admin thấy "Đánh giá mới"');
        console.log('3. User bình luận → Admin thấy "Bình luận mới"');
        console.log('4. User liên hệ → Admin thấy "Liên hệ mới"');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

clearNotifications();
