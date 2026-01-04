-- Thêm trường DiaChi và AnhDaiDien vào bảng user
ALTER TABLE user 
ADD COLUMN DiaChi TEXT AFTER SoDienThoai,
ADD COLUMN AnhDaiDien VARCHAR(500) AFTER DiaChi;
