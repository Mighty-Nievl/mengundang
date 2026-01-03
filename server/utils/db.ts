import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

let _db: any;

export const db = new Proxy({} as any, {
    get(target, prop) {
        if (prop === '__isProxy') return true;

        if (!_db) {
            if (process.env.DB) {
                _db = drizzle(process.env.DB, { schema });
                console.log("✅ D1 Database Initialized via Proxy");
            } else {
                console.error("❌ DB Binding not found in process.env");
            }
        }

        const res = Reflect.get(_db || {}, prop);
        return typeof res === 'function' ? res.bind(_db) : res;
    }
});
