CREATE DATABASE LaptopWorld
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

use LaptopWorld;


CREATE TABLE user (
    IdUser INT AUTO_INCREMENT PRIMARY KEY,
    HoTen VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    MatKhau VARCHAR(255) NOT NULL,
    SoDienThoai VARCHAR(20),
    VaiTro ENUM('user', 'admin') DEFAULT 'user',
    TrangThai TINYINT(1) DEFAULT 1,
    ThoiDiemTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    CapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;



CREATE TABLE DanhMuc (
    IdDanhMuc INT AUTO_INCREMENT PRIMARY KEY,
    TenDanhMuc VARCHAR(255) NOT NULL UNIQUE,
    MoTaDanhMuc TEXT
) ENGINE=InnoDB;


CREATE TABLE ThuongHieu (
    IdThuongHieu INT AUTO_INCREMENT PRIMARY KEY,
    TenThuongHieu VARCHAR(255) NOT NULL,
    MoTaThuongHieu TEXT
) ENGINE=InnoDB;


CREATE TABLE SanPham (
    IdSanPham INT AUTO_INCREMENT PRIMARY KEY,
    TenSanPham VARCHAR(255) NOT NULL,
    MoTaSanPham TEXT,
    GiaSanPham DECIMAL(12,2) NOT NULL DEFAULT 0,
    SoLuongSanPham INT NOT NULL DEFAULT 0,
    ThuongHieuId INT,
    DanhMucId INT,
    TrangThaiSanPham ENUM('DangBan', 'NgungBan', 'An') DEFAULT 'DangBan',
    FOREIGN KEY (ThuongHieuId) REFERENCES ThuongHieu(IdThuongHieu) ON DELETE SET NULL,
    FOREIGN KEY (DanhMucId) REFERENCES DanhMuc(IdDanhMuc) ON DELETE SET NULL
) ENGINE=InnoDB;


CREATE TABLE HinhAnhSanPham (
    IdHinhAnhSanPham INT AUTO_INCREMENT PRIMARY KEY,
    SanPhamId INT NOT NULL,
    Url VARCHAR(1024) NOT NULL,
    AnhMacDinh TINYINT(1) DEFAULT 0,
    FOREIGN KEY (SanPhamId) REFERENCES SanPham(IdSanPham) ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE GioHang (
    IdGioHang INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    UNIQUE KEY GioHangNguoiDung(UserId),
    FOREIGN KEY (UserId) REFERENCES user(IdUser) ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE ChiTietGioHang (
    IdChiTietGioHang INT AUTO_INCREMENT PRIMARY KEY,
    GioHangId INT NOT NULL,
    SanPhamId INT NOT NULL,
    SoLuongChiTietGioHang INT NOT NULL DEFAULT 1,
    FOREIGN KEY (GioHangId) REFERENCES GioHang(IdGioHang) ON DELETE CASCADE,
    FOREIGN KEY (SanPhamId) REFERENCES SanPham(IdSanPham) ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE DonHang (
    IdDonHang INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    MaDonHang VARCHAR(255) NOT NULL UNIQUE,
    TrangThaiDonHang ENUM('Cho xu ly', 'Xac nhan', 'Dang giao', 'Da giao', 'Da huy', 'HoanTien')
        DEFAULT 'Cho xu ly',
    DiaChiGiao TEXT,
    TongTien DECIMAL(12,2) NOT NULL DEFAULT 0,
    DonHangTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES user(IdUser)
) ENGINE=InnoDB;


CREATE TABLE ChiTietDonHang (
    IdChiTietDonHang INT AUTO_INCREMENT PRIMARY KEY,
    DonHangId INT NOT NULL,
    SanPhamId INT NOT NULL,
    SoLuong INT NOT NULL,
    GiaBan DECIMAL(12,2) NOT NULL,
    ChiTietDonHangTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (DonHangId) REFERENCES DonHang(IdDonHang) ON DELETE CASCADE,
    FOREIGN KEY (SanPhamId) REFERENCES SanPham(IdSanPham) ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE HoaDon (
    IdHoaDon INT AUTO_INCREMENT PRIMARY KEY,
    DonHangId INT NOT NULL,
    MaHoaDon VARCHAR(255) NOT NULL,
    SoTien DECIMAL(12,2) NOT NULL,
    NgayXuat DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (DonHangId) REFERENCES DonHang(IdDonHang) ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE ThanhToan (
    IdThanhToan INT AUTO_INCREMENT PRIMARY KEY,
    DonHangId INT NOT NULL,
    PhuongThucThanhToan ENUM('Tien mat', 'Chuyen Khoan', 'Quet the') NOT NULL,
    TrangThaiThanhToan ENUM('Cho xac nhan', 'Thanh cong', 'That Bai') DEFAULT 'Cho xac nhan',
    MaGiaoDich VARCHAR(255),
    SoTien DECIMAL(12,2) NOT NULL,
    NgayThanhToan DATETIME,
    FOREIGN KEY (DonHangId) REFERENCES DonHang(IdDonHang) ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE DanhGia (
    IdDanhGia INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT,
    SanPhamId INT,
    ParentId INT DEFAULT NULL,
    XepLoai INT CHECK (XepLoai BETWEEN 1 AND 5),
    BinhLuan TEXT,
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    CapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES user(IdUser) ON DELETE CASCADE,
    FOREIGN KEY (SanPhamId) REFERENCES SanPham(IdSanPham) ON DELETE CASCADE,
    FOREIGN KEY (ParentId) REFERENCES DanhGia(IdDanhGia) ON DELETE CASCADE
) ENGINE=InnoDB;

USE ChuyenNganh;

CREATE TABLE IF NOT EXISTS TinTuc (
    IdTinTuc INT PRIMARY KEY AUTO_INCREMENT,
    TieuDe VARCHAR(255) NOT NULL,
    NoiDung TEXT NOT NULL,
    AnhBia VARCHAR(255),
    UserId INT NOT NULL,
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    LuotXem INT DEFAULT 0,
    TrangThai ENUM('HienThi', 'An') DEFAULT 'HienThi',
    FOREIGN KEY (UserId) REFERENCES user(IdUser) ON DELETE CASCADE,
    INDEX idx_trangthai (TrangThai),
    INDEX idx_ngaytao (NgayTao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS BinhLuanTinTuc (
    IdBinhLuan INT PRIMARY KEY AUTO_INCREMENT,
    TinTucId INT NOT NULL,
    UserId INT NOT NULL,
    NoiDung TEXT NOT NULL,
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (TinTucId) REFERENCES TinTuc(IdTinTuc) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES user(IdUser) ON DELETE CASCADE,
    INDEX idx_tintuc (TinTucId),
    INDEX idx_ngaytao (NgayTao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE DanhGia 
ADD COLUMN ParentId INT DEFAULT NULL AFTER SanPhamId,
ADD FOREIGN KEY (ParentId) REFERENCES DanhGia(IdDanhGia) ON DELETE CASCADE;

ALTER TABLE DanhGia 
ADD COLUMN CapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE DanhGia 
MODIFY COLUMN XepLoai INT NULL;



CREATE TABLE LienHe (
    IdLienHe INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT,
    TieuDe VARCHAR(255),
    NoiDung TEXT,
    TrangThai ENUM('Moi', 'Da Doc', 'Da tra loi') DEFAULT 'Moi',
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES user(IdUser) ON DELETE CASCADE
) ENGINE=InnoDB;

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



-- INSERT INTO user (HoTen, Email, MatKhau, SoDienThoai, VaiTro)
INSERT INTO user (HoTen, Email, MatKhau, SoDienThoai, VaiTro) VALUES('Admin', 'admin@gmail.com', '123', '0394127625', 'admin');


select * from user;



-- Thêm sản phẩm
INSERT INTO SanPham (TenSanPham, MoTaSanPham, GiaSanPham, SoLuongSanPham, ThuongHieuId, DanhMucId, TrangThaiSanPham) 
VALUES ('Dell XPS 15', 'Laptop Dell XPS 15 cao cấp', 35000000, 10, 1, 1, 'DangBan');

select * from SanPham;



