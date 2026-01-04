// Generate unique order code
const generateOrderCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `DH${timestamp}${random}`;
};

// Generate unique invoice code
const generateInvoiceCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `HD${timestamp}${random}`;
};

// Format currency (VND)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone number (Vietnamese format)
const isValidPhone = (phone) => {
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    return phoneRegex.test(phone);
};

// Escape HTML to prevent XSS attacks
const escapeHtml = (text) => {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
        '/': '&#x2F;'
    };
    return String(text).replace(/[&<>"'/]/g, (char) => map[char]);
};

// Validate string length
const isValidLength = (str, min = 0, max = 255) => {
    if (!str) return min === 0;
    const length = String(str).trim().length;
    return length >= min && length <= max;
};

// Validate positive integer
const isPositiveInteger = (num) => {
    return Number.isInteger(num) && num > 0;
};

// Validate order status
const isValidOrderStatus = (status) => {
    const validStatuses = ['Cho xu ly', 'ChoXuLy', 'Xac nhan', 'DaXacNhan', 'Dang giao', 'DangGiao', 'Da giao', 'DaGiao', 'Da huy', 'DaHuy', 'HoanTien'];
    return validStatuses.includes(status);
};

// Sanitize input - remove dangerous characters
const sanitizeInput = (input) => {
    if (!input) return '';
    return String(input)
        .trim()
        .replace(/[<>]/g, '') // Remove < and >
        .substring(0, 1000); // Limit length
};

module.exports = {
    generateOrderCode,
    generateInvoiceCode,
    formatCurrency,
    isValidEmail,
    isValidPhone,
    escapeHtml,
    isValidLength,
    isPositiveInteger,
    isValidOrderStatus,
    sanitizeInput
};
