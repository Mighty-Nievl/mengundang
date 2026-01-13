import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

// Placeholder for build-time safety
const mockDb = new Proxy({}, {
    get: (target, prop) => () => {
        const msg = `❌ [DB Proxy] Attempted to call '${String(prop)}' but Database context is missing. Ensure you are within a Nuxt event context (H3) or DB is properly bound.`;
        console.error(msg);
        return Promise.reject(new Error(msg));
    }
});

let _db: any;
let _dbInitPromise: Promise<void> | null = null;

// Async init function for local development
async function initLocalDb() {
    if (_db) return;
    try {
        // @ts-ignore - Bun detection
        if (typeof Bun !== 'undefined') {
            // Use string concatenation to hide from Rollup's static analysis
            const bunSqliteModule = 'bun' + ':' + 'sqlite';
            const drizzleBunModule = 'drizzle-orm' + '/' + 'bun-sqlite';
            const bunSqlite = await import(/* @vite-ignore */ bunSqliteModule);
            const { drizzle: drizzleBun } = await import(/* @vite-ignore */ drizzleBunModule);
            const sqlite = new bunSqlite.Database('./database/sqlite.db');
            _db = drizzleBun(sqlite, { schema });
        } else {
            const Database = (await import('better-sqlite3')).default;
            const { drizzle: drizzleSqlite } = await import('drizzle-orm/better-sqlite3');
            const sqlite = new Database('./database/sqlite.db');
            _db = drizzleSqlite(sqlite, { schema });
        }
        console.log('✅ Local SQLite database initialized');
    } catch (e) {
        console.error('❌ Local DB init failed:', e);
    }
}

// Eager init in dev
if (process.dev) {
    _dbInitPromise = initLocalDb();
}

export const db = new Proxy({} as any, {
    get(target, prop) {
        if (prop === '__isProxy') return true;

        // process.dev is replaced by false/true at build time by Nuxt/Vite.
        // This ensures the local DB logic is stripped from the production bundle.
        if (process.dev) {
            // Return directly from the local instance
            if (_db) {
                const val = Reflect.get(_db, prop);
                return typeof val === 'function' ? val.bind(_db) : val;
            }
            // If still initializing, return a function that waits
            if (_dbInitPromise) {
                return async (...args: any[]) => {
                    await _dbInitPromise;
                    if (_db) {
                        const fn = Reflect.get(_db, prop);
                        if (typeof fn === 'function') {
                            return fn.apply(_db, args);
                        }
                        return fn;
                    }
                    throw new Error(`Database not initialized, cannot call ${String(prop)}`);
                };
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
            console.error('DB Proxy catch inner:', e);
        }

        // Fallback to mock
        return Reflect.get(mockDb, prop);
    }
});
