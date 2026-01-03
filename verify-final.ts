import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');
const userPass = db.query("SELECT password FROM user WHERE email = 'support@zalan.web.id'").get() as any;
const accountPass = db.query("SELECT password FROM account WHERE user_id = 'b34beee5-72a2-479b-bf71-b434f0daae6e' AND provider_id = 'email'").get() as any;
console.log('User password starts with:', userPass.password?.substring(0, 10));
console.log('Account password starts with:', accountPass.password?.substring(0, 10));
db.close();
