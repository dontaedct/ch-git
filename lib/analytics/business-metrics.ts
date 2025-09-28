import { supabaseBrowser as supabase } from '@/lib/supabase/client';

export interface BusinessMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
  category: 'revenue' | 'clients' | 'operations' | 'quality';
  unit: string;
  target?: number;
  isKPI: boolean;
  lastUpdated: Date;
}

export interface OperationalMetrics {
  clientAcquisitionCost: number;
  customerLifetimeValue: number;
  monthlyActiveUsers: number;
  averageProjectDeliveryTime: number;
  clientSatisfactionScore: number;
  employeeProductivity: number;
  systemUptime: number;
  automationEfficiency: number;
}

export interface ClientMetrics {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  churnedClientsThisMonth: number;
  averageClientValue: number;
  clientRetentionRate: number;
  averageProjectsPerClient: number;
  clientGrowthRate: number;
}

export interface QualityMetrics {
  averageDeliveryTime: number;
  bugReportRate: number;
  clientSatisfactionScore: number;
  projectSuccessRate: number;
  reworkRate: number;
  qualityScore: number;
}

export class BusinessMetricsEngine {
  async calculateAllMetrics(): Promise<BusinessMetric[]> {
    try {
      const [
        revenueMetrics,
        clientMetrics,
        operationalMetrics,
        qualityMetrics
      ] = await Promise.all([
        this.calculateRevenueMetrics(),
        this.calculateClientMetrics(),
        this.calculateOperationalMetrics(),
        this.calculateQualityMetrics()
      ]);

      return [
        ...revenueMetrics,
        ...clientMetrics,
        ...operationalMetrics,
        ...qualityMetrics
      ];
    } catch (error) {
      console.error('Error calculating business metrics:', error);
      throw error;
    }
  }

  async calculateRevenueMetrics(): Promise<BusinessMetric[]> {
    try {
      const currentPeriod = this.getCurrentPeriod();
      const previousPeriod = this.getPreviousPeriod();

      const [currentRevenue, previousRevenue] = await Promise.all([
        this.getRevenueForPeriod(currentPeriod),
        this.getRevenueForPeriod(previousPeriod)
      ]);

      const [currentMRR, previousMRR] = await Promise.all([
        this.getMRRForPeriod(currentPeriod),
        this.getMRRForPeriod(previousPeriod)
      ]);

      const [currentARPU, previousARPU] = await Promise.all([
        this.getARPUForPeriod(currentPeriod),
        this.getARPUForPeriod(previousPeriod)
      ]);

      return [
        this.createMetric(
          'total-revenue',
          'Total Revenue',
          currentRevenue,
          previousRevenue,
          'revenue',
          '$',
          true,
          100000 // Target: $100k
        ),
        this.createMetric(
          'monthly-recurring-revenue',
          'Monthly Recurring Revenue',
          currentMRR,
          previousMRR,
          'revenue',
          '$',
          true,
          25000 // Target: $25k MRR
        ),
        this.createMetric(
          'average-revenue-per-user',
          'Average Revenue Per User',
          currentARPU,
          previousARPU,
          'revenue',
          '$',
          true,
          5000 // Target: $5k ARPU
        )
      ];
    } catch (error) {
      console.error('Error calculating revenue metrics:', error);
      throw error;
    }
  }

  async calculateClientMetrics(): Promise<BusinessMetric[]> {
    try {
      const currentPeriod = this.getCurrentPeriod();
      const previousPeriod = this.getPreviousPeriod();

      const [currentClients, previousClients] = await Promise.all([
        this.getTotalClientsForPeriod(currentPeriod),
        this.getTotalClientsForPeriod(previousPeriod)
      ]);

      const [newClients, churnedClients] = await Promise.all([
        this.getNewClientsForPeriod(currentPeriod),
        this.getChurnedClientsForPeriod(currentPeriod)
      ]);

      const retentionRate = await this.getClientRetentionRate(currentPeriod);

      return [
        this.createMetric(
          'total-clients',
          'Total Clients',
          currentClients,
          previousClients,
          'clients',
          'clients',
          true,
          50 // Target: 50 clients
        ),
        this.createMetric(
          'new-clients',
          'New Clients This Month',
          newClients,
          0, // No previous comparison for monthly metric
          'clients',
          'clients',
          true,
          10 // Target: 10 new clients per month
        ),
        this.createMetric(
          'client-retention-rate',
          'Client Retention Rate',
          retentionRate * 100,
          0,
          'clients',
          '%',
          true,
          90 // Target: 90% retention
        )
      ];
    } catch (error) {
      console.error('Error calculating client metrics:', error);
      throw error;
    }
  }

