import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');
const res = db.run("DELETE FROM session");
console.log('Sessions cleared:', res);
db.close();
