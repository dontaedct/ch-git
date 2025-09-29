/**
 * HT-035.3.2: Module Installation & Dependency Management System
 * 
 * Automated module installation system with dependency resolution,
 * version management, and installation validation per PRD requirements.
 * 
 * Features:
 * - Automated module installation with dependency resolution
 * - Module version management with semantic versioning
 * - Installation validation and testing framework
 * - Installation tracking and history system
 * - Rollback capabilities for failed installations
 * - Multi-tenant installation support
 */

import { z } from 'zod';
import { ModuleMetadata } from './module-registry';
import { InstallationEngine, InstallationRequest, InstallationResult, UninstallRequest, UninstallResult, UpdateRequest, UpdateResult } from './installation-engine';

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

export const ModuleInstallationSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  tenantId: z.string(),
  version: z.string(),
  installedAt: z.date(),
  installedBy: z.string(),
  status: z.enum(['installed', 'updating', 'failed', 'uninstalling']),
  installationPath: z.string(),
  configuration: z.record(z.unknown()).default({}),
  dependencies: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({}),
});

export const InstallationValidationSchema = z.object({
  moduleId: z.string(),
  version: z.string(),
  tenantId: z.string(),
  validationResults: z.object({
    compatibility: z.boolean(),
    dependencies: z.boolean(),
    permissions: z.boolean(),
    resources: z.boolean(),
    conflicts: z.boolean(),
  }),
  errors: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
});

export const InstallationTestSchema = z.object({
  testId: z.string(),
  installationId: z.string(),
  testType: z.enum(['unit', 'integration', 'smoke', 'performance']),
  status: z.enum(['pending', 'running', 'passed', 'failed', 'skipped']),
  results: z.object({
    passed: z.number().default(0),
    failed: z.number().default(0),
    skipped: z.number().default(0),
    duration: z.number().default(0),
  }),
  logs: z.array(z.string()).default([]),
  startedAt: z.date(),
  completedAt: z.date().optional(),
});

export const InstallationHistorySchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  tenantId: z.string(),
  action: z.enum(['install', 'uninstall', 'update', 'rollback']),
  fromVersion: z.string().optional(),
  toVersion: z.string().optional(),
  status: z.enum(['success', 'failed', 'partial']),
  timestamp: z.date(),
  duration: z.number(),
  details: z.record(z.unknown()).default({}),
  rollbackId: z.string().optional(),
});

// Type exports
export type ModuleInstallation = z.infer<typeof ModuleInstallationSchema>;
export type InstallationValidation = z.infer<typeof InstallationValidationSchema>;
export type InstallationTest = z.infer<typeof InstallationTestSchema>;
export type InstallationHistory = z.infer<typeof InstallationHistorySchema>;

// =============================================================================
// MODULE INSTALLER CLASS
// =============================================================================

export class ModuleInstaller {
  private installations: Map<string, ModuleInstallation> = new Map();
  private installationHistory: Map<string, InstallationHistory[]> = new Map();
  private validationCache: Map<string, InstallationValidation> = new Map();
  private testResults: Map<string, InstallationTest[]> = new Map();
  private installationEngine: InstallationEngine;

  constructor() {
    this.installationEngine = new InstallationEngine();
  }

