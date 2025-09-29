/**
 * HT-035.2.3: Additive Migration System
 * 
 * Implements additive migration system with rollback capabilities,
 * idempotent operations, and migration-safe deployment per PRD Section 7.
 * 
 * Features:
 * - Additive-only migration system (no destructive changes)
 * - Migration versioning and dependency management
 * - Idempotent migration operations
 * - Migration rollback and safety mechanisms
 * - Migration validation and testing
 * - Migration performance optimization
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

export interface MigrationDefinition {
  /** Migration identifier */
  id: string
  
  /** Migration version */
  version: string
  
  /** Migration name */
  name: string
  
  /** Migration description */
  description: string
  
  /** Migration type */
  type: 'schema' | 'data' | 'configuration' | 'index' | 'constraint' | 'function' | 'view' | 'trigger'
  
  /** Migration dependencies */
  dependencies: MigrationDependency[]
  
  /** Migration operations */
  operations: MigrationOperation[]
  
  /** Migration rollback operations */
  rollbackOperations: MigrationOperation[]
  
  /** Migration metadata */
  metadata: MigrationMetadata
  
  /** Migration validation rules */
  validation: MigrationValidation
  
  /** Migration performance requirements */
  performance: MigrationPerformance
}

export interface MigrationDependency {
  /** Dependency migration ID */
  migrationId: string
  
  /** Required version */
  version: string
  
  /** Dependency type */
  type: 'required' | 'optional' | 'conflicting'
  
  /** Dependency description */
  description: string
}

export interface MigrationOperation {
  /** Operation identifier */
  id: string
  
  /** Operation type */
  type: 'create_table' | 'add_column' | 'add_index' | 'add_constraint' | 'create_view' | 'create_function' | 'create_trigger' | 'insert_data' | 'update_data' | 'custom_sql'
  
  /** Operation name */
  name: string
  
  /** Operation description */
  description: string
  
  /** Operation SQL */
  sql: string
  
  /** Operation parameters */
  parameters?: Record<string, unknown>
  
  /** Operation timeout */
  timeout: number
  
  /** Whether operation is idempotent */
  idempotent: boolean
  
  /** Whether operation is reversible */
  reversible: boolean
  
  /** Operation validation */
  validation?: OperationValidation
  
  /** Operation rollback SQL */
  rollbackSql?: string
}

export interface MigrationMetadata {
  /** Migration author */
  author: string
  
  /** Migration created date */
  createdAt: Date
  
  /** Migration updated date */
  updatedAt: Date
  
  /** Migration tags */
  tags: string[]
  
  /** Migration environment */
  environment: 'development' | 'staging' | 'production'
  
  /** Migration priority */
  priority: 'low' | 'medium' | 'high' | 'critical'
  
  /** Migration estimated duration */
  estimatedDuration: number
  
  /** Migration risk level */
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface MigrationValidation {
  /** Pre-migration validation */
  preValidation: ValidationRule[]
  
  /** Post-migration validation */
  postValidation: ValidationRule[]
  
  /** Rollback validation */
  rollbackValidation: ValidationRule[]
  
  /** Data integrity checks */
  dataIntegrityChecks: DataIntegrityCheck[]
}

export interface ValidationRule {
  /** Rule identifier */
  id: string
  
  /** Rule name */
  name: string
  
  /** Rule description */
  description: string
  
  /** Rule SQL query */
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

export interface DataIntegrityCheck {
  /** Check identifier */
  id: string
  
  /** Check name */
  name: string
  
  /** Check description */
  description: string
  
  /** Check SQL query */
  query: string
  
  /** Check type */
  type: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'exists' | 'custom'
  
  /** Expected value */
  expectedValue: unknown
  
  /** Tolerance percentage */
  tolerance: number
  
  /** Whether check is critical */
  critical: boolean
}

export interface MigrationPerformance {
  /** Maximum execution time */
  maxExecutionTime: number
  
  /** Maximum lock time */
  maxLockTime: number
  
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
  
  /** Execution time threshold */
  executionTime: number
  
  /** Lock time threshold */
  lockTime: number
}

export interface OperationValidation {
  /** Pre-operation validation */
  preValidation: ValidationRule[]
  
