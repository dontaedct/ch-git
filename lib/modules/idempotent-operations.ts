/**
 * HT-035.2.3: Idempotent Activation Operations
 * 
 * Implements idempotent operations for module activation to ensure
 * safe re-execution without side effects per PRD Section 7.
 * 
 * Features:
 * - Idempotent operation definitions and execution
 * - Operation state tracking and validation
 * - Safe re-execution mechanisms
 * - Operation conflict detection and resolution
 * - Comprehensive logging and auditing
 * - Performance optimization for repeated operations
 */

import { 
  ModuleLifecycleState, 
  ModuleActivationState, 
  ModuleError,
  ModuleErrorType,
  ModuleLifecycleMetrics
} from '../types/modules/module-lifecycle'
import { ModuleRegistryEntry } from './module-registry'
import { lifecycleManager } from './module-lifecycle'

// =============================================================================
// CORE TYPES AND INTERFACES
// =============================================================================

export interface IdempotentOperation {
  /** Operation identifier */
  id: string
  
  /** Operation name */
  name: string
  
  /** Operation description */
  description: string
  
  /** Operation type */
  type: 'create' | 'update' | 'delete' | 'configure' | 'migrate' | 'validate' | 'custom'
  
  /** Operation version */
  version: string
  
  /** Operation dependencies */
  dependencies: OperationDependency[]
  
  /** Operation parameters */
  parameters: OperationParameters
  
  /** Operation validation rules */
  validation: OperationValidation
  
  /** Operation execution function */
  execute: (context: OperationContext) => Promise<OperationResult>
  
  /** Operation state check function */
  checkState: (context: OperationContext) => Promise<OperationState>
  
  /** Operation cleanup function */
  cleanup?: (context: OperationContext) => Promise<void>
  
  /** Operation metadata */
  metadata: OperationMetadata
  
  /** Operation performance requirements */
  performance: OperationPerformance
}

export interface OperationDependency {
  /** Dependency operation ID */
  operationId: string
  
  /** Required state */
  requiredState: OperationStateType
  
  /** Dependency type */
  type: 'required' | 'optional' | 'conflicting'
  
  /** Dependency description */
  description: string
  
  /** Dependency timeout */
  timeout: number
}

export interface OperationParameters {
  /** Required parameters */
  required: Record<string, OperationParameterDefinition>
  
  /** Optional parameters */
  optional: Record<string, OperationParameterDefinition>
  
  /** Parameter validation rules */
  validation: ParameterValidationRule[]
  
  /** Default parameter values */
  defaults: Record<string, unknown>
}

export interface OperationParameterDefinition {
  /** Parameter type */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  
  /** Parameter description */
  description: string
  
  /** Parameter validation rules */
  validation?: ParameterValidation
  
  /** Default value */
  defaultValue?: unknown
  
  /** Whether parameter is sensitive */
  sensitive: boolean
}

export interface ParameterValidation {
  /** Minimum value (for numbers) */
  min?: number
  
  /** Maximum value (for numbers) */
  max?: number
  
  /** Minimum length (for strings/arrays) */
  minLength?: number
  
  /** Maximum length (for strings/arrays) */
  maxLength?: number
  
  /** Regular expression pattern (for strings) */
  pattern?: string
  
  /** Allowed values */
  allowedValues?: unknown[]
  
  /** Custom validation function */
  customValidator?: (value: unknown) => boolean
}

export interface ParameterValidationRule {
  /** Rule identifier */
  id: string
  
  /** Rule name */
  name: string
  
  /** Rule description */
  description: string
  
  /** Parameters to validate */
  parameters: string[]
  
  /** Validation function */
  validate: (parameters: Record<string, unknown>) => ValidationResult
}

export interface OperationValidation {
  /** Pre-execution validation */
  preValidation: ValidationRule[]
  
  /** Post-execution validation */
  postValidation: ValidationRule[]
  
  /** State consistency validation */
  stateValidation: StateValidationRule[]
  
  /** Parameter validation */
  parameterValidation: ParameterValidationRule[]
}

export interface ValidationRule {
  /** Rule identifier */
  id: string
  
