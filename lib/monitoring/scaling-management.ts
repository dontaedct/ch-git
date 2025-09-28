/**
 * Scaling and Resource Management System
 * Automated scaling and resource optimization for production applications
 */

import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ResourceMetrics {
  timestamp: Date;
  cpu: {
    usage: number; // percentage
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number; // bytes
    used: number; // bytes
    free: number; // bytes
    usage: number; // percentage
  };
  disk: {
    total: number; // bytes
    used: number; // bytes
    free: number; // bytes
    usage: number; // percentage
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
  processes: {
    total: number;
    running: number;
    sleeping: number;
    zombie: number;
  };
}

export interface ScalingRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  metric: 'cpu' | 'memory' | 'disk' | 'network' | 'custom';
  threshold: {
    min: number;
    max: number;
    duration: number; // minutes
  };
  action: {
    type: 'scale_up' | 'scale_down' | 'restart' | 'alert' | 'custom';
    target: number; // for scaling actions
    cooldown: number; // minutes
  };
  conditions: {
    timeWindow?: {
      start: string; // HH:MM format
      end: string; // HH:MM format
      days: number[]; // 0-6 (Sunday-Saturday)
    };
    environment?: string[];
    tags?: Record<string, string>;
  };
}

export interface ScalingAction {
  id: string;
  ruleId: string;
  type: 'scale_up' | 'scale_down' | 'restart' | 'alert' | 'custom';
  status: 'pending' | 'running' | 'completed' | 'failed';
  target?: number;
  currentValue: number;
  threshold: number;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface ScalingConfig {
  enableAutoScaling: boolean;
  enableResourceMonitoring: boolean;
  collectionInterval: number; // milliseconds
  scalingCooldown: number; // minutes
  maxScaleUp: number; // maximum instances
  minScaleDown: number; // minimum instances
  defaultInstanceCount: number;
  scalingRules: ScalingRule[];
  notificationChannels: {
    email: string[];
    webhook: string[];
    slack: string;
  };
  platforms: {
    docker: {
      enabled: boolean;
      composeFile: string;
      serviceName: string;
    };
    kubernetes: {
      enabled: boolean;
      namespace: string;
      deployment: string;
    };
    aws: {
      enabled: boolean;
      region: string;
      autoScalingGroup: string;
    };
    gcp: {
      enabled: boolean;
      project: string;
      instanceGroup: string;
    };
  };
}

export class ScalingManager {
  private config: ScalingConfig;
  private supabase: any;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private metricsHistory: ResourceMetrics[] = [];
  private activeActions: Map<string, ScalingAction> = new Map();
  private lastScalingAction: Date = new Date(0);

  constructor(config: ScalingConfig) {
    this.config = config;
    
    // Initialize Supabase client
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    }
  }

  /**
   * Start scaling manager
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('Scaling manager is already running');
      return;
    }

    this.isRunning = true;
    console.log('Scaling manager started');

    // Start resource monitoring
    if (this.config.enableResourceMonitoring) {
      this.intervalId = setInterval(async () => {
        await this.collectResourceMetrics();
      }, this.config.collectionInterval);
    }

    // Start scaling evaluation
    if (this.config.enableAutoScaling) {
      setInterval(async () => {
        await this.evaluateScalingRules();
      }, 60000); // Check every minute
    }
  }

  /**
   * Stop scaling manager
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Scaling manager stopped');
  }

  /**
   * Collect resource metrics
   */
  async collectResourceMetrics(): Promise<ResourceMetrics> {
    try {
      const metrics: ResourceMetrics = {
        timestamp: new Date(),
        cpu: await this.getCPUMetrics(),
        memory: await this.getMemoryMetrics(),
        disk: await this.getDiskMetrics(),
        network: await this.getNetworkMetrics(),
        processes: await this.getProcessMetrics(),
      };

      // Store metrics in history
      this.metricsHistory.push(metrics);
      
      // Keep only last 1000 metrics to prevent memory issues
      if (this.metricsHistory.length > 1000) {
        this.metricsHistory = this.metricsHistory.slice(-1000);
      }

      // Store in database
      await this.storeResourceMetrics(metrics);

      return metrics;

    } catch (error) {
      console.error('Failed to collect resource metrics:', error);
      throw error;
    }
  }

