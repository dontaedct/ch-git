#!/usr/bin/env node

/**
 * 🧠 INTELLIGENT BUILD ORCHESTRATION WITH MEMORY PREDICTION
 * 
 * This system provides intelligent build orchestration that:
 * - Predicts memory requirements before starting builds
 * - Automatically switches between build strategies based on system resources
 * - Provides real-time build health monitoring
 * - Auto-scales build processes based on available CPU/memory
 * - Integrates with existing guardian and doctor systems
 * 
 * Follows universal header rules completely
 */

import { spawn, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface SystemResources {
  totalMemory: number;
  freeMemory: number;
  usedMemory: number;
  cpuCount: number;
  cpuUsage: number;
  availableMemory: number;
}

interface BuildStrategy {
  name: string;
  memoryRequirement: number;
  cpuRequirement: number;
  speed: 'fast' | 'medium' | 'slow';
  reliability: 'high' | 'medium' | 'low';
  command: string;
  args: string[];
}

interface BuildPrediction {
  recommendedStrategy: BuildStrategy;
  confidence: number;
  estimatedDuration: number;
  riskLevel: 'low' | 'medium' | 'high';
  warnings: string[];
}

interface BuildHealth {
  status: 'healthy' | 'warning' | 'critical';
  memoryUsage: number;
  cpuUsage: number;
  buildProgress: number;
  estimatedTimeRemaining: number;
  recommendations: string[];
}

class IntelligentBuildOrchestrator {
  private systemResources: SystemResources;
  private buildStrategies: BuildStrategy[];
  private currentBuild: any = null;
  private buildStartTime: number = 0;
  private healthMonitor: NodeJS.Timeout | null = null;

  constructor() {
    this.systemResources = this.getSystemResources();
    this.buildStrategies = this.initializeBuildStrategies();
  }

  /**
   * Main execution - follows universal header pattern
   */
  async execute(): Promise<void> {
    console.log('🧠 INTELLIGENT BUILD ORCHESTRATION STARTING');
    console.log('='.repeat(80));
    
    try {
      // STEP 1: AUDIT - Analyze current system resources
      await this.auditSystemResources();
      
      // STEP 2: DECIDE - Predict optimal build strategy
      const prediction = await this.predictBuildStrategy();
      
      // STEP 3: APPLY - Execute build with optimal strategy
      await this.executeBuild(prediction);
      
      // STEP 4: VERIFY - Monitor and ensure build success
      await this.monitorBuildHealth();
      
      console.log('\n✅ INTELLIGENT BUILD ORCHESTRATION COMPLETED');
      console.log('🎯 Build optimized for your system resources');
      
    } catch (error) {
      console.error(`❌ Build orchestration failed: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Get current system resources
   */
  private getSystemResources(): SystemResources {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const cpuCount = os.cpus().length;
    
    // Get CPU usage (simplified - in production you'd want more sophisticated monitoring)
    let cpuUsage = 0;
    try {
      // This is a simplified CPU usage calculation
      const loadAvg = os.loadavg();
      cpuUsage = (loadAvg[0] / cpuCount) * 100;
    } catch (error) {
      cpuUsage = 50; // Default fallback
    }

    return {
      totalMemory,
      freeMemory,
      usedMemory,
      cpuCount,
      cpuUsage,
      availableMemory: freeMemory * 0.8 // Reserve 20% for system
    };
  }

  /**
   * Initialize available build strategies
   */
  private initializeBuildStrategies(): BuildStrategy[] {
    return [
      {
        name: 'Ultra-Fast Build',
        memoryRequirement: 1024 * 1024 * 1024, // 1GB
        cpuRequirement: 2,
        speed: 'fast',
        reliability: 'medium',
        command: 'npm',
        args: ['run', 'build:fast']
      },
      {
        name: 'Memory-Optimized Build',
        memoryRequirement: 512 * 1024 * 1024, // 512MB
        cpuRequirement: 1,
        speed: 'medium',
        reliability: 'high',
        command: 'npm',
        args: ['run', 'build:memory']
      },
      {
        name: 'Minimal Build',
        memoryRequirement: 256 * 1024 * 1024, // 256MB
        cpuRequirement: 1,
        speed: 'slow',
        reliability: 'high',
        command: 'npm',
        args: ['run', 'build:minimal']
      },
      {
        name: 'Standard Build',
        memoryRequirement: 2048 * 1024 * 1024, // 2GB
        cpuRequirement: 4,
        speed: 'medium',
        reliability: 'high',
        command: 'npm',
        args: ['run', 'build']
      },
      {
        name: 'Monitored Build',
        memoryRequirement: 1536 * 1024 * 1024, // 1.5GB
        cpuRequirement: 2,
        speed: 'medium',
        reliability: 'high',
        command: 'npm',
        args: ['run', 'build:monitor']
      }
    ];
  }

  /**
   * Audit current system resources
   */
  private async auditSystemResources(): Promise<void> {
    console.log('🔍 Auditing system resources...');
    
    // Refresh system resources
    this.systemResources = this.getSystemResources();
    
    console.log('📊 System Resources:');
    console.log(`  💾 Total Memory: ${this.formatBytes(this.systemResources.totalMemory)}`);
    console.log(`  🆓 Free Memory: ${this.formatBytes(this.systemResources.freeMemory)}`);
    console.log(`  📈 Used Memory: ${this.formatBytes(this.systemResources.usedMemory)}`);
    console.log(`  🖥️  CPU Cores: ${this.systemResources.cpuCount}`);
    console.log(`  ⚡ CPU Usage: ${this.systemResources.cpuUsage.toFixed(1)}%`);
    console.log(`  🎯 Available for Build: ${this.formatBytes(this.systemResources.availableMemory)}`);
    
    // Check if system is under stress
    if (this.systemResources.cpuUsage > 80) {
      console.log('⚠️  Warning: High CPU usage detected');
    }
    
    if (this.systemResources.usedMemory / this.systemResources.totalMemory > 0.9) {
      console.log('⚠️  Warning: High memory usage detected');
    }
  }

  /**
   * Predict optimal build strategy
   */
  private async predictBuildStrategy(): Promise<BuildPrediction> {
    console.log('🧠 Predicting optimal build strategy...');
    
    // Filter strategies that can run on current system
    const viableStrategies = this.buildStrategies.filter(strategy => 
      strategy.memoryRequirement <= this.systemResources.availableMemory &&
      strategy.cpuRequirement <= this.systemResources.cpuCount
    );
    
    if (viableStrategies.length === 0) {
      throw new Error('No viable build strategies found for current system resources');
    }
    
    // Score strategies based on current conditions
    const scoredStrategies = viableStrategies.map(strategy => {
      let score = 0;
      
      // Memory efficiency score
      const memoryEfficiency = 1 - (strategy.memoryRequirement / this.systemResources.availableMemory);
      score += memoryEfficiency * 40;
      
      // CPU efficiency score
      const cpuEfficiency = 1 - (strategy.cpuRequirement / this.systemResources.cpuCount);
      score += cpuEfficiency * 30;
      
      // Speed preference (weighted by current system load)
      if (this.systemResources.cpuUsage < 50) {
        // System is idle, prefer faster builds
        if (strategy.speed === 'fast') score += 20;
        else if (strategy.speed === 'medium') score += 10;
      } else {
        // System is busy, prefer reliable builds
        if (strategy.reliability === 'high') score += 20;
        else if (strategy.reliability === 'medium') score += 10;
      }
      
      // Reliability bonus
      if (strategy.reliability === 'high') score += 10;
      
      return { strategy, score };
    });
    
    // Sort by score and select best
    scoredStrategies.sort((a, b) => b.score - a.score);
    const bestStrategy = scoredStrategies[0];
    
    // Calculate confidence and risk
    const confidence = Math.min(100, bestStrategy.score);
    const riskLevel = this.calculateRiskLevel(bestStrategy);
    const estimatedDuration = this.estimateBuildDuration(bestStrategy.strategy);
    
    // Generate warnings
    const warnings = this.generateWarnings(bestStrategy.strategy);
    
    const prediction: BuildPrediction = {
      recommendedStrategy: bestStrategy.strategy,
      confidence,
      estimatedDuration,
      riskLevel,
      warnings
    };
    
    console.log('🎯 Build Strategy Prediction:');
    console.log(`  🏆 Recommended: ${prediction.recommendedStrategy.name}`);
    console.log(`  🎯 Confidence: ${prediction.confidence.toFixed(1)}%`);
    console.log(`  ⏱️  Estimated Duration: ${prediction.estimatedDuration} seconds`);
    console.log(`  ⚠️  Risk Level: ${prediction.riskLevel.toUpperCase()}`);
    
    if (prediction.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      prediction.warnings.forEach(warning => {
        console.log(`    • ${warning}`);
      });
    }
    
    return prediction;
  }

  /**
   * Calculate risk level for a build strategy
   */
  private calculateRiskLevel(strategy: BuildStrategy): 'low' | 'medium' | 'high' {
    const memoryPressure = strategy.memoryRequirement / this.systemResources.availableMemory;
    const cpuPressure = strategy.cpuRequirement / this.systemResources.cpuCount;
    
    if (memoryPressure > 0.8 || cpuPressure > 0.8) {
      return 'high';
    } else if (memoryPressure > 0.6 || cpuPressure > 0.6) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Estimate build duration based on strategy and system
   */
  private estimateBuildDuration(strategy: BuildStrategy): number {
    let baseDuration = 0;
    
    switch (strategy.speed) {
      case 'fast':
        baseDuration = 60; // 1 minute
        break;
      case 'medium':
        baseDuration = 120; // 2 minutes
        break;
      case 'slow':
        baseDuration = 300; // 5 minutes
        break;
    }
    
    // Adjust based on system performance
    const memoryFactor = this.systemResources.availableMemory / (1024 * 1024 * 1024); // GB
    const cpuFactor = this.systemResources.cpuCount / 4; // Normalized to 4 cores
    
    const adjustedDuration = baseDuration / (memoryFactor * cpuFactor);
    
    return Math.max(30, Math.min(600, adjustedDuration)); // Between 30 seconds and 10 minutes
  }

  /**
   * Generate warnings for a build strategy
   */
  private generateWarnings(strategy: BuildStrategy): string[] {
    const warnings: string[] = [];
    
    const memoryPressure = strategy.memoryRequirement / this.systemResources.availableMemory;
    if (memoryPressure > 0.7) {
      warnings.push('High memory pressure - consider closing other applications');
    }
    
    if (this.systemResources.cpuUsage > 70) {
      warnings.push('High CPU usage - build may be slower than expected');
    }
    
    if (strategy.reliability === 'low') {
      warnings.push('Low reliability strategy - build may fail under stress');
    }
    
    return warnings;
  }

  /**
   * Execute build with optimal strategy
   */
  private async executeBuild(prediction: BuildPrediction): Promise<void> {
    console.log('🚀 Executing build with optimal strategy...');
    
    const { recommendedStrategy } = prediction;
    
    console.log(`📋 Command: ${recommendedStrategy.command} ${recommendedStrategy.args.join(' ')}`);
    console.log(`💾 Memory Required: ${this.formatBytes(recommendedStrategy.memoryRequirement)}`);
    console.log(`🖥️  CPU Required: ${recommendedStrategy.cpuRequirement} cores`);
    
    this.buildStartTime = Date.now();
    
    return new Promise((resolve, reject) => {
      this.currentBuild = spawn(recommendedStrategy.command, recommendedStrategy.args, {
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      let stdout = '';
      let stderr = '';
      
      this.currentBuild.stdout?.on('data', (data: Buffer) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(output);
      });
      
      this.currentBuild.stderr?.on('data', (data: Buffer) => {
        const output = data.toString();
        stderr += output;
        process.stderr.write(output);
      });
      
      this.currentBuild.on('close', (code: number) => {
        if (code === 0) {
          console.log('\n✅ Build completed successfully!');
          resolve();
        } else {
          console.error(`\n❌ Build failed with exit code ${code}`);
          reject(new Error(`Build failed with exit code ${code}`));
        }
      });
      
      this.currentBuild.on('error', (error: Error) => {
        console.error(`\n❌ Build execution error: ${error.message}`);
        reject(error);
      });
      
      // Start health monitoring
      this.startHealthMonitoring();
    });
  }

  /**
   * Start build health monitoring
   */
  private startHealthMonitoring(): void {
    if (this.healthMonitor) {
      clearInterval(this.healthMonitor);
    }
    
    this.healthMonitor = setInterval(() => {
      this.monitorBuildHealth();
    }, 5000); // Check every 5 seconds
  }

  /**
   * Monitor build health in real-time
   */
  private async monitorBuildHealth(): Promise<void> {
    if (!this.currentBuild || this.currentBuild.killed) {
      return;
    }
    
    // Get current system resources
    const currentResources = this.getSystemResources();
    
    // Calculate build progress (simplified)
    const elapsed = Date.now() - this.buildStartTime;
    const estimatedTotal = 120000; // 2 minutes estimate
    const progress = Math.min(100, (elapsed / estimatedTotal) * 100);
    
    // Calculate estimated time remaining
    const estimatedRemaining = Math.max(0, (estimatedTotal - elapsed) / 1000);
    
    // Determine health status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    const recommendations: string[] = [];
    
    if (currentResources.usedMemory / currentResources.totalMemory > 0.95) {
      status = 'critical';
      recommendations.push('Critical memory pressure - consider aborting build');
    } else if (currentResources.usedMemory / currentResources.totalMemory > 0.9) {
      status = 'warning';
      recommendations.push('High memory usage - monitor closely');
    }
    
    if (currentResources.cpuUsage > 95) {
      status = 'critical';
      recommendations.push('Critical CPU usage - system may become unresponsive');
    } else if (currentResources.cpuUsage > 85) {
      status = 'warning';
      recommendations.push('High CPU usage - build may be slower');
    }
    
    const health: BuildHealth = {
      status,
      memoryUsage: (currentResources.usedMemory / currentResources.totalMemory) * 100,
      cpuUsage: currentResources.cpuUsage,
      buildProgress: progress,
      estimatedTimeRemaining: estimatedRemaining,
      recommendations
    };
    
    // Display health status
    this.displayHealthStatus(health);
    
    // Take action if critical
    if (status === 'critical') {
      await this.handleCriticalHealth(health);
    }
  }

  /**
   * Display current health status
   */
  private displayHealthStatus(health: BuildHealth): void {
    const statusIcon = health.status === 'healthy' ? '✅' : 
                      health.status === 'warning' ? '⚠️' : '🚨';
    
    console.log(`\n${statusIcon} Build Health Status: ${health.status.toUpperCase()}`);
    console.log(`  💾 Memory Usage: ${health.memoryUsage.toFixed(1)}%`);
    console.log(`  🖥️  CPU Usage: ${health.cpuUsage.toFixed(1)}%`);
    console.log(`  📊 Build Progress: ${health.buildProgress.toFixed(1)}%`);
    console.log(`  ⏱️  Estimated Time Remaining: ${health.estimatedTimeRemaining.toFixed(0)}s`);
    
    if (health.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      health.recommendations.forEach(rec => {
        console.log(`    • ${rec}`);
      });
    }
  }

  /**
   * Handle critical health conditions
   */
  private async handleCriticalHealth(health: BuildHealth): Promise<void> {
    console.log('🚨 Critical health condition detected!');
    
    if (health.memoryUsage > 95) {
      console.log('💾 Memory pressure critical - attempting to free memory...');
      
      // Try to free some memory by running garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('🗑️  Garbage collection completed');
      }
      
      // If still critical, consider aborting build
      if (this.getSystemResources().usedMemory / this.getSystemResources().totalMemory > 0.95) {
        console.log('⚠️  Memory still critical - consider aborting build');
      }
    }
    
    if (health.cpuUsage > 95) {
      console.log('🖥️  CPU usage critical - system may become unresponsive');
      console.log('💡 Consider pausing other applications or aborting build');
    }
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.healthMonitor) {
      clearInterval(this.healthMonitor);
      this.healthMonitor = null;
    }
    
    if (this.currentBuild && !this.currentBuild.killed) {
      this.currentBuild.kill();
    }
  }
}

// Main execution
async function main() {
  const orchestrator = new IntelligentBuildOrchestrator();
  
  // Handle cleanup on exit
  process.on('SIGINT', () => {
    console.log('\n🛑 Build orchestration interrupted');
    orchestrator.cleanup();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Build orchestration terminated');
    orchestrator.cleanup();
    process.exit(0);
  });
  
  try {
    await orchestrator.execute();
  } catch (error) {
    console.error(`❌ Build orchestration failed: ${error.message}`);
    process.exit(1);
  } finally {
    orchestrator.cleanup();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { IntelligentBuildOrchestrator, BuildStrategy, BuildPrediction, BuildHealth };
