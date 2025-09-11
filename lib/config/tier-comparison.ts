/**
 * Tier Comparison Matrix - Phase 1, Task 4
 * Comprehensive feature and pricing comparison for sales and marketing
 * RUN_DATE=2025-08-29T15:10:31.507Z
 */

import { TierLevel, FeatureFlag } from '../flags';
import { PresetName, getAvailablePresets } from '../../app.config';

// =============================================================================
// TYPES
// =============================================================================

export interface TierFeature {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  flag?: FeatureFlag;
  technical: boolean;
  customerFacing: boolean;
}

export interface TierComparison {
  tier: TierLevel;
  name: string;
  tagline: string;
  description: string;
  targetAudience: string[];
  pricing: TierPricing;
  features: Record<string, FeatureAvailability>;
  limits: TierLimits;
  support: SupportLevel;
  highlights: string[];
  bestFor: string[];
  upgradeReasons: string[];
}

export interface FeatureAvailability {
  included: boolean;
  limited?: boolean;
  limit?: string;
  note?: string;
  comingSoon?: boolean;
}

export interface TierPricing {
  type: 'free' | 'one-time' | 'subscription' | 'usage-based' | 'enterprise';
  amount?: number;
  currency?: string;
  period?: 'month' | 'year';
  setupFee?: number;
  customPricing?: boolean;
}

export interface TierLimits {
  users: number | 'unlimited';
  storage: string;
  apiCalls: number | 'unlimited';
  customIntegrations: number | 'unlimited';
  supportTickets: string | 'unlimited';
}

export interface SupportLevel {
  channels: string[];
  responseTime: string;
  availability: string;
  dedicatedManager: boolean;
  onboarding: boolean;
  training: boolean;
}

export type FeatureCategory = 
  | 'Core Features'
  | 'Integration & Automation'
  | 'Analytics & Reporting'
  | 'Security & Compliance'
  | 'Performance & Scalability'
  | 'Support & Services'
  | 'Advanced Features';

// =============================================================================
// FEATURE DEFINITIONS
// =============================================================================

