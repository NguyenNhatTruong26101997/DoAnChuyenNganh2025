const db = require('./config/database');

async function checkStats() {
    try {
        // Kiểm tra đơn hàng đã giao theo năm/tháng
        const [result1] = await db.query(`
            SELECT 
                IdDonHang, 
                MaDonHang, 
                TrangThaiDonHang, 
                YEAR(DonHangTao) as Nam, 
                MONTH(DonHangTao) as Thang,
                DonHangTao
            FROM DonHang 
            WHERE TrangThaiDonHang = 'Da giao'
            ORDER BY DonHangTao DESC
        `);
        console.log('📅 Đơn hàng đã giao theo thời gian:');
        console.table(result1);

        // Kiểm tra sản phẩm đã bán
        const [result2] = await db.query(`
            SELECT COALESCE(SUM(ct.SoLuong), 0) as sanPhamDaBan
            FROM ChiTietDonHang ct
            JOIN DonHang dh ON ct.DonHangId = dh.IdDonHang
            WHERE dh.TrangThaiDonHang = 'Da giao'
        `);
        console.log('\n✅ Tổng sản phẩm đã bán (tất cả):', result2[0].sanPhamDaBan);

        // Kiểm tra sản phẩm đã bán năm 2026
        const [result3] = await db.query(`
            SELECT COALESCE(SUM(ct.SoLuong), 0) as sanPhamDaBan
            FROM ChiTietDonHang ct
            JOIN DonHang dh ON ct.DonHangId = dh.IdDonHang
            WHERE dh.TrangThaiDonHang = 'Da giao'
            AND YEAR(dh.DonHangTao) = 2026
        `);
        console.log('✅ Sản phẩm đã bán năm 2026:', result3[0].sanPhamDaBan);

        // Kiểm tra chi tiết đơn hàng
        const [result4] = await db.query(`
            SELECT dh.MaDonHang, dh.TrangThaiDonHang, ct.SoLuong, sp.TenSanPham
            FROM ChiTietDonHang ct
            JOIN DonHang dh ON ct.DonHangId = dh.IdDonHang
            JOIN SanPham sp ON ct.SanPhamId = sp.IdSanPham
            WHERE dh.TrangThaiDonHang = 'Da giao'
        `);
        console.log('\n📦 Chi tiết đơn hàng đã giao:');
        console.table(result4);

        // Kiểm tra tổng số lượng trong kho
        const [result5] = await db.query(`
            SELECT 
                COUNT(*) as tongSanPham,
                SUM(SoLuongSanPham) as tongSoLuongKho
            FROM SanPham
        `);
        console.log('\n📊 Thống kê kho:');
        console.table(result5);

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

checkStats();
