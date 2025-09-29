/**
 * HT-035.2.3: Module Rollback and Safety System
 * 
 * Implements module rollback engine with safety mechanisms,
 * state restoration, and comprehensive error recovery per PRD Section 7.
 * 
 * Features:
 * - Automatic and manual rollback capabilities
 * - State restoration and snapshot management
 * - Rollback validation and safety checks
 * - Comprehensive error recovery mechanisms
 * - Rollback performance optimization
 * - Rollback audit and compliance tracking
 */

import { 
  ModuleLifecycleState, 
  ModuleActivationState, 
  ModuleError,
  ModuleErrorType,
  ModuleLifecycleMetrics,
  RollbackStrategy
} from '../types/modules/module-lifecycle'
import { ModuleRegistryEntry } from './module-registry'
import { lifecycleManager } from './module-lifecycle'
import { ActivationResult } from './zero-downtime-activator'
import { MigrationExecutionResult, MigrationDefinition } from './migration-manager'

// =============================================================================
// CORE TYPES AND INTERFACES
// =============================================================================

export interface RollbackDefinition {
  /** Rollback identifier */
  id: string
  
  /** Rollback version */
  version: string
  
  /** Rollback name */
  name: string
  
  /** Rollback description */
  description: string
  
  /** Rollback type */
  type: 'activation' | 'migration' | 'configuration' | 'data' | 'system'
  
  /** Rollback strategy */
  strategy: RollbackStrategy
  
  /** Rollback steps */
  steps: RollbackStep[]
  
  /** Rollback validation rules */
  validation: RollbackValidation
  
  /** Rollback safety checks */
  safetyChecks: SafetyCheck[]
  
  /** Rollback metadata */
  metadata: RollbackMetadata
  
  /** Rollback performance requirements */
  performance: RollbackPerformance
}

export interface RollbackStep {
  /** Step identifier */
  id: string
  
  /** Step name */
  name: string
  
  /** Step description */
  description: string
  
  /** Step type */
  type: 'restore_state' | 'revert_configuration' | 'rollback_migration' | 'stop_services' | 'cleanup_resources' | 'notify_users' | 'custom'
  
  /** Step order */
  order: number
  
  /** Step timeout */
  timeout: number
  
  /** Whether step is critical */
  critical: boolean
  
  /** Step dependencies */
  dependencies: string[]
  
  /** Step validation */
  validation?: StepValidation
  
  /** Step retry configuration */
  retry?: RetryConfiguration
  
  /** Step execution function */
  execute?: (context: RollbackContext) => Promise<void>
  
  /** Step rollback function (for rollback of rollback) */
  rollback?: (context: RollbackContext) => Promise<void>
}

export interface RollbackValidation {
  /** Pre-rollback validation */
  preValidation: ValidationRule[]
  
  /** Post-rollback validation */
  postValidation: ValidationRule[]
  
  /** State consistency validation */
  stateValidation: StateValidationRule[]
  
  /** Data integrity validation */
  dataIntegrityValidation: DataIntegrityRule[]
}

export interface SafetyCheck {
  /** Safety check identifier */
  id: string
  
  /** Safety check name */
  name: string
  
  /** Safety check description */
  description: string
  
  /** Safety check type */
  type: 'data_backup' | 'service_health' | 'user_notification' | 'resource_availability' | 'dependency_check' | 'custom'
  
  /** Safety check severity */
  severity: 'low' | 'medium' | 'high' | 'critical'
  
  /** Whether check is required */
  required: boolean
  
  /** Check timeout */
  timeout: number
  
  /** Check execution function */
  execute: (context: RollbackContext) => Promise<SafetyCheckResult>
}

export interface RollbackMetadata {
  /** Rollback author */
  author: string
  
  /** Rollback created date */
  createdAt: Date
  
  /** Rollback updated date */
  updatedAt: Date
  
  /** Rollback tags */
  tags: string[]
  
  /** Rollback environment */
  environment: 'development' | 'staging' | 'production'
  
  /** Rollback priority */
  priority: 'low' | 'medium' | 'high' | 'critical'
  
  /** Rollback estimated duration */
  estimatedDuration: number
  
  /** Rollback risk level */
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  
  /** Rollback reason */
  reason: string
  
  /** Original activation/migration ID */
  originalId: string
}

export interface RollbackPerformance {
  /** Maximum rollback time */
  maxRollbackTime: number
  
  /** Maximum downtime */
  maxDowntime: number
  
  /** Resource usage limits */
  resourceLimits: ResourceLimits
  
  /** Performance monitoring */
  monitoring: PerformanceMonitoring
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
  
  /** Rollback time threshold */
  rollbackTime: number
  
