/**
 * @fileoverview Template Versioning System - HT-032.3.2
 * @module lib/templates/versioning-system
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Comprehensive template versioning system with version management,
 * history tracking, rollback capabilities, and migration support.
 */

import { z } from 'zod';
import semver from 'semver';

// Enhanced version types for HT-032.3.2
export interface TemplateVersionInfo {
  id: string;
  templateId: string;
  version: string;
  previousVersion?: string;
  createdAt: Date;
  updatedAt: Date;
  author: string;
  authorEmail: string;
  changelog: VersionChangeEntry[];
  compatibility: VersionCompatibility;
  dependencies: TemplateDependency[];
  assets: VersionAsset[];
  metadata: VersionMetadata;
  rollbackPoint: boolean;
  stable: boolean;
  deprecated: boolean;
  deprecationReason?: string;
  migrationPath?: MigrationPath;
}

export interface VersionChangeEntry {
  type: 'added' | 'modified' | 'removed' | 'deprecated' | 'security';
  category: 'feature' | 'bugfix' | 'security' | 'performance' | 'breaking' | 'documentation';
  component?: string;
  description: string;
  impact: 'major' | 'minor' | 'patch';
  breakingChange: boolean;
  migrationRequired: boolean;
  affectedFiles: string[];
  author: string;
  timestamp: Date;
}

export interface VersionCompatibility {
  minVersion: string;
  maxVersion: string;
  platformVersion: string;
  nodeVersion: string;
  breaking: boolean;
  backwardCompatible: boolean;
  forwardCompatible: boolean;
  deprecatedFeatures: string[];
  removedFeatures: string[];
  newFeatures: string[];
}

export interface TemplateDependency {
  id: string;
  name: string;
  version: string;
  versionRange: string;
  type: 'required' | 'optional' | 'development' | 'peer';
  source: 'registry' | 'local' | 'git' | 'npm';
  integrity?: string;
  resolved?: string;
  dev?: boolean;
  optional?: boolean;
}

export interface VersionAsset {
  id: string;
  name: string;
  type: 'component' | 'style' | 'script' | 'image' | 'font' | 'data';
  path: string;
  size: number;
  hash: string;
  compressed?: boolean;
  optimized?: boolean;
  dependencies: string[];
}

export interface VersionMetadata {
  size: number;
  performanceMetrics: PerformanceMetrics;
  securityScan: SecurityScanResult;
  qualityScore: number;
  testCoverage: number;
  buildTime: number;
  tags: string[];
  notes?: string;
}

export interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cpuUsage: number;
  score: number;
}

export interface SecurityScanResult {
  vulnerabilities: SecurityVulnerability[];
  score: number;
  lastScan: Date;
  scannerVersion: string;
}

export interface SecurityVulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  cwe?: string;
  cvss?: number;
  fixAvailable: boolean;
  fixVersion?: string;
}

export interface MigrationPath {
  fromVersion: string;
  toVersion: string;
  steps: MigrationStep[];
  automatic: boolean;
  backupRequired: boolean;
  estimatedTime: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface MigrationStep {
  id: string;
  name: string;
  description: string;
  type: 'schema' | 'data' | 'config' | 'asset' | 'code';
  script?: string;
  manual: boolean;
  reversible: boolean;
  validation: string[];
}

export interface VersionCreateOptions {
  version?: string;
  changelog: VersionChangeEntry[];
  rollbackPoint?: boolean;
  stable?: boolean;
  dependencies?: TemplateDependency[];
  migrationPath?: MigrationPath;
  author: string;
  authorEmail: string;
  notes?: string;
}

export interface VersionRollbackOptions {
  targetVersion: string;
  preserveData: boolean;
  backupCurrent: boolean;
  force: boolean;
  reason: string;
  author: string;
}

export interface VersionComparisonResult {
  current: TemplateVersionInfo;
  target: TemplateVersionInfo;
  differences: VersionDifference[];
  compatibility: CompatibilityAnalysis;
  migrationRequired: boolean;
  migrationComplexity: 'simple' | 'moderate' | 'complex';
  estimatedMigrationTime: number;
  riskAssessment: RiskAssessment;
}

export interface VersionDifference {
  type: 'added' | 'modified' | 'removed';
  category: string;
  path: string;
  oldValue?: any;
  newValue?: any;
  impact: 'breaking' | 'feature' | 'fix' | 'style';
  description: string;
}

export interface CompatibilityAnalysis {
  compatible: boolean;
  issues: CompatibilityIssue[];
  warnings: string[];
  recommendations: string[];
}

export interface CompatibilityIssue {
  type: 'breaking' | 'deprecated' | 'conflict';
  severity: 'critical' | 'major' | 'minor';
  component: string;
  description: string;
  resolution?: string;
}

export interface RiskAssessment {
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  mitigation: string[];
  recommendation: string;
}

export interface RiskFactor {
  type: 'breaking_change' | 'dependency_conflict' | 'data_migration' | 'security' | 'performance';
  severity: 'low' | 'medium' | 'high';
  description: string;
  likelihood: number; // 0-1
  impact: number; // 0-1
}

/**
 * Template Versioning System
 * Manages template versions, dependencies, and migrations
 */
export class TemplateVersioningSystem {
  private versions: Map<string, TemplateVersionInfo[]> = new Map();
  private currentVersions: Map<string, string> = new Map();
  private versionTags: Map<string, Map<string, string>> = new Map(); // templateId -> tag -> version
  private migrationHistory: Map<string, MigrationPath[]> = new Map();

