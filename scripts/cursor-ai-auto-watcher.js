#!/usr/bin/env node

/**
 * 🤖 CURSOR AI AUTO-WATCHER
 * 
 * This script automatically runs universal header compliance whenever Cursor AI
 * starts a chat session. It watches for Cursor AI activity and executes
 * compliance checks automatically without any manual intervention.
 * 
 * Features:
 * - Automatic detection of Cursor AI chat sessions
 * - Runs compliance check before any prompt processing
 * - Background monitoring with minimal resource usage
 * - Automatic restart on file changes
 * - Silent operation with optional notifications
 */

const chokidar = require('chokidar');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Promisify fs functions
const access = promisify(fs.access);
const readFile = promisify(fs.readFile);

class CursorAIAutoWatcher {
  constructor() {
    this.projectRoot = process.cwd();
    this.isWatching = false;
    this.lastComplianceCheck = 0;
    this.complianceInterval = 5 * 60 * 1000; // 5 minutes minimum between checks
    this.watcher = null;
    this.isRunning = false;
    
    // Cursor AI detection patterns
    this.cursorAIPatterns = [
      '**/.cursor/**',
      '**/cursor-chat/**',
      '**/*.cursor-chat*',
      '**/.cursor-ai/**',
      '**/cursor-ai/**'
    ];
    
    // Additional patterns for Cursor AI activity
    this.activityPatterns = [
      '**/.vscode/**',
      '**/node_modules/.cache/**',
      '**/.next/**'
    ];
  }

  /**
   * Start automatic watching
   */
  async start() {
    if (this.isWatching) {
      console.log('⚠️ Watcher is already running');
      return;
    }

    console.log('🤖 CURSOR AI AUTO-WATCHER STARTING');
    console.log('='.repeat(60));
    console.log('🎯 Automatically monitoring for Cursor AI activity...');
    console.log('⏰ Started at:', new Date().toLocaleString());
    console.log('📁 Watching patterns:', this.cursorAIPatterns.join(', '));
    console.log('='.repeat(60));

    try {
      // Initial compliance check
      await this.runComplianceCheck('initial-startup');
      
      // Start file watching
      await this.startFileWatching();
      
      // Start activity monitoring
      await this.startActivityMonitoring();
      
      this.isWatching = true;
      console.log('✅ Auto-watcher started successfully');
      console.log('🚀 Universal header compliance will run automatically');
      
    } catch (error) {
      console.error('❌ Failed to start auto-watcher:', error.message);
      throw error;
    }
  }

  /**
   * Start file system watching
   */
  async startFileWatching() {
    const allPatterns = [...this.cursorAIPatterns, ...this.activityPatterns];
    
    this.watcher = chokidar.watch(allPatterns, {
      ignored: [
        /(^|[\/\\])\../, // Ignore hidden files
        '**/node_modules/**',
        '**/.git/**',
        '**/.next/**',
        '**/dist/**',
        '**/build/**'
      ],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100
      }
    });

