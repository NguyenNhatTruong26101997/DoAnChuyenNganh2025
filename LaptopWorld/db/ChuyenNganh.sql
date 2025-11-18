CREATE DATABASE LaptopWorld
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE LaptopWorld;

-- =========================
-- BẢNG USER
-- =========================
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

-- =========================
-- BẢNG DANH MỤC
-- =========================
CREATE TABLE DanhMuc (
    IdDanhMuc INT AUTO_INCREMENT PRIMARY KEY,
    TenDanhMuc VARCHAR(255) NOT NULL UNIQUE,
    MoTaDanhMuc TEXT
) ENGINE=InnoDB;

-- =========================
-- BẢNG THƯƠNG HIỆU
-- =========================
CREATE TABLE ThuongHieu (
    IdThuongHieu INT AUTO_INCREMENT PRIMARY KEY,
    TenThuongHieu VARCHAR(255) NOT NULL,
    MoTaThuongHieu TEXT
) ENGINE=InnoDB;

-- =========================
-- BẢNG SẢN PHẨM
-- =========================
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

-- =========================
-- BẢNG HÌNH ẢNH SẢN PHẨM
-- =========================
CREATE TABLE HinhAnhSanPham (
    IdHinhAnhSanPham INT AUTO_INCREMENT PRIMARY KEY,
    SanPhamId INT NOT NULL,
    Url VARCHAR(1024) NOT NULL,
    AnhMacDinh TINYINT(1) DEFAULT 0,
    FOREIGN KEY (SanPhamId) REFERENCES SanPham(IdSanPham) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- BẢNG GIỎ HÀNG
-- =========================
CREATE TABLE GioHang (
    IdGioHang INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    UNIQUE KEY GioHangNguoiDung(UserId),
    FOREIGN KEY (UserId) REFERENCES user(IdUser) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- BẢNG CHI TIẾT GIỎ HÀNG
-- =========================
CREATE TABLE ChiTietGioHang (
    IdChiTietGioHang INT AUTO_INCREMENT PRIMARY KEY,
    GioHangId INT NOT NULL,
    SanPhamId INT NOT NULL,
    SoLuongChiTietGioHang INT NOT NULL DEFAULT 1,
    FOREIGN KEY (GioHangId) REFERENCES GioHang(IdGioHang) ON DELETE CASCADE,
    FOREIGN KEY (SanPhamId) REFERENCES SanPham(IdSanPham) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- BẢNG ĐƠN HÀNG
-- =========================
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

-- =========================
-- BẢNG CHI TIẾT ĐƠN HÀNG
-- =========================
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

-- =========================
-- BẢNG HÓA ĐƠN
-- =========================
CREATE TABLE HoaDon (
    IdHoaDon INT AUTO_INCREMENT PRIMARY KEY,
    DonHangId INT NOT NULL,
    MaHoaDon VARCHAR(255) NOT NULL,
    SoTien DECIMAL(12,2) NOT NULL,
    NgayXuat DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (DonHangId) REFERENCES DonHang(IdDonHang) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- BẢNG THANH TOÁN
-- =========================
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

-- =========================
-- BẢNG ĐÁNH GIÁ
-- =========================
CREATE TABLE DanhGia (
    IdDanhGia INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT,
    SanPhamId INT,
    XepLoai INT CHECK (XepLoai BETWEEN 1 AND 5),
    BinhLuan TEXT,
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES user(IdUser) ON DELETE CASCADE,
    FOREIGN KEY (SanPhamId) REFERENCES SanPham(IdSanPham) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- BẢNG LIÊN HỆ
-- =========================
CREATE TABLE LienHe (
    IdLienHe INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT,
    TieuDe VARCHAR(255),
    NoiDung TEXT,
    TrangThai ENUM('Moi', 'Da Doc', 'Da tra loi') DEFAULT 'Moi',
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES user(IdUser) ON DELETE CASCADE
) ENGINE=InnoDB;