export const TIER_FEATURES: TierFeature[] = [
  // Core Features
  {
    id: 'database',
    name: 'Database Access',
    description: 'Secure cloud database with real-time sync',
    category: 'Core Features',
    flag: 'database',
    technical: true,
    customerFacing: true,
  },
  {
    id: 'email',
    name: 'Email Communications',
    description: 'Automated email delivery and templates',
    category: 'Core Features',
    flag: 'email',
    technical: false,
    customerFacing: true,
  },
  {
    id: 'forms',
    name: 'Dynamic Forms',
    description: 'Customizable questionnaires and intake forms',
    category: 'Core Features',
    technical: false,
    customerFacing: true,
  },
  {
    id: 'responsive_design',
    name: 'Mobile-Responsive Design',
    description: 'Optimized experience across all devices',
    category: 'Core Features',
    technical: true,
    customerFacing: true,
  },
  
  // Integration & Automation
  {
    id: 'payments',
    name: 'Payment Processing',
    description: 'Secure Stripe integration for payments',
    category: 'Integration & Automation',
    flag: 'payments',
    technical: true,
    customerFacing: true,
  },
  {
    id: 'webhooks',
    name: 'Webhook Integration',
    description: 'Real-time event notifications to external systems',
    category: 'Integration & Automation',
    flag: 'webhooks',
    technical: true,
    customerFacing: false,
  },
  {
    id: 'automation',
    name: 'Workflow Automation',
    description: 'N8N-powered business process automation',
    category: 'Integration & Automation',
    flag: 'automation',
    technical: true,
    customerFacing: true,
  },
  {
    id: 'notifications',
    name: 'Push Notifications',
    description: 'Slack and email notifications for key events',
    category: 'Integration & Automation',
    flag: 'notifications',
    technical: false,
    customerFacing: true,
  },
  
  // Analytics & Reporting
  {
    id: 'basic_analytics',
    name: 'Basic Analytics',
    description: 'Form submissions and conversion tracking',
    category: 'Analytics & Reporting',
    technical: false,
    customerFacing: true,
  },
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Deep insights, funnels, and user behavior',
    category: 'Analytics & Reporting',
    technical: false,
    customerFacing: true,
  },
  {
    id: 'custom_reports',
    name: 'Custom Reports',
    description: 'Build custom dashboards and export data',
    category: 'Analytics & Reporting',
    technical: false,
    customerFacing: true,
  },
  
  // Security & Compliance
  {
    id: 'ssl_security',
    name: 'SSL Security',
    description: 'HTTPS encryption for all communications',
    category: 'Security & Compliance',
    technical: true,
    customerFacing: true,
  },
  {
    id: 'data_backup',
    name: 'Automated Backups',
    description: 'Regular data backups with point-in-time recovery',
    category: 'Security & Compliance',
    technical: true,
    customerFacing: true,
  },
  {
    id: 'error_tracking',
    name: 'Error Monitoring',
    description: 'Real-time error tracking and alerting',
    category: 'Security & Compliance',
    flag: 'error_tracking',
    technical: true,
    customerFacing: false,
  },
  {
    id: 'admin_operations',
    name: 'Admin Operations',
    description: 'Advanced admin controls and system management',
    category: 'Security & Compliance',
    flag: 'admin_operations',
    technical: true,
    customerFacing: false,
  },
  
  // Performance & Scalability
  {
    id: 'performance_monitoring',
    name: 'Performance Monitoring',
    description: 'Real-time performance metrics and optimization',
    category: 'Performance & Scalability',
    flag: 'performance_monitoring',
    technical: true,
    customerFacing: false,
  },
  {
    id: 'cdn_delivery',
    name: 'Global CDN',
    description: 'Fast content delivery worldwide',
    category: 'Performance & Scalability',
    technical: true,
    customerFacing: true,
  },
  {
    id: 'auto_scaling',
    name: 'Auto-Scaling',
    description: 'Automatic scaling based on traffic',
    category: 'Performance & Scalability',
    technical: true,
    customerFacing: true,
  },
  
  // Support & Services
  {
    id: 'documentation',
    name: 'Documentation',
    description: 'Comprehensive setup and user guides',
    category: 'Support & Services',
    technical: false,
    customerFacing: true,
  },
  {
    id: 'email_support',
    name: 'Email Support',
    description: 'Email-based customer support',
    category: 'Support & Services',
    technical: false,
    customerFacing: true,
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Faster response times and priority handling',
    category: 'Support & Services',
    technical: false,
    customerFacing: true,
  },
  {
    id: 'dedicated_manager',
    name: 'Dedicated Account Manager',
    description: 'Personal account manager for enterprise clients',
    category: 'Support & Services',
    technical: false,
    customerFacing: true,
  },
  
  // Advanced Features
  {
    id: 'ai_features',
    name: 'AI-Powered Features',
    description: 'Intelligent recommendations and automation',
    category: 'Advanced Features',
    flag: 'ai_features',
    technical: true,
    customerFacing: true,
  },
  {
    id: 'custom_branding',
    name: 'Custom Branding',
    description: 'Full white-label customization options',
    category: 'Advanced Features',
    technical: false,
    customerFacing: true,
  },
  {
    id: 'api_access',
    name: 'API Access',
    description: 'RESTful API for custom integrations',
    category: 'Advanced Features',
    technical: true,
    customerFacing: false,
  },
];

// =============================================================================
// TIER CONFIGURATIONS
// =============================================================================

