/**
 * Error Budget Tracker
 * 
 * Tracks error budget consumption, burn rates, and triggers alerts when
 * error budgets are at risk of being exhausted.
 */

import { Logger } from '../logger';
import { sloConfig, SLOTarget, SLOHelpers } from './slo-config';
import { getMonitoringConfig } from './config';

const budgetLogger = Logger.create({ component: 'error-budget-tracker' });

export interface ErrorBudgetAlert {
  id: string;
  sloName: string;
  level: 'warning' | 'critical' | 'exhausted';
  timestamp: string;
  message: string;
  details: {
    currentBurnRate: number;
    thresholdBurnRate: number;
    errorBudgetRemaining: number;
    estimatedExhaustion: string | null;
    businessImpact: string;
    recommendedActions: string[];
  };
  channels: ('email' | 'slack' | 'webhook')[];
}

export interface ErrorBudgetPolicy {
  name: string;
  description: string;
  triggers: {
    burnRateMultiplier: number; // e.g., 2.0 means burning 2x faster than sustainable
    timeWindowMinutes: number; // How long the burn rate must be sustained
    minBudgetRemaining: number; // Don't alert if budget remaining is below this %
  };
  actions: {
    freeze?: {
      enabled: boolean;
      freezeDeployments: boolean;
      freezeFeatureReleases: boolean;
      notifyTeams: string[];
    };
    escalate?: {
      enabled: boolean;
      escalateAfterMinutes: number;
      escalationTargets: string[];
    };
    runbook?: {
      url: string;
      description: string;
    };
  };
}

/**
 * Default error budget policies
 */
export const DEFAULT_ERROR_BUDGET_POLICIES: Record<string, ErrorBudgetPolicy> = {
  fast_burn: {
    name: 'Fast Burn Policy',
    description: 'Triggers when burning error budget at 14.4x rate (1 hour to exhaustion)',
    triggers: {
      burnRateMultiplier: 14.4,
      timeWindowMinutes: 2, // Must sustain for 2 minutes
      minBudgetRemaining: 2, // At least 2% budget must remain
    },
    actions: {
      freeze: {
        enabled: true,
        freezeDeployments: true,
        freezeFeatureReleases: true,
        notifyTeams: ['sre', 'engineering'],
      },
      escalate: {
        enabled: true,
        escalateAfterMinutes: 5,
        escalationTargets: ['on-call', 'engineering-manager'],
      },
      runbook: {
        url: 'https://docs.company.com/runbooks/fast-burn-response',
        description: 'Fast burn response procedures',
      },
    },
  },

  slow_burn: {
    name: 'Slow Burn Policy',
    description: 'Triggers when burning error budget at 6x rate (4 hours to exhaustion)',
    triggers: {
      burnRateMultiplier: 6.0,
      timeWindowMinutes: 15, // Must sustain for 15 minutes
      minBudgetRemaining: 10, // At least 10% budget must remain
    },
    actions: {
      freeze: {
        enabled: false,
        freezeDeployments: false,
        freezeFeatureReleases: false,
        notifyTeams: ['sre'],
      },
      escalate: {
        enabled: true,
        escalateAfterMinutes: 30,
        escalationTargets: ['sre-lead'],
      },
      runbook: {
        url: 'https://docs.company.com/runbooks/slow-burn-response',
        description: 'Slow burn response procedures',
      },
    },
  },

  exhaustion_warning: {
    name: 'Exhaustion Warning Policy',
    description: 'Triggers when error budget is nearly exhausted (< 5% remaining)',
    triggers: {
      burnRateMultiplier: 1.0, // Any burn rate
      timeWindowMinutes: 5,
      minBudgetRemaining: 5, // Less than 5% remaining
    },
    actions: {
      freeze: {
        enabled: true,
        freezeDeployments: true,
        freezeFeatureReleases: false,
        notifyTeams: ['sre', 'product'],
      },
      escalate: {
        enabled: true,
        escalateAfterMinutes: 10,
        escalationTargets: ['director-engineering'],
      },
      runbook: {
        url: 'https://docs.company.com/runbooks/budget-exhaustion',
        description: 'Error budget exhaustion procedures',
      },
    },
  },
};

/**
 * Error Budget Alert History
 */
