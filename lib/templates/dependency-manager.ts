/**
 * @fileoverview Template Dependency Manager - HT-032.3.2
 * @module lib/templates/dependency-manager
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Template dependency management system with conflict resolution,
 * automatic updates, and dependency graph analysis.
 */

import { z } from 'zod';
import semver from 'semver';
import { TemplateDependency, TemplateVersionInfo } from './versioning-system';

// Dependency management types
export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  cycles: DependencyCycle[];
  conflicts: DependencyConflict[];
}

export interface DependencyNode {
  id: string;
  name: string;
  version: string;
  type: 'template' | 'package' | 'component' | 'asset';
  status: 'installed' | 'pending' | 'missing' | 'outdated' | 'conflicted';
  metadata: DependencyMetadata;
  children: string[];
  parents: string[];
  depth: number;
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'required' | 'optional' | 'development' | 'peer';
  versionRange: string;
  satisfied: boolean;
  conflict?: DependencyConflict;
}

export interface DependencyMetadata {
  description?: string;
  author?: string;
  license?: string;
  repository?: string;
  homepage?: string;
  keywords: string[];
  size: number;
  lastUpdated: Date;
  downloadCount?: number;
  securityScore: number;
  qualityScore: number;
}

export interface DependencyCycle {
  id: string;
  nodes: string[];
  severity: 'warning' | 'error';
  description: string;
  resolution?: string;
}

export interface DependencyConflict {
  id: string;
  type: 'version' | 'peer' | 'circular' | 'missing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  dependencies: ConflictingDependency[];
  description: string;
  resolution: ConflictResolution[];
  autoResolvable: boolean;
}

export interface ConflictingDependency {
  name: string;
  requestedVersion: string;
  installedVersion?: string;
  requiredBy: string[];
}

export interface ConflictResolution {
  type: 'upgrade' | 'downgrade' | 'remove' | 'alternative' | 'manual';
  description: string;
  impact: 'low' | 'medium' | 'high';
  automatic: boolean;
  steps: string[];
}

export interface DependencyUpdate {
  dependency: TemplateDependency;
  currentVersion: string;
  latestVersion: string;
  updateType: 'major' | 'minor' | 'patch';
  changelog: UpdateChangeEntry[];
  breaking: boolean;
  security: boolean;
  recommended: boolean;
}

export interface UpdateChangeEntry {
  version: string;
  date: Date;
  type: 'feature' | 'bugfix' | 'security' | 'breaking' | 'deprecation';
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export interface DependencyInstallOptions {
  type?: 'required' | 'optional' | 'development' | 'peer';
  version?: string;
  force?: boolean;
  skipValidation?: boolean;
  resolveDependencies?: boolean;
  updateExisting?: boolean;
}

export interface DependencyUpdateOptions {
  targetVersion?: string;
  updateType?: 'major' | 'minor' | 'patch' | 'latest';
  includeDevelopment?: boolean;
  autoResolveConflicts?: boolean;
  dryRun?: boolean;
}

export interface DependencyAnalysisResult {
  totalDependencies: number;
  directDependencies: number;
  transitiveDependencies: number;
  outdatedDependencies: number;
  vulnerableDependencies: number;
  conflicts: number;
  cycles: number;
  totalSize: number;
  duplicates: DuplicateDependency[];
  recommendations: DependencyRecommendation[];
}

export interface DuplicateDependency {
  name: string;
  versions: string[];
  totalSize: number;
  recommendation: string;
}

export interface DependencyRecommendation {
  type: 'update' | 'remove' | 'replace' | 'optimize';
  priority: 'low' | 'medium' | 'high';
  dependency: string;
  description: string;
  impact: string;
  action: string;
}

/**
 * Template Dependency Manager
 * Manages template dependencies, resolves conflicts, and maintains dependency graphs
 */
export class TemplateDependencyManager {
  private dependencyGraph: DependencyGraph;
  private installedDependencies: Map<string, TemplateDependency>;
  private dependencyCache: Map<string, DependencyMetadata>;
  private conflictResolutions: Map<string, ConflictResolution[]>;

  constructor() {
    this.dependencyGraph = {
      nodes: [],
      edges: [],
      cycles: [],
      conflicts: []
    };
    this.installedDependencies = new Map();
    this.dependencyCache = new Map();
    this.conflictResolutions = new Map();
  }

