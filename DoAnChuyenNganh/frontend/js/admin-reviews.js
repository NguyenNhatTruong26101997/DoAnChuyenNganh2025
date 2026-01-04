// Admin Reviews Management
let reviewsCurrentPage = 1;
const reviewsPerPage = 20;

// Initialize when reviews tab is shown
document.addEventListener('DOMContentLoaded', function() {
    const reviewsTab = document.getElementById('reviews-tab');
    if (reviewsTab) {
        reviewsTab.addEventListener('shown.bs.tab', function() {
            loadAdminReviews();
            loadProductsForFilter();
        });
    }
});

// Load reviews for admin
async function loadAdminReviews(page = 1) {
    reviewsCurrentPage = page;
    const search = document.getElementById('reviewSearch')?.value || '';
    const productId = document.getElementById('reviewProductFilter')?.value || '';

    try {
        const result = await reviewApi.getAllReviews({
            page,
            limit: reviewsPerPage,
            search,
            productId
        });

        if (result.success) {
            renderReviewsTable(result.data.reviews);
            renderReviewsPagination(result.data.pagination);
        } else {
            showNotification(result.message || 'Lỗi khi tải bình luận', 'error');
        }
    } catch (error) {
        console.error('Load reviews error:', error);
        showNotification('Lỗi kết nối server', 'error');
    }
}

// Render reviews table
function renderReviewsTable(reviews) {
    const tbody = document.getElementById('reviewsTableBody');
    
    if (!reviews || reviews.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Không có bình luận nào</td></tr>';
        return;
    }

    let html = '';
    reviews.forEach(review => {
        const stars = review.XepLoai ? generateStarsHtml(review.XepLoai) : '<span class="text-muted">Trả lời</span>';
        const isReply = review.ParentId !== null;
        
        html += `
            <tr class="${isReply ? 'table-light' : ''}">
                <td>${review.IdDanhGia}</td>
                <td>
                    <strong>${escapeHtml(review.HoTen)}</strong>
                    <br><small class="text-muted">${escapeHtml(review.Email)}</small>
                </td>
                <td>${escapeHtml(review.TenSanPham || 'N/A')}</td>
                <td>${stars}</td>
                <td>
                    <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" 
                         title="${escapeHtml(review.BinhLuan)}">
                        ${isReply ? '<i class="fas fa-reply text-muted me-1"></i>' : ''}
                        ${escapeHtml(review.BinhLuan)}
                    </div>
                </td>
                <td><small>${formatDateTime(review.NgayTao)}</small></td>
                <td>
                    <div class="btn-group btn-group-sm">
                        ${!isReply ? `
                            <button class="btn btn-outline-primary" onclick="showAdminReplyModal(${review.IdDanhGia}, '${escapeHtml(review.BinhLuan)}')" title="Trả lời">
                                <i class="fas fa-reply"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-outline-danger" onclick="deleteAdminReview(${review.IdDanhGia})" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Render pagination
function renderReviewsPagination(pagination) {
    const container = document.getElementById('reviewsPagination');
    if (!container) return;

    const { total, page, totalPages } = pagination;
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<nav><ul class="pagination justify-content-center">';
    
    // Previous button
    html += `
        <li class="page-item ${page === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadAdminReviews(${page - 1}); return false;">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
            html += `
                <li class="page-item ${i === page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="loadAdminReviews(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === page - 3 || i === page + 3) {
            html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }

    // Next button
    html += `
        <li class="page-item ${page === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadAdminReviews(${page + 1}); return false;">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;

    html += '</ul></nav>';
    html += `<p class="text-center text-muted small">Tổng: ${total} bình luận</p>`;
    
    container.innerHTML = html;
}

// Load products for filter dropdown
async function loadProductsForFilter() {
    try {
        const result = await api.get('/products?limit=100');
        if (result.success) {
            const select = document.getElementById('reviewProductFilter');
            if (!select) return;
            
            // Keep first option
            select.innerHTML = '<option value="">Tất cả sản phẩm</option>';
            
            result.data.products.forEach(product => {
                select.innerHTML += `<option value="${product.IdSanPham}">${escapeHtml(product.TenSanPham)}</option>`;
            });
        }
    } catch (error) {
        console.error('Load products error:', error);
    }
}

// Search reviews
function searchReviews() {
    loadAdminReviews(1);
}

// Show admin reply modal
function showAdminReplyModal(reviewId, originalContent) {
    document.getElementById('adminReplyReviewId').value = reviewId;
    document.getElementById('adminReplyOriginal').textContent = originalContent;
    document.getElementById('adminReplyContent').value = '';
    new bootstrap.Modal(document.getElementById('adminReplyModal')).show();
}

// Submit admin reply
async function submitAdminReply(event) {
    event.preventDefault();
    
    const reviewId = document.getElementById('adminReplyReviewId').value;
    const content = document.getElementById('adminReplyContent').value.trim();

    if (!content) {
        showNotification('Vui lòng nhập nội dung trả lời', 'error');
        return;
    }

    try {
        const result = await reviewApi.adminReply(reviewId, content);
        
        if (result.success) {
            showNotification('Trả lời thành công!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('adminReplyModal')).hide();
            loadAdminReviews(reviewsCurrentPage);
        } else {
            showNotification(result.message || 'Lỗi khi trả lời', 'error');
        }
    } catch (error) {
        console.error('Reply error:', error);
        showNotification('Lỗi kết nối server', 'error');
    }
}

// Delete review (admin)
async function deleteAdminReview(reviewId) {
    if (!confirm('Bạn có chắc muốn xóa bình luận này? Tất cả trả lời cũng sẽ bị xóa.')) {
        return;
    }

    try {
        const result = await reviewApi.deleteReview(reviewId);
        
        if (result.success) {
            showNotification('Xóa bình luận thành công!', 'success');
            loadAdminReviews(reviewsCurrentPage);
        } else {
            showNotification(result.message || 'Lỗi khi xóa', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Lỗi kết nối server', 'error');
    }
}

// Helper: Generate stars HTML
function generateStarsHtml(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            html += '<i class="fas fa-star text-warning"></i>';
        } else {
            html += '<i class="far fa-star text-muted"></i>';
        }
    }
    return html;
}

// Helper: Format datetime
function formatDateTime(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Helper: Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
