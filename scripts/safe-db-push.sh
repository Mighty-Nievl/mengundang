#!/bin/bash
# Safe Drizzle Push - Backs up database before pushing schema changes
# Usage: ./scripts/safe-db-push.sh

set -e

echo "🔒 Safe Database Push"
echo "====================="

# Step 1: Backup
echo ""
echo "📦 Step 1: Creating backup..."
./scripts/db-backup.sh

# Step 2: Push schema
echo ""
echo "🚀 Step 2: Pushing schema changes..."
npx drizzle-kit push

echo ""
echo "✅ Done! If something went wrong, backups are in ./database/backups/"
