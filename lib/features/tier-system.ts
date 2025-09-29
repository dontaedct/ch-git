/**
 * Tier-Based Feature System
 * Manages feature availability and access control based on subscription tiers
 */

export type TierLevel = 'starter' | 'pro' | 'advanced' | 'enterprise';

export interface TierConfiguration {
  level: TierLevel;
  name: string;
  description: string;
  features: Record<string, boolean | number | string>;
  limits: Record<string, number>;
  capabilities: string[];
  pricing?: {
    monthly: number;
    annual: number;
    currency: string;
  };
}

export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'advanced' | 'premium' | 'enterprise';
  requiredTier: TierLevel;
  dependencies?: string[];
  beta?: boolean;
  deprecated?: boolean;
  rolloutStrategy?: {
    type: 'percentage' | 'whitelist' | 'gradual';
    config: Record<string, any>;
  };
}

export interface UserContext {
  userId: string;
  tier: TierLevel;
  organizationId?: string;
  region?: string;
  features?: string[];
  metadata?: Record<string, any>;
  subscription?: {
    status: 'active' | 'expired' | 'trial' | 'cancelled';
    expiresAt?: Date;
    trialEndsAt?: Date;
  };
}

export interface FeatureAccess {
  hasAccess: boolean;
  reason?: 'tier_insufficient' | 'feature_disabled' | 'limit_exceeded' | 'dependency_missing' | 'beta_access_required';
  upgradeRequired?: TierLevel;
  currentUsage?: number;
  limit?: number;
  suggestions?: string[];
}

/**
 * Default tier configurations
 */
export const DEFAULT_TIER_CONFIGS: Record<TierLevel, TierConfiguration> = {
  starter: {
    level: 'starter',
    name: 'Starter',
    description: 'Perfect for individuals and small teams getting started',
    features: {
      'basic-forms': true,
      'form-templates': 5,
      'custom-branding': false,
      'advanced-validation': false,
      'api-access': false,
      'webhook-endpoints': 1,
      'data-export': true,
      'team-collaboration': false,
      'ai-assistance': false,
      'white-labeling': false
    },
    limits: {
      'monthly-submissions': 1000,
      'form-count': 10,
      'storage-gb': 1,
      'team-members': 1,
      'api-calls-per-hour': 100,
      'webhook-calls-per-day': 100
    },
    capabilities: [
      'form-builder',
      'basic-analytics',
      'email-notifications',
      'pdf-export'
    ],
    pricing: {
      monthly: 0,
      annual: 0,
      currency: 'USD'
    }
  },
  pro: {
    level: 'pro',
    name: 'Professional',
    description: 'Advanced features for growing businesses',
    features: {
      'basic-forms': true,
      'form-templates': 50,
      'custom-branding': true,
      'advanced-validation': true,
      'api-access': true,
      'webhook-endpoints': 10,
      'data-export': true,
      'team-collaboration': true,
      'ai-assistance': true,
      'white-labeling': false,
      'conditional-logic': true,
      'integrations': true,
      'advanced-analytics': true
    },
    limits: {
      'monthly-submissions': 10000,
      'form-count': 100,
      'storage-gb': 10,
      'team-members': 10,
      'api-calls-per-hour': 1000,
      'webhook-calls-per-day': 1000
    },
    capabilities: [
      'form-builder',
      'advanced-analytics',
      'email-notifications',
      'pdf-export',
      'team-management',
      'api-integrations',
      'conditional-logic',
      'custom-themes'
    ],
    pricing: {
      monthly: 29,
      annual: 290,
      currency: 'USD'
    }
  },
  advanced: {
    level: 'advanced',
    name: 'Advanced',
    description: 'Enterprise-grade features for scaling organizations',
    features: {
      'basic-forms': true,
      'form-templates': 200,
      'custom-branding': true,
      'advanced-validation': true,
      'api-access': true,
      'webhook-endpoints': 50,
      'data-export': true,
      'team-collaboration': true,
      'ai-assistance': true,
      'white-labeling': true,
      'conditional-logic': true,
      'integrations': true,
      'advanced-analytics': true,
      'custom-domains': true,
      'sso-integration': true,
      'audit-logs': true,
      'priority-support': true
    },
    limits: {
      'monthly-submissions': 100000,
      'form-count': 1000,
      'storage-gb': 100,
      'team-members': 50,
      'api-calls-per-hour': 10000,
      'webhook-calls-per-day': 10000
    },
    capabilities: [
      'form-builder',
      'advanced-analytics',
      'email-notifications',
      'pdf-export',
      'team-management',
      'api-integrations',
      'conditional-logic',
      'custom-themes',
      'white-labeling',
      'sso-integration',
      'audit-logging',
      'priority-support'
    ],
    pricing: {
      monthly: 99,
      annual: 990,
      currency: 'USD'
    }
  },
  enterprise: {
    level: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    features: {
      'basic-forms': true,
      'form-templates': -1, // unlimited
      'custom-branding': true,
      'advanced-validation': true,
      'api-access': true,
      'webhook-endpoints': -1, // unlimited
      'data-export': true,
      'team-collaboration': true,
      'ai-assistance': true,
      'white-labeling': true,
      'conditional-logic': true,
      'integrations': true,
      'advanced-analytics': true,
      'custom-domains': true,
      'sso-integration': true,
      'audit-logs': true,
      'priority-support': true,
      'dedicated-support': true,
      'custom-integrations': true,
      'compliance-features': true,
      'data-residency': true
    },
    limits: {
      'monthly-submissions': -1, // unlimited
      'form-count': -1, // unlimited
      'storage-gb': -1, // unlimited
      'team-members': -1, // unlimited
      'api-calls-per-hour': -1, // unlimited
      'webhook-calls-per-day': -1 // unlimited
    },
    capabilities: [
      'form-builder',
      'advanced-analytics',
      'email-notifications',
      'pdf-export',
      'team-management',
      'api-integrations',
      'conditional-logic',
      'custom-themes',
      'white-labeling',
      'sso-integration',
      'audit-logging',
      'priority-support',
      'dedicated-support',
      'custom-integrations',
      'compliance-tools',
      'data-residency'
    ],
    pricing: {
      monthly: 299,
      annual: 2990,
      currency: 'USD'
    }
  }
};

