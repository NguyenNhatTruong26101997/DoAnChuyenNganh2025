Instructions to import your existing MySQL database dump (detected file: `ChuyenNganh.sql`):

1. File location
- Bạn đã đặt file SQL vào: `f:\DoAnChuyenNganh\LaptopWorld\db\ChuyenNganh.sql`.

2. Import nhanh (file có thể chứa `CREATE DATABASE` / `USE` nên có thể import trực tiếp)

   - Cách A — Import trực tiếp (file sẽ tạo database theo nội dung SQL):
   ```powershell
   mysql -u root -p < "f:\DoAnChuyenNganh\LaptopWorld\db\ChuyenNganh.sql"
   ```

   - Cách B — Tạo database thủ công rồi import vào database đó:
   ```powershell
   mysql -u root -p
   CREATE DATABASE LaptopWorld CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   exit

   mysql -u root -p LaptopWorld < "f:\DoAnChuyenNganh\LaptopWorld\db\ChuyenNganh.sql"
   ```

   Lưu ý: file SQL bạn dùng có chứa `CREATE DATABASE LaptopWorld` và `USE LaptopWorld`, nên cả hai cách đều hoạt động.

3. Cập nhật `.env`
- Tạo file `.env` ở gốc project (copy từ `.env.example`) và điền giá trị phù hợp. Ví dụ:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=LaptopWorld
PORT=3000
JWT_SECRET=change_this
OPENAI_API_KEY=
```

4. Chạy project

```powershell
cd f:\DoAnChuyenNganh\LaptopWorld
npm install
npm run dev
```

5. Kiểm tra
- Mở `http://localhost:3000` để xem giao diện.
- Kiểm tra API ví dụ: `GET http://localhost:3000/api/search?q=test`.

6. Ghi chú tương thích
- File SQL sử dụng charset `utf8mb4` và tạo các bảng chính: `user`, `DanhMuc`, `ThuongHieu`, `SanPham`, `HinhAnhSanPham`, `GioHang`, `ChiTietGioHang`, `DonHang`, `ChiTietDonHang`, `HoaDon`, `ThanhToan`, `DanhGia`, `LienHe`.
- Tên bảng trong SQL là tiếng Việt / PascalCase; nếu muốn dùng bảng tên khác, hãy chỉnh lại các truy vấn trong `src/`.

Nếu bạn muốn, tôi có thể:
- Tạo một file `schema_sample.sql` nhỏ (mẫu) tương thích với code backend hiện tại.
- Hoặc điều chỉnh `src/routes/api.js` để dùng chính xác tên bảng từ `ChuyenNganh.sql` (ví dụ `user` -> `users` mapping) — gửi cho tôi biết bạn muốn backend dùng tên bảng gốc hay đổi theo scaffold.

