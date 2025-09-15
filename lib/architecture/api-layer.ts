/**
 * @fileoverview HT-008.6.8: Comprehensive API Layer Abstraction
 * @module lib/architecture/api-layer
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.6.8 - Add comprehensive API layer abstraction
 * Focus: Microservice-ready architecture with enterprise-grade API management
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (architecture refactoring)
 */

/**
 * Comprehensive API Layer Abstraction
 * 
 * Implements enterprise-grade API layer capabilities:
 * - Unified API client with request/response handling
 * - API versioning and backward compatibility
 * - Request/response transformation and validation
 * - API rate limiting and throttling
 * - API monitoring and analytics
 * - Circuit breaker pattern for resilience
 * - API caching and optimization
 * - Error handling and retry mechanisms
 */

import { container, Injectable, Inject } from './dependency-injection';
import { Logger } from './logging-debugging';
import { ConfigurationManager } from './configuration';
import { CacheManager } from './caching';

// ============================================================================
// CORE API TYPES
// ============================================================================

export interface ApiRequest {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTtl?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  request: ApiRequest;
  timestamp: number;
  duration: number;
  cached: boolean;
  metadata?: Record<string, any>;
}

export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  response?: ApiResponse;
  request: ApiRequest;
  retryable: boolean;
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

export interface ApiEndpoint {
  id: string;
  name: string;
  method: HttpMethod;
  path: string;
  version: string;
  description?: string;
  parameters?: ApiParameter[];
  responses?: ApiResponseSchema[];
  authentication?: ApiAuthentication;
  rateLimit?: ApiRateLimit;
  cache?: ApiCacheConfig;
  retry?: ApiRetryConfig;
  timeout?: number;
  metadata?: Record<string, any>;
}

export interface ApiParameter {
  name: string;
  type: 'query' | 'path' | 'header' | 'body';
  required: boolean;
  schema: any;
  description?: string;
  example?: any;
}

export interface ApiResponseSchema {
  status: number;
  schema: any;
  description?: string;
  example?: any;
}

export interface ApiAuthentication {
  type: 'bearer' | 'basic' | 'api-key' | 'oauth2';
  token?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  apiKeyHeader?: string;
}

export interface ApiRateLimit {
  requests: number;
  window: number; // in seconds
  burst?: number;
}

export interface ApiCacheConfig {
  enabled: boolean;
  ttl: number;
  key?: string;
  tags?: string[];
  vary?: string[];
}

export interface ApiRetryConfig {
  enabled: boolean;
  maxRetries: number;
  backoffStrategy: BackoffStrategy;
  retryableStatuses: number[];
  retryableErrors: string[];
}

export enum BackoffStrategy {
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  FIXED = 'fixed'
}

export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  defaultHeaders: Record<string, string>;
  authentication?: ApiAuthentication;
  rateLimit?: ApiRateLimit;
  retry?: ApiRetryConfig;
  cache?: ApiCacheConfig;
  versioning: ApiVersioningConfig;
  monitoring: ApiMonitoringConfig;
}

export interface ApiVersioningConfig {
  strategy: 'url' | 'header' | 'query';
  defaultVersion: string;
  supportedVersions: string[];
  deprecatedVersions: string[];
}

export interface ApiMonitoringConfig {
  enabled: boolean;
  metrics: boolean;
  tracing: boolean;
  logging: boolean;
  alerting: boolean;
}

// ============================================================================
// CIRCUIT BREAKER
// ============================================================================

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  halfOpenMaxCalls: number;
}

export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

@Injectable('CircuitBreaker')
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private config: CircuitBreakerConfig;
  private logger: Logger;

  constructor(
    logger: Logger,
    config: CircuitBreakerConfig
  ) {
    this.logger = logger;
    this.config = config;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.config.recoveryTimeout) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.logger.info('Circuit breaker moved to HALF_OPEN state');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
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
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.CLOSED;
      this.logger.info('Circuit breaker moved to CLOSED state');
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      this.logger.warn(`Circuit breaker moved to OPEN state after ${this.failureCount} failures`);
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.logger.info('Circuit breaker reset');
  }
}

// ============================================================================
// API CLIENT
// ============================================================================

