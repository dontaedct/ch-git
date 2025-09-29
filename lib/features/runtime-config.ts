/**
 * Runtime Configuration Management System
 * Provides dynamic configuration updates without requiring application restarts
 */

export type ConfigValueType = string | number | boolean | object | any[];

export interface ConfigValue {
  key: string;
  value: ConfigValueType;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  category: string;
  environment?: 'development' | 'staging' | 'production' | 'all';
  tier?: 'starter' | 'pro' | 'advanced' | 'enterprise' | 'all';
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
  };
  lastModified: Date;
  modifiedBy: string;
  version: number;
  rollbackValue?: ConfigValueType;
}

export interface ConfigCategory {
  name: string;
  description: string;
  icon?: string;
  priority: number;
}

export interface ConfigurationSnapshot {
  id: string;
  name: string;
  description: string;
  timestamp: Date;
  configuration: Record<string, ConfigValue>;
  createdBy: string;
  environment: string;
}

export interface ConfigUpdateEvent {
  type: 'update' | 'create' | 'delete' | 'rollback';
  key: string;
  oldValue?: ConfigValueType;
  newValue?: ConfigValueType;
  timestamp: Date;
  user: string;
  reason?: string;
}

/**
 * Configuration categories
 */
export const CONFIG_CATEGORIES: Record<string, ConfigCategory> = {
  api: {
    name: 'API Settings',
    description: 'API rate limits, timeouts, and endpoints',
    icon: 'api',
    priority: 1
  },
  cache: {
    name: 'Cache Configuration',
    description: 'Caching strategies and TTL settings',
    icon: 'database',
    priority: 2
  },
  features: {
    name: 'Feature Toggles',
    description: 'Feature flags and experimental features',
    icon: 'toggle',
    priority: 3
  },
  ui: {
    name: 'UI/UX Settings',
    description: 'Interface customization and theming',
    icon: 'palette',
    priority: 4
  },
  security: {
    name: 'Security Settings',
    description: 'Authentication, encryption, and access control',
    icon: 'shield',
    priority: 5
  },
  performance: {
    name: 'Performance Tuning',
    description: 'Optimization and resource management',
    icon: 'zap',
    priority: 6
  },
  integrations: {
    name: 'External Integrations',
    description: 'Third-party service configurations',
    icon: 'link',
    priority: 7
  },
  monitoring: {
    name: 'Monitoring & Logging',
    description: 'Observability and error tracking',
    icon: 'activity',
    priority: 8
  }
};

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Record<string, ConfigValue> = {
  'api.rate_limit.starter': {
    key: 'api.rate_limit.starter',
    value: 100,
    type: 'number',
    description: 'API rate limit per hour for starter tier users',
    category: 'api',
    tier: 'all',
    validation: { required: true, min: 10, max: 1000 },
    lastModified: new Date(),
    modifiedBy: 'system',
    version: 1
  },
  'api.rate_limit.pro': {
    key: 'api.rate_limit.pro',
    value: 1000,
    type: 'number',
    description: 'API rate limit per hour for pro tier users',
    category: 'api',
    tier: 'all',
    validation: { required: true, min: 100, max: 10000 },
    lastModified: new Date(),
    modifiedBy: 'system',
    version: 1
  },
  'api.rate_limit.advanced': {
    key: 'api.rate_limit.advanced',
    value: 10000,
    type: 'number',
    description: 'API rate limit per hour for advanced tier users',
    category: 'api',
    tier: 'all',
    validation: { required: true, min: 1000, max: 100000 },
    lastModified: new Date(),
    modifiedBy: 'system',
    version: 1
  },
  'cache.ttl.default': {
    key: 'cache.ttl.default',
    value: 3600,
    type: 'number',
    description: 'Default cache TTL in seconds',
    category: 'cache',
    validation: { required: true, min: 60, max: 86400 },
    lastModified: new Date(),
    modifiedBy: 'system',
    version: 1
  },
  'cache.max_size_mb': {
    key: 'cache.max_size_mb',
    value: 100,
    type: 'number',
    description: 'Maximum cache size in megabytes',
    category: 'cache',
    validation: { required: true, min: 10, max: 1000 },
    lastModified: new Date(),
    modifiedBy: 'system',
    version: 1
  },
  'cache.redis.enabled': {
    key: 'cache.redis.enabled',
    value: true,
    type: 'boolean',
    description: 'Enable Redis caching',
    category: 'cache',
    environment: 'production',
    lastModified: new Date(),
    modifiedBy: 'system',
    version: 1
  },
  'features.ai_assistance.enabled': {
    key: 'features.ai_assistance.enabled',
    value: true,
    type: 'boolean',
    description: 'Enable AI-powered form assistance',
    category: 'features',
    tier: 'pro',
    lastModified: new Date(),
    modifiedBy: 'system',
    version: 1
  },
  'features.realtime_collaboration.enabled': {
    key: 'features.realtime_collaboration.enabled',
    value: false,
    type: 'boolean',
    description: 'Enable real-time collaboration features',
    category: 'features',
    tier: 'advanced',
    lastModified: new Date(),
    modifiedBy: 'system',
    version: 1
  },
  'ui.theme.default': {
    key: 'ui.theme.default',
    value: 'professional',
    type: 'string',
    description: 'Default UI theme',
    category: 'ui',
    validation: { enum: ['professional', 'modern', 'classic', 'dark'] },
    lastModified: new Date(),
    modifiedBy: 'system',
    version: 1
  },
  'ui.branding.show_powered_by': {
    key: 'ui.branding.show_powered_by',
    value: true,
    type: 'boolean',
    description: 'Show "Powered by" branding',
    category: 'ui',
    tier: 'starter',
    lastModified: new Date(),
    modifiedBy: 'system',
    version: 1
  },
  'security.session_timeout': {
    key: 'security.session_timeout',
    value: 1800,
    type: 'number',
    description: 'Session timeout in seconds',
    category: 'security',
    validation: { required: true, min: 300, max: 86400 },
    lastModified: new Date(),
    modifiedBy: 'system',
    version: 1
  },
  'security.password_policy.min_length': {
    key: 'security.password_policy.min_length',
    value: 8,
    type: 'number',
    description: 'Minimum password length',
    category: 'security',
    validation: { required: true, min: 6, max: 128 },
    lastModified: new Date(),
    modifiedBy: 'system',
    version: 1
  },
  'performance.auto_save_interval': {
    key: 'performance.auto_save_interval',
    value: 5000,
    type: 'number',
    description: 'Auto-save interval in milliseconds',
    category: 'performance',
    validation: { required: true, min: 1000, max: 30000 },
    lastModified: new Date(),
    modifiedBy: 'system',
    version: 1
  },
  'integrations.webhook.timeout': {
    key: 'integrations.webhook.timeout',
    value: 30000,
    type: 'number',
    description: 'Webhook timeout in milliseconds',
    category: 'integrations',
    validation: { required: true, min: 5000, max: 60000 },
    lastModified: new Date(),
    modifiedBy: 'system',
    version: 1
  },
  'monitoring.error_tracking.enabled': {
    key: 'monitoring.error_tracking.enabled',
    value: true,
    type: 'boolean',
    description: 'Enable error tracking and reporting',
    category: 'monitoring',
    lastModified: new Date(),
    modifiedBy: 'system',
    version: 1
  }
};

