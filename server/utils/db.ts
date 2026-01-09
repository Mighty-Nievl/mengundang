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
        if (prop === '__branch') {
            if (process.dev) return 'development';
            try {
                const event = useEvent();
                if (event.context._drizzle) return 'production-cached';
                if (event.context.cloudflare?.env?.DB) return 'production-binding';
                return 'production-no-binding';
            } catch (e) {
                return 'production-no-event';
            }
        }

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

            // Check cache
            if (event.context._drizzle) {
                const instance = event.context._drizzle;
                const val = Reflect.get(instance, prop);
                return typeof val === 'function' ? val.bind(instance) : val;
            }

            const binding = event.context.cloudflare?.env?.DB;
            if (binding) {
                const instance = drizzle(binding, { schema });
                event.context._drizzle = instance;
                const val = Reflect.get(instance, prop);
                return typeof val === 'function' ? val.bind(instance) : val;
            } else {
                const keys = event.context.cloudflare?.env ? Object.keys(event.context.cloudflare.env) : [];
                console.error(`❌ Cloudflare DB binding (DB) not found. Available env keys: ${keys.join(', ')}`);
            }
        } catch (e: any) {
            // Context not available (build time, etc.)
            if (prop === '__error') return e.message;
            console.error('DB Proxy catch inner:', e);
        }

        if (prop === '__error') return 'no-error';

        // Fallback to mock
        return Reflect.get(mockDb, prop);
    }
});
