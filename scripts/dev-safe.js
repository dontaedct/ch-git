#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const { existsSync, rmSync } = require('fs');
const path = require('path');

async function getPort(startPort = 3000) {
  try {
    // Try to use get-port if available
    const { default: getPort } = await import('get-port');
    return await getPort({ port: startPort });
  } catch {
    // Fallback: check ports manually
    for (let port = startPort; port < startPort + 10; port++) {
      try {
        const netstat = execSync(`netstat -an | findstr :${port}`, { stdio: 'ignore' });
        if (!netstat.toString().includes(`:${port}`)) {
          return port;
        }
      } catch {
        return port;
      }
    }
    return startPort; // Fallback to start port
  }
}

async function cleanupNext() {
  const nextDir = path.join(process.cwd(), '.next');
  
  if (!existsSync(nextDir)) {
    return;
  }

  console.log('🧹 Cleaning up .next directory...');
  
  try {
    // On Windows, try to unlock files first
    try {
      execSync('attrib -R -S -H .next\\* /S /D', { stdio: 'ignore', shell: true });
    } catch (e) {
      // Ignore attrib errors
    }
    
    // Try to delete with retries
    let retries = 3;
    while (retries > 0) {
      try {
        rmSync(nextDir, { recursive: true, force: true });
        console.log('✅ .next directory cleaned successfully');
        break;
      } catch (e) {
        retries--;
        if (retries === 0) {
          console.warn('⚠️  Could not fully clean .next directory, continuing anyway...');
        } else {
          console.log(`🔄 Retrying cleanup... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  } catch (e) {
    console.warn('⚠️  Cleanup failed, continuing anyway...');
  }
}

async function killStrayProcesses() {
  try {
    // Kill any existing Node processes for this repo (conservative approach)
    const cwd = process.cwd();
    const repoName = path.basename(cwd);
    
    console.log('🔍 Looking for stray Node processes...');
    
    try {
      const processes = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', { encoding: 'utf8' });
      if (processes.includes('node.exe')) {
        console.log('⚠️  Found Node processes running. Please stop them manually if needed.');
      }
    } catch (e) {
      // Ignore if tasklist fails
    }
  } catch (e) {
    // Ignore process killing errors
  }
}

async function main() {
  try {
    console.log('🚀 Starting Windows-safe dev server...');
    
    await killStrayProcesses();
    await cleanupNext();
    
    const port = await getPort(3000);
    console.log(`🌐 Starting Next.js on port ${port}...`);
    console.log(`📍 Local: http://localhost:${port}`);
    
    // Start Next.js dev server
    const child = spawn('npx', ['next', 'dev', '-p', port.toString()], {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('error', (error) => {
      console.error('❌ Failed to start dev server:', error.message);
      process.exit(1);
    });
    
    child.on('exit', (code) => {
      process.exit(code);
    });
    
  } catch (error) {
    console.error('❌ Error starting dev server:', error.message);
    process.exit(1);
  }
}

main();


