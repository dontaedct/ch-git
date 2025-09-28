/**
 * Cross-Client Analytics Engine
 * Provides comprehensive analytics across all client deployments
 */

export interface ClientMetrics {
  clientId: string;
  clientName: string;
  deploymentDate: Date;
  status: 'active' | 'maintenance' | 'inactive';
  performance: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    trafficVolume: number;
  };
  usage: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    pageViews: number;
    sessionDuration: number;
  };
  customizations: {
    templateId: string;
    customizationCount: number;
    aiGeneratedFeatures: number;
    manualModifications: number;
  };
  revenue: {
    monthlyRevenue: number;
    totalRevenue: number;
    contractValue: number;
    renewalProbability: number;
  };
}

export interface CrossClientInsights {
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  averageClientValue: number;
  performanceMetrics: {
    averageUptime: number;
    averageResponseTime: number;
    totalTraffic: number;
    errorRateDistribution: number[];
  };
  usagePatterns: {
    peakUsageHours: number[];
    deviceDistribution: Record<string, number>;
    geographicDistribution: Record<string, number>;
    featureUsageFrequency: Record<string, number>;
  };
  customizationTrends: {
    popularTemplates: Array<{ templateId: string; usage: number }>;
    commonCustomizations: Array<{ type: string; frequency: number }>;
    aiVsManualRatio: number;
  };
}

export interface AnalyticsFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  clientIds?: string[];
  templateIds?: string[];
  performanceThreshold?: number;
  revenueRange?: {
    min: number;
    max: number;
  };
  status?: string[];
}

export class CrossClientAnalytics {
  private clientMetrics: Map<string, ClientMetrics> = new Map();
  private analyticsCache = new Map<string, any>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  async collectClientMetrics(clientId: string): Promise<ClientMetrics> {
    try {
      // Fetch metrics from various data sources
      const [performance, usage, customizations, revenue] = await Promise.all([
        this.fetchPerformanceMetrics(clientId),
        this.fetchUsageMetrics(clientId),
        this.fetchCustomizationMetrics(clientId),
        this.fetchRevenueMetrics(clientId)
      ]);

      const clientInfo = await this.fetchClientInfo(clientId);

      const metrics: ClientMetrics = {
        clientId,
        clientName: clientInfo.name,
        deploymentDate: clientInfo.deploymentDate,
        status: clientInfo.status,
        performance,
        usage,
        customizations,
        revenue
      };

      this.clientMetrics.set(clientId, metrics);
      return metrics;
    } catch (error) {
      console.error(`Failed to collect metrics for client ${clientId}:`, error);
      throw new Error(`Metrics collection failed: ${error}`);
    }
  }