/**
 * Feature definitions registry
 */
export const FEATURE_REGISTRY: Record<string, FeatureDefinition> = {
  'basic-forms': {
    id: 'basic-forms',
    name: 'Basic Form Builder',
    description: 'Create and manage basic forms',
    category: 'core',
    requiredTier: 'starter'
  },
  'advanced-validation': {
    id: 'advanced-validation',
    name: 'Advanced Form Validation',
    description: 'Complex validation rules and custom validators',
    category: 'advanced',
    requiredTier: 'pro',
    dependencies: ['basic-forms']
  },
  'conditional-logic': {
    id: 'conditional-logic',
    name: 'Conditional Logic',
    description: 'Dynamic form behavior based on user input',
    category: 'advanced',
    requiredTier: 'pro',
    dependencies: ['basic-forms', 'advanced-validation']
  },
  'ai-assistance': {
    id: 'ai-assistance',
    name: 'AI-Powered Form Assistance',
    description: 'AI-driven form optimization and suggestions',
    category: 'premium',
    requiredTier: 'pro',
    beta: true
  },
  'white-labeling': {
    id: 'white-labeling',
    name: 'White Label Solutions',
    description: 'Remove branding and use custom domains',
    category: 'premium',
    requiredTier: 'advanced'
  },
  'sso-integration': {
    id: 'sso-integration',
    name: 'Single Sign-On Integration',
    description: 'Enterprise SSO with SAML and OAuth',
    category: 'enterprise',
    requiredTier: 'advanced'
  },
  'compliance-features': {
    id: 'compliance-features',
    name: 'Compliance & Security Features',
    description: 'GDPR, HIPAA, and SOX compliance tools',
    category: 'enterprise',
    requiredTier: 'enterprise'
  }
};

/**
 * Tier System Manager
 */
export class TierSystemManager {
  private tierConfigs: Record<TierLevel, TierConfiguration>;
  private featureRegistry: Record<string, FeatureDefinition>;

