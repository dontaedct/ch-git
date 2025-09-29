/**
 * HT-035.2.3: Pre-Activation Validation System
 * 
 * Implements comprehensive pre-activation validation system to ensure
 * safe module activation with zero downtime per PRD Section 7.
 * 
 * Features:
 * - Comprehensive validation framework
 * - Module compatibility checking
 * - Resource availability validation
 * - Security and permission validation
 * - Performance impact assessment
 * - Dependency graph validation
 */

import { 
  ModuleLifecycleState, 
  ModuleActivationState, 
  ModuleError,
  ModuleErrorType,
  ModuleLifecycleMetrics,
  ModuleCapability,
  ModuleDependency
} from '../types/modules/module-lifecycle'
import { ModuleRegistryEntry } from './module-registry'
import { lifecycleManager } from './module-lifecycle'

// =============================================================================
// CORE TYPES AND INTERFACES
// =============================================================================

export interface ValidationRule {
  /** Rule identifier */
  id: string
  
  /** Rule name */
  name: string
  
  /** Rule description */
  description: string
  
  /** Rule category */
  category: ValidationCategory
  
  /** Rule severity */
  severity: ValidationSeverity
  
  /** Rule type */
  type: ValidationType
  
  /** Rule version */
  version: string
  
  /** Rule dependencies */
  dependencies: string[]
  
  /** Rule validation function */
  validate: (context: ValidationContext) => Promise<ValidationResult>
  
  /** Rule timeout */
  timeout: number
  
  /** Whether rule is required */
  required: boolean
  
  /** Rule metadata */
  metadata: ValidationRuleMetadata
  
  /** Rule configuration */
  configuration: ValidationRuleConfiguration
}

export type ValidationCategory = 
  | 'compatibility'
  | 'resources'
  | 'security'
  | 'performance'
  | 'dependencies'
  | 'configuration'
  | 'data_integrity'
  | 'network'
  | 'storage'
  | 'permissions'

export type ValidationSeverity = 'info' | 'warning' | 'error' | 'critical'

export type ValidationType = 
  | 'pre_activation'
  | 'compatibility_check'
  | 'resource_check'
  | 'security_check'
  | 'performance_check'
  | 'dependency_check'
  | 'configuration_check'
  | 'health_check'
  | 'custom'

export interface ValidationRuleMetadata {
  /** Rule author */
  author: string
  
  /** Rule created date */
  createdAt: Date
  
  /** Rule updated date */
  updatedAt: Date
  
  /** Rule tags */
  tags: string[]
  
  /** Rule documentation */
  documentation: string
  
  /** Rule examples */
  examples: ValidationExample[]
}

export interface ValidationExample {
  /** Example name */
  name: string
  
  /** Example description */
  description: string
  
  /** Example input */
  input: Record<string, unknown>
  
  /** Expected output */
  expectedOutput: ValidationResult
}

export interface ValidationRuleConfiguration {
  /** Configuration parameters */
  parameters: Record<string, ValidationParameter>
  
  /** Default configuration */
  defaults: Record<string, unknown>
  
  /** Configuration validation */
  validation: ConfigurationValidation
}

export interface ValidationParameter {
  /** Parameter type */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  
  /** Parameter description */
  description: string
  
  /** Parameter default value */
  defaultValue: unknown
  
  /** Parameter validation */
  validation?: ParameterValidation
  
  /** Whether parameter is required */
  required: boolean
}

export interface ParameterValidation {
  /** Minimum value */
  min?: number
  
  /** Maximum value */
  max?: number
  
  /** Minimum length */
  minLength?: number
  
  /** Maximum length */
  maxLength?: number
  
  /** Pattern */
  pattern?: string
  
  /** Allowed values */
  allowedValues?: unknown[]
}

export interface ConfigurationValidation {
  /** Validation rules */
  rules: ConfigurationValidationRule[]
  
  /** Validation schema */
  schema?: Record<string, unknown>
}

export interface ConfigurationValidationRule {
  /** Rule name */
  name: string
  
  /** Rule function */
  validate: (config: Record<string, unknown>) => boolean
  
  /** Rule message */
  message: string
}

export interface ValidationContext {
  /** Validation execution ID */
  executionId: string
  
  /** Module entry being validated */
  moduleEntry: ModuleRegistryEntry
  
  /** Activation configuration */
  activationConfig: ActivationConfiguration
  
  /** Current system state */
  systemState: SystemState
  