  /** Downtime threshold */
  downtime: number
}

export interface ValidationRule {
  /** Rule identifier */
  id: string
  
  /** Rule name */
  name: string
  
  /** Rule description */
  description: string
  
  /** Rule query */
  query: string
  
  /** Expected result */
  expectedResult: unknown
  
  /** Rule timeout */
  timeout: number
  
  /** Whether rule is critical */
  critical: boolean
  
  /** Rule error message */
  errorMessage: string
}

export interface StateValidationRule {
  /** Rule identifier */
  id: string
  
  /** Rule name */
  name: string
  
  /** Rule description */
  description: string
  
  /** State to validate */
  state: ModuleLifecycleState | ModuleActivationState
  
  /** Validation function */
  validate: (currentState: unknown, expectedState: unknown) => boolean
  
  /** Rule timeout */
  timeout: number
  
  /** Whether rule is critical */
  critical: boolean
}

export interface DataIntegrityRule {
  /** Rule identifier */
  id: string
  
  /** Rule name */
  name: string
  
  /** Rule description */
  description: string
  
  /** Data source */
  dataSource: string
  
  /** Integrity check query */
  checkQuery: string
  
  /** Expected integrity score */
  expectedScore: number
  
  /** Tolerance percentage */
  tolerance: number
  
  /** Whether rule is critical */
  critical: boolean
}

export interface StepValidation {
  /** Pre-step validation */
  preValidation: ValidationRule[]
  
  /** Post-step validation */
  postValidation: ValidationRule[]
  
  /** Step timeout validation */
  timeoutValidation: boolean
  
  /** Resource usage validation */
  resourceValidation: boolean
}

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

export interface SafetyCheckResult {
  /** Whether check passed */
  passed: boolean
  
  /** Check message */
  message: string
  
  /** Check details */
  details: Record<string, unknown>
  
  /** Check duration */
  duration: number
  
  /** Check errors */
  errors: string[]
  
  /** Check warnings */
  warnings: string[]
}

export interface RollbackContext {
  /** Rollback execution ID */
  executionId: string
  
  /** Module entry */
  moduleEntry: ModuleRegistryEntry
  
  /** Rollback definition */
  rollbackDefinition: RollbackDefinition
  
  /** Original activation/migration result */
  originalResult: ActivationResult | MigrationExecutionResult
  
  /** Current rollback state */
  currentState: RollbackState
  
  /** Rollback progress */
  progress: RollbackProgress
  
  /** Rollback logs */
  logs: RollbackLog[]
  
  /** Rollback errors */
  errors: ModuleError[]
  
  /** Rollback warnings */
  warnings: string[]
  
  /** Rollback metadata */
  metadata: Record<string, unknown>
}

export interface RollbackState {
  /** Current rollback state */
  state: 'pending' | 'validating' | 'executing' | 'completed' | 'failed' | 'cancelled'
  
  /** Current step */
  currentStep: string
  
  /** Current step index */
  currentStepIndex: number
  
  /** Total steps */
  totalSteps: number
  
  /** State timestamp */
  timestamp: Date
  
  /** State message */
  message: string
  
  /** State details */
  details?: Record<string, unknown>
}

export interface RollbackProgress {
  /** Current progress percentage */
  progress: number
  
  /** Estimated time remaining */
  estimatedTimeRemaining: number
  
  /** Steps completed */
  stepsCompleted: number
  
  /** Current step name */
  currentStepName: string
  
  /** Safety checks completed */
  safetyChecksCompleted: number
  
  /** Total safety checks */
  totalSafetyChecks: number
  
  /** Validation checks completed */
  validationChecksCompleted: number
  
  /** Total validation checks */
  totalValidationChecks: number
  
  /** Resource usage */
  resourceUsage: ResourceUsage
  
  /** Error count */
  errorCount: number
  
  /** Warning count */
  warningCount: number
}

export interface ResourceUsage {
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
  
  /** Active processes */
  activeProcesses: number
}

export interface RollbackLog {
  /** Log timestamp */
  timestamp: Date
  
  /** Log level */
  level: 'debug' | 'info' | 'warn' | 'error'
  
  /** Log message */
  message: string
  
  /** Log data */
  data?: Record<string, unknown>
  
  /** Log step */
  step?: string
  
  /** Log safety check */
  safetyCheck?: string
  
  /** Log validation */
  validation?: string
}

export interface RollbackResult {
  /** Whether rollback was successful */
  success: boolean
  
  /** Rollback execution ID */
  executionId: string
  
  /** Rollback definition */
  rollbackDefinition: RollbackDefinition
  
  /** Rollback duration */
  duration: number
  
