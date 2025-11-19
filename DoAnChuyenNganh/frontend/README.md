# 🖥️ Laptop World - Website Thương Mại Điện Tử

Đồ án xây dựng website bán laptop sử dụng Bootstrap, Node.js và MySQL.

## 📋 Mô Tả Dự Án

Website thương mại điện tử chuyên bán laptop với đầy đủ các chức năng của một cửa hàng trực tuyến hiện đại.

### ✨ Tính Năng Chính

#### 👥 Người Dùng
- **Đăng ký / Đăng nhập**: Tạo tài khoản và quản lý thông tin cá nhân
- **Tìm kiếm**: Tìm kiếm laptop theo tên hoặc thương hiệu
- **Xem sản phẩm**: Chi tiết sản phẩm với thông số kỹ thuật đầy đủ
- **Giỏ hàng**: Thêm, xóa, cập nhật số lượng sản phẩm
- **Đặt hàng**: Thực hiện đặt hàng trực tuyến
- **AI Tư vấn**: Hỗ trợ so sánh và đánh giá sản phẩm bằng AI
- **Liên hệ**: Gửi tin nhắn, bình luận qua email, điện thoại, Zalo

#### 👨‍💼 Admin
- **Dashboard**: Tổng quan thống kê kinh doanh
- **Quản lý sản phẩm**: Thêm, sửa, xóa sản phẩm
- **Quản lý đơn hàng**: Theo dõi và xử lý đơn hàng
- **Quản lý khách hàng**: Quản lý thông tin người dùng
- **Quản lý danh mục**: Phân loại sản phẩm
- **Quản lý đánh giá**: Kiểm duyệt review của khách hàng

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **HTML5**: Cấu trúc trang web
- **CSS3**: Styling và animations
- **Bootstrap 5.3.2**: Framework responsive
- **Bootstrap Icons**: Thư viện icon
- **JavaScript (ES6+)**: Tương tác động

### Backend (Dự kiến)
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **MySQL**: Cơ sở dữ liệu

## 📁 Cấu Trúc Thư Mục

```
LaptopWorld/
│
├── index.html                 # Trang chủ
│
├── components/                # Components tái sử dụng
│   ├── header.html           # Header với navigation
│   ├── footer.html           # Footer
│   └── product-card.html     # Card sản phẩm
│
├── pages/                     # Các trang chính
│   ├── products.html         # Danh sách sản phẩm
│   ├── product-detail.html   # Chi tiết sản phẩm
│   ├── cart.html            # Giỏ hàng
│   ├── login.html           # Đăng nhập
│   ├── register.html        # Đăng ký
│   └── contact.html         # Liên hệ
│
├── admin/                     # Trang quản trị
│   └── admin-dashboard.html  # Dashboard admin
│
├── assets/                    # Tài nguyên tĩnh
│   ├── css/
│   │   ├── style.css        # CSS chính
│   │   └── admin.css        # CSS admin
│   ├── js/
│   │   ├── main.js          # JavaScript chính
│   │   └── admin.js         # JavaScript admin
│   └── images/              # Hình ảnh sản phẩm
│
└── README.md                 # File hướng dẫn này
```

## 🚀 Hướng Dẫn Sử Dụng

### 1. Cài Đặt

```bash
# Clone repository
git clone [repository-url]

# Di chuyển vào thư mục dự án
cd LaptopWorld
```

### 2. Chạy Website

#### Phương pháp 1: Mở trực tiếp
- Mở file `index.html` bằng trình duyệt web

#### Phương pháp 2: Sử dụng Live Server (Khuyên dùng)
- Cài đặt extension "Live Server" trên VS Code
- Click chuột phải vào `index.html` → "Open with Live Server"
- Website sẽ mở tại `http://localhost:5500`

#### Phương pháp 3: Sử dụng Python
```bash
# Python 3
python -m http.server 8000

# Truy cập: http://localhost:8000
```

### 3. Truy Cập Các Trang

- **Trang chủ**: `/index.html`
- **Sản phẩm**: `/pages/products.html`
- **Chi tiết SP**: `/pages/product-detail.html`
- **Giỏ hàng**: `/pages/cart.html`
- **Đăng nhập**: `/pages/login.html`
- **Đăng ký**: `/pages/register.html`
- **Liên hệ**: `/pages/contact.html`
- **Admin**: `/admin/admin-dashboard.html`

