/**
 * Template Storage System
 * 
 * Handles saving, loading, and managing template manifests with versioning support.
 * Provides both local storage and API-based storage options.
 */

import { TemplateManifest } from '../../types/componentContracts';

export interface TemplateStorageOptions {
  storageType: 'local' | 'api' | 'hybrid';
  apiEndpoint?: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
  maxVersions?: number;
}

export interface TemplateVersion {
  id: string;
  version: string;
  manifest: TemplateManifest;
  createdAt: string;
  createdBy: string;
  description?: string;
  isActive: boolean;
}

export interface TemplateStorageStats {
  totalTemplates: number;
  totalVersions: number;
  lastSaved?: string;
  storageUsed: number;
}

class TemplateStorage {
  private options: TemplateStorageOptions;
  private autoSaveTimer?: NodeJS.Timeout;
  private pendingChanges = new Set<string>();

  constructor(options: TemplateStorageOptions = { storageType: 'local' }) {
    this.options = {
      autoSave: true,
      autoSaveInterval: 30000, // 30 seconds
      maxVersions: 10,
      ...options
    };

    if (this.options.autoSave) {
      this.startAutoSave();
    }
  }

  // Save template with versioning
  async saveTemplate(
    manifest: TemplateManifest, 
    options: {
      createNewVersion?: boolean;
      description?: string;
      isActive?: boolean;
    } = {}
  ): Promise<TemplateVersion> {
    const {
      createNewVersion = false,
      description = 'Auto-saved',
      isActive = true
    } = options;

    const version: TemplateVersion = {
      id: `${manifest.id}_${Date.now()}`,
      version: this.generateVersion(manifest),
      manifest: { ...manifest },
      createdAt: new Date().toISOString(),
      createdBy: 'current_user', // Would be from auth context
      description,
      isActive
    };

    try {
      if (this.options.storageType === 'local' || this.options.storageType === 'hybrid') {
        await this.saveToLocalStorage(version);
      }

      if (this.options.storageType === 'api' || this.options.storageType === 'hybrid') {
        await this.saveToAPI(version);
      }

      // Clean up old versions
      await this.cleanupOldVersions(manifest.id);

      return version;
    } catch (error) {
      console.error('Failed to save template:', error);
      throw error;
    }
  }

