import { drizzle } from 'drizzle-orm/d1';
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
                    // Dynamic import to prevent Cloudflare build failure
                    const Database = require('better-sqlite3');
                    const { drizzle: drizzleSqlite } = require('drizzle-orm/better-sqlite3');

                    const sqlite = new Database('./sqlite.db');
                    _db = drizzleSqlite(sqlite, { schema });
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
            return undefined;
        }

        const res = Reflect.get(targetDb, prop);
        return typeof res === 'function' ? res.bind(targetDb) : res;
    }
});
