/**
 * Third-Party Integration Types
 * 
 * Defines the core types and interfaces for the integration marketplace
 * and third-party service connections.
 */

export interface IntegrationProvider {
  /** Unique provider identifier */
  id: string;
  /** Provider name */
  name: string;
  /** Provider description */
  description: string;
  /** Provider category */
  category: IntegrationCategory;
  /** Provider logo URL */
  logoUrl?: string;
  /** Provider website URL */
  websiteUrl?: string;
  /** Provider documentation URL */
  documentationUrl?: string;
  /** Whether provider is verified */
  verified: boolean;
  /** Provider popularity score */
  popularityScore: number;
  /** Provider status */
  status: 'active' | 'beta' | 'deprecated' | 'coming_soon';
  /** Supported features */
  features: IntegrationFeature[];
  /** Required configuration */
  configuration: IntegrationConfiguration;
  /** Setup instructions */
  setupInstructions: SetupInstruction[];
  /** Pricing information */
  pricing?: IntegrationPricing;
  /** Last updated */
  lastUpdated: string;
}

export type IntegrationCategory = 
  | 'payment'
  | 'email'
  | 'crm'
  | 'analytics'
  | 'social_media'
  | 'automation'
  | 'notification'
  | 'storage'
  | 'communication'
  | 'marketing'
  | 'development'
  | 'security';

export interface IntegrationFeature {
  /** Feature identifier */
  id: string;
  /** Feature name */
  name: string;
  /** Feature description */
  description: string;
  /** Whether feature is available */
  available: boolean;
  /** Feature requirements */
  requirements?: string[];
}

export interface IntegrationConfiguration {
  /** Required environment variables */
  envVars: EnvVarConfig[];
  /** Required API keys */
  apiKeys: ApiKeyConfig[];
  /** Required permissions/scopes */
  permissions: PermissionConfig[];
  /** Webhook configuration */
  webhooks?: WebhookConfig;
  /** OAuth configuration */
  oauth?: OAuthConfig;
  /** Custom settings */
  settings?: SettingConfig[];
}

export interface EnvVarConfig {
  /** Environment variable name */
  name: string;
  /** Variable description */
  description: string;
  /** Whether variable is required */
  required: boolean;
  /** Variable type */
  type: 'string' | 'url' | 'email' | 'number' | 'boolean';
  /** Default value */
  defaultValue?: string;
  /** Validation pattern */
  pattern?: string;
  /** Security level */
  securityLevel: 'public' | 'private' | 'critical';
}

export interface ApiKeyConfig {
  /** API key identifier */
  id: string;
  /** Key name */
  name: string;
  /** Key description */
  description: string;
  /** Whether key is required */
  required: boolean;
  /** Key type */
  type: 'api_key' | 'secret' | 'token' | 'webhook_secret';
  /** Where to obtain the key */
  obtainFrom: string;
  /** Security level */
  securityLevel: 'private' | 'critical';
}

export interface PermissionConfig {
  /** Permission identifier */
  id: string;
  /** Permission name */
  name: string;
  /** Permission description */
  description: string;
  /** Whether permission is required */
  required: boolean;
  /** Permission scope */
  scope: string;
  /** Where to grant permission */
  grantFrom: string;
}

export interface WebhookConfig {
  /** Webhook endpoint URL */
  endpoint: string;
  /** Required headers */
  headers: Record<string, string>;
  /** HMAC configuration */
  hmac: {
    headerName: string;
    signaturePrefix: string;
    algorithm: 'sha256' | 'sha1';
  };
  /** Supported events */
  events: string[];
  /** Sample payload */
  samplePayload: Record<string, unknown>;
}

export interface OAuthConfig {
  /** OAuth authorization URL */
  authorizationUrl: string;
  /** OAuth token URL */
  tokenUrl: string;
  /** Required scopes */
  scopes: string[];
  /** Client ID environment variable */
  clientIdEnvVar: string;
  /** Client secret environment variable */
  clientSecretEnvVar: string;
  /** Redirect URI */
  redirectUri: string;
}

