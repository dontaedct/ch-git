/**
 * Load Balancing and Scaling System
 * Enterprise-grade load balancing with auto-scaling capabilities
 */

export interface ServerInstance {
  id: string;
  host: string;
  port: number;
  weight: number;
  status: 'healthy' | 'unhealthy' | 'maintenance' | 'scaling';
  region: string;
  zone: string;
  capacity: {
    cpu: number;
    memory: number;
    connections: number;
  };
  current: {
    cpu: number;
    memory: number;
    connections: number;
    requestsPerSecond: number;
    responseTime: number;
  };
  healthCheck: {
    lastCheck: Date;
    failures: number;
    endpoint: string;
    timeout: number;
  };
  metadata: Record<string, any>;
}

export interface LoadBalancingStrategy {
  name: 'round-robin' | 'weighted-round-robin' | 'least-connections' | 'ip-hash' | 'geographic' | 'performance-based';
  config: Record<string, any>;
}

export interface ScalingPolicy {
  id: string;
  name: string;
  triggers: ScalingTrigger[];
  actions: ScalingAction[];
  cooldown: number;
  enabled: boolean;
}

export interface ScalingTrigger {
  metric: 'cpu' | 'memory' | 'connections' | 'response-time' | 'error-rate' | 'queue-length';
  threshold: number;
  comparison: 'greater-than' | 'less-than' | 'equals';
  duration: number; // Duration in seconds before triggering
  enabled: boolean;
}

export interface ScalingAction {
  type: 'scale-up' | 'scale-down' | 'scale-out' | 'scale-in';
  amount: number;
  maxInstances?: number;
  minInstances?: number;
  instanceType?: string;
  region?: string;
}

export interface HealthCheckResult {
  instanceId: string;
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  error?: string;
  timestamp: Date;
}

export interface TrafficPattern {
  timestamp: Date;
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  activeConnections: number;
  geographicDistribution: Record<string, number>;
}

export class LoadBalancingManager {
  private instances: Map<string, ServerInstance> = new Map();
  private strategies: Map<string, LoadBalancingStrategy> = new Map();
  private scalingPolicies: Map<string, ScalingPolicy> = new Map();
  private trafficHistory: TrafficPattern[] = [];
  private currentStrategy: string = 'performance-based';
  private monitoring: boolean = false;
  private lastRotation: number = 0;

  constructor() {
    this.initializeStrategies();
    this.initializeScalingPolicies();
  }

  /**
   * Register a new server instance
   */
  registerInstance(instance: ServerInstance): void {
    this.instances.set(instance.id, instance);
    console.log(`Registered instance ${instance.id} at ${instance.host}:${instance.port}`);
  }

