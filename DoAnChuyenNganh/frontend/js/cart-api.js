// Cart API Functions
// Requires: api.js loaded first

// Add product to cart
async function addToCartAPI(productId, quantity = 1) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Vui lòng đăng nhập để thêm vào giỏ hàng', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return false;
        }

        const result = await api.post('/cart', {
            sanPhamId: productId,
            soLuong: quantity
        });

        if (result.success) {
            showNotification('Đã thêm vào giỏ hàng!', 'success');
            
            // Update cart count in header
            if (typeof window.updateCartCount === 'function') {
                await window.updateCartCount();
            }
            
            return true;
        } else {
            showNotification(result.message || 'Không thể thêm vào giỏ hàng', 'error');
            return false;
        }
    } catch (error) {
        console.error('Add to cart error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
        return false;
    }
}

// Remove product from cart
async function removeFromCartAPI(itemId) {
    try {
        const result = await api.delete(`/cart/${itemId}`);

        if (result.success) {
            showNotification('Đã xóa khỏi giỏ hàng', 'success');
            
            // Update cart count in header
            if (typeof window.updateCartCount === 'function') {
                await window.updateCartCount();
            }
            
            return true;
        } else {
            showNotification(result.message || 'Không thể xóa sản phẩm', 'error');
            return false;
        }
    } catch (error) {
        console.error('Remove from cart error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
        return false;
    }
}

// Update cart item quantity
async function updateCartItemAPI(itemId, quantity) {
    try {
        const result = await api.put(`/cart/${itemId}`, {
            soLuong: quantity
        });

        if (result.success) {
            // Update cart count in header
            if (typeof window.updateCartCount === 'function') {
                await window.updateCartCount();
            }
            
            return true;
        } else {
            showNotification(result.message || 'Không thể cập nhật số lượng', 'error');
            return false;
        }
    } catch (error) {
        console.error('Update cart item error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
        return false;
    }
}

// Get cart
async function getCartAPI() {
    try {
        const result = await api.get('/cart');

        if (result.success) {
            return result.data;
        } else {
            return { items: [], total: 0, itemCount: 0 };
        }
    } catch (error) {
        console.error('Get cart error:', error);
        return { items: [], total: 0, itemCount: 0 };
    }
}

// Clear cart
async function clearCartAPI() {
    try {
        const result = await api.delete('/cart');

        if (result.success) {
            showNotification('Đã xóa toàn bộ giỏ hàng', 'success');
            
            // Update cart count in header
            if (typeof window.updateCartCount === 'function') {
                await window.updateCartCount();
            }
            
            return true;
        } else {
            showNotification(result.message || 'Không thể xóa giỏ hàng', 'error');
            return false;
        }
    } catch (error) {
        console.error('Clear cart error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
        return false;
    }
}

// Make functions available globally
window.addToCartAPI = addToCartAPI;
window.removeFromCartAPI = removeFromCartAPI;
window.updateCartItemAPI = updateCartItemAPI;
window.getCartAPI = getCartAPI;
window.clearCartAPI = clearCartAPI;
