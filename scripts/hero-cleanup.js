#!/usr/bin/env node

/**
 * 🧹 HERO CLEANUP - Remove Redundant Hero Systems
 * 
 * This script removes old, redundant hero systems and consolidates everything
 * into the unified orchestrator for a clean, efficient project.
 * 
 * Follows universal header rules completely
 */

const fs = require('fs');
const path = require('path');

// Files to remove (redundant hero systems)
const FILES_TO_REMOVE = [
  'hero-ultimate.js',           // Replaced by hero-ultimate-optimized.js
  'hero-ultimate-simple.js',    // Replaced by unified orchestrator
  'hero-ultimate-task.ps1',     // Replaced by unified orchestrator
  'hero-ultimate-service.ps1',  // Replaced by unified orchestrator
  'hero-ultimate.ps1',          // Replaced by unified orchestrator
  'hero-threat-response.js',    // Consolidated into unified orchestrator
  'hero-threat-response-simple.js', // Consolidated into unified orchestrator
  'hero-intelligence.js',       // Consolidated into unified orchestrator
  'hero-orchestrator.js',       // Consolidated into unified orchestrator
  'hero-system.js',             // Consolidated into unified orchestrator
  'hero-system.ps1',            // Consolidated into unified orchestrator
  'automation-master.js',       // Consolidated into unified orchestrator
  'task-orchestrator.js',       // Consolidated into unified orchestrator
  'task-orchestrator.ps1'       // Consolidated into unified orchestrator
];

// Files to keep (optimized and unified systems)
const FILES_TO_KEEP = [
  'hero-ultimate-optimized.js',
  'hero-unified-orchestrator.js',
  'guardian.js',
  'doctor.ts',
  'smart-lint.js',
  'git-guardian.js',
  'cursor-ai-auto-start.js',
  'cursor-ai-universal-header.js'
];

async function cleanupHeroSystems() {
  console.log('🧹 HERO CLEANUP - Removing Redundant Hero Systems');
  console.log('='.repeat(60));
  
  const scriptsDir = path.join(process.cwd(), 'scripts');
  let removedCount = 0;
  let errorCount = 0;
  
  for (const file of FILES_TO_REMOVE) {
    const filePath = path.join(scriptsDir, file);
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Removed: ${file}`);
        removedCount++;
      } else {
        console.log(`⚠️  Not found: ${file}`);
      }
    } catch (error) {
      console.error(`❌ Error removing ${file}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n📊 Cleanup Summary:');
  console.log(`  Files removed: ${removedCount}`);
  console.log(`  Errors: ${errorCount}`);
  console.log(`  Files kept: ${FILES_TO_KEEP.length}`);
  
  console.log('\n🎯 Next Steps:');
  console.log('  1. Use "npm run hero:unified" for the main system');
  console.log('  2. Use "npm run hero:ultimate:optimized" for optimized version');
  console.log('  3. All old hero systems have been consolidated');
  
  console.log('\n✅ Hero cleanup completed!');
}

// Run cleanup
if (require.main === module) {
  cleanupHeroSystems().catch(console.error);
}

module.exports = { cleanupHeroSystems };
