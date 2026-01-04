const db = require('../config/database');
const { generateOrderCode, sanitizeInput, isValidLength, isPositiveInteger, isValidOrderStatus } = require('../utils/helpers');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

// Create order from cart
const createOrder = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const userId = req.user.userId;
        const { 
            diaChiGiao, 
            phuongThucThanhToan = 'Tien mat',
            hoTenNguoiNhan,
            soDienThoaiNguoiNhan,
            emailNguoiNhan,
            ghiChu
        } = req.body;

        // VALIDATION CHẶT CHẼ - Chống spam
        if (!diaChiGiao || !isValidLength(diaChiGiao, 10, 500)) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Địa chỉ giao hàng không hợp lệ (10-500 ký tự)'
            });
        }

        if (!hoTenNguoiNhan || !isValidLength(hoTenNguoiNhan, 2, 100)) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Họ tên người nhận không hợp lệ (2-100 ký tự)'
            });
        }

        if (!soDienThoaiNguoiNhan || !isValidLength(soDienThoaiNguoiNhan, 10, 15)) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Số điện thoại không hợp lệ'
            });
        }

        if (ghiChu && !isValidLength(ghiChu, 0, 500)) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Ghi chú quá dài (tối đa 500 ký tự)'
            });
        }

        const validPaymentMethods = ['Tien mat', 'COD', 'Chuyen khoan', 'The tin dung'];
        if (!validPaymentMethods.includes(phuongThucThanhToan)) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Phương thức thanh toán không hợp lệ'
            });
        }

        // Sanitize inputs
        const safeDiaChiGiao = sanitizeInput(diaChiGiao);
        const safeHoTenNguoiNhan = sanitizeInput(hoTenNguoiNhan);
        const safeSoDienThoaiNguoiNhan = sanitizeInput(soDienThoaiNguoiNhan);
        const safeEmailNguoiNhan = emailNguoiNhan ? sanitizeInput(emailNguoiNhan) : null;
        const safeGhiChu = ghiChu ? sanitizeInput(ghiChu) : null;

        // Get cart
        const [carts] = await connection.query(
            'SELECT IdGioHang FROM GioHang WHERE UserId = ?',
            [userId]
        );

        if (carts.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Giỏ hàng trống'
            });
        }

        const cartId = carts[0].IdGioHang;

        // Get cart items
        const [items] = await connection.query(
            `SELECT ct.SanPhamId, ct.SoLuongChiTietGioHang, sp.GiaSanPham, sp.SoLuongSanPham, sp.TenSanPham
            FROM ChiTietGioHang ct
            JOIN SanPham sp ON ct.SanPhamId = sp.IdSanPham
            WHERE ct.GioHangId = ? AND sp.TrangThaiSanPham = 'DangBan'`,
            [cartId]
        );

        if (items.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Giỏ hàng trống hoặc sản phẩm không còn bán'
            });
        }

        // Check stock availability
        for (const item of items) {
            if (item.SoLuongSanPham < item.SoLuongChiTietGioHang) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm "${item.TenSanPham}" không đủ số lượng`
                });
            }
        }

        // Calculate total
        const tongTien = items.reduce((sum, item) =>
            sum + (item.GiaSanPham * item.SoLuongChiTietGioHang), 0
        );

        // Validate total amount
        if (tongTien <= 0 || tongTien > 10000000000) { // Max 10 tỷ
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Tổng tiền đơn hàng không hợp lệ'
            });
        }

        // Create order
        const maDonHang = generateOrderCode();
        const [orderResult] = await connection.query(
            `INSERT INTO DonHang (
                UserId, MaDonHang, TrangThaiDonHang, DiaChiGiao, TongTien,
                HoTenNguoiNhan, SoDienThoaiNguoiNhan, EmailNguoiNhan, GhiChu
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, maDonHang, 'Cho xu ly', safeDiaChiGiao, tongTien,
                safeHoTenNguoiNhan, safeSoDienThoaiNguoiNhan, safeEmailNguoiNhan, safeGhiChu
            ]
        );

        const orderId = orderResult.insertId;

        // Create order details and update stock
        for (const item of items) {
            // Insert order detail
            await connection.query(
                'INSERT INTO ChiTietDonHang (DonHangId, SanPhamId, SoLuong, GiaBan) VALUES (?, ?, ?, ?)',
                [orderId, item.SanPhamId, item.SoLuongChiTietGioHang, item.GiaSanPham]
            );

            // Update product stock
            await connection.query(
                'UPDATE SanPham SET SoLuongSanPham = SoLuongSanPham - ? WHERE IdSanPham = ?',
                [item.SoLuongChiTietGioHang, item.SanPhamId]
            );
        }

        // Create payment record
        await connection.query(
            'INSERT INTO ThanhToan (DonHangId, PhuongThucThanhToan, TrangThaiThanhToan, SoTien) VALUES (?, ?, ?, ?)',
            [orderId, phuongThucThanhToan, 'Cho xac nhan', tongTien]
        );

        // Clear cart
        await connection.query(
            'DELETE FROM ChiTietGioHang WHERE GioHangId = ?',
            [cartId]
        );

        await connection.commit();

        // Send order confirmation email (don't wait for it)
        if (safeEmailNguoiNhan) {
            sendOrderConfirmationEmail(safeEmailNguoiNhan, {
                maDonHang,
                hoTenNguoiNhan: safeHoTenNguoiNhan,
                tongTien,
                items,
                diaChiGiao: safeDiaChiGiao
            }).catch(err => console.error('Failed to send order confirmation email:', err));
        }

        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công',
            data: {
                orderId,
                maDonHang,
                tongTien
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đặt hàng'
        });
    } finally {
        connection.release();
    }
};