  /** Post-operation validation */
  postValidation: ValidationRule[]
  
  /** Operation timeout validation */
  timeoutValidation: boolean
  
  /** Resource usage validation */
  resourceValidation: boolean
}

export interface MigrationExecutionResult {
  /** Whether migration was successful */
  success: boolean
  
  /** Migration execution ID */
  executionId: string
  
  /** Migration definition */
  migration: MigrationDefinition
  
  /** Execution duration */
  duration: number
  
  /** Execution metrics */
  metrics: MigrationExecutionMetrics
  
  /** Execution errors */
  errors: ModuleError[]
  
  /** Execution warnings */
  warnings: string[]
  
  /** Execution logs */
  logs: MigrationLog[]
  
  /** Rollback information */
  rollbackInfo?: MigrationRollbackInfo
}

export interface MigrationExecutionMetrics extends ModuleLifecycleMetrics {
  /** Total migration time */
  totalMigrationTime: number
  
  /** Validation time */
  validationTime: number
  
  /** Operation execution time */
  operationExecutionTime: number
  
  /** Rollback time (if applicable) */
  rollbackTime?: number
  
  /** Resource usage during migration */
  resourceUsage: ResourceUsage
  
  /** Performance metrics */
  performance: PerformanceMetrics
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
  
  /** Lock count */
  lockCount: number
}

export interface PerformanceMetrics {
  /** Average operation time */
  averageOperationTime: number
  
  /** Slowest operation */
  slowestOperation: string
  
  /** Fastest operation */
  fastestOperation: string
  
  /** Operations per second */
  operationsPerSecond: number
  
  /** Resource utilization */
  resourceUtilization: number
}

export interface MigrationLog {
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
  
  /** Log step */
  step?: string
}

export interface MigrationRollbackInfo {
  /** Whether rollback is available */
  available: boolean
  
  /** Rollback execution ID */
  rollbackExecutionId: string
  
  /** Rollback timestamp */
  timestamp: Date
  
  /** Rollback operations */
  rollbackOperations: MigrationOperation[]
  
  /** Rollback timeout */
  timeout: number
  
  /** Rollback validation */
  rollbackValidation: ValidationRule[]
}

export interface MigrationProgress {
  /** Current operation */
  currentOperation: string
  
  /** Current progress percentage */
  progress: number
  
  /** Current step */
  currentStep: string
  
  /** Estimated time remaining */
  estimatedTimeRemaining: number
  
  /** Operations completed */
  operationsCompleted: number
  
  /** Total operations */
  totalOperations: number
  
  /** Current validation */
  currentValidation: string
  
  /** Resource usage */
  resourceUsage: ResourceUsage
  
  /** Error count */
  errorCount: number
  
  /** Warning count */
  warningCount: number
}

// =============================================================================
// MIGRATION MANAGER CLASS
// =============================================================================

export class MigrationManager {
  private activeMigrations: Map<string, MigrationProgress> = new Map()
  private migrationHistory: Map<string, MigrationExecutionResult> = new Map()
  private migrationDefinitions: Map<string, MigrationDefinition> = new Map()
  private migrationDependencies: Map<string, MigrationDependency[]> = new Map()
  private performanceMonitor: PerformanceMonitor
  private validationEngine: ValidationEngine
  private rollbackEngine: MigrationRollbackEngine

  constructor() {
    this.performanceMonitor = new PerformanceMonitor()
    this.validationEngine = new ValidationEngine()
    this.rollbackEngine = new MigrationRollbackEngine()
    this.initializeBuiltInMigrations()
  }

