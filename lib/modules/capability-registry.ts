/**
 * HT-035.2.2: Module Capability Registry & Discovery System
 * 
 * Module capability registry and discovery system that manages module capabilities,
 * provides capability-based module discovery, and enables capability composition
 * per PRD Section 7 requirements.
 * 
 * Features:
 * - Capability registration and management
 * - Capability-based module discovery
 * - Capability composition and chaining
 * - Capability versioning and compatibility
 * - Capability performance optimization
 * - Capability analytics and monitoring
 */

import { ModuleCapability, ModuleDependency } from './activation-engine'
import { moduleRegistry, ModuleRegistryEntry } from './module-registry'
import { lifecycleManager } from './module-lifecycle'

// =============================================================================
// CORE TYPES AND INTERFACES
// =============================================================================

export interface CapabilityRegistryEntry {
  /** Capability definition */
  capability: ModuleCapability
  
  /** Module that provides this capability */
  provider: CapabilityProvider
  
  /** Capability status */
  status: CapabilityStatus
  
  /** Capability dependencies */
  dependencies: CapabilityDependency[]
  
  /** Capability consumers */
  consumers: CapabilityConsumer[]
  
  /** Capability metrics */
  metrics: CapabilityMetrics
  
  /** Capability metadata */
  metadata: CapabilityMetadata
}

export interface CapabilityProvider {
  /** Module ID */
  moduleId: string
  
  /** Module version */
  moduleVersion: string
  
  /** Provider status */
  status: 'active' | 'inactive' | 'deprecated' | 'removed'
  
  /** Provider priority */
  priority: number
  
  /** Provider metadata */
  metadata: Record<string, unknown>
  
  /** Provider registration timestamp */
  registeredAt: Date
  
  /** Provider last updated */
  lastUpdated: Date
}

export interface CapabilityStatus {
  /** Current status */
  status: 'available' | 'unavailable' | 'deprecated' | 'experimental' | 'maintenance'
  
  /** Status message */
  message: string
  
  /** Status timestamp */
  timestamp: Date
  
  /** Status details */
  details?: Record<string, unknown>
  
  /** Status transitions */
  transitions: CapabilityStatusTransition[]
}

export interface CapabilityDependency {
  /** Dependency capability ID */
  capabilityId: string
  
  /** Dependency version constraint */
  versionConstraint: string
  
  /** Dependency type */
  type: 'required' | 'optional' | 'peer'
  
  /** Dependency status */
  status: 'satisfied' | 'unsatisfied' | 'conflict'
  
  /** Dependency provider */
  provider?: CapabilityProvider
}

export interface CapabilityConsumer {
  /** Consumer module ID */
  moduleId: string
  
  /** Consumer module version */
  moduleVersion: string
  
  /** Consumer status */
  status: 'active' | 'inactive' | 'deprecated'
  
  /** Consumer usage pattern */
  usagePattern: 'direct' | 'indirect' | 'composition'
  
  /** Consumer metadata */
  metadata: Record<string, unknown>
  
  /** Consumer registration timestamp */
  registeredAt: Date
}

export interface CapabilityMetrics {
  /** Usage count */
  usageCount: number
  
  /** Last used timestamp */
  lastUsed: Date
  
  /** Average response time */
  averageResponseTime: number
  
  /** Error rate */
  errorRate: number
  
  /** Success rate */
  successRate: number
  
  /** Performance metrics */
  performance: CapabilityPerformanceMetrics
  
  /** Resource usage */
  resourceUsage: CapabilityResourceUsage
}

export interface CapabilityMetadata {
  /** Capability tags */
  tags: string[]
  
  /** Capability documentation */
  documentation: string
  
  /** Capability examples */
  examples: CapabilityExample[]
  
  /** Capability changelog */
  changelog: CapabilityChangelogEntry[]
  
  /** Capability support information */
  support: CapabilitySupportInfo
  