export const TIER_COMPARISONS: Record<TierLevel, TierComparison> = {
  starter: {
    tier: 'starter',
    name: 'Starter',
    tagline: 'Perfect for getting started',
    description: 'Essential features for small businesses and individual professionals',
    targetAudience: ['Solo entrepreneurs', 'Small businesses', 'Testing the waters'],
    pricing: {
      type: 'free',
      amount: 0,
      currency: 'USD',
    },
    features: {
      database: { included: true, limited: true, limit: '1,000 records' },
      email: { included: true, limited: true, limit: '100/month' },
      forms: { included: true, limited: true, limit: '1 form' },
      responsive_design: { included: true },
      payments: { included: false, note: 'Available in Pro tier' },
      webhooks: { included: false },
      automation: { included: false },
      notifications: { included: false },
      basic_analytics: { included: true },
      advanced_analytics: { included: false },
      custom_reports: { included: false },
      ssl_security: { included: true },
      data_backup: { included: true, limited: true, limit: 'Daily' },
      error_tracking: { included: false },
      admin_operations: { included: false },
      performance_monitoring: { included: false },
      cdn_delivery: { included: true },
      auto_scaling: { included: false },
      documentation: { included: true },
      email_support: { included: true, note: 'Community support' },
      priority_support: { included: false },
      dedicated_manager: { included: false },
      ai_features: { included: false },
      custom_branding: { included: false },
      api_access: { included: false },
    },
    limits: {
      users: 1,
      storage: '1 GB',
      apiCalls: 1000,
      customIntegrations: 0,
      supportTickets: '2',
    },
    support: {
      channels: ['Email', 'Documentation'],
      responseTime: '48-72 hours',
      availability: 'Business hours',
      dedicatedManager: false,
      onboarding: false,
      training: false,
    },
    highlights: [
      'Free to get started',
      'Essential features included',
      'Perfect for testing',
      'Easy setup'
    ],
    bestFor: [
      'Solo professionals',
      'Small businesses',
      'Testing the platform',
      'Simple use cases'
    ],
    upgradeReasons: [
      'Need payment processing',
      'Want advanced analytics',
      'Require integrations',
      'Need priority support'
    ],
  },

  pro: {
    tier: 'pro',
    name: 'Pro',
    tagline: 'Everything you need to grow',
    description: 'Advanced features and integrations for growing businesses',
    targetAudience: ['Growing businesses', 'Professional services', 'E-commerce stores'],
    pricing: {
      type: 'subscription',
      amount: 49,
      currency: 'USD',
      period: 'month',
    },
    features: {
      database: { included: true, limited: true, limit: '10,000 records' },
      email: { included: true, limited: true, limit: '5,000/month' },
      forms: { included: true, limited: true, limit: '5 forms' },
      responsive_design: { included: true },
      payments: { included: true },
      webhooks: { included: true, limited: true, limit: '10 webhooks' },
      automation: { included: false, note: 'Available in Advanced tier' },
      notifications: { included: true },
      basic_analytics: { included: true },
      advanced_analytics: { included: true },
      custom_reports: { included: true, limited: true, limit: '5 reports' },
      ssl_security: { included: true },
      data_backup: { included: true, limit: 'Hourly' },
      error_tracking: { included: true },
      admin_operations: { included: false },
      performance_monitoring: { included: true },
      cdn_delivery: { included: true },
      auto_scaling: { included: true, limited: true },
      documentation: { included: true },
      email_support: { included: true },
      priority_support: { included: true, note: '24-hour response' },
      dedicated_manager: { included: false },
      ai_features: { included: false },
      custom_branding: { included: true, limited: true, note: 'Logo and colors' },
      api_access: { included: true, limited: true, limit: '10,000 calls/month' },
    },
    limits: {
      users: 5,
      storage: '50 GB',
      apiCalls: 10000,
      customIntegrations: 5,
      supportTickets: 'unlimited',
    },
    support: {
      channels: ['Email', 'Chat', 'Phone', 'Documentation'],
      responseTime: '4-24 hours',
      availability: 'Extended hours',
      dedicatedManager: false,
      onboarding: true,
      training: false,
    },
    highlights: [
      'Payment processing included',
      'Advanced analytics',
      'Priority support',
      'Custom branding'
    ],
    bestFor: [
      'Growing businesses',
      'Professional services',
      'E-commerce stores',
      'Teams up to 5 people'
    ],
    upgradeReasons: [
      'Need AI features',
      'Want unlimited users',
      'Require advanced automation',
      'Need dedicated support'
    ],
  },

  advanced: {
    tier: 'advanced',
    name: 'Advanced',
    tagline: 'Enterprise-grade power and flexibility',
    description: 'Complete solution with AI, automation, and enterprise features',
    targetAudience: ['Large businesses', 'Enterprise clients', 'High-volume operations'],
    pricing: {
      type: 'subscription',
      amount: 199,
      currency: 'USD',
      period: 'month',
      customPricing: true,
    },
    features: {
      database: { included: true, limit: 'Unlimited' },
      email: { included: true, limit: 'Unlimited' },
      forms: { included: true, limit: 'Unlimited' },
      responsive_design: { included: true },
      payments: { included: true },
      webhooks: { included: true, limit: 'Unlimited' },
      automation: { included: true },
      notifications: { included: true },
      basic_analytics: { included: true },
      advanced_analytics: { included: true },
      custom_reports: { included: true, limit: 'Unlimited' },
      ssl_security: { included: true },
      data_backup: { included: true, limit: 'Real-time' },
      error_tracking: { included: true },
      admin_operations: { included: true },
      performance_monitoring: { included: true },
      cdn_delivery: { included: true },
      auto_scaling: { included: true },
      documentation: { included: true },
      email_support: { included: true },
      priority_support: { included: true, note: '1-hour response' },
      dedicated_manager: { included: true },
      ai_features: { included: true },
      custom_branding: { included: true, note: 'Full white-label' },
      api_access: { included: true, limit: 'Unlimited' },
    },
    limits: {
      users: 'unlimited',
      storage: '1 TB',
      apiCalls: 'unlimited',
      customIntegrations: 'unlimited',
      supportTickets: 'unlimited',
    },
    support: {
      channels: ['Email', 'Chat', 'Phone', 'Video Call', 'Documentation'],
      responseTime: '1-4 hours',
      availability: '24/7',
      dedicatedManager: true,
      onboarding: true,
      training: true,
    },
    highlights: [
      'AI-powered features',
      'Unlimited everything',
      'Dedicated account manager',
      '24/7 support'
    ],
    bestFor: [
      'Large businesses',
      'Enterprise clients',
      'High-volume operations',
      'Complex integrations'
    ],
    upgradeReasons: [],
  },
};

