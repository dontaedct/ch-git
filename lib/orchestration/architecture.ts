/**
 * Orchestration Architecture Types and Contracts
 * 
 * Defines the core types, interfaces, and contracts for the orchestration layer
 * that enables PRD Section 8 compliance with n8n/Temporal integration.
 */

// ============================================================================
// Core Orchestration Types
// ============================================================================

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  status: WorkflowStatus;
  type: WorkflowType;
  
  // Workflow configuration
  config: WorkflowConfig;
  
  // Workflow steps
  steps: WorkflowStep[];
  
  // Triggers
  triggers: WorkflowTrigger[];
  
  // Metadata
  metadata: WorkflowMetadata;
}

export type WorkflowStatus = 'active' | 'paused' | 'stopped' | 'draft' | 'error';
export type WorkflowType = 'n8n' | 'temporal' | 'custom' | 'webhook' | 'scheduled';

export interface WorkflowConfig {
  timeout: number;
  retryPolicy: RetryConfig;
  circuitBreaker: CircuitBreakerConfig;
  concurrency: number;
  environment: Environment;
  tags: string[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  retryConfig: RetryConfig;
  timeout: number;
  dependencies: string[];
  order: number;
  condition?: string;
}

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  config: Record<string, any>;
  enabled: boolean;
  schedule?: string;
  webhook?: WebhookConfig;
}

export type TriggerType = 'webhook' | 'schedule' | 'event' | 'manual' | 'form-submission';

export interface WorkflowMetadata {
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  environment: Environment;
  source: string;
  dependencies: string[];
}

export type Environment = 'dev' | 'staging' | 'prod';

// ============================================================================
// Execution Types
// ============================================================================

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  
  // Execution context
  payload: any;
  trigger: WorkflowTrigger;
  metadata: ExecutionMetadata;
  
  // Timing
  startTime: Date;
  endTime?: Date;
  duration?: number;
  
  // Results
  results: StepResult[];
  errors: ExecutionError[];
  
  // Retry information
  retryCount: number;
  maxRetries: number;
  
  // Parent/child relationships
  parentExecutionId?: string;
  childExecutions: string[];
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';

export interface ExecutionMetadata {
  executionId: string;
  workflowId: string;
  triggerType: TriggerType;
  triggerId?: string;
  userId?: string;
  sessionId?: string;
  environment: Environment;
  source: string;
  timestamp: Date;
  correlationId?: string;
}

export interface StepResult {
  stepId: string;
  stepName: string;
  status: StepStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  output?: any;
  error?: string;
  retryCount: number;
  logs: StepLog[];
}

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'timeout';

export interface StepLog {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
  stepId: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ExecutionError {
  id: string;
  stepId?: string;
  type: ErrorType;
  message: string;
  stack?: string;
  timestamp: Date;
  retryable: boolean;
  context: Record<string, any>;
}

export type ErrorType = 'validation' | 'execution' | 'timeout' | 'network' | 'authentication' | 'authorization' | 'system';

// ============================================================================
// Retry and Reliability Types
// ============================================================================

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterFactor: number;
  retryableErrors: string[];
  backoffStrategy: BackoffStrategy;
}

export type BackoffStrategy = 'exponential' | 'linear' | 'fixed' | 'custom';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeoutMs: number;
  halfOpenMaxCalls: number;
  timeoutMs: number;
  enabled: boolean;
}

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open'
}

// ============================================================================
// n8n Integration Types
// ============================================================================

export interface N8nWorkflowDefinition {
  id: string;
  name: string;
  nodes: N8nNode[];
  connections: N8nConnection[];
  active: boolean;
  settings: N8nWorkflowSettings;
  staticData: Record<string, any>;
  tags: string[];
  pinData: Record<string, any>;
  versionId: string;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, any>;
  webhookId?: string;
  disabled?: boolean;
  notes?: string;
  continueOnFail?: boolean;
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
}

export interface N8nConnection {
  node: string;
  type: string;
  index: number;
}

