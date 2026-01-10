// Check ThanhToan table structure
const db = require('./config/database');

async function checkPaymentEnum() {
    try {
        console.log('Checking ThanhToan table structure...\n');
        
        const [columns] = await db.query(`
            SHOW COLUMNS FROM ThanhToan WHERE Field = 'TrangThaiThanhToan'
        `);
        
        console.log('TrangThaiThanhToan column:');
        console.log(JSON.stringify(columns, null, 2));
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkPaymentEnum();
