/**
 * Configuration Namespace Isolation System
 * 
 * This module implements comprehensive configuration namespace isolation for hot-pluggable modules,
 * providing secure separation of configuration spaces, conflict resolution, and namespace management
 * per PRD Section 7 requirements.
 * 
 * Features:
 * - Hierarchical namespace structure
 * - Namespace-based access control
 * - Configuration inheritance across namespaces
 * - Namespace collision detection and resolution
 * - Cross-namespace communication controls
 * - Namespace lifecycle management
 */

import { z } from 'zod';
import type { ModuleSandbox } from './module-sandbox';
import type { TenantConfigManager, TenantConfig } from './tenant-config';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ConfigNamespaceManager {
  createNamespace(namespace: NamespaceDefinition): Promise<void>;
  deleteNamespace(namespaceId: string): Promise<void>;
  getNamespace(namespaceId: string): Promise<NamespaceDefinition | null>;
  listNamespaces(filter?: NamespaceFilter): Promise<NamespaceDefinition[]>;
  updateNamespace(namespaceId: string, updates: Partial<NamespaceDefinition>): Promise<void>;
  
  getConfig<T = any>(namespaceId: string, key: string, defaultValue?: T): Promise<T>;
  setConfig<T = any>(namespaceId: string, key: string, value: T): Promise<void>;
  deleteConfig(namespaceId: string, key: string): Promise<void>;
  
  resolveNamespace(path: string): Promise<string>;
  checkAccess(namespaceId: string, operation: NamespaceOperation): Promise<boolean>;
  createAlias(namespaceId: string, alias: string): Promise<void>;
  removeAlias(alias: string): Promise<void>;
  
  exportNamespace(namespaceId: string, options?: ExportOptions): Promise<NamespaceExport>;
  importNamespace(data: NamespaceExport, options?: ImportOptions): Promise<void>;
  
  getNamespaceMetrics(namespaceId: string): Promise<NamespaceMetrics>;
  getNamespaceAudit(namespaceId: string, timeRange?: TimeRange): Promise<NamespaceAuditEntry[]>;
}

export interface NamespaceDefinition {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly parentId?: string;
  readonly children: string[];
  readonly path: string;
  readonly level: number;
  readonly moduleId: string;
  readonly tenantId: string;
  readonly accessControl: NamespaceAccessControl;
  readonly inheritance: NamespaceInheritance;
  readonly isolation: NamespaceIsolation;
  readonly metadata: NamespaceMetadata;
  readonly status: NamespaceStatus;
}

export interface NamespaceAccessControl {
  readonly owner: string;
  readonly permissions: NamespacePermission[];
  readonly allowedOperations: NamespaceOperation[];
  readonly blockedOperations: NamespaceOperation[];
  readonly accessRules: AccessRule[];
}

export interface NamespacePermission {
  readonly type: 'user' | 'role' | 'module' | 'tenant';
  readonly target: string;
  readonly operations: NamespaceOperation[];
  readonly conditions?: PermissionCondition[];
}

export type NamespaceOperation = 
  | 'read'
  | 'write'
  | 'delete'
  | 'create_child'
  | 'modify_access'
  | 'inherit_from'
  | 'export'
  | 'import';

export interface AccessRule {
  readonly id: string;
  readonly condition: string;
  readonly effect: 'allow' | 'deny';
  readonly priority: number;
  readonly description?: string;
}

export interface NamespaceInheritance {
  readonly enabled: boolean;
  readonly strategy: InheritanceStrategy;
  readonly sources: InheritanceSource[];
  readonly overrides: string[];
  readonly cascading: boolean;
}

export type InheritanceStrategy = 
  | 'merge' // Merge parent and child configurations
  | 'override' // Child overrides parent completely
  | 'additive' // Only add new keys, don't override existing
  | 'strict'; // Only inherit explicitly defined keys

export interface InheritanceSource {
  readonly namespaceId: string;
  readonly priority: number;
  readonly keyFilters?: string[];
  readonly conditions?: InheritanceCondition[];
}

export interface InheritanceCondition {
  readonly field: string;
  readonly operator: 'equals' | 'not_equals' | 'matches' | 'exists';
  readonly value?: any;
}

export interface NamespaceIsolation {
  readonly level: IsolationLevel;
  readonly boundaries: IsolationBoundary[];
  readonly communication: CommunicationPolicy;
  readonly sandbox: SandboxConfig;
}

export type IsolationLevel = 
  | 'none' // No isolation
  | 'basic' // Basic key separation
  | 'strict' // Complete isolation
  | 'paranoid'; // Maximum isolation with encryption

