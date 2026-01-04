// Products Page JavaScript
// Load and filter products from API

let allProducts = [];
let filteredProducts = [];

// Load products on page load
document.addEventListener('DOMContentLoaded', async function () {
    // Load categories and brands first
    await Promise.all([
        loadCategories(),
        loadBrands()
    ]);

    // Setup filter listeners AFTER categories/brands are loaded
    setupFilterListeners();

    // Check for URL parameters
    const searchTerm = getUrlParameter('search');
    await loadProducts(searchTerm);
});

// Load products from API
async function loadProducts(search = '') {
    try {
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = '<div class="col-12 text-center"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';

        let url = 'http://localhost:3000/api/products?limit=50';
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }

        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
            // Transform API data to match display format
            console.log('Raw API response sample:', result.data.products[0]);
            allProducts = result.data.products.map(p => ({
                id: p.IdSanPham,
                name: p.TenSanPham,
                brand: p.TenThuongHieu || 'Không rõ',
                brandId: p.ThuongHieuId || null,
                category: p.TenDanhMuc || 'Không rõ',
                categoryId: p.DanhMucId || null,
                price: p.GiaSanPham,
                image: p.AnhChinh || null,
                description: p.MoTaSanPham || '',
                rating: 4.5,
                inStock: p.SoLuongSanPham > 0,
                status: p.TrangThaiSanPham || 'DangBan'
            }));
            console.log('Mapped products sample:', allProducts[0]);

            filteredProducts = [...allProducts];
            displayProducts();
        } else {
            grid.innerHTML = '<div class="col-12 text-center text-danger">Lỗi tải sản phẩm</div>';
        }
    } catch (error) {
        console.error('Load products error:', error);
        document.getElementById('productsGrid').innerHTML = 
            '<div class="col-12 text-center text-danger">Không thể kết nối đến server</div>';
    }
}

// Load categories from API
async function loadCategories() {
    try {
        const response = await fetch('http://localhost:3000/api/categories');
        const result = await response.json();

        const container = document.getElementById('categoryFilters');

        if (result.success && result.data.length > 0) {
            container.innerHTML = result.data.map(cat => `
                <div class="form-check">
                    <input class="form-check-input category-filter" type="checkbox" 
                           value="${cat.IdDanhMuc}" id="cat${cat.IdDanhMuc}">
                    <label class="form-check-label" for="cat${cat.IdDanhMuc}">
                        ${cat.TenDanhMuc}
                    </label>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="text-muted small">Không có danh mục</div>';
        }
    } catch (error) {
        console.error('Load categories error:', error);
        document.getElementById('categoryFilters').innerHTML =
            '<div class="text-danger small">Lỗi tải danh mục</div>';
    }
}

// Load brands from API
async function loadBrands() {
    try {
        const response = await fetch('http://localhost:3000/api/brands');
        const result = await response.json();

        const container = document.getElementById('brandFilters');

        if (result.success && result.data.length > 0) {
            container.innerHTML = result.data.map(brand => `
                <div class="form-check">
                    <input class="form-check-input brand-filter" type="checkbox" 
                           value="${brand.IdThuongHieu}" id="brand${brand.IdThuongHieu}">
                    <label class="form-check-label" for="brand${brand.IdThuongHieu}">
                        ${brand.TenThuongHieu}
                    </label>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="text-muted small">Không có thương hiệu</div>';
        }
    } catch (error) {
        console.error('Load brands error:', error);
        document.getElementById('brandFilters').innerHTML =
            '<div class="text-danger small">Lỗi tải thương hiệu</div>';
    }
}

// Display products
function displayProducts() {
    const grid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    const resultCount = document.getElementById('resultCount');

    grid.innerHTML = '';

    if (filteredProducts.length === 0) {
        noResults.style.display = 'block';
        resultCount.textContent = '0';
        return;
    }

    noResults.style.display = 'none';
    resultCount.textContent = filteredProducts.length;

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });
}

// Placeholder image as data URI
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

// Get proper image URL
function getImageUrl(imagePath) {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    if (imagePath.startsWith('data:')) return imagePath;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `http://localhost:3000${imagePath}`;
    if (imagePath.includes('product-')) return `http://localhost:3000/uploads/products/${imagePath}`;
    return imagePath;
}

