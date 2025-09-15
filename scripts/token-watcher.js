#!/usr/bin/env node

/**
 * Token Hot Reload Watcher
 * HT-021.3.1 - Design Token Pipeline Implementation
 * 
 * Watches token files for changes and automatically rebuilds
 * with hot reload capabilities for development
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import chokidar from 'chokidar';

class TokenWatcher {
  constructor() {
    this.isBuilding = false;
    this.buildQueue = new Set();
    this.debounceTimer = null;
    this.buildCount = 0;
  }

  start() {
    console.log('🔍 Starting token file watcher...\n');
    console.log('Watching for changes in:');
    console.log('  • tokens/**/*.json');
    console.log('  • style-dictionary.config.json\n');

    // Initial build
    this.rebuild('Initial build');

    // Watch token files
    const watcher = chokidar.watch([
      'tokens/**/*.json',
      'style-dictionary.config.json'
    ], {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: true
    });

    // File change handlers
    watcher
      .on('add', (filePath) => this.onFileChange('added', filePath))
      .on('change', (filePath) => this.onFileChange('changed', filePath))
      .on('unlink', (filePath) => this.onFileChange('removed', filePath))
      .on('error', (error) => console.log(`Watcher error: ${error}`))
      .on('ready', () => {
        console.log('✅ Watcher ready. Waiting for changes...\n');
      });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🔄 Stopping token watcher...');
      watcher.close().then(() => {
        console.log('✅ Token watcher stopped');
        process.exit(0);
      });
    });
  }

  onFileChange(event, filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`📝 File ${event}: ${relativePath}`);
    
    this.buildQueue.add(filePath);
    
    // Debounce rebuilds to avoid excessive builds
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.rebuild(`Files ${event}`);
      this.buildQueue.clear();
    }, 300);
  }

  async rebuild(reason) {
    if (this.isBuilding) {
      console.log('⏳ Build already in progress, queuing...');
      return;
    }

    this.isBuilding = true;
    this.buildCount++;
    
    const startTime = Date.now();
    console.log(`\n🔨 Rebuilding tokens (${reason}) - Build #${this.buildCount}`);

    try {
      // Run Style Dictionary build
      const buildProcess = spawn('npx', ['style-dictionary', 'build', '--config', 'style-dictionary.config.json'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let stdout = '';
      let stderr = '';

      buildProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      buildProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      await new Promise((resolve, reject) => {
        buildProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Build failed with code ${code}`));
          }
        });

        buildProcess.on('error', reject);
      });

      const duration = Date.now() - startTime;
      console.log(`✅ Tokens rebuilt successfully in ${duration}ms`);
      
      // Parse and display build results
      if (stdout.includes('✔︎')) {
        const files = stdout.match(/✔︎.*$/gm) || [];
        console.log(`📦 Generated files: ${files.length}`);
        files.forEach(file => {
          const cleanFile = file.replace('✔︎ ', '  → ');
          console.log(cleanFile);
        });
      }

      // Show warnings if any
      if (stdout.includes('Token collisions detected')) {
        console.log('⚠️  Token collisions detected - consider reviewing token names');
      }

      console.log(`\n⌚ Waiting for changes... (Build #${this.buildCount} complete)\n`);

    } catch (error) {
      console.error(`❌ Build failed: ${error.message}`);
      if (stderr) {
        console.error('Error details:', stderr);
      }
    } finally {
      this.isBuilding = false;
    }
  }
}

// Check if style-dictionary is available
try {
  await import('style-dictionary');
} catch (error) {
  console.error('❌ style-dictionary not found. Please install it:');
  console.error('npm install --save-dev style-dictionary');
  process.exit(1);
}

// Check if chokidar is available
try {
  await import('chokidar');
} catch (error) {
  console.error('❌ chokidar not found. Installing...');
  
  const installProcess = spawn('npm', ['install', '--save-dev', 'chokidar'], {
    stdio: 'inherit',
    shell: true
  });

  installProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ chokidar installed successfully');
      startWatcher();
    } else {
      console.error('❌ Failed to install chokidar');
      process.exit(1);
    }
  });
}

function startWatcher() {
  const watcher = new TokenWatcher();
  watcher.start();
}

// Only start if chokidar is already available
try {
  await import('chokidar');
  startWatcher();
} catch (error) {
  // Installation will handle this
}