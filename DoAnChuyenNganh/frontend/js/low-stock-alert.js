// Low Stock Alert System for Admin

class LowStockAlert {
    constructor() {
        this.threshold = 10; // Changed to 10 to include all warning levels
        this.lowStockProducts = [];
    }

    // Get badge color and text based on stock level
    getStockBadge(quantity) {
        if (quantity <= 5) {
            return {
                class: 'bg-danger',
                text: 'Nguy hiểm',
                icon: 'fa-exclamation-circle'
            };
        } else if (quantity <= 10) {
            return {
                class: 'bg-warning text-dark',
                text: 'Cảnh báo',
                icon: 'fa-exclamation-triangle'
            };
        } else {
            return {
                class: 'bg-success',
                text: 'Ổn định',
                icon: 'fa-check-circle'
            };
        }
    }

    // Load low stock products from API
    async loadLowStockProducts() {
        console.log('Loading low stock products...');
        try {
            const result = await api.get(`/products/admin/low-stock?threshold=${this.threshold}`);
            console.log('Low stock API result:', result);
            
            if (result.success) {
                // Sort by quantity ascending (lowest first)
                this.lowStockProducts = result.data.products.sort((a, b) => 
                    a.SoLuongTonKho - b.SoLuongTonKho
                );
                console.log('Low stock products loaded:', this.lowStockProducts.length);
                return this.lowStockProducts;
            }
            console.error('API returned success=false:', result);
            return [];
        } catch (error) {
            console.error('Load low stock products error:', error);
            return [];
        }
    }

    // Update badge count on admin menu
    async updateAdminBadge() {
        await this.loadLowStockProducts();
        // Only count critical products (<=5) for badge
        const criticalCount = this.lowStockProducts.filter(p => p.SoLuongTonKho <= 5).length;
        
        // Update badge in header
        const adminLink = document.getElementById('nav-admin');
        if (adminLink && criticalCount > 0) {
            // Remove old badge if exists
            const oldBadge = adminLink.querySelector('.low-stock-badge');
            if (oldBadge) oldBadge.remove();
            
            // Add new badge
            const badge = document.createElement('span');
            badge.className = 'low-stock-badge';
            badge.textContent = criticalCount;
            badge.style.cssText = `
                background: #ef4444;
                color: white;
                border-radius: 10px;
                padding: 2px 6px;
                font-size: 11px;
                font-weight: bold;
                margin-left: 5px;
                position: relative;
                top: -2px;
            `;
            adminLink.appendChild(badge);
        }
    }

