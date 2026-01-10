// Find which user bought product 28
const db = require('./config/database');

async function findBuyer() {
    try {
        console.log('Finding users who bought product 28...\n');
        
        const [buyers] = await db.query(
            `SELECT DISTINCT
                u.IdUser,
                u.HoTen,
                u.Email,
                dh.MaDonHang,
                dh.TrangThaiDonHang
             FROM DonHang dh
             JOIN ChiTietDonHang ctdh ON dh.IdDonHang = ctdh.DonHangId
             JOIN user u ON dh.UserId = u.IdUser
             WHERE ctdh.SanPhamId = 28
             AND dh.TrangThaiDonHang IN ('Dang giao', 'Da giao')`
        );
        
        if (buyers.length > 0) {
            console.log('✅ Users who bought product 28:');
            console.table(buyers);
        } else {
            console.log('❌ No one has bought product 28 yet');
            
            // Check all delivered orders
            const [allDelivered] = await db.query(
                `SELECT 
                    dh.IdDonHang,
                    dh.MaDonHang,
                    dh.UserId,
                    u.HoTen,
                    dh.TrangThaiDonHang,
                    GROUP_CONCAT(ctdh.SanPhamId) as ProductIds
                 FROM DonHang dh
                 JOIN user u ON dh.UserId = u.IdUser
                 JOIN ChiTietDonHang ctdh ON dh.IdDonHang = ctdh.DonHangId
                 WHERE dh.TrangThaiDonHang IN ('Dang giao', 'Da giao')
                 GROUP BY dh.IdDonHang`
            );
            
            console.log('\nAll delivered orders:');
            console.table(allDelivered);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

findBuyer();
