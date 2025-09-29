// scripts/start-dev.mjs
// Ultra-reliable development server startup script

import { execSync, spawn } from 'node:child_process';
import { killDevServer, cleanLockFiles } from './dev-manager.mjs';

console.log('🚀 Starting development server (ultra-reliable mode)...\n');

try {
  // Step 1: Clean environment
  console.log('1️⃣ Cleaning development environment...');
  killDevServer();
  cleanLockFiles();

  // Step 2: Build tokens (fast)
  console.log('2️⃣ Building design tokens...');
  execSync('npm run tokens:build', { stdio: 'inherit' });

  // Step 3: Start Next.js dev server
  console.log('3️⃣ Starting Next.js development server...');
  const devServer = spawn('npx', ['next', 'dev', '--port', '3000'], {
    stdio: 'inherit',
    shell: true
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    devServer.kill('SIGTERM');
    killDevServer();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    devServer.kill('SIGTERM');
    killDevServer();
    process.exit(0);
  });

  devServer.on('exit', (code) => {
    if (code !== 0) {
      console.log(`\n❌ Development server exited with code ${code}`);
      process.exit(code);
    }
  });

} catch (error) {
  console.error('❌ Failed to start development server:', error.message);
  process.exit(1);
}