  async calculateOperationalMetrics(): Promise<BusinessMetric[]> {
    try {
      const currentPeriod = this.getCurrentPeriod();
      const previousPeriod = this.getPreviousPeriod();

      const [currentDeliveryTime, previousDeliveryTime] = await Promise.all([
        this.getAverageDeliveryTime(currentPeriod),
        this.getAverageDeliveryTime(previousPeriod)
      ]);

      const [currentUptime, previousUptime] = await Promise.all([
        this.getSystemUptime(currentPeriod),
        this.getSystemUptime(previousPeriod)
      ]);

      const [currentAutomation, previousAutomation] = await Promise.all([
        this.getAutomationEfficiency(currentPeriod),
        this.getAutomationEfficiency(previousPeriod)
      ]);

      return [
        this.createMetric(
          'delivery-time',
          'Average Delivery Time',
          currentDeliveryTime,
          previousDeliveryTime,
          'operations',
          'days',
          true,
          7 // Target: 7 days
        ),
        this.createMetric(
          'system-uptime',
          'System Uptime',
          currentUptime * 100,
          previousUptime * 100,
          'operations',
          '%',
          true,
          99.9 // Target: 99.9% uptime
        ),
        this.createMetric(
          'automation-efficiency',
          'Automation Efficiency',
          currentAutomation * 100,
          previousAutomation * 100,
          'operations',
          '%',
          true,
          80 // Target: 80% automation
        )
      ];
    } catch (error) {
      console.error('Error calculating operational metrics:', error);
      throw error;
    }
  }

  async calculateQualityMetrics(): Promise<BusinessMetric[]> {
    try {
      const currentPeriod = this.getCurrentPeriod();
      const previousPeriod = this.getPreviousPeriod();

      const [currentSatisfaction, previousSatisfaction] = await Promise.all([
        this.getClientSatisfactionScore(currentPeriod),
        this.getClientSatisfactionScore(previousPeriod)
      ]);

      const [currentSuccessRate, previousSuccessRate] = await Promise.all([
        this.getProjectSuccessRate(currentPeriod),
        this.getProjectSuccessRate(previousPeriod)
      ]);

      const [currentBugRate, previousBugRate] = await Promise.all([
        this.getBugReportRate(currentPeriod),
        this.getBugReportRate(previousPeriod)
      ]);

      return [
        this.createMetric(
          'client-satisfaction',
          'Client Satisfaction Score',
          currentSatisfaction,
          previousSatisfaction,
          'quality',
          '/10',
          true,
          8.5 // Target: 8.5/10
        ),
        this.createMetric(
          'project-success-rate',
          'Project Success Rate',
          currentSuccessRate * 100,
          previousSuccessRate * 100,
          'quality',
          '%',
          true,
          95 // Target: 95% success rate
        ),
        this.createMetric(
          'bug-report-rate',
          'Bug Report Rate',
          currentBugRate,
          previousBugRate,
          'quality',
          'bugs/project',
          false,
          2 // Target: <2 bugs per project
        )
      ];
    } catch (error) {
      console.error('Error calculating quality metrics:', error);
      throw error;
    }
  }

  async getMetricTrends(metricId: string, periods: number = 12): Promise<{
    labels: string[];
    values: number[];
    trend: 'up' | 'down' | 'stable';
  }> {
    try {
      const { data, error } = await supabase
        .from('business_metrics_history')
        .select('value, period')
        .eq('metric_id', metricId)
        .order('period', { ascending: true })
        .limit(periods);

      if (error) throw error;

      const labels = (data || []).map(item => item.period);
      const values = (data || []).map(item => item.value);

      const trend = this.calculateTrend(values);

      return { labels, values, trend };
    } catch (error) {
      console.error('Error getting metric trends:', error);
      throw error;
    }
  }