  /**
   * Get CPU metrics
   */
  private async getCPUMetrics(): Promise<ResourceMetrics['cpu']> {
    try {
      // Get CPU usage using top command
      const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | awk -F'%' '{print $1}'");
      const usage = parseFloat(stdout.trim()) || 0;

      // Get CPU cores
      const { stdout: coresOutput } = await execAsync("nproc");
      const cores = parseInt(coresOutput.trim()) || 1;

      // Get load average
      const { stdout: loadOutput } = await execAsync("uptime | awk -F'load average:' '{print $2}' | awk '{print $1, $2, $3}'");
      const loadAverage = loadOutput.trim().split(/\s+/).map(parseFloat);

      return {
        usage,
        cores,
        loadAverage,
      };
    } catch (error) {
      console.warn('Failed to get CPU metrics:', error);
      return {
        usage: 0,
        cores: 1,
        loadAverage: [0, 0, 0],
      };
    }
  }

  /**
   * Get memory metrics
   */
  private async getMemoryMetrics(): Promise<ResourceMetrics['memory']> {
    try {
      const { stdout } = await execAsync("free -b | grep 'Mem:'");
      const parts = stdout.trim().split(/\s+/);
      
      const total = parseInt(parts[1]) || 0;
      const used = parseInt(parts[2]) || 0;
      const free = parseInt(parts[3]) || 0;
      const usage = total > 0 ? (used / total) * 100 : 0;

      return {
        total,
        used,
        free,
        usage,
      };
    } catch (error) {
      console.warn('Failed to get memory metrics:', error);
      return {
        total: 0,
        used: 0,
        free: 0,
        usage: 0,
      };
    }
  }

  /**
   * Get disk metrics
   */
  private async getDiskMetrics(): Promise<ResourceMetrics['disk']> {
    try {
      const { stdout } = await execAsync("df -B1 / | tail -1");
      const parts = stdout.trim().split(/\s+/);
      
      const total = parseInt(parts[1]) || 0;
      const used = parseInt(parts[2]) || 0;
      const free = parseInt(parts[3]) || 0;
      const usage = total > 0 ? (used / total) * 100 : 0;

      return {
        total,
        used,
        free,
        usage,
      };
    } catch (error) {
      console.warn('Failed to get disk metrics:', error);
      return {
        total: 0,
        used: 0,
        free: 0,
        usage: 0,
      };
    }
  }

  /**
   * Get network metrics
   */
  private async getNetworkMetrics(): Promise<ResourceMetrics['network']> {
    try {
      // This is a simplified implementation
      // In practice, you would read from /proc/net/dev or similar
      return {
        bytesIn: 0,
        bytesOut: 0,
        packetsIn: 0,
        packetsOut: 0,
      };
    } catch (error) {
      console.warn('Failed to get network metrics:', error);
      return {
        bytesIn: 0,
        bytesOut: 0,
        packetsIn: 0,
        packetsOut: 0,
      };
    }
  }

  /**
   * Get process metrics
   */
  private async getProcessMetrics(): Promise<ResourceMetrics['processes']> {
    try {
      const { stdout } = await execAsync("ps aux | wc -l");
      const total = parseInt(stdout.trim()) - 1; // Subtract header line

      // This is a simplified implementation
      return {
        total,
        running: total,
        sleeping: 0,
        zombie: 0,
      };
    } catch (error) {
      console.warn('Failed to get process metrics:', error);
      return {
        total: 0,
        running: 0,
        sleeping: 0,
        zombie: 0,
      };
    }
  }

