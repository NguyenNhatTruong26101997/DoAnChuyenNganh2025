-- Tạo bảng MaGiamGia từ đầu
CREATE TABLE IF NOT EXISTS MaGiamGia (
    MaGiamGiaId INT AUTO_INCREMENT PRIMARY KEY,
    MaMaGiamGia VARCHAR(50) UNIQUE NOT NULL COMMENT 'Mã code giảm giá',
    TenMaGiamGia VARCHAR(255) NOT NULL COMMENT 'Tên mã giảm giá',
    MoTa TEXT COMMENT 'Mô tả',
    LoaiGiam ENUM('PhanTram', 'SoTien') DEFAULT 'PhanTram' COMMENT 'Loại giảm giá',
    PhanTramGiam DECIMAL(5,2) NULL COMMENT 'Phần trăm giảm (1-100)',
    SoTienGiam DECIMAL(15,2) NULL COMMENT 'Số tiền giảm cố định',
    GiamToiDa DECIMAL(15,2) NULL COMMENT 'Giảm tối đa (cho loại phần trăm)',
    GiaTriDonHangToiThieu DECIMAL(15,2) DEFAULT 0 COMMENT 'Giá trị đơn hàng tối thiểu',
    NgayBatDau DATE NOT NULL COMMENT 'Ngày bắt đầu',
    NgayKetThuc DATE NOT NULL COMMENT 'Ngày kết thúc',
    TrangThai ENUM('HoatDong', 'KhongHoatDong') DEFAULT 'HoatDong',
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ma (MaMaGiamGia),
    INDEX idx_trangthai (TrangThai),
    INDEX idx_ngay (NgayBatDau, NgayKetThuc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý mã giảm giá';

-- Thêm dữ liệu mẫu
INSERT INTO MaGiamGia (
    MaMaGiamGia, TenMaGiamGia, MoTa, LoaiGiam, 
    PhanTramGiam, SoTienGiam, GiamToiDa, 
    GiaTriDonHangToiThieu, NgayBatDau, NgayKetThuc, TrangThai
) VALUES
('WELCOME10', 'Giảm 10% cho khách hàng mới', 'Áp dụng cho đơn hàng đầu tiên', 'PhanTram', 10.00, NULL, 500000, 1000000, '2024-01-01', '2025-12-31', 'HoatDong'),
('SUMMER20', 'Giảm 20% mùa hè', 'Khuyến mãi mùa hè hot', 'PhanTram', 20.00, NULL, 1000000, 2000000, '2024-06-01', '2025-08-31', 'HoatDong'),
('FREESHIP', 'Miễn phí ship 50K', 'Giảm 50.000đ phí vận chuyển', 'SoTien', NULL, 50000, NULL, 500000, '2024-01-01', '2025-12-31', 'HoatDong'),
('GIAM100K', 'Giảm 100K', 'Giảm ngay 100.000đ', 'SoTien', NULL, 100000, NULL, 1000000, '2024-01-01', '2025-12-31', 'HoatDong'),
('VIP30', 'Giảm 30% VIP', 'Dành cho khách hàng VIP', 'PhanTram', 30.00, NULL, 2000000, 5000000, '2024-01-01', '2025-12-31', 'HoatDong');

SELECT 'Tạo bảng MaGiamGia thành công!' as message;
SELECT COUNT(*) as total_coupons FROM MaGiamGia;