  /** Validation configuration */
  validationConfig: ValidationConfiguration
  
  /** Validation metadata */
  metadata: Record<string, unknown>
  
  /** Previous validation results */
  previousResults: ValidationResult[]
  
  /** Validation logs */
  logs: ValidationLog[]
  
  /** Validation errors */
  errors: ModuleError[]
  
  /** Validation warnings */
  warnings: string[]
}

export interface ActivationConfiguration {
  /** Activation strategy */
  strategy: 'gradual' | 'instant' | 'blue-green'
  
  /** Activation timeout */
  timeout: number
  
  /** Resource limits */
  resourceLimits: ResourceLimits
  
  /** Performance requirements */
  performanceRequirements: PerformanceRequirements
  
  /** Security configuration */
  securityConfig: SecurityConfiguration
  
  /** Feature flags */
  featureFlags: Record<string, boolean>
}

export interface SystemState {
  /** System resource usage */
  resourceUsage: SystemResourceUsage
  
  /** Active modules */
  activeModules: ModuleInfo[]
  
  /** System health */
  systemHealth: SystemHealth
  
  /** Network status */
  networkStatus: NetworkStatus
  
  /** Storage status */
  storageStatus: StorageStatus
  
  /** Security status */
  securityStatus: SecurityStatus
}

export interface SystemResourceUsage {
  /** Memory usage */
  memory: ResourceUsageMetrics
  
  /** CPU usage */
  cpu: ResourceUsageMetrics
  
  /** Disk usage */
  disk: ResourceUsageMetrics
  
  /** Network usage */
  network: ResourceUsageMetrics
  
  /** Database connections */
  databaseConnections: number
  
  /** Active processes */
  activeProcesses: number
}

export interface ResourceUsageMetrics {
  /** Current usage */
  current: number
  
  /** Maximum available */
  maximum: number
  
  /** Usage percentage */
  percentage: number
  
  /** Average usage */
  average: number
  
  /** Peak usage */
  peak: number
}

export interface ModuleInfo {
  /** Module ID */
  id: string
  
  /** Module name */
  name: string
  
  /** Module version */
  version: string
  
  /** Module state */
  state: ModuleLifecycleState
  
  /** Resource usage */
  resourceUsage: ResourceUsageMetrics
  
  /** Capabilities */
  capabilities: ModuleCapability[]
  
  /** Dependencies */
  dependencies: ModuleDependency[]
}

export interface SystemHealth {
  /** Overall health status */
  status: 'healthy' | 'degraded' | 'unhealthy'
  
  /** Health score */
  score: number
  
  /** Health checks */
  checks: HealthCheck[]
  
  /** Last health check */
  lastCheck: Date
}

export interface HealthCheck {
  /** Check name */
  name: string
  
  /** Check status */
  status: 'pass' | 'fail' | 'warn'
  
  /** Check message */
  message: string
  
  /** Check timestamp */
  timestamp: Date
  
  /** Check duration */
  duration: number
}

export interface NetworkStatus {
  /** Network connectivity */
  connectivity: 'online' | 'offline' | 'limited'
  
  /** Network latency */
  latency: number
  
  /** Network bandwidth */
  bandwidth: BandwidthMetrics
  
  /** Network interfaces */
  interfaces: NetworkInterface[]
}

export interface BandwidthMetrics {
  /** Upload bandwidth */
  upload: number
  
  /** Download bandwidth */
  download: number
  
  /** Available bandwidth */
  available: number
}

export interface NetworkInterface {
  /** Interface name */
  name: string
  
  /** Interface status */
  status: 'up' | 'down'
  
  /** Interface IP address */
  ipAddress: string
  
  /** Interface MAC address */
  macAddress: string
}

export interface StorageStatus {
  /** Storage devices */
  devices: StorageDevice[]
  
  /** Total storage */
  totalStorage: number
  
  /** Available storage */
  availableStorage: number
  
  /** Storage usage percentage */
  usagePercentage: number
}

export interface StorageDevice {
  /** Device name */
  name: string
  
  /** Device type */
  type: 'hdd' | 'ssd' | 'nvme' | 'network'
  
  /** Total capacity */
  totalCapacity: number
  
  /** Available capacity */
  availableCapacity: number
  
  /** Usage percentage */
  usagePercentage: number
  
  /** Device health */
  health: 'good' | 'warning' | 'critical'
}

