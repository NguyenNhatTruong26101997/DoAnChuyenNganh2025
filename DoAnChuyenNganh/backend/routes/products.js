const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);

// Admin routes
router.get('/admin/all', verifyToken, isAdmin, productController.getAllProductsAdmin);
router.get('/admin/low-stock', verifyToken, isAdmin, productController.getLowStockProducts);
router.post('/', verifyToken, isAdmin, productController.createProduct);
router.put('/:id', verifyToken, isAdmin, productController.updateProduct);
router.patch('/:id/toggle-status', verifyToken, isAdmin, productController.toggleProductStatus);
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;