export interface SettingConfig {
  /** Setting identifier */
  id: string;
  /** Setting name */
  name: string;
  /** Setting description */
  description: string;
  /** Setting type */
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  /** Whether setting is required */
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
}

export interface SetupInstruction {
  /** Step number */
  step: number;
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Step type */
  type: 'info' | 'action' | 'verification' | 'warning';
  /** Action URL (if applicable) */
  actionUrl?: string;
  /** Verification endpoint (if applicable) */
  verificationEndpoint?: string;
  /** Expected result */
  expectedResult?: string;
}

export interface IntegrationPricing {
  /** Pricing model */
  model: 'free' | 'freemium' | 'paid' | 'usage_based';
  /** Free tier limits */
  freeTier?: {
    requests: number;
    features: string[];
    limitations: string[];
  };
  /** Paid tier information */
  paidTier?: {
    startingPrice: number;
    currency: string;
    billingPeriod: 'month' | 'year';
    features: string[];
  };
  /** Usage-based pricing */
  usageBased?: {
    unit: string;
    pricePerUnit: number;
    currency: string;
    freeUnits: number;
  };
}

export interface IntegrationInstance {
  /** Instance identifier */
  id: string;
  /** Provider ID */
  providerId: string;
  /** Instance name */
  name: string;
  /** Instance description */
  description?: string;
  /** Configuration values */
  configuration: Record<string, any>;
  /** Instance status */
  status: 'active' | 'inactive' | 'error' | 'pending';
  /** Last health check */
  lastHealthCheck?: string;
  /** Health check status */
  healthStatus?: 'healthy' | 'unhealthy' | 'unknown';
  /** Error message (if any) */
  errorMessage?: string;
  /** Created timestamp */
  createdAt: string;
  /** Updated timestamp */
  updatedAt: string;
  /** Created by user ID */
  createdBy: string;
}

export interface IntegrationTest {
  /** Test identifier */
  id: string;
  /** Provider ID */
  providerId: string;
  /** Test name */
  name: string;
  /** Test description */
  description: string;
  /** Test type */
  type: 'connection' | 'authentication' | 'permissions' | 'webhook' | 'api_call';
  /** Test configuration */
  configuration: Record<string, any>;
  /** Test result */
  result?: {
    success: boolean;
    message: string;
    data?: any;
    timestamp: string;
  };
}

export interface IntegrationUsage {
  /** Usage identifier */
  id: string;
  /** Instance ID */
  instanceId: string;
  /** Usage type */
  type: 'api_call' | 'webhook' | 'data_sync' | 'automation';
  /** Usage count */
  count: number;
  /** Usage period */
  period: 'hour' | 'day' | 'month';
  /** Usage timestamp */
  timestamp: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface IntegrationError {
  /** Error identifier */
  id: string;
  /** Instance ID */
  instanceId: string;
  /** Error type */
  type: 'connection' | 'authentication' | 'permission' | 'rate_limit' | 'api_error';
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** Error details */
  details?: Record<string, any>;
  /** Error timestamp */
  timestamp: string;
  /** Whether error is resolved */
  resolved: boolean;
  /** Resolution timestamp */
  resolvedAt?: string;
}

export interface IntegrationAnalytics {
  /** Analytics period */
  period: {
    start: string;
    end: string;
  };
  /** Total integrations */
  totalIntegrations: number;
  /** Active integrations */
  activeIntegrations: number;
  /** Integration usage by provider */
  usageByProvider: Array<{
    providerId: string;
    providerName: string;
    usage: number;
    errors: number;
  }>;
  /** Most popular providers */
  popularProviders: Array<{
    providerId: string;
    providerName: string;
    installations: number;
    category: IntegrationCategory;
  }>;
  /** Error analysis */
  errorAnalysis: Array<{
    type: string;
    count: number;
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  /** Performance metrics */
  performance: {
    averageResponseTime: number;
    successRate: number;
    uptime: number;
  };
}
