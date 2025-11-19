/**
 * Admin Panel JavaScript
 * Handles admin-specific functionality
 */

// ============= SIDEBAR TOGGLE =============
function initSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    const mainContent = document.querySelector('.admin-main');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }
}

// ============= DATA TABLE FUNCTIONS =============
class DataTable {
    constructor(tableId) {
        this.table = document.getElementById(tableId);
        this.init();
    }

    init() {
        if (!this.table) return;
        
        // Add sorting functionality
        const headers = this.table.querySelectorAll('th');
        headers.forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => this.sortTable(index));
        });
    }

    sortTable(columnIndex) {
        const tbody = this.table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent;
            const bValue = b.cells[columnIndex].textContent;
            return aValue.localeCompare(bValue);
        });

        rows.forEach(row => tbody.appendChild(row));
    }
}

// ============= CHARTS INITIALIZATION =============
function initCharts() {
    // Placeholder for chart initialization
    // In production, use Chart.js or similar library
    console.log('Charts would be initialized here');
}

// ============= NOTIFICATIONS =============
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// ============= CONFIRM DIALOG =============
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// ============= DELETE ITEM =============
function deleteItem(itemId, itemType) {
    confirmAction(`Bạn có chắc muốn xóa ${itemType} này?`, () => {
        // API call to delete item
        console.log(`Deleting ${itemType} with ID:`, itemId);
        showNotification(`Đã xóa ${itemType} thành công!`, 'success');
    });
}

// ============= EDIT ITEM =============
function editItem(itemId, itemType) {
    console.log(`Editing ${itemType} with ID:`, itemId);
    // Navigate to edit page or open modal
}

// ============= BULK ACTIONS =============
function initBulkActions() {
    const selectAllCheckbox = document.querySelector('input[type="checkbox"][data-select-all]');
    const itemCheckboxes = document.querySelectorAll('input[type="checkbox"]:not([data-select-all])');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            itemCheckboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
        });
    }
}

// ============= SEARCH & FILTER =============
function initAdminSearch() {
    const searchInput = document.querySelector('.admin-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });
}

// ============= IMAGE PREVIEW =============
function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

// ============= FORM SUBMISSION =============
function handleFormSubmit(formId, successMessage) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate form
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // Get form data
        const formData = new FormData(form);
        
        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang xử lý...';

        // Simulate API call
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            showNotification(successMessage || 'Lưu thành công!', 'success');
            form.reset();
            form.classList.remove('was-validated');
        }, 1500);
    });
}

// ============= STATISTICS UPDATE =============
function updateStats() {
    // Fetch and update dashboard statistics
    console.log('Updating statistics...');
}

// ============= REAL-TIME UPDATES =============
function initRealTimeUpdates() {
    // Poll for new orders, messages, etc.
    setInterval(() => {
        // Check for new notifications
        console.log('Checking for updates...');
    }, 30000); // Every 30 seconds
}

// ============= INITIALIZE ADMIN FEATURES =============
document.addEventListener('DOMContentLoaded', () => {
    initSidebarToggle();
    initCharts();
    initBulkActions();
    initAdminSearch();
    initRealTimeUpdates();
    
    // Initialize tooltips and popovers
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    
    console.log('Admin panel initialized');
});

// ============= EXPORT FUNCTIONS =============
window.adminFunctions = {
    showNotification,
    confirmAction,
    deleteItem,
    editItem,
    previewImage,
    handleFormSubmit,
    updateStats
};
