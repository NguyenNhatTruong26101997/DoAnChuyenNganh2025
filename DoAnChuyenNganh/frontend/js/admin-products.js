// Admin Product Management
// Requires: api.js loaded first

let productsData = [];
let productsCurrentPage = 1;
const productsPerPage = 10;
let categories = [];
let brands = [];

// Helper function to get proper image URL
function getProductImageUrl(imagePath) {
    if (!imagePath) return '';
    if (imagePath.startsWith('data:')) return imagePath;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return 'http://localhost:3000' + imagePath;
    if (imagePath.includes('product-')) return 'http://localhost:3000/uploads/products/' + imagePath;
    return imagePath;
}

// Load all products
async function loadProducts(page = 1, filters = {}) {
    try {
        productsCurrentPage = page;
        const params = new URLSearchParams({
            page,
            limit: productsPerPage,
            ...filters
        });

        // Use admin endpoint to see all products (including NgungBan)
        const result = await api.get(`/products/admin/all?${params}`);

        if (result.success) {
            productsData = result.data.products;
            displayProducts(productsData);
            displayProductsPagination(result.data.pagination);
        } else {
            showNotification(result.message || 'Lỗi khi tải danh sách sản phẩm', 'error');
        }
    } catch (error) {
        console.error('Load products error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

// Load categories and brands for select options
async function loadProductDependencies() {
    try {
        const [catResult, brandResult] = await Promise.all([
            api.get('/categories'),
            api.get('/brands')
        ]);

        if (catResult.success) categories = catResult.data;
        if (brandResult.success) brands = brandResult.data;

        // Populate select options
        populateSelect('productCategory', categories, 'IdDanhMuc', 'TenDanhMuc');
        populateSelect('productBrand', brands, 'IdThuongHieu', 'TenThuongHieu');

        // Also populate filter selects if they exist
        // (Assuming we might add filters later, or if they exist in HTML)
    } catch (error) {
        console.error('Load dependencies error:', error);
    }
}

function populateSelect(elementId, data, valueField, textField) {
    const select = document.getElementById(elementId);
    if (!select) return;

    // Keep first option (e.g. "Select Category")
    const firstOption = select.options[0];
    select.innerHTML = '';
    select.appendChild(firstOption);

    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueField];
        option.textContent = item[textField];
        select.appendChild(option);
    });
}

