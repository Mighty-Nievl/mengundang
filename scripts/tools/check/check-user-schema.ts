import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');
const tableInfo = db.query("PRAGMA table_info(user)").all();
console.log('User Table Info:', tableInfo);
const sampleUser = db.query("SELECT * FROM user LIMIT 1").get();
console.log('Sample User:', sampleUser);
db.close();
