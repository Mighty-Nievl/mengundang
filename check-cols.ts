import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');
const columns = db.query("PRAGMA table_info(account)").all();
console.log(JSON.stringify(columns, null, 2));
db.close();
