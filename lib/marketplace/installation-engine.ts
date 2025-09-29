/**
 * Module Installation Engine
 * 
 * Handles automated module installation, dependency resolution,
 * version management, and rollback capabilities for the marketplace.
 */

import { z } from 'zod';
import { ModuleMetadata, CompatibilityInfo } from './module-registry';

// Schema definitions
export const InstallationRequestSchema = z.object({
  moduleId: z.string(),
  tenantId: z.string(),
  version: z.string().optional(),
  skipDependencies: z.boolean().default(false),
  forceInstall: z.boolean().default(false),
});

export const DependencySchema = z.object({
  id: z.string(),
  version: z.string(),
  required: z.boolean().default(true),
  installed: z.boolean().default(false),
});

export const InstallationStatusSchema = z.enum([
  'pending',
  'validating',
  'downloading',
  'installing',
  'configuring',
  'completed',
  'failed',
  'rolled_back'
]);

export const InstallationResultSchema = z.object({
  success: z.boolean(),
  moduleId: z.string(),
  version: z.string(),
  installationId: z.string(),
  dependencies: z.array(DependencySchema),
  warnings: z.array(z.string()).default([]),
  errors: z.array(z.string()).default([]),
  rollbackId: z.string().optional(),
});

export const UninstallRequestSchema = z.object({
  moduleId: z.string(),
  tenantId: z.string(),
  forceUninstall: z.boolean().default(false),
  cleanupData: z.boolean().default(true),
});

export const UninstallResultSchema = z.object({
  success: z.boolean(),
  moduleId: z.string(),
  cleanupPerformed: z.boolean(),
  warnings: z.array(z.string()).default([]),
  errors: z.array(z.string()).default([]),
});

export const UpdateRequestSchema = z.object({
  moduleId: z.string(),
  tenantId: z.string(),
  targetVersion: z.string(),
  backupCurrent: z.boolean().default(true),
});

export const UpdateResultSchema = z.object({
  success: z.boolean(),
  moduleId: z.string(),
  fromVersion: z.string(),
  toVersion: z.string(),
  updateId: z.string(),
  breakingChanges: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  errors: z.array(z.string()).default([]),
  rollbackId: z.string().optional(),
});

// Type exports
export type InstallationRequest = z.infer<typeof InstallationRequestSchema>;
export type Dependency = z.infer<typeof DependencySchema>;
export type InstallationStatus = z.infer<typeof InstallationStatusSchema>;
export type InstallationResult = z.infer<typeof InstallationResultSchema>;
export type UninstallRequest = z.infer<typeof UninstallRequestSchema>;
export type UninstallResult = z.infer<typeof UninstallResultSchema>;
export type UpdateRequest = z.infer<typeof UpdateRequestSchema>;
export type UpdateResult = z.infer<typeof UpdateResultSchema>;

export interface InstallationProgress {
  installationId: string;
  moduleId: string;
  status: InstallationStatus;
  progress: number; // 0-100
  currentStep: string;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

/**
 * Module Installation Engine
 * 
 * Handles the complete module installation lifecycle including
 * validation, dependency resolution, installation, and rollback.
 */
export class InstallationEngine {
  private installations: Map<string, InstallationProgress> = new Map();
  private installedModules: Map<string, Set<string>> = new Map(); // tenantId -> Set<moduleId>

  constructor() {
    // Initialize with empty state
  }

