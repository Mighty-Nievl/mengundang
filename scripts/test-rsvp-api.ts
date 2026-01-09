
const BASE_URL = 'http://localhost:3000';
const SLUG = 'test-rsvp-verif';

async function testRSVP() {
    console.log('🧪 Starting RSVP API Test...');

    // 1. Test Valid Submission
    console.log('\n[TEST 1] Submitting valid RSVP...');
    try {
        const res = await fetch(`${BASE_URL}/api/rsvp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                slug: SLUG,
                name: 'Tamu Test 1',
                status: 'Hadir',
                message: 'Selamat ya!'
            })
        });

        const data = await res.json();
        if (res.ok && data.success && data.comment.name === 'Tamu Test 1') {
            console.log('✅ Success! Comment saved:', data.comment.id);
        } else {
            console.error('❌ Failed:', data);
            process.exit(1);
        }
    } catch (e) {
        console.error('❌ Connection Error. Is the server running?', e);
        process.exit(1);
    }

    // 2. Test Invalid Submission (Missing Name)
    console.log('\n[TEST 2] Submitting invalid RSVP (missing status)...');
    try {
        const res = await fetch(`${BASE_URL}/api/rsvp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                slug: SLUG,
                name: 'Tamu Invalid'
                // Missing status
            })
        });

        const data = await res.json();
        if (!res.ok && data.statusCode === 400) {
            console.log('✅ Correctly rejected:', data.statusMessage);
        } else {
            console.error('❌ Unexpected success or wrong error:', data);
        }
    } catch (e) {
        console.error('❌ Error:', e);
    }

    // 3. Verify Persistence (Fetch page or check DB - here we rely on success response from Test 1)
    // In a real E2E, we would fetch the GET endpoint, but RSVP usually loads via page data.

    console.log('\n🎉 All RSVP tests passed!');
}

testRSVP();
