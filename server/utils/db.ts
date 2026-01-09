import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

// Placeholder for build-time safety
const mockDb = new Proxy({}, {
    get: () => () => Promise.resolve([])
});

let _db: any;

export const db = new Proxy({} as any, {
    get(target, prop) {
        if (prop === '__isProxy') return true;

        // process.dev is replaced by false/true at build time by Nuxt/Vite.
        // This ensures the local DB logic is stripped from the production bundle.
        if (process.dev) {
            if (!_db) {
                try {
                    if (typeof Bun !== 'undefined') {
                        const { Database } = require('bun:sqlite');
                        // @ts-ignore
                        const { drizzle: drizzleBun } = require('drizzle-orm/bun-sqlite');
                        const sqlite = new Database('./database/sqlite.db');
                        _db = drizzleBun(sqlite, { schema });
                    } else {
                        const Database = require('better-sqlite3');
                        const { drizzle: drizzleSqlite } = require('drizzle-orm/better-sqlite3');
                        const sqlite = new Database('./database/sqlite.db');
                        _db = drizzleSqlite(sqlite, { schema });
                    }
                } catch (e) {
                    console.error('Local DB init failed:', e);
                }
            }
            // Return directly from the local instance
            if (_db) {
                const val = Reflect.get(_db, prop);
                return typeof val === 'function' ? val.bind(_db) : val;
            }
        }

        // Production / Cloudflare Logic
        try {
            const event = useEvent();
            const binding = event.context.cloudflare?.env?.DB;
            if (binding) {
                const instance = drizzle(binding, { schema });
                const val = Reflect.get(instance, prop);
                return typeof val === 'function' ? val.bind(instance) : val;
            }
        } catch (e) {
            // Context not available (build time, etc.)
        }

        // Fallback to mock
        return Reflect.get(mockDb, prop);
    }
});
