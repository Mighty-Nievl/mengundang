import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');
const users = db.query('SELECT email, role FROM user').all();
console.log(JSON.stringify(users, null, 2));
db.close();
