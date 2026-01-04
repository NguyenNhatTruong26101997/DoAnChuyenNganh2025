// Admin Navigation Handler
(function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'admin-dashboard.html') {
        // On dashboard page, make statistics link active
        setTimeout(() => {
            const statsLink = document.getElementById('nav-statistics');
            if (statsLink) {
                statsLink.classList.add('active');
            }
            
            // Convert other tabs to links and preserve badges
            const tabs = [
                { name: 'products', hasBadge: true, badgeId: 'lowStockBadge' },
                { name: 'orders', hasBadge: false },
                { name: 'users', hasBadge: false },
                { name: 'flashsale', hasBadge: false },
                { name: 'reviews', hasBadge: false },
                { name: 'contacts', hasBadge: true, badgeId: 'contactBadge' }
            ];
            
            tabs.forEach(tab => {
                const button = document.getElementById(tab.name + '-tab');
                if (button) {
                    const link = document.createElement('a');
                    link.className = 'nav-link';
                    link.href = 'admin.html';
                    link.innerHTML = button.innerHTML;
                    link.onclick = function() {
                        localStorage.setItem('activeAdminTab', tab.name);
                    };
                    button.parentNode.replaceChild(link, button);
                }
            });
        }, 100);
    } else if (currentPage === 'admin.html') {
        // On admin page, check for saved active tab
        setTimeout(() => {
            const savedTab = localStorage.getItem('activeAdminTab');
            if (savedTab) {
                const tabButton = document.getElementById(savedTab + '-tab');
                if (tabButton && typeof bootstrap !== 'undefined') {
                    // Remove active from products
                    const productsTab = document.getElementById('products-tab');
                    if (productsTab) {
                        productsTab.classList.remove('active');
                    }
                    // Add active to saved tab
                    tabButton.classList.add('active');
                    // Show the tab content
                    const tab = new bootstrap.Tab(tabButton);
                    tab.show();
                }
                localStorage.removeItem('activeAdminTab');
            }
        }, 100);
    }
})();
