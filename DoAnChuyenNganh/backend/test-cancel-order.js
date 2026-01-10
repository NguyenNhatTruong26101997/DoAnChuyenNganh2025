// Test cancel order API
const db = require('./config/database');

async function testCancelOrder() {
    try {
        const orderId = 7; // DH17679582999074883
        const userId = 5;
        
        console.log(`Testing cancel order ${orderId} for user ${userId}...\n`);
        
        // Check order before cancel
        const [before] = await db.query(`
            SELECT 
                dh.TrangThaiDonHang,
                tt.PhuongThucThanhToan,
                dh.MaDonHang
            FROM DonHang dh
            LEFT JOIN ThanhToan tt ON dh.IdDonHang = tt.DonHangId
            WHERE dh.IdDonHang = ? AND dh.UserId = ?
        `, [orderId, userId]);
        
        if (before.length === 0) {
            console.log('❌ Order not found or not owned by user');
            process.exit(1);
        }
        
        console.log('Before cancel:');
        console.table(before);
        
        // Check if can cancel
        const order = before[0];
        const canCancel = 
            order.TrangThaiDonHang === 'Cho xu ly' && 
            (order.PhuongThucThanhToan === 'Tien mat' || order.PhuongThucThanhToan === 'COD');
        
        if (canCancel) {
            console.log('\n✅ Order CAN be cancelled');
            console.log('\nTo cancel via API:');
            console.log(`DELETE http://localhost:3000/api/orders/${orderId}/cancel`);
            console.log('Headers: Authorization: Bearer <token>');
        } else {
            console.log('\n❌ Order CANNOT be cancelled');
            if (order.TrangThaiDonHang !== 'Cho xu ly') {
                console.log(`  Reason: Status is "${order.TrangThaiDonHang}"`);
            }
            if (order.PhuongThucThanhToan !== 'Tien mat' && order.PhuongThucThanhToan !== 'COD') {
                console.log(`  Reason: Payment is "${order.PhuongThucThanhToan}"`);
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testCancelOrder();