  /** Rule name */
  name: string
  
  /** Rule description */
  description: string
  
  /** Rule function */
  validate: (context: OperationContext) => Promise<ValidationResult>
  
  /** Rule timeout */
  timeout: number
  
  /** Whether rule is critical */
  critical: boolean
}

export interface StateValidationRule {
  /** Rule identifier */
  id: string
  
  /** Rule name */
  name: string
  
  /** Rule description */
  description: string
  
  /** Expected state */
  expectedState: OperationStateType
  
  /** State validation function */
  validate: (currentState: OperationState, expectedState: OperationStateType) => boolean
  
  /** Rule timeout */
  timeout: number
  
  /** Whether rule is critical */
  critical: boolean
}

export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean
  
  /** Validation message */
  message: string
  
  /** Validation details */
  details: Record<string, unknown>
  
  /** Validation errors */
  errors: string[]
  
  /** Validation warnings */
  warnings: string[]
}

export interface OperationMetadata {
  /** Operation author */
  author: string
  
  /** Operation created date */
  createdAt: Date
  
  /** Operation updated date */
  updatedAt: Date
  
  /** Operation tags */
  tags: string[]
  
  /** Operation category */
  category: string
  
  /** Operation priority */
  priority: 'low' | 'medium' | 'high' | 'critical'
  
  /** Operation risk level */
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  
  /** Operation environment compatibility */
  environments: ('development' | 'staging' | 'production')[]
}

export interface OperationPerformance {
  /** Maximum execution time */
  maxExecutionTime: number
  
  /** Expected execution time */
  expectedExecutionTime: number
  
  /** Resource usage limits */
  resourceLimits: ResourceLimits
  
  /** Performance monitoring */
  monitoring: PerformanceMonitoring
  
  /** Caching configuration */
  caching?: CachingConfiguration
}

export interface ResourceLimits {
  /** Maximum memory usage */
  maxMemoryUsage: number
  
  /** Maximum CPU usage */
  maxCpuUsage: number
  
  /** Maximum disk I/O */
  maxDiskIO: number
  
  /** Maximum network I/O */
  maxNetworkIO: number
}

export interface PerformanceMonitoring {
  /** Enable performance monitoring */
  enabled: boolean
  
  /** Monitoring interval */
  interval: number
  
  /** Performance thresholds */
  thresholds: PerformanceThresholds
}

export interface PerformanceThresholds {
  /** CPU usage threshold */
  cpuUsage: number
  
  /** Memory usage threshold */
  memoryUsage: number
  
  /** Execution time threshold */
  executionTime: number
  
  /** Resource utilization threshold */
  resourceUtilization: number
}

export interface CachingConfiguration {
  /** Enable caching */
  enabled: boolean
  
  /** Cache TTL in milliseconds */
  ttl: number
  
  /** Cache key generation function */
  keyGenerator: (context: OperationContext) => string
  
  /** Cache invalidation rules */
  invalidationRules: CacheInvalidationRule[]
}

export interface CacheInvalidationRule {
  /** Rule identifier */
  id: string
  
  /** Rule name */
  name: string
  
  /** Rule description */
  description: string
  
  /** Invalidation trigger */
  trigger: 'time' | 'event' | 'state_change' | 'parameter_change'
  
  /** Invalidation condition */
  condition: (context: OperationContext) => boolean
}

export interface OperationContext {
  /** Operation execution ID */
  executionId: string
  
  /** Module entry */
  moduleEntry: ModuleRegistryEntry
  
  /** Operation being executed */
  operation: IdempotentOperation
  
  /** Operation parameters */
  parameters: Record<string, unknown>
  
  /** Current operation state */
  currentState: OperationState
  
  /** Previous execution results */
  previousResults: OperationResult[]
  
  /** Operation metadata */
  metadata: Record<string, unknown>
  
  /** Operation logs */
  logs: OperationLog[]
  
  /** Operation errors */
  errors: ModuleError[]
  
  /** Operation warnings */
  warnings: string[]
}

export interface OperationState {
  /** State type */
  type: OperationStateType
  
