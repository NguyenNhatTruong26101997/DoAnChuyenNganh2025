-- Tạo bảng Mã Giảm Giá
CREATE TABLE IF NOT EXISTS MaGiamGia (
    MaGiamGiaId INT PRIMARY KEY AUTO_INCREMENT,
    MaMaGiamGia VARCHAR(50) UNIQUE NOT NULL COMMENT 'Mã code để nhập (VD: SUMMER2024)',
    TenMaGiamGia VARCHAR(255) NOT NULL COMMENT 'Tên hiển thị',
    MoTa TEXT COMMENT 'Mô tả chi tiết',
    PhanTramGiam DECIMAL(5,2) NOT NULL COMMENT 'Phần trăm giảm (0-100)',
    GiamToiDa DECIMAL(15,2) COMMENT 'Số tiền giảm tối đa',
    GiaTriDonHangToiThieu DECIMAL(15,2) DEFAULT 0 COMMENT 'Giá trị đơn hàng tối thiểu để áp dụng',
    NgayBatDau DATETIME NOT NULL COMMENT 'Ngày bắt đầu hiệu lực',
    NgayKetThuc DATETIME NOT NULL COMMENT 'Ngày hết hạn',
    TrangThai ENUM('HoatDong', 'KhongHoatDong') DEFAULT 'HoatDong',
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ma_code (MaMaGiamGia),
    INDEX idx_trang_thai (TrangThai),
    INDEX idx_ngay_hieu_luc (NgayBatDau, NgayKetThuc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm dữ liệu mẫu
INSERT INTO MaGiamGia (MaMaGiamGia, TenMaGiamGia, MoTa, PhanTramGiam, GiamToiDa, GiaTriDonHangToiThieu, NgayBatDau, NgayKetThuc) VALUES
('WELCOME10', 'Giảm 10% cho khách hàng mới', 'Áp dụng cho đơn hàng đầu tiên', 10.00, 500000, 1000000, '2024-01-01', '2025-12-31'),
('SUMMER20', 'Giảm 20% mùa hè', 'Khuyến mãi mùa hè hot', 20.00, 1000000, 2000000, '2024-06-01', '2024-08-31'),
('VIP30', 'Giảm 30% VIP', 'Dành cho khách hàng VIP', 30.00, 2000000, 5000000, '2024-01-01', '2025-12-31');
