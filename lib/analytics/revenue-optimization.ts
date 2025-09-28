import { supabaseBrowser as supabase } from '@/lib/supabase/client';

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  customerLifetimeValue: number;
  churnRate: number;
  growthRate: number;
}

export interface RevenueOptimization {
  id: string;
  clientId: string;
  optimizationType: 'pricing' | 'upsell' | 'retention' | 'expansion';
  currentValue: number;
  potentialValue: number;
  implementationEffort: 'low' | 'medium' | 'high';
  confidence: number;
  recommendation: string;
  expectedROI: number;
  timeToImplement: number; // days
  createdAt: Date;
}

export interface RevenueForecasting {
  period: string;
  forecastedRevenue: number;
  confidence: number;
  factors: string[];
  assumptions: string[];
}

export class RevenueOptimizationEngine {
  async calculateRevenueMetrics(
    clientId?: string,
    timeRange: { start: Date; end: Date } = this.getDefaultTimeRange()
  ): Promise<RevenueMetrics> {
    try {
      let query = supabase
        .from('revenue_data')
        .select(`
          amount,
          type,
          created_at,
          client_id,
          subscription_type
        `)
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString());

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data: revenueData, error } = await query;

      if (error) throw error;

      return this.processRevenueMetrics(revenueData || []);
    } catch (error) {
      console.error('Error calculating revenue metrics:', error);
      throw error;
    }
  }

  private processRevenueMetrics(data: any[]): RevenueMetrics {
    const totalRevenue = data.reduce((sum, item) => sum + (item.amount || 0), 0);

    const monthlyRecurring = data
      .filter(item => item.subscription_type === 'monthly')
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    const uniqueClients = new Set(data.map(item => item.client_id)).size;
    const averageRevenuePerUser = uniqueClients > 0 ? totalRevenue / uniqueClients : 0;

    // Simplified CLV calculation (can be enhanced with more sophisticated models)
    const averageMonthlyValue = monthlyRecurring / Math.max(uniqueClients, 1);
    const estimatedLifespanMonths = 24; // Default assumption
    const customerLifetimeValue = averageMonthlyValue * estimatedLifespanMonths;

    // Calculate churn rate (simplified)
    const churnRate = this.calculateChurnRate(data);

    // Calculate growth rate
    const growthRate = this.calculateGrowthRate(data);

    return {
      totalRevenue,
      monthlyRecurringRevenue: monthlyRecurring,
      averageRevenuePerUser,
      customerLifetimeValue,
      churnRate,
      growthRate
    };
  }

  async generateOptimizationRecommendations(
    clientId?: string
  ): Promise<RevenueOptimization[]> {
    try {
      const metrics = await this.calculateRevenueMetrics(clientId);
      const recommendations: RevenueOptimization[] = [];

      // Pricing optimization
      if (metrics.averageRevenuePerUser < 5000) {
        recommendations.push({
          id: this.generateId(),
          clientId: clientId || 'all',
          optimizationType: 'pricing',
          currentValue: metrics.averageRevenuePerUser,
          potentialValue: metrics.averageRevenuePerUser * 1.3,
          implementationEffort: 'medium',
          confidence: 0.75,
          recommendation: 'Consider implementing value-based pricing tiers with premium features',
          expectedROI: 1.8,
          timeToImplement: 14,
          createdAt: new Date()
        });
      }

      // Upsell opportunities
      if (metrics.monthlyRecurringRevenue > 0) {
        recommendations.push({
          id: this.generateId(),
          clientId: clientId || 'all',
          optimizationType: 'upsell',
          currentValue: metrics.monthlyRecurringRevenue,
          potentialValue: metrics.monthlyRecurringRevenue * 1.4,
          implementationEffort: 'low',
          confidence: 0.85,
          recommendation: 'Implement automated upsell campaigns for existing subscribers',
          expectedROI: 2.1,
          timeToImplement: 7,
          createdAt: new Date()
        });
      }

      // Retention optimization
      if (metrics.churnRate > 0.05) {
        recommendations.push({
          id: this.generateId(),
          clientId: clientId || 'all',
          optimizationType: 'retention',
          currentValue: metrics.customerLifetimeValue,
          potentialValue: metrics.customerLifetimeValue * 1.5,
          implementationEffort: 'high',
          confidence: 0.70,
          recommendation: 'Implement customer success program to reduce churn rate',
          expectedROI: 2.5,
          timeToImplement: 30,
          createdAt: new Date()
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating optimization recommendations:', error);
      throw error;
    }
  }

  async generateRevenueForecasting(
    clientId?: string,
    periods: number = 12
  ): Promise<RevenueForecasting[]> {
    try {
      const historicalMetrics = await this.calculateRevenueMetrics(clientId);
      const forecasts: RevenueForecasting[] = [];

      for (let i = 1; i <= periods; i++) {
        const baseRevenue = historicalMetrics.monthlyRecurringRevenue;
        const growthFactor = Math.pow(1 + (historicalMetrics.growthRate / 100), i);
        const seasonalAdjustment = this.getSeasonalAdjustment(i);

        const forecastedRevenue = baseRevenue * growthFactor * seasonalAdjustment;
        const confidence = Math.max(0.5, 0.9 - (i * 0.05)); // Decreasing confidence over time

        forecasts.push({
          period: this.getPeriodLabel(i),
          forecastedRevenue,
          confidence,
          factors: [
            'Historical growth trends',
            'Market conditions',
            'Seasonal adjustments',
            'Customer retention patterns'
          ],
          assumptions: [
            'Consistent market conditions',
            'No major product changes',
            'Current retention rates maintained',
            'Economic stability'
          ]
        });
      }

      return forecasts;
    } catch (error) {
      console.error('Error generating revenue forecasting:', error);
      throw error;
    }
  }

  async trackOptimizationImplementation(
    optimizationId: string,
    status: 'planning' | 'implementing' | 'testing' | 'completed' | 'failed',
    actualROI?: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('revenue_optimizations')
        .upsert({
          id: optimizationId,
          status,
          actual_roi: actualROI,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking optimization implementation:', error);
      throw error;
    }
  }

  async getOptimizationPerformance(): Promise<{
    totalImplemented: number;
    averageROI: number;
    successRate: number;
    totalValueGenerated: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('revenue_optimizations')
        .select('*')
        .eq('status', 'completed');

      if (error) throw error;

      const implementations = data || [];
      const totalImplemented = implementations.length;

      const rois = implementations
        .filter(impl => impl.actual_roi !== null)
        .map(impl => impl.actual_roi);

      const averageROI = rois.length > 0 ? rois.reduce((sum, roi) => sum + roi, 0) / rois.length : 0;

      const successfulImplementations = implementations.filter(impl =>
        impl.actual_roi && impl.actual_roi > 1
      ).length;

      const successRate = totalImplemented > 0 ? successfulImplementations / totalImplemented : 0;

      const totalValueGenerated = implementations.reduce((sum, impl) => {
        const value = impl.potential_value - impl.current_value;
        return sum + (value > 0 ? value : 0);
      }, 0);

      return {
        totalImplemented,
        averageROI,
        successRate,
        totalValueGenerated
      };
    } catch (error) {
      console.error('Error getting optimization performance:', error);
      throw error;
    }
  }

  private calculateChurnRate(data: any[]): number {
    // Simplified churn calculation - in production this would be more sophisticated
    const monthlyData = this.groupByMonth(data);
    if (monthlyData.length < 2) return 0;

    const lastMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];

    const lastMonthClients = new Set(lastMonth.map(item => item.client_id)).size;
    const previousMonthClients = new Set(previousMonth.map(item => item.client_id)).size;

    if (previousMonthClients === 0) return 0;

    const churnedClients = previousMonthClients - lastMonthClients;
    return Math.max(0, churnedClients / previousMonthClients);
  }

  private calculateGrowthRate(data: any[]): number {
    const monthlyData = this.groupByMonth(data);
    if (monthlyData.length < 2) return 0;

    const revenueByMonth = monthlyData.map(month =>
      month.reduce((sum, item) => sum + (item.amount || 0), 0)
    );

    const growthRates = [];
    for (let i = 1; i < revenueByMonth.length; i++) {
      const currentMonth = revenueByMonth[i];
      const previousMonth = revenueByMonth[i - 1];

      if (previousMonth > 0) {
        const growthRate = ((currentMonth - previousMonth) / previousMonth) * 100;
        growthRates.push(growthRate);
      }
    }

    return growthRates.length > 0
      ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
      : 0;
  }

  private groupByMonth(data: any[]): any[][] {
    const monthGroups: { [key: string]: any[] } = {};

    data.forEach(item => {
      const date = new Date(item.created_at);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = [];
      }
      monthGroups[monthKey].push(item);
    });

    return Object.values(monthGroups);
  }

  private getSeasonalAdjustment(monthOffset: number): number {
    // Simple seasonal adjustment - can be enhanced with historical data
    const seasonalFactors = [1.0, 0.95, 1.05, 1.1, 1.0, 0.9, 0.85, 0.9, 1.05, 1.1, 1.15, 1.2];
    const currentMonth = new Date().getMonth();
    const targetMonth = (currentMonth + monthOffset) % 12;
    return seasonalFactors[targetMonth];
  }

  private getPeriodLabel(monthOffset: number): string {
    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private getDefaultTimeRange(): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 12); // Last 12 months
    return { start, end };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const revenueOptimizationEngine = new RevenueOptimizationEngine();