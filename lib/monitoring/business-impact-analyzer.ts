/**
 * Business Impact Analyzer for SLO Breaches
 * 
 * Correlates SLO breaches with business metrics and provides impact assessments
 * to help prioritize incident response and resource allocation.
 */

import { Logger } from '../logger';
import { sloConfig, SLOTarget } from './slo-config';
import { getBusinessMetrics } from '../observability/otel';

const impactLogger = Logger.create({ component: 'business-impact-analyzer' });

export interface BusinessMetrics {
  timestamp: string;
  userRegistrations: number;
  formSubmissions: number;
  authenticatedSessions: number;
  pageViews: number;
  conversionRate: number;
  averageSessionDuration: number;
  bounceRate: number;
  errorRate: number;
  revenueIndicators?: {
    paidConversions: number;
    premiumUpgrades: number;
    subscriptionActivations: number;
  };
}

export interface BusinessImpactAssessment {
  sloName: string;
  timestamp: string;
  
  // Impact severity
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number; // 0-100 confidence in the assessment
  
  // Affected metrics
  affectedMetrics: {
    metric: string;
    baseline: number;
    current: number;
    percentageChange: number;
    impactLevel: 'severe' | 'moderate' | 'minor' | 'none';
  }[];
  
  // User impact
  userImpact: {
    estimatedAffectedUsers: number;
    totalUsers: number;
    percentageAffected: number;
    impactTypes: ('authentication' | 'registration' | 'form_submission' | 'page_load' | 'feature_access')[];
  };
  
  // Business impact
  businessImpact: {
    revenueRisk: {
      level: 'high' | 'medium' | 'low' | 'none';
      estimatedImpact: string;
      reasoning: string;
    };
    customerSatisfactionRisk: {
      level: 'high' | 'medium' | 'low' | 'none';
      reasoning: string;
    };
    operationalImpact: {
      level: 'high' | 'medium' | 'low' | 'none';
      areas: string[];
      reasoning: string;
    };
  };
  
  // Recommendations
  recommendations: {
    immediateActions: string[];
    shortTermActions: string[];
    longTermActions: string[];
    escalationRecommended: boolean;
    escalationReason?: string;
  };
  
  // Historical context
  historicalContext: {
    similarIncidentsInPast30Days: number;
    averageResolutionTime: number; // minutes
    previousBusinessImpact: 'higher' | 'similar' | 'lower' | 'unknown';
  };
}

/**
 * Business Impact Analyzer Class
 */
export class BusinessImpactAnalyzer {
  private baselineMetrics: Map<string, BusinessMetrics> = new Map();
  private impactHistory: BusinessImpactAssessment[] = [];
  private maxHistorySize = 1000;

  constructor() {
    // Start collecting baseline metrics
    this.collectBaseline();
    
    // Collect baseline every 5 minutes
    setInterval(() => {
      this.collectBaseline();
    }, 5 * 60 * 1000);

    impactLogger.info('Business impact analyzer initialized');
  }

  /**
   * Analyze business impact of an SLO breach
   */
  analyzeSLOImpact(
    sloName: string,
    slo: SLOTarget,
    sloMeasurement: {
      current: { value: number; status: string };
      errorBudget: { consumed: number; burnRate: number };
      metrics: any;
    }
  ): BusinessImpactAssessment {
    const currentMetrics = this.getCurrentBusinessMetrics();
    const baseline = this.getBaseline(sloName) || this.getAverageBaseline();
    
    // Calculate affected metrics
    const affectedMetrics = this.calculateAffectedMetrics(baseline, currentMetrics);
    
    // Calculate user impact
    const userImpact = this.calculateUserImpact(slo, sloMeasurement, currentMetrics);
    
    // Assess business impact
    const businessImpact = this.assessBusinessImpact(slo, affectedMetrics, userImpact);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(slo, sloMeasurement, businessImpact);
    
    // Get historical context
    const historicalContext = this.getHistoricalContext(sloName);
    
    // Determine overall severity and confidence
    const { severity, confidence } = this.determineSeverityAndConfidence(
      slo, 
      sloMeasurement, 
      affectedMetrics, 
      userImpact, 
      businessImpact
    );

    const assessment: BusinessImpactAssessment = {
      sloName,
      timestamp: new Date().toISOString(),
      severity,
      confidence,
      affectedMetrics,
      userImpact,
      businessImpact,
      recommendations,
      historicalContext,
    };

    // Store assessment in history
    this.impactHistory.push(assessment);
    if (this.impactHistory.length > this.maxHistorySize) {
      this.impactHistory.shift();
    }

    impactLogger.info('Business impact assessment completed', {
      sloName,
      severity,
      confidence,
      affectedUsers: userImpact.estimatedAffectedUsers,
      revenueRisk: businessImpact.revenueRisk.level,
    });

    return assessment;
  }

