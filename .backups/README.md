# Guardian Backup System

This directory contains automated backups created by the Guardian system.

## Backup Structure

Backups are organized by date and time:
```
.backups/
├── YYYY-MM-DD/
│   └── HHmmss/
│       ├── repo.bundle      # Git repository bundle
│       ├── project.zip      # Project files snapshot
│       └── db.dump          # Database dump (if available)
└── meta/
    └── last.json            # Latest backup metadata
```

## Restoring from Backups

### Git Repository Restore

To restore the git repository from a backup:

```bash
# Clone from the bundle
git clone repo.bundle restored-repo
cd restored-repo

# View commit history
git log

# Check current status
git status

# List all branches
git branch -a
```

### Project Files Restore

To restore project files:

```bash
# Extract the project snapshot
unzip project.zip -d restored-project
cd restored-project

# Install dependencies
npm install

# Verify the project
npm run doctor
npm run ci
```

### Database Restore (if available)

To restore the database from a dump:

```bash
# Restore using pg_restore
pg_restore -d <connection_string> db.dump

# Or if you need to specify connection details:
pg_restore \
  --host <host> \
  --port <port> \
  --username <username> \
  --dbname <database> \
  db.dump
```

**Note**: You'll be prompted for the password if not provided via PGPASSWORD environment variable.

## Backup Metadata

Each backup includes metadata in `.backups/meta/last.json`:

```json
{
  "ok": true,
  "artifacts": [
    {
      "type": "git",
      "ok": true,
      "path": ".backups/2025-01-13/235959/repo.bundle"
    },
    {
      "type": "project", 
      "ok": true,
      "path": ".backups/2025-01-13/235959/project.zip"
    },
    {
      "type": "db",
      "ok": false,
      "reason": "pg_dump not found"
    }
  ],
  "startedAt": "2025-01-13T23:59:59.000Z",
  "finishedAt": "2025-01-14T00:01:23.000Z"
}
```

## Running Backups

### One-time backup
```bash
npm run guardian:once
# or
node scripts/guardian.js --once
```

### Watch mode (every 60 minutes with jitter)
```bash
npm run guardian:start
# or
node scripts/guardian.js --watch
```

### Check status
```bash
npm run guardian:check
# or
node scripts/guardian.js --status
```

## Requirements

- **Git**: For repository bundle creation
- **zip**: For project snapshot creation
- **pg_dump**: For database dumps (optional, gracefully degraded if missing)

## Security Notes

- Database connection strings are never logged
- Passwords are handled securely via environment variables
- Backup files contain sensitive data - secure appropriately
- Consider encrypting backup files for production use
