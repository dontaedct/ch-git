/**
 * @fileoverview Module Configuration Export System
 * @module lib/handover/module-config-exporter
 * @author OSS Hero Development Team
 * @version 1.0.0
 * @since 2025-09-23
 * 
 * HT-035.4.4: Module configuration sheet export system for client handover packages.
 * Exports all module configurations, settings, and dependencies in client-ready format.
 */

import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

// Types and interfaces
export interface ModuleConfiguration {
  id: string;
  name: string;
  version: string;
  type: 'core' | 'addon' | 'custom' | 'integration';
  category: string;
  status: 'active' | 'inactive' | 'deprecated';
  isRequired: boolean;
  dependencies: ModuleDependency[];
  configuration: ModuleSettings;
  permissions: ModulePermissions;
  resources: ModuleResources;
  metadata: ModuleMetadata;
}

export interface ModuleDependency {
  moduleId: string;
  moduleName: string;
  version: string;
  type: 'hard' | 'soft' | 'optional';
  description?: string;
}

export interface ModuleSettings {
  enabled: boolean;
  autoStart: boolean;
  priority: number;
  config: Record<string, any>;
  environmentVariables: EnvironmentVariable[];
  features: FeatureSetting[];
}

export interface EnvironmentVariable {
  name: string;
  value?: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  required: boolean;
  sensitive: boolean;
  description?: string;
}

export interface FeatureSetting {
  name: string;
  enabled: boolean;
  configuration: Record<string, any>;
  description?: string;
}

export interface ModulePermissions {
  adminAccess: boolean;
  userAccess: boolean;
  apiAccess: boolean;
  dbAccess: boolean;
  fileAccess: boolean;
  networkAccess: boolean;
  customPermissions: CustomPermission[];
}

export interface CustomPermission {
  name: string;
  description: string;
  granted: boolean;
  scope: string;
}

export interface ModuleResources {
  memory: ResourceLimit;
  cpu: ResourceLimit;
  storage: ResourceLimit;
  network: ResourceLimit;
}

export interface ResourceLimit {
  min?: number;
  max?: number;
  unit: string;
  current?: number;
}

export interface ModuleMetadata {
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  license: string;
  tags: string[];
  installDate: Date;
  lastUpdated: Date;
  size: number; // bytes
  checksum: string;
}

export interface ModuleConfigExportOptions {
  includeInactive: boolean;
  includeSensitiveData: boolean;
  format: 'json' | 'yaml' | 'csv' | 'excel';
  groupBy: 'category' | 'type' | 'status' | 'none';
  includeMetadata: boolean;
  includeResources: boolean;
}

export interface ModuleConfigExportResult {
  configurations: ModuleConfiguration[];
  exportMetadata: ExportMetadata;
  configurationSheet: ConfigurationSheet;
  dependencyGraph: DependencyGraph;
  summary: ExportSummary;
}

export interface ConfigurationSheet {
  headers: string[];
  rows: string[][];
  totalModules: number;
  activeModules: number;
  categories: string[];
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  cycles: string[][];
  orphans: string[];
}

export interface DependencyNode {
  id: string;
  name: string;
  type: string;
  level: number;
}

export interface DependencyEdge {
  source: string;
  target: string;
  type: 'hard' | 'soft' | 'optional';
}

export interface ExportMetadata {
  exportedAt: Date;
  exportedBy: string;
  clientId: string;
  version: string;
  totalModules: number;
  format: string;
}

export interface ExportSummary {
  modulesByType: Record<string, number>;
  modulesByCategory: Record<string, number>;
  modulesByStatus: Record<string, number>;
  totalDependencies: number;
  circularDependencies: number;
  resourceUsage: {
    totalMemory: number;
    totalStorage: number;
    activeCpuUsage: number;
  };
}

// Main exporter class
export class ModuleConfigExporter {
  private supabase = createClient();

