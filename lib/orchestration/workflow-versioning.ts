/**
 * Workflow Versioning System
 * 
 * Implements comprehensive workflow versioning with semantic versioning,
 * change tracking, and rollback capabilities per PRD Section 8 requirements.
 */

import {
  WorkflowDefinition,
  WorkflowArtifacts,
  Environment,
  WorkflowStatus,
  WorkflowType,
  WorkflowConfig,
  WorkflowStep,
  WorkflowTrigger,
  WorkflowMetadata,
  OrchestrationError
} from './architecture';

// ============================================================================
// Versioning Types
// ============================================================================

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  version: string;
  semanticVersion: SemanticVersion;
  status: WorkflowVersionStatus;
  definition: WorkflowDefinition;
  artifacts: WorkflowArtifacts;
  changes: VersionChange[];
  metadata: VersionMetadata;
  createdAt: Date;
  createdBy: string;
  deployedAt?: Date;
  deployedBy?: string;
  environment: Environment;
  isActive: boolean;
  isLatest: boolean;
  parentVersionId?: string;
  childVersionIds: string[];
  checksum: string;
  size: number;
}

export type WorkflowVersionStatus = 'draft' | 'published' | 'deployed' | 'archived' | 'deprecated';

export interface SemanticVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
}

export interface VersionChange {
  id: string;
  type: ChangeType;
  path: string;
  oldValue?: any;
  newValue?: any;
  description: string;
  impact: ChangeImpact;
  breaking: boolean;
  timestamp: Date;
  author: string;
}

export type ChangeType = 
  | 'step_added' 
  | 'step_removed' 
  | 'step_modified' 
  | 'config_changed' 
  | 'trigger_added' 
  | 'trigger_removed' 
  | 'trigger_modified' 
  | 'dependency_added' 
  | 'dependency_removed' 
  | 'metadata_updated';

export type ChangeImpact = 'low' | 'medium' | 'high' | 'critical';

export interface VersionMetadata {
  description?: string;
  releaseNotes?: string;
  tags: string[];
  environment: Environment;
  source: string;
  branch?: string;
  commit?: string;
  buildNumber?: string;
  dependencies: string[];
  compatibility: CompatibilityInfo;
}

export interface CompatibilityInfo {
  minVersion?: string;
  maxVersion?: string;
  breakingChanges: string[];
  migrationNotes?: string;
  deprecationWarnings?: string[];
}

export interface VersionComparison {
  fromVersion: WorkflowVersion;
  toVersion: WorkflowVersion;
  changes: VersionChange[];
  breakingChanges: VersionChange[];
  migrationRequired: boolean;
  compatibilityScore: number;
  summary: VersionSummary;
}

export interface VersionSummary {
  totalChanges: number;
  breakingChanges: number;
  newFeatures: number;
  bugFixes: number;
  improvements: number;
  deprecations: number;
}

export interface VersionQuery {
  workflowId?: string;
  version?: string;
  status?: WorkflowVersionStatus;
  environment?: Environment;
  isActive?: boolean;
  isLatest?: boolean;
  createdBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface CreateVersionRequest {
  workflowId: string;
  definition: WorkflowDefinition;
  version?: string;
  description?: string;
  releaseNotes?: string;
  tags?: string[];
  environment: Environment;
  createdBy: string;
  source?: string;
  branch?: string;
  commit?: string;
  buildNumber?: string;
  parentVersionId?: string;
}

export interface UpdateVersionRequest {
  versionId: string;
  status?: WorkflowVersionStatus;
  description?: string;
  releaseNotes?: string;
  tags?: string[];
  metadata?: Partial<VersionMetadata>;
}

export interface PromoteVersionRequest {
  versionId: string;
  fromEnvironment: Environment;
  toEnvironment: Environment;
  options?: {
    validateCompatibility?: boolean;
    includeDependencies?: boolean;
    backupExisting?: boolean;
    dryRun?: boolean;
  };
}

// ============================================================================
// Workflow Versioning Engine
// ============================================================================

export class WorkflowVersioningEngine {
  private versions: Map<string, WorkflowVersion> = new Map();
  private versionIndex: Map<string, string[]> = new Map(); // workflowId -> versionIds
  private activeVersions: Map<string, string> = new Map(); // workflowId -> activeVersionId

  constructor(
    private config: VersioningConfig = DEFAULT_VERSIONING_CONFIG
  ) {}