  /** State timestamp */
  timestamp: Date
  
  /** State message */
  message: string
  
  /** State data */
  data: Record<string, unknown>
  
  /** State checksum */
  checksum: string
  
  /** State version */
  version: string
}

export type OperationStateType = 
  | 'not_executed'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'cached'
  | 'rollback_required'

export interface OperationResult {
  /** Whether operation was successful */
  success: boolean
  
  /** Operation execution ID */
  executionId: string
  
  /** Operation duration */
  duration: number
  
  /** Final operation state */
  finalState: OperationState
  
  /** Operation output */
  output: Record<string, unknown>
  
  /** Operation metrics */
  metrics: OperationMetrics
  
  /** Operation errors */
  errors: ModuleError[]
  
  /** Operation warnings */
  warnings: string[]
  
  /** Operation logs */
  logs: OperationLog[]
  
  /** Whether operation was idempotent */
  wasIdempotent: boolean
  
  /** Whether operation was cached */
  wasCached: boolean
}

export interface OperationMetrics extends ModuleLifecycleMetrics {
  /** Operation execution time */
  executionTime: number
  
  /** State check time */
  stateCheckTime: number
  
  /** Validation time */
  validationTime: number
  
  /** Parameter validation time */
  parameterValidationTime: number
  
  /** Cache hit ratio */
  cacheHitRatio: number
  
  /** Resource usage during operation */
  resourceUsage: OperationResourceUsage
  
  /** Performance metrics */
  performance: OperationPerformanceMetrics
}

export interface OperationResourceUsage {
  /** Memory usage */
  memory: number
  
  /** CPU usage */
  cpu: number
  
  /** Disk I/O */
  diskIO: number
  
  /** Network I/O */
  networkIO: number
  
  /** Database connections */
  databaseConnections: number
  
  /** Cache operations */
  cacheOperations: number
}

export interface OperationPerformanceMetrics {
  /** Operation throughput */
  throughput: number
  
  /** Resource efficiency */
  resourceEfficiency: number
  
  /** Idempotency verification time */
  idempotencyVerificationTime: number
  
  /** State consistency check time */
  stateConsistencyCheckTime: number
}

export interface OperationLog {
  /** Log timestamp */
  timestamp: Date
  
  /** Log level */
  level: 'debug' | 'info' | 'warn' | 'error'
  
  /** Log message */
  message: string
  
  /** Log data */
  data?: Record<string, unknown>
  
  /** Log operation */
  operation?: string
  
  /** Log validation */
  validation?: string
  
  /** Log state */
  state?: string
}

// =============================================================================
// IDEMPOTENT OPERATIONS MANAGER CLASS
// =============================================================================

export class IdempotentOperationsManager {
  private operations: Map<string, IdempotentOperation> = new Map()
  private operationStates: Map<string, Map<string, OperationState>> = new Map() // moduleId -> operationId -> state
  private operationHistory: Map<string, OperationResult[]> = new Map() // operationId -> results
  private operationCache: Map<string, OperationResult> = new Map()
  private performanceMonitor: OperationPerformanceMonitor
  private stateManager: OperationStateManager
  private validationEngine: OperationValidationEngine

  constructor() {
    this.performanceMonitor = new OperationPerformanceMonitor()
    this.stateManager = new OperationStateManager()
    this.validationEngine = new OperationValidationEngine()
    this.initializeBuiltInOperations()
  }

