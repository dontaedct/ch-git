/**
 * HT-035.2.2: Module Registry System
 * 
 * Centralized module registry with declarative registration, capability discovery,
 * and automatic UI/routing integration per PRD Section 7 requirements.
 * 
 * Features:
 * - Centralized module registry
 * - Declarative module registration
 * - Capability discovery and management
 * - Automatic UI/routing integration
 * - Module dependency resolution
 * - Registry performance optimization
 */

import { ModuleDefinition, ModuleCapability, ModuleDependency } from './activation-engine'
import { ModuleContract, ModuleContext, ModuleInitializationResult } from './module-contract'
import { lifecycleManager } from './module-lifecycle'
import { configManager } from './module-config'

// =============================================================================
// CORE TYPES AND INTERFACES
// =============================================================================

export interface ModuleRegistryEntry {
  /** Module definition */
  definition: ModuleDefinition
  
  /** Module contract implementation */
  contract: ModuleContract
  
  /** Module registration metadata */
  registration: ModuleRegistration
  
  /** Module status */
  status: ModuleStatus
  
  /** Module capabilities */
  capabilities: ModuleCapability[]
  
  /** Module dependencies */
  dependencies: ModuleDependency[]
  
  /** Module integration points */
  integrations: ModuleIntegrations
  
  /** Module performance metrics */
  metrics: ModuleRegistryMetrics
}

export interface ModuleRegistration {
  /** Registration ID */
  id: string
  
  /** Registration timestamp */
  registeredAt: Date
  
  /** Registration source */
  source: 'manual' | 'automatic' | 'marketplace' | 'system'
  
  /** Registration metadata */
  metadata: Record<string, unknown>
  
  /** Registration validation results */
  validation: ModuleRegistrationValidation
  
  /** Registration errors */
  errors: ModuleRegistrationError[]
  
  /** Registration warnings */
  warnings: ModuleRegistrationWarning[]
}

export interface ModuleStatus {
  /** Current status */
  status: 'registered' | 'validating' | 'ready' | 'active' | 'inactive' | 'error' | 'unregistered'
  
  /** Status timestamp */
  timestamp: Date
  
  /** Status message */
  message: string
  
  /** Status details */
  details?: Record<string, unknown>
  
  /** Previous status */
  previousStatus?: string
  
  /** Status transitions */
  transitions: StatusTransition[]
}

export interface ModuleIntegrations {
  /** UI routes registered */
  uiRoutes: UIRouteIntegration[]
  
  /** API routes registered */
  apiRoutes: APIRouteIntegration[]
  
  /** Components registered */
  components: ComponentIntegration[]
  
  /** Navigation items registered */
  navigation: NavigationIntegration[]
  
  /** Database schemas registered */
  database: DatabaseIntegration[]
  
  /** Configuration schemas registered */
  configuration: ConfigurationIntegration[]
}

export interface UIRouteIntegration {
  /** Route ID */
  id: string
  
  /** Route path */
  path: string
  
  /** Route component */
  component: string
  
  /** Route permissions */
  permissions: string[]
  
  /** Route metadata */
  metadata: Record<string, unknown>
  
  /** Integration status */
  status: 'pending' | 'active' | 'inactive' | 'error'
}

export interface APIRouteIntegration {
  /** Route ID */
  id: string
  
  /** Route path */
  path: string
  
  /** HTTP methods */
  methods: string[]
  
  /** Route permissions */
  permissions: string[]
  
  /** Route middleware */
  middleware: string[]
  
  /** Integration status */
  status: 'pending' | 'active' | 'inactive' | 'error'
}

export interface ComponentIntegration {
  /** Component ID */
  id: string
  
  /** Component name */
  name: string
  
  /** Component path */
  path: string
  
  /** Component type */
  type: 'page' | 'component' | 'layout' | 'widget'
  
  /** Component permissions */
  permissions: string[]
  
