const db = require('../config/database');

async function updateCategoriesAndBrands() {
    try {
        console.log('Starting update...');

        // 1. Add Categories
        console.log('\n1. Adding categories...');
        const categories = [
            { name: 'Laptop cơ bản', desc: 'Laptop phù hợp cho công việc văn phòng, học tập' },
            { name: 'Laptop gaming', desc: 'Laptop chơi game hiệu năng cao' }
        ];

        for (const cat of categories) {
            await db.query(
                `INSERT INTO DanhMuc (TenDanhMuc, MoTaDanhMuc) VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE MoTaDanhMuc = VALUES(MoTaDanhMuc)`,
                [cat.name, cat.desc]
            );
            console.log(`✓ Added/Updated: ${cat.name}`);
        }

        // 2. Update Brands
        console.log('\n2. Updating brands...');

        // MSI → Apple
        const [msiResult] = await db.query(
            `UPDATE ThuongHieu 
             SET TenThuongHieu = 'Apple', MoTaThuongHieu = 'Thương hiệu Apple - MacBook, iMac'
             WHERE TenThuongHieu = 'MSI'`
        );
        console.log(`✓ MSI → Apple (${msiResult.affectedRows} rows)`);

        // Acer → Gigabyte
        const [acerResult] = await db.query(
            `UPDATE ThuongHieu 
             SET TenThuongHieu = 'Gigabyte', MoTaThuongHieu = 'Thương hiệu Gigabyte - Laptop gaming'
             WHERE TenThuongHieu = 'Acer'`
        );
        console.log(`✓ Acer → Gigabyte (${acerResult.affectedRows} rows)`);

        // 3. Verify
        console.log('\n3. Current data:');
        const [categories_] = await db.query('SELECT * FROM DanhMuc');
        console.log('\nCategories:', categories_);

        const [brands] = await db.query('SELECT * FROM ThuongHieu');
        console.log('\nBrands:', brands);

        console.log('\n✅ Update completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

updateCategoriesAndBrands();