  // Load template by ID
  async loadTemplate(templateId: string, version?: string): Promise<TemplateManifest | null> {
    try {
      if (this.options.storageType === 'local' || this.options.storageType === 'hybrid') {
        const localVersion = await this.loadFromLocalStorage(templateId, version);
        if (localVersion) {
          return localVersion.manifest;
        }
      }

      if (this.options.storageType === 'api' || this.options.storageType === 'hybrid') {
        const apiVersion = await this.loadFromAPI(templateId, version);
        if (apiVersion) {
          return apiVersion.manifest;
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to load template:', error);
      return null;
    }
  }

  // Get all templates
  async getAllTemplates(): Promise<TemplateVersion[]> {
    try {
      const templates: TemplateVersion[] = [];

      if (this.options.storageType === 'local' || this.options.storageType === 'hybrid') {
        const localTemplates = await this.getAllFromLocalStorage();
        templates.push(...localTemplates);
      }

      if (this.options.storageType === 'api' || this.options.storageType === 'hybrid') {
        const apiTemplates = await this.getAllFromAPI();
        templates.push(...apiTemplates);
      }

      // Remove duplicates and sort by creation date
      const uniqueTemplates = this.deduplicateTemplates(templates);
      return uniqueTemplates.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Failed to get all templates:', error);
      return [];
    }
  }

  // Get template versions
  async getTemplateVersions(templateId: string): Promise<TemplateVersion[]> {
    try {
      const versions: TemplateVersion[] = [];

      if (this.options.storageType === 'local' || this.options.storageType === 'hybrid') {
        const localVersions = await this.getVersionsFromLocalStorage(templateId);
        versions.push(...localVersions);
      }

      if (this.options.storageType === 'api' || this.options.storageType === 'hybrid') {
        const apiVersions = await this.getVersionsFromAPI(templateId);
        versions.push(...apiVersions);
      }

      return versions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Failed to get template versions:', error);
      return [];
    }
  }

  // Delete template
  async deleteTemplate(templateId: string, version?: string): Promise<boolean> {
    try {
      let success = true;

      if (this.options.storageType === 'local' || this.options.storageType === 'hybrid') {
        success = await this.deleteFromLocalStorage(templateId, version) && success;
      }

      if (this.options.storageType === 'api' || this.options.storageType === 'hybrid') {
        success = await this.deleteFromAPI(templateId, version) && success;
      }

      return success;
    } catch (error) {
      console.error('Failed to delete template:', error);
      return false;
    }
  }

  // Duplicate template
  async duplicateTemplate(
    templateId: string, 
    newName: string, 
    newSlug: string
  ): Promise<TemplateManifest | null> {
    try {
      const original = await this.loadTemplate(templateId);
      if (!original) {
        throw new Error('Template not found');
      }

      const duplicated: TemplateManifest = {
        ...original,
        id: `tpl_${Date.now()}`,
        name: newName,
        slug: newSlug,
        meta: {
          ...original.meta,
          version: '1.0.0',
          createdAt: new Date().toISOString().split('T')[0],
          tags: [...(original.meta.tags || []), 'duplicated']
        }
      };

      await this.saveTemplate(duplicated, {
        description: `Duplicated from ${original.name}`,
        isActive: true
      });

      return duplicated;
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      return null;
    }
  }

  // Export template
  async exportTemplate(templateId: string, format: 'json' | 'yaml' = 'json'): Promise<string> {
    try {
      const manifest = await this.loadTemplate(templateId);
      if (!manifest) {
        throw new Error('Template not found');
      }

      if (format === 'json') {
        return JSON.stringify(manifest, null, 2);
      } else {
        // Simple YAML conversion (would use a proper YAML library in production)
        return this.jsonToYaml(manifest);
      }
    } catch (error) {
      console.error('Failed to export template:', error);
      throw error;
    }
  }

  // Import template
  async importTemplate(
    data: string, 
    format: 'json' | 'yaml' = 'json',
    options: {
      overwrite?: boolean;
      newName?: string;
      newSlug?: string;
    } = {}
  ): Promise<TemplateManifest | null> {
    try {
      let manifest: TemplateManifest;

      if (format === 'json') {
        manifest = JSON.parse(data);
      } else {
        manifest = this.yamlToJson(data);
      }

      // Validate manifest
      if (!this.validateManifest(manifest)) {
        throw new Error('Invalid template manifest');
      }

      // Apply options
      if (options.newName) {
        manifest.name = options.newName;
      }
      if (options.newSlug) {
        manifest.slug = options.newSlug;
      }

      // Generate new ID
      manifest.id = `tpl_${Date.now()}`;
      manifest.meta.createdAt = new Date().toISOString().split('T')[0];

      await this.saveTemplate(manifest, {
        description: 'Imported template',
        isActive: true
      });

      return manifest;
    } catch (error) {
      console.error('Failed to import template:', error);
      return null;
    }
  }

  // Get storage statistics
  async getStats(): Promise<TemplateStorageStats> {
    try {
      const templates = await this.getAllTemplates();
      const totalVersions = templates.length;
      const totalTemplates = new Set(templates.map(t => t.manifest.id)).size;
      const lastSaved = templates.length > 0 ? templates[0].createdAt : undefined;
      
      // Calculate storage used (rough estimate)
      const storageUsed = templates.reduce((total, template) => {
        return total + JSON.stringify(template.manifest).length;
      }, 0);

      return {
        totalTemplates,
        totalVersions,
        lastSaved,
        storageUsed
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalTemplates: 0,
        totalVersions: 0,
        storageUsed: 0
      };
    }
  }

  // Mark template as dirty for auto-save
  markDirty(templateId: string): void {
    this.pendingChanges.add(templateId);
  }

  // Private methods

  private async saveToLocalStorage(version: TemplateVersion): Promise<void> {
    const key = `template_${version.manifest.id}`;
    const versionsKey = `template_versions_${version.manifest.id}`;
    
    // Save current version
    localStorage.setItem(key, JSON.stringify(version));
    
    // Save to versions list
    const existingVersions = this.getVersionsFromLocalStorageSync(version.manifest.id);
    existingVersions.push(version);
    localStorage.setItem(versionsKey, JSON.stringify(existingVersions));
  }

  private async loadFromLocalStorage(templateId: string, version?: string): Promise<TemplateVersion | null> {
    if (version) {
      const versions = this.getVersionsFromLocalStorageSync(templateId);
      return versions.find(v => v.version === version) || null;
    }

    // First check localStorage
    const key = `template_${templateId}`;
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }

    // Then check predefined templates
    return await this.loadPredefinedTemplate(templateId);
  }

  private getVersionsFromLocalStorageSync(templateId: string): TemplateVersion[] {
    const versionsKey = `template_versions_${templateId}`;
    const data = localStorage.getItem(versionsKey);
    return data ? JSON.parse(data) : [];
  }

  private async getVersionsFromLocalStorage(templateId: string): Promise<TemplateVersion[]> {
    return this.getVersionsFromLocalStorageSync(templateId);
  }

  private async getAllFromLocalStorage(): Promise<TemplateVersion[]> {
    const templates: TemplateVersion[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('template_') && !key.includes('_versions_')) {
        const data = localStorage.getItem(key);
        if (data) {
          templates.push(JSON.parse(data));
        }
      }
    }
    
    return templates;
  }