  /**
   * Evaluate scaling rules
   */
  async evaluateScalingRules(): Promise<void> {
    if (!this.config.enableAutoScaling) return;

    // Check cooldown period
    const timeSinceLastAction = Date.now() - this.lastScalingAction.getTime();
    if (timeSinceLastAction < this.config.scalingCooldown * 60 * 1000) {
      return;
    }

    const currentMetrics = this.metricsHistory[this.metricsHistory.length - 1];
    if (!currentMetrics) return;

    for (const rule of this.config.scalingRules) {
      if (!rule.enabled) continue;

      // Check time window conditions
      if (rule.conditions.timeWindow && !this.isInTimeWindow(rule.conditions.timeWindow)) {
        continue;
      }

      // Check environment conditions
      if (rule.conditions.environment && !rule.conditions.environment.includes(process.env.NODE_ENV || 'development')) {
        continue;
      }

      // Evaluate rule
      const shouldTrigger = await this.evaluateRule(rule, currentMetrics);
      if (shouldTrigger) {
        await this.executeScalingAction(rule, currentMetrics);
      }
    }
  }

  /**
   * Evaluate a scaling rule
   */
  private async evaluateRule(rule: ScalingRule, metrics: ResourceMetrics): Promise<boolean> {
    let currentValue: number;

    switch (rule.metric) {
      case 'cpu':
        currentValue = metrics.cpu.usage;
        break;
      case 'memory':
        currentValue = metrics.memory.usage;
        break;
      case 'disk':
        currentValue = metrics.disk.usage;
        break;
      case 'network':
        currentValue = (metrics.network.bytesIn + metrics.network.bytesOut) / 1024 / 1024; // MB
        break;
      default:
        return false;
    }

    // Check if current value exceeds threshold
    const exceedsThreshold = currentValue > rule.threshold.max || currentValue < rule.threshold.min;
    
    if (!exceedsThreshold) return false;

    // Check if threshold has been exceeded for the required duration
    const thresholdTime = new Date(Date.now() - rule.threshold.duration * 60 * 1000);
    const recentMetrics = this.metricsHistory.filter(m => m.timestamp >= thresholdTime);
    
    const thresholdExceededCount = recentMetrics.filter(m => {
      let value: number;
      switch (rule.metric) {
        case 'cpu': value = m.cpu.usage; break;
        case 'memory': value = m.memory.usage; break;
        case 'disk': value = m.disk.usage; break;
        case 'network': value = (m.network.bytesIn + m.network.bytesOut) / 1024 / 1024; break;
        default: return false;
      }
      return value > rule.threshold.max || value < rule.threshold.min;
    }).length;

    return thresholdExceededCount >= (rule.threshold.duration * 60 / (this.config.collectionInterval / 1000));
  }

  /**
   * Execute scaling action
   */
  private async executeScalingAction(rule: ScalingRule, metrics: ResourceMetrics): Promise<void> {
    const action: ScalingAction = {
      id: this.generateActionId(),
      ruleId: rule.id,
      type: rule.action.type,
      status: 'pending',
      currentValue: this.getMetricValue(rule.metric, metrics),
      threshold: rule.threshold.max,
      startedAt: new Date(),
    };

    this.activeActions.set(action.id, action);
    this.lastScalingAction = new Date();

    try {
      action.status = 'running';
      console.log(`Executing scaling action: ${rule.name}`);

      switch (rule.action.type) {
        case 'scale_up':
          await this.scaleUp(rule.action.target);
          break;
        case 'scale_down':
          await this.scaleDown(rule.action.target);
          break;
        case 'restart':
          await this.restartServices();
          break;
        case 'alert':
          await this.sendScalingAlert(rule, metrics);
          break;
        case 'custom':
          await this.executeCustomAction(rule);
          break;
      }

      action.status = 'completed';
      action.completedAt = new Date();
      action.duration = action.completedAt.getTime() - action.startedAt.getTime();

      console.log(`Scaling action completed: ${rule.name}`);

    } catch (error) {
      action.status = 'failed';
      action.completedAt = new Date();
      action.duration = action.completedAt.getTime() - action.startedAt.getTime();
      action.error = error instanceof Error ? error.message : 'Unknown error';

      console.error(`Scaling action failed: ${rule.name}`, error);
    }

    // Store action in database
    await this.storeScalingAction(action);
  }