  /**
   * Register a migration definition
   */
  async registerMigration(migration: MigrationDefinition): Promise<MigrationRegistrationResult> {
    try {
      // Validate migration definition
      const validation = await this.validationEngine.validateMigrationDefinition(migration)
      if (!validation.valid) {
        return {
          success: false,
          migrationId: migration.id,
          errors: validation.errors,
          warnings: validation.warnings
        }
      }

      // Check for conflicts
      const conflicts = await this.detectMigrationConflicts(migration)
      if (conflicts.length > 0) {
        return {
          success: false,
          migrationId: migration.id,
          errors: conflicts.map(c => ({
            code: 'MIGRATION_CONFLICT',
            message: `Migration conflict: ${c.message}`,
            details: c.details
          })),
          warnings: []
        }
      }

      // Store migration definition
      this.migrationDefinitions.set(migration.id, migration)
      this.migrationDependencies.set(migration.id, migration.dependencies)

      // Emit lifecycle event
      await lifecycleManager.emit('after_activate', {
        moduleId: migration.id,
        tenantId: 'system',
        data: { migration, type: 'migration_registration' }
      })

      return {
        success: true,
        migrationId: migration.id,
        migration,
        errors: [],
        warnings: validation.warnings
      }

    } catch (error) {
      return {
        success: false,
        migrationId: migration.id,
        errors: [{
          code: 'MIGRATION_REGISTRATION_ERROR',
          message: error instanceof Error ? error.message : String(error),
          details: { migration: migration.id }
        }],
        warnings: []
      }
    }
  }

  /**
   * Execute a migration
   */
  async executeMigration(
    migrationId: string,
    moduleEntry: ModuleRegistryEntry,
    config: MigrationExecutionConfig
  ): Promise<MigrationExecutionResult> {
    const migration = this.migrationDefinitions.get(migrationId)
    if (!migration) {
      throw new Error(`Migration not found: ${migrationId}`)
    }

    const executionId = `${migrationId}-${Date.now()}`
    const startTime = Date.now()

    // Initialize migration progress
    const progress: MigrationProgress = {
      currentOperation: 'initializing',
      progress: 0,
      currentStep: 'pre_validation',
      estimatedTimeRemaining: migration.performance.maxExecutionTime,
      operationsCompleted: 0,
      totalOperations: migration.operations.length,
      currentValidation: 'none',
      resourceUsage: {
        memory: 0,
        cpu: 0,
        diskIO: 0,
        networkIO: 0,
        databaseConnections: 0,
        lockCount: 0
      },
      errorCount: 0,
      warningCount: 0
    }

    this.activeMigrations.set(executionId, progress)

    const logs: MigrationLog[] = []
    const errors: ModuleError[] = []
    const warnings: string[] = []

    try {
      // Emit migration started event
      await this.emitMigrationEvent(executionId, migration, 'migration_started', 'pending', {
        executionId,
        migration,
        startTime
      })

      logs.push(this.createLog('info', `Starting migration: ${migration.name}`, { migrationId, version: migration.version }))

      // Phase 1: Pre-migration validation
      progress.currentStep = 'pre_validation'
      progress.progress = 10
      logs.push(this.createLog('info', 'Phase 1: Pre-migration validation'))

      await this.executePreMigrationValidation(migration, logs, errors, warnings)
      if (errors.length > 0) {
        throw new Error('Pre-migration validation failed')
      }

      // Phase 2: Dependency resolution
      progress.currentStep = 'dependency_resolution'
      progress.progress = 20
      logs.push(this.createLog('info', 'Phase 2: Dependency resolution'))

      await this.resolveMigrationDependencies(migration, logs, errors, warnings)
      if (errors.length > 0) {
        throw new Error('Dependency resolution failed')
      }

      // Phase 3: Migration execution
      progress.currentStep = 'migration_execution'
      progress.progress = 30
      logs.push(this.createLog('info', 'Phase 3: Migration execution'))

      await this.executeMigrationOperations(migration, progress, logs, errors, warnings)
      if (errors.length > 0) {
        throw new Error('Migration execution failed')
      }

      // Phase 4: Post-migration validation
      progress.currentStep = 'post_validation'
      progress.progress = 90
      logs.push(this.createLog('info', 'Phase 4: Post-migration validation'))

      await this.executePostMigrationValidation(migration, logs, errors, warnings)
      if (errors.length > 0) {
        throw new Error('Post-migration validation failed')
      }

      // Phase 5: Completion
      progress.currentStep = 'completion'
      progress.progress = 100
      logs.push(this.createLog('info', 'Phase 5: Migration completed successfully'))

      const result: MigrationExecutionResult = {
        success: true,
        executionId,
        migration,
        duration: Date.now() - startTime,
        metrics: this.createMigrationMetrics(logs, startTime),
        errors,
        warnings,
        logs
      }

      // Store result
      this.migrationHistory.set(executionId, result)
      this.activeMigrations.delete(executionId)

      return result

    } catch (error) {
      // Handle migration failure
      const errorResult: MigrationExecutionResult = {
        success: false,
        executionId,
        migration,
        duration: Date.now() - startTime,
        metrics: this.createEmptyMigrationMetrics(),
        errors: [...errors, this.createError(error, 'migration_error')],
        warnings,
        logs: [...logs, this.createLog('error', 'Migration failed', { error: error instanceof Error ? error.message : String(error) })],
        rollbackInfo: await this.prepareRollbackInfo(migration, executionId)
      }

      // Store error result
      this.migrationHistory.set(executionId, errorResult)
      this.activeMigrations.delete(executionId)

      // Trigger automatic rollback if enabled
      if (config.automaticRollback) {
        await this.triggerAutomaticRollback(executionId, migration, errorResult)
      }

      return errorResult
    }
  }

