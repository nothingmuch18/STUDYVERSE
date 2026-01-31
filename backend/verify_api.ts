
const API_URL = 'http://localhost:3002/api';

async function verify() {
    try {
        console.log('1. Registering test user...');
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Verification User',
                email: `verify_${Date.now()}@example.com`,
                password: 'password123'
            })
        });

        const regData = await regRes.json();
        const token = regData.token;
        console.log('   Success! Token received.');

        console.log('1b. Verifying Token with /auth/me...');
        const meRes = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const meData = await meRes.json();
        if (!meRes.ok) throw new Error('Auth Me Failed: ' + JSON.stringify(meData));
        console.log('   /auth/me OK:', meData.user.email);

        console.log('2. Fetching Analytics...');
        const anaRes = await fetch(`${API_URL}/analytics`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const anaData = await anaRes.json();
        if (!anaRes.ok) throw new Error(JSON.stringify(anaData));

        console.log('   Response Keys:', Object.keys(anaData));
        console.log('   Structure Check:');
        console.log('   - streak:', anaData.streak);
        console.log('   - weeklyFocusHours:', anaData.weeklyFocusHours);

        console.log('   Stats OK.');

        console.log('3. Testing Tasks...');
        const taskRes = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'Verify Task',
                priority: 'HIGH'
            })
        });
        const taskData = await taskRes.json();
        if (!taskRes.ok) throw new Error('Task creation failed: ' + JSON.stringify(taskData));
        console.log('   Task Created:', taskData.task.id);

        console.log('4. Testing Habits...');
        const habitRes = await fetch(`${API_URL}/habits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'Verify Habit',
                frequency: 1
            })
        });
        const habitData = await habitRes.json();
        if (!habitRes.ok) throw new Error('Habit creation failed: ' + JSON.stringify(habitData));
        console.log('   Habit Created:', habitData.habit.id);

        console.log('✅ ALL SYSTEMS GO! Backend is ready.');

    } catch (error: any) {
        console.error('❌ Verification Failed:', error.message || error);
    }
}

verify();
