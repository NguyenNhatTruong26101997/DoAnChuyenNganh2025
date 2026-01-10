// Header Component - Reusable Navigation Header
function loadHeader() {
  const headerHTML = `
    <header class="header">
      <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container">
          <!-- Logo/Brand -->
          <a class="navbar-brand" href="index.html">
            <i class="fas fa-laptop"></i> Laptop World
          </a>
          
          <!-- Mobile Toggle Button -->
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
                  aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          
          <!-- Navigation Menu -->
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav mx-auto">
              <li class="nav-item">
                <a class="nav-link px-3" href="index.html" id="nav-home" style="white-space: nowrap;">
                  <i class="fas fa-home me-1"></i>Trang chủ
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link px-3" href="products.html" id="nav-products" style="white-space: nowrap;">
                  <i class="fas fa-laptop me-1"></i>Sản phẩm
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link px-3" href="news.html" id="nav-news" style="white-space: nowrap;">
                  <i class="fas fa-newspaper me-1"></i>Tin tức
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link px-3" href="#" id="nav-orders" onclick="handleOrdersClick(event)" style="white-space: nowrap;">
                  <i class="fas fa-box me-1"></i>Đơn hàng
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link px-3" href="contact.html" id="nav-contact" style="white-space: nowrap;">
                  <i class="fas fa-envelope me-1"></i>Liên hệ
                </a>
              </li>
            </ul>
            
            <!-- Search Bar -->
            <div class="search-bar d-none d-lg-block me-3">
              <i class="fas fa-search"></i>
              <input type="text" class="form-control" placeholder="Tìm kiếm laptop..." id="searchInput">
            </div>
            
            <!-- User Actions -->
            <div class="d-flex align-items-center">
              <!-- Cart Icon -->
              <a href="#" class="btn btn-link position-relative me-2" id="cartBtn" onclick="handleCartClick(event)">
                <i class="fas fa-shopping-cart fs-5"></i>
                <span class="cart-badge" id="cartCount">0</span>
              </a>
              
              <!-- Notification Icon (for logged in users) -->
              <div class="dropdown me-2" id="notificationDropdown" style="display: none;">
                <button class="btn btn-link position-relative" type="button" id="notificationBtn" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fas fa-bell fs-5"></i>
                  <span class="cart-badge" id="notificationCount" style="display: none;">0</span>
                </button>
                <div class="dropdown-menu dropdown-menu-end notification-dropdown" aria-labelledby="notificationBtn" style="width: 350px; max-height: 500px; overflow-y: auto;">
                  <div class="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                    <h6 class="mb-0">Thông báo</h6>
                    <button class="btn btn-sm btn-link text-decoration-none" onclick="markAllNotificationsAsRead()">
                      Đánh dấu đã đọc
                    </button>
                  </div>
                  <div id="notificationList">
                    <div class="text-center py-3">
                      <i class="fas fa-spinner fa-spin"></i> Đang tải...
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- User Dropdown -->
              <div class="dropdown" id="userDropdown">
                <button class="btn btn-link dropdown-toggle text-decoration-none" type="button" id="userDropdownBtn" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fas fa-user fs-5"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdownBtn">
                  <li><a class="dropdown-item" href="login.html"><i class="fas fa-sign-in-alt"></i> Đăng nhập</a></li>
                  <li><a class="dropdown-item" href="register.html"><i class="fas fa-user-plus"></i> Đăng ký</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  `;

  document.getElementById('header-container').innerHTML = headerHTML;

  // Highlight active page
  highlightActivePage();

  // Update cart count
  updateCartCount();

  // Update user menu based on authentication status
  updateUserMenu();

  // Show/hide admin menu based on user role
  updateAdminMenu();

  // Add scroll effect
  window.addEventListener('scroll', function () {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Search functionality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        const searchTerm = this.value.trim();
        if (searchTerm) {
          window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
        }
      }
    });
  }
}

// Highlight active page in navigation
function highlightActivePage() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// Update cart count from API
async function updateCartCount() {
  const cartCountElement = document.getElementById('cartCount');
  if (!cartCountElement) return;

  // Check if user is logged in
  const token = localStorage.getItem('token');
  if (!token) {
    cartCountElement.textContent = '0';
    return;
  }

  try {
    // Load cart from API
    const result = await api.get('/cart');
    
    if (result.success && result.data) {
      const totalItems = result.data.items.length;
      cartCountElement.textContent = totalItems;
    } else {
      cartCountElement.textContent = '0';
    }
  } catch (error) {
    console.error('Update cart count error:', error);
    cartCountElement.textContent = '0';
  }
}

// Make updateCartCount available globally
window.updateCartCount = updateCartCount;

