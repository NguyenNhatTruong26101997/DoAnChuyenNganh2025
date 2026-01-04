const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// User routes (require login)
router.get('/active', verifyToken, couponController.getActiveCoupons);
router.post('/validate', verifyToken, couponController.validateCoupon);

// Admin routes
router.get('/admin/all', verifyToken, isAdmin, couponController.getAllCoupons);
router.post('/', verifyToken, isAdmin, couponController.createCoupon);
router.put('/:id', verifyToken, isAdmin, couponController.updateCoupon);
router.patch('/:id/toggle-status', verifyToken, isAdmin, couponController.toggleCouponStatus);
router.delete('/:id', verifyToken, isAdmin, couponController.deleteCoupon);

module.exports = router;
