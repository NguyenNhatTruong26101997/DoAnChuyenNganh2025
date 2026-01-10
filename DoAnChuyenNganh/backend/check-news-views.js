const db = require('./config/database');

async function checkNewsViews() {
    try {
        const [news] = await db.query('SELECT IdTinTuc, TieuDe, LuotXem FROM TinTuc ORDER BY NgayTao DESC LIMIT 5');
        
        console.log('Recent news with views:');
        console.table(news);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkNewsViews();
