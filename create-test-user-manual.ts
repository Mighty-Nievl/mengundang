import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');

const email = "tamu@zalan.web.id";
const userId = crypto.randomUUID().replace(/-/g, '');
const password = "admin12345678";
// Scrypt hash for admin12345678
const hash = "163138f1c96d9dc69fbf9a2b74f57793:3be07415f34af784d159743831e6ff4e44495be93f61ecf5d360eac394183ecaf8c67176e627b8f6a3cad14aacecb8c5c6fc2c6665975394ec93e8d0c5e7d5aa";

const now = Math.floor(Date.now() / 1000);

try {
    // 1. Create User
    db.run(`
        INSERT INTO user (id, name, email, email_verified, created_at, updated_at, role, plan, max_invitations, password)
        VALUES (?, 'User Tamu', ?, 1, ?, ?, 'user', 'free', 1, ?)
    `, [userId, email, now, now, hash]);

    // 2. Create Account (Needed for email/password login)
    db.run(`
        INSERT INTO account (id, user_id, account_id, provider_id, password, created_at, updated_at)
        VALUES (?, ?, ?, 'credential', ?, ?, ?)
    `, [crypto.randomUUID().replace(/-/g, ''), userId, userId, hash, now, now]);

    console.log('Manual test user created successfully:', email);
} catch (e) {
    console.error('Failed to manually create test user:', e);
}

db.close();