  private async loadPredefinedTemplate(templateId: string): Promise<TemplateVersion | null> {
    try {
      // Load predefined template from JSON file
      const response = await fetch(`/lib/template-storage/templates/${templateId}.json`);
      if (!response.ok) {
        return null;
      }
      
      const manifest = await response.json();
      
      // Convert to TemplateVersion format
      const templateVersion: TemplateVersion = {
        manifest,
        version: manifest.version,
        createdAt: manifest.metadata.createdAt,
        updatedAt: manifest.metadata.updatedAt,
        isActive: true,
        tags: manifest.metadata.tags || []
      };
      
      return templateVersion;
    } catch (error) {
      console.error(`Failed to load predefined template ${templateId}:`, error);
      return null;
    }
  }

  private async deleteFromLocalStorage(templateId: string, version?: string): Promise<boolean> {
    if (version) {
      const versions = this.getVersionsFromLocalStorageSync(templateId);
      const filteredVersions = versions.filter(v => v.version !== version);
      const versionsKey = `template_versions_${templateId}`;
      localStorage.setItem(versionsKey, JSON.stringify(filteredVersions));
      return true;
    }

    const key = `template_${templateId}`;
    const versionsKey = `template_versions_${templateId}`;
    localStorage.removeItem(key);
    localStorage.removeItem(versionsKey);
    return true;
  }

