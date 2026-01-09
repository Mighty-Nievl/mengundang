import { Database } from 'bun:sqlite';
const db = new Database('./database/sqlite.db');
const testAccount = db.query("SELECT * FROM account WHERE user_id = 'j4voo4n0Iq6R17QFh8pN9dcnD3Sl6xai'").get() as any;
console.log('Test Account:', JSON.stringify(testAccount, null, 2));
db.close();
