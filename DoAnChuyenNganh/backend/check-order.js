const db = require('./config/database');

async function checkOrder() {
    const [rows] = await db.query('SELECT * FROM DonHang ORDER BY DonHangTao DESC LIMIT 5');
    console.table(rows);
    process.exit();
}

checkOrder();
