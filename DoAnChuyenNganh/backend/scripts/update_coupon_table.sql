-- Cập nhật bảng MaGiamGia để hỗ trợ 2 loại giảm giá
ALTER TABLE MaGiamGia 
ADD COLUMN LoaiGiam ENUM('PhanTram', 'SoTien') DEFAULT 'PhanTram' COMMENT 'Loại giảm giá' AFTER MoTa,
MODIFY COLUMN PhanTramGiam DECIMAL(5,2) NULL COMMENT 'Phần trăm giảm (nếu loại = PhanTram)',
ADD COLUMN SoTienGiam DECIMAL(15,2) NULL COMMENT 'Số tiền giảm cố định (nếu loại = SoTien)';

-- Xóa dữ liệu cũ và thêm dữ liệu mẫu mới
TRUNCATE TABLE MaGiamGia;

INSERT INTO MaGiamGia (MaMaGiamGia, TenMaGiamGia, MoTa, LoaiGiam, PhanTramGiam, GiamToiDa, GiaTriDonHangToiThieu, NgayBatDau, NgayKetThuc) VALUES
('WELCOME10', 'Giảm 10% cho khách hàng mới', 'Áp dụng cho đơn hàng đầu tiên', 'PhanTram', 10.00, 500000, 1000000, '2024-01-01', '2025-12-31'),
('SUMMER20', 'Giảm 20% mùa hè', 'Khuyến mãi mùa hè hot', 'PhanTram', 20.00, 1000000, 2000000, '2024-06-01', '2025-08-31'),
('FREESHIP', 'Miễn phí ship 50K', 'Giảm 50.000đ phí vận chuyển', 'SoTien', NULL, NULL, 500000, '2024-01-01', '2025-12-31', 50000),
('GIAM100K', 'Giảm 100K', 'Giảm ngay 100.000đ', 'SoTien', NULL, NULL, 1000000, '2024-01-01', '2025-12-31', 100000),
('VIP30', 'Giảm 30% VIP', 'Dành cho khách hàng VIP', 'PhanTram', 30.00, 2000000, 5000000, '2024-01-01', '2025-12-31');
