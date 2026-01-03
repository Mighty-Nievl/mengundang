import { db } from "../../server/utils/db";
import { users, sessions } from "../../server/db/schema";
import { eq } from "drizzle-orm";

async function test() {
    try {
        console.log('Testing Join...');
        const res = await db.select()
            .from(sessions)
            .leftJoin(users, eq(sessions.userId, users.id))
            .limit(1)
            .execute();
        console.log('Join Success:', res);
    } catch (e) {
        console.error('Join Failed:', e);
    }
}

test();
