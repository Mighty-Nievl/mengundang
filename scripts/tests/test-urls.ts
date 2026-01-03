
const ID = '1AIX3Rt1wAayNpfZDcMXumqLSEhFeEzC2';
const urls = [
    `https://lh3.googleusercontent.com/d/${ID}`,
    `https://lh3.googleusercontent.com/u/0/d/${ID}`,
    `https://lh3.googleusercontent.com/d/${ID}=s1600`,
    `https://drive.google.com/thumbnail?id=${ID}&sz=w1600`,
    `https://drive.google.com/uc?id=${ID}&export=view`
];

async function check() {
    for (const url of urls) {
        try {
            // Test with NO headers (simulating no-referrer)
            const res = await fetch(url, { method: 'HEAD', headers: {} });
            console.log(`[${res.status}] ${url}`);
        } catch (e: any) {
            console.log(`[FAIL] ${url}: ${e.message}`);
        }
    }
}
check();
