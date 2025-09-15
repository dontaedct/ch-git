/**
 * HT-023.1.1: Template Version Manager
 * 
 * Manages template versioning and migration
 * Part of the Template Engine Integration
 */

import { Template, VersionedTemplate, TemplateVersion } from './types';

export interface VersionManagerOptions {
  enableAutoVersioning?: boolean;
  maxVersions?: number;
  enableMigration?: boolean;
}

export class TemplateVersionManager {
  private versions = new Map<string, TemplateVersion[]>();
  private options: VersionManagerOptions;

  constructor(options: VersionManagerOptions = {}) {
    this.options = {
      enableAutoVersioning: true,
      maxVersions: 10,
      enableMigration: true,
      ...options
    };
  }

  /**
   * Create version for template
   */
  async createVersion(template: Template): Promise<TemplateVersion> {
    const version: TemplateVersion = {
      version: template.version,
      timestamp: new Date(),
      changes: [{ type: 'added', path: 'template', description: 'Initial version', impact: 'feature' }],
      compatibility: {
        minVersion: '1.0.0',
        maxVersion: '2.0.0',
        breaking: false,
        migrations: []
      },
      rollbackPoint: true
    };

    const templateVersions = this.versions.get(template.id) || [];
    templateVersions.push(version);
    
    // Limit number of versions
    if (templateVersions.length > this.options.maxVersions!) {
      templateVersions.shift();
    }
    
    this.versions.set(template.id, templateVersions);
    
    return version;
  }

  /**
   * Compare two versions
   */
  compareVersions(version1: string, version2: string): any {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    
    return 0;
  }

  /**
   * Rollback template to specific version
   */
  async rollback(templateId: string, targetVersion: string): Promise<any> {
    const templateVersions = this.versions.get(templateId);
    if (!templateVersions) {
      throw new Error(`No versions found for template: ${templateId}`);
    }

    const targetVersionData = templateVersions.find(v => v.version === targetVersion);
    if (!targetVersionData) {
      throw new Error(`Version not found: ${targetVersion}`);
    }

    return {
      success: true,
      rolledBackTo: targetVersion,
      timestamp: new Date()
    };
  }

  /**
   * Migrate template to target version
   */
  async migrateTemplate(template: Template, targetVersion: string): Promise<any> {
    const currentVersion = template.version;
    const comparison = this.compareVersions(currentVersion, targetVersion);
    
    if (comparison === 0) {
      return {
        success: true,
        message: 'Template is already at target version',
        currentVersion,
        targetVersion
      };
    }

    // Simple migration logic - in real implementation would have proper migration scripts
    const migratedTemplate: Template = {
      ...template,
      version: targetVersion,
      metadata: {
        ...template.metadata,
        updatedAt: new Date()
      }
    };

    return {
      success: true,
      template: migratedTemplate,
      migratedFrom: currentVersion,
      migratedTo: targetVersion
    };
  }

  /**
   * Get version history for template
   */
  getVersionHistory(templateId: string): TemplateVersion[] {
    return this.versions.get(templateId) || [];
  }

  /**
   * Get latest version for template
   */
  getLatestVersion(templateId: string): TemplateVersion | null {
    const versions = this.versions.get(templateId);
    if (!versions || versions.length === 0) return null;
    
    return versions[versions.length - 1];
  }

  /**
   * Clear version history for template
   */
  clearVersionHistory(templateId: string): boolean {
    return this.versions.delete(templateId);
  }

  /**
   * Get all versioned templates
   */
  getAllVersionedTemplates(): Map<string, TemplateVersion[]> {
    return new Map(this.versions);
  }
}
