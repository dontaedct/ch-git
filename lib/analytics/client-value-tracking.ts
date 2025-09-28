import { supabaseBrowser as supabase } from '@/lib/supabase/client';

export interface ClientValue {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  monthlyRevenue: number;
  lifetimeValue: number;
  acquisitionCost: number;
  profitMargin: number;
  retentionProbability: number;
  valueScore: number; // 0-100 composite score
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  riskLevel: 'low' | 'medium' | 'high';
  nextProjectProbability: number;
}

export interface ClientValueTrend {
  period: string;
  value: number;
  revenue: number;
  projects: number;
  satisfaction: number;
}

export interface ValueSegmentation {
  segment: string;
  clients: number;
  totalValue: number;
  averageValue: number;
  percentage: number;
  growthRate: number;
}

export interface ClientValueInsights {
  topClients: ClientValue[];
  atRiskClients: ClientValue[];
  growingClients: ClientValue[];
  segmentation: ValueSegmentation[];
  totalPortfolioValue: number;
  averageClientValue: number;
  valueConcentrationRisk: number;
}

export class ClientValueTracker {
  async calculateClientValue(clientId: string): Promise<ClientValue> {
    try {
      const [
        clientInfo,
        revenue,
        projects,
        satisfaction,
        engagement
      ] = await Promise.all([
        this.getClientInfo(clientId),
        this.getClientRevenue(clientId),
        this.getClientProjects(clientId),
        this.getClientSatisfaction(clientId),
        this.getClientEngagement(clientId)
      ]);

      const lifetimeValue = this.calculateLifetimeValue(revenue, engagement, satisfaction);
      const acquisitionCost = await this.getClientAcquisitionCost(clientId);
      const profitMargin = revenue.total > 0 ? (revenue.total - acquisitionCost) / revenue.total : 0;
      const retentionProbability = this.calculateRetentionProbability(satisfaction, engagement);

      const valueScore = this.calculateValueScore({
        revenue: revenue.total,
        satisfaction: satisfaction.average,
        projects: projects.completed,
        retention: retentionProbability
      });

      const tier = this.determineTier(valueScore);
      const riskLevel = this.assessRiskLevel(satisfaction, engagement, revenue);
      const nextProjectProbability = this.calculateNextProjectProbability(
        engagement,
        satisfaction,
        projects
      );

      return {
        clientId,
        clientName: clientInfo.name,
        totalRevenue: revenue.total,
        monthlyRevenue: revenue.monthly,
        lifetimeValue,
        acquisitionCost,
        profitMargin,
        retentionProbability,
        valueScore,
        tier,
        riskLevel,
        nextProjectProbability
      };
    } catch (error) {
      console.error('Error calculating client value:', error);
      throw error;
    }
  }

