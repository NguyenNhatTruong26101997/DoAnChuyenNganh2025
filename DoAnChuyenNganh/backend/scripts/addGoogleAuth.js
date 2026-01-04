const db = require('../config/database');

async function addGoogleAuthColumn() {
    try {
        console.log('Adding GoogleId column to user table...');

        // Add GoogleId column
        await db.query(`
            ALTER TABLE user 
            ADD COLUMN GoogleId VARCHAR(255) NULL UNIQUE AFTER Email
        `);

        console.log('✓ GoogleId column added successfully');

        // Make MatKhau nullable for Google users
        await db.query(`
            ALTER TABLE user 
            MODIFY COLUMN MatKhau VARCHAR(255) NULL
        `);

        console.log('✓ MatKhau column updated to allow NULL');

        console.log('\n✅ Google OAuth setup completed!');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠ GoogleId column already exists');
            process.exit(0);
        }
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addGoogleAuthColumn();