  constructor(
    tierConfigs = DEFAULT_TIER_CONFIGS,
    featureRegistry = FEATURE_REGISTRY
  ) {
    this.tierConfigs = tierConfigs;
    this.featureRegistry = featureRegistry;
  }

  /**
   * Check if a user has access to a specific feature
   */
  checkFeatureAccess(featureId: string, userContext: UserContext): FeatureAccess {
    const feature = this.featureRegistry[featureId];
    if (!feature) {
      return {
        hasAccess: false,
        reason: 'feature_disabled',
        suggestions: ['Check if feature ID is correct']
      };
    }

    // Check if feature is deprecated
    if (feature.deprecated) {
      return {
        hasAccess: false,
        reason: 'feature_disabled',
        suggestions: ['This feature has been deprecated. Please use an alternative.']
      };
    }

    // Check tier requirement
    if (!this.isTierSufficient(userContext.tier, feature.requiredTier)) {
      return {
        hasAccess: false,
        reason: 'tier_insufficient',
        upgradeRequired: feature.requiredTier,
        suggestions: [`Upgrade to ${feature.requiredTier} tier to access this feature`]
      };
    }

    // Check subscription status
    if (userContext.subscription?.status === 'expired' ||
        userContext.subscription?.status === 'cancelled') {
      return {
        hasAccess: false,
        reason: 'tier_insufficient',
        suggestions: ['Renew your subscription to continue using this feature']
      };
    }

    // Check beta access
    if (feature.beta && !this.hasBetaAccess(userContext, featureId)) {
      return {
        hasAccess: false,
        reason: 'beta_access_required',
        suggestions: ['Request beta access to use this feature']
      };
    }

    // Check dependencies
    if (feature.dependencies) {
      for (const depId of feature.dependencies) {
        const depAccess = this.checkFeatureAccess(depId, userContext);
        if (!depAccess.hasAccess) {
          return {
            hasAccess: false,
            reason: 'dependency_missing',
            suggestions: [`Enable dependency: ${depId}`]
          };
        }
      }
    }

    // Check feature-specific limits
    const tierConfig = this.tierConfigs[userContext.tier];
    const featureLimitCheck = this.checkFeatureLimits(featureId, userContext, tierConfig);
    if (!featureLimitCheck.hasAccess) {
      return featureLimitCheck;
    }

    return { hasAccess: true };
  }

  /**
   * Get all available features for a user's tier
   */
  getAvailableFeatures(userContext: UserContext): string[] {
    return Object.keys(this.featureRegistry).filter(featureId => {
      const access = this.checkFeatureAccess(featureId, userContext);
      return access.hasAccess;
    });
  }

  /**
   * Get tier configuration
   */
  getTierConfig(tier: TierLevel): TierConfiguration {
    return this.tierConfigs[tier];
  }

  /**
   * Check if one tier is sufficient for another
   */
  private isTierSufficient(userTier: TierLevel, requiredTier: TierLevel): boolean {
    const tierHierarchy: Record<TierLevel, number> = {
      starter: 0,
      pro: 1,
      advanced: 2,
      enterprise: 3
    };

    return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
  }

  /**
   * Check if user has beta access
   */
  private hasBetaAccess(userContext: UserContext, featureId: string): boolean {
    // Check if user is in beta program
    return userContext.features?.includes(`beta-${featureId}`) ||
           userContext.metadata?.betaAccess === true ||
           userContext.tier === 'enterprise'; // Enterprise always has beta access
  }

  /**
   * Check feature-specific limits
   */
  private checkFeatureLimits(
    featureId: string,
    userContext: UserContext,
    tierConfig: TierConfiguration
  ): FeatureAccess {
    // Check if feature is enabled in tier
    const featureValue = tierConfig.features[featureId];
    if (featureValue === false) {
      return {
        hasAccess: false,
        reason: 'tier_insufficient',
        upgradeRequired: this.getMinimumTierForFeature(featureId)
      };
    }

    // Check numeric limits (e.g., form count, API calls)
    if (typeof featureValue === 'number' && featureValue > 0) {
      const currentUsage = this.getCurrentUsage(featureId, userContext);
      if (currentUsage >= featureValue) {
        return {
          hasAccess: false,
          reason: 'limit_exceeded',
          currentUsage,
          limit: featureValue,
          suggestions: ['Upgrade your plan to increase limits']
        };
      }
    }

    return { hasAccess: true };
  }