export interface N8nWorkflowSettings {
  executionOrder: 'v1' | 'v2';
  saveManualExecutions: boolean;
  callerPolicy: 'workflowsFromSameOwner' | 'workflowsFromSameOwnerAndWebhook' | 'any';
  errorWorkflow?: string;
  timezone?: string;
}

export interface N8nExecution {
  id: string;
  finished: boolean;
  mode: 'manual' | 'trigger' | 'webhook';
  startedAt: Date;
  stoppedAt?: Date;
  workflowId: string;
  data: N8nExecutionData;
  status: 'running' | 'success' | 'error' | 'canceled';
  retryOf?: string;
  retrySuccessId?: string;
}

export interface N8nExecutionData {
  resultData: N8nNodeExecutionData[];
  runData: Record<string, N8nNodeRunData[]>;
  lastNodeExecuted?: string;
  executionData: N8nNodeExecutionData[];
}

export interface N8nNodeExecutionData {
  node: string;
  data: any;
  source?: any[];
}

export interface N8nNodeRunData {
  startTime: Date;
  executionTime: number;
  data: any;
  error?: any;
}

// ============================================================================
// Webhook Types
// ============================================================================

export interface WebhookConfig {
  id: string;
  workflowId: string;
  nodeId: string;
  path: string;
  method: HttpMethod;
  authentication: WebhookAuthentication;
  enabled: boolean;
  secret?: string;
  headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface WebhookAuthentication {
  type: 'none' | 'hmac' | 'basic' | 'bearer' | 'custom';
  config?: Record<string, any>;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  metadata: WebhookEventMetadata;
  timestamp: Date;
  source: string;
}

export interface WebhookEventMetadata {
  eventId: string;
  source: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  retryCount?: number;
}

// ============================================================================
// API Types
// ============================================================================

export interface CreateWorkflowRequest {
  name: string;
  description: string;
  type: WorkflowType;
  definition: WorkflowDefinition;
  config: WorkflowConfig;
  environment: Environment;
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  definition?: WorkflowDefinition;
  config?: WorkflowConfig;
  status?: WorkflowStatus;
}

export interface ExecuteWorkflowRequest {
  payload: any;
  options?: ExecutionOptions;
  trigger?: WorkflowTrigger;
  metadata?: Record<string, any>;
}

export interface ExecutionOptions {
  timeout?: number;
  retryConfig?: RetryConfig;
  circuitBreaker?: CircuitBreakerConfig;
  priority?: ExecutionPriority;
  correlationId?: string;
  userId?: string;
  sessionId?: string;
}

export type ExecutionPriority = 'low' | 'normal' | 'high' | 'critical';

export interface ExecutionResult {
  success: boolean;
  executionId: string;
  workflowId: string;
  status: ExecutionStatus;
  duration: number;
  results: StepResult[];
  errors: ExecutionError[];
  metadata: ExecutionMetadata;
}

// ============================================================================
// Monitoring and Metrics Types
// ============================================================================

export interface ExecutionMetrics {
  executionId: string;
  workflowId: string;
  status: ExecutionStatus;
  duration: number;
  stepCount: number;
  successRate: number;
  timestamp: Date;
  environment: Environment;
  triggerType: TriggerType;
}

export interface WorkflowMetrics {
  workflowId: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  p95ExecutionTime: number;
  p99ExecutionTime: number;
  lastExecution?: Date;
  environment: Environment;
}

export interface SystemHealth {
  status: HealthStatus;
  components: ComponentHealth[];
  metrics: SystemMetrics;
  timestamp: Date;
}

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface ComponentHealth {
  name: string;
  status: HealthStatus;
  message?: string;
  lastCheck: Date;
  metrics?: Record<string, number>;
}

export interface SystemMetrics {
  totalWorkflows: number;
  activeExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  circuitBreakerState: CircuitState;
  dlqSize: number;
  retrySuccessRate: number;
}

// ============================================================================
// Dead Letter Queue Types
// ============================================================================

export interface DLQMessage {
  id: string;
  workflowId: string;
  executionId: string;
  payload: any;
  error: ExecutionError;
  retryCount: number;
  createdAt: Date;
  expiresAt: Date;
  priority: ExecutionPriority;
  metadata: Record<string, any>;
}

export interface DLQRetryRequest {
  messageId: string;
  retryOptions?: ExecutionOptions;
  forceRetry?: boolean;
}

// ============================================================================
// Environment Promotion Types
// ============================================================================

export interface WorkflowArtifacts {
  workflow: WorkflowDefinition;
  config: WorkflowConfig;
  dependencies: string[];
  environment: Environment;
  exportedAt: Date;
  version: string;
  checksum: string;
}

export interface PromotionRequest {
  workflowId: string;
  fromEnvironment: Environment;
  toEnvironment: Environment;
  options?: PromotionOptions;
}

export interface PromotionOptions {
  validateCompatibility?: boolean;
  includeDependencies?: boolean;
  backupExisting?: boolean;
  dryRun?: boolean;
}

export interface PromotionResult {
  success: boolean;
  workflowId: string;
  fromEnvironment: Environment;
  toEnvironment: Environment;
  artifacts: WorkflowArtifacts;
  errors?: string[];
  warnings?: string[];
}

// ============================================================================
// Error Types
// ============================================================================

export class OrchestrationError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'OrchestrationError';
  }
}

