// Feature flags registry - All feature flags and their states
export const flags = {
  // Core features
  features: {
    'client-portal': true,
    'weekly-plans': true,
    'progress-tracking': true,
    'media-uploads': true,
    'email-notifications': true,
    'sentinel-demo': false, // New flag for sentinel check demo
    'test-new-route': false, // Flag for test new route
    'test-sentinel': false, // Flag for test sentinel page
    'debug-bulletproof': false, // Flag for debug bulletproof page
    'debug-snapshot': false, // Flag for debug snapshot page
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

// Environment detection
export function getEnvironment(): string {
  // Vercel provides VERCEL_ENV, fallback to NODE_ENV
  return process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_ENV ?? process.env.NODE_ENV ?? 'development';
}

export function isPreviewEnvironment(): boolean {
  const env = getEnvironment();
  return env === 'preview' || env === 'development';
}

export function isProductionEnvironment(): boolean {
  const env = getEnvironment();
  return env === 'production';
}

// Enhanced flag checking with environment context
export function isEnabled(flag: string, ctx?: { env?: string }): boolean {
  const targetEnv = ctx?.env ?? getEnvironment();
  
  // Check if it's a known feature flag
  if (flag in flags.features) {
    const flagValue = flags.features[flag as FeatureFlag];
    
    // In production, flags are OFF unless explicitly enabled
    if (targetEnv === 'production') {
      return Boolean(flagValue);
    }
    
    // In preview/development, flags may default ON for changed routes
    return flagValue !== false;
  }
  
  // Check experimental flags
  if (flag in flags.experimental) {
    const flagValue = flags.experimental[flag as ExperimentalFlag];
    
    // Experimental flags are more restrictive
    if (targetEnv === 'production') {
      return Boolean(flagValue);
    }
    
    return flagValue !== false;
  }
  
  // Check environment flags
  if (flag in flags.environment) {
    return flags.environment[flag as EnvironmentFlag];
  }
  
  // Unknown flags default to OFF in production, ON in preview/development
  return targetEnv !== 'production';
}

// Legacy helper functions (maintained for backward compatibility)
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return isEnabled(flag);
}

export function isExperimentalEnabled(flag: ExperimentalFlag): boolean {
  return isEnabled(flag);
}

export function isEnvironmentFlagEnabled(flag: EnvironmentFlag): boolean {
  return isEnabled(flag);
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

// Get all flags with their current state for the current environment
export function getFlagsForEnvironment(env?: string): Record<string, boolean> {
  const targetEnv = env ?? getEnvironment();
  const result: Record<string, boolean> = {};
  
  Object.entries(flags.features).forEach(([flag, _defaultValue]) => {
    result[flag] = isEnabled(flag, { env: targetEnv });
  });
  
  Object.entries(flags.experimental).forEach(([flag, _defaultValue]) => {
    result[flag] = isEnabled(flag, { env: targetEnv });
  });
  
  Object.entries(flags.environment).forEach(([flag, _defaultValue]) => {
    result[flag] = isEnabled(flag, { env: targetEnv });
  });
  
  return result;
}