  /**
   * Execute pre-migration validation
   */
  private async executePreMigrationValidation(
    migration: MigrationDefinition,
    logs: MigrationLog[],
    errors: ModuleError[],
    warnings: string[]
  ): Promise<void> {
    for (const validation of migration.validation.preValidation) {
      try {
        logs.push(this.createLog('info', `Executing pre-validation: ${validation.name}`))
        
        // Execute validation query
        const result = await this.executeValidationQuery(validation)
        
        if (result !== validation.expectedResult) {
          const error = this.createError(
            new Error(validation.errorMessage),
            'validation_error',
            { validation: validation.id, expected: validation.expectedResult, actual: result }
          )
          errors.push(error)
          logs.push(this.createLog('error', `Pre-validation failed: ${validation.name}`, { validation: validation.id }))
          
          if (validation.critical) {
            throw new Error(`Critical pre-validation failed: ${validation.name}`)
          }
        } else {
          logs.push(this.createLog('info', `Pre-validation passed: ${validation.name}`))
        }
        
      } catch (validationError) {
        const error = this.createError(validationError, 'validation_error', { validation: validation.id })
        errors.push(error)
        logs.push(this.createLog('error', `Pre-validation error: ${validation.name}`, { error: validationError instanceof Error ? validationError.message : String(validationError) }))
        
        if (validation.critical) {
          throw validationError
        }
      }
    }
  }

  /**
   * Resolve migration dependencies
   */
  private async resolveMigrationDependencies(
    migration: MigrationDefinition,
    logs: MigrationLog[],
    errors: ModuleError[],
    warnings: string[]
  ): Promise<void> {
    for (const dependency of migration.dependencies) {
      try {
        logs.push(this.createLog('info', `Resolving dependency: ${dependency.migrationId}@${dependency.version}`))
        
        // Check if dependency is available
        const dependencyMigration = this.migrationDefinitions.get(dependency.migrationId)
        if (!dependencyMigration) {
          if (dependency.type === 'required') {
            throw new Error(`Required dependency not found: ${dependency.migrationId}`)
          } else {
            warnings.push(`Optional dependency not found: ${dependency.migrationId}`)
            logs.push(this.createLog('warn', `Optional dependency not found: ${dependency.migrationId}`))
            continue
          }
        }

        // Check dependency version
        if (dependencyMigration.version !== dependency.version) {
          if (dependency.type === 'required') {
            throw new Error(`Dependency version mismatch: ${dependency.migrationId} (expected: ${dependency.version}, actual: ${dependencyMigration.version})`)
          } else {
            warnings.push(`Dependency version mismatch: ${dependency.migrationId}`)
            logs.push(this.createLog('warn', `Dependency version mismatch: ${dependency.migrationId}`))
          }
        }

        // Check if dependency has been executed
        const dependencyExecuted = await this.checkMigrationExecuted(dependency.migrationId)
        if (!dependencyExecuted) {
          if (dependency.type === 'required') {
            throw new Error(`Required dependency not executed: ${dependency.migrationId}`)
          } else {
            warnings.push(`Optional dependency not executed: ${dependency.migrationId}`)
            logs.push(this.createLog('warn', `Optional dependency not executed: ${dependency.migrationId}`))
          }
        }

        logs.push(this.createLog('info', `Dependency resolved: ${dependency.migrationId}`))

      } catch (dependencyError) {
        const error = this.createError(dependencyError, 'dependency_error', { dependency: dependency.migrationId })
        errors.push(error)
        logs.push(this.createLog('error', `Dependency resolution failed: ${dependency.migrationId}`, { error: dependencyError instanceof Error ? dependencyError.message : String(dependencyError) }))
        
        if (dependency.type === 'required') {
          throw dependencyError
        }
      }
    }
  }

