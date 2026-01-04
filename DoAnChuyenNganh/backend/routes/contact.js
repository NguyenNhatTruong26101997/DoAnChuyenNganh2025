const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public/User route
router.post('/', contactController.createContact);

// Admin routes
router.get('/admin/all', verifyToken, isAdmin, contactController.getAllContacts);
router.get('/admin/stats', verifyToken, isAdmin, contactController.getContactStats);
router.put('/:id/status', verifyToken, isAdmin, contactController.updateContactStatus);
router.post('/:id/reply', verifyToken, isAdmin, contactController.replyContact);
router.delete('/:id', verifyToken, isAdmin, contactController.deleteContact);

module.exports = router;
