// Check notification links
const db = require('./config/database');

async function checkLinks() {
    try {
        const [notifications] = await db.query(`
            SELECT IdThongBao, TieuDe, LienKet, LoaiThongBao
            FROM ThongBao 
            ORDER BY NgayTao DESC 
            LIMIT 5
        `);
        
        console.log('Recent notification links:');
        console.table(notifications);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkLinks();
