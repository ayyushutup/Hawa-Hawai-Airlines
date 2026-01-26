#!/bin/bash
# Hawa Hawai Database Backup Script
# Schedule with cron: 0 2 * * * /path/to/backup_db.sh

set -e

# Configuration
DB_NAME="hawa_hawai_db"
DB_USER="${DB_USER:-ayushrthakur}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/hawa-hawai}"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

# Create backup
echo "Starting backup of $DB_NAME..."
pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

# Verify backup was created
if [ -f "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Backup completed: $BACKUP_FILE ($SIZE)"
else
    echo "ERROR: Backup failed!"
    exit 1
fi

# Remove old backups (older than RETENTION_DAYS)
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# List remaining backups
echo "Current backups:"
ls -lh "$BACKUP_DIR"

echo "Backup complete!"
