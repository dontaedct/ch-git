/**
 * @fileoverview Template Scaling and Load Balancing System
 * @module lib/scalability/template-scaling
 * @author OSS Hero System
 * @version 1.0.0
 */

import { performance } from 'perf_hooks';

/**
 * Template load metrics interface
 */
export interface TemplateLoadMetrics {
  templateId: string;
  loadTime: number;
  memoryUsage: number;
  cpuUsage: number;
  concurrentUsers: number;
  errorRate: number;
  responseTime: number;
  throughput: number;
  timestamp: number;
}

/**
 * Scaling configuration interface
 */
export interface ScalingConfig {
  minInstances: number;
  maxInstances: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
  loadBalancingStrategy: 'round-robin' | 'least-connections' | 'weighted' | 'ip-hash';
  healthCheckInterval: number;
  healthCheckTimeout: number;
  autoScaling: boolean;
  predictiveScaling: boolean;
}

/**
 * Load balancer interface
 */
export interface LoadBalancer {
  id: string;
  host: string;
  port: number;
  weight: number;
  health: 'healthy' | 'unhealthy' | 'unknown';
  lastHealthCheck: number;
  activeConnections: number;
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
}

/**
 * Scaling decision interface
 */
export interface ScalingDecision {
  action: 'scale-up' | 'scale-down' | 'maintain';
  reason: string;
  currentInstances: number;
  targetInstances: number;
  confidence: number;
  metrics: TemplateLoadMetrics;
  timestamp: number;
}

/**
 * Template Scaling and Load Balancing System
 * 
 * Provides intelligent scaling and load balancing for template instances
 * including predictive scaling, health monitoring, and performance optimization
 */
export class TemplateScalingSystem {
  private config: ScalingConfig;
  private loadBalancers: Map<string, LoadBalancer>;
  private metrics: Map<string, TemplateLoadMetrics[]>;
  private scalingHistory: ScalingDecision[];
  private healthCheckInterval: NodeJS.Timeout;
  private scalingInterval: NodeJS.Timeout;
  private currentInstances: number;

  constructor(config: Partial<ScalingConfig> = {}) {
    this.config = {
      minInstances: 1,
      maxInstances: 10,
      scaleUpThreshold: 70, // 70% CPU/Memory usage
      scaleDownThreshold: 30, // 30% CPU/Memory usage
      scaleUpCooldown: 300000, // 5 minutes
      scaleDownCooldown: 600000, // 10 minutes
      loadBalancingStrategy: 'least-connections',
      healthCheckInterval: 30000, // 30 seconds
      healthCheckTimeout: 5000, // 5 seconds
      autoScaling: true,
      predictiveScaling: true,
      ...config
    };

    this.loadBalancers = new Map();
    this.metrics = new Map();
    this.scalingHistory = [];
    this.currentInstances = this.config.minInstances;

    this.startHealthChecks();
    this.startScaling();
  }

  /**
   * Add template load balancer
   */
  public addLoadBalancer(balancer: LoadBalancer): void {
    this.loadBalancers.set(balancer.id, balancer);
    console.log(`Added load balancer: ${balancer.id}`);
  }

  /**
   * Remove template load balancer
   */
  public removeLoadBalancer(id: string): boolean {
    const removed = this.loadBalancers.delete(id);
    if (removed) {
      console.log(`Removed load balancer: ${id}`);
    }
    return removed;
  }

  /**
   * Get healthy load balancer using configured strategy
   */
  public getHealthyLoadBalancer(): LoadBalancer | null {
    const healthyBalancers = Array.from(this.loadBalancers.values())
      .filter(balancer => balancer.health === 'healthy');

    if (healthyBalancers.length === 0) {
      return null;
    }

    switch (this.config.loadBalancingStrategy) {
      case 'round-robin':
        return this.getRoundRobinBalancer(healthyBalancers);
      case 'least-connections':
        return this.getLeastConnectionsBalancer(healthyBalancers);
      case 'weighted':
        return this.getWeightedBalancer(healthyBalancers);
      case 'ip-hash':
        return this.getIpHashBalancer(healthyBalancers);
      default:
        return healthyBalancers[0];
    }
  }

  /**
   * Record template load metrics
   */
  public recordMetrics(templateId: string, metrics: TemplateLoadMetrics): void {
    if (!this.metrics.has(templateId)) {
      this.metrics.set(templateId, []);
    }

    const templateMetrics = this.metrics.get(templateId)!;
    templateMetrics.push(metrics);

    // Keep only last 100 metrics per template
    if (templateMetrics.length > 100) {
      templateMetrics.splice(0, templateMetrics.length - 100);
    }

    // Update load balancer metrics if applicable
    this.updateLoadBalancerMetrics(templateId, metrics);
  }

