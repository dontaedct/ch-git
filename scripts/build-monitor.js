#!/usr/bin/env node

/**
 * Build Performance Monitor
 * Tracks build times and memory usage to identify performance improvements
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class BuildMonitor {
  constructor() {
    this.startTime = Date.now();
    this.memoryUsage = process.memoryUsage();
    this.logFile = path.join(__dirname, '..', '.build-metrics.json');
  }

  log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
      external: Math.round(usage.external / 1024 / 1024) + 'MB'
    };
  }

  async runBuild(buildType = 'build:fast') {
    this.log(`🚀 Starting ${buildType} with performance monitoring...`);
    this.log(`📊 Initial memory: ${JSON.stringify(this.getMemoryUsage())}`);

    return new Promise((resolve, reject) => {
      const build = spawn('npm', ['run', buildType], {
        stdio: 'pipe',
        shell: true
      });

      let output = '';
      let errorOutput = '';

      build.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        // Show progress indicators
        if (text.includes('Creating an optimized production build')) {
          this.log('📦 Build started...');
        } else if (text.includes('Compiled successfully')) {
          this.log('✅ Build compiled successfully');
        } else if (text.includes('Generating static pages')) {
          this.log('🌐 Generating static pages...');
        }
      });

      build.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      build.on('close', (code) => {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        const finalMemory = this.getMemoryUsage();

        const metrics = {
          buildType,
          startTime: new Date(this.startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          duration: `${duration}ms`,
          durationMs: duration,
          initialMemory: this.memoryUsage,
          finalMemory,
          exitCode: code,
          success: code === 0,
          outputLength: output.length,
          errorLength: errorOutput.length
        };

        this.log(`🏁 Build completed in ${duration}ms`);
        this.log(`📊 Final memory: ${JSON.stringify(finalMemory)}`);
        this.log(`🔍 Exit code: ${code} ${code === 0 ? '✅' : '❌'}`);

        // Save metrics
        this.saveMetrics(metrics);

        if (code === 0) {
          this.log('🎉 Build successful! Performance metrics saved.');
          resolve(metrics);
        } else {
          this.log('💥 Build failed! Check error output above.');
          reject(new Error(`Build failed with exit code ${code}`));
        }
      });

      build.on('error', (error) => {
        this.log(`💥 Build error: ${error.message}`);
        reject(error);
      });
    });
  }

  saveMetrics(metrics) {
    try {
      let existingMetrics = [];
      if (fs.existsSync(this.logFile)) {
        const content = fs.readFileSync(this.logFile, 'utf8');
        existingMetrics = JSON.parse(content);
      }

      // Keep only last 10 builds
      existingMetrics.push(metrics);
      if (existingMetrics.length > 10) {
        existingMetrics = existingMetrics.slice(-10);
      }

      fs.writeFileSync(this.logFile, JSON.stringify(existingMetrics, null, 2));
      this.log(`📊 Metrics saved to ${this.logFile}`);
    } catch (error) {
      this.log(`⚠️ Could not save metrics: ${error.message}`);
    }
  }

  showHistory() {
    try {
      if (fs.existsSync(this.logFile)) {
        const content = fs.readFileSync(this.logFile, 'utf8');
        const metrics = JSON.parse(content);
        
        this.log('📈 Build Performance History:');
        metrics.forEach((metric, index) => {
          const status = metric.success ? '✅' : '❌';
          this.log(`${index + 1}. ${status} ${metric.buildType} - ${metric.duration} (${metric.exitCode})`);
        });
      } else {
        this.log('📊 No build history found. Run a build first.');
      }
    } catch (error) {
      this.log(`⚠️ Could not read metrics: ${error.message}`);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const monitor = new BuildMonitor();

  if (args.includes('--history') || args.includes('-h')) {
    monitor.showHistory();
    return;
  }

  const buildType = args[0] || 'build:fast';
  
  try {
    await monitor.runBuild(buildType);
  } catch (error) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = BuildMonitor;