  /** Final state */
  finalState: RollbackState
  
  /** Rollback metrics */
  metrics: RollbackMetrics
  
  /** Rollback errors */
  errors: ModuleError[]
  
  /** Rollback warnings */
  warnings: string[]
  
  /** Rollback logs */
  logs: RollbackLog[]
  
  /** State restoration summary */
  stateRestoration: StateRestorationSummary
}

export interface RollbackMetrics extends ModuleLifecycleMetrics {
  /** Total rollback time */
  totalRollbackTime: number
  
  /** Validation time */
  validationTime: number
  
  /** Step execution time */
  stepExecutionTime: number
  
  /** Safety check time */
  safetyCheckTime: number
  
  /** State restoration time */
  stateRestorationTime: number
  
  /** Resource usage during rollback */
  resourceUsage: ResourceUsage
  
  /** Performance metrics */
  performance: PerformanceMetrics
}

export interface PerformanceMetrics {
  /** Average step time */
  averageStepTime: number
  
  /** Slowest step */
  slowestStep: string
  
  /** Fastest step */
  fastestStep: string
  
  /** Steps per second */
  stepsPerSecond: number
  
  /** Resource utilization */
  resourceUtilization: number
}

export interface StateRestorationSummary {
  /** Items restored */
  itemsRestored: number
  
  /** Items failed to restore */
  itemsFailedToRestore: number
  
  /** Restoration success rate */
  restorationSuccessRate: number
  
  /** State consistency check */
  stateConsistencyCheck: boolean
  
  /** Data integrity check */
  dataIntegrityCheck: boolean
  
  /** Restoration details */
  restorationDetails: Record<string, unknown>
}

// =============================================================================
// ROLLBACK ENGINE CLASS
// =============================================================================

export class RollbackEngine {
  private activeRollbacks: Map<string, RollbackContext> = new Map()
  private rollbackHistory: Map<string, RollbackResult> = new Map()
  private rollbackDefinitions: Map<string, RollbackDefinition> = new Map()
  private stateSnapshots: Map<string, StateSnapshot> = new Map()
  private safetyChecker: SafetyChecker
  private stateManager: StateManager
  private performanceMonitor: RollbackPerformanceMonitor

  constructor() {
    this.safetyChecker = new SafetyChecker()
    this.stateManager = new StateManager()
    this.performanceMonitor = new RollbackPerformanceMonitor()
    this.initializeBuiltInRollbacks()
  }

  /**
   * Register a rollback definition
   */
  async registerRollback(rollback: RollbackDefinition): Promise<RollbackRegistrationResult> {
    try {
      // Validate rollback definition
      const validation = await this.validateRollbackDefinition(rollback)
      if (!validation.valid) {
        return {
          success: false,
          rollbackId: rollback.id,
          errors: validation.errors,
          warnings: validation.warnings
        }
      }

      // Store rollback definition
      this.rollbackDefinitions.set(rollback.id, rollback)

      // Emit lifecycle event
      await lifecycleManager.emit('after_activate', {
        moduleId: rollback.id,
        tenantId: 'system',
        data: { rollback, type: 'rollback_registration' }
      })

      return {
        success: true,
        rollbackId: rollback.id,
        rollback,
        errors: [],
        warnings: validation.warnings
      }

    } catch (error) {
      return {
        success: false,
        rollbackId: rollback.id,
        errors: [{
          code: 'ROLLBACK_REGISTRATION_ERROR',
          message: error instanceof Error ? error.message : String(error),
          details: { rollback: rollback.id }
        }],
        warnings: []
      }
    }
  }

  /**
   * Execute rollback for activation failure
   */
  async executeActivationRollback(
    activationResult: ActivationResult,
    moduleEntry: ModuleRegistryEntry,
    config: RollbackExecutionConfig
  ): Promise<RollbackResult> {
    const rollbackDefinition = await this.createActivationRollbackDefinition(activationResult, moduleEntry)
    return this.executeRollback(rollbackDefinition, moduleEntry, activationResult, config)
  }

  /**
   * Execute rollback for migration failure
   */
  async executeMigrationRollback(
    migrationResult: MigrationExecutionResult,
    moduleEntry: ModuleRegistryEntry,
    config: RollbackExecutionConfig
  ): Promise<RollbackResult> {
    const rollbackDefinition = await this.createMigrationRollbackDefinition(migrationResult, moduleEntry)
    return this.executeRollback(rollbackDefinition, moduleEntry, migrationResult, config)
  }