  /**
   * Get scaling decision based on current metrics
   */
  public getScalingDecision(templateId: string): ScalingDecision {
    const templateMetrics = this.metrics.get(templateId) || [];
    
    if (templateMetrics.length === 0) {
      return {
        action: 'maintain',
        reason: 'No metrics available',
        currentInstances: this.currentInstances,
        targetInstances: this.currentInstances,
        confidence: 0,
        metrics: {} as TemplateLoadMetrics,
        timestamp: Date.now()
      };
    }

    const latestMetrics = templateMetrics[templateMetrics.length - 1];
    const averageMetrics = this.calculateAverageMetrics(templateMetrics);
    
    // Check if scaling is on cooldown
    if (this.isScalingOnCooldown()) {
      return {
        action: 'maintain',
        reason: 'Scaling on cooldown',
        currentInstances: this.currentInstances,
        targetInstances: this.currentInstances,
        confidence: 0.9,
        metrics: latestMetrics,
        timestamp: Date.now()
      };
    }

    // Analyze metrics for scaling decision
    const scalingDecision = this.analyzeMetricsForScaling(latestMetrics, averageMetrics);
    
    // Add to scaling history
    this.scalingHistory.push(scalingDecision);
    
    // Keep only last 50 scaling decisions
    if (this.scalingHistory.length > 50) {
      this.scalingHistory.splice(0, this.scalingHistory.length - 50);
    }

    return scalingDecision;
  }

  /**
   * Execute scaling decision
   */
  public async executeScalingDecision(decision: ScalingDecision): Promise<boolean> {
    if (decision.action === 'maintain') {
      return true;
    }

    try {
      let success = false;
      
      if (decision.action === 'scale-up') {
        success = await this.scaleUp(decision.targetInstances);
      } else if (decision.action === 'scale-down') {
        success = await this.scaleDown(decision.targetInstances);
      }

      if (success) {
        this.currentInstances = decision.targetInstances;
        console.log(`Scaling ${decision.action}: ${decision.currentInstances} -> ${decision.targetInstances} instances`);
      }

      return success;
    } catch (error) {
      console.error('Scaling execution failed:', error);
      return false;
    }
  }

  /**
   * Get current scaling status
   */
  public getScalingStatus(): {
    currentInstances: number;
    targetInstances: number;
    loadBalancers: LoadBalancer[];
    recentDecisions: ScalingDecision[];
    metrics: Map<string, TemplateLoadMetrics[]>;
  } {
    return {
      currentInstances: this.currentInstances,
      targetInstances: this.currentInstances,
      loadBalancers: Array.from(this.loadBalancers.values()),
      recentDecisions: this.scalingHistory.slice(-10),
      metrics: this.metrics
    };
  }

  /**
   * Update scaling configuration
   */
  public updateConfig(config: Partial<ScalingConfig>): void {
    Object.assign(this.config, config);
    
    // Restart intervals if needed
    if (config.healthCheckInterval !== undefined || config.autoScaling !== undefined) {
      clearInterval(this.healthCheckInterval);
      clearInterval(this.scalingInterval);
      
      if (this.config.autoScaling) {
        this.startHealthChecks();
        this.startScaling();
      }
    }
  }

  /**
   * Get performance analytics
   */
  public getPerformanceAnalytics(): {
    averageLoadTime: number;
    averageThroughput: number;
    averageErrorRate: number;
    scalingFrequency: number;
    loadBalancerHealth: number;
    recommendations: string[];
  } {
    const allMetrics: TemplateLoadMetrics[] = [];
    this.metrics.forEach(templateMetrics => {
      allMetrics.push(...templateMetrics);
    });

    const averageLoadTime = allMetrics.reduce((sum, m) => sum + m.loadTime, 0) / allMetrics.length || 0;
    const averageThroughput = allMetrics.reduce((sum, m) => sum + m.throughput, 0) / allMetrics.length || 0;
    const averageErrorRate = allMetrics.reduce((sum, m) => sum + m.errorRate, 0) / allMetrics.length || 0;
    
    const recentDecisions = this.scalingHistory.filter(d => 
      Date.now() - d.timestamp < 3600000 // Last hour
    );
    const scalingFrequency = recentDecisions.length;

    const healthyBalancers = Array.from(this.loadBalancers.values())
      .filter(b => b.health === 'healthy').length;
    const loadBalancerHealth = (healthyBalancers / this.loadBalancers.size) * 100 || 0;

    const recommendations: string[] = [];
    
    if (averageLoadTime > 1000) {
      recommendations.push('Consider scaling up due to high load times');
    }
    if (averageErrorRate > 0.05) {
      recommendations.push('Investigate high error rates');
    }
    if (loadBalancerHealth < 80) {
      recommendations.push('Check load balancer health');
    }
    if (scalingFrequency > 10) {
      recommendations.push('Consider adjusting scaling thresholds');
    }

    return {
      averageLoadTime,
      averageThroughput,
      averageErrorRate,
      scalingFrequency,
      loadBalancerHealth,
      recommendations
    };
  }

