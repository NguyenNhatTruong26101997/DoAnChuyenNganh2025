-- ========================================
-- Update Categories and Brands
-- ========================================

USE LaptopWorld;

-- 1. Add Categories (if not exist)
INSERT INTO DanhMuc (TenDanhMuc, MoTaDanhMuc) VALUES
('Laptop cơ bản', 'Laptop phù hợp cho công việc văn phòng, học tập'),
('Laptop gaming', 'Laptop chơi game hiệu năng cao')
ON DUPLICATE KEY UPDATE 
    MoTaDanhMuc = VALUES(MoTaDanhMuc);

-- 2. Update Brand Names
-- Change MSI to Apple
UPDATE ThuongHieu 
SET TenThuongHieu = 'Apple', 
    MoTaThuongHieu = 'Thương hiệu Apple - MacBook, iMac'
WHERE TenThuongHieu = 'MSI';

-- Change Acer to Gigabyte
UPDATE ThuongHieu 
SET TenThuongHieu = 'Gigabyte', 
    MoTaThuongHieu = 'Thương hiệu Gigabyte - Laptop gaming'
WHERE TenThuongHieu = 'Acer';

-- 3. Verify changes
SELECT 'Categories:' as Info;
SELECT * FROM DanhMuc;

SELECT 'Brands:' as Info;
SELECT * FROM ThuongHieu;
