// Admin News Management
let currentNews = [];

// Make function global
window.loadAdminNews = loadAdminNews;
window.showAddNewsModal = showAddNewsModal;
window.showEditNewsModal = showEditNewsModal;
window.submitNewsForm = submitNewsForm;
window.deleteNews = deleteNews;
window.viewNews = viewNews;

// Wait for everything to load
window.addEventListener('load', function() {
    console.log('Window loaded, initializing news management');
    
    // Wait a bit more for Bootstrap tabs
    setTimeout(function() {
        const newsTab = document.getElementById('news-tab');
        if (newsTab) {
            console.log('News tab found!');
            
            newsTab.addEventListener('click', function(e) {
                console.log('News tab clicked');
                setTimeout(() => {
                    loadAdminNews();
                }, 300);
            });
            
            newsTab.addEventListener('shown.bs.tab', function(e) {
                console.log('News tab shown event');
                loadAdminNews();
            });
        } else {
            console.error('News tab still not found after delay');
        }
        
        // Check if already on news tab
        const newsPane = document.getElementById('news');
        if (newsPane && newsPane.classList.contains('active')) {
            console.log('Already on news tab, loading...');
            loadAdminNews();
        }
    }, 500);
});

async function loadAdminNews() {
    try {
        console.log('Loading admin news...');
        const tbody = document.getElementById('newsTableBody');
        if (!tbody) {
            console.error('newsTableBody not found');
            return;
        }

        tbody.innerHTML = '<tr><td colspan="6" class="text-center"><i class="fas fa-spinner fa-spin"></i> Đang tải...</td></tr>';

        const response = await api.get('/news?limit=100');
        console.log('News response:', response);

        if (response.success && response.data) {
            currentNews = response.data;
            console.log('Loaded news:', currentNews.length, 'items');
            renderAdminNews(currentNews);
        } else {
            console.error('Failed to load news:', response);
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">
                        <i class="fas fa-exclamation-circle"></i> Không thể tải tin tức
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Load admin news error:', error);
        const tbody = document.getElementById('newsTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">
                        <i class="fas fa-exclamation-circle"></i> Lỗi kết nối đến server
                    </td>
                </tr>
            `;
        }
    }
}

function renderAdminNews(newsList) {
    const tbody = document.getElementById('newsTableBody');
    if (!tbody) return;

    if (newsList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5>Chưa có tin tức nào</h5>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = newsList.map(news => `
        <tr>
            <td>${news.IdTinTuc}</td>
            <td>
                ${news.AnhBia ? `<img src="${getImageUrl(news.AnhBia)}" style="width: 60px; height: 40px; object-fit: cover;" class="rounded">` : '<i class="fas fa-image text-muted"></i>'}
            </td>
            <td><strong>${news.DanhMuc || 'Tin tức'}</strong></td>
            <td>${escapeHtml(news.TacGia)}</td>
            <td>
                <small>${formatDateTime(news.NgayTao)}</small><br>
                <span class="badge bg-info">${news.LuotXem} lượt xem</span>
                <span class="badge bg-secondary">${news.SoBinhLuan || 0} bình luận</span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewNews(${news.IdTinTuc})" title="Xem">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-warning" onclick="showEditNewsModal(${news.IdTinTuc})" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteNews(${news.IdTinTuc})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function showAddNewsModal() {
    document.getElementById('newsModalTitle').textContent = 'Thêm tin tức mới';
    document.getElementById('newsForm').reset();
    document.getElementById('newsId').value = '';
    document.getElementById('newsDanhMuc').value = '';
    document.getElementById('currentImage').style.display = 'none';
    
    const modal = new bootstrap.Modal(document.getElementById('newsModal'));
    modal.show();
}

async function showEditNewsModal(newsId) {
    try {
        const response = await api.get(`/news/${newsId}`);
        
        if (response.success) {
            const news = response.data;
            
            document.getElementById('newsModalTitle').textContent = 'Sửa tin tức';
            document.getElementById('newsId').value = news.IdTinTuc;
            document.getElementById('newsDanhMuc').value = news.DanhMuc || 'Hàng Mới';
            document.getElementById('newsNoiDung').value = news.NoiDung;
            
            const currentImage = document.getElementById('currentImage');
            if (news.AnhBia) {
                currentImage.innerHTML = `<img src="${getImageUrl(news.AnhBia)}" class="img-thumbnail" style="max-width: 200px;">`;
                currentImage.style.display = 'block';
            } else {
                currentImage.style.display = 'none';
            }
            
            const modal = new bootstrap.Modal(document.getElementById('newsModal'));
            modal.show();
        } else {
            showNotification('Không thể tải thông tin tin tức', 'error');
        }
    } catch (error) {
        console.error('Load news error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

async function submitNewsForm(event) {
    event.preventDefault();

    const newsId = document.getElementById('newsId').value;
    const danhMuc = document.getElementById('newsDanhMuc').value;
    const noiDung = document.getElementById('newsNoiDung').value.trim();
    const anhBiaFile = document.getElementById('newsAnhBia').files[0];

    if (!danhMuc) {
        showNotification('Vui lòng chọn danh mục', 'error');
        return;
    }

    if (!noiDung || noiDung.length < 10) {
        showNotification('Nội dung phải ít nhất 10 ký tự', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('danhMuc', danhMuc);
    formData.append('noiDung', noiDung);
    if (anhBiaFile) {
        formData.append('anhBia', anhBiaFile);
    }

    try {
        const token = localStorage.getItem('token');
        const API_BASE = window.location.protocol === 'file:' 
            ? 'http://localhost:3000' 
            : (window.location.port === '3000' ? '' : 'http://localhost:3000');
        const API_URL = API_BASE + '/api';

        let response;
        if (newsId) {
            // Update
            response = await fetch(`${API_URL}/news/${newsId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
        } else {
            // Create
            response = await fetch(`${API_URL}/news`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
        }

        const result = await response.json();

        if (result.success) {
            showNotification(newsId ? 'Cập nhật tin tức thành công' : 'Thêm tin tức thành công', 'success');
            
            // Close modal
            const modalElement = document.getElementById('newsModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
            
            // Reload news list
            setTimeout(() => {
                loadAdminNews();
            }, 500);
            
            // Reload dashboard if function exists
            if (typeof reloadAdminDashboard === 'function') {
                reloadAdminDashboard();
            }
        } else {
            showNotification(result.message || 'Có lỗi xảy ra', 'error');
        }
    } catch (error) {
        console.error('Submit news error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

async function deleteNews(newsId) {
    if (!confirm('Bạn có chắc muốn xóa tin tức này?\n\nHành động này sẽ xóa cả tất cả bình luận liên quan.')) {
        return;
    }

    try {
        const response = await api.delete(`/news/${newsId}`);

        if (response.success) {
            showNotification('Xóa tin tức thành công', 'success');
            loadAdminNews();
            
            // Reload dashboard if function exists
            if (typeof reloadAdminDashboard === 'function') {
                reloadAdminDashboard();
            }
        } else {
            showNotification(response.message || 'Không thể xóa tin tức', 'error');
        }
    } catch (error) {
        console.error('Delete news error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

function viewNews(newsId) {
    window.open(`news-detail.html?id=${newsId}`, '_blank');
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return '';
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}
