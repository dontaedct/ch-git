/**
 * Client Configuration Management System
 * Manages client-specific configurations, settings, and customizations
 */

export interface ClientConfig {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  isActive: boolean;
  configurations: {
    app: AppConfig;
    branding: BrandingConfig;
    features: FeatureConfig;
    integrations: IntegrationConfig;
    security: SecurityConfig;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
    deploymentId?: string;
  };
}

export interface AppConfig {
  name: string;
  description: string;
  domain?: string;
  subdomain?: string;
  customDomain?: string;
  ssl: boolean;
  analytics: {
    enabled: boolean;
    trackingId?: string;
    provider: 'google' | 'mixpanel' | 'amplitude' | 'custom';
  };
  monitoring: {
    enabled: boolean;
    errorTracking: boolean;
    performanceMonitoring: boolean;
  };
}

export interface BrandingConfig {
  logo: {
    url?: string;
    width?: number;
    height?: number;
    alt: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
  typography: {
    primaryFont: string;
    secondaryFont: string;
    headingFont: string;
  };
  theme: 'light' | 'dark' | 'auto';
  customCss?: string;
  favicon?: string;
}

export interface FeatureConfig {
  [featureKey: string]: {
    enabled: boolean;
    config?: any;
    permissions?: string[];
    environments?: string[];
  };
}

export interface IntegrationConfig {
  [integrationKey: string]: {
    enabled: boolean;
    apiKey?: string;
    endpoint?: string;
    config: any;
    webhooks?: {
      url: string;
      events: string[];
      secret?: string;
    }[];
  };
}

export interface SecurityConfig {
  authentication: {
    provider: 'supabase' | 'auth0' | 'custom';
    enableMfa: boolean;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
  };
  authorization: {
    rbac: boolean;
    defaultRole: string;
    customRoles?: string[];
  };
  rateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
  };
  cors: {
    enabled: boolean;
    allowedOrigins: string[];
    allowedMethods: string[];
    allowCredentials: boolean;
  };
}

export class ClientConfigManager {
  private configs: Map<string, ClientConfig> = new Map();
  private validators: Map<string, (config: any) => boolean> = new Map();

  constructor() {
    this.setupDefaultValidators();
  }

  /**
   * Create a new client configuration
   */
  async createConfig(clientId: string, config: Partial<ClientConfig>): Promise<ClientConfig> {
    const newConfig: ClientConfig = {
      id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientId,
      name: config.name || `${clientId} Configuration`,
      description: config.description,
      environment: config.environment || 'development',
      version: '1.0.0',
      isActive: config.isActive ?? true,
      configurations: {
        app: config.configurations?.app || this.getDefaultAppConfig(),
        branding: config.configurations?.branding || this.getDefaultBrandingConfig(),
        features: config.configurations?.features || {},
        integrations: config.configurations?.integrations || {},
        security: config.configurations?.security || this.getDefaultSecurityConfig(),
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        lastModifiedBy: 'system',
        deploymentId: config.metadata?.deploymentId,
      },
    };

    // Validate configuration
    if (!this.validateConfig(newConfig)) {
      throw new Error('Invalid configuration provided');
    }

    this.configs.set(newConfig.id, newConfig);
    await this.persistConfig(newConfig);

    return newConfig;
  }

  /**
   * Get configuration by ID
   */
  async getConfig(configId: string): Promise<ClientConfig | null> {
    let config = this.configs.get(configId);

    if (!config) {
      config = await this.loadConfig(configId);
      if (config) {
        this.configs.set(configId, config);
      }
    }

    return config || null;
  }

  /**
   * Get configuration by client ID
   */
  async getConfigByClientId(clientId: string, environment?: string): Promise<ClientConfig | null> {
    // First check in-memory configs
    for (const config of this.configs.values()) {
      if (config.clientId === clientId && (!environment || config.environment === environment)) {
        return config;
      }
    }

    // Load from database
    const config = await this.loadConfigByClientId(clientId, environment);
    if (config) {
      this.configs.set(config.id, config);
    }

    return config;
  }

  /**
   * Update configuration
   */
  async updateConfig(configId: string, updates: Partial<ClientConfig>): Promise<ClientConfig | null> {
    const existingConfig = await this.getConfig(configId);
    if (!existingConfig) {
      throw new Error(`Configuration ${configId} not found`);
    }

    const updatedConfig: ClientConfig = {
      ...existingConfig,
      ...updates,
      configurations: {
        ...existingConfig.configurations,
        ...updates.configurations,
      },
      metadata: {
        ...existingConfig.metadata,
        updatedAt: new Date(),
        lastModifiedBy: updates.metadata?.lastModifiedBy || 'system',
      },
    };

    // Validate updated configuration
    if (!this.validateConfig(updatedConfig)) {
      throw new Error('Invalid configuration update');
    }

    this.configs.set(configId, updatedConfig);
    await this.persistConfig(updatedConfig);

    return updatedConfig;
  }

