#!/usr/bin/env node

/**
 * Smart Server Manager - Permanent fix for port conflicts
 * Automatically kills conflicting processes and starts fresh servers
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

class SmartServerManager {
  constructor() {
    this.defaultPort = 3000;
    this.backupPorts = [3001, 3002, 3003, 3004, 3005];
    this.isWindows = process.platform === 'win32';
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
      console.log(`✅ Port ${port} is already free`);
      return true;
    }

    console.log(`🔫 Killing process ${pid} on port ${port}...`);

    try {
      if (this.isWindows) {
        await execAsync(`taskkill /F /PID ${pid}`);
      } else {
        await execAsync(`kill -9 ${pid}`);
      }

      // Wait a moment for process to die
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify it's dead
      const stillRunning = await this.findProcessOnPort(port);
      if (stillRunning) {
        console.log(`⚠️ Process still running on port ${port}, trying again...`);
        if (this.isWindows) {
          // Nuclear option for Windows
          await execAsync(`wmic process where "CommandLine like '%node%' and CommandLine like '%${port}%'" delete`);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
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
    console.log('🧹 Cleaning up all development servers...');

    const ports = [this.defaultPort, ...this.backupPorts];
    const killPromises = ports.map(port => this.killProcessOnPort(port));
    await Promise.all(killPromises);

    // Also kill any processes that might be lingering
    if (this.isWindows) {
      const commands = [
        'wmic process where "name=\'node.exe\' and CommandLine like \'%next%\'" delete',
        'wmic process where "name=\'node.exe\' and CommandLine like \'%dev%\'" delete',
        'for /f "tokens=5" %a in (\'netstat -aon ^| findstr :3000\') do taskkill /f /pid %a',
        'for /f "tokens=5" %a in (\'netstat -aon ^| findstr :3001\') do taskkill /f /pid %a'
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
      await execAsync('pkill -f "node.*dev"').catch(() => {});
    }

    console.log('✅ All development servers cleaned up');
  }

  async startServer(command = 'npm run dev', port = null) {
    // Kill existing servers first
    await this.killAllDevServers();

    // Build design tokens first
    console.log('🔧 Building design tokens...');
    try {
      await execAsync('npm run tokens:build');
      console.log('✅ Design tokens built successfully');
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