// Check which orders have items
const db = require('./config/database');

async function checkOrders() {
    try {
        console.log('Checking orders with items...\n');
        
        const [orders] = await db.query(`
            SELECT 
                dh.IdDonHang,
                dh.MaDonHang,
                dh.TrangThaiDonHang,
                COUNT(ct.IdChiTietDonHang) as SoLuongSanPham
            FROM DonHang dh
            LEFT JOIN ChiTietDonHang ct ON dh.IdDonHang = ct.DonHangId
            GROUP BY dh.IdDonHang
            ORDER BY dh.IdDonHang DESC
            LIMIT 10
        `);
        
        console.log('Recent orders:');
        console.table(orders);
        
        // Test with first order that has items
        const orderWithItems = orders.find(o => o.SoLuongSanPham > 0);
        
        if (orderWithItems) {
            console.log(`\n✅ Testing with order ${orderWithItems.IdDonHang} (${orderWithItems.MaDonHang})...\n`);
            
            const [items] = await db.query(
                `SELECT 
                    ct.IdChiTietDonHang,
                    ct.SoLuong,
                    ct.GiaBan,
                    sp.IdSanPham as SanPhamId,
                    sp.TenSanPham
                FROM ChiTietDonHang ct
                JOIN SanPham sp ON ct.SanPhamId = sp.IdSanPham
                WHERE ct.DonHangId = ?`,
                [orderWithItems.IdDonHang]
            );
            
            console.log('Items:');
            console.table(items);
            
            if (items[0] && items[0].SanPhamId) {
                console.log(`\n✅ SUCCESS! SanPhamId field exists: ${items[0].SanPhamId}`);
            }
        } else {
            console.log('\n⚠️ No orders with items found');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkOrders();
