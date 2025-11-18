
# Laptop World - Website Cửa Hàng Laptop

## Thực hiện
- Họ và tên: Nguyễn Nhật Trường  

# Laptop World - Website Cửa Hàng Laptop

## Thực hiện
- Họ và tên: Nguyễn Nhật Trường
- MSSV: 110122197
- Lớp: DA22TTC
- Email: nhattruong.261097@gmail.com
- Số điện thoại: 0394127625

---

## Giới thiệu dự án
**Laptop World** là hệ thống cửa hàng bán laptop trực tuyến, cung cấp trải nghiệm mua sắm dễ dàng cho người dùng và quản lý hiệu quả cho admin.
Hệ thống tích hợp **AI hỗ trợ người dùng** để gợi ý sản phẩm và trả lời phản hồi thông minh.

### 🔹 Chức năng người dùng:
- Đăng ký / Đăng nhập tài khoản
- Tìm kiếm sản phẩm
- Liên hệ và gửi phản hồi
- Đặt hàng, xuất hóa đơn
- Trợ lý AI hỗ trợ trải nghiệm người dùng

### Chức năng Admin:
- Quản lý cửa hàng: sản phẩm, đơn hàng
- Quản lý người dùng

---

## Công nghệ sử dụng
- **Frontend:** HTML, CSS, JavaScript
- **Framework:** Bootstrap
- **Backend:** NodeJS
- **Database:** MySQL
- **IDE:** VSCode

---


## Cấu trúc thư mục (thực tế hiện tại)
```
f:\\DoAnChuyenNganh\\LaptopWorld
├── .env.example
├── .gitignore
├── app.js                # entrypoint (mới)
├── package.json
├── backend/              # server code (controllers, routes, db helpers)
├── db/                   # SQL dumps (ví dụ: ChuyenNganh.sql)
├── frontend/             # static site (HTML/CSS/JS + Bootstrap)
├── public/               # bản copy ban đầu của frontend (vẫn còn)
├── README.md
├── server.js             # obsolete/deprecated placeholder (vẫn còn file)
└── src/                  # bản copy ban đầu của backend (vẫn còn)
	├── ai.js
	├── db.js
	├── controllers/
	└── routes/
```

Chi tiết cây thư mục (nội dung hiện có trên đĩa):

```
f:\\DoAnChuyenNganh\\LaptopWorld
├── .env.example
├── .gitignore
├── app.js
├── package.json
├── backend
│   ├── ai.js
│   ├── db.js
│   ├── controllers
│   │   └── authController.js
│   └── routes
│       ├── api.js
│       └── auth.js
├── db
│   ├── ChuyenNganh.sql
│   └── IMPORT_DB.md
├── frontend
│   ├── index.html
│   ├── css
│   │   └── styles.css
│   ├── js
│   │   └── main.js
│   └── pages
│       ├── admin.html
│       ├── contact.html
│       ├── invoice.html
│       ├── login.html
│       ├── order.html
│       ├── register.html
│       └── search.html
├── public
│   ├── index.html
│   ├── css
│   │   └── styles.css
│   ├── js
│   │   └── main.js
│   └── pages
│       ├── admin.html
│       ├── contact.html
│       ├── invoice.html
│       ├── login.html
│       ├── order.html
│       ├── register.html
│       └── search.html
├── README.md
├── server.js
└── src
	├── ai.js
	├── db.js
	├── controllers
	│   └── authController.js
	└── routes
		├── api.js
		└── auth.js
```

Ghi chú:
- Hiện tại repository có cả thư mục `src/` và `backend/`, cùng `public/` và `frontend/` — đây là kết quả của lần di chuyển/đổi tên trước đó; nội dung trong `backend/` và `frontend/` là phiên bản được chỉnh sửa gần đây, còn `src/` và `public/` là bản sao cũ.
- `server.js` vẫn tồn tại nhưng đã được đánh dấu `deprecated` (chúng tôi dùng `app.js` làm entrypoint chính).

Nếu bạn muốn sạch sẽ (recommended), tôi có thể giúp:
- Xóa `src/` sau khi chắc chắn `backend/` hoạt động.
- Xóa `public/` sau khi chắc chắn `frontend/` hoạt động.
- Hoặc giữ cả hai nếu bạn muốn phiên bản backup trong repo.

Bạn muốn tôi dọn dẹp những file/ thư mục thừa (xóa `src/` và `public/`, xóa `server.js`) hay giữ nguyên để làm bản backup? 

---

## Cấu trúc thư mục (chi tiết)