class ErrorBudgetAlertHistory {
  private history: Map<string, ErrorBudgetAlert[]> = new Map();
  private maxHistorySize = 1000;

  /**
   * Add alert to history
   */
  addAlert(alert: ErrorBudgetAlert): void {
    const sloHistory = this.history.get(alert.sloName) || [];
    sloHistory.push(alert);
    
    // Keep only recent alerts
    if (sloHistory.length > this.maxHistorySize) {
      sloHistory.splice(0, sloHistory.length - this.maxHistorySize);
    }
    
    this.history.set(alert.sloName, sloHistory);
  }

  /**
   * Get alert history for SLO
   */
  getHistory(sloName: string, hours: number = 24): ErrorBudgetAlert[] {
    const alerts = this.history.get(sloName) || [];
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    
    return alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > cutoffTime
    );
  }

  /**
   * Get recent alerts across all SLOs
   */
  getRecentAlerts(hours: number = 1): ErrorBudgetAlert[] {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const allAlerts: ErrorBudgetAlert[] = [];
    
    for (const alerts of this.history.values()) {
      allAlerts.push(...alerts.filter(alert => 
        new Date(alert.timestamp).getTime() > cutoffTime
      ));
    }
    
    return allAlerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Check for duplicate alerts
   */
  isDuplicateAlert(
    sloName: string, 
    level: ErrorBudgetAlert['level'], 
    minutes: number = 15
  ): boolean {
    const recentAlerts = this.getHistory(sloName, 1);
    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    
    return recentAlerts.some(alert => 
      alert.level === level && 
      new Date(alert.timestamp).getTime() > cutoffTime
    );
  }
}

/**
 * Error Budget Tracker Class
 */
export class ErrorBudgetTracker {
  private alertHistory = new ErrorBudgetAlertHistory();
  private config = getMonitoringConfig();
  private policies: Map<string, ErrorBudgetPolicy> = new Map();
  private activeBurnRates: Map<string, {
    burnRate: number;
    startTime: Date;
    sustained: boolean;
  }> = new Map();

  constructor() {
    // Load default policies
    Object.entries(DEFAULT_ERROR_BUDGET_POLICIES).forEach(([key, policy]) => {
      this.policies.set(key, policy);
    });

    budgetLogger.info('Error budget tracker initialized', {
      policyCount: this.policies.size,
      alertingEnabled: this.config.alerts.enabled,
    });
  }

  /**
   * Track error budget for an SLO
   */
  trackErrorBudget(
    sloName: string,
    currentErrorRate: number,
    allowedErrorRate: number,
    timeWindowHours: number,
    metrics: {
      totalRequests: number;
      errorRequests: number;
      successfulRequests: number;
    }
  ): {
    alerts: ErrorBudgetAlert[];
    burnRate: number;
    budgetRemaining: number;
  } {
    const alerts: ErrorBudgetAlert[] = [];
    
    // Calculate current burn rate
    const burnRate = SLOHelpers.calculateBurnRate(
      currentErrorRate,
      allowedErrorRate,
      timeWindowHours
    );
    
    // Calculate budget consumption
    const budgetConsumed = SLOHelpers.calculateErrorBudgetConsumption(
      currentErrorRate,
      allowedErrorRate
    );
    const budgetRemaining = 100 - budgetConsumed;
    
    // Update sustained burn rate tracking
    this.updateSustainedBurnRate(sloName, burnRate);
    
    // Check each policy
    for (const [policyName, policy] of this.policies) {
      const alert = this.checkPolicy(
        sloName,
        policyName,
        policy,
        burnRate,
        budgetRemaining,
        metrics
      );
      
      if (alert) {
        alerts.push(alert);
      }
    }
    
    return {
      alerts,
      burnRate,
      budgetRemaining,
    };
  }

