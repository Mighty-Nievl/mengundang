import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');
const user = db.query("SELECT email, email_verified FROM user WHERE email = 'support@zalan.web.id'").get() as any;
console.log('User:', user);
db.close();
