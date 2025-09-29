/**
 * HT-035.2.1: Module Lifecycle Type Definitions
 * 
 * TypeScript type definitions for module lifecycle management,
 * activation states, and lifecycle events per PRD Section 7.
 * 
 * Features:
 * - Complete lifecycle state definitions
 * - Activation and deactivation types
 * - Event and error type definitions
 * - Performance and metrics types
 * - Integration and configuration types
 */

// =============================================================================
// MODULE LIFECYCLE STATES
// =============================================================================

/**
 * Module lifecycle states
 */
export type ModuleLifecycleState = 
  | 'uninitialized'
  | 'initializing'
  | 'initialized'
  | 'activating'
  | 'active'
  | 'deactivating'
  | 'deactivated'
  | 'failed'
  | 'rollback'

/**
 * Module activation states
 */
export type ModuleActivationState =
  | 'pending'
  | 'validating'
  | 'preparing'
  | 'loading'
  | 'registering'
  | 'migrating'
  | 'warming'
  | 'activating'
  | 'active'
  | 'failed'
  | 'rollback'

/**
 * Module deactivation states
 */
export type ModuleDeactivationState =
  | 'pending'
  | 'stopping_traffic'
  | 'deactivating_components'
  | 'unregistering'
  | 'cleaning_up'
  | 'restoring_state'
  | 'deactivated'
  | 'failed'

/**
 * Module rollback states
 */
export type ModuleRollbackState =
  | 'pending'
  | 'stopping_traffic'
  | 'rollback_database'
  | 'unregistering'
  | 'unloading'
  | 'restoring_state'
  | 'rolled_back'
  | 'failed'

// =============================================================================
// MODULE LIFECYCLE EVENTS
// =============================================================================

/**
 * Module lifecycle events
 */
export type ModuleLifecycleEvent =
  | 'before_initialize'
  | 'after_initialize'
  | 'before_activate'
  | 'after_activate'
  | 'before_deactivate'
  | 'after_deactivate'
  | 'before_cleanup'
  | 'after_cleanup'
  | 'error'
  | 'state_change'
  | 'health_check'
  | 'configuration_change'

/**
 * Module activation events
 */
export type ModuleActivationEvent =
  | 'validation_started'
  | 'validation_completed'
  | 'validation_failed'
  | 'preparation_started'
  | 'preparation_completed'
  | 'preparation_failed'
  | 'loading_started'
  | 'loading_completed'
  | 'loading_failed'
  | 'registration_started'
  | 'registration_completed'
  | 'registration_failed'
  | 'migration_started'
  | 'migration_completed'
  | 'migration_failed'
  | 'warmup_started'
  | 'warmup_completed'
  | 'warmup_failed'
  | 'activation_started'
  | 'activation_completed'
  | 'activation_failed'
  | 'verification_started'
  | 'verification_completed'
  | 'verification_failed'
  | 'rollback_triggered'
  | 'rollback_started'
  | 'rollback_completed'
  | 'rollback_failed'

/**
 * Module deactivation events
 */
export type ModuleDeactivationEvent =
  | 'deactivation_started'
  | 'traffic_stopped'
  | 'components_deactivated'
  | 'unregistered'
  | 'cleaned_up'
  | 'state_restored'
  | 'deactivation_completed'
  | 'deactivation_failed'

// =============================================================================
// MODULE LIFECYCLE DATA TYPES
// =============================================================================

/**
 * Base module lifecycle data
 */
export interface ModuleLifecycleData {
  /** Module identifier */
  moduleId: string
  
  /** Tenant identifier */
  tenantId: string
  
  /** Event timestamp */
  timestamp: Date
  
  /** Event data */
  data?: Record<string, unknown>
  
  /** Error information */
  error?: ModuleError
  
  /** Performance metrics */
  metrics?: ModuleLifecycleMetrics
}

/**
 * Module lifecycle event data
 */
export interface ModuleLifecycleEventData extends ModuleLifecycleData {
  /** Event type */
  event: ModuleLifecycleEvent
  
