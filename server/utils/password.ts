/**
 * Edge-compatible password hashing using PBKDF2 with Web Crypto API
 * This is lighter than Argon2/scrypt WASM and works on Cloudflare Workers
 */

const ITERATIONS = 100000;
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 16; // 128 bits

function arrayBufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
}

export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    // Generate random salt
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

    // Import password as key
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordData,
        'PBKDF2',
        false,
        ['deriveBits']
    );

    // Derive key using PBKDF2
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

    // Format: iterations:salt:hash (all hex)
    const saltHex = arrayBufferToHex(salt.buffer);
    const hashHex = arrayBufferToHex(derivedBits);

    return `${ITERATIONS}:${saltHex}:${hashHex}`;
}

export async function verifyPassword(data: { password: string; hash: string }): Promise<boolean> {
    const { password, hash } = data;

    try {
        const parts = hash.split(':');
        if (parts.length !== 3) return false;
        const [iterStr, saltHex, expectedHashHex] = parts;
        const iterations = parseInt(iterStr!, 10);
        const salt = new Uint8Array(hexToArrayBuffer(saltHex!));

        const encoder = new TextEncoder();
        const passwordData = encoder.encode(password);

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
                iterations: iterations,
                hash: 'SHA-256'
            },
            keyMaterial,
            KEY_LENGTH * 8
        );

        const derivedHashHex = arrayBufferToHex(derivedBits);

        // Constant-time comparison
        if (derivedHashHex.length !== expectedHashHex!.length) return false;
        let diff = 0;
        for (let i = 0; i < derivedHashHex.length; i++) {
            diff |= derivedHashHex.charCodeAt(i) ^ expectedHashHex!.charCodeAt(i);
        }
        return diff === 0;
    } catch (e) {
        console.error('Password verification error:', e);
        return false;
    }
}
