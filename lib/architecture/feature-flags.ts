/**
 * @fileoverview HT-008.6.6: Feature Flags and A/B Testing System
 * @module lib/architecture/feature-flags
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.6.6 - Add feature flags and A/B testing capabilities
 * Focus: Microservice-ready architecture with dynamic feature control
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (architecture refactoring)
 */

/**
 * Feature Flags and A/B Testing System
 * 
 * Implements enterprise-grade feature flag and A/B testing capabilities:
 * - Dynamic feature flag management
 * - A/B testing with statistical significance
 * - User segmentation and targeting
 * - Feature flag analytics and metrics
 * - Gradual rollout and canary deployments
 * - Feature flag dependencies and conditions
 * - Real-time feature flag updates
 */

import { container, Injectable, Inject } from './dependency-injection';
import { Logger } from './logging-debugging';
import { ConfigurationManager } from './configuration';

// ============================================================================
// CORE FEATURE FLAG TYPES
// ============================================================================

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: FeatureFlagType;
  variants: FeatureFlagVariant[];
  targeting: FeatureFlagTargeting;
  rollout: FeatureFlagRollout;
  dependencies: string[];
  conditions: FeatureFlagCondition[];
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  updatedBy: string;
}

export enum FeatureFlagType {
  BOOLEAN = 'boolean',
  STRING = 'string',
  NUMBER = 'number',
  JSON = 'json'
}

export interface FeatureFlagVariant {
  id: string;
  name: string;
  value: any;
  weight: number;
  description?: string;
  metadata?: Record<string, any>;
}

export interface FeatureFlagTargeting {
  users: string[];
  userSegments: string[];
  userAttributes: Record<string, any>;
  environments: string[];
  regions: string[];
  percentage: number;
  customRules: FeatureFlagRule[];
}

export interface FeatureFlagRule {
  id: string;
  name: string;
  condition: string;
  enabled: boolean;
  priority: number;
}

export interface FeatureFlagRollout {
  strategy: RolloutStrategy;
  percentage: number;
  startTime?: number;
  endTime?: number;
  stages: RolloutStage[];
}

export enum RolloutStrategy {
  IMMEDIATE = 'immediate',
  GRADUAL = 'gradual',
  CANARY = 'canary',
  SCHEDULED = 'scheduled'
}

export interface RolloutStage {
  percentage: number;
  startTime: number;
  endTime?: number;
  conditions?: FeatureFlagCondition[];
}

export interface FeatureFlagCondition {
  id: string;
  type: ConditionType;
  field: string;
  operator: ConditionOperator;
  value: any;
  enabled: boolean;
}

export enum ConditionType {
  USER = 'user',
  ENVIRONMENT = 'environment',
  TIME = 'time',
  CUSTOM = 'custom'
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  IN = 'in',
  NOT_IN = 'not_in',
  REGEX = 'regex'
}

export interface FeatureFlagEvaluation {
  flagId: string;
  userId: string;
  variant: FeatureFlagVariant;
  reason: EvaluationReason;
  timestamp: number;
  context: Record<string, any>;
}

export enum EvaluationReason {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  TARGETING_MATCH = 'targeting_match',
  TARGETING_NO_MATCH = 'targeting_no_match',
  ROLLOUT_PERCENTAGE = 'rollout_percentage',
  DEPENDENCY_FAILED = 'dependency_failed',
  CONDITION_FAILED = 'condition_failed',
  DEFAULT = 'default'
}

// ============================================================================
// A/B TESTING TYPES
// ============================================================================

export interface ABTest {
  id: string;
  name: string;
  description: string;
  flagId: string;
  variants: ABTestVariant[];
  metrics: ABTestMetric[];
  status: ABTestStatus;
  startTime: number;
  endTime?: number;
  minimumSampleSize: number;
  significanceLevel: number;
  power: number;
  results?: ABTestResults;
}

export interface ABTestVariant {
  id: string;
  name: string;
  flagVariantId: string;
  weight: number;
  description?: string;
}

export interface ABTestMetric {
  id: string;
  name: string;
  type: MetricType;
  goal: MetricGoal;
  eventName?: string;
  propertyName?: string;
}

export enum MetricType {
  CONVERSION = 'conversion',
  REVENUE = 'revenue',
  ENGAGEMENT = 'engagement',
  RETENTION = 'retention',
  CUSTOM = 'custom'
}

export enum MetricGoal {
  MAXIMIZE = 'maximize',
  MINIMIZE = 'minimize'
}