  /**
   * Scale up services
   */
  private async scaleUp(target: number): Promise<void> {
    console.log(`Scaling up to ${target} instances`);

    if (this.config.platforms.docker.enabled) {
      await this.scaleDockerService(target);
    }

    if (this.config.platforms.kubernetes.enabled) {
      await this.scaleKubernetesDeployment(target);
    }

    if (this.config.platforms.aws.enabled) {
      await this.scaleAWSAutoScalingGroup(target);
    }

    if (this.config.platforms.gcp.enabled) {
      await this.scaleGCPInstanceGroup(target);
    }
  }

  /**
   * Scale down services
   */
  private async scaleDown(target: number): Promise<void> {
    console.log(`Scaling down to ${target} instances`);

    if (this.config.platforms.docker.enabled) {
      await this.scaleDockerService(target);
    }

    if (this.config.platforms.kubernetes.enabled) {
      await this.scaleKubernetesDeployment(target);
    }

    if (this.config.platforms.aws.enabled) {
      await this.scaleAWSAutoScalingGroup(target);
    }

    if (this.config.platforms.gcp.enabled) {
      await this.scaleGCPInstanceGroup(target);
    }
  }

  /**
   * Scale Docker service
   */
  private async scaleDockerService(target: number): Promise<void> {
    const { composeFile, serviceName } = this.config.platforms.docker;
    const command = `docker-compose -f ${composeFile} up -d --scale ${serviceName}=${target}`;
    
    try {
      await execAsync(command);
      console.log(`Docker service scaled to ${target} instances`);
    } catch (error) {
      throw new Error(`Failed to scale Docker service: ${error}`);
    }
  }

  /**
   * Scale Kubernetes deployment
   */
  private async scaleKubernetesDeployment(target: number): Promise<void> {
    const { namespace, deployment } = this.config.platforms.kubernetes;
    const command = `kubectl scale deployment ${deployment} --replicas=${target} -n ${namespace}`;
    
    try {
      await execAsync(command);
      console.log(`Kubernetes deployment scaled to ${target} replicas`);
    } catch (error) {
      throw new Error(`Failed to scale Kubernetes deployment: ${error}`);
    }
  }

  /**
   * Scale AWS Auto Scaling Group
   */
  private async scaleAWSAutoScalingGroup(target: number): Promise<void> {
    const { region, autoScalingGroup } = this.config.platforms.aws;
    const command = `aws autoscaling set-desired-capacity --auto-scaling-group-name ${autoScalingGroup} --desired-capacity ${target} --region ${region}`;
    
    try {
      await execAsync(command);
      console.log(`AWS Auto Scaling Group scaled to ${target} instances`);
    } catch (error) {
      throw new Error(`Failed to scale AWS Auto Scaling Group: ${error}`);
    }
  }

  /**
   * Scale GCP Instance Group
   */
  private async scaleGCPInstanceGroup(target: number): Promise<void> {
    const { project, instanceGroup } = this.config.platforms.gcp;
    const command = `gcloud compute instance-groups managed resize ${instanceGroup} --size=${target} --project=${project}`;
    
    try {
      await execAsync(command);
      console.log(`GCP Instance Group scaled to ${target} instances`);
    } catch (error) {
      throw new Error(`Failed to scale GCP Instance Group: ${error}`);
    }
  }

