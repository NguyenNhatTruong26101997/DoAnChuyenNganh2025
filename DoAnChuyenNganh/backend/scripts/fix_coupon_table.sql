-- Kiểm tra và sửa lỗi bảng MaGiamGia

-- Xóa cột LoaiGiam nếu đã tồn tại (để tạo lại đúng)
ALTER TABLE MaGiamGia DROP COLUMN IF EXISTS LoaiGiam;
ALTER TABLE MaGiamGia DROP COLUMN IF EXISTS SoTienGiam;

-- Thêm lại các cột theo đúng thứ tự
ALTER TABLE MaGiamGia 
ADD COLUMN LoaiGiam ENUM('PhanTram', 'SoTien') DEFAULT 'PhanTram' COMMENT 'Loại giảm giá' AFTER MoTa;

ALTER TABLE MaGiamGia 
MODIFY COLUMN PhanTramGiam DECIMAL(5,2) NULL COMMENT 'Phần trăm giảm (nếu loại = PhanTram)';

ALTER TABLE MaGiamGia 
ADD COLUMN SoTienGiam DECIMAL(15,2) NULL COMMENT 'Số tiền giảm cố định (nếu loại = SoTien)' AFTER PhanTramGiam;

-- Xóa dữ liệu cũ
TRUNCATE TABLE MaGiamGia;

-- Thêm dữ liệu mẫu với thứ tự cột đúng
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

SELECT 'Cập nhật bảng MaGiamGia thành công!' as message;
