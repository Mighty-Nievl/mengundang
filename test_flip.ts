const SECRET_ENCODED = 'JDJ5JDEzJE1EcGUwaFRFV3huM1ZmVTc3QkVjSi53YmZiTWpEWTUvMC85aEwybzMxMDdhc1VYN1hJamhH';
const SECRET_DECODED = Buffer.from(SECRET_ENCODED, 'base64').toString();

console.log('Encoded:', SECRET_ENCODED);
console.log('Decoded:', SECRET_DECODED);

async function testFlip(key: string, label: string) {
    console.log(`\n--- Testing ${label} ---`);
    const auth = Buffer.from(`${key}:`).toString('base64');

    // Test Balance
    try {
        const res = await fetch('https://bigflip.id/api/v2/get-balance', {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        console.log(`Balance Status: ${res.status}`);
        const data = await res.text();
        console.log('Balance Response:', data);
    } catch (e: any) {
        console.error(`Balance Error: ${e.message}`);
    }

    // Test Bill
    const baseUrl = 'https://bigflip.id/api/v2/pwf/bill';
    try {
        const res = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                title: 'Test Connection',
                amount: '10000',
                type: 'SINGLE'
            })
        });
        const data = await res.json();
        console.log(`Bill Status: ${res.status}`);
        console.log('Bill Response:', JSON.stringify(data, null, 2));
    } catch (e: any) {
        console.error(`Bill Error: ${e.message}`);
    }
}

async function run() {
    await testFlip(SECRET_ENCODED, 'Encoded Version');
    await testFlip(SECRET_DECODED, 'Decoded (Bcrypt) Version');
}

run();
