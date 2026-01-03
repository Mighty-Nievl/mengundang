import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');
const accounts = db.query("SELECT * FROM account").all();
console.log(JSON.stringify(accounts, null, 2));
db.close();
