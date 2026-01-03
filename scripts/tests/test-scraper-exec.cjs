const { exec } = require('child_process');
const path = require('path');

const scriptPath = path.resolve(process.cwd(), 'gofood-scraper.cjs');
console.log(`Running scraper: ${scriptPath}`);

exec(`node ${scriptPath}`, { cwd: process.cwd(), timeout: 120000 }, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }

    // Parse JSON Output
    const jsonMatch = stdout.match(/---JSON_START---([\s\S]*?)---JSON_END---/);
    if (!jsonMatch) {
        console.error("Scraper did not return valid JSON block.");
        console.log(stdout); // Print all output to debug
        return;
    }

    try {
        const transactions = JSON.parse(jsonMatch[1]);
        console.log(`SUCCESS: Found ${transactions.length} transactions.`);
        console.log(JSON.stringify(transactions, null, 2));
    } catch (e) {
        console.error("Failed to parse JSON:", e);
    }
});