  /**
   * Register an idempotent operation
   */
  async registerOperation(operation: IdempotentOperation): Promise<OperationRegistrationResult> {
    try {
      // Validate operation definition
      const validation = await this.validationEngine.validateOperationDefinition(operation)
      if (!validation.valid) {
        return {
          success: false,
          operationId: operation.id,
          errors: validation.errors,
          warnings: validation.warnings
        }
      }

      // Store operation
      this.operations.set(operation.id, operation)

      // Initialize operation state tracking
      if (!this.operationStates.has(operation.id)) {
        this.operationStates.set(operation.id, new Map())
      }

      // Initialize operation history
      if (!this.operationHistory.has(operation.id)) {
        this.operationHistory.set(operation.id, [])
      }

      // Emit lifecycle event
      await lifecycleManager.emit('after_activate', {
        moduleId: operation.id,
        tenantId: 'system',
        data: { operation, type: 'operation_registration' }
      })

      return {
        success: true,
        operationId: operation.id,
        operation,
        errors: [],
        warnings: validation.warnings
      }

    } catch (error) {
      return {
        success: false,
        operationId: operation.id,
        errors: [{
          code: 'OPERATION_REGISTRATION_ERROR',
          message: error instanceof Error ? error.message : String(error),
          details: { operation: operation.id }
        }],
        warnings: []
      }
    }
  }

  /**
   * Execute an idempotent operation
   */
  async executeOperation(
    operationId: string,
    moduleEntry: ModuleRegistryEntry,
    parameters: Record<string, unknown>,
    config: OperationExecutionConfig
  ): Promise<OperationResult> {
    const operation = this.operations.get(operationId)
    if (!operation) {
      throw new Error(`Operation not found: ${operationId}`)
    }

    const executionId = `${operationId}-${moduleEntry.definition.id}-${Date.now()}`
    const startTime = Date.now()

    // Create operation context
    const context: OperationContext = {
      executionId,
      moduleEntry,
      operation,
      parameters,
      currentState: await this.getCurrentOperationState(operationId, moduleEntry.definition.id),
      previousResults: this.getOperationHistory(operationId),
      metadata: config.metadata,
      logs: [],
      errors: [],
      warnings: []
    }

    try {
      // Emit operation started event
      await this.emitOperationEvent(executionId, operation, 'operation_started', 'executing', {
        executionId,
        operation,
        startTime
      })

      context.logs.push(this.createLog('info', `Starting idempotent operation: ${operation.name}`, { operationId, version: operation.version }))

      // Phase 1: Parameter validation
      context.logs.push(this.createLog('info', 'Phase 1: Parameter validation'))
      await this.validateParameters(context)
      if (context.errors.length > 0) {
        throw new Error('Parameter validation failed')
      }

      // Phase 2: Pre-execution validation
      context.logs.push(this.createLog('info', 'Phase 2: Pre-execution validation'))
      await this.executePreValidation(context)
      if (context.errors.length > 0) {
        throw new Error('Pre-execution validation failed')
      }

      // Phase 3: State check and idempotency verification
      context.logs.push(this.createLog('info', 'Phase 3: State check and idempotency verification'))
      const currentState = await operation.checkState(context)
      context.currentState = currentState

      // Check if operation is already in desired state
      if (this.isOperationComplete(currentState)) {
        context.logs.push(this.createLog('info', 'Operation already in desired state, skipping execution'))
        
        const result: OperationResult = {
          success: true,
          executionId,
          duration: Date.now() - startTime,
          finalState: currentState,
          output: currentState.data,
          metrics: this.createOperationMetrics(context, startTime),
          errors: context.errors,
          warnings: context.warnings,
          logs: context.logs,
          wasIdempotent: true,
          wasCached: false
        }

        this.storeOperationResult(operationId, result)
        return result
      }

      // Phase 4: Check cache
      if (operation.performance.caching?.enabled) {
        context.logs.push(this.createLog('info', 'Phase 4: Cache check'))
        const cachedResult = await this.checkOperationCache(context)
        if (cachedResult) {
          context.logs.push(this.createLog('info', 'Using cached operation result'))
          cachedResult.wasCached = true
          return cachedResult
        }
      }

      // Phase 5: Dependency resolution
      context.logs.push(this.createLog('info', 'Phase 5: Dependency resolution'))
      await this.resolveDependencies(context)
      if (context.errors.length > 0) {
        throw new Error('Dependency resolution failed')
      }

      // Phase 6: Operation execution
      context.logs.push(this.createLog('info', 'Phase 6: Operation execution'))
      const operationResult = await operation.execute(context)

      // Phase 7: Post-execution validation
      context.logs.push(this.createLog('info', 'Phase 7: Post-execution validation'))
      await this.executePostValidation(context)
      if (context.errors.length > 0) {
        throw new Error('Post-execution validation failed')
      }

      // Phase 8: State verification
      context.logs.push(this.createLog('info', 'Phase 8: State verification'))
      const finalState = await operation.checkState(context)
      
      // Update state
      await this.updateOperationState(operationId, moduleEntry.definition.id, finalState)

      const result: OperationResult = {
        success: true,
        executionId,
        duration: Date.now() - startTime,
        finalState,
        output: operationResult.output || {},
        metrics: this.createOperationMetrics(context, startTime),
        errors: context.errors,
        warnings: context.warnings,
        logs: context.logs,
        wasIdempotent: false,
        wasCached: false
      }

      // Store result
      this.storeOperationResult(operationId, result)

      // Cache result if enabled
      if (operation.performance.caching?.enabled) {
        await this.cacheOperationResult(context, result)
      }

      context.logs.push(this.createLog('info', 'Idempotent operation completed successfully'))
      return result

    } catch (error) {
      // Handle operation failure
      const errorResult: OperationResult = {
        success: false,
        executionId,
        duration: Date.now() - startTime,
        finalState: context.currentState,
        output: {},
        metrics: this.createEmptyOperationMetrics(),
        errors: [...context.errors, this.createError(error, 'activation_error')],
        warnings: context.warnings,
        logs: [...context.logs, this.createLog('error', 'Idempotent operation failed', { error: error instanceof Error ? error.message : String(error) })],
        wasIdempotent: false,
        wasCached: false
      }

      // Store error result
      this.storeOperationResult(operationId, errorResult)
      return errorResult
    }
  }

