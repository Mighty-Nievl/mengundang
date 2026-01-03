import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');
const allInvs = db.query("SELECT slug, owner FROM invitation LIMIT 5").all();
console.log('Invitations:', allInvs);
const allUsers = db.query("SELECT email, role FROM user LIMIT 5").all();
console.log('Users:', allUsers);
db.close();
