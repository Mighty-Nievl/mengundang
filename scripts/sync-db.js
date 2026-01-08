import { execSync } from 'child_process';
import fs from 'fs';
import { Database } from 'bun:sqlite';

const DB_NAME = 'kami-undang-db';
const LOCAL_DB_PATH = './sqlite.db';
const DUMP_FILE = './prod-dump.sql';

console.log(`🚀 Starting Database Sync: ${DB_NAME} -> ${LOCAL_DB_PATH}`);

try {
  // 1. Export from Cloudflare D1
  console.log('📡 Downloading data from Cloudflare D1 (this may take a while)...');

  // Check if dump already exists to save time (optional, but good for retries)
  if (!fs.existsSync(DUMP_FILE)) {
    execSync(`bun x wrangler d1 export ${DB_NAME} --remote --output=${DUMP_FILE}`, { stdio: 'inherit' });
  } else {
    console.log('⚠️ Found existing dump file, skipping download (delete prod-dump.sql to re-download).');
  }

  if (!fs.existsSync(DUMP_FILE)) {
    throw new Error('❌ Dump file not found! Export failed.');
  }

  // 2. Prepare Local DB
  if (fs.existsSync(LOCAL_DB_PATH)) {
    console.log('🗑️  Deleting existing local database...');
    fs.unlinkSync(LOCAL_DB_PATH);
  }

  // 3. Import to Local SQLite
  console.log('📥 Importing data to local SQLite...');
  const db = new Database(LOCAL_DB_PATH);

  // Read SQL file
  let sqlContent = fs.readFileSync(DUMP_FILE, 'utf-8');

  // Execute
  db.run(sqlContent);
  db.close();

  console.log('✅ Database Sync Complete! You can now run "bun dev".');

  // Cleanup
  // fs.unlinkSync(DUMP_FILE); // Keep it strictly for debugging if needed, or uncomment to delete

} catch (error) {
  console.error('❌ Sync Failed:', error.message);
  process.exit(1);
}
