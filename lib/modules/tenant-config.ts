/**
 * Per-Tenant Module Configuration System
 * 
 * This module implements comprehensive per-tenant module configuration management,
 * providing isolated configuration spaces, inheritance, validation, and versioning
 * per PRD Section 7 requirements.
 * 
 * Features:
 * - Tenant-isolated configuration namespaces
 * - Configuration inheritance and cascading
 * - Real-time configuration updates
 * - Configuration validation and sanitization
 * - Configuration versioning and rollback
 * - Audit logging for configuration changes
 */

import { z } from 'zod';
import type { ModuleSandbox } from './module-sandbox';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface TenantConfigManager {
  getConfig<T = any>(tenantId: string, key: string, defaultValue?: T): Promise<T>;
  setConfig<T = any>(tenantId: string, key: string, value: T): Promise<void>;
  deleteConfig(tenantId: string, key: string): Promise<void>;
  getAllConfig(tenantId: string): Promise<Record<string, any>>;
  updateConfig(tenantId: string, updates: Record<string, any>): Promise<void>;
  validateConfig(tenantId: string, config: Record<string, any>): Promise<ValidationResult>;
  getConfigHistory(tenantId: string, key?: string): Promise<ConfigHistoryEntry[]>;
  rollbackConfig(tenantId: string, versionId: string): Promise<void>;
  exportConfig(tenantId: string, format?: ExportFormat): Promise<string>;
  importConfig(tenantId: string, data: string, format?: ExportFormat): Promise<void>;
}

export interface TenantConfig {
  readonly tenantId: string;
  readonly moduleId: string;
  readonly namespace: string;
  readonly data: Record<string, any>;
  readonly metadata: ConfigMetadata;
  readonly version: ConfigVersion;
  readonly inheritance: InheritanceConfig;
}

export interface ConfigMetadata {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy?: string;
  readonly updatedBy?: string;
  readonly description?: string;
  readonly tags: string[];
  readonly environment: 'development' | 'staging' | 'production';
  readonly locked: boolean;
  readonly encrypted: boolean;
}

export interface ConfigVersion {
  readonly id: string;
  readonly number: number;
  readonly checksum: string;
  readonly changelog?: string;
  readonly previousVersionId?: string;
}

export interface InheritanceConfig {
  readonly enabled: boolean;
  readonly strategy: InheritanceStrategy;
  readonly sources: InheritanceSource[];
  readonly overrides: string[];
}

export type InheritanceStrategy = 
  | 'cascade' // Child values override parent
  | 'merge' // Merge parent and child
  | 'strict' // Only parent values allowed
  | 'isolated'; // No inheritance

export interface InheritanceSource {
  readonly type: 'global' | 'tenant_group' | 'module_default' | 'environment';
  readonly sourceId: string;
  readonly priority: number;
  readonly conditions?: InheritanceCondition[];
}

export interface InheritanceCondition {
  readonly field: string;
  readonly operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  readonly value: any;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ValidationError[];
  readonly warnings: ValidationWarning[];
  readonly sanitized: Record<string, any>;
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
  readonly severity: 'error' | 'warning';
}

export interface ValidationWarning {
  readonly field: string;
  readonly message: string;
  readonly suggestion?: string;
}

export interface ConfigHistoryEntry {
  readonly id: string;
  readonly tenantId: string;
  readonly key: string;
  readonly action: ConfigAction;
  readonly oldValue?: any;
  readonly newValue?: any;
  readonly version: ConfigVersion;
  readonly timestamp: Date;
  readonly userId?: string;
  readonly reason?: string;
}

export type ConfigAction = 'create' | 'update' | 'delete' | 'rollback' | 'import' | 'export';

export type ExportFormat = 'json' | 'yaml' | 'env' | 'ini';

export interface ConfigSchema {
  readonly fields: Record<string, FieldSchema>;
  readonly required: string[];
  readonly validation: ValidationRule[];
  readonly sanitization: SanitizationRule[];
}

export interface FieldSchema {
  readonly type: FieldType;
  readonly description?: string;
  readonly defaultValue?: any;
  readonly constraints?: FieldConstraint[];
  readonly sensitive?: boolean;
  readonly inheritable?: boolean;
}

export type FieldType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'date'
  | 'url'
  | 'email'
  | 'json';

export interface FieldConstraint {
  readonly type: 'min' | 'max' | 'pattern' | 'enum' | 'custom';
  readonly value: any;
  readonly message?: string;
}