  async trackMetricTarget(metricId: string, target: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('business_metrics_targets')
        .upsert({
          metric_id: metricId,
          target_value: target,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking metric target:', error);
      throw error;
    }
  }

  async generateMetricsReport(
    startDate: Date,
    endDate: Date
  ): Promise<{
    summary: {
      totalMetrics: number;
      metricsMeetingTargets: number;
      averagePerformance: number;
    };
    categories: {
      revenue: BusinessMetric[];
      clients: BusinessMetric[];
      operations: BusinessMetric[];
      quality: BusinessMetric[];
    };
    recommendations: string[];
  }> {
    try {
      const allMetrics = await this.calculateAllMetrics();

      const categories = {
        revenue: allMetrics.filter(m => m.category === 'revenue'),
        clients: allMetrics.filter(m => m.category === 'clients'),
        operations: allMetrics.filter(m => m.category === 'operations'),
        quality: allMetrics.filter(m => m.category === 'quality')
      };

      const metricsWithTargets = allMetrics.filter(m => m.target !== undefined);
      const metricsMeetingTargets = metricsWithTargets.filter(m =>
        m.target && m.value >= m.target
      ).length;

      const averagePerformance = metricsWithTargets.length > 0
        ? metricsWithTargets.reduce((sum, m) => {
            const performance = m.target ? (m.value / m.target) * 100 : 100;
            return sum + Math.min(performance, 100);
          }, 0) / metricsWithTargets.length
        : 100;

      const recommendations = this.generateRecommendations(allMetrics);

      return {
        summary: {
          totalMetrics: allMetrics.length,
          metricsMeetingTargets,
          averagePerformance
        },
        categories,
        recommendations
      };
    } catch (error) {
      console.error('Error generating metrics report:', error);
      throw error;
    }
  }

  private createMetric(
    id: string,
    name: string,
    currentValue: number,
    previousValue: number,
    category: BusinessMetric['category'],
    unit: string,
    isKPI: boolean,
    target?: number
  ): BusinessMetric {
    const changePercentage = previousValue > 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : 0;

    let trend: BusinessMetric['trend'] = 'stable';
    if (Math.abs(changePercentage) > 5) {
      trend = changePercentage > 0 ? 'up' : 'down';
    }

    return {
      id,
      name,
      value: currentValue,
      previousValue,
      changePercentage,
      trend,
      category,
      unit,
      target,
      isKPI,
      lastUpdated: new Date()
    };
  }

  private calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const percentageChange = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (Math.abs(percentageChange) < 5) return 'stable';
    return percentageChange > 0 ? 'up' : 'down';
  }

  private generateRecommendations(metrics: BusinessMetric[]): string[] {
    const recommendations: string[] = [];

    metrics.forEach(metric => {
      if (metric.target && metric.value < metric.target) {
        switch (metric.id) {
          case 'total-revenue':
            recommendations.push('Focus on upselling existing clients and acquiring high-value prospects');
            break;
          case 'client-retention-rate':
            recommendations.push('Implement customer success program to improve retention');
            break;
          case 'delivery-time':
            recommendations.push('Optimize development processes and increase automation');
            break;
          case 'client-satisfaction':
            recommendations.push('Conduct client feedback sessions and improve service quality');
            break;
        }
      }
    });

    return recommendations;
  }

  // Helper methods for data retrieval
  private async getRevenueForPeriod(period: { start: Date; end: Date }): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('revenue_data')
        .select('amount')
        .gte('created_at', period.start.toISOString())
        .lte('created_at', period.end.toISOString());

      if (error) throw error;

