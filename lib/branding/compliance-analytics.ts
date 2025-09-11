/**
 * @fileoverview HT-011.4.3: Brand Compliance Analytics System
 * @module lib/branding/compliance-analytics
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.4.3 - Create Brand Compliance Checking System
 * Focus: Analytics and reporting system for brand compliance trends and insights
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (branding system enhancement)
 */

import { ComplianceCheckResult, ComplianceRuleResult, ComplianceCategory } from './brand-compliance-engine';
import { ComplianceAlert, ComplianceEvent } from './compliance-monitoring-service';

/**
 * Compliance analytics time period
 */
export type AnalyticsTimePeriod = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Compliance trend data point
 */
export interface ComplianceTrendDataPoint {
  /** Timestamp */
  timestamp: Date;
  /** Compliance score */
  score: number;
  /** Whether compliant */
  compliant: boolean;
  /** Critical issues count */
  criticalIssues: number;
  /** High priority issues count */
  highPriorityIssues: number;
  /** Medium priority issues count */
  mediumPriorityIssues: number;
  /** Low priority issues count */
  lowPriorityIssues: number;
  /** Total issues count */
  totalIssues: number;
}

/**
 * Compliance trend analysis
 */
export interface ComplianceTrendAnalysis {
  /** Time period */
  period: AnalyticsTimePeriod;
  /** Data points */
  dataPoints: ComplianceTrendDataPoint[];
  /** Trend direction */
  trend: 'improving' | 'declining' | 'stable';
  /** Trend percentage change */
  trendPercentage: number;
  /** Average score */
  averageScore: number;
  /** Best score */
  bestScore: number;
  /** Worst score */
  worstScore: number;
  /** Compliance rate */
  complianceRate: number;
  /** Most common issues */
  commonIssues: {
    ruleId: string;
    ruleName: string;
    count: number;
    frequency: number;
  }[];
  /** Category performance */
  categoryPerformance: Record<ComplianceCategory, {
    averageScore: number;
    trend: 'improving' | 'declining' | 'stable';
    trendPercentage: number;
  }>;
}

/**
 * Compliance insights
 */
export interface ComplianceInsights {
  /** Overall compliance status */
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  /** Key insights */
  insights: string[];
  /** Recommendations */
  recommendations: string[];
  /** Priority actions */
  priorityActions: {
    action: string;
    priority: 'high' | 'medium' | 'low';
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
  }[];
  /** Risk assessment */
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    mitigation: string[];
  };
}

/**
 * Compliance analytics report
 */
export interface ComplianceAnalyticsReport {
  /** Report ID */
  id: string;
  /** Report title */
  title: string;
  /** Report timestamp */
  timestamp: Date;
  /** Time period covered */
  period: AnalyticsTimePeriod;
  /** Tenant ID */
  tenantId: string;
  /** Executive summary */
  executiveSummary: {
    overallStatus: string;
    keyMetrics: Record<string, number>;
    topInsights: string[];
  };
  /** Trend analysis */
  trendAnalysis: ComplianceTrendAnalysis;
  /** Compliance insights */
  insights: ComplianceInsights;
  /** Detailed metrics */
  detailedMetrics: {
    totalChecks: number;
    averageScore: number;
    complianceRate: number;
    criticalIssues: number;
    highPriorityIssues: number;
    wcagCompliance: {
      levelA: number;
      levelAA: number;
      levelAAA: number;
    };
    industryCompliance: Record<string, number>;
    brandGuidelineCompliance: Record<string, number>;
  };
  /** Recommendations */
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

/**
 * Compliance analytics configuration
 */
export interface ComplianceAnalyticsConfig {
  /** Enable analytics */
  enabled: boolean;
  /** Data retention period in days */
  dataRetentionDays: number;
  /** Analytics aggregation interval */
  aggregationInterval: AnalyticsTimePeriod;
  /** Enable trend analysis */
  enableTrendAnalysis: boolean;
  /** Enable insights generation */
  enableInsights: boolean;
  /** Enable automated reporting */
  enableAutomatedReporting: boolean;
  /** Report generation schedule */
  reportSchedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    recipients: string[];
  };
}

