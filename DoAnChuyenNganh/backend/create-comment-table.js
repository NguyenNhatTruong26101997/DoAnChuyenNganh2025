const db = require('./config/database');

async function createCommentTable() {
    try {
        console.log('Creating BinhLuanTinTuc table...\n');
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS BinhLuanTinTuc (
                IdBinhLuan INT PRIMARY KEY AUTO_INCREMENT,
                TinTucId INT NOT NULL,
                UserId INT NOT NULL,
                NoiDung TEXT NOT NULL,
                NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                NgayCapNhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (TinTucId) REFERENCES TinTuc(IdTinTuc) ON DELETE CASCADE,
                FOREIGN KEY (UserId) REFERENCES user(IdUser) ON DELETE CASCADE,
                INDEX idx_tintuc (TinTucId),
                INDEX idx_ngaytao (NgayTao)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        console.log('✓ BinhLuanTinTuc table created successfully!');
        
        // Check if table exists
        const [tables] = await db.query("SHOW TABLES LIKE 'BinhLuanTinTuc'");
        console.log('Table exists:', tables.length > 0);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createCommentTable();
