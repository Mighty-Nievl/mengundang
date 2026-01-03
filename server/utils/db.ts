import { drizzle } from 'drizzle-orm/d1';
import { drizzle as drizzleSqlite } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from '../db/schema';

export let db: any;

if (process.env.DB) {
    // Cloudflare D1
    db = drizzle(process.env.DB, { schema });
} else {
    // Local Dev (Bun SQLite)
    const sqlite = new Database('sqlite.db');
    db = drizzleSqlite(sqlite, { schema });
}