  /**
   * Create a new version of a template
   */
  async createVersion(
    templateId: string,
    options: VersionCreateOptions
  ): Promise<TemplateVersionInfo> {
    const existingVersions = this.versions.get(templateId) || [];
    const currentVersion = this.currentVersions.get(templateId) || '0.0.0';
    
    // Determine version number
    const newVersion = options.version || this.calculateNextVersion(currentVersion, options.changelog);
    
    // Validate version
    if (!semver.valid(newVersion)) {
      throw new Error(`Invalid version format: ${newVersion}`);
    }

    // Check if version already exists
    if (existingVersions.some(v => v.version === newVersion)) {
      throw new Error(`Version ${newVersion} already exists for template ${templateId}`);
    }

    // Validate dependencies
    await this.validateDependencies(options.dependencies || []);

    // Create version info
    const versionInfo: TemplateVersionInfo = {
      id: `${templateId}-${newVersion}`,
      templateId,
      version: newVersion,
      previousVersion: currentVersion !== '0.0.0' ? currentVersion : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: options.author,
      authorEmail: options.authorEmail,
      changelog: options.changelog,
      compatibility: await this.calculateCompatibility(templateId, newVersion, options.changelog),
      dependencies: options.dependencies || [],
      assets: await this.catalogAssets(templateId, newVersion),
      metadata: await this.generateMetadata(templateId, newVersion),
      rollbackPoint: options.rollbackPoint || false,
      stable: options.stable || false,
      deprecated: false,
      migrationPath: options.migrationPath
    };

    // Store version
    existingVersions.push(versionInfo);
    this.versions.set(templateId, existingVersions);
    this.currentVersions.set(templateId, newVersion);

    // Store migration path if provided
    if (options.migrationPath) {
      const migrations = this.migrationHistory.get(templateId) || [];
      migrations.push(options.migrationPath);
      this.migrationHistory.set(templateId, migrations);
    }

    return versionInfo;
  }

  /**
   * Get version history for a template
   */
  async getVersionHistory(templateId: string): Promise<TemplateVersionInfo[]> {
    return this.versions.get(templateId) || [];
  }

  /**
   * Get specific version info
   */
  async getVersion(templateId: string, version: string): Promise<TemplateVersionInfo | null> {
    const versions = this.versions.get(templateId) || [];
    return versions.find(v => v.version === version) || null;
  }

  /**
   * Get current version
   */
  async getCurrentVersion(templateId: string): Promise<TemplateVersionInfo | null> {
    const currentVersion = this.currentVersions.get(templateId);
    if (!currentVersion) return null;
    
    return this.getVersion(templateId, currentVersion);
  }

  /**
   * Get latest stable version
   */
  async getLatestStableVersion(templateId: string): Promise<TemplateVersionInfo | null> {
    const versions = this.versions.get(templateId) || [];
    const stableVersions = versions.filter(v => v.stable && !v.deprecated);
    
    if (stableVersions.length === 0) return null;
    
    // Sort by semantic version
    stableVersions.sort((a, b) => semver.compare(b.version, a.version));
    return stableVersions[0];
  }