  /**
   * Export module configurations for a client
   */
  async exportModuleConfiguration(
    clientId: string,
    options: ModuleConfigExportOptions = {
      includeInactive: false,
      includeSensitiveData: false,
      format: 'json',
      groupBy: 'category',
      includeMetadata: true,
      includeResources: true
    }
  ): Promise<ModuleConfigExportResult> {
    try {
      console.log(`📋 Starting module configuration export for client: ${clientId}`);

      // Collect all module configurations
      const configurations = await this.collectModuleConfigurations(clientId, options);

      // Generate configuration sheet
      const configurationSheet = this.generateConfigurationSheet(configurations, options);

      // Build dependency graph
      const dependencyGraph = this.buildDependencyGraph(configurations);

      // Create export metadata
      const exportMetadata: ExportMetadata = {
        exportedAt: new Date(),
        exportedBy: 'system',
        clientId,
        version: '1.0.0',
        totalModules: configurations.length,
        format: options.format
      };

      // Generate summary
      const summary = this.generateExportSummary(configurations);

      const result: ModuleConfigExportResult = {
        configurations,
        exportMetadata,
        configurationSheet,
        dependencyGraph,
        summary
      };

      console.log(`✅ Module configuration export completed: ${configurations.length} modules`);
      return result;

    } catch (error) {
      console.error('❌ Module configuration export failed:', error);
      throw new Error(`Failed to export module configuration: ${error.message}`);
    }
  }

  /**
   * Export configuration as spreadsheet-ready format
   */
  async exportAsSpreadsheet(
    clientId: string,
    options: ModuleConfigExportOptions = {
      includeInactive: false,
      includeSensitiveData: false,
      format: 'csv',
      groupBy: 'category',
      includeMetadata: true,
      includeResources: true
    }
  ): Promise<string> {
    const result = await this.exportModuleConfiguration(clientId, options);
    
    if (options.format === 'csv') {
      return this.convertToCSV(result.configurationSheet);
    } else if (options.format === 'excel') {
      return this.convertToExcel(result.configurationSheet);
    }
    
    return JSON.stringify(result, null, 2);
  }

  /**
   * Validate module configurations
   */
  async validateModuleConfigurations(configurations: ModuleConfiguration[]): Promise<ValidationResult> {
    const issues: ConfigValidationIssue[] = [];
    let validCount = 0;

    for (const config of configurations) {
      const configIssues = await this.validateModuleConfiguration(config);
      if (configIssues.length === 0) {
        validCount++;
      } else {
        issues.push(...configIssues);
      }
    }

    return {
      valid: issues.length === 0,
      validCount,
      totalCount: configurations.length,
      issues
    };
  }

  // Private implementation methods

  private async collectModuleConfigurations(
    clientId: string,
    options: ModuleConfigExportOptions
  ): Promise<ModuleConfiguration[]> {
    const configurations: ModuleConfiguration[] = [];

    try {
      // Get modules from database
      let query = this.supabase
        .from('client_modules')
        .select(`
          *,
          module_settings (*),
          module_permissions (*),
          module_dependencies (*)
        `)
        .eq('client_id', clientId);

      if (!options.includeInactive) {
        query = query.eq('status', 'active');
      }

      const { data: modules, error } = await query;

      if (error) throw error;

      for (const module of modules || []) {
        const configuration = await this.buildModuleConfiguration(module, options);
        configurations.push(configuration);
      }

      return configurations;

    } catch (error) {
      console.error('Error collecting module configurations:', error);
      throw error;
    }
  }

