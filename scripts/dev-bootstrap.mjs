// scripts/dev-bootstrap.js
// Enhanced launcher for dev: process locking, smart port selection, conflict resolution.
// Tries 9999 first, then 3000..3010. Windows-friendly with process management.

import net from 'node:net';;
import { spawn } from 'node:child_process';;
import fs from 'node:fs';;
import path from 'node:path';;
import os from 'node:os';;

// Configuration
const LOCK_FILE = path.join(os.tmpdir(), 'coach-hub-dev.lock');
const PORT_RANGE = [9999, ...Array.from({ length: 11 }, (_, i) => 3000 + i)]; // 9999, 3000..3010
const REQUESTED_PORT = process.env.PORT ? Number(process.env.PORT) : null;

// Process locking mechanism
function acquireLock() {
  try {
    // Check if lock file exists and if the process is still running
    if (fs.existsSync(LOCK_FILE)) {
      const lockData = fs.readFileSync(LOCK_FILE, 'utf8');
      const [pid, timestamp] = lockData.split(':');
      
      // Check if process is still alive
      try {
        process.kill(Number(pid), 0); // Signal 0 just checks if process exists
        const lockAge = Date.now() - Number(timestamp);
        
        // If lock is older than 5 minutes, consider it stale
        if (lockAge < 5 * 60 * 1000) {
          console.error(`[dev-bootstrap] Another dev server is already running (PID: ${pid})`);
          console.error(`[dev-bootstrap] If you're sure it's not running, delete: ${LOCK_FILE}`);
          process.exit(1);
        } else {
          console.warn(`[dev-bootstrap] Removing stale lock file (age: ${Math.round(lockAge/1000)}s)`);
          fs.unlinkSync(LOCK_FILE);
        }
      } catch {
        // Process is dead, remove stale lock
        console.warn('[dev-bootstrap] Removing stale lock file');
        fs.unlinkSync(LOCK_FILE);
      }
    }
    
    // Create new lock file
    const lockContent = `${process.pid}:${Date.now()}`;
    fs.writeFileSync(LOCK_FILE, lockContent);
    
    // Cleanup on exit
    process.on('exit', releaseLock);
    process.on('SIGINT', () => { releaseLock(); process.exit(0); });
    process.on('SIGTERM', () => { releaseLock(); process.exit(0); });
    
    return true;
  } catch (error) {
    console.error('[dev-bootstrap] Failed to acquire lock:', error.message);
    return false;
  }
}

function releaseLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

// Enhanced port checking with better error handling
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve({ available: false, reason: 'port_in_use' });
      } else {
        resolve({ available: false, reason: 'other_error', error: err.message });
      }
    });
    
    server.once('listening', () => {
      server.close(() => resolve({ available: true, port }));
    });
    
    server.listen(port, '0.0.0.0');
  });
}

// Smart port selection
async function findAvailablePort() {
  const ports = REQUESTED_PORT ? [REQUESTED_PORT, ...PORT_RANGE] : PORT_RANGE;
  
  for (const port of ports) {
    const result = await checkPort(port);
    if (result.available) {
      return port;
    }
    
    if (result.reason === 'port_in_use') {
      console.warn(`[dev-bootstrap] Port ${port} is in use, trying next...`);
    }
  }
  
  throw new Error(`No available ports found in range: ${ports.join(', ')}`);
}

// Main execution
async function main() {
  try {
    // Acquire process lock
    if (!acquireLock()) {
      process.exit(1);
    }
    
    console.log('[dev-bootstrap] 🔒 Process lock acquired');
    
    // Find available port
    const port = await findAvailablePort();
    console.log(`[dev-bootstrap] 🚀 Starting Next.js on http://localhost:${port}`);
    
    // Start Next.js
    const isWindows = process.platform === 'win32';
    const child = spawn('npx', ['next', 'dev', '-p', String(port)], {
      stdio: 'inherit',
      shell: isWindows,
      env: { ...process.env, PORT: String(port) }
    });
    
    // Handle child process events
    child.on('exit', (code) => {
      console.log(`[dev-bootstrap] Next.js process exited with code ${code ?? 0}`);
      releaseLock();
      process.exit(code ?? 0);
    });
    
    child.on('error', (error) => {
      console.error('[dev-bootstrap] Failed to start Next.js:', error.message);
      releaseLock();
      process.exit(1);
    });
    
  } catch (error) {
    console.error('[dev-bootstrap] Fatal error:', error.message);
    releaseLock();
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.main) {
  main();
}

export { acquireLock, releaseLock, findAvailablePort };;