/**
 * Runtime Configuration Manager
 */
export class RuntimeConfigManager {
  private config: Map<string, ConfigValue>;
  private listeners: Map<string, Array<(value: ConfigValueType) => void>>;
  private updateHistory: ConfigUpdateEvent[];
  private snapshots: ConfigurationSnapshot[];

  constructor(initialConfig = DEFAULT_CONFIG) {
    this.config = new Map();
    this.listeners = new Map();
    this.updateHistory = [];
    this.snapshots = [];

    // Load initial configuration
    Object.values(initialConfig).forEach(configValue => {
      this.config.set(configValue.key, { ...configValue });
    });
  }

  /**
   * Get configuration value
   */
  get<T = ConfigValueType>(key: string, defaultValue?: T): T {
    const configValue = this.config.get(key);
    if (configValue) {
      return configValue.value as T;
    }
    return defaultValue as T;
  }

  /**
   * Set configuration value
   */
  async set(
    key: string,
    value: ConfigValueType,
    options: {
      user: string;
      reason?: string;
      skipValidation?: boolean;
    }
  ): Promise<boolean> {
    const existing = this.config.get(key);
    const oldValue = existing?.value;

    // Validate value if validation rules exist
    if (existing?.validation && !options.skipValidation) {
      const isValid = this.validateValue(value, existing.validation);
      if (!isValid) {
        throw new Error(`Validation failed for ${key}: Invalid value ${value}`);
      }
    }

    // Update configuration
    const updatedConfig: ConfigValue = existing ? {
      ...existing,
      value,
      lastModified: new Date(),
      modifiedBy: options.user,
      version: existing.version + 1,
      rollbackValue: oldValue
    } : {
      key,
      value,
      type: typeof value as any,
      category: 'custom',
      lastModified: new Date(),
      modifiedBy: options.user,
      version: 1
    };

    this.config.set(key, updatedConfig);

    // Record update event
    this.updateHistory.push({
      type: existing ? 'update' : 'create',
      key,
      oldValue,
      newValue: value,
      timestamp: new Date(),
      user: options.user,
      reason: options.reason
    });

    // Notify listeners
    this.notifyListeners(key, value);

    return true;
  }