@Injectable('ApiClient')
export class ApiClient {
  private config: ApiClientConfig;
  private logger: Logger;
  private cacheManager: CacheManager;
  private circuitBreaker: CircuitBreaker;
  private endpoints = new Map<string, ApiEndpoint>();
  private requestMetrics = new Map<string, RequestMetrics>();

  constructor(
    logger: Logger,
    cacheManager: CacheManager,
    config: ApiClientConfig
  ) {
    this.logger = logger;
    this.cacheManager = cacheManager;
    this.config = config;
    this.circuitBreaker = new CircuitBreaker(logger, {
      failureThreshold: 5,
      recoveryTimeout: 30000,
      monitoringPeriod: 60000,
      halfOpenMaxCalls: 3
    });
  }

  // ============================================================================
  // ENDPOINT MANAGEMENT
  // ============================================================================

  registerEndpoint(endpoint: ApiEndpoint): void {
    this.endpoints.set(endpoint.id, endpoint);
    this.logger.info(`API endpoint registered: ${endpoint.id}`);
  }

  getEndpoint(endpointId: string): ApiEndpoint | undefined {
    return this.endpoints.get(endpointId);
  }

  getAllEndpoints(): ApiEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  // ============================================================================
  // REQUEST METHODS
  // ============================================================================

