/**
 * Laptop World - Main JavaScript
 * Handles component loading, interactions, and dynamic features
 */

// ============= COMPONENT LOADER =============
/**
 * Load HTML components dynamically
 * @param {string} elementId - ID of element to load component into
 * @param {string} componentPath - Path to component HTML file
 */
function loadComponent(elementId, componentPath) {
    const element = document.getElementById(elementId);
    if (!element) return;

    fetch(componentPath)
        .then(response => response.text())
        .then(data => {
            element.innerHTML = data;
            initializeComponentFeatures();
        })
        .catch(error => {
            console.error('Error loading component:', error);
            element.innerHTML = '<p class="text-danger">Không thể tải component</p>';
        });
}

// ============= INITIALIZE FEATURES =============
function initializeComponentFeatures() {
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // Initialize popovers
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
}

// ============= BACK TO TOP BUTTON =============
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    if (!backToTopButton) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.remove('d-none');
        } else {
            backToTopButton.classList.add('d-none');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============= SHOPPING CART =============
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartCount();
    }

    loadCart() {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.showNotification('Đã thêm vào giỏ hàng!', 'success');
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.showNotification('Đã xóa khỏi giỏ hàng!', 'info');
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            this.saveCart();
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    updateCartCount() {
        const cartCount = this.items.reduce((total, item) => total + item.quantity, 0);
        const badges = document.querySelectorAll('.badge.bg-danger');
        badges.forEach(badge => {
            badge.textContent = cartCount;
        });
    }

    showNotification(message, type = 'success') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        setTimeout(() => toast.remove(), 3000);
    }
}

// Initialize cart
const cart = new ShoppingCart();

// ============= PRODUCT CARD INTERACTIONS =============
function initProductCards() {
    // Add to cart buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add-cart') || 
            e.target.closest('.btn-add-cart')) {
            e.preventDefault();
            
            // Sample product data - in real app, get from data attributes
            const product = {
                id: Date.now(),
                name: 'Dell Inspiron 15 3520',
                price: 15990000,
                image: 'product.jpg'
            };
            
            cart.addItem(product);
        }
    });

    // Wishlist buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('wishlist-btn') || 
            e.target.closest('.wishlist-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.wishlist-btn');
            const icon = btn.querySelector('i');
            
            if (icon.classList.contains('bi-heart')) {
                icon.classList.remove('bi-heart');
                icon.classList.add('bi-heart-fill');
                btn.classList.add('text-danger');
                cart.showNotification('Đã thêm vào yêu thích!', 'info');
            } else {
                icon.classList.remove('bi-heart-fill');
                icon.classList.add('bi-heart');
                btn.classList.remove('text-danger');
                cart.showNotification('Đã xóa khỏi yêu thích!', 'info');
            }
        }
    });
}

// ============= SEARCH FUNCTIONALITY =============
function initSearch() {
    const searchForms = document.querySelectorAll('form');
    
    searchForms.forEach(form => {
        const input = form.querySelector('input[type="text"]');
        if (!input) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = input.value.trim();
            
            if (query) {
                window.location.href = `pages/products.html?search=${encodeURIComponent(query)}`;
            }
        });
    });
}

// ============= QUANTITY CONTROLS =============
function initQuantityControls() {
    document.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const inputGroup = button.closest('.input-group');
        if (!inputGroup) return;

        const input = inputGroup.querySelector('input[type="number"]');
        if (!input) return;

        const currentValue = parseInt(input.value) || 1;

        if (button.textContent.includes('-') && currentValue > 1) {
            input.value = currentValue - 1;
        } else if (button.textContent.includes('+')) {
            input.value = currentValue + 1;
        }

        // Trigger change event
        input.dispatchEvent(new Event('change'));
    });
}

// ============= IMAGE GALLERY =============
function initImageGallery() {
    const thumbnails = document.querySelectorAll('.thumbnail-gallery img');
    const mainImage = document.querySelector('.main-image img');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            if (mainImage) {
                mainImage.src = thumbnail.src.replace('150x150', '600x600');
            }
            
            // Remove active class from all
            thumbnails.forEach(t => t.classList.remove('border-primary'));
            // Add active class to clicked
            thumbnail.classList.add('border-primary');
        });
    });
}

// ============= FILTERS =============
function initFilters() {
    const filterCheckboxes = document.querySelectorAll('.filter-card input[type="checkbox"]');
    
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            applyFilters();
        });
    });
}

function applyFilters() {
    // Collect selected filters
    const filters = {
        price: [],
        brand: [],
        cpu: [],
        ram: []
    };

    document.querySelectorAll('.filter-card input[type="checkbox"]:checked').forEach(checkbox => {
        const filterType = checkbox.closest('.filter-card').querySelector('.card-header h6').textContent.trim();
        const value = checkbox.id;
        
        if (filterType.includes('Giá')) filters.price.push(value);
        else if (filterType.includes('Thương hiệu')) filters.brand.push(value);
        else if (filterType.includes('Bộ xử lý')) filters.cpu.push(value);
        else if (filterType.includes('RAM')) filters.ram.push(value);
    });

    console.log('Applied filters:', filters);
    // In real app, filter products based on selected filters
}

// ============= PASSWORD TOGGLE =============
function initPasswordToggle() {
    document.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const icon = button.querySelector('.bi-eye, .bi-eye-slash');
        if (!icon) return;

        const inputGroup = button.closest('.input-group');
        const input = inputGroup.querySelector('input[type="password"], input[type="text"]');

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        }
    });
}

// ============= FORM VALIDATION =============
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            form.classList.add('was-validated');
        });
    });
}

// ============= COUNTDOWN TIMER =============
function initCountdown() {
    const countdownElements = document.querySelectorAll('.countdown');
    
    countdownElements.forEach(element => {
        setInterval(() => {
            // Sample countdown - in real app, calculate from actual deadline
            const hours = element.querySelector('.countdown-item:nth-child(1) .bg-white');
            const minutes = element.querySelector('.countdown-item:nth-child(2) .bg-white');
            const seconds = element.querySelector('.countdown-item:nth-child(3) .bg-white');
            
            if (seconds && minutes && hours) {
                let sec = parseInt(seconds.textContent);
                let min = parseInt(minutes.textContent);
                let hr = parseInt(hours.textContent);
                
                sec--;
                if (sec < 0) {
                    sec = 59;
                    min--;
                }
                if (min < 0) {
                    min = 59;
                    hr--;
                }
                if (hr < 0) {
                    hr = 23;
                }
                
                hours.textContent = hr.toString().padStart(2, '0');
                minutes.textContent = min.toString().padStart(2, '0');
                seconds.textContent = sec.toString().padStart(2, '0');
            }
        }, 1000);
    });
}

// ============= SMOOTH SCROLL =============
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============= INITIALIZE ON PAGE LOAD =============
document.addEventListener('DOMContentLoaded', () => {
    initBackToTop();
    initProductCards();
    initSearch();
    initQuantityControls();
    initImageGallery();
    initFilters();
    initPasswordToggle();
    initFormValidation();
    initCountdown();
    initSmoothScroll();
    initializeComponentFeatures();
    
    console.log('Laptop World - All features initialized');
});

// ============= WINDOW LOAD =============
window.addEventListener('load', () => {
    // Hide loading spinner if exists
    const loader = document.querySelector('.page-loader');
    if (loader) {
        loader.style.display = 'none';
    }
});
