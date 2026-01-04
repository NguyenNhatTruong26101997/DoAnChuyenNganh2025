const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/auth');

// All cart routes require authentication
router.get('/', verifyToken, cartController.getCart);
router.post('/', verifyToken, cartController.addToCart);
router.put('/:itemId', verifyToken, cartController.updateCartItem);
router.delete('/:itemId', verifyToken, cartController.removeFromCart);
router.delete('/', verifyToken, cartController.clearCart);

module.exports = router;