  async getCrossClientInsights(filter: AnalyticsFilter = {}): Promise<CrossClientInsights> {
    const cacheKey = `insights_${JSON.stringify(filter)}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      const filteredMetrics = await this.getFilteredMetrics(filter);

      const insights: CrossClientInsights = {
        totalClients: filteredMetrics.length,
        activeClients: filteredMetrics.filter(m => m.status === 'active').length,
        totalRevenue: filteredMetrics.reduce((sum, m) => sum + m.revenue.totalRevenue, 0),
        averageClientValue: this.calculateAverageClientValue(filteredMetrics),
        performanceMetrics: this.aggregatePerformanceMetrics(filteredMetrics),
        usagePatterns: await this.analyzeUsagePatterns(filteredMetrics),
        customizationTrends: this.analyzeCustomizationTrends(filteredMetrics)
      };

      this.setCachedResult(cacheKey, insights);
      return insights;
    } catch (error) {
      console.error('Failed to generate cross-client insights:', error);
      throw new Error(`Insights generation failed: ${error}`);
    }
  }

  async getClientComparison(clientIds: string[]): Promise<Array<ClientMetrics & { rank: number }>> {
    try {
      const metrics = await Promise.all(
        clientIds.map(id => this.collectClientMetrics(id))
      );

      // Rank clients by composite score
      const rankedMetrics = metrics
        .map(metric => ({
          ...metric,
          rank: this.calculateClientRank(metric)
        }))
        .sort((a, b) => a.rank - b.rank);

      return rankedMetrics;
    } catch (error) {
      console.error('Failed to generate client comparison:', error);
      throw new Error(`Client comparison failed: ${error}`);
    }
  }

  async getPerformanceTrends(clientId?: string, days: number = 30): Promise<any> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      if (clientId) {
        return await this.getClientPerformanceTrends(clientId, startDate, endDate);
      } else {
        return await this.getCrossClientPerformanceTrends(startDate, endDate);
      }
    } catch (error) {
      console.error('Failed to get performance trends:', error);
      throw new Error(`Performance trends failed: ${error}`);
    }
  }

  async generateBusinessReport(filter: AnalyticsFilter = {}): Promise<any> {
    try {
      const insights = await this.getCrossClientInsights(filter);
      const trends = await this.getPerformanceTrends(undefined, 30);

      return {
        summary: {
          totalClients: insights.totalClients,
          totalRevenue: insights.totalRevenue,
          averageClientValue: insights.averageClientValue,
          growthRate: this.calculateGrowthRate(trends)
        },
        performance: insights.performanceMetrics,
        revenue: {
          monthly: this.calculateMonthlyRevenue(insights),
          quarterly: this.calculateQuarterlyRevenue(insights),
          projections: this.generateRevenueProjections(insights)
        },
        recommendations: this.generateBusinessRecommendations(insights),
        alerts: this.generatePerformanceAlerts(insights)
      };
    } catch (error) {
      console.error('Failed to generate business report:', error);
      throw new Error(`Business report generation failed: ${error}`);
    }
  }

  private async fetchPerformanceMetrics(clientId: string): Promise<ClientMetrics['performance']> {
    // Integration with monitoring systems
    return {
      uptime: 99.5,
      responseTime: 250,
      errorRate: 0.1,
      trafficVolume: 15000
    };
  }

  private async fetchUsageMetrics(clientId: string): Promise<ClientMetrics['usage']> {
    // Integration with analytics platforms
    return {
      dailyActiveUsers: 500,
      monthlyActiveUsers: 12000,
      pageViews: 45000,
      sessionDuration: 180
    };
  }

  private async fetchCustomizationMetrics(clientId: string): Promise<ClientMetrics['customizations']> {
    // Fetch from template and customization databases
    return {
      templateId: 'template-001',
      customizationCount: 15,
      aiGeneratedFeatures: 10,
      manualModifications: 5
    };
  }

  private async fetchRevenueMetrics(clientId: string): Promise<ClientMetrics['revenue']> {
    // Fetch from billing and CRM systems
    return {
      monthlyRevenue: 5000,
      totalRevenue: 60000,
      contractValue: 120000,
      renewalProbability: 0.85
    };
  }

  private async fetchClientInfo(clientId: string): Promise<any> {
    // Fetch from client management system
    return {
      name: `Client ${clientId}`,
      deploymentDate: new Date(),
      status: 'active'
    };
  }

  private async getFilteredMetrics(filter: AnalyticsFilter): Promise<ClientMetrics[]> {
    // Apply filters to metrics collection
    return Array.from(this.clientMetrics.values());
  }

  private calculateAverageClientValue(metrics: ClientMetrics[]): number {
    if (metrics.length === 0) return 0;
    const totalValue = metrics.reduce((sum, m) => sum + m.revenue.totalRevenue, 0);
    return totalValue / metrics.length;
  }

  private aggregatePerformanceMetrics(metrics: ClientMetrics[]): CrossClientInsights['performanceMetrics'] {
    if (metrics.length === 0) {
      return {
        averageUptime: 0,
        averageResponseTime: 0,
        totalTraffic: 0,
        errorRateDistribution: []
      };
    }

    return {
      averageUptime: metrics.reduce((sum, m) => sum + m.performance.uptime, 0) / metrics.length,
      averageResponseTime: metrics.reduce((sum, m) => sum + m.performance.responseTime, 0) / metrics.length,
      totalTraffic: metrics.reduce((sum, m) => sum + m.performance.trafficVolume, 0),
      errorRateDistribution: metrics.map(m => m.performance.errorRate)
    };
  }

  private async analyzeUsagePatterns(metrics: ClientMetrics[]): Promise<CrossClientInsights['usagePatterns']> {
    // Analyze usage patterns across clients
    return {
      peakUsageHours: [9, 10, 11, 14, 15, 16],
      deviceDistribution: { desktop: 60, mobile: 35, tablet: 5 },
      geographicDistribution: { 'North America': 45, 'Europe': 30, 'Asia': 25 },
      featureUsageFrequency: { 'dashboard': 95, 'reports': 80, 'settings': 65 }
    };
  }

  private analyzeCustomizationTrends(metrics: ClientMetrics[]): CrossClientInsights['customizationTrends'] {
    const templateUsage = new Map<string, number>();
    let totalAi = 0, totalManual = 0;

    metrics.forEach(metric => {
      const templateId = metric.customizations.templateId;
      templateUsage.set(templateId, (templateUsage.get(templateId) || 0) + 1);
      totalAi += metric.customizations.aiGeneratedFeatures;
      totalManual += metric.customizations.manualModifications;
    });

    return {
      popularTemplates: Array.from(templateUsage.entries())
        .map(([templateId, usage]) => ({ templateId, usage }))
        .sort((a, b) => b.usage - a.usage),
      commonCustomizations: [
        { type: 'branding', frequency: 90 },
        { type: 'layout', frequency: 75 },
        { type: 'features', frequency: 60 }
      ],
      aiVsManualRatio: totalManual > 0 ? totalAi / totalManual : totalAi
    };
  }

  private calculateClientRank(metric: ClientMetrics): number {
    // Composite scoring algorithm
    const performanceScore = metric.performance.uptime * 0.3 +
                           (1000 - metric.performance.responseTime) * 0.2 +
                           (100 - metric.performance.errorRate * 100) * 0.2;
    const revenueScore = metric.revenue.totalRevenue / 1000;
    const usageScore = metric.usage.monthlyActiveUsers / 100;

    return performanceScore + revenueScore + usageScore;
  }

  private async getClientPerformanceTrends(clientId: string, startDate: Date, endDate: Date): Promise<any> {
    // Fetch historical performance data for specific client
    return {
      uptime: [99.2, 99.5, 99.8, 99.1, 99.6],
      responseTime: [280, 250, 230, 270, 245],
      errorRate: [0.2, 0.1, 0.05, 0.15, 0.08]
    };
  }

  private async getCrossClientPerformanceTrends(startDate: Date, endDate: Date): Promise<any> {
    // Fetch aggregated performance trends
    return {
      averageUptime: [99.0, 99.3, 99.5, 99.2, 99.4],
      averageResponseTime: [300, 280, 260, 275, 265],
      totalTraffic: [125000, 135000, 142000, 138000, 145000]
    };
  }

  private calculateGrowthRate(trends: any): number {
    // Calculate growth rate from trends data
    return 15.5; // Example growth rate percentage
  }

  private calculateMonthlyRevenue(insights: CrossClientInsights): number {
    return insights.totalRevenue / 12; // Simplified calculation
  }

  private calculateQuarterlyRevenue(insights: CrossClientInsights): number {
    return insights.totalRevenue / 4; // Simplified calculation
  }

  private generateRevenueProjections(insights: CrossClientInsights): any {
    return {
      nextMonth: insights.totalRevenue * 1.05,
      nextQuarter: insights.totalRevenue * 1.15,
      nextYear: insights.totalRevenue * 1.5
    };
  }

  private generateBusinessRecommendations(insights: CrossClientInsights): string[] {
    const recommendations: string[] = [];

    if (insights.performanceMetrics.averageUptime < 99.0) {
      recommendations.push('Improve infrastructure reliability to increase uptime');
    }

    if (insights.performanceMetrics.averageResponseTime > 500) {
      recommendations.push('Optimize application performance to reduce response times');
    }

    if (insights.averageClientValue < 50000) {
      recommendations.push('Focus on higher-value client acquisition and upselling');
    }

    return recommendations;
  }

  private generatePerformanceAlerts(insights: CrossClientInsights): any[] {
    const alerts: any[] = [];

    if (insights.performanceMetrics.averageUptime < 95.0) {
      alerts.push({
        type: 'critical',
        message: 'Critical uptime issues detected across multiple clients',
        priority: 'high'
      });
    }

    return alerts;
  }

  private getCachedResult(key: string): any {
    const cached = this.analyticsCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  private setCachedResult(key: string, data: any): void {
    this.analyticsCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

export const crossClientAnalytics = new CrossClientAnalytics();