  /** Previous state */
  previousState?: ModuleLifecycleState
  
  /** Current state */
  currentState?: ModuleLifecycleState
}

/**
 * Module activation event data
 */
export interface ModuleActivationEventData extends ModuleLifecycleData {
  /** Activation event type */
  event: ModuleActivationEvent
  
  /** Activation state */
  state: ModuleActivationState
  
  /** Activation step */
  step?: string
  
  /** Activation progress */
  progress?: number
  
  /** Activation strategy */
  strategy?: ActivationStrategy
}

/**
 * Module deactivation event data
 */
export interface ModuleDeactivationEventData extends ModuleLifecycleData {
  /** Deactivation event type */
  event: ModuleDeactivationEvent
  
  /** Deactivation state */
  state: ModuleDeactivationState
  
  /** Deactivation step */
  step?: string
  
  /** Deactivation progress */
  progress?: number
  
  /** Deactivation strategy */
  strategy?: DeactivationStrategy
}

// =============================================================================
// MODULE LIFECYCLE METRICS
// =============================================================================

/**
 * Module lifecycle metrics
 */
export interface ModuleLifecycleMetrics {
  /** Operation duration in milliseconds */
  duration: number
  
  /** Memory usage in bytes */
  memoryUsage: number
  
  /** CPU usage percentage */
  cpuUsage: number
  
  /** Network I/O in bytes */
  networkIO: number
  
  /** Disk I/O in bytes */
  diskIO: number
  
  /** Error count */
  errorCount: number
  
  /** Success rate */
  successRate: number
}

/**
 * Module activation metrics
 */
export interface ModuleActivationMetrics extends ModuleLifecycleMetrics {
  /** Total activation time */
  totalActivationTime: number
  
  /** Validation time */
  validationTime: number
  
  /** Preparation time */
  preparationTime: number
  
  /** Loading time */
  loadingTime: number
  
  /** Registration time */
  registrationTime: number
  
  /** Migration time */
  migrationTime: number
  
  /** Warmup time */
  warmupTime: number
  
  /** Activation execution time */
  activationTime: number
  
  /** Verification time */
  verificationTime: number
  
  /** Rollback time (if applicable) */
  rollbackTime?: number
}

/**
 * Module deactivation metrics
 */
export interface ModuleDeactivationMetrics extends ModuleLifecycleMetrics {
  /** Total deactivation time */
  totalDeactivationTime: number
  
  /** Traffic stopping time */
  trafficStopTime: number
  
  /** Component deactivation time */
  componentDeactivationTime: number
  
  /** Unregistration time */
  unregistrationTime: number
  
  /** Cleanup time */
  cleanupTime: number
  
  /** State restoration time */
  stateRestorationTime: number
}

// =============================================================================
// MODULE LIFECYCLE ERRORS
// =============================================================================

/**
 * Module error types
 */
export type ModuleErrorType =
  | 'validation_error'
  | 'dependency_error'
  | 'permission_error'
  | 'resource_error'
  | 'configuration_error'
  | 'initialization_error'
  | 'activation_error'
  | 'deactivation_error'
  | 'cleanup_error'
  | 'health_check_error'
  | 'rollback_error'
  | 'timeout_error'
  | 'network_error'
  | 'database_error'
  | 'filesystem_error'
  | 'unknown_error'

/**
 * Module error severity levels
 */
export type ModuleErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

/**
 * Module error
 */
export interface ModuleError {
  /** Error identifier */
  id: string
  
  /** Error type */
  type: ModuleErrorType
  
  /** Error severity */
  severity: ModuleErrorSeverity
  
  /** Error code */
  code: string
  
  /** Error message */
  message: string
  
  /** Error description */
  description?: string
  
  /** Error stack trace */
  stack?: string
  
  /** Error timestamp */
  timestamp: Date
  
  /** Error context */
  context?: Record<string, unknown>
  
  /** Error details */
  details?: Record<string, unknown>
  
  /** Whether error is recoverable */
  recoverable: boolean
  
