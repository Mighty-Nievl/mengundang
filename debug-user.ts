
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { users } from './server/db/schema';
import { eq } from 'drizzle-orm';
import { join } from 'path';

const dbPath = join(process.cwd(), 'database', 'sqlite.db');
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

async function checkUser() {
    const email = 'rezalhbramantara@gmail.com';
    console.log(`Checking user: ${email}`);

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
        console.log('User NOT found in DB');

        // List all users to see what's there
        const allUsers = await db.select({ email: users.email }).from(users);
        console.log('Available User Emails:', allUsers.map(u => u.email));
        return;
    }

    console.log('User Found:', user);
}

checkUser().catch(console.error);