// Create product card
function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col';
    const imageUrl = getImageUrl(product.image);
    const isOutOfStock = product.status === 'NgungBan';

    col.innerHTML = `
        <div class="card product-card h-100 ${isOutOfStock ? 'opacity-75' : ''}">
            ${isOutOfStock ? '<div class="badge bg-secondary">Ngừng bán</div>' : ''}
            <img src="${imageUrl}" class="card-img-top" alt="${product.name}" 
                 onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}'">
            <div class="card-body">
                <div class="product-brand">${product.brand}</div>
                <h5 class="card-title">${product.name}</h5>
                <div class="product-specs">
                    <small><i class="fas fa-microchip text-primary"></i> ${product.description ? product.description.substring(0, 60) + '...' : 'Laptop chính hãng'}</small>
                </div>
                <div class="product-rating">
                    ${generateStars(product.rating)}
                    <span class="text-muted small">(${product.rating})</span>
                </div>
                <div class="product-price-section">
                    <div class="product-price text-danger fw-bold fs-5">${formatCurrency(product.price)}</div>
                </div>
            </div>
            <div class="card-footer bg-transparent border-0 p-3 pt-0">
                <div class="d-grid gap-2">
                    <a href="product-detail.html?id=${product.id}" class="btn btn-outline-primary btn-sm">
                        <i class="fas fa-info-circle"></i> Chi tiết
                    </a>
                    ${isOutOfStock ? 
                        '<button class="btn btn-secondary btn-sm" disabled><i class="fas fa-ban"></i> Hết hàng</button>' :
                        `<button class="btn btn-primary btn-sm" onclick="addToCartFromList(${product.id}); event.stopPropagation();"><i class="fas fa-cart-plus"></i> Thêm vào giỏ</button>`
                    }
                </div>
            </div>
        </div>
    `;

    return col;
}

// Add to cart from product list
async function addToCartFromList(productId) {
    await addToCartAPI(productId, 1);
}

// Setup filter listeners using event delegation
function setupFilterListeners() {
    // Use event delegation for dynamically loaded filters
    const categoryContainer = document.getElementById('categoryFilters');
    const brandContainer = document.getElementById('brandFilters');
    
    if (categoryContainer) {
        categoryContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('category-filter')) {
                applyFilters();
            }
        });
    }
    
    if (brandContainer) {
        brandContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('brand-filter')) {
                applyFilters();
            }
        });
    }

    // Price filters (static, not dynamically loaded)
    document.querySelectorAll('.price-filter').forEach(radio => {
        radio.addEventListener('change', applyFilters);
    });

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', applySort);
    }
}

// Apply filters
function applyFilters() {
    filteredProducts = [...allProducts];
    console.log('Applying filters, total products:', allProducts.length);

    // Category filter - support both ID and name matching
    const selectedCatCheckboxes = document.querySelectorAll('.category-filter:checked');
    const selectedCatIds = Array.from(selectedCatCheckboxes).map(cb => parseInt(cb.value));
    const selectedCatNames = Array.from(selectedCatCheckboxes).map(cb => cb.nextElementSibling?.textContent?.trim());
    console.log('Selected categories IDs:', selectedCatIds, 'Names:', selectedCatNames);
    if (selectedCatIds.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
            selectedCatIds.includes(p.categoryId) || selectedCatNames.includes(p.category)
        );
        console.log('After category filter:', filteredProducts.length);
    }

    // Brand filter - support both ID and name matching
    const selectedBrandCheckboxes = document.querySelectorAll('.brand-filter:checked');
    const selectedBrandIds = Array.from(selectedBrandCheckboxes).map(cb => parseInt(cb.value));
    const selectedBrandNames = Array.from(selectedBrandCheckboxes).map(cb => cb.nextElementSibling?.textContent?.trim());
    console.log('Selected brands IDs:', selectedBrandIds, 'Names:', selectedBrandNames);
    if (selectedBrandIds.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
            selectedBrandIds.includes(p.brandId) || selectedBrandNames.includes(p.brand)
        );
        console.log('After brand filter:', filteredProducts.length);
    }

    // Price filter
    const selectedPrice = document.querySelector('.price-filter:checked');
    if (selectedPrice && selectedPrice.value) {
        const [min, max] = selectedPrice.value.split('-').map(v => parseInt(v) * 1000000);
        console.log('Price range:', min, '-', max);
        filteredProducts = filteredProducts.filter(p => p.price >= min && p.price <= max);
        console.log('After price filter:', filteredProducts.length);
    }

    applySort();
}

// Apply sort
function applySort() {
    const sortSelect = document.getElementById('sortSelect');
    const sortValue = sortSelect ? sortSelect.value : '';

    switch (sortValue) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
    }

    displayProducts();
}

// Clear filters
function clearFilters() {
    document.querySelectorAll('.category-filter').forEach(cb => cb.checked = false);
    document.querySelectorAll('.brand-filter').forEach(cb => cb.checked = false);
    document.querySelectorAll('.price-filter').forEach(radio => radio.checked = false);
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = '';

    filteredProducts = [...allProducts];
    displayProducts();
}

// Generate star rating
function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star" style="color: #ffc107;"></i>';
    }

    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt" style="color: #ffc107;"></i>';
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star" style="color: #ffc107;"></i>';
    }

    return stars;
}
