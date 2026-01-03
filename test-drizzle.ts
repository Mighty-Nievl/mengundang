import { db } from "./server/utils/db";
import { users } from "./server/db/schema";
import { eq } from "drizzle-orm";

async function test() {
    try {
        const res = await db.select().from(users).where(eq(users.email, 'support@zalan.web.id')).execute();
        console.log('Drizzle Test Success:', res);
    } catch (e) {
        console.error('Drizzle Test Failed:', e);
    }
}

test();
