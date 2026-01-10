// Admin User Management
// Requires: api.js loaded first

let usersData = [];
let currentPage = 1;
const usersPerPage = 10;

// Load all users
async function loadUsers(page = 1, filters = {}) {
    try {
        currentPage = page;
        const params = new URLSearchParams({
            page,
            limit: usersPerPage,
            ...filters
        });

        const result = await api.get(`/users?${params}`);

        if (result.success) {
            usersData = result.data.users;
            displayUsers(usersData);
            displayUsersPagination(result.data.pagination);
        } else {
            // Check if it's an authentication error
            if (result.message && (result.message.includes('token') || result.message.includes('Authorization'))) {
                showNotification('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showNotification(result.message || 'Lỗi khi tải danh sách người dùng', 'error');
            }
        }
    } catch (error) {
        console.error('Load users error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');

    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Không có người dùng nào</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.IdUser}</td>
            <td>${user.HoTen}</td>
            <td>${user.Email}</td>
            <td>${user.SoDienThoai || 'N/A'}</td>
            <td>
                <span class="badge ${user.VaiTro === 'admin' ? 'bg-danger' : 'bg-primary'}">
                    ${user.VaiTro === 'admin' ? 'Admin' : 'Khách hàng'}
                </span>
            </td>
            <td>
                <span class="badge ${user.TrangThai === 1 ? 'bg-success' : 'bg-secondary'}">
                    ${user.TrangThai === 1 ? 'Hoạt động' : 'Bị khóa'}
                </span>
            </td>
            <td>${formatDate(user.ThoiDiemTao)}</td>
            <td>
                <button class="btn btn-sm btn-outline-info" onclick="viewUserDetails(${user.IdUser})" title="Xem chi tiết">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary" onclick="editUser(${user.IdUser})" title="Sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" onclick="showResetPasswordModal(${user.IdUser}, '${user.HoTen}')" title="Đặt lại mật khẩu">
                    <i class="fas fa-key"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="toggleUserStatus(${user.IdUser})" title="${user.TrangThai === 1 ? 'Khóa' : 'Mở khóa'}">
                    <i class="fas fa-${user.TrangThai === 1 ? 'lock' : 'unlock'}"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.IdUser})" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Display pagination