  /**
   * Compare two versions
   */
  async compareVersions(
    templateId: string,
    version1: string,
    version2: string
  ): Promise<VersionComparisonResult> {
    const v1 = await this.getVersion(templateId, version1);
    const v2 = await this.getVersion(templateId, version2);

    if (!v1 || !v2) {
      throw new Error('One or both versions not found');
    }

    const differences = this.calculateDifferences(v1, v2);
    const compatibility = this.analyzeCompatibility(v1, v2);
    const migrationRequired = this.isMigrationRequired(v1, v2);
    const migrationComplexity = this.assessMigrationComplexity(v1, v2);
    const estimatedMigrationTime = this.estimateMigrationTime(v1, v2);
    const riskAssessment = this.assessRisk(v1, v2);

    return {
      current: v1,
      target: v2,
      differences,
      compatibility,
      migrationRequired,
      migrationComplexity,
      estimatedMigrationTime,
      riskAssessment
    };
  }

  /**
   * Rollback to a previous version
   */
  async rollbackVersion(
    templateId: string,
    options: VersionRollbackOptions
  ): Promise<TemplateVersionInfo> {
    const targetVersion = await this.getVersion(templateId, options.targetVersion);
    if (!targetVersion) {
      throw new Error(`Target version ${options.targetVersion} not found`);
    }

    const currentVersion = await this.getCurrentVersion(templateId);
    if (!currentVersion) {
      throw new Error('No current version found');
    }

    // Validate rollback safety
    if (!options.force && !this.isRollbackSafe(currentVersion, targetVersion)) {
      throw new Error('Rollback may cause data loss. Use force option to proceed.');
    }

    // Backup current version if requested
    if (options.backupCurrent) {
      await this.createBackup(templateId, currentVersion.version);
    }

    // Execute rollback migration if needed
    const migrationPath = await this.getMigrationPath(currentVersion.version, options.targetVersion);
    if (migrationPath) {
      await this.executeMigration(templateId, migrationPath);
    }

    // Update current version
    this.currentVersions.set(templateId, options.targetVersion);

    // Log rollback
    await this.logVersionChange(templateId, 'rollback', {
      from: currentVersion.version,
      to: options.targetVersion,
      reason: options.reason,
      author: options.author
    });

    return targetVersion;
  }

  /**
   * Tag a version
   */
  async tagVersion(templateId: string, version: string, tag: string): Promise<void> {
    const versionInfo = await this.getVersion(templateId, version);
    if (!versionInfo) {
      throw new Error(`Version ${version} not found`);
    }

    let templateTags = this.versionTags.get(templateId);
    if (!templateTags) {
      templateTags = new Map();
      this.versionTags.set(templateId, templateTags);
    }

    templateTags.set(tag, version);
  }

  /**
   * Get version by tag
   */
  async getVersionByTag(templateId: string, tag: string): Promise<TemplateVersionInfo | null> {
    const templateTags = this.versionTags.get(templateId);
    if (!templateTags) return null;

    const version = templateTags.get(tag);
    if (!version) return null;

    return this.getVersion(templateId, version);
  }

  /**
   * Deprecate a version
   */
  async deprecateVersion(templateId: string, version: string, reason: string): Promise<void> {
    const versionInfo = await this.getVersion(templateId, version);
    if (!versionInfo) {
      throw new Error(`Version ${version} not found`);
    }

    versionInfo.deprecated = true;
    versionInfo.deprecationReason = reason;
    versionInfo.updatedAt = new Date();
  }

  /**
   * Get available updates for a template
   */
  async getAvailableUpdates(templateId: string): Promise<TemplateVersionInfo[]> {
    const currentVersion = this.currentVersions.get(templateId);
    if (!currentVersion) return [];

    const versions = this.versions.get(templateId) || [];
    return versions.filter(v => 
      semver.gt(v.version, currentVersion) && 
      !v.deprecated && 
      v.stable
    );
  }

  /**
   * Check if a version is compatible with current platform
   */
  async isVersionCompatible(templateId: string, version: string): Promise<boolean> {
    const versionInfo = await this.getVersion(templateId, version);
    if (!versionInfo) return false;

    // Check platform compatibility
    const platformVersion = process.version;
    const nodeVersion = versionInfo.compatibility.nodeVersion;
    
    return semver.satisfies(platformVersion, nodeVersion);
  }

  /**
   * Get dependency tree for a version
   */
  async getDependencyTree(templateId: string, version: string): Promise<DependencyTree> {
    const versionInfo = await this.getVersion(templateId, version);
    if (!versionInfo) {
      throw new Error(`Version ${version} not found`);
    }

    return this.buildDependencyTree(versionInfo.dependencies);
  }

  /**
   * Validate version dependencies
   */
  async validateDependencies(dependencies: TemplateDependency[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const dep of dependencies) {
      const result = await this.validateDependency(dep);
      results.push(result);
    }

    return results;
  }

