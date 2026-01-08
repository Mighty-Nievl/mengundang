import { drizzle } from 'drizzle-orm/d1';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../db/schema';

let _db: any;

export const db = new Proxy({} as any, {
    get(target, prop) {
        if (prop === '__isProxy') return true;

        let targetDb: any;

        if (process.env.NODE_ENV === 'development') {
            // Local / Dev environment (Use better-sqlite3 with ./sqlite.db)
            if (!_db) {
                try {
                    const sqlite = new Database('./sqlite.db');
                    _db = drizzleSqlite(sqlite, { schema });
                    // console.log('✅ Connected to local SQLite DB (better-sqlite3)');
                } catch (err) {
                    console.error('❌ Failed to connect to local sqlite.db:', err);
                }
            }
            targetDb = _db;
        } else {
            // Cloudflare Pages Environment (D1 Binding)
            try {
                const event = useEvent();
                const binding = event.context.cloudflare?.env?.DB;
                if (binding) {
                    targetDb = drizzle(binding, { schema });
                }
            } catch (e) {
                // Not in a request context
            }
        }

        if (!targetDb) {
            // console.error("❌ Database instance not available");
            return undefined;
        }

        const res = Reflect.get(targetDb, prop);
        return typeof res === 'function' ? res.bind(targetDb) : res;
    }
});