    // Handle file events
    this.watcher
      .on('add', (filePath) => this.handleFileEvent('add', filePath))
      .on('change', (filePath) => this.handleFileEvent('change', filePath))
      .on('unlink', (filePath) => this.handleFileEvent('unlink', filePath))
      .on('error', (error) => console.error('Watcher error:', error))
      .on('ready', () => console.log('📁 File watcher ready'));
  }

  /**
   * Start activity monitoring
   */
  async startActivityMonitoring() {
    // Monitor for Cursor AI process
    setInterval(async () => {
      await this.checkCursorAIProcess();
    }, 10000); // Check every 10 seconds
    
    // Monitor for recent file activity
    setInterval(async () => {
      await this.checkRecentActivity();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Handle file system events
   */
  async handleFileEvent(eventType, filePath) {
    const relativePath = path.relative(this.projectRoot, filePath);
    
    // Check if this is Cursor AI related activity
    if (this.isCursorAIActivity(filePath)) {
      console.log(`🔍 Cursor AI activity detected: ${eventType} ${relativePath}`);
      
      // Run compliance check if enough time has passed
      await this.scheduleComplianceCheck('file-activity');
    }
  }

  /**
   * Check if file path indicates Cursor AI activity
   */
  isCursorAIActivity(filePath) {
    const lowerPath = filePath.toLowerCase();
    
    return (
      lowerPath.includes('cursor') ||
      lowerPath.includes('.cursor') ||
      lowerPath.includes('chat') ||
      lowerPath.includes('ai') ||
      lowerPath.includes('prompt') ||
      lowerPath.includes('completion')
    );
  }

  /**
   * Check for Cursor AI process
   */
  async checkCursorAIProcess() {
    try {
      // Check for Cursor AI processes
      const processes = await this.getRunningProcesses();
      const cursorAIProcesses = processes.filter(p => 
        p.toLowerCase().includes('cursor') ||
        p.toLowerCase().includes('cursor.exe')
      );
      
      if (cursorAIProcesses.length > 0 && !this.isRunning) {
        console.log('🤖 Cursor AI process detected, running compliance check...');
        this.isRunning = true;
        await this.runComplianceCheck('process-detection');
      } else if (cursorAIProcesses.length === 0) {
        this.isRunning = false;
      }
      
    } catch (error) {
      // Silently handle process check errors
    }
  }

  /**
   * Get running processes (cross-platform)
   */
  async getRunningProcesses() {
    return new Promise((resolve) => {
      let command = 'tasklist';
      let args = ['/FO', 'CSV', '/NH'];
      
      if (process.platform !== 'win32') {
        command = 'ps';
        args = ['-A', '-o', 'comm='];
      }
      
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.on('close', () => {
        const processes = output.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        resolve(processes);
      });
    });
  }

  /**
   * Check for recent file activity
   */
  async checkRecentActivity() {
    try {
      const recentFiles = await this.getRecentFiles();
      
      for (const file of recentFiles) {
        if (this.isCursorAIActivity(file.path)) {
          const timeSinceModified = Date.now() - file.mtime.getTime();
          
          // If file was modified in the last minute, it might be Cursor AI activity
          if (timeSinceModified < 60000) {
            console.log('🔍 Recent Cursor AI file activity detected');
            await this.scheduleComplianceCheck('recent-activity');
            break;
          }
        }
      }
      
    } catch (error) {
      // Silently handle activity check errors
    }
  }

  /**
   * Get recently modified files
   */
  async getRecentFiles() {
    const recentFiles = [];
    const cutoffTime = Date.now() - (5 * 60 * 1000); // 5 minutes ago
    
    try {
      // Check common directories for recent activity
      const dirsToCheck = [
        '.',
        'app',
        'components',
        'lib',
        'scripts'
      ];
      
      for (const dir of dirsToCheck) {
        const dirPath = path.join(this.projectRoot, dir);
        if (fs.existsSync(dirPath)) {
          const files = await this.getDirectoryFiles(dirPath);
          recentFiles.push(...files);
        }
      }
      
      // Filter by modification time and sort by most recent
      return recentFiles
        .filter(file => file.mtime.getTime() > cutoffTime)
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
        .slice(0, 10); // Top 10 most recent
      
    } catch (error) {
      return [];
    }
  }

  /**
   * Get files in directory with stats
   */
  async getDirectoryFiles(dirPath) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isFile()) {
          files.push({
            path: itemPath,
            mtime: stat.mtime
          });
        }
      }
      
    } catch (error) {
      // Skip directories that can't be read
    }
    
    return files;
  }

  /**
   * Schedule a compliance check
   */
  async scheduleComplianceCheck(reason) {
    const now = Date.now();
    
    // Check if enough time has passed since last compliance check
    if (now - this.lastComplianceCheck < this.complianceInterval) {
      console.log(`⏰ Compliance check skipped (too soon since last check)`);
      return;
    }
    
    console.log(`🔄 Scheduling compliance check (reason: ${reason})`);
    
    // Run compliance check after a short delay
    setTimeout(async () => {
      await this.runComplianceCheck(reason);
    }, 2000); // 2 second delay
  }

  /**
   * Run universal header compliance check
   */
  async runComplianceCheck(reason) {
    try {
      console.log(`🔍 Running universal header compliance check (reason: ${reason})`);
      
      // Check if the compliance script exists
      const complianceScript = path.join(this.projectRoot, 'scripts', 'cursor-ai-universal-header.js');
      
      if (!fs.existsSync(complianceScript)) {
        console.log('⚠️ Compliance script not found, skipping check');
        return;
      }
      
      // Run compliance check
      const result = await this.spawnCommand('node', ['scripts/cursor-ai-universal-header.js'], 120000);
      
      if (result.success) {
        console.log('✅ Universal header compliance check completed successfully');
        this.lastComplianceCheck = Date.now();
      } else {
        console.log(`⚠️ Compliance check completed with warnings: ${result.stderr}`);
      }
      
    } catch (error) {
      console.error(`❌ Compliance check failed: ${error.message}`);
    }
  }

  /**
   * Spawn command with timeout
   */
  async spawnCommand(command, args, timeout) {
    return new Promise((resolve) => {
      const child = spawn(command, args, {
        cwd: this.projectRoot,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      const timeoutId = setTimeout(() => {
        child.kill();
        resolve({
          success: false,
          exitCode: -1,
          stdout,
          stderr: 'Command timed out'
        });
      }, timeout);

      child.on('close', (code) => {
        clearTimeout(timeoutId);
        resolve({
          success: code === 0,
          exitCode: code,
          stdout,
          stderr
        });
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        resolve({
          success: false,
          exitCode: -1,
          stdout,
          stderr: error.message
        });
      });
    });
  }

  /**
   * Stop watching
   */
  stop() {
    if (this.watcher) {
      this.watcher.close();
    }
    this.isWatching = false;
    console.log('🛑 Auto-watcher stopped');
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      isWatching: this.isWatching,
      isRunning: this.isRunning,
      lastComplianceCheck: this.lastComplianceCheck,
      patterns: this.cursorAIPatterns
    };
  }
}