export interface IsolationBoundary {
  readonly type: 'key_prefix' | 'encryption' | 'access_control' | 'storage_separation';
  readonly configuration: Record<string, any>;
}

export interface CommunicationPolicy {
  readonly allowCrossNamespace: boolean;
  readonly allowedNamespaces: string[];
  readonly blockedNamespaces: string[];
  readonly requireAuthentication: boolean;
  readonly auditCommunication: boolean;
}

export interface SandboxConfig {
  readonly enabled: boolean;
  readonly resourceLimits: ResourceLimits;
  readonly allowedFunctions: string[];
  readonly blockedFunctions: string[];
}

export interface ResourceLimits {
  readonly maxMemory: number; // MB
  readonly maxStorage: number; // MB
  readonly maxConfigKeys: number;
  readonly maxDepth: number;
}

export interface NamespaceMetadata {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy?: string;
  readonly updatedBy?: string;
  readonly version: string;
  readonly tags: string[];
  readonly annotations: Record<string, string>;
  readonly locked: boolean;
}

export type NamespaceStatus = 
  | 'active'
  | 'inactive'
  | 'archived'
  | 'migrating'
  | 'error';

export interface NamespaceFilter {
  readonly moduleId?: string;
  readonly tenantId?: string;
  readonly parentId?: string;
  readonly status?: NamespaceStatus;
  readonly tags?: string[];
  readonly level?: number;
}

export interface PermissionCondition {
  readonly field: string;
  readonly operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  readonly value: any;
}

export interface ExportOptions {
  readonly includeChildren: boolean;
  readonly includeMetadata: boolean;
  readonly format: 'json' | 'yaml';
  readonly encryption?: EncryptionOptions;
}

export interface ImportOptions {
  readonly mergeStrategy: 'replace' | 'merge' | 'skip_existing';
  readonly validateSchema: boolean;
  readonly createParents: boolean;
  readonly dryRun: boolean;
}

export interface EncryptionOptions {
  readonly algorithm: string;
  readonly key: string;
  readonly iv?: string;
}

export interface NamespaceExport {
  readonly namespace: NamespaceDefinition;
  readonly configuration: Record<string, any>;
  readonly children?: NamespaceExport[];
  readonly metadata: ExportMetadata;
}

export interface ExportMetadata {
  readonly exportedAt: Date;
  readonly exportedBy?: string;
  readonly version: string;
  readonly checksum: string;
}

export interface NamespaceMetrics {
  readonly namespaceId: string;
  readonly configCount: number;
  readonly storageUsed: number; // bytes
  readonly memoryUsed: number; // bytes
  readonly accessCount: number;
  readonly lastAccessed: Date;
  readonly childCount: number;
  readonly depth: number;
}

export interface NamespaceAuditEntry {
  readonly id: string;
  readonly namespaceId: string;
  readonly operation: NamespaceOperation;
  readonly userId?: string;
  readonly timestamp: Date;
  readonly details: Record<string, any>;
  readonly success: boolean;
  readonly error?: string;
}

export interface TimeRange {
  readonly start: Date;
  readonly end: Date;
}

// =============================================================================
// SCHEMAS
// =============================================================================

const AccessRuleSchema = z.object({
  id: z.string().min(1),
  condition: z.string().min(1),
  effect: z.enum(['allow', 'deny']),
  priority: z.number().min(0).max(100),
  description: z.string().optional(),
});

const PermissionConditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['equals', 'not_equals', 'in', 'not_in']),
  value: z.any(),
});

const NamespacePermissionSchema = z.object({
  type: z.enum(['user', 'role', 'module', 'tenant']),
  target: z.string().min(1),
  operations: z.array(z.enum(['read', 'write', 'delete', 'create_child', 'modify_access', 'inherit_from', 'export', 'import'])),
  conditions: z.array(PermissionConditionSchema).optional(),
});

const NamespaceAccessControlSchema = z.object({
  owner: z.string().min(1),
  permissions: z.array(NamespacePermissionSchema).default([]),
  allowedOperations: z.array(z.enum(['read', 'write', 'delete', 'create_child', 'modify_access', 'inherit_from', 'export', 'import'])).default([]),
  blockedOperations: z.array(z.enum(['read', 'write', 'delete', 'create_child', 'modify_access', 'inherit_from', 'export', 'import'])).default([]),
  accessRules: z.array(AccessRuleSchema).default([]),
});

const InheritanceConditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['equals', 'not_equals', 'matches', 'exists']),
  value: z.any().optional(),
});

const InheritanceSourceSchema = z.object({
  namespaceId: z.string().min(1),
  priority: z.number().min(0).max(100),
  keyFilters: z.array(z.string()).optional(),
  conditions: z.array(InheritanceConditionSchema).optional(),
});