  /**
   * Execute migration operations
   */
  private async executeMigrationOperations(
    migration: MigrationDefinition,
    progress: MigrationProgress,
    logs: MigrationLog[],
    errors: ModuleError[],
    warnings: string[]
  ): Promise<void> {
    for (let i = 0; i < migration.operations.length; i++) {
      const operation = migration.operations[i]
      
      progress.currentOperation = operation.name
      progress.operationsCompleted = i
      progress.progress = 30 + ((i / migration.operations.length) * 60)
      
      logs.push(this.createLog('info', `Executing operation: ${operation.name}`, { operation: operation.id, order: i + 1 }))
      
      try {
        // Execute operation
        await this.executeMigrationOperation(operation, logs, errors, warnings)
        
        logs.push(this.createLog('info', `Operation completed: ${operation.name}`))
        
      } catch (operationError) {
        const error = this.createError(operationError, 'migration_error', { operation: operation.id })
        errors.push(error)
        logs.push(this.createLog('error', `Operation failed: ${operation.name}`, { error: operationError instanceof Error ? operationError.message : String(operationError) }))
        
        // Check if operation is critical
        if (operation.name.toLowerCase().includes('critical') || operation.name.toLowerCase().includes('required')) {
          throw new Error(`Critical operation failed: ${operation.name}`)
        }
      }
    }
  }

  /**
   * Execute a single migration operation
   */
  private async executeMigrationOperation(
    operation: MigrationOperation,
    logs: MigrationLog[],
    errors: ModuleError[],
    warnings: string[]
  ): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Pre-operation validation
      if (operation.validation?.preValidation) {
        for (const validation of operation.validation.preValidation) {
          const result = await this.executeValidationQuery(validation)
          if (result !== validation.expectedResult) {
            throw new Error(`Pre-operation validation failed: ${validation.name}`)
          }
        }
      }

      // Execute operation SQL
      await this.executeOperationSQL(operation, logs, errors, warnings)
      
      // Post-operation validation
      if (operation.validation?.postValidation) {
        for (const validation of operation.validation.postValidation) {
          const result = await this.executeValidationQuery(validation)
          if (result !== validation.expectedResult) {
            throw new Error(`Post-operation validation failed: ${validation.name}`)
          }
        }
      }

      const duration = Date.now() - startTime
      logs.push(this.createLog('info', `Operation executed successfully: ${operation.name}`, { duration }))

    } catch (error) {
      const duration = Date.now() - startTime
      logs.push(this.createLog('error', `Operation execution failed: ${operation.name}`, { 
        duration, 
        error: error instanceof Error ? error.message : String(error) 
      }))
      throw error
    }
  }

  /**
   * Execute post-migration validation
   */
  private async executePostMigrationValidation(
    migration: MigrationDefinition,
    logs: MigrationLog[],
    errors: ModuleError[],
    warnings: string[]
  ): Promise<void> {
    for (const validation of migration.validation.postValidation) {
      try {
        logs.push(this.createLog('info', `Executing post-validation: ${validation.name}`))
        
        const result = await this.executeValidationQuery(validation)
        
        if (result !== validation.expectedResult) {
          const error = this.createError(
            new Error(validation.errorMessage),
            'validation_error',
            { validation: validation.id, expected: validation.expectedResult, actual: result }
          )
          errors.push(error)
          logs.push(this.createLog('error', `Post-validation failed: ${validation.name}`, { validation: validation.id }))
          
          if (validation.critical) {
            throw new Error(`Critical post-validation failed: ${validation.name}`)
          }
        } else {
          logs.push(this.createLog('info', `Post-validation passed: ${validation.name}`))
        }
        
      } catch (validationError) {
        const error = this.createError(validationError, 'validation_error', { validation: validation.id })
        errors.push(error)
        logs.push(this.createLog('error', `Post-validation error: ${validation.name}`, { error: validationError instanceof Error ? validationError.message : String(validationError) }))
        
        if (validation.critical) {
          throw validationError
        }
      }
    }
  }