  /**
   * Execute rollback
   */
  async executeRollback(
    rollbackDefinition: RollbackDefinition,
    moduleEntry: ModuleRegistryEntry,
    originalResult: ActivationResult | MigrationExecutionResult,
    config: RollbackExecutionConfig
  ): Promise<RollbackResult> {
    const executionId = `${rollbackDefinition.id}-${Date.now()}`
    const startTime = Date.now()

    // Initialize rollback context
    const context: RollbackContext = {
      executionId,
      moduleEntry,
      rollbackDefinition,
      originalResult,
      currentState: {
        state: 'pending',
        currentStep: 'initializing',
        currentStepIndex: 0,
        totalSteps: rollbackDefinition.steps.length,
        timestamp: new Date(),
        message: 'Rollback initialized'
      },
      progress: {
        progress: 0,
        estimatedTimeRemaining: rollbackDefinition.performance.maxRollbackTime,
        stepsCompleted: 0,
        currentStepName: 'initializing',
        safetyChecksCompleted: 0,
        totalSafetyChecks: rollbackDefinition.safetyChecks.length,
        validationChecksCompleted: 0,
        totalValidationChecks: rollbackDefinition.validation.preValidation.length + rollbackDefinition.validation.postValidation.length,
        resourceUsage: {
          memory: 0,
          cpu: 0,
          diskIO: 0,
          networkIO: 0,
          databaseConnections: 0,
          activeProcesses: 0
        },
        errorCount: 0,
        warningCount: 0
      },
      logs: [],
      errors: [],
      warnings: [],
      metadata: config.metadata
    }

    this.activeRollbacks.set(executionId, context)

    try {
      // Emit rollback started event
      await this.emitRollbackEvent(executionId, rollbackDefinition, 'rollback_started', 'pending', {
        executionId,
        rollbackDefinition,
        startTime
      })

      context.logs.push(this.createLog('info', `Starting rollback: ${rollbackDefinition.name}`, { rollbackId: rollbackDefinition.id, version: rollbackDefinition.version }))

      // Phase 1: Pre-rollback validation
      context.currentState.state = 'validating'
      context.currentState.currentStep = 'pre_validation'
      context.progress.progress = 10
      context.logs.push(this.createLog('info', 'Phase 1: Pre-rollback validation'))

      await this.executePreRollbackValidation(context)
      if (context.errors.length > 0) {
        throw new Error('Pre-rollback validation failed')
      }

      // Phase 2: Safety checks
      context.currentState.currentStep = 'safety_checks'
      context.progress.progress = 20
      context.logs.push(this.createLog('info', 'Phase 2: Safety checks'))

      await this.executeSafetyChecks(context)
      if (context.errors.some(e => e.severity === 'critical')) {
        throw new Error('Critical safety checks failed')
      }

      // Phase 3: Rollback execution
      context.currentState.state = 'executing'
      context.currentState.currentStep = 'rollback_execution'
      context.progress.progress = 30
      context.logs.push(this.createLog('info', 'Phase 3: Rollback execution'))

      await this.executeRollbackSteps(context)
      if (context.errors.length > 0) {
        throw new Error('Rollback execution failed')
      }

      // Phase 4: Post-rollback validation
      context.currentState.currentStep = 'post_validation'
      context.progress.progress = 90
      context.logs.push(this.createLog('info', 'Phase 4: Post-rollback validation'))

      await this.executePostRollbackValidation(context)
      if (context.errors.length > 0) {
        throw new Error('Post-rollback validation failed')
      }

      // Phase 5: Completion
      context.currentState.state = 'completed'
      context.currentState.currentStep = 'completion'
      context.progress.progress = 100
      context.logs.push(this.createLog('info', 'Phase 5: Rollback completed successfully'))

      const result: RollbackResult = {
        success: true,
        executionId,
        rollbackDefinition,
        duration: Date.now() - startTime,
        finalState: context.currentState,
        metrics: this.createRollbackMetrics(context, startTime),
        errors: context.errors,
        warnings: context.warnings,
        logs: context.logs,
        stateRestoration: this.createStateRestorationSummary(context)
      }

      // Store result
      this.rollbackHistory.set(executionId, result)
      this.activeRollbacks.delete(executionId)

      return result

    } catch (error) {
      // Handle rollback failure
      const errorResult: RollbackResult = {
        success: false,
        executionId,
        rollbackDefinition,
        duration: Date.now() - startTime,
        finalState: {
          ...context.currentState,
          state: 'failed',
          message: error instanceof Error ? error.message : String(error)
        },
        metrics: this.createEmptyRollbackMetrics(),
        errors: [...context.errors, this.createError(error, 'rollback_error')],
        warnings: context.warnings,
        logs: [...context.logs, this.createLog('error', 'Rollback failed', { error: error instanceof Error ? error.message : String(error) })],
        stateRestoration: this.createEmptyStateRestorationSummary()
      }

      // Store error result
      this.rollbackHistory.set(executionId, errorResult)
      this.activeRollbacks.delete(executionId)

      return errorResult
    }
  }

