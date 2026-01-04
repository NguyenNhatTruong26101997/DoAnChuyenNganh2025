const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Upload single image
router.post('/image', verifyToken, isAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn file ảnh'
            });
        }

        const imageUrl = `/uploads/products/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Upload ảnh thành công',
            data: {
                url: imageUrl,
                filename: req.file.filename
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi upload ảnh'
        });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File quá lớn. Kích thước tối đa 5MB'
            });
        }
    }

    return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi upload ảnh'
    });
});

module.exports = router;
