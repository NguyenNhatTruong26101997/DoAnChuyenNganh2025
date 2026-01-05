const db = require('./config/database');

async function testNewsAPI() {
    try {
        console.log('Testing news API...\n');

        // Test 1: Check if table exists
        console.log('1. Checking if TinTuc table exists...');
        const [tables] = await db.query("SHOW TABLES LIKE 'TinTuc'");
        if (tables.length === 0) {
            console.log('❌ TinTuc table does NOT exist!');
            console.log('Please run: mysql -u root -p ChuyenNganh < create-news-tables.sql');
            process.exit(1);
        }
        console.log('✓ TinTuc table exists');

        // Test 2: Check table structure
        console.log('\n2. Checking table structure...');
        const [columns] = await db.query('DESCRIBE TinTuc');
        console.log('Columns:', columns.map(c => c.Field).join(', '));

        // Test 3: Count records
        console.log('\n3. Counting records...');
        const [count] = await db.query('SELECT COUNT(*) as total FROM TinTuc');
        console.log(`Total news: ${count[0].total}`);

        // Test 4: Get all news
        if (count[0].total > 0) {
            console.log('\n4. Getting news list...');
            const [news] = await db.query(`
                SELECT 
                    tn.IdTinTuc,
                    tn.TieuDe,
                    tn.NgayTao,
                    u.HoTen as TacGia
                FROM TinTuc tn
                JOIN user u ON tn.UserId = u.IdUser
                WHERE tn.TrangThai = 'HienThi'
                ORDER BY tn.NgayTao DESC
                LIMIT 5
            `);
            console.log('News:', news);
        }

        console.log('\n✅ All tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

testNewsAPI();
