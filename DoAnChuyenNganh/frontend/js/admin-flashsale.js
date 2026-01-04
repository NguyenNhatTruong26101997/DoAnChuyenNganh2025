// Admin Flash Sale Management
let allProductsForFlashSale = [];
let currentFlashSale = null;

// Load flash sale info and products
async function loadFlashSaleData() {
    await loadFlashSaleProducts();
}

// Load flash sale products
async function loadFlashSaleProducts() {
    try {
        let products = [];
        
        // Get products from active flash sale
        const activeResult = await api.get('/flashsale/active');
        if (activeResult.success && activeResult.data && activeResult.data.products) {
            products = activeResult.data.products.map(p => ({
                Id: p.IdFlashSaleProduct,
                SanPhamId: p.SanPhamId,
                TenSanPham: p.TenSanPham,
                TenThuongHieu: p.TenThuongHieu,
                GiaGoc: p.GiaGoc,
                GiaFlashSale: p.GiaFlashSale,
                SoLuongGioiHan: p.SoLuongGioiHan,
                DaBan: p.DaBan,
                HinhAnh: p.HinhAnh
            }));
        }
        
        // If no active, try getting all products
        if (products.length === 0) {
            const result = await api.get('/flashsale/products/all');
            if (result.success && result.data) {
                products = result.data;
            }
        }
        
        displayFlashSaleProducts(products);
    } catch (error) {
        console.error('Load flash sale products error:', error);
        displayFlashSaleProducts([]);
    }
}

