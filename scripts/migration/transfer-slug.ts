import { Database } from 'bun:sqlite';
const db = new Database('./database/sqlite.db');

const slug = 'wulanrezal';
const newOwner = 'rezalhbramantara@gmail.com';

try {
    const info = db.run("UPDATE invitation SET owner = ? WHERE slug = ?", [newOwner, slug]);
    if (info.changes > 0) {
        console.log(`Successfully transferred slug '${slug}' to ${newOwner}`);
    } else {
        console.log(`Slug '${slug}' not found or owner already matches.`);
    }
} catch (e) {
    console.error('Failed to transfer slug:', e);
}

db.close();
