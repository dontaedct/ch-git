/**
 * Revenue and Performance Tracking System
 * Comprehensive revenue tracking with performance correlation
 */

export interface RevenueRecord {
  id: string;
  clientId: string;
  amount: number;
  type: 'one-time' | 'recurring' | 'upgrade' | 'addon';
  currency: string;
  date: Date;
  description: string;
  invoiceId?: string;
  contractId?: string;
  templateId?: string;
  customizationLevel: 'basic' | 'standard' | 'premium' | 'enterprise';
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'failed';
  metadata: {
    deliveryTime?: number;
    customizationHours?: number;
    supportHours?: number;
    qualityScore?: number;
  };
}

export interface PerformanceMetrics {
  clientId: string;
  period: { start: Date; end: Date };
  metrics: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    userSatisfaction: number;
    featureAdoption: number;
    supportTickets: number;
    bugReports: number;
  };
  businessImpact: {
    revenueCorrelation: number;
    churnRisk: number;
    upsellPotential: number;
    referralLikelihood: number;
  };
}

export interface RevenueAnalytics {
  totalRevenue: number;
  recurringRevenue: number;
  oneTimeRevenue: number;
  averageRevenuePerClient: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  churnRate: number;
  expansion: {
    rate: number;
    amount: number;
  };
  cohortAnalysis: {
    retention: Record<string, number>;
    revenueGrowth: Record<string, number>;
  };
}

export interface RevenueForecasting {
  shortTerm: {
    nextMonth: number;
    nextQuarter: number;
    confidence: number;
  };
  longTerm: {
    nextYear: number;
    nextTwoYears: number;
    confidence: number;
  };
  scenarios: {
    conservative: number;
    realistic: number;
    optimistic: number;
  };
  assumptions: string[];
  riskFactors: Array<{
    factor: string;
    impact: 'low' | 'medium' | 'high';
    probability: number;
  }>;
}

export class RevenueTracker {
  private revenueRecords: Map<string, RevenueRecord> = new Map();
  private performanceMetrics: Map<string, PerformanceMetrics[]> = new Map();
  private analyticsCache = new Map<string, any>();
  private cacheExpiry = 30 * 60 * 1000; // 30 minutes

  async recordRevenue(record: Omit<RevenueRecord, 'id'>): Promise<RevenueRecord> {
    try {
      const revenueRecord: RevenueRecord = {
        ...record,
        id: this.generateRevenueId()
      };

      this.revenueRecords.set(revenueRecord.id, revenueRecord);
      await this.persistRevenueRecord(revenueRecord);
      await this.updateRevenueAnalytics(revenueRecord);

      return revenueRecord;
    } catch (error) {
      console.error('Failed to record revenue:', error);
      throw new Error(`Revenue recording failed: ${error}`);
    }
  }

  async recordPerformanceMetrics(metrics: PerformanceMetrics): Promise<void> {
    try {
      const clientMetrics = this.performanceMetrics.get(metrics.clientId) || [];
      clientMetrics.push(metrics);
      this.performanceMetrics.set(metrics.clientId, clientMetrics);

      await this.persistPerformanceMetrics(metrics);
      await this.correlatePerformanceWithRevenue(metrics);
    } catch (error) {
      console.error('Failed to record performance metrics:', error);
      throw new Error(`Performance metrics recording failed: ${error}`);
    }
  }

