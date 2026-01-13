#!/bin/bash

# Sync Production Database to Local
# Usage: ./scripts/db-sync-prod.sh

echo "🔄 Starting Production Database Sync..."

# 1. Backup Local DB
echo "📦 Backing up local database..."
./scripts/db-backup.sh

# 2. Export Remote DB
echo "☁️  Exporting production database (kami-undang-db)..."
mkdir -p database
npx wrangler d1 export kami-undang-db --remote --output=./database/prod_dump.sql

if [ $? -eq 0 ]; then
    echo "✅ Export successful."
else
    echo "❌ Export failed."
    exit 1
fi

# 3. Recreate Local DB
echo "🔨 Recreating local database from dump..."
DB_PATH="./database/sqlite.db"
DUMP_PATH="./database/prod_dump.sql"

if [ -f "$DB_PATH" ]; then
    rm "$DB_PATH"
fi

# Use sqlite3 to import the SQL dump
# We need to ensure bun-sqlite or sqlite3 is available. 
# Since we are in a dev environment, sqlite3 usually is.
if command -v sqlite3 &> /dev/null; then
    sqlite3 "$DB_PATH" < "$DUMP_PATH"
    echo "✅ Local database synchronized with production!"
else
    echo "❌ 'sqlite3' command not found. Cannot import dump."
    echo "   The dump file is saved at $DUMP_PATH"
    exit 1
fi

# Optional: Cleanup
# rm "$DUMP_PATH"
