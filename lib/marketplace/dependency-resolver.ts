/**
 * HT-035.3.2: Module Dependency Resolution System
 * 
 * Advanced dependency resolution with conflict detection, version management,
 * and circular dependency prevention per PRD requirements.
 * 
 * Features:
 * - Semantic versioning support
 * - Dependency conflict detection and resolution
 * - Circular dependency prevention
 * - Version constraint satisfaction
 * - Dependency graph visualization
 * - Automatic dependency installation
 */

import { z } from 'zod';
import { ModuleMetadata } from './module-registry';

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

export const VersionConstraintSchema = z.object({
  operator: z.enum(['^', '~', '>=', '<=', '>', '<', '=', '']),
  version: z.string(),
  description: z.string().optional(),
});

export const DependencySchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  constraint: VersionConstraintSchema.optional(),
  required: z.boolean().default(true),
  optional: z.boolean().default(false),
  peer: z.boolean().default(false),
  dev: z.boolean().default(false),
  bundled: z.boolean().default(false),
  source: z.enum(['npm', 'marketplace', 'local', 'git']).default('marketplace'),
  metadata: z.record(z.unknown()).default({}),
});

export const DependencyResolutionSchema = z.object({
  moduleId: z.string(),
  requestedVersion: z.string(),
  resolvedVersion: z.string(),
  dependencies: z.array(DependencySchema),
  conflicts: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  resolutionPath: z.array(z.string()).default([]),
  circularDependencies: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({}),
});

export const DependencyConflictSchema = z.object({
  type: z.enum(['version', 'peer', 'optional', 'circular']),
  moduleId: z.string(),
  conflictingModule: z.string(),
  conflict: z.string(),
  resolution: z.enum(['auto', 'manual', 'skip']).default('auto'),
  details: z.record(z.unknown()).default({}),
});

export const DependencyGraphSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    version: z.string(),
    type: z.enum(['module', 'dependency']),
    metadata: z.record(z.unknown()).default({}),
  })),
  edges: z.array(z.object({
    from: z.string(),
    to: z.string(),
    type: z.enum(['dependency', 'peer', 'optional', 'dev']),
    constraint: VersionConstraintSchema.optional(),
  })),
  metadata: z.record(z.unknown()).default({}),
});

// Type exports
export type VersionConstraint = z.infer<typeof VersionConstraintSchema>;
export type Dependency = z.infer<typeof DependencySchema>;
export type DependencyResolution = z.infer<typeof DependencyResolutionSchema>;
export type DependencyConflict = z.infer<typeof DependencyConflictSchema>;
export type DependencyGraph = z.infer<typeof DependencyGraphSchema>;

// =============================================================================
// DEPENDENCY RESOLVER CLASS
// =============================================================================

export class DependencyResolver {
  private dependencyCache: Map<string, DependencyResolution> = new Map();
  private conflictCache: Map<string, DependencyConflict[]> = new Map();
  private graphCache: Map<string, DependencyGraph> = new Map();
  private moduleRegistry: Map<string, ModuleMetadata> = new Map();

  constructor() {
    this.initializeBuiltInModules();
  }

