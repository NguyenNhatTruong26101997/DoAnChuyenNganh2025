-- Migration: Add reply support to DanhGia table
-- Run this SQL in your MySQL database

-- Add ParentId column for reply support
ALTER TABLE DanhGia 
ADD COLUMN ParentId INT DEFAULT NULL AFTER SanPhamId,
ADD FOREIGN KEY (ParentId) REFERENCES DanhGia(IdDanhGia) ON DELETE CASCADE;

-- Add CapNhat column for tracking updates
ALTER TABLE DanhGia 
ADD COLUMN CapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Make XepLoai nullable (for replies that don't have rating)
ALTER TABLE DanhGia 
MODIFY COLUMN XepLoai INT NULL CHECK (XepLoai BETWEEN 1 AND 5);
