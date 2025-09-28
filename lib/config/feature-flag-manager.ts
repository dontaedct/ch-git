/**
 * Feature Flag Management System
 * Manages client-specific feature flags and feature toggles
 */

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'json' | 'percentage';
  defaultValue: any;
  clientId?: string; // If null, it's a global flag
  environment: string;
  isEnabled: boolean;
  value: any;
  conditions?: FeatureFlagCondition[];
  rolloutStrategy?: RolloutStrategy;
  targeting?: TargetingRules;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
    category: string;
    tags: string[];
    version: number;
  };
}

export interface FeatureFlagCondition {
  id: string;
  type: 'user_attribute' | 'client_attribute' | 'date_range' | 'percentage' | 'custom';
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  attribute: string;
  value: any;
  isActive: boolean;
}

export interface RolloutStrategy {
  type: 'all' | 'percentage' | 'gradual' | 'user_list' | 'client_list';
  percentage?: number;
  userList?: string[];
  clientList?: string[];
  gradualConfig?: {
    startPercentage: number;
    endPercentage: number;
    durationDays: number;
    incrementPercentage: number;
  };
}

export interface TargetingRules {
  includeRules: FeatureFlagCondition[];
  excludeRules: FeatureFlagCondition[];
  defaultBehavior: 'include' | 'exclude';
}

export interface FeatureFlagEvaluation {
  flagKey: string;
  value: any;
  isEnabled: boolean;
  reason: string;
  matchedConditions: string[];
  evaluatedAt: Date;
}

export interface FeatureFlagTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  flags: Omit<FeatureFlag, 'id' | 'clientId' | 'metadata'>[];
  targetEnvironments: string[];
  isDefault: boolean;
}

