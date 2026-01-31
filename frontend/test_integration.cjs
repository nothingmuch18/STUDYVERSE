const axios = require('axios');
const API_URL = 'http://localhost:3001/api';

async function test() {
    try {
        console.log('Testing Backend Connection...');

        // Register
        const email = `test_${Date.now()}@example.com`;
        const password = 'password123';
        console.log(`Registering ${email}...`);

        const regRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Test User',
            email,
            password
        });

        const token = regRes.data.token;
        console.log('Registered! Token:', token.substring(0, 10) + '...');

        // Create Task
        console.log('Creating Task...');
        const taskRes = await axios.post(`${API_URL}/tasks`, {
            title: 'Test Task via Script',
            priority: 'high'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Task Created:', taskRes.data.id);

        // Fetch Tasks
        console.log('Fetching Tasks...');
        const tasksRes = await axios.get(`${API_URL}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Tasks fetched:', tasksRes.data.length);

        if (tasksRes.data.some(t => t.id === taskRes.data.id)) {
            console.log('SUCCESS: Integration Verified!');
        } else {
            console.error('FAILURE: Created task not found in list');
            process.exit(1);
        }

    } catch (e) {
        if (e.response) {
            console.error('SERVER_ERROR:', e.response.status);
            console.error('BODY:', JSON.stringify(e.response.data));
        } else {
            console.error('NETWORK_ERROR:', e.message);
        }
        process.exit(1);
    }
}

test();