function displayUsersPagination(pagination) {
    const container = document.getElementById('usersPagination');
    if (!container) return;

    if (pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<nav><ul class="pagination justify-content-center">';

    // Previous button
    html += `
        <li class="page-item ${pagination.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadUsers(${pagination.currentPage - 1}); return false;">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;

    // Page numbers
    for (let i = 1; i <= pagination.totalPages; i++) {
        if (
            i === 1 ||
            i === pagination.totalPages ||
            (i >= pagination.currentPage - 2 && i <= pagination.currentPage + 2)
        ) {
            html += `
                <li class="page-item ${i === pagination.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="loadUsers(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === pagination.currentPage - 3 || i === pagination.currentPage + 3) {
            html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }

    // Next button
    html += `
        <li class="page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadUsers(${pagination.currentPage + 1}); return false;">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;

    html += '</ul></nav>';
    container.innerHTML = html;
}

// Show add user modal
function showAddUserModal() {
    // Reset form
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userModalTitle').textContent = 'Thêm Người Dùng';
    document.getElementById('userPasswordGroup').style.display = 'block';
    document.getElementById('userPassword').required = true;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('userModal'));
    modal.show();
}

// Edit user
async function editUser(userId) {
    try {
        const result = await api.get(`/users/${userId}`);

        if (result.success) {
            const user = result.data.user;

            // Fill form
            document.getElementById('userId').value = user.IdUser;
            document.getElementById('userName').value = user.HoTen;
            document.getElementById('userEmail').value = user.Email;
            document.getElementById('userPhone').value = user.SoDienThoai || '';
            document.getElementById('userRole').value = user.VaiTro;
            document.getElementById('userStatus').checked = user.TrangThai === 1;

            // Hide password field for edit
            document.getElementById('userPasswordGroup').style.display = 'none';
            document.getElementById('userPassword').required = false;

            document.getElementById('userModalTitle').textContent = 'Sửa Người Dùng';

            const modal = new bootstrap.Modal(document.getElementById('userModal'));
            modal.show();
        } else {
            showNotification(result.message || 'Không tìm thấy người dùng', 'error');
        }
    } catch (error) {
        console.error('Edit user error:', error);
        showNotification('Lỗi khi tải thông tin người dùng', 'error');
    }
}

// View user details with statistics
async function viewUserDetails(userId) {
    try {
        const result = await api.get(`/users/${userId}`);

        if (result.success) {
            const { user, statistics } = result.data;

            // Fill modal
            document.getElementById('detailUserName').textContent = user.HoTen;
            document.getElementById('detailUserEmail').textContent = user.Email;
            document.getElementById('detailUserPhone').textContent = user.SoDienThoai || 'N/A';
            document.getElementById('detailUserRole').innerHTML = `
                <span class="badge ${user.VaiTro === 'admin' ? 'bg-danger' : 'bg-primary'}">
                    ${user.VaiTro === 'admin' ? 'Admin' : 'Khách hàng'}
                </span>
            `;
            document.getElementById('detailUserStatus').innerHTML = `
                <span class="badge ${user.TrangThai === 1 ? 'bg-success' : 'bg-secondary'}">
                    ${user.TrangThai === 1 ? 'Hoạt động' : 'Bị khóa'}
                </span>
            `;
            document.getElementById('detailUserCreated').textContent = formatDate(user.ThoiDiemTao);
            document.getElementById('detailUserUpdated').textContent = formatDate(user.CapNhat);

            // Statistics
            document.getElementById('detailTotalOrders').textContent = statistics.totalOrders;
            document.getElementById('detailTotalSpent').textContent = formatCurrency(statistics.totalSpent || 0);
            document.getElementById('detailTotalReviews').textContent = statistics.totalReviews;

            const modal = new bootstrap.Modal(document.getElementById('userDetailModal'));
            modal.show();
        } else {
            showNotification(result.message || 'Không tìm thấy người dùng', 'error');
        }
    } catch (error) {
        console.error('View user details error:', error);
        showNotification('Lỗi khi tải thông tin người dùng', 'error');
    }
}

// Save user (create or update)
async function saveUser(event) {
    event.preventDefault();

    const userId = document.getElementById('userId').value;
    const hoTen = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const soDienThoai = document.getElementById('userPhone').value;
    const vaiTro = document.getElementById('userRole').value;
    const trangThai = document.getElementById('userStatus').checked ? 1 : 0;
    const matKhau = document.getElementById('userPassword').value;

    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

    try {
        let result;

        if (userId) {
            // Update existing user
            const data = { hoTen, email, soDienThoai, vaiTro, trangThai };
            result = await api.put(`/users/${userId}`, data);
        } else {
            // Create new user
            if (!matKhau) {
                showNotification('Vui lòng nhập mật khẩu', 'error');
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-save"></i> Lưu';
                return;
            }
            const data = { hoTen, email, matKhau, soDienThoai, vaiTro };
            result = await api.post('/users', data);
        }

        if (result.success) {
            showNotification(result.message || 'Lưu thành công', 'success');
            bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
            loadUsers(currentPage);
            
            // Reload dashboard if function exists
            if (typeof reloadAdminDashboard === 'function') {
                reloadAdminDashboard();
            }
        } else {
            showNotification(result.message || 'Lưu thất bại', 'error');
        }
    } catch (error) {
        console.error('Save user error:', error);
        showNotification('Lỗi khi lưu người dùng', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-save"></i> Lưu';
    }
}

// Toggle user status
async function toggleUserStatus(userId) {
    if (!confirm('Bạn có chắc muốn thay đổi trạng thái người dùng này?')) return;

    try {
        const result = await api.patch(`/users/${userId}/toggle-status`);

        if (result.success) {
            showNotification(result.message, 'success');
            loadUsers(currentPage);
        } else {
            showNotification(result.message || 'Thay đổi trạng thái thất bại', 'error');
        }
    } catch (error) {
        console.error('Toggle status error:', error);
        showNotification('Lỗi khi thay đổi trạng thái', 'error');
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác!')) return;

    try {
        const result = await api.delete(`/users/${userId}`);

        if (result.success) {
            showNotification(result.message, 'success');
            loadUsers(currentPage);
            
            // Reload dashboard if function exists
            if (typeof reloadAdminDashboard === 'function') {
                reloadAdminDashboard();
            }
        } else {
            showNotification(result.message || 'Xóa người dùng thất bại', 'error');
        }
    } catch (error) {
        console.error('Delete user error:', error);
        showNotification('Lỗi khi xóa người dùng', 'error');
    }
}

// Search users
function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value;
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (roleFilter) filters.vaiTro = roleFilter;
    if (statusFilter !== '') filters.trangThai = statusFilter;

    loadUsers(1, filters);
}

// Format date helper
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show reset password modal
function showResetPasswordModal(userId, userName) {
    document.getElementById('resetPasswordUserId').value = userId;
    document.getElementById('resetPasswordUserName').textContent = userName;
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    
    new bootstrap.Modal(document.getElementById('resetPasswordModal')).show();
}

// Reset user password
async function resetUserPassword(event) {
    event.preventDefault();
    
    const userId = document.getElementById('resetPasswordUserId').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (newPassword.length < 6) {
        showNotification('Mật khẩu phải có ít nhất 6 ký tự', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp', 'error');
        return;
    }
    
    try {
        const result = await api.put(`/users/${userId}/reset-password`, { matKhau: newPassword });
        
        if (result.success) {
            showNotification('Đặt lại mật khẩu thành công', 'success');
            bootstrap.Modal.getInstance(document.getElementById('resetPasswordModal')).hide();
        } else {
            showNotification(result.message || 'Đặt lại mật khẩu thất bại', 'error');
        }
    } catch (error) {
        console.error('Reset password error:', error);
        showNotification('Lỗi khi đặt lại mật khẩu', 'error');
    }
}

// Initialize when tab is clicked
document.addEventListener('DOMContentLoaded', function () {
    const usersTab = document.getElementById('users-tab');
    if (usersTab) {
        usersTab.addEventListener('shown.bs.tab', function () {
            loadUsers(1);
        });
    }
});
