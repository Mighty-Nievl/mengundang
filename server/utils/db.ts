import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

let _db: any;

// Mock DB for build time / when D1 is missing
const mockDb = new Proxy({}, {
    get: () => {
        // Return a no-op function that returns a promise (for async queries)
        return () => Promise.resolve([]);
    }
});

export const db = new Proxy({} as any, {
    get(target, prop) {
        if (prop === '__isProxy') return true;

        let targetDb: any;

        // Use import.meta.dev if available in Nuxt/Vite, otherwise process.env.NODE_ENV
        const isDev = import.meta.dev || process.env.NODE_ENV === 'development';

        if (isDev) {
            // Local / Dev environment (Use better-sqlite3 with ./sqlite.db)
            if (!_db) {
                try {
                    // Try Bun Native SQLite first (if running with Bun)
                    // We use explicit strict checks to avoid bundler trying to resolve these in production
                    if (typeof Bun !== 'undefined') {
                        // @ts-ignore
                        const { Database } = import.meta.require('bun:sqlite');
                        // @ts-ignore
                        const { drizzle: drizzleBun } = import.meta.require('drizzle-orm/bun-sqlite');
                        const sqlite = new Database('./database/sqlite.db');
                        _db = drizzleBun(sqlite, { schema });
                    } else {
                        throw new Error('Not Bun');
                    }
                } catch (e) {
                    try {
                        // Fallback to better-sqlite3 (Node env)
                        // Using module.require or similar to hide from bundler if possible, 
                        // but normally conditional import is enough if isDev is static.
                        // However, to be safe, we wrap in try-catch and simple require.
                        const Database = require('better-sqlite3');
                        const { drizzle: drizzleSqlite } = require('drizzle-orm/better-sqlite3');

                        const sqlite = new Database('./database/sqlite.db');
                        _db = drizzleSqlite(sqlite, { schema });
                    } catch (err) {
                        console.error('❌ Failed to connect to local sqlite.db (Bun/Node):', err);
                    }
                }
            }
            targetDb = _db;
        } else {
            // Cloudflare Pages Environment (D1 Binding)
            try {
                // Check if we are in a request context
                const event = useEvent();
                const binding = event.context.cloudflare?.env?.DB;
                if (binding) {
                    targetDb = drizzle(binding, { schema });
                }
            } catch (e) {
                // Not in a request context (e.g. build time, or outside event handler)
            }
        }

        // Fallback to mock DB if no targetDb is available (prevent crash)
        if (!targetDb) {
            // Only return mockDb if we are NOT accessing specialized properties that imply existence
            return Reflect.get(mockDb, prop);
        }

        const res = Reflect.get(targetDb, prop);
        return typeof res === 'function' ? res.bind(targetDb) : res;
    }
});
