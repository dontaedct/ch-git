/**
 * Dynamic Feature Loader - Phase 1, Task 4
 * Handles dynamic loading and initialization of features based on tier configuration
 * RUN_DATE=2025-08-29T15:10:31.507Z
 */

import { getAppConfig, isFeatureEnabled } from '../../app.config.base';
import { FeatureFlag } from '../flags';
import { withFeature } from '../flags';

// =============================================================================
// TYPES
// =============================================================================

export interface FeatureModule {
  name: string;
  initialize?: () => Promise<void> | void;
  cleanup?: () => Promise<void> | void;
  dependencies?: FeatureFlag[];
  lazy?: boolean;
}

export interface LoadedFeature {
  name: string;
  module: FeatureModule;
  loaded: boolean;
  initialized: boolean;
  error?: Error;
}

// =============================================================================
// FEATURE REGISTRY
// =============================================================================

const FEATURE_MODULES: Record<FeatureFlag, FeatureModule> = {
  database: {
    name: 'Database',
    initialize: async () => {
      // Initialize Supabase client
      console.log('🗄️ Database feature initialized');
    },
    dependencies: [],
  },
  
  email: {
    name: 'Email Service',
    initialize: async () => {
      // Initialize email service
      console.log('📧 Email service initialized');
    },
    dependencies: [],
  },
  
  payments: {
    name: 'Payment Processing',
    initialize: async () => {
      // Initialize payment processing
      console.log('💳 Payment processing initialized');
    },
    dependencies: ['database'],
    lazy: true,
  },
  
  webhooks: {
    name: 'Webhook Processing',
    initialize: async () => {
      // Initialize webhook handlers
      console.log('🔗 Webhook processing initialized');
    },
    dependencies: ['database'],
    lazy: true,
  },
  
  automation: {
    name: 'Workflow Automation',
    initialize: async () => {
      // Initialize workflow automation
      console.log('🤖 Automation workflows initialized');
    },
    dependencies: ['webhooks'],
    lazy: true,
  },
  
  notifications: {
    name: 'Notifications',
    initialize: async () => {
      // Initialize notification services
      console.log('🔔 Notification services initialized');
    },
    dependencies: [],
    lazy: true,
  },
  
  error_tracking: {
    name: 'Error Tracking',
    initialize: async () => {
      // Initialize error tracking
      console.log('🐛 Error tracking initialized');
    },
    dependencies: [],
  },
  
  admin_operations: {
    name: 'Admin Operations',
    initialize: async () => {
      // Initialize admin-only services
      console.log('👑 Admin operations initialized');
    },
    dependencies: ['database'],
    lazy: true,
  },
  
  ai_features: {
    name: 'AI Features',
    initialize: async () => {
      // Initialize AI services
      console.log('🧠 AI features initialized');
    },
    dependencies: ['database'],
    lazy: true,
  },
  
  debug_mode: {
    name: 'Debug Mode',
    initialize: () => {
      // Enable debug logging and development tools
      console.log('🐛 Debug mode enabled');
    },
    dependencies: [],
  },
  
  safe_mode: {
    name: 'Safe Mode',
    initialize: () => {
      // Enable safe mode protections
      console.log('🛡️ Safe mode enabled');
    },
    dependencies: [],
  },
  
  performance_monitoring: {
    name: 'Performance Monitoring',
    initialize: async () => {
      // Initialize performance monitoring
      console.log('📊 Performance monitoring enabled');
    },
    dependencies: [],
    lazy: true,
  },
  
  health_checks: {
    name: 'Health Checks',
    initialize: async () => {
      // Initialize health check monitoring
      console.log('🏥 Health checks initialized');
    },
    dependencies: [],
  },
  
  ui_polish_target_style: {
    name: 'UI Polish Target Style',
    initialize: async () => {
      // Initialize UI polish theme system
      console.log('🎨 UI Polish Target Style initialized');
    },
    dependencies: [],
  },
};

// =============================================================================
// FEATURE LOADER STATE
// =============================================================================

const loadedFeatures = new Map<FeatureFlag, LoadedFeature>();

// =============================================================================
// CORE LOADING FUNCTIONS
// =============================================================================

/**
 * Load a specific feature module
 */
export async function loadFeature(feature: FeatureFlag): Promise<LoadedFeature> {
  // Check if feature is already loaded
  const existing = loadedFeatures.get(feature);
  if (existing) {
    return existing;
  }

  // Check if feature is enabled
  if (!isFeatureEnabled(feature)) {
    const disabledFeature: LoadedFeature = {
      name: FEATURE_MODULES[feature].name,
      module: FEATURE_MODULES[feature],
      loaded: false,
      initialized: false,
      error: new Error(`Feature ${feature} is not enabled for current tier`),
    };
    loadedFeatures.set(feature, disabledFeature);
    return disabledFeature;
  }

  const featureModule = FEATURE_MODULES[feature];
  const loadedFeature: LoadedFeature = {
    name: featureModule.name,
    module: featureModule,
    loaded: true,
    initialized: false,
  };

  try {
    // Load dependencies first
    if (featureModule.dependencies) {
      await Promise.all(
        featureModule.dependencies.map(dep => loadFeature(dep))
      );
    }

    // Initialize the feature
    if (featureModule.initialize) {
      await featureModule.initialize();
    }

    loadedFeature.initialized = true;
    console.log(`✅ Feature loaded: ${featureModule.name}`);
  } catch (error) {
    loadedFeature.error = error as Error;
    console.error(`❌ Failed to load feature: ${featureModule.name}`, error);
  }

  loadedFeatures.set(feature, loadedFeature);
  return loadedFeature;
}