  /**
   * Install a module for a tenant
   */
  async installModule(request: InstallationRequest): Promise<InstallationResult> {
    const validatedRequest = InstallationRequestSchema.parse(request);
    const installationId = this.generateInstallationId();
    
    try {
      // Initialize installation progress
      const progress: InstallationProgress = {
        installationId,
        moduleId: validatedRequest.moduleId,
        status: 'pending',
        progress: 0,
        currentStep: 'Initializing installation',
        startedAt: new Date(),
      };
      this.installations.set(installationId, progress);

      // Step 1: Validate compatibility
      progress.status = 'validating';
      progress.currentStep = 'Validating compatibility';
      progress.progress = 10;

      const compatibilityResult = await this.validateCompatibility(
        validatedRequest.moduleId,
        validatedRequest.tenantId,
        validatedRequest.version
      );

      if (!compatibilityResult.compatible) {
        throw new Error(`Compatibility check failed: ${compatibilityResult.reason}`);
      }

      // Step 2: Resolve dependencies
      progress.currentStep = 'Resolving dependencies';
      progress.progress = 20;

      const dependencies = await this.resolveDependencies(
        validatedRequest.moduleId,
        validatedRequest.version,
        validatedRequest.skipDependencies
      );

      // Step 3: Install dependencies
      if (!validatedRequest.skipDependencies) {
        progress.currentStep = 'Installing dependencies';
        progress.progress = 30;

        for (const dependency of dependencies) {
          if (dependency.required && !dependency.installed) {
            const depResult = await this.installDependency(
              dependency.id,
              dependency.version,
              validatedRequest.tenantId
            );
            
            if (!depResult.success) {
              throw new Error(`Failed to install dependency ${dependency.id}: ${depResult.errors.join(', ')}`);
            }
          }
        }
      }

      // Step 4: Download module
      progress.status = 'downloading';
      progress.currentStep = 'Downloading module';
      progress.progress = 50;

      const downloadResult = await this.downloadModule(
        validatedRequest.moduleId,
        validatedRequest.version
      );

      if (!downloadResult.success) {
        throw new Error(`Failed to download module: ${downloadResult.error}`);
      }

      // Step 5: Install module
      progress.status = 'installing';
      progress.currentStep = 'Installing module';
      progress.progress = 70;

      const installResult = await this.performInstallation(
        validatedRequest.moduleId,
        validatedRequest.version,
        validatedRequest.tenantId,
        downloadResult.downloadPath
      );

      if (!installResult.success) {
        throw new Error(`Installation failed: ${installResult.error}`);
      }

      // Step 6: Configure module
      progress.status = 'configuring';
      progress.currentStep = 'Configuring module';
      progress.progress = 90;

      const configResult = await this.configureModule(
        validatedRequest.moduleId,
        validatedRequest.tenantId
      );

      if (!configResult.success) {
        // Rollback installation
        await this.rollbackInstallation(installationId);
        throw new Error(`Configuration failed: ${configResult.error}`);
      }

      // Step 7: Complete installation
      progress.status = 'completed';
      progress.currentStep = 'Installation completed';
      progress.progress = 100;
      progress.completedAt = new Date();

      // Update tenant's installed modules
      this.addInstalledModule(validatedRequest.tenantId, validatedRequest.moduleId);

      const result: InstallationResult = {
        success: true,
        moduleId: validatedRequest.moduleId,
        version: validatedRequest.version || 'latest',
        installationId,
        dependencies: dependencies.map(dep => ({
          ...dep,
          installed: true
        })),
        warnings: [...compatibilityResult.warnings, ...installResult.warnings],
        errors: [],
      };

      return InstallationResultSchema.parse(result);

    } catch (error) {
      // Mark installation as failed
      const progress = this.installations.get(installationId);
      if (progress) {
        progress.status = 'failed';
        progress.error = error instanceof Error ? error.message : 'Unknown error';
        progress.completedAt = new Date();
      }

      // Attempt rollback
      const rollbackId = await this.rollbackInstallation(installationId);

      return InstallationResultSchema.parse({
        success: false,
        moduleId: validatedRequest.moduleId,
        version: validatedRequest.version || 'latest',
        installationId,
        dependencies: [],
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        rollbackId,
      });
    }
  }

  /**
   * Uninstall a module from a tenant
   */
  async uninstallModule(request: UninstallRequest): Promise<UninstallResult> {
    const validatedRequest = UninstallRequestSchema.parse(request);

    try {
      // Check if module is installed
      if (!this.isModuleInstalled(validatedRequest.tenantId, validatedRequest.moduleId)) {
        return UninstallResultSchema.parse({
          success: false,
          moduleId: validatedRequest.moduleId,
          cleanupPerformed: false,
          warnings: [],
          errors: ['Module is not installed'],
        });
      }

      // Check for dependent modules
      const dependents = await this.findDependentModules(
        validatedRequest.moduleId,
        validatedRequest.tenantId
      );

      if (dependents.length > 0 && !validatedRequest.forceUninstall) {
        return UninstallResultSchema.parse({
          success: false,
          moduleId: validatedRequest.moduleId,
          cleanupPerformed: false,
          warnings: [],
          errors: [`Cannot uninstall: ${dependents.length} modules depend on this module`],
        });
      }

      // Perform uninstallation
      const uninstallResult = await this.performUninstallation(
        validatedRequest.moduleId,
        validatedRequest.tenantId,
        validatedRequest.cleanupData
      );

      if (uninstallResult.success) {
        // Remove from tenant's installed modules
        this.removeInstalledModule(validatedRequest.tenantId, validatedRequest.moduleId);
      }

      return UninstallResultSchema.parse(uninstallResult);

    } catch (error) {
      return UninstallResultSchema.parse({
        success: false,
        moduleId: validatedRequest.moduleId,
        cleanupPerformed: false,
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });
    }
  }