  /**
   * Unregister a server instance
   */
  unregisterInstance(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      this.instances.delete(instanceId);
      console.log(`Unregistered instance ${instanceId}`);
    }
  }

  /**
   * Get the best server instance for a request
   */
  getServerInstance(request?: {
    clientIP?: string;
    region?: string;
    sessionId?: string;
    priority?: 'low' | 'normal' | 'high';
  }): ServerInstance | null {
    const healthyInstances = Array.from(this.instances.values())
      .filter(instance => instance.status === 'healthy');

    if (healthyInstances.length === 0) {
      return null;
    }

    const strategy = this.strategies.get(this.currentStrategy);
    if (!strategy) {
      return healthyInstances[0];
    }

    return this.selectInstanceByStrategy(strategy, healthyInstances, request);
  }

  /**
   * Update instance metrics
   */
  updateInstanceMetrics(instanceId: string, metrics: {
    cpu?: number;
    memory?: number;
    connections?: number;
    requestsPerSecond?: number;
    responseTime?: number;
  }): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      Object.assign(instance.current, metrics);

      // Check if scaling is needed
      this.checkScalingTriggers(instance);
    }
  }

  /**
   * Perform health check on all instances
   */
  async performHealthChecks(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];

    for (const instance of this.instances.values()) {
      try {
        const result = await this.checkInstanceHealth(instance);
        results.push(result);

        // Update instance status
        if (result.status === 'unhealthy') {
          instance.healthCheck.failures++;
          if (instance.healthCheck.failures >= 3) {
            instance.status = 'unhealthy';
            console.warn(`Instance ${instance.id} marked as unhealthy`);
          }
        } else {
          instance.healthCheck.failures = 0;
          if (instance.status === 'unhealthy') {
            instance.status = 'healthy';
            console.log(`Instance ${instance.id} recovered and marked as healthy`);
          }
        }

        instance.healthCheck.lastCheck = new Date();
      } catch (error) {
        console.error(`Health check failed for instance ${instance.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Scale the infrastructure based on current load
   */
  async scaleInfrastructure(
    action: ScalingAction,
    region?: string
  ): Promise<{ success: boolean; message: string; newInstances?: string[] }> {
    console.log(`Executing scaling action: ${action.type} with amount: ${action.amount}`);

    switch (action.type) {
      case 'scale-out':
        return await this.scaleOut(action, region);

      case 'scale-in':
        return await this.scaleIn(action, region);

      case 'scale-up':
        return await this.scaleUp(action, region);

      case 'scale-down':
        return await this.scaleDown(action, region);

      default:
        return { success: false, message: `Unknown scaling action: ${action.type}` };
    }
  }

  /**
   * Set load balancing strategy
   */
  setStrategy(strategyName: string): boolean {
    if (this.strategies.has(strategyName)) {
      this.currentStrategy = strategyName;
      console.log(`Load balancing strategy changed to: ${strategyName}`);
      return true;
    }
    return false;
  }

  /**
   * Get current load distribution
   */
  getLoadDistribution(): {
    totalInstances: number;
    healthyInstances: number;
    avgCpuUsage: number;
    avgMemoryUsage: number;
    avgResponseTime: number;
    totalConnections: number;
    regional: Record<string, {
      instances: number;
      avgLoad: number;
    }>;
  } {
    const instances = Array.from(this.instances.values());
    const healthy = instances.filter(i => i.status === 'healthy');

    const avgCpu = healthy.reduce((sum, i) => sum + i.current.cpu, 0) / healthy.length || 0;
    const avgMemory = healthy.reduce((sum, i) => sum + i.current.memory, 0) / healthy.length || 0;
    const avgResponse = healthy.reduce((sum, i) => sum + i.current.responseTime, 0) / healthy.length || 0;
    const totalConnections = healthy.reduce((sum, i) => sum + i.current.connections, 0);

    // Regional distribution
    const regional: Record<string, { instances: number; avgLoad: number }> = {};
    for (const instance of healthy) {
      if (!regional[instance.region]) {
        regional[instance.region] = { instances: 0, avgLoad: 0 };
      }
      regional[instance.region].instances++;
      regional[instance.region].avgLoad += (instance.current.cpu + instance.current.memory) / 2;
    }

    // Calculate average load per region
    for (const region of Object.keys(regional)) {
      regional[region].avgLoad /= regional[region].instances;
    }

    return {
      totalInstances: instances.length,
      healthyInstances: healthy.length,
      avgCpuUsage: avgCpu,
      avgMemoryUsage: avgMemory,
      avgResponseTime: avgResponse,
      totalConnections,
      regional
    };
  }

  /**
   * Get traffic predictions
   */
  getTrafficPredictions(lookaheadMinutes: number = 30): {
    predictedLoad: number;
    confidence: number;
    recommendedActions: string[];
  } {
    if (this.trafficHistory.length < 10) {
      return {
        predictedLoad: 1.0,
        confidence: 0.5,
        recommendedActions: ['Collect more traffic data for better predictions']
      };
    }

    // Simple linear regression for prediction
    const recentHistory = this.trafficHistory.slice(-50);
    const avgLoad = recentHistory.reduce((sum, p) => sum + p.requestsPerSecond, 0) / recentHistory.length;
    const trend = this.calculateTrend(recentHistory);

    const predictedLoad = Math.max(0.1, avgLoad + (trend * lookaheadMinutes));
    const currentCapacity = this.getCurrentCapacity();
    const utilizationRatio = predictedLoad / currentCapacity;

    const recommendations: string[] = [];
    let confidence = 0.7;

    if (utilizationRatio > 0.8) {
      recommendations.push('Consider scaling out - high load predicted');
      confidence = 0.8;
    } else if (utilizationRatio < 0.3) {
      recommendations.push('Consider scaling in - low load predicted');
      confidence = 0.75;
    } else {
      recommendations.push('Current capacity appears adequate');
    }

    return {
      predictedLoad: utilizationRatio,
      confidence,
      recommendedActions: recommendations
    };
  }

  /**
   * Start monitoring and auto-scaling
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.monitoring) return;

    this.monitoring = true;
    setInterval(async () => {
      await this.performHealthChecks();
      await this.recordTrafficPattern();
      await this.evaluateScalingPolicies();
    }, intervalMs);

    console.log('Load balancing monitoring started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.monitoring = false;
    console.log('Load balancing monitoring stopped');
  }

  private initializeStrategies(): void {
    const strategies: LoadBalancingStrategy[] = [
      {
        name: 'round-robin',
        config: {}
      },
      {
        name: 'weighted-round-robin',
        config: { useWeight: true }
      },
      {
        name: 'least-connections',
        config: {}
      },
      {
        name: 'ip-hash',
        config: { hashFunction: 'md5' }
      },
      {
        name: 'geographic',
        config: { preferLocalRegion: true }
      },
      {
        name: 'performance-based',
        config: {
          responseTimeWeight: 0.4,
          cpuWeight: 0.3,
          memoryWeight: 0.2,
          connectionWeight: 0.1
        }
      }
    ];

    strategies.forEach(strategy => this.strategies.set(strategy.name, strategy));
  }

  private initializeScalingPolicies(): void {
    const policies: ScalingPolicy[] = [
      {
        id: 'cpu-scale-out',
        name: 'CPU-based Scale Out',
        triggers: [
          {
            metric: 'cpu',
            threshold: 80,
            comparison: 'greater-than',
            duration: 300, // 5 minutes
            enabled: true
          }
        ],
        actions: [
          {
            type: 'scale-out',
            amount: 2,
            maxInstances: 20
          }
        ],
        cooldown: 600, // 10 minutes
        enabled: true
      },
      {
        id: 'cpu-scale-in',
        name: 'CPU-based Scale In',
        triggers: [
          {
            metric: 'cpu',
            threshold: 30,
            comparison: 'less-than',
            duration: 900, // 15 minutes
            enabled: true
          }
        ],
        actions: [
          {
            type: 'scale-in',
            amount: 1,
            minInstances: 2
          }
        ],
        cooldown: 600,
        enabled: true
      },
      {
        id: 'response-time-scale',
        name: 'Response Time Scale Out',
        triggers: [
          {
            metric: 'response-time',
            threshold: 1000, // 1 second
            comparison: 'greater-than',
            duration: 180, // 3 minutes
            enabled: true
          }
        ],
        actions: [
          {
            type: 'scale-out',
            amount: 1,
            maxInstances: 15
          }
        ],
        cooldown: 300,
        enabled: true
      }
    ];

    policies.forEach(policy => this.scalingPolicies.set(policy.id, policy));
  }

  private selectInstanceByStrategy(
    strategy: LoadBalancingStrategy,
    instances: ServerInstance[],
    request?: any
  ): ServerInstance {
    switch (strategy.name) {
      case 'round-robin':
        return this.roundRobinSelection(instances);

      case 'weighted-round-robin':
        return this.weightedRoundRobinSelection(instances);

      case 'least-connections':
        return this.leastConnectionsSelection(instances);

      case 'ip-hash':
        return this.ipHashSelection(instances, request?.clientIP);

      case 'geographic':
        return this.geographicSelection(instances, request?.region);

      case 'performance-based':
        return this.performanceBasedSelection(instances, strategy.config);

      default:
        return instances[0];
    }
  }

  private roundRobinSelection(instances: ServerInstance[]): ServerInstance {
    const index = this.lastRotation % instances.length;
    this.lastRotation++;
    return instances[index];
  }

  private weightedRoundRobinSelection(instances: ServerInstance[]): ServerInstance {
    const totalWeight = instances.reduce((sum, instance) => sum + instance.weight, 0);
    let random = Math.random() * totalWeight;

    for (const instance of instances) {
      random -= instance.weight;
      if (random <= 0) {
        return instance;
      }
    }

    return instances[0];
  }

  private leastConnectionsSelection(instances: ServerInstance[]): ServerInstance {
    return instances.reduce((best, current) =>
      current.current.connections < best.current.connections ? current : best
    );
  }

  private ipHashSelection(instances: ServerInstance[], clientIP?: string): ServerInstance {
    if (!clientIP) {
      return instances[0];
    }

    const hash = this.simpleHash(clientIP);
    const index = hash % instances.length;
    return instances[index];
  }

  private geographicSelection(instances: ServerInstance[], preferredRegion?: string): ServerInstance {
    if (preferredRegion) {
      const regionalInstances = instances.filter(i => i.region === preferredRegion);
      if (regionalInstances.length > 0) {
        return this.leastConnectionsSelection(regionalInstances);
      }
    }

    return this.leastConnectionsSelection(instances);
  }

  private performanceBasedSelection(instances: ServerInstance[], config: any): ServerInstance {
    const {
      responseTimeWeight = 0.4,
      cpuWeight = 0.3,
      memoryWeight = 0.2,
      connectionWeight = 0.1
    } = config;

    let bestInstance = instances[0];
    let bestScore = Infinity;

    for (const instance of instances) {
      const score =
        (instance.current.responseTime * responseTimeWeight) +
        (instance.current.cpu * cpuWeight) +
        (instance.current.memory * memoryWeight) +
        (instance.current.connections * connectionWeight);

      if (score < bestScore) {
        bestScore = score;
        bestInstance = instance;
      }
    }

    return bestInstance;
  }

  private async checkInstanceHealth(instance: ServerInstance): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Simulate health check (in real implementation, would make HTTP request)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

      const responseTime = Date.now() - startTime;
      const isHealthy = responseTime < instance.healthCheck.timeout && Math.random() > 0.05; // 95% success rate

      return {
        instanceId: instance.id,
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        instanceId: instance.id,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  private checkScalingTriggers(instance: ServerInstance): void {
    for (const policy of this.scalingPolicies.values()) {
      if (!policy.enabled) continue;

      for (const trigger of policy.triggers) {
        if (!trigger.enabled) continue;

        const metricValue = this.getMetricValue(instance, trigger.metric);
        const conditionMet = this.evaluateCondition(metricValue, trigger.threshold, trigger.comparison);

        if (conditionMet) {
          // In real implementation, would track trigger duration
          console.log(`Scaling trigger met for ${trigger.metric}: ${metricValue} ${trigger.comparison} ${trigger.threshold}`);
        }
      }
    }
  }

  private getMetricValue(instance: ServerInstance, metric: ScalingTrigger['metric']): number {
    switch (metric) {
      case 'cpu': return instance.current.cpu;
      case 'memory': return instance.current.memory;
      case 'connections': return instance.current.connections;
      case 'response-time': return instance.current.responseTime;
      case 'error-rate': return 0; // Would need to track separately
      case 'queue-length': return 0; // Would need to track separately
      default: return 0;
    }
  }

  private evaluateCondition(value: number, threshold: number, comparison: ScalingTrigger['comparison']): boolean {
    switch (comparison) {
      case 'greater-than': return value > threshold;
      case 'less-than': return value < threshold;
      case 'equals': return Math.abs(value - threshold) < 0.01;
      default: return false;
    }
  }

  private async scaleOut(action: ScalingAction, region?: string): Promise<any> {
    const targetRegion = region || action.region || 'default';
    const newInstances: string[] = [];

    for (let i = 0; i < action.amount; i++) {
      const instanceId = `instance-${Date.now()}-${i}`;
      const newInstance: ServerInstance = {
        id: instanceId,
        host: `host-${instanceId}`,
        port: 3000 + i,
        weight: 1,
        status: 'healthy',
        region: targetRegion,
        zone: `${targetRegion}-a`,
        capacity: { cpu: 100, memory: 100, connections: 1000 },
        current: { cpu: 10, memory: 20, connections: 0, requestsPerSecond: 0, responseTime: 100 },
        healthCheck: {
          lastCheck: new Date(),
          failures: 0,
          endpoint: '/health',
          timeout: 5000
        },
        metadata: {}
      };

      this.registerInstance(newInstance);
      newInstances.push(instanceId);
    }

    return {
      success: true,
      message: `Scaled out ${action.amount} instances in ${targetRegion}`,
      newInstances
    };
  }

  private async scaleIn(action: ScalingAction, region?: string): Promise<any> {
    const instances = Array.from(this.instances.values())
      .filter(i => !region || i.region === region)
      .sort((a, b) => a.current.connections - b.current.connections);

    const toRemove = Math.min(action.amount, instances.length - (action.minInstances || 1));
    const removed: string[] = [];

    for (let i = 0; i < toRemove; i++) {
      const instance = instances[i];
      this.unregisterInstance(instance.id);
      removed.push(instance.id);
    }

    return {
      success: true,
      message: `Scaled in ${removed.length} instances`,
      newInstances: removed
    };
  }

  private async scaleUp(action: ScalingAction, region?: string): Promise<any> {
    // Scale up existing instances (increase capacity)
    const instances = Array.from(this.instances.values())
      .filter(i => !region || i.region === region);

    for (const instance of instances) {
      instance.capacity.cpu += action.amount;
      instance.capacity.memory += action.amount;
      instance.capacity.connections += action.amount * 10;
    }

    return {
      success: true,
      message: `Scaled up capacity for ${instances.length} instances by ${action.amount}%`
    };
  }

  private async scaleDown(action: ScalingAction, region?: string): Promise<any> {
    // Scale down existing instances (decrease capacity)
    const instances = Array.from(this.instances.values())
      .filter(i => !region || i.region === region);

    for (const instance of instances) {
      instance.capacity.cpu = Math.max(50, instance.capacity.cpu - action.amount);
      instance.capacity.memory = Math.max(50, instance.capacity.memory - action.amount);
      instance.capacity.connections = Math.max(100, instance.capacity.connections - action.amount * 10);
    }

    return {
      success: true,
      message: `Scaled down capacity for ${instances.length} instances by ${action.amount}%`
    };
  }

  private async recordTrafficPattern(): Promise<void> {
    const instances = Array.from(this.instances.values())
      .filter(i => i.status === 'healthy');

    if (instances.length === 0) return;

    const totalRPS = instances.reduce((sum, i) => sum + i.current.requestsPerSecond, 0);
    const avgResponseTime = instances.reduce((sum, i) => sum + i.current.responseTime, 0) / instances.length;
    const totalConnections = instances.reduce((sum, i) => sum + i.current.connections, 0);

    const pattern: TrafficPattern = {
      timestamp: new Date(),
      requestsPerSecond: totalRPS,
      averageResponseTime: avgResponseTime,
      errorRate: 0, // Would need to track separately
      activeConnections: totalConnections,
      geographicDistribution: {} // Would need to track separately
    };

    this.trafficHistory.push(pattern);

    // Keep only last 1000 patterns
    if (this.trafficHistory.length > 1000) {
      this.trafficHistory.shift();
    }
  }

  private async evaluateScalingPolicies(): Promise<void> {
    // Evaluate scaling policies and trigger actions if needed
    for (const policy of this.scalingPolicies.values()) {
      if (!policy.enabled) continue;

      // Check if cooldown period has passed
      // In real implementation, would track last action time

      for (const trigger of policy.triggers) {
        if (!trigger.enabled) continue;

        // Check trigger conditions across all instances
        const instances = Array.from(this.instances.values());
        const triggerMet = instances.some(instance => {
          const metricValue = this.getMetricValue(instance, trigger.metric);
          return this.evaluateCondition(metricValue, trigger.threshold, trigger.comparison);
        });

        if (triggerMet) {
          for (const action of policy.actions) {
            await this.scaleInfrastructure(action);
          }
        }
      }
    }
  }

  private calculateTrend(patterns: TrafficPattern[]): number {
    if (patterns.length < 2) return 0;

    // Simple linear regression slope
    const n = patterns.length;
    const sumX = patterns.reduce((sum, _, i) => sum + i, 0);
    const sumY = patterns.reduce((sum, p) => sum + p.requestsPerSecond, 0);
    const sumXY = patterns.reduce((sum, p, i) => sum + (i * p.requestsPerSecond), 0);
    const sumXX = patterns.reduce((sum, _, i) => sum + (i * i), 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private getCurrentCapacity(): number {
    const instances = Array.from(this.instances.values())
      .filter(i => i.status === 'healthy');

    return instances.reduce((sum, i) => sum + i.capacity.connections, 0);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Export singleton instance
export const loadBalancer = new LoadBalancingManager();