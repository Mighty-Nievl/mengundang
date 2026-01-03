import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');
console.log('Session Info:', db.query("PRAGMA table_info(session)").all());
console.log('Account Info:', db.query("PRAGMA table_info(account)").all());
db.close();
