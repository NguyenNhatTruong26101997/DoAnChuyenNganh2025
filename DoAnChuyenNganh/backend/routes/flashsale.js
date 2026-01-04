const express = require('express');
const router = express.Router();
const flashsaleController = require('../controllers/flashsaleController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/active', flashsaleController.getActiveFlashSale);

// Simplified flash sale products management (MUST be before /:id routes)
router.get('/products/all', verifyToken, isAdmin, flashsaleController.getAllFlashSaleProducts);
router.post('/products', verifyToken, isAdmin, flashsaleController.addFlashSaleProduct);
router.put('/products/:id', verifyToken, isAdmin, flashsaleController.updateFlashSaleProduct);
router.delete('/products/:id', verifyToken, isAdmin, flashsaleController.deleteFlashSaleProduct);

// Admin routes
router.get('/admin/all', verifyToken, isAdmin, flashsaleController.getAllFlashSales);
router.post('/', verifyToken, isAdmin, flashsaleController.createFlashSale);
router.put('/:id', verifyToken, isAdmin, flashsaleController.updateFlashSale);
router.delete('/:id', verifyToken, isAdmin, flashsaleController.deleteFlashSale);

// Flash sale products management (old - with program)
router.get('/:id/products', verifyToken, isAdmin, flashsaleController.getFlashSaleProducts);
router.post('/:id/products', verifyToken, isAdmin, flashsaleController.addProductToFlashSale);
router.delete('/:flashsaleId/products/:productId', verifyToken, isAdmin, flashsaleController.removeProductFromFlashSale);

module.exports = router;