  /** Capability licensing */
  licensing: CapabilityLicensing
}

export interface CapabilityPerformanceMetrics {
  /** Response time percentiles */
  responseTimePercentiles: Record<string, number>
  
  /** Throughput metrics */
  throughput: ThroughputMetrics
  
  /** Error metrics */
  errorMetrics: ErrorMetrics
  
  /** Resource efficiency */
  resourceEfficiency: ResourceEfficiencyMetrics
}

export interface CapabilityResourceUsage {
  /** Memory usage */
  memory: ResourceUsageMetrics
  
  /** CPU usage */
  cpu: ResourceUsageMetrics
  
  /** Storage usage */
  storage: ResourceUsageMetrics
  
  /** Network usage */
  network: ResourceUsageMetrics
}

export interface CapabilityExample {
  /** Example ID */
  id: string
  
  /** Example name */
  name: string
  
  /** Example description */
  description: string
  
  /** Example code */
  code: string
  
  /** Example language */
  language: string
  
  /** Example category */
  category: string
}

export interface CapabilityChangelogEntry {
  /** Version */
  version: string
  
  /** Change type */
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security'
  
  /** Change description */
  description: string
  
  /** Change timestamp */
  timestamp: Date
  
  /** Breaking change */
  breaking: boolean
}

export interface CapabilitySupportInfo {
  /** Support status */
  status: 'active' | 'deprecated' | 'discontinued'
  
  /** Support contact */
  contact: string
  
  /** Support documentation URL */
  documentationUrl: string
  
  /** Support issues URL */
  issuesUrl: string
  
  /** Support community URL */
  communityUrl: string
  
  /** Support SLA */
  sla: SupportSLA
}

export interface CapabilityLicensing {
  /** License type */
  type: string
  
  /** License text */
  text: string
  
  /** License URL */
  url: string
  
  /** License restrictions */
  restrictions: string[]
  
  /** License permissions */
  permissions: string[]
}

export interface CapabilityStatusTransition {
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

export interface ThroughputMetrics {
  /** Requests per second */
  requestsPerSecond: number
  
  /** Peak requests per second */
  peakRequestsPerSecond: number
  
  /** Average requests per second */
  averageRequestsPerSecond: number
  
  /** Total requests */
  totalRequests: number
}

export interface ErrorMetrics {
  /** Total errors */
  totalErrors: number
  
  /** Error rate */
  errorRate: number
  
  /** Error types */
  errorTypes: Record<string, number>
  
  /** Error trends */
  errorTrends: ErrorTrend[]
}

export interface ResourceEfficiencyMetrics {
  /** Memory efficiency */
  memoryEfficiency: number
  
  /** CPU efficiency */
  cpuEfficiency: number
  
  /** Storage efficiency */
  storageEfficiency: number
  
  /** Network efficiency */
  networkEfficiency: number
}

export interface ResourceUsageMetrics {
  /** Current usage */
  current: number
  
  /** Average usage */
  average: number
  
  /** Peak usage */
  peak: number
  
  /** Usage unit */
  unit: string
  
  /** Usage trend */
  trend: 'increasing' | 'decreasing' | 'stable'
}

export interface ErrorTrend {
  /** Timestamp */
  timestamp: Date
  
  /** Error count */
  count: number
  
  /** Error rate */
  rate: number
}

export interface SupportSLA {
  /** Response time */
  responseTime: number
  
  /** Resolution time */
  resolutionTime: number
  
  /** Availability */
  availability: number
  
  /** Support hours */
  supportHours: string
}

// =============================================================================
// CAPABILITY DISCOVERY TYPES
// =============================================================================

export interface CapabilityDiscoveryQuery {
  /** Query ID */
  id: string
  
  /** Query type */
  type: 'exact' | 'fuzzy' | 'semantic' | 'composite'
  
  /** Query parameters */
  parameters: CapabilityQueryParameters
  
  /** Query filters */
  filters: CapabilityQueryFilters
  
