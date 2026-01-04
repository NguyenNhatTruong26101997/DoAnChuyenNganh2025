# LaptopWorld Backend API

Backend REST API cho website bán laptop được xây dựng với Node.js, Express, và MySQL.

## Yêu cầu hệ thống

- Node.js (v14 trở lên)
- MySQL (v5.7 trở lên)
- npm hoặc yarn

## Cài đặt

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình database

Tạo database bằng cách chạy file SQL:

```bash
# Trong MySQL
mysql -u root -p < ../ChuyenNganh.sql
```

### 3. Cấu hình môi trường

Sao chép file `.env.example` thành `.env`:

```bash
copy .env.example .env
```

Sau đó chỉnh sửa file `.env` với thông tin database của bạn:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=LaptopWorld
DB_PORT=3306

# JWT Configuration (Đổi secret key cho production)
JWT_SECRET=laptopworld-secret-key-2024-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://127.0.0.1:5500
```

## Chạy server

### Development mode (với nodemon)

```bash
npm run dev
```

### Production mode

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin user (cần token)
- `PUT /api/auth/profile` - Cập nhật thông tin user (cần token)

### Products (`/api/products`)
- `GET /api/products` - Lấy danh sách sản phẩm (với filter, pagination)
- `GET /api/products/:id` - Chi tiết sản phẩm
- `GET /api/products/search?q=keyword` - Tìm kiếm sản phẩm
- `POST /api/products` - Thêm sản phẩm (admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (admin)

### Categories (`/api/categories`)
- `GET /api/categories` - Lấy danh sách danh mục
- `POST /api/categories` - Thêm danh mục (admin)
- `PUT /api/categories/:id` - Cập nhật danh mục (admin)
- `DELETE /api/categories/:id` - Xóa danh mục (admin)

### Brands (`/api/brands`)
- `GET /api/brands` - Lấy danh sách thương hiệu
- `POST /api/brands` - Thêm thương hiệu (admin)
- `PUT /api/brands/:id` - Cập nhật thương hiệu (admin)
- `DELETE /api/brands/:id` - Xóa thương hiệu (admin)

### Cart (`/api/cart`)
- `GET /api/cart` - Lấy giỏ hàng (cần token)
- `POST /api/cart/add` - Thêm vào giỏ hàng (cần token)
- `PUT /api/cart/update/:itemId` - Cập nhật số lượng (cần token)
- `DELETE /api/cart/remove/:itemId` - Xóa khỏi giỏ hàng (cần token)
- `DELETE /api/cart/clear` - Xóa toàn bộ giỏ hàng (cần token)

### Orders (`/api/orders`)
- `POST /api/orders` - Tạo đơn hàng (cần token)
- `GET /api/orders` - Lấy đơn hàng của user (cần token)
- `GET /api/orders/:id` - Chi tiết đơn hàng (cần token)
- `PUT /api/orders/:id/cancel` - Hủy đơn hàng (cần token)
- `GET /api/orders/admin/all` - Lấy tất cả đơn hàng (admin)
- `PUT /api/orders/:id/status` - Cập nhật trạng thái (admin)

### Reviews (`/api/reviews`)
- `GET /api/reviews/product/:productId` - Lấy đánh giá của sản phẩm
- `POST /api/reviews` - Tạo đánh giá (cần token)
- `PUT /api/reviews/:id` - Cập nhật đánh giá (cần token)
- `DELETE /api/reviews/:id` - Xóa đánh giá (cần token hoặc admin)

### Contact (`/api/contact`)
- `POST /api/contact` - Gửi liên hệ
- `GET /api/contact/admin/all` - Xem tất cả liên hệ (admin)
- `PUT /api/contact/:id/status` - Cập nhật trạng thái (admin)

## Authentication

API sử dụng JWT (JSON Web Token) cho authentication. Để sử dụng các endpoint yêu cầu authentication:

1. Đăng nhập qua `/api/auth/login`
2. Lấy token từ response
3. Thêm token vào header của các request tiếp theo:

```
Authorization: Bearer <your-token-here>
```

## Response Format

Tất cả response đều có format:

```json
{
  "success": true/false,
  "message": "Message here",
  "data": { ... }
}
```

## Error Handling

API trả về các HTTP status code:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Cấu trúc thư mục

```
backend/
├── config/
│   └── database.js          # Cấu hình MySQL
├── controllers/             # Business logic
│   ├── authController.js
│   ├── productController.js
│   ├── categoryController.js
│   ├── brandController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── reviewController.js
│   └── contactController.js
├── middleware/
│   ├── auth.js             # JWT verification
│   └── errorHandler.js     # Error handling
├── routes/                 # API routes
│   ├── auth.js
│   ├── products.js
│   ├── categories.js
│   ├── brands.js
│   ├── cart.js
│   ├── orders.js
│   ├── reviews.js
│   └── contact.js
├── utils/
│   └── helpers.js         # Utility functions
├── .env                   # Environment variables (không commit)
├── .env.example           # Environment template
├── .gitignore
├── package.json
└── server.js              # Entry point
```

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG:**

1. **Đổi JWT_SECRET trong production**: Secret key mặc định chỉ dùng cho development
2. **Đổi mật khẩu admin**: Mật khẩu mặc định ('123') cần được đổi ngay
3. **Sử dụng HTTPS trong production**
4. **Không commit file .env** lên git

## Testing

Bạn có thể test API bằng:
- Postman
- Thunder Client (VS Code extension)
- curl
- Frontend application

Example test với curl:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"hoTen":"Test User","email":"test@example.com","matKhau":"123456"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","matKhau":"123456"}'
```

## Hỗ trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. MySQL đã chạy chưa
2. Database đã được tạo chưa
3. File .env đã được cấu hình đúng chưa
4. Dependencies đã được cài đặt chưa (`npm install`)