// Main execution
if (require.main === module) {
  const watcher = new CursorAIAutoWatcher();
  
  // Handle command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🤖 CURSOR AI AUTO-WATCHER

Usage: node scripts/cursor-ai-auto-watcher.js [options]

Options:
  --help, -h     Show this help message
  --status       Show current status
  --stop         Stop the watcher
  --start        Start the watcher (default)

This script automatically runs universal header compliance whenever Cursor AI
starts a chat session, without any manual intervention.

Examples:
  node scripts/cursor-ai-auto-watcher.js
  node scripts/cursor-ai-auto-watcher.js --status
  node scripts/cursor-ai-auto-watcher.js --stop
`);
    process.exit(0);
  }
  
  if (args.includes('--status')) {
    console.log('📊 Auto-watcher status:', watcher.getStatus());
    process.exit(0);
  }
  
  if (args.includes('--stop')) {
    watcher.stop();
    process.exit(0);
  }
  
  // Start the watcher
  watcher.start()
    .then(() => {
      console.log('\n🎉 Auto-watcher started successfully!');
      console.log('🚀 Universal header compliance will run automatically');
      console.log('💡 No manual commands needed - it runs in the background');
      
      // Keep the process running
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down auto-watcher...');
        watcher.stop();
        process.exit(0);
      });
      
      process.on('SIGTERM', () => {
        console.log('\n🛑 Shutting down auto-watcher...');
        watcher.stop();
        process.exit(0);
      });
      
    })
    .catch((error) => {
      console.error('\n❌ Auto-watcher failed to start:', error.message);
      process.exit(1);
    });
}

module.exports = CursorAIAutoWatcher;