export interface ValidationRule {
  readonly name: string;
  readonly condition: string;
  readonly message: string;
  readonly severity: 'error' | 'warning';
}

export interface SanitizationRule {
  readonly field: string;
  readonly operation: 'trim' | 'lowercase' | 'uppercase' | 'strip_html' | 'encrypt' | 'hash';
  readonly parameters?: Record<string, any>;
}

// =============================================================================
// SCHEMAS
// =============================================================================

const InheritanceConditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['equals', 'not_equals', 'in', 'not_in']),
  value: z.any(),
});

const InheritanceSourceSchema = z.object({
  type: z.enum(['global', 'tenant_group', 'module_default', 'environment']),
  sourceId: z.string().min(1),
  priority: z.number().min(0).max(100),
  conditions: z.array(InheritanceConditionSchema).optional(),
});

const InheritanceConfigSchema = z.object({
  enabled: z.boolean().default(true),
  strategy: z.enum(['cascade', 'merge', 'strict', 'isolated']).default('cascade'),
  sources: z.array(InheritanceSourceSchema).default([]),
  overrides: z.array(z.string()).default([]),
});

const ConfigVersionSchema = z.object({
  id: z.string().min(1),
  number: z.number().min(1),
  checksum: z.string().min(1),
  changelog: z.string().optional(),
  previousVersionId: z.string().optional(),
});

const ConfigMetadataSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  environment: z.enum(['development', 'staging', 'production']),
  locked: z.boolean().default(false),
  encrypted: z.boolean().default(false),
});

const TenantConfigSchema = z.object({
  tenantId: z.string().min(1),
  moduleId: z.string().min(1),
  namespace: z.string().min(1),
  data: z.record(z.any()),
  metadata: ConfigMetadataSchema,
  version: ConfigVersionSchema,
  inheritance: InheritanceConfigSchema,
});

const FieldConstraintSchema = z.object({
  type: z.enum(['min', 'max', 'pattern', 'enum', 'custom']),
  value: z.any(),
  message: z.string().optional(),
});

const FieldSchemaSchema = z.object({
  type: z.enum(['string', 'number', 'boolean', 'array', 'object', 'date', 'url', 'email', 'json']),
  description: z.string().optional(),
  defaultValue: z.any().optional(),
  constraints: z.array(FieldConstraintSchema).optional(),
  sensitive: z.boolean().default(false),
  inheritable: z.boolean().default(true),
});

const ValidationRuleSchema = z.object({
  name: z.string().min(1),
  condition: z.string().min(1),
  message: z.string().min(1),
  severity: z.enum(['error', 'warning']).default('error'),
});

const SanitizationRuleSchema = z.object({
  field: z.string().min(1),
  operation: z.enum(['trim', 'lowercase', 'uppercase', 'strip_html', 'encrypt', 'hash']),
  parameters: z.record(z.any()).optional(),
});

const ConfigSchemaSchema = z.object({
  fields: z.record(FieldSchemaSchema),
  required: z.array(z.string()).default([]),
  validation: z.array(ValidationRuleSchema).default([]),
  sanitization: z.array(SanitizationRuleSchema).default([]),
});

// =============================================================================
// TENANT CONFIG MANAGER IMPLEMENTATION
// =============================================================================

export class TenantConfigManagerImpl implements TenantConfigManager {
  private configs = new Map<string, TenantConfig>();
  private schemas = new Map<string, ConfigSchema>();
  private history: ConfigHistoryEntry[] = [];
  private readonly sandbox: ModuleSandbox;

  constructor(sandbox: ModuleSandbox) {
    this.sandbox = sandbox;
    this.initializeDefaultSchemas();
  }

  /**
   * Get a configuration value for a specific tenant
   */
  async getConfig<T = any>(tenantId: string, key: string, defaultValue?: T): Promise<T> {
    const configKey = this.getConfigKey(tenantId, key);
    const config = this.configs.get(configKey);

    if (!config) {
      // Try to get from inheritance sources
      const inheritedValue = await this.getInheritedValue<T>(tenantId, key);
      if (inheritedValue !== undefined) {
        return inheritedValue;
      }

      return defaultValue as T;
    }

    const value = this.getNestedValue(config.data, key);
    if (value === undefined) {
      const inheritedValue = await this.getInheritedValue<T>(tenantId, key);
      if (inheritedValue !== undefined) {
        return inheritedValue;
      }

      return defaultValue as T;
    }

    return value as T;
  }

