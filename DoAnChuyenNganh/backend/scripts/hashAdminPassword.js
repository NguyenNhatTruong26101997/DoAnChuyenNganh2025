const bcrypt = require('bcryptjs');
const db = require('../config/database');
require('dotenv').config();

/**
 * Script để hash mật khẩu admin có sẵn trong database
 * Chạy script này một lần để update mật khẩu từ plain text sang hash
 */

async function hashAdminPassword() {
    try {
        console.log('🔄 Đang hash mật khẩu admin...');

        // Hash password '123'
        const hashedPassword = await bcrypt.hash('123', 10);
        console.log('✅ Hash tạo thành công');

        // Update admin password
        const [result] = await db.query(
            'UPDATE user SET MatKhau = ? WHERE Email = ?',
            [hashedPassword, 'admin@gmail.com']
        );

        if (result.affectedRows > 0) {
            console.log('✅ Đã cập nhật mật khẩu admin thành công!');
            console.log('📝 Email: admin@gmail.com');
            console.log('🔑 Password: 123 (đã được hash)');
        } else {
            console.log('⚠️ Không tìm thấy admin với email admin@gmail.com');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

// Run script
hashAdminPassword();
