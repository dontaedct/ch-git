#!/usr/bin/env node

/**
 * Fast Development Server - Optimized for speed
 * Skips token building and uses direct Next.js startup
 */

import { spawn } from 'child_process';
import { exec } from 'child_process';
import { promisify } from 'util';

// Load development optimizations
import '../dev.config.js';

const execAsync = promisify(exec);

class FastDevServer {
  constructor() {
    this.defaultPort = 3000;
    this.isWindows = process.platform === 'win32';
  }

  async killProcessOnPort(port) {
    try {
      if (this.isWindows) {
        const { stdout } = await execAsync(`netstat -aon | findstr :${port}`);
        const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
        if (lines.length > 0) {
          const pid = lines[0].trim().split(/\s+/).pop();
          if (pid && pid !== '0' && /^\d+$/.test(pid)) {
            console.log(`🔫 Killing process ${pid} on port ${port}...`);
            await execAsync(`taskkill /F /PID ${pid}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } else {
        const { stdout } = await execAsync(`lsof -ti:${port}`);
        if (stdout.trim()) {
          console.log(`🔫 Killing process on port ${port}...`);
          await execAsync(`kill -9 ${stdout.trim()}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      // Port is free or no process found
    }
  }

  async startServer() {
    console.log('🚀 Starting Fast Development Server...');
    
    // Quick port cleanup
    await this.killProcessOnPort(this.defaultPort);
    
    console.log('⚡ Starting Next.js (skipping token build)...');
    
    const serverProcess = spawn('npx', ['next', 'dev', '--port', this.defaultPort.toString()], {
      stdio: 'inherit',
      shell: true,
      env: { 
        ...process.env, 
        PORT: this.defaultPort,
        // Skip token building
        SKIP_TOKENS: 'true'
      }
    });

    // Handle server process events
    serverProcess.on('error', (error) => {
      console.error(`❌ Server error: ${error.message}`);
    });

    serverProcess.on('close', (code) => {
      console.log(`🔚 Server exited with code ${code}`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down server gracefully...');
      serverProcess.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Terminating server...');
      serverProcess.kill('SIGTERM');
      process.exit(0);
    });

    return { process: serverProcess, port: this.defaultPort };
  }
}

// CLI usage
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const server = new FastDevServer();
  
  server.startServer().then(({ port }) => {
    console.log(`🎉 Fast development server started on port ${port}`);
    console.log(`🌐 Open http://localhost:${port} in your browser`);
  }).catch((error) => {
    console.error(`💥 Failed to start server: ${error.message}`);
    process.exit(1);
  });
}

export default FastDevServer;
