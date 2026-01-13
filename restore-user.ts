
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { users } from './server/db/schema';
import { join } from 'path';

const dbPath = join(process.cwd(), 'database', 'sqlite.db');
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

async function restoreUser() {
    const email = 'rezalhbramantara@gmail.com';
    console.log(`Restoring user: ${email}`);

    try {
        await db.insert(users).values({
            id: 'restore_' + Date.now(), // Generate a new ID
            name: 'Rezal H. Bramantara',
            email: email,
            emailVerified: true,
            role: 'superuser', // Give superuser role as well
            plan: 'vvip',
            planExpiresAt: null, // Eternal
            maxInvitations: 9999,
            maxGuests: 10000,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('User restored successfully as VVIP!');
    } catch (e) {
        console.error('Failed to restore user:', e);
    }
}

restoreUser().catch(console.error);