  /**
   * Clean up old versions (keep only specified number of versions)
   */
  async cleanupVersions(templateId: string, keepCount: number = 10): Promise<number> {
    const versions = this.versions.get(templateId) || [];
    if (versions.length <= keepCount) return 0;

    // Sort by creation date (newest first)
    versions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Keep stable versions, rollback points, and recent versions
    const toKeep = versions.filter((v, index) => 
      index < keepCount || v.stable || v.rollbackPoint
    );

    const toRemove = versions.filter(v => !toKeep.includes(v));
    
    // Update versions map
    this.versions.set(templateId, toKeep);

    return toRemove.length;
  }

  // Private helper methods

  private calculateNextVersion(currentVersion: string, changelog: VersionChangeEntry[]): string {
    const hasBreaking = changelog.some(c => c.breakingChange);
    const hasFeatures = changelog.some(c => c.category === 'feature');
    
    if (hasBreaking) {
      return semver.inc(currentVersion, 'major') || '1.0.0';
    } else if (hasFeatures) {
      return semver.inc(currentVersion, 'minor') || '0.1.0';
    } else {
      return semver.inc(currentVersion, 'patch') || '0.0.1';
    }
  }

  private async calculateCompatibility(
    templateId: string,
    version: string,
    changelog: VersionChangeEntry[]
  ): Promise<VersionCompatibility> {
    const hasBreaking = changelog.some(c => c.breakingChange);
    const previousVersion = this.currentVersions.get(templateId) || '0.0.0';
    
    return {
      minVersion: hasBreaking ? version : previousVersion,
      maxVersion: version,
      platformVersion: '>=1.0.0',
      nodeVersion: '>=16.0.0',
      breaking: hasBreaking,
      backwardCompatible: !hasBreaking,
      forwardCompatible: true,
      deprecatedFeatures: changelog
        .filter(c => c.type === 'deprecated')
        .map(c => c.component || c.description),
      removedFeatures: changelog
        .filter(c => c.type === 'removed')
        .map(c => c.component || c.description),
      newFeatures: changelog
        .filter(c => c.type === 'added' && c.category === 'feature')
        .map(c => c.component || c.description)
    };
  }

  private async catalogAssets(templateId: string, version: string): Promise<VersionAsset[]> {
    // This would scan the template directory and catalog all assets
    // For now, return empty array
    return [];
  }

  private async generateMetadata(templateId: string, version: string): Promise<VersionMetadata> {
    return {
      size: 0,
      performanceMetrics: {
        bundleSize: 0,
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        score: 100
      },
      securityScan: {
        vulnerabilities: [],
        score: 100,
        lastScan: new Date(),
        scannerVersion: '1.0.0'
      },
      qualityScore: 100,
      testCoverage: 100,
      buildTime: 0,
      tags: [],
      notes: ''
    };
  }

  private calculateDifferences(v1: TemplateVersionInfo, v2: TemplateVersionInfo): VersionDifference[] {
    const differences: VersionDifference[] = [];

    // Compare changelog entries
    v2.changelog.forEach(change => {
      differences.push({
        type: change.type,
        category: change.category,
        path: change.component || 'general',
        newValue: change.description,
        impact: change.breakingChange ? 'breaking' : 
                change.category === 'feature' ? 'feature' :
                change.category === 'bugfix' ? 'fix' : 'style',
        description: change.description
      });
    });

    return differences;
  }