  /**
   * Validate operation parameters
   */
  private async validateParameters(context: OperationContext): Promise<void> {
    const operation = context.operation
    const parameters = context.parameters

    // Validate required parameters
    for (const [paramName, paramDef] of Object.entries(operation.parameters.required)) {
      if (!(paramName in parameters)) {
        const error = this.createError(
          new Error(`Required parameter missing: ${paramName}`),
          'validation_error',
          { parameter: paramName }
        )
        context.errors.push(error)
        continue
      }

      const paramValue = parameters[paramName]
      if (!this.validateParameterValue(paramValue, paramDef)) {
        const error = this.createError(
          new Error(`Invalid parameter value: ${paramName}`),
          'validation_error',
          { parameter: paramName, value: paramValue }
        )
        context.errors.push(error)
      }
    }

    // Validate optional parameters
    for (const [paramName, paramDef] of Object.entries(operation.parameters.optional)) {
      if (paramName in parameters) {
        const paramValue = parameters[paramName]
        if (!this.validateParameterValue(paramValue, paramDef)) {
          const error = this.createError(
            new Error(`Invalid optional parameter value: ${paramName}`),
            'validation_error',
            { parameter: paramName, value: paramValue }
          )
          context.errors.push(error)
        }
      }
    }

    // Execute parameter validation rules
    for (const rule of operation.parameters.validation) {
      try {
        const result = rule.validate(parameters)
        if (!result.valid) {
          const error = this.createError(
            new Error(result.message),
            'validation_error',
            { rule: rule.id, details: result.details }
          )
          context.errors.push(error)
        }
      } catch (ruleError) {
        const error = this.createError(ruleError, 'validation_error', { rule: rule.id })
        context.errors.push(error)
      }
    }
  }

  /**
   * Validate parameter value
   */
  private validateParameterValue(value: unknown, paramDef: OperationParameterDefinition): boolean {
    // Type validation
    const actualType = typeof value
    if (actualType !== paramDef.type && !(paramDef.type === 'array' && Array.isArray(value))) {
      return false
    }

    // Additional validation
    if (paramDef.validation) {
      const validation = paramDef.validation

      // Numeric validations
      if (typeof value === 'number') {
        if (validation.min !== undefined && value < validation.min) return false
        if (validation.max !== undefined && value > validation.max) return false
      }

      // String/Array length validations
      if (typeof value === 'string' || Array.isArray(value)) {
        if (validation.minLength !== undefined && value.length < validation.minLength) return false
        if (validation.maxLength !== undefined && value.length > validation.maxLength) return false
      }

      // Pattern validation for strings
      if (typeof value === 'string' && validation.pattern) {
        const regex = new RegExp(validation.pattern)
        if (!regex.test(value)) return false
      }

      // Allowed values validation
      if (validation.allowedValues && !validation.allowedValues.includes(value)) {
        return false
      }

      // Custom validation
      if (validation.customValidator && !validation.customValidator(value)) {
        return false
      }
    }

    return true
  }