  /**
   * Restart services
   */
  private async restartServices(): Promise<void> {
    console.log('Restarting services');

    if (this.config.platforms.docker.enabled) {
      const { composeFile } = this.config.platforms.docker;
      await execAsync(`docker-compose -f ${composeFile} restart`);
    }

    if (this.config.platforms.kubernetes.enabled) {
      const { namespace, deployment } = this.config.platforms.kubernetes;
      await execAsync(`kubectl rollout restart deployment ${deployment} -n ${namespace}`);
    }
  }

  /**
   * Send scaling alert
   */
  private async sendScalingAlert(rule: ScalingRule, metrics: ResourceMetrics): Promise<void> {
    const message = `Scaling alert triggered: ${rule.name}\n` +
                   `Metric: ${rule.metric}\n` +
                   `Current value: ${this.getMetricValue(rule.metric, metrics)}\n` +
                   `Threshold: ${rule.threshold.max}`;

    console.warn(message);

    // Send notifications via configured channels
    if (this.config.notificationChannels.email.length > 0) {
      await this.sendEmailAlert(message);
    }

    if (this.config.notificationChannels.webhook.length > 0) {
      await this.sendWebhookAlert(message);
    }

    if (this.config.notificationChannels.slack) {
      await this.sendSlackAlert(message);
    }
  }

  /**
   * Execute custom action
   */
  private async executeCustomAction(rule: ScalingRule): Promise<void> {
    // Implementation would depend on custom action configuration
    console.log(`Executing custom action for rule: ${rule.name}`);
  }

  /**
   * Utility methods
   */
  private isInTimeWindow(timeWindow: any): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = this.parseTime(timeWindow.start);
    const endTime = this.parseTime(timeWindow.end);
    const currentDay = now.getDay();

    // Check day of week
    if (timeWindow.days && !timeWindow.days.includes(currentDay)) {
      return false;
    }

    // Check time range
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Handle overnight time windows
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private getMetricValue(metric: string, metrics: ResourceMetrics): number {
    switch (metric) {
      case 'cpu': return metrics.cpu.usage;
      case 'memory': return metrics.memory.usage;
      case 'disk': return metrics.disk.usage;
      case 'network': return (metrics.network.bytesIn + metrics.network.bytesOut) / 1024 / 1024;
      default: return 0;
    }
  }

  private async storeResourceMetrics(metrics: ResourceMetrics): Promise<void> {
    if (!this.supabase) return;

    try {
      await this.supabase
        .from('resource_metrics')
        .insert({
          timestamp: metrics.timestamp.toISOString(),
          cpu_usage: metrics.cpu.usage,
          cpu_cores: metrics.cpu.cores,
          cpu_load_average: metrics.cpu.loadAverage,
          memory_total: metrics.memory.total,
          memory_used: metrics.memory.used,
          memory_free: metrics.memory.free,
          memory_usage: metrics.memory.usage,
          disk_total: metrics.disk.total,
          disk_used: metrics.disk.used,
          disk_free: metrics.disk.free,
          disk_usage: metrics.disk.usage,
          network_bytes_in: metrics.network.bytesIn,
          network_bytes_out: metrics.network.bytesOut,
          network_packets_in: metrics.network.packetsIn,
          network_packets_out: metrics.network.packetsOut,
          processes_total: metrics.processes.total,
          processes_running: metrics.processes.running,
          processes_sleeping: metrics.processes.sleeping,
          processes_zombie: metrics.processes.zombie,
        });
    } catch (error) {
      console.error('Failed to store resource metrics:', error);
    }
  }

  private async storeScalingAction(action: ScalingAction): Promise<void> {
    if (!this.supabase) return;

    try {
      await this.supabase
        .from('scaling_actions')
        .insert({
          id: action.id,
          rule_id: action.ruleId,
          type: action.type,
          status: action.status,
          target: action.target,
          current_value: action.currentValue,
          threshold: action.threshold,
          started_at: action.startedAt.toISOString(),
          completed_at: action.completedAt?.toISOString(),
          duration: action.duration,
          error: action.error,
          metadata: action.metadata,
        });
    } catch (error) {
      console.error('Failed to store scaling action:', error);
    }
  }

