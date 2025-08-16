#!/usr/bin/env node

/**
 * Doctor Infinite Loop Prevention System
 * 
 * This script provides multiple layers of protection against infinite loops:
 * 1. Process monitoring with heartbeat detection
 * 2. Resource usage monitoring (CPU, memory, disk)
 * 3. File processing limits and circuit breakers
 * 4. Timeout protection with graceful degradation
 * 5. Automatic process killing and cleanup
 */

const { spawn, execSync } = require('child_process');
const { performance } = require('perf_hooks');
const os = require('os');
const fs = require('fs');
const path = require('path');

class InfiniteLoopPrevention {
  constructor() {
    this.maxRuntime = 120000; // 2 minutes max
    this.warningThreshold = 60000; // 1 minute warning
    this.heartbeatInterval = 5000; // 5 seconds
    this.maxMemoryUsage = 800 * 1024 * 1024; // 800MB
    this.maxCpuUsage = 80; // 80% CPU
    this.maxFileProcessingTime = 30000; // 30 seconds per file
    this.maxConsecutiveFailures = 3;
    
    this.process = null;
    this.startTime = performance.now();
    this.lastHeartbeat = Date.now();
    this.isCompleted = false;
    this.consecutiveFailures = 0;
    this.filesProcessed = 0;
    this.lastFileProcessTime = 0;
    
    // Monitoring intervals
    this.monitors = new Set();
  }

  async run() {
    console.log('🛡️  DOCTOR INFINITE LOOP PREVENTION SYSTEM ACTIVE');
    console.log('='.repeat(60));
    console.log(`⏱️  Maximum runtime: ${this.maxRuntime / 1000}s`);
    console.log(`💾 Memory limit: ${this.maxMemoryUsage / 1024 / 1024}MB`);
    console.log(`🖥️  CPU limit: ${this.maxCpuUsage}%`);
    console.log(`📁 Max file processing time: ${this.maxFileProcessingTime / 1000}s`);
    console.log(`🔄 Max consecutive failures: ${this.maxConsecutiveFailures}`);
    console.log('');

    try {
      // Start all monitoring systems
      this.startMonitoring();
      
      // Run the doctor command with protection
      await this.executeDoctorWithProtection();
      
      // Cleanup and success
      this.cleanup();
      console.log('✅ Doctor command completed successfully with infinite loop protection');
      
    } catch (error) {
      this.cleanup();
      
      if (error.message.includes('INFINITE_LOOP_DETECTED')) {
        console.error('❌ INFINITE LOOP DETECTED - Forcing exit');
        this.forceKillAll('Infinite loop detected');
        process.exit(1);
      } else if (error.message.includes('RESOURCE_LIMIT_EXCEEDED')) {
        console.error('❌ Resource limits exceeded - Forcing exit');
        this.forceKillAll('Resource limits exceeded');
        process.exit(1);
      } else {
        console.error('❌ Doctor command failed:', error.message);
        process.exit(1);
      }
    }
  }

  startMonitoring() {
    // Heartbeat monitoring
    const heartbeatMonitor = setInterval(() => {
      this.checkHeartbeat();
    }, this.heartbeatInterval);
    this.monitors.add(heartbeatMonitor);

    // Resource monitoring
    const resourceMonitor = setInterval(() => {
      this.checkResourceUsage();
    }, 10000); // Every 10 seconds
    this.monitors.add(resourceMonitor);

    // Runtime monitoring
    const runtimeMonitor = setInterval(() => {
      this.checkRuntime();
    }, 5000); // Every 5 seconds
    this.monitors.add(runtimeMonitor);

    // File processing monitoring
    const fileMonitor = setInterval(() => {
      this.checkFileProcessing();
    }, 3000); // Every 3 seconds
    this.monitors.add(fileMonitor);

    // Global timeout
    const globalTimeout = setTimeout(() => {
      this.detectInfiniteLoop('Global timeout reached');
    }, this.maxRuntime);
    this.monitors.add(globalTimeout);
  }

  checkHeartbeat() {
    const now = Date.now();
    const timeSinceLastHeartbeat = now - this.lastHeartbeat;
    
    if (timeSinceLastHeartbeat > this.heartbeatInterval * 3) {
      this.detectInfiniteLoop('Heartbeat timeout - process may be hanging');
    }
  }

  checkResourceUsage() {
    try {
      // Memory check
      const memUsage = process.memoryUsage();
      const heapUsed = memUsage.heapUsed;
      
      if (heapUsed > this.maxMemoryUsage) {
        this.detectInfiniteLoop(`Memory usage exceeded: ${(heapUsed / 1024 / 1024).toFixed(2)}MB`);
      }

      // CPU check (simplified)
      const cpuUsage = os.loadavg()[0] * 100; // 1-minute load average
      if (cpuUsage > this.maxCpuUsage) {
        this.detectInfiniteLoop(`CPU usage exceeded: ${cpuUsage.toFixed(2)}%`);
      }

      // Disk check
      this.checkDiskUsage();

    } catch (error) {
      console.log('⚠️  Resource monitoring warning:', error.message);
    }
  }

  checkDiskUsage() {
    try {
      const cwd = process.cwd();
      const stats = fs.statSync(cwd);
      
      // Check if we can still write to the directory
      const testFile = path.join(cwd, '.doctor-test-' + Date.now());
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      
    } catch (error) {
      this.detectInfiniteLoop(`Disk access issues: ${error.message}`);
    }
  }