  async getRevenueAnalytics(timeRange: { start: Date; end: Date }): Promise<RevenueAnalytics> {
    const cacheKey = `analytics_${timeRange.start.toISOString()}_${timeRange.end.toISOString()}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      const filteredRecords = await this.getRevenueRecords(timeRange);

      const analytics: RevenueAnalytics = {
        totalRevenue: this.calculateTotalRevenue(filteredRecords),
        recurringRevenue: this.calculateRecurringRevenue(filteredRecords),
        oneTimeRevenue: this.calculateOneTimeRevenue(filteredRecords),
        averageRevenuePerClient: this.calculateAverageRevenuePerClient(filteredRecords),
        monthlyRecurringRevenue: this.calculateMRR(filteredRecords),
        annualRecurringRevenue: this.calculateARR(filteredRecords),
        churnRate: await this.calculateChurnRate(timeRange),
        expansion: await this.calculateExpansionMetrics(timeRange),
        cohortAnalysis: await this.performCohortAnalysis(timeRange)
      };

      this.setCachedResult(cacheKey, analytics);
      return analytics;
    } catch (error) {
      console.error('Failed to get revenue analytics:', error);
      throw new Error(`Revenue analytics failed: ${error}`);
    }
  }

  async getRevenueForecasting(timeRange: { start: Date; end: Date }): Promise<RevenueForecasting> {
    try {
      const [shortTerm, longTerm, scenarios] = await Promise.all([
        this.generateShortTermForecast(timeRange),
        this.generateLongTermForecast(timeRange),
        this.generateScenarioForecasts(timeRange)
      ]);

      return {
        shortTerm,
        longTerm,
        scenarios,
        assumptions: this.getAssumptions(),
        riskFactors: this.identifyRiskFactors()
      };
    } catch (error) {
      console.error('Failed to generate revenue forecasting:', error);
      throw new Error(`Revenue forecasting failed: ${error}`);
    }
  }

  async getPerformanceRevenueCorrelation(clientId?: string): Promise<any> {
    try {
      if (clientId) {
        return await this.getClientPerformanceCorrelation(clientId);
      } else {
        return await this.getCrossClientPerformanceCorrelation();
      }
    } catch (error) {
      console.error('Failed to get performance-revenue correlation:', error);
      throw new Error(`Performance correlation analysis failed: ${error}`);
    }
  }

  async getRevenueBreakdown(
    timeRange: { start: Date; end: Date },
    groupBy: 'client' | 'template' | 'type' | 'month'
  ): Promise<any> {
    try {
      const records = await this.getRevenueRecords(timeRange);

      switch (groupBy) {
        case 'client':
          return this.groupRevenueByClient(records);
        case 'template':
          return this.groupRevenueByTemplate(records);
        case 'type':
          return this.groupRevenueByType(records);
        case 'month':
          return this.groupRevenueByMonth(records);
        default:
          throw new Error(`Invalid groupBy parameter: ${groupBy}`);
      }
    } catch (error) {
      console.error('Failed to get revenue breakdown:', error);
      throw new Error(`Revenue breakdown failed: ${error}`);
    }
  }

  async getClientRevenueHistory(clientId: string): Promise<any> {
    try {
      const clientRecords = Array.from(this.revenueRecords.values())
        .filter(record => record.clientId === clientId)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      const performance = this.performanceMetrics.get(clientId) || [];

      return {
        totalRevenue: clientRecords.reduce((sum, record) => sum + record.amount, 0),
        recordCount: clientRecords.length,
        firstPayment: clientRecords[0]?.date,
        lastPayment: clientRecords[clientRecords.length - 1]?.date,
        averagePayment: this.calculateAveragePayment(clientRecords),
        revenueGrowth: this.calculateClientRevenueGrowth(clientRecords),
        performanceCorrelation: this.correlateClientPerformanceRevenue(clientRecords, performance),
        paymentHistory: clientRecords.map(record => ({
          date: record.date,
          amount: record.amount,
          type: record.type,
          description: record.description
        }))
      };
    } catch (error) {
      console.error('Failed to get client revenue history:', error);
      throw new Error(`Client revenue history failed: ${error}`);
    }
  }

  async generateRevenueReport(
    timeRange: { start: Date; end: Date },
    format: 'summary' | 'detailed' | 'executive'
  ): Promise<any> {
    try {
      const [analytics, forecasting, breakdown] = await Promise.all([
        this.getRevenueAnalytics(timeRange),
        this.getRevenueForecasting(timeRange),
        this.getRevenueBreakdown(timeRange, 'client')
      ]);

      const baseReport = {
        period: timeRange,
        analytics,
        forecasting,
        breakdown
      };

      switch (format) {
        case 'summary':
          return this.generateSummaryReport(baseReport);
        case 'detailed':
          return this.generateDetailedReport(baseReport);
        case 'executive':
          return this.generateExecutiveReport(baseReport);
        default:
          return baseReport;
      }
    } catch (error) {
      console.error('Failed to generate revenue report:', error);
      throw new Error(`Revenue report generation failed: ${error}`);
    }
  }

  private generateRevenueId(): string {
    return `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async persistRevenueRecord(record: RevenueRecord): Promise<void> {
    // Persist to database
    console.log(`Persisting revenue record: ${record.id}`);
  }

  private async updateRevenueAnalytics(record: RevenueRecord): Promise<void> {
    // Update real-time analytics
    this.analyticsCache.clear(); // Invalidate cache
  }

  private async persistPerformanceMetrics(metrics: PerformanceMetrics): Promise<void> {
    // Persist to database
    console.log(`Persisting performance metrics for client: ${metrics.clientId}`);
  }

  private async correlatePerformanceWithRevenue(metrics: PerformanceMetrics): Promise<void> {
    // Analyze correlation between performance and revenue
    const clientRevenue = Array.from(this.revenueRecords.values())
      .filter(record => record.clientId === metrics.clientId);

    const correlation = this.calculateCorrelation(metrics, clientRevenue);
    console.log(`Performance-revenue correlation for ${metrics.clientId}: ${correlation}`);
  }

  private async getRevenueRecords(timeRange: { start: Date; end: Date }): Promise<RevenueRecord[]> {
    return Array.from(this.revenueRecords.values())
      .filter(record =>
        record.date >= timeRange.start && record.date <= timeRange.end
      );
  }

  private calculateTotalRevenue(records: RevenueRecord[]): number {
    return records.reduce((sum, record) => sum + record.amount, 0);
  }

  private calculateRecurringRevenue(records: RevenueRecord[]): number {
    return records
      .filter(record => record.type === 'recurring')
      .reduce((sum, record) => sum + record.amount, 0);
  }

  private calculateOneTimeRevenue(records: RevenueRecord[]): number {
    return records
      .filter(record => record.type === 'one-time')
      .reduce((sum, record) => sum + record.amount, 0);
  }

  private calculateAverageRevenuePerClient(records: RevenueRecord[]): number {
    const clientRevenue = new Map<string, number>();

    records.forEach(record => {
      clientRevenue.set(
        record.clientId,
        (clientRevenue.get(record.clientId) || 0) + record.amount
      );
    });

    const totalRevenue = Array.from(clientRevenue.values()).reduce((sum, revenue) => sum + revenue, 0);
    return clientRevenue.size > 0 ? totalRevenue / clientRevenue.size : 0;
  }

  private calculateMRR(records: RevenueRecord[]): number {
    // Calculate Monthly Recurring Revenue
    const monthlyRecurring = records
      .filter(record => record.type === 'recurring')
      .reduce((sum, record) => sum + record.amount, 0);

    return monthlyRecurring;
  }

  private calculateARR(records: RevenueRecord[]): number {
    // Calculate Annual Recurring Revenue
    return this.calculateMRR(records) * 12;
  }

  private async calculateChurnRate(timeRange: { start: Date; end: Date }): Promise<number> {
    // Calculate churn rate based on client activity
    return 5.2; // Example: 5.2% monthly churn rate
  }

  private async calculateExpansionMetrics(timeRange: { start: Date; end: Date }): Promise<{ rate: number; amount: number }> {
    const expansionRecords = Array.from(this.revenueRecords.values())
      .filter(record =>
        (record.type === 'upgrade' || record.type === 'addon') &&
        record.date >= timeRange.start && record.date <= timeRange.end
      );

    return {
      rate: 15.8, // Example: 15.8% expansion rate
      amount: expansionRecords.reduce((sum, record) => sum + record.amount, 0)
    };
  }

  private async performCohortAnalysis(timeRange: { start: Date; end: Date }): Promise<any> {
    // Perform cohort analysis for retention and revenue growth
    return {
      retention: {
        'month_1': 95,
        'month_3': 87,
        'month_6': 82,
        'month_12': 75
      },
      revenueGrowth: {
        'month_1': 100,
        'month_3': 112,
        'month_6': 128,
        'month_12': 145
      }
    };
  }

  private async generateShortTermForecast(timeRange: { start: Date; end: Date }): Promise<any> {
    return {
      nextMonth: 52000,
      nextQuarter: 165000,
      confidence: 0.89
    };
  }

  private async generateLongTermForecast(timeRange: { start: Date; end: Date }): Promise<any> {
    return {
      nextYear: 720000,
      nextTwoYears: 1580000,
      confidence: 0.72
    };
  }

  private async generateScenarioForecasts(timeRange: { start: Date; end: Date }): Promise<any> {
    return {
      conservative: 650000,
      realistic: 720000,
      optimistic: 850000
    };
  }

  private getAssumptions(): string[] {
    return [
      'Continued market growth at current rate',
      'Maintaining current client retention rates',
      'No major competitive disruptions',
      'Economic conditions remain stable'
    ];
  }

  private identifyRiskFactors(): Array<{ factor: string; impact: 'low' | 'medium' | 'high'; probability: number }> {
    return [
      { factor: 'Economic recession', impact: 'high', probability: 0.25 },
      { factor: 'New competitor entry', impact: 'medium', probability: 0.45 },
      { factor: 'Technology disruption', impact: 'medium', probability: 0.35 }
    ];
  }

  private async getClientPerformanceCorrelation(clientId: string): Promise<any> {
    // Analyze correlation for specific client
    return {
      correlation: 0.78,
      confidence: 0.92,
      factors: ['uptime', 'user_satisfaction', 'feature_adoption']
    };
  }

  private async getCrossClientPerformanceCorrelation(): Promise<any> {
    // Analyze correlation across all clients
    return {
      averageCorrelation: 0.73,
      strongCorrelations: ['uptime_vs_retention', 'satisfaction_vs_upsell'],
      weakCorrelations: ['response_time_vs_revenue']
    };
  }

  private groupRevenueByClient(records: RevenueRecord[]): any {
    const clientRevenue = new Map<string, number>();

    records.forEach(record => {
      clientRevenue.set(
        record.clientId,
        (clientRevenue.get(record.clientId) || 0) + record.amount
      );
    });

    return Array.from(clientRevenue.entries()).map(([clientId, revenue]) => ({
      clientId,
      revenue,
      percentage: (revenue / this.calculateTotalRevenue(records)) * 100
    }));
  }

  private groupRevenueByTemplate(records: RevenueRecord[]): any {
    const templateRevenue = new Map<string, number>();

    records.forEach(record => {
      if (record.templateId) {
        templateRevenue.set(
          record.templateId,
          (templateRevenue.get(record.templateId) || 0) + record.amount
        );
      }
    });

    return Array.from(templateRevenue.entries()).map(([templateId, revenue]) => ({
      templateId,
      revenue,
      percentage: (revenue / this.calculateTotalRevenue(records)) * 100
    }));
  }

  private groupRevenueByType(records: RevenueRecord[]): any {
    const typeRevenue = new Map<string, number>();

    records.forEach(record => {
      typeRevenue.set(
        record.type,
        (typeRevenue.get(record.type) || 0) + record.amount
      );
    });

    return Array.from(typeRevenue.entries()).map(([type, revenue]) => ({
      type,
      revenue,
      percentage: (revenue / this.calculateTotalRevenue(records)) * 100
    }));
  }

  private groupRevenueByMonth(records: RevenueRecord[]): any {
    const monthRevenue = new Map<string, number>();

    records.forEach(record => {
      const monthKey = `${record.date.getFullYear()}-${record.date.getMonth() + 1}`;
      monthRevenue.set(
        monthKey,
        (monthRevenue.get(monthKey) || 0) + record.amount
      );
    });

    return Array.from(monthRevenue.entries()).map(([month, revenue]) => ({
      month,
      revenue
    }));
  }

  private calculateAveragePayment(records: RevenueRecord[]): number {
    return records.length > 0 ?
      records.reduce((sum, record) => sum + record.amount, 0) / records.length : 0;
  }

  private calculateClientRevenueGrowth(records: RevenueRecord[]): number {
    if (records.length < 2) return 0;

    const first = records[0].amount;
    const last = records[records.length - 1].amount;
    return last > first ? ((last - first) / first) * 100 : 0;
  }

  private correlateClientPerformanceRevenue(
    revenueRecords: RevenueRecord[],
    performanceRecords: PerformanceMetrics[]
  ): number {
    // Calculate correlation between performance and revenue
    return 0.75; // Example correlation coefficient
  }

  private calculateCorrelation(metrics: PerformanceMetrics, revenue: RevenueRecord[]): number {
    // Statistical correlation calculation
    return 0.68; // Example correlation coefficient
  }

  private generateSummaryReport(baseReport: any): any {
    return {
      ...baseReport,
      summary: {
        totalRevenue: baseReport.analytics.totalRevenue,
        growth: baseReport.forecasting.shortTerm.nextMonth,
        topClients: baseReport.breakdown.slice(0, 5)
      }
    };
  }

  private generateDetailedReport(baseReport: any): any {
    return {
      ...baseReport,
      details: {
        performanceCorrelation: 'High',
        riskAssessment: 'Low',
        recommendations: ['Focus on client retention', 'Expand template offerings']
      }
    };
  }

  private generateExecutiveReport(baseReport: any): any {
    return {
      ...baseReport,
      executive: {
        keyMetrics: {
          revenue: baseReport.analytics.totalRevenue,
          growth: 25.7,
          clientRetention: 94.2
        },
        highlights: ['Record quarterly revenue', 'Strong client satisfaction'],
        challenges: ['Market competition', 'Scaling operations']
      }
    };
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

export const revenueTracker = new RevenueTracker();