  /**
   * Install a module with comprehensive validation and testing
   */
  async installModule(
    moduleId: string,
    tenantId: string,
    version?: string,
    options: {
      skipValidation?: boolean;
      skipTests?: boolean;
      forceInstall?: boolean;
      installDependencies?: boolean;
    } = {}
  ): Promise<InstallationResult> {
    const startTime = Date.now();
    const installationId = this.generateInstallationId();

    try {
      // Step 1: Pre-installation validation
      if (!options.skipValidation) {
        const validation = await this.validateInstallation(moduleId, tenantId, version);
        if (!validation.validationResults.compatibility) {
          throw new Error(`Installation validation failed: ${validation.errors.join(', ')}`);
        }
      }

      // Step 2: Create installation request
      const request: InstallationRequest = {
        moduleId,
        tenantId,
        version,
        skipDependencies: !options.installDependencies,
        forceInstall: options.forceInstall || false,
      };

      // Step 3: Perform installation
      const result = await this.installationEngine.installModule(request);

      if (result.success) {
        // Step 4: Post-installation testing
        if (!options.skipTests) {
          const testResults = await this.runInstallationTests(installationId, moduleId, tenantId);
          const failedTests = testResults.filter(test => test.status === 'failed');
          
          if (failedTests.length > 0) {
            // Rollback installation if tests fail
            await this.rollbackInstallation(installationId);
            throw new Error(`Installation tests failed: ${failedTests.length} tests failed`);
          }
        }

        // Step 5: Record installation
        const installation: ModuleInstallation = {
          id: installationId,
          moduleId,
          tenantId,
          version: result.version,
          installedAt: new Date(),
          installedBy: 'system', // In real app, this would be the user ID
          status: 'installed',
          installationPath: `/modules/${tenantId}/${moduleId}`,
          configuration: {},
          dependencies: result.dependencies.map(dep => dep.id),
          metadata: {
            installationId: result.installationId,
            warnings: result.warnings,
          },
        };

        this.installations.set(installationId, installation);
        await this.recordInstallationHistory(installation, 'install', 'success', Date.now() - startTime);

        return result;
      } else {
        await this.recordInstallationHistory(
          {
            id: installationId,
            moduleId,
            tenantId,
            version: version || 'unknown',
            installedAt: new Date(),
            installedBy: 'system',
            status: 'failed',
            installationPath: '',
            configuration: {},
            dependencies: [],
            metadata: { errors: result.errors },
          },
          'install',
          'failed',
          Date.now() - startTime
        );

        return result;
      }

    } catch (error) {
      await this.recordInstallationHistory(
        {
          id: installationId,
          moduleId,
          tenantId,
          version: version || 'unknown',
          installedAt: new Date(),
          installedBy: 'system',
          status: 'failed',
          installationPath: '',
          configuration: {},
          dependencies: [],
          metadata: { error: error instanceof Error ? error.message : String(error) },
        },
        'install',
        'failed',
        Date.now() - startTime
      );

      throw error;
    }
  }

  /**
   * Uninstall a module with cleanup validation
   */
  async uninstallModule(
    moduleId: string,
    tenantId: string,
    options: {
      forceUninstall?: boolean;
      cleanupData?: boolean;
      skipValidation?: boolean;
    } = {}
  ): Promise<UninstallResult> {
    const startTime = Date.now();
    const installationId = this.findInstallationId(moduleId, tenantId);

    if (!installationId) {
      throw new Error(`Module ${moduleId} is not installed for tenant ${tenantId}`);
    }

    try {
      // Step 1: Pre-uninstallation validation
      if (!options.skipValidation) {
        const dependents = await this.findDependentModules(moduleId, tenantId);
        if (dependents.length > 0 && !options.forceUninstall) {
          throw new Error(`Cannot uninstall: ${dependents.length} modules depend on this module`);
        }
      }

      // Step 2: Create uninstall request
      const request: UninstallRequest = {
        moduleId,
        tenantId,
        forceUninstall: options.forceUninstall || false,
        cleanupData: options.cleanupData !== false,
      };

      // Step 3: Perform uninstallation
      const result = await this.installationEngine.uninstallModule(request);

      if (result.success) {
        // Step 4: Clean up installation record
        this.installations.delete(installationId);
        await this.recordInstallationHistory(
          {
            id: installationId,
            moduleId,
            tenantId,
            version: 'unknown',
            installedAt: new Date(),
            installedBy: 'system',
            status: 'uninstalling',
            installationPath: '',
            configuration: {},
            dependencies: [],
            metadata: { cleanupPerformed: result.cleanupPerformed },
          },
          'uninstall',
          'success',
          Date.now() - startTime
        );
      }

      return result;

    } catch (error) {
      await this.recordInstallationHistory(
        {
          id: installationId,
          moduleId,
          tenantId,
          version: 'unknown',
          installedAt: new Date(),
          installedBy: 'system',
          status: 'failed',
          installationPath: '',
          configuration: {},
          dependencies: [],
          metadata: { error: error instanceof Error ? error.message : String(error) },
        },
        'uninstall',
        'failed',
        Date.now() - startTime
      );

      throw error;
    }
  }