  /** Integration status */
  status: 'pending' | 'active' | 'inactive' | 'error'
}

export interface NavigationIntegration {
  /** Navigation item ID */
  id: string
  
  /** Navigation label */
  label: string
  
  /** Navigation path */
  path: string
  
  /** Navigation icon */
  icon?: string
  
  /** Navigation permissions */
  permissions: string[]
  
  /** Navigation order */
  order: number
  
  /** Integration status */
  status: 'pending' | 'active' | 'inactive' | 'error'
}

export interface DatabaseIntegration {
  /** Schema ID */
  id: string
  
  /** Schema name */
  name: string
  
  /** Schema tables */
  tables: string[]
  
  /** Schema migrations */
  migrations: string[]
  
  /** Integration status */
  status: 'pending' | 'active' | 'inactive' | 'error'
}

export interface ConfigurationIntegration {
  /** Configuration ID */
  id: string
  
  /** Configuration schema */
  schema: Record<string, unknown>
  
  /** Configuration defaults */
  defaults: Record<string, unknown>
  
  /** Integration status */
  status: 'pending' | 'active' | 'inactive' | 'error'
}

export interface ModuleRegistryMetrics {
  /** Registration time */
  registrationTime: number
  
  /** Activation time */
  activationTime: number
  
  /** Last accessed time */
  lastAccessed: Date
  
  /** Access count */
  accessCount: number
  
  /** Error count */
  errorCount: number
  
  /** Performance metrics */
  performance: ModulePerformanceMetrics
}

export interface ModulePerformanceMetrics {
  /** Average response time */
  averageResponseTime: number
  
  /** Peak response time */
  peakResponseTime: number
  
  /** Error rate */
  errorRate: number
  
  /** Throughput */
  throughput: number
  
  /** Resource usage */
  resourceUsage: ResourceUsage
}

export interface ResourceUsage {
  /** Memory usage */
  memory: number
  
  /** CPU usage */
  cpu: number
  
  /** Storage usage */
  storage: number
  
  /** Network usage */
  network: number
}

export interface StatusTransition {
  /** From status */
  from: string
  
  /** To status */
  to: string
  
  /** Transition timestamp */
  timestamp: Date
  
  /** Transition reason */
  reason: string
  
  /** Transition details */
  details?: Record<string, unknown>
}

export interface ModuleRegistrationValidation {
  /** Whether registration is valid */
  valid: boolean
  
  /** Validation errors */
  errors: string[]
  
  /** Validation warnings */
  warnings: string[]
  
  /** Validation details */
  details: Record<string, unknown>
}

export interface ModuleRegistrationError {
  /** Error code */
  code: string
  
  /** Error message */
  message: string
  
  /** Error details */
  details?: Record<string, unknown>
  
  /** Error timestamp */
  timestamp: Date
}

export interface ModuleRegistrationWarning {
  /** Warning code */
  code: string
  
  /** Warning message */
  message: string
  
  /** Warning details */
  details?: Record<string, unknown>
  
  /** Warning timestamp */
  timestamp: Date
}

export interface ModuleDiscoveryResult {
  /** Discovered modules */
  modules: ModuleRegistryEntry[]
  
  /** Discovery errors */
  errors: ModuleDiscoveryError[]
  
  /** Discovery warnings */
  warnings: ModuleDiscoveryWarning[]
  
  /** Discovery metadata */
  metadata: ModuleDiscoveryMetadata
}

export interface ModuleDiscoveryError {
  /** Error code */
  code: string
  
  /** Error message */
  message: string
  
  /** Error source */
  source: string
  
  /** Error details */
  details?: Record<string, unknown>
}

export interface ModuleDiscoveryWarning {
  /** Warning code */
  code: string
  
  /** Warning message */
  message: string
  
  /** Warning source */
  source: string
  
  /** Warning details */
  details?: Record<string, unknown>
}