  /**
   * Execute pre-execution validation
   */
  private async executePreValidation(context: OperationContext): Promise<void> {
    for (const validation of context.operation.validation.preValidation) {
      try {
        context.logs.push(this.createLog('info', `Executing pre-validation: ${validation.name}`))
        
        const result = await validation.validate(context)
        
        if (!result.valid) {
          const error = this.createError(
            new Error(result.message),
            'validation_error',
            { validation: validation.id, details: result.details }
          )
          context.errors.push(error)
          context.logs.push(this.createLog('error', `Pre-validation failed: ${validation.name}`, { validation: validation.id }))
          
          if (validation.critical) {
            throw new Error(`Critical pre-validation failed: ${validation.name}`)
          }
        } else {
          context.logs.push(this.createLog('info', `Pre-validation passed: ${validation.name}`))
        }
        
      } catch (validationError) {
        const error = this.createError(validationError, 'validation_error', { validation: validation.id })
        context.errors.push(error)
        context.logs.push(this.createLog('error', `Pre-validation error: ${validation.name}`, { error: validationError instanceof Error ? validationError.message : String(validationError) }))
        
        if (validation.critical) {
          throw validationError
        }
      }
    }
  }

  /**
   * Execute post-execution validation
   */
  private async executePostValidation(context: OperationContext): Promise<void> {
    for (const validation of context.operation.validation.postValidation) {
      try {
        context.logs.push(this.createLog('info', `Executing post-validation: ${validation.name}`))
        
        const result = await validation.validate(context)
        
        if (!result.valid) {
          const error = this.createError(
            new Error(result.message),
            'validation_error',
            { validation: validation.id, details: result.details }
          )
          context.errors.push(error)
          context.logs.push(this.createLog('error', `Post-validation failed: ${validation.name}`, { validation: validation.id }))
          
          if (validation.critical) {
            throw new Error(`Critical post-validation failed: ${validation.name}`)
          }
        } else {
          context.logs.push(this.createLog('info', `Post-validation passed: ${validation.name}`))
        }
        
      } catch (validationError) {
        const error = this.createError(validationError, 'validation_error', { validation: validation.id })
        context.errors.push(error)
        context.logs.push(this.createLog('error', `Post-validation error: ${validation.name}`, { error: validationError instanceof Error ? validationError.message : String(validationError) }))
        
        if (validation.critical) {
          throw validationError
        }
      }
    }
  }

  /**
   * Resolve operation dependencies
   */
  private async resolveDependencies(context: OperationContext): Promise<void> {
    for (const dependency of context.operation.dependencies) {
      try {
        context.logs.push(this.createLog('info', `Resolving dependency: ${dependency.operationId}`))
        
        const dependencyState = await this.getCurrentOperationState(dependency.operationId, context.moduleEntry.definition.id)
        
        if (dependencyState.type !== dependency.requiredState) {
          if (dependency.type === 'required') {
            throw new Error(`Required dependency not in required state: ${dependency.operationId} (expected: ${dependency.requiredState}, actual: ${dependencyState.type})`)
          } else {
            context.warnings.push(`Optional dependency not in required state: ${dependency.operationId}`)
            context.logs.push(this.createLog('warn', `Optional dependency not in required state: ${dependency.operationId}`))
            continue
          }
        }

        context.logs.push(this.createLog('info', `Dependency resolved: ${dependency.operationId}`))

      } catch (dependencyError) {
        const error = this.createError(dependencyError, 'dependency_error', { dependency: dependency.operationId })
        context.errors.push(error)
        context.logs.push(this.createLog('error', `Dependency resolution failed: ${dependency.operationId}`, { error: dependencyError instanceof Error ? dependencyError.message : String(dependencyError) }))
        
        if (dependency.type === 'required') {
          throw dependencyError
        }
      }
    }
  }

