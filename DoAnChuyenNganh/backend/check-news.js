const db = require('./config/database');

async function checkNews() {
    try {
        console.log('Checking TinTuc table...\n');
        
        const [news] = await db.query('SELECT IdTinTuc, TieuDe, AnhBia, NgayTao, TrangThai FROM TinTuc ORDER BY NgayTao DESC LIMIT 5');
        
        console.log('Recent news:');
        console.table(news);
        
        const [count] = await db.query('SELECT COUNT(*) as total FROM TinTuc');
        console.log(`\nTotal news: ${count[0].total}`);
        
        const [comments] = await db.query('SELECT COUNT(*) as total FROM BinhLuanTinTuc');
        console.log(`Total comments: ${comments[0].total}`);
        
        // Check if image files exist
        const fs = require('fs');
        const path = require('path');
        console.log('\nChecking image files:');
        for (const item of news) {
            if (item.AnhBia) {
                // Remove leading slash for file system check
                const relativePath = item.AnhBia.startsWith('/') ? item.AnhBia.substring(1) : item.AnhBia;
                const imagePath = path.join(__dirname, '..', relativePath);
                const exists = fs.existsSync(imagePath);
                console.log(`${item.AnhBia}: ${exists ? '✓ EXISTS' : '✗ NOT FOUND'}`);
                if (!exists) {
                    console.log(`  Looking for: ${imagePath}`);
                }
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkNews();