  checkRuntime() {
    const elapsed = performance.now() - this.startTime;
    
    if (elapsed > this.maxRuntime) {
      this.detectInfiniteLoop(`Maximum runtime exceeded: ${(elapsed / 1000).toFixed(2)}s`);
    }
    
    // Warning threshold
    if (elapsed > this.warningThreshold && !this.isCompleted) {
      console.log('⚠️  WARNING: Doctor command taking longer than expected...');
      console.log(`   Runtime: ${(elapsed / 1000).toFixed(2)}s`);
      console.log('   This may indicate a potential infinite loop or hang');
    }
  }

  checkFileProcessing() {
    const now = Date.now();
    const timeSinceLastFile = now - this.lastFileProcessTime;
    
    if (this.lastFileProcessTime > 0 && timeSinceLastFile > this.maxFileProcessingTime) {
      this.detectInfiniteLoop(`File processing timeout: ${(timeSinceLastFile / 1000).toFixed(2)}s since last file`);
    }
  }

  detectInfiniteLoop(reason) {
    console.error('🚨 INFINITE LOOP DETECTED!');
    console.error(`   Reason: ${reason}`);
    console.error(`   Runtime: ${((performance.now() - this.startTime) / 1000).toFixed(2)}s`);
    console.error(`   Files processed: ${this.filesProcessed}`);
    console.error(`   Consecutive failures: ${this.consecutiveFailures}`);
    
    throw new Error(`INFINITE_LOOP_DETECTED: ${reason}`);
  }

  async executeDoctorWithProtection() {
    return new Promise((resolve, reject) => {
      // Use the enhanced doctor with conservative settings
      const args = ['run', 'doctor:enhanced', '--max-files', '100', '--timeout', '30000'];
      
      console.log(`🚀 Executing protected doctor: npm ${args.join(' ')}`);
      
      this.process = spawn('npm', args, {
        stdio: 'pipe', // Capture output for monitoring
        shell: true,
        cwd: process.cwd()
      });

      let output = '';
      let lastOutputTime = Date.now();

      // Monitor stdout for activity
      this.process.stdout?.on('data', (data) => {
        const text = data.toString();
        output += text;
        lastOutputTime = Date.now();
        
        // Update heartbeat
        this.lastHeartbeat = Date.now();
        
        // Check for file processing indicators
        if (text.includes('Processing file') || text.includes('Added') || text.includes('Checked')) {
          this.filesProcessed++;
          this.lastFileProcessTime = Date.now();
        }
        
        // Check for error patterns
        if (text.includes('Error') || text.includes('Failed') || text.includes('Exception')) {
          this.consecutiveFailures++;
        } else if (text.includes('Success') || text.includes('Completed') || text.includes('✅')) {
          this.consecutiveFailures = 0;
        }
      });

      // Monitor stderr for errors
      this.process.stderr?.on('data', (data) => {
        const text = data.toString();
        console.error('Doctor stderr:', text);
        this.consecutiveFailures++;
      });

      // Monitor process events
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

      // Monitor for hanging based on output
      const outputMonitor = setInterval(() => {
        const timeSinceLastOutput = Date.now() - lastOutputTime;
        
        if (timeSinceLastOutput > 15000 && !this.isCompleted) { // 15 seconds no output
          clearInterval(outputMonitor);
          this.detectInfiniteLoop('No output for 15 seconds - process may be hanging');
        }
      }, 5000);
      this.monitors.add(outputMonitor);

      // Monitor consecutive failures
      const failureMonitor = setInterval(() => {
        if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
          clearInterval(failureMonitor);
          this.detectInfiniteLoop(`Too many consecutive failures: ${this.consecutiveFailures}`);
        }
      }, 2000);
      this.monitors.add(failureMonitor);
    });
  }

  cleanup() {
    // Clear all monitoring intervals
    for (const monitor of this.monitors) {
      if (typeof monitor === 'number') {
        clearTimeout(monitor);
      } else if (monitor && typeof monitor === 'object') {
        clearInterval(monitor);
      }
    }
    this.monitors.clear();
  }

  forceKillAll(reason) {
    console.error(`🛑 FORCE KILLING ALL DOCTOR PROCESSES: ${reason}`);
    
    try {
      // Kill the main process
      if (this.process && this.process.pid) {
        if (process.platform === 'win32') {
          execSync(`taskkill /F /T /PID ${this.process.pid}`, { stdio: 'ignore' });
        } else {
          execSync(`pkill -P ${this.process.pid}`, { stdio: 'ignore' });
          process.kill(this.process.pid, 'SIGKILL');
        }
      }

      // Kill any remaining npm/node processes related to doctor
      if (process.platform === 'win32') {
        execSync('taskkill /F /IM node.exe /T', { stdio: 'ignore' });
        execSync('taskkill /F /IM npm.exe /T', { stdio: 'ignore' });
      } else {
        execSync('pkill -f "npm run doctor"', { stdio: 'ignore' });
        execSync('pkill -f "tsx scripts/doctor"', { stdio: 'ignore' });
      }

      console.error('💀 All doctor-related processes terminated');
      
    } catch (error) {
      console.error('⚠️  Error during force kill:', error.message);
    }
  }
}

// Run the prevention system
if (require.main === module) {
  const prevention = new InfiniteLoopPrevention();
  
  // Handle process signals
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, cleaning up...');
    prevention.cleanup();
    prevention.forceKillAll('SIGINT received');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, cleaning up...');
    prevention.cleanup();
    prevention.forceKillAll('SIGTERM received');
    process.exit(0);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught exception:', error.message);
    prevention.cleanup();
    prevention.forceKillAll('Uncaught exception');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled rejection at:', promise, 'reason:', reason);
    prevention.cleanup();
    prevention.forceKillAll('Unhandled rejection');
    process.exit(1);
  });

  // Run the prevention system
  prevention.run().catch((error) => {
    console.error('Fatal error in prevention system:', error);
    process.exit(1);
  });
}

module.exports = InfiniteLoopPrevention;
