const db = require('../config/database');

async function updateContactTable() {
    try {
        console.log('🔄 Cập nhật bảng LienHe...\n');

        const queries = [
            // Thêm cột cho người dùng không đăng nhập
            "ALTER TABLE LienHe ADD COLUMN HoTen VARCHAR(255)",
            "ALTER TABLE LienHe ADD COLUMN Email VARCHAR(255)",
            "ALTER TABLE LienHe ADD COLUMN SoDienThoai VARCHAR(20)",
            
            // Thêm cột hình ảnh đính kèm
            "ALTER TABLE LienHe ADD COLUMN HinhAnh VARCHAR(500)",
            
            // Thêm cột phản hồi từ admin
            "ALTER TABLE LienHe ADD COLUMN PhanHoi TEXT",
            "ALTER TABLE LienHe ADD COLUMN NgayPhanHoi DATETIME",
            "ALTER TABLE LienHe ADD COLUMN AdminId INT",
            
            // Cho phép UserId NULL (người dùng không đăng nhập)
            "ALTER TABLE LienHe MODIFY UserId INT NULL"
        ];

        for (const query of queries) {
            try {
                await db.query(query);
                const columnName = query.includes('ADD COLUMN') 
                    ? query.split('ADD COLUMN ')[1]?.split(' ')[0] 
                    : query.includes('MODIFY') 
                    ? query.split('MODIFY ')[1]?.split(' ')[0]
                    : 'Column';
                console.log('✓', columnName);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    const columnName = query.split('ADD COLUMN ')[1]?.split(' ')[0];
                    console.log('⚠', columnName, 'đã tồn tại');
                } else if (err.code === 'ER_BAD_FIELD_ERROR') {
                    console.log('⚠ Bỏ qua lỗi:', err.message);
                } else {
                    throw err;
                }
            }
        }

        console.log('\n✅ Cập nhật bảng LienHe thành công!');
        console.log('\n📝 Các cột mới:');
        console.log('   - HoTen: Tên người gửi (không cần đăng nhập)');
        console.log('   - Email: Email người gửi');
        console.log('   - SoDienThoai: Số điện thoại');
        console.log('   - HinhAnh: Đường dẫn ảnh đính kèm');
        console.log('   - PhanHoi: Nội dung phản hồi từ admin');
        console.log('   - NgayPhanHoi: Thời gian phản hồi');
        console.log('   - AdminId: ID admin phản hồi');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

updateContactTable();
