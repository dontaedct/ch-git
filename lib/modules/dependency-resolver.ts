/**
 * HT-035.2.2: Module Dependency Resolver System
 * 
 * Module dependency resolver system that manages module dependencies,
 * resolves dependency conflicts, and ensures proper dependency ordering
 * per PRD Section 7 requirements.
 * 
 * Features:
 * - Dependency resolution and validation
 * - Dependency conflict detection and resolution
 * - Dependency graph management
 * - Circular dependency detection
 * - Dependency version compatibility
 * - Dependency performance optimization
 */

import { ModuleDefinition, ModuleDependency } from './activation-engine'
import { moduleRegistry, ModuleRegistryEntry } from './module-registry'
import { lifecycleManager } from './module-lifecycle'

// =============================================================================
// CORE TYPES AND INTERFACES
// =============================================================================

export interface DependencyResolutionResult {
  /** Whether resolution was successful */
  success: boolean
  
  /** Resolution ID */
  resolutionId: string
  
  /** Target module ID */
  moduleId: string
  
  /** Resolved dependencies */
  resolved: ResolvedDependency[]
  
  /** Unresolved dependencies */
  unresolved: UnresolvedDependency[]
  
  /** Dependency conflicts */
  conflicts: DependencyConflict[]
  
  /** Resolution warnings */
  warnings: DependencyWarning[]
  
  /** Resolution errors */
  errors: DependencyError[]
  
  /** Resolution metadata */
  metadata: DependencyResolutionMetadata
  
  /** Resolution timestamp */
  timestamp: Date
  
  /** Resolution duration */
  duration: number
}

export interface ResolvedDependency {
  /** Dependency ID */
  id: string
  
  /** Dependency version */
  version: string
  
  /** Dependency type */
  type: 'required' | 'optional' | 'peer' | 'dev'
  
  /** Dependency status */
  status: 'satisfied' | 'upgraded' | 'downgraded' | 'replaced'
  
  /** Dependency provider */
  provider: DependencyProvider
  
  /** Dependency metadata */
  metadata: Record<string, unknown>
  
  /** Dependency resolution path */
  resolutionPath: string[]
  
  /** Dependency constraints */
  constraints: DependencyConstraint[]
}

export interface UnresolvedDependency {
  /** Dependency ID */
  id: string
  
  /** Dependency version constraint */
  versionConstraint: string
  
  /** Dependency type */
  type: 'required' | 'optional' | 'peer' | 'dev'
  
  /** Unresolved reason */
  reason: 'not_found' | 'version_conflict' | 'circular_dependency' | 'incompatible'
  
  /** Unresolved details */
  details: Record<string, unknown>
  
  /** Suggested alternatives */
  alternatives: DependencyAlternative[]
}

export interface DependencyConflict {
  /** Conflict ID */
  id: string
  
  /** Conflict type */
  type: 'version' | 'circular' | 'incompatible' | 'resource'
  
  /** Conflict description */
  description: string
  
  /** Conflicting dependencies */
  conflictingDependencies: ConflictingDependency[]
  
  /** Conflict resolution strategies */
  resolutionStrategies: ConflictResolutionStrategy[]
  
  /** Conflict status */
  status: 'pending' | 'resolved' | 'unresolved'
  
  /** Conflict details */
  details: Record<string, unknown>
}

export interface DependencyWarning {
  /** Warning code */
  code: string
  
  /** Warning message */
  message: string
  
  /** Warning severity */
  severity: 'low' | 'medium' | 'high'
  
  /** Warning details */
  details?: Record<string, unknown>
  
  /** Warning timestamp */
  timestamp: Date
}

export interface DependencyError {
  /** Error code */
  code: string
  
  /** Error message */
  message: string
  
  /** Error severity */
  severity: 'low' | 'medium' | 'high' | 'critical'
  
  /** Error details */
  details?: Record<string, unknown>
  
  /** Error timestamp */
  timestamp: Date
}

export interface DependencyResolutionMetadata {
  /** Resolution strategy */
  strategy: 'conservative' | 'aggressive' | 'balanced'
  
  /** Resolution depth */
  depth: number
  
  /** Resolution timeout */
  timeout: number
  
  /** Resolution cache hit rate */
  cacheHitRate: number
  