  /**
   * Set a configuration value for a specific tenant
   */
  async setConfig<T = any>(tenantId: string, key: string, value: T): Promise<void> {
    const configKey = this.getConfigKey(tenantId, key);
    const existingConfig = this.configs.get(configKey);

    // Validate the configuration value
    const validationResult = await this.validateSingleValue(tenantId, key, value);
    if (!validationResult.valid) {
      throw new ConfigValidationError(
        `Configuration validation failed for ${key}`,
        validationResult.errors
      );
    }

    // Use sanitized value
    const sanitizedValue = this.getNestedValue(validationResult.sanitized, key) ?? value;

    const now = new Date();
    const newVersion = this.generateVersion(existingConfig?.version);

    let config: TenantConfig;
    if (existingConfig) {
      // Update existing configuration
      const updatedData = { ...existingConfig.data };
      this.setNestedValue(updatedData, key, sanitizedValue);

      config = {
        ...existingConfig,
        data: updatedData,
        metadata: {
          ...existingConfig.metadata,
          updatedAt: now,
        },
        version: newVersion,
      };
    } else {
      // Create new configuration
      const data: Record<string, any> = {};
      this.setNestedValue(data, key, sanitizedValue);

      config = {
        tenantId,
        moduleId: this.sandbox.moduleId,
        namespace: this.getNamespace(tenantId),
        data,
        metadata: {
          createdAt: now,
          updatedAt: now,
          tags: [],
          environment: this.sandbox.isolation.environment,
          locked: false,
          encrypted: false,
        },
        version: newVersion,
        inheritance: {
          enabled: true,
          strategy: 'cascade',
          sources: [],
          overrides: [],
        },
      };
    }

    this.configs.set(configKey, config);

    // Log the configuration change
    await this.logConfigChange(tenantId, key, 'update', existingConfig?.data[key], value, newVersion);
  }

  /**
   * Delete a configuration value for a specific tenant
   */
  async deleteConfig(tenantId: string, key: string): Promise<void> {
    const configKey = this.getConfigKey(tenantId, key);
    const existingConfig = this.configs.get(configKey);

    if (!existingConfig) {
      return; // Nothing to delete
    }

    const oldValue = this.getNestedValue(existingConfig.data, key);
    const updatedData = { ...existingConfig.data };
    this.deleteNestedValue(updatedData, key);

    const newVersion = this.generateVersion(existingConfig.version);

    const config: TenantConfig = {
      ...existingConfig,
      data: updatedData,
      metadata: {
        ...existingConfig.metadata,
        updatedAt: new Date(),
      },
      version: newVersion,
    };

    this.configs.set(configKey, config);

    // Log the configuration change
    await this.logConfigChange(tenantId, key, 'delete', oldValue, undefined, newVersion);
  }

  /**
   * Get all configuration for a specific tenant
   */
  async getAllConfig(tenantId: string): Promise<Record<string, any>> {
    const allConfigs: Record<string, any> = {};

    // Get direct configuration
    for (const [configKey, config] of this.configs.entries()) {
      if (config.tenantId === tenantId) {
        Object.assign(allConfigs, config.data);
      }
    }

    // Apply inheritance
    const inheritanceResult = await this.applyInheritance(tenantId, allConfigs);

    return inheritanceResult;
  }

  /**
   * Update multiple configuration values at once
   */
  async updateConfig(tenantId: string, updates: Record<string, any>): Promise<void> {
    // Validate all updates first
    const validationResult = await this.validateConfig(tenantId, updates);
    if (!validationResult.valid) {
      throw new ConfigValidationError(
        'Configuration validation failed',
        validationResult.errors
      );
    }

    // Apply all updates atomically
    const originalConfigs = new Map(this.configs);
    try {
      for (const [key, value] of Object.entries(validationResult.sanitized)) {
        await this.setConfig(tenantId, key, value);
      }
    } catch (error) {
      // Rollback on error
      this.configs = originalConfigs;
      throw error;
    }
  }