  /** Query options */
  options: CapabilityQueryOptions
}

export interface CapabilityQueryParameters {
  /** Capability ID */
  capabilityId?: string
  
  /** Capability name */
  name?: string
  
  /** Capability description */
  description?: string
  
  /** Capability category */
  category?: string
  
  /** Capability tags */
  tags?: string[]
  
  /** Capability version */
  version?: string
  
  /** Capability status */
  status?: string[]
  
  /** Provider module ID */
  providerModuleId?: string
  
  /** Provider status */
  providerStatus?: string[]
}

export interface CapabilityQueryFilters {
  /** Version constraints */
  versionConstraints?: VersionConstraint[]
  
  /** Status filters */
  statusFilters?: string[]
  
  /** Provider filters */
  providerFilters?: ProviderFilter[]
  
  /** Performance filters */
  performanceFilters?: PerformanceFilter[]
  
  /** Resource filters */
  resourceFilters?: ResourceFilter[]
  
  /** Licensing filters */
  licensingFilters?: LicensingFilter[]
}

export interface CapabilityQueryOptions {
  /** Result limit */
  limit?: number
  
  /** Result offset */
  offset?: number
  
  /** Sort order */
  sortBy?: string
  
  /** Sort direction */
  sortDirection?: 'asc' | 'desc'
  
  /** Include metadata */
  includeMetadata?: boolean
  
  /** Include metrics */
  includeMetrics?: boolean
  
  /** Include examples */
  includeExamples?: boolean
}

export interface VersionConstraint {
  /** Capability ID */
  capabilityId: string
  
  /** Version range */
  versionRange: string
  
  /** Constraint type */
  type: 'exact' | 'range' | 'minimum' | 'maximum'
}

export interface ProviderFilter {
  /** Provider module ID */
  moduleId?: string
  
  /** Provider status */
  status?: string[]
  
  /** Provider priority */
  priority?: number
}

export interface PerformanceFilter {
  /** Minimum response time */
  minResponseTime?: number
  
  /** Maximum response time */
  maxResponseTime?: number
  
  /** Minimum success rate */
  minSuccessRate?: number
  
  /** Maximum error rate */
  maxErrorRate?: number
}

export interface ResourceFilter {
  /** Maximum memory usage */
  maxMemoryUsage?: number
  
  /** Maximum CPU usage */
  maxCpuUsage?: number
  
  /** Maximum storage usage */
  maxStorageUsage?: number
  
  /** Maximum network usage */
  maxNetworkUsage?: number
}

export interface LicensingFilter {
  /** License types */
  licenseTypes?: string[]
  
  /** License restrictions */
  restrictions?: string[]
  
  /** Commercial use allowed */
  commercialUse?: boolean
}

export interface CapabilityDiscoveryResult {
  /** Discovered capabilities */
  capabilities: CapabilityRegistryEntry[]
  
  /** Discovery metadata */
  metadata: CapabilityDiscoveryMetadata
  
  /** Discovery errors */
  errors: CapabilityDiscoveryError[]
  
  /** Discovery warnings */
  warnings: CapabilityDiscoveryWarning[]
  
  /** Discovery performance */
  performance: CapabilityDiscoveryPerformance
}

export interface CapabilityDiscoveryMetadata {
  /** Discovery timestamp */
  timestamp: Date
  
  /** Discovery duration */
  duration: number
  
  /** Discovery source */
  source: string
  
  /** Discovery version */
  version: string
  
  /** Total capabilities found */
  totalFound: number
  
  /** Capabilities returned */
  capabilitiesReturned: number
  
  /** Discovery query */
  query: CapabilityDiscoveryQuery
}

export interface CapabilityDiscoveryError {
  /** Error code */
  code: string
  
  /** Error message */
  message: string
  
  /** Error source */
  source: string
  
  /** Error details */
  details?: Record<string, unknown>
}

export interface CapabilityDiscoveryWarning {
  /** Warning code */
  code: string
  
