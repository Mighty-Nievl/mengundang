import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');
const columns = db.query("PRAGMA table_info(user)").all();
console.log('Columns:', JSON.stringify(columns, null, 2));
const userData = db.query("SELECT email, password FROM user WHERE email = 'support@zalan.web.id'").get() as any;
console.log('User data:', userData);
db.close();