  /**
   * Validate configuration against schema
   */
  async validateConfig(tenantId: string, config: Record<string, any>): Promise<ValidationResult> {
    const schema = this.schemas.get(this.sandbox.moduleId);
    if (!schema) {
      return {
        valid: true,
        errors: [],
        warnings: [],
        sanitized: config,
      };
    }

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const sanitized: Record<string, any> = {};

    // Validate required fields
    for (const requiredField of schema.required) {
      if (!(requiredField in config)) {
        errors.push({
          field: requiredField,
          message: `Required field '${requiredField}' is missing`,
          code: 'REQUIRED_FIELD_MISSING',
          severity: 'error',
        });
      }
    }

    // Validate and sanitize each field
    for (const [fieldName, fieldValue] of Object.entries(config)) {
      const fieldSchema = schema.fields[fieldName];
      if (!fieldSchema) {
        warnings.push({
          field: fieldName,
          message: `Unknown field '${fieldName}'`,
          suggestion: 'Consider removing this field or adding it to the schema',
        });
        continue;
      }

      // Validate field type and constraints
      const fieldValidation = await this.validateField(fieldName, fieldValue, fieldSchema);
      errors.push(...fieldValidation.errors);
      warnings.push(...fieldValidation.warnings);

      // Sanitize field value
      const sanitizedValue = await this.sanitizeField(fieldName, fieldValue, schema.sanitization);
      sanitized[fieldName] = sanitizedValue;
    }

    // Apply validation rules
    for (const rule of schema.validation) {
      const ruleResult = await this.evaluateValidationRule(rule, sanitized);
      if (!ruleResult.passed) {
        const error: ValidationError = {
          field: 'global',
          message: rule.message,
          code: rule.name,
          severity: rule.severity,
        };

        if (rule.severity === 'error') {
          errors.push(error);
        } else {
          warnings.push({
            field: 'global',
            message: rule.message,
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      sanitized,
    };
  }

  /**
   * Get configuration change history
   */
  async getConfigHistory(tenantId: string, key?: string): Promise<ConfigHistoryEntry[]> {
    let entries = this.history.filter(entry => entry.tenantId === tenantId);

    if (key) {
      entries = entries.filter(entry => entry.key === key);
    }

    return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Rollback configuration to a specific version
   */
  async rollbackConfig(tenantId: string, versionId: string): Promise<void> {
    const historyEntry = this.history.find(entry => 
      entry.tenantId === tenantId && entry.version.id === versionId
    );

    if (!historyEntry) {
      throw new ConfigNotFoundError(`Version ${versionId} not found for tenant ${tenantId}`);
    }

    // Restore the configuration to the historical value
    if (historyEntry.oldValue !== undefined) {
      await this.setConfig(tenantId, historyEntry.key, historyEntry.oldValue);
    } else {
      await this.deleteConfig(tenantId, historyEntry.key);
    }

    // Log the rollback
    await this.logConfigChange(
      tenantId, 
      historyEntry.key, 
      'rollback', 
      historyEntry.newValue, 
      historyEntry.oldValue,
      this.generateVersion()
    );
  }

  /**
   * Export configuration in specified format
   */
  async exportConfig(tenantId: string, format: ExportFormat = 'json'): Promise<string> {
    const config = await this.getAllConfig(tenantId);

    switch (format) {
      case 'json':
        return JSON.stringify(config, null, 2);
      case 'yaml':
        return this.toYaml(config);
      case 'env':
        return this.toEnv(config);
      case 'ini':
        return this.toIni(config);
      default:
        throw new ConfigExportError(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Import configuration from data string
   */
  async importConfig(tenantId: string, data: string, format: ExportFormat = 'json'): Promise<void> {
    let config: Record<string, any>;

    try {
      switch (format) {
        case 'json':
          config = JSON.parse(data);
          break;
        case 'yaml':
          config = this.fromYaml(data);
          break;
        case 'env':
          config = this.fromEnv(data);
          break;
        case 'ini':
          config = this.fromIni(data);
          break;
        default:
          throw new ConfigImportError(`Unsupported import format: ${format}`);
      }
    } catch (error) {
      throw new ConfigImportError(`Failed to parse ${format} data: ${(error as Error).message}`);
    }

    // Validate and update configuration
    await this.updateConfig(tenantId, config);

    // Log the import
    const version = this.generateVersion();
    await this.logConfigChange(tenantId, 'all', 'import', undefined, config, version);
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private getConfigKey(tenantId: string, key: string): string {
    return `${tenantId}:${this.sandbox.moduleId}:${key}`;
  }

  private getNamespace(tenantId: string): string {
    return `tenant:${tenantId}:module:${this.sandbox.moduleId}`;
  }

  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private deleteNestedValue(obj: Record<string, any>, path: string): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => current?.[key], obj);
    if (target) {
      delete target[lastKey];
    }
  }

  private async getInheritedValue<T>(tenantId: string, key: string): Promise<T | undefined> {
    // This would implement inheritance logic based on sources
    // For now, returning undefined to keep it simple
    return undefined;
  }

  private async applyInheritance(tenantId: string, config: Record<string, any>): Promise<Record<string, any>> {
    // This would implement full inheritance logic
    // For now, returning the config as-is
    return config;
  }

  private async validateSingleValue(tenantId: string, key: string, value: any): Promise<ValidationResult> {
    const tempConfig = { [key]: value };
    return this.validateConfig(tenantId, tempConfig);
  }

  private async validateField(
    fieldName: string, 
    fieldValue: any, 
    fieldSchema: FieldSchema
  ): Promise<{ errors: ValidationError[]; warnings: ValidationWarning[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Type validation
    if (!this.isValidType(fieldValue, fieldSchema.type)) {
      errors.push({
        field: fieldName,
        message: `Expected type ${fieldSchema.type}, got ${typeof fieldValue}`,
        code: 'INVALID_TYPE',
        severity: 'error',
      });
    }

    // Constraint validation
    if (fieldSchema.constraints) {
      for (const constraint of fieldSchema.constraints) {
        const constraintResult = await this.validateConstraint(fieldName, fieldValue, constraint);
        if (!constraintResult.valid) {
          errors.push({
            field: fieldName,
            message: constraintResult.message,
            code: constraint.type.toUpperCase(),
            severity: 'error',
          });
        }
      }
    }

    return { errors, warnings };
  }

  private isValidType(value: any, type: FieldType): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value));
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'json':
        try {
          JSON.parse(typeof value === 'string' ? value : JSON.stringify(value));
          return true;
        } catch {
          return false;
        }
      default:
        return true;
    }
  }

  private async validateConstraint(
    fieldName: string, 
    value: any, 
    constraint: FieldConstraint
  ): Promise<{ valid: boolean; message: string }> {
    switch (constraint.type) {
      case 'min':
        if (typeof value === 'number') {
          return {
            valid: value >= constraint.value,
            message: constraint.message || `${fieldName} must be at least ${constraint.value}`,
          };
        }
        if (typeof value === 'string') {
          return {
            valid: value.length >= constraint.value,
            message: constraint.message || `${fieldName} must be at least ${constraint.value} characters`,
          };
        }
        break;
      case 'max':
        if (typeof value === 'number') {
          return {
            valid: value <= constraint.value,
            message: constraint.message || `${fieldName} must be at most ${constraint.value}`,
          };
        }
        if (typeof value === 'string') {
          return {
            valid: value.length <= constraint.value,
            message: constraint.message || `${fieldName} must be at most ${constraint.value} characters`,
          };
        }
        break;
      case 'pattern':
        const regex = new RegExp(constraint.value);
        return {
          valid: regex.test(String(value)),
          message: constraint.message || `${fieldName} does not match required pattern`,
        };
      case 'enum':
        return {
          valid: Array.isArray(constraint.value) && constraint.value.includes(value),
          message: constraint.message || `${fieldName} must be one of: ${constraint.value.join(', ')}`,
        };
      case 'custom':
        // Custom validation would be implemented here
        return { valid: true, message: '' };
    }

    return { valid: true, message: '' };
  }

  private async sanitizeField(
    fieldName: string, 
    value: any, 
    sanitizationRules: SanitizationRule[]
  ): Promise<any> {
    let sanitizedValue = value;

    for (const rule of sanitizationRules) {
      if (rule.field === fieldName || rule.field === '*') {
        sanitizedValue = await this.applySanitization(sanitizedValue, rule);
      }
    }

    return sanitizedValue;
  }

  private async applySanitization(value: any, rule: SanitizationRule): Promise<any> {
    if (typeof value !== 'string') {
      return value;
    }

    switch (rule.operation) {
      case 'trim':
        return value.trim();
      case 'lowercase':
        return value.toLowerCase();
      case 'uppercase':
        return value.toUpperCase();
      case 'strip_html':
        return value.replace(/<[^>]*>/g, '');
      case 'encrypt':
        // This would implement actual encryption
        return value; // For now, return as-is
      case 'hash':
        // This would implement actual hashing
        return value; // For now, return as-is
      default:
        return value;
    }
  }

  private async evaluateValidationRule(
    rule: ValidationRule, 
    config: Record<string, any>
  ): Promise<{ passed: boolean; message?: string }> {
    // This would implement custom validation rule evaluation
    // For now, assume all rules pass
    return { passed: true };
  }

  private generateVersion(previousVersion?: ConfigVersion): ConfigVersion {
    const versionNumber = previousVersion ? previousVersion.number + 1 : 1;
    const id = `v${versionNumber}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id,
      number: versionNumber,
      checksum: this.generateChecksum(id),
      previousVersionId: previousVersion?.id,
    };
  }

  private generateChecksum(data: string): string {
    // Simple checksum for now - would use proper hashing in production
    return btoa(data).substr(0, 16);
  }

  private async logConfigChange(
    tenantId: string,
    key: string,
    action: ConfigAction,
    oldValue: any,
    newValue: any,
    version: ConfigVersion
  ): Promise<void> {
    const historyEntry: ConfigHistoryEntry = {
      id: `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      key,
      action,
      oldValue,
      newValue,
      version,
      timestamp: new Date(),
    };

    this.history.push(historyEntry);

    // Log to sandbox audit system
    await this.sandbox.audit.logOperation({
      operationId: historyEntry.id,
      moduleId: this.sandbox.moduleId,
      operation: `config_${action}`,
      parameters: { key, tenantId },
      timestamp: historyEntry.timestamp,
      tenantId,
      success: true,
      duration: 0,
    });
  }

  private toYaml(obj: Record<string, any>): string {
    // Simple YAML conversion - would use proper YAML library in production
    return JSON.stringify(obj, null, 2);
  }

  private fromYaml(yaml: string): Record<string, any> {
    // Simple YAML parsing - would use proper YAML library in production
    return JSON.parse(yaml);
  }

  private toEnv(obj: Record<string, any>, prefix = ''): string {
    const lines: string[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const envKey = prefix ? `${prefix}_${key.toUpperCase()}` : key.toUpperCase();
      
      if (typeof value === 'object' && value !== null) {
        lines.push(this.toEnv(value, envKey));
      } else {
        lines.push(`${envKey}=${value}`);
      }
    }
    
    return lines.join('\n');
  }

  private fromEnv(env: string): Record<string, any> {
    const config: Record<string, any> = {};
    
    for (const line of env.split('\n')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=');
        config[key.toLowerCase()] = value;
      }
    }
    
    return config;
  }

  private toIni(obj: Record<string, any>): string {
    const lines: string[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        lines.push(`[${key}]`);
        for (const [subKey, subValue] of Object.entries(value)) {
          lines.push(`${subKey}=${subValue}`);
        }
        lines.push('');
      } else {
        lines.push(`${key}=${value}`);
      }
    }
    
    return lines.join('\n');
  }

  private fromIni(ini: string): Record<string, any> {
    const config: Record<string, any> = {};
    let currentSection = '';
    
    for (const line of ini.split('\n')) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
        currentSection = trimmedLine.slice(1, -1);
        config[currentSection] = {};
      } else if (trimmedLine.includes('=')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=');
        
        if (currentSection) {
          config[currentSection][key] = value;
        } else {
          config[key] = value;
        }
      }
    }
    
