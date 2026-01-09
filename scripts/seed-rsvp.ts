import { Database } from 'bun:sqlite';

const db = new Database('sqlite.db');

console.log('🌱 Seeding dummy invitation for RSVP test (Bun Native + Manual DDL)...');

// 0. Manual Create Tables (since drizzle-kit failed)
db.run(`
    CREATE TABLE IF NOT EXISTS invitation (
        slug TEXT PRIMARY KEY NOT NULL,
        owner TEXT NOT NULL,
        partnerEmail TEXT,
        content TEXT DEFAULT '{}',
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
    );
`);

db.run(`
    CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        emailVerified INTEGER NOT NULL,
        image TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        role TEXT DEFAULT 'user',
        plan TEXT DEFAULT 'free',
        planExpiresAt INTEGER,
        maxInvitations INTEGER DEFAULT 1,
        maxGuests INTEGER DEFAULT 25,
        referralCode TEXT UNIQUE,
        referredBy TEXT,
        referralBalance INTEGER DEFAULT 0,
        phoneNumber TEXT,
        bankName TEXT,
        bankAccountNumber TEXT,
        bankAccountName TEXT,
        registrationIp TEXT
    );
`);


// 1. Create dummy invitation
const slug = 'test-rsvp-verif';
const owner = 'tester@mengundang.site';

// Check if exists
const existing = db.query('SELECT slug FROM invitation WHERE slug = $slug').get({ $slug: slug });

if (existing) {
    console.log('Invitation already exists, resetting content...');
    db.query('UPDATE invitation SET content = $content, updatedAt = $updatedAt WHERE slug = $slug').run({
        $content: JSON.stringify({ rsvp: { comments: [] } }),
        $updatedAt: Date.now(),
        $slug: slug
    });
} else {
    console.log('Creating new invitation...');
    db.query('INSERT INTO invitation (slug, owner, content, createdAt, updatedAt) VALUES ($slug, $owner, $content, $createdAt, $updatedAt)').run({
        $slug: slug,
        $owner: owner,
        $content: JSON.stringify({ rsvp: { comments: [] } }),
        $createdAt: Date.now(),
        $updatedAt: Date.now()
    });
}

// 2. Create dummy user (owner)
const user = db.query('SELECT id FROM user WHERE email = $email').get({ $email: owner });
if (!user) {
    console.log('Creating dummy owner user...');
    db.query('INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, role, plan) VALUES ($id, $name, $email, $emailVerified, $createdAt, $updatedAt, $role, $plan)').run({
        $id: 'user-test-id',
        $name: 'Test User',
        $email: owner,
        $emailVerified: 1,
        $createdAt: Date.now(),
        $updatedAt: Date.now(),
        $role: 'user',
        $plan: 'vip'
    });
}

console.log('✅ Seeding complete! Slug:', slug);
