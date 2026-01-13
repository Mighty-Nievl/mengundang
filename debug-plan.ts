import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { invitations, users } from './server/db/schema';
import { eq } from 'drizzle-orm';
import { join } from 'path';

// Fix for direct execution
const dbPath = join(process.cwd(), 'database', 'sqlite.db');
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

async function checkPlan() {
    const slug = 'wulanrezal';
    console.log(`Checking plan for invitation: ${slug}`);

    const [result] = await db.select({
        invitation: invitations,
        owner: users
    })
        .from(invitations)
        .leftJoin(users, eq(invitations.owner, users.email))
        .where(eq(invitations.slug, slug));

    if (!result) {
        console.log('Invitation not found in DB');
        return;
    }

    if (!result.owner) {
        console.log('Owner not found for this invitation');
        console.log('Invitation Owner Email:', result.invitation.owner);
        return;
    }

    console.log('=== USER DATA ===');
    console.log('Name:', result.owner.name);
    console.log('Email:', result.owner.email);
    console.log('Plan:', result.owner.plan);
    console.log('Plan Expires At:', result.owner.planExpiresAt);
    console.log('=================');
}

checkPlan().catch(console.error);