  /**
   * Collect baseline business metrics
   */
  private collectBaseline(): void {
    try {
      const metrics = this.getCurrentBusinessMetrics();
      const key = this.getTimeSlot(new Date(), 15); // 15-minute slots
      this.baselineMetrics.set(key, metrics);
      
      // Keep only recent baselines (last 7 days)
      const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000);
      for (const [key, metrics] of this.baselineMetrics.entries()) {
        if (new Date(metrics.timestamp).getTime() < cutoffTime) {
          this.baselineMetrics.delete(key);
        }
      }
    } catch (error) {
      impactLogger.error('Failed to collect baseline metrics', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get current business metrics
   */
  private getCurrentBusinessMetrics(): BusinessMetrics {
    const otelMetrics = getBusinessMetrics();
    
    return {
      timestamp: new Date().toISOString(),
      userRegistrations: otelMetrics.userRegistrations?.rate || 0,
      formSubmissions: otelMetrics.formSubmissions?.rate || 0,
      authenticatedSessions: otelMetrics.authenticationAttempts?.rate || 0,
      pageViews: otelMetrics.requestCount?.rate || 0,
      conversionRate: this.calculateConversionRate(otelMetrics),
      averageSessionDuration: otelMetrics.sessionDuration?.average || 0,
      bounceRate: otelMetrics.bounceRate || 0,
      errorRate: otelMetrics.errorCount?.rate || 0,
      revenueIndicators: {
        paidConversions: otelMetrics.paidConversions?.rate || 0,
        premiumUpgrades: otelMetrics.premiumUpgrades?.rate || 0,
        subscriptionActivations: otelMetrics.subscriptionActivations?.rate || 0,
      },
    };
  }

  /**
   * Calculate conversion rate from metrics
   */
  private calculateConversionRate(metrics: any): number {
    const totalSessions = metrics.sessionCount?.total || 0;
    const conversions = (metrics.formSubmissions?.total || 0) + 
                       (metrics.userRegistrations?.total || 0);
    
    if (totalSessions === 0) return 0;
    return (conversions / totalSessions) * 100;
  }

  /**
   * Get baseline metrics for comparison
   */
  private getBaseline(sloName: string): BusinessMetrics | null {
    // Get baseline from same time period in previous days
    const now = new Date();
    const currentSlot = this.getTimeSlot(now, 15);
    
    // Look for same time slot from previous days
    for (let daysBack = 1; daysBack <= 7; daysBack++) {
      const previousDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      const previousSlot = this.getTimeSlot(previousDate, 15);
      
      const baseline = this.baselineMetrics.get(previousSlot);
      if (baseline) {
        return baseline;
      }
    }
    
    return null;
  }

  /**
   * Get average baseline from recent data
   */
  private getAverageBaseline(): BusinessMetrics {
    const recentMetrics = Array.from(this.baselineMetrics.values());
    
    if (recentMetrics.length === 0) {
      return this.getCurrentBusinessMetrics(); // Fallback to current
    }

    // Calculate averages
    const avg = {
      timestamp: new Date().toISOString(),
      userRegistrations: this.average(recentMetrics.map(m => m.userRegistrations)),
      formSubmissions: this.average(recentMetrics.map(m => m.formSubmissions)),
      authenticatedSessions: this.average(recentMetrics.map(m => m.authenticatedSessions)),
      pageViews: this.average(recentMetrics.map(m => m.pageViews)),
      conversionRate: this.average(recentMetrics.map(m => m.conversionRate)),
      averageSessionDuration: this.average(recentMetrics.map(m => m.averageSessionDuration)),
      bounceRate: this.average(recentMetrics.map(m => m.bounceRate)),
      errorRate: this.average(recentMetrics.map(m => m.errorRate)),
    };

    return avg;
  }

  /**
   * Calculate affected metrics
   */
  private calculateAffectedMetrics(
    baseline: BusinessMetrics, 
    current: BusinessMetrics
  ): BusinessImpactAssessment['affectedMetrics'] {
    const metrics = [
      { key: 'userRegistrations', name: 'User Registrations' },
      { key: 'formSubmissions', name: 'Form Submissions' },
      { key: 'authenticatedSessions', name: 'Authenticated Sessions' },
      { key: 'pageViews', name: 'Page Views' },
      { key: 'conversionRate', name: 'Conversion Rate' },
      { key: 'averageSessionDuration', name: 'Average Session Duration' },
      { key: 'bounceRate', name: 'Bounce Rate' },
    ];

    return metrics.map(({ key, name }) => {
      const baselineValue = (baseline as any)[key] || 0;
      const currentValue = (current as any)[key] || 0;
      
      let percentageChange = 0;
      if (baselineValue !== 0) {
        percentageChange = ((currentValue - baselineValue) / baselineValue) * 100;
      }

      let impactLevel: 'severe' | 'moderate' | 'minor' | 'none';
      const absChange = Math.abs(percentageChange);
      
      if (absChange >= 50) {
        impactLevel = 'severe';
      } else if (absChange >= 20) {
        impactLevel = 'moderate';
      } else if (absChange >= 5) {
        impactLevel = 'minor';
      } else {
        impactLevel = 'none';
      }

      return {
        metric: name,
        baseline: baselineValue,
        current: currentValue,
        percentageChange,
        impactLevel,
      };
    });
  }

  /**
   * Calculate user impact
   */
  private calculateUserImpact(
    slo: SLOTarget,
    sloMeasurement: any,
    currentMetrics: BusinessMetrics
  ): BusinessImpactAssessment['userImpact'] {
    const totalUsers = currentMetrics.authenticatedSessions * 10; // Estimate total users
    let estimatedAffectedUsers = 0;
    const impactTypes: BusinessImpactAssessment['userImpact']['impactTypes'] = [];

    // Calculate affected users based on SLO type and breach severity
    switch (slo.type) {
      case 'availability':
        const unavailabilityRate = (100 - sloMeasurement.current.value) / 100;
        estimatedAffectedUsers = Math.round(totalUsers * unavailabilityRate);
        if (unavailabilityRate > 0) {
          impactTypes.push('page_load', 'feature_access');
        }
        break;

      case 'error_rate':
        const errorRate = (100 - sloMeasurement.current.value) / 100;
        estimatedAffectedUsers = Math.round(totalUsers * errorRate);
        
        if (slo.name.includes('auth')) {
          impactTypes.push('authentication');
        } else if (slo.name.includes('form')) {
          impactTypes.push('form_submission');
        } else if (slo.name.includes('registration')) {
          impactTypes.push('registration');
        }
        break;

      case 'latency':
        // Estimate that slow responses affect user satisfaction
        const slowResponseRate = (100 - sloMeasurement.current.value) / 100;
        estimatedAffectedUsers = Math.round(totalUsers * slowResponseRate * 0.7); // Not all users affected equally
        impactTypes.push('page_load');
        break;

      default:
        estimatedAffectedUsers = Math.round(totalUsers * 0.1); // Default 10%
        break;
    }

    const percentageAffected = totalUsers > 0 ? (estimatedAffectedUsers / totalUsers) * 100 : 0;

    return {
      estimatedAffectedUsers,
      totalUsers,
      percentageAffected,
      impactTypes,
    };
  }

  /**
   * Assess business impact
   */
  private assessBusinessImpact(
    slo: SLOTarget,
    affectedMetrics: BusinessImpactAssessment['affectedMetrics'],
    userImpact: BusinessImpactAssessment['userImpact']
  ): BusinessImpactAssessment['businessImpact'] {
    // Revenue risk assessment
    const revenueRisk = this.assessRevenueRisk(slo, affectedMetrics, userImpact);
    
    // Customer satisfaction risk
    const customerSatisfactionRisk = this.assessCustomerSatisfactionRisk(slo, userImpact);
    
    // Operational impact
    const operationalImpact = this.assessOperationalImpact(slo, affectedMetrics);

    return {
      revenueRisk,
      customerSatisfactionRisk,
      operationalImpact,
    };
  }

  /**
   * Assess revenue risk
   */
  private assessRevenueRisk(
    slo: SLOTarget,
    affectedMetrics: BusinessImpactAssessment['affectedMetrics'],
    userImpact: BusinessImpactAssessment['userImpact']
  ): BusinessImpactAssessment['businessImpact']['revenueRisk'] {
    const registrationImpact = affectedMetrics.find(m => m.metric === 'User Registrations');
    const formImpact = affectedMetrics.find(m => m.metric === 'Form Submissions');
    const conversionImpact = affectedMetrics.find(m => m.metric === 'Conversion Rate');

    let level: 'high' | 'medium' | 'low' | 'none' = 'none';
    let reasoning = '';
    let estimatedImpact = '';

    if (slo.businessImpact.revenueImpact === 'high') {
      if (userImpact.percentageAffected > 50) {
        level = 'high';
        reasoning = 'Critical SLO breach affecting majority of users with high revenue impact';
        estimatedImpact = 'Significant revenue loss expected due to user abandonment';
      } else if (userImpact.percentageAffected > 20) {
        level = 'medium';
        reasoning = 'Substantial user impact on revenue-critical functionality';
        estimatedImpact = 'Moderate revenue impact from reduced conversions';
      } else {
        level = 'low';
        reasoning = 'Limited user impact but affects revenue-critical system';
        estimatedImpact = 'Minor revenue impact expected';
      }
    } else if (slo.businessImpact.revenueImpact === 'medium') {
      level = userImpact.percentageAffected > 30 ? 'medium' : 'low';
      reasoning = level === 'medium' ? 
        'Moderate revenue impact with significant user base affected' :
        'Limited revenue impact with small user base affected';
      estimatedImpact = level === 'medium' ? 
        'Some revenue loss from reduced user engagement' :
        'Minimal revenue impact expected';
    }

    // Consider specific metric impacts
    if (formImpact && formImpact.impactLevel === 'severe') {
      level = level === 'none' ? 'high' : level;
      reasoning += '. Severe form submission impact detected';
    }

    if (registrationImpact && registrationImpact.impactLevel === 'severe') {
      level = level === 'none' ? 'medium' : level;
      reasoning += '. User registration significantly affected';
    }

    return { level, estimatedImpact, reasoning: reasoning.trim() };
  }

  /**
   * Assess customer satisfaction risk
   */
  private assessCustomerSatisfactionRisk(
    slo: SLOTarget,
    userImpact: BusinessImpactAssessment['userImpact']
  ): BusinessImpactAssessment['businessImpact']['customerSatisfactionRisk'] {
    let level: 'high' | 'medium' | 'low' | 'none';
    let reasoning: string;

    if (userImpact.percentageAffected > 30) {
      level = 'high';
      reasoning = 'Large percentage of users experiencing degraded service';
    } else if (userImpact.percentageAffected > 10) {
      level = 'medium';
      reasoning = 'Moderate user impact likely to affect satisfaction scores';
    } else if (userImpact.percentageAffected > 1) {
      level = 'low';
      reasoning = 'Limited user impact with minimal satisfaction risk';
    } else {
      level = 'none';
      reasoning = 'Minimal user impact expected';
    }

    // Consider impact types
    if (userImpact.impactTypes.includes('authentication')) {
      level = level === 'none' ? 'high' : level;
      reasoning += '. Authentication issues create significant user frustration';
    }

    if (userImpact.impactTypes.includes('form_submission')) {
      level = level === 'none' ? 'medium' : level;
      reasoning += '. Form submission problems impact core user workflows';
    }

    return { level, reasoning: reasoning.trim() };
  }

  /**
   * Assess operational impact
   */
  private assessOperationalImpact(
    slo: SLOTarget,
    affectedMetrics: BusinessImpactAssessment['affectedMetrics']
  ): BusinessImpactAssessment['businessImpact']['operationalImpact'] {
    const areas: string[] = [];
    let level: 'high' | 'medium' | 'low' | 'none' = 'low'; // Default to some impact
    
    if (slo.businessImpact.severity === 'critical') {
      level = 'high';
      areas.push('Customer Support');
      areas.push('Engineering Team Response');
      areas.push('Incident Management');
    }

    // Check for specific operational areas
    if (affectedMetrics.some(m => m.metric === 'Form Submissions' && m.impactLevel !== 'none')) {
      areas.push('Data Collection');
      areas.push('Lead Generation');
    }

    if (affectedMetrics.some(m => m.metric === 'User Registrations' && m.impactLevel !== 'none')) {
      areas.push('User Acquisition');
      areas.push('Account Management');
    }

    const reasoning = `${areas.length} operational areas potentially affected by this SLO breach`;

    return { level, areas, reasoning };
  }

  /**
   * Generate recommendations based on impact assessment
   */
  private generateRecommendations(
    slo: SLOTarget,
    sloMeasurement: any,
    businessImpact: BusinessImpactAssessment['businessImpact']
  ): BusinessImpactAssessment['recommendations'] {
    const immediateActions: string[] = [];
    const shortTermActions: string[] = [];
    const longTermActions: string[] = [];
    let escalationRecommended = false;
    let escalationReason = '';

    // Immediate actions based on severity
    if (businessImpact.revenueRisk.level === 'high') {
      immediateActions.push('Activate incident response team');
      immediateActions.push('Consider emergency rollback of recent changes');
      immediateActions.push('Communicate with stakeholders about revenue impact');
      escalationRecommended = true;
      escalationReason = 'High revenue risk detected';
    }

    if (businessImpact.customerSatisfactionRisk.level === 'high') {
      immediateActions.push('Prepare customer communication about service issues');
      immediateActions.push('Monitor support channels for increased ticket volume');
    }

    // SLO-specific immediate actions
    if (slo.type === 'availability') {
      immediateActions.push('Check infrastructure health and scaling');
      immediateActions.push('Review load balancer and CDN status');
    } else if (slo.type === 'error_rate') {
      immediateActions.push('Investigate recent error spikes in logs');
      immediateActions.push('Check for correlation with recent deployments');
    } else if (slo.type === 'latency') {
      immediateActions.push('Review database performance metrics');
      immediateActions.push('Check for slow queries and resource contention');
    }

    // Short-term actions
    shortTermActions.push('Conduct root cause analysis');
    shortTermActions.push('Update monitoring thresholds if needed');
    shortTermActions.push('Review error budget consumption rate');

    if (businessImpact.operationalImpact.level !== 'none') {
      shortTermActions.push('Brief affected operational teams');
      shortTermActions.push('Document incident for post-mortem');
    }

    // Long-term actions
    longTermActions.push('Review SLO target appropriateness');
    longTermActions.push('Consider infrastructure resilience improvements');
    longTermActions.push('Evaluate need for additional monitoring');

    if (businessImpact.revenueRisk.level !== 'none') {
      longTermActions.push('Assess business continuity planning');
      longTermActions.push('Consider service level agreement updates');
    }

    return {
      immediateActions,
      shortTermActions,
      longTermActions,
      escalationRecommended,
      escalationReason,
    };
  }

  /**
   * Get historical context
   */
  private getHistoricalContext(sloName: string): BusinessImpactAssessment['historicalContext'] {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const similarIncidents = this.impactHistory.filter(assessment => 
      assessment.sloName === sloName && 
      new Date(assessment.timestamp).getTime() > thirtyDaysAgo
    );

    const averageResolutionTime = similarIncidents.length > 0 ? 
      similarIncidents.reduce((sum, incident) => sum + 60, 0) / similarIncidents.length : // Placeholder: 60 minutes
      45; // Default estimate

    let previousBusinessImpact: 'higher' | 'similar' | 'lower' | 'unknown' = 'unknown';
    if (similarIncidents.length > 0) {
      const lastIncident = similarIncidents[similarIncidents.length - 1];
      if (lastIncident.severity === 'critical') {
        previousBusinessImpact = 'similar';
      } else {
        previousBusinessImpact = 'lower';
      }
    }

    return {
      similarIncidentsInPast30Days: similarIncidents.length,
      averageResolutionTime,
      previousBusinessImpact,
    };
  }

  /**
   * Determine severity and confidence
   */
  private determineSeverityAndConfidence(
    slo: SLOTarget,
    sloMeasurement: any,
    affectedMetrics: BusinessImpactAssessment['affectedMetrics'],
    userImpact: BusinessImpactAssessment['userImpact'],
    businessImpact: BusinessImpactAssessment['businessImpact']
  ): { severity: BusinessImpactAssessment['severity']; confidence: number } {
    let severity: BusinessImpactAssessment['severity'] = 'low';
    let confidence = 50; // Base confidence

    // Determine severity based on multiple factors
    if (businessImpact.revenueRisk.level === 'high' || 
        businessImpact.customerSatisfactionRisk.level === 'high') {
      severity = 'critical';
      confidence += 30;
    } else if (businessImpact.revenueRisk.level === 'medium' || 
               userImpact.percentageAffected > 20) {
      severity = 'high';
      confidence += 20;
    } else if (affectedMetrics.some(m => m.impactLevel === 'moderate') || 
               userImpact.percentageAffected > 5) {
      severity = 'medium';
      confidence += 10;
    }

    // Adjust confidence based on data quality
    if (this.baselineMetrics.size > 10) {
      confidence += 20; // Good baseline data
    }
    
    if (userImpact.totalUsers > 100) {
      confidence += 10; // Significant user base
    }

    // Cap confidence at 95%
    confidence = Math.min(95, confidence);

    return { severity, confidence };
  }

  /**
   * Utility functions
   */
  private getTimeSlot(date: Date, intervalMinutes: number): string {
    const minutes = Math.floor(date.getMinutes() / intervalMinutes) * intervalMinutes;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
                   date.getHours(), minutes, 0, 0).toISOString();
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Get impact assessment history
   */
  getImpactHistory(sloName?: string, hours: number = 24): BusinessImpactAssessment[] {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    
    return this.impactHistory
      .filter(assessment => {
        const timeMatch = new Date(assessment.timestamp).getTime() > cutoffTime;
        const sloMatch = !sloName || assessment.sloName === sloName;
        return timeMatch && sloMatch;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get summary of business impact trends
   */
  getImpactSummary(): {
    totalAssessments: number;
    criticalImpacts: number;
    averageSeverityScore: number;
    mostAffectedSLOs: { sloName: string; count: number }[];
  } {
    const recentAssessments = this.getImpactHistory(undefined, 24);
    
    const severityScores = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    const averageSeverityScore = recentAssessments.length > 0 ?
      recentAssessments.reduce((sum, assessment) => 
        sum + severityScores[assessment.severity], 0) / recentAssessments.length :
      0;

    const sloCountMap = new Map<string, number>();
    recentAssessments.forEach(assessment => {
      const count = sloCountMap.get(assessment.sloName) || 0;
      sloCountMap.set(assessment.sloName, count + 1);
    });

    const mostAffectedSLOs = Array.from(sloCountMap.entries())
      .map(([sloName, count]) => ({ sloName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalAssessments: recentAssessments.length,
      criticalImpacts: recentAssessments.filter(a => a.severity === 'critical').length,
      averageSeverityScore,
      mostAffectedSLOs,
    };
  }
}

/**
 * Global business impact analyzer instance
 */
export const businessImpactAnalyzer = new BusinessImpactAnalyzer();