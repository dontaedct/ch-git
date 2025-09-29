/**
 * Workflow Type Definitions
 * 
 * Comprehensive type definitions for the orchestration layer workflow system
 * to ensure type safety and PRD Section 8 compliance.
 */

// ============================================================================
// Core Workflow Types
// ============================================================================

export interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  status: WorkflowStatus;
  type: WorkflowType;
  config: WorkflowConfig;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  metadata: WorkflowMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkflowStatus = 'active' | 'paused' | 'stopped' | 'draft' | 'error';
export type WorkflowType = 'n8n' | 'temporal' | 'custom' | 'webhook' | 'scheduled';

export interface WorkflowConfig {
  timeout: number;
  retryPolicy: RetryPolicy;
  circuitBreaker: CircuitBreakerConfig;
  concurrency: number;
  environment: Environment;
  tags: string[];
  priority: WorkflowPriority;
  notifications: NotificationConfig;
}

export type Environment = 'dev' | 'staging' | 'prod';
export type WorkflowPriority = 'low' | 'normal' | 'high' | 'critical';

export interface RetryPolicy {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterFactor: number;
  retryableErrors: string[];
  backoffStrategy: BackoffStrategy;
  retryOnTimeout: boolean;
  retryOnNetworkError: boolean;
}

export type BackoffStrategy = 'exponential' | 'linear' | 'fixed' | 'custom';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeoutMs: number;
  halfOpenMaxCalls: number;
  timeoutMs: number;
  enabled: boolean;
  monitorInterval: number;
}

export interface NotificationConfig {
  onSuccess: boolean;
  onFailure: boolean;
  onTimeout: boolean;
  channels: NotificationChannel[];
  recipients: string[];
}

export type NotificationChannel = 'email' | 'slack' | 'webhook' | 'sms';

// ============================================================================
// Workflow Step Types
// ============================================================================

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  config: StepConfig;
  retryConfig: RetryPolicy;
  timeout: number;
  dependencies: string[];
  order: number;
  condition?: StepCondition;
  parallel?: boolean;
  metadata: StepMetadata;
}

export type StepType = 
  | 'n8n' 
  | 'temporal' 
  | 'webhook' 
  | 'api' 
  | 'transform' 
  | 'condition' 
  | 'delay' 
  | 'email' 
  | 'database' 
  | 'file' 
  | 'custom';

export interface StepConfig {
  [key: string]: any;
  // Common config properties
  timeout?: number;
  retries?: number;
  parallel?: boolean;
  condition?: string;
}

export interface StepCondition {
  expression: string;
  operator: ConditionOperator;
  value: any;
  onFalse?: 'skip' | 'fail' | 'continue';
}

export type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';

export interface StepMetadata {
  description?: string;
  tags: string[];
  category: string;
  version: string;
  author: string;
  documentation?: string;
}

// ============================================================================
// Workflow Trigger Types
// ============================================================================

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  config: TriggerConfig;
  enabled: boolean;
  schedule?: ScheduleConfig;
  webhook?: WebhookTriggerConfig;
  event?: EventTriggerConfig;
  metadata: TriggerMetadata;
}

export type TriggerType = 'webhook' | 'schedule' | 'event' | 'manual' | 'form-submission' | 'api';

export interface TriggerConfig {
  [key: string]: any;
  // Common trigger properties
  timeout?: number;
  retries?: number;
  authentication?: AuthenticationConfig;
}

export interface ScheduleConfig {
  cron: string;
  timezone: string;
  enabled: boolean;
  startDate?: Date;
  endDate?: Date;
  maxExecutions?: number;
}

export interface WebhookTriggerConfig {
  path: string;
  method: HttpMethod;
  authentication: AuthenticationConfig;
  headers: Record<string, string>;
  validation: WebhookValidation;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface AuthenticationConfig {
  type: 'none' | 'hmac' | 'basic' | 'bearer' | 'oauth' | 'custom';
  config: Record<string, any>;
}

export interface WebhookValidation {
  required: boolean;
  schema?: any;
  customValidator?: string;
}

export interface EventTriggerConfig {
  eventType: string;
  source: string;
  filters: EventFilter[];
  batchSize?: number;
  batchTimeout?: number;
}

export interface EventFilter {
  field: string;
  operator: ConditionOperator;
  value: any;
}

export interface TriggerMetadata {
  description?: string;
  tags: string[];
  category: string;
  version: string;
  author: string;
}

// ============================================================================
// Workflow Metadata Types
// ============================================================================

export interface WorkflowMetadata {
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  environment: Environment;
  source: string;
  dependencies: string[];
  documentation?: string;
  changelog: ChangelogEntry[];
  permissions: PermissionConfig;
}

export interface ChangelogEntry {
  version: string;
  date: Date;
  author: string;
  changes: string[];
  breakingChanges: boolean;
}

export interface PermissionConfig {
  read: string[];
  write: string[];
  execute: string[];
  admin: string[];
}

// ============================================================================
// Execution Types
// ============================================================================

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  payload: any;
  trigger: WorkflowTrigger;
  metadata: ExecutionMetadata;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  results: StepResult[];
  errors: ExecutionError[];
  retryCount: number;
  maxRetries: number;
  parentExecutionId?: string;
  childExecutions: string[];
  progress: ExecutionProgress;
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
  priority: WorkflowPriority;
  tags: string[];
}

export interface ExecutionProgress {
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  skippedSteps: number;
  percentage: number;
  currentStep?: string;
  estimatedTimeRemaining?: number;
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
  metrics: StepMetrics;
}

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'timeout';