  /**
   * Get round-robin load balancer
   */
  private getRoundRobinBalancer(balancers: LoadBalancer[]): LoadBalancer {
    // Simple round-robin implementation
    const index = Math.floor(Math.random() * balancers.length);
    return balancers[index];
  }

  /**
   * Get least connections load balancer
   */
  private getLeastConnectionsBalancer(balancers: LoadBalancer[]): LoadBalancer {
    return balancers.reduce((least, current) => 
      current.activeConnections < least.activeConnections ? current : least
    );
  }

  /**
   * Get weighted load balancer
   */
  private getWeightedBalancer(balancers: LoadBalancer[]): LoadBalancer {
    const totalWeight = balancers.reduce((sum, b) => sum + b.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const balancer of balancers) {
      random -= balancer.weight;
      if (random <= 0) {
        return balancer;
      }
    }
    
    return balancers[0]; // Fallback
  }

  /**
   * Get IP hash load balancer
   */
  private getIpHashBalancer(balancers: LoadBalancer[]): LoadBalancer {
    // Simplified IP hash implementation
    const hash = Math.abs(this.hashCode(Date.now().toString()));
    const index = hash % balancers.length;
    return balancers[index];
  }

  /**
   * Update load balancer metrics
   */
  private updateLoadBalancerMetrics(templateId: string, metrics: TemplateLoadMetrics): void {
    // Find load balancer handling this template
    const balancer = Array.from(this.loadBalancers.values())
      .find(b => b.id.includes(templateId));
    
    if (balancer) {
      balancer.totalRequests++;
      balancer.averageResponseTime = 
        (balancer.averageResponseTime + metrics.responseTime) / 2;
      
      if (metrics.errorRate > 0) {
        balancer.errorRate = (balancer.errorRate + metrics.errorRate) / 2;
      }
    }
  }

  /**
   * Calculate average metrics from template metrics
   */
  private calculateAverageMetrics(metrics: TemplateLoadMetrics[]): TemplateLoadMetrics {
    const count = metrics.length;
    if (count === 0) {
      return {} as TemplateLoadMetrics;
    }

    return {
      templateId: metrics[0].templateId,
      loadTime: metrics.reduce((sum, m) => sum + m.loadTime, 0) / count,
      memoryUsage: metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / count,
      cpuUsage: metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / count,
      concurrentUsers: metrics.reduce((sum, m) => sum + m.concurrentUsers, 0) / count,
      errorRate: metrics.reduce((sum, m) => sum + m.errorRate, 0) / count,
      responseTime: metrics.reduce((sum, m) => sum + m.responseTime, 0) / count,
      throughput: metrics.reduce((sum, m) => sum + m.throughput, 0) / count,
      timestamp: Date.now()
    };
  }

  /**
   * Analyze metrics for scaling decision
   */
  private analyzeMetricsForScaling(
    latest: TemplateLoadMetrics, 
    average: TemplateLoadMetrics
  ): ScalingDecision {
    const cpuUsage = Math.max(latest.cpuUsage, average.cpuUsage);
    const memoryUsage = Math.max(latest.memoryUsage, average.memoryUsage);
    const errorRate = Math.max(latest.errorRate, average.errorRate);
    const responseTime = Math.max(latest.responseTime, average.responseTime);

    // Scale up conditions
    if (cpuUsage > this.config.scaleUpThreshold || 
        memoryUsage > this.config.scaleUpThreshold ||
        errorRate > 0.1 ||
        responseTime > 2000) {
      
      const targetInstances = Math.min(
        this.currentInstances + 1,
        this.config.maxInstances
      );

      return {
        action: 'scale-up',
        reason: `High resource usage: CPU ${cpuUsage.toFixed(1)}%, Memory ${memoryUsage.toFixed(1)}%, Error Rate ${(errorRate * 100).toFixed(1)}%`,
        currentInstances: this.currentInstances,
        targetInstances,
        confidence: 0.8,
        metrics: latest,
        timestamp: Date.now()
      };
    }

    // Scale down conditions
    if (cpuUsage < this.config.scaleDownThreshold && 
        memoryUsage < this.config.scaleDownThreshold &&
        errorRate < 0.01 &&
        responseTime < 500 &&
        this.currentInstances > this.config.minInstances) {
      
      const targetInstances = Math.max(
        this.currentInstances - 1,
        this.config.minInstances
      );

      return {
        action: 'scale-down',
        reason: `Low resource usage: CPU ${cpuUsage.toFixed(1)}%, Memory ${memoryUsage.toFixed(1)}%, Error Rate ${(errorRate * 100).toFixed(1)}%`,
        currentInstances: this.currentInstances,
        targetInstances,
        confidence: 0.7,
        metrics: latest,
        timestamp: Date.now()
      };
    }

    // Maintain current state
    return {
      action: 'maintain',
      reason: 'Resource usage within normal range',
      currentInstances: this.currentInstances,
      targetInstances: this.currentInstances,
      confidence: 0.9,
      metrics: latest,
      timestamp: Date.now()
    };
  }

