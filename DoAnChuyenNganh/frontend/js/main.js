// Main JavaScript - Laptop World
// Common functions and utilities used across the site

// ========================================
// Cart Management Functions
// ========================================

// Add item to cart
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if product already exists in cart
    const existingIndex = cart.findIndex(item => item.id === product.id || item.productId === product.id);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: product.id || product.IdSanPham,
            productId: product.id || product.IdSanPham,
            name: product.name || product.TenSanPham,
            price: product.price || product.GiaSanPham,
            image: product.image || product.AnhChinh || product.HinhAnh,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Đã thêm vào giỏ hàng!', 'success');
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId && item.productId !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    if (window.location.pathname.includes('cart.html')) {
        location.reload();
    }
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const index = cart.findIndex(item => item.id === productId || item.productId === productId);

    if (index > -1) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            cart[index].quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
        }
    }
}

// Get cart items
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Calculate cart total
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Clear cart
function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
}

// ========================================
// User Management Functions
// ========================================

function isLoggedIn() {
    return localStorage.getItem('user') !== null && localStorage.getItem('token') !== null;
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
}

// ========================================
// Notification System
// ========================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.style.animation = 'slideInRight 0.3s ease';
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========================================
// Form Validation
// ========================================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9]{10,11}$/;
    return re.test(phone);
}

function validatePassword(password) {
    return password.length >= 6 && password.length <= 12;
}

// ========================================
// Utility Functions
// ========================================

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatNumber(num) {
    return new Intl.NumberFormat('vi-VN').format(num);
}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// ========================================
// Loading Spinner
// ========================================

function showLoading() {
    const loading = document.createElement('div');
    loading.id = 'loading-spinner';
    loading.className = 'position-fixed top-50 start-50 translate-middle';
    loading.style.zIndex = '9999';
    loading.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loading-spinner');
    if (loading) {
        loading.remove();
    }
}

// ========================================
// Initialize
// ========================================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

console.log('Laptop World - Main JS Loaded');