export class WorkflowNotFoundError extends OrchestrationError {
  constructor(workflowId: string) {
    super(`Workflow not found: ${workflowId}`, 'WORKFLOW_NOT_FOUND', { workflowId });
  }
}

export class ExecutionNotFoundError extends OrchestrationError {
  constructor(executionId: string) {
    super(`Execution not found: ${executionId}`, 'EXECUTION_NOT_FOUND', { executionId });
  }
}

export class CircuitBreakerOpenError extends OrchestrationError {
  constructor(service: string) {
    super(`Circuit breaker is OPEN for service: ${service}`, 'CIRCUIT_BREAKER_OPEN', { service });
  }
}

export class WorkflowExecutionTimeoutError extends OrchestrationError {
  constructor(executionId: string, timeout: number) {
    super(`Workflow execution timeout: ${executionId}`, 'EXECUTION_TIMEOUT', { executionId, timeout });
  }
}

export class InvalidWorkflowDefinitionError extends OrchestrationError {
  constructor(workflowId: string, errors: string[]) {
    super(`Invalid workflow definition: ${workflowId}`, 'INVALID_WORKFLOW_DEFINITION', { workflowId, errors });
  }
}

// ============================================================================
// Utility Types
// ============================================================================

export type WorkflowId = string;
export type ExecutionId = string;
export type StepId = string;
export type TriggerId = string;

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterOptions {
  status?: WorkflowStatus | ExecutionStatus;
  type?: WorkflowType;
  environment?: Environment;
  createdBy?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface OrchestrationConfig {
  engine: {
    maxConcurrentExecutions: number;
    defaultTimeout: number;
    enableMetrics: boolean;
    enableTracing: boolean;
  };
  retry: {
    defaultMaxRetries: number;
    defaultBaseDelayMs: number;
    defaultMaxDelayMs: number;
    defaultJitterFactor: number;
  };
  circuitBreaker: {
    defaultFailureThreshold: number;
    defaultRecoveryTimeoutMs: number;
    defaultTimeoutMs: number;
  };
  n8n: {
    baseUrl: string;
    apiKey: string;
    webhookUrl: string;
    timeout: number;
    retryConfig: RetryConfig;
  };
  temporal?: {
    namespace: string;
    taskQueue: string;
    connection: {
      address: string;
      tls?: any;
    };
  };
  monitoring: {
    enableMetrics: boolean;
    enableTracing: boolean;
    metricsInterval: number;
    alertThresholds: {
      successRate: number;
      avgExecutionTime: number;
      errorRate: number;
    };
  };
}
