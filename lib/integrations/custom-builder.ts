/**
 * Custom Integration Builder
 * 
 * Allows users to create custom integrations with external services
 * using a visual interface and configuration system.
 */

import { 
  IntegrationProvider, 
  IntegrationInstance, 
  IntegrationTest,
  IntegrationConfiguration,
  EnvVarConfig,
  ApiKeyConfig,
  PermissionConfig,
  WebhookConfig,
  OAuthConfig,
  SettingConfig,
  SetupInstruction
} from './types';

export interface CustomIntegrationTemplate {
  /** Template ID */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Template category */
  category: string;
  /** Base configuration */
  baseConfiguration: Partial<IntegrationConfiguration>;
  /** Custom fields */
  customFields: CustomField[];
  /** Validation rules */
  validationRules: ValidationRule[];
  /** Generated provider */
  generatedProvider?: IntegrationProvider;
}

export interface CustomField {
  /** Field ID */
  id: string;
  /** Field name */
  name: string;
  /** Field description */
  description: string;
  /** Field type */
  type: 'text' | 'url' | 'email' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea';
  /** Whether field is required */
  required: boolean;
  /** Default value */
  defaultValue?: any;
  /** Available options (for select/multiselect) */
  options?: Array<{ value: string; label: string }>;
  /** Validation rules */
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
  /** Field category */
  category: 'env_var' | 'api_key' | 'permission' | 'setting' | 'webhook' | 'oauth';
}

export interface ValidationRule {
  /** Rule ID */
  id: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Rule type */
  type: 'connection' | 'authentication' | 'permission' | 'api_call' | 'webhook';
  /** Rule configuration */
  configuration: {
    /** HTTP method */
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    /** API endpoint */
    endpoint?: string;
    /** Required headers */
    headers?: Record<string, string>;
    /** Request body template */
    bodyTemplate?: string;
    /** Expected response */
    expectedResponse?: {
      statusCode?: number;
      bodyPattern?: string;
      headers?: Record<string, string>;
    };
    /** Authentication method */
    authMethod?: 'api_key' | 'bearer' | 'basic' | 'oauth' | 'custom';
    /** Auth configuration */
    authConfig?: Record<string, any>;
  };
  /** Success criteria */
  successCriteria: {
    /** Expected status code */
    statusCode?: number;
    /** Expected response body pattern */
    bodyPattern?: string;
    /** Expected response headers */
    headers?: Record<string, string>;
    /** Custom validation function */
    customValidation?: string;
  };
}

export interface IntegrationBuilderState {
  /** Current step */
  currentStep: number;
  /** Total steps */
  totalSteps: number;
  /** Integration name */
  name: string;
  /** Integration description */
  description: string;
  /** Integration category */
  category: string;
  /** Base template */
  baseTemplate?: CustomIntegrationTemplate;
  /** Custom fields */
  customFields: CustomField[];
  /** Validation rules */
  validationRules: ValidationRule[];
  /** Generated configuration */
  generatedConfiguration?: IntegrationConfiguration;
  /** Generated provider */
  generatedProvider?: IntegrationProvider;
  /** Test results */
  testResults: Array<{
    ruleId: string;
    success: boolean;
    message: string;
    data?: any;
  }>;
}

/**
 * Custom Integration Builder Class
 */
export class CustomIntegrationBuilder {
  private state: IntegrationBuilderState;

  constructor() {
    this.state = {
      currentStep: 1,
      totalSteps: 6,
      name: '',
      description: '',
      category: 'automation',
      customFields: [],
      validationRules: [],
      testResults: []
    };
  }

  /**
   * Get current builder state
   */
  getState(): IntegrationBuilderState {
    return { ...this.state };
  }

  /**
   * Update builder state
   */
  updateState(updates: Partial<IntegrationBuilderState>): void {
    this.state = { ...this.state, ...updates };
  }

  /**
   * Set integration basic information
   */
  setBasicInfo(name: string, description: string, category: string): void {
    this.state.name = name;
    this.state.description = description;
    this.state.category = category;
  }

  /**
   * Add a custom field
   */
  addCustomField(field: CustomField): void {
    this.state.customFields.push(field);
  }

  /**
   * Remove a custom field
   */
  removeCustomField(fieldId: string): void {
    this.state.customFields = this.state.customFields.filter(f => f.id !== fieldId);
  }

  /**
   * Update a custom field
   */
  updateCustomField(fieldId: string, updates: Partial<CustomField>): void {
    const index = this.state.customFields.findIndex(f => f.id === fieldId);
    if (index !== -1) {
      this.state.customFields[index] = { ...this.state.customFields[index], ...updates };
    }
  }

  /**
   * Add a validation rule
   */
  addValidationRule(rule: ValidationRule): void {
    this.state.validationRules.push(rule);
  }