  /**
   * Delete configuration value
   */
  async delete(key: string, user: string, reason?: string): Promise<boolean> {
    const existing = this.config.get(key);
    if (!existing) {
      return false;
    }

    this.config.delete(key);

    // Record delete event
    this.updateHistory.push({
      type: 'delete',
      key,
      oldValue: existing.value,
      timestamp: new Date(),
      user,
      reason
    });

    // Notify listeners
    this.notifyListeners(key, undefined);

    return true;
  }

  /**
   * Rollback configuration value to previous version
   */
  async rollback(key: string, user: string, reason?: string): Promise<boolean> {
    const existing = this.config.get(key);
    if (!existing || existing.rollbackValue === undefined) {
      return false;
    }

    const rollbackValue = existing.rollbackValue;
    await this.set(key, rollbackValue, { user, reason: reason || 'Rollback operation' });

    // Record rollback event
    this.updateHistory.push({
      type: 'rollback',
      key,
      oldValue: existing.value,
      newValue: rollbackValue,
      timestamp: new Date(),
      user,
      reason
    });

    return true;
  }

  /**
   * Get all configuration values
   */
  getAll(): Record<string, ConfigValue> {
    const result: Record<string, ConfigValue> = {};
    this.config.forEach((value, key) => {
      result[key] = { ...value };
    });
    return result;
  }

  /**
   * Get configuration values by category
   */
  getByCategory(category: string): Record<string, ConfigValue> {
    const result: Record<string, ConfigValue> = {};
    this.config.forEach((value, key) => {
      if (value.category === category) {
        result[key] = { ...value };
      }
    });
    return result;
  }

  /**
   * Get configuration values by tier
   */
  getByTier(tier: string): Record<string, ConfigValue> {
    const result: Record<string, ConfigValue> = {};
    this.config.forEach((value, key) => {
      if (value.tier === tier || value.tier === 'all') {
        result[key] = { ...value };
      }
    });
    return result;
  }

  /**
   * Get configuration values by environment
   */
  getByEnvironment(environment: string): Record<string, ConfigValue> {
    const result: Record<string, ConfigValue> = {};
    this.config.forEach((value, key) => {
      if (value.environment === environment || value.environment === 'all' || !value.environment) {
        result[key] = { ...value };
      }
    });
    return result;
  }

