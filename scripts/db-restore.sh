#!/bin/bash
# Restore database from backup
# Usage: ./scripts/db-restore.sh [backup_file]
# Without argument: lists available backups

BACKUP_DIR="./database/backups"
DB_PATH="./database/sqlite.db"

if [ -z "$1" ]; then
    echo "📋 Available backups:"
    echo "====================="
    ls -lh "$BACKUP_DIR"/sqlite_*.db 2>/dev/null || echo "No backups found"
    echo ""
    echo "Usage: ./scripts/db-restore.sh <backup_file>"
    echo "Example: ./scripts/db-restore.sh $BACKUP_DIR/sqlite_20260113_083000.db"
    exit 0
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Create current backup before restoring
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
if [ -f "$DB_PATH" ]; then
    cp "$DB_PATH" "$BACKUP_DIR/sqlite_${TIMESTAMP}_pre_restore.db"
    echo "📦 Current database backed up before restore"
fi

# Restore
cp "$BACKUP_FILE" "$DB_PATH"
echo "✅ Restored from: $BACKUP_FILE"
