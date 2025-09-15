/**
 * @fileoverview OSS Hero Brand Policy Enforcement System
 * @description Comprehensive brand policy enforcement and validation system
 * @version 1.0.0
 * @author OSS Hero System
 * @module HT-011.4.5: Implement Brand-Specific Design Policies
 */

import { TenantBrandConfig } from './types';
import { 
  BrandDesignPolicy, 
  BrandPolicyResult, 
  BrandPolicyViolation, 
  BrandPolicyRecommendation,
  BrandPolicyEnforcement,
  BrandPolicySeverity 
} from './brand-design-policies';
import { BrandConsistencyPolicies } from './brand-consistency-policies';
import { BrandAccessibilityPolicies } from './brand-accessibility-policies';
import { BrandUsabilityPolicies } from './brand-usability-policies';

/**
 * Brand policy enforcement result
 */
export interface BrandPolicyEnforcementResult {
  /** Overall compliance score (0-100) */
  overallScore: number;
  /** Whether overall compliance passed */
  overallPassed: boolean;
  /** Policy results by category */
  resultsByCategory: Map<string, BrandPolicyResult[]>;
  /** Policy results by severity */
  resultsBySeverity: Map<BrandPolicySeverity, BrandPolicyResult[]>;
  /** Critical violations that must be fixed */
  criticalViolations: BrandPolicyViolation[];
  /** High priority violations */
  highPriorityViolations: BrandPolicyViolation[];
  /** Recommendations for improvement */
  recommendations: BrandPolicyRecommendation[];
  /** Enforcement summary */
  enforcementSummary: {
    totalPolicies: number;
    passedPolicies: number;
    failedPolicies: number;
    requiredPolicies: number;
    recommendedPolicies: number;
    advisoryPolicies: number;
  };
  /** Metadata */
  metadata: {
    checkedAt: Date;
    configVersion: string;
    tenantId: string;
    enforcementLevel: BrandPolicyEnforcement;
  };
}

/**
 * Brand policy enforcement configuration
 */
export interface BrandPolicyEnforcementConfig {
  /** Enforcement level */
  enforcementLevel: BrandPolicyEnforcement;
  /** Whether to fail on critical violations */
  failOnCritical: boolean;
  /** Whether to fail on high priority violations */
  failOnHighPriority: boolean;
  /** Minimum compliance score required */
  minComplianceScore: number;
  /** Whether to include recommendations */
  includeRecommendations: boolean;
  /** Whether to include remediation steps */
  includeRemediation: boolean;
  /** Custom policy overrides */
  policyOverrides: Map<string, boolean>;
}

/**
 * Brand policy enforcement system
 */
export class BrandPolicyEnforcementSystem {
  private policies: Map<string, BrandDesignPolicy> = new Map();
  private enforcementConfig: BrandPolicyEnforcementConfig;

  constructor(config?: Partial<BrandPolicyEnforcementConfig>) {
    this.enforcementConfig = {
      enforcementLevel: 'required',
      failOnCritical: true,
      failOnHighPriority: true,
      minComplianceScore: 80,
      includeRecommendations: true,
      includeRemediation: true,
      policyOverrides: new Map(),
      ...config,
    };
    
    this.initializePolicies();
  }

  /**
   * Initialize all brand policies
   */
  private initializePolicies(): void {
    // Register consistency policies
    this.registerPolicy(BrandConsistencyPolicies.createColorConsistencyPolicy());
    this.registerPolicy(BrandConsistencyPolicies.createTypographyConsistencyPolicy());
    this.registerPolicy(BrandConsistencyPolicies.createComponentConsistencyPolicy());

    // Register accessibility policies
    this.registerPolicy(BrandAccessibilityPolicies.createWCAGColorContrastPolicy());
    this.registerPolicy(BrandAccessibilityPolicies.createBrandAccessibilityPolicy());
    this.registerPolicy(BrandAccessibilityPolicies.createKeyboardNavigationPolicy());

    // Register usability policies
    this.registerPolicy(BrandUsabilityPolicies.createBrandUsabilityPolicy());
    this.registerPolicy(BrandUsabilityPolicies.createUserExperiencePolicy());
    this.registerPolicy(BrandUsabilityPolicies.createBrandPerformancePolicy());
  }

  /**
   * Register a brand policy
   */
  registerPolicy(policy: BrandDesignPolicy): void {
    this.policies.set(policy.id, policy);
  }

  /**
   * Get a brand policy by ID
   */
  getPolicy(policyId: string): BrandDesignPolicy | undefined {
    return this.policies.get(policyId);
  }

  /**
   * Get all active policies
   */
  getActivePolicies(): BrandDesignPolicy[] {
    return Array.from(this.policies.values()).filter(policy => 
      policy.isActive && !this.enforcementConfig.policyOverrides.get(policy.id)
    );
  }

