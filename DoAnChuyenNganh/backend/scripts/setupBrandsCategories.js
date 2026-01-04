const db = require('../config/database');

async function setupBrandsAndCategories() {
    try {
        console.log('🔧 Setting up brands and categories...\n');

        // 1. First, insert all brands if they don't exist
        console.log('1️⃣ Adding brands...');
        const brands = [
            { name: 'Dell', desc: 'Thương hiệu Dell' },
            { name: 'HP', desc: 'Thương hiệu HP' },
            { name: 'Asus', desc: 'Thương hiệu Asus' },
            { name: 'Lenovo', desc: 'Thương hiệu Lenovo' },
            { name: 'Apple', desc: 'Thương hiệu Apple - MacBook, iMac' },
            { name: 'Gigabyte', desc: 'Thương hiệu Gigabyte - Laptop gaming' }
        ];

        for (const brand of brands) {
            await db.query(
                `INSERT INTO ThuongHieu (TenThuongHieu, MoTaThuongHieu) VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE MoTaThuongHieu = VALUES(MoTaThuongHieu)`,
                [brand.name, brand.desc]
            );
            console.log(`  ✅ ${brand.name}`);
        }

        // 2. Delete old brands (MSI, Acer if they exist)
        console.log('\n2️⃣ Removing old brands...');
        await db.query(`DELETE FROM ThuongHieu WHERE TenThuongHieu IN ('MSI', 'Acer')`);
        console.log('  ✅ Removed MSI, Acer');

        // 3. Add categories
        console.log('\n3️⃣ Adding categories...');
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
            console.log(`  ✅ ${cat.name}`);
        }

        // 4. Verify
        console.log('\n📋 Current Brands:');
        const [currentBrands] = await db.query('SELECT IdThuongHieu, TenThuongHieu FROM ThuongHieu ORDER BY IdThuongHieu');
        console.table(currentBrands);

        console.log('\n📋 Current Categories:');
        const [currentCategories] = await db.query('SELECT IdDanhMuc, TenDanhMuc FROM DanhMuc ORDER BY IdDanhMuc');
        console.table(currentCategories);

        console.log('\n✅ Setup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

setupBrandsAndCategories();