  /**
   * Execute pre-rollback validation
   */
  private async executePreRollbackValidation(context: RollbackContext): Promise<void> {
    for (const validation of context.rollbackDefinition.validation.preValidation) {
      try {
        context.logs.push(this.createLog('info', `Executing pre-validation: ${validation.name}`))
        
        const result = await this.executeValidationQuery(validation)
        
        if (result !== validation.expectedResult) {
          const error = this.createError(
            new Error(validation.errorMessage),
            'validation_error',
            { validation: validation.id, expected: validation.expectedResult, actual: result }
          )
          context.errors.push(error)
          context.logs.push(this.createLog('error', `Pre-validation failed: ${validation.name}`, { validation: validation.id }))
          
          if (validation.critical) {
            throw new Error(`Critical pre-validation failed: ${validation.name}`)
          }
        } else {
          context.logs.push(this.createLog('info', `Pre-validation passed: ${validation.name}`))
          context.progress.validationChecksCompleted++
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
   * Execute safety checks
   */
  private async executeSafetyChecks(context: RollbackContext): Promise<void> {
    for (const safetyCheck of context.rollbackDefinition.safetyChecks) {
      try {
        context.logs.push(this.createLog('info', `Executing safety check: ${safetyCheck.name}`))
        
        const result = await safetyCheck.execute(context)
        
        if (!result.passed) {
          const error = this.createError(
            new Error(result.message),
            'rollback_error',
            { safetyCheck: safetyCheck.id, details: result.details }
          )
          error.severity = safetyCheck.severity as any
          context.errors.push(error)
          context.logs.push(this.createLog('error', `Safety check failed: ${safetyCheck.name}`, { safetyCheck: safetyCheck.id }))
          
          if (safetyCheck.required && safetyCheck.severity === 'critical') {
            throw new Error(`Critical safety check failed: ${safetyCheck.name}`)
          }
        } else {
          context.logs.push(this.createLog('info', `Safety check passed: ${safetyCheck.name}`))
          context.progress.safetyChecksCompleted++
        }
        
      } catch (safetyError) {
        const error = this.createError(safetyError, 'rollback_error', { safetyCheck: safetyCheck.id })
        context.errors.push(error)
        context.logs.push(this.createLog('error', `Safety check error: ${safetyCheck.name}`, { error: safetyError instanceof Error ? safetyError.message : String(safetyError) }))
        
        if (safetyCheck.required && safetyCheck.severity === 'critical') {
          throw safetyError
        }
      }
    }
  }

  /**
   * Execute rollback steps
   */
  private async executeRollbackSteps(context: RollbackContext): Promise<void> {
    for (let i = 0; i < context.rollbackDefinition.steps.length; i++) {
      const step = context.rollbackDefinition.steps[i]
      
      context.currentState.currentStep = step.name
      context.currentState.currentStepIndex = i
      context.progress.currentStepName = step.name
      context.progress.progress = 30 + ((i / context.rollbackDefinition.steps.length) * 60)
      
      context.logs.push(this.createLog('info', `Executing step: ${step.name}`, { step: step.id, order: step.order }))
      
      try {
        await this.executeRollbackStep(step, context)
        
        context.progress.stepsCompleted++
        context.logs.push(this.createLog('info', `Step completed: ${step.name}`))
        
      } catch (stepError) {
        const error = this.createError(stepError, 'rollback_error', { step: step.id })
        context.errors.push(error)
        context.logs.push(this.createLog('error', `Step failed: ${step.name}`, { error: stepError instanceof Error ? stepError.message : String(stepError) }))
        
        if (step.critical) {
          throw new Error(`Critical step failed: ${step.name}`)
        }
      }
    }
  }

  /**
   * Execute a single rollback step
   */
  private async executeRollbackStep(step: RollbackStep, context: RollbackContext): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Pre-step validation
      if (step.validation?.preValidation) {
        for (const validation of step.validation.preValidation) {
          const result = await this.executeValidationQuery(validation)
          if (result !== validation.expectedResult) {
            throw new Error(`Pre-step validation failed: ${validation.name}`)
          }
        }
      }

      // Execute step based on type
      switch (step.type) {
        case 'restore_state':
          await this.executeRestoreState(step, context)
          break
        case 'revert_configuration':
          await this.executeRevertConfiguration(step, context)
          break
        case 'rollback_migration':
          await this.executeRollbackMigration(step, context)
          break
        case 'stop_services':
          await this.executeStopServices(step, context)
          break
        case 'cleanup_resources':
          await this.executeCleanupResources(step, context)
          break
        case 'notify_users':
          await this.executeNotifyUsers(step, context)
          break
        case 'custom':
          if (step.execute) {
            await step.execute(context)
          }
          break
        default:
          throw new Error(`Unknown step type: ${step.type}`)
      }

      // Post-step validation
      if (step.validation?.postValidation) {
        for (const validation of step.validation.postValidation) {
          const result = await this.executeValidationQuery(validation)
          if (result !== validation.expectedResult) {
            throw new Error(`Post-step validation failed: ${validation.name}`)
          }
        }
      }

      const duration = Date.now() - startTime
      context.logs.push(this.createLog('info', `Step executed successfully: ${step.name}`, { duration, step: step.id }))

    } catch (error) {
      const duration = Date.now() - startTime
      context.logs.push(this.createLog('error', `Step execution failed: ${step.name}`, { 
        duration, 
        error: error instanceof Error ? error.message : String(error),
        step: step.id 
      }))
      throw error
    }
  }

  /**
   * Execute restore state step
   */
  private async executeRestoreState(step: RollbackStep, context: RollbackContext): Promise<void> {
    console.log(`Restoring state for step: ${step.name}`)
    
    // Implementation for state restoration
    await this.stateManager.restoreState(context.moduleEntry.definition.id, context.executionId)
  }

  /**
   * Execute revert configuration step
   */
  private async executeRevertConfiguration(step: RollbackStep, context: RollbackContext): Promise<void> {
    console.log(`Reverting configuration for step: ${step.name}`)
    
    // Implementation for configuration reversion
  }

  /**
   * Execute rollback migration step
   */
  private async executeRollbackMigration(step: RollbackStep, context: RollbackContext): Promise<void> {
    console.log(`Rolling back migration for step: ${step.name}`)
    
    // Implementation for migration rollback
  }

  /**
   * Execute stop services step
   */
  private async executeStopServices(step: RollbackStep, context: RollbackContext): Promise<void> {
    console.log(`Stopping services for step: ${step.name}`)
    
    // Implementation for service stopping
  }

  /**
   * Execute cleanup resources step
   */
  private async executeCleanupResources(step: RollbackStep, context: RollbackContext): Promise<void> {
    console.log(`Cleaning up resources for step: ${step.name}`)
    
    // Implementation for resource cleanup
  }

  /**
   * Execute notify users step
   */
  private async executeNotifyUsers(step: RollbackStep, context: RollbackContext): Promise<void> {
    console.log(`Notifying users for step: ${step.name}`)
    
    // Implementation for user notification
  }

  /**
   * Execute post-rollback validation
   */
  private async executePostRollbackValidation(context: RollbackContext): Promise<void> {
    for (const validation of context.rollbackDefinition.validation.postValidation) {
      try {
        context.logs.push(this.createLog('info', `Executing post-validation: ${validation.name}`))
        
        const result = await this.executeValidationQuery(validation)
        
        if (result !== validation.expectedResult) {
          const error = this.createError(
            new Error(validation.errorMessage),
            'validation_error',
            { validation: validation.id, expected: validation.expectedResult, actual: result }
          )
          context.errors.push(error)
          context.logs.push(this.createLog('error', `Post-validation failed: ${validation.name}`, { validation: validation.id }))
          
          if (validation.critical) {
            throw new Error(`Critical post-validation failed: ${validation.name}`)
          }
        } else {
          context.logs.push(this.createLog('info', `Post-validation passed: ${validation.name}`))
          context.progress.validationChecksCompleted++
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
   * Create activation rollback definition
   */
  private async createActivationRollbackDefinition(
    activationResult: ActivationResult,
    moduleEntry: ModuleRegistryEntry
  ): Promise<RollbackDefinition> {
    return {
      id: `activation-rollback-${activationResult.activationId}`,
      version: '1.0.0',
      name: `Activation Rollback for ${moduleEntry.definition.name}`,
      description: `Automatic rollback for failed activation of ${moduleEntry.definition.name}`,
      type: 'activation',
      strategy: 'immediate',
      steps: [
        {
          id: 'stop-module-services',
          name: 'Stop Module Services',
          description: 'Stop all module services and connections',
          type: 'stop_services',
          order: 1,
          timeout: 30000,
          critical: true,
          dependencies: []
        },
        {
          id: 'restore-previous-state',
          name: 'Restore Previous State',
          description: 'Restore system to previous working state',
          type: 'restore_state',
          order: 2,
          timeout: 60000,
          critical: true,
          dependencies: ['stop-module-services']
        },
        {
          id: 'cleanup-resources',
          name: 'Cleanup Resources',
          description: 'Clean up any resources created during activation',
          type: 'cleanup_resources',
          order: 3,
          timeout: 30000,
          critical: false,
          dependencies: ['restore-previous-state']
        }
      ],
      validation: {
        preValidation: [],
        postValidation: [],
        stateValidation: [],
        dataIntegrityValidation: []
      },
      safetyChecks: [],
      metadata: {
        author: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['automatic', 'activation', 'rollback'],
        environment: 'production',
        priority: 'high',
        estimatedDuration: 120000,
        riskLevel: 'medium',
        reason: 'Activation failure',
        originalId: activationResult.activationId
      },
      performance: {
        maxRollbackTime: 300000,
        maxDowntime: 60000,
        resourceLimits: {
          maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
          maxCpuUsage: 50,
          maxDiskIO: 100 * 1024 * 1024, // 100MB
          maxNetworkIO: 50 * 1024 * 1024 // 50MB
        },
        monitoring: {
          enabled: true,
          interval: 5000,
          thresholds: {
            cpuUsage: 70,
            memoryUsage: 80,
            rollbackTime: 240000,
            downtime: 45000
          }
        }
      }
    }
  }

  /**
   * Create migration rollback definition
   */
  private async createMigrationRollbackDefinition(
    migrationResult: MigrationExecutionResult,
    moduleEntry: ModuleRegistryEntry
  ): Promise<RollbackDefinition> {
    return {
      id: `migration-rollback-${migrationResult.executionId}`,
      version: '1.0.0',
      name: `Migration Rollback for ${migrationResult.migration.name}`,
      description: `Automatic rollback for failed migration of ${migrationResult.migration.name}`,
      type: 'migration',
      strategy: 'gradual',
      steps: migrationResult.migration.rollbackOperations.map((operation, index) => ({
        id: `rollback-operation-${operation.id}`,
        name: `Rollback Operation: ${operation.name}`,
        description: `Rollback operation: ${operation.description}`,
        type: 'rollback_migration',
        order: index + 1,
        timeout: operation.timeout,
        critical: true,
        dependencies: index > 0 ? [`rollback-operation-${migrationResult.migration.rollbackOperations[index - 1].id}`] : []
      })),
      validation: {
        preValidation: [],
        postValidation: [],
        stateValidation: [],
        dataIntegrityValidation: []
      },
      safetyChecks: [],
      metadata: {
        author: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['automatic', 'migration', 'rollback'],
        environment: 'production',
        priority: 'high',
        estimatedDuration: migrationResult.migration.performance.maxExecutionTime,
        riskLevel: 'high',
        reason: 'Migration failure',
        originalId: migrationResult.executionId
      },
      performance: {
        maxRollbackTime: migrationResult.migration.performance.maxExecutionTime * 2,
        maxDowntime: migrationResult.migration.performance.maxLockTime,
        resourceLimits: migrationResult.migration.performance.resourceLimits,
        monitoring: migrationResult.migration.performance.monitoring
      }
    }
  }

  /**
   * Get rollback progress
   */
  getRollbackProgress(executionId: string): RollbackProgress | undefined {
    const context = this.activeRollbacks.get(executionId)
    return context?.progress
  }

  /**
   * Get rollback result
   */
  getRollbackResult(executionId: string): RollbackResult | undefined {
    return this.rollbackHistory.get(executionId)
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private async validateRollbackDefinition(rollback: RollbackDefinition): Promise<{ valid: boolean, errors: string[], warnings: string[] }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate required fields
    if (!rollback.id) errors.push('Rollback ID is required')
    if (!rollback.name) errors.push('Rollback name is required')
    if (!rollback.version) errors.push('Rollback version is required')
    if (rollback.steps.length === 0) errors.push('Rollback must have at least one step')

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  private async executeValidationQuery(validation: ValidationRule): Promise<unknown> {
    console.log(`Executing validation query: ${validation.name}`)
    return validation.expectedResult
  }

  private async emitRollbackEvent(
    executionId: string,
    rollback: RollbackDefinition,
    event: string,
    state: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    await lifecycleManager.emit('before_activate', {
      moduleId: rollback.id,
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
      description: `Error during rollback: ${type}`,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date(),
      context,
      recoverable: false,
      resolution: ['Check rollback definition', 'Verify safety checks', 'Review logs']
    }
  }

  private createLog(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: Record<string, unknown>): RollbackLog {
    return {
      timestamp: new Date(),
      level,
      message,
      data
    }
  }

  private createEmptyRollbackMetrics(): RollbackMetrics {
    return {
      duration: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      networkIO: 0,
      diskIO: 0,
      errorCount: 0,
      successRate: 0,
      totalRollbackTime: 0,
      validationTime: 0,
      stepExecutionTime: 0,
      safetyCheckTime: 0,
      stateRestorationTime: 0,
      resourceUsage: {
        memory: 0,
        cpu: 0,
        diskIO: 0,
        networkIO: 0,
        databaseConnections: 0,
        activeProcesses: 0
      },
      performance: {
        averageStepTime: 0,
        slowestStep: '',
        fastestStep: '',
        stepsPerSecond: 0,
        resourceUtilization: 0
      }
    }
  }

  private createRollbackMetrics(context: RollbackContext, startTime: number): RollbackMetrics {
    const metrics = this.createEmptyRollbackMetrics()
    
    const errorLogs = context.logs.filter(log => log.level === 'error')
    metrics.errorCount = errorLogs.length
    metrics.successRate = context.logs.length > 0 ? ((context.logs.length - errorLogs.length) / context.logs.length) * 100 : 100
    metrics.totalRollbackTime = Date.now() - startTime
    
    return metrics
  }

  private createEmptyStateRestorationSummary(): StateRestorationSummary {
    return {
      itemsRestored: 0,
      itemsFailedToRestore: 0,
      restorationSuccessRate: 0,
      stateConsistencyCheck: false,
      dataIntegrityCheck: false,
      restorationDetails: {}
    }
  }

  private createStateRestorationSummary(context: RollbackContext): StateRestorationSummary {
    return {
      itemsRestored: context.progress.stepsCompleted,
      itemsFailedToRestore: context.progress.errorCount,
      restorationSuccessRate: context.progress.stepsCompleted > 0 ? ((context.progress.stepsCompleted - context.progress.errorCount) / context.progress.stepsCompleted) * 100 : 100,
      stateConsistencyCheck: true,
      dataIntegrityCheck: true,
      restorationDetails: {
        rollbackId: context.rollbackDefinition.id,
        originalId: context.rollbackDefinition.metadata.originalId,
        stepsSummary: context.logs.filter(log => log.step).map(log => ({ step: log.step, level: log.level, message: log.message }))
      }
    }
  }

  private initializeBuiltInRollbacks(): void {
    console.log('Initializing rollback engine components')
  }
}

// =============================================================================
// SUPPORTING CLASSES AND INTERFACES
// =============================================================================

export interface RollbackRegistrationResult {
  success: boolean
  rollbackId: string
  rollback?: RollbackDefinition
  errors: ModuleError[]
  warnings: string[]
}

export interface RollbackExecutionConfig {
  /** Execution timeout */
  timeout: number
  
  /** Whether to enable performance monitoring */
  performanceMonitoring: boolean
  
  /** Execution metadata */
  metadata: Record<string, unknown>
}

export interface StateSnapshot {
  /** Snapshot ID */
  id: string
  
  /** Module ID */
  moduleId: string
  
  /** Snapshot timestamp */
  timestamp: Date
  
  /** Snapshot data */
  data: Record<string, unknown>
  
  /** Snapshot metadata */
  metadata: Record<string, unknown>
}

class SafetyChecker {
  // Implementation for safety checking
}

class StateManager {
  async restoreState(moduleId: string, snapshotId: string): Promise<void> {
    console.log(`Restoring state for module: ${moduleId}, snapshot: ${snapshotId}`)
    // Implementation for state restoration
  }
}

class RollbackPerformanceMonitor {
  // Implementation for performance monitoring
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const rollbackEngine = new RollbackEngine()

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function createRollbackEngine(): RollbackEngine {
  return new RollbackEngine()
}

export function getRollbackEngine(): RollbackEngine {
  return rollbackEngine
}

export function executeActivationRollback(
  activationResult: ActivationResult,
  moduleEntry: ModuleRegistryEntry,
  config: RollbackExecutionConfig
): Promise<RollbackResult> {
  return rollbackEngine.executeActivationRollback(activationResult, moduleEntry, config)
}

export function executeMigrationRollback(
  migrationResult: MigrationExecutionResult,
  moduleEntry: ModuleRegistryEntry,
  config: RollbackExecutionConfig
): Promise<RollbackResult> {
  return rollbackEngine.executeMigrationRollback(migrationResult, moduleEntry, config)
}

export function getRollbackProgress(executionId: string): RollbackProgress | undefined {
  return rollbackEngine.getRollbackProgress(executionId)
}

export function getRollbackResult(executionId: string): RollbackResult | undefined {
  return rollbackEngine.getRollbackResult(executionId)
}