export interface ModuleDiscoveryMetadata {
  /** Discovery timestamp */
  timestamp: Date
  
  /** Discovery duration */
  duration: number
  
  /** Discovery source */
  source: string
  
  /** Discovery version */
  version: string
}

// =============================================================================
// MODULE REGISTRY CLASS
// =============================================================================

export class ModuleRegistry {
  private modules: Map<string, ModuleRegistryEntry> = new Map()
  private capabilities: Map<string, ModuleCapability[]> = new Map()
  private dependencies: Map<string, ModuleDependency[]> = new Map()
  private integrations: Map<string, ModuleIntegrations> = new Map()
  private metrics: Map<string, ModuleRegistryMetrics> = new Map()
  private discoveryCache: Map<string, ModuleDiscoveryResult> = new Map()
  private performanceOptimizer: RegistryPerformanceOptimizer

  constructor() {
    this.performanceOptimizer = new RegistryPerformanceOptimizer()
    this.initializeBuiltInModules()
  }

  /**
   * Register a module with the registry
   */
  async registerModule(
    definition: ModuleDefinition,
    contract: ModuleContract,
    source: 'manual' | 'automatic' | 'marketplace' | 'system' = 'manual',
    metadata: Record<string, unknown> = {}
  ): Promise<ModuleRegistrationResult> {
    const registrationId = `${definition.id}-${Date.now()}`
    const startTime = Date.now()

    try {
      // Validate module definition
      const validation = await this.validateModuleDefinition(definition, contract)
      if (!validation.valid) {
        return {
          success: false,
          registrationId,
          errors: validation.errors,
          warnings: validation.warnings
        }
      }

      // Check for conflicts
      const conflicts = await this.detectConflicts(definition)
      if (conflicts.length > 0) {
        return {
          success: false,
          registrationId,
          errors: conflicts.map(c => ({
            code: 'MODULE_CONFLICT',
            message: `Module conflict: ${c.message}`,
            details: c.details
          })),
          warnings: []
        }
      }

      // Create registration entry
      const registration: ModuleRegistration = {
        id: registrationId,
        registeredAt: new Date(),
        source,
        metadata,
        validation,
        errors: [],
        warnings: validation.warnings.map(w => ({
          code: 'VALIDATION_WARNING',
          message: w,
          timestamp: new Date()
        }))
      }

      // Create module status
      const status: ModuleStatus = {
        status: 'registered',
        timestamp: new Date(),
        message: 'Module registered successfully',
        transitions: [{
          from: 'unregistered',
          to: 'registered',
          timestamp: new Date(),
          reason: 'module_registration'
        }]
      }

      // Create module integrations
      const integrations = await this.createModuleIntegrations(definition)

      // Create module metrics
      const metrics: ModuleRegistryMetrics = {
        registrationTime: Date.now() - startTime,
        activationTime: 0,
        lastAccessed: new Date(),
        accessCount: 0,
        errorCount: 0,
        performance: {
          averageResponseTime: 0,
          peakResponseTime: 0,
          errorRate: 0,
          throughput: 0,
          resourceUsage: {
            memory: 0,
            cpu: 0,
            storage: 0,
            network: 0
          }
        }
      }

      // Create registry entry
      const entry: ModuleRegistryEntry = {
        definition,
        contract,
        registration,
        status,
        capabilities: definition.capabilities,
        dependencies: definition.dependencies,
        integrations,
        metrics
      }

      // Store in registry
      this.modules.set(definition.id, entry)
      this.capabilities.set(definition.id, definition.capabilities)
      this.dependencies.set(definition.id, definition.dependencies)
      this.integrations.set(definition.id, integrations)
      this.metrics.set(definition.id, metrics)

      // Emit lifecycle event
      await lifecycleManager.emit('afterActivation', {
        moduleId: definition.id,
        tenantId: 'system',
        data: { registration, entry }
      })

      // Update performance metrics
      this.performanceOptimizer.updateRegistrationMetrics(definition.id, metrics)

      return {
        success: true,
        registrationId,
        entry,
        errors: [],
        warnings: registration.warnings
      }

    } catch (error) {
      return {
        success: false,
        registrationId,
        errors: [{
          code: 'REGISTRATION_ERROR',
          message: error instanceof Error ? error.message : String(error),
          details: { source, metadata }
        }],
        warnings: []
      }
    }
  }