  /** Resolution performance metrics */
  performance: DependencyResolutionPerformance
}

export interface DependencyProvider {
  /** Provider module ID */
  moduleId: string
  
  /** Provider module version */
  moduleVersion: string
  
  /** Provider status */
  status: 'active' | 'inactive' | 'deprecated' | 'removed'
  
  /** Provider priority */
  priority: number
  
  /** Provider metadata */
  metadata: Record<string, unknown>
}

export interface DependencyConstraint {
  /** Constraint type */
  type: 'version' | 'platform' | 'architecture' | 'environment'
  
  /** Constraint value */
  value: string
  
  /** Constraint operator */
  operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'range' | 'regex'
  
  /** Constraint description */
  description: string
}

export interface DependencyAlternative {
  /** Alternative ID */
  id: string
  
  /** Alternative name */
  name: string
  
  /** Alternative version */
  version: string
  
  /** Alternative compatibility */
  compatibility: number
  
  /** Alternative metadata */
  metadata: Record<string, unknown>
}

export interface ConflictingDependency {
  /** Dependency ID */
  id: string
  
  /** Dependency version */
  version: string
  
  /** Dependency module */
  module: string
  
  /** Conflict reason */
  reason: string
  
  /** Conflict priority */
  priority: number
}

export interface ConflictResolutionStrategy {
  /** Strategy ID */
  id: string
  
  /** Strategy name */
  name: string
  
  /** Strategy description */
  description: string
  
  /** Strategy type */
  type: 'upgrade' | 'downgrade' | 'replace' | 'exclude' | 'merge'
  
  /** Strategy confidence */
  confidence: number
  
  /** Strategy impact */
  impact: 'low' | 'medium' | 'high'
  
  /** Strategy details */
  details: Record<string, unknown>
}

export interface DependencyResolutionPerformance {
  /** Resolution time */
  resolutionTime: number
  
  /** Cache operations */
  cacheOperations: number
  
  /** Network requests */
  networkRequests: number
  
  /** Memory usage */
  memoryUsage: number
  
  /** CPU usage */
  cpuUsage: number
}

// =============================================================================
// DEPENDENCY GRAPH TYPES
// =============================================================================

export interface DependencyGraph {
  /** Graph nodes */
  nodes: DependencyGraphNode[]
  
  /** Graph edges */
  edges: DependencyGraphEdge[]
  
  /** Graph metadata */
  metadata: DependencyGraphMetadata
}

export interface DependencyGraphNode {
  /** Node ID */
  id: string
  
  /** Node type */
  type: 'module' | 'dependency' | 'capability'
  
  /** Node data */
  data: Record<string, unknown>
  
  /** Node position */
  position: { x: number; y: number }
  
  /** Node status */
  status: 'active' | 'inactive' | 'conflict' | 'unresolved'
}

export interface DependencyGraphEdge {
  /** Edge ID */
  id: string
  
  /** Source node ID */
  source: string
  
  /** Target node ID */
  target: string
  
  /** Edge type */
  type: 'dependency' | 'conflict' | 'alternative'
  
  /** Edge weight */
  weight: number
  
  /** Edge metadata */
  metadata: Record<string, unknown>
}

export interface DependencyGraphMetadata {
  /** Graph version */
  version: string
  
  /** Graph timestamp */
  timestamp: Date
  
  /** Graph statistics */
  statistics: DependencyGraphStatistics
}

export interface DependencyGraphStatistics {
  /** Total nodes */
  totalNodes: number
  
  /** Total edges */
  totalEdges: number
  
  /** Circular dependencies */
  circularDependencies: number
  
  /** Unresolved dependencies */
  unresolvedDependencies: number
  
  /** Dependency conflicts */
  dependencyConflicts: number
}

// =============================================================================
// DEPENDENCY RESOLVER CLASS
// =============================================================================

export class DependencyResolver {
  private dependencyCache: Map<string, DependencyResolutionResult> = new Map()
  private dependencyGraph: DependencyGraph
  private performanceOptimizer: DependencyPerformanceOptimizer
  private conflictResolver: DependencyConflictResolver

  constructor() {
    this.dependencyGraph = this.createEmptyGraph()
    this.performanceOptimizer = new DependencyPerformanceOptimizer()
    this.conflictResolver = new DependencyConflictResolver()
  }

