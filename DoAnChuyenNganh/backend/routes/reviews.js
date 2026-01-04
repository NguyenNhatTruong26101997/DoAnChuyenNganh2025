const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public route - get product reviews
router.get('/product/:productId', reviewController.getProductReviews);

// User routes (require authentication)
router.post('/', verifyToken, reviewController.createReview);
router.put('/:id', verifyToken, reviewController.updateReview);
router.delete('/:id', verifyToken, reviewController.deleteReview);

// Admin routes
router.get('/admin/all', verifyToken, isAdmin, reviewController.getAllReviews);
router.post('/admin/reply/:id', verifyToken, isAdmin, reviewController.adminReplyReview);

module.exports = router;