// =============================================================================
// COMPARISON UTILITIES
// =============================================================================

/**
 * Get feature comparison across all tiers
 */
export function getFeatureComparison(): Array<{
  feature: TierFeature;
  availability: Record<TierLevel, FeatureAvailability>;
}> {
  return TIER_FEATURES.map(feature => ({
    feature,
    availability: {
      starter: TIER_COMPARISONS.starter.features[feature.id] || { included: false },
      pro: TIER_COMPARISONS.pro.features[feature.id] || { included: false },
      advanced: TIER_COMPARISONS.advanced.features[feature.id] || { included: false },
    },
  }));
}

/**
 * Get features by category
 */
export function getFeaturesByCategory(): Record<FeatureCategory, TierFeature[]> {
  const categories: Record<FeatureCategory, TierFeature[]> = {
    'Core Features': [],
    'Integration & Automation': [],
    'Analytics & Reporting': [],
    'Security & Compliance': [],
    'Performance & Scalability': [],
    'Support & Services': [],
    'Advanced Features': [],
  };

  TIER_FEATURES.forEach(feature => {
    categories[feature.category].push(feature);
  });

  return categories;
}

/**
 * Get tier recommendations based on requirements
 */
export function getTierRecommendations(requirements: {
  users?: number;
  paymentProcessing?: boolean;
  aiFeatures?: boolean;
  customIntegrations?: boolean;
  prioritySupport?: boolean;
}): {
  recommended: TierLevel;
  alternatives: TierLevel[];
  reasons: string[];
} {
  const { users = 1, paymentProcessing, aiFeatures, customIntegrations, prioritySupport } = requirements;
  
  const score = { starter: 0, pro: 0, advanced: 0 };
  const reasons: string[] = [];
  
  // User requirements
  if (users <= 1) {
    score.starter += 3;
  } else if (users <= 5) {
    score.pro += 3;
    reasons.push('Multiple users need Pro or Advanced tier');
  } else {
    score.advanced += 3;
    reasons.push('Large team requires Advanced tier');
  }
  
  // Feature requirements
  if (paymentProcessing) {
    score.pro += 2;
    score.advanced += 2;
    reasons.push('Payment processing available in Pro and Advanced tiers');
  }
  
  if (aiFeatures) {
    score.advanced += 3;
    reasons.push('AI features only available in Advanced tier');
  }
  
  if (customIntegrations) {
    score.pro += 1;
    score.advanced += 2;
    reasons.push('Custom integrations better supported in higher tiers');
  }
  
  if (prioritySupport) {
    score.pro += 1;
    score.advanced += 2;
    reasons.push('Priority support available in Pro and Advanced tiers');
  }
  
  // Find recommended tier
  const sortedTiers = Object.entries(score)
    .sort(([,a], [,b]) => b - a)
    .map(([tier]) => tier as TierLevel);
  
  return {
    recommended: sortedTiers[0],
    alternatives: sortedTiers.slice(1),
    reasons,
  };
}

/**
 * Generate pricing comparison table
 */
export function getPricingComparison(): Array<{
  tier: TierLevel;
  name: string;
  pricing: TierPricing;
  highlights: string[];
  bestFor: string[];
}> {
  return Object.values(TIER_COMPARISONS).map(comparison => ({
    tier: comparison.tier,
    name: comparison.name,
    pricing: comparison.pricing,
    highlights: comparison.highlights,
    bestFor: comparison.bestFor,
  }));
}

/**
 * Get upgrade benefits for a specific tier transition
 */