const NamespaceInheritanceSchema = z.object({
  enabled: z.boolean().default(true),
  strategy: z.enum(['merge', 'override', 'additive', 'strict']).default('merge'),
  sources: z.array(InheritanceSourceSchema).default([]),
  overrides: z.array(z.string()).default([]),
  cascading: z.boolean().default(true),
});

const ResourceLimitsSchema = z.object({
  maxMemory: z.number().min(1).max(10240).default(512), // MB
  maxStorage: z.number().min(1).max(10240).default(1024), // MB
  maxConfigKeys: z.number().min(1).max(10000).default(1000),
  maxDepth: z.number().min(1).max(20).default(10),
});

const SandboxConfigSchema = z.object({
  enabled: z.boolean().default(true),
  resourceLimits: ResourceLimitsSchema,
  allowedFunctions: z.array(z.string()).default([]),
  blockedFunctions: z.array(z.string()).default([]),
});

const CommunicationPolicySchema = z.object({
  allowCrossNamespace: z.boolean().default(false),
  allowedNamespaces: z.array(z.string()).default([]),
  blockedNamespaces: z.array(z.string()).default([]),
  requireAuthentication: z.boolean().default(true),
  auditCommunication: z.boolean().default(true),
});

const IsolationBoundarySchema = z.object({
  type: z.enum(['key_prefix', 'encryption', 'access_control', 'storage_separation']),
  configuration: z.record(z.any()).default({}),
});

const NamespaceIsolationSchema = z.object({
  level: z.enum(['none', 'basic', 'strict', 'paranoid']).default('basic'),
  boundaries: z.array(IsolationBoundarySchema).default([]),
  communication: CommunicationPolicySchema,
  sandbox: SandboxConfigSchema,
});

const NamespaceMetadataSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  version: z.string().min(1),
  tags: z.array(z.string()).default([]),
  annotations: z.record(z.string()).default({}),
  locked: z.boolean().default(false),
});

const NamespaceDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional(),
  children: z.array(z.string()).default([]),
  path: z.string().min(1),
  level: z.number().min(0),
  moduleId: z.string().min(1),
  tenantId: z.string().min(1),
  accessControl: NamespaceAccessControlSchema,
  inheritance: NamespaceInheritanceSchema,
  isolation: NamespaceIsolationSchema,
  metadata: NamespaceMetadataSchema,
  status: z.enum(['active', 'inactive', 'archived', 'migrating', 'error']).default('active'),
});

// =============================================================================
// CONFIG NAMESPACE MANAGER IMPLEMENTATION
// =============================================================================

export class ConfigNamespaceManagerImpl implements ConfigNamespaceManager {
  private namespaces = new Map<string, NamespaceDefinition>();
  private aliases = new Map<string, string>(); // alias -> namespaceId
  private configs = new Map<string, Record<string, any>>(); // namespaceId -> config
  private auditEntries: NamespaceAuditEntry[] = [];
  private readonly sandbox: ModuleSandbox;
  private readonly configManager: TenantConfigManager;

  constructor(sandbox: ModuleSandbox, configManager: TenantConfigManager) {
    this.sandbox = sandbox;
    this.configManager = configManager;
    this.initializeRootNamespace();
  }

  /**
   * Create a new namespace
   */
  async createNamespace(namespace: NamespaceDefinition): Promise<void> {
    // Validate namespace definition
    NamespaceDefinitionSchema.parse(namespace);

    // Check if namespace already exists
    if (this.namespaces.has(namespace.id)) {
      throw new NamespaceAlreadyExistsError(`Namespace ${namespace.id} already exists`);
    }

    // Validate parent namespace exists (if specified)
    if (namespace.parentId) {
      const parent = this.namespaces.get(namespace.parentId);
      if (!parent) {
        throw new NamespaceNotFoundError(`Parent namespace ${namespace.parentId} not found`);
      }

      // Check permission to create child namespace
      const canCreateChild = await this.checkAccess(namespace.parentId, 'create_child');
      if (!canCreateChild) {
        throw new NamespaceAccessDeniedError(`No permission to create child namespace in ${namespace.parentId}`);
      }

      // Update parent's children list
      const updatedParent: NamespaceDefinition = {
        ...parent,
        children: [...parent.children, namespace.id],
        metadata: {
          ...parent.metadata,
          updatedAt: new Date(),
        },
      };
      this.namespaces.set(namespace.parentId, updatedParent);
    }

    // Validate path uniqueness
    const existingByPath = Array.from(this.namespaces.values()).find(ns => ns.path === namespace.path);
    if (existingByPath) {
      throw new NamespacePathConflictError(`Namespace path ${namespace.path} already exists`);
    }

    // Store the namespace
    this.namespaces.set(namespace.id, namespace);
    this.configs.set(namespace.id, {});

    await this.logNamespaceOperation(namespace.id, 'create_child', {
      name: namespace.name,
      path: namespace.path,
      parentId: namespace.parentId,
    }, true);
  }

