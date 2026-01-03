import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');
const allAccounts = db.query("SELECT * FROM account").all();
console.log(JSON.stringify(allAccounts, null, 2));
db.close();