  /**
   * Create new workflow version
   */
  async createVersion(request: CreateVersionRequest): Promise<WorkflowVersion> {
    const { workflowId, definition, version, description, releaseNotes, tags, environment, createdBy, source, branch, commit, buildNumber, parentVersionId } = request;

    // Generate version if not provided
    const versionString = version || await this.generateNextVersion(workflowId, definition);

    // Parse semantic version
    const semanticVersion = this.parseSemanticVersion(versionString);

    // Create version ID
    const versionId = this.generateVersionId(workflowId, versionString);

    // Calculate checksum
    const checksum = await this.calculateChecksum(definition);

    // Get changes from parent version
    const changes = parentVersionId 
      ? await this.calculateChanges(parentVersionId, definition)
      : [];

    // Create version metadata
    const metadata: VersionMetadata = {
      description,
      releaseNotes,
      tags: tags || [],
      environment,
      source: source || 'orchestration',
      branch,
      commit,
      buildNumber,
      dependencies: this.extractDependencies(definition),
      compatibility: this.analyzeCompatibility(definition, changes)
    };

    // Create workflow artifacts
    const artifacts: WorkflowArtifacts = {
      workflow: definition,
      config: definition.config,
      dependencies: metadata.dependencies,
      environment,
      exportedAt: new Date(),
      version: versionString,
      checksum
    };

    // Create version
    const workflowVersion: WorkflowVersion = {
      id: versionId,
      workflowId,
      version: versionString,
      semanticVersion,
      status: 'draft',
      definition,
      artifacts,
      changes,
      metadata,
      createdAt: new Date(),
      createdBy,
      environment,
      isActive: false,
      isLatest: false,
      parentVersionId,
      childVersionIds: [],
      checksum,
      size: this.calculateSize(definition)
    };

    // Store version
    this.versions.set(versionId, workflowVersion);

    // Update index
    this.updateVersionIndex(workflowId, versionId);

    // Update parent-child relationships
    if (parentVersionId) {
      await this.updateParentChildRelationship(parentVersionId, versionId);
    }

    return workflowVersion;
  }

  /**
   * Get workflow version by ID
   */
  async getVersion(versionId: string): Promise<WorkflowVersion | null> {
    return this.versions.get(versionId) || null;
  }

  /**
   * Get workflow versions by query
   */
  async getVersions(query: VersionQuery): Promise<WorkflowVersion[]> {
    let versions = Array.from(this.versions.values());

    // Apply filters
    if (query.workflowId) {
      versions = versions.filter(v => v.workflowId === query.workflowId);
    }

    if (query.version) {
      versions = versions.filter(v => v.version === query.version);
    }

    if (query.status) {
      versions = versions.filter(v => v.status === query.status);
    }

    if (query.environment) {
      versions = versions.filter(v => v.environment === query.environment);
    }

    if (query.isActive !== undefined) {
      versions = versions.filter(v => v.isActive === query.isActive);
    }

    if (query.isLatest !== undefined) {
      versions = versions.filter(v => v.isLatest === query.isLatest);
    }

    if (query.createdBy) {
      versions = versions.filter(v => v.createdBy === query.createdBy);
    }

    if (query.dateRange) {
      versions = versions.filter(v => 
        v.createdAt >= query.dateRange!.start && 
        v.createdAt <= query.dateRange!.end
      );
    }

    if (query.tags && query.tags.length > 0) {
      versions = versions.filter(v => 
        query.tags!.some(tag => v.metadata.tags.includes(tag))
      );
    }

    // Sort by creation date (newest first)
    versions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    if (query.offset) {
      versions = versions.slice(query.offset);
    }

    if (query.limit) {
      versions = versions.slice(0, query.limit);
    }

    return versions;
  }

  /**
   * Get active version for workflow
   */
  async getActiveVersion(workflowId: string, environment: Environment): Promise<WorkflowVersion | null> {
    const versions = await this.getVersions({
      workflowId,
      environment,
      isActive: true
    });

    return versions.length > 0 ? versions[0] : null;
  }

  /**
   * Get latest version for workflow
   */
  async getLatestVersion(workflowId: string, environment: Environment): Promise<WorkflowVersion | null> {
    const versions = await this.getVersions({
      workflowId,
      environment,
      isLatest: true
    });

    return versions.length > 0 ? versions[0] : null;
  }