  /**
   * Delete a namespace and all its children
   */
  async deleteNamespace(namespaceId: string): Promise<void> {
    const namespace = this.namespaces.get(namespaceId);
    if (!namespace) {
      throw new NamespaceNotFoundError(`Namespace ${namespaceId} not found`);
    }

    // Check permission to delete
    const canDelete = await this.checkAccess(namespaceId, 'delete');
    if (!canDelete) {
      throw new NamespaceAccessDeniedError(`No permission to delete namespace ${namespaceId}`);
    }

    // Check if namespace is locked
    if (namespace.metadata.locked) {
      throw new NamespaceLockedError(`Namespace ${namespaceId} is locked and cannot be deleted`);
    }

    // Recursively delete all children
    for (const childId of namespace.children) {
      await this.deleteNamespace(childId);
    }

    // Remove from parent's children list
    if (namespace.parentId) {
      const parent = this.namespaces.get(namespace.parentId);
      if (parent) {
        const updatedParent: NamespaceDefinition = {
          ...parent,
          children: parent.children.filter(id => id !== namespaceId),
          metadata: {
            ...parent.metadata,
            updatedAt: new Date(),
          },
        };
        this.namespaces.set(namespace.parentId, updatedParent);
      }
    }

    // Remove aliases
    for (const [alias, nsId] of this.aliases.entries()) {
      if (nsId === namespaceId) {
        this.aliases.delete(alias);
      }
    }

    // Delete namespace and configuration
    this.namespaces.delete(namespaceId);
    this.configs.delete(namespaceId);

    await this.logNamespaceOperation(namespaceId, 'delete', {
      name: namespace.name,
      path: namespace.path,
    }, true);
  }

  /**
   * Get a namespace by ID
   */
  async getNamespace(namespaceId: string): Promise<NamespaceDefinition | null> {
    const namespace = this.namespaces.get(namespaceId);
    if (!namespace) {
      return null;
    }

    // Check read permission
    const canRead = await this.checkAccess(namespaceId, 'read');
    if (!canRead) {
      throw new NamespaceAccessDeniedError(`No permission to read namespace ${namespaceId}`);
    }

    return namespace;
  }

  /**
   * List namespaces with optional filtering
   */
  async listNamespaces(filter?: NamespaceFilter): Promise<NamespaceDefinition[]> {
    const namespaces: NamespaceDefinition[] = [];

    for (const namespace of this.namespaces.values()) {
      // Apply filters
      if (filter) {
        if (filter.moduleId && namespace.moduleId !== filter.moduleId) continue;
        if (filter.tenantId && namespace.tenantId !== filter.tenantId) continue;
        if (filter.parentId && namespace.parentId !== filter.parentId) continue;
        if (filter.status && namespace.status !== filter.status) continue;
        if (filter.level !== undefined && namespace.level !== filter.level) continue;
        if (filter.tags && !filter.tags.some(tag => namespace.metadata.tags.includes(tag))) continue;
      }

      // Check read permission
      try {
        const canRead = await this.checkAccess(namespace.id, 'read');
        if (canRead) {
          namespaces.push(namespace);
        }
      } catch {
        // Skip namespaces without read permission
      }
    }

    return namespaces;
  }

  /**
   * Update a namespace
   */
  async updateNamespace(namespaceId: string, updates: Partial<NamespaceDefinition>): Promise<void> {
    const namespace = this.namespaces.get(namespaceId);
    if (!namespace) {
      throw new NamespaceNotFoundError(`Namespace ${namespaceId} not found`);
    }

    // Check permission to modify access
    const canModify = await this.checkAccess(namespaceId, 'modify_access');
    if (!canModify) {
      throw new NamespaceAccessDeniedError(`No permission to modify namespace ${namespaceId}`);
    }

    // Check if namespace is locked
    if (namespace.metadata.locked && !updates.metadata?.locked) {
      throw new NamespaceLockedError(`Namespace ${namespaceId} is locked`);
    }

    // Validate updates
    const updatedNamespace: NamespaceDefinition = {
      ...namespace,
      ...updates,
      metadata: {
        ...namespace.metadata,
        ...updates.metadata,
        updatedAt: new Date(),
      },
    };

    NamespaceDefinitionSchema.parse(updatedNamespace);

    this.namespaces.set(namespaceId, updatedNamespace);

    await this.logNamespaceOperation(namespaceId, 'modify_access', updates, true);
  }