  /** Error resolution suggestions */
  resolution?: string[]
  
  /** Related errors */
  related?: string[]
}

/**
 * Module error collection
 */
export interface ModuleErrorCollection {
  /** Collection identifier */
  id: string
  
  /** Module identifier */
  moduleId: string
  
  /** Tenant identifier */
  tenantId: string
  
  /** Error collection timestamp */
  timestamp: Date
  
  /** Errors in collection */
  errors: ModuleError[]
  
  /** Collection summary */
  summary: ModuleErrorSummary
}

/**
 * Module error summary
 */
export interface ModuleErrorSummary {
  /** Total error count */
  totalCount: number
  
  /** Error count by type */
  byType: Record<ModuleErrorType, number>
  
  /** Error count by severity */
  bySeverity: Record<ModuleErrorSeverity, number>
  
  /** Critical error count */
  criticalCount: number
  
  /** Recoverable error count */
  recoverableCount: number
  
  /** Most recent error */
  mostRecent?: ModuleError
  
  /** Most frequent error type */
  mostFrequentType?: ModuleErrorType
}

// =============================================================================
// MODULE LIFECYCLE CONFIGURATION
// =============================================================================

/**
 * Module lifecycle configuration
 */
export interface ModuleLifecycleConfiguration {
  /** Module identifier */
  moduleId: string
  
  /** Tenant identifier */
  tenantId: string
  
  /** Lifecycle timeout settings */
  timeouts: LifecycleTimeoutConfiguration
  
  /** Retry configuration */
  retry: RetryConfiguration
  
  /** Health check configuration */
  healthCheck: HealthCheckConfiguration
  
  /** Monitoring configuration */
  monitoring: MonitoringConfiguration
  
  /** Rollback configuration */
  rollback: RollbackConfiguration
  
  /** Resource quotas */
  quotas: ResourceQuotaConfiguration
}

/**
 * Lifecycle timeout configuration
 */
export interface LifecycleTimeoutConfiguration {
  /** Initialization timeout */
  initialization: number
  
  /** Activation timeout */
  activation: number
  
  /** Deactivation timeout */
  deactivation: number
  
  /** Cleanup timeout */
  cleanup: number
  
  /** Health check timeout */
  healthCheck: number
  
  /** Rollback timeout */
  rollback: number
}

/**
 * Retry configuration
 */
export interface RetryConfiguration {
  /** Maximum retry attempts */
  maxAttempts: number
  
  /** Retry delay in milliseconds */
  delay: number
  
  /** Retry delay multiplier */
  delayMultiplier: number
  
  /** Maximum retry delay */
  maxDelay: number
  
  /** Retry on error types */
  retryOn: ModuleErrorType[]
  
  /** Don't retry on error types */
  dontRetryOn: ModuleErrorType[]
}

/**
 * Health check configuration
 */
export interface HealthCheckConfiguration {
  /** Health check interval */
  interval: number
  
  /** Health check timeout */
  timeout: number
  
  /** Number of failed checks before marking unhealthy */
  failureThreshold: number
  
  /** Number of successful checks before marking healthy */
  successThreshold: number
  
  /** Health check endpoints */
  endpoints: HealthCheckEndpoint[]
}

/**
 * Health check endpoint
 */
export interface HealthCheckEndpoint {
  /** Endpoint identifier */
  id: string
  
  /** Endpoint name */
  name: string
  
  /** Endpoint URL */
  url: string
  
  /** HTTP method */
  method: string
  
  /** Expected response status */
  expectedStatus: number
  
  /** Response timeout */
  timeout: number
  
  /** Whether endpoint is critical */
  critical: boolean
  
  /** Custom validation function */
  validator?: string
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfiguration {
  /** Enable performance monitoring */
  performanceMonitoring: boolean
  
  /** Enable error monitoring */
  errorMonitoring: boolean
  
  /** Enable resource monitoring */
  resourceMonitoring: boolean
  
  /** Metrics collection interval */
  metricsInterval: number
  
  /** Alert thresholds */
  alertThresholds: AlertThresholdConfiguration
}

/**
 * Alert threshold configuration
 */
export interface AlertThresholdConfiguration {
  /** CPU usage threshold */
  cpuUsage: number
  