  /** Warning message */
  message: string
  
  /** Warning source */
  source: string
  
  /** Warning details */
  details?: Record<string, unknown>
}

export interface CapabilityDiscoveryPerformance {
  /** Query execution time */
  queryTime: number
  
  /** Result processing time */
  processingTime: number
  
  /** Cache hit rate */
  cacheHitRate: number
  
  /** Memory usage */
  memoryUsage: number
}

// =============================================================================
// CAPABILITY COMPOSITION TYPES
// =============================================================================

export interface CapabilityComposition {
  /** Composition ID */
  id: string
  
  /** Composition name */
  name: string
  
  /** Composition description */
  description: string
  
  /** Composition capabilities */
  capabilities: CapabilityCompositionEntry[]
  
  /** Composition dependencies */
  dependencies: CapabilityCompositionDependency[]
  
  /** Composition status */
  status: 'active' | 'inactive' | 'deprecated'
  
  /** Composition metadata */
  metadata: Record<string, unknown>
}

export interface CapabilityCompositionEntry {
  /** Capability ID */
  capabilityId: string
  
  /** Capability role */
  role: 'primary' | 'secondary' | 'supporting'
  
  /** Capability configuration */
  configuration: Record<string, unknown>
  
  /** Capability dependencies */
  dependencies: string[]
  
  /** Capability order */
  order: number
}

export interface CapabilityCompositionDependency {
  /** Dependency type */
  type: 'capability' | 'module' | 'service'
  
  /** Dependency ID */
  id: string
  
  /** Dependency version */
  version: string
  
  /** Dependency status */
  status: 'satisfied' | 'unsatisfied' | 'conflict'
}

// =============================================================================
// CAPABILITY REGISTRY CLASS
// =============================================================================

export class CapabilityRegistry {
  private capabilities: Map<string, CapabilityRegistryEntry> = new Map()
  private compositions: Map<string, CapabilityComposition> = new Map()
  private discoveryCache: Map<string, CapabilityDiscoveryResult> = new Map()
  private performanceOptimizer: CapabilityPerformanceOptimizer
  private analyticsCollector: CapabilityAnalyticsCollector

  constructor() {
    this.performanceOptimizer = new CapabilityPerformanceOptimizer()
    this.analyticsCollector = new CapabilityAnalyticsCollector()
  }

  /**
   * Register a capability
   */
  async registerCapability(
    capability: ModuleCapability,
    provider: CapabilityProvider
  ): Promise<CapabilityRegistrationResult> {
    const startTime = Date.now()

    try {
      // Validate capability
      const validation = await this.validateCapability(capability, provider)
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings
        }
      }

      // Check for conflicts
      const conflicts = await this.detectCapabilityConflicts(capability, provider)
      if (conflicts.length > 0) {
        return {
          success: false,
          errors: conflicts.map(c => c.message),
          warnings: []
        }
      }

      // Create capability status
      const status: CapabilityStatus = {
        status: 'available',
        message: 'Capability registered successfully',
        timestamp: new Date(),
        transitions: [{
          from: 'unregistered',
          to: 'available',
          timestamp: new Date(),
          reason: 'capability_registration'
        }]
      }

      // Create capability metrics
      const metrics: CapabilityMetrics = {
        usageCount: 0,
        lastUsed: new Date(),
        averageResponseTime: 0,
        errorRate: 0,
        successRate: 100,
        performance: {
          responseTimePercentiles: {},
          throughput: {
            requestsPerSecond: 0,
            peakRequestsPerSecond: 0,
            averageRequestsPerSecond: 0,
            totalRequests: 0
          },
          errorMetrics: {
            totalErrors: 0,
            errorRate: 0,
            errorTypes: {},
            errorTrends: []
          },
          resourceEfficiency: {
            memoryEfficiency: 0,
            cpuEfficiency: 0,
            storageEfficiency: 0,
            networkEfficiency: 0
          }
        },
        resourceUsage: {
          memory: { current: 0, average: 0, peak: 0, unit: 'MB', trend: 'stable' },
          cpu: { current: 0, average: 0, peak: 0, unit: '%', trend: 'stable' },
          storage: { current: 0, average: 0, peak: 0, unit: 'MB', trend: 'stable' },
          network: { current: 0, average: 0, peak: 0, unit: 'KB/s', trend: 'stable' }
        }
      }

