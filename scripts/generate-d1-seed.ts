import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from '../server/db/schema';
import fs from 'fs';

// Init Local DB
const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite, { schema });

const OUTPUT_FILE = 'seed-d1.sql';

async function generateSeed() {
    console.log('📦 Generating D1 Seed file...');
    let sql = '';

    // Helper to escape strings
    const esc = (val: any) => {
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'boolean') return val ? 1 : 0;
        if (typeof val === 'number') return val;
        // Escape single quotes
        return `'${String(val).replace(/'/g, "''")}'`;
    };

    // 1. Users
    const users = await db.select().from(schema.users);
    if (users.length > 0) {
        sql += `-- Users \n`;
        sql += `INSERT INTO user (id, name, email, emailVerified, image, createdAt, updatedAt, role, plan, planExpiresAt, maxInvitations, maxGuests, referralCode, referredBy, referralBalance, phoneNumber, bankName, bankAccountNumber, bankAccountName, registrationIp) VALUES \n`;
        sql += users.map(u => `(${esc(u.id)}, ${esc(u.name)}, ${esc(u.email)}, ${esc(u.emailVerified)}, ${esc(u.image)}, ${esc(u.createdAt)}, ${esc(u.updatedAt)}, ${esc(u.role)}, ${esc(u.plan)}, ${esc(u.planExpiresAt)}, ${esc(u.maxInvitations)}, ${esc(u.maxGuests)}, ${esc(u.referralCode)}, ${esc(u.referredBy)}, ${esc(u.referralBalance)}, ${esc(u.phoneNumber)}, ${esc(u.bankName)}, ${esc(u.bankAccountNumber)}, ${esc(u.bankAccountName)}, ${esc(u.registrationIp)})`).join(',\n') + ';\n\n';
    }

    // 2. Orders
    const orders = await db.select().from(schema.orders);
    if (orders.length > 0) {
        sql += `-- Orders \n`;
        sql += `INSERT INTO "order" (id, userId, plan, amount, status, proofUrl, referrerId, referralDiscount, ipAddress, externalId, paymentUrl, createdAt, updatedAt) VALUES \n`;
        sql += orders.map(o => `(${esc(o.id)}, ${esc(o.userId)}, ${esc(o.plan)}, ${esc(o.amount)}, ${esc(o.status)}, ${esc(o.proofUrl)}, ${esc(o.referrerId)}, ${esc(o.referralDiscount)}, ${esc(o.ipAddress)}, ${esc(o.externalId)}, ${esc(o.paymentUrl)}, ${esc(o.createdAt)}, ${esc(o.updatedAt)})`).join(',\n') + ';\n\n';
    }

    // 3. Invitations
    const invitations = await db.select().from(schema.invitations);
    if (invitations.length > 0) {
        sql += `-- Invitations \n`;
        // content is JSON, might need special handling if it contains single quotes
        sql += `INSERT INTO invitation (slug, owner, partnerEmail, content, createdAt, updatedAt) VALUES \n`;
        sql += invitations.map(i => `(${esc(i.slug)}, ${esc(i.owner)}, ${esc(i.partnerEmail)}, ${esc(JSON.stringify(i.content))}, ${esc(i.createdAt)}, ${esc(i.updatedAt)})`).join(',\n') + ';\n\n';
    }

    // 4. Guests
    const guests = await db.select().from(schema.guests);
    if (guests.length > 0) {
        sql += `-- Guests \n`;
        sql += `INSERT INTO guest (id, invitationSlug, name, phoneNumber, note, createdAt, updatedAt) VALUES \n`;
        sql += guests.map(g => `(${esc(g.id)}, ${esc(g.invitationSlug)}, ${esc(g.name)}, ${esc(g.phoneNumber)}, ${esc(g.note)}, ${esc(g.createdAt)}, ${esc(g.updatedAt)})`).join(',\n') + ';\n\n';
    }

    // 5. System Settings
    const settings = await db.select().from(schema.systemSettings);
    if (settings.length > 0) {
        sql += `-- System Settings \n`;
        sql += `INSERT INTO system_setting ("key", value, updatedAt) VALUES \n`;
        sql += settings.map(s => `(${esc(s.key)}, ${esc(s.value)}, ${esc(s.updatedAt)})`).join(',\n') + ';\n\n';
    }

    fs.writeFileSync(OUTPUT_FILE, sql);
    console.log(`✅ Seed file created: ${OUTPUT_FILE}`);
    console.log(`🚀 Run this command to import to D1:`);
    console.log(`npx wrangler d1 execute premium-invitation-db --file=${OUTPUT_FILE} --remote`);
}

generateSeed();