  /** Memory usage threshold */
  memoryUsage: number
  
  /** Error rate threshold */
  errorRate: number
  
  /** Response time threshold */
  responseTime: number
  
  /** Disk usage threshold */
  diskUsage: number
}

/**
 * Rollback configuration
 */
export interface RollbackConfiguration {
  /** Enable automatic rollback */
  automaticRollback: boolean
  
  /** Rollback triggers */
  triggers: RollbackTriggerConfiguration[]
  
  /** Rollback timeout */
  timeout: number
  
  /** Preserve data during rollback */
  preserveData: boolean
  
  /** Rollback notification channels */
  notificationChannels: string[]
}

/**
 * Rollback trigger configuration
 */
export interface RollbackTriggerConfiguration {
  /** Trigger type */
  type: 'health_check_failure' | 'error_rate_exceeded' | 'response_time_exceeded' | 'activation_timeout' | 'critical_error'
  
  /** Trigger threshold */
  threshold?: number
  
  /** Trigger timeout */
  timeout?: number
  
  /** Whether trigger is enabled */
  enabled: boolean
}

/**
 * Resource quota configuration
 */
export interface ResourceQuotaConfiguration {
  /** Memory quota */
  memory: MemoryQuotaConfiguration
  
  /** CPU quota */
  cpu: CpuQuotaConfiguration
  
  /** Storage quota */
  storage: StorageQuotaConfiguration
  
  /** Network quota */
  network: NetworkQuotaConfiguration
}

/**
 * Memory quota configuration
 */
export interface MemoryQuotaConfiguration {
  /** Maximum heap size in bytes */
  maxHeapSize: number
  
  /** Maximum stack size in bytes */
  maxStackSize: number
  
  /** Garbage collection threshold */
  gcThreshold: number
  
  /** Memory leak detection enabled */
  leakDetection: boolean
}

/**
 * CPU quota configuration
 */
export interface CpuQuotaConfiguration {
  /** Maximum CPU usage percentage */
  maxUsage: number
  
  /** CPU quota period in milliseconds */
  quotaPeriod: number
  
  /** CPU throttling enabled */
  throttlingEnabled: boolean
  
  /** CPU monitoring enabled */
  monitoringEnabled: boolean
}

/**
 * Storage quota configuration
 */
export interface StorageQuotaConfiguration {
  /** Maximum storage size in bytes */
  maxSize: number
  
  /** Storage path */
  path: string
  
  /** Cleanup enabled */
  cleanupEnabled: boolean
  
  /** Cleanup interval */
  cleanupInterval: number
}

/**
 * Network quota configuration
 */
export interface NetworkQuotaConfiguration {
  /** Maximum bandwidth in bytes per second */
  maxBandwidth: number
  
  /** Connection limit */
  connectionLimit: number
  
  /** Allowed hosts */
  allowedHosts: string[]
  
  /** SSL required */
  sslRequired: boolean
}

// =============================================================================
// MODULE LIFECYCLE STRATEGIES
// =============================================================================

/**
 * Activation strategies
 */
export type ActivationStrategy = 'gradual' | 'instant' | 'blue-green'

/**
 * Deactivation strategies
 */
export type DeactivationStrategy = 'graceful' | 'immediate' | 'draining'

/**
 * Rollback strategies
 */
export type RollbackStrategy = 'immediate' | 'gradual' | 'manual'

/**
 * Gradual activation strategy configuration
 */
export interface GradualActivationStrategy {
  type: 'gradual'
  
  /** Activation steps */
  steps: ActivationStep[]
  
  /** Traffic shifting configuration */
  trafficShifting: TrafficShiftingConfiguration
  
  /** Rollback triggers */
  rollbackTriggers: RollbackTriggerConfiguration[]
  
