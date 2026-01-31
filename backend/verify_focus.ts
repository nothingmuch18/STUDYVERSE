
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api';
let authToken = '';

async function verifyFocusMode() {
    console.log('1. Login/Register...');
    try {
        const email = `test.focus.${Date.now()}@example.com`;
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Focus Tester', email, password: 'password123' })
        });
        const data = await res.json();
        authToken = data.token;
        console.log('   Success!');

        console.log('2. Starting Session...');
        const startRes = await fetch(`${API_URL}/sessions/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ subject: 'Testing', startTime: new Date().toISOString() })
        });
        const session = (await startRes.json()).session;
        if (!session || !session.id) throw new Error('Session start failed');
        console.log('   Success! Session ID:', session.id);

        console.log('3. Ending Session...');
        const endRes = await fetch(`${API_URL}/sessions/${session.id}/end`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ focusScore: 85, notes: 'Automated test session' })
        });
        let endedSession;
        const responseText = await endRes.text();
        console.log('   Debug - End Status:', endRes.status, endRes.statusText);
        console.log('   Debug - End Response:', responseText);
        try {
            const json = JSON.parse(responseText);
            if (json.error) throw new Error(json.error);
            endedSession = json.session;
        } catch (e) {
            throw new Error(`Failed to parse response: ${e} -- Raw: ${responseText}`);
        }
        if (!endedSession) throw new Error('No session returned in response');
        if (!endedSession.endTime) throw new Error('Session end failed to record time');
        console.log('   Success! Session ended at:', endedSession.endTime);

        console.log('\nFOCUS MODE VERIFIED ✔');

    } catch (error) {
        console.error('\nVerification Failed:', error);
        process.exit(1);
    }
}

verifyFocusMode();
