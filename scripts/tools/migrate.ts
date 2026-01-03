import { db } from '../../server/utils/db';
import { users, invitations } from '../../server/db/schema';
import fs from 'node:fs';
import path from 'node:path';

// HELPERS (Mocking Better-Auth Hashing for simplicity or just setting default)
// For now, we will set a default password "12345678" for all migrated users.
// In production, we'd use the actual hasher.
// BUT, better-auth hash is complex.
// Let's just migrate the User Record. The password will be invalid.

const run = async () => {
    console.log('Starting Migration: JSON -> SQLite...');

    // 1. Migrate Users
    const usersPath = path.resolve(process.cwd(), 'data/users.json');
    if (fs.existsSync(usersPath)) {
        const legacyUsers = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
        console.log(`Found ${legacyUsers.length} users.`);

        for (const u of legacyUsers) {
            try {
                // Better-Auth expects ID. We generate one or use email? 
                // Let's generate a random ID if not present, but use email as key.
                await db.insert(users).values({
                    id: crypto.randomUUID(),
                    name: u.name || u.username || 'User',
                    email: u.email,
                    emailVerified: true,
                    role: u.role || 'user',
                    plan: u.plan || 'free',
                    maxInvitations: u.maxInvitations || 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    // We cannot migrate password hash (SHA256 != Argon2).
                    // We leave it null or garbage. User must reset or we provide a mechanism.
                    password: u.password // Just storing the old hash for record, though it won't work.
                }).onConflictDoNothing();
                console.log(`Migrated User: ${u.email}`);
            } catch (e) {
                console.error(`Failed to migrate user ${u.email}:`, e);
            }
        }
    }

    // 2. Migrate Invitations
    const invDir = path.resolve(process.cwd(), 'data/invitations');
    if (fs.existsSync(invDir)) {
        const files = fs.readdirSync(invDir).filter(f => f.endsWith('.json') && f !== 'demo.json');
        console.log(`Found ${files.length} invitations.`);

        for (const file of files) {
            try {
                const content = JSON.parse(fs.readFileSync(path.join(invDir, file), 'utf-8'));
                const slug = file.replace('.json', '');

                // Fix Owner (if missing, default to admin or first user?)
                const owner = content.owner || 'admin@undangan.com';

                await db.insert(invitations).values({
                    slug: slug,
                    owner: owner,
                    partnerEmail: content.partnerEmail || null,
                    content: content,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }).onConflictDoNothing();
                console.log(`Migrated Invitation: ${slug}`);
            } catch (e) {
                console.error(`Failed to migrate invitation ${file}:`, e);
            }
        }
    }

    console.log('Migration Complete.');
};

run().catch(console.error);