  /**
   * Update a module to a new version
   */
  async updateModule(request: UpdateRequest): Promise<UpdateResult> {
    const validatedRequest = UpdateRequestSchema.parse(request);
    const updateId = this.generateInstallationId();

    try {
      // Check if module is installed
      if (!this.isModuleInstalled(validatedRequest.tenantId, validatedRequest.moduleId)) {
        throw new Error('Module is not installed');
      }

      // Get current version
      const currentVersion = await this.getInstalledVersion(
        validatedRequest.moduleId,
        validatedRequest.tenantId
      );

      // Check for breaking changes
      const breakingChanges = await this.checkBreakingChanges(
        validatedRequest.moduleId,
        currentVersion,
        validatedRequest.targetVersion
      );

      // Backup current version if requested
      let backupId: string | undefined;
      if (validatedRequest.backupCurrent) {
        backupId = await this.createBackup(
          validatedRequest.moduleId,
          validatedRequest.tenantId,
          currentVersion
        );
      }

      // Uninstall current version
      const uninstallResult = await this.uninstallModule({
        moduleId: validatedRequest.moduleId,
        tenantId: validatedRequest.tenantId,
        forceUninstall: true,
        cleanupData: false, // Keep data for migration
      });

      if (!uninstallResult.success) {
        throw new Error(`Failed to uninstall current version: ${uninstallResult.errors.join(', ')}`);
      }

      // Install new version
      const installResult = await this.installModule({
        moduleId: validatedRequest.moduleId,
        tenantId: validatedRequest.tenantId,
        version: validatedRequest.targetVersion,
        skipDependencies: false,
        forceInstall: true,
      });

      if (!installResult.success) {
        // Restore backup if available
        if (backupId) {
          await this.restoreBackup(backupId);
        }
        throw new Error(`Failed to install new version: ${installResult.errors.join(', ')}`);
      }

      // Migrate data if needed
      if (breakingChanges.length > 0) {
        await this.migrateData(
          validatedRequest.moduleId,
          validatedRequest.tenantId,
          currentVersion,
          validatedRequest.targetVersion
        );
      }

      return UpdateResultSchema.parse({
        success: true,
        moduleId: validatedRequest.moduleId,
        fromVersion: currentVersion,
        toVersion: validatedRequest.targetVersion,
        updateId,
        breakingChanges,
        warnings: [...uninstallResult.warnings, ...installResult.warnings],
        errors: [],
        rollbackId: backupId,
      });

    } catch (error) {
      return UpdateResultSchema.parse({
        success: false,
        moduleId: validatedRequest.moduleId,
        fromVersion: 'unknown',
        toVersion: validatedRequest.targetVersion,
        updateId,
        breakingChanges: [],
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });
    }
  }

  /**
   * Get installation progress
   */
  async getInstallationProgress(installationId: string): Promise<InstallationProgress | null> {
    return this.installations.get(installationId) || null;
  }

  /**
   * Get installed modules for a tenant
   */
  async getInstalledModules(tenantId: string): Promise<string[]> {
    const installed = this.installedModules.get(tenantId);
    return installed ? Array.from(installed) : [];
  }

  /**
   * Check if a module is installed for a tenant
   */
  isModuleInstalled(tenantId: string, moduleId: string): boolean {
    const installed = this.installedModules.get(tenantId);
    return installed ? installed.has(moduleId) : false;
  }

  // Private helper methods

