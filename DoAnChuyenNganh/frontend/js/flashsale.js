// Flash Sale JavaScript - FPT Shop Style
let countdownInterval = null;
const NO_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PC9zdmc+';

document.addEventListener('DOMContentLoaded', async function() {
    await loadActiveFlashSale();
});

async function loadActiveFlashSale() {
    try {
        const response = await fetch('http://localhost:3000/api/flashsale/active');
        const result = await response.json();

        // Chỉ hiển thị khi có flash sale VÀ có sản phẩm
        if (result.success && result.data && result.data.products && result.data.products.length > 0) {
            document.getElementById('flashSaleSection').style.display = 'block';
            startCountdown(result.data.NgayKetThuc);
            displayFlashSaleProducts(result.data.products);
        } else {
            // Ẩn hoàn toàn nếu không có flash sale hoặc không có sản phẩm
            document.getElementById('flashSaleSection').style.display = 'none';
        }
    } catch (error) {
        console.error('Load flash sale error:', error);
        document.getElementById('flashSaleSection').style.display = 'none';
    }
}

function startCountdown(endDate) {
    if (countdownInterval) clearInterval(countdownInterval);

    const update = () => {
        const now = new Date().getTime();
        const end = new Date(endDate).getTime();
        const distance = end - now;

        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('hours').textContent = String(days * 24 + hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    };

    update();
    countdownInterval = setInterval(update, 1000);
}

function displayFlashSaleProducts(products) {
    const grid = document.getElementById('flashSaleProductsGrid');
    grid.innerHTML = '';

    // Add class based on product count for centering
    if (products.length > 3) {
        grid.classList.add('has-many');
    } else {
        grid.classList.remove('has-many');
    }

    products.forEach(product => {
        const discountPercent = Math.round(((product.GiaGoc - product.GiaFlashSale) / product.GiaGoc) * 100);
        const soldPercent = product.SoLuongGioiHan > 0 ? Math.round((product.DaBan / product.SoLuongGioiHan) * 100) : 0;
        const soldText = product.DaBan > 0 ? `Đã bán ${product.DaBan}` : 'Vừa mở bán';
        const imageUrl = getFlashSaleImageUrl(product.HinhAnh);

        const item = document.createElement('div');
        item.className = 'flash-sale-item position-relative';
        item.onclick = () => window.location.href = `product-detail.html?id=${product.SanPhamId}`;

        item.innerHTML = `
            <span class="discount-badge">-${discountPercent}%</span>
            <img src="${imageUrl}" alt="${product.TenSanPham}" style="background:#f5f5f5" onerror="this.onerror=null;this.src='${NO_IMAGE}'">
            <div class="product-name">${product.TenSanPham}</div>
            <div class="price-sale">${formatCurrency(product.GiaFlashSale)}</div>
            <div class="price-original">${formatCurrency(product.GiaGoc)}</div>
            ${product.SoLuongGioiHan > 0 ? `
                <div class="sold-progress">
                    <div class="progress">
                        <div class="progress-bar" style="width: ${Math.max(soldPercent, 30)}%">
                            <span class="sold-text">${soldText}</span>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
        grid.appendChild(item);
    });
}

function getFlashSaleImageUrl(imagePath) {
    if (!imagePath) return NO_IMAGE;
    if (imagePath.startsWith('data:')) return imagePath;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return 'http://localhost:3000' + imagePath;
    // Handle case where path is just filename like "product-xxx.jpg"
    if (imagePath.includes('product-')) return 'http://localhost:3000/uploads/products/' + imagePath;
    return imagePath;
}

function slideFlashSale(direction) {
    const container = document.getElementById('flashSaleProductsGrid');
    container.scrollBy({ left: direction * 200, behavior: 'smooth' });
}
