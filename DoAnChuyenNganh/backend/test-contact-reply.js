// Test contact reply with email
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Admin token - thay bằng token thật
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';

// Test contact ID - thay bằng ID thật
const TEST_CONTACT_ID = 1;

async function testContactReply() {
    try {
        console.log('🧪 Testing contact reply with email...');
        console.log('Contact ID:', TEST_CONTACT_ID);
        
        const response = await axios.post(
            `${API_URL}/contact/${TEST_CONTACT_ID}/reply`,
            {
                phanHoi: 'Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi đã nhận được yêu cầu của bạn và sẽ xử lý trong thời gian sớm nhất. Nếu có thắc mắc gì thêm, vui lòng liên hệ lại với chúng tôi.'
            },
            {
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Success:', response.data);
        console.log('\n📧 Email should be sent to user');
        console.log('🔔 Notification should be created for user (if logged in)');
    } catch (error) {
        console.error('❌ Error:');
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error message:', error.message);
        }
    }
}

// Get all contacts first
async function getAllContacts() {
    try {
        console.log('📋 Getting all contacts...\n');
        
        const response = await axios.get(
            `${API_URL}/contact/admin/all`,
            {
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`
                }
            }
        );
        
        console.log('Contacts:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Error getting contacts:', error.response?.data || error.message);
    }
}

// Run tests
(async () => {
    console.log('='.repeat(50));
    console.log('CONTACT REPLY TEST');
    console.log('='.repeat(50));
    console.log('\nNote: Update ADMIN_TOKEN and TEST_CONTACT_ID before running\n');
    
    // Uncomment to test
    // await getAllContacts();
    // console.log('\n');
    // await testContactReply();
    
    console.log('\n⚠️  Please update ADMIN_TOKEN and TEST_CONTACT_ID in the script');
})();
