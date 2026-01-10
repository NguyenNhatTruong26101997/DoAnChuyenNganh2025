// Test if user can review product
const db = require('./config/database');

async function testReviewPurchase() {
    try {
        const userId = 2; // Change to your user ID
        const sanPhamId = 28; // Product ID from URL
        
        console.log('Testing review purchase check...');
        console.log('User ID:', userId);
        console.log('Product ID:', sanPhamId);
        
        // Check if user has purchased this product
        const [purchases] = await db.query(
            `SELECT 
                dh.IdDonHang,
                dh.MaDonHang,
                dh.TrangThaiDonHang,
                ctdh.SanPhamId,
                sp.TenSanPham
             FROM DonHang dh
             JOIN ChiTietDonHang ctdh ON dh.IdDonHang = ctdh.DonHangId
             JOIN SanPham sp ON ctdh.SanPhamId = sp.IdSanPham
             WHERE dh.UserId = ? 
             AND ctdh.SanPhamId = ?
             AND dh.TrangThaiDonHang IN ('Dang giao', 'Da giao')`,
            [userId, sanPhamId]
        );
        
        console.log('\n=== PURCHASE HISTORY ===');
        if (purchases.length > 0) {
            console.table(purchases);
            console.log('\n✅ User CAN review this product!');
        } else {
            console.log('❌ User has NOT purchased this product');
            
            // Check all orders
            const [allOrders] = await db.query(
                `SELECT IdDonHang, MaDonHang, TrangThaiDonHang FROM DonHang WHERE UserId = ?`,
                [userId]
            );
            console.log('\nAll user orders:');
            console.table(allOrders);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testReviewPurchase();