export class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private templates: Map<string, FeatureFlagTemplate> = new Map();
  private evaluationCache: Map<string, FeatureFlagEvaluation> = new Map();
  private cacheExpiration: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Create a new feature flag
   */
  async createFlag(flag: Omit<FeatureFlag, 'id' | 'metadata'>): Promise<FeatureFlag> {
    const newFlag: FeatureFlag = {
      ...flag,
      id: `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        lastModifiedBy: 'system',
        category: flag.metadata?.category || 'general',
        tags: flag.metadata?.tags || [],
        version: 1,
      },
    };

    // Validate flag
    if (!this.validateFlag(newFlag)) {
      throw new Error('Invalid feature flag configuration');
    }

    this.flags.set(this.getFlagKey(newFlag), newFlag);
    await this.persistFlag(newFlag);

    return newFlag;
  }

  /**
   * Get feature flag by key
   */
  async getFlag(key: string, clientId?: string, environment?: string): Promise<FeatureFlag | null> {
    const flagKey = this.getFlagKey({ key, clientId, environment } as any);
    let flag = this.flags.get(flagKey);

    if (!flag) {
      flag = await this.loadFlag(key, clientId, environment);
      if (flag) {
        this.flags.set(flagKey, flag);
      }
    }

    return flag || null;
  }

  /**
   * Update feature flag
   */
  async updateFlag(flagId: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag | null> {
    const existingFlag = await this.getFlagById(flagId);
    if (!existingFlag) {
      throw new Error(`Feature flag ${flagId} not found`);
    }

    const updatedFlag: FeatureFlag = {
      ...existingFlag,
      ...updates,
      metadata: {
        ...existingFlag.metadata,
        updatedAt: new Date(),
        lastModifiedBy: updates.metadata?.lastModifiedBy || 'system',
        version: existingFlag.metadata.version + 1,
      },
    };

    // Validate updated flag
    if (!this.validateFlag(updatedFlag)) {
      throw new Error('Invalid feature flag update');
    }

    const flagKey = this.getFlagKey(updatedFlag);
    this.flags.set(flagKey, updatedFlag);
    await this.persistFlag(updatedFlag);

    // Clear evaluation cache for this flag
    this.clearFlagCache(updatedFlag.key);

    return updatedFlag;
  }

  /**
   * Delete feature flag
   */
  async deleteFlag(flagId: string): Promise<boolean> {
    const flag = await this.getFlagById(flagId);
    if (!flag) {
      return false;
    }

    const flagKey = this.getFlagKey(flag);
    this.flags.delete(flagKey);
    await this.removePersistedFlag(flagId);

    // Clear evaluation cache for this flag
    this.clearFlagCache(flag.key);

    return true;
  }

  /**
   * Evaluate feature flag for specific context
   */
  async evaluateFlag(
    flagKey: string,
    context: {
      clientId?: string;
      environment?: string;
      userId?: string;
      userAttributes?: Record<string, any>;
      clientAttributes?: Record<string, any>;
    }
  ): Promise<FeatureFlagEvaluation> {
    const cacheKey = this.getEvaluationCacheKey(flagKey, context);
    const cached = this.evaluationCache.get(cacheKey);

    if (cached && Date.now() - cached.evaluatedAt.getTime() < this.cacheExpiration) {
      return cached;
    }

    const flag = await this.getFlag(flagKey, context.clientId, context.environment);

    if (!flag) {
      const evaluation: FeatureFlagEvaluation = {
        flagKey,
        value: null,
        isEnabled: false,
        reason: 'Flag not found',
        matchedConditions: [],
        evaluatedAt: new Date(),
      };
      this.evaluationCache.set(cacheKey, evaluation);
      return evaluation;
    }

    const evaluation = await this.performEvaluation(flag, context);
    this.evaluationCache.set(cacheKey, evaluation);

    return evaluation;
  }

  /**
   * Get feature flag value
   */
  async getFlagValue(
    flagKey: string,
    context: {
      clientId?: string;
      environment?: string;
      userId?: string;
      userAttributes?: Record<string, any>;
      clientAttributes?: Record<string, any>;
    },
    defaultValue?: any
  ): Promise<any> {
    const evaluation = await this.evaluateFlag(flagKey, context);
    return evaluation.isEnabled ? evaluation.value : (defaultValue || null);
  }

  /**
   * Check if feature is enabled
   */
  async isFeatureEnabled(
    flagKey: string,
    context: {
      clientId?: string;
      environment?: string;
      userId?: string;
      userAttributes?: Record<string, any>;
      clientAttributes?: Record<string, any>;
    }
  ): Promise<boolean> {
    const evaluation = await this.evaluateFlag(flagKey, context);
    return evaluation.isEnabled;
  }

  /**
   * Get all flags for client/environment
   */
  async getFlags(clientId?: string, environment?: string): Promise<FeatureFlag[]> {
    const flags = await this.loadFlags(clientId, environment);

    // Update in-memory cache
    flags.forEach(flag => {
      const flagKey = this.getFlagKey(flag);
      this.flags.set(flagKey, flag);
    });

    return flags;
  }

  /**
   * Apply feature flag template
   */
  async applyTemplate(
    templateId: string,
    clientId: string,
    environment: string,
    overrides?: Record<string, any>
  ): Promise<FeatureFlag[]> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const createdFlags: FeatureFlag[] = [];

    for (const templateFlag of template.flags) {
      const flagOverrides = overrides?.[templateFlag.key];
      const flag = await this.createFlag({
        ...templateFlag,
        clientId,
        environment,
        value: flagOverrides?.value ?? templateFlag.value,
        isEnabled: flagOverrides?.isEnabled ?? templateFlag.isEnabled,
      });

      createdFlags.push(flag);
    }

    return createdFlags;
  }

  /**
   * Perform feature flag evaluation
   */
  private async performEvaluation(
    flag: FeatureFlag,
    context: {
      clientId?: string;
      environment?: string;
      userId?: string;
      userAttributes?: Record<string, any>;
      clientAttributes?: Record<string, any>;
    }
  ): Promise<FeatureFlagEvaluation> {
    let isEnabled = flag.isEnabled;
    let value = flag.value;
    let reason = 'Default value';
    const matchedConditions: string[] = [];

    if (!flag.isEnabled) {
      return {
        flagKey: flag.key,
        value: flag.defaultValue,
        isEnabled: false,
        reason: 'Flag is disabled',
        matchedConditions: [],
        evaluatedAt: new Date(),
      };
    }

    // Check targeting rules
    if (flag.targeting) {
      const targetingResult = this.evaluateTargetingRules(flag.targeting, context);
      if (!targetingResult.isIncluded) {
        return {
          flagKey: flag.key,
          value: flag.defaultValue,
          isEnabled: false,
          reason: 'Excluded by targeting rules',
          matchedConditions: targetingResult.matchedConditions,
          evaluatedAt: new Date(),
        };
      }
      matchedConditions.push(...targetingResult.matchedConditions);
    }

    // Check conditions
    if (flag.conditions && flag.conditions.length > 0) {
      const conditionsResult = this.evaluateConditions(flag.conditions, context);
      if (!conditionsResult.matches) {
        return {
          flagKey: flag.key,
          value: flag.defaultValue,
          isEnabled: false,
          reason: 'Conditions not met',
          matchedConditions: matchedConditions,
          evaluatedAt: new Date(),
        };
      }
      matchedConditions.push(...conditionsResult.matchedConditions);
      reason = 'Conditions matched';
    }

    // Check rollout strategy
    if (flag.rolloutStrategy) {
      const rolloutResult = this.evaluateRolloutStrategy(flag.rolloutStrategy, context);
      if (!rolloutResult.isIncluded) {
        return {
          flagKey: flag.key,
          value: flag.defaultValue,
          isEnabled: false,
          reason: rolloutResult.reason,
          matchedConditions: matchedConditions,
          evaluatedAt: new Date(),
        };
      }
      reason = rolloutResult.reason;
    }

    return {
      flagKey: flag.key,
      value,
      isEnabled,
      reason,
      matchedConditions,
      evaluatedAt: new Date(),
    };
  }

  /**
   * Evaluate targeting rules
   */
  private evaluateTargetingRules(
    targeting: TargetingRules,
    context: any
  ): { isIncluded: boolean; matchedConditions: string[] } {
    const matchedConditions: string[] = [];

    // Check exclude rules first
    for (const rule of targeting.excludeRules) {
      if (this.evaluateCondition(rule, context)) {
        matchedConditions.push(`exclude:${rule.id}`);
        return { isIncluded: false, matchedConditions };
      }
    }

    // Check include rules
    if (targeting.includeRules.length > 0) {
      for (const rule of targeting.includeRules) {
        if (this.evaluateCondition(rule, context)) {
          matchedConditions.push(`include:${rule.id}`);
          return { isIncluded: true, matchedConditions };
        }
      }
      // No include rules matched
      return { isIncluded: false, matchedConditions };
    }

    // No include rules, use default behavior
    return {
      isIncluded: targeting.defaultBehavior === 'include',
      matchedConditions,
    };
  }

  /**
   * Evaluate conditions
   */
  private evaluateConditions(
    conditions: FeatureFlagCondition[],
    context: any
  ): { matches: boolean; matchedConditions: string[] } {
    const matchedConditions: string[] = [];

    for (const condition of conditions) {
      if (condition.isActive && this.evaluateCondition(condition, context)) {
        matchedConditions.push(condition.id);
      }
    }

    // All active conditions must match
    const activeConditions = conditions.filter(c => c.isActive);
    const matches = activeConditions.length === 0 || matchedConditions.length === activeConditions.length;

    return { matches, matchedConditions };
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(condition: FeatureFlagCondition, context: any): boolean {
    let contextValue: any;

    // Get context value based on condition type
    switch (condition.type) {
      case 'user_attribute':
        contextValue = context.userAttributes?.[condition.attribute] || context[condition.attribute];
        break;
      case 'client_attribute':
        contextValue = context.clientAttributes?.[condition.attribute] || context[condition.attribute];
        break;
      case 'date_range':
        contextValue = new Date();
        break;
      case 'percentage':
        contextValue = this.getUserPercentage(context.userId || context.clientId || 'default');
        break;
      default:
        contextValue = context[condition.attribute];
    }

    // Evaluate based on operator
    switch (condition.operator) {
      case 'equals':
        return contextValue === condition.value;
      case 'not_equals':
        return contextValue !== condition.value;
      case 'contains':
        return String(contextValue).includes(String(condition.value));
      case 'greater_than':
        return Number(contextValue) > Number(condition.value);
      case 'less_than':
        return Number(contextValue) < Number(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(contextValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(contextValue);
      default:
        return false;
    }
  }

  /**
   * Evaluate rollout strategy
   */
  private evaluateRolloutStrategy(
    strategy: RolloutStrategy,
    context: any
  ): { isIncluded: boolean; reason: string } {
    switch (strategy.type) {
      case 'all':
        return { isIncluded: true, reason: 'All users included' };

      case 'percentage':
        const userPercentage = this.getUserPercentage(context.userId || context.clientId || 'default');
        const isIncluded = userPercentage <= (strategy.percentage || 0);
        return {
          isIncluded,
          reason: `Percentage rollout: ${strategy.percentage}% (user: ${userPercentage}%)`,
        };

      case 'user_list':
        const isUserIncluded = strategy.userList?.includes(context.userId) || false;
        return {
          isIncluded: isUserIncluded,
          reason: isUserIncluded ? 'User in allow list' : 'User not in allow list',
        };

      case 'client_list':
        const isClientIncluded = strategy.clientList?.includes(context.clientId) || false;
        return {
          isIncluded: isClientIncluded,
          reason: isClientIncluded ? 'Client in allow list' : 'Client not in allow list',
        };

      case 'gradual':
        // TODO: Implement gradual rollout logic
        return { isIncluded: true, reason: 'Gradual rollout (not implemented)' };

      default:
        return { isIncluded: false, reason: 'Unknown rollout strategy' };
    }
  }

  /**
   * Get user percentage for consistent rollouts
   */
  private getUserPercentage(identifier: string): number {
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }

  /**
   * Validate feature flag
   */
  private validateFlag(flag: FeatureFlag): boolean {
    if (!flag.key || !flag.name) {
      return false;
    }

    if (!['boolean', 'string', 'number', 'json', 'percentage'].includes(flag.type)) {
      return false;
    }

    return true;
  }

  /**
   * Get flag cache key
   */
  private getFlagKey(flag: { key: string; clientId?: string; environment?: string }): string {
    return `${flag.key}:${flag.clientId || 'global'}:${flag.environment || 'all'}`;
  }

  /**
   * Get evaluation cache key
   */
  private getEvaluationCacheKey(flagKey: string, context: any): string {
    const contextHash = JSON.stringify(context);
    return `eval:${flagKey}:${contextHash}`;
  }

  /**
   * Clear flag cache
   */
  private clearFlagCache(flagKey: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.evaluationCache.keys()) {
      if (key.includes(flagKey)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.evaluationCache.delete(key));
  }

  /**
   * Get flag by ID
   */
  private async getFlagById(flagId: string): Promise<FeatureFlag | null> {
    for (const flag of this.flags.values()) {
      if (flag.id === flagId) {
        return flag;
      }
    }

    // TODO: Load from database
    return null;
  }

  /**
   * Initialize default templates
   */
  private initializeDefaultTemplates(): void {
    // Basic web app template
    const basicWebAppTemplate: FeatureFlagTemplate = {
      id: 'basic-web-app',
      name: 'Basic Web App',
      description: 'Essential feature flags for a basic web application',
      category: 'web-app',
      targetEnvironments: ['development', 'staging', 'production'],
      isDefault: true,
      flags: [
        {
          key: 'enable_analytics',
          name: 'Analytics Tracking',
          description: 'Enable analytics tracking for user behavior',
          type: 'boolean',
          defaultValue: false,
          environment: 'production',
          isEnabled: true,
          value: true,
          conditions: [],
        },
        {
          key: 'maintenance_mode',
          name: 'Maintenance Mode',
          description: 'Enable maintenance mode to show maintenance page',
          type: 'boolean',
          defaultValue: false,
          environment: 'production',
          isEnabled: true,
          value: false,
          conditions: [],
        },
        {
          key: 'max_upload_size',
          name: 'Maximum Upload Size',
          description: 'Maximum file upload size in MB',
          type: 'number',
          defaultValue: 10,
          environment: 'production',
          isEnabled: true,
          value: 10,
          conditions: [],
        },
      ],
    };

    this.templates.set(basicWebAppTemplate.id, basicWebAppTemplate);
  }

  /**
   * Persist feature flag
   */
  private async persistFlag(flag: FeatureFlag): Promise<void> {
    // TODO: Implement database persistence
    console.log('Persisting flag:', flag.key);
  }

  /**
   * Load feature flag
   */
  private async loadFlag(key: string, clientId?: string, environment?: string): Promise<FeatureFlag | null> {
    // TODO: Implement database loading
    console.log('Loading flag:', key, clientId, environment);
    return null;
  }

  /**
   * Load feature flags
   */
  private async loadFlags(clientId?: string, environment?: string): Promise<FeatureFlag[]> {
    // TODO: Implement database loading
    console.log('Loading flags for:', clientId, environment);
    return [];
  }

  /**
   * Remove persisted feature flag
   */
  private async removePersistedFlag(flagId: string): Promise<void> {
    // TODO: Implement database deletion
    console.log('Removing flag:', flagId);
  }
}

// Export singleton instance
export const featureFlagManager = new FeatureFlagManager();