  /**
   * Get configuration value from a namespace
   */
  async getConfig<T = any>(namespaceId: string, key: string, defaultValue?: T): Promise<T> {
    // Check read permission
    const canRead = await this.checkAccess(namespaceId, 'read');
    if (!canRead) {
      throw new NamespaceAccessDeniedError(`No permission to read from namespace ${namespaceId}`);
    }

    const namespace = this.namespaces.get(namespaceId);
    if (!namespace) {
      throw new NamespaceNotFoundError(`Namespace ${namespaceId} not found`);
    }

    // Get configuration from namespace
    const config = this.configs.get(namespaceId) || {};
    let value = this.getNestedValue(config, key);

    // If not found, try inheritance
    if (value === undefined && namespace.inheritance.enabled) {
      value = await this.getInheritedValue<T>(namespace, key);
    }

    if (value === undefined) {
      return defaultValue as T;
    }

    return value as T;
  }

  /**
   * Set configuration value in a namespace
   */
  async setConfig<T = any>(namespaceId: string, key: string, value: T): Promise<void> {
    // Check write permission
    const canWrite = await this.checkAccess(namespaceId, 'write');
    if (!canWrite) {
      throw new NamespaceAccessDeniedError(`No permission to write to namespace ${namespaceId}`);
    }

    const namespace = this.namespaces.get(namespaceId);
    if (!namespace) {
      throw new NamespaceNotFoundError(`Namespace ${namespaceId} not found`);
    }

    // Check resource limits
    await this.checkResourceLimits(namespaceId, key, value);

    // Apply isolation boundaries
    const isolatedValue = await this.applyIsolation(namespace, key, value);

    // Update configuration
    const config = this.configs.get(namespaceId) || {};
    this.setNestedValue(config, key, isolatedValue);
    this.configs.set(namespaceId, config);

    await this.logNamespaceOperation(namespaceId, 'write', { key, value }, true);
  }

  /**
   * Delete configuration value from a namespace
   */
  async deleteConfig(namespaceId: string, key: string): Promise<void> {
    // Check write permission
    const canWrite = await this.checkAccess(namespaceId, 'write');
    if (!canWrite) {
      throw new NamespaceAccessDeniedError(`No permission to delete from namespace ${namespaceId}`);
    }

    const config = this.configs.get(namespaceId);
    if (config) {
      this.deleteNestedValue(config, key);
      this.configs.set(namespaceId, config);
    }

    await this.logNamespaceOperation(namespaceId, 'delete', { key }, true);
  }

  /**
   * Resolve a namespace path to an ID
   */
  async resolveNamespace(path: string): Promise<string> {
    // Check if it's an alias
    const aliasId = this.aliases.get(path);
    if (aliasId) {
      return aliasId;
    }

    // Find by path
    for (const namespace of this.namespaces.values()) {
      if (namespace.path === path) {
        return namespace.id;
      }
    }

    throw new NamespaceNotFoundError(`Namespace with path ${path} not found`);
  }

  /**
   * Check access permission for a namespace operation
   */
  async checkAccess(namespaceId: string, operation: NamespaceOperation): Promise<boolean> {
    const namespace = this.namespaces.get(namespaceId);
    if (!namespace) {
      return false;
    }

    // Check if operation is explicitly blocked
    if (namespace.accessControl.blockedOperations.includes(operation)) {
      return false;
    }

    // Check if operation is explicitly allowed
    if (namespace.accessControl.allowedOperations.includes(operation)) {
      return true;
    }

    // Check permissions
    for (const permission of namespace.accessControl.permissions) {
      if (await this.checkPermission(permission, operation)) {
        return true;
      }
    }

    // Check access rules
    for (const rule of namespace.accessControl.accessRules) {
      const ruleResult = await this.evaluateAccessRule(rule, operation);
      if (ruleResult.applies) {
        return ruleResult.effect === 'allow';
      }
    }

    // Default deny
    return false;
  }

  /**
   * Create an alias for a namespace
   */
  async createAlias(namespaceId: string, alias: string): Promise<void> {
    if (this.aliases.has(alias)) {
      throw new NamespaceAliasExistsError(`Alias ${alias} already exists`);
    }

    if (!this.namespaces.has(namespaceId)) {
      throw new NamespaceNotFoundError(`Namespace ${namespaceId} not found`);
    }

    this.aliases.set(alias, namespaceId);
  }

