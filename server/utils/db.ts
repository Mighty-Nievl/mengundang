import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

let _db: any;

export const db = new Proxy({} as any, {
    get(target, prop) {
        if (prop === '__isProxy') return true;

        let targetDb = _db;

        if (!targetDb) {
            if (process.env.DB) {
                // Local / Dev environment
                _db = drizzle(process.env.DB, { schema });
                targetDb = _db;
                console.log("✅ D1 Database Initialized via Proxy (process.env)");
            } else {
                // Cloudflare Pages Environment (Per-request binding)
                try {
                    const event = useEvent();
                    const binding = event.context.cloudflare?.env?.DB;
                    if (binding) {
                        targetDb = drizzle(binding, { schema });
                        // console.log("✅ D1 Database Initialized via Request Context");
                    } else {
                        // console.error("❌ DB Binding not found in context");
                    }
                } catch (e) {
                    // Outside of request context
                }
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
