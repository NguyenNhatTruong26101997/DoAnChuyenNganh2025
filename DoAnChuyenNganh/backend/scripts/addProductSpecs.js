const db = require('../config/database');

async function addProductSpecs() {
    try {
        const queries = [
            "ALTER TABLE SanPham ADD COLUMN KieuOCung VARCHAR(100)",
            "ALTER TABLE SanPham ADD COLUMN DungLuongOCung VARCHAR(50)",
            "ALTER TABLE SanPham ADD COLUMN CongNgheManHinh VARCHAR(100)",
            "ALTER TABLE SanPham ADD COLUMN TanSoQuet VARCHAR(50)",
            "ALTER TABLE SanPham ADD COLUMN DoPhanGiai VARCHAR(50)",
            "ALTER TABLE SanPham ADD COLUMN Pin VARCHAR(50)",
            "ALTER TABLE SanPham ADD COLUMN XuatXu VARCHAR(100)",
            "ALTER TABLE SanPham ADD COLUMN TrongLuong VARCHAR(50)"
        ];

        for (const query of queries) {
            try {
                await db.query(query);
                console.log('✓', query.split('ADD COLUMN ')[1]?.split(' ')[0] || 'Column added');
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log('⚠', query.split('ADD COLUMN ')[1]?.split(' ')[0], 'already exists');
                } else {
                    throw err;
                }
            }
        }

        console.log('\n✅ Đã thêm các cột thông số kỹ thuật thành công!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

addProductSpecs();