  /**
   * Install a dependency
   */
  async installDependency(
    templateId: string,
    dependency: TemplateDependency,
    options: DependencyInstallOptions = {}
  ): Promise<void> {
    try {
      // Validate dependency
      if (!options.skipValidation) {
        await this.validateDependency(dependency);
      }

      // Check for conflicts
      const conflicts = await this.checkConflicts(dependency);
      if (conflicts.length > 0 && !options.force) {
        throw new Error(`Dependency conflicts detected: ${conflicts.map(c => c.description).join(', ')}`);
      }

      // Resolve dependencies if requested
      if (options.resolveDependencies) {
        await this.resolveDependencies(dependency);
      }

      // Install dependency
      await this.performInstall(templateId, dependency, options);

      // Update dependency graph
      await this.updateDependencyGraph(templateId, dependency);

      // Check for cycles
      const cycles = this.detectCycles();
      if (cycles.length > 0) {
        console.warn(`Circular dependencies detected: ${cycles.map(c => c.description).join(', ')}`);
      }

    } catch (error) {
      throw new Error(`Failed to install dependency ${dependency.name}: ${error}`);
    }
  }

  /**
   * Remove a dependency
   */
  async removeDependency(templateId: string, dependencyName: string): Promise<void> {
    const dependency = this.installedDependencies.get(`${templateId}:${dependencyName}`);
    if (!dependency) {
      throw new Error(`Dependency ${dependencyName} not found for template ${templateId}`);
    }

    // Check if dependency is required by others
    const dependents = this.findDependents(dependencyName);
    if (dependents.length > 0) {
      throw new Error(`Cannot remove ${dependencyName}: required by ${dependents.join(', ')}`);
    }

    // Remove from graph
    this.removeDependencyFromGraph(templateId, dependencyName);

    // Remove from installed dependencies
    this.installedDependencies.delete(`${templateId}:${dependencyName}`);
  }

  /**
   * Update dependencies
   */
  async updateDependencies(
    templateId: string,
    options: DependencyUpdateOptions = {}
  ): Promise<DependencyUpdate[]> {
    const templateDependencies = this.getTemplateDependencies(templateId);
    const updates: DependencyUpdate[] = [];

    for (const dependency of templateDependencies) {
      const update = await this.checkForUpdates(dependency, options);
      if (update) {
        updates.push(update);

        if (!options.dryRun) {
          await this.performUpdate(templateId, update, options);
        }
      }
    }

    return updates;
  }

  /**
   * Get dependency graph for a template
   */
  getDependencyGraph(templateId: string): DependencyGraph {
    const templateNodes = this.dependencyGraph.nodes.filter(
      node => node.id.startsWith(templateId)
    );
    
    const templateNodeIds = new Set(templateNodes.map(n => n.id));
    const templateEdges = this.dependencyGraph.edges.filter(
      edge => templateNodeIds.has(edge.from) || templateNodeIds.has(edge.to)
    );

    return {
      nodes: templateNodes,
      edges: templateEdges,
      cycles: this.dependencyGraph.cycles.filter(
        cycle => cycle.nodes.some(nodeId => templateNodeIds.has(nodeId))
      ),
      conflicts: this.dependencyGraph.conflicts.filter(
        conflict => conflict.dependencies.some(dep => 
          templateNodeIds.has(`${templateId}:${dep.name}`)
        )
      )
    };
  }

  /**
   * Analyze dependencies
   */
  async analyzeDependencies(templateId: string): Promise<DependencyAnalysisResult> {
    const graph = this.getDependencyGraph(templateId);
    const dependencies = this.getTemplateDependencies(templateId);

    const directDependencies = dependencies.length;
    const transitiveDependencies = graph.nodes.length - directDependencies;
    const outdated = await this.findOutdatedDependencies(dependencies);
    const vulnerable = await this.findVulnerableDependencies(dependencies);
    const duplicates = this.findDuplicateDependencies(graph);
    const totalSize = graph.nodes.reduce((sum, node) => sum + node.metadata.size, 0);

    const recommendations = await this.generateRecommendations(
      dependencies,
      graph,
      duplicates,
      outdated,
      vulnerable
    );

    return {
      totalDependencies: graph.nodes.length,
      directDependencies,
      transitiveDependencies,
      outdatedDependencies: outdated.length,
      vulnerableDependencies: vulnerable.length,
      conflicts: graph.conflicts.length,
      cycles: graph.cycles.length,
      totalSize,
      duplicates,
      recommendations
    };
  }