  /**
   * Get minimum tier required for a feature
   */
  private getMinimumTierForFeature(featureId: string): TierLevel {
    const feature = this.featureRegistry[featureId];
    return feature?.requiredTier || 'starter';
  }

  /**
   * Get current usage for a feature (mock implementation)
   */
  private getCurrentUsage(featureId: string, userContext: UserContext): number {
    // In real implementation, this would query usage metrics
    // For now, return mock data
    const mockUsage: Record<string, number> = {
      'form-templates': 3,
      'monthly-submissions': 500,
      'form-count': 5,
      'team-members': 2,
      'api-calls-per-hour': 50,
      'webhook-endpoints': 1
    };

    return mockUsage[featureId] || 0;
  }

  /**
   * Get upgrade recommendations for a user
   */
  getUpgradeRecommendations(userContext: UserContext): {
    suggestedTier: TierLevel;
    benefits: string[];
    cost: number;
    reasoning: string;
  } | null {
    const currentTier = userContext.tier;
    const currentConfig = this.tierConfigs[currentTier];

    // Analyze usage patterns and suggest upgrade
    const usage = {
      forms: this.getCurrentUsage('form-count', userContext),
      submissions: this.getCurrentUsage('monthly-submissions', userContext),
      teamMembers: this.getCurrentUsage('team-members', userContext)
    };

    // Check if user is approaching limits
    const formLimit = currentConfig.limits['form-count'];
    const submissionLimit = currentConfig.limits['monthly-submissions'];
    const teamLimit = currentConfig.limits['team-members'];

    if (formLimit > 0 && usage.forms / formLimit > 0.8 ||
        submissionLimit > 0 && usage.submissions / submissionLimit > 0.8 ||
        teamLimit > 0 && usage.teamMembers / teamLimit > 0.8) {

      const nextTier = this.getNextTier(currentTier);
      if (nextTier) {
        const nextConfig = this.tierConfigs[nextTier];
        return {
          suggestedTier: nextTier,
          benefits: this.getTierUpgradeBenefits(currentTier, nextTier),
          cost: nextConfig.pricing?.monthly || 0,
          reasoning: 'You are approaching usage limits for your current tier'
        };
      }
    }

    return null;
  }

  /**
   * Get next tier in hierarchy
   */
  private getNextTier(currentTier: TierLevel): TierLevel | null {
    const tierOrder: TierLevel[] = ['starter', 'pro', 'advanced', 'enterprise'];
    const currentIndex = tierOrder.indexOf(currentTier);
    return currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;
  }

  /**
   * Get benefits of upgrading from one tier to another
   */
  private getTierUpgradeBenefits(fromTier: TierLevel, toTier: TierLevel): string[] {
    const fromConfig = this.tierConfigs[fromTier];
    const toConfig = this.tierConfigs[toTier];

    const benefits: string[] = [];

    // Compare capabilities
    toConfig.capabilities.forEach(capability => {
      if (!fromConfig.capabilities.includes(capability)) {
        benefits.push(`Access to ${capability}`);
      }
    });

    // Compare limits
    Object.entries(toConfig.limits).forEach(([key, value]) => {
      const fromValue = fromConfig.limits[key];
      if (value > fromValue || value === -1) {
        const increase = value === -1 ? 'unlimited' : `${value - fromValue} more`;
        benefits.push(`${increase} ${key.replace('-', ' ')}`);
      }
    });

    return benefits;
  }
}

// Export singleton instance
export const tierSystem = new TierSystemManager();

// Utility functions
export function hasFeatureAccess(featureId: string, userContext: UserContext): boolean {
  return tierSystem.checkFeatureAccess(featureId, userContext).hasAccess;
}

export function getFeatureAccessDetails(featureId: string, userContext: UserContext): FeatureAccess {
  return tierSystem.checkFeatureAccess(featureId, userContext);
}

export function getUserTierConfig(userContext: UserContext): TierConfiguration {
  return tierSystem.getTierConfig(userContext.tier);
}