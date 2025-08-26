// Feature flags registry - Legacy fallback for file-based flags
// NOTE: This is now deprecated in favor of Supabase feature_flags table
// Use lib/flags/server.ts for server-side flag access
export const flags = {
  // Core features (migrated to Supabase)
  features: {
    'client-portal': true,
    'weekly-plans': true,
    'progress-tracking': true,
    'media-uploads': true,
    'email-notifications': true,
  },
  
  // Experimental features (migrated to Supabase)
  experimental: {
    'advanced-analytics': false,
    'mobile-app': false,
    'ai-coaching': false,
    'social-features': false,
  },
  
  // Environment-specific flags (migrated to Supabase)
  environment: {
    'debug-mode': process.env.NODE_ENV === 'development',
    'beta-features': process.env.NODE_ENV === 'development',
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
