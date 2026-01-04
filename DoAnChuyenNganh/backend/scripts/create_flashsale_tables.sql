-- ========================================
-- Flash Sale Tables
-- ========================================

USE LaptopWorld;

-- 1. FlashSale Table
CREATE TABLE IF NOT EXISTS FlashSale (
    IdFlashSale INT PRIMARY KEY AUTO_INCREMENT,
    TenFlashSale VARCHAR(255) NOT NULL,
    MoTa TEXT,
    NgayBatDau DATETIME NOT NULL,
    NgayKetThuc DATETIME NOT NULL,
    TrangThai ENUM('DangDien', 'SapDien', 'DaKetThuc') DEFAULT 'SapDien',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. FlashSaleProducts Table
CREATE TABLE IF NOT EXISTS FlashSaleProducts (
    IdFlashSaleProduct INT PRIMARY KEY AUTO_INCREMENT,
    FlashSaleId INT NOT NULL,
    SanPhamId INT NOT NULL,
    GiaGoc DECIMAL(12,2) NOT NULL,
    GiaFlashSale DECIMAL(12,2) NOT NULL,
    SoLuongGioiHan INT DEFAULT 0,
    DaBan INT DEFAULT 0,
    FOREIGN KEY (FlashSaleId) REFERENCES FlashSale(IdFlashSale) ON DELETE CASCADE,
    FOREIGN KEY (SanPhamId) REFERENCES SanPham(IdSanPham) ON DELETE CASCADE,
    UNIQUE KEY unique_flashsale_product (FlashSaleId, SanPhamId)
);

-- 3. Insert sample flash sale (for testing)
INSERT INTO FlashSale (TenFlashSale, MoTa, NgayBatDau, NgayKetThuc, TrangThai) 
VALUES (
    'Flash Sale Cuối Tuần',
    'Giảm giá sốc các dòng laptop gaming - Số lượng có hạn!',
    DATE_ADD(NOW(), INTERVAL -1 HOUR),  -- Started 1 hour ago
    DATE_ADD(NOW(), INTERVAL 23 HOUR),  -- Ends in 23 hours
    'DangDien'
);

-- Note: You can add products to flash sale after products exist in database
-- Example (run after you have products):
-- INSERT INTO FlashSaleProducts (FlashSaleId, SanPhamId, GiaGoc, GiaFlashSale, SoLuongGioiHan)
-- VALUES 
-- (1, 1, 25000000, 20000000, 10),
-- (1, 2, 30000000, 24000000, 5);

-- Verify
SELECT 'Flash Sales:' as Info;
SELECT * FROM FlashSale;

SELECT 'Flash Sale Products:' as Info;
SELECT * FROM FlashSaleProducts;