// Display flash sale products
function displayFlashSaleProducts(products) {
    const tbody = document.getElementById('flashsaleProductsBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Chưa có sản phẩm flash sale nào</td></tr>';
        return;
    }

    products.forEach(p => {
        const discountPercent = p.GiaGoc > 0 ? Math.round((1 - p.GiaFlashSale / p.GiaGoc) * 100) : 0;
        const imageUrl = getAdminImageUrl(p.HinhAnh || p.AnhChinh);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${imageUrl}" width="60" height="60" style="object-fit: contain; background: #f5f5f5; border-radius: 4px;" onerror="this.onerror=null;this.style.opacity='0.3'"></td>
            <td>
                <div class="fw-medium">${p.TenSanPham}</div>
                <small class="text-muted">${p.TenThuongHieu || ''}</small>
            </td>
            <td>${formatCurrency(p.GiaGoc)}</td>
            <td class="text-danger fw-bold">${formatCurrency(p.GiaFlashSale)}</td>
            <td><span class="badge bg-danger">-${discountPercent}%</span></td>
            <td>${p.SoLuongGioiHan || 0}</td>
            <td>${p.DaBan || 0}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editFlashSaleProduct(${p.Id || p.SanPhamId}, ${p.SanPhamId})" title="Sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteFlashSaleProduct(${p.Id || p.SanPhamId})" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Get image URL helper
function getAdminImageUrl(imagePath) {
    const NO_IMG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y1ZjVmNSIvPjwvc3ZnPg==';
    if (!imagePath) return NO_IMG;
    if (imagePath.startsWith('data:')) return imagePath;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return 'http://localhost:3000' + imagePath;
    if (imagePath.includes('product-')) return 'http://localhost:3000/uploads/products/' + imagePath;
    return imagePath;
}

// Show add modal
async function showAddFlashSaleProductModal() {
    document.getElementById('fsProductModalTitle').textContent = 'Thêm sản phẩm Flash Sale';
    document.getElementById('fsProductForm').reset();
    document.getElementById('fsProductId').value = '';
    document.getElementById('fsProductSelect').disabled = false;
    
    // Set default dates: start now, end in 7 days
    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    document.getElementById('fsStartDate').value = formatDateTimeLocal(now);
    document.getElementById('fsEndDate').value = formatDateTimeLocal(endDate);
    
    await loadProductsForSelect();
    
    const modal = new bootstrap.Modal(document.getElementById('flashsaleProductModal'));
    modal.show();
}

// Load products for dropdown
async function loadProductsForSelect() {
    try {
        const result = await api.get('/products?limit=100');
        
        if (result.success) {
            allProductsForFlashSale = result.data.products || [];
            const select = document.getElementById('fsProductSelect');
            select.innerHTML = '<option value="">-- Chọn sản phẩm --</option>';
            
            allProductsForFlashSale.forEach(p => {
                const option = document.createElement('option');
                option.value = p.IdSanPham;
                option.textContent = p.TenSanPham;
                option.dataset.price = p.GiaSanPham;
                select.appendChild(option);
            });
            
            // Update price when product selected
            select.onchange = function() {
                const selectedOption = this.options[this.selectedIndex];
                const price = selectedOption.dataset.price || 0;
                document.getElementById('fsOriginalPrice').value = formatCurrency(price);
                // Suggest sale price (10% off)
                document.getElementById('fsSalePrice').value = Math.round(price * 0.9);
            };
        }
    } catch (error) {
        console.error('Load products error:', error);
    }
}

// Edit flash sale product
async function editFlashSaleProduct(id, productId) {
    document.getElementById('fsProductModalTitle').textContent = 'Sửa sản phẩm Flash Sale';
    document.getElementById('fsProductId').value = id;
    
    await loadProductsForSelect();
    
    // Find product info
    try {
        const result = await api.get('/flashsale/products/all');
        if (result.success) {
            const product = result.data.find(p => (p.Id || p.SanPhamId) === id);
            if (product) {
                document.getElementById('fsProductSelect').value = product.SanPhamId;
                document.getElementById('fsProductSelect').disabled = true;
                document.getElementById('fsOriginalPrice').value = formatCurrency(product.GiaGoc);
                document.getElementById('fsSalePrice').value = product.GiaFlashSale;
                document.getElementById('fsQuantity').value = product.SoLuongGioiHan || 10;
            }
        }
        
        // Load flash sale dates from active flash sale
        const fsResult = await api.get('/flashsale/active');
        if (fsResult.success && fsResult.data) {
            document.getElementById('fsStartDate').value = formatDateTimeLocal(fsResult.data.NgayBatDau);
            document.getElementById('fsEndDate').value = formatDateTimeLocal(fsResult.data.NgayKetThuc);
        } else {
            // Default dates if no flash sale exists
            const now = new Date();
            const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            document.getElementById('fsStartDate').value = formatDateTimeLocal(now);
            document.getElementById('fsEndDate').value = formatDateTimeLocal(endDate);
        }
    } catch (error) {
        console.error('Load product error:', error);
    }
    
    const modal = new bootstrap.Modal(document.getElementById('flashsaleProductModal'));
    modal.show();
}

// Save flash sale product
async function saveFlashSaleProduct(event) {
    event.preventDefault();
    
    const id = document.getElementById('fsProductId').value;
    const productId = document.getElementById('fsProductSelect').value;
    const salePrice = document.getElementById('fsSalePrice').value;
    const quantity = document.getElementById('fsQuantity').value;
    const startDate = document.getElementById('fsStartDate').value;
    const endDate = document.getElementById('fsEndDate').value;
    
    // Get original price from selected product or from hidden field
    const selectedOption = document.getElementById('fsProductSelect').options[document.getElementById('fsProductSelect').selectedIndex];
    let originalPrice = selectedOption.dataset.price;
    
    // If editing, get price from the product list
    if (!originalPrice && id) {
        const product = allProductsForFlashSale.find(p => p.IdSanPham == productId);
        originalPrice = product ? product.GiaSanPham : 0;
    }
    
    if (!productId) {
        showNotification('Vui lòng chọn sản phẩm', 'error');
        return;
    }
    
    if (!originalPrice || parseInt(salePrice) >= parseInt(originalPrice)) {
        showNotification('Giá sale phải nhỏ hơn giá gốc', 'error');
        return;
    }
    
    if (!startDate || !endDate) {
        showNotification('Vui lòng chọn ngày bắt đầu và kết thúc', 'error');
        return;
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
        showNotification('Ngày kết thúc phải sau ngày bắt đầu', 'error');
        return;
    }
    
    try {
        let result;
        const data = {
            sanPhamId: parseInt(productId),
            giaGoc: parseInt(originalPrice),
            giaFlashSale: parseInt(salePrice),
            soLuongGioiHan: parseInt(quantity) || 10,
            ngayBatDau: startDate,
            ngayKetThuc: endDate
        };
        
        console.log('Saving flash sale product:', data);
        
        if (id) {
            result = await api.put(`/flashsale/products/${id}`, data);
        } else {
            result = await api.post('/flashsale/products', data);
        }
        
        console.log('Save result:', result);
        
        if (result.success) {
            showNotification(id ? 'Cập nhật thành công' : 'Thêm thành công', 'success');
            bootstrap.Modal.getInstance(document.getElementById('flashsaleProductModal')).hide();
            loadFlashSaleData();
        } else {
            showNotification(result.message || 'Lưu thất bại', 'error');
        }
    } catch (error) {
        console.error('Save error:', error);
        showNotification('Lỗi khi lưu', 'error');
    }
}

// Delete flash sale product
async function deleteFlashSaleProduct(id) {
    if (!confirm('Xóa sản phẩm này khỏi Flash Sale?')) return;
    
    try {
        const result = await api.delete(`/flashsale/products/${id}`);
        
        if (result.success) {
            showNotification('Xóa thành công', 'success');
            loadFlashSaleProducts();
        } else {
            showNotification(result.message || 'Xóa thất bại', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Lỗi khi xóa', 'error');
    }
}

// Format date for datetime-local input
function formatDateTimeLocal(date) {
    const d = new Date(date);
    return d.getFullYear() + '-' + 
           String(d.getMonth() + 1).padStart(2, '0') + '-' +
           String(d.getDate()).padStart(2, '0') + 'T' +
           String(d.getHours()).padStart(2, '0') + ':' +
           String(d.getMinutes()).padStart(2, '0');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const flashsaleTab = document.getElementById('flashsale-tab');
    if (flashsaleTab) {
        flashsaleTab.addEventListener('shown.bs.tab', function() {
            loadFlashSaleData();
        });
    }
});
