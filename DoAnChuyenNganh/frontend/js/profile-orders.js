// Profile Orders Management
// Quản lý đơn hàng trong trang profile

let allOrders = []; // Store all orders for filtering

// Load user orders
async function loadUserOrders() {
    try {
        const ordersContainer = document.getElementById('ordersContainer');
        ordersContainer.innerHTML = '<div class="text-center py-5"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';

        const response = await api.get('/orders');

        if (response.success && response.data) {
            allOrders = response.data; // Store all orders
            
            if (allOrders.length === 0) {
                ordersContainer.innerHTML = `
                    <div class="text-center py-5">
                        <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                        <h5>Chưa có đơn hàng nào</h5>
                        <p class="text-muted">Hãy mua sắm ngay!</p>
                        <a href="products.html" class="btn btn-primary">Xem sản phẩm</a>
                    </div>
                `;
                return;
            }

            // Apply filters if any
            applyFilters();
        } else {
            ordersContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i> ${response.message || 'Không thể tải đơn hàng'}
                </div>
            `;
        }
    } catch (error) {
        console.error('Load orders error:', error);
        document.getElementById('ordersContainer').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> Lỗi kết nối đến server
            </div>
        `;
    }
}

// Apply filters
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const fromDate = document.getElementById('fromDateFilter')?.value || '';
    const toDate = document.getElementById('toDateFilter')?.value || '';

    let filteredOrders = [...allOrders];

    // Filter by status
    if (statusFilter) {
        filteredOrders = filteredOrders.filter(order => order.TrangThai === statusFilter);
    }

    // Filter by date range
    if (fromDate) {
        const fromDateTime = new Date(fromDate).setHours(0, 0, 0, 0);
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.ThoiDiemTao).setHours(0, 0, 0, 0);
            return orderDate >= fromDateTime;
        });
    }

    if (toDate) {
        const toDateTime = new Date(toDate).setHours(23, 59, 59, 999);
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.ThoiDiemTao).getTime();
            return orderDate <= toDateTime;
        });
    }

    // Display filtered orders
    displayOrders(filteredOrders);

    // Update result count
    const resultCount = document.getElementById('filterResultCount');
    if (resultCount) {
        if (statusFilter || fromDate || toDate) {
            resultCount.textContent = `Hiển thị ${filteredOrders.length}/${allOrders.length} đơn hàng`;
        } else {
            resultCount.textContent = '';
        }
    }
}

// Clear filters
function clearFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const fromDateFilter = document.getElementById('fromDateFilter');
    const toDateFilter = document.getElementById('toDateFilter');
    
    if (statusFilter) statusFilter.value = '';
    if (fromDateFilter) fromDateFilter.value = '';
    if (toDateFilter) toDateFilter.value = '';
    
    applyFilters();
}

