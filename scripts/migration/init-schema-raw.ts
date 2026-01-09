import { Database } from 'bun:sqlite';
const db = new Database('./database/sqlite.db');

console.log('Migrating database...');
db.run(`
CREATE TABLE IF NOT EXISTS guest (
    id TEXT PRIMARY KEY,
    invitationSlug TEXT NOT NULL,
    name TEXT NOT NULL,
    phoneNumber TEXT,
    note TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (invitationSlug) REFERENCES invitation(slug) ON DELETE CASCADE
);
`);
console.log('Migration complete.');
db.close();