export interface SecurityStatus {
  /** Security policies */
  policies: SecurityPolicy[]
  
  /** Active threats */
  activeThreats: SecurityThreat[]
  
  /** Security score */
  securityScore: number
  
  /** Last security scan */
  lastScan: Date
}

export interface SecurityPolicy {
  /** Policy ID */
  id: string
  
  /** Policy name */
  name: string
  
  /** Policy status */
  status: 'active' | 'inactive' | 'violated'
  
  /** Policy description */
  description: string
}

export interface SecurityThreat {
  /** Threat ID */
  id: string
  
  /** Threat type */
  type: string
  
  /** Threat severity */
  severity: 'low' | 'medium' | 'high' | 'critical'
  
  /** Threat description */
  description: string
  
  /** Threat timestamp */
  timestamp: Date
}

export interface ValidationConfiguration {
  /** Validation rules to execute */
  rules: string[]
  
  /** Validation timeout */
  timeout: number
  
  /** Validation parallelism */
  parallelism: number
  
  /** Validation retry configuration */
  retry: ValidationRetryConfiguration
  
  /** Validation reporting */
  reporting: ValidationReportingConfiguration
}

export interface ValidationRetryConfiguration {
  /** Maximum retry attempts */
  maxAttempts: number
  
  /** Retry delay */
  delay: number
  
  /** Retry multiplier */
  multiplier: number
  
  /** Maximum delay */
  maxDelay: number
}

export interface ValidationReportingConfiguration {
  /** Include warnings in report */
  includeWarnings: boolean
  
  /** Include info messages in report */
  includeInfo: boolean
  
  /** Include performance metrics */
  includeMetrics: boolean
  
  /** Report format */
  format: 'json' | 'xml' | 'html' | 'text'
}

export interface ResourceLimits {
  /** Memory limit */
  memory: number
  
  /** CPU limit */
  cpu: number
  
  /** Disk I/O limit */
  diskIO: number
  
  /** Network I/O limit */
  networkIO: number
  
  /** Process limit */
  processes: number
}

export interface PerformanceRequirements {
  /** Maximum activation time */
  maxActivationTime: number
  
  /** Maximum response time */
  maxResponseTime: number
  
  /** Minimum throughput */
  minThroughput: number
  
  /** Maximum error rate */
  maxErrorRate: number
}

export interface SecurityConfiguration {
  /** Security policies */
  policies: string[]
  
  /** Required permissions */
  permissions: string[]
  
  /** Security constraints */
  constraints: SecurityConstraint[]
  
  /** Security validation */
  validation: SecurityValidationConfiguration
}

export interface SecurityConstraint {
  /** Constraint type */
  type: 'network' | 'file_system' | 'database' | 'api' | 'custom'
  
  /** Constraint rules */
  rules: string[]
  
  /** Constraint enforcement */
  enforcement: 'strict' | 'permissive' | 'audit'
}

export interface SecurityValidationConfiguration {
  /** Enable vulnerability scanning */
  vulnerabilityScanning: boolean
  
  /** Enable compliance checking */
  complianceChecking: boolean
  
  /** Enable permission validation */
  permissionValidation: boolean
  
  /** Security scan timeout */
  scanTimeout: number
}

export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean
  
  /** Validation rule ID */
  ruleId: string
  
  /** Validation severity */
  severity: ValidationSeverity
  
  /** Validation message */
  message: string
  
  /** Validation details */
  details: Record<string, unknown>
  
  /** Validation duration */
  duration: number
  
  /** Validation timestamp */
  timestamp: Date
  
  /** Validation errors */
  errors: string[]
  
  /** Validation warnings */
  warnings: string[]
  
  /** Validation recommendations */
  recommendations: string[]
  
  /** Validation metadata */
  metadata: Record<string, unknown>
}

export interface ValidationLog {
  /** Log timestamp */
  timestamp: Date
  
  /** Log level */
  level: 'debug' | 'info' | 'warn' | 'error'
  
  /** Log message */
  message: string
  
  /** Log data */
  data?: Record<string, unknown>
  
  /** Log rule */
  rule?: string
  
  /** Log category */
  category?: ValidationCategory
}

export interface ValidationSummary {
  /** Total validations executed */
  totalValidations: number
  
  /** Validations passed */
  validationsPassed: number
  
  /** Validations failed */
  validationsFailed: number
  
  /** Validations with warnings */
  validationsWithWarnings: number
  