  /** Health check configuration */
  healthChecks: HealthCheckEndpoint[]
}

/**
 * Instant activation strategy configuration
 */
export interface InstantActivationStrategy {
  type: 'instant'
  
  /** Activation steps */
  steps: ActivationStep[]
  
  /** Activation timeout */
  timeout: number
  
  /** Rollback triggers */
  rollbackTriggers: RollbackTriggerConfiguration[]
}

/**
 * Blue-green activation strategy configuration
 */
export interface BlueGreenActivationStrategy {
  type: 'blue-green'
  
  /** Activation steps */
  steps: ActivationStep[]
  
  /** Traffic shifting configuration */
  trafficShifting: TrafficShiftingConfiguration
  
  /** Rollback triggers */
  rollbackTriggers: RollbackTriggerConfiguration[]
  
  /** Health check configuration */
  healthChecks: HealthCheckEndpoint[]
}

/**
 * Activation step
 */
export interface ActivationStep {
  /** Step identifier */
  id: string
  
  /** Step name */
  name: string
  
  /** Step description */
  description: string
  
  /** Step order */
  order: number
  
  /** Step timeout */
  timeout: number
  
  /** Whether step is critical */
  critical: boolean
  
  /** Step dependencies */
  dependencies: string[]
  
  /** Rollback step */
  rollbackStep?: string
}

/**
 * Traffic shifting configuration
 */
export interface TrafficShiftingConfiguration {
  /** Initial traffic percentage */
  initial: number
  
  /** Traffic increment percentage */
  increment: number
  
  /** Maximum traffic percentage */
  maxIncrement: number
  
  /** Traffic shifting interval in milliseconds */
  interval: number
  
  /** Health check interval during shifting */
  healthCheckInterval: number
  
  /** Failure threshold for rollback */
  failureThreshold: number
}

// =============================================================================
// MODULE LIFECYCLE HOOKS
// =============================================================================

/**
 * Module lifecycle hook function type
 */
export type ModuleLifecycleHook = (data: ModuleLifecycleEventData) => Promise<void> | void

/**
 * Module activation hook function type
 */
export type ModuleActivationHook = (data: ModuleActivationEventData) => Promise<void> | void

/**
 * Module deactivation hook function type
 */
export type ModuleDeactivationHook = (data: ModuleDeactivationEventData) => Promise<void> | void

/**
 * Module lifecycle hook registration
 */
export interface ModuleLifecycleHookRegistration {
  /** Hook identifier */
  id: string
  
  /** Hook name */
  name: string
  
  /** Hook description */
  description: string
  
  /** Hook function */
  hook: ModuleLifecycleHook
  
  /** Events to hook into */
  events: ModuleLifecycleEvent[]
  
  /** Hook priority */
  priority: number
  
  /** Whether hook is enabled */
  enabled: boolean
  
  /** Hook timeout */
  timeout: number
  
  /** Hook error handling */
  errorHandling: 'ignore' | 'log' | 'throw'
}

/**
 * Module activation hook registration
 */
export interface ModuleActivationHookRegistration {
  /** Hook identifier */
  id: string
  
  /** Hook name */
  name: string
  
  /** Hook description */
  description: string
  
  /** Hook function */
  hook: ModuleActivationHook
  
  /** Events to hook into */
  events: ModuleActivationEvent[]
  
  /** Hook priority */
  priority: number
  
  /** Whether hook is enabled */
  enabled: boolean
  
  /** Hook timeout */
  timeout: number
  
  /** Hook error handling */
  errorHandling: 'ignore' | 'log' | 'throw'
}

/**
 * Module deactivation hook registration
 */
export interface ModuleDeactivationHookRegistration {
  /** Hook identifier */
  id: string
  
  /** Hook name */
  name: string
  
  /** Hook description */
  description: string
  
  /** Hook function */
  hook: ModuleDeactivationHook
  
  /** Events to hook into */
  events: ModuleDeactivationEvent[]
  
  /** Hook priority */
  priority: number
  
  /** Whether hook is enabled */
  enabled: boolean
  
  /** Hook timeout */
  timeout: number
  
