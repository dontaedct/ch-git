# Emergency Recovery System

The Emergency Recovery System provides automated backup and recovery capabilities for the Micro App Template. It integrates Guardian backup system with MIT Hero autonomous recovery to automatically detect and fix system issues.

## Features

- **Automated Backups**: Guardian system creates regular backups
- **Issue Detection**: MIT Hero monitors system health
- **Auto-Recovery**: Automatic restoration from backups
- **Manual Recovery**: Manual recovery procedures

## Usage

```bash
npm run tool:doctor          # Check system health
npm run tool:doctor:fix      # Auto-fix issues
npm run tool:doctor:safe     # Safe mode recovery
```

## Recovery Procedures

See `/docs/` for detailed recovery documentation.
