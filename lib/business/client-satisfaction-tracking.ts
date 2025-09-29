/**
 * Client Satisfaction Tracking System
 *
 * Tracks client satisfaction metrics, feedback, and satisfaction scores
 * to validate business model effectiveness and client success.
 */

import { z } from 'zod';

export interface ClientSatisfactionMetrics {
  clientId: string;
  overallSatisfaction: number; // 1-10 scale
  deliveryTimeSatisfaction: number;
  qualitySatisfaction: number;
  supportSatisfaction: number;
  valueSatisfaction: number;
  communicationSatisfaction: number;
  npsScore: number; // Net Promoter Score
  lastUpdated: Date;
}

export interface SatisfactionFeedback {
  clientId: string;
  category: 'delivery' | 'quality' | 'support' | 'value' | 'communication' | 'overall';
  rating: number;
  feedback: string;
  timestamp: Date;
  phase: 'onboarding' | 'development' | 'delivery' | 'post-delivery' | 'maintenance';
}

export interface SatisfactionTrends {
  period: string;
  averageSatisfaction: number;
  satisfactionTrend: 'increasing' | 'stable' | 'decreasing';
  retentionRate: number;
  churnPrediction: number;
  improvementAreas: string[];
}

const satisfactionMetricsSchema = z.object({
  clientId: z.string(),
  overallSatisfaction: z.number().min(1).max(10),
  deliveryTimeSatisfaction: z.number().min(1).max(10),
  qualitySatisfaction: z.number().min(1).max(10),
  supportSatisfaction: z.number().min(1).max(10),
  valueSatisfaction: z.number().min(1).max(10),
  communicationSatisfaction: z.number().min(1).max(10),
  npsScore: z.number().min(-100).max(100),
  lastUpdated: z.date()
});

const feedbackSchema = z.object({
  clientId: z.string(),
  category: z.enum(['delivery', 'quality', 'support', 'value', 'communication', 'overall']),
  rating: z.number().min(1).max(10),
  feedback: z.string().max(1000),
  timestamp: z.date(),
  phase: z.enum(['onboarding', 'development', 'delivery', 'post-delivery', 'maintenance'])
});

export class ClientSatisfactionTracker {
  private static instance: ClientSatisfactionTracker;
  private satisfactionData: Map<string, ClientSatisfactionMetrics> = new Map();
  private feedbackHistory: SatisfactionFeedback[] = [];

  static getInstance(): ClientSatisfactionTracker {
    if (!ClientSatisfactionTracker.instance) {
      ClientSatisfactionTracker.instance = new ClientSatisfactionTracker();
    }
    return ClientSatisfactionTracker.instance;
  }