    // Show popup alert when admin enters admin page
    async showPopupAlert() {
        await this.loadLowStockProducts();
        
        // Only show popup for critical products (<=5)
        const criticalProducts = this.lowStockProducts.filter(p => p.SoLuongTonKho <= 5);
        
        if (criticalProducts.length === 0) return;

        // Create popup HTML
        const popupHTML = `
            <div class="modal fade" id="lowStockModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-exclamation-circle"></i> 
                                Cảnh báo khẩn: ${criticalProducts.length} sản phẩm sắp hết hàng!
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p class="mb-3"><strong>Các sản phẩm sau có số lượng tồn kho ≤ 5 (mức nguy hiểm):</strong></p>
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th>Thương hiệu</th>
                                            <th class="text-center">Tồn kho</th>
                                            <th class="text-center">Mức độ</th>
                                            <th class="text-end">Giá</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${criticalProducts.map(product => {
                                            const badge = this.getStockBadge(product.SoLuongTonKho);
                                            return `
                                                <tr>
                                                    <td>
                                                        <div class="d-flex align-items-center">
                                                            <img src="${product.HinhAnh || 'images/placeholder.jpg'}" 
                                                                 alt="${product.TenSanPham}"
                                                                 style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 5px;">
                                                            <span>${product.TenSanPham}</span>
                                                        </div>
                                                    </td>
                                                    <td>${product.TenThuongHieu || 'N/A'}</td>
                                                    <td class="text-center">
                                                        <span class="badge ${badge.class}" style="font-size: 14px;">
                                                            ${product.SoLuongTonKho}
                                                        </span>
                                                    </td>
                                                    <td class="text-center">
                                                        <i class="fas ${badge.icon} text-danger"></i> ${badge.text}
                                                    </td>
                                                    <td class="text-end">${this.formatPrice(product.GiaSanPham)}</td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                            <button type="button" class="btn btn-danger" onclick="showLowStockTab()" data-bs-dismiss="modal">
                                <i class="fas fa-exclamation-triangle"></i> Xem tất cả cảnh báo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add to body if not exists
        if (!document.getElementById('lowStockModal')) {
            document.body.insertAdjacentHTML('beforeend', popupHTML);
        }

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('lowStockModal'));
        modal.show();
    }

    // Display low stock products in admin page
    async displayLowStockTab() {
        console.log('displayLowStockTab called');
        const container = document.getElementById('lowStockContainer');
        if (!container) {
            console.error('lowStockContainer not found');
            return;
        }

        console.log('Container found, showing loading...');
        // Show loading
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-spinner fa-spin fa-2x"></i>
                <p class="mt-2">Đang tải dữ liệu...</p>
            </div>
        `;

        try {
            console.log('Calling loadLowStockProducts...');
            await this.loadLowStockProducts();
            console.log('Products loaded:', this.lowStockProducts.length);
            
            if (this.lowStockProducts.length === 0) {
                container.innerHTML = `
                    <div class="alert alert-success">
                        <i class="fas fa-check-circle"></i> 
                        Tất cả sản phẩm đều có đủ hàng trong kho (> 10)!
                    </div>
                `;
                return;
            }

            // Count by priority
            const critical = this.lowStockProducts.filter(p => p.SoLuongTonKho <= 5).length;
            const warning = this.lowStockProducts.filter(p => p.SoLuongTonKho > 5 && p.SoLuongTonKho <= 10).length;

            const html = `
                <!-- Summary Cards -->
                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="card border-danger">
                            <div class="card-body text-center">
                                <i class="fas fa-exclamation-circle fa-3x text-danger mb-2"></i>
                                <h3 class="text-danger mb-0">${critical}</h3>
                                <p class="text-muted mb-0">Nguy hiểm (≤ 5)</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card border-warning">
                            <div class="card-body text-center">
                                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-2"></i>
                                <h3 class="text-warning mb-0">${warning}</h3>
                                <p class="text-muted mb-0">Cảnh báo (6-10)</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card border-primary">
                            <div class="card-body text-center">
                                <i class="fas fa-box fa-3x text-primary mb-2"></i>
                                <h3 class="text-primary mb-0">${this.lowStockProducts.length}</h3>
                                <p class="text-muted mb-0">Tổng cần theo dõi</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Products Table -->
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Danh mục</th>
                                <th>Thương hiệu</th>
                                <th class="text-center">Tồn kho</th>
                                <th class="text-center">Mức độ</th>
                                <th class="text-end">Giá</th>
                                <th class="text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.lowStockProducts.map(product => {
                                const badge = this.getStockBadge(product.SoLuongTonKho);
                                return `
                                    <tr class="${product.SoLuongTonKho <= 5 ? 'table-danger' : product.SoLuongTonKho <= 10 ? 'table-warning' : ''}">
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <img src="${product.HinhAnh || 'images/placeholder.jpg'}" 
                                                     alt="${product.TenSanPham}"
                                                     style="width: 60px; height: 60px; object-fit: cover; margin-right: 10px; border-radius: 5px;">
                                                <span>${product.TenSanPham}</span>
                                            </div>
                                        </td>
                                        <td>${product.TenDanhMuc || 'N/A'}</td>
                                        <td>${product.TenThuongHieu || 'N/A'}</td>
                                        <td class="text-center">
                                            <span class="badge ${badge.class}" style="font-size: 16px; padding: 8px 12px;">
                                                ${product.SoLuongTonKho}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <i class="fas ${badge.icon} ${product.SoLuongTonKho <= 5 ? 'text-danger' : product.SoLuongTonKho <= 10 ? 'text-warning' : 'text-success'}"></i>
                                            <br>
                                            <small class="fw-bold">${badge.text}</small>
                                        </td>
                                        <td class="text-end">${this.formatPrice(product.GiaSanPham)}</td>
                                        <td class="text-center">
                                            <button class="btn btn-sm btn-primary" onclick="editProduct(${product.SanPhamId})">
                                                <i class="fas fa-edit"></i> Nhập hàng
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Legend -->
                <div class="mt-3">
                    <small class="text-muted">
                        <i class="fas fa-circle text-danger"></i> Nguy hiểm (≤ 5) &nbsp;&nbsp;
                        <i class="fas fa-circle text-warning"></i> Cảnh báo (6-10) &nbsp;&nbsp;
                        <i class="fas fa-circle text-success"></i> Ổn định (> 10)
                    </small>
                </div>
            `;

            container.innerHTML = html;
        } catch (error) {
            console.error('Display low stock tab error:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Lỗi khi tải dữ liệu: ${error.message}
                    <br><small>Vui lòng kiểm tra console để biết thêm chi tiết.</small>
                </div>
            `;
        }
    }

    // Format price
    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }
}

// Create global instance
const lowStockAlert = new LowStockAlert();

// Function to show low stock tab
function showLowStockTab() {
    // Switch to low stock tab
    const lowStockTab = document.querySelector('[data-bs-target="#lowStock"]');
    if (lowStockTab) {
        const tab = new bootstrap.Tab(lowStockTab);
        tab.show();
    }
}

// Auto-update badge every 5 minutes
setInterval(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.vaiTro === 'Admin') {
        lowStockAlert.updateAdminBadge();
    }
}, 5 * 60 * 1000);