      // Create capability metadata
      const metadata: CapabilityMetadata = {
        tags: capability.category ? [capability.category.id] : [],
        documentation: capability.description,
        examples: [],
        changelog: [],
        support: {
          status: 'active',
          contact: '',
          documentationUrl: '',
          issuesUrl: '',
          communityUrl: '',
          sla: {
            responseTime: 0,
            resolutionTime: 0,
            availability: 99.9,
            supportHours: '24/7'
          }
        },
        licensing: {
          type: 'MIT',
          text: '',
          url: '',
          restrictions: [],
          permissions: []
        }
      }

      // Create registry entry
      const entry: CapabilityRegistryEntry = {
        capability,
        provider,
        status,
        dependencies: [],
        consumers: [],
        metrics,
        metadata
      }

      // Store in registry
      this.capabilities.set(capability.id, entry)

      // Update performance metrics
      this.performanceOptimizer.updateRegistrationMetrics(capability.id, Date.now() - startTime)

      // Emit lifecycle event
      await lifecycleManager.emit('afterActivation', {
        moduleId: provider.moduleId,
        tenantId: 'system',
        data: { capability, provider, entry }
      })

      return {
        success: true,
        capabilityId: capability.id,
        entry,
        errors: [],
        warnings: validation.warnings
      }

    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: []
      }
    }
  }

  /**
   * Unregister a capability
   */
  async unregisterCapability(capabilityId: string): Promise<CapabilityUnregistrationResult> {
    const entry = this.capabilities.get(capabilityId)
    if (!entry) {
      return {
        success: false,
        errors: [`Capability ${capabilityId} not found in registry`]
      }
    }

    try {
      // Update status
      entry.status.status = 'unavailable'
      entry.status.timestamp = new Date()
      entry.status.message = 'Capability unregistered'
      entry.status.transitions.push({
        from: entry.status.status,
        to: 'unavailable',
        timestamp: new Date(),
        reason: 'capability_unregistration'
      })

      // Remove from registry
      this.capabilities.delete(capabilityId)

      // Emit lifecycle event
      await lifecycleManager.emit('afterDeactivation', {
        moduleId: entry.provider.moduleId,
        tenantId: 'system',
        data: { capability: entry.capability, provider: entry.provider }
      })

      return {
        success: true,
        errors: []
      }

    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)]
      }
    }
  }

  /**
   * Discover capabilities
   */
  async discoverCapabilities(query: CapabilityDiscoveryQuery): Promise<CapabilityDiscoveryResult> {
    const startTime = Date.now()

    try {
      // Check cache first
      const cacheKey = this.getQueryCacheKey(query)
      const cached = this.discoveryCache.get(cacheKey)
      if (cached && Date.now() - cached.metadata.timestamp.getTime() < 300000) { // 5 minutes
        return cached
      }

      // Perform discovery
      const capabilities = await this.performCapabilityDiscovery(query)
      
      // Apply filters
      const filteredCapabilities = await this.applyCapabilityFilters(capabilities, query.filters)
      
      // Apply options
      const resultCapabilities = await this.applyCapabilityOptions(filteredCapabilities, query.options)

      const result: CapabilityDiscoveryResult = {
        capabilities: resultCapabilities,
        metadata: {
          timestamp: new Date(),
          duration: Date.now() - startTime,
          source: 'registry',
          version: '1.0.0',
          totalFound: capabilities.length,
          capabilitiesReturned: resultCapabilities.length,
          query
        },
        errors: [],
        warnings: [],
        performance: {
          queryTime: Date.now() - startTime,
          processingTime: 0,
          cacheHitRate: 0,
          memoryUsage: 0
        }
      }

      // Cache result
      this.discoveryCache.set(cacheKey, result)

      return result

    } catch (error) {
      return {
        capabilities: [],
        metadata: {
          timestamp: new Date(),
          duration: Date.now() - startTime,
          source: 'registry',
          version: '1.0.0',
          totalFound: 0,
          capabilitiesReturned: 0,
          query
        },
        errors: [{
          code: 'DISCOVERY_ERROR',
          message: error instanceof Error ? error.message : String(error),
          source: 'registry'
        }],
        warnings: [],
        performance: {
          queryTime: Date.now() - startTime,
          processingTime: 0,
          cacheHitRate: 0,
          memoryUsage: 0
        }
      }
    }
  }

  /**
   * Get a capability by ID
   */
  getCapability(capabilityId: string): CapabilityRegistryEntry | undefined {
    const entry = this.capabilities.get(capabilityId)
    if (entry) {
      // Update usage metrics
      entry.metrics.usageCount++
      entry.metrics.lastUsed = new Date()
      this.analyticsCollector.recordCapabilityUsage(capabilityId, entry.metrics)
    }
    return entry
  }

  /**
   * Get all capabilities
   */
  getAllCapabilities(): CapabilityRegistryEntry[] {
    return Array.from(this.capabilities.values())
  }

  /**
   * Get capabilities by category
   */
  getCapabilitiesByCategory(categoryId: string): CapabilityRegistryEntry[] {
    const capabilities: CapabilityRegistryEntry[] = []
    
    for (const entry of this.capabilities.values()) {
      if (entry.capability.category?.id === categoryId) {
        capabilities.push(entry)
      }
    }
    
    return capabilities
  }

  /**
   * Get capabilities by provider
   */
  getCapabilitiesByProvider(moduleId: string): CapabilityRegistryEntry[] {
    const capabilities: CapabilityRegistryEntry[] = []
    
    for (const entry of this.capabilities.values()) {
      if (entry.provider.moduleId === moduleId) {
        capabilities.push(entry)
      }
    }
    
    return capabilities
  }

  /**
   * Create capability composition
   */
  async createComposition(composition: CapabilityComposition): Promise<CompositionResult> {
    try {
      // Validate composition
      const validation = await this.validateComposition(composition)
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings
        }
      }

      // Check capability availability
      const availability = await this.checkCapabilityAvailability(composition.capabilities)
      if (!availability.available) {
        return {
          success: false,
          errors: availability.errors,
          warnings: []
        }
      }

      // Store composition
      this.compositions.set(composition.id, composition)

      return {
        success: true,
        compositionId: composition.id,
        errors: [],
        warnings: validation.warnings
      }

    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: []
      }
    }
  }

  /**
   * Get capability statistics
   */
  getCapabilityStatistics(): CapabilityStatistics {
    const totalCapabilities = this.capabilities.size
    const statusCounts: Record<string, number> = {}
    const categoryCounts: Record<string, number> = {}
    const providerCounts: Record<string, number> = {}

    for (const entry of this.capabilities.values()) {
      // Count by status
      statusCounts[entry.status.status] = (statusCounts[entry.status.status] || 0) + 1

      // Count by category
      const categoryId = entry.capability.category?.id || 'uncategorized'
      categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1

      // Count by provider
      providerCounts[entry.provider.moduleId] = (providerCounts[entry.provider.moduleId] || 0) + 1
    }

    return {
      totalCapabilities,
      statusCounts,
      categoryCounts,
      providerCounts,
      totalCompositions: this.compositions.size,
      lastUpdated: new Date()
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private async validateCapability(
    capability: ModuleCapability,
    provider: CapabilityProvider
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate capability
    if (!capability.id) {
      errors.push('Capability ID is required')
    }

    if (!capability.name) {
      errors.push('Capability name is required')
    }

    if (!capability.description) {
      warnings.push('Capability description is recommended')
    }

    // Validate provider
    if (!provider.moduleId) {
      errors.push('Provider module ID is required')
    }

    if (!provider.moduleVersion) {
      errors.push('Provider module version is required')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  private async detectCapabilityConflicts(
    capability: ModuleCapability,
    provider: CapabilityProvider
  ): Promise<{ message: string; details?: Record<string, unknown> }[]> {
    const conflicts: { message: string; details?: Record<string, unknown> }[] = []

    // Check for duplicate capability ID
    if (this.capabilities.has(capability.id)) {
      conflicts.push({
        message: `Capability with ID ${capability.id} already exists`,
        details: { capabilityId: capability.id }
      })
    }

    return conflicts
  }

  private async performCapabilityDiscovery(query: CapabilityDiscoveryQuery): Promise<CapabilityRegistryEntry[]> {
    const capabilities: CapabilityRegistryEntry[] = []

    for (const entry of this.capabilities.values()) {
      let matches = true

      // Apply parameter filters
      if (query.parameters.capabilityId && entry.capability.id !== query.parameters.capabilityId) {
        matches = false
      }

      if (query.parameters.name && !entry.capability.name.toLowerCase().includes(query.parameters.name.toLowerCase())) {
        matches = false
      }

      if (query.parameters.category && entry.capability.category?.id !== query.parameters.category) {
        matches = false
      }

      if (query.parameters.status && !query.parameters.status.includes(entry.status.status)) {
        matches = false
      }

      if (query.parameters.providerModuleId && entry.provider.moduleId !== query.parameters.providerModuleId) {
        matches = false
      }

      if (matches) {
        capabilities.push(entry)
      }
    }

    return capabilities
  }

  private async applyCapabilityFilters(
    capabilities: CapabilityRegistryEntry[],
    filters: CapabilityQueryFilters
  ): Promise<CapabilityRegistryEntry[]> {
    let filtered = capabilities

    // Apply performance filters
    if (filters.performanceFilters) {
      for (const filter of filters.performanceFilters) {
        filtered = filtered.filter(entry => {
          if (filter.minResponseTime && entry.metrics.averageResponseTime < filter.minResponseTime) {
            return false
          }
          if (filter.maxResponseTime && entry.metrics.averageResponseTime > filter.maxResponseTime) {
            return false
          }
          if (filter.minSuccessRate && entry.metrics.successRate < filter.minSuccessRate) {
            return false
          }
          if (filter.maxErrorRate && entry.metrics.errorRate > filter.maxErrorRate) {
            return false
          }
          return true
        })
      }
    }

    return filtered
  }

  private async applyCapabilityOptions(
    capabilities: CapabilityRegistryEntry[],
    options: CapabilityQueryOptions
  ): Promise<CapabilityRegistryEntry[]> {
    let result = capabilities

    // Apply sorting
    if (options.sortBy) {
      result.sort((a, b) => {
        const aValue = this.getSortValue(a, options.sortBy!)
        const bValue = this.getSortValue(b, options.sortBy!)
        
        if (options.sortDirection === 'desc') {
          return bValue > aValue ? 1 : -1
        } else {
          return aValue > bValue ? 1 : -1
        }
      })
    }

    // Apply pagination
    if (options.offset) {
      result = result.slice(options.offset)
    }

    if (options.limit) {
      result = result.slice(0, options.limit)
    }

    return result
  }

  private getSortValue(entry: CapabilityRegistryEntry, sortBy: string): any {
    switch (sortBy) {
      case 'name':
        return entry.capability.name
      case 'usageCount':
        return entry.metrics.usageCount
      case 'lastUsed':
        return entry.metrics.lastUsed.getTime()
      case 'responseTime':
        return entry.metrics.averageResponseTime
      case 'successRate':
        return entry.metrics.successRate
      default:
        return 0
    }
  }

  private getQueryCacheKey(query: CapabilityDiscoveryQuery): string {
    return JSON.stringify(query)
  }

  private async validateComposition(composition: CapabilityComposition): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = []
    const warnings: string[] = []

    if (!composition.id) {
      errors.push('Composition ID is required')
    }

    if (!composition.name) {
      errors.push('Composition name is required')
    }

    if (composition.capabilities.length === 0) {
      errors.push('Composition must have at least one capability')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  private async checkCapabilityAvailability(capabilities: CapabilityCompositionEntry[]): Promise<{ available: boolean; errors: string[] }> {
    const errors: string[] = []

    for (const capability of capabilities) {
      const entry = this.capabilities.get(capability.capabilityId)
      if (!entry) {
        errors.push(`Capability ${capability.capabilityId} not found`)
      } else if (entry.status.status !== 'available') {
        errors.push(`Capability ${capability.capabilityId} is not available`)
      }
    }

    return {
      available: errors.length === 0,
      errors
    }
  }
}

// =============================================================================
// SUPPORTING CLASSES AND INTERFACES
// =============================================================================

export interface CapabilityRegistrationResult {
  success: boolean
  capabilityId?: string
  entry?: CapabilityRegistryEntry
  errors: string[]
  warnings: string[]
}

export interface CapabilityUnregistrationResult {
  success: boolean
  errors: string[]
}

export interface CompositionResult {
  success: boolean
  compositionId?: string
  errors: string[]
  warnings: string[]
}

export interface CapabilityStatistics {
  totalCapabilities: number
  statusCounts: Record<string, number>
  categoryCounts: Record<string, number>
  providerCounts: Record<string, number>
  totalCompositions: number
  lastUpdated: Date
}

class CapabilityPerformanceOptimizer {
  updateRegistrationMetrics(capabilityId: string, duration: number): void {
    // Implementation for performance optimization
    console.log(`Updating registration metrics for ${capabilityId}: ${duration}ms`)
  }
}

class CapabilityAnalyticsCollector {
  recordCapabilityUsage(capabilityId: string, metrics: CapabilityMetrics): void {
    // Implementation for analytics collection
    console.log(`Recording usage for capability ${capabilityId}`)
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const capabilityRegistry = new CapabilityRegistry()

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function createCapabilityRegistry(): CapabilityRegistry {
  return new CapabilityRegistry()
}

export function registerCapability(
  capability: ModuleCapability,
  provider: CapabilityProvider
): Promise<CapabilityRegistrationResult> {
  return capabilityRegistry.registerCapability(capability, provider)
}

export function unregisterCapability(capabilityId: string): Promise<CapabilityUnregistrationResult> {
  return capabilityRegistry.unregisterCapability(capabilityId)
}

export function discoverCapabilities(query: CapabilityDiscoveryQuery): Promise<CapabilityDiscoveryResult> {
  return capabilityRegistry.discoverCapabilities(query)
}

export function getCapability(capabilityId: string): CapabilityRegistryEntry | undefined {
  return capabilityRegistry.getCapability(capabilityId)
}

export function getAllCapabilities(): CapabilityRegistryEntry[] {
  return capabilityRegistry.getAllCapabilities()
}

export function getCapabilitiesByCategory(categoryId: string): CapabilityRegistryEntry[] {
  return capabilityRegistry.getCapabilitiesByCategory(categoryId)
}

export function getCapabilitiesByProvider(moduleId: string): CapabilityRegistryEntry[] {
  return capabilityRegistry.getCapabilitiesByProvider(moduleId)
}

export function createComposition(composition: CapabilityComposition): Promise<CompositionResult> {
  return capabilityRegistry.createComposition(composition)
}

export function getCapabilityStatistics(): CapabilityStatistics {
  return capabilityRegistry.getCapabilityStatistics()
}