  async recordSatisfactionMetrics(metrics: ClientSatisfactionMetrics): Promise<{
    success: boolean;
    errors: string[];
    insights: string[];
  }> {
    const errors: string[] = [];
    const insights: string[] = [];

    try {
      // Validate metrics
      satisfactionMetricsSchema.parse(metrics);

      // Store metrics
      this.satisfactionData.set(metrics.clientId, metrics);

      // Generate insights
      if (metrics.overallSatisfaction >= 9) {
        insights.push('Excellent satisfaction - potential for testimonial/referral');
      } else if (metrics.overallSatisfaction <= 6) {
        insights.push('Low satisfaction - immediate intervention required');
      }

      if (metrics.deliveryTimeSatisfaction <= 6) {
        insights.push('Delivery time satisfaction low - review project timeline processes');
      }

      if (metrics.valueSatisfaction <= 6) {
        insights.push('Value satisfaction low - review pricing and deliverable quality');
      }

      // Calculate NPS category
      const npsCategory = this.categorizeNPS(metrics.npsScore);
      insights.push(`Client is a ${npsCategory}`);

      return {
        success: true,
        errors,
        insights
      };

    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        errors.push('Unknown error recording satisfaction metrics');
      }

      return {
        success: false,
        errors,
        insights
      };
    }
  }

  async recordFeedback(feedback: SatisfactionFeedback): Promise<{
    success: boolean;
    errors: string[];
    actionItems: string[];
  }> {
    const errors: string[] = [];
    const actionItems: string[] = [];

    try {
      // Validate feedback
      feedbackSchema.parse(feedback);

      // Store feedback
      this.feedbackHistory.push(feedback);

      // Generate action items based on feedback
      if (feedback.rating <= 5) {
        actionItems.push(`Low ${feedback.category} rating - schedule client check-in`);
      }

      if (feedback.feedback.toLowerCase().includes('slow') || feedback.feedback.toLowerCase().includes('delay')) {
        actionItems.push('Review project timeline and communication processes');
      }

      if (feedback.feedback.toLowerCase().includes('expensive') || feedback.feedback.toLowerCase().includes('cost')) {
        actionItems.push('Review value proposition and pricing communication');
      }

      return {
        success: true,
        errors,
        actionItems
      };

    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        errors.push('Unknown error recording feedback');
      }

      return {
        success: false,
        errors,
        actionItems
      };
    }
  }

  async getSatisfactionMetrics(clientId: string): Promise<ClientSatisfactionMetrics | null> {
    return this.satisfactionData.get(clientId) || null;
  }

  async getClientFeedback(clientId: string): Promise<SatisfactionFeedback[]> {
    return this.feedbackHistory.filter(feedback => feedback.clientId === clientId);
  }

  async calculateSatisfactionTrends(period: 'week' | 'month' | 'quarter'): Promise<SatisfactionTrends> {
    const now = new Date();
    const periodMs = this.getPeriodMs(period);
    const cutoffDate = new Date(now.getTime() - periodMs);

    // Filter recent metrics
    const recentMetrics = Array.from(this.satisfactionData.values())
      .filter(metrics => metrics.lastUpdated >= cutoffDate);

    if (recentMetrics.length === 0) {
      return {
        period,
        averageSatisfaction: 0,
        satisfactionTrend: 'stable',
        retentionRate: 100,
        churnPrediction: 0,
        improvementAreas: []
      };
    }

    // Calculate average satisfaction
    const averageSatisfaction = recentMetrics.reduce((sum, metrics) =>
      sum + metrics.overallSatisfaction, 0) / recentMetrics.length;

    // Calculate trend
    const satisfactionTrend = this.calculateTrend(recentMetrics);

    // Calculate retention rate
    const retentionRate = this.calculateRetentionRate(recentMetrics);

    // Calculate churn prediction
    const churnPrediction = this.calculateChurnPrediction(recentMetrics);

    // Identify improvement areas
    const improvementAreas = this.identifyImprovementAreas(recentMetrics);

    return {
      period,
      averageSatisfaction,
      satisfactionTrend,
      retentionRate,
      churnPrediction,
      improvementAreas
    };
  }

  private getPeriodMs(period: 'week' | 'month' | 'quarter'): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    switch (period) {
      case 'week':
        return 7 * msPerDay;
      case 'month':
        return 30 * msPerDay;
      case 'quarter':
        return 90 * msPerDay;
    }
  }

  private calculateTrend(metrics: ClientSatisfactionMetrics[]): 'increasing' | 'stable' | 'decreasing' {
    if (metrics.length < 2) return 'stable';

    // Sort by date
    const sorted = metrics.sort((a, b) => a.lastUpdated.getTime() - b.lastUpdated.getTime());

    const oldAvg = sorted.slice(0, Math.floor(sorted.length / 2))
      .reduce((sum, m) => sum + m.overallSatisfaction, 0) / Math.floor(sorted.length / 2);

    const newAvg = sorted.slice(Math.ceil(sorted.length / 2))
      .reduce((sum, m) => sum + m.overallSatisfaction, 0) / Math.ceil(sorted.length / 2);

    const diff = newAvg - oldAvg;

    if (diff > 0.5) return 'increasing';
    if (diff < -0.5) return 'decreasing';
    return 'stable';
  }

  private calculateRetentionRate(metrics: ClientSatisfactionMetrics[]): number {
    // Calculate based on satisfaction scores
    const highSatisfaction = metrics.filter(m => m.overallSatisfaction >= 8).length;
    return (highSatisfaction / metrics.length) * 100;
  }

  private calculateChurnPrediction(metrics: ClientSatisfactionMetrics[]): number {
    // Predict churn based on low satisfaction scores
    const lowSatisfaction = metrics.filter(m => m.overallSatisfaction <= 6).length;
    return (lowSatisfaction / metrics.length) * 100;
  }

  private identifyImprovementAreas(metrics: ClientSatisfactionMetrics[]): string[] {
    const areas: string[] = [];

    // Calculate averages for each category
    const avgDelivery = metrics.reduce((sum, m) => sum + m.deliveryTimeSatisfaction, 0) / metrics.length;
    const avgQuality = metrics.reduce((sum, m) => sum + m.qualitySatisfaction, 0) / metrics.length;
    const avgSupport = metrics.reduce((sum, m) => sum + m.supportSatisfaction, 0) / metrics.length;
    const avgValue = metrics.reduce((sum, m) => sum + m.valueSatisfaction, 0) / metrics.length;
    const avgCommunication = metrics.reduce((sum, m) => sum + m.communicationSatisfaction, 0) / metrics.length;

    if (avgDelivery < 7) areas.push('Delivery Time');
    if (avgQuality < 7) areas.push('Quality');
    if (avgSupport < 7) areas.push('Support');
    if (avgValue < 7) areas.push('Value');
    if (avgCommunication < 7) areas.push('Communication');

    return areas;
  }

  private categorizeNPS(score: number): string {
    if (score >= 9) return 'Promoter';
    if (score >= 7) return 'Passive';
    return 'Detractor';
  }

  async generateSatisfactionReport(): Promise<{
    overallSatisfaction: number;
    npsScore: number;
    retentionRate: number;
    topIssues: string[];
    recommendations: string[];
  }> {
    const allMetrics = Array.from(this.satisfactionData.values());

    if (allMetrics.length === 0) {
      return {
        overallSatisfaction: 0,
        npsScore: 0,
        retentionRate: 0,
        topIssues: [],
        recommendations: ['Start collecting client satisfaction data']
      };
    }

    const overallSatisfaction = allMetrics.reduce((sum, m) => sum + m.overallSatisfaction, 0) / allMetrics.length;
    const npsScore = allMetrics.reduce((sum, m) => sum + m.npsScore, 0) / allMetrics.length;
    const retentionRate = this.calculateRetentionRate(allMetrics);
    const topIssues = this.identifyImprovementAreas(allMetrics);

    const recommendations: string[] = [];
    if (overallSatisfaction < 8) {
      recommendations.push('Implement client satisfaction improvement plan');
    }
    if (npsScore < 50) {
      recommendations.push('Focus on creating promoters through exceptional service');
    }
    if (retentionRate < 85) {
      recommendations.push('Implement client retention strategies');
    }

    return {
      overallSatisfaction,
      npsScore,
      retentionRate,
      topIssues,
      recommendations
    };
  }

  async identifyAtRiskClients(): Promise<{
    clientId: string;
    riskScore: number;
    reasons: string[];
    recommendations: string[];
  }[]> {
    const atRiskClients: {
      clientId: string;
      riskScore: number;
      reasons: string[];
      recommendations: string[];
    }[] = [];

    for (const [clientId, metrics] of this.satisfactionData) {
      const riskFactors: string[] = [];
      let riskScore = 0;

      if (metrics.overallSatisfaction <= 6) {
        riskFactors.push('Low overall satisfaction');
        riskScore += 40;
      }

      if (metrics.npsScore <= 6) {
        riskFactors.push('Detractor NPS score');
        riskScore += 30;
      }

      if (metrics.valueSatisfaction <= 5) {
        riskFactors.push('Low value perception');
        riskScore += 20;
      }

      if (metrics.supportSatisfaction <= 5) {
        riskFactors.push('Poor support experience');
        riskScore += 10;
      }

      if (riskScore >= 30) {
        const recommendations: string[] = [];
        if (metrics.overallSatisfaction <= 6) {
          recommendations.push('Schedule immediate client check-in call');
        }
        if (metrics.valueSatisfaction <= 5) {
          recommendations.push('Review and communicate value delivered');
        }
        if (metrics.supportSatisfaction <= 5) {
          recommendations.push('Improve support response and quality');
        }

        atRiskClients.push({
          clientId,
          riskScore,
          reasons: riskFactors,
          recommendations
        });
      }
    }

    return atRiskClients.sort((a, b) => b.riskScore - a.riskScore);
  }
}

export const satisfactionTracker = ClientSatisfactionTracker.getInstance();