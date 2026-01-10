// Test order detail API
const db = require('./config/database');

async function testOrderDetail() {
    try {
        const orderId = 1; // Change this to your order ID
        
        console.log('Testing order detail API...');
        console.log('Order ID:', orderId);
        
        // Get order items
        const [items] = await db.query(
            `SELECT 
                ct.IdChiTietDonHang,
                ct.SoLuong,
                ct.GiaBan,
                sp.IdSanPham as SanPhamId,
                sp.TenSanPham,
                (SELECT Url FROM HinhAnhSanPham WHERE SanPhamId = sp.IdSanPham AND AnhMacDinh = 1 LIMIT 1) as AnhChinh
            FROM ChiTietDonHang ct
            JOIN SanPham sp ON ct.SanPhamId = sp.IdSanPham
            WHERE ct.DonHangId = ?`,
            [orderId]
        );
        
        console.log('\n=== ORDER ITEMS ===');
        console.log(JSON.stringify(items, null, 2));
        
        if (items.length > 0) {
            console.log('\n✅ Query works! SanPhamId:', items[0].SanPhamId);
        } else {
            console.log('\n⚠️ No items found for this order');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testOrderDetail();
