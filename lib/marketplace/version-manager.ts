/**
 * HT-035.3.2: Module Version Management System
 * 
 * Comprehensive version management with semantic versioning, update notifications,
 * and version compatibility checking per PRD requirements.
 * 
 * Features:
 * - Semantic versioning (semver) support
 * - Version constraint satisfaction
 * - Update notification system
 * - Version compatibility checking
 * - Rollback version management
 * - Version history tracking
 * - Breaking change detection
 */

import { z } from 'zod';

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

export const SemanticVersionSchema = z.object({
  major: z.number().min(0),
  minor: z.number().min(0),
  patch: z.number().min(0),
  prerelease: z.string().optional(),
  build: z.string().optional(),
  raw: z.string(),
});

export const VersionConstraintSchema = z.object({
  operator: z.enum(['^', '~', '>=', '<=', '>', '<', '=', '']),
  version: z.string(),
  description: z.string().optional(),
});

export const VersionInfoSchema = z.object({
  version: z.string(),
  semanticVersion: SemanticVersionSchema,
  releaseDate: z.date(),
  changelog: z.string().optional(),
  breakingChanges: z.array(z.string()).default([]),
  newFeatures: z.array(z.string()).default([]),
  bugFixes: z.array(z.string()).default([]),
  securityFixes: z.array(z.string()).default([]),
  deprecations: z.array(z.string()).default([]),
  compatibility: z.object({
    minSystemVersion: z.string().optional(),
    maxSystemVersion: z.string().optional(),
    requiredModules: z.array(z.string()).default([]),
    conflictingModules: z.array(z.string()).default([]),
  }),
  downloadUrl: z.string().optional(),
  checksum: z.string().optional(),
  size: z.number().optional(),
  metadata: z.record(z.unknown()).default({}),
});

export const UpdateNotificationSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  tenantId: z.string(),
  currentVersion: z.string(),
  availableVersion: z.string(),
  updateType: z.enum(['patch', 'minor', 'major']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  notificationDate: z.date(),
  acknowledged: z.boolean().default(false),
  acknowledgedAt: z.date().optional(),
  acknowledgedBy: z.string().optional(),
  autoUpdate: z.boolean().default(false),
  scheduledUpdate: z.date().optional(),
  metadata: z.record(z.unknown()).default({}),
});

export const VersionHistorySchema = z.object({
  moduleId: z.string(),
  tenantId: z.string(),
  version: z.string(),
  action: z.enum(['install', 'update', 'rollback', 'uninstall']),
  fromVersion: z.string().optional(),
  toVersion: z.string().optional(),
  timestamp: z.date(),
  success: z.boolean(),
  rollbackId: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
});

export const CompatibilityCheckSchema = z.object({
  moduleId: z.string(),
  currentVersion: z.string(),
  targetVersion: z.string(),
  compatible: z.boolean(),
  issues: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  breakingChanges: z.array(z.string()).default([]),
  migrationRequired: z.boolean().default(false),
  migrationSteps: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({}),
});

// Type exports
export type SemanticVersion = z.infer<typeof SemanticVersionSchema>;
export type VersionConstraint = z.infer<typeof VersionConstraintSchema>;
export type VersionInfo = z.infer<typeof VersionInfoSchema>;
export type UpdateNotification = z.infer<typeof UpdateNotificationSchema>;
export type VersionHistory = z.infer<typeof VersionHistorySchema>;
export type CompatibilityCheck = z.infer<typeof CompatibilityCheckSchema>;

// =============================================================================
// VERSION MANAGER CLASS
// =============================================================================

export class VersionManager {
  private versionCache: Map<string, VersionInfo[]> = new Map();
  private updateNotifications: Map<string, UpdateNotification[]> = new Map();
  private versionHistory: Map<string, VersionHistory[]> = new Map();
  private compatibilityCache: Map<string, CompatibilityCheck> = new Map();

  constructor() {
    this.initializeDefaultVersions();
  }