  /**
   * Get policies by enforcement level
   */
  getPoliciesByEnforcementLevel(level: BrandPolicyEnforcement): BrandDesignPolicy[] {
    return this.getActivePolicies().filter(policy => policy.enforcement === level);
  }

  /**
   * Enforce brand policies on configuration
   */
  enforcePolicies(config: TenantBrandConfig, context?: any): BrandPolicyEnforcementResult {
    const activePolicies = this.getActivePolicies();
    const results: BrandPolicyResult[] = [];
    
    // Validate each policy
    for (const policy of activePolicies) {
      try {
        const result = policy.validator(config, context);
        results.push(result);
      } catch (error) {
        console.error(`Error enforcing policy ${policy.id}:`, error);
        results.push({
          policyId: policy.id,
          passed: false,
          score: 0,
          violations: [{
            id: `error-${policy.id}`,
            ruleId: 'system-error',
            severity: 'critical',
            message: `Policy enforcement failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          recommendations: [],
          metadata: {
            checkedAt: new Date(),
            configVersion: '1.0.0',
            tenantId: config.tenantId,
          },
        });
      }
    }

    return this.processEnforcementResults(results, config);
  }

  /**
   * Process enforcement results
   */
  private processEnforcementResults(results: BrandPolicyResult[], config: TenantBrandConfig): BrandPolicyEnforcementResult {
    // Calculate overall score
    const overallScore = this.calculateOverallScore(results);
    const overallPassed = this.determineOverallPassed(results, overallScore);

    // Group results by category
    const resultsByCategory = this.groupResultsByCategory(results);

    // Group results by severity
    const resultsBySeverity = this.groupResultsBySeverity(results);

    // Extract violations by severity
    const criticalViolations = this.extractViolationsBySeverity(results, 'critical');
    const highPriorityViolations = this.extractViolationsBySeverity(results, 'high');

    // Extract recommendations
    const recommendations = this.extractRecommendations(results);

    // Calculate enforcement summary
    const enforcementSummary = this.calculateEnforcementSummary(results);

    return {
      overallScore,
      overallPassed,
      resultsByCategory,
      resultsBySeverity,
      criticalViolations,
      highPriorityViolations,
      recommendations,
      enforcementSummary,
      metadata: {
        checkedAt: new Date(),
        configVersion: '1.0.0',
        tenantId: config.tenantId,
        enforcementLevel: this.enforcementConfig.enforcementLevel,
      },
    };
  }

  /**
   * Calculate overall compliance score
   */
  private calculateOverallScore(results: BrandPolicyResult[]): number {
    if (results.length === 0) return 100;
    
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / results.length);
  }

  /**
   * Determine if overall compliance passed
   */
  private determineOverallPassed(results: BrandPolicyResult[], overallScore: number): boolean {
    // Check minimum compliance score
    if (overallScore < this.enforcementConfig.minComplianceScore) {
      return false;
    }

    // Check critical violations
    if (this.enforcementConfig.failOnCritical) {
      const criticalViolations = this.extractViolationsBySeverity(results, 'critical');
      if (criticalViolations.length > 0) {
        return false;
      }
    }

    // Check high priority violations
    if (this.enforcementConfig.failOnHighPriority) {
      const highPriorityViolations = this.extractViolationsBySeverity(results, 'high');
      if (highPriorityViolations.length > 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * Group results by category
   */
  private groupResultsByCategory(results: BrandPolicyResult[]): Map<string, BrandPolicyResult[]> {
    const grouped = new Map<string, BrandPolicyResult[]>();
    
    for (const result of results) {
      const policy = this.policies.get(result.policyId);
      if (policy) {
        const category = policy.category;
        if (!grouped.has(category)) {
          grouped.set(category, []);
        }
        grouped.get(category)!.push(result);
      }
    }
    
    return grouped;
  }

  /**
   * Group results by severity
   */
  private groupResultsBySeverity(results: BrandPolicyResult[]): Map<BrandPolicySeverity, BrandPolicyResult[]> {
    const grouped = new Map<BrandPolicySeverity, BrandPolicyResult[]>();
    
    for (const result of results) {
      const policy = this.policies.get(result.policyId);
      if (policy) {
        const severity = policy.severity;
        if (!grouped.has(severity)) {
          grouped.set(severity, []);
        }
        grouped.get(severity)!.push(result);
      }
    }
    
    return grouped;
  }

  /**
   * Extract violations by severity
   */
  private extractViolationsBySeverity(results: BrandPolicyResult[], severity: BrandPolicySeverity): BrandPolicyViolation[] {
    const violations: BrandPolicyViolation[] = [];
    
    for (const result of results) {
      violations.push(...result.violations.filter(violation => violation.severity === severity));
    }
    
    return violations;
  }

  /**
   * Extract recommendations
   */
  private extractRecommendations(results: BrandPolicyResult[]): BrandPolicyRecommendation[] {
    const recommendations: BrandPolicyRecommendation[] = [];
    
    for (const result of results) {
      recommendations.push(...result.recommendations);
    }
    
    return recommendations;
  }

  /**
   * Calculate enforcement summary
   */
  private calculateEnforcementSummary(results: BrandPolicyResult[]): {
    totalPolicies: number;
    passedPolicies: number;
    failedPolicies: number;
    requiredPolicies: number;
    recommendedPolicies: number;
    advisoryPolicies: number;
  } {
    const totalPolicies = results.length;
    const passedPolicies = results.filter(result => result.passed).length;
    const failedPolicies = totalPolicies - passedPolicies;
    
    let requiredPolicies = 0;
    let recommendedPolicies = 0;
    let advisoryPolicies = 0;
    
    for (const result of results) {
      const policy = this.policies.get(result.policyId);
      if (policy) {
        switch (policy.enforcement) {
          case 'required':
            requiredPolicies++;
            break;
          case 'recommended':
            recommendedPolicies++;
            break;
          case 'advisory':
            advisoryPolicies++;
            break;
        }
      }
    }
    
    return {
      totalPolicies,
      passedPolicies,
      failedPolicies,
      requiredPolicies,
      recommendedPolicies,
      advisoryPolicies,
    };
  }

  /**
   * Update enforcement configuration
   */
  updateEnforcementConfig(config: Partial<BrandPolicyEnforcementConfig>): void {
    this.enforcementConfig = { ...this.enforcementConfig, ...config };
  }

  /**
   * Get enforcement configuration
   */
  getEnforcementConfig(): BrandPolicyEnforcementConfig {
    return { ...this.enforcementConfig };
  }

  /**
   * Override policy activation
   */
  overridePolicy(policyId: string, isActive: boolean): void {
    this.enforcementConfig.policyOverrides.set(policyId, !isActive);
  }

  /**
   * Generate enforcement report
   */
  generateEnforcementReport(result: BrandPolicyEnforcementResult): string {
    const report = [];
    
    report.push('# Brand Policy Enforcement Report');
    report.push('');
    report.push(`**Overall Score:** ${result.overallScore}/100`);
    report.push(`**Overall Status:** ${result.overallPassed ? '✅ PASSED' : '❌ FAILED'}`);
    report.push(`**Enforcement Level:** ${result.metadata.enforcementLevel}`);
    report.push(`**Checked At:** ${result.metadata.checkedAt.toISOString()}`);
    report.push('');
    
    // Enforcement summary
    report.push('## Enforcement Summary');
    report.push('');
    report.push(`- **Total Policies:** ${result.enforcementSummary.totalPolicies}`);
    report.push(`- **Passed Policies:** ${result.enforcementSummary.passedPolicies}`);
    report.push(`- **Failed Policies:** ${result.enforcementSummary.failedPolicies}`);
    report.push(`- **Required Policies:** ${result.enforcementSummary.requiredPolicies}`);
    report.push(`- **Recommended Policies:** ${result.enforcementSummary.recommendedPolicies}`);
    report.push(`- **Advisory Policies:** ${result.enforcementSummary.advisoryPolicies}`);
    report.push('');
    
    // Critical violations
    if (result.criticalViolations.length > 0) {
      report.push('## Critical Violations');
      report.push('');
      for (const violation of result.criticalViolations) {
        report.push(`- **${violation.ruleId}:** ${violation.message}`);
        if (violation.suggestedFix) {
          report.push(`  - *Suggested Fix:* ${violation.suggestedFix}`);
        }
      }
      report.push('');
    }
    
    // High priority violations
    if (result.highPriorityViolations.length > 0) {
      report.push('## High Priority Violations');
      report.push('');
      for (const violation of result.highPriorityViolations) {
        report.push(`- **${violation.ruleId}:** ${violation.message}`);
        if (violation.suggestedFix) {
          report.push(`  - *Suggested Fix:* ${violation.suggestedFix}`);
        }
      }
      report.push('');
    }
    
    // Recommendations
    if (result.recommendations.length > 0 && this.enforcementConfig.includeRecommendations) {
      report.push('## Recommendations');
      report.push('');
      for (const recommendation of result.recommendations) {
        report.push(`- **${recommendation.type}:** ${recommendation.message}`);
        report.push(`  - *Priority:* ${recommendation.priority}`);
        report.push(`  - *Effort:* ${recommendation.effort}`);
      }
      report.push('');
    }
    
    return report.join('\n');
  }
}

/**
 * Export the brand policy enforcement system instance
 */
export const brandPolicyEnforcementSystem = new BrandPolicyEnforcementSystem();

/**
 * Types are already exported as interfaces above
 */