  private generateInstallationId(): string {
    return `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addInstalledModule(tenantId: string, moduleId: string): void {
    if (!this.installedModules.has(tenantId)) {
      this.installedModules.set(tenantId, new Set());
    }
    this.installedModules.get(tenantId)!.add(moduleId);
  }

  private removeInstalledModule(tenantId: string, moduleId: string): void {
    const installed = this.installedModules.get(tenantId);
    if (installed) {
      installed.delete(moduleId);
    }
  }

  private async validateCompatibility(
    moduleId: string,
    tenantId: string,
    version?: string
  ): Promise<{
    compatible: boolean;
    reason?: string;
    warnings: string[];
  }> {
    // Mock implementation - in real app, this would check:
    // - Module compatibility with tenant's tier
    // - Version compatibility
    // - System requirements
    // - Conflicting modules
    
    return {
      compatible: true,
      warnings: [],
    };
  }

  private async resolveDependencies(
    moduleId: string,
    version?: string,
    skipDependencies: boolean = false
  ): Promise<Dependency[]> {
    // Mock implementation - in real app, this would:
    // - Parse module's package.json or manifest
    // - Resolve dependency versions
    // - Check for conflicts
    
    return [];
  }

  private async installDependency(
    dependencyId: string,
    version: string,
    tenantId: string
  ): Promise<InstallationResult> {
    // Mock implementation - recursively install dependencies
    return {
      success: true,
      moduleId: dependencyId,
      version,
      installationId: this.generateInstallationId(),
      dependencies: [],
      warnings: [],
      errors: [],
    };
  }

  private async downloadModule(
    moduleId: string,
    version?: string
  ): Promise<{
    success: boolean;
    downloadPath?: string;
    error?: string;
  }> {
    // Mock implementation - in real app, this would:
    // - Download module from CDN or registry
    // - Verify checksums
    // - Extract to temporary location
    
    return {
      success: true,
      downloadPath: `/tmp/modules/${moduleId}-${version || 'latest'}`,
    };
  }

  private async performInstallation(
    moduleId: string,
    version: string,
    tenantId: string,
    downloadPath: string
  ): Promise<{
    success: boolean;
    warnings: string[];
    error?: string;
  }> {
    // Mock implementation - in real app, this would:
    // - Copy files to tenant's module directory
    // - Register with module system
    // - Initialize module configuration
    
    return {
      success: true,
      warnings: [],
    };
  }

  private async configureModule(
    moduleId: string,
    tenantId: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    // Mock implementation - in real app, this would:
    // - Run module's configuration script
    // - Set up database tables
    // - Configure permissions
    
    return {
      success: true,
    };
  }

  private async rollbackInstallation(installationId: string): Promise<string> {
    // Mock implementation - in real app, this would:
    // - Remove installed files
    // - Unregister from module system
    // - Restore previous state
    
    return `rollback_${installationId}`;
  }

  private async findDependentModules(
    moduleId: string,
    tenantId: string
  ): Promise<string[]> {
    // Mock implementation - in real app, this would check:
    // - Which modules depend on this module
    // - Return list of dependent module IDs
    
    return [];
  }

  private async performUninstallation(
    moduleId: string,
    tenantId: string,
    cleanupData: boolean
  ): Promise<{
    success: boolean;
    warnings: string[];
    errors: string[];
  }> {
    // Mock implementation - in real app, this would:
    // - Remove module files
    // - Unregister from module system
    // - Clean up data if requested
    
    return {
      success: true,
      warnings: [],
      errors: [],
    };
  }

  private async getInstalledVersion(
    moduleId: string,
    tenantId: string
  ): Promise<string> {
    // Mock implementation - in real app, this would:
    // - Query database for installed version
    // - Return current version string
    
    return '1.0.0';
  }

  private async checkBreakingChanges(
    moduleId: string,
    fromVersion: string,
    toVersion: string
  ): Promise<string[]> {
    // Mock implementation - in real app, this would:
    // - Compare version changelogs
    // - Identify breaking changes
    // - Return list of breaking change descriptions
    
    return [];
  }

  private async createBackup(
    moduleId: string,
    tenantId: string,
    version: string
  ): Promise<string> {
    // Mock implementation - in real app, this would:
    // - Create backup of module files
    // - Backup configuration and data
    // - Return backup ID
    
    return `backup_${moduleId}_${version}_${Date.now()}`;
  }

  private async restoreBackup(backupId: string): Promise<void> {
    // Mock implementation - in real app, this would:
    // - Restore files from backup
    // - Restore configuration
    // - Re-register module
  }

  private async migrateData(
    moduleId: string,
    tenantId: string,
    fromVersion: string,
    toVersion: string
  ): Promise<void> {
    // Mock implementation - in real app, this would:
    // - Run data migration scripts
    // - Transform data structures
    // - Update configuration
  }
}

// Export singleton instance
export const installationEngine = new InstallationEngine();
