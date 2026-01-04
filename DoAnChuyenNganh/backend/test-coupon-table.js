const db = require('./config/database');

async function testCouponTable() {
    try {
        console.log('Testing MaGiamGia table structure...\n');
        
        // Check table structure
        const [columns] = await db.query('DESCRIBE MaGiamGia');
        console.log('Table columns:');
        console.table(columns);
        
        // Check if LoaiGiam column exists
        const loaiGiamExists = columns.some(col => col.Field === 'LoaiGiam');
        const soTienGiamExists = columns.some(col => col.Field === 'SoTienGiam');
        
        console.log('\n=== Column Check ===');
        console.log('LoaiGiam exists:', loaiGiamExists ? '✓ YES' : '✗ NO - MISSING!');
        console.log('SoTienGiam exists:', soTienGiamExists ? '✓ YES' : '✗ NO - MISSING!');
        
        if (!loaiGiamExists || !soTienGiamExists) {
            console.log('\n⚠️  ERROR: Missing required columns!');
            console.log('Please run: backend/scripts/fix_coupon_table.sql');
        } else {
            console.log('\n✓ Table structure is correct!');
            
            // Try to get all coupons
            const [coupons] = await db.query('SELECT * FROM MaGiamGia');
            console.log(`\nFound ${coupons.length} coupons in database`);
            if (coupons.length > 0) {
                console.log('\nSample coupon:');
                console.log(coupons[0]);
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

testCouponTable();
