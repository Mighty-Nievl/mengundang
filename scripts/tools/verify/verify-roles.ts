import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');
console.log('--- USERS ---');
console.log(db.query("SELECT id, email, role FROM user").all());
console.log('--- INVITATIONS ---');
console.log(db.query("SELECT slug, owner FROM invitation WHERE slug = 'wulanrezal'").all());
db.close();
