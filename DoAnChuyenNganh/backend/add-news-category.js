const db = require('./config/database');

async function addNewsCategory() {
    try {
        console.log('Adding DanhMuc column to TinTuc table...\n');
        
        // Add DanhMuc column
        await db.query(`
            ALTER TABLE TinTuc 
            ADD COLUMN DanhMuc VARCHAR(50) DEFAULT 'Hàng Mới' AFTER TieuDe
        `);
        
        console.log('✓ DanhMuc column added successfully!');
        
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column DanhMuc already exists!');
            process.exit(0);
        } else {
            console.error('Error:', error);
            process.exit(1);
        }
    }
}

addNewsCategory();
