/**
 * Service Level Objectives (SLO) Configuration
 * 
 * Defines SLOs for availability, latency, and error rate with automated monitoring,
 * error budget tracking, and business impact correlation.
 */

import { Logger } from '../logger';
import { getMonitoringConfig } from './config';

const sloLogger = Logger.create({ component: 'slo-config' });

export interface SLOTarget {
  // SLO definition
  name: string;
  description: string;
  type: 'availability' | 'latency' | 'error_rate' | 'throughput';
  
  // Target values
  target: number; // Target percentage (e.g., 99.5 for 99.5%)
  threshold: number; // Warning threshold (e.g., 99.0 for 99.0%)
  
  // Time windows
  timeWindow: {
    duration: number; // Window duration in hours
    rollingWindow: boolean; // Whether to use rolling or calendar window
  };
  
  // Error budget
  errorBudget: {
    allowedErrorRate: number; // Calculated from target (e.g., 0.5% for 99.5% target)
    burnRateThresholds: {
      critical: number; // Error budget burn rate that triggers critical alert
      warning: number; // Error budget burn rate that triggers warning
    };
  };
  
  // Business impact
  businessImpact: {
    severity: 'critical' | 'high' | 'medium' | 'low';
    impactDescription: string;
    affectedUsers: 'all' | 'premium' | 'subset';
    revenueImpact: 'high' | 'medium' | 'low' | 'none';
  };
  
  // Alerting configuration
  alerting: {
    enabled: boolean;
    channels: ('email' | 'slack' | 'webhook')[];
    escalation: {
      warningAfterMinutes: number;
      criticalAfterMinutes: number;
    };
  };
}

/**
 * Default SLO definitions for DCT Micro-Apps
 */
