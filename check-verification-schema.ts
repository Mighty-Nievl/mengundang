import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');
const verificationInfo = db.query("PRAGMA table_info(verification)").all();
console.log('Verification Table Info:', verificationInfo);
db.close();