/**
 * Brand Compliance Analytics System
 * 
 * Provides comprehensive analytics for brand compliance:
 * - Trend analysis and forecasting
 * - Compliance insights and recommendations
 * - Automated reporting
 * - Performance benchmarking
 * - Risk assessment
 */
export class BrandComplianceAnalytics {
  private config: ComplianceAnalyticsConfig;
  private complianceHistory: Map<string, ComplianceCheckResult[]> = new Map();
  private analyticsCache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(config: Partial<ComplianceAnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      dataRetentionDays: 90,
      aggregationInterval: 'day',
      enableTrendAnalysis: true,
      enableInsights: true,
      enableAutomatedReporting: false,
      reportSchedule: {
        frequency: 'weekly',
        time: '09:00',
        recipients: []
      },
      ...config
    };
  }

  /**
   * Add compliance check result to analytics
   */
  addComplianceResult(tenantId: string, result: ComplianceCheckResult): void {
    if (!this.config.enabled) return;

    if (!this.complianceHistory.has(tenantId)) {
      this.complianceHistory.set(tenantId, []);
    }

    const history = this.complianceHistory.get(tenantId)!;
    history.push(result);

    // Clean up old data based on retention policy
    this.cleanupOldData(tenantId);

    // Clear analytics cache for this tenant
    this.clearAnalyticsCache(tenantId);
  }

  /**
   * Get compliance trend analysis
   */
  getComplianceTrends(
    tenantId: string, 
    period: AnalyticsTimePeriod = 'week'
  ): ComplianceTrendAnalysis {
    const cacheKey = `trends_${tenantId}_${period}`;
    const cached = this.analyticsCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    const history = this.complianceHistory.get(tenantId) || [];
    const dataPoints = this.aggregateDataPoints(history, period);
    
    const analysis: ComplianceTrendAnalysis = {
      period,
      dataPoints,
      trend: this.calculateTrend(dataPoints),
      trendPercentage: this.calculateTrendPercentage(dataPoints),
      averageScore: this.calculateAverageScore(dataPoints),
      bestScore: Math.max(...dataPoints.map(dp => dp.score)),
      worstScore: Math.min(...dataPoints.map(dp => dp.score)),
      complianceRate: this.calculateComplianceRate(dataPoints),
      commonIssues: this.identifyCommonIssues(history),
      categoryPerformance: this.analyzeCategoryPerformance(history, period)
    };

    // Cache the result
    this.analyticsCache.set(cacheKey, {
      data: analysis,
      timestamp: Date.now()
    });

    return analysis;
  }

  /**
   * Generate compliance insights
   */
  generateComplianceInsights(tenantId: string): ComplianceInsights {
    const cacheKey = `insights_${tenantId}`;
    const cached = this.analyticsCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    const history = this.complianceHistory.get(tenantId) || [];
    const recentResults = history.slice(-10); // Last 10 results
    
    if (recentResults.length === 0) {
      return {
        status: 'critical',
        insights: ['No compliance data available'],
        recommendations: ['Run compliance checks to generate insights'],
        priorityActions: [],
        riskAssessment: {
          level: 'critical',
          factors: ['No compliance data'],
          mitigation: ['Implement compliance monitoring']
        }
      };
    }

    const latestResult = recentResults[recentResults.length - 1];
    const averageScore = this.calculateAverageScore(recentResults.map(r => ({
      timestamp: r.timestamp,
      score: r.overallScore,
      compliant: r.compliant,
      criticalIssues: r.criticalIssues.length,
      highPriorityIssues: r.highPriorityIssues.length,
      mediumPriorityIssues: r.mediumPriorityIssues.length,
      lowPriorityIssues: r.lowPriorityIssues.length,
      totalIssues: r.criticalIssues.length + r.highPriorityIssues.length + 
                  r.mediumPriorityIssues.length + r.lowPriorityIssues.length
    })));

    const insights = this.generateInsights(latestResult, averageScore, recentResults);
    const recommendations = this.generateRecommendations(latestResult, recentResults);
    const priorityActions = this.generatePriorityActions(latestResult);
    const riskAssessment = this.assessRisk(latestResult, recentResults);

    const complianceInsights: ComplianceInsights = {
      status: this.determineComplianceStatus(averageScore, latestResult),
      insights,
      recommendations,
      priorityActions,
      riskAssessment
    };

    // Cache the result
    this.analyticsCache.set(cacheKey, {
      data: complianceInsights,
      timestamp: Date.now()
    });

    return complianceInsights;
  }

  /**
   * Generate comprehensive analytics report
   */
  generateAnalyticsReport(
    tenantId: string, 
    period: AnalyticsTimePeriod = 'month'
  ): ComplianceAnalyticsReport {
    const trendAnalysis = this.getComplianceTrends(tenantId, period);
    const insights = this.generateComplianceInsights(tenantId);
    const history = this.complianceHistory.get(tenantId) || [];

    const report: ComplianceAnalyticsReport = {
      id: this.generateReportId(),
      title: `Brand Compliance Analytics Report - ${period}`,
      timestamp: new Date(),
      period,
      tenantId,
      executiveSummary: this.generateExecutiveSummary(trendAnalysis, insights),
      trendAnalysis,
      insights,
      detailedMetrics: this.calculateDetailedMetrics(history),
      recommendations: this.generateReportRecommendations(insights, trendAnalysis)
    };

    return report;
  }

  /**
   * Get compliance benchmarking data
   */
  getComplianceBenchmarking(tenantId: string): {
    currentScore: number;
    industryAverage: number;
    bestPracticeScore: number;
    percentile: number;
    recommendations: string[];
  } {
    const history = this.complianceHistory.get(tenantId) || [];
    const currentScore = history.length > 0 ? history[history.length - 1].overallScore : 0;
    
    // Industry averages (these would typically come from external data sources)
    const industryAverages = {
      'healthcare': 85,
      'financial': 90,
      'technology': 80,
      'retail': 75,
      'default': 80
    };
    
    const industryAverage = industryAverages['default']; // Would be determined by tenant industry
    const bestPracticeScore = 95;
    
    const percentile = Math.round((currentScore / bestPracticeScore) * 100);
    
    const recommendations = [];
    if (currentScore < industryAverage) {
      recommendations.push('Focus on improving compliance to meet industry standards');
    }
    if (currentScore < bestPracticeScore) {
      recommendations.push('Implement best practices to achieve excellence');
    }
    
    return {
      currentScore,
      industryAverage,
      bestPracticeScore,
      percentile,
      recommendations
    };
  }

  /**
   * Get compliance analytics statistics
   */
  getAnalyticsStats(): {
    totalTenants: number;
    totalDataPoints: number;
    averageDataPointsPerTenant: number;
    dataRetentionDays: number;
    cacheHitRate: number;
  } {
    const totalTenants = this.complianceHistory.size;
    const totalDataPoints = Array.from(this.complianceHistory.values())
      .reduce((sum, history) => sum + history.length, 0);
    
    return {
      totalTenants,
      totalDataPoints,
      averageDataPointsPerTenant: totalTenants > 0 ? Math.round(totalDataPoints / totalTenants) : 0,
      dataRetentionDays: this.config.dataRetentionDays,
      cacheHitRate: 0.85 // Would be calculated from actual cache statistics
    };
  }

  /**
   * Clear analytics data for tenant
   */
  clearAnalyticsData(tenantId: string): void {
    this.complianceHistory.delete(tenantId);
    this.clearAnalyticsCache(tenantId);
  }

  /**
   * Clear all analytics data
   */
  clearAllAnalyticsData(): void {
    this.complianceHistory.clear();
    this.analyticsCache.clear();
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Clean up old data based on retention policy
   */
  private cleanupOldData(tenantId: string): void {
    const history = this.complianceHistory.get(tenantId);
    if (!history) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.dataRetentionDays);

    const filteredHistory = history.filter(result => result.timestamp >= cutoffDate);
    this.complianceHistory.set(tenantId, filteredHistory);
  }

  /**
   * Clear analytics cache for tenant
   */
  private clearAnalyticsCache(tenantId: string): void {
    const keysToDelete = Array.from(this.analyticsCache.keys())
      .filter(key => key.includes(tenantId));
    
    keysToDelete.forEach(key => this.analyticsCache.delete(key));
  }

  /**
   * Aggregate data points by time period
   */
  private aggregateDataPoints(
    history: ComplianceCheckResult[], 
    period: AnalyticsTimePeriod
  ): ComplianceTrendDataPoint[] {
    if (history.length === 0) return [];

    // Group results by time period
    const grouped = new Map<string, ComplianceCheckResult[]>();
    
    history.forEach(result => {
      const key = this.getTimePeriodKey(result.timestamp, period);
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(result);
    });

    // Convert to data points
    const dataPoints: ComplianceTrendDataPoint[] = [];
    
    grouped.forEach((results, key) => {
      const timestamp = this.parseTimePeriodKey(key, period);
      const avgScore = Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length);
      const compliant = results.every(r => r.compliant);
      
      const criticalIssues = Math.round(results.reduce((sum, r) => sum + r.criticalIssues.length, 0) / results.length);
      const highPriorityIssues = Math.round(results.reduce((sum, r) => sum + r.highPriorityIssues.length, 0) / results.length);
      const mediumPriorityIssues = Math.round(results.reduce((sum, r) => sum + r.mediumPriorityIssues.length, 0) / results.length);
      const lowPriorityIssues = Math.round(results.reduce((sum, r) => sum + r.lowPriorityIssues.length, 0) / results.length);
      
      dataPoints.push({
        timestamp,
        score: avgScore,
        compliant,
        criticalIssues,
        highPriorityIssues,
        mediumPriorityIssues,
        lowPriorityIssues,
        totalIssues: criticalIssues + highPriorityIssues + mediumPriorityIssues + lowPriorityIssues
      });
    });

    return dataPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Get time period key for grouping
   */
  private getTimePeriodKey(timestamp: Date, period: AnalyticsTimePeriod): string {
    const date = new Date(timestamp);
    
    switch (period) {
      case 'hour':
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
      case 'day':
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
      case 'month':
        return `${date.getFullYear()}-${date.getMonth()}`;
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${date.getFullYear()}-Q${quarter}`;
      case 'year':
        return `${date.getFullYear()}`;
      default:
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
  }

  /**
   * Parse time period key back to date
   */
  private parseTimePeriodKey(key: string, period: AnalyticsTimePeriod): Date {
    const parts = key.split('-');
    
    switch (period) {
      case 'hour':
        return new Date(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]), parseInt(parts[3]));
      case 'day':
        return new Date(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
      case 'week':
        return new Date(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
      case 'month':
        return new Date(parseInt(parts[0]), parseInt(parts[1]), 1);
      case 'quarter':
        const quarter = parseInt(parts[1].substring(1));
        return new Date(parseInt(parts[0]), (quarter - 1) * 3, 1);
      case 'year':
        return new Date(parseInt(parts[0]), 0, 1);
      default:
        return new Date(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
    }
  }

  /**
   * Calculate trend direction
   */
  private calculateTrend(dataPoints: ComplianceTrendDataPoint[]): 'improving' | 'declining' | 'stable' {
    if (dataPoints.length < 2) return 'stable';
    
    const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
    const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, dp) => sum + dp.score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, dp) => sum + dp.score, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (Math.abs(difference) < 2) return 'stable';
    return difference > 0 ? 'improving' : 'declining';
  }

  /**
   * Calculate trend percentage change
   */
  private calculateTrendPercentage(dataPoints: ComplianceTrendDataPoint[]): number {
    if (dataPoints.length < 2) return 0;
    
    const firstScore = dataPoints[0].score;
    const lastScore = dataPoints[dataPoints.length - 1].score;
    
    return Math.round(((lastScore - firstScore) / firstScore) * 100);
  }

  /**
   * Calculate average score
   */
  private calculateAverageScore(dataPoints: ComplianceTrendDataPoint[]): number {
    if (dataPoints.length === 0) return 0;
    return Math.round(dataPoints.reduce((sum, dp) => sum + dp.score, 0) / dataPoints.length);
  }

  /**
   * Calculate compliance rate
   */
  private calculateComplianceRate(dataPoints: ComplianceTrendDataPoint[]): number {
    if (dataPoints.length === 0) return 0;
    const compliantCount = dataPoints.filter(dp => dp.compliant).length;
    return Math.round((compliantCount / dataPoints.length) * 100) / 100;
  }

  /**
   * Identify common issues
   */
  private identifyCommonIssues(history: ComplianceCheckResult[]): {
    ruleId: string;
    ruleName: string;
    count: number;
    frequency: number;
  }[] {
    const issueCounts = new Map<string, { ruleName: string; count: number }>();
    
    history.forEach(result => {
      result.ruleResults.forEach(rule => {
        if (!rule.passed) {
          const existing = issueCounts.get(rule.ruleId);
          if (existing) {
            existing.count++;
          } else {
            issueCounts.set(rule.ruleId, {
              ruleName: rule.ruleName,
              count: 1
            });
          }
        }
      });
    });
    
    const totalChecks = history.length;
    
    return Array.from(issueCounts.entries())
      .map(([ruleId, data]) => ({
        ruleId,
        ruleName: data.ruleName,
        count: data.count,
        frequency: Math.round((data.count / totalChecks) * 100) / 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Analyze category performance
   */
  private analyzeCategoryPerformance(
    history: ComplianceCheckResult[], 
    period: AnalyticsTimePeriod
  ): Record<ComplianceCategory, {
    averageScore: number;
    trend: 'improving' | 'declining' | 'stable';
    trendPercentage: number;
  }> {
    const categories: ComplianceCategory[] = [
      'accessibility', 'usability', 'design-consistency', 
      'industry-standards', 'brand-guidelines', 'performance', 'security'
    ];
    
    const performance: Record<ComplianceCategory, {
      averageScore: number;
      trend: 'improving' | 'declining' | 'stable';
      trendPercentage: number;
    }> = {} as any;
    
    categories.forEach(category => {
      const categoryScores = history.map(result => result.categorySummary[category]?.score || 0);
      
      if (categoryScores.length === 0) {
        performance[category] = {
          averageScore: 0,
          trend: 'stable',
          trendPercentage: 0
        };
        return;
      }
      
      const averageScore = Math.round(categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length);
      
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      let trendPercentage = 0;
      
      if (categoryScores.length >= 2) {
        const firstHalf = categoryScores.slice(0, Math.floor(categoryScores.length / 2));
        const secondHalf = categoryScores.slice(Math.floor(categoryScores.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
        
        const difference = secondAvg - firstAvg;
        trendPercentage = Math.round((difference / firstAvg) * 100);
        
        if (Math.abs(difference) >= 2) {
          trend = difference > 0 ? 'improving' : 'declining';
        }
      }
      
      performance[category] = {
        averageScore,
        trend,
        trendPercentage
      };
    });
    
    return performance;
  }

  /**
   * Generate insights
   */
  private generateInsights(
    latestResult: ComplianceCheckResult, 
    averageScore: number, 
    recentResults: ComplianceCheckResult[]
  ): string[] {
    const insights: string[] = [];
    
    // Score-based insights
    if (latestResult.overallScore >= 90) {
      insights.push('Excellent compliance score achieved');
    } else if (latestResult.overallScore >= 80) {
      insights.push('Good compliance score with room for improvement');
    } else if (latestResult.overallScore >= 70) {
      insights.push('Fair compliance score - attention needed');
    } else {
      insights.push('Poor compliance score - immediate action required');
    }
    
    // Issue-based insights
    if (latestResult.criticalIssues.length > 0) {
      insights.push(`${latestResult.criticalIssues.length} critical compliance issue(s) require immediate attention`);
    }
    
    if (latestResult.highPriorityIssues.length > 0) {
      insights.push(`${latestResult.highPriorityIssues.length} high priority issue(s) should be addressed soon`);
    }
    
    // Trend-based insights
    if (recentResults.length >= 2) {
      const trend = this.calculateTrend(recentResults.map(r => ({
        timestamp: r.timestamp,
        score: r.overallScore,
        compliant: r.compliant,
        criticalIssues: r.criticalIssues.length,
        highPriorityIssues: r.highPriorityIssues.length,
        mediumPriorityIssues: r.mediumPriorityIssues.length,
        lowPriorityIssues: r.lowPriorityIssues.length,
        totalIssues: r.criticalIssues.length + r.highPriorityIssues.length + 
                    r.mediumPriorityIssues.length + r.lowPriorityIssues.length
      })));
      
      if (trend === 'improving') {
        insights.push('Compliance is improving over time');
      } else if (trend === 'declining') {
        insights.push('Compliance is declining - review recent changes');
      }
    }
    
    // WCAG compliance insights
    if (latestResult.wcagCompliance.levelAA) {
      insights.push('WCAG AA compliance achieved');
    } else if (latestResult.wcagCompliance.levelA) {
      insights.push('WCAG A compliance achieved - work towards AA');
    } else {
      insights.push('WCAG compliance needs attention');
    }
    
    return insights;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    latestResult: ComplianceCheckResult, 
    recentResults: ComplianceCheckResult[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Critical issues recommendations
    if (latestResult.criticalIssues.length > 0) {
      recommendations.push('Address all critical compliance issues immediately');
      recommendations.push('Implement automated testing to prevent critical issues');
    }
    
    // High priority issues recommendations
    if (latestResult.highPriorityIssues.length > 0) {
      recommendations.push('Prioritize high priority compliance issues');
      recommendations.push('Schedule regular compliance reviews');
    }
    
    // Score-based recommendations
    if (latestResult.overallScore < 80) {
      recommendations.push('Focus on improving overall compliance score');
      recommendations.push('Implement compliance monitoring and alerting');
    }
    
    // WCAG recommendations
    if (!latestResult.wcagCompliance.levelAA) {
      recommendations.push('Work towards WCAG AA compliance');
      recommendations.push('Implement accessibility testing in CI/CD pipeline');
    }
    
    // Industry-specific recommendations
    if (Object.keys(latestResult.industryCompliance).length > 0) {
      const failedStandards = Object.entries(latestResult.industryCompliance)
        .filter(([_, compliant]) => !compliant)
        .map(([standard, _]) => standard);
      
      if (failedStandards.length > 0) {
        recommendations.push(`Address industry compliance: ${failedStandards.join(', ')}`);
      }
    }
    
    return recommendations;
  }

  /**
   * Generate priority actions
   */
  private generatePriorityActions(latestResult: ComplianceCheckResult): {
    action: string;
    priority: 'high' | 'medium' | 'low';
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
  }[] {
    const actions = [];
    
    // Critical issues actions
    if (latestResult.criticalIssues.length > 0) {
      actions.push({
        action: 'Fix critical compliance issues',
        priority: 'high' as const,
        impact: 'high' as const,
        effort: 'medium' as const
      });
    }
    
    // High priority issues actions
    if (latestResult.highPriorityIssues.length > 0) {
      actions.push({
        action: 'Address high priority compliance issues',
        priority: 'high' as const,
        impact: 'medium' as const,
        effort: 'medium' as const
      });
    }
    
    // WCAG compliance actions
    if (!latestResult.wcagCompliance.levelAA) {
      actions.push({
        action: 'Implement WCAG AA compliance',
        priority: 'medium' as const,
        impact: 'high' as const,
        effort: 'high' as const
      });
    }
    
    // Monitoring actions
    actions.push({
      action: 'Implement automated compliance monitoring',
      priority: 'medium' as const,
      impact: 'high' as const,
      effort: 'medium' as const
    });
    
    return actions;
  }

  /**
   * Assess risk
   */
  private assessRisk(
    latestResult: ComplianceCheckResult, 
    recentResults: ComplianceCheckResult[]
  ): {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    mitigation: string[];
  } {
    const factors: string[] = [];
    const mitigation: string[] = [];
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    // Critical issues risk
    if (latestResult.criticalIssues.length > 0) {
      riskLevel = 'critical';
      factors.push('Critical compliance issues present');
      mitigation.push('Immediate remediation of critical issues');
    }
    
    // High priority issues risk
    if (latestResult.highPriorityIssues.length > 3) {
      if (riskLevel === 'low') riskLevel = 'high';
      factors.push('Multiple high priority compliance issues');
      mitigation.push('Prioritize and address high priority issues');
    }
    
    // Low compliance score risk
    if (latestResult.overallScore < 70) {
      if (riskLevel === 'low') riskLevel = 'medium';
      factors.push('Low compliance score');
      mitigation.push('Improve overall compliance score');
    }
    
    // WCAG compliance risk
    if (!latestResult.wcagCompliance.levelA) {
      if (riskLevel === 'low') riskLevel = 'medium';
      factors.push('WCAG compliance issues');
      mitigation.push('Implement WCAG compliance measures');
    }
    
    // Trend-based risk
    if (recentResults.length >= 3) {
      const trend = this.calculateTrend(recentResults.map(r => ({
        timestamp: r.timestamp,
        score: r.overallScore,
        compliant: r.compliant,
        criticalIssues: r.criticalIssues.length,
        highPriorityIssues: r.highPriorityIssues.length,
        mediumPriorityIssues: r.mediumPriorityIssues.length,
        lowPriorityIssues: r.lowPriorityIssues.length,
        totalIssues: r.criticalIssues.length + r.highPriorityIssues.length + 
                    r.mediumPriorityIssues.length + r.lowPriorityIssues.length
      })));
      
      if (trend === 'declining') {
        if (riskLevel === 'low') riskLevel = 'medium';
        factors.push('Declining compliance trend');
        mitigation.push('Investigate and address declining trend');
      }
    }
    
    return {
      level: riskLevel,
      factors,
      mitigation
    };
  }

  /**
   * Determine compliance status
   */
  private determineComplianceStatus(
    averageScore: number, 
    latestResult: ComplianceCheckResult
  ): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (latestResult.criticalIssues.length > 0) {
      return 'critical';
    }
    
    if (averageScore >= 90) {
      return 'excellent';
    } else if (averageScore >= 80) {
      return 'good';
    } else if (averageScore >= 70) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(
    trendAnalysis: ComplianceTrendAnalysis, 
    insights: ComplianceInsights
  ): {
    overallStatus: string;
    keyMetrics: Record<string, number>;
    topInsights: string[];
  } {
    return {
      overallStatus: insights.status,
      keyMetrics: {
        averageScore: trendAnalysis.averageScore,
        complianceRate: trendAnalysis.complianceRate,
        bestScore: trendAnalysis.bestScore,
        worstScore: trendAnalysis.worstScore
      },
      topInsights: insights.insights.slice(0, 3)
    };
  }

  /**
   * Calculate detailed metrics
   */
  private calculateDetailedMetrics(history: ComplianceCheckResult[]): {
    totalChecks: number;
    averageScore: number;
    complianceRate: number;
    criticalIssues: number;
    highPriorityIssues: number;
    wcagCompliance: {
      levelA: number;
      levelAA: number;
      levelAAA: number;
    };
    industryCompliance: Record<string, number>;
    brandGuidelineCompliance: Record<string, number>;
  } {
    const totalChecks = history.length;
    const averageScore = totalChecks > 0 ? 
      Math.round(history.reduce((sum, r) => sum + r.overallScore, 0) / totalChecks) : 0;
    const complianceRate = totalChecks > 0 ? 
      Math.round((history.filter(r => r.compliant).length / totalChecks) * 100) / 100 : 0;
    
    const criticalIssues = totalChecks > 0 ? 
      Math.round(history.reduce((sum, r) => sum + r.criticalIssues.length, 0) / totalChecks) : 0;
    const highPriorityIssues = totalChecks > 0 ? 
      Math.round(history.reduce((sum, r) => sum + r.highPriorityIssues.length, 0) / totalChecks) : 0;
    
    const wcagCompliance = {
      levelA: totalChecks > 0 ? 
        Math.round((history.filter(r => r.wcagCompliance.levelA).length / totalChecks) * 100) : 0,
      levelAA: totalChecks > 0 ? 
        Math.round((history.filter(r => r.wcagCompliance.levelAA).length / totalChecks) * 100) : 0,
      levelAAA: totalChecks > 0 ? 
        Math.round((history.filter(r => r.wcagCompliance.levelAAA).length / totalChecks) * 100) : 0
    };
    
    return {
      totalChecks,
      averageScore,
      complianceRate,
      criticalIssues,
      highPriorityIssues,
      wcagCompliance,
      industryCompliance: {},
      brandGuidelineCompliance: {}
    };
  }

  /**
   * Generate report recommendations
   */
  private generateReportRecommendations(
    insights: ComplianceInsights, 
    trendAnalysis: ComplianceTrendAnalysis
  ): {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  } {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];
    
    // Immediate recommendations
    if (insights.status === 'critical' || insights.status === 'poor') {
      immediate.push('Address critical compliance issues immediately');
      immediate.push('Implement emergency compliance measures');
    }
    
    // Short-term recommendations
    shortTerm.push('Improve compliance monitoring and alerting');
    shortTerm.push('Implement automated compliance testing');
    
    if (trendAnalysis.trend === 'declining') {
      shortTerm.push('Investigate and address declining compliance trend');
    }
    
    // Long-term recommendations
    longTerm.push('Establish comprehensive compliance program');
    longTerm.push('Implement continuous compliance improvement process');
    longTerm.push('Develop compliance training and awareness program');
    
    return {
      immediate,
      shortTerm,
      longTerm
    };
  }

  /**
   * Generate report ID
   */
  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Global compliance analytics instance
 */
export const complianceAnalytics = new BrandComplianceAnalytics();

/**
 * Utility functions for compliance analytics
 */
export const ComplianceAnalyticsUtils = {
  /**
   * Add compliance result to analytics
   */
  addComplianceResult(tenantId: string, result: ComplianceCheckResult): void {
    complianceAnalytics.addComplianceResult(tenantId, result);
  },

  /**
   * Get compliance trends
   */
  getComplianceTrends(tenantId: string, period?: AnalyticsTimePeriod): ComplianceTrendAnalysis {
    return complianceAnalytics.getComplianceTrends(tenantId, period);
  },

  /**
   * Generate compliance insights
   */
  generateComplianceInsights(tenantId: string): ComplianceInsights {
    return complianceAnalytics.generateComplianceInsights(tenantId);
  },

  /**
   * Generate analytics report
   */
  generateAnalyticsReport(tenantId: string, period?: AnalyticsTimePeriod): ComplianceAnalyticsReport {
    return complianceAnalytics.generateAnalyticsReport(tenantId, period);
  },

  /**
   * Get compliance benchmarking
   */
  getComplianceBenchmarking(tenantId: string): {
    currentScore: number;
    industryAverage: number;
    bestPracticeScore: number;
    percentile: number;
    recommendations: string[];
  } {
    return complianceAnalytics.getComplianceBenchmarking(tenantId);
  },

  /**
   * Get analytics statistics
   */
  getAnalyticsStats(): {
    totalTenants: number;
    totalDataPoints: number;
    averageDataPointsPerTenant: number;
    dataRetentionDays: number;
    cacheHitRate: number;
  } {
    return complianceAnalytics.getAnalyticsStats();
  }
};
