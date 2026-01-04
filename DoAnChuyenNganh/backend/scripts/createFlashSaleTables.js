const db = require('../config/database');

async function createFlashSaleTables() {
    try {
        console.log('🔧 Creating Flash Sale tables...\n');

        // 1. Create FlashSale table
        console.log('1️⃣ Creating FlashSale table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS FlashSale (
                IdFlashSale INT PRIMARY KEY AUTO_INCREMENT,
                TenFlashSale VARCHAR(255) NOT NULL,
                MoTa TEXT,
                NgayBatDau DATETIME NOT NULL,
                NgayKetThuc DATETIME NOT NULL,
                TrangThai ENUM('DangDien', 'SapDien', 'DaKetThuc') DEFAULT 'SapDien',
                CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ FlashSale table created');

        // 2. Create FlashSaleProducts table
        console.log('\n2️⃣ Creating FlashSaleProducts table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS FlashSaleProducts (
                IdFlashSaleProduct INT PRIMARY KEY AUTO_INCREMENT,
                FlashSaleId INT NOT NULL,
                SanPhamId INT NOT NULL,
                GiaGoc DECIMAL(12,2) NOT NULL,
                GiaFlashSale DECIMAL(12,2) NOT NULL,
                SoLuongGioiHan INT DEFAULT 0,
                DaBan INT DEFAULT 0,
                FOREIGN KEY (FlashSaleId) REFERENCES FlashSale(IdFlashSale) ON DELETE CASCADE,
                FOREIGN KEY (SanPhamId) REFERENCES SanPham(IdSanPham) ON DELETE CASCADE,
                UNIQUE KEY unique_flashsale_product (FlashSaleId, SanPhamId)
            )
        `);
        console.log('  ✅ FlashSaleProducts table created');

        // 3. Insert sample flash sale
        console.log('\n3️⃣ Creating sample flash sale...');
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - 1); // Started 1 hour ago

        const endDate = new Date();
        endDate.setHours(endDate.getHours() + 23); // Ends in 23 hours

        await db.query(`
            INSERT INTO FlashSale (TenFlashSale, MoTa, NgayBatDau, NgayKetThuc, TrangThai) 
            VALUES (?, ?, ?, ?, ?)
        `, [
            'Flash Sale Cuối Tuần',
            'Giảm giá sốc các dòng laptop gaming - Số lượng có hạn!',
            startDate,
            endDate,
            'DangDien'
        ]);
        console.log('  ✅ Sample flash sale created');

        // 4. Verify
        console.log('\n📋 Current Flash Sales:');
        const [flashsales] = await db.query('SELECT * FROM FlashSale');
        console.table(flashsales);

        console.log('\n✅ Flash Sale tables created successfully!');
        console.log('\n💡 Next: Add products to flash sale via admin panel');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createFlashSaleTables();