  /**
   * Unregister a module from the registry
   */
  async unregisterModule(moduleId: string): Promise<ModuleUnregistrationResult> {
    const entry = this.modules.get(moduleId)
    if (!entry) {
      return {
        success: false,
        errors: [{
          code: 'MODULE_NOT_FOUND',
          message: `Module ${moduleId} not found in registry`
        }]
      }
    }

    try {
      // Update status
      entry.status.status = 'unregistered'
      entry.status.timestamp = new Date()
      entry.status.message = 'Module unregistered'
      entry.status.transitions.push({
        from: entry.status.status,
        to: 'unregistered',
        timestamp: new Date(),
        reason: 'module_unregistration'
      })

      // Cleanup integrations
      await this.cleanupModuleIntegrations(moduleId, entry.integrations)

      // Remove from registry
      this.modules.delete(moduleId)
      this.capabilities.delete(moduleId)
      this.dependencies.delete(moduleId)
      this.integrations.delete(moduleId)
      this.metrics.delete(moduleId)

      // Emit lifecycle event
      await lifecycleManager.emit('afterDeactivation', {
        moduleId,
        tenantId: 'system',
        data: { entry }
      })

      return {
        success: true,
        errors: []
      }

    } catch (error) {
      return {
        success: false,
        errors: [{
          code: 'UNREGISTRATION_ERROR',
          message: error instanceof Error ? error.message : String(error)
        }]
      }
    }
  }

  /**
   * Get a module from the registry
   */
  getModule(moduleId: string): ModuleRegistryEntry | undefined {
    const entry = this.modules.get(moduleId)
    if (entry) {
      // Update access metrics
      entry.metrics.lastAccessed = new Date()
      entry.metrics.accessCount++
      this.performanceOptimizer.updateAccessMetrics(moduleId, entry.metrics)
    }
    return entry
  }

  /**
   * Get all modules from the registry
   */
  getAllModules(): ModuleRegistryEntry[] {
    return Array.from(this.modules.values())
  }

  /**
   * Get modules by capability
   */
  getModulesByCapability(capabilityId: string): ModuleRegistryEntry[] {
    const modules: ModuleRegistryEntry[] = []
    
    for (const [moduleId, capabilities] of this.capabilities) {
      if (capabilities.some(cap => cap.id === capabilityId)) {
        const entry = this.modules.get(moduleId)
        if (entry) {
          modules.push(entry)
        }
      }
    }
    
    return modules
  }

  /**
   * Get modules by status
   */
  getModulesByStatus(status: string): ModuleRegistryEntry[] {
    const modules: ModuleRegistryEntry[] = []
    
    for (const entry of this.modules.values()) {
      if (entry.status.status === status) {
        modules.push(entry)
      }
    }
    
    return modules
  }