// Display orders
function displayOrders(orders) {
    const ordersContainer = document.getElementById('ordersContainer');
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5>Không tìm thấy đơn hàng</h5>
                <p class="text-muted">Thử thay đổi bộ lọc</p>
            </div>
        `;
        return;
    }

    ordersContainer.innerHTML = orders.map(order => createOrderCard(order)).join('');
}

// Create order card HTML
function createOrderCard(order) {
    const statusInfo = getOrderStatusInfo(order.TrangThai);
    const canCancel = canCancelOrder(order);
    const canDelete = canDeleteOrder(order);
    const paymentMethodText = getPaymentMethodText(order.PhuongThucThanhToan);

    return `
        <div class="card mb-3 order-card">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <div class="d-flex align-items-center mb-2">
                            <h5 class="mb-0 me-3">
                                <i class="fas fa-receipt"></i> ${escapeHtml(order.MaDonHang)}
                            </h5>
                            <span class="badge ${statusInfo.class}">${statusInfo.text}</span>
                        </div>
                        <p class="text-muted mb-2">
                            <i class="fas fa-calendar"></i> ${formatDateTime(order.ThoiDiemTao)}
                        </p>
                        <p class="mb-2">
                            <i class="fas fa-box"></i> ${order.SoLuongSanPham} sản phẩm
                        </p>
                        <p class="mb-2">
                            <i class="fas fa-credit-card"></i> ${paymentMethodText}
                        </p>
                        <p class="mb-0">
                            <i class="fas fa-map-marker-alt"></i> ${escapeHtml(order.DiaChiGiaoHang || 'Chưa có địa chỉ')}
                        </p>
                    </div>
                    <div class="col-md-4 text-md-end">
                        <h4 class="text-primary mb-3">${formatCurrency(order.TongTien)}</h4>
                        <div class="d-grid gap-2">
                            <button class="btn btn-outline-primary btn-sm" onclick="viewOrderDetail(${order.IdDonHang})">
                                <i class="fas fa-eye"></i> Chi tiết
                            </button>
                            ${canCancel ? `
                                <button class="btn btn-outline-danger btn-sm" onclick="confirmCancelOrder(${order.IdDonHang}, '${escapeHtml(order.MaDonHang)}')">
                                    <i class="fas fa-times-circle"></i> Hủy đơn
                                </button>
                            ` : ''}
                            ${canDelete ? `
                                <button class="btn btn-outline-secondary btn-sm" onclick="confirmDeleteOrder(${order.IdDonHang}, '${escapeHtml(order.MaDonHang)}')">
                                    <i class="fas fa-trash"></i> Xóa
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get payment method text
function getPaymentMethodText(method) {
    const methodMap = {
        'Tien mat': 'Tiền mặt (COD)',
        'COD': 'Tiền mặt (COD)',
        'Chuyen khoan': 'Chuyển khoản',
        'The tin dung': 'Thẻ tín dụng'
    };
    return methodMap[method] || method || 'Chưa xác định';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Get order status info
function getOrderStatusInfo(status) {
    const statusMap = {
        'ChoXuLy': { text: 'Chờ xử lý', class: 'bg-warning' },
        'Cho xu ly': { text: 'Chờ xử lý', class: 'bg-warning' },
        'DaXacNhan': { text: 'Đã xác nhận', class: 'bg-info' },
        'Xac nhan': { text: 'Đã xác nhận', class: 'bg-info' },
        'DangGiao': { text: 'Đang giao', class: 'bg-primary' },
        'Dang giao': { text: 'Đang giao', class: 'bg-primary' },
        'DaGiao': { text: 'Đã giao', class: 'bg-success' },
        'Da giao': { text: 'Đã giao', class: 'bg-success' },
        'DaHuy': { text: 'Đã hủy', class: 'bg-secondary' },
        'Da huy': { text: 'Đã hủy', class: 'bg-secondary' },
        'HoanTien': { text: 'Hoàn tiền', class: 'bg-dark' }
    };

    return statusMap[status] || { text: status, class: 'bg-secondary' };
}

// Check if order can be cancelled
function canCancelOrder(order) {
    // Chỉ hủy được đơn COD và trạng thái Chờ xử lý
    const status = order.TrangThai;
    const paymentMethod = order.PhuongThucThanhToan;
    
    // Kiểm tra trạng thái: phải là Chờ xử lý
    const isWaitingStatus = (status === 'ChoXuLy' || status === 'Cho xu ly');
    
    // Kiểm tra phương thức thanh toán: phải là COD/Tiền mặt
    const isCOD = (paymentMethod === 'Tien mat' || paymentMethod === 'COD');
    
    return isWaitingStatus && isCOD;
}

// Check if order can be deleted
function canDeleteOrder(order) {
    // Chỉ xóa được đơn đã hủy hoặc đã giao
    const status = order.TrangThai;
    return (status === 'Da huy' || status === 'Da giao');
}

// View order detail
async function viewOrderDetail(orderId) {
    try {
        const response = await api.get(`/orders/${orderId}`);

        if (response.success && response.data) {
            console.log('Order detail response:', response.data);
            console.log('Order items:', response.data.items);
            showOrderDetailModal(response.data);
        } else {
            showNotification(response.message || 'Không thể tải chi tiết đơn hàng', 'error');
        }
    } catch (error) {
        console.error('View order detail error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

// Show order detail modal
function showOrderDetailModal(order) {
    const statusInfo = getOrderStatusInfo(order.TrangThai);

    const modalHTML = `
        <div class="modal fade" id="orderDetailModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-receipt"></i> Chi tiết đơn hàng ${order.MaDonHang}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Status -->
                        <div class="mb-4">
                            <span class="badge ${statusInfo.class} fs-6">${statusInfo.text}</span>
                        </div>

                        <!-- Customer Info -->
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <h6><i class="fas fa-user"></i> Thông tin người nhận</h6>
                                <p class="mb-1"><strong>${order.HoTenNguoiNhan || order.HoTen}</strong></p>
                                <p class="mb-1"><i class="fas fa-phone"></i> ${order.SoDienThoaiNguoiNhan || order.SoDienThoai}</p>
                                <p class="mb-1"><i class="fas fa-envelope"></i> ${order.EmailNguoiNhan || order.Email}</p>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fas fa-map-marker-alt"></i> Địa chỉ giao hàng</h6>
                                <p>${order.DiaChiGiaoHang || order.DiaChiGiao}</p>
                                ${order.GhiChu ? `<p class="text-muted"><i>Ghi chú: ${order.GhiChu}</i></p>` : ''}
                            </div>
                        </div>

                        <!-- Order Items -->
                        <h6><i class="fas fa-box"></i> Sản phẩm</h6>
                        <div class="table-responsive">
                            <table class="table">
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
                                            <td>
                                                <div class="d-flex align-items-center">
                                                    ${item.AnhChinh ? `
                                                        <img src="${item.AnhChinh}" alt="${item.TenSanPham}" 
                                                             style="width: 50px; height: 50px; object-fit: cover;" class="me-2">
                                                    ` : ''}
                                                    <div>
                                                        <div>${item.TenSanPham}</div>
                                                        ${(order.TrangThai === 'Da giao' || order.TrangThai === 'DaGiao') ? `
                                                            <a href="product-detail.html?id=${item.SanPhamId}&review=1" 
                                                               class="btn btn-sm btn-outline-warning mt-1" 
                                                               target="_blank">
                                                                <i class="fas fa-star"></i> Đánh giá
                                                            </a>
                                                        ` : ''}
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="text-center">${item.SoLuong}</td>
                                            <td class="text-end">${formatCurrency(item.GiaBan)}</td>
                                            <td class="text-end">${formatCurrency(item.GiaBan * item.SoLuong)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="3" class="text-end"><strong>Tổng cộng:</strong></td>
                                        <td class="text-end"><strong class="text-primary fs-5">${formatCurrency(order.TongTien)}</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <!-- Order Info -->
                        <div class="mt-3">
                            <p class="text-muted mb-1">
                                <i class="fas fa-calendar"></i> Ngày đặt: ${formatDateTime(order.ThoiDiemTao)}
                            </p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove old modal if exists
    const oldModal = document.getElementById('orderDetailModal');
    if (oldModal) oldModal.remove();

    // Add new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
    modal.show();
}

// Confirm cancel order
function confirmCancelOrder(orderId, orderCode) {
    if (confirm(`Bạn có chắc muốn hủy đơn hàng ${orderCode}?\n\nLưu ý: Chỉ có thể hủy đơn hàng COD chưa được xác nhận.`)) {
        cancelOrder(orderId);
    }
}

// Cancel order
async function cancelOrder(orderId) {
    try {
        const response = await api.put(`/orders/${orderId}/cancel`, {});

        if (response.success) {
            showNotification('Hủy đơn hàng thành công', 'success');
            // Reload orders
            loadUserOrders();
        } else {
            showNotification(response.message || 'Không thể hủy đơn hàng', 'error');
        }
    } catch (error) {
        console.error('Cancel order error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

// Confirm delete order
function confirmDeleteOrder(orderId, orderCode) {
    if (confirm(`Bạn có chắc muốn xóa đơn hàng ${orderCode}?\n\nLưu ý: Hành động này không thể hoàn tác.`)) {
        deleteOrder(orderId);
    }
}

// Delete order
async function deleteOrder(orderId) {
    try {
        const response = await api.delete(`/orders/${orderId}`);

        if (response.success) {
            showNotification('Xóa đơn hàng thành công', 'success');
            // Reload orders
            loadUserOrders();
        } else {
            showNotification(response.message || 'Không thể xóa đơn hàng', 'error');
        }
    } catch (error) {
        console.error('Delete order error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

// Format date time
function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Alias for orders.html compatibility
const loadOrders = loadUserOrders;
