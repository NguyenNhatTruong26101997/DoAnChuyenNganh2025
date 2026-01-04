// Admin Orders Management
// Quản lý đơn hàng cho admin với validation chặt chẽ

let currentOrders = [];
let currentFilter = '';

// Initialize when orders tab is shown
document.addEventListener('DOMContentLoaded', function() {
    const ordersTab = document.getElementById('orders-tab');
    if (ordersTab) {
        // Listen for both click and shown events
        ordersTab.addEventListener('click', function() {
            console.log('Orders tab clicked');
            setTimeout(() => {
                loadAdminOrders();
            }, 100);
        });
        
        ordersTab.addEventListener('shown.bs.tab', function() {
            console.log('Orders tab shown');
            loadAdminOrders();
        });
    }
});

// Load all orders for admin
async function loadAdminOrders(status = null) {
    try {
        console.log('Loading admin orders...', status);
        
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) {
            console.error('ordersTableBody not found');
            return;
        }

        tbody.innerHTML = '<tr><td colspan="6" class="text-center"><i class="fas fa-spinner fa-spin"></i> Đang tải...</td></tr>';

        let url = '/orders/admin/all';
        if (status && status !== '') {
            url += `?status=${encodeURIComponent(status)}`;
        }

        console.log('Calling API:', url);
        const response = await api.get(url);
        console.log('API response:', response);

        if (response.success && response.data) {
            currentOrders = response.data;
            currentFilter = status || '';
            renderAdminOrders(currentOrders);
            updateOrderStats(currentOrders);
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">
                        <i class="fas fa-exclamation-circle"></i> ${escapeHtml(response.message || 'Không thể tải đơn hàng')}
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Load admin orders error:', error);
        const tbody = document.getElementById('ordersTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">
                        <i class="fas fa-exclamation-circle"></i> Lỗi kết nối đến server
                    </td>
                </tr>
            `;
        }
    }
}

// Render orders table
function renderAdminOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5>Không có đơn hàng nào</h5>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>${escapeHtml(order.MaDonHang)}</strong></td>
            <td>
                <div>${escapeHtml(order.HoTen)}</div>
                <small class="text-muted">${escapeHtml(order.Email)}</small>
            </td>
            <td>${formatDateTime(order.DonHangTao)}</td>
            <td><strong class="text-primary">${formatCurrency(order.TongTien)}</strong></td>
            <td>${getStatusBadge(order.TrangThaiDonHang)}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewOrderDetail(${order.IdDonHang})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${getActionButtons(order)}
                </div>
            </td>
        </tr>
    `).join('');
}

// Get status badge
function getStatusBadge(status) {
    const statusMap = {
        'ChoXuLy': { text: 'Chờ xử lý', class: 'warning' },
        'Cho xu ly': { text: 'Chờ xử lý', class: 'warning' },
        'DaXacNhan': { text: 'Đã xác nhận', class: 'info' },
        'Xac nhan': { text: 'Đã xác nhận', class: 'info' },
        'DangGiao': { text: 'Đang giao', class: 'primary' },
        'Dang giao': { text: 'Đang giao', class: 'primary' },
        'DaGiao': { text: 'Đã giao', class: 'success' },
        'Da giao': { text: 'Đã giao', class: 'success' },
        'DaHuy': { text: 'Đã hủy', class: 'secondary' },
        'Da huy': { text: 'Đã hủy', class: 'secondary' },
        'HoanTien': { text: 'Hoàn tiền', class: 'dark' }
    };

    const info = statusMap[status] || { text: status, class: 'secondary' };
    return `<span class="badge bg-${info.class}">${escapeHtml(info.text)}</span>`;
}

// Get action buttons based on status
function getActionButtons(order) {
    const status = order.TrangThaiDonHang;
    let buttons = '';

    if (status === 'ChoXuLy' || status === 'Cho xu ly') {
        buttons += `
            <button class="btn btn-outline-success" onclick="showUpdateStatusModal(${order.IdDonHang}, 'Xac nhan')" title="Xác nhận">
                <i class="fas fa-check"></i>
            </button>
        `;
    }

    if (status === 'DaXacNhan' || status === 'Xac nhan') {
        buttons += `
            <button class="btn btn-outline-info" onclick="showUpdateStatusModal(${order.IdDonHang}, 'Dang giao')" title="Đang giao">
                <i class="fas fa-shipping-fast"></i>
            </button>
        `;
    }

    if (status === 'DangGiao' || status === 'Dang giao') {
        buttons += `
            <button class="btn btn-outline-success" onclick="showUpdateStatusModal(${order.IdDonHang}, 'Da giao')" title="Đã giao">
                <i class="fas fa-check-circle"></i>
            </button>
        `;
    }

    if (status !== 'DaGiao' && status !== 'Da giao' && status !== 'DaHuy' && status !== 'Da huy' && status !== 'HoanTien') {
        buttons += `
            <button class="btn btn-outline-danger" onclick="adminCancelOrder(${order.IdDonHang})" title="Hủy đơn">
                <i class="fas fa-times"></i>
            </button>
        `;
    }

    return buttons;
}

// View order detail
async function viewOrderDetail(orderId) {
    try {
        // Validate orderId - chống spam
        if (!orderId || isNaN(orderId) || orderId <= 0 || orderId > 2147483647) {
            showNotification('ID đơn hàng không hợp lệ', 'error');
            return;
        }

        const modal = document.getElementById('orderDetailModal');
        const content = document.getElementById('orderDetailContent');
        
        if (!modal || !content) return;

        content.innerHTML = '<p class="text-center"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>';
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        const response = await api.get(`/orders/${orderId}`);

        if (response.success && response.data) {
            showOrderDetailContent(response.data);
        } else {
            content.innerHTML = `<div class="alert alert-danger">${escapeHtml(response.message || 'Không thể tải chi tiết đơn hàng')}</div>`;
        }
    } catch (error) {
        console.error('View order detail error:', error);
        const content = document.getElementById('orderDetailContent');
        if (content) {
            content.innerHTML = '<div class="alert alert-danger">Lỗi kết nối đến server</div>';
        }
    }
}

// Show order detail content
function showOrderDetailContent(order) {
    const content = document.getElementById('orderDetailContent');
    if (!content) return;

    content.innerHTML = `
        <div class="row">
            <!-- Left Column -->
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-body">
                        <h6><i class="fas fa-user"></i> Thông tin khách hàng</h6>
                        <p class="mb-1"><strong>Họ tên:</strong> ${escapeHtml(order.HoTen)}</p>
                        <p class="mb-1"><strong>Email:</strong> ${escapeHtml(order.Email)}</p>
                        <p class="mb-0"><strong>SĐT:</strong> ${escapeHtml(order.SoDienThoai || 'N/A')}</p>
                    </div>
                </div>

                <div class="card mb-3">
                    <div class="card-body">
                        <h6><i class="fas fa-shipping-fast"></i> Thông tin giao hàng</h6>
                        <p class="mb-1"><strong>Người nhận:</strong> ${escapeHtml(order.HoTenNguoiNhan || order.HoTen)}</p>
                        <p class="mb-1"><strong>SĐT:</strong> ${escapeHtml(order.SoDienThoaiNguoiNhan || order.SoDienThoai || 'N/A')}</p>
                        <p class="mb-1"><strong>Email:</strong> ${escapeHtml(order.EmailNguoiNhan || order.Email)}</p>
                        <p class="mb-0"><strong>Địa chỉ:</strong> ${escapeHtml(order.DiaChiGiaoHang || order.DiaChiGiao || 'N/A')}</p>
                        ${order.GhiChu ? `<p class="mt-2 mb-0"><strong>Ghi chú:</strong> <em>${escapeHtml(order.GhiChu)}</em></p>` : ''}
                    </div>
                </div>
            </div>

            <!-- Right Column -->
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-body">
                        <h6><i class="fas fa-info-circle"></i> Thông tin đơn hàng</h6>
                        <p class="mb-1"><strong>Mã đơn:</strong> ${escapeHtml(order.MaDonHang)}</p>
                        <p class="mb-1"><strong>Trạng thái:</strong> ${getStatusBadge(order.TrangThai)}</p>
                        <p class="mb-1"><strong>Ngày đặt:</strong> ${formatDateTime(order.ThoiDiemTao)}</p>
                        <p class="mb-0"><strong>Tổng tiền:</strong> <span class="text-primary fs-5">${formatCurrency(order.TongTien)}</span></p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Order Items -->
        <div class="card mt-3">
            <div class="card-body">
                <h6><i class="fas fa-box"></i> Sản phẩm</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th class="text-center">Số lượng</th>
                                <th class="text-end">Đơn giá</th>
                                <th class="text-end">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${escapeHtml(item.TenSanPham)}</td>
                                    <td class="text-center">${parseInt(item.SoLuong)}</td>
                                    <td class="text-end">${formatCurrency(item.GiaBan)}</td>
                                    <td class="text-end">${formatCurrency(item.GiaBan * item.SoLuong)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-end"><strong>Tổng cộng:</strong></td>
                                <td class="text-end"><strong class="text-primary">${formatCurrency(order.TongTien)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Show update status modal
function showUpdateStatusModal(orderId, suggestedStatus) {
    // Validate orderId - chống spam
    if (!orderId || isNaN(orderId) || orderId <= 0 || orderId > 2147483647) {
        showNotification('ID đơn hàng không hợp lệ', 'error');
        return;
    }

    const modal = document.getElementById('updateOrderStatusModal');
    const orderIdInput = document.getElementById('updateOrderId');
    const statusSelect = document.getElementById('updateOrderStatus');
    const orderInfo = document.getElementById('updateOrderInfo');

    if (!modal || !orderIdInput || !statusSelect || !orderInfo) return;

    // Find order
    const order = currentOrders.find(o => o.IdDonHang === orderId);
    if (!order) {
        showNotification('Không tìm thấy đơn hàng', 'error');
        return;
    }

    orderIdInput.value = orderId;
    statusSelect.value = suggestedStatus || '';
    orderInfo.innerHTML = `
        <strong>Đơn hàng:</strong> ${escapeHtml(order.MaDonHang)}<br>
        <strong>Khách hàng:</strong> ${escapeHtml(order.HoTen)}<br>
        <strong>Trạng thái hiện tại:</strong> ${getStatusBadge(order.TrangThaiDonHang)}
    `;

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Submit update order status
async function submitUpdateOrderStatus(event) {
    event.preventDefault();

    const orderId = document.getElementById('updateOrderId').value;
    const newStatus = document.getElementById('updateOrderStatus').value;

    // Validate inputs - chống spam
    if (!orderId || isNaN(orderId) || orderId <= 0 || orderId > 2147483647) {
        showNotification('ID đơn hàng không hợp lệ', 'error');
        return;
    }

    const validStatuses = ['Cho xu ly', 'Xac nhan', 'Dang giao', 'Da giao', 'Da huy', 'HoanTien'];
    if (!validStatuses.includes(newStatus)) {
        showNotification('Trạng thái không hợp lệ', 'error');
        return;
    }

    try {
        const response = await api.put(`/orders/${orderId}/status`, {
            trangThaiDonHang: newStatus
        });

        if (response.success) {
            showNotification('Cập nhật trạng thái thành công', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('updateOrderStatusModal'));
            if (modal) modal.hide();
            
            // Reload orders
            loadAdminOrders(currentFilter);
        } else {
            showNotification(response.message || 'Không thể cập nhật trạng thái', 'error');
        }
    } catch (error) {
        console.error('Update order status error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

// Admin cancel order
async function adminCancelOrder(orderId) {
    // Validate orderId - chống spam
    if (!orderId || isNaN(orderId) || orderId <= 0 || orderId > 2147483647) {
        showNotification('ID đơn hàng không hợp lệ', 'error');
        return;
    }

    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?\n\nNếu đơn hàng đã thanh toán online, hệ thống sẽ đánh dấu cần hoàn tiền.')) {
        return;
    }

    try {
        const response = await api.put(`/orders/${orderId}/cancel`, {});

        if (response.success) {
            showNotification(response.message || 'Hủy đơn hàng thành công', 'success');
            loadAdminOrders(currentFilter);
        } else {
            showNotification(response.message || 'Không thể hủy đơn hàng', 'error');
        }
    } catch (error) {
        console.error('Admin cancel order error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

// Update order stats
function updateOrderStats(orders) {
    const stats = {
        choXuLy: orders.filter(o => o.TrangThaiDonHang === 'ChoXuLy' || o.TrangThaiDonHang === 'Cho xu ly').length,
        dangGiao: orders.filter(o => o.TrangThaiDonHang === 'DangGiao' || o.TrangThaiDonHang === 'Dang giao' || o.TrangThaiDonHang === 'DaXacNhan' || o.TrangThaiDonHang === 'Xac nhan').length,
        daGiao: orders.filter(o => o.TrangThaiDonHang === 'DaGiao' || o.TrangThaiDonHang === 'Da giao').length,
        daHuy: orders.filter(o => o.TrangThaiDonHang === 'DaHuy' || o.TrangThaiDonHang === 'Da huy' || o.TrangThaiDonHang === 'HoanTien').length
    };

    // Update stats cards
    const choXuLyEl = document.getElementById('orderStatsChoXuLy');
    const dangGiaoEl = document.getElementById('orderStatsDangGiao');
    const daGiaoEl = document.getElementById('orderStatsDaGiao');
    const daHuyEl = document.getElementById('orderStatsDaHuy');

    if (choXuLyEl) choXuLyEl.textContent = stats.choXuLy;
    if (dangGiaoEl) dangGiaoEl.textContent = stats.dangGiao;
    if (daGiaoEl) daGiaoEl.textContent = stats.daGiao;
    if (daHuyEl) daHuyEl.textContent = stats.daHuy;
}

// Filter orders
function filterOrders() {
    const status = document.getElementById('orderStatusFilter')?.value || '';
    const searchText = document.getElementById('orderSearchInput')?.value?.trim() || '';

    // Validate search text - chống spam
    if (searchText.length > 100) {
        showNotification('Từ khóa tìm kiếm quá dài', 'error');
        return;
    }

    let filtered = currentOrders;

    // Filter by status
    if (status) {
        filtered = filtered.filter(o => o.TrangThaiDonHang === status);
    }

    // Filter by search text
    if (searchText) {
        const lowerSearch = searchText.toLowerCase();
        filtered = filtered.filter(o => 
            o.MaDonHang.toLowerCase().includes(lowerSearch) ||
            o.HoTen.toLowerCase().includes(lowerSearch) ||
            o.Email.toLowerCase().includes(lowerSearch)
        );
    }

    renderAdminOrders(filtered);
}

// Escape HTML to prevent XSS - QUAN TRỌNG chống spam
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// Format date time
function formatDateTime(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return '';
    }
}