// Display products in table
function displayProducts(products) {
    const tbody = document.getElementById('productsTable');
    if (!tbody) return;

    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Không có sản phẩm nào</td></tr>';
        return;
    }

    // Sort products: low stock (<=5) first, then by stock quantity ascending
    const sortedProducts = [...products].sort((a, b) => {
        const aLowStock = a.SoLuongSanPham <= 5;
        const bLowStock = b.SoLuongSanPham <= 5;
        
        // If both are low stock or both are not, sort by quantity ascending
        if (aLowStock === bLowStock) {
            return a.SoLuongSanPham - b.SoLuongSanPham;
        }
        
        // Low stock items come first
        return aLowStock ? -1 : 1;
    });

    // Count low stock products
    const lowStockCount = sortedProducts.filter(p => p.SoLuongSanPham <= 5).length;
    
    // Update badge
    const badge = document.getElementById('lowStockBadge');
    if (badge) {
        if (lowStockCount > 0) {
            badge.textContent = lowStockCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }

    tbody.innerHTML = sortedProducts.map(product => {
        const isLowStock = product.SoLuongSanPham <= 5;
        const rowClass = isLowStock ? 'table-danger' : '';
        const stockBadge = isLowStock 
            ? `<span class="badge bg-danger ms-2" title="Cảnh báo: Tồn kho thấp!"><i class="fas fa-exclamation-triangle"></i> Sắp hết</span>` 
            : '';
        
        return `
            <tr class="${rowClass}">
                <td>${product.IdSanPham}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${getProductImageUrl(product.AnhChinh)}" width="50" height="50" class="me-2 rounded" style="object-fit: contain; background: #f5f5f5;" onerror="this.onerror=null; this.style.display='none'">
                        <div>
                            <div class="fw-bold" style="max-width: 350px; white-space: normal; line-height: 1.3;">${product.TenSanPham}</div>
                        </div>
                    </div>
                </td>
                <td>${product.TenThuongHieu || 'N/A'}</td>
                <td>${formatCurrency(product.GiaSanPham)}</td>
                <td>
                    <span class="${isLowStock ? 'fw-bold text-danger' : ''}">${product.SoLuongSanPham}</span>
                    ${stockBadge}
                </td>
                <td>
                    <span class="badge ${product.TrangThaiSanPham === 'DangBan' ? 'bg-success' : 'bg-secondary'}">
                        ${product.TrangThaiSanPham === 'DangBan' ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm ${product.TrangThaiSanPham === 'DangBan' ? 'btn-outline-warning' : 'btn-outline-success'}" 
                            onclick="toggleProductStatus(${product.IdSanPham}, '${product.TrangThaiSanPham}')" 
                            title="${product.TrangThaiSanPham === 'DangBan' ? 'Ngừng bán' : 'Bật bán'}">
                        <i class="fas ${product.TrangThaiSanPham === 'DangBan' ? 'fa-ban' : 'fa-check-circle'}"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary" onclick="editProduct(${product.IdSanPham})" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${product.IdSanPham})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Display pagination
function displayProductsPagination(pagination) {
    const container = document.getElementById('productsPagination');
    if (!container) return;

    if (pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<nav><ul class="pagination justify-content-center">';

    // Previous button
    html += `
        <li class="page-item ${pagination.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadProducts(${pagination.currentPage - 1}); return false;">
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
                    <a class="page-link" href="#" onclick="loadProducts(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === pagination.currentPage - 3 || i === pagination.currentPage + 3) {
            html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }

    // Next button
    html += `
        <li class="page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadProducts(${pagination.currentPage + 1}); return false;">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;

    html += '</ul></nav>';
    container.innerHTML = html;
}

// Show add product modal
function showAddProductModal() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModalTitle').textContent = 'Thêm Sản Phẩm';

    // Reset images preview
    document.getElementById('imagesPreview').innerHTML = '';

    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

// Edit product
async function editProduct(id) {
    try {
        const result = await api.get(`/products/${id}`);

        if (result.success) {
            const product = result.data;

            document.getElementById('productId').value = product.IdSanPham;
            document.getElementById('productName').value = product.TenSanPham;
            document.getElementById('productPrice').value = product.GiaSanPham;
            document.getElementById('productQuantity').value = product.SoLuongSanPham;
            document.getElementById('productCategory').value = product.IdDanhMuc || '';
            document.getElementById('productBrand').value = product.IdThuongHieu || '';
            document.getElementById('productDesc').value = product.MoTaSanPham || '';
            document.getElementById('productStatus').value = product.TrangThaiSanPham;

            // Load technical specifications
            document.getElementById('productStorage').value = product.KieuOCung || '';
            document.getElementById('productStorageSize').value = product.DungLuongOCung || '';
            document.getElementById('productScreenTech').value = product.CongNgheManHinh || '';
            document.getElementById('productRefreshRate').value = product.TanSoQuet || '';
            document.getElementById('productResolution').value = product.DoPhanGiai || '';
            document.getElementById('productBattery').value = product.Pin || '';
            document.getElementById('productOrigin').value = product.XuatXu || '';
            document.getElementById('productWeight').value = product.TrongLuong || '';

            // Handle images - show preview only (can't set file input value)
            document.getElementById('productImages').value = ''; // Reset file input
            const imagesPreview = document.getElementById('imagesPreview');
            imagesPreview.innerHTML = '';
            
            if (product.images && product.images.length > 0) {
                product.images.forEach((img, index) => {
                    const imageDiv = document.createElement('div');
                    imageDiv.className = 'position-relative';
                    imageDiv.style.width = '120px';
                    imageDiv.innerHTML = `
                        <img src="${getProductImageUrl(img.Url)}" 
                             class="img-thumbnail" 
                             style="width: 120px; height: 120px; object-fit: cover;"
                             onerror="this.style.opacity='0.3'">
                        ${img.AnhMacDinh === 1 ? '<span class="badge bg-primary position-absolute top-0 start-0 m-1">Ảnh chính</span>' : ''}
                        <small class="d-block text-center text-muted mt-1">Ảnh hiện tại</small>
                    `;
                    imagesPreview.appendChild(imageDiv);
                });
                
                const noteDiv = document.createElement('div');
                noteDiv.className = 'w-100 mt-2';
                noteDiv.innerHTML = '<small class="text-info"><i class="fas fa-info-circle"></i> Chọn ảnh mới để thay thế tất cả ảnh hiện tại</small>';
                imagesPreview.appendChild(noteDiv);
            } else {
                imagesPreview.innerHTML = '<span class="text-muted">Chưa có hình</span>';
            }

            document.getElementById('productModalTitle').textContent = 'Sửa Sản Phẩm';

            const modal = new bootstrap.Modal(document.getElementById('productModal'));
            modal.show();
        } else {
            showNotification(result.message || 'Không tìm thấy sản phẩm', 'error');
        }
    } catch (error) {
        console.error('Edit product error:', error);
        showNotification('Lỗi khi tải thông tin sản phẩm', 'error');
    }
}

// Save product
async function saveProduct(event) {
    event.preventDefault();

    const id = document.getElementById('productId').value;
    const tenSanPham = document.getElementById('productName').value.trim();
    const giaSanPham = parseInt(document.getElementById('productPrice').value);
    const soLuongSanPham = parseInt(document.getElementById('productQuantity').value);
    const danhMucId = document.getElementById('productCategory').value;
    const thuongHieuId = document.getElementById('productBrand').value;
    const moTaSanPham = document.getElementById('productDesc').value;
    const trangThaiSanPham = document.getElementById('productStatus').value;

    // Validation
    if (!tenSanPham) {
        showNotification('Vui lòng nhập tên sản phẩm', 'error');
        return;
    }

    if (isNaN(giaSanPham) || giaSanPham < 5000000 || giaSanPham > 100000000) {
        showNotification('Giá phải từ 5,000,000 đến 100,000,000', 'error');
        return;
    }

    if (isNaN(soLuongSanPham) || soLuongSanPham <= 0 || soLuongSanPham > 50) {
        showNotification('Số lượng phải lớn hơn 0 và nhỏ hơn hoặc bằng 50', 'error');
        return;
    }

    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

    try {
        const imageFiles = document.getElementById('productImages').files;
        const uploadedImages = [];

        // Upload all images if files selected
        if (imageFiles && imageFiles.length > 0) {
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                
                // Check file size
                if (file.size > 5 * 1024 * 1024) {
                    showNotification(`Ảnh "${file.name}" vượt quá 5MB`, 'error');
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-save"></i> Lưu';
                    return;
                }

                const formData = new FormData();
                formData.append('image', file);

                const uploadResult = await api.post('/upload/image', formData);
                if (uploadResult.success) {
                    uploadedImages.push({
                        url: uploadResult.data.url,
                        isMain: i === 0 // First image is main
                    });
                } else {
                    showNotification(`Lỗi khi upload ảnh "${file.name}"`, 'error');
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-save"></i> Lưu';
                    return;
                }
            }
        }

        // Get technical specifications
        const kieuOCung = document.getElementById('productStorage')?.value || null;
        const dungLuongOCung = document.getElementById('productStorageSize')?.value || null;
        const congNgheManHinh = document.getElementById('productScreenTech')?.value || null;
        const tanSoQuet = document.getElementById('productRefreshRate')?.value || null;
        const doPhanGiai = document.getElementById('productResolution')?.value || null;
        const pin = document.getElementById('productBattery')?.value || null;
        const xuatXu = document.getElementById('productOrigin')?.value || null;
        const trongLuong = document.getElementById('productWeight')?.value || null;

        // Prepare product data
        const data = {
            tenSanPham,
            giaSanPham,
            soLuongSanPham,
            danhMucId,
            thuongHieuId,
            moTaSanPham,
            trangThaiSanPham,
            kieuOCung,
            dungLuongOCung,
            congNgheManHinh,
            tanSoQuet,
            doPhanGiai,
            pin,
            xuatXu,
            trongLuong,
            images: uploadedImages
        };

        let result;
        if (id) {
            result = await api.put(`/products/${id}`, data);
        } else {
            result = await api.post('/products', data);
        }

        if (result.success) {
            showNotification(result.message || 'Lưu thành công', 'success');
            bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
            loadProducts(productsCurrentPage);
            
            // Reload dashboard if function exists
            if (typeof reloadAdminDashboard === 'function') {
                reloadAdminDashboard();
            }
        } else {
            showNotification(result.message || 'Lưu thất bại', 'error');
        }
    } catch (error) {
        console.error('Save product error:', error);
        showNotification('Lỗi khi lưu sản phẩm', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-save"></i> Lưu';
    }
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
        const result = await api.delete(`/products/${id}`);

        if (result.success) {
            showNotification(result.message || 'Xóa thành công', 'success');
            loadProducts(productsCurrentPage);
            
            // Reload dashboard if function exists
            if (typeof reloadAdminDashboard === 'function') {
                reloadAdminDashboard();
            }
        } else {
            showNotification(result.message || 'Xóa thất bại', 'error');
        }
    } catch (error) {
        console.error('Delete product error:', error);
        showNotification('Lỗi khi xóa sản phẩm', 'error');
    }
}

// Toggle product status (DangBan <-> NgungBan)
async function toggleProductStatus(id, currentStatus) {
    const action = currentStatus === 'DangBan' ? 'ngừng bán' : 'bật bán';
    if (!confirm(`Bạn có chắc muốn ${action} sản phẩm này?`)) return;

    try {
        const result = await api.patch(`/products/${id}/toggle-status`);

        if (result.success) {
            showNotification(result.message || 'Cập nhật trạng thái thành công', 'success');
            loadProducts(productsCurrentPage);
            
            // Reload dashboard if function exists
            if (typeof reloadAdminDashboard === 'function') {
                reloadAdminDashboard();
            }
        } else {
            showNotification(result.message || 'Cập nhật trạng thái thất bại', 'error');
        }
    } catch (error) {
        console.error('Toggle product status error:', error);
        showNotification('Lỗi khi cập nhật trạng thái sản phẩm', 'error');
    }
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value;
    if (searchTerm) {
        loadProducts(1, { search: searchTerm });
    } else {
        loadProducts(1);
    }
}

// Preview multiple product images
function previewProductImages(input) {
    const container = document.getElementById('imagesPreview');
    container.innerHTML = '';

    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach((file, index) => {
            // Check file size
            if (file.size > 5 * 1024 * 1024) {
                showNotification(`Ảnh "${file.name}" vượt quá 5MB`, 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const imageDiv = document.createElement('div');
                imageDiv.className = 'position-relative';
                imageDiv.style.width = '120px';
                imageDiv.innerHTML = `
                    <img src="${e.target.result}" 
                         class="img-thumbnail" 
                         style="width: 120px; height: 120px; object-fit: cover;">
                    ${index === 0 ? '<span class="badge bg-primary position-absolute top-0 start-0 m-1">Ảnh chính</span>' : ''}
                    <small class="d-block text-center text-muted mt-1">${(file.size / 1024).toFixed(0)} KB</small>
                `;
                container.appendChild(imageDiv);
            };
            reader.readAsDataURL(file);
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    // Load dependencies (categories, brands)
    loadProductDependencies();

    // Listen for tab change to reload products if needed
    const productsTab = document.getElementById('products-tab');
    if (productsTab) {
        productsTab.addEventListener('shown.bs.tab', function () {
            loadProducts(1);
        });
    }

    // Initial load if on products tab
    if (productsTab && productsTab.classList.contains('active')) {
        loadProducts(1);
    }


});