  /**
   * Resolve dependency conflicts
   */
  async resolveConflicts(
    templateId: string,
    autoResolve: boolean = false
  ): Promise<DependencyConflict[]> {
    const graph = this.getDependencyGraph(templateId);
    const resolvedConflicts: DependencyConflict[] = [];

    for (const conflict of graph.conflicts) {
      if (autoResolve && conflict.autoResolvable) {
        await this.autoResolveConflict(templateId, conflict);
        resolvedConflicts.push(conflict);
      }
    }

    return resolvedConflicts;
  }

  /**
   * Get available updates for template dependencies
   */
  async getAvailableUpdates(templateId: string): Promise<DependencyUpdate[]> {
    const dependencies = this.getTemplateDependencies(templateId);
    const updates: DependencyUpdate[] = [];

    for (const dependency of dependencies) {
      const update = await this.checkForUpdates(dependency);
      if (update) {
        updates.push(update);
      }
    }

    return updates.sort((a, b) => {
      // Sort by security updates first, then by update type
      if (a.security && !b.security) return -1;
      if (!a.security && b.security) return 1;
      
      const typeOrder = { patch: 1, minor: 2, major: 3 };
      return typeOrder[a.updateType] - typeOrder[b.updateType];
    });
  }

  /**
   * Validate dependency compatibility
   */
  async validateCompatibility(
    templateId: string,
    dependency: TemplateDependency
  ): Promise<boolean> {
    const existingDependencies = this.getTemplateDependencies(templateId);
    
    // Check version conflicts
    for (const existing of existingDependencies) {
      if (existing.name === dependency.name) {
        if (!semver.satisfies(dependency.version, existing.versionRange)) {
          return false;
        }
      }
    }

    // Check peer dependencies
    if (dependency.type === 'peer') {
      const peerConflicts = await this.checkPeerDependencies(dependency, existingDependencies);
      return peerConflicts.length === 0;
    }

    return true;
  }

  /**
   * Get dependency tree visualization data
   */
  getDependencyTree(templateId: string): DependencyTreeNode {
    const graph = this.getDependencyGraph(templateId);
    const rootNode = graph.nodes.find(n => n.id === templateId);
    
    if (!rootNode) {
      return {
        id: templateId,
        name: templateId,
        version: '1.0.0',
        type: 'template',
        children: []
      };
    }

    return this.buildTreeNode(rootNode, graph, new Set());
  }

  // Private helper methods

  private async validateDependency(dependency: TemplateDependency): Promise<void> {
    if (!dependency.name || !dependency.version) {
      throw new Error('Dependency name and version are required');
    }

    if (!semver.valid(dependency.version) && !semver.validRange(dependency.versionRange)) {
      throw new Error(`Invalid version format: ${dependency.version}`);
    }
  }

  private async checkConflicts(dependency: TemplateDependency): Promise<DependencyConflict[]> {
    const conflicts: DependencyConflict[] = [];
    
    // Check for version conflicts
    for (const [key, existing] of this.installedDependencies) {
      if (existing.name === dependency.name && existing.version !== dependency.version) {
        if (!semver.satisfies(dependency.version, existing.versionRange)) {
          conflicts.push({
            id: `version-${dependency.name}`,
            type: 'version',
            severity: 'high',
            dependencies: [
              {
                name: dependency.name,
                requestedVersion: dependency.version,
                installedVersion: existing.version,
                requiredBy: [key.split(':')[0]]
              }
            ],
            description: `Version conflict for ${dependency.name}`,
            resolution: [{
              type: 'upgrade',
              description: 'Upgrade to compatible version',
              impact: 'medium',
              automatic: true,
              steps: [`Update ${dependency.name} to compatible version`]
            }],
            autoResolvable: true
          });
        }
      }
    }

    return conflicts;
  }

  private async resolveDependencies(dependency: TemplateDependency): Promise<void> {
    // This would resolve transitive dependencies
    // Implementation would fetch dependency metadata and install sub-dependencies
    console.log(`Resolving dependencies for ${dependency.name}`);
  }

  private async performInstall(
    templateId: string,
    dependency: TemplateDependency,
    options: DependencyInstallOptions
  ): Promise<void> {
    // Store dependency
    const key = `${templateId}:${dependency.name}`;
    this.installedDependencies.set(key, dependency);

    // Cache metadata
    if (!this.dependencyCache.has(dependency.name)) {
      const metadata = await this.fetchDependencyMetadata(dependency);
      this.dependencyCache.set(dependency.name, metadata);
    }
  }