// Get user's orders
const getOrders = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get orders with item count and payment method
        const [orders] = await db.query(
            `SELECT 
                dh.IdDonHang,
                dh.MaDonHang,
                dh.TrangThaiDonHang as TrangThai,
                dh.DiaChiGiao as DiaChiGiaoHang,
                dh.TongTien,
                dh.DonHangTao as ThoiDiemTao,
                tt.PhuongThucThanhToan,
                COUNT(ct.IdChiTietDonHang) as SoLuongSanPham
            FROM DonHang dh
            LEFT JOIN ChiTietDonHang ct ON dh.IdDonHang = ct.DonHangId
            LEFT JOIN ThanhToan tt ON dh.IdDonHang = tt.DonHangId
            WHERE dh.UserId = ?
            GROUP BY dh.IdDonHang, dh.MaDonHang, dh.TrangThaiDonHang, dh.DiaChiGiao, 
                     dh.TongTien, dh.DonHangTao, tt.PhuongThucThanhToan
            ORDER BY dh.DonHangTao DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách đơn hàng'
        });
    }
};

// Get order details by ID
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const isAdmin = req.user.vaiTro === 'admin';

        // Get order
        let query = `
            SELECT 
                dh.IdDonHang,
                dh.MaDonHang,
                dh.TrangThaiDonHang as TrangThai,
                dh.DiaChiGiao as DiaChiGiaoHang,
                dh.HoTenNguoiNhan,
                dh.SoDienThoaiNguoiNhan,
                dh.EmailNguoiNhan,
                dh.GhiChu,
                dh.TongTien,
                dh.DonHangTao as ThoiDiemTao,
                u.HoTen,
                u.Email,
                u.SoDienThoai
            FROM DonHang dh
            JOIN user u ON dh.UserId = u.IdUser
            WHERE dh.IdDonHang = ?
        `;

        const queryParams = [id];

        if (!isAdmin) {
            query += ' AND dh.UserId = ?';
            queryParams.push(userId);
        }

        const [orders] = await db.query(query, queryParams);

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Get order items
        const [items] = await db.query(
            `SELECT 
                ct.IdChiTietDonHang,
                ct.SoLuong,
                ct.GiaBan,
                sp.TenSanPham,
                (SELECT Url FROM HinhAnhSanPham WHERE SanPhamId = sp.IdSanPham AND AnhMacDinh = 1 LIMIT 1) as AnhChinh
            FROM ChiTietDonHang ct
            JOIN SanPham sp ON ct.SanPhamId = sp.IdSanPham
            WHERE ct.DonHangId = ?`,
            [id]
        );

        const order = orders[0];
        order.items = items;

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy chi tiết đơn hàng'
        });
    }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { trangThaiDonHang } = req.body;

        // VALIDATION CHẶT CHẼ - Chống spam
        if (!id || isNaN(id) || !isPositiveInteger(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'ID đơn hàng không hợp lệ'
            });
        }

        if (!isValidOrderStatus(trangThaiDonHang)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái đơn hàng không hợp lệ'
            });
        }

        const [result] = await db.query(
            'UPDATE DonHang SET TrangThaiDonHang = ? WHERE IdDonHang = ?',
            [trangThaiDonHang, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật trạng thái đơn hàng thành công'
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật trạng thái'
        });
    }
};

// Get all orders (Admin only)
const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        
        // VALIDATION - Chống spam
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        if (isNaN(pageNum) || pageNum < 1 || pageNum > 10000) {
            return res.status(400).json({
                success: false,
                message: 'Số trang không hợp lệ'
            });
        }
        
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({
                success: false,
                message: 'Giới hạn không hợp lệ'
            });
        }
        
        const offset = (pageNum - 1) * limitNum;

        let whereClause = '';
        const queryParams = [];

        if (status && isValidOrderStatus(status)) {
            whereClause = 'WHERE dh.TrangThaiDonHang = ?';
            queryParams.push(status);
        }

        const [orders] = await db.query(
            `SELECT 
                dh.IdDonHang,
                dh.MaDonHang,
                dh.TrangThaiDonHang,
                dh.TongTien,
                dh.DonHangTao,
                u.HoTen,
                u.Email
            FROM DonHang dh
            JOIN user u ON dh.UserId = u.IdUser
            ${whereClause}
            ORDER BY dh.DonHangTao DESC
            LIMIT ? OFFSET ?`,
            [...queryParams, limitNum, offset]
        );

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách đơn hàng'
        });
    }
};

// Cancel order - Phân quyền rõ ràng
const cancelOrder = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const userId = req.user.userId;
        const isAdmin = req.user.vaiTro === 'admin' || req.user.vaiTro === 'Admin';

        // Get order with payment info
        let query = `
            SELECT 
                dh.UserId, 
                dh.TrangThaiDonHang,
                dh.MaDonHang,
                tt.PhuongThucThanhToan
            FROM DonHang dh
            LEFT JOIN ThanhToan tt ON dh.IdDonHang = tt.DonHangId
            WHERE dh.IdDonHang = ?
        `;
        const queryParams = [id];

        if (!isAdmin) {
            query += ' AND dh.UserId = ?';
            queryParams.push(userId);
        }

        const [orders] = await connection.query(query, queryParams);

        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        const order = orders[0];

        // Kiểm tra trạng thái không cho phép hủy
        if (order.TrangThaiDonHang === 'Da giao' || order.TrangThaiDonHang === 'Da huy' || order.TrangThaiDonHang === 'HoanTien') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy đơn hàng này'
            });
        }

        // NGHIỆP VỤ: User chỉ hủy được đơn COD và chưa xác nhận
        if (!isAdmin) {
            // Kiểm tra phương thức thanh toán
            if (order.PhuongThucThanhToan !== 'Tien mat' && order.PhuongThucThanhToan !== 'COD') {
                await connection.rollback();
                return res.status(403).json({
                    success: false,
                    message: 'Đơn hàng thanh toán online không thể tự hủy. Vui lòng liên hệ admin.'
                });
            }

            // Kiểm tra trạng thái - chỉ hủy được khi chờ xử lý
            if (order.TrangThaiDonHang !== 'Cho xu ly') {
                await connection.rollback();
                return res.status(403).json({
                    success: false,
                    message: 'Chỉ có thể hủy đơn hàng khi đơn chưa được xác nhận'
                });
            }
        }

        // Restore product stock
        const [items] = await connection.query(
            'SELECT SanPhamId, SoLuong FROM ChiTietDonHang WHERE DonHangId = ?',
            [id]
        );

        for (const item of items) {
            await connection.query(
                'UPDATE SanPham SET SoLuongSanPham = SoLuongSanPham + ? WHERE IdSanPham = ?',
                [item.SoLuong, item.SanPhamId]
            );
        }

        // Xác định trạng thái mới
        let newStatus = 'Da huy';
        let paymentStatus = 'ThatBai';
        
        // Nếu là admin hủy đơn online payment -> HoanTien
        if (isAdmin && order.PhuongThucThanhToan !== 'Tien mat' && order.PhuongThucThanhToan !== 'COD') {
            newStatus = 'HoanTien';
            paymentStatus = 'HoanTien';
        }

        // Update order status
        await connection.query(
            'UPDATE DonHang SET TrangThaiDonHang = ? WHERE IdDonHang = ?',
            [newStatus, id]
        );

        // Update payment status
        await connection.query(
            'UPDATE ThanhToan SET TrangThaiThanhToan = ? WHERE DonHangId = ?',
            [paymentStatus, id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: newStatus === 'HoanTien' ? 'Đã hủy đơn hàng và đánh dấu hoàn tiền' : 'Hủy đơn hàng thành công',
            data: {
                trangThaiMoi: newStatus
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi hủy đơn hàng'
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    getAllOrders,
    cancelOrder
};
