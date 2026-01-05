const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads/news directory if not exists
const newsUploadDir = path.join(__dirname, '../uploads/news');
if (!fs.existsSync(newsUploadDir)) {
    fs.mkdirSync(newsUploadDir, { recursive: true });
}

// Configure multer for news images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, newsUploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'news-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

// Comment routes (specific paths first to avoid conflict with :id)
router.get('/:id/comments', verifyToken, newsController.getComments);
router.post('/:id/comments', verifyToken, newsController.addComment);
router.put('/comments/:commentId', verifyToken, newsController.updateComment);
router.delete('/comments/:commentId', verifyToken, newsController.deleteComment);

// News CRUD routes
router.get('/', verifyToken, newsController.getAllNews);
router.post('/', verifyToken, isAdmin, upload.single('anhBia'), newsController.createNews);
router.get('/:id', verifyToken, newsController.getNewsById);
router.put('/:id', verifyToken, isAdmin, upload.single('anhBia'), newsController.updateNews);
router.delete('/:id', verifyToken, isAdmin, newsController.deleteNews);

module.exports = router;
