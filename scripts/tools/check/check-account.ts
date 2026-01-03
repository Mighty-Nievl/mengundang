import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');
const accounts = db.query("SELECT userId, providerId, password FROM account WHERE userId = 'b34beee5-72a2-479b-bf71-b434f0daae6e'").all();
console.log(JSON.stringify(accounts, null, 2));
db.close();