export const DEFAULT_SLOS: Record<string, SLOTarget> = {
  // API Availability SLO
  api_availability: {
    name: 'API Availability',
    description: 'API endpoints must be available and responding to requests',
    type: 'availability',
    target: 99.5, // 99.5% availability target
    threshold: 99.0, // Warning at 99.0%
    timeWindow: {
      duration: 24, // 24-hour window
      rollingWindow: true,
    },
    errorBudget: {
      allowedErrorRate: 0.5, // 0.5% error rate allowed
      burnRateThresholds: {
        critical: 14.4, // Burns entire error budget in 1 hour
        warning: 6.0,  // Burns entire error budget in 4 hours
      },
    },
    businessImpact: {
      severity: 'critical',
      impactDescription: 'Complete service outage preventing user access',
      affectedUsers: 'all',
      revenueImpact: 'high',
    },
    alerting: {
      enabled: true,
      channels: ['email', 'slack', 'webhook'],
      escalation: {
        warningAfterMinutes: 5,
        criticalAfterMinutes: 10,
      },
    },
  },

  // Response Time SLO
  response_time: {
    name: 'API Response Time',
    description: '95% of requests must complete within acceptable time limits',
    type: 'latency',
    target: 95.0, // 95% of requests under threshold
    threshold: 90.0, // Warning at 90%
    timeWindow: {
      duration: 24,
      rollingWindow: true,
    },
    errorBudget: {
      allowedErrorRate: 5.0, // 5% of requests can be slow
      burnRateThresholds: {
        critical: 12.0, // Burns error budget in 2 hours
        warning: 3.0,   // Burns error budget in 8 hours
      },
    },
    businessImpact: {
      severity: 'high',
      impactDescription: 'Poor user experience due to slow response times',
      affectedUsers: 'all',
      revenueImpact: 'medium',
    },
    alerting: {
      enabled: true,
      channels: ['email', 'slack'],
      escalation: {
        warningAfterMinutes: 10,
        criticalAfterMinutes: 20,
      },
    },
  },

  // Error Rate SLO
  error_rate: {
    name: 'Error Rate',
    description: 'HTTP error rate must remain below acceptable thresholds',
    type: 'error_rate',
    target: 99.0, // 99% success rate (1% error rate)
    threshold: 98.0, // Warning at 98% (2% error rate)
    timeWindow: {
      duration: 24,
      rollingWindow: true,
    },
    errorBudget: {
      allowedErrorRate: 1.0, // 1% error rate allowed
      burnRateThresholds: {
        critical: 10.0, // Burns error budget in 2.4 hours
        warning: 2.5,   // Burns error budget in 9.6 hours
      },
    },
    businessImpact: {
      severity: 'high',
      impactDescription: 'Increased errors causing user frustration and potential data loss',
      affectedUsers: 'all',
      revenueImpact: 'medium',
    },
    alerting: {
      enabled: true,
      channels: ['email', 'slack', 'webhook'],
      escalation: {
        warningAfterMinutes: 15,
        criticalAfterMinutes: 30,
      },
    },
  },

  // Database Performance SLO
  database_response_time: {
    name: 'Database Response Time',
    description: 'Database queries must complete within acceptable time limits',
    type: 'latency',
    target: 98.0, // 98% of queries under 500ms
    threshold: 95.0, // Warning at 95%
    timeWindow: {
      duration: 24,
      rollingWindow: true,
    },
    errorBudget: {
      allowedErrorRate: 2.0, // 2% of queries can be slow
      burnRateThresholds: {
        critical: 24.0, // Burns error budget in 1 hour
        warning: 6.0,   // Burns error budget in 4 hours
      },
    },
    businessImpact: {
      severity: 'medium',
      impactDescription: 'Slow database performance affecting application responsiveness',
      affectedUsers: 'all',
      revenueImpact: 'low',
    },
    alerting: {
      enabled: true,
      channels: ['email'],
      escalation: {
        warningAfterMinutes: 20,
        criticalAfterMinutes: 45,
      },
    },
  },

  // Authentication Success Rate SLO
  auth_success_rate: {
    name: 'Authentication Success Rate',
    description: 'Authentication requests must succeed at acceptable rates',
    type: 'error_rate',
    target: 99.9, // 99.9% authentication success rate
    threshold: 99.5, // Warning at 99.5%
    timeWindow: {
      duration: 24,
      rollingWindow: true,
    },
    errorBudget: {
      allowedErrorRate: 0.1, // 0.1% authentication failures allowed
      burnRateThresholds: {
        critical: 144.0, // Burns error budget in 10 minutes
        warning: 36.0,   // Burns error budget in 40 minutes
      },
    },
    businessImpact: {
      severity: 'critical',
      impactDescription: 'Users unable to authenticate and access the application',
      affectedUsers: 'all',
      revenueImpact: 'high',
    },
    alerting: {
      enabled: true,
      channels: ['email', 'slack', 'webhook'],
      escalation: {
        warningAfterMinutes: 5,
        criticalAfterMinutes: 10,
      },
    },
  },

  // Form Submission Success Rate SLO (Business-critical)
  form_submission_success: {
    name: 'Form Submission Success Rate',
    description: 'Form submissions must succeed at high rates to maintain business functionality',
    type: 'error_rate',
    target: 99.5, // 99.5% success rate
    threshold: 99.0, // Warning at 99.0%
    timeWindow: {
      duration: 24,
      rollingWindow: true,
    },
    errorBudget: {
      allowedErrorRate: 0.5, // 0.5% failure rate allowed
      burnRateThresholds: {
        critical: 14.4, // Burns error budget in 1 hour
        warning: 6.0,   // Burns error budget in 4 hours
      },
    },
    businessImpact: {
      severity: 'critical',
      impactDescription: 'Business data collection and lead generation severely impacted',
      affectedUsers: 'all',
      revenueImpact: 'high',
    },
    alerting: {
      enabled: true,
      channels: ['email', 'slack', 'webhook'],
      escalation: {
        warningAfterMinutes: 10,
        criticalAfterMinutes: 20,
      },
    },
  },
};

/**
 * SLO measurement periods and calculations
 */
export interface SLOMeasurement {
  sloName: string;
  timestamp: string;
  timeWindow: {
    start: string;
    end: string;
    duration: number; // hours
  };
  
  // Current performance
  current: {
    value: number; // Current SLO performance (percentage)
    isHealthy: boolean; // Whether SLO is being met
    status: 'healthy' | 'warning' | 'breach';
  };
  
  // Error budget
  errorBudget: {
    total: number; // Total error budget for the period
    consumed: number; // Error budget consumed (percentage)
    remaining: number; // Error budget remaining (percentage)
    burnRate: number; // Current burn rate (multiplier)
    estimatedDepletion: string | null; // When error budget will be exhausted
  };
  
  // Trend analysis
  trend: {
    direction: 'improving' | 'stable' | 'degrading';
    changeRate: number; // Rate of change (positive = improving)
    periodComparison: number; // Comparison to previous period (percentage)
  };
  
  // Raw metrics used in calculation
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    errorRequests: number;
    averageResponseTime?: number;
    p95ResponseTime?: number;
    p99ResponseTime?: number;
  };
}

/**
 * SLO configuration class
 */
export class SLOConfiguration {
  private slos: Map<string, SLOTarget> = new Map();
  private config = getMonitoringConfig();

  constructor() {
    // Load default SLOs
    Object.entries(DEFAULT_SLOS).forEach(([key, slo]) => {
      this.slos.set(key, slo);
    });

    sloLogger.info('SLO configuration initialized', {
      sloCount: this.slos.size,
      sloNames: Array.from(this.slos.keys()),
    });
  }

