/**
 * Performance Metrics Aggregation System
 * Comprehensive performance monitoring and metrics collection
 */

export interface SystemPerformanceMetrics {
  timestamp: Date;
  systemId: string;
  clientId?: string;
  metrics: {
    cpu: {
      usage: number;
      cores: number;
      loadAverage: number[];
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
      heap: {
        used: number;
        total: number;
      };
    };
    network: {
      bytesIn: number;
      bytesOut: number;
      packetsIn: number;
      packetsOut: number;
      latency: number;
    };
    storage: {
      used: number;
      total: number;
      percentage: number;
      iops: number;
    };
  };
  application: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    activeConnections: number;
    queueDepth: number;
  };
  database: {
    connectionPool: {
      active: number;
      idle: number;
      total: number;
    };
    queryPerformance: {
      averageTime: number;
      slowQueries: number;
      deadlocks: number;
    };
  };
}

export interface ApplicationMetrics {
  timestamp: Date;
  applicationId: string;
  clientId: string;
  performance: {
    pageLoadTime: number;
    timeToFirstByte: number;
    timeToInteractive: number;
    cumulativeLayoutShift: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
  };
  userExperience: {
    bounceRate: number;
    sessionDuration: number;
    pageViews: number;
    userSatisfactionScore: number;
    conversionRate: number;
  };
  technical: {
    jsErrors: number;
    apiErrors: number;
    slowRequests: number;
    cacheHitRate: number;
    cdnPerformance: number;
  };
  business: {
    activeUsers: number;
    featureUsage: Record<string, number>;
    goalCompletions: number;
    revenuePerSession: number;
  };
}

export interface AggregatedMetrics {
  period: { start: Date; end: Date };
  systemMetrics: {
    averageCpuUsage: number;
    averageMemoryUsage: number;
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
    uptime: number;
  };
  applicationMetrics: {
    averagePageLoadTime: number;
    averageSessionDuration: number;
    totalPageViews: number;
    averageUserSatisfaction: number;
    conversionRate: number;
  };
  performanceTrends: {
    cpuTrend: 'increasing' | 'decreasing' | 'stable';
    memoryTrend: 'increasing' | 'decreasing' | 'stable';
    responseTrend: 'improving' | 'degrading' | 'stable';
    errorTrend: 'increasing' | 'decreasing' | 'stable';
  };
  alerts: Array<{
    type: 'warning' | 'critical' | 'info';
    metric: string;
    value: number;
    threshold: number;
    message: string;
  }>;
}

export interface PerformanceInsights {
  bottlenecks: Array<{
    component: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
    recommendation: string;
  }>;
  optimizations: Array<{
    area: string;
    currentValue: number;
    potentialImprovement: number;
    effortRequired: 'low' | 'medium' | 'high';
    priority: number;
  }>;
  benchmarks: {
    industryAverage: Record<string, number>;
    topPerformers: Record<string, number>;
    ourPosition: Record<string, number>;
  };
  forecasting: {
    resourceNeeds: {
      cpu: number;
      memory: number;
      storage: number;
      bandwidth: number;
    };
    scalingRecommendations: string[];
    costImpact: number;
  };
}

export class PerformanceMetricsAggregator {
  private systemMetrics: Map<string, SystemPerformanceMetrics[]> = new Map();
  private applicationMetrics: Map<string, ApplicationMetrics[]> = new Map();
  private metricsCache = new Map<string, any>();
  private alertThresholds = {
    cpuUsage: 80,
    memoryUsage: 85,
    responseTime: 1000,
    errorRate: 5,
    diskUsage: 90
  };

  async collectSystemMetrics(metrics: SystemPerformanceMetrics): Promise<void> {
    try {
      const systemId = metrics.systemId;
      const existingMetrics = this.systemMetrics.get(systemId) || [];
      existingMetrics.push(metrics);

      // Keep only last 1000 metrics per system
      if (existingMetrics.length > 1000) {
        existingMetrics.splice(0, existingMetrics.length - 1000);
      }

      this.systemMetrics.set(systemId, existingMetrics);

      await this.persistSystemMetrics(metrics);
      await this.checkAlerts(metrics);
      this.invalidateCache(`system_${systemId}`);
    } catch (error) {
      console.error('Failed to collect system metrics:', error);
      throw new Error(`System metrics collection failed: ${error}`);
    }
  }

