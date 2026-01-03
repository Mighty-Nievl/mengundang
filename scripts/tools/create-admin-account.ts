import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');

const email = "support@zalan.web.id";
const userId = "b34beee5-72a2-479b-bf71-b434f0daae6e";
const password = "$argon2id$v=19$m=65536,t=2,p=1$R7uEqEAhaprFnBY577XplmU+Klh63jO3QosBq9G/j5o$lwHyGA9+wpAZ1r7pyU1kjTZ+Orxo8bFolYDyCumOWCM";

const now = Math.floor(Date.now() / 1000);

// Use crypto.randomUUID for a random ID if needed, or just a random string
const id = crypto.randomUUID().replace(/-/g, '');

try {
    db.run(`
        INSERT INTO account (id, user_id, account_id, provider_id, password, created_at, updated_at)
        VALUES (?, ?, ?, 'email', ?, ?, ?)
    `, [id, userId, email, password, now, now]);
    console.log('Account entry created successfully for', email);
} catch (e) {
    console.error('Failed to create account entry:', e);
}

db.close();
