const db = require('./config/database');

async function updateOldNews() {
    try {
        // Update tin tức chưa có DanhMuc
        const [result1] = await db.query(`
            UPDATE TinTuc 
            SET DanhMuc = 'Hàng Mới',
                TieuDe = 'Hàng Mới'
            WHERE DanhMuc IS NULL OR DanhMuc = ''
        `);

        console.log('✅ Đã cập nhật', result1.affectedRows, 'tin tức chưa có DanhMuc');

        // Đồng bộ TieuDe = DanhMuc cho tất cả tin tức
        const [result2] = await db.query(`
            UPDATE TinTuc 
            SET TieuDe = DanhMuc
            WHERE TieuDe != DanhMuc
        `);

        console.log('✅ Đã đồng bộ TieuDe = DanhMuc cho', result2.affectedRows, 'tin tức');

        // Hiển thị tất cả tin tức
        const [news] = await db.query('SELECT IdTinTuc, TieuDe, DanhMuc FROM TinTuc');
        console.log('\n📰 Danh sách tin tức:');
        console.table(news);

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

updateOldNews();
