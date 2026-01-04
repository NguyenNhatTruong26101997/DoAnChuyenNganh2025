const db = require('./config/database');

async function updateUserTable() {
    try {
        console.log('Checking if columns exist...');
        
        // Check if DiaChi column exists
        const [diaChiCheck] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'ChuyenNganh' 
            AND TABLE_NAME = 'user' 
            AND COLUMN_NAME = 'DiaChi'
        `);
        
        if (diaChiCheck.length === 0) {
            console.log('Adding DiaChi column...');
            await db.query('ALTER TABLE user ADD COLUMN DiaChi TEXT AFTER SoDienThoai');
            console.log('✓ DiaChi column added');
        } else {
            console.log('✓ DiaChi column already exists');
        }
        
        // Check if AnhDaiDien column exists
        const [anhCheck] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'ChuyenNganh' 
            AND TABLE_NAME = 'user' 
            AND COLUMN_NAME = 'AnhDaiDien'
        `);
        
        if (anhCheck.length === 0) {
            console.log('Adding AnhDaiDien column...');
            await db.query('ALTER TABLE user ADD COLUMN AnhDaiDien VARCHAR(500) AFTER DiaChi');
            console.log('✓ AnhDaiDien column added');
        } else {
            console.log('✓ AnhDaiDien column already exists');
        }
        
        console.log('\n✓ User table updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating user table:', error);
        process.exit(1);
    }
}

updateUserTable();