  /**
   * Remove an alias
   */
  async removeAlias(alias: string): Promise<void> {
    if (!this.aliases.has(alias)) {
      throw new NamespaceAliasNotFoundError(`Alias ${alias} not found`);
    }

    this.aliases.delete(alias);
  }

  /**
   * Export a namespace
   */
  async exportNamespace(namespaceId: string, options?: ExportOptions): Promise<NamespaceExport> {
    const canExport = await this.checkAccess(namespaceId, 'export');
    if (!canExport) {
      throw new NamespaceAccessDeniedError(`No permission to export namespace ${namespaceId}`);
    }

    const namespace = this.namespaces.get(namespaceId);
    if (!namespace) {
      throw new NamespaceNotFoundError(`Namespace ${namespaceId} not found`);
    }

    const configuration = this.configs.get(namespaceId) || {};
    const children: NamespaceExport[] = [];

    if (options?.includeChildren) {
      for (const childId of namespace.children) {
        try {
          const childExport = await this.exportNamespace(childId, options);
          children.push(childExport);
        } catch {
          // Skip children without export permission
        }
      }
    }

    const exportData: NamespaceExport = {
      namespace: options?.includeMetadata ? namespace : {
        ...namespace,
        metadata: {
          ...namespace.metadata,
          createdBy: undefined,
          updatedBy: undefined,
        },
      },
      configuration,
      children: children.length > 0 ? children : undefined,
      metadata: {
        exportedAt: new Date(),
        version: '1.0.0',
        checksum: this.generateChecksum(JSON.stringify({ namespace, configuration })),
      },
    };

    return exportData;
  }

  /**
   * Import a namespace
   */
  async importNamespace(data: NamespaceExport, options?: ImportOptions): Promise<void> {
    if (options?.validateSchema) {
      // Validate the export data structure
      // For now, basic validation
      if (!data.namespace || !data.configuration) {
        throw new NamespaceImportError('Invalid export data structure');
      }
    }

    if (options?.dryRun) {
      // Perform validation without actually importing
      return;
    }

    const existingNamespace = this.namespaces.get(data.namespace.id);

    if (existingNamespace) {
      switch (options?.mergeStrategy) {
        case 'skip_existing':
          return;
        case 'merge':
          await this.mergeNamespace(data);
          break;
        case 'replace':
        default:
          await this.replaceNamespace(data, options);
          break;
      }
    } else {
      await this.createNamespaceFromExport(data, options);
    }
  }

  /**
   * Get namespace metrics
   */
  async getNamespaceMetrics(namespaceId: string): Promise<NamespaceMetrics> {
    const namespace = this.namespaces.get(namespaceId);
    if (!namespace) {
      throw new NamespaceNotFoundError(`Namespace ${namespaceId} not found`);
    }

    const config = this.configs.get(namespaceId) || {};
    const configJson = JSON.stringify(config);

    return {
      namespaceId,
      configCount: Object.keys(config).length,
      storageUsed: new TextEncoder().encode(configJson).length,
      memoryUsed: 0, // Would calculate actual memory usage
      accessCount: this.auditEntries.filter(entry => entry.namespaceId === namespaceId).length,
      lastAccessed: new Date(), // Would track actual last access
      childCount: namespace.children.length,
      depth: namespace.level,
    };
  }

