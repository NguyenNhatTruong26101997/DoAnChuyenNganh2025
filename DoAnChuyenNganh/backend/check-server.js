// Quick script to check if server is running and test endpoints
const http = require('http');

function testEndpoint(path, description) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✓ ${description}: OK (${res.statusCode})`);
                } else {
                    console.log(`✗ ${description}: FAILED (${res.statusCode})`);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.log(`✗ ${description}: Server not running or error`);
            console.log(`  Error: ${error.message}`);
            resolve();
        });

        req.end();
    });
}

async function checkServer() {
    console.log('Checking server status...\n');
    
    await testEndpoint('/health', 'Health check');
    await testEndpoint('/api/admin/statistics?year=2024', 'Statistics endpoint (will fail without auth)');
    
    console.log('\n' + '='.repeat(50));
    console.log('If you see "Server not running", please start the server:');
    console.log('  cd backend');
    console.log('  node server.js');
    console.log('='.repeat(50));
}

checkServer();