  /** Hook error handling */
  errorHandling: 'ignore' | 'log' | 'throw'
}

// =============================================================================
// MODULE LIFECYCLE UTILITIES
// =============================================================================

/**
 * Module lifecycle state machine
 */
export interface ModuleLifecycleStateMachine {
  /** Current state */
  currentState: ModuleLifecycleState
  
  /** State history */
  stateHistory: ModuleLifecycleStateTransition[]
  
  /** Available transitions */
  availableTransitions: ModuleLifecycleStateTransition[]
  
  /** Transition to new state */
  transition(state: ModuleLifecycleState, data?: ModuleLifecycleEventData): Promise<void>
  
  /** Check if transition is valid */
  canTransition(state: ModuleLifecycleState): boolean
  
  /** Get state metadata */
  getStateMetadata(state: ModuleLifecycleState): ModuleLifecycleStateMetadata
}

/**
 * Module lifecycle state transition
 */
export interface ModuleLifecycleStateTransition {
  /** From state */
  from: ModuleLifecycleState
  
  /** To state */
  to: ModuleLifecycleState
  
  /** Transition event */
  event: ModuleLifecycleEvent
  
  /** Transition timestamp */
  timestamp: Date
  
  /** Transition data */
  data?: Record<string, unknown>
  
  /** Transition error */
  error?: ModuleError
}

/**
 * Module lifecycle state metadata
 */
export interface ModuleLifecycleStateMetadata {
  /** State identifier */
  state: ModuleLifecycleState
  
  /** State name */
  name: string
  
  /** State description */
  description: string
  
  /** State category */
  category: 'initialization' | 'activation' | 'active' | 'deactivation' | 'error' | 'rollback'
  
  /** State timeout */
  timeout: number
  
  /** State priority */
  priority: number
  
  /** Whether state is terminal */
  terminal: boolean
  
  /** Whether state allows rollback */
  allowsRollback: boolean
  
  /** State dependencies */
  dependencies: ModuleLifecycleState[]
}

// =============================================================================
// MODULE LIFECYCLE VALIDATION
// =============================================================================

/**
 * Module lifecycle validation result
 */
export interface ModuleLifecycleValidationResult {
  /** Whether validation passed */
  valid: boolean
  
  /** Validation errors */
  errors: ModuleLifecycleValidationError[]
  
  /** Validation warnings */
  warnings: ModuleLifecycleValidationWarning[]
  
  /** Validation summary */
  summary: ModuleLifecycleValidationSummary
}

/**
 * Module lifecycle validation error
 */
export interface ModuleLifecycleValidationError {
  /** Error code */
  code: string
  
  /** Error message */
  message: string
  
  /** Error path */
  path: string
  
  /** Error value */
  value: unknown
  
  /** Error context */
  context?: Record<string, unknown>
}

/**
 * Module lifecycle validation warning
 */
export interface ModuleLifecycleValidationWarning {
  /** Warning code */
  code: string
  
  /** Warning message */
  message: string
  
  /** Warning path */
  path: string
  
  /** Warning value */
  value: unknown
  
  /** Warning context */
  context?: Record<string, unknown>
}

/**
 * Module lifecycle validation summary
 */
export interface ModuleLifecycleValidationSummary {
  /** Total validation checks */
  totalChecks: number
  
  /** Passed validation checks */
  passedChecks: number
  
  /** Failed validation checks */
  failedChecks: number
  
  /** Warning validation checks */
  warningChecks: number
  
  /** Validation duration */
  duration: number
  
  /** Validation timestamp */
  timestamp: Date
}

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

export type {
  // Re-export commonly used types for convenience
  ModuleLifecycleState,
  ModuleActivationState,
  ModuleDeactivationState,
  ModuleRollbackState,
  ModuleLifecycleEvent,
  ModuleActivationEvent,
  ModuleDeactivationEvent,
  ModuleErrorType,
  ModuleErrorSeverity,
  ActivationStrategy,
  DeactivationStrategy,
  RollbackStrategy
}
