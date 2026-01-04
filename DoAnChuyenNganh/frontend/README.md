# Laptop World - README

## Hướng dẫn sử dụng

### Mở website

1. Mở file `frontend/index.html` bằng trình duyệt web (Chrome, Firefox, Edge)
2. Hoặc click đúp vào file `index.html` trong thư mục `frontend`

### Các trang có sẵn

1. **Trang chủ** (`index.html`)
   - Hero section với banner chính
   - Tính năng nổi bật
   - Sản phẩm nổi bật
   - Danh mục sản phẩm
   - Đánh giá khách hàng

2. **Trang sản phẩm** (`products.html`)
   - Danh sách tất cả sản phẩm
   - Bộ lọc theo thương hiệu và giá
   - Sắp xếp sản phẩm
   - Tìm kiếm sản phẩm

3. **Chi tiết sản phẩm** (`product-detail.html`)
   - Thông tin chi tiết sản phẩm
   - Thông số kỹ thuật
   - Thêm vào giỏ hàng

4. **Đăng nhập** (`login.html`)
   - Form đăng nhập
   - Demo: nhập email và mật khẩu bất kỳ (ít nhất 6 ký tự)

5. **Đăng ký** (`register.html`)
   - Form đăng ký tài khoản mới
   - Validation form

6. **Giỏ hàng** (`cart.html`)
   - Xem sản phẩm trong giỏ
   - Điều chỉnh số lượng
   - Xóa sản phẩm

7. **Thanh toán** (`checkout.html`)
   - Nhập thông tin giao hàng
   - Chọn phương thức thanh toán
   - Đặt hàng

8. **Liên hệ** (`contact.html`)
   - Form liên hệ
   - Thông tin cửa hàng
   - Bản đồ Google Maps

9. **Tài khoản** (`profile.html`)
   - Thông tin cá nhân
   - Lịch sử đơn hàng
   - Đổi mật khẩu

10. **Admin** (`admin.html`)
    - Dashboard thống kê
    - Quản lý sản phẩm
    - Quản lý đơn hàng
    - Quản lý người dùng

### Tính năng đặc biệt

#### AI Chatbot
- Nút chat nổi ở góc phải dưới màn hình
- Click để mở cửa sổ chat
- Chatbot có thể trả lời các câu hỏi về:
  - Giá sản phẩm
  - Laptop gaming
  - Laptop văn phòng
  - Bảo hành
  - Thanh toán
  - Giao hàng

#### Header và Footer
- Header và Footer được tách thành component riêng
- Tự động load trên mọi trang
- Header có:
  - Logo
  - Menu điều hướng
  - Thanh tìm kiếm
  - Giỏ hàng
  - Menu người dùng

### Demo Data
Website sử dụng dữ liệu mẫu (lưu trong localStorage):
- 6 sản phẩm laptop mẫu
- Giỏ hàng lưu trong localStorage
- Thông tin đăng nhập demo

### Công nghệ sử dụng
- **HTML5** - Cấu trúc trang
- **CSS3** - Styling với custom CSS
- **Bootstrap 5** - Framework responsive
- **JavaScript** - Logic và tương tác
- **Font Awesome** - Icons
- **Google Fonts** - Typography (Inter)

### Lưu ý
- Website hiện tại chỉ là frontend, chưa kết nối backend
- Dữ liệu được lưu tạm trong localStorage
- Để tích hợp đầy đủ, cần:
  - NodeJS backend
  - MySQL database
  - API endpoints
  - Authentication system

### Các bước tiếp theo
1. ✅ Frontend hoàn thành
2. ⏳ Backend với NodeJS
3. ⏳ Kết nối MySQL database
4. ⏳ Tích hợp AI chatbot thực tế
5. ⏳ Deploy website

---

**Developed by:** Nguyen Nhat Truong  
**Year:** 2024