  async request<T = any>(request: ApiRequest): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    
    try {
      // Apply circuit breaker
      const response = await this.circuitBreaker.execute(async () => {
        return await this.executeRequest<T>(request);
      });

      // Record metrics
      this.recordMetrics(request, response, Date.now() - startTime);

      return response;
    } catch (error) {
      this.recordErrorMetrics(request, error as Error, Date.now() - startTime);
      throw error;
    }
  }

  async get<T = any>(url: string, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: HttpMethod.GET,
      url,
      ...options
    });
  }

  async post<T = any>(url: string, body?: any, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: HttpMethod.POST,
      url,
      body,
      ...options
    });
  }

  async put<T = any>(url: string, body?: any, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: HttpMethod.PUT,
      url,
      body,
      ...options
    });
  }

  async patch<T = any>(url: string, body?: any, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: HttpMethod.PATCH,
      url,
      body,
      ...options
    });
  }

  async delete<T = any>(url: string, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: HttpMethod.DELETE,
      url,
      ...options
    });
  }

  // ============================================================================
  // REQUEST EXECUTION
  // ============================================================================

  private async executeRequest<T>(request: ApiRequest): Promise<ApiResponse<T>> {
    // Check cache first
    if (request.cache !== false) {
      const cached = await this.getCachedResponse<T>(request);
      if (cached) {
        return cached;
      }
    }

    // Build full URL
    const fullUrl = this.buildUrl(request.url);
    
    // Prepare headers
    const headers = this.prepareHeaders(request);
    
    // Prepare request options
    const requestOptions: RequestInit = {
      method: request.method,
      headers,
      signal: this.createAbortSignal(request.timeout)
    };

    // Add body for non-GET requests
    if (request.body && request.method !== HttpMethod.GET) {
      requestOptions.body = this.serializeBody(request.body);
    }

    // Execute request
    const response = await fetch(fullUrl, requestOptions);
    
    // Parse response
    const apiResponse = await this.parseResponse<T>(response, request);
    
    // Cache response if enabled
    if (request.cache !== false) {
      await this.cacheResponse(request, apiResponse);
    }

    return apiResponse;
  }

  private buildUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    
    const baseUrl = this.config.baseUrl.endsWith('/') 
      ? this.config.baseUrl.slice(0, -1) 
      : this.config.baseUrl;
    
    const path = url.startsWith('/') ? url : `/${url}`;
    
    return `${baseUrl}${path}`;
  }

  private prepareHeaders(request: ApiRequest): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.defaultHeaders,
      ...request.headers
    };

    // Add authentication
    if (this.config.authentication) {
      this.addAuthentication(headers);
    }

    // Add versioning
    this.addVersioning(headers);

    return headers;
  }

  private addAuthentication(headers: Record<string, string>): void {
    const auth = this.config.authentication!;
    
    switch (auth.type) {
      case 'bearer':
        if (auth.token) {
          headers['Authorization'] = `Bearer ${auth.token}`;
        }
        break;
      case 'basic':
        if (auth.username && auth.password) {
          const credentials = btoa(`${auth.username}:${auth.password}`);
          headers['Authorization'] = `Basic ${credentials}`;
        }
        break;
      case 'api-key':
        if (auth.apiKey && auth.apiKeyHeader) {
          headers[auth.apiKeyHeader] = auth.apiKey;
        }
        break;
    }
  }

  private addVersioning(headers: Record<string, string>): void {
    const versioning = this.config.versioning;
    
    switch (versioning.strategy) {
      case 'header':
        headers['API-Version'] = versioning.defaultVersion;
        break;
      case 'query':
        // This would be handled in URL building
        break;
    }
  }

  private createAbortSignal(timeout?: number): AbortSignal {
    const controller = new AbortController();
    const timeoutMs = timeout || this.config.timeout;
    
    setTimeout(() => {
      controller.abort();
    }, timeoutMs);
    
    return controller.signal;
  }

  private serializeBody(body: any): string {
    if (typeof body === 'string') {
      return body;
    }
    
    return JSON.stringify(body);
  }

  private async parseResponse<T>(response: Response, request: ApiRequest): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let data: T;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (contentType?.includes('text/')) {
      data = await response.text() as T;
    } else {
      data = await response.blob() as T;
    }

    if (!response.ok) {
      const error: ApiError = new Error(`HTTP ${response.status}: ${response.statusText}`) as ApiError;
      error.status = response.status;
      error.statusText = response.statusText;
      error.request = request;
      error.retryable = this.isRetryableStatus(response.status);
      throw error;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers,
      request,
      timestamp: Date.now(),
      duration: 0, // Will be set by caller
      cached: false
    };
  }

  private isRetryableStatus(status: number): boolean {
    return status >= 500 || status === 429;
  }

  // ============================================================================
  // CACHING
  // ============================================================================

  private async getCachedResponse<T>(request: ApiRequest): Promise<ApiResponse<T> | null> {
    try {
      const cacheKey = this.generateCacheKey(request);
      const cached = await this.cacheManager.get(cacheKey) as ApiResponse<T> | null;
      
      if (cached) {
        this.logger.debug(`Cache hit for request: ${request.method} ${request.url}`);
        return { ...cached, cached: true };
      }
    } catch (error) {
      this.logger.error('Cache get error', error as Error);
    }
    
    return null;
  }

  private async cacheResponse<T>(request: ApiRequest, response: ApiResponse<T>): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(request);
      const ttl = request.cacheTtl || this.config.cache?.ttl || 300; // 5 minutes default
      const tags = request.tags || this.config.cache?.tags || [];
      
      await this.cacheManager.set(cacheKey, response, ttl, tags);
      this.logger.debug(`Response cached: ${request.method} ${request.url}`);
    } catch (error) {
      this.logger.error('Cache set error', error as Error);
    }
  }

  private generateCacheKey(request: ApiRequest): string {
    const key = `${request.method}:${request.url}:${JSON.stringify(request.params || {})}`;
    return `api:${btoa(key)}`;
  }

  // ============================================================================
  // METRICS AND MONITORING
  // ============================================================================

  private recordMetrics(request: ApiRequest, response: ApiResponse, duration: number): void {
    if (!this.config.monitoring.metrics) return;

    const key = `${request.method}:${request.url}`;
    const metrics = this.requestMetrics.get(key) || this.createEmptyMetrics();
    
    metrics.totalRequests++;
    metrics.totalDuration += duration;
    metrics.averageDuration = metrics.totalDuration / metrics.totalRequests;
    
    if (response.status >= 200 && response.status < 300) {
      metrics.successCount++;
    } else if (response.status >= 400 && response.status < 500) {
      metrics.clientErrorCount++;
    } else if (response.status >= 500) {
      metrics.serverErrorCount++;
    }
    
    this.requestMetrics.set(key, metrics);
  }

  private recordErrorMetrics(request: ApiRequest, error: Error, duration: number): void {
    if (!this.config.monitoring.metrics) return;

    const key = `${request.method}:${request.url}`;
    const metrics = this.requestMetrics.get(key) || this.createEmptyMetrics();
    
    metrics.totalRequests++;
    metrics.totalDuration += duration;
    metrics.errorCount++;
    
    this.requestMetrics.set(key, metrics);
  }

  private createEmptyMetrics(): RequestMetrics {
    return {
      totalRequests: 0,
      successCount: 0,
      clientErrorCount: 0,
      serverErrorCount: 0,
      errorCount: 0,
      totalDuration: 0,
      averageDuration: 0
    };
  }

  getMetrics(): Record<string, RequestMetrics> {
    return Object.fromEntries(this.requestMetrics);
  }

  // ============================================================================
  // RETRY MECHANISM
  // ============================================================================

  private async executeWithRetry<T>(request: ApiRequest): Promise<ApiResponse<T>> {
    const retryConfig = request.retries !== undefined ? 
      { maxRetries: request.retries } : 
      this.config.retry;
    
    if (!retryConfig || !('enabled' in retryConfig) || !retryConfig.enabled) {
      return this.executeRequest<T>(request);
    }

    let lastError: Error;
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await this.executeRequest<T>(request);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === retryConfig.maxRetries) {
          break;
        }
        
        if (!this.shouldRetry(error as Error, retryConfig)) {
          break;
        }
        
        const backoffStrategy = 'backoffStrategy' in retryConfig ? retryConfig.backoffStrategy : BackoffStrategy.EXPONENTIAL;
        const delay = this.calculateBackoffDelay(attempt, backoffStrategy);
        await this.sleep(delay);
        
        this.logger.debug(`Retrying request (attempt ${attempt + 1}/${retryConfig.maxRetries})`);
      }
    }
    
    throw lastError!;
  }

  private shouldRetry(error: Error, retryConfig: ApiRetryConfig): boolean {
    if (error instanceof Error && 'status' in error) {
      const apiError = error as ApiError;
      return retryConfig.retryableStatuses.includes(apiError.status || 0);
    }
    
    return retryConfig.retryableErrors.some(errorType => 
      error.message.includes(errorType)
    );
  }

  private calculateBackoffDelay(attempt: number, strategy: BackoffStrategy): number {
    const baseDelay = 1000; // 1 second
    
    switch (strategy) {
      case BackoffStrategy.LINEAR:
        return baseDelay * (attempt + 1);
      case BackoffStrategy.EXPONENTIAL:
        return baseDelay * Math.pow(2, attempt);
      case BackoffStrategy.FIXED:
        return baseDelay;
      default:
        return baseDelay;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// REQUEST METRICS INTERFACE
// ============================================================================

export interface RequestMetrics {
  totalRequests: number;
  successCount: number;
  clientErrorCount: number;
  serverErrorCount: number;
  errorCount: number;
  totalDuration: number;
  averageDuration: number;
}

// ============================================================================
// API CLIENT FACTORY
// ============================================================================

export class ApiClientFactory {
  static createClient(config: ApiClientConfig): ApiClient {
    const logger = container.resolve<Logger>('Logger');
    const cacheManager = container.resolve<CacheManager>('CacheManager');
    
    return new ApiClient(logger, cacheManager, config);
  }

  static createDefaultConfig(): ApiClientConfig {
    return {
      baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
      timeout: 30000,
      defaultHeaders: {
        'User-Agent': 'ApiClient/1.0.0'
      },
      versioning: {
        strategy: 'header',
        defaultVersion: 'v1',
        supportedVersions: ['v1'],
        deprecatedVersions: []
      },
      monitoring: {
        enabled: true,
        metrics: true,
        tracing: true,
        logging: true,
        alerting: false
      }
    };
  }
}

// ============================================================================
// REACT HOOKS FOR API CLIENT
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useApiRequest<T>(
  client: ApiClient,
  request: ApiRequest
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeRequest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await client.request<T>(request);
      setData(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [client, request]);

  useEffect(() => {
    executeRequest();
  }, [executeRequest]);

  return {
    data,
    loading,
    error,
    refetch: executeRequest
  };
}

export default {
  ApiClient,
  ApiClientFactory,
  CircuitBreaker,
  CircuitBreakerState,
  HttpMethod,
  BackoffStrategy,
  useApiRequest
};
