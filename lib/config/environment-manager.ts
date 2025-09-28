/**
 * Environment Variable Management System
 * Manages client-specific environment variables and deployment configurations
 */

export interface EnvironmentVariable {
  key: string;
  value: string;
  description?: string;
  isSecret: boolean;
  environment: string;
  clientId: string;
  isRequired: boolean;
  defaultValue?: string;
  validation?: {
    type: 'string' | 'number' | 'boolean' | 'url' | 'email' | 'json';
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    allowedValues?: string[];
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
  };
}

export interface EnvironmentTemplate {
  id: string;
  name: string;
  description: string;
  variables: EnvironmentVariable[];
  targetEnvironments: string[];
  isDefault: boolean;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
  };
}

export interface EnvironmentConfig {
  clientId: string;
  environment: string;
  variables: Map<string, EnvironmentVariable>;
  buildConfig: {
    framework: 'nextjs' | 'react' | 'vue' | 'svelte';
    buildCommand: string;
    outputDirectory: string;
    installCommand: string;
  };
  deploymentConfig: {
    platform: 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure';
    region: string;
    customDomain?: string;
    ssl: boolean;
    redirects: Array<{
      source: string;
      destination: string;
      permanent: boolean;
    }>;
    headers: Array<{
      source: string;
      headers: Array<{
        key: string;
        value: string;
      }>;
    }>;
  };
}

export class EnvironmentManager {
  private environments: Map<string, EnvironmentConfig> = new Map();
  private templates: Map<string, EnvironmentTemplate> = new Map();
  private encryptionKey: string;

  constructor(encryptionKey?: string) {
    this.encryptionKey = encryptionKey || process.env.ENV_ENCRYPTION_KEY || 'default-key';
    this.initializeDefaultTemplates();
  }

  /**
   * Create environment configuration for client
   */
  async createEnvironment(
    clientId: string,
    environment: string,
    config: Partial<EnvironmentConfig>
  ): Promise<EnvironmentConfig> {
    const envKey = `${clientId}:${environment}`;

    const environmentConfig: EnvironmentConfig = {
      clientId,
      environment,
      variables: new Map(),
      buildConfig: config.buildConfig || this.getDefaultBuildConfig(),
      deploymentConfig: config.deploymentConfig || this.getDefaultDeploymentConfig(),
    };

    // Apply template variables if specified
    if (config.variables) {
      environmentConfig.variables = config.variables;
    }

    this.environments.set(envKey, environmentConfig);
    await this.persistEnvironmentConfig(environmentConfig);

    return environmentConfig;
  }

  /**
   * Get environment configuration
   */
  async getEnvironment(clientId: string, environment: string): Promise<EnvironmentConfig | null> {
    const envKey = `${clientId}:${environment}`;
    let config = this.environments.get(envKey);

    if (!config) {
      config = await this.loadEnvironmentConfig(clientId, environment);
      if (config) {
        this.environments.set(envKey, config);
      }
    }

    return config || null;
  }

  /**
   * Update environment configuration
   */
  async updateEnvironment(
    clientId: string,
    environment: string,
    updates: Partial<EnvironmentConfig>
  ): Promise<EnvironmentConfig | null> {
    const existingConfig = await this.getEnvironment(clientId, environment);
    if (!existingConfig) {
      throw new Error(`Environment ${environment} for client ${clientId} not found`);
    }

    const updatedConfig: EnvironmentConfig = {
      ...existingConfig,
      ...updates,
      variables: updates.variables || existingConfig.variables,
    };

    const envKey = `${clientId}:${environment}`;
    this.environments.set(envKey, updatedConfig);
    await this.persistEnvironmentConfig(updatedConfig);

    return updatedConfig;
  }

