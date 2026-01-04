// Profile Orders Management
// Quản lý đơn hàng trong trang profile

// Load user orders
async function loadUserOrders() {
    try {
        const ordersContainer = document.getElementById('ordersContainer');
        ordersContainer.innerHTML = '<div class="text-center py-5"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';

        const response = await api.get('/orders');

        if (response.success && response.data) {
            if (response.data.length === 0) {
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

            ordersContainer.innerHTML = response.data.map(order => createOrderCard(order)).join('');
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

// Create order card HTML
function createOrderCard(order) {
    const statusInfo = getOrderStatusInfo(order.TrangThai);
    const canCancel = canCancelOrder(order);
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

// View order detail
async function viewOrderDetail(orderId) {
    try {
        const response = await api.get(`/orders/${orderId}`);

        if (response.success && response.data) {
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
                                                    <span>${item.TenSanPham}</span>
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
        const response = await api.delete(`/orders/${orderId}/cancel`);

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