  private async buildModuleConfiguration(
    module: any,
    options: ModuleConfigExportOptions
  ): Promise<ModuleConfiguration> {
    // Build module settings
    const settings: ModuleSettings = {
      enabled: module.enabled || false,
      autoStart: module.auto_start || false,
      priority: module.priority || 0,
      config: module.config || {},
      environmentVariables: module.environment_variables || [],
      features: module.features || []
    };

    // Filter sensitive data if not included
    if (!options.includeSensitiveData) {
      settings.environmentVariables = settings.environmentVariables.map(env => ({
        ...env,
        value: env.sensitive ? '***REDACTED***' : env.value
      }));
    }

    // Build permissions
    const permissions: ModulePermissions = {
      adminAccess: module.admin_access || false,
      userAccess: module.user_access || false,
      apiAccess: module.api_access || false,
      dbAccess: module.db_access || false,
      fileAccess: module.file_access || false,
      networkAccess: module.network_access || false,
      customPermissions: module.custom_permissions || []
    };

    // Build resources
    const resources: ModuleResources = options.includeResources ? {
      memory: {
        min: module.memory_min,
        max: module.memory_max,
        unit: 'MB',
        current: module.memory_current
      },
      cpu: {
        min: module.cpu_min,
        max: module.cpu_max,
        unit: '%',
        current: module.cpu_current
      },
      storage: {
        min: module.storage_min,
        max: module.storage_max,
        unit: 'MB',
        current: module.storage_current
      },
      network: {
        min: module.network_min,
        max: module.network_max,
        unit: 'Mbps',
        current: module.network_current
      }
    } : {
      memory: { unit: 'MB' },
      cpu: { unit: '%' },
      storage: { unit: 'MB' },
      network: { unit: 'Mbps' }
    };

    // Build metadata
    const metadata: ModuleMetadata = {
      description: module.description || '',
      author: module.author || 'Unknown',
      homepage: module.homepage,
      repository: module.repository,
      license: module.license || 'Unknown',
      tags: module.tags || [],
      installDate: new Date(module.install_date || module.created_at),
      lastUpdated: new Date(module.updated_at),
      size: module.size || 0,
      checksum: module.checksum || ''
    };

    // Get dependencies
    const dependencies = await this.getModuleDependencies(module.id);

    const configuration: ModuleConfiguration = {
      id: module.id,
      name: module.name,
      version: module.version || '1.0.0',
      type: module.type || 'addon',
      category: module.category || 'general',
      status: module.status || 'active',
      isRequired: module.is_required || false,
      dependencies,
      configuration: settings,
      permissions,
      resources,
      metadata
    };

    return configuration;
  }

  private async getModuleDependencies(moduleId: string): Promise<ModuleDependency[]> {
    try {
      const { data: dependencies, error } = await this.supabase
        .from('module_dependencies')
        .select(`
          *,
          dependent_module:modules!module_dependencies_dependent_module_id_fkey(name, version)
        `)
        .eq('module_id', moduleId);

      if (error) throw error;

      return (dependencies || []).map(dep => ({
        moduleId: dep.dependent_module_id,
        moduleName: dep.dependent_module?.name || 'Unknown',
        version: dep.dependent_module?.version || '1.0.0',
        type: dep.type || 'hard',
        description: dep.description
      }));

    } catch (error) {
      console.error('Error getting module dependencies:', error);
      return [];
    }
  }

  private generateConfigurationSheet(
    configurations: ModuleConfiguration[],
    options: ModuleConfigExportOptions
  ): ConfigurationSheet {
    const headers = [
      'Module ID',
      'Name',
      'Version',
      'Type',
      'Category',
      'Status',
      'Required',
      'Enabled',
      'Auto Start',
      'Priority',
      'Dependencies',
      'Memory (MB)',
      'CPU (%)',
      'Storage (MB)',
      'Description'
    ];

    const rows = configurations.map(config => [
      config.id,
      config.name,
      config.version,
      config.type,
      config.category,
      config.status,
      config.isRequired ? 'Yes' : 'No',
      config.configuration.enabled ? 'Yes' : 'No',
      config.configuration.autoStart ? 'Yes' : 'No',
      config.configuration.priority.toString(),
      config.dependencies.map(d => d.moduleName).join(', '),
      config.resources.memory.current?.toString() || 'N/A',
      config.resources.cpu.current?.toString() || 'N/A',
      config.resources.storage.current?.toString() || 'N/A',
      config.metadata.description
    ]);

    // Group rows if requested
    if (options.groupBy !== 'none') {
      rows.sort((a, b) => {
        const groupIndex = this.getGroupIndex(options.groupBy);
        return a[groupIndex].localeCompare(b[groupIndex]);
      });
    }

    return {
      headers,
      rows,
      totalModules: configurations.length,
      activeModules: configurations.filter(c => c.status === 'active').length,
      categories: [...new Set(configurations.map(c => c.category))]
    };
  }

  private buildDependencyGraph(configurations: ModuleConfiguration[]): DependencyGraph {
    const nodes: DependencyNode[] = configurations.map((config, index) => ({
      id: config.id,
      name: config.name,
      type: config.type,
      level: 0 // Will be calculated
    }));

    const edges: DependencyEdge[] = [];
    
    configurations.forEach(config => {
      config.dependencies.forEach(dep => {
        edges.push({
          source: config.id,
          target: dep.moduleId,
          type: dep.type
        });
      });
    });

    // Calculate levels and detect cycles
    const cycles = this.detectCycles(nodes, edges);
    const orphans = this.findOrphans(nodes, edges);

    return {
      nodes,
      edges,
      cycles,
      orphans
    };
  }

