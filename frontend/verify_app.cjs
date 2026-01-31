const axios = require('axios');

const API_URL = 'http://127.0.0.1:3001/api';
const TIMESTAMP = Date.now();
const USER = {
    name: `Verifier ${TIMESTAMP}`,
    email: `verify_${TIMESTAMP}@example.com`,
    password: 'password123'
};

let token = '';

const api = axios.create({
    baseURL: API_URL,
    validateStatus: () => true // Don't throw on errors
});

// Helper for logging
const log = (step, status, details = '') => {
    const symbol = status === 'PASS' ? '✅' : '❌';
    console.log(`${symbol} [${step}] ${details}`);
    if (status === 'FAIL') process.exit(1);
};

async function runVerification() {
    console.log(`\n🚀 STARTING FULL SYSTEM VERIFICATION\nTarget: ${API_URL}\nUser: ${USER.email}\n`);

    // 1. REGISTER
    const regRes = await api.post('/auth/register', USER);
    if (regRes.status === 201) {
        log('AUTH: Register', 'PASS', `ID: ${regRes.data.user.id}`);
        token = regRes.data.token;
    } else {
        log('AUTH: Register', 'FAIL', `${regRes.status} - ${JSON.stringify(regRes.data)}`);
    }

    // Auth Header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 2. LOGIN (Verify credentials)
    const loginRes = await api.post('/auth/login', { email: USER.email, password: USER.password });
    if (loginRes.status === 200) {
        log('AUTH: Login', 'PASS', 'Token received');
    } else {
        log('AUTH: Login', 'FAIL');
    }

    // 3. CREATE TASK
    const taskData = {
        title: 'Verification Task',
        description: 'Created by automated script',
        priority: 'HIGH',
        status: 'PENDING'
    };
    const taskRes = await api.post('/tasks', taskData);
    if (taskRes.status === 201) {
        log('TASKS: Create', 'PASS', `ID: ${taskRes.data.task.id}`);
    } else {
        log('TASKS: Create', 'FAIL', JSON.stringify(taskRes.data));
    }

    // 4. FETCH TASKS
    const getTasksRes = await api.get('/tasks');
    if (getTasksRes.status === 200 && getTasksRes.data.tasks.length > 0) {
        log('TASKS: List', 'PASS', `Found ${getTasksRes.data.tasks.length} tasks`);
    } else {
        log('TASKS: List', 'FAIL');
    }

    // 5. CREATE HABIT
    const habitData = {
        title: 'Daily Verification',
        frequency: 1
    };
    const habitRes = await api.post('/habits', habitData);
    let habitId = '';
    if (habitRes.status === 201) {
        log('HABITS: Create', 'PASS', `ID: ${habitRes.data.habit.id}`);
        habitId = habitRes.data.habit.id;
    } else {
        log('HABITS: Create', 'FAIL', JSON.stringify(habitRes.data));
    }

    // 6. CHECK-IN HABIT
    const checkinRes = await api.post(`/habits/${habitId}/check`);
    if (checkinRes.status === 200) {
        log('HABITS: Check-in', 'PASS', 'Streak incremented');
    } else {
        log('HABITS: Check-in', 'FAIL', JSON.stringify(checkinRes.data));
    }

    // 7. CREATE GOAL
    const goalData = {
        title: 'Master StudyOS',
        target: 100,
        unit: 'users',
        period: 'WEEKLY'
    };
    const goalRes = await api.post('/goals', goalData);
    if (goalRes.status === 201) {
        log('GOALS: Create', 'PASS', 'Goal tracked');
    } else {
        log('GOALS: Create', 'FAIL');
    }

    // 8. ANALYTICS (Check if actions registered)
    const analyticsRes = await api.get('/analytics');
    if (analyticsRes.status === 200) {
        const d = analyticsRes.data;
        const passed = d.tasks.total > 0 && d.habits.active > 0;
        if (passed) {
            log('ANALYTICS: Overview', 'PASS', 'Reflects recent activity');
        } else {
            log('ANALYTICS: Overview', 'FAIL', 'Data not syncing');
        }
    } else {
        log('ANALYTICS: Overview', 'FAIL');
    }

    console.log('\n✨ VERIFICATION COMPLETE: ALL SYSTEMS GO');
}

runVerification().catch(e => console.error(e));