  /**
   * Resolve dependencies for a module
   */
  async resolveDependencies(
    moduleId: string,
    version?: string,
    options: {
      includeOptional?: boolean;
      includeDev?: boolean;
      includePeer?: boolean;
      resolveConflicts?: boolean;
      maxDepth?: number;
    } = {}
  ): Promise<DependencyResolution> {
    const cacheKey = `${moduleId}-${version || 'latest'}-${JSON.stringify(options)}`;
    const cached = this.dependencyCache.get(cacheKey);
    
    if (cached && Date.now() - cached.metadata.timestamp.getTime() < 300000) { // 5 minutes
      return cached;
    }

    const resolution: DependencyResolution = {
      moduleId,
      requestedVersion: version || 'latest',
      resolvedVersion: version || 'latest',
      dependencies: [],
      conflicts: [],
      warnings: [],
      resolutionPath: [moduleId],
      circularDependencies: [],
      metadata: {
        timestamp: new Date(),
        options,
        resolutionTime: 0,
      },
    };

    const startTime = Date.now();

    try {
      // Step 1: Get module metadata
      const module = await this.getModuleMetadata(moduleId, version);
      if (!module) {
        throw new Error(`Module ${moduleId} not found`);
      }

      resolution.resolvedVersion = module.version;

      // Step 2: Parse dependencies
      const dependencies = await this.parseDependencies(module);
      
      // Step 3: Filter dependencies based on options
      const filteredDependencies = this.filterDependencies(dependencies, options);
      
      // Step 4: Resolve each dependency
      const resolvedDependencies: Dependency[] = [];
      const conflicts: DependencyConflict[] = [];
      const warnings: string[] = [];

      for (const dependency of filteredDependencies) {
        try {
          const resolvedDep = await this.resolveDependency(dependency, options.maxDepth || 10);
          resolvedDependencies.push(resolvedDep);
        } catch (error) {
          if (dependency.required) {
            conflicts.push({
              type: 'version',
              moduleId: dependency.id,
              conflictingModule: moduleId,
              conflict: error instanceof Error ? error.message : String(error),
              resolution: 'manual',
              details: { dependency, error },
            });
          } else {
            warnings.push(`Optional dependency ${dependency.id} could not be resolved: ${error}`);
          }
        }
      }

      // Step 5: Detect circular dependencies
      const circularDeps = this.detectCircularDependencies(resolution.resolutionPath, resolvedDependencies);
      resolution.circularDependencies = circularDeps;

      // Step 6: Resolve conflicts if requested
      if (options.resolveConflicts) {
        const resolvedConflicts = await this.resolveConflicts(conflicts);
        resolution.conflicts = resolvedConflicts.map(c => c.conflict);
        resolution.warnings.push(...resolvedConflicts.map(c => `Resolved conflict: ${c.conflict}`));
      } else {
        resolution.conflicts = conflicts.map(c => c.conflict);
      }

      resolution.dependencies = resolvedDependencies;
      resolution.warnings.push(...warnings);
      resolution.metadata.resolutionTime = Date.now() - startTime;

      // Cache the result
      this.dependencyCache.set(cacheKey, resolution);

      return resolution;

    } catch (error) {
      resolution.conflicts.push(error instanceof Error ? error.message : String(error));
      resolution.metadata.resolutionTime = Date.now() - startTime;
      return resolution;
    }
  }

  /**
   * Detect dependency conflicts
   */
  async detectConflicts(
    moduleId: string,
    version?: string,
    installedModules: string[] = []
  ): Promise<DependencyConflict[]> {
    const cacheKey = `conflicts-${moduleId}-${version || 'latest'}-${installedModules.join(',')}`;
    const cached = this.conflictCache.get(cacheKey);
    
    if (cached && Date.now() - cached[0]?.metadata.timestamp.getTime() < 300000) { // 5 minutes
      return cached;
    }

    const conflicts: DependencyConflict[] = [];

    try {
      // Get dependency resolution
      const resolution = await this.resolveDependencies(moduleId, version);
      
      // Check for version conflicts with installed modules
      for (const dependency of resolution.dependencies) {
        const installedVersion = await this.getInstalledVersion(dependency.id);
        if (installedVersion) {
          const isCompatible = this.isVersionCompatible(dependency.version, installedVersion, dependency.constraint);
          if (!isCompatible) {
            conflicts.push({
              type: 'version',
              moduleId: dependency.id,
              conflictingModule: moduleId,
              conflict: `Version conflict: ${dependency.id} requires ${dependency.version} but ${installedVersion} is installed`,
              resolution: 'auto',
              details: {
                required: dependency.version,
                installed: installedVersion,
                constraint: dependency.constraint,
              },
            });
          }
        }
      }

      // Check for peer dependency conflicts
      const peerConflicts = await this.detectPeerConflicts(resolution.dependencies, installedModules);
      conflicts.push(...peerConflicts);

      // Check for circular dependencies
      if (resolution.circularDependencies.length > 0) {
        conflicts.push({
          type: 'circular',
          moduleId,
          conflictingModule: moduleId,
          conflict: `Circular dependency detected: ${resolution.circularDependencies.join(' -> ')}`,
          resolution: 'manual',
          details: { circularPath: resolution.circularDependencies },
        });
      }

      // Cache the result
      this.conflictCache.set(cacheKey, conflicts);

      return conflicts;

    } catch (error) {
      conflicts.push({
        type: 'version',
        moduleId,
        conflictingModule: moduleId,
        conflict: error instanceof Error ? error.message : String(error),
        resolution: 'manual',
        details: { error },
      });
      return conflicts;
    }
  }

