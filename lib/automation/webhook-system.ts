/**
 * Advanced Webhook Management System
 * Comprehensive webhook infrastructure for automation triggers and integrations
 */

export interface WebhookEndpoint {
  id: string;
  name: string;
  description: string;
  url: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: 'active' | 'inactive' | 'error' | 'testing';
  authentication: {
    type: 'none' | 'api_key' | 'bearer_token' | 'basic_auth' | 'signature' | 'ip_whitelist';
    config: Record<string, any>;
  };
  headers: Record<string, string>;
  timeout: number;
  retryPolicy: {
    enabled: boolean;
    maxAttempts: number;
    backoffStrategy: 'fixed' | 'exponential' | 'linear';
    baseDelay: number;
    maxDelay: number;
  };
  rateLimit: {
    enabled: boolean;
    requestsPerSecond: number;
    burstLimit: number;
  };
  validation: {
    enabled: boolean;
    schema?: Record<string, any>;
    requiredFields?: string[];
    allowedSources?: string[];
  };
  transformations: Array<{
    id: string;
    type: 'field_mapping' | 'data_filter' | 'format_conversion' | 'enrichment';
    config: Record<string, any>;
    order: number;
  }>;
  destinations: Array<{
    id: string;
    type: 'workflow' | 'webhook' | 'queue' | 'database' | 'email';
    config: Record<string, any>;
    conditions?: Record<string, any>;
  }>;
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgResponseTime: number;
    lastRequest?: Date;
    errorRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface WebhookRequest {
  id: string;
  endpointId: string;
  endpointName: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: any;
  sourceIp: string;
  userAgent: string;
  timestamp: Date;
  processed: boolean;
  processingTime?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';
  response?: {
    statusCode: number;
    headers: Record<string, string>;
    body: any;
  };
  transformedData?: any;
  destinations?: Array<{
    destinationId: string;
    status: 'pending' | 'sent' | 'failed';
    response?: any;
    error?: string;
  }>;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface WebhookEvent {
  id: string;
  type: 'request_received' | 'request_processed' | 'request_failed' | 'endpoint_created' | 'endpoint_updated' | 'endpoint_deleted';
  endpointId: string;
  requestId?: string;
  data: Record<string, any>;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface WebhookSubscription {
  id: string;
  endpointId: string;
  subscriberId: string;
  events: string[];
  callbackUrl: string;
  authentication?: {
    type: string;
    config: Record<string, any>;
  };
  filters?: Record<string, any>;
  active: boolean;
  createdAt: Date;
}

/**
 * Webhook Management System
 */
export class WebhookManager {
  private endpoints: Map<string, WebhookEndpoint>;
  private requests: Map<string, WebhookRequest>;
  private events: Array<WebhookEvent>;
  private subscriptions: Map<string, WebhookSubscription>;
  private processors: Map<string, WebhookProcessor>;

  constructor() {
    this.endpoints = new Map();
    this.requests = new Map();
    this.events = [];
    this.subscriptions = new Map();
    this.processors = new Map();

    this.initializeDefaultProcessors();
  }

  /**
   * Create new webhook endpoint
   */
  async createEndpoint(endpoint: Omit<WebhookEndpoint, 'id' | 'metrics' | 'createdAt' | 'updatedAt'>): Promise<WebhookEndpoint> {
    const newEndpoint: WebhookEndpoint = {
      ...endpoint,
      id: this.generateId(),
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgResponseTime: 0,
        errorRate: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.endpoints.set(newEndpoint.id, newEndpoint);
    await this.emitEvent('endpoint_created', newEndpoint.id, { endpoint: newEndpoint });

    return newEndpoint;
  }

  /**
   * Update webhook endpoint
   */
  async updateEndpoint(id: string, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint | null> {
    const endpoint = this.endpoints.get(id);
    if (!endpoint) return null;

    const updatedEndpoint = {
      ...endpoint,
      ...updates,
      id,
      updatedAt: new Date()
    };

    this.endpoints.set(id, updatedEndpoint);
    await this.emitEvent('endpoint_updated', id, { updates });

    return updatedEndpoint;
  }

  /**
   * Delete webhook endpoint
   */
  async deleteEndpoint(id: string): Promise<boolean> {
    const endpoint = this.endpoints.get(id);
    if (!endpoint) return false;

    this.endpoints.delete(id);
    await this.emitEvent('endpoint_deleted', id, { endpoint });

    return true;
  }

  /**
   * Get endpoint by ID
   */
  getEndpoint(id: string): WebhookEndpoint | null {
    return this.endpoints.get(id) || null;
  }

  /**
   * Get endpoint by path
   */
  getEndpointByPath(path: string, method: string): WebhookEndpoint | null {
    for (const endpoint of this.endpoints.values()) {
      if (endpoint.path === path && endpoint.method === method && endpoint.status === 'active') {
        return endpoint;
      }
    }
    return null;
  }

  /**
   * Get all endpoints
   */
  getAllEndpoints(): WebhookEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  /**
   * Process incoming webhook request
   */
  async processRequest(
    path: string,
    method: string,
    headers: Record<string, string>,
    query: Record<string, string>,
    body: any,
    sourceIp: string
  ): Promise<{ statusCode: number; body: any; headers?: Record<string, string> }> {
    const endpoint = this.getEndpointByPath(path, method);

    if (!endpoint) {
      return {
        statusCode: 404,
        body: { error: 'Webhook endpoint not found' }
      };
    }

    const request: WebhookRequest = {
      id: this.generateId(),
      endpointId: endpoint.id,
      endpointName: endpoint.name,
      method,
      path,
      headers,
      query,
      body,
      sourceIp,
      userAgent: headers['user-agent'] || '',
      timestamp: new Date(),
      processed: false,
      status: 'pending'
    };

    this.requests.set(request.id, request);
    await this.emitEvent('request_received', endpoint.id, { request });

    try {
      // Validate request
      const validationResult = await this.validateRequest(endpoint, request);
      if (!validationResult.valid) {
        request.status = 'rejected';
        request.error = {
          code: 'VALIDATION_FAILED',
          message: validationResult.error || 'Request validation failed'
        };

        await this.updateEndpointMetrics(endpoint.id, false, 0);

        return {
          statusCode: 400,
          body: { error: validationResult.error }
        };
      }

      // Check rate limits
      const rateLimitResult = await this.checkRateLimit(endpoint, sourceIp);
      if (!rateLimitResult.allowed) {
        request.status = 'rejected';
        request.error = {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded'
        };

        return {
          statusCode: 429,
          body: { error: 'Rate limit exceeded' }
        };
      }

      // Authenticate request
      const authResult = await this.authenticateRequest(endpoint, request);
      if (!authResult.authenticated) {
        request.status = 'rejected';
        request.error = {
          code: 'AUTHENTICATION_FAILED',
          message: authResult.error || 'Authentication failed'
        };

        return {
          statusCode: 401,
          body: { error: authResult.error }
        };
      }

      request.status = 'processing';
      const startTime = Date.now();

      // Transform data
      const transformedData = await this.transformData(endpoint, request);
      request.transformedData = transformedData;

      // Process destinations
      const destinationResults = await this.processDestinations(endpoint, request);
      request.destinations = destinationResults;

      const processingTime = Date.now() - startTime;
      request.processingTime = processingTime;
      request.processed = true;
      request.status = 'completed';

      await this.updateEndpointMetrics(endpoint.id, true, processingTime);
      await this.emitEvent('request_processed', endpoint.id, { request });

      const response = {
        statusCode: 200,
        body: {
          success: true,
          requestId: request.id,
          message: 'Webhook processed successfully'
        }
      };

      request.response = response;
      return response;

    } catch (error) {
      const processingTime = Date.now() - new Date(request.timestamp).getTime();
      request.status = 'failed';
      request.error = {
        code: 'PROCESSING_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      };

      await this.updateEndpointMetrics(endpoint.id, false, processingTime);
      await this.emitEvent('request_failed', endpoint.id, { request, error });

      return {
        statusCode: 500,
        body: { error: 'Internal server error' }
      };
    }
  }

  /**
   * Validate webhook request
   */
  private async validateRequest(endpoint: WebhookEndpoint, request: WebhookRequest): Promise<{
    valid: boolean;
    error?: string;
  }> {
    if (!endpoint.validation.enabled) {
      return { valid: true };
    }

    // Check required fields
    if (endpoint.validation.requiredFields) {
      for (const field of endpoint.validation.requiredFields) {
        if (!request.body || !(field in request.body)) {
          return {
            valid: false,
            error: `Required field '${field}' is missing`
          };
        }
      }
    }

    // Check allowed sources
    if (endpoint.validation.allowedSources && endpoint.validation.allowedSources.length > 0) {
      if (!endpoint.validation.allowedSources.includes(request.sourceIp)) {
        return {
          valid: false,
          error: 'Source IP not allowed'
        };
      }
    }

    // Validate against schema if provided
    if (endpoint.validation.schema) {
      const schemaValid = await this.validateAgainstSchema(request.body, endpoint.validation.schema);
      if (!schemaValid.valid) {
        return {
          valid: false,
          error: schemaValid.error
        };
      }
    }

    return { valid: true };
  }

  /**
   * Check rate limits
   */
  private async checkRateLimit(endpoint: WebhookEndpoint, sourceIp: string): Promise<{
    allowed: boolean;
    remaining?: number;
    resetTime?: Date;
  }> {
    if (!endpoint.rateLimit.enabled) {
      return { allowed: true };
    }

    // Simple in-memory rate limiting - in production, use Redis or similar
    const key = `rate_limit:${endpoint.id}:${sourceIp}`;
    const now = Date.now();
    const windowMs = 1000; // 1 second window

    // This is a simplified implementation
    // In a real system, you'd use a proper rate limiting algorithm

    return { allowed: true }; // Simplified for demo
  }

  /**
   * Authenticate webhook request
   */
  private async authenticateRequest(endpoint: WebhookEndpoint, request: WebhookRequest): Promise<{
    authenticated: boolean;
    error?: string;
  }> {
    const { type, config } = endpoint.authentication;

    switch (type) {
      case 'none':
        return { authenticated: true };

      case 'api_key':
        const apiKey = request.headers['x-api-key'] || request.query['api_key'];
        if (!apiKey || apiKey !== config.apiKey) {
          return {
            authenticated: false,
            error: 'Invalid API key'
          };
        }
        return { authenticated: true };

      case 'bearer_token':
        const authHeader = request.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return {
            authenticated: false,
            error: 'Missing or invalid authorization header'
          };
        }
        const token = authHeader.slice(7);
        if (token !== config.token) {
          return {
            authenticated: false,
            error: 'Invalid bearer token'
          };
        }
        return { authenticated: true };

      case 'signature':
        const signature = request.headers['x-signature'] || request.headers['x-hub-signature'];
        if (!signature) {
          return {
            authenticated: false,
            error: 'Missing signature header'
          };
        }

        const isValid = await this.verifySignature(
          JSON.stringify(request.body),
          signature,
          config.secret
        );

        if (!isValid) {
          return {
            authenticated: false,
            error: 'Invalid signature'
          };
        }
        return { authenticated: true };

      case 'ip_whitelist':
        if (!config.allowedIps.includes(request.sourceIp)) {
          return {
            authenticated: false,
            error: 'IP address not whitelisted'
          };
        }
        return { authenticated: true };

      default:
        return {
          authenticated: false,
          error: 'Unknown authentication type'
        };
    }
  }

  /**
   * Transform webhook data
   */
  private async transformData(endpoint: WebhookEndpoint, request: WebhookRequest): Promise<any> {
    let data = request.body;

    for (const transformation of endpoint.transformations.sort((a, b) => a.order - b.order)) {
      const processor = this.processors.get(transformation.type);
      if (processor) {
        data = await processor.process(data, transformation.config);
      }
    }

    return data;
  }

  /**
   * Process webhook destinations
   */
  private async processDestinations(endpoint: WebhookEndpoint, request: WebhookRequest): Promise<Array<{
    destinationId: string;
    status: 'pending' | 'sent' | 'failed';
    response?: any;
    error?: string;
  }>> {
    const results = [];

    for (const destination of endpoint.destinations) {
      try {
        // Check conditions if any
        if (destination.conditions && !this.evaluateConditions(destination.conditions, request.transformedData)) {
          continue;
        }

        const result = await this.processDestination(destination, request.transformedData);
        results.push({
          destinationId: destination.id,
          status: 'sent',
          response: result
        });
      } catch (error) {
        results.push({
          destinationId: destination.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Process individual destination
   */
  private async processDestination(destination: any, data: any): Promise<any> {
    switch (destination.type) {
      case 'webhook':
        return this.sendWebhook(destination.config.url, data, destination.config);

      case 'workflow':
        return this.triggerWorkflow(destination.config.workflowId, data);

      case 'queue':
        return this.enqueueMessage(destination.config.queueName, data);

      case 'database':
        return this.saveToDatabase(destination.config.table, data);

      case 'email':
        return this.sendEmail(destination.config, data);

      default:
        throw new Error(`Unknown destination type: ${destination.type}`);
    }
  }

  /**
   * Send webhook to external URL
   */
  private async sendWebhook(url: string, data: any, config: any): Promise<any> {
    const response = await fetch(url, {
      method: config.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    return response.json().catch(() => ({ status: 'sent' }));
  }

  /**
   * Trigger workflow execution
   */
  private async triggerWorkflow(workflowId: string, data: any): Promise<any> {
    // This would integrate with your workflow engine
    // For now, return a mock response
    return {
      workflowId,
      executionId: this.generateId(),
      status: 'triggered',
      data
    };
  }

  /**
   * Enqueue message to processing queue
   */
  private async enqueueMessage(queueName: string, data: any): Promise<any> {
    // This would integrate with your queue system (Redis, RabbitMQ, etc.)
    return {
      queueName,
      messageId: this.generateId(),
      status: 'enqueued'
    };
  }

  /**
   * Save data to database
   */
  private async saveToDatabase(table: string, data: any): Promise<any> {
    // This would integrate with your database
    return {
      table,
      recordId: this.generateId(),
      status: 'saved'
    };
  }

  /**
   * Send email notification
   */
  private async sendEmail(config: any, data: any): Promise<any> {
    // This would integrate with your email service
    return {
      emailId: this.generateId(),
      to: config.to,
      status: 'sent'
    };
  }

  /**
   * Update endpoint metrics
   */
  private async updateEndpointMetrics(endpointId: string, success: boolean, responseTime: number): Promise<void> {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) return;

    endpoint.metrics.totalRequests++;

    if (success) {
      endpoint.metrics.successfulRequests++;
    } else {
      endpoint.metrics.failedRequests++;
    }

    endpoint.metrics.avgResponseTime =
      (endpoint.metrics.avgResponseTime * (endpoint.metrics.totalRequests - 1) + responseTime) /
      endpoint.metrics.totalRequests;

    endpoint.metrics.errorRate =
      endpoint.metrics.failedRequests / endpoint.metrics.totalRequests;

    endpoint.metrics.lastRequest = new Date();
  }

  /**
   * Emit webhook event
   */
  private async emitEvent(type: string, endpointId: string, data: Record<string, any>): Promise<void> {
    const event: WebhookEvent = {
      id: this.generateId(),
      type: type as any,
      endpointId,
      data,
      timestamp: new Date()
    };

    this.events.push(event);

    // Notify subscribers
    for (const subscription of this.subscriptions.values()) {
      if (subscription.endpointId === endpointId &&
          subscription.events.includes(type) &&
          subscription.active) {
        await this.notifySubscriber(subscription, event);
      }
    }
  }

  /**
   * Notify webhook subscriber
   */
  private async notifySubscriber(subscription: WebhookSubscription, event: WebhookEvent): Promise<void> {
    try {
      await fetch(subscription.callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to notify subscriber:', error);
    }
  }

  /**
   * Initialize default data processors
   */
  private initializeDefaultProcessors(): void {
    this.processors.set('field_mapping', new FieldMappingProcessor());
    this.processors.set('data_filter', new DataFilterProcessor());
    this.processors.set('format_conversion', new FormatConversionProcessor());
    this.processors.set('enrichment', new DataEnrichmentProcessor());
  }

  /**
   * Verify webhook signature
   */
  private async verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
    // Implementation would depend on the signing algorithm (HMAC-SHA256, etc.)
    // This is a simplified version
    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return signature === `sha256=${expectedSignature}`;
  }

  /**
   * Validate data against JSON schema
   */
  private async validateAgainstSchema(data: any, schema: Record<string, any>): Promise<{
    valid: boolean;
    error?: string;
  }> {
    // This would use a JSON schema validator like AJV
    // Simplified implementation for demo
    return { valid: true };
  }

  /**
   * Evaluate destination conditions
   */
  private evaluateConditions(conditions: Record<string, any>, data: any): boolean {
    // Simple condition evaluation - in real implementation, use a proper expression engine
    for (const [field, expectedValue] of Object.entries(conditions)) {
      if (data[field] !== expectedValue) {
        return false;
      }
    }
    return true;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get webhook requests for endpoint
   */
  getRequests(endpointId?: string, limit = 100): WebhookRequest[] {
    const requests = Array.from(this.requests.values());

    let filtered = endpointId
      ? requests.filter(req => req.endpointId === endpointId)
      : requests;

    return filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get webhook events
   */
  getEvents(endpointId?: string, limit = 100): WebhookEvent[] {
    let filtered = endpointId
      ? this.events.filter(event => event.endpointId === endpointId)
      : this.events;

    return filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

/**
 * Data processor interfaces and implementations
 */
interface WebhookProcessor {
  process(data: any, config: Record<string, any>): Promise<any>;
}

class FieldMappingProcessor implements WebhookProcessor {
  async process(data: any, config: Record<string, any>): Promise<any> {
    const { mappings } = config;
    const result: any = {};

    for (const [targetField, sourceField] of Object.entries(mappings)) {
      result[targetField] = this.getNestedValue(data, sourceField as string);
    }

    return result;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

class DataFilterProcessor implements WebhookProcessor {
  async process(data: any, config: Record<string, any>): Promise<any> {
    const { filters } = config;

    for (const filter of filters) {
      if (!this.evaluateFilter(data, filter)) {
        throw new Error(`Data filter failed: ${filter.field} ${filter.operator} ${filter.value}`);
      }
    }

    return data;
  }

  private evaluateFilter(data: any, filter: any): boolean {
    const value = this.getNestedValue(data, filter.field);

    switch (filter.operator) {
      case 'equals': return value === filter.value;
      case 'not_equals': return value !== filter.value;
      case 'contains': return String(value).includes(filter.value);
      case 'greater_than': return Number(value) > Number(filter.value);
      case 'less_than': return Number(value) < Number(filter.value);
      default: return true;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

class FormatConversionProcessor implements WebhookProcessor {
  async process(data: any, config: Record<string, any>): Promise<any> {
    const { conversions } = config;

    const result = { ...data };

    for (const conversion of conversions) {
      const value = this.getNestedValue(result, conversion.field);
      const convertedValue = this.convertValue(value, conversion.from, conversion.to);
      this.setNestedValue(result, conversion.field, convertedValue);
    }

    return result;
  }

  private convertValue(value: any, fromType: string, toType: string): any {
    switch (`${fromType}_to_${toType}`) {
      case 'string_to_number': return Number(value);
      case 'number_to_string': return String(value);
      case 'string_to_date': return new Date(value);
      case 'date_to_string': return value instanceof Date ? value.toISOString() : value;
      case 'string_to_boolean': return Boolean(value) && value !== 'false';
      case 'boolean_to_string': return String(value);
      default: return value;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => current[key] = current[key] || {}, obj);
    target[lastKey] = value;
  }
}

class DataEnrichmentProcessor implements WebhookProcessor {
  async process(data: any, config: Record<string, any>): Promise<any> {
    const result = { ...data };

    for (const enrichment of config.enrichments) {
      switch (enrichment.type) {
        case 'timestamp':
          result[enrichment.field] = new Date().toISOString();
          break;
        case 'uuid':
          result[enrichment.field] = this.generateUUID();
          break;
        case 'ip_geolocation':
          // In real implementation, this would call an IP geolocation service
          result[enrichment.field] = { country: 'US', city: 'New York' };
          break;
        case 'user_agent_parsing':
          // In real implementation, this would parse the user agent
          result[enrichment.field] = { browser: 'Chrome', os: 'Windows' };
          break;
      }
    }

    return result;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// Export singleton instance
export const webhookManager = new WebhookManager();

// Utility functions
export const WebhookUtils = {
  /**
   * Generate webhook URL
   */
  generateWebhookUrl(baseUrl: string, path: string): string {
    return `${baseUrl.replace(/\/$/, '')}/webhook/${path.replace(/^\//, '')}`;
  },

  /**
   * Validate webhook configuration
   */
  validateWebhookConfig(endpoint: Partial<WebhookEndpoint>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!endpoint.name?.trim()) {
      errors.push('Name is required');
    }

    if (!endpoint.path?.trim()) {
      errors.push('Path is required');
    }

    if (!endpoint.method) {
      errors.push('HTTP method is required');
    }

    if (endpoint.timeout && (endpoint.timeout < 1000 || endpoint.timeout > 300000)) {
      errors.push('Timeout must be between 1 and 300 seconds');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Test webhook endpoint
   */
  async testWebhook(url: string, method: string, headers: Record<string, string>, body: any): Promise<{
    success: boolean;
    responseTime: number;
    statusCode?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: method !== 'GET' ? JSON.stringify(body) : undefined
      });

      return {
        success: response.ok,
        responseTime: Date.now() - startTime,
        statusCode: response.status
      };
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};