## 🎨 Tính Năng Giao Diện

### ✅ Responsive Design
- **Desktop**: Tối ưu cho màn hình lớn
- **Tablet**: Hiển thị tốt trên iPad, Android tablets
- **Mobile**: Thân thiện với điện thoại

### ✅ Components Tái Sử Dụng
- Header với navigation đa cấp
- Footer với thông tin chi tiết
- Product card chuẩn e-commerce
- Form validation UI

### ✅ Hiệu Ứng & Animation
- Hover effects trên sản phẩm
- Smooth scrolling
- Slide transitions
- Loading animations

### ✅ Tính Năng JavaScript
- Shopping cart với LocalStorage
- Dynamic component loading
- Form validation
- Image gallery
- Search functionality
- Filter & sort products

## 📱 Responsive Breakpoints

```css
/* Mobile Small */
< 576px

/* Mobile */
576px - 767px

/* Tablet */
768px - 991px

/* Desktop */
992px - 1199px

/* Large Desktop */
≥ 1200px
```

## 🎯 Các Trang Đã Hoàn Thiện

### Trang Người Dùng
✅ Trang chủ (Homepage)
✅ Danh sách sản phẩm (Products Listing)
✅ Chi tiết sản phẩm (Product Detail)
✅ Giỏ hàng (Shopping Cart)
✅ Đăng nhập (Login)
✅ Đăng ký (Register)
✅ Liên hệ (Contact)

### Trang Quản Trị
✅ Dashboard (Admin Dashboard)
⏳ Quản lý sản phẩm (đang phát triển)
⏳ Quản lý đơn hàng (đang phát triển)
⏳ Quản lý khách hàng (đang phát triển)

## 🔧 Tùy Chỉnh

### Thay Đổi Màu Sắc
Chỉnh sửa trong `assets/css/style.css`:

```css
:root {
    --primary-color: #0d6efd;
    --secondary-color: #6c757d;
    --success-color: #198754;
    --danger-color: #dc3545;
}
```

### Thêm Sản Phẩm Mới
1. Copy template từ `components/product-card.html`
2. Cập nhật thông tin sản phẩm
3. Thêm vào trang mong muốn

## 📝 Lưu Ý

### ⚠️ Giới Hạn Hiện Tại
- **Chỉ giao diện**: Backend chưa được triển khai
- **Dữ liệu tĩnh**: Sản phẩm hiện tại là dữ liệu mẫu
- **AI chưa kết nối**: Chức năng AI là UI mockup
- **Thanh toán**: Chỉ là giao diện, chưa tích hợp thật

### 🔜 Kế Hoạch Phát Triển
1. **Backend với Node.js + Express**
2. **Kết nối MySQL database**
3. **API RESTful**
4. **Authentication & Authorization**
5. **Tích hợp thanh toán**
6. **Tích hợp AI thực tế**
7. **Email notifications**
8. **Upload hình ảnh**

## 🎓 Mục Đích Học Tập

Dự án này được phát triển cho mục đích:
- Rèn luyện kỹ năng phân tích và thiết kế hệ thống
- Học cách xây dựng website thương mại điện tử
- Thực hành Bootstrap framework
- Chuẩn bị cho việc phát triển full-stack

## 👨‍💻 Tác Giả

**Đồ Án Chuyên Ngành**
- Framework: Bootstrap 5
- Backend: Node.js (dự kiến)
- Database: MySQL (dự kiến)

## 📄 License

Dự án này được phát triển cho mục đích học tập và nghiên cứu.

## 📞 Liên Hệ

- **Email**: contact@laptopworld.com
- **Phone**: 0123-456-789
- **Zalo**: 0123-456-789
- **Địa chỉ**: 123 Nguyễn Văn Linh, Quận 7, TP.HCM

---

⭐ **Lưu ý**: Đây là giao diện frontend hoàn chỉnh. Để website hoạt động đầy đủ, cần phát triển thêm phần backend với Node.js và MySQL.
