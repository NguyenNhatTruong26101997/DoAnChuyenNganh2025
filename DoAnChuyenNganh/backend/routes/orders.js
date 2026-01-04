const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Admin routes (must be before /:id routes)
router.get('/admin/all', verifyToken, isAdmin, orderController.getAllOrders);
router.put('/:id/status', verifyToken, isAdmin, orderController.updateOrderStatus);

// User routes
router.post('/', verifyToken, orderController.createOrder);
router.get('/', verifyToken, orderController.getOrders);
router.get('/my-orders', verifyToken, orderController.getOrders); // Alias for user orders
router.get('/:id', verifyToken, orderController.getOrderById);
router.put('/:id/cancel', verifyToken, orderController.cancelOrder);

module.exports = router;