      return (data || []).reduce((sum, item) => sum + (item.amount || 0), 0);
    } catch (error) {
      console.error('Error getting revenue for period:', error);
      return 0;
    }
  }

  private async getMRRForPeriod(period: { start: Date; end: Date }): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('revenue_data')
        .select('amount')
        .eq('subscription_type', 'monthly')
        .gte('created_at', period.start.toISOString())
        .lte('created_at', period.end.toISOString());

      if (error) throw error;

      return (data || []).reduce((sum, item) => sum + (item.amount || 0), 0);
    } catch (error) {
      console.error('Error getting MRR for period:', error);
      return 0;
    }
  }

  private async getARPUForPeriod(period: { start: Date; end: Date }): Promise<number> {
    try {
      const [revenue, clientCount] = await Promise.all([
        this.getRevenueForPeriod(period),
        this.getTotalClientsForPeriod(period)
      ]);

      return clientCount > 0 ? revenue / clientCount : 0;
    } catch (error) {
      console.error('Error getting ARPU for period:', error);
      return 0;
    }
  }

  private async getTotalClientsForPeriod(period: { start: Date; end: Date }): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .lte('created_at', period.end.toISOString());

      if (error) throw error;

      return (data || []).length;
    } catch (error) {
      console.error('Error getting total clients for period:', error);
      return 0;
    }
  }

  private async getNewClientsForPeriod(period: { start: Date; end: Date }): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .gte('created_at', period.start.toISOString())
        .lte('created_at', period.end.toISOString());

      if (error) throw error;

      return (data || []).length;
    } catch (error) {
      console.error('Error getting new clients for period:', error);
      return 0;
    }
  }

  private async getChurnedClientsForPeriod(period: { start: Date; end: Date }): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .eq('status', 'churned')
        .gte('updated_at', period.start.toISOString())
        .lte('updated_at', period.end.toISOString());

      if (error) throw error;

      return (data || []).length;
    } catch (error) {
      console.error('Error getting churned clients for period:', error);
      return 0;
    }
  }

  private async getClientRetentionRate(period: { start: Date; end: Date }): Promise<number> {
    try {
      const [totalClients, churnedClients] = await Promise.all([
        this.getTotalClientsForPeriod(period),
        this.getChurnedClientsForPeriod(period)
      ]);

      return totalClients > 0 ? (totalClients - churnedClients) / totalClients : 1;
    } catch (error) {
      console.error('Error getting client retention rate:', error);
      return 1;
    }
  }

  private async getAverageDeliveryTime(period: { start: Date; end: Date }): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('delivery_time')
        .eq('status', 'completed')
        .gte('completed_at', period.start.toISOString())
        .lte('completed_at', period.end.toISOString());

      if (error) throw error;

      const deliveryTimes = (data || []).map(item => item.delivery_time || 0);
      return deliveryTimes.length > 0
        ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
        : 7; // Default 7 days
    } catch (error) {
      console.error('Error getting average delivery time:', error);
      return 7;
    }
  }

  private async getSystemUptime(period: { start: Date; end: Date }): Promise<number> {
    // Simplified uptime calculation - in production this would come from monitoring systems
    return 0.999; // 99.9% uptime assumption
  }

  private async getAutomationEfficiency(period: { start: Date; end: Date }): Promise<number> {
    // Simplified automation efficiency - in production this would be calculated from actual metrics
    return 0.75; // 75% automation assumption
  }

  private async getClientSatisfactionScore(period: { start: Date; end: Date }): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('client_feedback')
        .select('satisfaction_score')
        .gte('created_at', period.start.toISOString())
        .lte('created_at', period.end.toISOString());

      if (error) throw error;

      const scores = (data || []).map(item => item.satisfaction_score || 0);
      return scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 8.0; // Default score
    } catch (error) {
      console.error('Error getting client satisfaction score:', error);
      return 8.0;
    }
  }

  private async getProjectSuccessRate(period: { start: Date; end: Date }): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('status')
        .gte('created_at', period.start.toISOString())
        .lte('created_at', period.end.toISOString());

      if (error) throw error;

      const projects = data || [];
      const successfulProjects = projects.filter(p => p.status === 'completed').length;

      return projects.length > 0 ? successfulProjects / projects.length : 1;
    } catch (error) {
      console.error('Error getting project success rate:', error);
      return 1;
    }
  }

  private async getBugReportRate(period: { start: Date; end: Date }): Promise<number> {
    try {
      const { data: bugs, error: bugsError } = await supabase
        .from('bug_reports')
        .select('id')
        .gte('created_at', period.start.toISOString())
        .lte('created_at', period.end.toISOString());

      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('status', 'completed')
        .gte('completed_at', period.start.toISOString())
        .lte('completed_at', period.end.toISOString());

      if (bugsError || projectsError) throw bugsError || projectsError;

      const bugCount = (bugs || []).length;
      const projectCount = (projects || []).length;

      return projectCount > 0 ? bugCount / projectCount : 0;
    } catch (error) {
      console.error('Error getting bug report rate:', error);
      return 0;
    }
  }

  private getCurrentPeriod(): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    return { start, end };
  }

  private getPreviousPeriod(): { start: Date; end: Date } {
    const end = new Date();
    end.setMonth(end.getMonth() - 1);
    const start = new Date();
    start.setMonth(start.getMonth() - 2);
    return { start, end };
  }
}

export const businessMetricsEngine = new BusinessMetricsEngine();