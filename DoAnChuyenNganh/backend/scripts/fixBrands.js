// Fix brands: rename Apple to Macbook, remove duplicate Dell
const db = require('../config/database');

async function fixBrands() {
    try {
        console.log('Fixing brands...');
        
        // 1. Rename Apple to Macbook
        await db.query("UPDATE ThuongHieu SET TenThuongHieu = 'Macbook' WHERE TenThuongHieu = 'Apple'");
        console.log('✓ Renamed Apple to Macbook');
        
        // 2. Find duplicate Dell
        const [dells] = await db.query("SELECT IdThuongHieu FROM ThuongHieu WHERE TenThuongHieu = 'Dell' ORDER BY IdThuongHieu");
        
        if (dells.length > 1) {
            // Keep first Dell, delete others
            const keepId = dells[0].IdThuongHieu;
            const deleteIds = dells.slice(1).map(d => d.IdThuongHieu);
            
            // Update products using duplicate Dell to use the first one
            for (const id of deleteIds) {
                await db.query("UPDATE SanPham SET ThuongHieuId = ? WHERE ThuongHieuId = ?", [keepId, id]);
            }
            
            // Delete duplicate Dell
            await db.query("DELETE FROM ThuongHieu WHERE IdThuongHieu IN (?)", [deleteIds]);
            console.log(`✓ Removed ${deleteIds.length} duplicate Dell(s)`);
        } else {
            console.log('✓ No duplicate Dell found');
        }
        
        // Show current brands
        const [brands] = await db.query("SELECT * FROM ThuongHieu ORDER BY TenThuongHieu");
        console.log('\nCurrent brands:');
        brands.forEach(b => console.log(`  - ${b.IdThuongHieu}: ${b.TenThuongHieu}`));
        
        console.log('\n✓ Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

fixBrands();
