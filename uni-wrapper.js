#!/usr/bin/env node

/**
 * 🎯 UNI WRAPPER SCRIPT
 * 
 * This script provides a simple interface for the UNI automation.
 * It can be used directly in Cursor AI to trigger universal header compliance.
 * 
 * Usage Examples:
 * - node uni-wrapper.js "uni help me with this code"
 * - node uni-wrapper.js "uni create a new component"
 * - node uni-wrapper.js "uni fix this bug"
 */

const UniAutomation = require('./uni-automation');

class UniWrapper {
  constructor() {
    this.automation = new UniAutomation();
  }

  /**
   * Process a message and run UNI automation if needed
   */
  async processMessage(message) {
    if (!message || typeof message !== 'string') {
      console.log('❌ No message provided');
      return false;
    }

    const trimmedMessage = message.trim();
    
    // Check if message starts with "uni"
    if (trimmedMessage.toLowerCase().startsWith('uni')) {
      console.log('🎯 UNI AUTOMATION TRIGGERED!');
      console.log('='.repeat(60));
      
      try {
        // Run the UNI automation
        const result = await this.automation.execute(message);
        
        if (result) {
          console.log('\n🚀 READY TO PROCEED WITH YOUR PROMPT!');
          console.log('✅ Universal header compliance is active');
          console.log('🎯 Your prompt will now be processed with full compliance');
        }
        
        return result;
        
      } catch (error) {
        console.error('❌ UNI automation failed:', error.message);
        return false;
      }
    } else {
      console.log('ℹ️ Message does not start with "uni" - no automation triggered');
      console.log('💡 To trigger automation, start your message with "uni"');
      return false;
    }
  }

  /**
   * Get automation status
   */
  getStatus() {
    return this.automation.getStatus();
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log('🎯 UNI AUTOMATION HELP');
    console.log('='.repeat(40));
    console.log('Usage: Start your message with "uni" to trigger automation');
    console.log('');
    console.log('Examples:');
    console.log('  uni help me with this code');
    console.log('  uni create a new component');
    console.log('  uni fix this bug');
    console.log('  uni optimize this function');
    console.log('');
    console.log('What happens:');
    console.log('  1. Universal header compliance runs automatically');
    console.log('  2. System integration is verified');
    console.log('  3. Your prompt is processed with full compliance');
    console.log('='.repeat(40));
  }
}

// Auto-execute if this script is run directly
if (require.main === module) {
  const wrapper = new UniWrapper();
  
  // Get message from command line arguments
  const message = process.argv.slice(2).join(' ');
  
  if (message) {
    wrapper.processMessage(message).catch(console.error);
  } else {
    wrapper.showHelp();
  }
}

module.exports = UniWrapper;