// Update user menu based on authentication status
function updateUserMenu() {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Parse user error:', e);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
  
  const isLoggedIn = user && token;

  const userDropdown = document.getElementById('userDropdown');
  if (!userDropdown) return;

  const dropdownMenu = userDropdown.querySelector('.dropdown-menu');
  if (!dropdownMenu) return;

  if (isLoggedIn) {
    // User is logged in - show account and logout
    const userName = user.hoTen || user.HoTen || user.email || user.Email || 'Người dùng';
    const isAdmin = user.vaiTro === 'Admin' || user.vaiTro === 'admin';
    
    let menuHTML = `
      <li><div class="dropdown-item-text"><strong>${escapeHtml(userName)}</strong></div></li>
      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user-circle"></i> Hồ sơ</a></li>
    `;
    
    // Chỉ hiện menu Admin trong dropdown nếu là admin
    if (isAdmin) {
      menuHTML += `<li><a class="dropdown-item" href="admin.html"><i class="fas fa-user-shield"></i> Quản trị</a></li>`;
    }
    
    menuHTML += `<li><a class="dropdown-item" href="#" onclick="logout(event); return false;"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a></li>`;
    
    dropdownMenu.innerHTML = menuHTML;
  } else {
    // User is not logged in - show login and register
    dropdownMenu.innerHTML = `
      <li><a class="dropdown-item" href="login.html"><i class="fas fa-sign-in-alt"></i> Đăng nhập</a></li>
      <li><a class="dropdown-item" href="register.html"><i class="fas fa-user-plus"></i> Đăng ký</a></li>
    `;
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show/hide elements based on user role
function updateAdminMenu() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const contactMenuItem = document.getElementById('nav-contact')?.parentElement;
  const cartBtn = document.getElementById('cartBtn');
  const newsMenuItem = document.getElementById('nav-news')?.parentElement;
  const ordersMenuItem = document.getElementById('nav-orders')?.parentElement;
  
  console.log('updateAdminMenu - User:', user);
  console.log('updateAdminMenu - Token:', token ? 'exists' : 'null');
  console.log('updateAdminMenu - vaiTro:', user?.vaiTro);

  // Check if user is logged in
  const isLoggedIn = user && token;
  
  // Check if user is admin
  const isAdmin = isLoggedIn && (user.vaiTro === 'Admin' || user.vaiTro === 'admin');

  // Ẩn/hiện menu "Tin tức" và "Đơn hàng" - chỉ hiện khi đã đăng nhập
  if (newsMenuItem) {
    newsMenuItem.style.display = isLoggedIn ? 'block' : 'none';
  }
  if (ordersMenuItem) {
    // Admin không hiện menu đơn hàng, chỉ user thường
    ordersMenuItem.style.display = (isLoggedIn && !isAdmin) ? 'block' : 'none';
  }

  if (isAdmin) {
    console.log('User is admin - hiding contact and cart');
    
    // Ẩn menu "Liên hệ" cho admin
    if (contactMenuItem) {
      contactMenuItem.style.display = 'none';
    }
    
    // Ẩn nút "Giỏ hàng" cho admin
    if (cartBtn) {
      cartBtn.style.display = 'none';
    }
  } else {
    console.log('User is not admin - showing contact and cart');
    
    // Hiện menu "Liên hệ" cho user thường
    if (contactMenuItem) {
      contactMenuItem.style.display = 'block';
    }
    
    // Hiện nút "Giỏ hàng" cho user thường (chỉ khi đã đăng nhập)
    if (cartBtn) {
      cartBtn.style.display = isLoggedIn ? 'block' : 'none';
    }
  }
}

// Handle cart click - require login
function handleCartClick(event) {
  event.preventDefault();
  
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Vui lòng đăng nhập để xem giỏ hàng');
    window.location.href = 'login.html';
    return;
  }
  
  window.location.href = 'cart.html';
}

// Handle orders click - require login
function handleOrdersClick(event) {
  event.preventDefault();
  
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Vui lòng đăng nhập để xem đơn hàng');
    window.location.href = 'login.html';
    return;
  }
  
  window.location.href = 'orders.html';
}

// Make updateAdminMenu available globally
window.updateAdminMenu = updateAdminMenu;


// Logout function
function logout(event) {
  if (event) {
    event.preventDefault();
  }

  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  }
}

// ============ NOTIFICATION FUNCTIONS ============

// Load notifications
async function loadNotifications() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await api.get('/notifications?limit=10');
    
    if (response.success) {
      displayNotifications(response.data);
      updateNotificationCount(response.unreadCount);
    }
  } catch (error) {
    console.error('Load notifications error:', error);
  }
}

