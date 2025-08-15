#!/usr/bin/env node

/**
 * 🔄 AUTO-TRIGGER SCRIPT
 * 
 * This script watches for project activity and automatically runs
 * the universal header automation when needed.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutoTrigger {
  constructor() {
    this.projectRoot = process.cwd();
    this.isRunning = false;
    this.lastRun = 0;
    this.cooldown = 5000; // 5 second cooldown between runs
  }

  /**
   * Start the auto-trigger system
   */
  async start() {
    console.log('🔄 AUTO-TRIGGER SYSTEM STARTING');
    console.log('='.repeat(50));
    console.log('🎯 Watching for project activity...');
    console.log('📁 Project root:', this.projectRoot);
    console.log('='.repeat(50));

    try {
      // Run initial automation
      await this.runAutomation('Initial startup');
      
      // Watch for file changes that might indicate project activity
      this.watchProjectActivity();
      
      // Keep the process alive
      this.keepAlive();
      
    } catch (error) {
      console.error('❌ Auto-trigger failed to start:', error.message);
      throw error;
    }
  }

  /**
   * Watch for project activity
   */
  watchProjectActivity() {
    // Watch package.json for changes (indicates npm activity)
    const packagePath = path.join(this.projectRoot, 'package.json');
    
    if (fs.existsSync(packagePath)) {
      fs.watch(packagePath, (eventType, filename) => {
        if (eventType === 'change' && !this.isRunning) {
          this.runAutomation('Package.json change detected');
        }
      });
      console.log('👀 Watching package.json for changes...');
    }

    // Watch for new file creation (indicates project activity)
    fs.watch(this.projectRoot, { recursive: true }, (eventType, filename) => {
      if (eventType === 'newFile' && !this.isRunning) {
        this.runAutomation('New file detected');
      }
    });
    console.log('👀 Watching project directory for activity...');

    // Watch for terminal activity
    this.watchTerminalActivity();
  }

  /**
   * Watch for terminal activity
   */
  watchTerminalActivity() {
    // Check if we're in a Cursor AI environment
    if (process.env.CURSOR_AI || process.env.CURSOR_EDITOR === 'cursor') {
      console.log('🤖 Cursor AI environment detected');
      
      // Run automation periodically in Cursor AI
      setInterval(() => {
        if (!this.isRunning) {
          this.runAutomation('Periodic check in Cursor AI');
        }
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Run the automation
   */
  async runAutomation(reason) {
    const now = Date.now();
    
    // Check cooldown
    if (now - this.lastRun < this.cooldown) {
      console.log(`⏳ Cooldown active, skipping automation (${reason})`);
      return;
    }

    if (this.isRunning) {
      console.log('⏳ Automation already running, skipping');
      return;
    }

    this.isRunning = true;
    this.lastRun = now;

    console.log(`\n🚀 AUTO-TRIGGER ACTIVATED: ${reason}`);
    console.log('⏰ Time:', new Date().toLocaleString());

    try {
      const child = spawn('npm', ['run', 'cursor:auto'], {
        stdio: 'inherit',
        shell: true,
        cwd: this.projectRoot
      });

      child.on('close', (code) => {
        this.isRunning = false;
        if (code === 0) {
          console.log('✅ Auto-triggered automation completed successfully');
        } else {
          console.log(`⚠️ Auto-triggered automation completed with exit code ${code}`);
        }
      });

      child.on('error', (error) => {
        this.isRunning = false;
        console.error('❌ Auto-triggered automation failed:', error.message);
      });

    } catch (error) {
      this.isRunning = false;
      console.error('❌ Failed to start automation:', error.message);
    }
  }

  /**
   * Keep the process alive
   */
  keepAlive() {
    console.log('\n🔄 Auto-trigger system is now running...');
    console.log('💡 Press Ctrl+C to stop');
    
    // Keep the process alive
    process.stdin.resume();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down auto-trigger system...');
      process.exit(0);
    });
  }
}

// Auto-execute if this script is run directly
if (require.main === module) {
  const autoTrigger = new AutoTrigger();
  autoTrigger.start().catch(console.error);
}

module.exports = AutoTrigger;
