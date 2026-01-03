// scripts/audit-drive-api.ts
import { fetch } from 'bun';

const API_KEY = process.env.NUXT_GOOGLE_DRIVE_API_KEY || 'AIzaSyB7_1Swn94CRAznJZZdI2fYcCgdnwcr8es';
// Extracted from user logs
const FOLDER_ID = '1--z5BArlOw6tWaZgp9-JUWotQk--bMzU';

async function audit() {
    console.log('--- STARTING AUDIT ---');
    console.log('API Key:', API_KEY ? 'Present' : 'Missing');
    console.log('Folder ID:', FOLDER_ID);

    const q = `'${FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&key=${API_KEY}&fields=files(id,name,mimeType,thumbnailLink,webContentLink,webViewLink)`;

    console.log('Fetching:', url);

    try {
        const res = await fetch(url);
        const data: any = await res.json();

        if (data.error) {
            console.error('API ERROR:', data.error);
            return;
        }

        console.log(`Found ${data.files?.length || 0} files.`);

        if (data.files?.length) {
            const file = data.files[0];
            console.log('\n--- SAMPLE FILE ---');
            console.log('ID:', file.id);
            console.log('Name:', file.name);
            console.log('Thumbnail Link:', file.thumbnailLink);
            console.log('Web Content Link:', file.webContentLink);

            const lh3Link = `https://lh3.googleusercontent.com/d/${file.id}`;
            console.log('Generated LH3 Link:', lh3Link);

            console.log('\n--- LINK CHECKS ---');
            const checks = [
                { name: 'Thumbnail', url: file.thumbnailLink },
                { name: 'LH3 Proxy', url: lh3Link }
            ];

            for (const check of checks) {
                try {
                    const checkRes = await fetch(check.url, { method: 'HEAD' });
                    console.log(`[${checkRes.status}] ${check.name}: ${check.url}`);
                } catch (e: any) {
                    console.log(`[FAIL] ${check.name}: ${e.message}`);
                }
            }
        }

    } catch (e: any) {
        console.error('Script Error:', e);
    }
}

audit();
