// Check if order can be cancelled
const db = require('./config/database');

async function checkOrderCancel() {
    try {
        const userId = 5; // Change to your user ID
        
        console.log(`Checking orders for user ${userId}...\n`);
        
        const [orders] = await db.query(`
            SELECT 
                dh.IdDonHang,
                dh.MaDonHang,
                dh.TrangThaiDonHang,
                tt.PhuongThucThanhToan,
                dh.DonHangTao
            FROM DonHang dh
            LEFT JOIN ThanhToan tt ON dh.IdDonHang = tt.DonHangId
            WHERE dh.UserId = ?
            ORDER BY dh.DonHangTao DESC
            LIMIT 5
        `, [userId]);
        
        if (orders.length > 0) {
            console.log('Recent orders:');
            console.table(orders);
            
            console.log('\n✅ Can cancel if:');
            console.log('- TrangThaiDonHang = "Cho xu ly"');
            console.log('- PhuongThucThanhToan = "Tien mat" or "COD"');
            
            orders.forEach(order => {
                const canCancel = 
                    order.TrangThaiDonHang === 'Cho xu ly' && 
                    (order.PhuongThucThanhToan === 'Tien mat' || order.PhuongThucThanhToan === 'COD');
                
                console.log(`\nOrder ${order.MaDonHang}: ${canCancel ? '✅ CAN CANCEL' : '❌ CANNOT CANCEL'}`);
                if (!canCancel) {
                    if (order.TrangThaiDonHang !== 'Cho xu ly') {
                        console.log(`  Reason: Status is "${order.TrangThaiDonHang}" (not "Cho xu ly")`);
                    }
                    if (order.PhuongThucThanhToan !== 'Tien mat' && order.PhuongThucThanhToan !== 'COD') {
                        console.log(`  Reason: Payment method is "${order.PhuongThucThanhToan}" (not COD)`);
                    }
                }
            });
        } else {
            console.log('❌ No orders found for this user');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkOrderCancel();
