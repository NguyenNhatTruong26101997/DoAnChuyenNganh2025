// Test if routes are loaded correctly
const express = require('express');
const app = express();

try {
    const statisticsRoutes = require('./routes/statistics');
    console.log('✓ Statistics routes loaded successfully');
    
    app.use('/api/admin', statisticsRoutes);
    console.log('✓ Statistics routes registered at /api/admin');
    
    // List all routes
    console.log('\nRegistered routes:');
    app._router.stack.forEach(function(r){
        if (r.route && r.route.path){
            console.log('  ' + Object.keys(r.route.methods)[0].toUpperCase() + ' ' + r.route.path);
        } else if (r.name === 'router') {
            r.handle.stack.forEach(function(route){
                if (route.route) {
                    console.log('  ' + Object.keys(route.route.methods)[0].toUpperCase() + ' /api/admin' + route.route.path);
                }
            });
        }
    });
    
    console.log('\n✓ All routes loaded successfully!');
} catch (error) {
    console.error('✗ Error loading routes:', error.message);
    console.error(error.stack);
}