  /**
   * Subscribe to configuration changes
   */
  subscribe(key: string, callback: (value: ConfigValueType) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Create configuration snapshot
   */
  createSnapshot(name: string, description: string, createdBy: string): ConfigurationSnapshot {
    const snapshot: ConfigurationSnapshot = {
      id: `snapshot_${Date.now()}`,
      name,
      description,
      timestamp: new Date(),
      configuration: this.getAll(),
      createdBy,
      environment: process.env.NODE_ENV || 'development'
    };

    this.snapshots.push(snapshot);
    return snapshot;
  }

  /**
   * Restore from snapshot
   */
  async restoreFromSnapshot(snapshotId: string, user: string): Promise<boolean> {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);
    if (!snapshot) {
      return false;
    }

    // Clear current configuration
    this.config.clear();

    // Restore from snapshot
    Object.values(snapshot.configuration).forEach(configValue => {
      this.config.set(configValue.key, { ...configValue });
    });

    // Record restore event
    this.updateHistory.push({
      type: 'update',
      key: 'system.restore',
      newValue: snapshotId,
      timestamp: new Date(),
      user,
      reason: `Restored from snapshot: ${snapshot.name}`
    });

    return true;
  }

  /**
   * Get update history
   */
  getUpdateHistory(limit = 100): ConfigUpdateEvent[] {
    return this.updateHistory.slice(-limit);
  }

  /**
   * Get snapshots
   */
  getSnapshots(): ConfigurationSnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Validate configuration value
   */
  private validateValue(value: ConfigValueType, validation: NonNullable<ConfigValue['validation']>): boolean {
    if (validation.required && (value === null || value === undefined)) {
      return false;
    }

    if (typeof value === 'number') {
      if (validation.min !== undefined && value < validation.min) return false;
      if (validation.max !== undefined && value > validation.max) return false;
    }

    if (typeof value === 'string') {
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) return false;
      if (validation.enum && !validation.enum.includes(value)) return false;
    }

    return true;
  }

  /**
   * Notify listeners about configuration changes
   */
  private notifyListeners(key: string, value: ConfigValueType | undefined): void {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error(`Error in config listener for ${key}:`, error);
        }
      });
    }
  }

  /**
   * Export configuration as JSON
   */
  exportConfig(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }

  /**
   * Import configuration from JSON
   */
  async importConfig(configJson: string, user: string): Promise<boolean> {
    try {
      const imported = JSON.parse(configJson);

      for (const [key, configValue] of Object.entries(imported)) {
        if (typeof configValue === 'object' && configValue !== null && 'value' in configValue) {
          await this.set(key, (configValue as ConfigValue).value, {
            user,
            reason: 'Configuration import'
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }
}

// Export singleton instance
export const runtimeConfig = new RuntimeConfigManager();

// Utility functions for React components
export function useRuntimeConfig<T = ConfigValueType>(key: string, defaultValue?: T): T {
  if (!React) {
    throw new Error('React is not available. useRuntimeConfig can only be used in React components.');
  }

  const [value, setValue] = React.useState(() => runtimeConfig.get(key, defaultValue));

  React.useEffect(() => {
    const unsubscribe = runtimeConfig.subscribe(key, (newValue) => {
      setValue(newValue as T);
    });

    return unsubscribe;
  }, [key]);

  return value;
}

// Configuration presets for different environments
export const CONFIG_PRESETS = {
  development: {
    'cache.redis.enabled': false,
    'monitoring.error_tracking.enabled': false,
    'security.session_timeout': 3600,
    'performance.auto_save_interval': 10000
  },
  staging: {
    'cache.redis.enabled': true,
    'monitoring.error_tracking.enabled': true,
    'security.session_timeout': 1800,
    'performance.auto_save_interval': 5000
  },
  production: {
    'cache.redis.enabled': true,
    'monitoring.error_tracking.enabled': true,
    'security.session_timeout': 900,
    'performance.auto_save_interval': 3000
  }
};

// Apply environment preset
export function applyEnvironmentPreset(environment: keyof typeof CONFIG_PRESETS, user: string): Promise<boolean[]> {
  const preset = CONFIG_PRESETS[environment];
  return Promise.all(
    Object.entries(preset).map(([key, value]) =>
      runtimeConfig.set(key, value, { user, reason: `Applied ${environment} preset` })
    )
  );
}

// Import React if available (for useRuntimeConfig hook)
let React: any;
try {
  React = require('react');
} catch {
  // React not available, hook will not work
}