  async collectApplicationMetrics(metrics: ApplicationMetrics): Promise<void> {
    try {
      const appId = metrics.applicationId;
      const existingMetrics = this.applicationMetrics.get(appId) || [];
      existingMetrics.push(metrics);

      // Keep only last 1000 metrics per application
      if (existingMetrics.length > 1000) {
        existingMetrics.splice(0, existingMetrics.length - 1000);
      }

      this.applicationMetrics.set(appId, existingMetrics);

      await this.persistApplicationMetrics(metrics);
      await this.checkApplicationAlerts(metrics);
      this.invalidateCache(`app_${appId}`);
    } catch (error) {
      console.error('Failed to collect application metrics:', error);
      throw new Error(`Application metrics collection failed: ${error}`);
    }
  }

  async getAggregatedMetrics(
    period: { start: Date; end: Date },
    systemId?: string,
    clientId?: string
  ): Promise<AggregatedMetrics> {
    const cacheKey = `aggregated_${period.start.toISOString()}_${period.end.toISOString()}_${systemId || 'all'}_${clientId || 'all'}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      const [systemMetrics, applicationMetrics] = await Promise.all([
        this.aggregateSystemMetrics(period, systemId, clientId),
        this.aggregateApplicationMetrics(period, clientId)
      ]);

      const trends = this.calculateTrends(systemMetrics);
      const alerts = this.generateAlerts(systemMetrics, applicationMetrics);

      const aggregated: AggregatedMetrics = {
        period,
        systemMetrics,
        applicationMetrics,
        performanceTrends: trends,
        alerts
      };

      this.setCachedResult(cacheKey, aggregated);
      return aggregated;
    } catch (error) {
      console.error('Failed to get aggregated metrics:', error);
      throw new Error(`Metrics aggregation failed: ${error}`);
    }
  }

  async getPerformanceInsights(
    period: { start: Date; end: Date },
    clientId?: string
  ): Promise<PerformanceInsights> {
    try {
      const aggregated = await this.getAggregatedMetrics(period, undefined, clientId);

      const [bottlenecks, optimizations, benchmarks, forecasting] = await Promise.all([
        this.identifyBottlenecks(aggregated),
        this.identifyOptimizations(aggregated),
        this.generateBenchmarks(aggregated),
        this.generateForecastingInsights(aggregated)
      ]);

      return {
        bottlenecks,
        optimizations,
        benchmarks,
        forecasting
      };
    } catch (error) {
      console.error('Failed to get performance insights:', error);
      throw new Error(`Performance insights generation failed: ${error}`);
    }
  }

  async getSystemPerformanceReport(
    systemId: string,
    period: { start: Date; end: Date }
  ): Promise<any> {
    try {
      const metrics = this.systemMetrics.get(systemId) || [];
      const filteredMetrics = metrics.filter(m =>
        m.timestamp >= period.start && m.timestamp <= period.end
      );

      if (filteredMetrics.length === 0) {
        return { error: 'No metrics found for the specified period' };
      }

      return {
        systemId,
        period,
        summary: {
          dataPoints: filteredMetrics.length,
          averageCpuUsage: this.calculateAverage(filteredMetrics, 'metrics.cpu.usage'),
          averageMemoryUsage: this.calculateAverage(filteredMetrics, 'metrics.memory.percentage'),
          averageResponseTime: this.calculateAverage(filteredMetrics, 'application.responseTime'),
          totalErrors: filteredMetrics.reduce((sum, m) => sum + (m.application.errorRate || 0), 0),
          uptime: this.calculateUptime(filteredMetrics)
        },
        trends: {
          cpu: this.calculateMetricTrend(filteredMetrics, 'metrics.cpu.usage'),
          memory: this.calculateMetricTrend(filteredMetrics, 'metrics.memory.percentage'),
          response: this.calculateMetricTrend(filteredMetrics, 'application.responseTime'),
          throughput: this.calculateMetricTrend(filteredMetrics, 'application.throughput')
        },
        peaks: {
          maxCpuUsage: Math.max(...filteredMetrics.map(m => m.metrics.cpu.usage)),
          maxMemoryUsage: Math.max(...filteredMetrics.map(m => m.metrics.memory.percentage)),
          maxResponseTime: Math.max(...filteredMetrics.map(m => m.application.responseTime))
        },
        recommendations: this.generateSystemRecommendations(filteredMetrics)
      };
    } catch (error) {
      console.error('Failed to generate system performance report:', error);
      throw new Error(`System performance report failed: ${error}`);
    }
  }

  async getApplicationPerformanceReport(
    applicationId: string,
    period: { start: Date; end: Date }
  ): Promise<any> {
    try {
      const metrics = this.applicationMetrics.get(applicationId) || [];
      const filteredMetrics = metrics.filter(m =>
        m.timestamp >= period.start && m.timestamp <= period.end
      );

      if (filteredMetrics.length === 0) {
        return { error: 'No metrics found for the specified period' };
      }

      return {
        applicationId,
        period,
        summary: {
          dataPoints: filteredMetrics.length,
          averagePageLoadTime: this.calculateAverage(filteredMetrics, 'performance.pageLoadTime'),
          averageSessionDuration: this.calculateAverage(filteredMetrics, 'userExperience.sessionDuration'),
          totalPageViews: filteredMetrics.reduce((sum, m) => sum + m.userExperience.pageViews, 0),
          averageUserSatisfaction: this.calculateAverage(filteredMetrics, 'userExperience.userSatisfactionScore'),
          conversionRate: this.calculateAverage(filteredMetrics, 'userExperience.conversionRate')
        },
        performance: {
          coreWebVitals: {
            lcp: this.calculateAverage(filteredMetrics, 'performance.largestContentfulPaint'),
            fcp: this.calculateAverage(filteredMetrics, 'performance.firstContentfulPaint'),
            cls: this.calculateAverage(filteredMetrics, 'performance.cumulativeLayoutShift')
          },
          errors: {
            jsErrors: filteredMetrics.reduce((sum, m) => sum + m.technical.jsErrors, 0),
            apiErrors: filteredMetrics.reduce((sum, m) => sum + m.technical.apiErrors, 0),
            slowRequests: filteredMetrics.reduce((sum, m) => sum + m.technical.slowRequests, 0)
          }
        },
        business: {
          totalActiveUsers: Math.max(...filteredMetrics.map(m => m.business.activeUsers)),
          totalGoalCompletions: filteredMetrics.reduce((sum, m) => sum + m.business.goalCompletions, 0),
          averageRevenuePerSession: this.calculateAverage(filteredMetrics, 'business.revenuePerSession')
        },
        recommendations: this.generateApplicationRecommendations(filteredMetrics)
      };
    } catch (error) {
      console.error('Failed to generate application performance report:', error);
      throw new Error(`Application performance report failed: ${error}`);
    }
  }

  async getClientPerformanceComparison(clientIds: string[]): Promise<any> {
    try {
      const comparisons = await Promise.all(
        clientIds.map(async clientId => {
          const period = {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date()
          };

          const metrics = await this.getAggregatedMetrics(period, undefined, clientId);
          return {
            clientId,
            metrics: {
              averageResponseTime: metrics.systemMetrics.averageResponseTime,
              errorRate: metrics.systemMetrics.errorRate,
              uptime: metrics.systemMetrics.uptime,
              userSatisfaction: metrics.applicationMetrics.averageUserSatisfaction,
              conversionRate: metrics.applicationMetrics.conversionRate
            }
          };
        })
      );

      const rankings = this.rankClientPerformance(comparisons);

      return {
        comparisons,
        rankings,
        insights: this.generateComparisonInsights(comparisons),
        recommendations: this.generateClientComparisonRecommendations(comparisons)
      };
    } catch (error) {
      console.error('Failed to get client performance comparison:', error);
      throw new Error(`Client performance comparison failed: ${error}`);
    }
  }

  private async persistSystemMetrics(metrics: SystemPerformanceMetrics): Promise<void> {
    // Persist to time-series database (InfluxDB, TimescaleDB, etc.)
    console.log(`Persisting system metrics for ${metrics.systemId}`);
  }

  private async persistApplicationMetrics(metrics: ApplicationMetrics): Promise<void> {
    // Persist to time-series database
    console.log(`Persisting application metrics for ${metrics.applicationId}`);
  }

  private async checkAlerts(metrics: SystemPerformanceMetrics): Promise<void> {
    const alerts: any[] = [];

    if (metrics.metrics.cpu.usage > this.alertThresholds.cpuUsage) {
      alerts.push({
        type: 'warning',
        metric: 'CPU Usage',
        value: metrics.metrics.cpu.usage,
        threshold: this.alertThresholds.cpuUsage,
        message: `High CPU usage: ${metrics.metrics.cpu.usage}%`
      });
    }

    if (metrics.metrics.memory.percentage > this.alertThresholds.memoryUsage) {
      alerts.push({
        type: 'warning',
        metric: 'Memory Usage',
        value: metrics.metrics.memory.percentage,
        threshold: this.alertThresholds.memoryUsage,
        message: `High memory usage: ${metrics.metrics.memory.percentage}%`
      });
    }

    if (metrics.application.responseTime > this.alertThresholds.responseTime) {
      alerts.push({
        type: 'warning',
        metric: 'Response Time',
        value: metrics.application.responseTime,
        threshold: this.alertThresholds.responseTime,
        message: `High response time: ${metrics.application.responseTime}ms`
      });
    }

    if (alerts.length > 0) {
      await this.sendAlerts(alerts, metrics.systemId);
    }
  }

  private async checkApplicationAlerts(metrics: ApplicationMetrics): Promise<void> {
    const alerts: any[] = [];

    if (metrics.performance.pageLoadTime > 3000) {
      alerts.push({
        type: 'warning',
        metric: 'Page Load Time',
        value: metrics.performance.pageLoadTime,
        threshold: 3000,
        message: `Slow page load time: ${metrics.performance.pageLoadTime}ms`
      });
    }

    if (metrics.userExperience.userSatisfactionScore < 7) {
      alerts.push({
        type: 'warning',
        metric: 'User Satisfaction',
        value: metrics.userExperience.userSatisfactionScore,
        threshold: 7,
        message: `Low user satisfaction: ${metrics.userExperience.userSatisfactionScore}/10`
      });
    }

    if (alerts.length > 0) {
      await this.sendAlerts(alerts, metrics.applicationId);
    }
  }

  private async sendAlerts(alerts: any[], entityId: string): Promise<void> {
    // Send alerts via notification system
    console.log(`Sending ${alerts.length} alerts for ${entityId}:`, alerts);
  }

  private async aggregateSystemMetrics(
    period: { start: Date; end: Date },
    systemId?: string,
    clientId?: string
  ): Promise<AggregatedMetrics['systemMetrics']> {
    let allMetrics: SystemPerformanceMetrics[] = [];

    if (systemId) {
      allMetrics = this.systemMetrics.get(systemId) || [];
    } else {
      allMetrics = Array.from(this.systemMetrics.values()).flat();
    }

    const filteredMetrics = allMetrics.filter(m =>
      m.timestamp >= period.start &&
      m.timestamp <= period.end &&
      (!clientId || m.clientId === clientId)
    );

    if (filteredMetrics.length === 0) {
      return {
        averageCpuUsage: 0,
        averageMemoryUsage: 0,
        averageResponseTime: 0,
        totalRequests: 0,
        errorRate: 0,
        uptime: 0
      };
    }

    return {
      averageCpuUsage: this.calculateAverage(filteredMetrics, 'metrics.cpu.usage'),
      averageMemoryUsage: this.calculateAverage(filteredMetrics, 'metrics.memory.percentage'),
      averageResponseTime: this.calculateAverage(filteredMetrics, 'application.responseTime'),
      totalRequests: filteredMetrics.reduce((sum, m) => sum + m.application.throughput, 0),
      errorRate: this.calculateAverage(filteredMetrics, 'application.errorRate'),
      uptime: this.calculateUptime(filteredMetrics)
    };
  }

  private async aggregateApplicationMetrics(
    period: { start: Date; end: Date },
    clientId?: string
  ): Promise<AggregatedMetrics['applicationMetrics']> {
    const allMetrics = Array.from(this.applicationMetrics.values()).flat();
    const filteredMetrics = allMetrics.filter(m =>
      m.timestamp >= period.start &&
      m.timestamp <= period.end &&
      (!clientId || m.clientId === clientId)
    );

    if (filteredMetrics.length === 0) {
      return {
        averagePageLoadTime: 0,
        averageSessionDuration: 0,
        totalPageViews: 0,
        averageUserSatisfaction: 0,
        conversionRate: 0
      };
    }

    return {
      averagePageLoadTime: this.calculateAverage(filteredMetrics, 'performance.pageLoadTime'),
      averageSessionDuration: this.calculateAverage(filteredMetrics, 'userExperience.sessionDuration'),
      totalPageViews: filteredMetrics.reduce((sum, m) => sum + m.userExperience.pageViews, 0),
      averageUserSatisfaction: this.calculateAverage(filteredMetrics, 'userExperience.userSatisfactionScore'),
      conversionRate: this.calculateAverage(filteredMetrics, 'userExperience.conversionRate')
    };
  }

  private calculateTrends(systemMetrics: AggregatedMetrics['systemMetrics']): AggregatedMetrics['performanceTrends'] {
    // Simplified trend calculation - in practice, this would use historical data
    return {
      cpuTrend: systemMetrics.averageCpuUsage > 70 ? 'increasing' : 'stable',
      memoryTrend: systemMetrics.averageMemoryUsage > 80 ? 'increasing' : 'stable',
      responseTrend: systemMetrics.averageResponseTime > 500 ? 'degrading' : 'stable',
      errorTrend: systemMetrics.errorRate > 2 ? 'increasing' : 'stable'
    };
  }

  private generateAlerts(
    systemMetrics: AggregatedMetrics['systemMetrics'],
    applicationMetrics: AggregatedMetrics['applicationMetrics']
  ): AggregatedMetrics['alerts'] {
    const alerts: AggregatedMetrics['alerts'] = [];

    if (systemMetrics.averageCpuUsage > this.alertThresholds.cpuUsage) {
      alerts.push({
        type: 'warning',
        metric: 'Average CPU Usage',
        value: systemMetrics.averageCpuUsage,
        threshold: this.alertThresholds.cpuUsage,
        message: `High average CPU usage: ${systemMetrics.averageCpuUsage.toFixed(1)}%`
      });
    }

    if (systemMetrics.averageResponseTime > this.alertThresholds.responseTime) {
      alerts.push({
        type: 'warning',
        metric: 'Average Response Time',
        value: systemMetrics.averageResponseTime,
        threshold: this.alertThresholds.responseTime,
        message: `High average response time: ${systemMetrics.averageResponseTime.toFixed(0)}ms`
      });
    }

    return alerts;
  }

  private async identifyBottlenecks(aggregated: AggregatedMetrics): Promise<PerformanceInsights['bottlenecks']> {
    const bottlenecks: PerformanceInsights['bottlenecks'] = [];

    if (aggregated.systemMetrics.averageCpuUsage > 80) {
      bottlenecks.push({
        component: 'CPU',
        severity: 'high',
        impact: 'System performance degradation',
        recommendation: 'Consider CPU upgrade or load balancing'
      });
    }

    if (aggregated.systemMetrics.averageResponseTime > 1000) {
      bottlenecks.push({
        component: 'Application Response',
        severity: 'medium',
        impact: 'Poor user experience',
        recommendation: 'Optimize database queries and caching'
      });
    }

    return bottlenecks;
  }

  private async identifyOptimizations(aggregated: AggregatedMetrics): Promise<PerformanceInsights['optimizations']> {
    return [
      {
        area: 'Database Query Optimization',
        currentValue: 250,
        potentialImprovement: 40,
        effortRequired: 'medium',
        priority: 8
      },
      {
        area: 'CDN Implementation',
        currentValue: 1200,
        potentialImprovement: 60,
        effortRequired: 'low',
        priority: 9
      }
    ];
  }

  private async generateBenchmarks(aggregated: AggregatedMetrics): Promise<PerformanceInsights['benchmarks']> {
    return {
      industryAverage: {
        responseTime: 800,
        uptime: 99.0,
        errorRate: 3.0
      },
      topPerformers: {
        responseTime: 300,
        uptime: 99.9,
        errorRate: 0.5
      },
      ourPosition: {
        responseTime: aggregated.systemMetrics.averageResponseTime,
        uptime: aggregated.systemMetrics.uptime,
        errorRate: aggregated.systemMetrics.errorRate
      }
    };
  }

  private async generateForecastingInsights(aggregated: AggregatedMetrics): Promise<PerformanceInsights['forecasting']> {
    return {
      resourceNeeds: {
        cpu: 1.2, // 20% increase needed
        memory: 1.15, // 15% increase needed
        storage: 1.3, // 30% increase needed
        bandwidth: 1.1 // 10% increase needed
      },
      scalingRecommendations: [
        'Add 2 additional application servers',
        'Implement database read replicas',
        'Upgrade CDN plan for better performance'
      ],
      costImpact: 15000 // Monthly cost increase estimate
    };
  }

  private calculateAverage(metrics: any[], path: string): number {
    const values = metrics.map(m => this.getNestedValue(m, path)).filter(v => v !== undefined);
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private calculateUptime(metrics: SystemPerformanceMetrics[]): number {
    // Simplified uptime calculation
    const totalDataPoints = metrics.length;
    const healthyDataPoints = metrics.filter(m =>
      m.application.errorRate < 10 && m.application.responseTime < 5000
    ).length;

    return totalDataPoints > 0 ? (healthyDataPoints / totalDataPoints) * 100 : 0;
  }

  private calculateMetricTrend(metrics: any[], path: string): 'increasing' | 'decreasing' | 'stable' {
    const values = metrics.map(m => this.getNestedValue(m, path)).filter(v => v !== undefined);
    if (values.length < 2) return 'stable';

    const first = values.slice(0, Math.floor(values.length / 2));
    const second = values.slice(Math.floor(values.length / 2));

    const firstAvg = first.reduce((sum, val) => sum + val, 0) / first.length;
    const secondAvg = second.reduce((sum, val) => sum + val, 0) / second.length;

    const change = (secondAvg - firstAvg) / firstAvg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private generateSystemRecommendations(metrics: SystemPerformanceMetrics[]): string[] {
    const recommendations: string[] = [];
    const avgCpu = this.calculateAverage(metrics, 'metrics.cpu.usage');
    const avgMemory = this.calculateAverage(metrics, 'metrics.memory.percentage');
    const avgResponse = this.calculateAverage(metrics, 'application.responseTime');

    if (avgCpu > 70) {
      recommendations.push('Consider CPU optimization or scaling');
    }
    if (avgMemory > 80) {
      recommendations.push('Investigate memory leaks or increase memory allocation');
    }
    if (avgResponse > 1000) {
      recommendations.push('Optimize application performance and database queries');
    }

    return recommendations;
  }

  private generateApplicationRecommendations(metrics: ApplicationMetrics[]): string[] {
    const recommendations: string[] = [];
    const avgPageLoad = this.calculateAverage(metrics, 'performance.pageLoadTime');
    const avgSatisfaction = this.calculateAverage(metrics, 'userExperience.userSatisfactionScore');

    if (avgPageLoad > 3000) {
      recommendations.push('Optimize page load times through code splitting and lazy loading');
    }
    if (avgSatisfaction < 7) {
      recommendations.push('Focus on user experience improvements');
    }

    return recommendations;
  }

  private rankClientPerformance(comparisons: any[]): any[] {
    return comparisons
      .map(comp => ({
        ...comp,
        score: this.calculatePerformanceScore(comp.metrics)
      }))
      .sort((a, b) => b.score - a.score)
      .map((comp, index) => ({ ...comp, rank: index + 1 }));
  }

  private calculatePerformanceScore(metrics: any): number {
    const responseScore = Math.max(0, 100 - (metrics.averageResponseTime / 10));
    const errorScore = Math.max(0, 100 - (metrics.errorRate * 20));
    const uptimeScore = metrics.uptime;
    const satisfactionScore = metrics.userSatisfaction * 10;

    return (responseScore + errorScore + uptimeScore + satisfactionScore) / 4;
  }

  private generateComparisonInsights(comparisons: any[]): string[] {
    const insights: string[] = [];
    const scores = comparisons.map(c => this.calculatePerformanceScore(c.metrics));
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);

    insights.push(`Average performance score: ${avgScore.toFixed(1)}/100`);
    insights.push(`Performance gap between best and worst: ${(bestScore - worstScore).toFixed(1)} points`);

    return insights;
  }

  private generateClientComparisonRecommendations(comparisons: any[]): string[] {
    const recommendations: string[] = [];
    const poorPerformers = comparisons.filter(c =>
      this.calculatePerformanceScore(c.metrics) < 70
    );

    if (poorPerformers.length > 0) {
      recommendations.push(`${poorPerformers.length} clients need performance attention`);
      recommendations.push('Focus on infrastructure optimization for underperforming clients');
    }

    return recommendations;
  }

  private invalidateCache(pattern: string): void {
    for (const key of this.metricsCache.keys()) {
      if (key.includes(pattern)) {
        this.metricsCache.delete(key);
      }
    }
  }

  private getCachedResult(key: string): any {
    const cached = this.metricsCache.get(key);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
      return cached.data;
    }
    return null;
  }

  private setCachedResult(key: string, data: any): void {
    this.metricsCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

export const performanceMetricsAggregator = new PerformanceMetricsAggregator();