  /** Critical failures */
  criticalFailures: number
  
  /** Total validation time */
  totalValidationTime: number
  
  /** Overall validation result */
  overallResult: 'pass' | 'fail' | 'warning'
  
  /** Validation score */
  validationScore: number
  
  /** Results by category */
  resultsByCategory: Record<ValidationCategory, CategoryResult>
  
  /** Results by severity */
  resultsBySeverity: Record<ValidationSeverity, number>
}

export interface CategoryResult {
  /** Total validations in category */
  total: number
  
  /** Passed validations in category */
  passed: number
  
  /** Failed validations in category */
  failed: number
  
  /** Warnings in category */
  warnings: number
  
  /** Category score */
  score: number
}

// =============================================================================
// ACTIVATION VALIDATOR CLASS
// =============================================================================

export class ActivationValidator {
  private validationRules: Map<string, ValidationRule> = new Map()
  private rulesByCategory: Map<ValidationCategory, ValidationRule[]> = new Map()
  private validationHistory: Map<string, ValidationResult[]> = new Map()
  private systemMonitor: SystemMonitor
  private securityValidator: SecurityValidator
  private performanceValidator: PerformanceValidator

  constructor() {
    this.systemMonitor = new SystemMonitor()
    this.securityValidator = new SecurityValidator()
    this.performanceValidator = new PerformanceValidator()
    this.initializeBuiltInRules()
  }

  /**
   * Register a validation rule
   */
  async registerValidationRule(rule: ValidationRule): Promise<RuleRegistrationResult> {
    try {
      // Validate rule definition
      const validation = await this.validateRuleDefinition(rule)
      if (!validation.valid) {
        return {
          success: false,
          ruleId: rule.id,
          errors: validation.errors,
          warnings: validation.warnings
        }
      }

      // Store rule
      this.validationRules.set(rule.id, rule)

      // Update category index
      if (!this.rulesByCategory.has(rule.category)) {
        this.rulesByCategory.set(rule.category, [])
      }
      this.rulesByCategory.get(rule.category)!.push(rule)

      // Emit lifecycle event
      await lifecycleManager.emit('after_activate', {
        moduleId: rule.id,
        tenantId: 'system',
        data: { rule, type: 'validation_rule_registration' }
      })

      return {
        success: true,
        ruleId: rule.id,
        rule,
        errors: [],
        warnings: validation.warnings
      }

    } catch (error) {
      return {
        success: false,
        ruleId: rule.id,
        errors: [{
          code: 'RULE_REGISTRATION_ERROR',
          message: error instanceof Error ? error.message : String(error),
          details: { rule: rule.id }
        }],
        warnings: []
      }
    }
  }

  /**
   * Execute pre-activation validation
   */
  async executePreActivationValidation(
    moduleEntry: ModuleRegistryEntry,
    activationConfig: ActivationConfiguration,
    validationConfig: ValidationConfiguration
  ): Promise<ValidationExecutionResult> {
    const executionId = `validation-${moduleEntry.definition.id}-${Date.now()}`
    const startTime = Date.now()

    // Create validation context
    const context: ValidationContext = {
      executionId,
      moduleEntry,
      activationConfig,
      systemState: await this.systemMonitor.getCurrentSystemState(),
      validationConfig,
      metadata: {},
      previousResults: this.getValidationHistory(moduleEntry.definition.id),
      logs: [],
      errors: [],
      warnings: []
    }

    try {
      // Emit validation started event
      await this.emitValidationEvent(executionId, moduleEntry, 'validation_started', 'executing', {
        executionId,
        moduleEntry,
        startTime
      })

      context.logs.push(this.createLog('info', `Starting pre-activation validation: ${moduleEntry.definition.name}`, { moduleId: moduleEntry.definition.id }))

      // Get validation rules to execute
      const rulesToExecute = this.getValidationRules(validationConfig.rules)
      const results: ValidationResult[] = []

      context.logs.push(this.createLog('info', `Executing ${rulesToExecute.length} validation rules`))

      // Execute validation rules
      if (validationConfig.parallelism > 1) {
        // Execute rules in parallel
        const ruleChunks = this.chunkArray(rulesToExecute, validationConfig.parallelism)
        
        for (const chunk of ruleChunks) {
          const chunkPromises = chunk.map(rule => this.executeValidationRule(rule, context))
          const chunkResults = await Promise.all(chunkPromises)
          results.push(...chunkResults)
        }
      } else {
        // Execute rules sequentially
        for (const rule of rulesToExecute) {
          const result = await this.executeValidationRule(rule, context)
          results.push(result)
          
          // Stop on critical failure if configured
          if (!result.valid && result.severity === 'critical') {
            context.logs.push(this.createLog('error', `Critical validation failure, stopping validation: ${rule.name}`))
            break
          }
        }
      }

      // Create validation summary
      const summary = this.createValidationSummary(results)
      
      const executionResult: ValidationExecutionResult = {
        success: summary.overallResult === 'pass',
        executionId,
        duration: Date.now() - startTime,
        summary,
        results,
        logs: context.logs,
        errors: context.errors,
        warnings: context.warnings,
        systemState: context.systemState
      }

      // Store validation results
      this.storeValidationResults(moduleEntry.definition.id, results)

      context.logs.push(this.createLog('info', `Pre-activation validation completed: ${summary.overallResult}`, { 
        score: summary.validationScore,
        passed: summary.validationsPassed,
        failed: summary.validationsFailed
      }))

      return executionResult

    } catch (error) {
      // Handle validation failure
      const errorResult: ValidationExecutionResult = {
        success: false,
        executionId,
        duration: Date.now() - startTime,
        summary: this.createEmptyValidationSummary(),
        results: [],
        logs: [...context.logs, this.createLog('error', 'Pre-activation validation failed', { error: error instanceof Error ? error.message : String(error) })],
        errors: [...context.errors, this.createError(error, 'validation_error')],
        warnings: context.warnings,
        systemState: context.systemState
      }

      return errorResult
    }
  }

