const db = require('./config/database');

async function createNotificationTable() {
    try {
        // Tạo bảng ThongBao
        await db.query(`
            CREATE TABLE IF NOT EXISTS ThongBao (
                IdThongBao INT PRIMARY KEY AUTO_INCREMENT,
                UserId INT NOT NULL,
                TieuDe VARCHAR(255) NOT NULL,
                NoiDung TEXT NOT NULL,
                LoaiThongBao ENUM('DonHang', 'SanPham', 'HeThong', 'KhuyenMai') DEFAULT 'HeThong',
                LienKet VARCHAR(500),
                DaDoc BOOLEAN DEFAULT FALSE,
                NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (UserId) REFERENCES user(IdUser) ON DELETE CASCADE,
                INDEX idx_user_dadoc (UserId, DaDoc),
                INDEX idx_ngaytao (NgayTao)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✅ Đã tạo bảng ThongBao');

        // Thêm một số thông báo mẫu cho admin (UserId = 1)
        await db.query(`
            INSERT INTO ThongBao (UserId, TieuDe, NoiDung, LoaiThongBao, LienKet) VALUES
            (1, 'Đơn hàng mới', 'Có đơn hàng mới cần xử lý', 'DonHang', 'admin.html#orders'),
            (1, 'Liên hệ mới', 'Có liên hệ mới từ khách hàng', 'HeThong', 'admin.html#contacts')
        `);

        console.log('✅ Đã thêm thông báo mẫu');

        // Hiển thị thông báo
        const [notifications] = await db.query('SELECT * FROM ThongBao ORDER BY NgayTao DESC');
        console.log('\n📢 Danh sách thông báo:');
        console.table(notifications);

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

createNotificationTable();
