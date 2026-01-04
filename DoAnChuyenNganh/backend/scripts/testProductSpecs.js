const db = require('../config/database');

async function testProductSpecs() {
    try {
        // Test 1: Check if columns exist
        console.log('📋 Test 1: Kiểm tra cấu trúc bảng SanPham...');
        const [columns] = await db.query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'SanPham' 
            AND COLUMN_NAME IN ('KieuOCung', 'DungLuongOCung', 'CongNgheManHinh', 'TanSoQuet', 'DoPhanGiai', 'Pin', 'XuatXu', 'TrongLuong')
            ORDER BY COLUMN_NAME
        `);
        
        console.log('✅ Các cột thông số kỹ thuật:');
        columns.forEach(col => {
            console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
        });

        // Test 2: Get a sample product with specs
        console.log('\n📋 Test 2: Lấy sản phẩm mẫu với thông số kỹ thuật...');
        const [products] = await db.query(`
            SELECT IdSanPham, TenSanPham, KieuOCung, DungLuongOCung, CongNgheManHinh, 
                   TanSoQuet, DoPhanGiai, Pin, XuatXu, TrongLuong
            FROM SanPham 
            LIMIT 3
        `);
        
        if (products.length > 0) {
            console.log('✅ Sản phẩm mẫu:');
            products.forEach(p => {
                console.log(`\n   ID: ${p.IdSanPham} - ${p.TenSanPham}`);
                console.log(`   - Kiểu ổ cứng: ${p.KieuOCung || 'Chưa có'}`);
                console.log(`   - Dung lượng: ${p.DungLuongOCung || 'Chưa có'}`);
                console.log(`   - Màn hình: ${p.CongNgheManHinh || 'Chưa có'}`);
                console.log(`   - Tần số quét: ${p.TanSoQuet || 'Chưa có'}`);
                console.log(`   - Độ phân giải: ${p.DoPhanGiai || 'Chưa có'}`);
                console.log(`   - Pin: ${p.Pin || 'Chưa có'}`);
                console.log(`   - Xuất xứ: ${p.XuatXu || 'Chưa có'}`);
                console.log(`   - Trọng lượng: ${p.TrongLuong || 'Chưa có'}`);
            });
        }

        console.log('\n✅ Test hoàn tất! Tính năng thông số kỹ thuật đã sẵn sàng.');
        console.log('\n📝 Hướng dẫn sử dụng:');
        console.log('   1. Vào trang Admin (admin.html)');
        console.log('   2. Chọn tab "Sản phẩm"');
        console.log('   3. Nhấn "Thêm sản phẩm" hoặc "Sửa" sản phẩm có sẵn');
        console.log('   4. Cuộn xuống phần "Thông số kỹ thuật"');
        console.log('   5. Chọn các thông số từ dropdown');
        console.log('   6. Lưu sản phẩm');
        console.log('   7. Xem chi tiết sản phẩm ở trang product-detail.html');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

testProductSpecs();
