// Admin Contact Management
let contactsData = [];
let contactsCurrentPage = 1;
const contactsPerPage = 10;

// Load contacts
async function loadContacts(page = 1, status = '') {
    try {
        contactsCurrentPage = page;
        const params = new URLSearchParams({
            page,
            limit: contactsPerPage
        });

        if (status) params.append('status', status);

        const result = await api.get(`/contact/admin/all?${params}`);

        if (result.success) {
            contactsData = result.data.contacts;
            displayContacts(contactsData);
            displayContactsPagination(result.data.pagination);
        } else {
            showNotification(result.message || 'Lỗi khi tải danh sách liên hệ', 'error');
        }
    } catch (error) {
        console.error('Load contacts error:', error);
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

// Load contact stats
async function loadContactStats() {
    try {
        const result = await api.get('/contact/admin/stats');
        
        if (result.success) {
            const stats = result.data;
            document.getElementById('contactStatsTotal').textContent = stats.total || 0;
            document.getElementById('contactStatsNew').textContent = stats.new || 0;
            document.getElementById('contactStatsReplied').textContent = stats.replied || 0;
        }
    } catch (error) {
        console.error('Load contact stats error:', error);
    }
}

// Display contacts
function displayContacts(contacts) {
    const tbody = document.getElementById('contactsTableBody');
    if (!tbody) return;

    if (!contacts || contacts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Không có liên hệ nào</td></tr>';
        return;
    }

    tbody.innerHTML = contacts.map(contact => {
        const statusBadge = {
            'Moi': '<span class="badge bg-danger">Mới</span>',
            'Da Doc': '<span class="badge bg-warning">Đã đọc</span>',
            'Da tra loi': '<span class="badge bg-success">Đã trả lời</span>'
        }[contact.TrangThai] || '<span class="badge bg-secondary">N/A</span>';

        return `
            <tr>
                <td>${contact.IdLienHe}</td>
                <td>
                    <div class="fw-medium">${contact.HoTen || 'N/A'}</div>
                    <small class="text-muted">${contact.Email || 'N/A'}</small>
                </td>
                <td>${contact.SoDienThoai || 'N/A'}</td>
                <td>${contact.TieuDe}</td>
                <td>
                    <div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${contact.NoiDung}
                    </div>
                </td>
                <td>${statusBadge}</td>
                <td>${formatDate(contact.NgayTao)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewContact(${contact.IdLienHe})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${contact.TrangThai !== 'Da tra loi' ? `
                        <button class="btn btn-sm btn-outline-success" onclick="showReplyModal(${contact.IdLienHe})" title="Trả lời">
                            <i class="fas fa-reply"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteContact(${contact.IdLienHe})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Display pagination
function displayContactsPagination(pagination) {
    const container = document.getElementById('contactsPagination');
    if (!container) return;

    if (pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<nav><ul class="pagination justify-content-center">';

    html += `
        <li class="page-item ${pagination.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadContacts(${pagination.currentPage - 1}); return false;">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;

    for (let i = 1; i <= pagination.totalPages; i++) {
        if (
            i === 1 ||
            i === pagination.totalPages ||
            (i >= pagination.currentPage - 2 && i <= pagination.currentPage + 2)
        ) {
            html += `
                <li class="page-item ${i === pagination.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="loadContacts(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === pagination.currentPage - 3 || i === pagination.currentPage + 3) {
            html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }

    html += `
        <li class="page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadContacts(${pagination.currentPage + 1}); return false;">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;

    html += '</ul></nav>';
    container.innerHTML = html;
}

// View contact detail
async function viewContact(id) {
    try {
        const contact = contactsData.find(c => c.IdLienHe === id);
        if (!contact) return;

        // Mark as read
        if (contact.TrangThai === 'Moi') {
            await api.put(`/contact/${id}/status`, { trangThai: 'Da Doc' });
        }

        const imageHtml = contact.HinhAnh ? `
            <div class="mb-3">
                <label class="fw-bold">Hình ảnh đính kèm:</label><br>
                <img src="${getImageUrl(contact.HinhAnh)}" class="img-thumbnail" style="max-width: 300px" onerror="this.style.display='none'">
            </div>
        ` : '';

        const replyHtml = contact.PhanHoi ? `
            <div class="alert alert-success">
                <h6><i class="fas fa-reply"></i> Phản hồi từ ${contact.AdminName || 'Admin'}</h6>
                <p class="mb-1">${contact.PhanHoi}</p>
                <small class="text-muted">Ngày: ${formatDate(contact.NgayPhanHoi)}</small>
            </div>
        ` : '';

        document.getElementById('viewContactContent').innerHTML = `
            <div class="mb-3">
                <label class="fw-bold">Người gửi:</label>
                <p>${contact.HoTen || 'N/A'}</p>
            </div>
            <div class="mb-3">
                <label class="fw-bold">Email:</label>
                <p>${contact.Email || 'N/A'}</p>
            </div>
            <div class="mb-3">
                <label class="fw-bold">Số điện thoại:</label>
                <p>${contact.SoDienThoai || 'N/A'}</p>
            </div>
            <div class="mb-3">
                <label class="fw-bold">Chủ đề:</label>
                <p>${contact.TieuDe}</p>
            </div>
            <div class="mb-3">
                <label class="fw-bold">Nội dung:</label>
                <p style="white-space: pre-line;">${contact.NoiDung}</p>
            </div>
            ${imageHtml}
            <div class="mb-3">
                <label class="fw-bold">Ngày gửi:</label>
                <p>${formatDate(contact.NgayTao)}</p>
            </div>
            ${replyHtml}
        `;

        const modal = new bootstrap.Modal(document.getElementById('viewContactModal'));
        modal.show();

        // Reload to update status
        loadContacts(contactsCurrentPage);
        loadContactStats();
    } catch (error) {
        console.error('View contact error:', error);
        showNotification('Lỗi khi xem chi tiết', 'error');
    }
}

// Show reply modal
function showReplyModal(id) {
    const contact = contactsData.find(c => c.IdLienHe === id);
    if (!contact) return;

    document.getElementById('replyContactId').value = id;
    document.getElementById('replyContactInfo').innerHTML = `
        <strong>Người gửi:</strong> ${contact.HoTen}<br>
        <strong>Email:</strong> ${contact.Email}<br>
        <strong>Chủ đề:</strong> ${contact.TieuDe}
    `;
    document.getElementById('replyContent').value = '';
    
    // Reset word count
    document.getElementById('replyWordCount').textContent = '0';
    document.getElementById('replyWordCountWarning').style.display = 'none';

    const modal = new bootstrap.Modal(document.getElementById('replyContactModal'));
    modal.show();
}

// Count words in reply textarea
function countReplyWords(textarea) {
    const text = textarea.value.trim();
    const words = text ? text.split(/\s+/).filter(word => word.length > 0) : [];
    const wordCount = words.length;
    
    document.getElementById('replyWordCount').textContent = wordCount;
    
    const warning = document.getElementById('replyWordCountWarning');
    
    if (wordCount > 100) {
        warning.style.display = 'inline';
        textarea.classList.add('is-invalid');
    } else {
        warning.style.display = 'none';
        textarea.classList.remove('is-invalid');
    }
}

// Submit reply
async function submitReply(event) {
    event.preventDefault();

    const id = document.getElementById('replyContactId').value;
    const phanHoi = document.getElementById('replyContent').value.trim();

    if (!phanHoi) {
        showNotification('Vui lòng nhập nội dung phản hồi', 'error');
        return;
    }

    // Validate word count
    const words = phanHoi.split(/\s+/).filter(word => word.length > 0);
    if (words.length > 100) {
        showNotification('Nội dung phản hồi không được vượt quá 100 từ', 'error');
        return;
    }

    try {
        const result = await api.post(`/contact/${id}/reply`, { phanHoi });

        if (result.success) {
            showNotification('Phản hồi thành công', 'success');
            bootstrap.Modal.getInstance(document.getElementById('replyContactModal')).hide();
            loadContacts(contactsCurrentPage);
            loadContactStats();
        } else {
            showNotification(result.message || 'Phản hồi thất bại', 'error');
        }
    } catch (error) {
        console.error('Reply error:', error);
        showNotification('Lỗi khi phản hồi', 'error');
    }
}

// Delete contact
async function deleteContact(id) {
    if (!confirm('Bạn có chắc muốn xóa liên hệ này? Hành động này không thể hoàn tác.')) {
        return;
    }

    try {
        const result = await api.delete(`/contact/${id}`);

        if (result.success) {
            showNotification('Xóa liên hệ thành công', 'success');
            loadContacts(contactsCurrentPage);
            loadContactStats();
            
            // Reload dashboard if function exists
            if (typeof reloadAdminDashboard === 'function') {
                reloadAdminDashboard();
            }
        } else {
            showNotification(result.message || 'Xóa thất bại', 'error');
        }
    } catch (error) {
        console.error('Delete contact error:', error);
        showNotification('Lỗi khi xóa liên hệ', 'error');
    }
}

// Filter contacts
function filterContacts() {
    const status = document.getElementById('contactStatusFilter').value;
    loadContacts(1, status);
}

// Update badge
function updateContactBadge(count) {
    const badge = document.getElementById('contactBadge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Track previous count for notification
let previousNewCount = 0;

// Check for new contacts periodically
async function checkNewContacts() {
    try {
        const result = await api.get('/contact/admin/stats');
        if (result.success) {
            const newCount = result.data.new || 0;
            updateContactBadge(newCount);
            
            // Show notification if there are new contacts
            if (newCount > previousNewCount && previousNewCount >= 0) {
                const diff = newCount - previousNewCount;
                showNotification(`📧 Có ${diff} liên hệ mới!`, 'info');
                
                // Play notification sound
                playNotificationSound();
            }
            
            previousNewCount = newCount;
        }
    } catch (error) {
        console.error('Check new contacts error:', error);
    }
}

// Play notification sound
function playNotificationSound() {
    try {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Cannot play sound:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    const contactsTab = document.getElementById('contacts-tab');
    if (contactsTab) {
        contactsTab.addEventListener('shown.bs.tab', function () {
            loadContacts(1);
            loadContactStats();
            updateContactBadge(0); // Reset badge when viewing
        });
    }

    // Check for new contacts every 30 seconds (only for admin)
    const user = auth.getCurrentUser();
    if (user && user.vaiTro === 'admin') {
        // Load initial count without notification
        api.get('/contact/admin/stats').then(result => {
            if (result.success) {
                previousNewCount = result.data.new || 0;
                updateContactBadge(previousNewCount);
            }
        });
        
        // Start checking after 30 seconds
        setInterval(checkNewContacts, 30000); // Check every 30 seconds
    }
});