  private async saveToAPI(version: TemplateVersion): Promise<void> {
    if (!this.options.apiEndpoint) {
      throw new Error('API endpoint not configured');
    }

    const response = await fetch(`${this.options.apiEndpoint}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(version)
    });

    if (!response.ok) {
      throw new Error(`API save failed: ${response.statusText}`);
    }
  }

  private async loadFromAPI(templateId: string, version?: string): Promise<TemplateVersion | null> {
    if (!this.options.apiEndpoint) {
      return null;
    }

    const url = version 
      ? `${this.options.apiEndpoint}/templates/${templateId}/versions/${version}`
      : `${this.options.apiEndpoint}/templates/${templateId}`;

    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    return response.json();
  }

  private async getAllFromAPI(): Promise<TemplateVersion[]> {
    if (!this.options.apiEndpoint) {
      return [];
    }

    const response = await fetch(`${this.options.apiEndpoint}/templates`);
    if (!response.ok) {
      return [];
    }

    return response.json();
  }

  private async getVersionsFromAPI(templateId: string): Promise<TemplateVersion[]> {
    if (!this.options.apiEndpoint) {
      return [];
    }

    const response = await fetch(`${this.options.apiEndpoint}/templates/${templateId}/versions`);
    if (!response.ok) {
      return [];
    }

    return response.json();
  }

  private async deleteFromAPI(templateId: string, version?: string): Promise<boolean> {
    if (!this.options.apiEndpoint) {
      return true;
    }

    const url = version 
      ? `${this.options.apiEndpoint}/templates/${templateId}/versions/${version}`
      : `${this.options.apiEndpoint}/templates/${templateId}`;

    const response = await fetch(url, { method: 'DELETE' });
    return response.ok;
  }

  private generateVersion(manifest: TemplateManifest): string {
    const currentVersion = manifest.meta.version;
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }

  private async cleanupOldVersions(templateId: string): Promise<void> {
    const versions = await this.getTemplateVersions(templateId);
    if (versions.length <= this.options.maxVersions!) {
      return;
    }

    // Keep the most recent versions
    const versionsToKeep = versions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, this.options.maxVersions!);

    const versionsToDelete = versions.filter(v => 
      !versionsToKeep.some(k => k.id === v.id)
    );

    for (const version of versionsToDelete) {
      await this.deleteTemplate(templateId, version.version);
    }
  }

  private deduplicateTemplates(templates: TemplateVersion[]): TemplateVersion[] {
    const seen = new Set<string>();
    return templates.filter(template => {
      const key = `${template.manifest.id}_${template.version}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private validateManifest(manifest: any): manifest is TemplateManifest {
    return (
      manifest &&
      typeof manifest.id === 'string' &&
      typeof manifest.name === 'string' &&
      typeof manifest.slug === 'string' &&
      Array.isArray(manifest.components) &&
      manifest.meta &&
      typeof manifest.meta.version === 'string'
    );
  }

  private jsonToYaml(obj: any, indent = 0): string {
    const spaces = '  '.repeat(indent);
    let yaml = '';

    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        for (const item of value) {
          yaml += `${spaces}  - ${JSON.stringify(item)}\n`;
        }
      } else if (typeof value === 'object' && value !== null) {
        yaml += `${spaces}${key}:\n${this.jsonToYaml(value, indent + 1)}`;
      } else {
        yaml += `${spaces}${key}: ${JSON.stringify(value)}\n`;
      }
    }

    return yaml;
  }

  private yamlToJson(yaml: string): any {
    // Simple YAML to JSON conversion (would use a proper YAML library in production)
    // This is a basic implementation for demonstration
    const lines = yaml.split('\n');
    const result: any = {};
    let currentPath: string[] = [];
    let currentIndent = 0;

    for (const line of lines) {
      if (line.trim() === '') continue;

      const indent = line.match(/^(\s*)/)?.[1].length || 0;
      const content = line.trim();

      if (indent < currentIndent) {
        currentPath = currentPath.slice(0, indent / 2);
      }

      if (content.includes(':')) {
        const [key, ...valueParts] = content.split(':');
        const value = valueParts.join(':').trim();

        if (value === '') {
          currentPath.push(key.trim());
        } else {
          this.setNestedValue(result, [...currentPath, key.trim()], value);
        }
      }

      currentIndent = indent;
    }

    return result;
  }

  private setNestedValue(obj: any, path: string[], value: any): void {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
  }

  private startAutoSave(): void {
    this.autoSaveTimer = setInterval(() => {
      this.processPendingChanges();
    }, this.options.autoSaveInterval);
  }

  private async processPendingChanges(): Promise<void> {
    if (this.pendingChanges.size === 0) return;

    // In a real implementation, this would save pending changes
    // For now, we'll just clear the pending changes
    this.pendingChanges.clear();
  }

  // Cleanup
  destroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
  }
}

// Global instance
let globalTemplateStorage: TemplateStorage;

export function getTemplateStorage(): TemplateStorage {
  if (!globalTemplateStorage) {
    globalTemplateStorage = new TemplateStorage();
  }
  return globalTemplateStorage;
}

export function createTemplateStorage(options: TemplateStorageOptions): TemplateStorage {
  return new TemplateStorage(options);
}

export default TemplateStorage;
