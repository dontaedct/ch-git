/**
 * n8n Integration & Webhook Connector
 * 
 * Implements n8n webhook integration system with workflow execution,
 * retry logic, and execution history tracking per PRD Section 8 requirements.
 */

import {
  N8nWorkflowDefinition,
  N8nExecution,
  N8nExecutionData,
  WorkflowExecution,
  ExecutionStatus,
  ExecutionMetadata,
  RetryConfig,
  CircuitBreakerConfig,
  OrchestrationError,
  CircuitBreakerOpenError
} from './architecture';

// ============================================================================
// n8n Connector Configuration
// ============================================================================

export interface N8nConnectorConfig {
  baseUrl: string;
  apiKey: string;
  webhookUrl: string;
  timeout: number;
  retryConfig: RetryConfig;
  circuitBreaker: CircuitBreakerConfig;
  enableMetrics: boolean;
}

export interface N8nWebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: Date;
  source: string;
  workflowId: string;
  executionId?: string;
}

export interface N8nExecutionRequest {
  workflowId: string;
  payload: any;
  options?: {
    timeout?: number;
    retryConfig?: RetryConfig;
    correlationId?: string;
    userId?: string;
  };
}

export interface N8nExecutionResponse {
  success: boolean;
  executionId: string;
  workflowId: string;
  status: ExecutionStatus;
  duration: number;
  data?: any;
  error?: string;
}

// ============================================================================
// Circuit Breaker Implementation
// ============================================================================

class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private lastFailureTime = 0;
  private nextAttemptTime = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() < this.nextAttemptTime) {
        throw new CircuitBreakerOpenError('n8n-connector');
      }
      this.state = 'half-open';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'open';
      this.nextAttemptTime = Date.now() + this.config.recoveryTimeoutMs;
    }
  }

  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }
}

// ============================================================================
// n8n Connector Class
// ============================================================================

export class N8nConnector {
  private circuitBreaker: CircuitBreaker;
  private retryConfig: RetryConfig;
  private metrics: Map<string, number> = new Map();

  constructor(private config: N8nConnectorConfig) {
    this.circuitBreaker = new CircuitBreaker(config.circuitBreaker);
    this.retryConfig = config.retryConfig;
  }

