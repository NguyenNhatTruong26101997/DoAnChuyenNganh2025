// Profile Management
// Requires: api.js loaded first

let currentUser = null;

// Load user profile on page load
document.addEventListener('DOMContentLoaded', async function () {
    await loadUserProfile();
});

// Load user profile from API
async function loadUserProfile() {
    try {
        const result = await api.get('/users/profile');

        if (result.success) {
            currentUser = result.data;
            displayUserProfile(currentUser);
        } else {
            showNotification('Không thể tải thông tin người dùng', 'error');
            // Redirect to login if not authenticated
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Load profile error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}

// Display user profile
function displayUserProfile(user) {
    // Sidebar - only show name
    document.getElementById('userName').textContent = user.HoTen || 'Người dùng';
    
    // Avatar
    const avatarImg = document.getElementById('userAvatar');
    if (user.AnhDaiDien) {
        avatarImg.src = 'http://localhost:3000' + user.AnhDaiDien;
    } else {
        avatarImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23007bff" width="80" height="80"/%3E%3Ctext fill="%23fff" font-size="40" font-family="Arial" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E' + (user.HoTen ? user.HoTen.charAt(0).toUpperCase() : 'U') + '%3C/text%3E%3C/svg%3E';
    }

    // Profile form - always use fresh data from server
    document.getElementById('profileName').value = user.HoTen || '';
    document.getElementById('profilePhone').value = user.SoDienThoai || '';
    document.getElementById('profileEmail').value = user.Email || '';
    document.getElementById('profileAddress').value = user.DiaChi || '';
    
    // Update localStorage with fresh data from server
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    localUser.hoTen = user.HoTen;
    localUser.HoTen = user.HoTen;
    localUser.email = user.Email;
    localUser.Email = user.Email;
    localUser.soDienThoai = user.SoDienThoai;
    localUser.SoDienThoai = user.SoDienThoai;
    localUser.diaChi = user.DiaChi;
    localUser.DiaChi = user.DiaChi;
    localUser.anhDaiDien = user.AnhDaiDien;
    localUser.AnhDaiDien = user.AnhDaiDien;
    localStorage.setItem('user', JSON.stringify(localUser));
}

// Upload avatar
async function uploadAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Vui lòng chọn file ảnh', 'error');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Kích thước ảnh không được vượt quá 5MB', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        showNotification('Đang tải ảnh lên...', 'info');

        const response = await fetch('http://localhost:3000/api/users/profile/avatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Tải ảnh đại diện thành công!', 'success');
            
            // Update avatar display
            const avatarImg = document.getElementById('userAvatar');
            avatarImg.src = 'http://localhost:3000' + result.data.anhDaiDien;
            
            // Reload profile
            await loadUserProfile();
        } else {
            showNotification(result.message || 'Tải ảnh thất bại', 'error');
        }
    } catch (error) {
        console.error('Upload avatar error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

// Update profile
async function updateProfile(event) {
    event.preventDefault();

    const hoTen = document.getElementById('profileName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const soDienThoai = document.getElementById('profilePhone').value.trim();
    const diaChi = document.getElementById('profileAddress').value.trim();

    // Validate họ tên
    if (!hoTen) {
        showNotification('Vui lòng nhập họ tên', 'error');
        return;
    }

    if (hoTen.length < 2 || hoTen.length > 100) {
        showNotification('Họ tên phải từ 2-100 ký tự', 'error');
        return;
    }

    // Validate email
    if (!email) {
        showNotification('Vui lòng nhập email', 'error');
        return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        showNotification('Email không hợp lệ. Vui lòng nhập đúng định dạng (vd: example@gmail.com)', 'error');
        return;
    }

    // Validate số điện thoại (nếu có nhập)
    if (soDienThoai) {
        // Chỉ cho phép số và có độ dài 10-11 số
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(soDienThoai)) {
            showNotification('Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số', 'error');
            return;
        }

        // Kiểm tra số điện thoại Việt Nam (bắt đầu bằng 0)
        if (!soDienThoai.startsWith('0')) {
            showNotification('Số điện thoại phải bắt đầu bằng số 0', 'error');
            return;
        }

        // Kiểm tra đầu số hợp lệ của Việt Nam
        const validPrefixes = ['03', '05', '07', '08', '09'];
        const prefix = soDienThoai.substring(0, 2);
        if (!validPrefixes.includes(prefix)) {
            showNotification('Đầu số điện thoại không hợp lệ. Vui lòng nhập đầu số: 03, 05, 07, 08, 09', 'error');
            return;
        }
    }

    // Validate địa chỉ (nếu có nhập)
    if (diaChi && diaChi.length > 500) {
        showNotification('Địa chỉ quá dài (tối đa 500 ký tự)', 'error');
        return;
    }

    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

    try {
        const result = await api.put('/users/profile', {
            hoTen,
            email,
            soDienThoai,
            diaChi
        });

        if (result.success) {
            showNotification('Cập nhật thông tin thành công!', 'success');
            
            // Update current user object
            currentUser = result.data;
            
            // Update localStorage user info
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            user.hoTen = result.data.HoTen;
            user.HoTen = result.data.HoTen;
            user.email = result.data.Email;
            user.Email = result.data.Email;
            user.soDienThoai = result.data.SoDienThoai;
            user.SoDienThoai = result.data.SoDienThoai;
            user.diaChi = result.data.DiaChi;
            user.DiaChi = result.data.DiaChi;
            localStorage.setItem('user', JSON.stringify(user));

            // Update sidebar display immediately
            document.getElementById('userName').textContent = result.data.HoTen || 'Người dùng';
            
            // Update header
            if (typeof updateUserMenu === 'function') {
                updateUserMenu();
            }
        } else {
            showNotification(result.message || 'Cập nhật thất bại', 'error');
        }
    } catch (error) {
        console.error('Update profile error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-save"></i> Lưu thay đổi';
    }
}

// Change password
async function changePassword(event) {
    event.preventDefault();

    const matKhauCu = document.getElementById('currentPassword').value;
    const matKhauMoi = document.getElementById('newPassword').value;
    const xacNhanMatKhau = document.getElementById('confirmPassword').value;

    // Validation
    if (!matKhauCu || !matKhauMoi || !xacNhanMatKhau) {
        showNotification('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }

    if (matKhauMoi.length < 6 || matKhauMoi.length > 12) {
        showNotification('Mật khẩu mới phải có từ 6-12 ký tự', 'error');
        return;
    }

    if (matKhauMoi !== xacNhanMatKhau) {
        showNotification('Mật khẩu xác nhận không khớp', 'error');
        return;
    }

    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

    try {
        const result = await api.put('/auth/change-password', {
            matKhauCu,
            matKhauMoi
        });

        if (result.success) {
            showNotification('Đổi mật khẩu thành công!', 'success');
            
            // Reset form
            document.getElementById('passwordForm').reset();
        } else {
            showNotification(result.message || 'Đổi mật khẩu thất bại', 'error');
        }
    } catch (error) {
        console.error('Change password error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-check"></i> Đổi mật khẩu';
    }
}

// Show section
function showSection(section, event) {
    event.preventDefault();

    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');

    // Show selected section
    document.getElementById(section + '-section').style.display = 'block';

    // Update active menu item
    document.querySelectorAll('.list-group-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.list-group-item').classList.add('active');
}