  private async updateDependencyGraph(
    templateId: string,
    dependency: TemplateDependency
  ): Promise<void> {
    const nodeId = `${templateId}:${dependency.name}`;
    const metadata = this.dependencyCache.get(dependency.name) || await this.fetchDependencyMetadata(dependency);

    // Add or update node
    const existingNodeIndex = this.dependencyGraph.nodes.findIndex(n => n.id === nodeId);
    const node: DependencyNode = {
      id: nodeId,
      name: dependency.name,
      version: dependency.version,
      type: 'package',
      status: 'installed',
      metadata,
      children: [],
      parents: [templateId],
      depth: 1
    };

    if (existingNodeIndex >= 0) {
      this.dependencyGraph.nodes[existingNodeIndex] = node;
    } else {
      this.dependencyGraph.nodes.push(node);
    }

    // Add edge
    const edge: DependencyEdge = {
      from: templateId,
      to: nodeId,
      type: dependency.type,
      versionRange: dependency.versionRange,
      satisfied: true
    };

    const existingEdgeIndex = this.dependencyGraph.edges.findIndex(
      e => e.from === edge.from && e.to === edge.to
    );

    if (existingEdgeIndex >= 0) {
      this.dependencyGraph.edges[existingEdgeIndex] = edge;
    } else {
      this.dependencyGraph.edges.push(edge);
    }
  }

  private detectCycles(): DependencyCycle[] {
    const cycles: DependencyCycle[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string, path: string[]): void => {
      if (recursionStack.has(nodeId)) {
        // Found a cycle
        const cycleStart = path.indexOf(nodeId);
        const cyclePath = path.slice(cycleStart);
        cycles.push({
          id: `cycle-${cycles.length}`,
          nodes: cyclePath,
          severity: 'warning',
          description: `Circular dependency: ${cyclePath.join(' -> ')}`
        });
        return;
      }

      if (visited.has(nodeId)) {
        return;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const node = this.dependencyGraph.nodes.find(n => n.id === nodeId);
      if (node) {
        for (const childId of node.children) {
          dfs(childId, [...path, nodeId]);
        }
      }

      recursionStack.delete(nodeId);
    };

    for (const node of this.dependencyGraph.nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id, []);
      }
    }

    return cycles;
  }

  private removeDependencyFromGraph(templateId: string, dependencyName: string): void {
    const nodeId = `${templateId}:${dependencyName}`;
    
    // Remove node
    this.dependencyGraph.nodes = this.dependencyGraph.nodes.filter(n => n.id !== nodeId);
    
    // Remove edges
    this.dependencyGraph.edges = this.dependencyGraph.edges.filter(
      e => e.from !== nodeId && e.to !== nodeId
    );
  }

  private getTemplateDependencies(templateId: string): TemplateDependency[] {
    const dependencies: TemplateDependency[] = [];
    
    for (const [key, dependency] of this.installedDependencies) {
      if (key.startsWith(`${templateId}:`)) {
        dependencies.push(dependency);
      }
    }
    
    return dependencies;
  }

  private findDependents(dependencyName: string): string[] {
    const dependents: string[] = [];
    
    for (const edge of this.dependencyGraph.edges) {
      if (edge.to.endsWith(`:${dependencyName}`)) {
        dependents.push(edge.from);
      }
    }
    
    return dependents;
  }

  private async checkForUpdates(
    dependency: TemplateDependency,
    options: DependencyUpdateOptions = {}
  ): Promise<DependencyUpdate | null> {
    // This would check for available updates
    // For now, return null (no updates available)
    return null;
  }

  private async performUpdate(
    templateId: string,
    update: DependencyUpdate,
    options: DependencyUpdateOptions
  ): Promise<void> {
    // This would perform the actual update
    console.log(`Updating ${update.dependency.name} to ${update.latestVersion}`);
  }

  private async findOutdatedDependencies(dependencies: TemplateDependency[]): Promise<TemplateDependency[]> {
    // This would check which dependencies have updates available
    return [];
  }

  private async findVulnerableDependencies(dependencies: TemplateDependency[]): Promise<TemplateDependency[]> {
    // This would check for security vulnerabilities
    return [];
  }