// Display notifications in dropdown
function displayNotifications(notifications) {
  const notificationList = document.getElementById('notificationList');
  if (!notificationList) return;

  if (notifications.length === 0) {
    notificationList.innerHTML = `
      <div class="text-center py-4 text-muted">
        <i class="fas fa-inbox fa-2x mb-2"></i>
        <p class="mb-0">Không có thông báo</p>
      </div>
    `;
    return;
  }

  notificationList.innerHTML = notifications.map(notif => `
    <div class="notification-item ${notif.DaDoc ? '' : 'unread'}" data-id="${notif.IdThongBao}">
      <div class="d-flex align-items-start p-3 border-bottom" style="cursor: pointer;" onclick="handleNotificationClick(${notif.IdThongBao}, '${notif.LienKet || ''}')">
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <strong class="notification-title">${escapeHtml(notif.TieuDe)}</strong>
            ${!notif.DaDoc ? '<span class="badge bg-primary badge-sm">Mới</span>' : ''}
          </div>
          <p class="notification-content mb-1">${escapeHtml(notif.NoiDung)}</p>
          <small class="text-muted">
            <i class="fas fa-clock"></i> ${formatTimeAgo(notif.NgayTao)}
          </small>
        </div>
        <button class="btn btn-sm btn-link text-danger" onclick="deleteNotification(event, ${notif.IdThongBao})" title="Xóa">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// Update notification count badge
function updateNotificationCount(count) {
  const notificationCount = document.getElementById('notificationCount');
  const notificationDropdown = document.getElementById('notificationDropdown');
  
  if (notificationCount && notificationDropdown) {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Luôn hiển thị chuông khi đã đăng nhập
      notificationDropdown.style.display = 'block';
      
      // Chỉ hiển thị badge số khi có thông báo
      if (count > 0) {
        notificationCount.textContent = count > 99 ? '99+' : count;
        notificationCount.style.display = 'inline-block';
      } else {
        notificationCount.style.display = 'none';
      }
    } else {
      notificationDropdown.style.display = 'none';
    }
  }
}

// Handle notification click
async function handleNotificationClick(notificationId, link) {
  try {
    // Mark as read
    await api.put(`/notifications/${notificationId}/read`);
    
    // Reload notifications
    await loadNotifications();
    
    // Navigate to link if exists
    if (link) {
      // Check if link contains hash (e.g., admin.html#reviews)
      if (link.includes('#')) {
        const [page, hash] = link.split('#');
        const currentPage = window.location.pathname.split('/').pop();
        
        // If already on the same page, just activate the tab
        if (currentPage === page || (currentPage === 'admin.html' && page === 'admin.html')) {
          // Activate the tab
          const tabId = hash + '-tab';
          const tabElement = document.getElementById(tabId);
          if (tabElement) {
            const tab = new bootstrap.Tab(tabElement);
            tab.show();
          }
        } else {
          // Navigate to the page with hash
          window.location.href = link;
        }
      } else {
        // Regular link, just navigate
        window.location.href = link;
      }
    }
  } catch (error) {
    console.error('Handle notification click error:', error);
  }
}

// Mark all notifications as read
async function markAllNotificationsAsRead() {
  try {
    const response = await api.put('/notifications/read-all');
    
    if (response.success) {
      await loadNotifications();
      showNotification('Đã đánh dấu tất cả đã đọc', 'success');
    }
  } catch (error) {
    console.error('Mark all as read error:', error);
    showNotification('Có lỗi xảy ra', 'error');
  }
}

// Delete notification
async function deleteNotification(event, notificationId) {
  event.stopPropagation();
  
  if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;
  
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    
    if (response.success) {
      await loadNotifications();
      showNotification('Đã xóa thông báo', 'success');
    }
  } catch (error) {
    console.error('Delete notification error:', error);
    showNotification('Có lỗi xảy ra', 'error');
  }
}

// Format time ago
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Vừa xong';
  if (seconds < 3600) return Math.floor(seconds / 60) + ' phút trước';
  if (seconds < 86400) return Math.floor(seconds / 3600) + ' giờ trước';
  if (seconds < 604800) return Math.floor(seconds / 86400) + ' ngày trước';
  
  return date.toLocaleDateString('vi-VN');
}

// Make functions globally available
window.loadNotifications = loadNotifications;
window.handleNotificationClick = handleNotificationClick;
window.markAllNotificationsAsRead = markAllNotificationsAsRead;
window.deleteNotification = deleteNotification;

// Load notifications when dropdown is opened
document.addEventListener('DOMContentLoaded', function() {
  const notificationBtn = document.getElementById('notificationBtn');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', function() {
      loadNotifications();
    });
  }
  
  // Load initial notification count
  const token = localStorage.getItem('token');
  if (token) {
    loadNotifications();
    
    // Refresh notifications every 30 seconds
    setInterval(loadNotifications, 30000);
  }
});

// Load header when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadHeader);
} else {
  loadHeader();
}