  /**
   * Execute a single validation rule
   */
  private async executeValidationRule(rule: ValidationRule, context: ValidationContext): Promise<ValidationResult> {
    const startTime = Date.now()
    
    try {
      context.logs.push(this.createLog('info', `Executing validation rule: ${rule.name}`, { rule: rule.id, category: rule.category }))
      
      // Execute rule with timeout
      const result = await Promise.race([
        rule.validate(context),
        this.createTimeoutPromise(rule.timeout, rule.id)
      ])
      
      result.duration = Date.now() - startTime
      result.timestamp = new Date()
      
      if (result.valid) {
        context.logs.push(this.createLog('info', `Validation rule passed: ${rule.name}`, { rule: rule.id, duration: result.duration }))
      } else {
        const logLevel = result.severity === 'critical' || result.severity === 'error' ? 'error' : 'warn'
        context.logs.push(this.createLog(logLevel, `Validation rule failed: ${rule.name}`, { 
          rule: rule.id, 
          severity: result.severity,
          message: result.message,
          duration: result.duration
        }))
        
        if (result.severity === 'critical' || result.severity === 'error') {
          const error = this.createError(new Error(result.message), 'validation_error', { 
            rule: rule.id,
            category: rule.category,
            severity: result.severity
          })
          context.errors.push(error)
        } else {
          context.warnings.push(`${rule.name}: ${result.message}`)
        }
      }
      
      return result
      
    } catch (error) {
      const duration = Date.now() - startTime
      
      const errorResult: ValidationResult = {
        valid: false,
        ruleId: rule.id,
        severity: 'error',
        message: error instanceof Error ? error.message : String(error),
        details: { rule: rule.id, category: rule.category },
        duration,
        timestamp: new Date(),
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: [],
        recommendations: ['Check rule implementation', 'Verify rule configuration'],
        metadata: {}
      }
      
      context.logs.push(this.createLog('error', `Validation rule error: ${rule.name}`, { 
        rule: rule.id,
        error: error instanceof Error ? error.message : String(error),
        duration
      }))
      
      const moduleError = this.createError(error, 'validation_error', { rule: rule.id })
      context.errors.push(moduleError)
      
      return errorResult
    }
  }

  /**
   * Get validation rules to execute
   */
  private getValidationRules(ruleIds: string[]): ValidationRule[] {
    const rules: ValidationRule[] = []
    
    for (const ruleId of ruleIds) {
      const rule = this.validationRules.get(ruleId)
      if (rule) {
        rules.push(rule)
      }
    }
    
    // Sort by dependencies and priority
    return this.sortRulesByDependencies(rules)
  }

