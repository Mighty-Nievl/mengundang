import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');
const inv = db.query("SELECT * FROM invitation WHERE slug = 'hamzah'").get() as any;
console.log('Invitation Hamzah:', inv);
const rezal = db.query("SELECT email, role FROM user WHERE email = 'rezalhbramantara@gmail.com'").get() as any;
console.log('User Rezal:', rezal);
db.close();