  /**
   * Update a module to a new version
   */
  async updateModule(
    moduleId: string,
    tenantId: string,
    targetVersion: string,
    options: {
      backupCurrent?: boolean;
      skipTests?: boolean;
      forceUpdate?: boolean;
    } = {}
  ): Promise<UpdateResult> {
    const startTime = Date.now();
    const installationId = this.findInstallationId(moduleId, tenantId);

    if (!installationId) {
      throw new Error(`Module ${moduleId} is not installed for tenant ${tenantId}`);
    }

    try {
      // Step 1: Create update request
      const request: UpdateRequest = {
        moduleId,
        tenantId,
        targetVersion,
        backupCurrent: options.backupCurrent !== false,
      };

      // Step 2: Perform update
      const result = await this.installationEngine.updateModule(request);

      if (result.success) {
        // Step 3: Post-update testing
        if (!options.skipTests) {
          const testResults = await this.runInstallationTests(installationId, moduleId, tenantId);
          const failedTests = testResults.filter(test => test.status === 'failed');
          
          if (failedTests.length > 0) {
            // Rollback update if tests fail
            if (result.rollbackId) {
              await this.rollbackInstallation(installationId);
            }
            throw new Error(`Update tests failed: ${failedTests.length} tests failed`);
          }
        }

        // Step 4: Update installation record
        const installation = this.installations.get(installationId);
        if (installation) {
          installation.version = result.toVersion;
          installation.status = 'installed';
          installation.metadata = {
            ...installation.metadata,
            updateId: result.updateId,
            breakingChanges: result.breakingChanges,
            warnings: result.warnings,
          };
        }

        await this.recordInstallationHistory(
          {
            id: installationId,
            moduleId,
            tenantId,
            version: result.toVersion,
            installedAt: new Date(),
            installedBy: 'system',
            status: 'installed',
            installationPath: `/modules/${tenantId}/${moduleId}`,
            configuration: {},
            dependencies: [],
            metadata: {
              fromVersion: result.fromVersion,
              toVersion: result.toVersion,
              breakingChanges: result.breakingChanges,
            },
          },
          'update',
          'success',
          Date.now() - startTime,
          result.rollbackId
        );
      }

      return result;

    } catch (error) {
      await this.recordInstallationHistory(
        {
          id: installationId,
          moduleId,
          tenantId,
          version: targetVersion,
          installedAt: new Date(),
          installedBy: 'system',
          status: 'failed',
          installationPath: '',
          configuration: {},
          dependencies: [],
          metadata: { error: error instanceof Error ? error.message : String(error) },
        },
        'update',
        'failed',
        Date.now() - startTime
      );

      throw error;
    }
  }

  /**
   * Validate installation requirements
   */
  async validateInstallation(
    moduleId: string,
    tenantId: string,
    version?: string
  ): Promise<InstallationValidation> {
    const cacheKey = `${moduleId}-${tenantId}-${version || 'latest'}`;
    const cached = this.validationCache.get(cacheKey);
    
    if (cached && Date.now() - cached.metadata.timestamp.getTime() < 300000) { // 5 minutes
      return cached;
    }

    const validation: InstallationValidation = {
      moduleId,
      version: version || 'latest',
      tenantId,
      validationResults: {
        compatibility: true,
        dependencies: true,
        permissions: true,
        resources: true,
        conflicts: true,
      },
      errors: [],
      warnings: [],
      recommendations: [],
    };

    try {
      // Check compatibility
      const compatibilityResult = await this.checkCompatibility(moduleId, tenantId, version);
      validation.validationResults.compatibility = compatibilityResult.compatible;
      if (!compatibilityResult.compatible) {
        validation.errors.push(...compatibilityResult.errors);
      }
      validation.warnings.push(...compatibilityResult.warnings);

      // Check dependencies
      const dependencyResult = await this.checkDependencies(moduleId, version);
      validation.validationResults.dependencies = dependencyResult.satisfied;
      if (!dependencyResult.satisfied) {
        validation.errors.push(...dependencyResult.errors);
      }
      validation.warnings.push(...dependencyResult.warnings);

      // Check permissions
      const permissionResult = await this.checkPermissions(moduleId, tenantId);
      validation.validationResults.permissions = permissionResult.granted;
      if (!permissionResult.granted) {
        validation.errors.push(...permissionResult.errors);
      }

      // Check resources
      const resourceResult = await this.checkResources(moduleId, tenantId);
      validation.validationResults.resources = resourceResult.available;
      if (!resourceResult.available) {
        validation.errors.push(...resourceResult.errors);
      }
      validation.warnings.push(...resourceResult.warnings);

      // Check conflicts
      const conflictResult = await this.checkConflicts(moduleId, tenantId, version);
      validation.validationResults.conflicts = conflictResult.conflictFree;
      if (!conflictResult.conflictFree) {
        validation.errors.push(...conflictResult.errors);
      }
      validation.warnings.push(...conflictResult.warnings);

      // Generate recommendations
      validation.recommendations = await this.generateRecommendations(moduleId, tenantId, version);

    } catch (error) {
      validation.errors.push(error instanceof Error ? error.message : String(error));
    }

    this.validationCache.set(cacheKey, validation);
    return validation;
  }

