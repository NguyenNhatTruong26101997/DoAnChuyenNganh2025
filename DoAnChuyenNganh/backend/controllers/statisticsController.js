const db = require('../config/database');

// Get dashboard statistics - Thống kê thực tế
exports.getDashboardStatistics = async (req, res) => {
    try {
        const { year = new Date().getFullYear(), month } = req.query;

        // Build date filter - Use parameterized query to prevent SQL injection
        let dateFilter = 'YEAR(dh.DonHangTao) = ?';
        const params = [year];
        
        if (month) {
            dateFilter += ' AND MONTH(dh.DonHangTao) = ?';
            params.push(month);
        }

        // 1. Doanh thu (chỉ đơn đã giao)
        const [revenueResult] = await db.query(`
            SELECT COALESCE(SUM(TongTien), 0) as doanhThu
            FROM DonHang dh
            WHERE ${dateFilter}
            AND TrangThaiDonHang = 'Da giao'
        `, params);

        // 2. Tổng đơn hàng
        const [ordersResult] = await db.query(`
            SELECT 
                COUNT(*) as tongDon,
                SUM(CASE WHEN TrangThaiDonHang = 'Da giao' THEN 1 ELSE 0 END) as donThanhCong,
                SUM(CASE WHEN TrangThaiDonHang IN ('Da huy', 'HoanTien') THEN 1 ELSE 0 END) as donHuy,
                SUM(CASE WHEN TrangThaiDonHang = 'Cho xu ly' THEN 1 ELSE 0 END) as donChoXuLy
            FROM DonHang dh
            WHERE ${dateFilter}
        `, params);

        // 3. Số lượng khách hàng (có đơn hàng)
        const [customersResult] = await db.query(`
            SELECT COUNT(DISTINCT UserId) as soKhachHang
            FROM DonHang dh
            WHERE ${dateFilter}
        `, params);

        // 4. Sản phẩm đã bán (chỉ đơn đơn đã giao)
        const [productsResult] = await db.query(`
            SELECT COALESCE(SUM(ct.SoLuong), 0) as sanPhamDaBan
            FROM ChiTietDonHang ct
            JOIN DonHang dh ON ct.DonHangId = dh.IdDonHang
            WHERE ${dateFilter}
            AND dh.TrangThaiDonHang = 'Da giao'
        `, params);

        // 5. Doanh thu theo tháng (12 tháng)
        const [monthlyRevenue] = await db.query(`
            SELECT 
                MONTH(dh.DonHangTao) as thang,
                COALESCE(SUM(dh.TongTien), 0) as doanhThu
            FROM DonHang dh
            WHERE YEAR(dh.DonHangTao) = ?
            AND dh.TrangThaiDonHang = 'Da giao'
            GROUP BY MONTH(dh.DonHangTao)
            ORDER BY thang
        `, [year]);

        // 6. Top sản phẩm bán chạy
        const [topProducts] = await db.query(`
            SELECT 
                sp.TenSanPham,
                sp.IdSanPham,
                SUM(ct.SoLuong) as soLuongBan,
                SUM(ct.SoLuong * ct.GiaBan) as doanhThu
            FROM ChiTietDonHang ct
            JOIN SanPham sp ON ct.SanPhamId = sp.IdSanPham
            JOIN DonHang dh ON ct.DonHangId = dh.IdDonHang
            WHERE ${dateFilter}
            AND dh.TrangThaiDonHang = 'Da giao'
            GROUP BY sp.IdSanPham
            ORDER BY soLuongBan DESC
            LIMIT 10
        `, params);

        // 7. Doanh thu theo thương hiệu
        const [brandRevenue] = await db.query(`
            SELECT 
                th.TenThuongHieu,
                COALESCE(SUM(ct.SoLuong * ct.GiaBan), 0) as doanhThu
            FROM ChiTietDonHang ct
            JOIN SanPham sp ON ct.SanPhamId = sp.IdSanPham
            JOIN ThuongHieu th ON sp.ThuongHieuId = th.IdThuongHieu
            JOIN DonHang dh ON ct.DonHangId = dh.IdDonHang
            WHERE ${dateFilter}
            AND dh.TrangThaiDonHang = 'Da giao'
            GROUP BY th.IdThuongHieu
            ORDER BY doanhThu DESC
        `, params);

        // 8. Trạng thái đơn hàng
        const [orderStatus] = await db.query(`
            SELECT 
                TrangThaiDonHang,
                COUNT(*) as soLuong
            FROM DonHang dh
            WHERE ${dateFilter}
            GROUP BY TrangThaiDonHang
        `, params);

        // 9. Tỷ lệ hoàn thành
        const tongDon = ordersResult[0].tongDon || 0;
        const donThanhCong = ordersResult[0].donThanhCong || 0;
        const completionRate = tongDon > 0 ? ((donThanhCong / tongDon) * 100).toFixed(2) : 0;

        // 10. Giá trị đơn hàng trung bình
        const avgOrderValue = donThanhCong > 0 
            ? (revenueResult[0].doanhThu / donThanhCong).toFixed(0) 
            : 0;

        res.json({
            success: true,
            data: {
                overview: {
                    doanhThu: revenueResult[0].doanhThu,
                    tongDon: ordersResult[0].tongDon,
                    donThanhCong: ordersResult[0].donThanhCong,
                    donHuy: ordersResult[0].donHuy,
                    donChoXuLy: ordersResult[0].donChoXuLy,
                    soKhachHang: customersResult[0].soKhachHang,
                    sanPhamDaBan: productsResult[0].sanPhamDaBan,
                    completionRate: parseFloat(completionRate),
                    avgOrderValue: parseInt(avgOrderValue)
                },
                monthlyRevenue,
                topProducts,
                brandRevenue,
                orderStatus
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê',
            error: error.message
        });
    }
};

// Get top selling products
exports.getTopProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const [products] = await db.query(`
            SELECT 
                sp.IdSanPham,
                sp.TenSanPham,
                SUM(ct.SoLuong) as soLuongBan,
                SUM(ct.SoLuong * ct.GiaBan) as doanhThu,
                (SELECT Url FROM HinhAnhSanPham WHERE SanPhamId = sp.IdSanPham AND AnhMacDinh = 1 LIMIT 1) as AnhChinh
            FROM ChiTietDonHang ct
            JOIN SanPham sp ON ct.SanPhamId = sp.IdSanPham
            JOIN DonHang dh ON ct.DonHangId = dh.IdDonHang
            WHERE dh.TrangThaiDonHang = 'Da giao'
            GROUP BY sp.IdSanPham
            ORDER BY soLuongBan DESC
            LIMIT ?
        `, [parseInt(limit)]);

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get top products error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy sản phẩm bán chạy'
        });
    }
};

// Get revenue by month
exports.getRevenueByMonth = async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;

        const [revenue] = await db.query(`
            SELECT 
                MONTH(dh.DonHangTao) as thang,
                COALESCE(SUM(dh.TongTien), 0) as doanhThu,
                COUNT(*) as soDon
            FROM DonHang dh
            WHERE YEAR(dh.DonHangTao) = ?
            AND dh.TrangThaiDonHang = 'Da giao'
            GROUP BY MONTH(dh.DonHangTao)
            ORDER BY thang
        `, [year]);

        // Fill missing months with 0
        const fullYearData = [];
        for (let i = 1; i <= 12; i++) {
            const monthData = revenue.find(r => r.thang === i);
            fullYearData.push({
                thang: i,
                doanhThu: monthData ? monthData.doanhThu : 0,
                soDon: monthData ? monthData.soDon : 0
            });
        }

        res.json({
            success: true,
            data: fullYearData
        });
    } catch (error) {
        console.error('Get revenue by month error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy doanh thu theo tháng'
        });
    }
};
