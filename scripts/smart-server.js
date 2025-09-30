#!/usr/bin/env node

/**
 * Smart Server Manager - Permanent fix for port conflicts
 * Automatically kills conflicting processes and starts fresh servers
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
const execAsync = promisify(exec);

class SmartServerManager {
  constructor() {
    this.defaultPort = 3000;
    this.backupPorts = [3001, 3002, 3003, 3004, 3005];
    this.isWindows = process.platform === 'win32';
    
    // Development optimizations
    process.env.NEXT_TELEMETRY_DISABLED = '1';
    process.env.FAST_REFRESH = 'true';
  }

  async findProcessOnPort(port) {
    try {
      if (this.isWindows) {
        const { stdout } = await execAsync(`netstat -aon | findstr :${port}`);
        const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
        if (lines.length > 0) {
          const pid = lines[0].trim().split(/\s+/).pop();
          return pid;
        }
      } else {
        const { stdout } = await execAsync(`lsof -ti:${port}`);
        return stdout.trim();
      }
    } catch (error) {
      // No process found on port
      return null;
    }
    return null;
  }

  async killProcessOnPort(port) {
    const pid = await this.findProcessOnPort(port);
    if (!pid) {
      return true; // Port is free, no need to log
    }

    console.log(`🔫 Killing process ${pid} on port ${port}...`);

    try {
      if (this.isWindows) {
        await execAsync(`taskkill /F /PID ${pid}`);
      } else {
        await execAsync(`kill -9 ${pid}`);
      }

      // Reduced wait time for faster startup
      await new Promise(resolve => setTimeout(resolve, 500));

      // Quick verification
      const stillRunning = await this.findProcessOnPort(port);
      if (stillRunning) {
        console.log(`⚠️ Process still running on port ${port}, trying nuclear option...`);
        if (this.isWindows) {
          await execAsync(`wmic process where "CommandLine like '%node%' and CommandLine like '%${port}%'" delete`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`✅ Successfully freed port ${port}`);
      return true;
    } catch (error) {
      console.log(`❌ Failed to kill process on port ${port}: ${error.message}`);
      return false;
    }
  }

  async findAvailablePort() {
    // First try to free the default port
    await this.killProcessOnPort(this.defaultPort);

    const testPort = await this.findProcessOnPort(this.defaultPort);
    if (!testPort) {
      return this.defaultPort;
    }

    // If default port still occupied, try backup ports
    for (const port of this.backupPorts) {
      const processOnPort = await this.findProcessOnPort(port);
      if (!processOnPort) {
        return port;
      }
    }

    // Nuclear option: kill all node processes and use default port
    console.log('🔥 Nuclear option: killing all node processes...');
    if (this.isWindows) {
      await execAsync('taskkill /F /IM node.exe').catch(() => {});
    } else {
      await execAsync('pkill -f node').catch(() => {});
    }

    await new Promise(resolve => setTimeout(resolve, 3000));
    return this.defaultPort;
  }

  async killAllDevServers() {
    console.log('🧹 Cleaning up development servers...');

    // Only kill processes on the default port first, then check others if needed
    await this.killProcessOnPort(this.defaultPort);
    
    // Quick check if we need to clean other ports
    const otherPorts = this.backupPorts.slice(0, 2); // Only check first 2 backup ports
    const killPromises = otherPorts.map(port => this.killProcessOnPort(port));
    await Promise.all(killPromises);

    // Light cleanup of lingering processes (reduced commands)
    if (this.isWindows) {
      const commands = [
        'wmic process where "name=\'node.exe\' and CommandLine like \'%next%\'" delete'
      ];

      for (const cmd of commands) {
        try {
          await execAsync(cmd);
        } catch (error) {
          // Ignore errors - processes might not exist
        }
      }
    } else {
      await execAsync('pkill -f "next.*dev"').catch(() => {});
    }

    console.log('✅ Development servers cleaned up');
  }

  shouldRebuildTokens(sourceDir, outputDir) {
    try {
      // If output directory doesn't exist, we need to build
      if (!fs.existsSync(outputDir)) {
        return true;
      }

      // Get the most recent modification time of source files
      const getLatestSourceTime = (dir) => {
        let latestTime = 0;
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir, { withFileTypes: true });
          for (const file of files) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
              latestTime = Math.max(latestTime, getLatestSourceTime(fullPath));
            } else if (file.name.endsWith('.json')) {
              const stat = fs.statSync(fullPath);
              latestTime = Math.max(latestTime, stat.mtime.getTime());
            }
          }
        }
        return latestTime;
      };

      // Get the oldest modification time of output files
      const getOldestOutputTime = (dir) => {
        let oldestTime = Infinity;
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir, { withFileTypes: true });
          for (const file of files) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
              oldestTime = Math.min(oldestTime, getOldestOutputTime(fullPath));
            } else {
              const stat = fs.statSync(fullPath);
              oldestTime = Math.min(oldestTime, stat.mtime.getTime());
            }
          }
        }
        return oldestTime === Infinity ? 0 : oldestTime;
      };

      const sourceTime = getLatestSourceTime(sourceDir);
      const outputTime = getOldestOutputTime(outputDir);

      // Rebuild if source files are newer than output files
      return sourceTime > outputTime;
    } catch (error) {
      // If we can't check, err on the side of caution and rebuild
      return true;
    }
  }

  async startServer(command = 'npm run dev', port = null) {
    // Kill existing servers first
    await this.killAllDevServers();

    // Build design tokens with caching
    console.log('🔧 Building design tokens...');
    try {
      // Check if tokens need rebuilding (only if source files changed)
      const tokenSourceDir = 'tokens';
      const tokenOutputDir = 'dist/tokens';
      
      if (this.shouldRebuildTokens(tokenSourceDir, tokenOutputDir)) {
        // Use parallel processing for faster token building
        await execAsync('npm run tokens:build -- --parallel');
        console.log('✅ Design tokens built successfully');
      } else {
        console.log('✅ Design tokens are up to date, skipping build');
      }
    } catch (error) {
      console.log('⚠️ Token build failed, continuing anyway:', error.message);
    }

    // Find available port if not specified
    const targetPort = port || await this.findAvailablePort();

    console.log(`🚀 Starting server on port ${targetPort}...`);

    // Modify command to use the target port if it's not the default
    let finalCommand = command;
    if (targetPort !== this.defaultPort && !command.includes('--port')) {
      if (command.includes('next dev')) {
        finalCommand = command.replace('next dev', `next dev --port ${targetPort}`);
      } else if (command === 'npm run dev') {
        finalCommand = `npx next dev --port ${targetPort}`;
      }
    }

    console.log(`📡 Running: ${finalCommand}`);

    // Start the server - use Next.js directly to avoid infinite loop
    let serverProcess;
    if (finalCommand.includes('npm run dev') || finalCommand === 'npm run dev') {
      // Use Next.js directly instead of calling npm run dev (which would loop)
      serverProcess = spawn('npx', ['next', 'dev', '--port', targetPort.toString()], {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, PORT: targetPort }
      });
    } else {
      serverProcess = spawn(finalCommand.split(' ')[0], finalCommand.split(' ').slice(1), {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, PORT: targetPort }
      });
    }

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
      await this.killAllDevServers();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Terminating server...');
      serverProcess.kill('SIGTERM');
      await this.killAllDevServers();
      process.exit(0);
    });

    return { process: serverProcess, port: targetPort };
  }
}

// CLI usage
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const manager = new SmartServerManager();

  const args = process.argv.slice(2);
  const command = args.join(' ') || 'npm run dev';

  if (command === 'kill') {
    manager.killAllDevServers().then(() => {
      console.log('✅ All servers killed');
      process.exit(0);
    });
  } else if (command === 'clean') {
    manager.killAllDevServers().then(() => {
      console.log('✅ All servers cleaned');
      process.exit(0);
    });
  } else {
    manager.startServer(command).then(({ port }) => {
      console.log(`🎉 Server successfully started on port ${port}`);
      console.log(`🌐 Open http://localhost:${port} in your browser`);
    }).catch((error) => {
      console.error(`💥 Failed to start server: ${error.message}`);
      process.exit(1);
    });
  }
}

export default SmartServerManager;