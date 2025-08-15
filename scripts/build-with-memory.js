#!/usr/bin/env node

/**
 * Windows-Compatible Build Script with Memory Management
 * Handles memory allocation for different build strategies
 */

const { spawn } = require('child_process');
const path = require('path');

const buildStrategies = {
  'build': { memory: 4096, flags: ['--debug'] },
  'build:fast': { memory: 4096, flags: ['--debug'] },
  'build:memory': { memory: 8192, flags: ['--debug'] },
  'build:minimal': { memory: 2048, flags: ['--debug'] }
};

function runBuild(buildType = 'build:fast') {
  const strategy = buildStrategies[buildType] || buildStrategies['build:fast'];
  
  console.log(`🚀 Starting ${buildType} with ${strategy.memory}MB memory allocation...`);
  console.log(`📊 Build flags: ${strategy.flags.join(' ')}`);
  
  // Set memory options for Windows
  process.env.NODE_OPTIONS = `--max-old-space-size=${strategy.memory}`;
  
  const build = spawn('next', ['build', ...strategy.flags], {
    stdio: 'inherit',
    shell: true,
    env: process.env
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
const buildType = args[0] || 'build:fast';

if (!buildStrategies[buildType]) {
  console.log('Available build strategies:');
  Object.keys(buildStrategies).forEach(key => {
    const strategy = buildStrategies[key];
    console.log(`  ${key}: ${strategy.memory}MB memory, flags: ${strategy.flags.join(' ')}`);
  });
  process.exit(1);
}

runBuild(buildType);