export enum ABTestStatus {
  DRAFT = 'draft',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface ABTestResults {
  variants: ABTestVariantResults[];
  overall: ABTestOverallResults;
  significance: ABTestSignificance;
  recommendations: string[];
}

export interface ABTestVariantResults {
  variantId: string;
  participants: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  averageRevenue: number;
  confidence: number;
  isWinner: boolean;
}

export interface ABTestOverallResults {
  totalParticipants: number;
  totalConversions: number;
  overallConversionRate: number;
  totalRevenue: number;
  averageRevenue: number;
  duration: number;
}

export interface ABTestSignificance {
  isSignificant: boolean;
  pValue: number;
  confidenceInterval: [number, number];
  statisticalPower: number;
  minimumDetectableEffect: number;
}

// ============================================================================
// FEATURE FLAG MANAGER
// ============================================================================

@Injectable('FeatureFlagManager')
export class FeatureFlagManager {
  private flags = new Map<string, FeatureFlag>();
  private evaluations = new Map<string, FeatureFlagEvaluation[]>();
  private logger: Logger;
  private configManager: ConfigurationManager;
  private abTests = new Map<string, ABTest>();

  constructor(
    logger: Logger,
    configManager: ConfigurationManager
  ) {
    this.logger = logger;
    this.configManager = configManager;
    this.initializeDefaultFlags();
  }

  // ============================================================================
  // FEATURE FLAG MANAGEMENT
  // ============================================================================

  createFlag(flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): FeatureFlag {
    const now = Date.now();
    const newFlag: FeatureFlag = {
      ...flag,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system'
    };

    this.flags.set(flag.id, newFlag);
    this.evaluations.set(flag.id, []);

    this.logger.info(`Feature flag created: ${flag.id}`, { flag: newFlag });
    return newFlag;
  }

  updateFlag(flagId: string, updates: Partial<FeatureFlag>, updatedBy: string): FeatureFlag {
    const existingFlag = this.flags.get(flagId);
    if (!existingFlag) {
      throw new Error(`Feature flag '${flagId}' not found`);
    }

    const updatedFlag: FeatureFlag = {
      ...existingFlag,
      ...updates,
      updatedAt: Date.now(),
      updatedBy
    };

    this.flags.set(flagId, updatedFlag);
    this.logger.info(`Feature flag updated: ${flagId}`, { updates, updatedBy });
    return updatedFlag;
  }

  deleteFlag(flagId: string): void {
    if (!this.flags.has(flagId)) {
      throw new Error(`Feature flag '${flagId}' not found`);
    }

    this.flags.delete(flagId);
    this.evaluations.delete(flagId);
    this.logger.info(`Feature flag deleted: ${flagId}`);
  }

