
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api';
let authToken = '';
let userId = '';

async function verifyTasks() {
    console.log('1. Registering test user...');
    try {
        const email = `test.tasks.${Date.now()}@example.com`;
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Task Tester', email, password: 'password123' })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(JSON.stringify(data));
        authToken = data.token;
        userId = data.user.id;
        console.log('   Success! Token received.');

        console.log('2. Creating a Task...');
        const createRes = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: 'Verify Task System',
                description: 'Automated test task',
                priority: 'HIGH',
                subject: 'DevOps'
            })
        });
        const task = (await createRes.json()).task;
        if (!task || !task.id) throw new Error('Task creation failed');
        console.log('   Success! Task ID:', task.id);

        console.log('3. Updating Task...');
        const updateRes = await fetch(`${API_URL}/tasks/${task.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status: 'IN_PROGRESS' })
        });
        const updatedTask = (await updateRes.json()).task;
        if (updatedTask.status !== 'IN_PROGRESS') throw new Error('Task update failed');
        console.log('   Success! Status updated to IN_PROGRESS');

        console.log('4. Deleting Task...');
        const deleteRes = await fetch(`${API_URL}/tasks/${task.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!deleteRes.ok) throw new Error('Task deletion failed');
        console.log('   Success! Task deleted.');

        console.log('\nTASK SYSTEM VERIFIED ✔');

    } catch (error) {
        console.error('\nVerification Failed:', error);
        process.exit(1);
    }
}

verifyTasks();
