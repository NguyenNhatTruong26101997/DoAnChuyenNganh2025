const mysql = require('mysql2/promise');
require('dotenv').config();

async function addOrderReceiverInfo() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Đang thêm cột thông tin người nhận vào bảng DonHang...');

        // Check if columns exist
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'DonHang'
        `, [process.env.DB_NAME]);

        const existingColumns = columns.map(col => col.COLUMN_NAME);

        // Add columns if they don't exist
        if (!existingColumns.includes('HoTenNguoiNhan')) {
            await connection.query('ALTER TABLE DonHang ADD COLUMN HoTenNguoiNhan VARCHAR(255)');
            console.log('✓ Đã thêm cột HoTenNguoiNhan');
        }

        if (!existingColumns.includes('SoDienThoaiNguoiNhan')) {
            await connection.query('ALTER TABLE DonHang ADD COLUMN SoDienThoaiNguoiNhan VARCHAR(20)');
            console.log('✓ Đã thêm cột SoDienThoaiNguoiNhan');
        }

        if (!existingColumns.includes('EmailNguoiNhan')) {
            await connection.query('ALTER TABLE DonHang ADD COLUMN EmailNguoiNhan VARCHAR(255)');
            console.log('✓ Đã thêm cột EmailNguoiNhan');
        }

        if (!existingColumns.includes('GhiChu')) {
            await connection.query('ALTER TABLE DonHang ADD COLUMN GhiChu TEXT');
            console.log('✓ Đã thêm cột GhiChu');
        }

        console.log('✓ Hoàn tất thêm các cột thông tin người nhận!');

    } catch (error) {
        console.error('Lỗi:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

addOrderReceiverInfo();
