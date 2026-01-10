// Test cancel order with detailed error logging
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Test data - thay đổi theo đơn hàng thực tế của bạn
const TEST_ORDER_ID = 83; // DH1767958299904883
const USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidHJ1b25nQGdtYWlsLmNvbSIsInZhaVRybyI6IlVzZXIiLCJpYXQiOjE3MzY0MTI5NzksImV4cCI6MTczNjQ5OTM3OX0.Ql-Ql8Ql8Ql8Ql8Ql8Ql8Ql8Ql8Ql8Ql8Ql8Ql8'; // Thay bằng token thật

async function testCancelOrder() {
    try {
        console.log('🧪 Testing cancel order...');
        console.log('Order ID:', TEST_ORDER_ID);
        console.log('API URL:', `${API_URL}/orders/${TEST_ORDER_ID}/cancel`);
        
        const response = await axios.put(
            `${API_URL}/orders/${TEST_ORDER_ID}/cancel`,
            {}, // Empty body
            {
                headers: {
                    'Authorization': `Bearer ${USER_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Success:', response.data);
    } catch (error) {
        console.error('❌ Error:');
        
        if (error.response) {
            // Server responded with error
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            // Request was made but no response
            console.error('No response received');
            console.error('Request:', error.request);
        } else {
            // Something else happened
            console.error('Error message:', error.message);
        }
        
        console.error('Full error:', error);
    }
}

// Get order details first
async function getOrderDetails() {
    try {
        console.log('📋 Getting order details...');
        
        const response = await axios.get(
            `${API_URL}/orders/${TEST_ORDER_ID}`,
            {
                headers: {
                    'Authorization': `Bearer ${USER_TOKEN}`
                }
            }
        );
        
        console.log('Order details:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('❌ Error getting order:', error.response?.data || error.message);
    }
}

// Run tests
(async () => {
    console.log('='.repeat(50));
    console.log('CANCEL ORDER TEST');
    console.log('='.repeat(50));
    
    await getOrderDetails();
    console.log('\n');
    await testCancelOrder();
})();