  /**
   * Update sustained burn rate tracking
   */
  private updateSustainedBurnRate(sloName: string, currentBurnRate: number): void {
    const existing = this.activeBurnRates.get(sloName);
    const now = new Date();
    
    if (!existing) {
      this.activeBurnRates.set(sloName, {
        burnRate: currentBurnRate,
        startTime: now,
        sustained: false,
      });
      return;
    }
    
    // If burn rate changed significantly, reset tracking
    const rateDifference = Math.abs(currentBurnRate - existing.burnRate) / existing.burnRate;
    if (rateDifference > 0.2) { // 20% change
      this.activeBurnRates.set(sloName, {
        burnRate: currentBurnRate,
        startTime: now,
        sustained: false,
      });
      return;
    }
    
    // Update existing tracking
    const durationMinutes = (now.getTime() - existing.startTime.getTime()) / 60000;
    existing.sustained = durationMinutes >= 2; // Sustained for at least 2 minutes
    existing.burnRate = currentBurnRate;
  }

  /**
   * Check if a policy should trigger an alert
   */
  private checkPolicy(
    sloName: string,
    policyName: string,
    policy: ErrorBudgetPolicy,
    burnRate: number,
    budgetRemaining: number,
    metrics: {
      totalRequests: number;
      errorRequests: number;
      successfulRequests: number;
    }
  ): ErrorBudgetAlert | null {
    const sustainedBurn = this.activeBurnRates.get(sloName);
    
    // Check if we meet the minimum budget remaining requirement
    if (budgetRemaining < policy.triggers.minBudgetRemaining) {
      return this.createExhaustionAlert(sloName, policy, burnRate, budgetRemaining, metrics);
    }
    
    // Check if burn rate exceeds threshold
    if (burnRate >= policy.triggers.burnRateMultiplier) {
      // Check if burn rate has been sustained
      if (sustainedBurn?.sustained) {
        const durationMinutes = (Date.now() - sustainedBurn.startTime.getTime()) / 60000;
        if (durationMinutes >= policy.triggers.timeWindowMinutes) {
          return this.createBurnRateAlert(sloName, policy, burnRate, budgetRemaining, metrics);
        }
      }
    }
    
    return null;
  }

  /**
   * Create burn rate alert
   */
  private createBurnRateAlert(
    sloName: string,
    policy: ErrorBudgetPolicy,
    burnRate: number,
    budgetRemaining: number,
    metrics: any
  ): ErrorBudgetAlert | null {
    const level: ErrorBudgetAlert['level'] = 
      burnRate >= 14.4 ? 'critical' : 'warning';
    
    // Check for duplicate alerts
    if (this.alertHistory.isDuplicateAlert(sloName, level, 15)) {
      return null;
    }
    
    const slo = sloConfig.getSLO(sloName);
    if (!slo) return null;
    
    const estimatedExhaustion = SLOHelpers.estimateErrorBudgetDepletion(
      100 - budgetRemaining,
      burnRate
    );
    
    const alert: ErrorBudgetAlert = {
      id: `${sloName}_${level}_${Date.now()}`,
      sloName,
      level,
      timestamp: new Date().toISOString(),
      message: `Error budget burn rate exceeded: ${burnRate.toFixed(2)}x (threshold: ${policy.triggers.burnRateMultiplier}x)`,
      details: {
        currentBurnRate: burnRate,
        thresholdBurnRate: policy.triggers.burnRateMultiplier,
        errorBudgetRemaining: budgetRemaining,
        estimatedExhaustion: estimatedExhaustion?.toISOString() || null,
        businessImpact: slo.businessImpact.impactDescription,
        recommendedActions: this.getRecommendedActions(sloName, policy, 'burn_rate'),
      },
      channels: slo.alerting.channels,
    };
    
    this.alertHistory.addAlert(alert);
    this.logAlert(alert, policy);
    
    return alert;
  }

  /**
   * Create exhaustion alert
   */
  private createExhaustionAlert(
    sloName: string,
    policy: ErrorBudgetPolicy,
    burnRate: number,
    budgetRemaining: number,
    metrics: any
  ): ErrorBudgetAlert | null {
    const level: ErrorBudgetAlert['level'] = 
      budgetRemaining <= 1 ? 'exhausted' : 'warning';
    
    // Check for duplicate alerts
    if (this.alertHistory.isDuplicateAlert(sloName, level, 30)) {
      return null;
    }
    
    const slo = sloConfig.getSLO(sloName);
    if (!slo) return null;
    
    const alert: ErrorBudgetAlert = {
      id: `${sloName}_${level}_${Date.now()}`,
      sloName,
      level,
      timestamp: new Date().toISOString(),
      message: `Error budget nearly exhausted: ${budgetRemaining.toFixed(2)}% remaining`,
      details: {
        currentBurnRate: burnRate,
        thresholdBurnRate: policy.triggers.burnRateMultiplier,
        errorBudgetRemaining: budgetRemaining,
        estimatedExhaustion: budgetRemaining <= 0 ? new Date().toISOString() : null,
        businessImpact: slo.businessImpact.impactDescription,
        recommendedActions: this.getRecommendedActions(sloName, policy, 'exhaustion'),
      },
      channels: slo.alerting.channels,
    };
    
    this.alertHistory.addAlert(alert);
    this.logAlert(alert, policy);
    
    return alert;
  }