export interface StepLog {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
  stepId: string;
  executionId: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface StepMetrics {
  memoryUsage: number;
  cpuUsage: number;
  networkCalls: number;
  databaseQueries: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface ExecutionError {
  id: string;
  stepId?: string;
  type: ErrorType;
  message: string;
  stack?: string;
  timestamp: Date;
  retryable: boolean;
  context: Record<string, any>;
  severity: ErrorSeverity;
}

export type ErrorType = 
  | 'validation' 
  | 'execution' 
  | 'timeout' 
  | 'network' 
  | 'authentication' 
  | 'authorization' 
  | 'system' 
  | 'business' 
  | 'configuration';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// n8n Integration Types
// ============================================================================

export interface N8nWorkflow {
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
  createdAt: Date;
  updatedAt: Date;
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
  color?: string;
  icon?: string;
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
  executionTimeout?: number;
  saveDataErrorExecution: 'all' | 'none';
  saveDataSuccessExecution: 'all' | 'none';
  saveManualExecutions: boolean;
  callersPolicy: 'workflowsFromSameOwner' | 'workflowsFromSameOwnerAndWebhook' | 'any';
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
  waitTill?: Date;
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

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  metadata: WebhookEventMetadata;
  timestamp: Date;
  source: string;
  version: string;
}

export interface WebhookEventMetadata {
  eventId: string;
  source: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  retryCount?: number;
  priority: WebhookPriority;
  tags: string[];
}

export type WebhookPriority = 'low' | 'normal' | 'high' | 'critical';

export interface WebhookDelivery {
  id: string;
  eventId: string;
  endpoint: string;
  status: WebhookDeliveryStatus;
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: Date;
  deliveredAt?: Date;
  response?: WebhookResponse;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WebhookDeliveryStatus = 'pending' | 'delivered' | 'failed' | 'retrying';

export interface WebhookResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  duration: number;
  timestamp: Date;
}

// ============================================================================
// API Types
// ============================================================================

export interface CreateWorkflowRequest {
  name: string;
  description: string;
  type: WorkflowType;
  config: WorkflowConfig;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  metadata: Partial<WorkflowMetadata>;
  environment: Environment;
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  config?: Partial<WorkflowConfig>;
  steps?: WorkflowStep[];
  triggers?: WorkflowTrigger[];
  metadata?: Partial<WorkflowMetadata>;
  status?: WorkflowStatus;
}

export interface ExecuteWorkflowRequest {
  payload: any;
  options?: ExecutionOptions;
  trigger?: WorkflowTrigger;
  metadata?: Partial<ExecutionMetadata>;
}

export interface ExecutionOptions {
  timeout?: number;
  retryConfig?: Partial<RetryPolicy>;
  circuitBreaker?: Partial<CircuitBreakerConfig>;
  priority?: WorkflowPriority;
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  tags?: string[];
  dryRun?: boolean;
}

export interface ExecutionResponse {
  success: boolean;
  executionId: string;
  workflowId: string;
  status: ExecutionStatus;
  duration: number;
  results: StepResult[];
  errors: ExecutionError[];
  metadata: ExecutionMetadata;
  progress: ExecutionProgress;
}

// ============================================================================
// Monitoring and Metrics Types
// ============================================================================

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
  period: MetricsPeriod;
  breakdown: MetricsBreakdown;
}

export type MetricsPeriod = 'hour' | 'day' | 'week' | 'month' | 'year';

export interface MetricsBreakdown {
  byStatus: Record<ExecutionStatus, number>;
  byTrigger: Record<TriggerType, number>;
  byEnvironment: Record<Environment, number>;
  byUser: Record<string, number>;
  byTime: TimeSeriesData[];
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label: string;
}

export interface SystemHealth {
  status: HealthStatus;
  components: ComponentHealth[];
  metrics: SystemMetrics;
  timestamp: Date;
  uptime: number;
}

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface ComponentHealth {
  name: string;
  status: HealthStatus;
  message?: string;
  lastCheck: Date;
  metrics?: Record<string, number>;
  dependencies: string[];
}

export interface SystemMetrics {
  totalWorkflows: number;
  activeExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  circuitBreakerState: CircuitBreakerState;
  dlqSize: number;
  retrySuccessRate: number;
  throughput: number;
  errorRate: number;
}

export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

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
  priority: WorkflowPriority;
  metadata: Record<string, any>;
  tags: string[];
}

export interface DLQRetryRequest {
  messageId: string;
  retryOptions?: ExecutionOptions;
  forceRetry?: boolean;
  delay?: number;
}

export interface DLQRetryResponse {
  success: boolean;
  messageId: string;
  newExecutionId?: string;
  error?: string;
}

// ============================================================================
// Environment Promotion Types
// ============================================================================

export interface WorkflowArtifacts {
  workflow: Workflow;
  config: WorkflowConfig;
  dependencies: string[];
  environment: Environment;
  exportedAt: Date;
  version: string;
  checksum: string;
  metadata: Record<string, any>;
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
  force?: boolean;
  skipTests?: boolean;
}

export interface PromotionResult {
  success: boolean;
  workflowId: string;
  fromEnvironment: Environment;
  toEnvironment: Environment;
  artifacts: WorkflowArtifacts;
  errors?: string[];
  warnings?: string[];
  duration: number;
  timestamp: Date;
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
  priority?: WorkflowPriority;
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

export class WorkflowExecutionError extends OrchestrationError {
  constructor(executionId: string, stepId: string, error: string) {
    super(`Workflow execution error: ${error}`, 'WORKFLOW_EXECUTION_ERROR', { executionId, stepId, error });
  }
}
