// Coupons Page JavaScript

// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

if (!user || !token) {
    alert('Vui lòng đăng nhập để xem mã giảm giá');
    window.location.href = 'login.html';
}

// Load coupons
async function loadCoupons() {
    try {
        const result = await api.get('/coupons/active');
        
        if (result.success) {
            displayCoupons(result.data);
        } else {
            showError('Không thể tải mã giảm giá');
        }
    } catch (error) {
        console.error('Load coupons error:', error);
        showError('Lỗi khi tải mã giảm giá');
    }
}

// Display coupons
function displayCoupons(coupons) {
    const container = document.getElementById('couponsContainer');
    
    if (coupons.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info text-center">
                <i class="fas fa-info-circle"></i> Hiện tại chưa có mã giảm giá nào
            </div>
        `;
        return;
    }
    
    container.innerHTML = coupons.map(coupon => {
        const now = new Date();
        const endDate = new Date(coupon.NgayKetThuc);
        const isExpired = endDate < now;
        const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        
        // Display discount value based on type
        let discountDisplay = '';
        let discountText = '';
        if (coupon.LoaiGiam === 'PhanTram') {
            discountDisplay = `${coupon.PhanTramGiam}%`;
            discountText = 'GIẢM GIÁ';
        } else {
            discountDisplay = formatCurrency(coupon.SoTienGiam).replace('₫', '');
            discountText = 'GIẢM TIỀN';
        }
        
        return `
            <div class="coupon-card ${isExpired ? 'expired' : ''}">
                <div class="row align-items-center">
                    <div class="col-md-3 text-center">
                        <div class="coupon-discount">${discountDisplay}</div>
                        <small>${discountText}</small>
                    </div>
                    <div class="col-md-6">
                        <h4>${coupon.TenMaGiamGia}</h4>
                        <p class="mb-2">${coupon.MoTa || ''}</p>
                        <div class="coupon-code">${coupon.MaMaGiamGia}</div>
                        <div class="mt-2">
                            <small><i class="fas fa-shopping-cart"></i> Đơn tối thiểu: ${formatCurrency(coupon.GiaTriDonHangToiThieu)}</small>
                            ${coupon.LoaiGiam === 'PhanTram' && coupon.GiamToiDa ? `<br><small><i class="fas fa-tag"></i> Giảm tối đa: ${formatCurrency(coupon.GiamToiDa)}</small>` : ''}
                            <br><small><i class="fas fa-clock"></i> ${isExpired ? 'Đã hết hạn' : `Còn ${daysLeft} ngày`}</small>
                        </div>
                    </div>
                    <div class="col-md-3 text-center">
                        ${!isExpired ? `
                            <button class="copy-btn" onclick="copyCouponCode('${coupon.MaMaGiamGia}')">
                                <i class="fas fa-copy"></i> Sao chép mã
                            </button>
                            <div class="mt-2">
                                <a href="cart.html" class="btn btn-light btn-sm">
                                    <i class="fas fa-shopping-cart"></i> Dùng ngay
                                </a>
                            </div>
                        ` : '<span class="badge bg-secondary">Hết hạn</span>'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Copy coupon code
function copyCouponCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        alert(`Đã sao chép mã: ${code}`);
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Show error
function showError(message) {
    const container = document.getElementById('couponsContainer');
    container.innerHTML = `
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle"></i> ${message}
        </div>
    `;
}

// Load coupons on page load
loadCoupons();