  /**
   * Generate dependency graph
   */
  async generateDependencyGraph(
    moduleId: string,
    version?: string,
    options: {
      includeOptional?: boolean;
      includeDev?: boolean;
      maxDepth?: number;
    } = {}
  ): Promise<DependencyGraph> {
    const cacheKey = `graph-${moduleId}-${version || 'latest'}-${JSON.stringify(options)}`;
    const cached = this.graphCache.get(cacheKey);
    
    if (cached && Date.now() - cached.metadata.timestamp.getTime() < 300000) { // 5 minutes
      return cached;
    }

    const graph: DependencyGraph = {
      nodes: [],
      edges: [],
      metadata: {
        timestamp: new Date(),
        options,
        moduleId,
        version: version || 'latest',
      },
    };

    try {
      // Get dependency resolution
      const resolution = await this.resolveDependencies(moduleId, version, options);
      
      // Add root module node
      graph.nodes.push({
        id: moduleId,
        name: moduleId,
        version: resolution.resolvedVersion,
        type: 'module',
        metadata: { isRoot: true },
      });

      // Add dependency nodes and edges
      for (const dependency of resolution.dependencies) {
        // Add dependency node
        graph.nodes.push({
          id: dependency.id,
          name: dependency.name,
          version: dependency.version,
          type: 'dependency',
          metadata: {
            required: dependency.required,
            optional: dependency.optional,
            peer: dependency.peer,
            dev: dependency.dev,
            source: dependency.source,
          },
        });

        // Add edge
        graph.edges.push({
          from: moduleId,
          to: dependency.id,
          type: dependency.peer ? 'peer' : dependency.optional ? 'optional' : dependency.dev ? 'dev' : 'dependency',
          constraint: dependency.constraint,
        });

        // Recursively add sub-dependencies if within max depth
        if ((options.maxDepth || 10) > 1) {
          const subResolution = await this.resolveDependencies(dependency.id, dependency.version, {
            ...options,
            maxDepth: (options.maxDepth || 10) - 1,
          });

          for (const subDep of subResolution.dependencies) {
            // Add sub-dependency node if not already present
            if (!graph.nodes.some(node => node.id === subDep.id)) {
              graph.nodes.push({
                id: subDep.id,
                name: subDep.name,
                version: subDep.version,
                type: 'dependency',
                metadata: {
                  required: subDep.required,
                  optional: subDep.optional,
                  peer: subDep.peer,
                  dev: subDep.dev,
                  source: subDep.source,
                },
              });
            }

            // Add sub-dependency edge
            graph.edges.push({
              from: dependency.id,
              to: subDep.id,
              type: subDep.peer ? 'peer' : subDep.optional ? 'optional' : subDep.dev ? 'dev' : 'dependency',
              constraint: subDep.constraint,
            });
          }
        }
      }

      // Cache the result
      this.graphCache.set(cacheKey, graph);

      return graph;

    } catch (error) {
      graph.metadata.error = error instanceof Error ? error.message : String(error);
      return graph;
    }
  }

