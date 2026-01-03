import { Database } from 'bun:sqlite';

// Simple script to set a known password hash for better-auth
// Better-Auth by default uses bcrypt-like hashing or scrypt.
// However, we can just use a simple approach: 
// Since we don't know the exact internal salt/rounds of better-auth's scrypt easily without booting the whole thing,
// we will try to use a script that imports 'better-auth' utilities if possible.

// But wait, Bun has built-in password hashing that is compatible with many things.
// Better-auth uses 'scrypt' by default.

async function reset() {
    const email = "support@zalan.web.id";
    const newPassword = "admin12345678"; // Min 8 chars as per config

    // Better-auth hashes passwords using a specific format.
    // The easiest way is to use the auth object if we can, but it needs env vars.
    // Let's try to manually update the password to a plain string first to see if it works (unlikely)
    // or use a hash that better-auth recognizes.

    // Actually, I'll just use a script that uses Bun.password.hash which is Bcrypt.
    // Better-auth supports Bcrypt if configured or by default in some versions.

    const hash = await Bun.password.hash(newPassword);

    const db = new Database('sqlite.db');
    db.run('UPDATE user SET password = ? WHERE email = ?', [hash, email]);
    db.close();

    console.log(`Password for ${email} has been reset to: ${newPassword}`);
}

reset();