export function getUpgradeBenefits(fromTier: TierLevel, toTier: TierLevel): {
  newFeatures: TierFeature[];
  improvedLimits: Array<{ feature: string; from: string; to: string }>;
  supportUpgrade: { from: SupportLevel; to: SupportLevel };
} {
  const fromComparison = TIER_COMPARISONS[fromTier];
  const toComparison = TIER_COMPARISONS[toTier];
  
  // Find new features
  const newFeatures = TIER_FEATURES.filter(feature => {
    const fromAvailable = fromComparison.features[feature.id]?.included;
    const toAvailable = toComparison.features[feature.id]?.included;
    return !fromAvailable && toAvailable;
  });
  
  // Find improved limits
  const improvedLimits: Array<{ feature: string; from: string; to: string }> = [];
  TIER_FEATURES.forEach(feature => {
    const fromFeature = fromComparison.features[feature.id];
    const toFeature = toComparison.features[feature.id];
    
    if (fromFeature?.included && toFeature?.included) {
      if (fromFeature.limited && !toFeature.limited) {
        improvedLimits.push({
          feature: feature.name,
          from: fromFeature.limit ?? 'Limited',
          to: 'Unlimited',
        });
      } else if (fromFeature.limit && toFeature.limit && fromFeature.limit !== toFeature.limit) {
        improvedLimits.push({
          feature: feature.name,
          from: fromFeature.limit,
          to: toFeature.limit,
        });
      }
    }
  });
  
  return {
    newFeatures,
    improvedLimits,
    supportUpgrade: {
      from: fromComparison.support,
      to: toComparison.support,
    },
  };
}

// =============================================================================
// PRESET-SPECIFIC COMPARISONS
// =============================================================================

/**
 * Get tier comparison tailored for specific presets
 */
export function getPresetTierComparison(preset: PresetName): Array<{
  tier: TierLevel;
  suitability: 'ideal' | 'suitable' | 'limited';
  reasons: string[];
  recommendedFeatures: string[];
}> {
  const presets = getAvailablePresets();
  const presetInfo = presets.find(p => p.id === preset);
  
  if (!presetInfo) {
    return [];
  }
  
  // Define preset-specific requirements
  const requirements = getPresetRequirements(preset);
  
  return (['starter', 'pro', 'advanced'] as TierLevel[]).map(tier => {
    const _comparison = TIER_COMPARISONS[tier];
    const suitability = evaluateTierSuitability(tier, requirements);
    
    return {
      tier,
      suitability,
      reasons: getSuitabilityReasons(tier, requirements),
      recommendedFeatures: getRecommendedFeatures(tier, preset),
    };
  });
}

function getPresetRequirements(preset: PresetName): Record<string, boolean> {
  const requirements: Record<PresetName, Record<string, boolean>> = {
    'salon-waitlist': {
      email: true,
      notifications: true,
      payments: false, // Optional for appointments
      automation: false,
    },
    'realtor-listing-hub': {
      email: true,
      payments: true,
      automation: true,
      notifications: true,
      advanced_analytics: true,
    },
    'consultation-engine': {
      ai_features: true,
      automation: true,
      payments: true,
      advanced_analytics: true,
      api_access: true,
    },
  };
  
  return requirements[preset] || {};
}

function evaluateTierSuitability(tier: TierLevel, requirements: Record<string, boolean>): 'ideal' | 'suitable' | 'limited' {
  const comparison = TIER_COMPARISONS[tier];
  const requiredFeatures = Object.entries(requirements).filter(([, required]) => required);
  const availableFeatures = requiredFeatures.filter(([feature]) => 
    comparison.features[feature]?.included
  );
  
  const satisfaction = availableFeatures.length / requiredFeatures.length;
  
  if (satisfaction >= 0.9) return 'ideal';
  if (satisfaction >= 0.6) return 'suitable';
  return 'limited';
}

function getSuitabilityReasons(tier: TierLevel, requirements: Record<string, boolean>): string[] {
  const comparison = TIER_COMPARISONS[tier];
  const reasons: string[] = [];
  
  Object.entries(requirements).forEach(([feature, required]) => {
    if (required) {
      const available = comparison.features[feature]?.included;
      if (available) {
        reasons.push(`✅ ${feature} included`);
      } else {
        reasons.push(`❌ ${feature} not available`);
      }
    }
  });
  
  return reasons;
}

function getRecommendedFeatures(tier: TierLevel, _preset: PresetName): string[] {
  const comparison = TIER_COMPARISONS[tier];
  
  // Return customer-facing features available in this tier
  return TIER_FEATURES
    .filter(feature => 
      feature.customerFacing && 
      comparison.features[feature.id]?.included
    )
    .map(feature => feature.name)
    .slice(0, 5); // Top 5 features
}

// =============================================================================
// EXPORTS
// =============================================================================

const tierComparisonExports = {
  TIER_FEATURES,
  TIER_COMPARISONS,
  getFeatureComparison,
  getFeaturesByCategory,
  getTierRecommendations,
  getPricingComparison,
  getUpgradeBenefits,
  getPresetTierComparison,
};

export default tierComparisonExports;