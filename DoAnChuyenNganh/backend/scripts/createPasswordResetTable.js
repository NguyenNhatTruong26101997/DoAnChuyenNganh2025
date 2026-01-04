const db = require('../config/database');

async function createPasswordResetTable() {
    try {
        console.log('Creating password_reset_tokens table...');

        await db.query(`
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                IdToken INT AUTO_INCREMENT PRIMARY KEY,
                UserId INT NOT NULL,
                Email VARCHAR(255) NOT NULL,
                ResetCode VARCHAR(6) NOT NULL,
                ExpiresAt DATETIME NOT NULL,
                Used TINYINT(1) DEFAULT 0,
                CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (UserId) REFERENCES user(IdUser) ON DELETE CASCADE,
                INDEX idx_email (Email),
                INDEX idx_reset_code (ResetCode),
                INDEX idx_expires (ExpiresAt)
            ) ENGINE=InnoDB
        `);

        console.log('✓ password_reset_tokens table created successfully');

        console.log('\n✅ Password reset setup completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createPasswordResetTable();