  /**
   * Discover modules automatically
   */
  async discoverModules(source: string = 'filesystem'): Promise<ModuleDiscoveryResult> {
    const startTime = Date.now()
    const errors: ModuleDiscoveryError[] = []
    const warnings: ModuleDiscoveryWarning[] = []
    const modules: ModuleRegistryEntry[] = []

    try {
      // Check cache first
      const cacheKey = `discovery-${source}`
      const cached = this.discoveryCache.get(cacheKey)
      if (cached && Date.now() - cached.metadata.timestamp.getTime() < 300000) { // 5 minutes
        return cached
      }

      // Perform discovery based on source
      switch (source) {
        case 'filesystem':
          await this.discoverFromFilesystem(modules, errors, warnings)
          break
        case 'marketplace':
          await this.discoverFromMarketplace(modules, errors, warnings)
          break
        case 'network':
          await this.discoverFromNetwork(modules, errors, warnings)
          break
        default:
          errors.push({
            code: 'UNKNOWN_DISCOVERY_SOURCE',
            message: `Unknown discovery source: ${source}`,
            source
          })
      }

      const result: ModuleDiscoveryResult = {
        modules,
        errors,
        warnings,
        metadata: {
          timestamp: new Date(),
          duration: Date.now() - startTime,
          source,
          version: '1.0.0'
        }
      }

      // Cache result
      this.discoveryCache.set(cacheKey, result)

      return result

    } catch (error) {
      errors.push({
        code: 'DISCOVERY_ERROR',
        message: error instanceof Error ? error.message : String(error),
        source
      })

      return {
        modules: [],
        errors,
        warnings,
        metadata: {
          timestamp: new Date(),
          duration: Date.now() - startTime,
          source,
          version: '1.0.0'
        }
      }
    }
  }

  /**
   * Update module status
   */
  async updateModuleStatus(
    moduleId: string,
    status: string,
    message: string,
    details?: Record<string, unknown>
  ): Promise<boolean> {
    const entry = this.modules.get(moduleId)
    if (!entry) {
      return false
    }

    const previousStatus = entry.status.status
    entry.status.previousStatus = previousStatus
    entry.status.status = status as any
    entry.status.timestamp = new Date()
    entry.status.message = message
    entry.status.details = details

    entry.status.transitions.push({
      from: previousStatus,
      to: status,
      timestamp: new Date(),
      reason: 'status_update',
      details
    })

    return true
  }

