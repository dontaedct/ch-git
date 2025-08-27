# Development Server Management

## Overview

The enhanced OSS hero system now includes automatic process locking and conflict resolution to prevent multiple dev servers from running simultaneously.

## Features

### 🔒 **Process Locking**
- Prevents multiple `npm run dev` instances from starting
- Automatic cleanup of stale lock files
- Graceful shutdown handling

### 🚀 **Smart Port Management**
- Automatic port selection (9999, 3000-3010)
- Conflict detection and resolution
- Environment variable support (`PORT`)

### 🧹 **Process Management**
- Easy dev server status checking
- One-command server shutdown
- Lock file cleanup utilities

## Commands

### Basic Development
```bash
npm run dev          # Start development server (with locking)
```

### Server Management
```bash
npm run dev:status   # Check dev server status
npm run dev:kill     # Kill running dev server
npm run dev:clean    # Clean up stale lock files
npm run dev:ports    # Show port availability
```

### Direct Script Usage
```bash
node scripts/dev-manager.js status
node scripts/dev-manager.js kill
node scripts/dev-manager.js clean
node scripts/dev-manager.js ports
```

## How It Works

### 1. **Process Locking**
When you run `npm run dev`:
1. System checks for existing lock file
2. If found, verifies process is still alive
3. If stale (>5 minutes), removes automatically
4. Creates new lock file with PID and timestamp

### 2. **Port Selection**
1. Honors `PORT` environment variable if set
2. Falls back to preferred ports: 9999, 3000-3010
3. Tests each port for availability
4. Starts Next.js on first available port

### 3. **Conflict Resolution**
- **Multiple Terminals**: Only first `npm run dev` succeeds
- **Stale Processes**: Automatic cleanup of dead processes
- **Port Conflicts**: Automatic fallback to next available port

## Troubleshooting

### "Another dev server is already running"
```bash
# Check status
npm run dev:status

# Kill if needed
npm run dev:kill

# Or clean stale locks
npm run dev:clean
```

### Port Already in Use
The system automatically finds the next available port. If you need a specific port:
```bash
PORT=3001 npm run dev
```

### Stale Lock Files
```bash
npm run dev:clean
```

## Safety Features

- **Automatic Cleanup**: Lock files removed on process exit
- **Stale Detection**: 5-minute timeout for lock files
- **Graceful Shutdown**: SIGTERM before SIGKILL
- **Error Handling**: Comprehensive error messages

## Migration from Old System

The new system is **fully backward compatible**:
- `npm run dev` works exactly as before
- No changes to existing workflows
- Enhanced error messages and conflict resolution

## Advanced Usage

### Custom Port Ranges
Modify `scripts/dev-bootstrap.js` to change port selection:
```javascript
const PORT_RANGE = [9999, ...Array.from({ length: 11 }, (_, i) => 3000 + i)];
```

### Environment Variables
```bash
PORT=8080 npm run dev    # Force specific port
NODE_ENV=development npm run dev
```

## Support

For issues or questions:
1. Check `npm run dev:status`
2. Review error messages in terminal
3. Use `npm run dev:clean` for stale locks
4. Check this documentation

---

**OSS Hero System v2.0** - Automatic conflict resolution for development workflows.