/**
 * Load multiple features in parallel
 */
export async function loadFeatures(features: FeatureFlag[]): Promise<LoadedFeature[]> {
  const loadPromises = features.map(feature => loadFeature(feature));
  return Promise.all(loadPromises);
}

/**
 * Load all enabled features for current tier
 */
export async function loadAllEnabledFeatures(): Promise<LoadedFeature[]> {
  const config = getAppConfig();
  const enabledFeatures = Object.entries(config.features)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature as FeatureFlag);

  return loadFeatures(enabledFeatures);
}

/**
 * Load only critical (non-lazy) features
 */
export async function loadCriticalFeatures(): Promise<LoadedFeature[]> {
  const config = getAppConfig();
  const criticalFeatures = Object.entries(config.features)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature as FeatureFlag)
    .filter(feature => !FEATURE_MODULES[feature].lazy);

  return loadFeatures(criticalFeatures);
}

/**
 * Lazy load a feature when needed
 */
export async function lazyLoadFeature(feature: FeatureFlag): Promise<LoadedFeature | null> {
  return withFeature(feature, () => loadFeature(feature)) ?? null;
}

// =============================================================================
// FEATURE MANAGEMENT
// =============================================================================

/**
 * Check if a feature is loaded and initialized
 */
export function isFeatureLoaded(feature: FeatureFlag): boolean {
  const loaded = loadedFeatures.get(feature);
  return loaded?.loaded === true && loaded?.initialized === true;
}

/**
 * Get loaded feature information
 */
export function getLoadedFeature(feature: FeatureFlag): LoadedFeature | undefined {
  return loadedFeatures.get(feature);
}

/**
 * Get all loaded features
 */
export function getAllLoadedFeatures(): LoadedFeature[] {
  return Array.from(loadedFeatures.values());
}

/**
 * Unload a feature and cleanup resources
 */
export async function unloadFeature(feature: FeatureFlag): Promise<void> {
  const loaded = loadedFeatures.get(feature);
  if (!loaded) return;

  try {
    if (loaded.module.cleanup) {
      await loaded.module.cleanup();
    }
    loadedFeatures.delete(feature);
    console.log(`🧹 Feature unloaded: ${loaded.name}`);
  } catch (error) {
    console.error(`❌ Failed to unload feature: ${loaded.name}`, error);
  }
}

/**
 * Reload a feature (unload then load)
 */
export async function reloadFeature(feature: FeatureFlag): Promise<LoadedFeature> {
  await unloadFeature(feature);
  return loadFeature(feature);
}

// =============================================================================
// LIFECYCLE MANAGEMENT
// =============================================================================

/**
 * Initialize the feature loader system
 */
export async function initializeFeatureLoader(): Promise<void> {
  console.log('🚀 Initializing feature loader...');
  
  try {
    // Load critical features first
    const criticalFeatures = await loadCriticalFeatures();
    const failed = criticalFeatures.filter(f => f.error);
    
    if (failed.length > 0) {
      console.warn(`⚠️ Some critical features failed to load:`, failed.map(f => f.name));
    }
    
    console.log(`✅ Feature loader initialized. ${criticalFeatures.length - failed.length}/${criticalFeatures.length} critical features loaded.`);
  } catch (error) {
    console.error('❌ Failed to initialize feature loader:', error);
    throw error;
  }
}

/**
 * Cleanup all loaded features
 */
export async function cleanupAllFeatures(): Promise<void> {
  const features = Array.from(loadedFeatures.keys());
  await Promise.all(features.map(feature => unloadFeature(feature)));
  console.log('🧹 All features cleaned up');
}

// =============================================================================
// DEVELOPMENT & DEBUGGING
// =============================================================================

/**
 * Get feature loading status for debugging
 */
export function getFeatureLoadingStatus() {
  const config = getAppConfig();
  const allFeatures = Object.keys(FEATURE_MODULES) as FeatureFlag[];
  
  return {
    tier: config.tier,
    preset: config.preset,
    features: allFeatures.map(feature => {
      const enabled = isFeatureEnabled(feature);
      const loaded = getLoadedFeature(feature);
      const moduleInfo = FEATURE_MODULES[feature];
      
      return {
        feature,
        name: moduleInfo.name,
        enabled,
        lazy: moduleInfo.lazy ?? false,
        dependencies: moduleInfo.dependencies ?? [],
        loaded: loaded?.loaded ?? false,
        initialized: loaded?.initialized ?? false,
        error: loaded?.error?.message,
      };
    }),
  };
}

/**
 * Force reload all features (for development)
 */
export async function reloadAllFeatures(): Promise<void> {
  await cleanupAllFeatures();
  await loadAllEnabledFeatures();
}

// =============================================================================
// EXPORTS
// =============================================================================

const featureLoaderExports = {
  loadFeature,
  loadFeatures,
  loadAllEnabledFeatures,
  loadCriticalFeatures,
  lazyLoadFeature,
  isFeatureLoaded,
  getLoadedFeature,
  getAllLoadedFeatures,
  unloadFeature,
  reloadFeature,
  initializeFeatureLoader,
  cleanupAllFeatures,
  getFeatureLoadingStatus,
  reloadAllFeatures,
};

export default featureLoaderExports;