 // API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api',
    SERVER_URL: 'http://localhost:3000',
    TIMEOUT: 10000
};

// Helper function to get full image URL
const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_CONFIG.SERVER_URL}${path}`;
};

// API Helper Functions
const api = {
    /**
     * GET request
     */
    get: async (endpoint) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            // Handle 401 Unauthorized
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login.html') {
                    window.location.href = 'login.html';
                }
            }

            return data;
        } catch (error) {
            console.error('API GET Error:', error);
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    },

    /**
     * POST request
     */
    post: async (endpoint, data) => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': token ? `Bearer ${token}` : ''
            };

            const options = {
                method: 'POST',
                headers: headers
            };

            // Handle FormData (for file uploads) - don't set Content-Type
            if (data instanceof FormData) {
                options.body = data;
            } else {
                headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, options);

            const result = await response.json();

            // Handle 401 Unauthorized
            if (response.status === 401 && !endpoint.includes('/auth/')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login.html') {
                    window.location.href = 'login.html';
                }
            }

            return result;
        } catch (error) {
            console.error('API POST Error:', error);
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    },

    /**
     * PUT request
     */
    put: async (endpoint, data) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            // Handle 401 Unauthorized
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login.html') {
                    window.location.href = 'login.html';
                }
            }

            return result;
        } catch (error) {
            console.error('API PUT Error:', error);
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    },

    /**
     * DELETE request
     */
    delete: async (endpoint) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            // Handle 401 Unauthorized
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login.html') {
                    window.location.href = 'login.html';
                }
            }

            return result;
        } catch (error) {
            console.error('API DELETE Error:', error);
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    },

    /**
     * PATCH request
     */
    patch: async (endpoint, data = {}) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            // Handle 401 Unauthorized
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login.html') {
                    window.location.href = 'login.html';
                }
            }

            return result;
        } catch (error) {
            console.error('API PATCH Error:', error);
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }
};

// Auth Helper Functions
const auth = {
    /**
     * Login user
     */
    login: async (email, matKhau) => {
        const result = await api.post('/auth/login', { email, matKhau });

        if (result.success) {
            // Save token and user info
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            return result;
        }

        return result;
    },

    /**
     * Register user
     */
    register: async (hoTen, email, matKhau, soDienThoai) => {
        return await api.post('/auth/register', { hoTen, email, matKhau, soDienThoai });
    },

    /**
     * Get current user profile
     */
    getProfile: async () => {
        return await api.get('/auth/profile');
    },

    /**
     * Update user profile
     */
    updateProfile: async (data) => {
        return await api.put('/auth/profile', data);
    },

    /**
     * Logout user
     */
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    },

    /**
     * Check if user is logged in
     */
    isLoggedIn: () => {
        return !!localStorage.getItem('token');
    },

    /**
     * Get current user
     */
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    /**
     * Check if user is admin
     */
    isAdmin: () => {
        const user = auth.getCurrentUser();
        return user && user.vaiTro === 'admin';
    }
};

// Review API Functions
const reviewApi = {
    /**
     * Get product reviews
     */
    getProductReviews: async (productId) => {
        return await api.get(`/reviews/product/${productId}`);
    },

    /**
     * Create review or reply
     */
    createReview: async (data) => {
        return await api.post('/reviews', data);
    },

    /**
     * Update review
     */
    updateReview: async (reviewId, data) => {
        return await api.put(`/reviews/${reviewId}`, data);
    },

    /**
     * Delete review
     */
    deleteReview: async (reviewId) => {
        return await api.delete(`/reviews/${reviewId}`);
    },

    /**
     * Admin: Get all reviews
     */
    getAllReviews: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return await api.get(`/reviews/admin/all?${queryString}`);
    },

    /**
     * Admin: Reply to review
     */
    adminReply: async (reviewId, binhLuan) => {
        return await api.post(`/reviews/admin/reply/${reviewId}`, { binhLuan });
    }
};