  /**
   * Set environment variable
   */
  async setVariable(
    clientId: string,
    environment: string,
    variable: Omit<EnvironmentVariable, 'clientId' | 'environment' | 'metadata'>
  ): Promise<EnvironmentVariable> {
    const config = await this.getEnvironment(clientId, environment);
    if (!config) {
      throw new Error(`Environment ${environment} for client ${clientId} not found`);
    }

    const envVar: EnvironmentVariable = {
      ...variable,
      clientId,
      environment,
      value: variable.isSecret ? await this.encryptValue(variable.value) : variable.value,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        lastModifiedBy: 'system',
      },
    };

    // Validate variable
    if (!this.validateVariable(envVar)) {
      throw new Error(`Invalid environment variable: ${variable.key}`);
    }

    config.variables.set(variable.key, envVar);
    await this.persistEnvironmentConfig(config);

    return envVar;
  }

  /**
   * Get environment variable
   */
  async getVariable(
    clientId: string,
    environment: string,
    key: string,
    decrypt: boolean = false
  ): Promise<EnvironmentVariable | null> {
    const config = await this.getEnvironment(clientId, environment);
    if (!config) {
      return null;
    }

    const variable = config.variables.get(key);
    if (!variable) {
      return null;
    }

    if (decrypt && variable.isSecret) {
      return {
        ...variable,
        value: await this.decryptValue(variable.value),
      };
    }

    return variable;
  }

  /**
   * Delete environment variable
   */
  async deleteVariable(clientId: string, environment: string, key: string): Promise<boolean> {
    const config = await this.getEnvironment(clientId, environment);
    if (!config) {
      return false;
    }

    const deleted = config.variables.delete(key);
    if (deleted) {
      await this.persistEnvironmentConfig(config);
    }

    return deleted;
  }

  /**
   * Get all environment variables for client/environment
   */
  async getVariables(
    clientId: string,
    environment: string,
    includeSecrets: boolean = false
  ): Promise<EnvironmentVariable[]> {
    const config = await this.getEnvironment(clientId, environment);
    if (!config) {
      return [];
    }

    const variables = Array.from(config.variables.values());

    if (includeSecrets) {
      // Decrypt secret values
      const decryptedVariables = await Promise.all(
        variables.map(async (variable) => {
          if (variable.isSecret) {
            return {
              ...variable,
              value: await this.decryptValue(variable.value),
            };
          }
          return variable;
        })
      );
      return decryptedVariables;
    }

    return variables;
  }

  /**
   * Generate .env file content
   */
  async generateEnvFile(
    clientId: string,
    environment: string,
    format: 'dotenv' | 'json' | 'yaml' = 'dotenv'
  ): Promise<string> {
    const variables = await this.getVariables(clientId, environment, true);

    switch (format) {
      case 'json':
        const jsonObj = variables.reduce((acc, variable) => {
          acc[variable.key] = variable.value;
          return acc;
        }, {} as Record<string, string>);
        return JSON.stringify(jsonObj, null, 2);

      case 'yaml':
        return variables
          .map(variable => `${variable.key}: "${variable.value}"`)
          .join('\n');

      case 'dotenv':
      default:
        return variables
          .map(variable => {
            const comment = variable.description ? `# ${variable.description}\n` : '';
            return `${comment}${variable.key}=${variable.value}`;
          })
          .join('\n\n');
    }
  }

  /**
   * Apply environment template
   */
  async applyTemplate(
    clientId: string,
    environment: string,
    templateId: string,
    overrides?: Record<string, string>
  ): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const config = await this.getEnvironment(clientId, environment);
    if (!config) {
      throw new Error(`Environment ${environment} for client ${clientId} not found`);
    }

    // Apply template variables
    for (const templateVar of template.variables) {
      const value = overrides?.[templateVar.key] || templateVar.defaultValue || '';

      if (templateVar.isRequired && !value) {
        throw new Error(`Required variable ${templateVar.key} not provided`);
      }

      await this.setVariable(clientId, environment, {
        ...templateVar,
        value,
      });
    }
  }

  /**
   * Validate environment variable
   */
  private validateVariable(variable: EnvironmentVariable): boolean {
    if (!variable.key || !variable.value) {
      return false;
    }

    if (variable.validation) {
      const { validation } = variable;

      // Type validation
      switch (validation.type) {
        case 'number':
          if (isNaN(Number(variable.value))) return false;
          break;
        case 'boolean':
          if (!['true', 'false', '1', '0'].includes(variable.value.toLowerCase())) return false;
          break;
        case 'url':
          try {
            new URL(variable.value);
          } catch {
            return false;
          }
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(variable.value)) return false;
          break;
        case 'json':
          try {
            JSON.parse(variable.value);
          } catch {
            return false;
          }
          break;
      }

      // Length validation
      if (validation.minLength && variable.value.length < validation.minLength) {
        return false;
      }
      if (validation.maxLength && variable.value.length > validation.maxLength) {
        return false;
      }

      // Pattern validation
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(variable.value)) return false;
      }

      // Allowed values validation
      if (validation.allowedValues && !validation.allowedValues.includes(variable.value)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Encrypt sensitive value
   */
  private async encryptValue(value: string): Promise<string> {
    // Simple base64 encoding for demo - use proper encryption in production
    return Buffer.from(value).toString('base64');
  }

  /**
   * Decrypt sensitive value
   */
  private async decryptValue(encryptedValue: string): Promise<string> {
    // Simple base64 decoding for demo - use proper decryption in production
    return Buffer.from(encryptedValue, 'base64').toString('utf-8');
  }

  /**
   * Get default build configuration
   */
  private getDefaultBuildConfig() {
    return {
      framework: 'nextjs' as const,
      buildCommand: 'npm run build',
      outputDirectory: '.next',
      installCommand: 'npm install',
    };
  }

  /**
   * Get default deployment configuration
   */
  private getDefaultDeploymentConfig() {
    return {
      platform: 'vercel' as const,
      region: 'us-east-1',
      ssl: true,
      redirects: [],
      headers: [],
    };
  }

  /**
   * Initialize default templates
   */
  private initializeDefaultTemplates(): void {
    // Next.js Template
    const nextjsTemplate: EnvironmentTemplate = {
      id: 'nextjs-basic',
      name: 'Next.js Basic',
      description: 'Basic Next.js environment variables',
      targetEnvironments: ['development', 'staging', 'production'],
      isDefault: true,
      variables: [
        {
          key: 'NEXT_PUBLIC_APP_NAME',
          value: '',
          description: 'Public app name',
          isSecret: false,
          environment: '',
          clientId: '',
          isRequired: true,
          defaultValue: 'My App',
          validation: { type: 'string', minLength: 1, maxLength: 50 },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system',
            lastModifiedBy: 'system',
          },
        },
        {
          key: 'NEXT_PUBLIC_API_URL',
          value: '',
          description: 'Public API URL',
          isSecret: false,
          environment: '',
          clientId: '',
          isRequired: true,
          validation: { type: 'url' },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system',
            lastModifiedBy: 'system',
          },
        },
        {
          key: 'DATABASE_URL',
          value: '',
          description: 'Database connection URL',
          isSecret: true,
          environment: '',
          clientId: '',
          isRequired: true,
          validation: { type: 'url' },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system',
            lastModifiedBy: 'system',
          },
        },
      ],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
      },
    };

    this.templates.set(nextjsTemplate.id, nextjsTemplate);
  }

  /**
   * Persist environment configuration
   */
  private async persistEnvironmentConfig(config: EnvironmentConfig): Promise<void> {
    // TODO: Implement database persistence
    console.log('Persisting environment config:', config.clientId, config.environment);
  }

  /**
   * Load environment configuration
   */
  private async loadEnvironmentConfig(clientId: string, environment: string): Promise<EnvironmentConfig | null> {
    // TODO: Implement database loading
    console.log('Loading environment config:', clientId, environment);
    return null;
  }
}

// Export singleton instance
export const environmentManager = new EnvironmentManager();