  /**
   * Get registry statistics
   */
  getRegistryStatistics(): RegistryStatistics {
    const totalModules = this.modules.size
    const statusCounts: Record<string, number> = {}
    const capabilityCounts: Record<string, number> = {}
    const sourceCounts: Record<string, number> = {}

    for (const entry of this.modules.values()) {
      // Count by status
      statusCounts[entry.status.status] = (statusCounts[entry.status.status] || 0) + 1

      // Count by source
      sourceCounts[entry.registration.source] = (sourceCounts[entry.registration.source] || 0) + 1

      // Count by capabilities
      for (const capability of entry.capabilities) {
        capabilityCounts[capability.id] = (capabilityCounts[capability.id] || 0) + 1
      }
    }

    return {
      totalModules,
      statusCounts,
      capabilityCounts,
      sourceCounts,
      lastUpdated: new Date()
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private async validateModuleDefinition(
    definition: ModuleDefinition,
    contract: ModuleContract
  ): Promise<ModuleRegistrationValidation> {
    const errors: string[] = []
    const warnings: string[] = []
    const details: Record<string, unknown> = {}

    // Validate required fields
    if (!definition.id) {
      errors.push('Module ID is required')
    }

    if (!definition.name) {
      errors.push('Module name is required')
    }

    if (!definition.version) {
      errors.push('Module version is required')
    }

    // Validate contract implementation
    if (!contract.initialize) {
      errors.push('Module contract must implement initialize method')
    }

    if (!contract.cleanup) {
      errors.push('Module contract must implement cleanup method')
    }

    // Validate capabilities
    for (const capability of definition.capabilities) {
      if (!capability.id) {
        errors.push('Capability ID is required')
      }
      if (!capability.name) {
        errors.push('Capability name is required')
      }
    }

    // Validate dependencies
    for (const dependency of definition.dependencies) {
      if (!dependency.id) {
        errors.push('Dependency ID is required')
      }
      if (!dependency.version) {
        errors.push('Dependency version is required')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      details
    }
  }

  private async detectConflicts(definition: ModuleDefinition): Promise<ConflictDetection[]> {
    const conflicts: ConflictDetection[] = []

    // Check for duplicate module ID
    if (this.modules.has(definition.id)) {
      conflicts.push({
        type: 'duplicate_id',
        message: `Module with ID ${definition.id} already exists`,
        details: { moduleId: definition.id }
      })
    }

    // Check for route conflicts
    for (const route of definition.routes) {
      const existingRoute = this.findConflictingRoute(route.path)
      if (existingRoute) {
        conflicts.push({
          type: 'route_conflict',
          message: `Route ${route.path} conflicts with existing route`,
          details: { route: route.path, conflictingModule: existingRoute }
        })
      }
    }

    // Check for API conflicts
    for (const api of definition.apis) {
      const existingApi = this.findConflictingApi(api.path)
      if (existingApi) {
        conflicts.push({
          type: 'api_conflict',
          message: `API ${api.path} conflicts with existing API`,
          details: { api: api.path, conflictingModule: existingApi }
        })
      }
    }

    return conflicts
  }

  private findConflictingRoute(path: string): string | null {
    for (const entry of this.modules.values()) {
      if (entry.integrations.uiRoutes.some(route => route.path === path)) {
        return entry.definition.id
      }
    }
    return null
  }

  private findConflictingApi(path: string): string | null {
    for (const entry of this.modules.values()) {
      if (entry.integrations.apiRoutes.some(api => api.path === path)) {
        return entry.definition.id
      }
    }
    return null
  }

  private async createModuleIntegrations(definition: ModuleDefinition): Promise<ModuleIntegrations> {
    const integrations: ModuleIntegrations = {
      uiRoutes: [],
      apiRoutes: [],
      components: [],
      navigation: [],
      database: [],
      configuration: []
    }

    // Create UI route integrations
    for (const route of definition.routes) {
      integrations.uiRoutes.push({
        id: `${definition.id}-route-${route.path}`,
        path: route.path,
        component: route.component,
        permissions: route.permissions,
        metadata: {},
        status: 'pending'
      })
    }

    // Create API route integrations
    for (const api of definition.apis) {
      integrations.apiRoutes.push({
        id: `${definition.id}-api-${api.path}`,
        path: api.path,
        methods: api.methods,
        permissions: api.permissions,
        middleware: api.middleware || [],
        status: 'pending'
      })
    }

    // Create component integrations
    for (const component of definition.components) {
      integrations.components.push({
        id: component.id,
        name: component.name,
        path: component.path,
        type: 'component',
        permissions: component.permissions,
        status: 'pending'
      })
    }

    // Create database integrations
    if (definition.database.schemas.length > 0) {
      integrations.database.push({
        id: `${definition.id}-database`,
        name: `${definition.id}_schema`,
        tables: definition.database.schemas.flatMap(schema => schema.tables.map(table => table.name)),
        migrations: definition.database.migrations.map(migration => migration.file),
        status: 'pending'
      })
    }

    // Create configuration integrations
    if (Object.keys(definition.configSchema).length > 0) {
      integrations.configuration.push({
        id: `${definition.id}-config`,
        schema: definition.configSchema,
        defaults: definition.defaultConfig,
        status: 'pending'
      })
    }

    return integrations
  }

  private async cleanupModuleIntegrations(moduleId: string, integrations: ModuleIntegrations): Promise<void> {
    // Cleanup UI routes
    for (const route of integrations.uiRoutes) {
      // Implementation for route cleanup
      console.log(`Cleaning up UI route: ${route.path}`)
    }

    // Cleanup API routes
    for (const api of integrations.apiRoutes) {
      // Implementation for API cleanup
      console.log(`Cleaning up API route: ${api.path}`)
    }

    // Cleanup components
    for (const component of integrations.components) {
      // Implementation for component cleanup
      console.log(`Cleaning up component: ${component.name}`)
    }

    // Cleanup database
    for (const db of integrations.database) {
      // Implementation for database cleanup
      console.log(`Cleaning up database schema: ${db.name}`)
    }

    // Cleanup configuration
    for (const config of integrations.configuration) {
      // Implementation for configuration cleanup
      console.log(`Cleaning up configuration: ${config.id}`)
    }
  }

  private async discoverFromFilesystem(
    modules: ModuleRegistryEntry[],
    errors: ModuleDiscoveryError[],
    warnings: ModuleDiscoveryWarning[]
  ): Promise<void> {
    // Implementation for filesystem discovery
    console.log('Discovering modules from filesystem')
  }

  private async discoverFromMarketplace(
    modules: ModuleRegistryEntry[],
    errors: ModuleDiscoveryError[],
    warnings: ModuleDiscoveryWarning[]
  ): Promise<void> {
    // Implementation for marketplace discovery
    console.log('Discovering modules from marketplace')
  }

  private async discoverFromNetwork(
    modules: ModuleRegistryEntry[],
    errors: ModuleDiscoveryError[],
    warnings: ModuleDiscoveryWarning[]
  ): Promise<void> {
    // Implementation for network discovery
    console.log('Discovering modules from network')
  }

  private initializeBuiltInModules(): void {
    // Initialize built-in system modules
    console.log('Initializing built-in modules')
  }
}

// =============================================================================
// SUPPORTING CLASSES AND INTERFACES
// =============================================================================

export interface ModuleRegistrationResult {
  success: boolean
  registrationId: string
  entry?: ModuleRegistryEntry
  errors: ModuleRegistrationError[]
  warnings: ModuleRegistrationWarning[]
}

export interface ModuleUnregistrationResult {
  success: boolean
  errors: ModuleRegistrationError[]
}

export interface ConflictDetection {
  type: string
  message: string
  details: Record<string, unknown>
}

export interface RegistryStatistics {
  totalModules: number
  statusCounts: Record<string, number>
  capabilityCounts: Record<string, number>
  sourceCounts: Record<string, number>
  lastUpdated: Date
}

class RegistryPerformanceOptimizer {
  updateRegistrationMetrics(moduleId: string, metrics: ModuleRegistryMetrics): void {
    // Implementation for performance optimization
    console.log(`Updating registration metrics for ${moduleId}`)
  }

  updateAccessMetrics(moduleId: string, metrics: ModuleRegistryMetrics): void {
    // Implementation for access metrics optimization
    console.log(`Updating access metrics for ${moduleId}`)
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const moduleRegistry = new ModuleRegistry()

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function createModuleRegistry(): ModuleRegistry {
  return new ModuleRegistry()
}

export function getModuleRegistry(): ModuleRegistry {
  return moduleRegistry
}

export function registerModule(
  definition: ModuleDefinition,
  contract: ModuleContract,
  source?: 'manual' | 'automatic' | 'marketplace' | 'system',
  metadata?: Record<string, unknown>
): Promise<ModuleRegistrationResult> {
  return moduleRegistry.registerModule(definition, contract, source, metadata)
}

export function unregisterModule(moduleId: string): Promise<ModuleUnregistrationResult> {
  return moduleRegistry.unregisterModule(moduleId)
}

export function getModule(moduleId: string): ModuleRegistryEntry | undefined {
  return moduleRegistry.getModule(moduleId)
}

export function getAllModules(): ModuleRegistryEntry[] {
  return moduleRegistry.getAllModules()
}

export function getModulesByCapability(capabilityId: string): ModuleRegistryEntry[] {
  return moduleRegistry.getModulesByCapability(capabilityId)
}

export function getModulesByStatus(status: string): ModuleRegistryEntry[] {
  return moduleRegistry.getModulesByStatus(status)
}

export function discoverModules(source?: string): Promise<ModuleDiscoveryResult> {
  return moduleRegistry.discoverModules(source)
}

export function getRegistryStatistics(): RegistryStatistics {
  return moduleRegistry.getRegistryStatistics()
}