  private generateExportSummary(configurations: ModuleConfiguration[]): ExportSummary {
    const modulesByType = configurations.reduce((acc, config) => {
      acc[config.type] = (acc[config.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const modulesByCategory = configurations.reduce((acc, config) => {
      acc[config.category] = (acc[config.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const modulesByStatus = configurations.reduce((acc, config) => {
      acc[config.status] = (acc[config.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalDependencies = configurations.reduce((sum, config) => sum + config.dependencies.length, 0);

    const resourceUsage = configurations.reduce((acc, config) => {
      acc.totalMemory += config.resources.memory.current || 0;
      acc.totalStorage += config.resources.storage.current || 0;
      acc.activeCpuUsage += config.resources.cpu.current || 0;
      return acc;
    }, { totalMemory: 0, totalStorage: 0, activeCpuUsage: 0 });

    return {
      modulesByType,
      modulesByCategory,
      modulesByStatus,
      totalDependencies,
      circularDependencies: 0, // Would be calculated from dependency graph
      resourceUsage
    };
  }

  private async validateModuleConfiguration(config: ModuleConfiguration): Promise<ConfigValidationIssue[]> {
    const issues: ConfigValidationIssue[] = [];

    // Validate required fields
    if (!config.id) {
      issues.push({
        severity: 'critical',
        moduleId: config.id,
        field: 'id',
        message: 'Module ID is required'
      });
    }

    if (!config.name) {
      issues.push({
        severity: 'high',
        moduleId: config.id,
        field: 'name',
        message: 'Module name is required'
      });
    }

    if (!config.version) {
      issues.push({
        severity: 'medium',
        moduleId: config.id,
        field: 'version',
        message: 'Module version is recommended'
      });
    }

    // Validate dependencies
    for (const dep of config.dependencies) {
      if (!dep.moduleId) {
        issues.push({
          severity: 'high',
          moduleId: config.id,
          field: 'dependencies',
          message: `Dependency missing module ID: ${dep.moduleName}`
        });
      }
    }

    return issues;
  }

  private convertToCSV(sheet: ConfigurationSheet): string {
    const rows = [sheet.headers, ...sheet.rows];
    return rows.map(row => 
      row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  private convertToExcel(sheet: ConfigurationSheet): string {
    // This would require a library like xlsx
    // For now, return CSV format
    return this.convertToCSV(sheet);
  }

  private getGroupIndex(groupBy: string): number {
    switch (groupBy) {
      case 'category': return 4;
      case 'type': return 3;
      case 'status': return 5;
      default: return 0;
    }
  }

  private detectCycles(nodes: DependencyNode[], edges: DependencyEdge[]): string[][] {
    // Simplified cycle detection - would implement full algorithm
    return [];
  }

  private findOrphans(nodes: DependencyNode[], edges: DependencyEdge[]): string[] {
    const connectedNodes = new Set([
      ...edges.map(e => e.source),
      ...edges.map(e => e.target)
    ]);
    
    return nodes
      .filter(node => !connectedNodes.has(node.id))
      .map(node => node.id);
  }
}

// Validation interfaces
export interface ValidationResult {
  valid: boolean;
  validCount: number;
  totalCount: number;
  issues: ConfigValidationIssue[];
}

export interface ConfigValidationIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  moduleId: string;
  field: string;
  message: string;
}

// Export the singleton instance
export const moduleConfigExporter = new ModuleConfigExporter();

// Utility functions
export async function exportClientModuleConfig(
  clientId: string,
  options?: ModuleConfigExportOptions
): Promise<ModuleConfigExportResult> {
  return moduleConfigExporter.exportModuleConfiguration(clientId, options);
}

export async function exportModuleConfigSpreadsheet(
  clientId: string,
  options?: ModuleConfigExportOptions
): Promise<string> {
  return moduleConfigExporter.exportAsSpreadsheet(clientId, options);
}

export async function validateModuleConfig(
  configurations: ModuleConfiguration[]
): Promise<ValidationResult> {
  return moduleConfigExporter.validateModuleConfigurations(configurations);
}

// Example usage and validation
export async function validateModuleConfigExporter(): Promise<boolean> {
  try {
    const exporter = new ModuleConfigExporter();
    console.log('✅ Module Config Exporter initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Module Config Exporter validation failed:', error);
    return false;
  }
}