Dưới đây là mô tả chi tiết từng thư mục và file quan trọng trong project để người đọc dễ hiểu và dễ thao tác:

- `README.md` : Tệp hướng dẫn chính — chứa mô tả dự án, hướng dẫn cài đặt, và cấu trúc thư mục.
- `app.js` : Entrypoint của ứng dụng (Express). Dùng để khởi động server, mount routes và phục vụ `frontend/`.
- `package.json` : Thông tin project, dependency và script (sử dụng `npm run dev` hoặc `npm start`).

- `backend/` : Mã nguồn phía server (Node.js + Express).
	- `backend/db.js` : helper kết nối MySQL (pool). Sử dụng biến môi trường trong `.env`.
	- `backend/ai.js` : helper/placeholder cho tích hợp AI (sử dụng `OPENAI_API_KEY`).
	- `backend/controllers/` : logic xử lý (ví dụ `authController.js` xử lý đăng ký/đăng nhập).
	- `backend/routes/` : định nghĩa các route REST API (ví dụ `auth.js`, `api.js`).

- `frontend/` : Giao diện tĩnh (HTML, CSS, JS, Bootstrap).
	- `frontend/index.html` : trang chủ.
	- `frontend/pages/` : các trang con (login, register, search, contact, order, invoice, admin).
	- `frontend/css/` và `frontend/js/` : tài nguyên tĩnh.

- `db/` : chỗ để đặt file SQL dump. Hiện tại chứa `ChuyenNganh.sql` (file schema + dữ liệu mẫu có CREATE DATABASE và tạo các bảng).
	- Hướng dẫn import có trong `db/IMPORT_DB.md`.

- `.env.example` : mẫu biến môi trường. Tạo file `.env` ở gốc project và điền thông tin thật:
	- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`, `JWT_SECRET`, `OPENAI_API_KEY`.

- `README`/tài liệu phụ (không bắt buộc): bạn có thể thêm `setup/install_guide.md` hoặc `setup/demo_data/` để lưu hướng dẫn và dữ liệu test.

Ghi chú về tên bảng/tiếng Việt:
- File SQL gốc (`ChuyenNganh.sql`) sử dụng tên bảng tiếng Việt/PascalCase như `user`, `SanPham`, `DonHang`, `ChiTietDonHang`, `LienHe`, `DanhGia`, v.v. Backend đã được điều chỉnh để tương thích với những tên này.

Mẹo nhanh cho người dùng:
- Muốn sửa query hoặc thêm trường hiển thị: mở file trong `backend/controllers/` hoặc `backend/routes/`.
- Muốn thay đổi giao diện: sửa file trong `frontend/pages/` hoặc `frontend/css/`.


## Hướng dẫn cài đặt & chạy (Windows PowerShell)

1) Cài đặt yêu cầu hệ thống: Node.js (v16+), MySQL

2) Import database (file hiện tại nằm ở `db\ChuyenNganh.sql`)

	- Nếu file SQL chứa `CREATE DATABASE` và `USE` (như `ChuyenNganh.sql`), bạn có thể import trực tiếp:

```powershell
mysql -u root -p < "f:\\DoAnChuyenNganh\\LaptopWorld\\db\\ChuyenNganh.sql"
```

	- Hoặc tạo database thủ công rồi import:

```powershell
mysql -u root -p
CREATE DATABASE LaptopWorld CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
mysql -u root -p LaptopWorld < "f:\\DoAnChuyenNganh\\LaptopWorld\\db\\ChuyenNganh.sql"
```

3) Cấu hình môi trường

- Copy `.env.example` -> `.env` và chỉnh các biến sau cho phù hợp:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=LaptopWorld
PORT=3000
JWT_SECRET=change_this
OPENAI_API_KEY=
```

4) Cài dependencies và chạy (dùng `npm` là lệnh chính)

```powershell
cd f:\\DoAnChuyenNganh\\LaptopWorld
npm install
npm run dev   # phát triển (nodemon) — hoặc `npm start` để chạy production
```

5) Mở trình duyệt

- Truy cập `http://localhost:3000`

---

## Kiểm tra nhanh API (ví dụ)

- Đăng ký: `POST /api/auth/register`
  - body JSON: `{ "name":"A", "email":"a@b.com", "password":"pass" }`
- Đăng nhập: `POST /api/auth/login` (trả token JWT)
- Tìm kiếm: `GET /api/search?q=...`
- Gửi liên hệ: `POST /api/contact` body `{ "name":"...", "email":"...", "message":"..." }`

---