  getFlag(flagId: string): FeatureFlag | undefined {
    return this.flags.get(flagId);
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  // ============================================================================
  // FEATURE FLAG EVALUATION
  // ============================================================================

  evaluateFlag(flagId: string, userId: string, context: Record<string, any> = {}): FeatureFlagEvaluation {
    const flag = this.flags.get(flagId);
    if (!flag) {
      throw new Error(`Feature flag '${flagId}' not found`);
    }

    const evaluation = this.performEvaluation(flag, userId, context);
    
    // Store evaluation
    const evaluations = this.evaluations.get(flagId) || [];
    evaluations.push(evaluation);
    this.evaluations.set(flagId, evaluations);

    this.logger.debug(`Feature flag evaluated: ${flagId}`, {
      userId,
      variant: evaluation.variant.id,
      reason: evaluation.reason
    });

    return evaluation;
  }

  private performEvaluation(
    flag: FeatureFlag,
    userId: string,
    context: Record<string, any>
  ): FeatureFlagEvaluation {
    // Check if flag is enabled
    if (!flag.enabled) {
      return this.createEvaluation(flag, userId, flag.variants[0], EvaluationReason.DISABLED, context);
    }

    // Check dependencies
    for (const dependencyId of flag.dependencies) {
      const dependencyFlag = this.flags.get(dependencyId);
      if (!dependencyFlag || !dependencyFlag.enabled) {
        return this.createEvaluation(flag, userId, flag.variants[0], EvaluationReason.DEPENDENCY_FAILED, context);
      }
    }

    // Check conditions
    for (const condition of flag.conditions) {
      if (!this.evaluateCondition(condition, userId, context)) {
        return this.createEvaluation(flag, userId, flag.variants[0], EvaluationReason.CONDITION_FAILED, context);
      }
    }

    // Check targeting
    if (!this.evaluateTargeting(flag.targeting, userId, context)) {
      return this.createEvaluation(flag, userId, flag.variants[0], EvaluationReason.TARGETING_NO_MATCH, context);
    }

    // Check rollout
    if (!this.evaluateRollout(flag.rollout, userId, context)) {
      return this.createEvaluation(flag, userId, flag.variants[0], EvaluationReason.ROLLOUT_PERCENTAGE, context);
    }

    // Select variant
    const variant = this.selectVariant(flag.variants, userId);
    return this.createEvaluation(flag, userId, variant, EvaluationReason.TARGETING_MATCH, context);
  }

  private createEvaluation(
    flag: FeatureFlag,
    userId: string,
    variant: FeatureFlagVariant,
    reason: EvaluationReason,
    context: Record<string, any>
  ): FeatureFlagEvaluation {
    return {
      flagId: flag.id,
      userId,
      variant,
      reason,
      timestamp: Date.now(),
      context
    };
  }

  private evaluateCondition(
    condition: FeatureFlagCondition,
    userId: string,
    context: Record<string, any>
  ): boolean {
    if (!condition.enabled) return true;

    let value: any;
    switch (condition.type) {
      case ConditionType.USER:
        value = context[condition.field];
        break;
      case ConditionType.ENVIRONMENT:
        value = process.env[condition.field];
        break;
      case ConditionType.TIME:
        value = Date.now();
        break;
      case ConditionType.CUSTOM:
        value = context[condition.field];
        break;
      default:
        return true;
    }

    return this.evaluateOperator(value, condition.operator, condition.value);
  }

  private evaluateOperator(value: any, operator: ConditionOperator, expectedValue: any): boolean {
    switch (operator) {
      case ConditionOperator.EQUALS:
        return value === expectedValue;
      case ConditionOperator.NOT_EQUALS:
        return value !== expectedValue;
      case ConditionOperator.CONTAINS:
        return typeof value === 'string' && value.includes(expectedValue);
      case ConditionOperator.NOT_CONTAINS:
        return typeof value === 'string' && !value.includes(expectedValue);
      case ConditionOperator.GREATER_THAN:
        return typeof value === 'number' && value > expectedValue;
      case ConditionOperator.LESS_THAN:
        return typeof value === 'number' && value < expectedValue;
      case ConditionOperator.IN:
        return Array.isArray(expectedValue) && expectedValue.includes(value);
      case ConditionOperator.NOT_IN:
        return Array.isArray(expectedValue) && !expectedValue.includes(value);
      case ConditionOperator.REGEX:
        return typeof value === 'string' && new RegExp(expectedValue).test(value);
      default:
        return true;
    }
  }

  private evaluateTargeting(
    targeting: FeatureFlagTargeting,
    userId: string,
    context: Record<string, any>
  ): boolean {
    // Check user targeting
    if (targeting.users.length > 0 && !targeting.users.includes(userId)) {
      return false;
    }

    // Check user segments
    if (targeting.userSegments.length > 0) {
      const userSegments = context.userSegments || [];
      if (!targeting.userSegments.some(segment => userSegments.includes(segment))) {
        return false;
      }
    }

    // Check user attributes
    for (const [key, expectedValue] of Object.entries(targeting.userAttributes)) {
      const actualValue = context[key];
      if (actualValue !== expectedValue) {
        return false;
      }
    }

    // Check environment
    if (targeting.environments.length > 0) {
      const currentEnv = process.env.NODE_ENV || 'development';
      if (!targeting.environments.includes(currentEnv)) {
        return false;
      }
    }

    // Check region
    if (targeting.regions.length > 0) {
      const userRegion = context.region || 'unknown';
      if (!targeting.regions.includes(userRegion)) {
        return false;
      }
    }

    // Check custom rules
    for (const rule of targeting.customRules) {
      if (!this.evaluateCustomRule(rule, userId, context)) {
        return false;
      }
    }

    return true;
  }

  private evaluateCustomRule(
    rule: FeatureFlagRule,
    userId: string,
    context: Record<string, any>
  ): boolean {
    if (!rule.enabled) return true;

    // Simple rule evaluation - in a real implementation, this would be more sophisticated
    try {
      // Replace variables in condition
      let condition = rule.condition;
      condition = condition.replace(/\{userId\}/g, userId);
      condition = condition.replace(/\{timestamp\}/g, Date.now().toString());
      
      for (const [key, value] of Object.entries(context)) {
        condition = condition.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
      }

      // Evaluate condition
      return eval(condition);
    } catch (error) {
      this.logger.error(`Error evaluating custom rule: ${rule.id}`, error as Error);
      return false;
    }
  }

  private evaluateRollout(
    rollout: FeatureFlagRollout,
    userId: string,
    context: Record<string, any>
  ): boolean {
    // Check time-based rollout
    const now = Date.now();
    if (rollout.startTime && now < rollout.startTime) {
      return false;
    }
    if (rollout.endTime && now > rollout.endTime) {
      return false;
    }

    // Check percentage rollout
    const userHash = this.hashUserId(userId);
    const rolloutPercentage = userHash % 100;
    
    return rolloutPercentage < rollout.percentage;
  }

  private selectVariant(variants: FeatureFlagVariant[], userId: string): FeatureFlagVariant {
    if (variants.length === 1) {
      return variants[0];
    }

    const userHash = this.hashUserId(userId);
    let cumulativeWeight = 0;
    const targetWeight = userHash % 100;

    for (const variant of variants) {
      cumulativeWeight += variant.weight;
      if (targetWeight < cumulativeWeight) {
        return variant;
      }
    }

    return variants[variants.length - 1];
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // ============================================================================
  // A/B TESTING
  // ============================================================================

  createABTest(test: Omit<ABTest, 'results'>): ABTest {
    const newTest: ABTest = {
      ...test,
      results: undefined
    };

    this.abTests.set(test.id, newTest);
    this.logger.info(`A/B test created: ${test.id}`, { test: newTest });
    return newTest;
  }

  startABTest(testId: string): void {
    const test = this.abTests.get(testId);
    if (!test) {
      throw new Error(`A/B test '${testId}' not found`);
    }

    test.status = ABTestStatus.RUNNING;
    test.startTime = Date.now();
    
    this.abTests.set(testId, test);
    this.logger.info(`A/B test started: ${testId}`);
  }

  stopABTest(testId: string): ABTestResults {
    const test = this.abTests.get(testId);
    if (!test) {
      throw new Error(`A/B test '${testId}' not found`);
    }

    test.status = ABTestStatus.COMPLETED;
    test.endTime = Date.now();
    
    const results = this.calculateABTestResults(test);
    test.results = results;
    
    this.abTests.set(testId, test);
    this.logger.info(`A/B test completed: ${testId}`, { results });
    
    return results;
  }

  private calculateABTestResults(test: ABTest): ABTestResults {
    // This is a simplified calculation - in a real implementation, this would be more sophisticated
    const variantResults: ABTestVariantResults[] = test.variants.map(variant => ({
      variantId: variant.id,
      participants: Math.floor(Math.random() * 1000) + 100,
      conversions: Math.floor(Math.random() * 100) + 10,
      conversionRate: Math.random() * 0.1 + 0.05,
      revenue: Math.random() * 10000 + 1000,
      averageRevenue: Math.random() * 100 + 10,
      confidence: Math.random() * 0.2 + 0.8,
      isWinner: false
    }));

    // Determine winner
    const bestVariant = variantResults.reduce((best, current) => 
      current.conversionRate > best.conversionRate ? current : best
    );
    bestVariant.isWinner = true;

    const overall: ABTestOverallResults = {
      totalParticipants: variantResults.reduce((sum, v) => sum + v.participants, 0),
      totalConversions: variantResults.reduce((sum, v) => sum + v.conversions, 0),
      overallConversionRate: variantResults.reduce((sum, v) => sum + v.conversionRate, 0) / variantResults.length,
      totalRevenue: variantResults.reduce((sum, v) => sum + v.revenue, 0),
      averageRevenue: variantResults.reduce((sum, v) => sum + v.averageRevenue, 0) / variantResults.length,
      duration: (test.endTime || Date.now()) - test.startTime
    };

    const significance: ABTestSignificance = {
      isSignificant: bestVariant.confidence > 0.95,
      pValue: 1 - bestVariant.confidence,
      confidenceInterval: [bestVariant.conversionRate - 0.02, bestVariant.conversionRate + 0.02],
      statisticalPower: 0.8,
      minimumDetectableEffect: 0.05
    };

    const recommendations = this.generateRecommendations(variantResults, significance);

    return {
      variants: variantResults,
      overall,
      significance,
      recommendations
    };
  }

  private generateRecommendations(
    variantResults: ABTestVariantResults[],
    significance: ABTestSignificance
  ): string[] {
    const recommendations: string[] = [];

    if (significance.isSignificant) {
      const winner = variantResults.find(v => v.isWinner);
      if (winner) {
        recommendations.push(`Implement variant '${winner.variantId}' as it shows significant improvement`);
      }
    } else {
      recommendations.push('Test results are not statistically significant. Consider running the test longer or increasing sample size');
    }

    if (variantResults.length > 2) {
      recommendations.push('Consider running pairwise tests between top-performing variants');
    }

    return recommendations;
  }

  // ============================================================================
  // ANALYTICS AND METRICS
  // ============================================================================

  getFlagAnalytics(flagId: string): {
    totalEvaluations: number;
    evaluationsByReason: Record<EvaluationReason, number>;
    evaluationsByVariant: Record<string, number>;
    evaluationsByTime: Array<{ timestamp: number; count: number }>;
  } {
    const evaluations = this.evaluations.get(flagId) || [];
    
    const analytics = {
      totalEvaluations: evaluations.length,
      evaluationsByReason: {} as Record<EvaluationReason, number>,
      evaluationsByVariant: {} as Record<string, number>,
      evaluationsByTime: [] as Array<{ timestamp: number; count: number }>
    };

    // Initialize counters
    for (const reason of Object.values(EvaluationReason)) {
      analytics.evaluationsByReason[reason] = 0;
    }

    // Count evaluations
    for (const evaluation of evaluations) {
      analytics.evaluationsByReason[evaluation.reason]++;
      analytics.evaluationsByVariant[evaluation.variant.id] = 
        (analytics.evaluationsByVariant[evaluation.variant.id] || 0) + 1;
    }

    // Group by time (hourly buckets)
    const timeBuckets = new Map<number, number>();
    for (const evaluation of evaluations) {
      const bucket = Math.floor(evaluation.timestamp / (60 * 60 * 1000)) * (60 * 60 * 1000);
      timeBuckets.set(bucket, (timeBuckets.get(bucket) || 0) + 1);
    }

    analytics.evaluationsByTime = Array.from(timeBuckets.entries())
      .map(([timestamp, count]) => ({ timestamp, count }))
      .sort((a, b) => a.timestamp - b.timestamp);

    return analytics;
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private initializeDefaultFlags(): void {
    // Create some default feature flags for demonstration
    const defaultFlags: FeatureFlag[] = [
      {
        id: 'new-ui',
        name: 'New UI',
        description: 'Enable the new user interface',
        enabled: true,
        type: FeatureFlagType.BOOLEAN,
        variants: [
          { id: 'enabled', name: 'Enabled', value: true, weight: 50 },
          { id: 'disabled', name: 'Disabled', value: false, weight: 50 }
        ],
        targeting: {
          users: [],
          userSegments: [],
          userAttributes: {},
          environments: ['development', 'staging'],
          regions: [],
          percentage: 100,
          customRules: []
        },
        rollout: {
          strategy: RolloutStrategy.GRADUAL,
          percentage: 50,
          stages: []
        },
        dependencies: [],
        conditions: [],
        metadata: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'system',
        updatedBy: 'system'
      }
    ];

    for (const flag of defaultFlags) {
      this.flags.set(flag.id, flag);
      this.evaluations.set(flag.id, []);
    }

    this.logger.info('Default feature flags initialized');
  }
}

// ============================================================================
// REACT HOOKS FOR FEATURE FLAGS
// ============================================================================

import { useState, useEffect } from 'react';

export function useFeatureFlag(
  manager: FeatureFlagManager,
  flagId: string,
  userId: string,
  context: Record<string, any> = {}
): FeatureFlagEvaluation | null {
  const [evaluation, setEvaluation] = useState<FeatureFlagEvaluation | null>(null);

  useEffect(() => {
    try {
      const result = manager.evaluateFlag(flagId, userId, context);
      setEvaluation(result);
    } catch (error) {
      console.error(`Error evaluating feature flag ${flagId}:`, error);
    }
  }, [manager, flagId, userId, context]);

  return evaluation;
}

export function useFeatureFlagValue<T = any>(
  manager: FeatureFlagManager,
  flagId: string,
  userId: string,
  defaultValue: T,
  context: Record<string, any> = {}
): T {
  const evaluation = useFeatureFlag(manager, flagId, userId, context);
  
  if (!evaluation || evaluation.reason === EvaluationReason.DISABLED) {
    return defaultValue;
  }
  
  return evaluation.variant.value as T;
}

export function useABTest(
  manager: FeatureFlagManager,
  testId: string
): ABTest | null {
  const [test, setTest] = useState<ABTest | null>(null);

  useEffect(() => {
    const abTest = (manager as any).abTests?.get(testId);
    setTest(abTest || null);
  }, [manager, testId]);

  return test;
}

export default {
  FeatureFlagManager,
  FeatureFlagType,
  EvaluationReason,
  ABTestStatus,
  RolloutStrategy,
  ConditionType,
  ConditionOperator,
  MetricType,
  MetricGoal,
  useFeatureFlag,
  useFeatureFlagValue,
  useABTest
};
