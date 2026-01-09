import Database from 'better-sqlite3';
const db = new Database('./database/sqlite.db');
const rows = db.prepare('SELECT slug, content FROM invitation LIMIT 1').all();
console.log(JSON.stringify(rows, null, 2));
