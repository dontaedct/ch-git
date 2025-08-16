#!/usr/bin/env node

/**
 * Doctor Timeout Wrapper - Prevents infinite loops and hanging
 * This script wraps the doctor command with aggressive timeout protection
 */

const { spawn, execSync } = require('child_process');
const path = require('path');

class DoctorTimeoutWrapper {
  constructor() {
    this.maxTimeout = 60000; // 60 seconds max
    this.warningThreshold = 30000; // 30 seconds warning
    this.process = null;
    this.startTime = Date.now();
    this.isCompleted = false;
  }

  async run() {
    console.log('🛡️  Doctor Timeout Wrapper Active');
    console.log(`⏱️  Maximum runtime: ${this.maxTimeout / 1000}s`);
    console.log(`⚠️  Warning threshold: ${this.warningThreshold / 1000}s`);
    console.log('');

    // Set up timeout protection
    const timeoutId = setTimeout(() => {
      this.forceKill('Maximum timeout reached');
    }, this.maxTimeout);

    // Set up warning timer
    const warningId = setTimeout(() => {
      if (!this.isCompleted) {
        console.log('⚠️  WARNING: Doctor command taking longer than expected...');
        console.log('   This may indicate a potential infinite loop or hang');
      }
    }, this.warningThreshold);

    try {
      // Run the doctor command
      await this.executeDoctor();
      
      // Clear timers on successful completion
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      
      console.log('✅ Doctor command completed successfully');
      
    } catch (error) {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      
      if (error.message.includes('TIMEOUT')) {
        console.error('❌ Doctor command timed out - forcing exit');
        process.exit(1);
      } else {
        console.error('❌ Doctor command failed:', error.message);
        process.exit(1);
      }
    }
  }

  async executeDoctor() {
    return new Promise((resolve, reject) => {
      // Use the lightweight doctor by default for safety
      const args = ['run', 'doctor:ultra-light'];
      
      console.log(`🚀 Executing: npm ${args.join(' ')}`);
      
      this.process = spawn('npm', args, {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd()
      });

      // Monitor process
      this.process.on('close', (code) => {
        this.isCompleted = true;
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });

      this.process.on('error', (error) => {
        this.isCompleted = true;
        reject(error);
      });

      // Monitor for hanging
      this.monitorForHanging(reject);
    });
  }

  monitorForHanging(reject) {
    const checkInterval = setInterval(() => {
      if (this.isCompleted) {
        clearInterval(checkInterval);
        return;
      }

      const elapsed = Date.now() - this.startTime;
      
      // Check if process is still responsive
      if (this.process && this.process.pid) {
        try {
          // Try to get process info - if it fails, process might be hanging
          process.kill(this.process.pid, 0);
        } catch (error) {
          // Process is not responding
          clearInterval(checkInterval);
          reject(new Error('TIMEOUT: Process became unresponsive'));
          this.forceKill('Process unresponsive');
        }
      }

      // Additional safety check
      if (elapsed > this.maxTimeout) {
        clearInterval(checkInterval);
        reject(new Error('TIMEOUT: Maximum runtime exceeded'));
        this.forceKill('Maximum runtime exceeded');
      }
    }, 5000); // Check every 5 seconds
  }

  forceKill(reason) {
    console.error(`🛑 FORCE KILLING DOCTOR PROCESS: ${reason}`);
    
    if (this.process && this.process.pid) {
      try {
        // Kill the process tree
        if (process.platform === 'win32') {
          execSync(`taskkill /F /T /PID ${this.process.pid}`, { stdio: 'ignore' });
        } else {
          execSync(`pkill -P ${this.process.pid}`, { stdio: 'ignore' });
          process.kill(this.process.pid, 'SIGKILL');
        }
      } catch (error) {
        // Ignore errors during force kill
      }
    }

    // Kill any remaining npm processes
    try {
      if (process.platform === 'win32') {
        execSync('taskkill /F /IM node.exe /T', { stdio: 'ignore' });
      } else {
        execSync('pkill -f "npm run doctor"', { stdio: 'ignore' });
      }
    } catch (error) {
      // Ignore errors during cleanup
    }

    console.error('💀 All doctor processes terminated');
    process.exit(1);
  }
}

// Run the wrapper
if (require.main === module) {
  const wrapper = new DoctorTimeoutWrapper();
  wrapper.run().catch((error) => {
    console.error('Fatal error in wrapper:', error);
    process.exit(1);
  });
}

module.exports = DoctorTimeoutWrapper;