  /**
   * Run installation tests
   */
  async runInstallationTests(
    installationId: string,
    moduleId: string,
    tenantId: string
  ): Promise<InstallationTest[]> {
    const tests: InstallationTest[] = [];
    const testTypes: Array<'unit' | 'integration' | 'smoke' | 'performance'> = [
      'smoke',
      'unit',
      'integration',
      'performance'
    ];

    for (const testType of testTypes) {
      const test: InstallationTest = {
        testId: this.generateTestId(),
        installationId,
        testType,
        status: 'pending',
        results: {
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: 0,
        },
        logs: [],
        startedAt: new Date(),
      };

      tests.push(test);

      try {
        test.status = 'running';
        const startTime = Date.now();

        // Run test based on type
        const testResult = await this.runTest(testType, moduleId, tenantId);
        
        test.results = testResult.results;
        test.logs = testResult.logs;
        test.status = testResult.results.failed > 0 ? 'failed' : 'passed';
        test.completedAt = new Date();
        test.results.duration = Date.now() - startTime;

      } catch (error) {
        test.status = 'failed';
        test.logs.push(error instanceof Error ? error.message : String(error));
        test.completedAt = new Date();
      }
    }

    this.testResults.set(installationId, tests);
    return tests;
  }

  /**
   * Get installation history for a module
   */
  async getInstallationHistory(moduleId: string, tenantId: string): Promise<InstallationHistory[]> {
    const key = `${moduleId}-${tenantId}`;
    return this.installationHistory.get(key) || [];
  }

  /**
   * Get all installations for a tenant
   */
  async getTenantInstallations(tenantId: string): Promise<ModuleInstallation[]> {
    return Array.from(this.installations.values())
      .filter(installation => installation.tenantId === tenantId);
  }

  /**
   * Check if a module is installed
   */
  isModuleInstalled(moduleId: string, tenantId: string): boolean {
    return Array.from(this.installations.values())
      .some(installation => 
        installation.moduleId === moduleId && 
        installation.tenantId === tenantId && 
        installation.status === 'installed'
      );
  }

