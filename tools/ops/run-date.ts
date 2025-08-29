#!/usr/bin/env tsx

/**
 * Run Date Script
 * 
 * This script prints the current date and time in ISO format.
 * Used by future prompts to verify the current date.
 */

function main() {
  const now = new Date();
  const isoString = now.toISOString();
  
  console.log('=== RUN DATE INFORMATION ===');
  console.log(`ISO Date/Time: ${isoString}`);
  console.log(`Local Date/Time: ${now.toLocaleString()}`);
  console.log('============================');
  
  return isoString;
}

// Run if called directly
main();

export { main as runDate };