  private findDuplicateDependencies(graph: DependencyGraph): DuplicateDependency[] {
    const duplicates: DuplicateDependency[] = [];
    const nameGroups = new Map<string, DependencyNode[]>();

    // Group nodes by name
    for (const node of graph.nodes) {
      const name = node.name;
      if (!nameGroups.has(name)) {
        nameGroups.set(name, []);
      }
      nameGroups.get(name)!.push(node);
    }

    // Find duplicates
    for (const [name, nodes] of nameGroups) {
      if (nodes.length > 1) {
        const versions = [...new Set(nodes.map(n => n.version))];
        if (versions.length > 1) {
          duplicates.push({
            name,
            versions,
            totalSize: nodes.reduce((sum, node) => sum + node.metadata.size, 0),
            recommendation: `Consider consolidating to single version of ${name}`
          });
        }
      }
    }

    return duplicates;
  }

  private async generateRecommendations(
    dependencies: TemplateDependency[],
    graph: DependencyGraph,
    duplicates: DuplicateDependency[],
    outdated: TemplateDependency[],
    vulnerable: TemplateDependency[]
  ): Promise<DependencyRecommendation[]> {
    const recommendations: DependencyRecommendation[] = [];

    // Security recommendations
    for (const dep of vulnerable) {
      recommendations.push({
        type: 'update',
        priority: 'high',
        dependency: dep.name,
        description: 'Security vulnerability detected',
        impact: 'Security risk',
        action: `Update ${dep.name} to latest secure version`
      });
    }

    // Update recommendations
    for (const dep of outdated) {
      recommendations.push({
        type: 'update',
        priority: 'medium',
        dependency: dep.name,
        description: 'Newer version available',
        impact: 'Bug fixes and improvements',
        action: `Update ${dep.name} to latest version`
      });
    }

    // Duplicate recommendations
    for (const duplicate of duplicates) {
      recommendations.push({
        type: 'optimize',
        priority: 'medium',
        dependency: duplicate.name,
        description: 'Multiple versions detected',
        impact: 'Reduced bundle size',
        action: `Consolidate ${duplicate.name} to single version`
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private async autoResolveConflict(templateId: string, conflict: DependencyConflict): Promise<void> {
    const resolution = conflict.resolution.find(r => r.automatic);
    if (!resolution) return;

    console.log(`Auto-resolving conflict ${conflict.id} using ${resolution.type} strategy`);
    // Implementation would apply the resolution
  }

  private async checkPeerDependencies(
    dependency: TemplateDependency,
    existingDependencies: TemplateDependency[]
  ): Promise<DependencyConflict[]> {
    // This would check peer dependency requirements
    return [];
  }

  private buildTreeNode(
    node: DependencyNode,
    graph: DependencyGraph,
    visited: Set<string>
  ): DependencyTreeNode {
    if (visited.has(node.id)) {
      return {
        id: node.id,
        name: node.name,
        version: node.version,
        type: node.type,
        children: [] // Avoid infinite recursion
      };
    }

    visited.add(node.id);

    const children: DependencyTreeNode[] = [];
    for (const childId of node.children) {
      const childNode = graph.nodes.find(n => n.id === childId);
      if (childNode) {
        children.push(this.buildTreeNode(childNode, graph, visited));
      }
    }

    return {
      id: node.id,
      name: node.name,
      version: node.version,
      type: node.type,
      children
    };
  }

  private async fetchDependencyMetadata(dependency: TemplateDependency): Promise<DependencyMetadata> {
    // This would fetch metadata from registry
    return {
      description: `Package ${dependency.name}`,
      keywords: [],
      size: 1024,
      lastUpdated: new Date(),
      securityScore: 100,
      qualityScore: 100
    };
  }
}

// Additional interfaces
export interface DependencyTreeNode {
  id: string;
  name: string;
  version: string;
  type: string;
  children: DependencyTreeNode[];
}

// Global instance
let globalDependencyManager: TemplateDependencyManager | null = null;

/**
 * Get the global template dependency manager instance
 */
export function getTemplateDependencyManager(): TemplateDependencyManager {
  if (!globalDependencyManager) {
    globalDependencyManager = new TemplateDependencyManager();
  }
  return globalDependencyManager;
}

/**
 * Initialize template dependency manager
 */
export function initializeTemplateDependencyManager(): TemplateDependencyManager {
  globalDependencyManager = new TemplateDependencyManager();
  return globalDependencyManager;
}