  /**
   * Parse semantic version string
   */
  parseSemanticVersion(version: string): SemanticVersion {
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;
    const match = version.match(semverRegex);

    if (!match) {
      throw new Error(`Invalid semantic version: ${version}`);
    }

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4],
      build: match[5],
      raw: version,
    };
  }

  /**
   * Compare two semantic versions
   */
  compareVersions(version1: string, version2: string): number {
    const v1 = this.parseSemanticVersion(version1);
    const v2 = this.parseSemanticVersion(version2);

    // Compare major version
    if (v1.major !== v2.major) {
      return v1.major - v2.major;
    }

    // Compare minor version
    if (v1.minor !== v2.minor) {
      return v1.minor - v2.minor;
    }

    // Compare patch version
    if (v1.patch !== v2.patch) {
      return v1.patch - v2.patch;
    }

    // Compare prerelease versions
    if (v1.prerelease && v2.prerelease) {
      return v1.prerelease.localeCompare(v2.prerelease);
    } else if (v1.prerelease) {
      return -1; // prerelease is lower than release
    } else if (v2.prerelease) {
      return 1; // release is higher than prerelease
    }

    return 0; // versions are equal
  }

  /**
   * Check if a version satisfies a constraint
   */
  satisfiesConstraint(version: string, constraint: VersionConstraint): boolean {
    const semver = this.parseSemanticVersion(version);
    const constraintSemver = this.parseSemanticVersion(constraint.version);

    switch (constraint.operator) {
      case '^':
        return this.satisfiesCaret(semver, constraintSemver);
      case '~':
        return this.satisfiesTilde(semver, constraintSemver);
      case '>=':
        return this.compareVersions(version, constraint.version) >= 0;
      case '<=':
        return this.compareVersions(version, constraint.version) <= 0;
      case '>':
        return this.compareVersions(version, constraint.version) > 0;
      case '<':
        return this.compareVersions(version, constraint.version) < 0;
      case '=':
      case '':
        return this.compareVersions(version, constraint.version) === 0;
      default:
        return false;
    }
  }

  /**
   * Get available versions for a module
   */
  async getAvailableVersions(moduleId: string): Promise<VersionInfo[]> {
    const cached = this.versionCache.get(moduleId);
    if (cached && cached.length > 0) {
      return cached;
    }

    // Mock implementation - in real app, this would fetch from module registry
    const versions: VersionInfo[] = [
      {
        version: '1.0.0',
        semanticVersion: this.parseSemanticVersion('1.0.0'),
        releaseDate: new Date('2024-01-01'),
        changelog: 'Initial release',
        breakingChanges: [],
        newFeatures: ['Initial feature set'],
        bugFixes: [],
        securityFixes: [],
        deprecations: [],
        compatibility: {
          minSystemVersion: '1.0.0',
          requiredModules: [],
          conflictingModules: [],
        },
        downloadUrl: `https://modules.example.com/${moduleId}/1.0.0`,
        checksum: 'abc123',
        size: 1024,
        metadata: {},
      },
      {
        version: '1.1.0',
        semanticVersion: this.parseSemanticVersion('1.1.0'),
        releaseDate: new Date('2024-02-01'),
        changelog: 'Minor update with new features',
        breakingChanges: [],
        newFeatures: ['New feature A', 'New feature B'],
        bugFixes: ['Fixed issue X'],
        securityFixes: [],
        deprecations: [],
        compatibility: {
          minSystemVersion: '1.0.0',
          requiredModules: [],
          conflictingModules: [],
        },
        downloadUrl: `https://modules.example.com/${moduleId}/1.1.0`,
        checksum: 'def456',
        size: 1536,
        metadata: {},
      },
      {
        version: '2.0.0',
        semanticVersion: this.parseSemanticVersion('2.0.0'),
        releaseDate: new Date('2024-03-01'),
        changelog: 'Major update with breaking changes',
        breakingChanges: ['API change 1', 'API change 2'],
        newFeatures: ['Major feature X', 'Major feature Y'],
        bugFixes: ['Fixed issue Y', 'Fixed issue Z'],
        securityFixes: ['Security fix 1'],
        deprecations: ['Deprecated feature A'],
        compatibility: {
          minSystemVersion: '1.1.0',
          requiredModules: ['dependency-module'],
          conflictingModules: ['conflicting-module'],
        },
        downloadUrl: `https://modules.example.com/${moduleId}/2.0.0`,
        checksum: 'ghi789',
        size: 2048,
        metadata: {},
      },
    ];

    this.versionCache.set(moduleId, versions);
    return versions;
  }

  /**
   * Get latest version for a module
   */
  async getLatestVersion(moduleId: string, constraint?: VersionConstraint): Promise<VersionInfo | null> {
    const versions = await this.getAvailableVersions(moduleId);
    
    if (versions.length === 0) {
      return null;
    }

    // Sort versions by semantic version (latest first)
    const sortedVersions = versions.sort((a, b) => 
      this.compareVersions(b.version, a.version)
    );

    // If no constraint, return the latest
    if (!constraint) {
      return sortedVersions[0];
    }

    // Find the latest version that satisfies the constraint
    for (const version of sortedVersions) {
      if (this.satisfiesConstraint(version.version, constraint)) {
        return version;
      }
    }

    return null;
  }

  /**
   * Check for available updates
   */
  async checkForUpdates(
    moduleId: string,
    tenantId: string,
    currentVersion: string
  ): Promise<UpdateNotification[]> {
    const notifications: UpdateNotification[] = [];
    const availableVersions = await this.getAvailableVersions(moduleId);
    
    // Find versions newer than current
    const newerVersions = availableVersions.filter(version => 
      this.compareVersions(version.version, currentVersion) > 0
    );

    for (const version of newerVersions) {
      const updateType = this.getUpdateType(currentVersion, version.version);
      const priority = this.getUpdatePriority(version);
      
      const notification: UpdateNotification = {
        id: this.generateNotificationId(),
        moduleId,
        tenantId,
        currentVersion,
        availableVersion: version.version,
        updateType,
        priority,
        notificationDate: new Date(),
        acknowledged: false,
        autoUpdate: false,
        metadata: {
          versionInfo: version,
          breakingChanges: version.breakingChanges,
          newFeatures: version.newFeatures,
        },
      };

      notifications.push(notification);
    }

    // Store notifications
    const key = `${moduleId}-${tenantId}`;
    const existing = this.updateNotifications.get(key) || [];
    existing.push(...notifications);
    this.updateNotifications.set(key, existing);

    return notifications;
  }

  /**
   * Check version compatibility
   */
  async checkCompatibility(
    moduleId: string,
    currentVersion: string,
    targetVersion: string
  ): Promise<CompatibilityCheck> {
    const cacheKey = `${moduleId}-${currentVersion}-${targetVersion}`;
    const cached = this.compatibilityCache.get(cacheKey);
    
    if (cached && Date.now() - cached.metadata.timestamp.getTime() < 300000) { // 5 minutes
      return cached;
    }

    const check: CompatibilityCheck = {
      moduleId,
      currentVersion,
      targetVersion,
      compatible: true,
      issues: [],
      warnings: [],
      recommendations: [],
      breakingChanges: [],
      migrationRequired: false,
      migrationSteps: [],
      metadata: {
        timestamp: new Date(),
      },
    };

    try {
      const versions = await this.getAvailableVersions(moduleId);
      const currentVersionInfo = versions.find(v => v.version === currentVersion);
      const targetVersionInfo = versions.find(v => v.version === targetVersion);

      if (!currentVersionInfo || !targetVersionInfo) {
        check.compatible = false;
        check.issues.push('Version information not found');
        return check;
      }

      // Check for breaking changes
      if (targetVersionInfo.breakingChanges.length > 0) {
        check.breakingChanges = targetVersionInfo.breakingChanges;
        check.migrationRequired = true;
        check.warnings.push('This update contains breaking changes');
      }

      // Check system version compatibility
      if (targetVersionInfo.compatibility.minSystemVersion) {
        // Mock system version check
        const systemVersion = '1.0.0'; // In real app, this would be the actual system version
        if (this.compareVersions(systemVersion, targetVersionInfo.compatibility.minSystemVersion) < 0) {
          check.compatible = false;
          check.issues.push(`System version ${systemVersion} is below minimum required ${targetVersionInfo.compatibility.minSystemVersion}`);
        }
      }

      // Check for conflicting modules
      if (targetVersionInfo.compatibility.conflictingModules.length > 0) {
        check.warnings.push(`This version conflicts with: ${targetVersionInfo.compatibility.conflictingModules.join(', ')}`);
      }

      // Check for required modules
      if (targetVersionInfo.compatibility.requiredModules.length > 0) {
        check.recommendations.push(`Ensure these modules are installed: ${targetVersionInfo.compatibility.requiredModules.join(', ')}`);
      }

      // Generate migration steps if needed
      if (check.migrationRequired) {
        check.migrationSteps = await this.generateMigrationSteps(moduleId, currentVersion, targetVersion);
      }

      // Cache the result
      this.compatibilityCache.set(cacheKey, check);

      return check;

    } catch (error) {
      check.compatible = false;
      check.issues.push(error instanceof Error ? error.message : String(error));
      return check;
    }
  }

  /**
   * Record version history
   */
  async recordVersionHistory(
    moduleId: string,
    tenantId: string,
    action: 'install' | 'update' | 'rollback' | 'uninstall',
    version: string,
    fromVersion?: string,
    success: boolean = true,
    rollbackId?: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    const history: VersionHistory = {
      moduleId,
      tenantId,
      version,
      action,
      fromVersion,
      toVersion: version,
      timestamp: new Date(),
      success,
      rollbackId,
      metadata,
    };

    const key = `${moduleId}-${tenantId}`;
    const existing = this.versionHistory.get(key) || [];
    existing.push(history);
    this.versionHistory.set(key, existing);
  }

  /**
   * Get version history for a module
   */
  async getVersionHistory(moduleId: string, tenantId: string): Promise<VersionHistory[]> {
    const key = `${moduleId}-${tenantId}`;
    return this.versionHistory.get(key) || [];
  }

  /**
   * Get update notifications for a tenant
   */
  async getUpdateNotifications(tenantId: string): Promise<UpdateNotification[]> {
    const notifications: UpdateNotification[] = [];
    
    for (const [key, tenantNotifications] of this.updateNotifications) {
      if (key.endsWith(`-${tenantId}`)) {
        notifications.push(...tenantNotifications);
      }
    }

    return notifications.sort((a, b) => 
      b.notificationDate.getTime() - a.notificationDate.getTime()
    );
  }

  /**
   * Acknowledge update notification
   */
  async acknowledgeUpdateNotification(
    notificationId: string,
    acknowledgedBy: string,
    autoUpdate: boolean = false,
    scheduledUpdate?: Date
  ): Promise<boolean> {
    for (const [key, notifications] of this.updateNotifications) {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.acknowledged = true;
        notification.acknowledgedAt = new Date();
        notification.acknowledgedBy = acknowledgedBy;
        notification.autoUpdate = autoUpdate;
        notification.scheduledUpdate = scheduledUpdate;
        return true;
      }
    }
    return false;
  }

  /**
   * Get version statistics
   */
  async getVersionStatistics(): Promise<{
    totalVersions: number;
    totalModules: number;
    averageVersionsPerModule: number;
    updateNotifications: number;
    acknowledgedNotifications: number;
    pendingUpdates: number;
    versionDistribution: Record<string, number>;
  }> {
    const totalVersions = Array.from(this.versionCache.values())
      .reduce((sum, versions) => sum + versions.length, 0);
    
    const totalModules = this.versionCache.size;
    
    const averageVersionsPerModule = totalModules > 0 ? totalVersions / totalModules : 0;
    
    const allNotifications = Array.from(this.updateNotifications.values()).flat();
    const updateNotifications = allNotifications.length;
    const acknowledgedNotifications = allNotifications.filter(n => n.acknowledged).length;
    const pendingUpdates = updateNotifications - acknowledgedNotifications;

    // Calculate version distribution
    const versionDistribution: Record<string, number> = {};
    for (const versions of this.versionCache.values()) {
      for (const version of versions) {
        const majorVersion = version.semanticVersion.major.toString();
        versionDistribution[majorVersion] = (versionDistribution[majorVersion] || 0) + 1;
      }
    }

    return {
      totalVersions,
      totalModules,
      averageVersionsPerModule,
      updateNotifications,
      acknowledgedNotifications,
      pendingUpdates,
      versionDistribution,
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private satisfiesCaret(semver: SemanticVersion, constraint: SemanticVersion): boolean {
    // ^ allows changes that do not modify the left-most non-zero digit
    if (constraint.major > 0) {
      return semver.major === constraint.major;
    } else if (constraint.minor > 0) {
      return semver.major === constraint.major && semver.minor === constraint.minor;
    } else {
      return semver.major === constraint.major && semver.minor === constraint.minor && semver.patch === constraint.patch;
    }
  }

  private satisfiesTilde(semver: SemanticVersion, constraint: SemanticVersion): boolean {
    // ~ allows patch-level changes if a minor version is specified
    if (constraint.minor !== undefined) {
      return semver.major === constraint.major && semver.minor === constraint.minor;
    } else {
      return semver.major === constraint.major;
    }
  }

  private getUpdateType(currentVersion: string, targetVersion: string): 'patch' | 'minor' | 'major' {
    const current = this.parseSemanticVersion(currentVersion);
    const target = this.parseSemanticVersion(targetVersion);

    if (target.major > current.major) {
      return 'major';
    } else if (target.minor > current.minor) {
      return 'minor';
    } else {
      return 'patch';
    }
  }

  private getUpdatePriority(version: VersionInfo): 'low' | 'medium' | 'high' | 'critical' {
    if (version.securityFixes.length > 0) {
      return 'critical';
    } else if (version.breakingChanges.length > 0) {
      return 'high';
    } else if (version.newFeatures.length > 0) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private async generateMigrationSteps(
    moduleId: string,
    currentVersion: string,
    targetVersion: string
  ): Promise<string[]> {
    // Mock implementation - in real app, this would generate actual migration steps
    return [
      'Backup current configuration',
      'Review breaking changes documentation',
      'Update configuration files',
      'Test functionality after update',
      'Update dependent modules if needed',
    ];
  }

  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeDefaultVersions(): void {
    // Initialize with some mock versions for testing
    this.versionCache.set('test-module', [
      {
        version: '1.0.0',
        semanticVersion: this.parseSemanticVersion('1.0.0'),
        releaseDate: new Date('2024-01-01'),
        changelog: 'Initial release',
        breakingChanges: [],
        newFeatures: ['Initial feature set'],
        bugFixes: [],
        securityFixes: [],
        deprecations: [],
        compatibility: {
          minSystemVersion: '1.0.0',
          requiredModules: [],
          conflictingModules: [],
        },
        downloadUrl: 'https://modules.example.com/test-module/1.0.0',
        checksum: 'abc123',
        size: 1024,
        metadata: {},
      },
    ]);
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const versionManager = new VersionManager();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function parseSemanticVersion(version: string): SemanticVersion {
  return versionManager.parseSemanticVersion(version);
}

export function compareVersions(version1: string, version2: string): number {
  return versionManager.compareVersions(version1, version2);
}

export function satisfiesConstraint(version: string, constraint: VersionConstraint): boolean {
  return versionManager.satisfiesConstraint(version, constraint);
}

export async function getAvailableVersions(moduleId: string): Promise<VersionInfo[]> {
  return versionManager.getAvailableVersions(moduleId);
}

export async function getLatestVersion(moduleId: string, constraint?: VersionConstraint): Promise<VersionInfo | null> {
  return versionManager.getLatestVersion(moduleId, constraint);
}

export async function checkForUpdates(
  moduleId: string,
  tenantId: string,
  currentVersion: string
): Promise<UpdateNotification[]> {
  return versionManager.checkForUpdates(moduleId, tenantId, currentVersion);
}

export async function checkCompatibility(
  moduleId: string,
  currentVersion: string,
  targetVersion: string
): Promise<CompatibilityCheck> {
  return versionManager.checkCompatibility(moduleId, currentVersion, targetVersion);
}

export async function recordVersionHistory(
  moduleId: string,
  tenantId: string,
  action: 'install' | 'update' | 'rollback' | 'uninstall',
  version: string,
  fromVersion?: string,
  success?: boolean,
  rollbackId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  return versionManager.recordVersionHistory(moduleId, tenantId, action, version, fromVersion, success, rollbackId, metadata);
}

export async function getVersionHistory(moduleId: string, tenantId: string): Promise<VersionHistory[]> {
  return versionManager.getVersionHistory(moduleId, tenantId);
}

export async function getUpdateNotifications(tenantId: string): Promise<UpdateNotification[]> {
  return versionManager.getUpdateNotifications(tenantId);
}

export async function acknowledgeUpdateNotification(
  notificationId: string,
  acknowledgedBy: string,
  autoUpdate?: boolean,
  scheduledUpdate?: Date
): Promise<boolean> {
  return versionManager.acknowledgeUpdateNotification(notificationId, acknowledgedBy, autoUpdate, scheduledUpdate);
}

export async function getVersionStatistics() {
  return versionManager.getVersionStatistics();
}