  /**
   * Get recommended actions for an alert
   */
  private getRecommendedActions(
    sloName: string,
    policy: ErrorBudgetPolicy,
    alertType: 'burn_rate' | 'exhaustion'
  ): string[] {
    const actions: string[] = [];
    
    if (alertType === 'burn_rate') {
      actions.push('Investigate recent deployments and changes');
      actions.push('Check for increased error rates in application logs');
      actions.push('Review recent traffic patterns and load changes');
      actions.push('Consider rolling back recent changes if identified');
    } else {
      actions.push('Implement immediate error rate reduction measures');
      actions.push('Consider freezing non-critical deployments');
      actions.push('Review and prioritize bug fixes');
      actions.push('Evaluate if SLO targets need adjustment');
    }
    
    if (policy.actions.freeze?.enabled) {
      actions.push('Deployment freeze has been triggered automatically');
    }
    
    if (policy.actions.runbook?.url) {
      actions.push(`Follow runbook: ${policy.actions.runbook.url}`);
    }
    
    return actions;
  }

  /**
   * Log alert details
   */
  private logAlert(alert: ErrorBudgetAlert, policy: ErrorBudgetPolicy): void {
    budgetLogger.error('Error budget alert triggered', {
      alertId: alert.id,
      sloName: alert.sloName,
      level: alert.level,
      message: alert.message,
      policyName: policy.name,
      burnRate: alert.details.currentBurnRate,
      budgetRemaining: alert.details.errorBudgetRemaining,
      estimatedExhaustion: alert.details.estimatedExhaustion,
      channels: alert.channels,
      recommendedActions: alert.details.recommendedActions,
    });
  }

  /**
   * Get alert history
   */
  getAlertHistory(sloName?: string, hours: number = 24): ErrorBudgetAlert[] {
    if (sloName) {
      return this.alertHistory.getHistory(sloName, hours);
    }
    return this.alertHistory.getRecentAlerts(hours);
  }

  /**
   * Get policies
   */
  getPolicies(): Map<string, ErrorBudgetPolicy> {
    return new Map(this.policies);
  }

  /**
   * Add or update a policy
   */
  setPolicy(name: string, policy: ErrorBudgetPolicy): void {
    this.policies.set(name, policy);
    budgetLogger.info('Error budget policy updated', {
      policyName: name,
      burnRateMultiplier: policy.triggers.burnRateMultiplier,
    });
  }

  /**
   * Remove a policy
   */
  removePolicy(name: string): boolean {
    const removed = this.policies.delete(name);
    if (removed) {
      budgetLogger.info('Error budget policy removed', { policyName: name });
    }
    return removed;
  }

  /**
   * Get burn rate summary
   */
  getBurnRateSummary(): Array<{
    sloName: string;
    currentBurnRate: number;
    sustained: boolean;
    duration: number;
    status: 'normal' | 'elevated' | 'critical';
  }> {
    return Array.from(this.activeBurnRates.entries()).map(([sloName, data]) => {
      const duration = (Date.now() - data.startTime.getTime()) / 60000;
      let status: 'normal' | 'elevated' | 'critical';
      
      if (data.burnRate >= 14.4) {
        status = 'critical';
      } else if (data.burnRate >= 6.0) {
        status = 'elevated';
      } else {
        status = 'normal';
      }
      
      return {
        sloName,
        currentBurnRate: data.burnRate,
        sustained: data.sustained,
        duration,
        status,
      };
    });
  }
}

/**
 * Global error budget tracker instance
 */
export const errorBudgetTracker = new ErrorBudgetTracker();