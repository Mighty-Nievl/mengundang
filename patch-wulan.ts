
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'sqlite.db');
const db = new Database(dbPath);

// Define ideal content structure for Kunikaa
const idealContent = {
    hero: {
        groomNickname: "Rezal",
        brideNickname: "Wulan",
        date: "25 October 2025"
    },
    groom: {
        nickname: "Rezal",
        fullName: "Rezal Hidayat",
        image: "https://placehold.co/600x800",
        fatherName: "Bpk. Fulan",
        motherName: "Ibu Fulanah"
    },
    bride: {
        nickname: "Wulan",
        fullName: "Wulan Guritno",
        image: "https://placehold.co/600x800",
        fatherName: "Bpk. Doe",
        motherName: "Ibu Jane"
    },
    events: {
        akad: {
            date: "Saturday, 25 Oct 2025",
            time: "08:00 WIB",
            location: "Masjid Raya, Bandung",
            mapsUrl: "https://google.com/maps",
            isoDate: "2025-10-25T08:00:00"
        },
        reception: {
            date: "Saturday, 25 Oct 2025",
            time: "11:00 WIB",
            location: "Grand Ballroom, Bandung",
            mapsUrl: "https://google.com/maps"
        }
    },
    gallery: [
        "https://placehold.co/600x800",
        "https://placehold.co/600x800",
        "https://placehold.co/600x800",
        "https://placehold.co/600x800"
    ],
    quote: {
        content: "And We created you in pairs.",
        source: "QS. An-Naba: 8"
    },
    meta: {
        theme: "Kunikaa",
        displayOrder: "groom_first"
    },
    _auth: {
        isAuthorized: true
    }
};

const stmt = db.prepare("UPDATE invitation SET content = ? WHERE slug = ?");
stmt.run(JSON.stringify(idealContent), 'wulanrezal');

console.log("✅ Updated wulanrezal with patch data.");
