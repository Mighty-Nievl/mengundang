import { Database } from 'bun:sqlite';

async function reset() {
    const email = "support@zalan.web.id";
    const userId = "b34beee5-72a2-479b-bf71-b434f0daae6e";
    const password = "admin12345678";

    // Use Bcrypt (default for many auth sys if not scrypt)
    // In Bun, we can't easily force bcrypt with password.hash without plugins, 
    // but wait, bun's password.hash automatically detects if it should use argon2 or bcrypt.
    // Actually, Better-Auth 1.0+ uses scrypt.

    // Let's try to use a simple scrypt hash? No, let's try bcrypt first.
    // To get bcrypt in Bun:
    const hash = await Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: 10
    });

    const db = new Database('sqlite.db');

    // Update USER table
    db.run('UPDATE user SET password = ? WHERE email = ?', [hash, email]);

    // Update ACCOUNT table
    db.run('UPDATE account SET password = ? WHERE user_id = ? AND provider_id = "email"', [hash, userId]);

    db.close();
    console.log('Password updated to Bcrypt for', email);
}

reset();