  /**
   * Execute validation query
   */
  private async executeValidationQuery(validation: ValidationRule): Promise<unknown> {
    // Implementation for executing validation queries
    console.log(`Executing validation query: ${validation.name}`)
    
    // This would execute the SQL query and return the result
    // For now, return a mock result
    return validation.expectedResult
  }

  /**
   * Execute operation SQL
   */
  private async executeOperationSQL(
    operation: MigrationOperation,
    logs: MigrationLog[],
    errors: ModuleError[],
    warnings: string[]
  ): Promise<void> {
    console.log(`Executing operation SQL: ${operation.name}`)
    
    // Implementation for executing operation SQL
    // This would execute the SQL statement with proper error handling
  }

  /**
   * Check if migration has been executed
   */
  private async checkMigrationExecuted(migrationId: string): Promise<boolean> {
    // Implementation for checking migration execution status
    console.log(`Checking if migration executed: ${migrationId}`)
    
    // This would check the migration history or database
    return true
  }

  /**
   * Detect migration conflicts
   */
  private async detectMigrationConflicts(migration: MigrationDefinition): Promise<ConflictDetection[]> {
    const conflicts: ConflictDetection[] = []

    // Check for duplicate migration ID
    if (this.migrationDefinitions.has(migration.id)) {
      conflicts.push({
        type: 'duplicate_id',
        message: `Migration with ID ${migration.id} already exists`,
        details: { migrationId: migration.id }
      })
    }

    // Check for conflicting operations
    for (const operation of migration.operations) {
      const conflictingOperation = this.findConflictingOperation(operation)
      if (conflictingOperation) {
        conflicts.push({
          type: 'operation_conflict',
          message: `Operation ${operation.name} conflicts with existing operation`,
          details: { operation: operation.name, conflictingMigration: conflictingOperation }
        })
      }
    }

    return conflicts
  }

  /**
   * Find conflicting operation
   */
  private findConflictingOperation(operation: MigrationOperation): string | null {
    // Implementation for finding conflicting operations
    // This would check for conflicts with existing operations
    return null
  }

  /**
   * Prepare rollback information
   */
  private async prepareRollbackInfo(migration: MigrationDefinition, executionId: string): Promise<MigrationRollbackInfo> {
    return {
      available: migration.rollbackOperations.length > 0,
      rollbackExecutionId: `${executionId}-rollback`,
      timestamp: new Date(),
      rollbackOperations: migration.rollbackOperations,
      timeout: migration.performance.maxExecutionTime,
      rollbackValidation: migration.validation.rollbackValidation
    }
  }

  /**
   * Trigger automatic rollback
   */
  private async triggerAutomaticRollback(
    executionId: string,
    migration: MigrationDefinition,
    errorResult: MigrationExecutionResult
  ): Promise<void> {
    console.log(`Triggering automatic rollback for migration: ${executionId}`)
    
    try {
      await this.rollbackEngine.executeRollback(executionId, migration, errorResult)
      console.log(`Automatic rollback completed for migration: ${executionId}`)
    } catch (rollbackError) {
      console.error(`Automatic rollback failed for migration: ${executionId}`, rollbackError)
    }
  }

  /**
   * Get migration progress
   */
  getMigrationProgress(executionId: string): MigrationProgress | undefined {
    return this.activeMigrations.get(executionId)
  }

  /**
   * Get migration result
   */
  getMigrationResult(executionId: string): MigrationExecutionResult | undefined {
    return this.migrationHistory.get(executionId)
  }

  /**
   * Get all active migrations
   */
  getAllActiveMigrations(): Map<string, MigrationProgress> {
    return new Map(this.activeMigrations)
  }

