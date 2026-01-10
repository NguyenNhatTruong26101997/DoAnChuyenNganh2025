const db = require('./config/database');

async function addReplyFeature() {
    try {
        // Thêm cột ParentId để lưu bình luận cha
        await db.query(`
            ALTER TABLE BinhLuanTinTuc 
            ADD COLUMN ParentId INT NULL,
            ADD FOREIGN KEY (ParentId) REFERENCES BinhLuanTinTuc(IdBinhLuan) ON DELETE CASCADE
        `);

        console.log('✅ Đã thêm cột ParentId vào bảng BinhLuanTinTuc');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠️ Cột ParentId đã tồn tại');
            process.exit(0);
        }
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

addReplyFeature();