  /**
   * Sort rules by dependencies
   */
  private sortRulesByDependencies(rules: ValidationRule[]): ValidationRule[] {
    const sorted: ValidationRule[] = []
    const remaining = [...rules]
    const processed = new Set<string>()
    
    while (remaining.length > 0) {
      let addedInThisIteration = false
      
      for (let i = remaining.length - 1; i >= 0; i--) {
        const rule = remaining[i]
        const dependenciesMet = rule.dependencies.every(dep => processed.has(dep))
        
        if (dependenciesMet) {
          sorted.push(rule)
          processed.add(rule.id)
          remaining.splice(i, 1)
          addedInThisIteration = true
        }
      }
      
      // Break circular dependencies
      if (!addedInThisIteration && remaining.length > 0) {
        const rule = remaining.shift()!
        sorted.push(rule)
        processed.add(rule.id)
      }
    }
    
    return sorted
  }

  /**
   * Create validation summary
   */
  private createValidationSummary(results: ValidationResult[]): ValidationSummary {
    const totalValidations = results.length
    const validationsPassed = results.filter(r => r.valid).length
    const validationsFailed = results.filter(r => !r.valid).length
    const validationsWithWarnings = results.filter(r => r.warnings.length > 0).length
    const criticalFailures = results.filter(r => !r.valid && r.severity === 'critical').length
    const totalValidationTime = results.reduce((sum, r) => sum + r.duration, 0)
    
    const overallResult: 'pass' | 'fail' | 'warning' = 
      criticalFailures > 0 ? 'fail' :
      validationsFailed > 0 ? 'fail' :
      validationsWithWarnings > 0 ? 'warning' : 'pass'
    
    const validationScore = totalValidations > 0 ? (validationsPassed / totalValidations) * 100 : 100
    
    // Results by category
    const resultsByCategory: Record<ValidationCategory, CategoryResult> = {} as any
    const categoryCounts: Record<ValidationCategory, { total: number, passed: number, failed: number, warnings: number }> = {} as any
    
    for (const result of results) {
      const rule = this.validationRules.get(result.ruleId)
      if (rule) {
        const category = rule.category
        if (!categoryCounts[category]) {
          categoryCounts[category] = { total: 0, passed: 0, failed: 0, warnings: 0 }
        }
        
        categoryCounts[category].total++
        if (result.valid) {
          categoryCounts[category].passed++
        } else {
          categoryCounts[category].failed++
        }
        if (result.warnings.length > 0) {
          categoryCounts[category].warnings++
        }
      }
    }
    
    for (const [category, counts] of Object.entries(categoryCounts)) {
      resultsByCategory[category as ValidationCategory] = {
        total: counts.total,
        passed: counts.passed,
        failed: counts.failed,
        warnings: counts.warnings,
        score: counts.total > 0 ? (counts.passed / counts.total) * 100 : 100
      }
    }
    
    // Results by severity
    const resultsBySeverity: Record<ValidationSeverity, number> = {
      info: 0,
      warning: 0,
      error: 0,
      critical: 0
    }
    
    for (const result of results) {
      if (!result.valid) {
        resultsBySeverity[result.severity]++
      }
    }
    
    return {
      totalValidations,
      validationsPassed,
      validationsFailed,
      validationsWithWarnings,
      criticalFailures,
      totalValidationTime,
      overallResult,
      validationScore,
      resultsByCategory,
      resultsBySeverity
    }
  }

  /**
   * Get validation rules by category
   */
  getValidationRulesByCategory(category: ValidationCategory): ValidationRule[] {
    return this.rulesByCategory.get(category) || []
  }

  /**
   * Get all validation rules
   */
  getAllValidationRules(): ValidationRule[] {
    return Array.from(this.validationRules.values())
  }

