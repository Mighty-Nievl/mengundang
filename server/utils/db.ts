import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

let _db: any;

export const db = new Proxy({} as any, {
    get(target, prop) {
        if (prop === '__isProxy') return true;

        if (process.env.DB) {
            // Local / Dev environment
            if (!_db) {
                _db = drizzle(process.env.DB, { schema });
            }
            targetDb = _db;
        } else {
            // Cloudflare Pages Environment (Per-request binding)
            // Do NOT cache to _db, as bindings are tied to the specific request event
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
            // Return a dummy to prevent immediate crash on property access, but methods will fail
            return undefined;
        }

        const res = Reflect.get(targetDb, prop);
        return typeof res === 'function' ? res.bind(targetDb) : res;
    }
});