  /**
   * Check if scaling is on cooldown
   */
  private isScalingOnCooldown(): boolean {
    if (this.scalingHistory.length === 0) {
      return false;
    }

    const lastDecision = this.scalingHistory[this.scalingHistory.length - 1];
    const timeSinceLastScaling = Date.now() - lastDecision.timestamp;
    
    if (lastDecision.action === 'scale-up') {
      return timeSinceLastScaling < this.config.scaleUpCooldown;
    } else if (lastDecision.action === 'scale-down') {
      return timeSinceLastScaling < this.config.scaleDownCooldown;
    }
    
    return false;
  }

  /**
   * Scale up instances
   */
  private async scaleUp(targetInstances: number): Promise<boolean> {
    try {
      // In a real implementation, this would interact with your infrastructure
      // For now, we'll simulate the scaling operation
      console.log(`Scaling up to ${targetInstances} instances...`);
      
      // Simulate scaling time
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      return true;
    } catch (error) {
      console.error('Scale up failed:', error);
      return false;
    }
  }

  /**
   * Scale down instances
   */
  private async scaleDown(targetInstances: number): Promise<boolean> {
    try {
      // In a real implementation, this would interact with your infrastructure
      // For now, we'll simulate the scaling operation
      console.log(`Scaling down to ${targetInstances} instances...`);
      
      // Simulate scaling time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return true;
    } catch (error) {
      console.error('Scale down failed:', error);
      return false;
    }
  }

  /**
   * Start health checks
   */
  private startHealthChecks(): void {
    if (!this.config.autoScaling) return;

    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval);
  }

  /**
   * Start scaling process
   */
  private startScaling(): void {
    if (!this.config.autoScaling) return;

    this.scalingInterval = setInterval(() => {
      this.performScaling();
    }, 60000); // Check every minute
  }

  /**
   * Perform health checks on load balancers
   */
  private async performHealthChecks(): Promise<void> {
    for (const [id, balancer] of this.loadBalancers) {
      try {
        // In a real implementation, this would make actual health check requests
        const isHealthy = await this.checkBalancerHealth(balancer);
        
        balancer.health = isHealthy ? 'healthy' : 'unhealthy';
        balancer.lastHealthCheck = Date.now();
        
        if (!isHealthy) {
          console.warn(`Load balancer ${id} is unhealthy`);
        }
      } catch (error) {
        console.error(`Health check failed for balancer ${id}:`, error);
        balancer.health = 'unhealthy';
      }
    }
  }

  /**
   * Perform scaling based on current metrics
   */
  private async performScaling(): Promise<void> {
    // Check all templates for scaling decisions
    for (const [templateId] of this.metrics) {
      const decision = this.getScalingDecision(templateId);
      
      if (decision.action !== 'maintain') {
        await this.executeScalingDecision(decision);
      }
    }
  }

  /**
   * Check individual balancer health
   */
  private async checkBalancerHealth(balancer: LoadBalancer): Promise<boolean> {
    try {
      // In a real implementation, this would make an HTTP request to the balancer
      // For now, we'll simulate the health check
      return Math.random() > 0.1; // 90% success rate
    } catch (error) {
      return false;
    }
  }

  /**
   * Hash code utility
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }
}

/**
 * Global template scaling system instance
 */
export const templateScalingSystem = new TemplateScalingSystem({
  minInstances: 2,
  maxInstances: 20,
  scaleUpThreshold: 75,
  scaleDownThreshold: 25,
  loadBalancingStrategy: 'least-connections',
  autoScaling: true,
  predictiveScaling: true
});