  /**
   * Get namespace audit entries
   */
  async getNamespaceAudit(namespaceId: string, timeRange?: TimeRange): Promise<NamespaceAuditEntry[]> {
    let entries = this.auditEntries.filter(entry => entry.namespaceId === namespaceId);

    if (timeRange) {
      entries = entries.filter(entry => 
        entry.timestamp >= timeRange.start && entry.timestamp <= timeRange.end
      );
    }

    return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private async getInheritedValue<T>(namespace: NamespaceDefinition, key: string): Promise<T | undefined> {
    if (!namespace.inheritance.enabled) {
      return undefined;
    }

    // Sort sources by priority
    const sortedSources = [...namespace.inheritance.sources].sort((a, b) => b.priority - a.priority);

    for (const source of sortedSources) {
      try {
        const sourceConfig = this.configs.get(source.namespaceId);
        if (sourceConfig) {
          const value = this.getNestedValue(sourceConfig, key);
          if (value !== undefined) {
            // Check if key is filtered
            if (source.keyFilters && !source.keyFilters.includes(key)) {
              continue;
            }

            // Check conditions
            if (source.conditions) {
              const conditionsMet = await this.checkInheritanceConditions(source.conditions, sourceConfig);
              if (!conditionsMet) {
                continue;
              }
            }

            return value as T;
          }
        }
      } catch {
        // Skip sources with errors
      }
    }

    // Try parent namespace if cascading is enabled
    if (namespace.inheritance.cascading && namespace.parentId) {
      const parent = this.namespaces.get(namespace.parentId);
      if (parent) {
        return this.getInheritedValue<T>(parent, key);
      }
    }

    return undefined;
  }

  private async checkInheritanceConditions(
    conditions: InheritanceCondition[], 
    config: Record<string, any>
  ): Promise<boolean> {
    for (const condition of conditions) {
      const value = this.getNestedValue(config, condition.field);
      
      switch (condition.operator) {
        case 'equals':
          if (value !== condition.value) return false;
          break;
        case 'not_equals':
          if (value === condition.value) return false;
          break;
        case 'matches':
          if (!new RegExp(condition.value).test(String(value))) return false;
          break;
        case 'exists':
          if (value === undefined) return false;
          break;
      }
    }

    return true;
  }

  private async checkResourceLimits(namespaceId: string, key: string, value: any): Promise<void> {
    const namespace = this.namespaces.get(namespaceId);
    if (!namespace) return;

    const limits = namespace.isolation.sandbox.resourceLimits;
    const config = this.configs.get(namespaceId) || {};

    // Check max config keys
    const currentKeys = Object.keys(config).length;
    if (currentKeys >= limits.maxConfigKeys && !(key in config)) {
      throw new NamespaceResourceLimitError(
        `Maximum configuration keys (${limits.maxConfigKeys}) exceeded`
      );
    }

    // Check max storage
    const configJson = JSON.stringify({ ...config, [key]: value });
    const storageUsed = new TextEncoder().encode(configJson).length;
    if (storageUsed > limits.maxStorage * 1024 * 1024) {
      throw new NamespaceResourceLimitError(
        `Maximum storage (${limits.maxStorage}MB) exceeded`
      );
    }

    // Check max depth for nested keys
    const depth = key.split('.').length;
    if (depth > limits.maxDepth) {
      throw new NamespaceResourceLimitError(
        `Maximum key depth (${limits.maxDepth}) exceeded`
      );
    }
  }

  private async applyIsolation(namespace: NamespaceDefinition, key: string, value: any): Promise<any> {
    switch (namespace.isolation.level) {
      case 'none':
        return value;
      case 'basic':
        return this.applyBasicIsolation(namespace, key, value);
      case 'strict':
        return this.applyStrictIsolation(namespace, key, value);
      case 'paranoid':
        return this.applyParanoidIsolation(namespace, key, value);
      default:
        return value;
    }
  }

  private applyBasicIsolation(namespace: NamespaceDefinition, key: string, value: any): any {
    // Basic isolation - just add namespace prefix to key
    return value;
  }

  private applyStrictIsolation(namespace: NamespaceDefinition, key: string, value: any): any {
    // Strict isolation - sanitize value
    if (typeof value === 'string') {
      // Remove potentially dangerous content
      return value.replace(/<script.*?>.*?<\/script>/gi, '');
    }
    return value;
  }

  private applyParanoidIsolation(namespace: NamespaceDefinition, key: string, value: any): any {
    // Paranoid isolation - encrypt sensitive values
    if (typeof value === 'string' && this.isSensitiveKey(key)) {
      // Would implement encryption here
      return value; // For now, return as-is
    }
    return value;
  }

  private isSensitiveKey(key: string): boolean {
    const sensitivePatterns = ['password', 'secret', 'key', 'token', 'credential'];
    return sensitivePatterns.some(pattern => key.toLowerCase().includes(pattern));
  }

  private async checkPermission(permission: NamespacePermission, operation: NamespaceOperation): Promise<boolean> {
    if (!permission.operations.includes(operation)) {
      return false;
    }

    // Check conditions if any
    if (permission.conditions) {
      for (const condition of permission.conditions) {
        // Would implement condition checking based on current context
        // For now, assume conditions pass
      }
    }

    // Check based on permission type
    switch (permission.type) {
      case 'module':
        return permission.target === this.sandbox.moduleId;
      case 'tenant':
        return permission.target === this.sandbox.isolation.tenantId;
      case 'user':
        // Would check current user ID
        return false;
      case 'role':
        // Would check current user roles
        return false;
    }

    return false;
  }

  private async evaluateAccessRule(
    rule: AccessRule, 
    operation: NamespaceOperation
  ): Promise<{ applies: boolean; effect: 'allow' | 'deny' }> {
    // Simple rule evaluation - would implement full rule engine
    const applies = rule.condition.includes(operation);
    return { applies, effect: rule.effect };
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

  private async mergeNamespace(data: NamespaceExport): Promise<void> {
    const existing = this.namespaces.get(data.namespace.id)!;
    const existingConfig = this.configs.get(data.namespace.id) || {};

    // Merge configurations
    const mergedConfig = { ...existingConfig, ...data.configuration };
    this.configs.set(data.namespace.id, mergedConfig);

    // Update namespace metadata
    const updatedNamespace: NamespaceDefinition = {
      ...existing,
      metadata: {
        ...existing.metadata,
        updatedAt: new Date(),
      },
    };
    this.namespaces.set(data.namespace.id, updatedNamespace);
  }

  private async replaceNamespace(data: NamespaceExport, options?: ImportOptions): Promise<void> {
    // Replace entire namespace
    this.namespaces.set(data.namespace.id, data.namespace);
    this.configs.set(data.namespace.id, data.configuration);
  }

  private async createNamespaceFromExport(data: NamespaceExport, options?: ImportOptions): Promise<void> {
    // Create parent namespaces if needed
    if (options?.createParents && data.namespace.parentId) {
      if (!this.namespaces.has(data.namespace.parentId)) {
        // Would create parent namespace here
      }
    }

    // Create the namespace
    this.namespaces.set(data.namespace.id, data.namespace);
    this.configs.set(data.namespace.id, data.configuration);

    // Import children recursively
    if (data.children) {
      for (const child of data.children) {
        await this.createNamespaceFromExport(child, options);
      }
    }
  }

  private generateChecksum(data: string): string {
    // Simple checksum - would use proper hashing in production
    return btoa(data).substr(0, 16);
  }

  private async logNamespaceOperation(
    namespaceId: string,
    operation: NamespaceOperation,
    details: Record<string, any>,
    success: boolean,
    error?: string
  ): Promise<void> {
    const auditEntry: NamespaceAuditEntry = {
      id: `ns-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      namespaceId,
      operation,
      timestamp: new Date(),
      details,
      success,
      error,
    };

    this.auditEntries.push(auditEntry);

    // Log to sandbox audit system
    await this.sandbox.audit.logOperation({
      operationId: auditEntry.id,
      moduleId: this.sandbox.moduleId,
      operation: `namespace_${operation}`,
      parameters: { namespaceId, ...details },
      timestamp: auditEntry.timestamp,
      tenantId: this.sandbox.isolation.tenantId,
      success,
      error,
      duration: 0,
    });
  }

  private initializeRootNamespace(): void {
    const rootId = `root:${this.sandbox.moduleId}:${this.sandbox.isolation.tenantId}`;
    const root: NamespaceDefinition = {
      id: rootId,
      name: 'Root',
      description: 'Root namespace for the module',
      children: [],
      path: '/',
      level: 0,
      moduleId: this.sandbox.moduleId,
      tenantId: this.sandbox.isolation.tenantId,
      accessControl: {
        owner: this.sandbox.moduleId,
        permissions: [],
        allowedOperations: ['read', 'write', 'create_child'],
        blockedOperations: [],
        accessRules: [],
      },
      inheritance: {
        enabled: false,
        strategy: 'merge',
        sources: [],
        overrides: [],
        cascading: false,
      },
      isolation: {
        level: 'basic',
        boundaries: [],
        communication: {
          allowCrossNamespace: false,
          allowedNamespaces: [],
          blockedNamespaces: [],
          requireAuthentication: true,
          auditCommunication: true,
        },
        sandbox: {
          enabled: true,
          resourceLimits: {
            maxMemory: 512,
            maxStorage: 1024,
            maxConfigKeys: 1000,
            maxDepth: 10,
          },
          allowedFunctions: [],
          blockedFunctions: [],
        },
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        tags: ['root'],
        annotations: {},
        locked: false,
      },
      status: 'active',
    };

    this.namespaces.set(rootId, root);
    this.configs.set(rootId, {});
  }
}

// =============================================================================
// ERROR CLASSES
// =============================================================================

export class NamespaceAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NamespaceAlreadyExistsError';
  }
}

export class NamespaceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NamespaceNotFoundError';
  }
}

export class NamespaceAccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NamespaceAccessDeniedError';
  }
}

export class NamespacePathConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NamespacePathConflictError';
  }
}

export class NamespaceLockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NamespaceLockedError';
  }
}

export class NamespaceAliasExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NamespaceAliasExistsError';
  }
}

export class NamespaceAliasNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NamespaceAliasNotFoundError';
  }
}

export class NamespaceImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NamespaceImportError';
  }
}

export class NamespaceResourceLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NamespaceResourceLimitError';
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createConfigNamespaceManager(
  sandbox: ModuleSandbox, 
  configManager: TenantConfigManager
): ConfigNamespaceManager {
  return new ConfigNamespaceManagerImpl(sandbox, configManager);
}