  /**
   * Update workflow version
   */
  async updateVersion(request: UpdateVersionRequest): Promise<WorkflowVersion> {
    const { versionId, status, description, releaseNotes, tags, metadata } = request;

    const version = this.versions.get(versionId);
    if (!version) {
      throw new OrchestrationError(`Version not found: ${versionId}`, 'VERSION_NOT_FOUND');
    }

    // Update fields
    if (status !== undefined) {
      version.status = status;
    }

    if (description !== undefined) {
      version.metadata.description = description;
    }

    if (releaseNotes !== undefined) {
      version.metadata.releaseNotes = releaseNotes;
    }

    if (tags !== undefined) {
      version.metadata.tags = tags;
    }

    if (metadata !== undefined) {
      version.metadata = { ...version.metadata, ...metadata };
    }

    // Recalculate checksum if definition changed
    if (metadata?.dependencies) {
      version.checksum = await this.calculateChecksum(version.definition);
      version.artifacts.checksum = version.checksum;
    }

    this.versions.set(versionId, version);
    return version;
  }

  /**
   * Activate workflow version
   */
  async activateVersion(versionId: string, environment: Environment): Promise<WorkflowVersion> {
    const version = this.versions.get(versionId);
    if (!version) {
      throw new OrchestrationError(`Version not found: ${versionId}`, 'VERSION_NOT_FOUND');
    }

    // Deactivate current active version
    const currentActive = await this.getActiveVersion(version.workflowId, environment);
    if (currentActive) {
      currentActive.isActive = false;
      this.versions.set(currentActive.id, currentActive);
    }

    // Activate new version
    version.isActive = true;
    version.status = 'deployed';
    version.deployedAt = new Date();
    version.deployedBy = version.createdBy; // In real implementation, this would be the current user

    this.versions.set(versionId, version);
    this.activeVersions.set(`${version.workflowId}:${environment}`, versionId);

    return version;
  }

  /**
   * Compare two workflow versions
   */
  async compareVersions(fromVersionId: string, toVersionId: string): Promise<VersionComparison> {
    const fromVersion = this.versions.get(fromVersionId);
    const toVersion = this.versions.get(toVersionId);

    if (!fromVersion || !toVersion) {
      throw new OrchestrationError('One or both versions not found', 'VERSION_NOT_FOUND');
    }

    if (fromVersion.workflowId !== toVersion.workflowId) {
      throw new OrchestrationError('Cannot compare versions from different workflows', 'INVALID_COMPARISON');
    }

    // Calculate changes
    const changes = await this.calculateChanges(fromVersionId, toVersion.definition);
    const breakingChanges = changes.filter(change => change.breaking);

    // Calculate compatibility score
    const compatibilityScore = this.calculateCompatibilityScore(changes);

    // Generate summary
    const summary: VersionSummary = {
      totalChanges: changes.length,
      breakingChanges: breakingChanges.length,
      newFeatures: changes.filter(c => c.type.includes('added')).length,
      bugFixes: changes.filter(c => c.type.includes('fixed')).length,
      improvements: changes.filter(c => c.type.includes('modified')).length,
      deprecations: changes.filter(c => c.type.includes('deprecated')).length
    };

    return {
      fromVersion,
      toVersion,
      changes,
      breakingChanges,
      migrationRequired: breakingChanges.length > 0,
      compatibilityScore,
      summary
    };
  }

  /**
   * Promote version to different environment
   */
  async promoteVersion(request: PromoteVersionRequest): Promise<WorkflowVersion> {
    const { versionId, fromEnvironment, toEnvironment, options = {} } = request;

    const sourceVersion = this.versions.get(versionId);
    if (!sourceVersion) {
      throw new OrchestrationError(`Version not found: ${versionId}`, 'VERSION_NOT_FOUND');
    }

    // Validate compatibility if requested
    if (options.validateCompatibility) {
      const targetActive = await this.getActiveVersion(sourceVersion.workflowId, toEnvironment);
      if (targetActive) {
        const comparison = await this.compareVersions(targetActive.id, versionId);
        if (comparison.migrationRequired) {
          throw new OrchestrationError('Breaking changes detected, migration required', 'BREAKING_CHANGES_DETECTED');
        }
      }
    }

    // Create new version for target environment
    const promotedVersion = await this.createVersion({
      workflowId: sourceVersion.workflowId,
      definition: sourceVersion.definition,
      version: sourceVersion.version,
      description: `Promoted from ${fromEnvironment}`,
      releaseNotes: sourceVersion.metadata.releaseNotes,
      tags: [...sourceVersion.metadata.tags, `promoted-from-${fromEnvironment}`],
      environment: toEnvironment,
      createdBy: sourceVersion.createdBy,
      source: 'promotion',
      parentVersionId: versionId
    });

    // Activate if not dry run
    if (!options.dryRun) {
      await this.activateVersion(promotedVersion.id, toEnvironment);
    }

    return promotedVersion;
  }