  /**
   * Remove a validation rule
   */
  removeValidationRule(ruleId: string): void {
    this.state.validationRules = this.state.validationRules.filter(r => r.id !== ruleId);
  }

  /**
   * Update a validation rule
   */
  updateValidationRule(ruleId: string, updates: Partial<ValidationRule>): void {
    const index = this.state.validationRules.findIndex(r => r.id === ruleId);
    if (index !== -1) {
      this.state.validationRules[index] = { ...this.state.validationRules[index], ...updates };
    }
  }

  /**
   * Generate integration configuration
   */
  generateConfiguration(): IntegrationConfiguration {
    const configuration: IntegrationConfiguration = {
      envVars: [],
      apiKeys: [],
      permissions: [],
      settings: []
    };

    // Process custom fields
    for (const field of this.state.customFields) {
      switch (field.category) {
        case 'env_var':
          configuration.envVars!.push({
            name: field.id.toUpperCase(),
            description: field.description,
            required: field.required,
            type: this.mapFieldTypeToEnvVarType(field.type),
            defaultValue: field.defaultValue,
            pattern: field.validation?.pattern,
            securityLevel: this.determineSecurityLevel(field)
          });
          break;

        case 'api_key':
          configuration.apiKeys!.push({
            id: field.id,
            name: field.name,
            description: field.description,
            required: field.required,
            type: 'api_key',
            obtainFrom: 'Custom Integration Configuration',
            securityLevel: 'critical'
          });
          break;

        case 'permission':
          configuration.permissions!.push({
            id: field.id,
            name: field.name,
            description: field.description,
            required: field.required,
            scope: field.defaultValue || field.id,
            grantFrom: 'External Service Configuration'
          });
          break;

        case 'setting':
          configuration.settings!.push({
            id: field.id,
            name: field.name,
            description: field.description,
            required: field.required,
            type: this.mapFieldTypeToSettingType(field.type),
            defaultValue: field.defaultValue,
            options: field.options,
            validation: field.validation
          });
          break;
      }
    }

    // Add webhook configuration if webhook fields exist
    const webhookFields = this.state.customFields.filter(f => f.category === 'webhook');
    if (webhookFields.length > 0) {
      configuration.webhooks = this.generateWebhookConfig();
    }

    // Add OAuth configuration if OAuth fields exist
    const oauthFields = this.state.customFields.filter(f => f.category === 'oauth');
    if (oauthFields.length > 0) {
      configuration.oauth = this.generateOAuthConfig();
    }

    this.state.generatedConfiguration = configuration;
    return configuration;
  }

  /**
   * Generate integration provider
   */
  generateProvider(): IntegrationProvider {
    const configuration = this.generateConfiguration();
    
    const provider: IntegrationProvider = {
      id: this.generateProviderId(),
      name: this.state.name,
      description: this.state.description,
      category: this.state.category as any,
      verified: false,
      popularityScore: 0,
      status: 'beta',
      features: this.generateFeatures(),
      configuration,
      setupInstructions: this.generateSetupInstructions(),
      lastUpdated: new Date().toISOString()
    };

    this.state.generatedProvider = provider;
    return provider;
  }

  /**
   * Run validation tests
   */
  async runValidationTests(configuration: Record<string, any>): Promise<Array<{
    ruleId: string;
    success: boolean;
    message: string;
    data?: any;
  }>> {
    const results: Array<{
      ruleId: string;
      success: boolean;
      message: string;
      data?: any;
    }> = [];

    for (const rule of this.state.validationRules) {
      try {
        const result = await this.executeValidationRule(rule, configuration);
        results.push({
          ruleId: rule.id,
          success: result.success,
          message: result.message,
          data: result.data
        });
      } catch (error) {
        results.push({
          ruleId: rule.id,
          success: false,
          message: error instanceof Error ? error.message : 'Validation failed',
          data: { error: error }
        });
      }
    }

    this.state.testResults = results;
    return results;
  }

