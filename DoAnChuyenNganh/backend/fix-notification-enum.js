const db = require('./config/database');

async function fixNotificationEnum() {
    try {
        console.log('Fixing LoaiThongBao ENUM...\n');
        
        // Alter table to add new enum values
        await db.query(`
            ALTER TABLE ThongBao 
            MODIFY COLUMN LoaiThongBao ENUM('DonHang', 'SanPham', 'HeThong', 'KhuyenMai', 'DanhGia', 'BinhLuan', 'LienHe') 
            DEFAULT 'HeThong'
        `);
        
        console.log('✅ Fixed LoaiThongBao ENUM');
        console.log('Now supports: DonHang, SanPham, HeThong, KhuyenMai, DanhGia, BinhLuan, LienHe');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixNotificationEnum();
