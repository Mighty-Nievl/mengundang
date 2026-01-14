
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'sqlite.db');
const db = new Database(dbPath);

const row = db.prepare("SELECT * FROM invitation WHERE slug = ?").get('wulanrezal');
console.log(JSON.stringify(row, null, 2));
