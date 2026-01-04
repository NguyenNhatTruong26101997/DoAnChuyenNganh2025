const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(verifyToken);
router.use(isAdmin);

// Get dashboard statistics
router.get('/statistics', statisticsController.getDashboardStatistics);

// Get top selling products
router.get('/top-products', statisticsController.getTopProducts);

// Get revenue by month
router.get('/revenue-by-month', statisticsController.getRevenueByMonth);

module.exports = router;
