import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_NAME = 'premium-invitation';
const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
    console.error('.env file not found');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');

const secrets = {
    'NUXT_BETTER_AUTH_SECRET': null,
    'NUXT_BETTER_AUTH_URL': 'https://premium-invitation.pages.dev',
    'NUXT_GOOGLE_CLIENT_ID': null,
    'NUXT_GOOGLE_CLIENT_SECRET': null,
    'INTERNAL_API_SECRET': 'rahasia123',
    'WHATSAPP_TOKEN': null,
    'WHATSAPP_PHONE_ID': '1113130907380188',
    'WHATSAPP_TARGET_PHONE': null,
    'FLIP_SECRET_KEY': null,
    'FLIP_VALIDATION_TOKEN': null,
    'FLIP_ENV': null,
    'R2_ACCOUNT_ID': null,
    'R2_ACCESS_KEY_ID': null,
    'R2_SECRET_ACCESS_KEY': null,
    'R2_BUCKET_NAME': null,
    'R2_PUBLIC_URL': null
};

// Parse .env for values
lines.forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        const nuxtKey = key.startsWith('NUXT_') ? key : `NUXT_${key}`;

        // Try matching with and without NUXT_ prefix
        if (key in secrets && !secrets[key]) {
            secrets[key] = value;
        } else if (nuxtKey in secrets && !secrets[nuxtKey]) {
            secrets[nuxtKey] = value;
        }
    }
});

console.log(`🚀 Pushing secrets to Cloudflare Pages project: ${PROJECT_NAME}...`);

for (const [key, value] of Object.entries(secrets)) {
    if (value) {
        console.log(`Setting ${key}...`);
        try {
            // Using echo to pip the value into wrangler to avoid interactive prompt
            execSync(`echo "${value}" | npx wrangler pages secret put ${key} --project-name ${PROJECT_NAME}`, { stdio: 'inherit' });
        } catch (e) {
            console.error(`Failed to set ${key}`);
        }
    } else {
        console.warn(`Missing value for ${key}, skipping.`);
    }
}

console.log('✅ All secrets pushed!');
