const db = require('./config/database');

async function addDeletedField() {
    try {
        console.log('Checking if DaXoa column exists...');
        
        // Check if DaXoa column exists
        const [check] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'ChuyenNganh' 
            AND TABLE_NAME = 'DonHang' 
            AND COLUMN_NAME = 'DaXoa'
        `);
        
        if (check.length === 0) {
            console.log('Adding DaXoa column...');
            await db.query('ALTER TABLE DonHang ADD COLUMN DaXoa TINYINT(1) DEFAULT 0 AFTER TrangThaiDonHang');
            console.log('✓ DaXoa column added');
        } else {
            console.log('✓ DaXoa column already exists');
        }
        
        console.log('\n✓ Database updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating database:', error);
        process.exit(1);
    }
}

addDeletedField();
