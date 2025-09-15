// scripts/robust-dev.mjs
// Ultra-robust Next.js development server with automatic error recovery
// Handles port conflicts, process cleanup, cache clearing, and retry logic

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, execSync } from 'node:child_process';
import net from 'node:net';
import { killDevServer, cleanLockFiles, showPorts } from './dev-manager.mjs';

const TARGET_PORT = 3000;
const FALLBACK_PORTS = [3001, 3002, 3003, 3004];
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Color utilities for better logging
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

function log(level, message) {
  const timestamp = new Date().toLocaleTimeString();
  const levelColors = {
    info: colors.blue,
    success: colors.green,
    warn: colors.yellow,
    error: colors.red,
  };
  
  console.log(`${colors.cyan(`[${timestamp}]`)} ${levelColors[level](`[${level.toUpperCase()}]`)} ${message}`);
}

function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close(() => resolve(false));
    });
    
    server.listen(port, '127.0.0.1');
  });
}

function killProcessOnPort(port) {
  try {
    log('info', `Checking for processes on port ${port}...`);
    
    if (os.platform() === 'win32') {
      // Windows
      try {
        const output = execSync(`netstat -aon | findstr :${port}`, { encoding: 'utf8' });
        const lines = output.split('\n').filter(line => line.includes('LISTENING'));
        
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            log('warn', `Killing process ${pid} on port ${port}`);
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          }
        }
      } catch (error) {
        // No processes found or error - that's fine
      }
    } else {
      // Unix-like systems
      try {
        const output = execSync(`lsof -ti:${port}`, { encoding: 'utf8' });
        const pids = output.trim().split('\n').filter(pid => pid);
        
        for (const pid of pids) {
          log('warn', `Killing process ${pid} on port ${port}`);
          execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
        }
      } catch (error) {
        // No processes found or error - that's fine
      }
    }
  } catch (error) {
    log('warn', `Could not kill processes on port ${port}: ${error.message}`);
  }
}

function clearNextCache() {
  log('info', 'Clearing Next.js cache...');
  
  try {
    // Remove .next directory
    const nextDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextDir)) {
      fs.rmSync(nextDir, { recursive: true, force: true });
      log('success', 'Removed .next directory');
    }
    
    // Remove node_modules/.cache
    const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
      log('success', 'Removed node_modules/.cache');
    }
    
    // Clear npm cache (if needed)
    try {
      execSync('npm cache clean --force', { stdio: 'ignore' });
      log('success', 'Cleared npm cache');
    } catch (error) {
      // Not critical
    }
    
  } catch (error) {
    log('warn', `Cache clearing failed: ${error.message}`);
  }
}

function startNextDev(port) {
  return new Promise((resolve, reject) => {
    log('info', `Starting Next.js development server on port ${port}...`);
    
    const child = spawn('npx', ['next', 'dev', '-p', port.toString()], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, PORT: port.toString() }
    });
    
    let resolved = false;
    
    // Give it time to start up
    const startupTimeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(child);
      }
    }, 3000);
    
    child.on('error', (error) => {
      clearTimeout(startupTimeout);
      if (!resolved) {
        resolved = true;
        reject(error);
      }
    });
    
    child.on('exit', (code, signal) => {
      clearTimeout(startupTimeout);
      if (!resolved) {
        resolved = true;
        if (code !== 0) {
          reject(new Error(`Next.js exited with code ${code} (signal: ${signal})`));
        } else {
          resolve(child);
        }
      }
    });
    
    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
      log('info', 'Shutting down development server...');
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 2000);
      process.exit(0);
    });
  });
}

async function findAvailablePort() {
  // Try target port first
  if (!(await isPortInUse(TARGET_PORT))) {
    return TARGET_PORT;
  }
  
  // Try fallback ports
  for (const port of FALLBACK_PORTS) {
    if (!(await isPortInUse(port))) {
      return port;
    }
  }
  
  throw new Error('No available ports found');
}

async function robustDevStart() {
  log('info', colors.bold('🚀 Starting Ultra-Robust Next.js Development Server'));
  log('info', '='.repeat(60));
  
  // Step 1: Cleanup existing processes and locks
  log('info', '🧹 Cleaning up existing processes...');
  try {
    killDevServer();
    cleanLockFiles();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for cleanup
  } catch (error) {
    log('warn', `Cleanup warning: ${error.message}`);
  }
  
  // Step 2: Kill processes on target port
  killProcessOnPort(TARGET_PORT);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Step 3: Find available port
  let targetPort;
  try {
    targetPort = await findAvailablePort();
    if (targetPort !== TARGET_PORT) {
      log('warn', `Port ${TARGET_PORT} unavailable, using port ${targetPort}`);
      killProcessOnPort(targetPort); // Clean it up anyway
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    log('error', 'No available ports found, clearing processes and retrying...');
    
    // Force clear all common dev ports
    [TARGET_PORT, ...FALLBACK_PORTS].forEach(port => killProcessOnPort(port));
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    targetPort = TARGET_PORT; // Force it
  }
  
  // Step 4: Attempt to start server with retries
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    log('info', `📡 Attempt ${attempt}/${MAX_RETRIES} - Starting server on port ${targetPort}...`);
    
    try {
      const child = await startNextDev(targetPort);
      log('success', colors.bold(`✅ Development server successfully started!`));
      log('success', colors.green(`🌐 Local: http://localhost:${targetPort}`));
      log('info', colors.cyan('Press Ctrl+C to stop the server'));
      
      return; // Success!
      
    } catch (error) {
      log('error', `Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < MAX_RETRIES) {
        log('warn', `⏳ Retrying in ${RETRY_DELAY/1000}s with cache clearing...`);
        
        // Clear cache before retrying
        clearNextCache();
        
        // Kill any processes that might have started
        killProcessOnPort(targetPort);
        
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        log('error', colors.bold('❌ All attempts failed!'));
        log('error', 'Troubleshooting steps:');
        log('error', '1. Check if another process is using the port');
        log('error', '2. Try running: npm run tool:dev:kill');
        log('error', '3. Try running: npm run tool:dev:clean');
        log('error', '4. Restart your terminal/IDE');
        log('error', '5. Reboot your system if necessary');
        
        process.exit(1);
      }
    }
  }
}

// Export for potential programmatic use
export { robustDevStart };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith('/robust-dev.mjs')) {
  robustDevStart().catch((error) => {
    log('error', colors.bold(`Fatal error: ${error.message}`));
    process.exit(1);
  });
}