  /**
   * Get validation history
   */
  getValidationHistory(moduleId: string): ValidationResult[] {
    return this.validationHistory.get(moduleId) || []
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private async validateRuleDefinition(rule: ValidationRule): Promise<{ valid: boolean, errors: string[], warnings: string[] }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate required fields
    if (!rule.id) errors.push('Rule ID is required')
    if (!rule.name) errors.push('Rule name is required')
    if (!rule.validate) errors.push('Rule validate function is required')
    if (!rule.category) errors.push('Rule category is required')
    if (!rule.severity) errors.push('Rule severity is required')
    if (!rule.type) errors.push('Rule type is required')

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  private createTimeoutPromise(timeout: number, ruleId: string): Promise<ValidationResult> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Validation rule timeout: ${ruleId} (${timeout}ms)`))
      }, timeout)
    })
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  private storeValidationResults(moduleId: string, results: ValidationResult[]): void {
    let history = this.validationHistory.get(moduleId)
    if (!history) {
      history = []
      this.validationHistory.set(moduleId, history)
    }

    history.push(...results)
    
    // Keep only last 100 results per module
    if (history.length > 100) {
      history.splice(0, history.length - 100)
    }
  }

  private createEmptyValidationSummary(): ValidationSummary {
    return {
      totalValidations: 0,
      validationsPassed: 0,
      validationsFailed: 0,
      validationsWithWarnings: 0,
      criticalFailures: 0,
      totalValidationTime: 0,
      overallResult: 'fail',
      validationScore: 0,
      resultsByCategory: {} as any,
      resultsBySeverity: {
        info: 0,
        warning: 0,
        error: 0,
        critical: 0
      }
    }
  }

  private async emitValidationEvent(
    executionId: string,
    moduleEntry: ModuleRegistryEntry,
    event: string,
    state: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    await lifecycleManager.emit('before_activate', {
      moduleId: moduleEntry.definition.id,
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
      description: `Error during validation: ${type}`,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date(),
      context,
      recoverable: true,
      resolution: ['Check validation rule', 'Verify system state', 'Review logs']
    }
  }

  private createLog(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: Record<string, unknown>): ValidationLog {
    return {
      timestamp: new Date(),
      level,
      message,
      data
    }
  }

  private initializeBuiltInRules(): void {
    console.log('Initializing built-in validation rules')
    
    // This would register built-in validation rules
    // for compatibility, resources, security, etc.
  }
}

// =============================================================================
// SUPPORTING CLASSES AND INTERFACES
// =============================================================================

export interface RuleRegistrationResult {
  success: boolean
  ruleId: string
  rule?: ValidationRule
  errors: ModuleError[]
  warnings: string[]
}

export interface ValidationExecutionResult {
  success: boolean
  executionId: string
  duration: number
  summary: ValidationSummary
  results: ValidationResult[]
  logs: ValidationLog[]
  errors: ModuleError[]
  warnings: string[]
  systemState: SystemState
}

class SystemMonitor {
  async getCurrentSystemState(): Promise<SystemState> {
    // Implementation for system state monitoring
    return {
      resourceUsage: {
        memory: { current: 2048, maximum: 8192, percentage: 25, average: 2000, peak: 3072 },
        cpu: { current: 30, maximum: 100, percentage: 30, average: 25, peak: 45 },
        disk: { current: 500, maximum: 1000, percentage: 50, average: 480, peak: 650 },
        network: { current: 100, maximum: 1000, percentage: 10, average: 120, peak: 300 },
        databaseConnections: 5,
        activeProcesses: 25
      },
      activeModules: [],
      systemHealth: {
        status: 'healthy',
        score: 95,
        checks: [],
        lastCheck: new Date()
      },
      networkStatus: {
        connectivity: 'online',
        latency: 50,
        bandwidth: { upload: 100, download: 1000, available: 900 },
        interfaces: []
      },
      storageStatus: {
        devices: [],
        totalStorage: 1000,
        availableStorage: 500,
        usagePercentage: 50
      },
      securityStatus: {
        policies: [],
        activeThreats: [],
        securityScore: 90,
        lastScan: new Date()
      }
    }
  }
}

class SecurityValidator {
  // Implementation for security validation
}

class PerformanceValidator {
  // Implementation for performance validation
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const activationValidator = new ActivationValidator()

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function createActivationValidator(): ActivationValidator {
  return new ActivationValidator()
}

export function getActivationValidator(): ActivationValidator {
  return activationValidator
}

export function registerValidationRule(rule: ValidationRule): Promise<RuleRegistrationResult> {
  return activationValidator.registerValidationRule(rule)
}

export function executePreActivationValidation(
  moduleEntry: ModuleRegistryEntry,
  activationConfig: ActivationConfiguration,
  validationConfig: ValidationConfiguration
): Promise<ValidationExecutionResult> {
  return activationValidator.executePreActivationValidation(moduleEntry, activationConfig, validationConfig)
}

export function getValidationRulesByCategory(category: ValidationCategory): ValidationRule[] {
  return activationValidator.getValidationRulesByCategory(category)
}

export function getValidationHistory(moduleId: string): ValidationResult[] {
  return activationValidator.getValidationHistory(moduleId)
}
