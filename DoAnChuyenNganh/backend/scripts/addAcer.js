const db = require('../config/database');

async function addAcer() {
    try {
        await db.query("INSERT INTO ThuongHieu (TenThuongHieu) VALUES ('MSI')");
        console.log('Đã thêm thương hiệu Acer thành công!');
        process.exit(0);
    } catch (error) {
        console.error('Lỗi:', error.message);
        process.exit(1);
    }
}

addAcer();