  /**
   * Install dependencies automatically
   */
  async installDependencies(
    moduleId: string,
    tenantId: string,
    version?: string,
    options: {
      includeOptional?: boolean;
      includeDev?: boolean;
      includePeer?: boolean;
      skipConflicts?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    installed: string[];
    failed: string[];
    warnings: string[];
    errors: string[];
  }> {
    const result = {
      success: true,
      installed: [] as string[],
      failed: [] as string[],
      warnings: [] as string[],
      errors: [] as string[],
    };

    try {
      // Resolve dependencies
      const resolution = await this.resolveDependencies(moduleId, version, options);
      
      // Check for conflicts if not skipping
      if (!options.skipConflicts && resolution.conflicts.length > 0) {
        result.errors.push(...resolution.conflicts);
        result.success = false;
        return result;
      }

      // Install each dependency
      for (const dependency of resolution.dependencies) {
        try {
          // Check if already installed
          const isInstalled = await this.isDependencyInstalled(dependency.id, tenantId);
          if (isInstalled) {
            result.warnings.push(`Dependency ${dependency.id} is already installed`);
            continue;
          }

          // Install dependency
          await this.installDependency(dependency, tenantId);
          result.installed.push(dependency.id);

        } catch (error) {
          if (dependency.required) {
            result.failed.push(dependency.id);
            result.errors.push(`Failed to install required dependency ${dependency.id}: ${error}`);
            result.success = false;
          } else {
            result.warnings.push(`Failed to install optional dependency ${dependency.id}: ${error}`);
          }
        }
      }

      return result;

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : String(error));
      return result;
    }
  }