  /**
   * Check if operation is already complete
   */
  private isOperationComplete(state: OperationState): boolean {
    return state.type === 'completed' || state.type === 'skipped'
  }

  /**
   * Get current operation state
   */
  private async getCurrentOperationState(operationId: string, moduleId: string): Promise<OperationState> {
    const moduleStates = this.operationStates.get(operationId)
    if (!moduleStates) {
      return this.createDefaultOperationState()
    }

    const state = moduleStates.get(moduleId)
    if (!state) {
      return this.createDefaultOperationState()
    }

    return state
  }

  /**
   * Update operation state
   */
  private async updateOperationState(operationId: string, moduleId: string, state: OperationState): Promise<void> {
    let moduleStates = this.operationStates.get(operationId)
    if (!moduleStates) {
      moduleStates = new Map()
      this.operationStates.set(operationId, moduleStates)
    }

    moduleStates.set(moduleId, state)
  }

  /**
   * Create default operation state
   */
  private createDefaultOperationState(): OperationState {
    return {
      type: 'not_executed',
      timestamp: new Date(),
      message: 'Operation not yet executed',
      data: {},
      checksum: '',
      version: '1.0.0'
    }
  }

  /**
   * Get operation history
   */
  private getOperationHistory(operationId: string): OperationResult[] {
    return this.operationHistory.get(operationId) || []
  }

  /**
   * Store operation result
   */
  private storeOperationResult(operationId: string, result: OperationResult): void {
    let history = this.operationHistory.get(operationId)
    if (!history) {
      history = []
      this.operationHistory.set(operationId, history)
    }

    history.push(result)
    
    // Keep only last 10 results
    if (history.length > 10) {
      history.splice(0, history.length - 10)
    }
  }

  /**
   * Check operation cache
   */
  private async checkOperationCache(context: OperationContext): Promise<OperationResult | null> {
    if (!context.operation.performance.caching?.enabled) {
      return null
    }

    const cacheKey = context.operation.performance.caching.keyGenerator(context)
    const cachedResult = this.operationCache.get(cacheKey)

    if (!cachedResult) {
      return null
    }

    // Check if cache is still valid
    const now = Date.now()
    const cacheAge = now - cachedResult.finalState.timestamp.getTime()
    const ttl = context.operation.performance.caching.ttl

    if (cacheAge > ttl) {
      this.operationCache.delete(cacheKey)
      return null
    }

    // Check invalidation rules
    for (const rule of context.operation.performance.caching.invalidationRules) {
      if (rule.condition(context)) {
        this.operationCache.delete(cacheKey)
        return null
      }
    }

    return cachedResult
  }

  /**
   * Cache operation result
   */
  private async cacheOperationResult(context: OperationContext, result: OperationResult): Promise<void> {
    if (!context.operation.performance.caching?.enabled) {
      return
    }

    const cacheKey = context.operation.performance.caching.keyGenerator(context)
    this.operationCache.set(cacheKey, result)
  }

  /**
   * Get operation
   */
  getOperation(operationId: string): IdempotentOperation | undefined {
    return this.operations.get(operationId)
  }

  /**
   * Get all operations
   */
  getAllOperations(): IdempotentOperation[] {
    return Array.from(this.operations.values())
  }

