const Database = require('better-sqlite3');
const db = new Database('./database/sqlite.db');

// Data from seed-d1.sql
const invitations = [
    {
        slug: 'desmos',
        owner: 'admin@undangan.com',
        partnerEmail: null,
        content: JSON.stringify({ "meta": { "title": "Undangan Pernikahan Rizky & Anisa" }, "hero": { "groomNickname": "Rizky", "brideNickname": "Anisa", "date": "SABTU, 28 DESEMBER 2025" }, "groom": { "fullName": "Rizky Pratama" }, "bride": { "fullName": "Anisa Wijaya" }, "events": {}, "gift": {}, "music": {}, "rsvp": {}, "gallery": [] }),
        createdAt: Date.now(),
        updatedAt: Date.now()
    },
    {
        slug: 'wulanrezal',
        owner: 'rezalhbramantara@gmail.com',
        partnerEmail: null,
        content: JSON.stringify({ "meta": { "title": "Pernikahan Wulan dan Rezal", "description": "Kami mengundang anda untuk hadir di pernikahan kami.", "image": "https://drive.google.com/thumbnail?id=19dRYiEZCPvjDF01yQNr3LJBgT0anF3jp&sz=w1600" }, "hero": { "groomNickname": "Rezal", "brideNickname": "Wulan", "date": "Sabtu, 29 Juni 2024", "backgroundImage": "https://drive.google.com/thumbnail?id=17S8O1az5cUZ5ARQUm5s1JbF1Q45EN_c0&sz=w1600" }, "groom": { "fullName": "Rezal Helwin Bramantara", "parents": "Bpk. Totok Anova Rujito & Ibu Kartifa", "instagram": "@rezalh_", "image": "https://drive.google.com/thumbnail?id=18WJllqxdwkQ-zEl9F9mi5aIRNV9zh1Ma&sz=w1600" }, "bride": { "fullName": "Yanuar Fitria Wulandari", "parents": "Bpk. Lupa Namanya & Ibu Jolekha", "instagram": "@yanuarfw_", "image": "https://drive.google.com/thumbnail?id=1A-nHyFmxD02pQsDno0Pwly4fUaMOYhqp&sz=w1600" }, "events": { "akad": { "time": "08:00", "date": "29 Juni 2024", "location": "Masjid Al-Ikhlas" }, "resepsi": { "date": "29 Juni 2024", "time": "10:00", "location": "Gedung BP3K" } }, "gift": { "accounts": [{ "bankName": "SeaBank", "number": "123456789", "name": "Yanuar Fitria Wulandari" }] }, "music": { "url": "https://music.youtube.com/watch?v=2Kiob5f9A1g", "fade": true }, "rsvp": { "phone": "6285229402611", "comments": [] }, "gallery": ["https://drive.google.com/thumbnail?id=1AIX3Rt1wAayNpfZDcMXumqLSEhFeEzC2&sz=w1600", "https://drive.google.com/thumbnail?id=1A-nHyFmxD02pQsDno0Pwly4fUaMOYhqp&sz=w1600"], "theme": "original" }),
        createdAt: Date.now(),
        updatedAt: Date.now()
    },
    {
        slug: 'anu',
        owner: 'anu@anu.anu',
        partnerEmail: 'rezalhiis2@gmail.com',
        content: JSON.stringify({ "meta": { "title": "Wedding Invitation", "description": "" }, "hero": { "groomNickname": "Groom", "brideNickname": "Bride", "date": "Date" }, "groom": {}, "bride": {}, "events": {}, "gift": {}, "music": {}, "rsvp": {} }),
        createdAt: Date.now(),
        updatedAt: Date.now()
    }
];

const stmt = db.prepare('INSERT OR REPLACE INTO invitation (slug, owner, partnerEmail, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');

for (const inv of invitations) {
    try {
        stmt.run(inv.slug, inv.owner, inv.partnerEmail, inv.content, inv.createdAt, inv.updatedAt);
        console.log('✅ Restored:', inv.slug);
    } catch (e) {
        console.error('❌ Failed:', inv.slug, e.message);
    }
}

// Verify
const all = db.prepare('SELECT slug FROM invitation').all();
console.log('\nAll invitations now:', all);
