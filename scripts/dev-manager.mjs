// scripts/dev-manager.mjs
// Development server management utility
// Commands: status, kill, clean, ports

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import net from 'node:net';

const LOCK_FILE = path.join(os.tmpdir(), 'micro-app-dev.lock');

function showHelp() {
  console.log('🔧 Micro App Dev Manager');
  console.log('');
  console.log('Usage: node scripts/dev-manager.mjs <command>');
  console.log('');
  console.log('Commands:');
  console.log('  status    - Show current dev server status');
  console.log('  kill      - Kill running dev server');
  console.log('  clean     - Clean up stale lock files');
  console.log('  ports     - Show port availability');
  console.log('  help      - Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/dev-manager.mjs status');
  console.log('  node scripts/dev-manager.mjs kill');
  console.log('  node scripts/dev-manager.mjs clean');
}

function getDevStatus() {
  if (!fs.existsSync(LOCK_FILE)) {
    console.log('✅ No dev server running');
    return;
  }

  try {
    const lockData = fs.readFileSync(LOCK_FILE, 'utf8');
    const [pid, timestamp] = lockData.split(':');
    const lockAge = Date.now() - Number(timestamp);
    
    console.log(`🔒 Dev server lock found:`);
    console.log(`   PID: ${pid}`);
    console.log(`   Age: ${Math.round(lockAge/1000)}s`);
    
    // Check if process is still alive
    try {
      process.kill(Number(pid), 0);
      console.log(`   Status: 🟢 Running`);
    } catch {
      console.log(`   Status: 🔴 Stale (process not found)`);
    }
    
    console.log(`   Lock file: ${LOCK_FILE}`);
  } catch (error) {
    console.log('❌ Error reading lock file:', error.message);
  }
}

function killDevServer() {
  console.log('🔄 Killing all Node.js processes...');
  
  try {
    // Windows: Kill all node processes
    if (os.platform() === 'win32') {
      try {
        execSync('taskkill /F /IM node.exe', { stdio: 'ignore' });
        console.log('✅ All node processes killed');
      } catch (error) {
        console.log('ℹ️  No node processes found or already killed');
      }
    } else {
      // Unix/Linux: Kill node processes
      try {
        execSync('pkill -f node', { stdio: 'ignore' });
        console.log('✅ All node processes killed');
      } catch (error) {
        console.log('ℹ️  No node processes found or already killed');
      }
    }
    
    // Also check for lock file based killing
    if (fs.existsSync(LOCK_FILE)) {
      try {
        const lockData = fs.readFileSync(LOCK_FILE, 'utf8');
        const [pid] = lockData.split(':');
        
        try {
          process.kill(Number(pid), 'SIGKILL');
        } catch {
          // Process already dead
        }
        
        // Clean up lock file
        fs.unlinkSync(LOCK_FILE);
        console.log('🧹 Lock file cleaned up');
      } catch (error) {
        console.log('⚠️  Error with lock file, but processes should be killed');
      }
    }
    
    // Wait a moment for processes to die
    console.log('⏳ Waiting for cleanup...');
    
  } catch (error) {
    console.log('❌ Error killing processes:', error.message);
  }
}

function cleanLockFiles() {
  console.log('🧹 Cleaning up development files...');
  
  // Clean lock files
  if (fs.existsSync(LOCK_FILE)) {
    try {
      fs.unlinkSync(LOCK_FILE);
      console.log('✅ Lock file removed');
    } catch (error) {
      console.log('⚠️  Could not remove lock file:', error.message);
    }
  }
  
  // Clean Next.js cache (be careful not to break things)
  const nextCachePath = path.join(process.cwd(), '.next', 'cache');
  if (fs.existsSync(nextCachePath)) {
    try {
      console.log('🗑️  Clearing Next.js cache...');
      fs.rmSync(nextCachePath, { recursive: true, force: true });
      console.log('✅ Next.js cache cleared');
    } catch (error) {
      console.log('⚠️  Could not clear Next.js cache:', error.message);
    }
  }
  
  // Clean temp build files
  const tempPaths = [
    path.join(os.tmpdir(), 'next-*'),
    path.join(process.cwd(), '.next', 'trace'),
    path.join(process.cwd(), '.next', 'server', 'pages-manifest.json')
  ];
  
  tempPaths.forEach(tempPath => {
    if (fs.existsSync(tempPath)) {
      try {
        fs.rmSync(tempPath, { recursive: true, force: true });
        console.log(`✅ Cleaned ${path.basename(tempPath)}`);
      } catch (error) {
        // Ignore errors for temp files
      }
    }
  });
  
  console.log('✅ Cleanup complete');
}

function showPorts() {
  const PORT_RANGE = [9999, ...Array.from({ length: 11 }, (_, i) => 3000 + i)];
  
  console.log('🔍 Checking port availability...\n');
  
  PORT_RANGE.forEach(port => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${port}: In use`);
      } else {
        console.log(`❌ Port ${port}: Error (${err.code})`);
      }
    });
    
    server.once('listening', () => {
      server.close(() => {
        console.log(`✅ Port ${port}: Available`);
      });
    });
    
    server.listen(port, '0.0.0.0');
  });
}

// Main execution
function main() {
  const command = process.argv[2] || 'help';
  
  console.log(`[dev-manager] Command: ${command}`);
  
  switch (command) {
    case 'status':
      getDevStatus();
      break;
    case 'kill':
      killDevServer();
      break;
    case 'clean':
      cleanLockFiles();
      break;
    case 'ports':
      showPorts();
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { getDevStatus, killDevServer, cleanLockFiles, showPorts };