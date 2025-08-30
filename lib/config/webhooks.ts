/**
 * Webhook Configuration System
 * 
 * Provides configurable webhook endpoints with HMAC signing
 * and exponential backoff for n8n emitters
 */

export interface WebhookEndpointConfig {
  /** Webhook endpoint URL */
  url: string;
  /** Secret key for HMAC signing */
  secret: string;
  /** Header name for signature (e.g., 'X-Hub-Signature-256') */
  signatureHeader?: string;
  /** Signature prefix (e.g., 'sha256=') */
  signaturePrefix?: string;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Base delay for exponential backoff (ms) */
  baseDelayMs?: number;
  /** Maximum delay cap (ms) */
  maxDelayMs?: number;
  /** Timeout for webhook request (ms) */
  timeoutMs?: number;
}

export interface WebhookEventConfig {
  /** Event name/type */
  eventType: string;
  /** Whether this event is enabled */
  enabled: boolean;
  /** Endpoints to send this event to */
  endpoints: string[];
  /** Payload transformation settings */
  payload: {
    /** Include timestamp */
    includeTimestamp: boolean;
    /** Include session ID */
    includeSessionId: boolean;
    /** Include user ID if available */
    includeUserId: boolean;
    /** Additional static fields to include */
    staticFields?: Record<string, string>;
  };
}

export interface WebhookConfig {
  /** Named webhook endpoints */
  endpoints: Record<string, WebhookEndpointConfig>;
  /** Event configurations */
  events: Record<string, WebhookEventConfig>;
  /** Global settings */
  global: {
    /** Default timeout (ms) */
    defaultTimeoutMs: number;
    /** Default max retries */
    defaultMaxRetries: number;
    /** Default HMAC algorithm */
    hmacAlgorithm: 'sha256' | 'sha1';
    /** User agent for webhook requests */
    userAgent: string;
  };
}

// Default webhook configuration
export const DEFAULT_WEBHOOK_CONFIG: WebhookConfig = {
  endpoints: {
    n8n_primary: {
      url: process.env.N8N_WEBHOOK_URL ?? '',
      secret: process.env.N8N_WEBHOOK_SECRET ?? '',
      signatureHeader: 'X-Hub-Signature-256',
      signaturePrefix: 'sha256=',
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      timeoutMs: 10000
    }
  },
  events: {
    lead_started_questionnaire: {
      eventType: 'lead_started_questionnaire',
      enabled: true,
      endpoints: ['n8n_primary'],
      payload: {
        includeTimestamp: true,
        includeSessionId: true,
        includeUserId: true
      }
    },
    lead_completed_questionnaire: {
      eventType: 'lead_completed_questionnaire',
      enabled: true,
      endpoints: ['n8n_primary'],
      payload: {
        includeTimestamp: true,
        includeSessionId: true,
        includeUserId: true
      }
    },
    consultation_generated: {
      eventType: 'consultation_generated',
      enabled: true,
      endpoints: ['n8n_primary'],
      payload: {
        includeTimestamp: true,
        includeSessionId: true,
        includeUserId: true
      }
    },
    pdf_downloaded: {
      eventType: 'pdf_downloaded',
      enabled: true,
      endpoints: ['n8n_primary'],
      payload: {
        includeTimestamp: true,
        includeSessionId: true,
        includeUserId: true
      }
    },
    email_copy_requested: {
      eventType: 'email_copy_requested',
      enabled: true,
      endpoints: ['n8n_primary'],
      payload: {
        includeTimestamp: true,
        includeSessionId: true,
        includeUserId: true
      }
    }
  },
  global: {
    defaultTimeoutMs: 10000,
    defaultMaxRetries: 3,
    hmacAlgorithm: 'sha256',
    userAgent: 'OSS-Hero-Webhooks/1.0'
  }
};

/**
 * Load webhook configuration from environment variables and config
 */
export function loadWebhookConfig(): WebhookConfig {
  const config = { ...DEFAULT_WEBHOOK_CONFIG };
  
  // Override with environment variables if present
  if (process.env.N8N_WEBHOOK_URL) {
    config.endpoints.n8n_primary.url = process.env.N8N_WEBHOOK_URL;
  }
  
  if (process.env.N8N_WEBHOOK_SECRET) {
    config.endpoints.n8n_primary.secret = process.env.N8N_WEBHOOK_SECRET;
  }
  
  // Override timeout from environment
  if (process.env.N8N_WEBHOOK_TIMEOUT) {
    const timeout = parseInt(process.env.N8N_WEBHOOK_TIMEOUT, 10);
    if (!isNaN(timeout)) {
      config.endpoints.n8n_primary.timeoutMs = timeout;
      config.global.defaultTimeoutMs = timeout;
    }
  }
  
  // Override max retries from environment
  if (process.env.N8N_WEBHOOK_MAX_RETRIES) {
    const maxRetries = parseInt(process.env.N8N_WEBHOOK_MAX_RETRIES, 10);
    if (!isNaN(maxRetries)) {
      config.endpoints.n8n_primary.maxRetries = maxRetries;
      config.global.defaultMaxRetries = maxRetries;
    }
  }
  
  return config;
}

/**
 * Get configuration for a specific event
 */
export function getEventConfig(eventType: string): WebhookEventConfig | null {
  const config = loadWebhookConfig();
  return config.events[eventType] ?? null;
}

/**
 * Get configuration for a specific endpoint
 */
export function getEndpointConfig(endpointName: string): WebhookEndpointConfig | null {
  const config = loadWebhookConfig();
  return config.endpoints[endpointName] || null;
}

/**
 * Check if an event is enabled
 */
export function isEventEnabled(eventType: string): boolean {
  const eventConfig = getEventConfig(eventType);
  return eventConfig?.enabled ?? false;
}

/**
 * Get all endpoints for a given event
 */
export function getEventEndpoints(eventType: string): WebhookEndpointConfig[] {
  const config = loadWebhookConfig();
  const eventConfig = config.events[eventType];
  
  if (!eventConfig?.enabled) {
    return [];
  }
  
  return eventConfig.endpoints
    .map(endpointName => config.endpoints[endpointName])
    .filter(Boolean);
}