  /**
   * Get operation state
   */
  getOperationState(operationId: string, moduleId: string): OperationState | undefined {
    const moduleStates = this.operationStates.get(operationId)
    return moduleStates?.get(moduleId)
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private async emitOperationEvent(
    executionId: string,
    operation: IdempotentOperation,
    event: string,
    state: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    await lifecycleManager.emit('before_activate', {
      moduleId: operation.id,
      tenantId: 'system',
      timestamp: new Date(),
      event: 'before_activate',
      data: { event, state, ...data }
    })
  }

  private createError(error: unknown, type: ModuleErrorType, context?: Record<string, unknown>): ModuleError {
    return {
      id: `error-${Date.now()}`,
      type,
      severity: 'high',
      code: type.toUpperCase(),
      message: error instanceof Error ? error.message : String(error),
      description: `Error during idempotent operation: ${type}`,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date(),
      context,
      recoverable: true,
      resolution: ['Check operation definition', 'Verify parameters', 'Review logs']
    }
  }

  private createLog(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: Record<string, unknown>): OperationLog {
    return {
      timestamp: new Date(),
      level,
      message,
      data
    }
  }

  private createEmptyOperationMetrics(): OperationMetrics {
    return {
      duration: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      networkIO: 0,
      diskIO: 0,
      errorCount: 0,
      successRate: 0,
      executionTime: 0,
      stateCheckTime: 0,
      validationTime: 0,
      parameterValidationTime: 0,
      cacheHitRatio: 0,
      resourceUsage: {
        memory: 0,
        cpu: 0,
        diskIO: 0,
        networkIO: 0,
        databaseConnections: 0,
        cacheOperations: 0
      },
      performance: {
        throughput: 0,
        resourceEfficiency: 0,
        idempotencyVerificationTime: 0,
        stateConsistencyCheckTime: 0
      }
    }
  }

  private createOperationMetrics(context: OperationContext, startTime: number): OperationMetrics {
    const metrics = this.createEmptyOperationMetrics()
    
    const errorLogs = context.logs.filter(log => log.level === 'error')
    metrics.errorCount = errorLogs.length
    metrics.successRate = context.logs.length > 0 ? ((context.logs.length - errorLogs.length) / context.logs.length) * 100 : 100
    metrics.executionTime = Date.now() - startTime
    
    return metrics
  }

  private initializeBuiltInOperations(): void {
    console.log('Initializing idempotent operations manager')
  }
}

// =============================================================================
// SUPPORTING CLASSES AND INTERFACES
// =============================================================================

export interface OperationRegistrationResult {
  success: boolean
  operationId: string
  operation?: IdempotentOperation
  errors: ModuleError[]
  warnings: string[]
}

export interface OperationExecutionConfig {
  /** Execution timeout */
  timeout: number
  
  /** Whether to enable performance monitoring */
  performanceMonitoring: boolean
  
  /** Whether to enable caching */
  caching: boolean
  
  /** Execution metadata */
  metadata: Record<string, unknown>
}

class OperationPerformanceMonitor {
  // Implementation for performance monitoring
}

class OperationStateManager {
  // Implementation for state management
}

class OperationValidationEngine {
  async validateOperationDefinition(operation: IdempotentOperation): Promise<{ valid: boolean, errors: string[], warnings: string[] }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate required fields
    if (!operation.id) errors.push('Operation ID is required')
    if (!operation.name) errors.push('Operation name is required')
    if (!operation.version) errors.push('Operation version is required')
    if (!operation.execute) errors.push('Operation execute function is required')
    if (!operation.checkState) errors.push('Operation checkState function is required')

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const idempotentOperationsManager = new IdempotentOperationsManager()

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function createIdempotentOperationsManager(): IdempotentOperationsManager {
  return new IdempotentOperationsManager()
}

export function getIdempotentOperationsManager(): IdempotentOperationsManager {
  return idempotentOperationsManager
}

export function registerOperation(operation: IdempotentOperation): Promise<OperationRegistrationResult> {
  return idempotentOperationsManager.registerOperation(operation)
}

export function executeOperation(
  operationId: string,
  moduleEntry: ModuleRegistryEntry,
  parameters: Record<string, unknown>,
  config: OperationExecutionConfig
): Promise<OperationResult> {
  return idempotentOperationsManager.executeOperation(operationId, moduleEntry, parameters, config)
}

export function getOperation(operationId: string): IdempotentOperation | undefined {
  return idempotentOperationsManager.getOperation(operationId)
}

export function getOperationState(operationId: string, moduleId: string): OperationState | undefined {
  return idempotentOperationsManager.getOperationState(operationId, moduleId)
}