  /**
   * Execute a validation rule
   */
  private async executeValidationRule(
    rule: ValidationRule, 
    configuration: Record<string, any>
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const { method = 'GET', endpoint, headers = {}, bodyTemplate, authMethod, authConfig } = rule.configuration;

    if (!endpoint) {
      return {
        success: false,
        message: 'No endpoint specified for validation rule'
      };
    }

    // Prepare request headers
    const requestHeaders: Record<string, string> = { ...headers };

    // Add authentication
    if (authMethod && authConfig) {
      this.addAuthentication(requestHeaders, authMethod, authConfig, configuration);
    }

    // Prepare request body
    let requestBody: string | undefined;
    if (bodyTemplate && method !== 'GET') {
      requestBody = this.interpolateTemplate(bodyTemplate, configuration);
    }

    try {
      const response = await fetch(endpoint, {
        method,
        headers: requestHeaders,
        body: requestBody
      });

      const responseData = await response.text();
      let parsedData: any;
      try {
        parsedData = JSON.parse(responseData);
      } catch {
        parsedData = responseData;
      }

      // Check success criteria
      const success = this.checkSuccessCriteria(rule.successCriteria, response, parsedData);

      return {
        success,
        message: success ? 'Validation passed' : 'Validation failed',
        data: {
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: parsedData
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Request failed',
        data: { error: error }
      };
    }
  }

  /**
   * Add authentication to request headers
   */
  private addAuthentication(
    headers: Record<string, string>,
    authMethod: string,
    authConfig: Record<string, any>,
    configuration: Record<string, any>
  ): void {
    switch (authMethod) {
      case 'api_key':
        const apiKeyHeader = authConfig.header || 'X-API-Key';
        const apiKeyValue = authConfig.value || configuration[authConfig.key || 'api_key'];
        if (apiKeyValue) {
          headers[apiKeyHeader] = apiKeyValue;
        }
        break;

      case 'bearer':
        const bearerToken = authConfig.value || configuration[authConfig.key || 'access_token'];
        if (bearerToken) {
          headers['Authorization'] = `Bearer ${bearerToken}`;
        }
        break;

      case 'basic':
        const username = authConfig.username || configuration[authConfig.usernameKey || 'username'];
        const password = authConfig.password || configuration[authConfig.passwordKey || 'password'];
        if (username && password) {
          const credentials = btoa(`${username}:${password}`);
          headers['Authorization'] = `Basic ${credentials}`;
        }
        break;

      case 'custom':
        const customHeader = authConfig.header;
        const customValue = authConfig.value || configuration[authConfig.key];
        if (customHeader && customValue) {
          headers[customHeader] = customValue;
        }
        break;
    }
  }

  /**
   * Interpolate template with configuration values
   */
  private interpolateTemplate(template: string, configuration: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return configuration[key] || match;
    });
  }

  /**
   * Check success criteria
   */
  private checkSuccessCriteria(
    criteria: ValidationRule['successCriteria'],
    response: Response,
    responseData: any
  ): boolean {
    // Check status code
    if (criteria.statusCode && response.status !== criteria.statusCode) {
      return false;
    }

    // Check response body pattern
    if (criteria.bodyPattern) {
      const bodyString = typeof responseData === 'string' ? responseData : JSON.stringify(responseData);
      const pattern = new RegExp(criteria.bodyPattern);
      if (!pattern.test(bodyString)) {
        return false;
      }
    }

    // Check response headers
    if (criteria.headers) {
      for (const [header, expectedValue] of Object.entries(criteria.headers)) {
        const actualValue = response.headers.get(header);
        if (actualValue !== expectedValue) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Generate provider ID
   */
  private generateProviderId(): string {
    return this.state.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Generate features based on configuration
   */
  private generateFeatures() {
    const features = [
      {
        id: 'api_integration',
        name: 'API Integration',
        description: 'Connect to external API endpoints',
        available: true
      }
    ];

    if (this.state.customFields.some(f => f.category === 'webhook')) {
      features.push({
        id: 'webhooks',
        name: 'Webhook Support',
        description: 'Receive real-time webhook notifications',
        available: true
      });
    }

    if (this.state.customFields.some(f => f.category === 'oauth')) {
      features.push({
        id: 'oauth',
        name: 'OAuth Authentication',
        description: 'Secure OAuth-based authentication',
        available: true
      });
    }

    return features;
  }

  /**
   * Generate setup instructions
   */
  private generateSetupInstructions(): SetupInstruction[] {
    const instructions: SetupInstruction[] = [
      {
        step: 1,
        title: 'Configure External Service',
        description: 'Set up your external service and obtain required credentials',
        type: 'info'
      },
      {
        step: 2,
        title: 'Add Configuration',
        description: 'Add your service configuration to the integration settings',
        type: 'info'
      },
      {
        step: 3,
        title: 'Test Connection',
        description: 'Run the integration tests to verify everything is working',
        type: 'verification'
      }
    ];

    return instructions;
  }

  /**
   * Generate webhook configuration
   */
  private generateWebhookConfig(): WebhookConfig {
    return {
      endpoint: '/api/webhooks/custom',
      headers: {
        'Content-Type': 'application/json'
      },
      hmac: {
        headerName: 'X-Custom-Signature',
        signaturePrefix: '',
        algorithm: 'sha256'
      },
      events: ['custom.event'],
      samplePayload: {
        event: 'custom.event',
        data: {
          message: 'Custom webhook payload'
        }
      }
    };
  }

  /**
   * Generate OAuth configuration
   */
  private generateOAuthConfig(): OAuthConfig {
    return {
      authorizationUrl: 'https://example.com/oauth/authorize',
      tokenUrl: 'https://example.com/oauth/token',
      scopes: ['read', 'write'],
      clientIdEnvVar: 'CUSTOM_CLIENT_ID',
      clientSecretEnvVar: 'CUSTOM_CLIENT_SECRET',
      redirectUri: '/api/integrations/custom/callback'
    };
  }

  /**
   * Map field type to environment variable type
   */
  private mapFieldTypeToEnvVarType(fieldType: string): 'string' | 'url' | 'email' | 'number' | 'boolean' {
    switch (fieldType) {
      case 'url':
        return 'url';
      case 'email':
        return 'email';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      default:
        return 'string';
    }
  }

  /**
   * Map field type to setting type
   */
  private mapFieldTypeToSettingType(fieldType: string): 'string' | 'number' | 'boolean' | 'select' | 'multiselect' {
    switch (fieldType) {
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'select':
        return 'select';
      case 'multiselect':
        return 'multiselect';
      default:
        return 'string';
    }
  }

  /**
   * Determine security level for field
   */
  private determineSecurityLevel(field: CustomField): 'public' | 'private' | 'critical' {
    if (field.name.toLowerCase().includes('secret') || field.name.toLowerCase().includes('key')) {
      return 'critical';
    }
    if (field.name.toLowerCase().includes('token') || field.name.toLowerCase().includes('password')) {
      return 'critical';
    }
    if (field.name.toLowerCase().includes('url') || field.name.toLowerCase().includes('endpoint')) {
      return 'private';
    }
    return 'public';
  }
}

/**
 * Pre-built integration templates
 */
export const INTEGRATION_TEMPLATES: CustomIntegrationTemplate[] = [
  {
    id: 'rest-api',
    name: 'REST API Integration',
    description: 'Generic REST API integration template',
    category: 'automation',
    baseConfiguration: {
      envVars: [
        {
          name: 'API_BASE_URL',
          description: 'Base URL of the API',
          required: true,
          type: 'url',
          securityLevel: 'private'
        }
      ],
      apiKeys: [
        {
          id: 'api_key',
          name: 'API Key',
          description: 'API key for authentication',
          required: true,
          type: 'api_key',
          obtainFrom: 'API Provider',
          securityLevel: 'critical'
        }
      ]
    },
    customFields: [
      {
        id: 'api_base_url',
        name: 'API Base URL',
        description: 'Base URL of the API endpoint',
        type: 'url',
        required: true,
        category: 'env_var'
      },
      {
        id: 'api_key',
        name: 'API Key',
        description: 'API key for authentication',
        type: 'text',
        required: true,
        category: 'api_key'
      }
    ],
    validationRules: [
      {
        id: 'connection_test',
        name: 'Connection Test',
        description: 'Test connection to the API',
        type: 'connection',
        configuration: {
          method: 'GET',
          endpoint: '{{api_base_url}}/health',
          authMethod: 'api_key',
          authConfig: {
            header: 'X-API-Key',
            key: 'api_key'
          }
        },
        successCriteria: {
          statusCode: 200
        }
      }
    ]
  },
  {
    id: 'webhook-service',
    name: 'Webhook Service Integration',
    description: 'Integration with webhook-based services',
    category: 'automation',
    baseConfiguration: {
      envVars: [
        {
          name: 'WEBHOOK_URL',
          description: 'Webhook endpoint URL',
          required: true,
          type: 'url',
          securityLevel: 'private'
        },
        {
          name: 'WEBHOOK_SECRET',
          description: 'Webhook secret for signature verification',
          required: true,
          type: 'string',
          securityLevel: 'critical'
        }
      ]
    },
    customFields: [
      {
        id: 'webhook_url',
        name: 'Webhook URL',
        description: 'URL of the webhook endpoint',
        type: 'url',
        required: true,
        category: 'env_var'
      },
      {
        id: 'webhook_secret',
        name: 'Webhook Secret',
        description: 'Secret for webhook signature verification',
        type: 'text',
        required: true,
        category: 'env_var'
      }
    ],
    validationRules: [
      {
        id: 'webhook_test',
        name: 'Webhook Test',
        description: 'Test webhook endpoint',
        type: 'webhook',
        configuration: {
          method: 'POST',
          endpoint: '{{webhook_url}}',
          headers: {
            'Content-Type': 'application/json'
          },
          bodyTemplate: '{"test": "webhook", "timestamp": "{{timestamp}}"}'
        },
        successCriteria: {
          statusCode: 200
        }
      }
    ]
  }
];

/**
 * Get integration template by ID
 */
export function getIntegrationTemplate(templateId: string): CustomIntegrationTemplate | undefined {
  return INTEGRATION_TEMPLATES.find(template => template.id === templateId);
}

/**
 * Get all integration templates
 */
export function getAllIntegrationTemplates(): CustomIntegrationTemplate[] {
  return INTEGRATION_TEMPLATES;
}
