const db = require('../config/database');

// Get dashboard statistics - Thống kê thực tế
exports.getDashboardStatistics = async (req, res) => {
    try {
        const { year = new Date().getFullYear(), month } = req.query;
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        // Nếu chọn năm tương lai hoặc tháng tương lai -> trả về 0 hết
        const isFutureYear = parseInt(year) > currentYear;
        const isFutureMonth = parseInt(year) === currentYear && month && parseInt(month) > currentMonth;
        
        if (isFutureYear || isFutureMonth) {
            return res.json({
                success: true,
                data: {
                    overview: {
                        doanhThu: 0,
                        tongDon: 0,
                        donThanhCong: 0,
                        donHuy: 0,
                        donChoXuLy: 0,
                        soKhachHang: 0,
                        sanPhamDaBan: 0,
                        completionRate: 0,
                        avgOrderValue: 0
                    },
                    inventory: {
                        tongSanPham: 0,
                        tongSoLuongKho: 0,
                        sanPhamDangBan: 0,
                        sanPhamNgungBan: 0,
                        sanPhamHetHang: 0
                    },
                    news: {
                        tongTinTuc: 0,
                        tongLuotXem: 0,
                        tinTucHienThi: 0,
                        tongBinhLuan: 0
                    },
                    flashsale: {
                        tongFlashSale: 0,
                        flashSaleDangDienRa: 0,
                        flashSaleSapDienRa: 0,
                        flashSaleDaKetThuc: 0,
                        soSanPhamFlashSale: 0
                    },
                    contact: {
                        tongLienHe: 0,
                        lienHeMoi: 0,
                        lienHeDaDoc: 0,
                        lienHeDaTraLoi: 0
                    },
                    monthlyRevenue: [],
                    topProducts: [],
                    brandRevenue: [],
                    orderStatus: []
                }
            });
        }

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
        
        console.log('📊 Thống kê sản phẩm đã bán:', productsResult[0].sanPhamDaBan);

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

        // 6. Top sản phẩm bán chạy (từ trước tới nay - không filter theo tháng/năm)
        const [topProducts] = await db.query(`
            SELECT 
                sp.TenSanPham,
                sp.IdSanPham,
                SUM(ct.SoLuong) as soLuongBan,
                SUM(ct.SoLuong * ct.GiaBan) as doanhThu
            FROM ChiTietDonHang ct
            JOIN SanPham sp ON ct.SanPhamId = sp.IdSanPham
            JOIN DonHang dh ON ct.DonHangId = dh.IdDonHang
            WHERE dh.TrangThaiDonHang = 'Da giao'
            GROUP BY sp.IdSanPham
            ORDER BY soLuongBan DESC
            LIMIT 10
        `);

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

        // 11. Thống kê sản phẩm trong kho (KHÔNG FILTER THEO THỜI GIAN)
        const [inventoryStats] = await db.query(`
            SELECT 
                COUNT(*) as tongSanPham,
                SUM(SoLuongSanPham) as tongSoLuongKho,
                SUM(CASE WHEN TrangThaiSanPham = 'DangBan' THEN 1 ELSE 0 END) as sanPhamDangBan,
                SUM(CASE WHEN TrangThaiSanPham = 'NgungBan' THEN 1 ELSE 0 END) as sanPhamNgungBan,
                SUM(CASE WHEN SoLuongSanPham = 0 THEN 1 ELSE 0 END) as sanPhamHetHang
            FROM SanPham
        `);

        // 12. Thống kê tin tức (filter theo ngày tạo)
        const newsDateFilter = dateFilter.replace(/dh\.DonHangTao/g, 'tn.NgayTao');
        const [newsStats] = await db.query(`
            SELECT 
                COUNT(*) as tongTinTuc,
                SUM(LuotXem) as tongLuotXem,
                SUM(CASE WHEN TrangThai = 'HienThi' THEN 1 ELSE 0 END) as tinTucHienThi,
                (SELECT COUNT(*) FROM BinhLuanTinTuc bl 
                 JOIN TinTuc t2 ON bl.TinTucId = t2.IdTinTuc 
                 WHERE ${newsDateFilter.replace(/tn\./g, 't2.')}) as tongBinhLuan
            FROM TinTuc tn
            WHERE ${newsDateFilter}
        `, [...params, ...params]);

        // 13. Thống kê Flash Sale (KHÔNG FILTER THEO THỜI GIAN - hiển thị tất cả)
        const [flashsaleStats] = await db.query(`
            SELECT 
                COUNT(*) as tongFlashSale,
                SUM(CASE WHEN TrangThai = 'DangDien' THEN 1 ELSE 0 END) as flashSaleDangDienRa,
                SUM(CASE WHEN TrangThai = 'SapDien' THEN 1 ELSE 0 END) as flashSaleSapDienRa,
                SUM(CASE WHEN TrangThai = 'DaKetThuc' THEN 1 ELSE 0 END) as flashSaleDaKetThuc
            FROM FlashSale
        `);
        
        // Count flash sale products
        const [flashsaleProductCount] = await db.query(`
            SELECT COUNT(*) as soSanPhamFlashSale
            FROM FlashSaleProducts
        `);

        // 14. Thống kê liên hệ (KHÔNG FILTER THEO THỜI GIAN - hiển thị tất cả)
        const [contactStats] = await db.query(`
            SELECT 
                COUNT(*) as tongLienHe,
                SUM(CASE WHEN TrangThai = 'Moi' THEN 1 ELSE 0 END) as lienHeMoi,
                SUM(CASE WHEN TrangThai = 'Da Doc' THEN 1 ELSE 0 END) as lienHeDaDoc,
                SUM(CASE WHEN TrangThai = 'Da tra loi' THEN 1 ELSE 0 END) as lienHeDaTraLoi
            FROM LienHe
        `);

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
                inventory: inventoryStats[0],
                news: newsStats[0],
                flashsale: {
                    ...flashsaleStats[0],
                    soSanPhamFlashSale: flashsaleProductCount[0].soSanPhamFlashSale
                },
                contact: contactStats[0],
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