  private analyzeCompatibility(v1: TemplateVersionInfo, v2: TemplateVersionInfo): CompatibilityAnalysis {
    const issues: CompatibilityIssue[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check for breaking changes
    const breakingChanges = v2.changelog.filter(c => c.breakingChange);
    breakingChanges.forEach(change => {
      issues.push({
        type: 'breaking',
        severity: 'critical',
        component: change.component || 'general',
        description: change.description,
        resolution: 'Manual migration required'
      });
    });

    // Check for deprecated features
    const deprecatedFeatures = v2.compatibility.deprecatedFeatures;
    if (deprecatedFeatures.length > 0) {
      warnings.push(`The following features are deprecated: ${deprecatedFeatures.join(', ')}`);
      recommendations.push('Plan migration away from deprecated features');
    }

    return {
      compatible: issues.length === 0,
      issues,
      warnings,
      recommendations
    };
  }

  private isMigrationRequired(v1: TemplateVersionInfo, v2: TemplateVersionInfo): boolean {
    return v2.changelog.some(c => c.migrationRequired) || v2.compatibility.breaking;
  }

  private assessMigrationComplexity(v1: TemplateVersionInfo, v2: TemplateVersionInfo): 'simple' | 'moderate' | 'complex' {
    const breakingChanges = v2.changelog.filter(c => c.breakingChange).length;
    const migrationRequired = v2.changelog.filter(c => c.migrationRequired).length;
    
    if (breakingChanges === 0 && migrationRequired === 0) return 'simple';
    if (breakingChanges <= 2 && migrationRequired <= 3) return 'moderate';
    return 'complex';
  }

  private estimateMigrationTime(v1: TemplateVersionInfo, v2: TemplateVersionInfo): number {
    const complexity = this.assessMigrationComplexity(v1, v2);
    const baseTime = {
      simple: 5,
      moderate: 30,
      complex: 120
    };
    
    return baseTime[complexity];
  }

  private assessRisk(v1: TemplateVersionInfo, v2: TemplateVersionInfo): RiskAssessment {
    const factors: RiskFactor[] = [];
    
    // Check for breaking changes
    const breakingChanges = v2.changelog.filter(c => c.breakingChange);
    if (breakingChanges.length > 0) {
      factors.push({
        type: 'breaking_change',
        severity: 'high',
        description: `${breakingChanges.length} breaking changes detected`,
        likelihood: 1,
        impact: 0.8
      });
    }

    // Check for security vulnerabilities
    const vulnerabilities = v2.metadata.securityScan.vulnerabilities;
    if (vulnerabilities.length > 0) {
      factors.push({
        type: 'security',
        severity: 'high',
        description: `${vulnerabilities.length} security vulnerabilities found`,
        likelihood: 0.7,
        impact: 0.9
      });
    }

    // Calculate overall risk level
    const maxRisk = Math.max(...factors.map(f => f.likelihood * f.impact), 0);
    const level = maxRisk > 0.7 ? 'high' : maxRisk > 0.4 ? 'medium' : 'low';

    return {
      level,
      factors,
      mitigation: [
        'Test thoroughly in development environment',
        'Create backup before migration',
        'Plan rollback strategy'
      ],
      recommendation: level === 'high' ? 'Proceed with caution' : 'Safe to proceed'
    };
  }

  private isRollbackSafe(current: TemplateVersionInfo, target: TemplateVersionInfo): boolean {
    // Check if rolling back would cause data loss
    const dataChanges = current.changelog.filter(c => 
      c.category === 'feature' && c.type === 'added' && c.description.includes('data')
    );
    
    return dataChanges.length === 0;
  }

  private async createBackup(templateId: string, version: string): Promise<void> {
    // Implementation would create a backup of the current version
    console.log(`Creating backup for template ${templateId} version ${version}`);
  }

  private async getMigrationPath(fromVersion: string, toVersion: string): Promise<MigrationPath | null> {
    // Implementation would find migration path between versions
    return null;
  }

  private async executeMigration(templateId: string, migrationPath: MigrationPath): Promise<void> {
    // Implementation would execute migration steps
    console.log(`Executing migration for template ${templateId}`);
  }

  private async logVersionChange(templateId: string, action: string, data: any): Promise<void> {
    // Implementation would log version changes for audit trail
    console.log(`Version change: ${action} for template ${templateId}`, data);
  }

  private async buildDependencyTree(dependencies: TemplateDependency[]): Promise<DependencyTree> {
    // Implementation would build complete dependency tree
    return {
      root: {
        name: 'root',
        version: '1.0.0',
        dependencies: []
      }
    };
  }

  private async validateDependency(dependency: TemplateDependency): Promise<ValidationResult> {
    return {
      valid: true,
      dependency,
      issues: [],
      warnings: []
    };
  }
}

// Additional interfaces
export interface DependencyTree {
  root: DependencyNode;
}

export interface DependencyNode {
  name: string;
  version: string;
  dependencies: DependencyNode[];
}

export interface ValidationResult {
  valid: boolean;
  dependency: TemplateDependency;
  issues: string[];
  warnings: string[];
}

// Global instance
let globalVersioningSystem: TemplateVersioningSystem | null = null;

/**
 * Get the global template versioning system instance
 */
export function getTemplateVersioningSystem(): TemplateVersioningSystem {
  if (!globalVersioningSystem) {
    globalVersioningSystem = new TemplateVersioningSystem();
  }
  return globalVersioningSystem;
}

/**
 * Initialize template versioning system
 */
export function initializeTemplateVersioning(): TemplateVersioningSystem {
  globalVersioningSystem = new TemplateVersioningSystem();
  return globalVersioningSystem;
}