  /**
   * Delete configuration
   */
  async deleteConfig(configId: string): Promise<boolean> {
    const config = await this.getConfig(configId);
    if (!config) {
      return false;
    }

    this.configs.delete(configId);
    await this.removePersistedConfig(configId);

    return true;
  }

  /**
   * Clone configuration
   */
  async cloneConfig(configId: string, newClientId: string, name?: string): Promise<ClientConfig> {
    const sourceConfig = await this.getConfig(configId);
    if (!sourceConfig) {
      throw new Error(`Source configuration ${configId} not found`);
    }

    const clonedConfig = {
      ...sourceConfig,
      name: name || `${sourceConfig.name} (Copy)`,
      clientId: newClientId,
      metadata: undefined, // Reset metadata
    };

    return await this.createConfig(newClientId, clonedConfig);
  }

  /**
   * Get all configurations for a client
   */
  async getClientConfigs(clientId: string): Promise<ClientConfig[]> {
    const configs = await this.loadClientConfigs(clientId);

    // Update in-memory cache
    configs.forEach(config => {
      this.configs.set(config.id, config);
    });

    return configs;
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: ClientConfig): boolean {
    try {
      // Basic validation
      if (!config.clientId || !config.name) {
        return false;
      }

      // Validate app config
      if (!this.validateAppConfig(config.configurations.app)) {
        return false;
      }

      // Validate branding config
      if (!this.validateBrandingConfig(config.configurations.branding)) {
        return false;
      }

      // Validate security config
      if (!this.validateSecurityConfig(config.configurations.security)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Configuration validation error:', error);
      return false;
    }
  }

  /**
   * Setup default validators
   */
  private setupDefaultValidators(): void {
    this.validators.set('app', this.validateAppConfig.bind(this));
    this.validators.set('branding', this.validateBrandingConfig.bind(this));
    this.validators.set('security', this.validateSecurityConfig.bind(this));
  }

  /**
   * Validate app configuration
   */
  private validateAppConfig(config: AppConfig): boolean {
    return !!(config.name && config.description);
  }

  /**
   * Validate branding configuration
   */
  private validateBrandingConfig(config: BrandingConfig): boolean {
    return !!(
      config.colors &&
      config.colors.primary &&
      config.colors.background &&
      config.typography &&
      config.typography.primaryFont
    );
  }

  /**
   * Validate security configuration
   */
  private validateSecurityConfig(config: SecurityConfig): boolean {
    return !!(
      config.authentication &&
      config.authentication.provider &&
      config.authorization
    );
  }

  /**
   * Get default app configuration
   */
  private getDefaultAppConfig(): AppConfig {
    return {
      name: 'Client App',
      description: 'Custom client application',
      ssl: true,
      analytics: {
        enabled: false,
        provider: 'google',
      },
      monitoring: {
        enabled: true,
        errorTracking: true,
        performanceMonitoring: true,
      },
    };
  }

  /**
   * Get default branding configuration
   */
  private getDefaultBrandingConfig(): BrandingConfig {
    return {
      logo: {
        alt: 'Client Logo',
      },
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#ffffff',
        text: '#1f2937',
        border: '#e5e7eb',
      },
      typography: {
        primaryFont: 'Inter',
        secondaryFont: 'Inter',
        headingFont: 'Inter',
      },
      theme: 'light',
    };
  }

  /**
   * Get default security configuration
   */
  private getDefaultSecurityConfig(): SecurityConfig {
    return {
      authentication: {
        provider: 'supabase',
        enableMfa: false,
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: false,
        },
      },
      authorization: {
        rbac: true,
        defaultRole: 'user',
      },
      rateLimit: {
        enabled: true,
        requestsPerMinute: 60,
        burstLimit: 120,
      },
      cors: {
        enabled: true,
        allowedOrigins: ['*'],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowCredentials: false,
      },
    };
  }

  /**
   * Persist configuration to database
   */
  private async persistConfig(config: ClientConfig): Promise<void> {
    // TODO: Implement database persistence
    console.log('Persisting config:', config.id);
  }

  /**
   * Load configuration from database
   */
  private async loadConfig(configId: string): Promise<ClientConfig | null> {
    // TODO: Implement database loading
    console.log('Loading config:', configId);
    return null;
  }

  /**
   * Load configuration by client ID
   */
  private async loadConfigByClientId(clientId: string, environment?: string): Promise<ClientConfig | null> {
    // TODO: Implement database loading by client ID
    console.log('Loading config for client:', clientId, environment);
    return null;
  }

  /**
   * Load all configurations for a client
   */
  private async loadClientConfigs(clientId: string): Promise<ClientConfig[]> {
    // TODO: Implement database loading for client configs
    console.log('Loading configs for client:', clientId);
    return [];
  }

  /**
   * Remove persisted configuration
   */
  private async removePersistedConfig(configId: string): Promise<void> {
    // TODO: Implement database deletion
    console.log('Removing config:', configId);
  }
}

// Export singleton instance
export const clientConfigManager = new ClientConfigManager();