const db = require('../config/database');

async function updateCategory() {
    try {
        await db.query("UPDATE DanhMuc SET TenDanhMuc = 'Sinh viên - Văn phòng' WHERE TenDanhMuc = 'Laptop cơ bản'");
        console.log('Đã đổi tên danh mục thành công!');
        process.exit(0);
    } catch (error) {
        console.error('Lỗi:', error.message);
        process.exit(1);
    }
}

updateCategory();