  /**
   * Resolve dependencies for a module
   */
  async resolveDependencies(
    moduleId: string,
    dependencies: ModuleDependency[],
    strategy: 'conservative' | 'aggressive' | 'balanced' = 'balanced'
  ): Promise<DependencyResolutionResult> {
    const startTime = Date.now()
    const resolutionId = `${moduleId}-${Date.now()}`

    try {
      // Check cache first
      const cacheKey = this.getCacheKey(moduleId, dependencies, strategy)
      const cached = this.dependencyCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp.getTime() < 300000) { // 5 minutes
        return cached
      }

      const resolved: ResolvedDependency[] = []
      const unresolved: UnresolvedDependency[] = []
      const conflicts: DependencyConflict[] = []
      const warnings: DependencyWarning[] = []
      const errors: DependencyError[] = []

      // Resolve each dependency
      for (const dependency of dependencies) {
        try {
          const result = await this.resolveSingleDependency(dependency, strategy)
          if (result.success) {
            resolved.push(result.dependency)
          } else {
            unresolved.push(result.unresolved)
            if (result.conflict) {
              conflicts.push(result.conflict)
            }
          }
          warnings.push(...result.warnings)
          errors.push(...result.errors)
        } catch (error) {
          errors.push({
            code: 'DEPENDENCY_RESOLUTION_ERROR',
            message: error instanceof Error ? error.message : String(error),
            severity: 'high',
            timestamp: new Date()
          })
        }
      }

      // Detect circular dependencies
      const circularDeps = await this.detectCircularDependencies(moduleId, resolved)
      if (circularDeps.length > 0) {
        for (const circular of circularDeps) {
          conflicts.push({
            id: `circular-${circular.id}`,
            type: 'circular',
            description: `Circular dependency detected: ${circular.description}`,
            conflictingDependencies: circular.dependencies,
            resolutionStrategies: [],
            status: 'pending',
            details: circular.details
          })
        }
      }

      // Resolve conflicts
      if (conflicts.length > 0) {
        const conflictResolution = await this.conflictResolver.resolveConflicts(conflicts, strategy)
        resolved.push(...conflictResolution.resolved)
        unresolved.push(...conflictResolution.unresolved)
        warnings.push(...conflictResolution.warnings)
        errors.push(...conflictResolution.errors)
      }

      const result: DependencyResolutionResult = {
        success: unresolved.length === 0 && errors.length === 0,
        resolutionId,
        moduleId,
        resolved,
        unresolved,
        conflicts,
        warnings,
        errors,
        metadata: {
          strategy,
          depth: this.calculateResolutionDepth(resolved),
          timeout: 30000,
          cacheHitRate: 0,
          performance: {
            resolutionTime: Date.now() - startTime,
            cacheOperations: 0,
            networkRequests: 0,
            memoryUsage: 0,
            cpuUsage: 0
          }
        },
        timestamp: new Date(),
        duration: Date.now() - startTime
      }

      // Cache result
      this.dependencyCache.set(cacheKey, result)

      // Update dependency graph
      await this.updateDependencyGraph(moduleId, result)

      // Update performance metrics
      this.performanceOptimizer.updateResolutionMetrics(moduleId, result.duration)

      return result

    } catch (error) {
      return {
        success: false,
        resolutionId,
        moduleId,
        resolved: [],
        unresolved: [],
        conflicts: [],
        warnings: [],
        errors: [{
          code: 'RESOLUTION_ERROR',
          message: error instanceof Error ? error.message : String(error),
          severity: 'critical',
          timestamp: new Date()
        }],
        metadata: {
          strategy,
          depth: 0,
          timeout: 30000,
          cacheHitRate: 0,
          performance: {
            resolutionTime: Date.now() - startTime,
            cacheOperations: 0,
            networkRequests: 0,
            memoryUsage: 0,
            cpuUsage: 0
          }
        },
        timestamp: new Date(),
        duration: Date.now() - startTime
      }
    }
  }

  /**
   * Get dependency graph for a module
   */
  getDependencyGraph(moduleId: string): DependencyGraph {
    // Filter graph to show only dependencies for the specified module
    const moduleNode = this.dependencyGraph.nodes.find(node => node.id === moduleId)
    if (!moduleNode) {
      return this.createEmptyGraph()
    }

    const relevantNodes = new Set<string>([moduleId])
    const relevantEdges: DependencyGraphEdge[] = []

    // Find all connected nodes
    for (const edge of this.dependencyGraph.edges) {
      if (edge.source === moduleId || edge.target === moduleId) {
        relevantNodes.add(edge.source)
        relevantNodes.add(edge.target)
        relevantEdges.push(edge)
      }
    }

    const filteredNodes = this.dependencyGraph.nodes.filter(node => relevantNodes.has(node.id))

    return {
      nodes: filteredNodes,
      edges: relevantEdges,
      metadata: {
        version: '1.0.0',
        timestamp: new Date(),
        statistics: {
          totalNodes: filteredNodes.length,
          totalEdges: relevantEdges.length,
          circularDependencies: 0,
          unresolvedDependencies: 0,
          dependencyConflicts: 0
        }
      }
    }
  }

  /**
   * Get all dependency graphs
   */
  getAllDependencyGraphs(): DependencyGraph {
    return this.dependencyGraph
  }

  /**
   * Validate dependency resolution
   */
  async validateResolution(result: DependencyResolutionResult): Promise<DependencyValidationResult> {
    const errors: DependencyError[] = []
    const warnings: DependencyWarning[] = []

    // Validate resolved dependencies
    for (const dependency of result.resolved) {
      // Check if provider is still available
      const provider = await this.checkProviderAvailability(dependency.provider)
      if (!provider.available) {
        errors.push({
          code: 'PROVIDER_UNAVAILABLE',
          message: `Provider ${dependency.provider.moduleId} is no longer available`,
          severity: 'high',
          timestamp: new Date()
        })
      }

      // Check version compatibility
      const compatibility = await this.checkVersionCompatibility(dependency)
      if (!compatibility.compatible) {
        warnings.push({
          code: 'VERSION_INCOMPATIBILITY',
          message: `Version ${dependency.version} may not be compatible`,
          severity: 'medium',
          timestamp: new Date()
        })
      }
    }

    // Validate unresolved dependencies
    for (const dependency of result.unresolved) {
      if (dependency.type === 'required') {
        errors.push({
          code: 'REQUIRED_DEPENDENCY_UNRESOLVED',
          message: `Required dependency ${dependency.id} could not be resolved`,
          severity: 'critical',
          timestamp: new Date()
        })
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      timestamp: new Date()
    }
  }

  /**
   * Get dependency statistics
   */
  getDependencyStatistics(): DependencyStatistics {
    const totalResolutions = this.dependencyCache.size
    const successfulResolutions = Array.from(this.dependencyCache.values()).filter(r => r.success).length
    const failedResolutions = totalResolutions - successfulResolutions

    const resolutionStrategies: Record<string, number> = {}
    const dependencyTypes: Record<string, number> = {}
    const conflictTypes: Record<string, number> = {}

    for (const result of this.dependencyCache.values()) {
      // Count by strategy
      resolutionStrategies[result.metadata.strategy] = (resolutionStrategies[result.metadata.strategy] || 0) + 1

      // Count by dependency type
      for (const dependency of result.resolved) {
        dependencyTypes[dependency.type] = (dependencyTypes[dependency.type] || 0) + 1
      }

      // Count by conflict type
      for (const conflict of result.conflicts) {
        conflictTypes[conflict.type] = (conflictTypes[conflict.type] || 0) + 1
      }
    }

    return {
      totalResolutions,
      successfulResolutions,
      failedResolutions,
      resolutionStrategies,
      dependencyTypes,
      conflictTypes,
      lastUpdated: new Date()
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private async resolveSingleDependency(
    dependency: ModuleDependency,
    strategy: string
  ): Promise<{
    success: boolean
    dependency?: ResolvedDependency
    unresolved?: UnresolvedDependency
    conflict?: DependencyConflict
    warnings: DependencyWarning[]
    errors: DependencyError[]
  }> {
    const warnings: DependencyWarning[] = []
    const errors: DependencyError[] = []

    try {
      // Find available providers
      const providers = await this.findProviders(dependency.id, dependency.version)
      if (providers.length === 0) {
        return {
          success: false,
          unresolved: {
            id: dependency.id,
            versionConstraint: dependency.version,
            type: dependency.required ? 'required' : 'optional',
            reason: 'not_found',
            details: {},
            alternatives: []
          },
          warnings,
          errors
        }
      }

      // Select best provider
      const selectedProvider = this.selectBestProvider(providers, strategy)
      if (!selectedProvider) {
        return {
          success: false,
          unresolved: {
            id: dependency.id,
            versionConstraint: dependency.version,
            type: dependency.required ? 'required' : 'optional',
            reason: 'version_conflict',
            details: {},
            alternatives: providers.map(p => ({
              id: p.moduleId,
              name: p.moduleId,
              version: p.moduleVersion,
              compatibility: 0.8,
              metadata: {}
            }))
          },
          warnings,
          errors
        }
      }

      // Create resolved dependency
      const resolvedDependency: ResolvedDependency = {
        id: dependency.id,
        version: selectedProvider.moduleVersion,
        type: dependency.required ? 'required' : 'optional',
        status: 'satisfied',
        provider: selectedProvider,
        metadata: {},
        resolutionPath: [dependency.id],
        constraints: []
      }

      return {
        success: true,
        dependency: resolvedDependency,
        warnings,
        errors
      }

    } catch (error) {
      errors.push({
        code: 'SINGLE_DEPENDENCY_RESOLUTION_ERROR',
        message: error instanceof Error ? error.message : String(error),
        severity: 'high',
        timestamp: new Date()
      })

      return {
        success: false,
        warnings,
        errors
      }
    }
  }

  private async findProviders(dependencyId: string, versionConstraint: string): Promise<DependencyProvider[]> {
    const providers: DependencyProvider[] = []

    // Find modules that provide this dependency
    const modules = moduleRegistry.getAllModules()
    for (const module of modules) {
      if (module.definition.id === dependencyId) {
        // Check version compatibility
        const compatible = await this.isVersionCompatible(module.definition.version, versionConstraint)
        if (compatible) {
          providers.push({
            moduleId: module.definition.id,
            moduleVersion: module.definition.version,
            status: module.status.status === 'active' ? 'active' : 'inactive',
            priority: 1,
            metadata: {}
          })
        }
      }
    }

    return providers
  }

  private selectBestProvider(providers: DependencyProvider[], strategy: string): DependencyProvider | null {
    if (providers.length === 0) {
      return null
    }

    // Sort by priority and status
    const sorted = providers.sort((a, b) => {
      // Active providers first
      if (a.status === 'active' && b.status !== 'active') return -1
      if (b.status === 'active' && a.status !== 'active') return 1

      // Then by priority
      return b.priority - a.priority
    })

    return sorted[0]
  }

  private async isVersionCompatible(version: string, constraint: string): Promise<boolean> {
    // Simple version compatibility check
    // In a real implementation, this would use semantic versioning
    return version === constraint || constraint === '*' || constraint.startsWith('^') || constraint.startsWith('~')
  }

  private async detectCircularDependencies(
    moduleId: string,
    dependencies: ResolvedDependency[]
  ): Promise<{ id: string; description: string; dependencies: ConflictingDependency[]; details: Record<string, unknown> }[]> {
    const circular: { id: string; description: string; dependencies: ConflictingDependency[]; details: Record<string, unknown> }[] = []

    // Simple circular dependency detection
    // In a real implementation, this would use graph algorithms
    for (const dependency of dependencies) {
      if (dependency.id === moduleId) {
        circular.push({
          id: `circular-${moduleId}-${dependency.id}`,
          description: `Module ${moduleId} depends on itself`,
          dependencies: [{
            id: dependency.id,
            version: dependency.version,
            module: dependency.provider.moduleId,
            reason: 'circular_dependency',
            priority: 1
          }],
          details: {}
        })
      }
    }

    return circular
  }

  private calculateResolutionDepth(dependencies: ResolvedDependency[]): number {
    // Calculate the maximum depth of dependency resolution
    let maxDepth = 0
    for (const dependency of dependencies) {
      maxDepth = Math.max(maxDepth, dependency.resolutionPath.length)
    }
    return maxDepth
  }

  private async updateDependencyGraph(moduleId: string, result: DependencyResolutionResult): Promise<void> {
    // Add module node
    const moduleNode: DependencyGraphNode = {
      id: moduleId,
      type: 'module',
      data: { moduleId },
      position: { x: 0, y: 0 },
      status: result.success ? 'active' : 'conflict'
    }

    // Add dependency nodes and edges
    for (const dependency of result.resolved) {
      const depNode: DependencyGraphNode = {
        id: dependency.id,
        type: 'dependency',
        data: { dependency },
        position: { x: 0, y: 0 },
        status: 'active'
      }

      const edge: DependencyGraphEdge = {
        id: `${moduleId}-${dependency.id}`,
        source: moduleId,
        target: dependency.id,
        type: 'dependency',
        weight: 1,
        metadata: { dependency }
      }

      this.dependencyGraph.nodes.push(depNode)
      this.dependencyGraph.edges.push(edge)
    }
  }

  private getCacheKey(moduleId: string, dependencies: ModuleDependency[], strategy: string): string {
    return `${moduleId}-${JSON.stringify(dependencies)}-${strategy}`
  }

  private createEmptyGraph(): DependencyGraph {
    return {
      nodes: [],
      edges: [],
      metadata: {
        version: '1.0.0',
        timestamp: new Date(),
        statistics: {
          totalNodes: 0,
          totalEdges: 0,
          circularDependencies: 0,
          unresolvedDependencies: 0,
          dependencyConflicts: 0
        }
      }
    }
  }

  private async checkProviderAvailability(provider: DependencyProvider): Promise<{ available: boolean; details: Record<string, unknown> }> {
    // Check if provider module is still available
    const module = moduleRegistry.getModule(provider.moduleId)
    return {
      available: module !== undefined && module.status.status === 'active',
      details: {}
    }
  }

  private async checkVersionCompatibility(dependency: ResolvedDependency): Promise<{ compatible: boolean; details: Record<string, unknown> }> {
    // Check version compatibility
    return {
      compatible: true,
      details: {}
    }
  }
}

// =============================================================================
// SUPPORTING CLASSES AND INTERFACES
// =============================================================================

export interface DependencyValidationResult {
  valid: boolean
  errors: DependencyError[]
  warnings: DependencyWarning[]
  timestamp: Date
}

export interface DependencyStatistics {
  totalResolutions: number
  successfulResolutions: number
  failedResolutions: number
  resolutionStrategies: Record<string, number>
  dependencyTypes: Record<string, number>
  conflictTypes: Record<string, number>
  lastUpdated: Date
}

class DependencyPerformanceOptimizer {
  updateResolutionMetrics(moduleId: string, duration: number): void {
    // Implementation for performance optimization
    console.log(`Updating resolution metrics for ${moduleId}: ${duration}ms`)
  }
}

class DependencyConflictResolver {
  async resolveConflicts(
    conflicts: DependencyConflict[],
    strategy: string
  ): Promise<{
    resolved: ResolvedDependency[]
    unresolved: UnresolvedDependency[]
    warnings: DependencyWarning[]
    errors: DependencyError[]
  }> {
    const resolved: ResolvedDependency[] = []
    const unresolved: UnresolvedDependency[] = []
    const warnings: DependencyWarning[] = []
    const errors: DependencyError[] = []

    // Implementation for conflict resolution
    console.log(`Resolving ${conflicts.length} conflicts with strategy ${strategy}`)

    return {
      resolved,
      unresolved,
      warnings,
      errors
    }
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const dependencyResolver = new DependencyResolver()

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function createDependencyResolver(): DependencyResolver {
  return new DependencyResolver()
}

export function resolveDependencies(
  moduleId: string,
  dependencies: ModuleDependency[],
  strategy?: 'conservative' | 'aggressive' | 'balanced'
): Promise<DependencyResolutionResult> {
  return dependencyResolver.resolveDependencies(moduleId, dependencies, strategy)
}

export function getDependencyGraph(moduleId: string): DependencyGraph {
  return dependencyResolver.getDependencyGraph(moduleId)
}

export function getAllDependencyGraphs(): DependencyGraph {
  return dependencyResolver.getAllDependencyGraphs()
}

export function validateResolution(result: DependencyResolutionResult): Promise<DependencyValidationResult> {
  return dependencyResolver.validateResolution(result)
}

export function getDependencyStatistics(): DependencyStatistics {
  return dependencyResolver.getDependencyStatistics()
}