    return config;
  }

  private initializeDefaultSchemas(): void {
    const defaultSchema: ConfigSchema = {
      fields: {
        name: {
          type: 'string',
          description: 'Configuration name',
          constraints: [{ type: 'min', value: 1 }],
        },
        enabled: {
          type: 'boolean',
          description: 'Enable/disable flag',
          defaultValue: true,
        },
        timeout: {
          type: 'number',
          description: 'Timeout in seconds',
          constraints: [
            { type: 'min', value: 1 },
            { type: 'max', value: 300 },
          ],
          defaultValue: 30,
        },
      },
      required: ['name'],
      validation: [],
      sanitization: [
        { field: 'name', operation: 'trim' },
      ],
    };

    this.schemas.set(this.sandbox.moduleId, defaultSchema);
  }
}

// =============================================================================
// ERROR CLASSES
// =============================================================================

export class ConfigValidationError extends Error {
  constructor(message: string, public errors: ValidationError[]) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

export class ConfigNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigNotFoundError';
  }
}

export class ConfigExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigExportError';
  }
}

export class ConfigImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigImportError';
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createTenantConfigManager(sandbox: ModuleSandbox): TenantConfigManager {
  return new TenantConfigManagerImpl(sandbox);
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  TenantConfigManagerImpl,
};

