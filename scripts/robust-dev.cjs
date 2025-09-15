#!/usr/bin/env node

// Ultra-robust Next.js development server with automatic error recovery
// Handles port conflicts, process cleanup, cache clearing, and retry logic

const fs = require('node:fs');
const path = require('node:path');
const { spawn, execSync } = require('node:child_process');
const net = require('node:net');

const TARGET_PORT = 3000;
const FALLBACK_PORTS = [3001, 3002, 3003];
const MAX_RETRIES = 3;

// Color utilities
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
      resolve(err.code === 'EADDRINUSE');
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
    
    // Windows
    try {
      const output = execSync(`netstat -aon | findstr :${port}`, { encoding: 'utf8' });
      const lines = output.split('\n').filter(line => line.includes('LISTENING'));
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && /^\d+$/.test(pid)) {
          log('warn', `Killing process ${pid} on port ${port}`);
          try {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
            log('success', `Process ${pid} killed`);
          } catch (e) {
            log('warn', `Could not kill process ${pid}: ${e.message}`);
          }
        }
      }
    } catch (error) {
      // No processes found - that's fine
      log('info', `No processes found on port ${port}`);
    }
  } catch (error) {
    log('warn', `Could not check processes on port ${port}: ${error.message}`);
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
    
  } catch (error) {
    log('warn', `Cache clearing failed: ${error.message}`);
  }
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

function startNextDev(port) {
  return new Promise((resolve, reject) => {
    log('info', `Starting Next.js development server on port ${port}...`);
    
    const child = spawn('npm', ['run', 'dev:basic', '--', '-p', port.toString()], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, PORT: port.toString() }
    });
    
    let resolved = false;
    let startupTimer;
    
    // Give it time to start up
    startupTimer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        log('success', colors.bold(`✅ Development server started on port ${port}!`));
        log('success', colors.green(`🌐 Local: http://localhost:${port}`));
        resolve(child);
      }
    }, 5000);
    
    child.on('error', (error) => {
      clearTimeout(startupTimer);
      if (!resolved) {
        resolved = true;
        reject(error);
      }
    });
    
    child.on('exit', (code, signal) => {
      clearTimeout(startupTimer);
      if (!resolved && code !== 0) {
        resolved = true;
        reject(new Error(`Next.js exited with code ${code} (signal: ${signal})`));
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

async function robustDevStart() {
  log('info', colors.bold('🚀 Starting Ultra-Robust Next.js Development Server'));
  log('info', '='.repeat(60));
  
  // Step 1: Kill processes on target port
  killProcessOnPort(TARGET_PORT);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 2: Find available port
  let targetPort;
  try {
    targetPort = await findAvailablePort();
    if (targetPort !== TARGET_PORT) {
      log('warn', `Port ${TARGET_PORT} unavailable, using port ${targetPort}`);
      killProcessOnPort(targetPort);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    log('error', 'No available ports found, clearing processes and retrying...');
    [TARGET_PORT, ...FALLBACK_PORTS].forEach(port => killProcessOnPort(port));
    await new Promise(resolve => setTimeout(resolve, 3000));
    targetPort = TARGET_PORT;
  }
  
  // Step 3: Attempt to start server with retries
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    log('info', `📡 Attempt ${attempt}/${MAX_RETRIES} - Starting server on port ${targetPort}...`);
    
    try {
      await startNextDev(targetPort);
      return; // Success!
      
    } catch (error) {
      log('error', `Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < MAX_RETRIES) {
        log('warn', `⏳ Retrying in 3s with cache clearing...`);
        clearNextCache();
        killProcessOnPort(targetPort);
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        log('error', colors.bold('❌ All attempts failed!'));
        log('error', 'Try: npm run dev:basic');
        process.exit(1);
      }
    }
  }
}

// Start the robust dev server
robustDevStart().catch((error) => {
  log('error', colors.bold(`Fatal error: ${error.message}`));
  process.exit(1);
});