  private async sendEmailAlert(message: string): Promise<void> {
    // Implementation would send email alerts
    console.log('Email alert sent:', message);
  }

  private async sendWebhookAlert(message: string): Promise<void> {
    // Implementation would send webhook alerts
    console.log('Webhook alert sent:', message);
  }

  private async sendSlackAlert(message: string): Promise<void> {
    // Implementation would send Slack alerts
    console.log('Slack alert sent:', message);
  }

  private generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current resource metrics
   */
  async getCurrentMetrics(): Promise<ResourceMetrics | null> {
    return this.metricsHistory[this.metricsHistory.length - 1] || null;
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(hours: number = 24): ResourceMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metricsHistory.filter(m => m.timestamp >= cutoff);
  }

  /**
   * Get scaling actions history
   */
  async getScalingActionsHistory(hours: number = 24): Promise<ScalingAction[]> {
    if (!this.supabase) return [];

    try {
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
      const { data, error } = await this.supabase
        .from('scaling_actions')
        .select('*')
        .gte('started_at', cutoff.toISOString())
        .order('started_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((action: any) => ({
        id: action.id,
        ruleId: action.rule_id,
        type: action.type,
        status: action.status,
        target: action.target,
        currentValue: action.current_value,
        threshold: action.threshold,
        startedAt: new Date(action.started_at),
        completedAt: action.completed_at ? new Date(action.completed_at) : undefined,
        duration: action.duration,
        error: action.error,
        metadata: action.metadata,
      }));

    } catch (error) {
      console.error('Failed to get scaling actions history:', error);
      return [];
    }
  }
}

/**
 * Default scaling configuration
 */
export const defaultScalingConfig: ScalingConfig = {
  enableAutoScaling: true,
  enableResourceMonitoring: true,
  collectionInterval: 30000, // 30 seconds
  scalingCooldown: 5, // 5 minutes
  maxScaleUp: 10,
  minScaleDown: 1,
  defaultInstanceCount: 2,
  scalingRules: [
    {
      id: 'cpu_scale_up',
      name: 'CPU Scale Up',
      description: 'Scale up when CPU usage exceeds 80%',
      enabled: true,
      metric: 'cpu',
      threshold: {
        min: 0,
        max: 80,
        duration: 5, // 5 minutes
      },
      action: {
        type: 'scale_up',
        target: 3,
        cooldown: 5,
      },
      conditions: {},
    },
    {
      id: 'cpu_scale_down',
      name: 'CPU Scale Down',
      description: 'Scale down when CPU usage is below 20%',
      enabled: true,
      metric: 'cpu',
      threshold: {
        min: 20,
        max: 100,
        duration: 10, // 10 minutes
      },
      action: {
        type: 'scale_down',
        target: 1,
        cooldown: 10,
      },
      conditions: {},
    },
  ],
  notificationChannels: {
    email: [],
    webhook: [],
    slack: '',
  },
  platforms: {
    docker: {
      enabled: false,
      composeFile: 'docker-compose.yml',
      serviceName: 'app',
    },
    kubernetes: {
      enabled: false,
      namespace: 'default',
      deployment: 'app',
    },
    aws: {
      enabled: false,
      region: 'us-east-1',
      autoScalingGroup: 'app-asg',
    },
    gcp: {
      enabled: false,
      project: 'my-project',
      instanceGroup: 'app-ig',
    },
  },
};

/**
 * Create and start scaling manager
 */
export async function startScalingManager(config?: Partial<ScalingConfig>): Promise<ScalingManager> {
  const finalConfig = { ...defaultScalingConfig, ...config };
  const manager = new ScalingManager(finalConfig);
  await manager.start();
  return manager;
}
