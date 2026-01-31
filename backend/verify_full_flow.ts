
const API_URL = 'http://localhost:3001/api';

async function verifyFlow() {
    console.log('🔍 Starting End-to-End API Verification (Fetch)...');

    try {
        // 1. Health Check
        console.log('\n1. Checking Health...');
        try {
            const health = await fetch(`${API_URL}/health`);
            if (!health.ok) {
                const text = await health.text();
                throw new Error(`Status ${health.status}: ${text}`);
            }
            const data = await health.json();
            console.log('✅ Health OK:', data);
        } catch (e: any) {
            console.error('❌ Health Failed:', e.message);
            return;
        }

        // 2. Register/Login User
        console.log('\n2. Authenticating...');
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';
        let token = '';
        let userId = '';

        try {
            const register = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Test User', email, password })
            });
            const data = await register.json();

            if (register.ok) {
                token = data.token;
                userId = data.user.id;
                console.log('✅ Register OK');
            } else {
                throw new Error(JSON.stringify(data));
            }
        } catch (e: any) {
            console.error('❌ Register Failed:', e.message);
            // Try login
            try {
                const login = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
                });
                const data = await login.json();
                if (login.ok) {
                    token = data.token;
                    console.log('✅ Login OK (Fallback)');
                } else {
                    throw new Error(JSON.stringify(data));
                }
            } catch (ex: any) {
                console.error('❌ Login Failed:', ex.message);
                return;
            }
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 3. Create Task
        console.log('\n3. Testing Tasks...');
        try {
            const res = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ title: 'Test Task', priority: 'HIGH' })
            });
            const data = await res.json();
            if (res.ok) console.log('✅ Create Task OK:', data.task?.id);
            else console.error('❌ Create Task Failed:', data);
        } catch (e: any) {
            console.error('❌ Create Task Exception:', e.message);
        }

        // 4. Create Habit
        console.log('\n4. Testing Habits...');
        try {
            const res = await fetch(`${API_URL}/habits`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ title: 'Test Habit', frequency: 7 })
            });
            const data = await res.json();
            if (res.ok) console.log('✅ Create Habit OK:', data.habit?.id);
            else console.error('❌ Create Habit Failed:', data);
        } catch (e: any) {
            console.error('❌ Create Habit Exception:', e.message);
        }

        // 5. Create Goal
        console.log('\n5. Testing Goals...');
        try {
            const res = await fetch(`${API_URL}/goals`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ title: 'Test Goal', target: 10, unit: 'hours', period: 'WEEKLY' })
            });
            const data = await res.json();
            if (res.ok) console.log('✅ Create Goal OK:', data.goal?.id);
            else console.error('❌ Create Goal Failed:', data);
        } catch (e: any) {
            console.error('❌ Create Goal Exception:', e.message);
        }

        console.log('\n✨ Verification Complete');

    } catch (err: any) {
        console.error('❌ Global Error:', err.message);
    }
}

verifyFlow();
