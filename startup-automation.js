#!/usr/bin/env node

/**
 * 🚀 STARTUP AUTOMATION SCRIPT
 * 
 * This script ensures the universal header automation runs automatically
 * when the project is opened in Cursor AI.
 * 
 * Usage: 
 * - Run manually: node startup-automation.js
 * - Or integrate with your startup workflow
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class StartupAutomation {
  constructor() {
    this.projectRoot = process.cwd();
    this.startTime = Date.now();
  }

  /**
   * Main execution
   */
  async execute() {
    console.log('🚀 STARTUP AUTOMATION INITIATED');
    console.log('='.repeat(60));
    console.log('🎯 Running universal header automation...');
    console.log('⏰ Started at:', new Date().toLocaleString());
    console.log('='.repeat(60));
    
    try {
      // Check if we're in the right directory
      if (!this.isProjectDirectory()) {
        console.log('❌ Error: Not in project directory. Please run from project root.');
        return;
      }

      // Run the universal header automation
      console.log('\n🔍 Running universal header compliance check...');
      await this.runUniversalHeaderAutomation();
      
      // Display completion status
      const duration = Date.now() - this.startTime;
      console.log(`\n✅ STARTUP AUTOMATION COMPLETED in ${duration}ms`);
      console.log('🚀 Cursor AI is now ready with universal header compliance!');
      
    } catch (error) {
      const duration = Date.now() - this.startTime;
      console.error(`\n❌ Startup automation failed after ${duration}ms: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if we're in the project directory
   */
  isProjectDirectory() {
    const packagePath = path.join(this.projectRoot, 'package.json');
    return fs.existsSync(packagePath);
  }

  /**
   * Run the universal header automation
   */
  async runUniversalHeaderAutomation() {
    return new Promise((resolve, reject) => {
      const child = spawn('npm', ['run', 'cursor:auto'], {
        stdio: 'inherit',
        shell: true,
        cwd: this.projectRoot
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Universal header automation completed successfully');
          resolve();
        } else {
          reject(new Error(`Automation failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }
}

// Auto-execute if this script is run directly
if (require.main === module) {
  const automation = new StartupAutomation();
  automation.execute().catch(console.error);
}

module.exports = StartupAutomation;