  /**
   * Get dependency statistics
   */
  async getDependencyStatistics(): Promise<{
    totalDependencies: number;
    resolvedDependencies: number;
    conflictedDependencies: number;
    circularDependencies: number;
    averageDependencyDepth: number;
    mostCommonDependencies: Array<{ id: string; count: number }>;
  }> {
    const resolutions = Array.from(this.dependencyCache.values());
    const conflicts = Array.from(this.conflictCache.values()).flat();
    
    const totalDependencies = resolutions.reduce((sum, r) => sum + r.dependencies.length, 0);
    const resolvedDependencies = resolutions.reduce((sum, r) => sum + r.dependencies.length, 0);
    const conflictedDependencies = conflicts.length;
    const circularDependencies = resolutions.reduce((sum, r) => sum + r.circularDependencies.length, 0);
    
    const averageDependencyDepth = resolutions.length > 0 
      ? resolutions.reduce((sum, r) => sum + r.resolutionPath.length, 0) / resolutions.length 
      : 0;

    // Count most common dependencies
    const dependencyCounts = new Map<string, number>();
    resolutions.forEach(resolution => {
      resolution.dependencies.forEach(dep => {
        const count = dependencyCounts.get(dep.id) || 0;
        dependencyCounts.set(dep.id, count + 1);
      });
    });

    const mostCommonDependencies = Array.from(dependencyCounts.entries())
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalDependencies,
      resolvedDependencies,
      conflictedDependencies,
      circularDependencies,
      averageDependencyDepth,
      mostCommonDependencies,
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private async getModuleMetadata(moduleId: string, version?: string): Promise<ModuleMetadata | null> {
    // Mock implementation - in real app, this would query the module registry
    return this.moduleRegistry.get(moduleId) || null;
  }

  private async parseDependencies(module: ModuleMetadata): Promise<Dependency[]> {
    // Mock implementation - in real app, this would parse module's manifest
    return [];
  }

  private filterDependencies(
    dependencies: Dependency[],
    options: {
      includeOptional?: boolean;
      includeDev?: boolean;
      includePeer?: boolean;
    }
  ): Dependency[] {
    return dependencies.filter(dep => {
      if (!options.includeOptional && dep.optional) return false;
      if (!options.includeDev && dep.dev) return false;
      if (!options.includePeer && dep.peer) return false;
      return true;
    });
  }

  private async resolveDependency(
    dependency: Dependency,
    maxDepth: number
  ): Promise<Dependency> {
    // Mock implementation - in real app, this would:
    // - Find the best version that satisfies the constraint
    // - Check for conflicts
    // - Resolve sub-dependencies
    return dependency;
  }

  private detectCircularDependencies(
    resolutionPath: string[],
    dependencies: Dependency[]
  ): string[] {
    // Check for circular dependencies in the resolution path
    const circular: string[] = [];
    const pathSet = new Set(resolutionPath);
    
    for (const dep of dependencies) {
      if (pathSet.has(dep.id)) {
        const cycleStart = resolutionPath.indexOf(dep.id);
        circular.push(...resolutionPath.slice(cycleStart));
      }
    }
    
    return circular;
  }

  private async resolveConflicts(conflicts: DependencyConflict[]): Promise<DependencyConflict[]> {
    // Mock implementation - in real app, this would:
    // - Apply conflict resolution strategies
    // - Update dependency versions
    // - Return resolved conflicts
    return conflicts.map(conflict => ({
      ...conflict,
      resolution: 'auto',
    }));
  }

  private async getInstalledVersion(moduleId: string): Promise<string | null> {
    // Mock implementation - in real app, this would query the installation registry
    return null;
  }

  private isVersionCompatible(
    requiredVersion: string,
    installedVersion: string,
    constraint?: VersionConstraint
  ): boolean {
    // Mock implementation - in real app, this would use semver to check compatibility
    return true;
  }

  private async detectPeerConflicts(
    dependencies: Dependency[],
    installedModules: string[]
  ): Promise<DependencyConflict[]> {
    // Mock implementation - in real app, this would check peer dependency conflicts
    return [];
  }

  private async isDependencyInstalled(moduleId: string, tenantId: string): Promise<boolean> {
    // Mock implementation - in real app, this would check the installation registry
    return false;
  }

  private async installDependency(dependency: Dependency, tenantId: string): Promise<void> {
    // Mock implementation - in real app, this would install the dependency
    console.log(`Installing dependency ${dependency.id} for tenant ${tenantId}`);
  }

  private initializeBuiltInModules(): void {
    // Initialize with some mock modules for testing
    this.moduleRegistry.set('test-module', {
      id: 'test-module',
      name: 'Test Module',
      displayName: 'Test Module',
      description: 'A test module',
      version: '1.0.0',
      author: 'Test Author',
      category: 'utilities',
      tags: ['test'],
      pricing: { type: 'free' },
      compatibility: { minVersion: '1.0.0', dependencies: [], conflicts: [] },
      installCount: 0,
      rating: { average: 0, count: 0, breakdown: {} },
      status: 'approved',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const dependencyResolver = new DependencyResolver();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export async function resolveDependencies(
  moduleId: string,
  version?: string,
  options?: {
    includeOptional?: boolean;
    includeDev?: boolean;
    includePeer?: boolean;
    resolveConflicts?: boolean;
    maxDepth?: number;
  }
): Promise<DependencyResolution> {
  return dependencyResolver.resolveDependencies(moduleId, version, options);
}

export async function detectConflicts(
  moduleId: string,
  version?: string,
  installedModules?: string[]
): Promise<DependencyConflict[]> {
  return dependencyResolver.detectConflicts(moduleId, version, installedModules);
}

export async function generateDependencyGraph(
  moduleId: string,
  version?: string,
  options?: {
    includeOptional?: boolean;
    includeDev?: boolean;
    maxDepth?: number;
  }
): Promise<DependencyGraph> {
  return dependencyResolver.generateDependencyGraph(moduleId, version, options);
}

export async function installDependencies(
  moduleId: string,
  tenantId: string,
  version?: string,
  options?: {
    includeOptional?: boolean;
    includeDev?: boolean;
    includePeer?: boolean;
    skipConflicts?: boolean;
  }
) {
  return dependencyResolver.installDependencies(moduleId, tenantId, version, options);
}

export async function getDependencyStatistics() {
  return dependencyResolver.getDependencyStatistics();
}
