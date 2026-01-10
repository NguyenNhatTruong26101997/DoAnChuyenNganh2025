const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('./config/passport');
require('dotenv').config();

// Import database
require('./config/database');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const brandRoutes = require('./routes/brands');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const contactRoutes = require('./routes/contact');
const uploadRoutes = require('./routes/upload');
const flashsaleRoutes = require('./routes/flashsale');
const statisticsRoutes = require('./routes/statistics');
const newsRoutes = require('./routes/news');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'http://127.0.0.1:5500',
        'http://127.0.0.1:5501',
        'http://localhost:5500',
        'http://localhost:5501'
    ],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware (required for Passport)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/flashsale', flashsaleRoutes);
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/admin', statisticsRoutes);
app.use('/api/news', newsRoutes);

// Notification routes
const notificationController = require('./controllers/notificationController');
const { verifyToken } = require('./middleware/auth');
app.get('/api/notifications', verifyToken, notificationController.getUserNotifications);
app.put('/api/notifications/read-all', verifyToken, notificationController.markAllAsRead);
app.put('/api/notifications/:id/read', verifyToken, notificationController.markAsRead);
app.delete('/api/notifications/:id', verifyToken, notificationController.deleteNotification);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'LaptopWorld API Server',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users (admin only)',
            products: '/api/products',
            categories: '/api/categories',
            brands: '/api/brands',
            cart: '/api/cart',
            orders: '/api/orders',
            reviews: '/api/reviews',
            contact: '/api/contact'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   LaptopWorld API Server Running      ║
║   Port: ${PORT}                          ║
║   Environment: ${process.env.NODE_ENV || 'development'}            ║
║   Time: ${new Date().toLocaleString()}  ║
╚════════════════════════════════════════╝
    `);
});

module.exports = app;
