// scripts/dev-manager.js
// Development server management utility
// Commands: status, kill, clean, ports

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execSync } = require('node:child_process');

const LOCK_FILE = path.join(os.tmpdir(), 'coach-hub-dev.lock');

function showHelp() {
  console.log('🔧 Coach Hub Dev Manager');
  console.log('');
  console.log('Usage: node scripts/dev-manager.js <command>');
  console.log('');
  console.log('Commands:');
  console.log('  status    - Show current dev server status');
  console.log('  kill      - Kill running dev server');
  console.log('  clean     - Clean up stale lock files');
  console.log('  ports     - Show port availability');
  console.log('  help      - Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/dev-manager.js status');
  console.log('  node scripts/dev-manager.js kill');
  console.log('  node scripts/dev-manager.js clean');
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
  if (!fs.existsSync(LOCK_FILE)) {
    console.log('✅ No dev server running');
    return;
  }

  try {
    const lockData = fs.readFileSync(LOCK_FILE, 'utf8');
    const [pid] = lockData.split(':');
    
    console.log(`🔄 Killing dev server (PID: ${pid})...`);
    
    try {
      // Try graceful shutdown first
      process.kill(Number(pid), 'SIGTERM');
      
      // Wait a bit, then force kill if needed
      setTimeout(() => {
        try {
          process.kill(Number(pid), 'SIGKILL');
          console.log('💀 Force killed dev server');
        } catch {
          // Process already dead
        }
      }, 2000);
      
      console.log('✅ Dev server shutdown initiated');
    } catch (error) {
      console.log('⚠️  Process not found, cleaning up lock file');
    }
    
    // Clean up lock file
    fs.unlinkSync(LOCK_FILE);
    console.log('🧹 Lock file cleaned up');
    
  } catch (error) {
    console.log('❌ Error killing dev server:', error.message);
  }
}

function cleanLockFiles() {
  if (!fs.existsSync(LOCK_FILE)) {
    console.log('✅ No lock files to clean');
    return;
  }

  try {
    const lockData = fs.readFileSync(LOCK_FILE, 'utf8');
    const [pid, timestamp] = lockData.split(':');
    const lockAge = Date.now() - Number(timestamp);
    
    console.log(`🧹 Found lock file (age: ${Math.round(lockAge/1000)}s)`);
    
    // Check if process is still alive
    try {
      process.kill(Number(pid), 0);
      console.log('⚠️  Process is still running, use "kill" command instead');
      return;
    } catch {
      // Process is dead, safe to remove
      fs.unlinkSync(LOCK_FILE);
      console.log('✅ Stale lock file removed');
    }
  } catch (error) {
    console.log('❌ Error cleaning lock file:', error.message);
  }
}

function showPorts() {
  const net = require('node:net');
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
if (require.main === module) {
  main();
}

module.exports = { getDevStatus, killDevServer, cleanLockFiles, showPorts };
