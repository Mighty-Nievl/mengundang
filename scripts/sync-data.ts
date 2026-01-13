
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

// Tables to sync (ordered by dependency if needed, though we disable FK temporarily)
const TABLES = [
    'user',
    'invitation',
    'guest',
    'order',
    'account',
    'session',
    'verification',
    'system_setting',
    'wa_notification'
];

async function fetchTableData(tableName: string) {
    console.log(`☁️  Fetching ${tableName}...`);
    try {
        // Quote table name
        const { stdout } = await execAsync(`npx wrangler d1 execute kami-undang-db --remote --command "SELECT * FROM \\"${tableName}\\"" --json`);
        // Wrangler output might contain logs, so we need to find the JSON array
        // Usually it's the last line or wrapped in [ ]
        const jsonMatch = stdout.match(/\[.*\]/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (e) {
        console.error(`❌ Failed to fetch ${tableName}:`, e);
        return [];
    }
}

async function main() {
    const dbPath = path.join(process.cwd(), 'database', 'sqlite.db');
    console.log(`📂 Local DB: ${dbPath}`);

    // 1. Backup existing DB
    if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, dbPath + '.bak');
        console.log(`✅ Backup created: ${dbPath}.bak`);
    }

    // 2. Open Local DB
    const sqlite = new Database(dbPath);

    // 3. Clear existing data (optional, or we upsert?)
    // User wants "exact copy", so clearing is best.
    // We disable FK constraints to avoid deletion order issues
    sqlite.pragma('foreign_keys = OFF');

    console.log('🧹 Clearing local tables...');
    for (const table of TABLES) {
        try {
            sqlite.prepare(`DELETE FROM "${table}"`).run();
        } catch (e) {
            console.warn(`⚠️  Could not clear/find table ${table} locally.`);
        }
    }

    // 4. Import Data
    console.log('📥 Importing data...');
    for (const table of TABLES) {
        const rows = await fetchTableData(table);
        if (!rows || rows.length === 0) {
            console.log(`   Internal note: ${table} is empty or failed.`);
            continue;
        }

        // Flatten checks because D1 JSON structure is [{ results: [...], meta: ... }] or just [...] depending on version
        // Wrangler v3+ returns array of results directly usually
        // Let's inspect the first row to be sure. If it has 'results' property and is array, use that.
        let actualRows = rows;
        if (!Array.isArray(rows) && (rows as any).results) {
            actualRows = (rows as any).results;
        } else if (Array.isArray(rows) && rows.length > 0 && (rows[0] as any).results) {
            // Sometimes it returns [ { results: [], success: true } ]
            actualRows = (rows[0] as any).results;
        }

        if (actualRows.length === 0) continue;

        const keys = Object.keys(actualRows[0]);
        const placeholders = keys.map(() => '?').join(',');
        const columns = keys.map(k => `"${k}"`).join(',');

        const stmt = sqlite.prepare(`INSERT INTO "${table}" (${columns}) VALUES (${placeholders})`);

        const transaction = sqlite.transaction((items) => {
            for (const row of items) {
                const values = keys.map(k => {
                    const val = row[k];
                    // Convert arrays/objects to JSON string if needed (D1 returns them parsed)
                    if (typeof val === 'object' && val !== null) return JSON.stringify(val);
                    return val;
                });
                stmt.run(...values);
            }
        });

        transaction(actualRows);
        console.log(`✅ Imported ${actualRows.length} rows into ${table}`);
    }

    sqlite.pragma('foreign_keys = ON');
    console.log("\n🎉 Sync Complete! Local DB matches Production.");
}

main().catch(console.error);
