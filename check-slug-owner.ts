import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');
const invitation = db.query("SELECT slug, owner FROM invitation WHERE slug = 'wulanrezal'").get() as any;
console.log('Current Invitation Data:', invitation);
db.close();
