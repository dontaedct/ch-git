/**
 * Runtime Configuration System
 * Manages dynamic configuration that can be changed at runtime without deployment
 */

export interface RuntimeConfig {
  id: string;
  clientId: string;
  environment: string;
  namespace: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description?: string;
  isSecret: boolean;
  isReadOnly: boolean;
  validation?: {
    required: boolean;
    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    allowedValues?: any[];
    customValidator?: string;
  };
  cache?: {
    enabled: boolean;
    ttl: number; // Time to live in seconds
    lastCached?: Date;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
    version: number;
    changeHistory: ConfigChange[];
  };
}

export interface ConfigChange {
  timestamp: Date;
  changedBy: string;
  oldValue: any;
  newValue: any;
  reason?: string;
}

export interface ConfigNamespace {
  name: string;
  description: string;
  clientId: string;
  environment: string;
  configs: Map<string, RuntimeConfig>;
  permissions: {
    read: string[];
    write: string[];
    admin: string[];
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: number;
  };
}

export interface ConfigWatch {
  id: string;
  configKey: string;
  callback: (oldValue: any, newValue: any, config: RuntimeConfig) => void;
  clientId?: string;
  environment?: string;
  namespace?: string;
}

export class RuntimeConfigManager {
  private configs: Map<string, RuntimeConfig> = new Map();
  private namespaces: Map<string, ConfigNamespace> = new Map();
  private watchers: Map<string, ConfigWatch[]> = new Map();
  private cache: Map<string, { value: any; expiry: Date }> = new Map();
  private refreshInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startRefreshTimer();
  }

  /**
   * Create runtime configuration
   */
  async createConfig(config: Omit<RuntimeConfig, 'id' | 'metadata'>): Promise<RuntimeConfig> {
    const newConfig: RuntimeConfig = {
      ...config,
      id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        lastModifiedBy: 'system',
        version: 1,
        changeHistory: [],
      },
    };

    // Validate configuration
    if (!this.validateConfig(newConfig)) {
      throw new Error('Invalid runtime configuration');
    }

    const configKey = this.getConfigKey(newConfig);
    this.configs.set(configKey, newConfig);

    // Add to namespace
    await this.addToNamespace(newConfig);

    // Persist configuration
    await this.persistConfig(newConfig);

    return newConfig;
  }

  /**
   * Get runtime configuration
   */
  async getConfig(
    key: string,
    clientId: string,
    environment: string,
    namespace: string = 'default'
  ): Promise<RuntimeConfig | null> {
    const configKey = this.buildConfigKey(clientId, environment, namespace, key);

    // Check cache first
    if (this.isCacheEnabled(configKey)) {
      const cached = this.getCachedValue(configKey);
      if (cached !== undefined) {
        const config = this.configs.get(configKey);
        return config ? { ...config, value: cached } : null;
      }
    }

    let config = this.configs.get(configKey);

    if (!config) {
      config = await this.loadConfig(key, clientId, environment, namespace);
      if (config) {
        this.configs.set(configKey, config);
      }
    }

    // Cache the value if caching is enabled
    if (config && this.isCacheEnabled(configKey)) {
      this.setCachedValue(configKey, config.value, config.cache?.ttl || 300);
    }

    return config || null;
  }

  /**
   * Get configuration value directly
   */
  async getValue<T = any>(
    key: string,
    clientId: string,
    environment: string,
    namespace: string = 'default',
    defaultValue?: T
  ): Promise<T> {
    const config = await this.getConfig(key, clientId, environment, namespace);
    return config ? config.value : defaultValue;
  }

  /**
   * Update runtime configuration
   */
  async updateConfig(
    key: string,
    clientId: string,
    environment: string,
    namespace: string,
    value: any,
    updatedBy: string = 'system',
    reason?: string
  ): Promise<RuntimeConfig | null> {
    const configKey = this.buildConfigKey(clientId, environment, namespace, key);
    const existingConfig = await this.getConfig(key, clientId, environment, namespace);

    if (!existingConfig) {
      throw new Error(`Configuration ${key} not found`);
    }

    if (existingConfig.isReadOnly) {
      throw new Error(`Configuration ${key} is read-only`);
    }

    // Validate new value
    if (!this.validateValue(value, existingConfig)) {
      throw new Error(`Invalid value for configuration ${key}`);
    }

    const oldValue = existingConfig.value;

    // Create change history entry
    const change: ConfigChange = {
      timestamp: new Date(),
      changedBy: updatedBy,
      oldValue,
      newValue: value,
      reason,
    };

    const updatedConfig: RuntimeConfig = {
      ...existingConfig,
      value,
      metadata: {
        ...existingConfig.metadata,
        updatedAt: new Date(),
        lastModifiedBy: updatedBy,
        version: existingConfig.metadata.version + 1,
        changeHistory: [...existingConfig.metadata.changeHistory, change],
      },
    };

    this.configs.set(configKey, updatedConfig);

    // Clear cache
    this.clearCachedValue(configKey);

    // Notify watchers
    this.notifyWatchers(key, oldValue, value, updatedConfig);

    // Persist configuration
    await this.persistConfig(updatedConfig);

    return updatedConfig;
  }

  /**
   * Delete runtime configuration
   */
  async deleteConfig(
    key: string,
    clientId: string,
    environment: string,
    namespace: string = 'default'
  ): Promise<boolean> {
    const configKey = this.buildConfigKey(clientId, environment, namespace, key);
    const config = this.configs.get(configKey);

    if (!config) {
      return false;
    }

    if (config.isReadOnly) {
      throw new Error(`Configuration ${key} is read-only and cannot be deleted`);
    }

    this.configs.delete(configKey);
    this.clearCachedValue(configKey);

    // Remove from namespace
    await this.removeFromNamespace(config);

    // Remove from persistence
    await this.removePersistedConfig(config.id);

    return true;
  }

  /**
   * Get all configurations for a namespace
   */
  async getNamespaceConfigs(
    clientId: string,
    environment: string,
    namespace: string = 'default'
  ): Promise<RuntimeConfig[]> {
    const namespaceKey = this.buildNamespaceKey(clientId, environment, namespace);
    const ns = this.namespaces.get(namespaceKey);

    if (!ns) {
      return [];
    }

    return Array.from(ns.configs.values());
  }

  /**
   * Create namespace
   */
  async createNamespace(
    name: string,
    clientId: string,
    environment: string,
    description: string = '',
    permissions?: ConfigNamespace['permissions']
  ): Promise<ConfigNamespace> {
    const namespaceKey = this.buildNamespaceKey(clientId, environment, name);

    if (this.namespaces.has(namespaceKey)) {
      throw new Error(`Namespace ${name} already exists`);
    }

    const namespace: ConfigNamespace = {
      name,
      description,
      clientId,
      environment,
      configs: new Map(),
      permissions: permissions || {
        read: ['*'],
        write: ['admin'],
        admin: ['admin'],
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      },
    };

    this.namespaces.set(namespaceKey, namespace);
    await this.persistNamespace(namespace);

    return namespace;
  }

  /**
   * Watch configuration changes
   */
  watch(
    configKey: string,
    callback: (oldValue: any, newValue: any, config: RuntimeConfig) => void,
    options?: {
      clientId?: string;
      environment?: string;
      namespace?: string;
    }
  ): string {
    const watchId = `watch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const watch: ConfigWatch = {
      id: watchId,
      configKey,
      callback,
      clientId: options?.clientId,
      environment: options?.environment,
      namespace: options?.namespace,
    };

    const watchKey = this.buildWatchKey(configKey, options);
    if (!this.watchers.has(watchKey)) {
      this.watchers.set(watchKey, []);
    }

    this.watchers.get(watchKey)!.push(watch);

    return watchId;
  }

  /**
   * Unwatch configuration changes
   */
  unwatch(watchId: string): boolean {
    for (const [watchKey, watches] of this.watchers.entries()) {
      const index = watches.findIndex(w => w.id === watchId);
      if (index !== -1) {
        watches.splice(index, 1);
        if (watches.length === 0) {
          this.watchers.delete(watchKey);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Bulk update configurations
   */
  async bulkUpdate(
    updates: Array<{
      key: string;
      clientId: string;
      environment: string;
      namespace?: string;
      value: any;
    }>,
    updatedBy: string = 'system',
    reason?: string
  ): Promise<RuntimeConfig[]> {
    const results: RuntimeConfig[] = [];

    for (const update of updates) {
      try {
        const config = await this.updateConfig(
          update.key,
          update.clientId,
          update.environment,
          update.namespace || 'default',
          update.value,
          updatedBy,
          reason
        );
        if (config) {
          results.push(config);
        }
      } catch (error) {
        console.error(`Failed to update config ${update.key}:`, error);
        // Continue with other updates
      }
    }

    return results;
  }

  /**
   * Export configurations
   */
  async exportConfigs(
    clientId: string,
    environment: string,
    namespace?: string,
    format: 'json' | 'yaml' | 'env' = 'json'
  ): Promise<string> {
    const configs = namespace
      ? await this.getNamespaceConfigs(clientId, environment, namespace)
      : await this.getAllClientConfigs(clientId, environment);

    switch (format) {
      case 'yaml':
        return this.convertToYaml(configs);
      case 'env':
        return this.convertToEnv(configs);
      case 'json':
      default:
        return JSON.stringify(
          configs.reduce((acc, config) => {
            acc[config.key] = config.value;
            return acc;
          }, {} as Record<string, any>),
          null,
          2
        );
    }
  }

  /**
   * Import configurations
   */
  async importConfigs(
    clientId: string,
    environment: string,
    namespace: string,
    data: string,
    format: 'json' | 'yaml' | 'env' = 'json',
    overwrite: boolean = false
  ): Promise<RuntimeConfig[]> {
    let parsedData: Record<string, any>;

    switch (format) {
      case 'yaml':
        parsedData = this.parseYaml(data);
        break;
      case 'env':
        parsedData = this.parseEnv(data);
        break;
      case 'json':
      default:
        parsedData = JSON.parse(data);
    }

    const results: RuntimeConfig[] = [];

    for (const [key, value] of Object.entries(parsedData)) {
      try {
        const existingConfig = await this.getConfig(key, clientId, environment, namespace);

        if (existingConfig && !overwrite) {
          console.warn(`Config ${key} already exists, skipping`);
          continue;
        }

        let config: RuntimeConfig;
        if (existingConfig) {
          config = await this.updateConfig(key, clientId, environment, namespace, value, 'import');
        } else {
          config = await this.createConfig({
            clientId,
            environment,
            namespace,
            key,
            value,
            type: this.inferType(value),
            isSecret: false,
            isReadOnly: false,
          });
        }

        if (config) {
          results.push(config);
        }
      } catch (error) {
        console.error(`Failed to import config ${key}:`, error);
      }
    }

    return results;
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: RuntimeConfig): boolean {
    if (!config.key || !config.clientId || !config.environment) {
      return false;
    }

    return this.validateValue(config.value, config);
  }

  /**
   * Validate configuration value
   */
  private validateValue(value: any, config: RuntimeConfig): boolean {
    if (!config.validation) {
      return true;
    }

    const { validation } = config;

    if (validation.required && (value === null || value === undefined)) {
      return false;
    }

    if (typeof value === 'string') {
      if (validation.minLength && value.length < validation.minLength) return false;
      if (validation.maxLength && value.length > validation.maxLength) return false;
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) return false;
    }

    if (typeof value === 'number') {
      if (validation.minValue && value < validation.minValue) return false;
      if (validation.maxValue && value > validation.maxValue) return false;
    }

    if (validation.allowedValues && !validation.allowedValues.includes(value)) {
      return false;
    }

    return true;
  }

  /**
   * Notify watchers of configuration changes
   */
  private notifyWatchers(key: string, oldValue: any, newValue: any, config: RuntimeConfig): void {
    const watchKey = this.buildWatchKey(key, {
      clientId: config.clientId,
      environment: config.environment,
      namespace: config.namespace,
    });

    const watches = this.watchers.get(watchKey) || [];
    watches.forEach(watch => {
      try {
        watch.callback(oldValue, newValue, config);
      } catch (error) {
        console.error('Error in config watcher:', error);
      }
    });
  }

  /**
   * Check if caching is enabled for configuration
   */
  private isCacheEnabled(configKey: string): boolean {
    const config = this.configs.get(configKey);
    return config?.cache?.enabled || false;
  }

  /**
   * Get cached value
   */
  private getCachedValue(configKey: string): any {
    const cached = this.cache.get(configKey);
    if (cached && cached.expiry > new Date()) {
      return cached.value;
    }
    this.cache.delete(configKey);
    return undefined;
  }

  /**
   * Set cached value
   */
  private setCachedValue(configKey: string, value: any, ttl: number): void {
    const expiry = new Date(Date.now() + ttl * 1000);
    this.cache.set(configKey, { value, expiry });
  }

  /**
   * Clear cached value
   */
  private clearCachedValue(configKey: string): void {
    this.cache.delete(configKey);
  }

  /**
   * Build configuration key
   */
  private buildConfigKey(clientId: string, environment: string, namespace: string, key: string): string {
    return `${clientId}:${environment}:${namespace}:${key}`;
  }

  /**
   * Build namespace key
   */
  private buildNamespaceKey(clientId: string, environment: string, namespace: string): string {
    return `${clientId}:${environment}:${namespace}`;
  }

  /**
   * Build watch key
   */
  private buildWatchKey(configKey: string, options?: { clientId?: string; environment?: string; namespace?: string }): string {
    return `${configKey}:${options?.clientId || '*'}:${options?.environment || '*'}:${options?.namespace || '*'}`;
  }

  /**
   * Get configuration key from config object
   */
  private getConfigKey(config: RuntimeConfig): string {
    return this.buildConfigKey(config.clientId, config.environment, config.namespace, config.key);
  }

  /**
   * Infer type from value
   */
  private inferType(value: any): RuntimeConfig['type'] {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') return 'string';
    if (Array.isArray(value)) return 'array';
    return 'json';
  }

  /**
   * Convert configurations to YAML format
   */
  private convertToYaml(configs: RuntimeConfig[]): string {
    // Simple YAML conversion - in production, use a proper YAML library
    return configs
      .map(config => `${config.key}: ${JSON.stringify(config.value)}`)
      .join('\n');
  }

  /**
   * Convert configurations to ENV format
   */
  private convertToEnv(configs: RuntimeConfig[]): string {
    return configs
      .map(config => `${config.key.toUpperCase()}=${config.value}`)
      .join('\n');
  }

  /**
   * Parse YAML data
   */
  private parseYaml(data: string): Record<string, any> {
    // Simple YAML parsing - in production, use a proper YAML library
    const result: Record<string, any> = {};
    const lines = data.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split(':');
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim();
          try {
            result[key.trim()] = JSON.parse(value);
          } catch {
            result[key.trim()] = value;
          }
        }
      }
    }

    return result;
  }

  /**
   * Parse ENV data
   */
  private parseEnv(data: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = data.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          result[key.trim()] = valueParts.join('=').trim();
        }
      }
    }

    return result;
  }

  /**
   * Start refresh timer for cached values
   */
  private startRefreshTimer(): void {
    this.refreshInterval = setInterval(() => {
      const now = new Date();
      for (const [key, cached] of this.cache.entries()) {
        if (cached.expiry <= now) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Add configuration to namespace
   */
  private async addToNamespace(config: RuntimeConfig): Promise<void> {
    const namespaceKey = this.buildNamespaceKey(config.clientId, config.environment, config.namespace);
    let namespace = this.namespaces.get(namespaceKey);

    if (!namespace) {
      namespace = await this.createNamespace(config.namespace, config.clientId, config.environment);
    }

    namespace.configs.set(config.key, config);
    namespace.metadata.updatedAt = new Date();
    await this.persistNamespace(namespace);
  }

  /**
   * Remove configuration from namespace
   */
  private async removeFromNamespace(config: RuntimeConfig): Promise<void> {
    const namespaceKey = this.buildNamespaceKey(config.clientId, config.environment, config.namespace);
    const namespace = this.namespaces.get(namespaceKey);

    if (namespace) {
      namespace.configs.delete(config.key);
      namespace.metadata.updatedAt = new Date();
      await this.persistNamespace(namespace);
    }
  }

  /**
   * Get all configurations for a client
   */
  private async getAllClientConfigs(clientId: string, environment: string): Promise<RuntimeConfig[]> {
    // TODO: Implement database loading for all client configs
    return Array.from(this.configs.values()).filter(
      config => config.clientId === clientId && config.environment === environment
    );
  }

  /**
   * Persistence methods (to be implemented with actual database)
   */
  private async persistConfig(config: RuntimeConfig): Promise<void> {
    // TODO: Implement database persistence
    console.log('Persisting runtime config:', config.id);
  }

  private async loadConfig(key: string, clientId: string, environment: string, namespace: string): Promise<RuntimeConfig | null> {
    // TODO: Implement database loading
    console.log('Loading runtime config:', key, clientId, environment, namespace);
    return null;
  }

  private async removePersistedConfig(configId: string): Promise<void> {
    // TODO: Implement database deletion
    console.log('Removing runtime config:', configId);
  }

  private async persistNamespace(namespace: ConfigNamespace): Promise<void> {
    // TODO: Implement database persistence
    console.log('Persisting namespace:', namespace.name);
  }
}

// Export singleton instance
export const runtimeConfigManager = new RuntimeConfigManager();