  /**
   * Archive workflow version
   */
  async archiveVersion(versionId: string): Promise<WorkflowVersion> {
    const version = this.versions.get(versionId);
    if (!version) {
      throw new OrchestrationError(`Version not found: ${versionId}`, 'VERSION_NOT_FOUND');
    }

    version.status = 'archived';
    version.isActive = false;
    version.isLatest = false;

    this.versions.set(versionId, version);

    // Update active version if this was active
    const activeKey = `${version.workflowId}:${version.environment}`;
    if (this.activeVersions.get(activeKey) === versionId) {
      this.activeVersions.delete(activeKey);
    }

    return version;
  }

  /**
   * Delete workflow version
   */
  async deleteVersion(versionId: string): Promise<void> {
    const version = this.versions.get(versionId);
    if (!version) {
      throw new OrchestrationError(`Version not found: ${versionId}`, 'VERSION_NOT_FOUND');
    }

    // Check if version is active
    if (version.isActive) {
      throw new OrchestrationError('Cannot delete active version', 'CANNOT_DELETE_ACTIVE_VERSION');
    }

    // Remove from index
    const workflowVersions = this.versionIndex.get(version.workflowId) || [];
    const updatedVersions = workflowVersions.filter(id => id !== versionId);
    this.versionIndex.set(version.workflowId, updatedVersions);

    // Remove version
    this.versions.delete(versionId);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Generate next version number
   */
  private async generateNextVersion(workflowId: string, definition: WorkflowDefinition): Promise<string> {
    const versions = await this.getVersions({ workflowId });
    
    if (versions.length === 0) {
      return '1.0.0';
    }

    // Get latest version
    const latestVersion = versions[0];
    const latestSemantic = latestVersion.semanticVersion;

    // Determine version bump based on changes
    const changes = await this.calculateChanges(latestVersion.id, definition);
    const hasBreakingChanges = changes.some(c => c.breaking);
    const hasNewFeatures = changes.some(c => c.type.includes('added'));

    if (hasBreakingChanges) {
      return `${latestSemantic.major + 1}.0.0`;
    } else if (hasNewFeatures) {
      return `${latestSemantic.major}.${latestSemantic.minor + 1}.0`;
    } else {
      return `${latestSemantic.major}.${latestSemantic.minor}.${latestSemantic.patch + 1}`;
    }
  }

  /**
   * Parse semantic version string
   */
  private parseSemanticVersion(version: string): SemanticVersion {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/);
    
    if (!match) {
      throw new OrchestrationError(`Invalid semantic version: ${version}`, 'INVALID_SEMANTIC_VERSION');
    }

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4],
      build: match[5]
    };
  }

  /**
   * Generate version ID
   */
  private generateVersionId(workflowId: string, version: string): string {
    return `${workflowId}:${version}:${Date.now()}`;
  }

  /**
   * Calculate workflow checksum
   */
  private async calculateChecksum(definition: WorkflowDefinition): Promise<string> {
    const crypto = await import('crypto');
    const content = JSON.stringify(definition, null, 0);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Calculate workflow size
   */
  private calculateSize(definition: WorkflowDefinition): number {
    return JSON.stringify(definition).length;
  }

  /**
   * Calculate changes between versions
   */
  private async calculateChanges(fromVersionId: string, toDefinition: WorkflowDefinition): Promise<VersionChange[]> {
    const fromVersion = this.versions.get(fromVersionId);
    if (!fromVersion) {
      return [];
    }

    const changes: VersionChange[] = [];
    const fromDef = fromVersion.definition;

    // Compare steps
    const fromSteps = new Map(fromDef.steps.map(s => [s.id, s]));
    const toSteps = new Map(toDefinition.steps.map(s => [s.id, s]));

    // Check for added steps
    for (const [stepId, step] of toSteps) {
      if (!fromSteps.has(stepId)) {
        changes.push({
          id: this.generateChangeId(),
          type: 'step_added',
          path: `steps.${stepId}`,
          newValue: step,
          description: `Added step: ${step.name}`,
          impact: 'medium',
          breaking: false,
          timestamp: new Date(),
          author: 'system'
        });
      }
    }

    // Check for removed steps
    for (const [stepId, step] of fromSteps) {
      if (!toSteps.has(stepId)) {
        changes.push({
          id: this.generateChangeId(),
          type: 'step_removed',
          path: `steps.${stepId}`,
          oldValue: step,
          description: `Removed step: ${step.name}`,
          impact: 'high',
          breaking: true,
          timestamp: new Date(),
          author: 'system'
        });
      }
    }

    // Check for modified steps
    for (const [stepId, fromStep] of fromSteps) {
      const toStep = toSteps.get(stepId);
      if (toStep) {
        const stepChanges = this.compareStep(fromStep, toStep);
        changes.push(...stepChanges);
      }
    }

    // Compare triggers
    const fromTriggers = new Map(fromDef.triggers.map(t => [t.id, t]));
    const toTriggers = new Map(toDefinition.triggers.map(t => [t.id, t]));

    // Check for added triggers
    for (const [triggerId, trigger] of toTriggers) {
      if (!fromTriggers.has(triggerId)) {
        changes.push({
          id: this.generateChangeId(),
          type: 'trigger_added',
          path: `triggers.${triggerId}`,
          newValue: trigger,
          description: `Added trigger: ${trigger.type}`,
          impact: 'medium',
          breaking: false,
          timestamp: new Date(),
          author: 'system'
        });
      }
    }

    // Check for removed triggers
    for (const [triggerId, trigger] of fromTriggers) {
      if (!toTriggers.has(triggerId)) {
        changes.push({
          id: this.generateChangeId(),
          type: 'trigger_removed',
          path: `triggers.${triggerId}`,
          oldValue: trigger,
          description: `Removed trigger: ${trigger.type}`,
          impact: 'high',
          breaking: true,
          timestamp: new Date(),
          author: 'system'
        });
      }
    }

    // Compare configuration
    const configChanges = this.compareConfig(fromDef.config, toDefinition.config);
    changes.push(...configChanges);

    return changes;
  }

  /**
   * Compare two workflow steps
   */
  private compareStep(fromStep: WorkflowStep, toStep: WorkflowStep): VersionChange[] {
    const changes: VersionChange[] = [];

    // Check for changes in step properties
    if (fromStep.name !== toStep.name) {
      changes.push({
        id: this.generateChangeId(),
        type: 'step_modified',
        path: `steps.${fromStep.id}.name`,
        oldValue: fromStep.name,
        newValue: toStep.name,
        description: `Step name changed: ${fromStep.name} → ${toStep.name}`,
        impact: 'low',
        breaking: false,
        timestamp: new Date(),
        author: 'system'
      });
    }

    if (fromStep.type !== toStep.type) {
      changes.push({
        id: this.generateChangeId(),
        type: 'step_modified',
        path: `steps.${fromStep.id}.type`,
        oldValue: fromStep.type,
        newValue: toStep.type,
        description: `Step type changed: ${fromStep.type} → ${toStep.type}`,
        impact: 'high',
        breaking: true,
        timestamp: new Date(),
        author: 'system'
      });
    }

    // Check for changes in dependencies
    const fromDeps = new Set(fromStep.dependencies);
    const toDeps = new Set(toStep.dependencies);

    for (const dep of toDeps) {
      if (!fromDeps.has(dep)) {
        changes.push({
          id: this.generateChangeId(),
          type: 'dependency_added',
          path: `steps.${fromStep.id}.dependencies`,
          newValue: dep,
          description: `Added dependency: ${dep}`,
          impact: 'medium',
          breaking: false,
          timestamp: new Date(),
          author: 'system'
        });
      }
    }

    for (const dep of fromDeps) {
      if (!toDeps.has(dep)) {
        changes.push({
          id: this.generateChangeId(),
          type: 'dependency_removed',
          path: `steps.${fromStep.id}.dependencies`,
          oldValue: dep,
          description: `Removed dependency: ${dep}`,
          impact: 'high',
          breaking: true,
          timestamp: new Date(),
          author: 'system'
        });
      }
    }

    return changes;
  }

  /**
   * Compare workflow configurations
   */
  private compareConfig(fromConfig: WorkflowConfig, toConfig: WorkflowConfig): VersionChange[] {
    const changes: VersionChange[] = [];

    if (fromConfig.timeout !== toConfig.timeout) {
      changes.push({
        id: this.generateChangeId(),
        type: 'config_changed',
        path: 'config.timeout',
        oldValue: fromConfig.timeout,
        newValue: toConfig.timeout,
        description: `Timeout changed: ${fromConfig.timeout} → ${toConfig.timeout}`,
        impact: 'medium',
        breaking: false,
        timestamp: new Date(),
        author: 'system'
      });
    }

    if (fromConfig.concurrency !== toConfig.concurrency) {
      changes.push({
        id: this.generateChangeId(),
        type: 'config_changed',
        path: 'config.concurrency',
        oldValue: fromConfig.concurrency,
        newValue: toConfig.concurrency,
        description: `Concurrency changed: ${fromConfig.concurrency} → ${toConfig.concurrency}`,
        impact: 'medium',
        breaking: false,
        timestamp: new Date(),
        author: 'system'
      });
    }

    return changes;
  }

  /**
   * Extract dependencies from workflow definition
   */
  private extractDependencies(definition: WorkflowDefinition): string[] {
    const dependencies = new Set<string>();

    // Extract from steps
    for (const step of definition.steps) {
      dependencies.add(...step.dependencies);
    }

    // Extract from triggers
    for (const trigger of definition.triggers) {
      if (trigger.webhook) {
        dependencies.add(`webhook:${trigger.webhook.id}`);
      }
    }

    return Array.from(dependencies);
  }

  /**
   * Analyze compatibility
   */
  private analyzeCompatibility(definition: WorkflowDefinition, changes: VersionChange[]): CompatibilityInfo {
    const breakingChanges = changes.filter(c => c.breaking);
    
    return {
      breakingChanges: breakingChanges.map(c => c.description),
      migrationNotes: breakingChanges.length > 0 ? 'Migration required due to breaking changes' : undefined,
      deprecationWarnings: changes.filter(c => c.type.includes('deprecated')).map(c => c.description)
    };
  }

  /**
   * Calculate compatibility score
   */
  private calculateCompatibilityScore(changes: VersionChange[]): number {
    if (changes.length === 0) return 100;

    const breakingChanges = changes.filter(c => c.breaking).length;
    const totalChanges = changes.length;

    return Math.max(0, 100 - (breakingChanges / totalChanges) * 100);
  }

  /**
   * Update version index
   */
  private updateVersionIndex(workflowId: string, versionId: string): void {
    const versions = this.versionIndex.get(workflowId) || [];
    versions.push(versionId);
    this.versionIndex.set(workflowId, versions);
  }

  /**
   * Update parent-child relationships
   */
  private async updateParentChildRelationship(parentVersionId: string, childVersionId: string): Promise<void> {
    const parentVersion = this.versions.get(parentVersionId);
    if (parentVersion) {
      parentVersion.childVersionIds.push(childVersionId);
      this.versions.set(parentVersionId, parentVersion);
    }
  }

  /**
   * Generate change ID
   */
  private generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// ============================================================================
// Configuration
// ============================================================================

export interface VersioningConfig {
  maxVersionsPerWorkflow: number;
  autoArchiveAfterDays: number;
  enableSemanticVersioning: boolean;
  requireVersionDescription: boolean;
  allowBreakingChanges: boolean;
  defaultEnvironment: Environment;
  retentionPolicy: {
    keepActiveVersions: number;
    keepLatestVersions: number;
    archiveAfterDays: number;
    deleteAfterDays: number;
  };
}

export const DEFAULT_VERSIONING_CONFIG: VersioningConfig = {
  maxVersionsPerWorkflow: 100,
  autoArchiveAfterDays: 90,
  enableSemanticVersioning: true,
  requireVersionDescription: false,
  allowBreakingChanges: true,
  defaultEnvironment: 'dev',
  retentionPolicy: {
    keepActiveVersions: 5,
    keepLatestVersions: 10,
    archiveAfterDays: 30,
    deleteAfterDays: 365
  }
};

// ============================================================================
// Factory
// ============================================================================

export class WorkflowVersioningFactory {
  /**
   * Create versioning engine with configuration
   */
  static create(config?: Partial<VersioningConfig>): WorkflowVersioningEngine {
    const finalConfig = { ...DEFAULT_VERSIONING_CONFIG, ...config };
    return new WorkflowVersioningEngine(finalConfig);
  }

  /**
   * Create version from workflow definition
   */
  static async createVersionFromDefinition(
    definition: WorkflowDefinition,
    options: {
      version?: string;
      environment?: Environment;
      createdBy?: string;
      description?: string;
    } = {}
  ): Promise<WorkflowVersion> {
    const engine = this.create();
    
    return await engine.createVersion({
      workflowId: definition.id,
      definition,
      version: options.version,
      description: options.description,
      environment: options.environment || 'dev',
      createdBy: options.createdBy || 'system'
    });
  }
}
