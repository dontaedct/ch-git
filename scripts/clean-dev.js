#!/usr/bin/env node

/**
 * Clean Development Environment
 * Kills existing development processes and clears cache
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

class DevCleaner {
  constructor() {
    this.ports = [3000, 3001, 3002, 3003, 3004, 3005];
    this.isWindows = process.platform === 'win32';
  }

  async killProcessOnPort(port) {
    try {
      if (this.isWindows) {
        const { stdout } = await execAsync(`netstat -aon | findstr :${port}`);
        const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
        for (const line of lines) {
          const pid = line.trim().split(/\s+/).pop();
          if (pid && pid !== '0' && /^\d+$/.test(pid)) {
            console.log(`🔫 Killing process ${pid} on port ${port}`);
            await execAsync(`taskkill /F /PID ${pid}`);
          }
        }
      } else {
        const { stdout } = await execAsync(`lsof -ti:${port}`);
        if (stdout.trim()) {
          console.log(`🔫 Killing process on port ${port}`);
          await execAsync(`kill -9 ${stdout.trim()}`);
        }
      }
    } catch (error) {
      // Port is free
    }
  }

  async clearCache() {
    console.log('🧹 Clearing Next.js cache...');
    
    const cachePaths = [
      '.next',
      'node_modules/.cache',
      '.turbo'
    ];

    for (const cachePath of cachePaths) {
      try {
        if (fs.existsSync(cachePath)) {
          fs.rmSync(cachePath, { recursive: true, force: true });
          console.log(`✅ Removed ${cachePath}`);
        }
      } catch (error) {
        console.log(`⚠️ Could not remove ${cachePath}: ${error.message}`);
      }
    }
  }

  async clean() {
    console.log('🚀 Cleaning development environment...');
    
    // Kill processes on all ports
    const killPromises = this.ports.map(port => this.killProcessOnPort(port));
    await Promise.all(killPromises);
    
    // Clear cache
    await this.clearCache();
    
    console.log('✅ Development environment cleaned!');
  }
}

// CLI usage
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const cleaner = new DevCleaner();
  cleaner.clean().then(() => {
    console.log('🎉 Ready for fast development!');
    process.exit(0);
  }).catch((error) => {
    console.error(`💥 Clean failed: ${error.message}`);
    process.exit(1);
  });
}

export default DevCleaner;