  /**
   * Get all configured SLOs
   */
  getAllSLOs(): Map<string, SLOTarget> {
    return new Map(this.slos);
  }

  /**
   * Get a specific SLO by name
   */
  getSLO(name: string): SLOTarget | undefined {
    return this.slos.get(name);
  }

  /**
   * Get SLOs by type
   */
  getSLOsByType(type: SLOTarget['type']): SLOTarget[] {
    return Array.from(this.slos.values()).filter(slo => slo.type === type);
  }

  /**
   * Get critical SLOs (those with critical business impact)
   */
  getCriticalSLOs(): SLOTarget[] {
    return Array.from(this.slos.values()).filter(slo => 
      slo.businessImpact.severity === 'critical'
    );
  }

  /**
   * Check if SLO monitoring is enabled globally
   */
  isSLOMonitoringEnabled(): boolean {
    return this.config.enabled && this.config.redMetrics.enabled;
  }

  /**
   * Get SLO alerting configuration
   */
  getAlertingConfig() {
    return this.config.alerts;
  }

  /**
   * Calculate error budget burn rate thresholds
   */
  calculateBurnRateThresholds(target: number, timeWindowHours: number): {
    critical: number;
    warning: number;
  } {
    const errorBudgetPercent = 100 - target;
    
    // Critical: Burns entire error budget in 1 hour
    const critical = (errorBudgetPercent * timeWindowHours) / 1;
    
    // Warning: Burns entire error budget in 4 hours
    const warning = (errorBudgetPercent * timeWindowHours) / 4;
    
    return { critical, warning };
  }

  /**
   * Add or update an SLO
   */
  setSLO(name: string, slo: SLOTarget): void {
    this.slos.set(name, slo);
    sloLogger.info('SLO configuration updated', {
      sloName: name,
      target: slo.target,
      type: slo.type,
    });
  }

  /**
   * Remove an SLO
   */
  removeSLO(name: string): boolean {
    const removed = this.slos.delete(name);
    if (removed) {
      sloLogger.info('SLO removed', { sloName: name });
    }
    return removed;
  }

  /**
   * Validate SLO configuration
   */
  validateSLO(slo: SLOTarget): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (slo.target <= 0 || slo.target > 100) {
      errors.push('Target must be between 0 and 100');
    }

    if (slo.threshold <= 0 || slo.threshold > 100) {
      errors.push('Threshold must be between 0 and 100');
    }

    if (slo.target <= slo.threshold) {
      errors.push('Target must be higher than threshold');
    }

    if (slo.timeWindow.duration <= 0) {
      errors.push('Time window duration must be positive');
    }

    if (slo.errorBudget.allowedErrorRate < 0) {
      errors.push('Allowed error rate must be non-negative');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Global SLO configuration instance
 */
export const sloConfig = new SLOConfiguration();

/**
 * Helper functions
 */
export const SLOHelpers = {
  /**
   * Calculate SLO compliance percentage
   */
  calculateCompliance(successfulRequests: number, totalRequests: number): number {
    if (totalRequests === 0) return 100;
    return (successfulRequests / totalRequests) * 100;
  },

  /**
   * Calculate error budget consumption
   */
  calculateErrorBudgetConsumption(
    actualErrorRate: number, 
    allowedErrorRate: number
  ): number {
    if (allowedErrorRate === 0) return actualErrorRate > 0 ? 100 : 0;
    return Math.min(100, (actualErrorRate / allowedErrorRate) * 100);
  },

  /**
   * Calculate burn rate
   */
  calculateBurnRate(
    currentErrorRate: number, 
    allowedErrorRate: number,
    timeWindowHours: number
  ): number {
    if (allowedErrorRate === 0) return currentErrorRate > 0 ? Infinity : 0;
    const normalizedRate = currentErrorRate / allowedErrorRate;
    return normalizedRate * (24 / timeWindowHours); // Normalized to 24-hour burn rate
  },

  /**
   * Estimate error budget depletion time
   */
  estimateErrorBudgetDepletion(
    consumedPercentage: number,
    burnRate: number
  ): Date | null {
    if (burnRate <= 0 || consumedPercentage >= 100) return null;
    
    const remainingPercentage = 100 - consumedPercentage;
    const hoursToDepletion = remainingPercentage / burnRate;
    
    if (hoursToDepletion <= 0 || !isFinite(hoursToDepletion)) return null;
    
    return new Date(Date.now() + hoursToDepletion * 60 * 60 * 1000);
  },

  /**
   * Determine SLO status
   */
  determineSLOStatus(
    currentValue: number,
    target: number,
    threshold: number
  ): 'healthy' | 'warning' | 'breach' {
    if (currentValue >= target) return 'healthy';
    if (currentValue >= threshold) return 'warning';
    return 'breach';
  },
};