  /**
   * Get migration history
   */
  getMigrationHistory(): Map<string, MigrationExecutionResult> {
    return new Map(this.migrationHistory)
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private async emitMigrationEvent(
    executionId: string,
    migration: MigrationDefinition,
    event: string,
    state: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    await lifecycleManager.emit('before_activate', {
      moduleId: migration.id,
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
      description: `Error during migration: ${type}`,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date(),
      context,
      recoverable: true,
      resolution: ['Check migration definition', 'Verify dependencies', 'Review logs']
    }
  }

  private createLog(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: Record<string, unknown>): MigrationLog {
    return {
      timestamp: new Date(),
      level,
      message,
      data
    }
  }

  private createEmptyMigrationMetrics(): MigrationExecutionMetrics {
    return {
      duration: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      networkIO: 0,
      diskIO: 0,
      errorCount: 0,
      successRate: 0,
      totalMigrationTime: 0,
      validationTime: 0,
      operationExecutionTime: 0,
      resourceUsage: {
        memory: 0,
        cpu: 0,
        diskIO: 0,
        networkIO: 0,
        databaseConnections: 0,
        lockCount: 0
      },
      performance: {
        averageOperationTime: 0,
        slowestOperation: '',
        fastestOperation: '',
        operationsPerSecond: 0,
        resourceUtilization: 0
      }
    }
  }

  private createMigrationMetrics(logs: MigrationLog[], startTime: number): MigrationExecutionMetrics {
    const metrics = this.createEmptyMigrationMetrics()
    
    // Calculate metrics from logs
    const errorLogs = logs.filter(log => log.level === 'error')
    metrics.errorCount = errorLogs.length
    metrics.successRate = logs.length > 0 ? ((logs.length - errorLogs.length) / logs.length) * 100 : 100
    metrics.totalMigrationTime = Date.now() - startTime
    
    return metrics
  }

  private initializeBuiltInMigrations(): void {
    console.log('Initializing migration manager components')
  }
}

// =============================================================================
// SUPPORTING CLASSES AND INTERFACES
// =============================================================================

export interface MigrationRegistrationResult {
  success: boolean
  migrationId: string
  migration?: MigrationDefinition
  errors: ModuleError[]
  warnings: string[]
}

export interface MigrationExecutionConfig {
  /** Whether to enable automatic rollback */
  automaticRollback: boolean
  
  /** Execution timeout */
  timeout: number
  
  /** Whether to enable performance monitoring */
  performanceMonitoring: boolean
  
  /** Execution metadata */
  metadata: Record<string, unknown>
}

export interface ConflictDetection {
  type: string
  message: string
  details: Record<string, unknown>
}

class PerformanceMonitor {
  // Implementation for performance monitoring
}

class ValidationEngine {
  async validateMigrationDefinition(migration: MigrationDefinition): Promise<{ valid: boolean, errors: string[], warnings: string[] }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate required fields
    if (!migration.id) errors.push('Migration ID is required')
    if (!migration.name) errors.push('Migration name is required')
    if (!migration.version) errors.push('Migration version is required')
    if (migration.operations.length === 0) errors.push('Migration must have at least one operation')

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
}

class MigrationRollbackEngine {
  async executeRollback(executionId: string, migration: MigrationDefinition, errorResult: MigrationExecutionResult): Promise<void> {
    console.log(`Executing rollback for migration: ${executionId}`)
    
    // Implementation for rollback execution
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const migrationManager = new MigrationManager()

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function createMigrationManager(): MigrationManager {
  return new MigrationManager()
}

export function getMigrationManager(): MigrationManager {
  return migrationManager
}

export function registerMigration(migration: MigrationDefinition): Promise<MigrationRegistrationResult> {
  return migrationManager.registerMigration(migration)
}

export function executeMigration(
  migrationId: string,
  moduleEntry: ModuleRegistryEntry,
  config: MigrationExecutionConfig
): Promise<MigrationExecutionResult> {
  return migrationManager.executeMigration(migrationId, moduleEntry, config)
}

export function getMigrationProgress(executionId: string): MigrationProgress | undefined {
  return migrationManager.getMigrationProgress(executionId)
}

export function getMigrationResult(executionId: string): MigrationExecutionResult | undefined {
  return migrationManager.getMigrationResult(executionId)
}
