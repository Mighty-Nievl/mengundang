/**
 * Script to update password for existing users using the new PBKDF2 hashing
 * Run with: bunx wrangler d1 execute mengundang-db --remote --file=scripts/maintenance/update-password.sql
 * Or use the API endpoint
 */

const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

function arrayBufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordData,
        'PBKDF2',
        false,
        ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: ITERATIONS,
            hash: 'SHA-256'
        },
        keyMaterial,
        KEY_LENGTH * 8
    );

    const saltHex = arrayBufferToHex(salt.buffer);
    const hashHex = arrayBufferToHex(derivedBits);

    return `${ITERATIONS}:${saltHex}:${hashHex}`;
}

// Example: Generate a new password hash
async function main() {
    const password = process.argv[2] || 'password123';
    const hash = await hashPassword(password);

    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log(`\nSQL to update account:`);
    console.log(`UPDATE account SET password = '${hash}' WHERE userId = '<USER_ID>' AND providerId = 'credential';`);
}

main().catch(console.error);
