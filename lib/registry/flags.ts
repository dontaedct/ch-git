// Feature flags registry - All feature flags and their states
export const flags = {
  // Core features
  features: {
    'client-portal': true,
    'weekly-plans': true,
    'progress-tracking': true,
    'media-uploads': true,
    'email-notifications': true,
  },
  
  // Experimental features
  experimental: {
    'advanced-analytics': false,
    'mobile-app': false,
    'ai-coaching': false,
    'social-features': false,
  },
  
  // Environment-specific flags
  environment: {
    'debug-mode': process.env.NEXT_PUBLIC_DEBUG === '1',
    'beta-features': process.env.NEXT_PUBLIC_DEBUG === '1',
    'performance-monitoring': process.env.NODE_ENV === 'production',
  },
} as const;

export type FeatureFlag = keyof typeof flags.features;
export type ExperimentalFlag = keyof typeof flags.experimental;
export type EnvironmentFlag = keyof typeof flags.environment;

// Helper functions
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return flags.features[flag];
}

export function isExperimentalEnabled(flag: ExperimentalFlag): boolean {
  return flags.experimental[flag];
}

export function isEnvironmentFlagEnabled(flag: EnvironmentFlag): boolean {
  return flags.environment[flag];
}

// Flag validation
export function isValidFeatureFlag(flag: string): flag is FeatureFlag {
  return flag in flags.features;
}

export function isValidExperimentalFlag(flag: string): flag is ExperimentalFlag {
  return flag in flags.experimental;
}

// Flag management
export function getAllEnabledFlags(): string[] {
  const enabled: string[] = [];
  
  Object.entries(flags.features).forEach(([flag, isEnabled]) => {
    if (isEnabled) enabled.push(flag);
  });
  
  Object.entries(flags.experimental).forEach(([flag, isEnabled]) => {
    if (isEnabled) enabled.push(flag);
  });
  
  Object.entries(flags.environment).forEach(([flag, isEnabled]) => {
    if (isEnabled) enabled.push(flag);
  });
  
  return enabled;
}