  async getAllClientValues(): Promise<ClientValue[]> {
    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('id')
        .eq('status', 'active');

      if (error) throw error;

      const clientValues = await Promise.all(
        (clients || []).map(client => this.calculateClientValue(client.id))
      );

      return clientValues.sort((a, b) => b.valueScore - a.valueScore);
    } catch (error) {
      console.error('Error getting all client values:', error);
      throw error;
    }
  }

  async getClientValueTrends(
    clientId: string,
    periods: number = 12
  ): Promise<ClientValueTrend[]> {
    try {
      const trends: ClientValueTrend[] = [];
      const endDate = new Date();

      for (let i = periods - 1; i >= 0; i--) {
        const periodEnd = new Date(endDate);
        periodEnd.setMonth(periodEnd.getMonth() - i);

        const periodStart = new Date(periodEnd);
        periodStart.setMonth(periodStart.getMonth() - 1);

        const [revenue, projects, satisfaction] = await Promise.all([
          this.getClientRevenueForPeriod(clientId, periodStart, periodEnd),
          this.getClientProjectsForPeriod(clientId, periodStart, periodEnd),
          this.getClientSatisfactionForPeriod(clientId, periodStart, periodEnd)
        ]);

        const value = this.calculatePeriodValue(revenue, projects.completed, satisfaction);

        trends.push({
          period: `${periodEnd.getFullYear()}-${String(periodEnd.getMonth() + 1).padStart(2, '0')}`,
          value,
          revenue,
          projects: projects.completed,
          satisfaction
        });
      }

      return trends;
    } catch (error) {
      console.error('Error getting client value trends:', error);
      throw error;
    }
  }

  async getValueSegmentation(): Promise<ValueSegmentation[]> {
    try {
      const allClients = await this.getAllClientValues();

      const segments = [
        { name: 'High Value (Platinum/Gold)', min: 70, max: 100 },
        { name: 'Medium Value (Silver)', min: 40, max: 69 },
        { name: 'Low Value (Bronze)', min: 0, max: 39 }
      ];

      return segments.map(segment => {
        const segmentClients = allClients.filter(
          client => client.valueScore >= segment.min && client.valueScore <= segment.max
        );

        const totalValue = segmentClients.reduce((sum, client) => sum + client.totalRevenue, 0);
        const averageValue = segmentClients.length > 0 ? totalValue / segmentClients.length : 0;
        const percentage = allClients.length > 0 ? (segmentClients.length / allClients.length) * 100 : 0;

        // Calculate growth rate for segment (simplified)
        const growthRate = this.calculateSegmentGrowthRate(segmentClients);

        return {
          segment: segment.name,
          clients: segmentClients.length,
          totalValue,
          averageValue,
          percentage,
          growthRate
        };
      });
    } catch (error) {
      console.error('Error getting value segmentation:', error);
      throw error;
    }
  }

  async getClientValueInsights(): Promise<ClientValueInsights> {
    try {
      const allClients = await this.getAllClientValues();
      const segmentation = await this.getValueSegmentation();

      const topClients = allClients
        .sort((a, b) => b.valueScore - a.valueScore)
        .slice(0, 10);

      const atRiskClients = allClients
        .filter(client => client.riskLevel === 'high' || client.retentionProbability < 0.7)
        .sort((a, b) => a.retentionProbability - b.retentionProbability)
        .slice(0, 10);

      const growingClients = allClients
        .filter(client => client.nextProjectProbability > 0.7)
        .sort((a, b) => b.nextProjectProbability - a.nextProjectProbability)
        .slice(0, 10);

      const totalPortfolioValue = allClients.reduce((sum, client) => sum + client.totalRevenue, 0);
      const averageClientValue = allClients.length > 0 ? totalPortfolioValue / allClients.length : 0;

      // Calculate value concentration risk (what % of revenue comes from top 20% of clients)
      const top20PercentCount = Math.ceil(allClients.length * 0.2);
      const top20PercentRevenue = topClients
        .slice(0, top20PercentCount)
        .reduce((sum, client) => sum + client.totalRevenue, 0);

      const valueConcentrationRisk = totalPortfolioValue > 0
        ? (top20PercentRevenue / totalPortfolioValue) * 100
        : 0;

      return {
        topClients,
        atRiskClients,
        growingClients,
        segmentation,
        totalPortfolioValue,
        averageClientValue,
        valueConcentrationRisk
      };
    } catch (error) {
      console.error('Error getting client value insights:', error);
      throw error;
    }
  }

  async trackClientValueChange(
    clientId: string,
    previousValue: number,
    currentValue: number,
    reason: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('client_value_changes')
        .insert({
          client_id: clientId,
          previous_value: previousValue,
          current_value: currentValue,
          change_percentage: ((currentValue - previousValue) / previousValue) * 100,
          reason,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking client value change:', error);
      throw error;
    }
  }

  async getValueDriverAnalysis(clientId: string): Promise<{
    drivers: Array<{
      factor: string;
      impact: number; // -100 to 100
      recommendation: string;
    }>;
    opportunities: string[];
    risks: string[];
  }> {
    try {
      const clientValue = await this.calculateClientValue(clientId);
      const trends = await this.getClientValueTrends(clientId, 6);

      const drivers = [];
      const opportunities = [];
      const risks = [];

      // Analyze revenue trend
      if (trends.length >= 2) {
        const recentRevenue = trends[trends.length - 1].revenue;
        const previousRevenue = trends[trends.length - 2].revenue;
        const revenueGrowth = previousRevenue > 0 ?
          ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

        drivers.push({
          factor: 'Revenue Trend',
          impact: Math.min(Math.max(revenueGrowth, -100), 100),
          recommendation: revenueGrowth > 0
            ? 'Continue current strategy to maintain growth'
            : 'Focus on upselling and value demonstration'
        });

        if (revenueGrowth > 20) {
          opportunities.push('Strong revenue growth indicates potential for premium services');
        } else if (revenueGrowth < -10) {
          risks.push('Declining revenue trend requires immediate attention');
        }
      }

      // Analyze satisfaction
      const satisfactionImpact = (clientValue.retentionProbability - 0.5) * 200; // Scale to -100 to 100
      drivers.push({
        factor: 'Client Satisfaction',
        impact: satisfactionImpact,
        recommendation: satisfactionImpact > 0
          ? 'Leverage high satisfaction for referrals and case studies'
          : 'Implement satisfaction improvement initiatives'
      });

      if (clientValue.retentionProbability > 0.9) {
        opportunities.push('High satisfaction client - ideal for case studies and referrals');
      } else if (clientValue.retentionProbability < 0.6) {
        risks.push('Low satisfaction indicates churn risk');
      }

      // Analyze project frequency
      const projectFrequencyScore = clientValue.nextProjectProbability * 100;
      drivers.push({
        factor: 'Project Frequency',
        impact: projectFrequencyScore - 50, // Center around 50%
        recommendation: projectFrequencyScore > 50
          ? 'Prepare proposals for upcoming project opportunities'
          : 'Increase engagement and value demonstration'
      });

      return { drivers, opportunities, risks };
    } catch (error) {
      console.error('Error getting value driver analysis:', error);
      throw error;
    }
  }

  private async getClientInfo(clientId: string): Promise<{ name: string }> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('name')
        .eq('id', clientId)
        .single();

      if (error) throw error;

      return { name: data?.name || 'Unknown Client' };
    } catch (error) {
      console.error('Error getting client info:', error);
      return { name: 'Unknown Client' };
    }
  }

  private async getClientRevenue(clientId: string): Promise<{ total: number; monthly: number }> {
    try {
      const { data, error } = await supabase
        .from('revenue_data')
        .select('amount, type, created_at')
        .eq('client_id', clientId);

      if (error) throw error;

      const total = (data || []).reduce((sum, item) => sum + (item.amount || 0), 0);

      // Calculate monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const monthly = (data || [])
        .filter(item => new Date(item.created_at) >= thirtyDaysAgo)
        .reduce((sum, item) => sum + (item.amount || 0), 0);

      return { total, monthly };
    } catch (error) {
      console.error('Error getting client revenue:', error);
      return { total: 0, monthly: 0 };
    }
  }

  private async getClientProjects(clientId: string): Promise<{
    total: number;
    completed: number;
    active: number;
    averageValue: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('status, value')
        .eq('client_id', clientId);

      if (error) throw error;

      const projects = data || [];
      const total = projects.length;
      const completed = projects.filter(p => p.status === 'completed').length;
      const active = projects.filter(p => p.status === 'active').length;
      const averageValue = total > 0
        ? projects.reduce((sum, p) => sum + (p.value || 0), 0) / total
        : 0;

      return { total, completed, active, averageValue };
    } catch (error) {
      console.error('Error getting client projects:', error);
      return { total: 0, completed: 0, active: 0, averageValue: 0 };
    }
  }

  private async getClientSatisfaction(clientId: string): Promise<{
    average: number;
    latest: number;
    trend: 'up' | 'down' | 'stable';
  }> {
    try {
      const { data, error } = await supabase
        .from('client_feedback')
        .select('satisfaction_score, created_at')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const scores = (data || []).map(item => item.satisfaction_score || 0);
      const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 8;
      const latest = scores.length > 0 ? scores[0] : 8;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (scores.length >= 2) {
        const diff = scores[0] - scores[1];
        if (Math.abs(diff) > 0.5) {
          trend = diff > 0 ? 'up' : 'down';
        }
      }

      return { average, latest, trend };
    } catch (error) {
      console.error('Error getting client satisfaction:', error);
      return { average: 8, latest: 8, trend: 'stable' };
    }
  }

  private async getClientEngagement(clientId: string): Promise<{
    communicationFrequency: number;
    lastContactDays: number;
    projectFrequency: number;
  }> {
    try {
      // This would integrate with communication tracking systems
      // For now, returning simplified engagement metrics
      const { data: communications, error: commError } = await supabase
        .from('client_communications')
        .select('created_at')
        .eq('client_id', clientId)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()); // Last 90 days

      const { data: projects, error: projError } = await supabase
        .from('projects')
        .select('created_at')
        .eq('client_id', clientId)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()); // Last year

      const communicationFrequency = (communications || []).length;

      // Calculate days since last contact
      const lastContact = communications && communications.length > 0
        ? new Date(communications[0].created_at)
        : new Date(0);
      const lastContactDays = Math.floor((Date.now() - lastContact.getTime()) / (24 * 60 * 60 * 1000));

      const projectFrequency = (projects || []).length;

      return {
        communicationFrequency,
        lastContactDays,
        projectFrequency
      };
    } catch (error) {
      console.error('Error getting client engagement:', error);
      return {
        communicationFrequency: 5,
        lastContactDays: 7,
        projectFrequency: 2
      };
    }
  }

  private calculateLifetimeValue(
    revenue: { total: number; monthly: number },
    engagement: any,
    satisfaction: any
  ): number {
    // Simplified CLV calculation
    const monthlyValue = revenue.monthly || (revenue.total / 12);
    const retentionFactor = this.calculateRetentionProbability(satisfaction, engagement);
    const averageLifespanMonths = retentionFactor > 0.5 ? 24 : 12;

    return monthlyValue * averageLifespanMonths * retentionFactor;
  }

  private async getClientAcquisitionCost(clientId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('client_acquisition_costs')
        .select('cost')
        .eq('client_id', clientId)
        .single();

      if (error) return 2000; // Default CAC

      return data?.cost || 2000;
    } catch (error) {
      return 2000; // Default CAC
    }
  }

  private calculateRetentionProbability(satisfaction: any, engagement: any): number {
    const satisfactionWeight = 0.6;
    const engagementWeight = 0.4;

    const satisfactionScore = satisfaction.average / 10; // Normalize to 0-1
    const engagementScore = Math.min(
      (engagement.communicationFrequency / 10) * 0.5 +
      (Math.max(0, 30 - engagement.lastContactDays) / 30) * 0.3 +
      (engagement.projectFrequency / 5) * 0.2,
      1
    );

    return (satisfactionScore * satisfactionWeight) + (engagementScore * engagementWeight);
  }

  private calculateValueScore(factors: {
    revenue: number;
    satisfaction: number;
    projects: number;
    retention: number;
  }): number {
    const weights = {
      revenue: 0.4,
      satisfaction: 0.2,
      projects: 0.2,
      retention: 0.2
    };

    const revenueScore = Math.min(factors.revenue / 50000, 1) * 100; // Normalize against $50k
    const satisfactionScore = (factors.satisfaction / 10) * 100;
    const projectsScore = Math.min(factors.projects / 10, 1) * 100;
    const retentionScore = factors.retention * 100;

    return (
      revenueScore * weights.revenue +
      satisfactionScore * weights.satisfaction +
      projectsScore * weights.projects +
      retentionScore * weights.retention
    );
  }

  private determineTier(valueScore: number): ClientValue['tier'] {
    if (valueScore >= 80) return 'platinum';
    if (valueScore >= 65) return 'gold';
    if (valueScore >= 40) return 'silver';
    return 'bronze';
  }

  private assessRiskLevel(satisfaction: any, engagement: any, revenue: any): ClientValue['riskLevel'] {
    let riskScore = 0;

    if (satisfaction.average < 7) riskScore += 30;
    if (satisfaction.trend === 'down') riskScore += 20;
    if (engagement.lastContactDays > 30) riskScore += 25;
    if (revenue.monthly === 0 && revenue.total > 0) riskScore += 25; // No recent revenue

    if (riskScore >= 50) return 'high';
    if (riskScore >= 25) return 'medium';
    return 'low';
  }

  private calculateNextProjectProbability(engagement: any, satisfaction: any, projects: any): number {
    const factors = [
      Math.min(engagement.communicationFrequency / 10, 1) * 0.3,
      (Math.max(0, 30 - engagement.lastContactDays) / 30) * 0.2,
      (satisfaction.average / 10) * 0.3,
      Math.min(projects.completed / 5, 1) * 0.2
    ];

    return factors.reduce((sum, factor) => sum + factor, 0);
  }

  private async getClientRevenueForPeriod(
    clientId: string,
    start: Date,
    end: Date
  ): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('revenue_data')
        .select('amount')
        .eq('client_id', clientId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (error) throw error;

      return (data || []).reduce((sum, item) => sum + (item.amount || 0), 0);
    } catch (error) {
      return 0;
    }
  }

  private async getClientProjectsForPeriod(
    clientId: string,
    start: Date,
    end: Date
  ): Promise<{ total: number; completed: number }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('status')
        .eq('client_id', clientId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (error) throw error;

      const projects = data || [];
      return {
        total: projects.length,
        completed: projects.filter(p => p.status === 'completed').length
      };
    } catch (error) {
      return { total: 0, completed: 0 };
    }
  }

  private async getClientSatisfactionForPeriod(
    clientId: string,
    start: Date,
    end: Date
  ): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('client_feedback')
        .select('satisfaction_score')
        .eq('client_id', clientId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (error) throw error;

      const scores = (data || []).map(item => item.satisfaction_score || 0);
      return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 8;
    } catch (error) {
      return 8;
    }
  }

  private calculatePeriodValue(revenue: number, projects: number, satisfaction: number): number {
    return (revenue * 0.6) + (projects * 1000 * 0.2) + (satisfaction * 100 * 0.2);
  }

  private calculateSegmentGrowthRate(clients: ClientValue[]): number {
    // Simplified growth calculation - would need historical data for accurate calculation
    const averageValue = clients.reduce((sum, client) => sum + client.totalRevenue, 0) / clients.length;
    return averageValue > 10000 ? 15 : averageValue > 5000 ? 10 : 5; // Simplified assumption
  }
}

export const clientValueTracker = new ClientValueTracker();