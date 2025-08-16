#!/usr/bin/env node

/**
 * Automated date monitoring
 */

const cron = require('node-cron');
const { execSync } = require('child_process');

// Run date validation every hour
cron.schedule('0 * * * *', () => {
  console.log('🔍 MIT HERO: Running automated date validation...');
  
  try {
    execSync('node scripts/date-validation-system.js --auto', { 
      stdio: 'inherit' 
    });
    console.log('✅ Automated date validation completed');
  } catch (error) {
    console.error('❌ Automated date validation failed:', error.message);
  }
});

console.log('🕐 MIT HERO date monitoring started - running every hour');