  /**
   * Execute n8n workflow
   */
  async executeWorkflow(request: N8nExecutionRequest): Promise<N8nExecutionResponse> {
    const startTime = Date.now();
    
    try {
      return await this.circuitBreaker.execute(async () => {
        return await this.executeWithRetry(async () => {
          return await this.callN8nAPI(request);
        });
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (this.config.enableMetrics) {
        this.recordMetric('execution_failures', 1);
        this.recordMetric('execution_duration', duration);
      }

      return {
        success: false,
        executionId: '',
        workflowId: request.workflowId,
        status: 'failed',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get n8n workflow definition
   */
  async getWorkflow(workflowId: string): Promise<N8nWorkflowDefinition> {
    return await this.circuitBreaker.execute(async () => {
      return await this.executeWithRetry(async () => {
        const response = await this.makeRequest(`/workflows/${workflowId}`);
        return this.parseWorkflowDefinition(response);
      });
    });
  }

  /**
   * Get n8n execution status
   */
  async getExecutionStatus(executionId: string): Promise<N8nExecution> {
    return await this.circuitBreaker.execute(async () => {
      return await this.executeWithRetry(async () => {
        const response = await this.makeRequest(`/executions/${executionId}`);
        return this.parseExecution(response);
      });
    });
  }

  /**
   * List n8n workflows
   */
  async listWorkflows(options?: {
    limit?: number;
    offset?: number;
    active?: boolean;
  }): Promise<N8nWorkflowDefinition[]> {
    return await this.circuitBreaker.execute(async () => {
      return await this.executeWithRetry(async () => {
        const params = new URLSearchParams();
        if (options?.limit) params.append('limit', options.limit.toString());
        if (options?.offset) params.append('offset', options.offset.toString());
        if (options?.active !== undefined) params.append('active', options.active.toString());

        const response = await this.makeRequest(`/workflows?${params.toString()}`);
        return response.data.map((wf: any) => this.parseWorkflowDefinition(wf));
      });
    });
  }

  /**
   * Create n8n workflow
   */
  async createWorkflow(workflow: Partial<N8nWorkflowDefinition>): Promise<N8nWorkflowDefinition> {
    return await this.circuitBreaker.execute(async () => {
      return await this.executeWithRetry(async () => {
        const response = await this.makeRequest('/workflows', {
          method: 'POST',
          body: JSON.stringify(workflow)
        });
        return this.parseWorkflowDefinition(response);
      });
    });
  }

  /**
   * Update n8n workflow
   */
  async updateWorkflow(workflowId: string, updates: Partial<N8nWorkflowDefinition>): Promise<N8nWorkflowDefinition> {
    return await this.circuitBreaker.execute(async () => {
      return await this.executeWithRetry(async () => {
        const response = await this.makeRequest(`/workflows/${workflowId}`, {
          method: 'PUT',
          body: JSON.stringify(updates)
        });
        return this.parseWorkflowDefinition(response);
      });
    });
  }

  /**
   * Delete n8n workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    return await this.circuitBreaker.execute(async () => {
      return await this.executeWithRetry(async () => {
        await this.makeRequest(`/workflows/${workflowId}`, {
          method: 'DELETE'
        });
      });
    });
  }

  /**
   * Activate n8n workflow
   */
  async activateWorkflow(workflowId: string): Promise<void> {
    return await this.circuitBreaker.execute(async () => {
      return await this.executeWithRetry(async () => {
        await this.makeRequest(`/workflows/${workflowId}/activate`, {
          method: 'POST'
        });
      });
    });
  }

  /**
   * Deactivate n8n workflow
   */
  async deactivateWorkflow(workflowId: string): Promise<void> {
    return await this.circuitBreaker.execute(async () => {
      return await this.executeWithRetry(async () => {
        await this.makeRequest(`/workflows/${workflowId}/deactivate`, {
          method: 'POST'
        });
      });
    });
  }

  /**
   * Get workflow execution history
   */
  async getExecutionHistory(workflowId: string, options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<N8nExecution[]> {
    return await this.circuitBreaker.execute(async () => {
      return await this.executeWithRetry(async () => {
        const params = new URLSearchParams();
        if (options?.limit) params.append('limit', options.limit.toString());
        if (options?.offset) params.append('offset', options.offset.toString());
        if (options?.status) params.append('status', options.status);

        const response = await this.makeRequest(`/workflows/${workflowId}/executions?${params.toString()}`);
        return response.data.map((exec: any) => this.parseExecution(exec));
      });
    });
  }

  /**
   * Get connector health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    circuitBreakerState: 'closed' | 'open' | 'half-open';
    metrics: Record<string, number>;
  } {
    const circuitState = this.circuitBreaker.getState();
    const metrics = Object.fromEntries(this.metrics);
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (circuitState === 'open') {
      status = 'unhealthy';
    } else if (circuitState === 'half-open') {
      status = 'degraded';
    }

    return {
      status,
      circuitBreakerState: circuitState,
      metrics
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Execute operation with retry logic
   */
  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }

        if (!this.isRetryableError(error)) {
          throw error;
        }

        const delay = this.calculateRetryDelay(attempt);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Make HTTP request to n8n API
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        ...options.headers
      },
      signal: AbortSignal.timeout(this.config.timeout)
    });

    if (!response.ok) {
      throw new Error(`n8n API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Call n8n API to execute workflow
   */
  private async callN8nAPI(request: N8nExecutionRequest): Promise<N8nExecutionResponse> {
    const startTime = Date.now();
    
    const response = await this.makeRequest(`/workflows/${request.workflowId}/execute`, {
      method: 'POST',
      body: JSON.stringify({
        data: request.payload,
        options: request.options
      })
    });

    const duration = Date.now() - startTime;

    if (this.config.enableMetrics) {
      this.recordMetric('execution_successes', 1);
      this.recordMetric('execution_duration', duration);
    }

    return {
      success: true,
      executionId: response.id,
      workflowId: request.workflowId,
      status: this.mapN8nStatus(response.status),
      duration,
      data: response.data
    };
  }

  /**
   * Parse n8n workflow definition
   */
  private parseWorkflowDefinition(data: any): N8nWorkflowDefinition {
    return {
      id: data.id,
      name: data.name,
      nodes: data.nodes || [],
      connections: data.connections || [],
      active: data.active || false,
      settings: data.settings || {},
      staticData: data.staticData || {},
      tags: data.tags || [],
      pinData: data.pinData || {},
      versionId: data.versionId || ''
    };
  }

  /**
   * Parse n8n execution
   */
  private parseExecution(data: any): N8nExecution {
    return {
      id: data.id,
      finished: data.finished || false,
      mode: data.mode || 'manual',
      startedAt: new Date(data.startedAt),
      stoppedAt: data.stoppedAt ? new Date(data.stoppedAt) : undefined,
      workflowId: data.workflowId,
      data: data.data || {},
      status: data.status || 'running',
      retryOf: data.retryOf,
      retrySuccessId: data.retrySuccessId
    };
  }

  /**
   * Map n8n status to execution status
   */
  private mapN8nStatus(n8nStatus: string): ExecutionStatus {
    switch (n8nStatus) {
      case 'success':
        return 'completed';
      case 'error':
        return 'failed';
      case 'canceled':
        return 'cancelled';
      case 'running':
        return 'running';
      default:
        return 'pending';
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (error instanceof CircuitBreakerOpenError) {
      return false;
    }

    const message = error.message?.toLowerCase() || '';
    return this.retryConfig.retryableErrors.some(retryableError => 
      message.includes(retryableError.toLowerCase())
    );
  }

  /**
   * Calculate retry delay
   */
  private calculateRetryDelay(attempt: number): number {
    const baseDelay = this.retryConfig.baseDelayMs;
    const maxDelay = this.retryConfig.maxDelayMs;
    const jitter = this.retryConfig.jitterFactor;

    let delay: number;
    switch (this.retryConfig.backoffStrategy) {
      case 'exponential':
        delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        break;
      case 'linear':
        delay = Math.min(baseDelay * (attempt + 1), maxDelay);
        break;
      case 'fixed':
        delay = baseDelay;
        break;
      default:
        delay = baseDelay;
    }

    // Add jitter
    const jitterAmount = delay * jitter * Math.random();
    return Math.floor(delay + jitterAmount);
  }

  /**
   * Record metric
   */
  private recordMetric(name: string, value: number): void {
    const current = this.metrics.get(name) || 0;
    this.metrics.set(name, current + value);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// n8n Connector Factory
// ============================================================================

export class N8nConnectorFactory {
  /**
   * Create n8n connector with default configuration
   */
  static create(config: Partial<N8nConnectorConfig>): N8nConnector {
    const defaultConfig: N8nConnectorConfig = {
      baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
      apiKey: process.env.N8N_API_KEY || '',
      webhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook',
      timeout: 30000,
      retryConfig: {
        maxRetries: 3,
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        jitterFactor: 0.1,
        retryableErrors: ['timeout', 'network', '5xx'],
        backoffStrategy: 'exponential'
      },
      circuitBreaker: {
        failureThreshold: 5,
        recoveryTimeoutMs: 60000,
        halfOpenMaxCalls: 3,
        timeoutMs: 30000,
        enabled: true
      },
      enableMetrics: true
    };

    return new N8nConnector({ ...defaultConfig, ...config });
  }

  /**
   * Create n8n connector for production
   */
  static createProduction(): N8nConnector {
    return this.create({
      baseUrl: process.env.N8N_BASE_URL!,
      apiKey: process.env.N8N_API_KEY!,
      webhookUrl: process.env.N8N_WEBHOOK_URL!,
      timeout: 60000,
      retryConfig: {
        maxRetries: 5,
        baseDelayMs: 2000,
        maxDelayMs: 30000,
        jitterFactor: 0.2,
        retryableErrors: ['timeout', 'network', '5xx', 'rate_limit'],
        backoffStrategy: 'exponential'
      },
      circuitBreaker: {
        failureThreshold: 10,
        recoveryTimeoutMs: 120000,
        halfOpenMaxCalls: 5,
        timeoutMs: 60000,
        enabled: true
      }
    });
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default N8nConnector;
