#!/usr/bin/env node

/**
 * Simple Build Script with Core Optimizations
 * Focuses on reliability and basic performance improvements
 */

const { spawn } = require('child_process');

function runBuild(buildType = 'build') {
  console.log(`🚀 Starting ${buildType} with optimizations...`);
  
  // Use standard Next.js build with debug flag for progress visibility
  const build = spawn('next', ['build', '--debug'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      // Basic memory optimization
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  });

  build.on('close', (code) => {
    if (code === 0) {
      console.log(`✅ ${buildType} completed successfully!`);
    } else {
      console.log(`❌ ${buildType} failed with exit code ${code}`);
      process.exit(code);
    }
  });

  build.on('error', (error) => {
    console.error(`💥 Build error: ${error.message}`);
    process.exit(1);
  });
}

// CLI interface
const args = process.argv.slice(2);
const buildType = args[0] || 'build';

runBuild(buildType);
