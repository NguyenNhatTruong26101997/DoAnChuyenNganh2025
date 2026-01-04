// Admin Page Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for all scripts to load
    setTimeout(() => {
        // Load products by default
        if (typeof loadProducts === 'function') {
            loadProducts();
        }
        
        // Load categories and brands for filters
        if (typeof loadCategoriesAndBrands === 'function') {
            loadCategoriesAndBrands();
        }
        
        // Check for active tab from localStorage
        const activeTab = localStorage.getItem('lastActiveTab');
        if (activeTab && typeof bootstrap !== 'undefined') {
            const tabButton = document.getElementById(activeTab + '-tab');
            if (tabButton) {
                const tab = new bootstrap.Tab(tabButton);
                tab.show();
                
                // Load data for that tab
                loadTabData(activeTab);
            }
        }
        
        // Save active tab when switching
        const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabButtons.forEach(button => {
            button.addEventListener('shown.bs.tab', function(e) {
                const tabId = e.target.id.replace('-tab', '');
                localStorage.setItem('lastActiveTab', tabId);
                loadTabData(tabId);
            });
        });
    }, 500);
});

function loadTabData(tabName) {
    switch(tabName) {
        case 'products':
            if (typeof loadProducts === 'function') loadProducts();
            break;
        case 'orders':
            if (typeof loadAdminOrders === 'function') {
                console.log('Loading admin orders from init...');
                loadAdminOrders();
            }
            break;
        case 'users':
            if (typeof loadUsers === 'function') loadUsers();
            break;
        case 'flashsale':
            if (typeof loadFlashSaleProducts === 'function') loadFlashSaleProducts();
            break;
        case 'coupons':
            if (typeof loadCoupons === 'function') loadCoupons();
            break;
        case 'reviews':
            if (typeof loadReviews === 'function') loadReviews();
            break;
        case 'contacts':
            if (typeof loadContacts === 'function') loadContacts();
            break;
    }
}