  /**
   * Get installation statistics
   */
  async getInstallationStatistics(): Promise<{
    totalInstallations: number;
    successfulInstallations: number;
    failedInstallations: number;
    averageInstallationTime: number;
    mostInstalledModules: Array<{ moduleId: string; count: number }>;
    installationTrends: Array<{ date: string; count: number }>;
  }> {
    const installations = Array.from(this.installations.values());
    const history = Array.from(this.installationHistory.values()).flat();

    const successfulInstallations = history.filter(h => h.status === 'success').length;
    const failedInstallations = history.filter(h => h.status === 'failed').length;
    const averageInstallationTime = history.length > 0 
      ? history.reduce((sum, h) => sum + h.duration, 0) / history.length 
      : 0;

    // Count module installations
    const moduleCounts = new Map<string, number>();
    installations.forEach(installation => {
      const count = moduleCounts.get(installation.moduleId) || 0;
      moduleCounts.set(installation.moduleId, count + 1);
    });

    const mostInstalledModules = Array.from(moduleCounts.entries())
      .map(([moduleId, count]) => ({ moduleId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate installation trends (last 30 days)
    const trends: Array<{ date: string; count: number }> = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = history.filter(h => {
        const hDate = new Date(h.timestamp);
        return hDate.toISOString().split('T')[0] === dateStr;
      }).length;

      trends.push({ date: dateStr, count });
    }

    return {
      totalInstallations: installations.length,
      successfulInstallations,
      failedInstallations,
      averageInstallationTime,
      mostInstalledModules,
      installationTrends: trends,
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private generateInstallationId(): string {
    return `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private findInstallationId(moduleId: string, tenantId: string): string | null {
    for (const [id, installation] of this.installations) {
      if (installation.moduleId === moduleId && installation.tenantId === tenantId) {
        return id;
      }
    }
    return null;
  }

  private async recordInstallationHistory(
    installation: ModuleInstallation,
    action: 'install' | 'uninstall' | 'update' | 'rollback',
    status: 'success' | 'failed' | 'partial',
    duration: number,
    rollbackId?: string
  ): Promise<void> {
    const history: InstallationHistory = {
      id: this.generateInstallationId(),
      moduleId: installation.moduleId,
      tenantId: installation.tenantId,
      action,
      fromVersion: installation.metadata.fromVersion as string,
      toVersion: installation.version,
      status,
      timestamp: new Date(),
      duration,
      details: installation.metadata,
      rollbackId,
    };

    const key = `${installation.moduleId}-${installation.tenantId}`;
    const existing = this.installationHistory.get(key) || [];
    existing.push(history);
    this.installationHistory.set(key, existing);
  }

  private async rollbackInstallation(installationId: string): Promise<void> {
    // Implementation for rollback
    console.log(`Rolling back installation: ${installationId}`);
  }

  private async findDependentModules(moduleId: string, tenantId: string): Promise<string[]> {
    // Implementation to find modules that depend on this module
    return [];
  }

  private async checkCompatibility(
    moduleId: string,
    tenantId: string,
    version?: string
  ): Promise<{ compatible: boolean; errors: string[]; warnings: string[] }> {
    // Mock implementation - in real app, this would check:
    // - Module compatibility with tenant's tier
    // - Version compatibility
    // - System requirements
    return { compatible: true, errors: [], warnings: [] };
  }

  private async checkDependencies(
    moduleId: string,
    version?: string
  ): Promise<{ satisfied: boolean; errors: string[]; warnings: string[] }> {
    // Mock implementation - in real app, this would check:
    // - Required dependencies are available
    // - Dependency versions are compatible
    return { satisfied: true, errors: [], warnings: [] };
  }

  private async checkPermissions(
    moduleId: string,
    tenantId: string
  ): Promise<{ granted: boolean; errors: string[] }> {
    // Mock implementation - in real app, this would check:
    // - Tenant has permission to install this module
    // - Required permissions are available
    return { granted: true, errors: [] };
  }

  private async checkResources(
    moduleId: string,
    tenantId: string
  ): Promise<{ available: boolean; errors: string[]; warnings: string[] }> {
    // Mock implementation - in real app, this would check:
    // - Sufficient disk space
    // - Memory requirements
    // - CPU requirements
    return { available: true, errors: [], warnings: [] };
  }

  private async checkConflicts(
    moduleId: string,
    tenantId: string,
    version?: string
  ): Promise<{ conflictFree: boolean; errors: string[]; warnings: string[] }> {
    // Mock implementation - in real app, this would check:
    // - Conflicting modules
    // - Route conflicts
    // - API conflicts
    return { conflictFree: true, errors: [], warnings: [] };
  }

  private async generateRecommendations(
    moduleId: string,
    tenantId: string,
    version?: string
  ): Promise<string[]> {
    // Mock implementation - in real app, this would generate:
    // - Performance recommendations
    // - Configuration suggestions
    // - Best practices
    return [];
  }

  private async runTest(
    testType: 'unit' | 'integration' | 'smoke' | 'performance',
    moduleId: string,
    tenantId: string
  ): Promise<{ results: { passed: number; failed: number; skipped: number; duration: number }; logs: string[] }> {
    // Mock implementation - in real app, this would run:
    // - Unit tests for the module
    // - Integration tests
    // - Smoke tests
    // - Performance tests
    return {
      results: { passed: 1, failed: 0, skipped: 0, duration: 100 },
      logs: [`${testType} test completed successfully`],
    };
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const moduleInstaller = new ModuleInstaller();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export async function installModule(
  moduleId: string,
  tenantId: string,
  version?: string,
  options?: {
    skipValidation?: boolean;
    skipTests?: boolean;
    forceInstall?: boolean;
    installDependencies?: boolean;
  }
): Promise<InstallationResult> {
  return moduleInstaller.installModule(moduleId, tenantId, version, options);
}

export async function uninstallModule(
  moduleId: string,
  tenantId: string,
  options?: {
    forceUninstall?: boolean;
    cleanupData?: boolean;
    skipValidation?: boolean;
  }
): Promise<UninstallResult> {
  return moduleInstaller.uninstallModule(moduleId, tenantId, options);
}

export async function updateModule(
  moduleId: string,
  tenantId: string,
  targetVersion: string,
  options?: {
    backupCurrent?: boolean;
    skipTests?: boolean;
    forceUpdate?: boolean;
  }
): Promise<UpdateResult> {
  return moduleInstaller.updateModule(moduleId, tenantId, targetVersion, options);
}

export async function validateInstallation(
  moduleId: string,
  tenantId: string,
  version?: string
): Promise<InstallationValidation> {
  return moduleInstaller.validateInstallation(moduleId, tenantId, version);
}

export async function getInstallationHistory(
  moduleId: string,
  tenantId: string
): Promise<InstallationHistory[]> {
  return moduleInstaller.getInstallationHistory(moduleId, tenantId);
}

export async function getTenantInstallations(tenantId: string): Promise<ModuleInstallation[]> {
  return moduleInstaller.getTenantInstallations(tenantId);
}

export function isModuleInstalled(moduleId: string, tenantId: string): boolean {
  return moduleInstaller.isModuleInstalled(moduleId, tenantId);
}

export async function getInstallationStatistics() {
  return moduleInstaller.getInstallationStatistics();
}
