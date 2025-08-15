#!/usr/bin/env node

/**
 * 🎯 UNI AUTOMATION SCRIPT
 * 
 * This script detects "uni" at the top of messages and automatically
 * runs universal header compliance before executing prompts.
 * 
 * Usage: 
 * - Start with "uni" in your message to trigger automation
 * - The script will run universal header compliance first
 * - Then proceed with your actual prompt
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class UniAutomation {
  constructor() {
    this.projectRoot = process.cwd();
    this.startTime = Date.now();
    this.isRunning = false;
  }

  /**
   * Main execution - detects "uni" and runs automation
   */
  async execute(message) {
    // Check if message starts with "uni"
    if (!this.isUniMessage(message)) {
      console.log('ℹ️ Message does not start with "uni" - proceeding normally');
      return false;
    }

    console.log('🎯 UNI AUTOMATION DETECTED!');
    console.log('='.repeat(60));
    console.log('🚀 Running universal header compliance first...');
    console.log('⏰ Started at:', new Date().toLocaleString());
    console.log('='.repeat(60));

    try {
      // Extract the actual prompt (remove "uni" prefix)
      const actualPrompt = this.extractActualPrompt(message);
      
      // Run universal header compliance
      await this.runUniversalHeaderCompliance();
      
      // Display the actual prompt that will be processed
      console.log('\n📝 ACTUAL PROMPT TO BE PROCESSED:');
      console.log('─'.repeat(50));
      console.log(actualPrompt);
      console.log('─'.repeat(50));
      console.log('✅ Universal header compliance completed - proceeding with prompt');
      
      return true;
      
    } catch (error) {
      const duration = Date.now() - this.startTime;
      console.error(`\n❌ UNI automation failed after ${duration}ms: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if message starts with "uni"
   */
  isUniMessage(message) {
    if (!message || typeof message !== 'string') return false;
    
    const trimmedMessage = message.trim();
    return trimmedMessage.toLowerCase().startsWith('uni');
  }

  /**
   * Extract the actual prompt (remove "uni" prefix)
   */
  extractActualPrompt(message) {
    const trimmedMessage = message.trim();
    
    // Remove "uni" prefix (case insensitive)
    if (trimmedMessage.toLowerCase().startsWith('uni')) {
      // Find where "uni" ends and extract the rest
      const uniEndIndex = trimmedMessage.toLowerCase().indexOf('uni') + 3;
      const afterUni = trimmedMessage.substring(uniEndIndex).trim();
      
      // If there's more content after "uni", return it
      if (afterUni) {
        return afterUni;
      }
    }
    
    // If no additional content, return a default message
    return '[Your prompt content here]';
  }

  /**
   * Run universal header compliance
   */
  async runUniversalHeaderCompliance() {
    if (this.isRunning) {
      console.log('⏳ Universal header compliance already running, skipping');
      return;
    }

    this.isRunning = true;

    return new Promise((resolve, reject) => {
      console.log('\n🔍 Running universal header compliance check...');
      
      const child = spawn('npm', ['run', 'cursor:auto'], {
        stdio: 'inherit',
        shell: true,
        cwd: this.projectRoot
      });

      child.on('close', (code) => {
        this.isRunning = false;
        if (code === 0) {
          console.log('✅ Universal header compliance completed successfully');
          resolve();
        } else {
          reject(new Error(`Universal header compliance failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        this.isRunning = false;
        reject(error);
      });
    });
  }

  /**
   * Get automation status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      projectRoot: this.projectRoot,
      startTime: this.startTime
    };
  }
}

// Auto-execute if this script is run directly
if (require.main === module) {
  const automation = new UniAutomation();
  
  // Get message from command line arguments
  const message = process.argv.slice(2).join(' ');
  
  if (message) {
    automation.execute(message).catch(console.error);
  } else {
    console.log('🎯 UNI AUTOMATION READY');
    console.log('='.repeat(40));
    console.log('Usage: node uni-automation.js "uni your message here"');
    console.log('Or start your message with "uni" to trigger automation');
    console.log('='.repeat(40));
  }
}

module.exports = UniAutomation;
