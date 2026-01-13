#!/bin/bash
# Database Backup Script - Run before any drizzle-kit operations
# Usage: ./scripts/db-backup.sh

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_PATH="./database/sqlite.db"
BACKUP_DIR="./database/backups"

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

if [ -f "$DB_PATH" ]; then
    BACKUP_FILE="$BACKUP_DIR/sqlite_$TIMESTAMP.db"
    cp "$DB_PATH" "$BACKUP_FILE"
    echo "✅ Backup created: $BACKUP_FILE"
    
    # Keep only last 10 backups
    ls -t "$BACKUP_DIR"/sqlite_*.db 2>/dev/null | tail -n +11 | xargs -r rm --
    echo "ℹ️  Keeping last 10 backups"
else
    echo "⚠️  No database found at $DB_PATH"
fi
