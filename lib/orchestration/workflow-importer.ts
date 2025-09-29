/**
 * Workflow Import and Validation System
 * 
 * Implements comprehensive workflow import with validation, compatibility checking,
 * and automatic migration per PRD Section 8 requirements.
 */

import {
  WorkflowDefinition,
  WorkflowArtifacts,
  Environment,
  WorkflowConfig,
  WorkflowStep,
  WorkflowTrigger,
  WorkflowMetadata,
  OrchestrationError,
  InvalidWorkflowDefinitionError
} from './architecture';
import { WorkflowVersion, WorkflowVersioningEngine } from './workflow-versioning';
import { WorkflowExporterEngine, ExportFormat } from './workflow-exporter';

// ============================================================================
// Import Types
// ============================================================================

export interface ImportRequest {
  data: string | Buffer;
  format: ExportFormat;
  options: ImportOptions;
  targetEnvironment?: Environment;
  workflowId?: string;
  version?: string;
  createdBy?: string;
  source?: string;
}

export interface ImportOptions {
  validateCompatibility?: boolean;
  autoMigrate?: boolean;
  createNewVersion?: boolean;
  overwriteExisting?: boolean;
  includeSecrets?: boolean;
  includeCredentials?: boolean;
  includeEnvironmentVariables?: boolean;
  includeArtifacts?: boolean;
  includeDependencies?: boolean;
  includeMetadata?: boolean;
  includeExecutionHistory?: boolean;
  dryRun?: boolean;
  skipValidation?: boolean;
  migrationStrategy?: MigrationStrategy;
  conflictResolution?: ConflictResolution;
}

export type MigrationStrategy = 'auto' | 'manual' | 'preserve' | 'overwrite';
export type ConflictResolution = 'skip' | 'overwrite' | 'merge' | 'rename' | 'prompt';

export interface ImportResult {
  success: boolean;
  workflowId: string;
  versionId?: string;
  version?: string;
  environment: Environment;
  importedAt: Date;
  importedBy: string;
  source: string;
  validation: ValidationResult;
  migration?: MigrationResult;
  conflicts?: ConflictResult[];
  warnings: string[];
  errors: string[];
  metadata: ImportMetadata;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  compatibility: CompatibilityResult;
  security: SecurityResult;
  performance: PerformanceResult;
}

export interface ValidationError {
  code: string;
  message: string;
  path: string;
  severity: 'error' | 'warning' | 'info';
  fixable: boolean;
  suggestedFix?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  path: string;
  impact: 'low' | 'medium' | 'high';
  recommendation?: string;
}

export interface CompatibilityResult {
  compatible: boolean;
  score: number;
  issues: CompatibilityIssue[];
  requiredFeatures: string[];
  supportedEnvironments: Environment[];
  versionConstraints: {
    minVersion: string;
    maxVersion: string;
    recommendedVersion: string;
  };
}

export interface CompatibilityIssue {
  type: 'breaking' | 'deprecated' | 'unsupported' | 'missing';
  feature: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  resolution?: string;
}

export interface SecurityResult {
  secure: boolean;
  issues: SecurityIssue[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface SecurityIssue {
  type: 'vulnerability' | 'exposure' | 'misconfiguration' | 'deprecated';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  path: string;
  fix?: string;
}

export interface PerformanceResult {
  acceptable: boolean;
  issues: PerformanceIssue[];
  estimatedImpact: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface PerformanceIssue {
  type: 'timeout' | 'resource' | 'concurrency' | 'dependency';
  severity: 'low' | 'medium' | 'high';
  description: string;
  path: string;
  impact: string;
  fix?: string;
}

export interface MigrationResult {
  required: boolean;
  performed: boolean;
  strategy: MigrationStrategy;
  changes: MigrationChange[];
  success: boolean;
  errors: string[];
  warnings: string[];
}

export interface MigrationChange {
  type: 'transform' | 'add' | 'remove' | 'modify' | 'rename';
  path: string;
  description: string;
  oldValue?: any;
  newValue?: any;
  impact: 'low' | 'medium' | 'high';
  breaking: boolean;
}

export interface ConflictResult {
  type: 'workflow_exists' | 'version_exists' | 'dependency_conflict' | 'resource_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resolution: ConflictResolution;
  suggestedAction?: string;
  affectedResources: string[];
}

export interface ImportMetadata {
  sourceFormat: ExportFormat;
  sourceVersion: string;
  sourceEnvironment: Environment;
  targetEnvironment: Environment;
  importSize: number;
  importChecksum: string;
  validationTime: number;
  migrationTime?: number;
  totalTime: number;
  includes: {
    artifacts: boolean;
    dependencies: boolean;
    metadata: boolean;
    executionHistory: boolean;
    secrets: boolean;
    credentials: boolean;
    environmentVariables: boolean;
  };
}

export interface ImportTemplate {
  id: string;
  name: string;
  description: string;
  options: ImportOptions;
  validationRules: ValidationRule[];
  migrationRules: MigrationRule[];
  conflictResolution: ConflictResolution;
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  path: string;
  type: 'required' | 'format' | 'range' | 'pattern' | 'custom';
  value?: any;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface MigrationRule {
  id: string;
  name: string;
  description: string;
  fromVersion: string;
  toVersion: string;
  changes: MigrationChange[];
  automatic: boolean;
  required: boolean;
}

// ============================================================================
// Workflow Importer Engine
// ============================================================================

export class WorkflowImporterEngine {
  private templates: Map<string, ImportTemplate> = new Map();
  private versioningEngine: WorkflowVersioningEngine;
  private exporterEngine: WorkflowExporterEngine;

  constructor(
    versioningEngine: WorkflowVersioningEngine,
    exporterEngine: WorkflowExporterEngine
  ) {
    this.versioningEngine = versioningEngine;
    this.exporterEngine = exporterEngine;
    this.initializeDefaultTemplates();
  }

  /**
   * Import workflow from data
   */
  async importWorkflow(request: ImportRequest): Promise<ImportResult> {
    const startTime = Date.now();
    const { data, format, options, targetEnvironment = 'dev', workflowId, version, createdBy = 'system', source = 'import' } = request;

    try {
      // Parse import data
      const parsedData = await this.parseImportData(data, format);

      // Validate import data
      const validation = await this.validateImportData(parsedData, options);

      if (!validation.valid && !options.skipValidation) {
        return this.createImportResult({
          success: false,
          workflowId: workflowId || 'unknown',
          environment: targetEnvironment,
          importedAt: new Date(),
          importedBy: createdBy,
          source,
          validation,
          warnings: [],
          errors: validation.errors.map(e => e.message),
          metadata: this.createImportMetadata(format, targetEnvironment, data, startTime)
        });
      }

      // Check for conflicts
      const conflicts = await this.checkConflicts(parsedData, options, targetEnvironment);

      // Perform migration if needed
      let migration: MigrationResult | undefined;
      if (validation.compatibility.issues.length > 0 && options.autoMigrate) {
        migration = await this.performMigration(parsedData, validation.compatibility, options);
      }

      // Create or update workflow
      const result = await this.createOrUpdateWorkflow(parsedData, {
        workflowId,
        version,
        environment: targetEnvironment,
        createdBy,
        source,
        options,
        migration
      });

      // Generate final result
      return this.createImportResult({
        success: true,
        workflowId: result.workflowId,
        versionId: result.versionId,
        version: result.version,
        environment: targetEnvironment,
        importedAt: new Date(),
        importedBy: createdBy,
        source,
        validation,
        migration,
        conflicts,
        warnings: validation.warnings.map(w => w.message),
        errors: [],
        metadata: this.createImportMetadata(format, targetEnvironment, data, startTime, migration)
      });

    } catch (error) {
      return this.createImportResult({
        success: false,
        workflowId: workflowId || 'unknown',
        environment: targetEnvironment,
        importedAt: new Date(),
        importedBy: createdBy,
        source,
        validation: this.createEmptyValidation(),
        warnings: [],
        errors: [error.message],
        metadata: this.createImportMetadata(format, targetEnvironment, data, startTime)
      });
    }
  }

  /**
   * Import using template
   */
  async importWithTemplate(
    data: string | Buffer,
    templateId: string,
    overrides?: Partial<ImportOptions>
  ): Promise<ImportResult> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new OrchestrationError(`Import template not found: ${templateId}`, 'TEMPLATE_NOT_FOUND');
    }

    const options = { ...template.options, ...overrides };

    // Determine format from data
    const format = this.detectFormat(data);

    const request: ImportRequest = {
      data,
      format,
      options
    };

    return await this.importWorkflow(request);
  }

  /**
   * Validate import data without importing
   */
  async validateImport(data: string | Buffer, format: ExportFormat): Promise<ValidationResult> {
    const parsedData = await this.parseImportData(data, format);
    return await this.validateImportData(parsedData, {});
  }

  /**
   * Get import preview
   */
  async getImportPreview(data: string | Buffer, format: ExportFormat): Promise<{
    workflow: WorkflowDefinition;
    metadata: any;
    validation: ValidationResult;
    conflicts: ConflictResult[];
    migration: MigrationResult | null;
  }> {
    const parsedData = await this.parseImportData(data, format);
    const validation = await this.validateImportData(parsedData, {});
    const conflicts = await this.checkConflicts(parsedData, {}, 'dev');
    
    let migration: MigrationResult | null = null;
    if (validation.compatibility.issues.length > 0) {
      migration = await this.performMigration(parsedData, validation.compatibility, { autoMigrate: true });
    }

    return {
      workflow: parsedData.workflow,
      metadata: parsedData.metadata,
      validation,
      conflicts,
      migration
    };
  }

  /**
   * Create import template
   */
  async createTemplate(template: ImportTemplate): Promise<ImportTemplate> {
    this.templates.set(template.id, template);
    return template;
  }

  /**
   * Get import template
   */
  async getTemplate(templateId: string): Promise<ImportTemplate | null> {
    return this.templates.get(templateId) || null;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Parse import data based on format
   */
  private async parseImportData(data: string | Buffer, format: ExportFormat): Promise<any> {
    const content = data.toString();

    try {
      switch (format) {
        case 'json':
          return JSON.parse(content);
        case 'yaml':
          const yaml = await import('yaml');
          return yaml.parse(content);
        case 'n8n':
          return this.parseN8nFormat(JSON.parse(content));
        case 'zip':
          return await this.parseZipArchive(data);
        case 'tar':
          return await this.parseTarArchive(data);
        default:
          throw new OrchestrationError(`Unsupported import format: ${format}`, 'UNSUPPORTED_FORMAT');
      }
    } catch (error) {
      throw new OrchestrationError(`Failed to parse ${format} data: ${error.message}`, 'PARSE_ERROR');
    }
  }

  /**
   * Parse n8n format
   */
  private parseN8nFormat(n8nData: any): any {
    const workflow: WorkflowDefinition = {
      id: n8nData.id || `n8n_${Date.now()}`,
      name: n8nData.name || 'Imported n8n Workflow',
      description: n8nData.description || 'Workflow imported from n8n',
      version: '1.0.0',
      status: n8nData.active ? 'active' : 'draft',
      type: 'n8n',
      config: {
        timeout: 300000,
        retryPolicy: {
          maxRetries: 3,
          baseDelayMs: 1000,
          maxDelayMs: 30000,
          jitterFactor: 0.1,
          retryableErrors: ['network', 'timeout'],
          backoffStrategy: 'exponential'
        },
        circuitBreaker: {
          failureThreshold: 5,
          recoveryTimeoutMs: 60000,
          halfOpenMaxCalls: 3,
          timeoutMs: 5000,
          enabled: true
        },
        concurrency: 1,
        environment: 'dev',
        tags: n8nData.tags || []
      },
      steps: n8nData.nodes?.map((node: any, index: number) => ({
        id: node.id,
        name: node.name,
        type: node.type,
        config: node.parameters || {},
        retryConfig: {
          maxRetries: 3,
          baseDelayMs: 1000,
          maxDelayMs: 30000,
          jitterFactor: 0.1,
          retryableErrors: ['network', 'timeout'],
          backoffStrategy: 'exponential'
        },
        timeout: 30000,
        dependencies: this.extractN8nDependencies(node.id, n8nData.connections),
        order: index
      })) || [],
      triggers: this.extractN8nTriggers(n8nData),
      metadata: {
        createdBy: 'n8n-import',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: n8nData.tags || [],
        environment: 'dev',
        source: 'n8n',
        dependencies: []
      }
    };

    return {
      workflow,
      metadata: {
        source: 'n8n',
        version: n8nData.versionId || '1',
        importedAt: new Date()
      }
    };
  }

  /**
   * Extract n8n dependencies
   */
  private extractN8nDependencies(nodeId: string, connections: any): string[] {
    if (!connections || !connections[nodeId]) {
      return [];
    }

    return connections[nodeId].map((conn: any) => conn.node);
  }

  /**
   * Extract n8n triggers
   */
  private extractN8nTriggers(n8nData: any): WorkflowTrigger[] {
    const triggers: WorkflowTrigger[] = [];

    // Look for webhook nodes
    if (n8nData.nodes) {
      for (const node of n8nData.nodes) {
        if (node.type === 'n8n-nodes-base.webhook') {
          triggers.push({
            id: `webhook_${node.id}`,
            type: 'webhook',
            config: {
              path: node.parameters?.path || '/webhook',
              method: node.parameters?.httpMethod || 'POST'
            },
            enabled: !node.disabled,
            webhook: {
              id: node.webhookId || node.id,
              path: node.parameters?.path || '/webhook',
              method: node.parameters?.httpMethod || 'POST',
              authentication: {
                type: 'none'
              }
            }
          });
        }
      }
    }

    return triggers;
  }

  /**
   * Parse ZIP archive
   */
  private async parseZipArchive(data: Buffer): Promise<any> {
    const JSZip = await import('jszip');
    const zip = await JSZip.default.loadAsync(data);

    // Read main workflow file
    const workflowFile = zip.file('workflow.json');
    if (!workflowFile) {
      throw new OrchestrationError('No workflow.json found in ZIP archive', 'MISSING_WORKFLOW_FILE');
    }

    const workflowContent = await workflowFile.async('string');
    const parsed = JSON.parse(workflowContent);

    // Read additional files if present
    const artifactsFile = zip.file('artifacts.json');
    if (artifactsFile) {
      const artifactsContent = await artifactsFile.async('string');
      parsed.artifacts = JSON.parse(artifactsContent);
    }

    const metadataFile = zip.file('metadata.json');
    if (metadataFile) {
      const metadataContent = await metadataFile.async('string');
      parsed.metadata = { ...parsed.metadata, ...JSON.parse(metadataContent) };
    }

    return parsed;
  }

  /**
   * Parse TAR archive
   */
  private async parseTarArchive(data: Buffer): Promise<any> {
    const tar = await import('tar');
    const { Readable } = await import('stream');

    const stream = Readable.from([data]);
    const files: { [key: string]: string } = {};

    await tar.list({
      file: stream,
      onentry: (entry) => {
        if (entry.type === 'File') {
          files[entry.path] = entry.read().toString();
        }
      }
    });

    if (!files['workflow.json']) {
      throw new OrchestrationError('No workflow.json found in TAR archive', 'MISSING_WORKFLOW_FILE');
    }

    const parsed = JSON.parse(files['workflow.json']);

    if (files['artifacts.json']) {
      parsed.artifacts = JSON.parse(files['artifacts.json']);
    }

    if (files['metadata.json']) {
      parsed.metadata = { ...parsed.metadata, ...JSON.parse(files['metadata.json']) };
    }

    return parsed;
  }

  /**
   * Detect format from data
   */
  private detectFormat(data: string | Buffer): ExportFormat {
    const content = data.toString();

    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(content);
      if (parsed.nodes && parsed.connections) {
        return 'n8n';
      }
      return 'json';
    } catch {
      // Not JSON, try YAML
      if (content.includes('---') || content.includes(':')) {
        return 'yaml';
      }
    }

    // Default to JSON
    return 'json';
  }

  /**
   * Validate import data
   */
  private async validateImportData(parsedData: any, options: ImportOptions): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate workflow structure
    if (!parsedData.workflow) {
      errors.push({
        code: 'MISSING_WORKFLOW',
        message: 'Missing workflow definition',
        path: 'workflow',
        severity: 'error',
        fixable: false
      });
      return this.createValidationResult(false, errors, warnings);
    }

    const workflow = parsedData.workflow;

    // Validate required fields
    if (!workflow.id) {
      errors.push({
        code: 'MISSING_ID',
        message: 'Workflow missing ID',
        path: 'workflow.id',
        severity: 'error',
        fixable: true,
        suggestedFix: 'Generate a unique ID'
      });
    }

    if (!workflow.name) {
      errors.push({
        code: 'MISSING_NAME',
        message: 'Workflow missing name',
        path: 'workflow.name',
        severity: 'error',
        fixable: true,
        suggestedFix: 'Provide a descriptive name'
      });
    }

    if (!workflow.steps || !Array.isArray(workflow.steps)) {
      errors.push({
        code: 'MISSING_STEPS',
        message: 'Workflow missing or invalid steps',
        path: 'workflow.steps',
        severity: 'error',
        fixable: false
      });
    }

    if (!workflow.triggers || !Array.isArray(workflow.triggers)) {
      errors.push({
        code: 'MISSING_TRIGGERS',
        message: 'Workflow missing or invalid triggers',
        path: 'workflow.triggers',
        severity: 'error',
        fixable: false
      });
    }

    // Validate steps
    if (workflow.steps) {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        const stepPath = `workflow.steps[${i}]`;

        if (!step.id) {
          errors.push({
            code: 'STEP_MISSING_ID',
            message: `Step ${i} missing ID`,
            path: `${stepPath}.id`,
            severity: 'error',
            fixable: true,
            suggestedFix: 'Generate a unique step ID'
          });
        }

        if (!step.name) {
          errors.push({
            code: 'STEP_MISSING_NAME',
            message: `Step ${i} missing name`,
            path: `${stepPath}.name`,
            severity: 'error',
            fixable: true,
            suggestedFix: 'Provide a descriptive step name'
          });
        }

        if (!step.type) {
          errors.push({
            code: 'STEP_MISSING_TYPE',
            message: `Step ${i} missing type`,
            path: `${stepPath}.type`,
            severity: 'error',
            fixable: false
          });
        }
      }
    }

    // Validate triggers
    if (workflow.triggers) {
      for (let i = 0; i < workflow.triggers.length; i++) {
        const trigger = workflow.triggers[i];
        const triggerPath = `workflow.triggers[${i}]`;

        if (!trigger.id) {
          errors.push({
            code: 'TRIGGER_MISSING_ID',
            message: `Trigger ${i} missing ID`,
            path: `${triggerPath}.id`,
            severity: 'error',
            fixable: true,
            suggestedFix: 'Generate a unique trigger ID'
          });
        }

        if (!trigger.type) {
          errors.push({
            code: 'TRIGGER_MISSING_TYPE',
            message: `Trigger ${i} missing type`,
            path: `${triggerPath}.type`,
            severity: 'error',
            fixable: false
          });
        }
      }
    }

    // Check compatibility
    const compatibility = await this.checkCompatibility(parsedData);

    // Check security
    const security = await this.checkSecurity(parsedData);

    // Check performance
    const performance = await this.checkPerformance(parsedData);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      compatibility,
      security,
      performance
    };
  }

  /**
   * Check compatibility
   */
  private async checkCompatibility(parsedData: any): Promise<CompatibilityResult> {
    const issues: CompatibilityIssue[] = [];
    const workflow = parsedData.workflow;

    // Check version compatibility
    if (parsedData.version) {
      const version = parsedData.version;
      if (version.semanticVersion) {
        const { major, minor, patch } = version.semanticVersion;
        if (major > 2) {
          issues.push({
            type: 'unsupported',
            feature: 'workflow_version',
            description: `Version ${major}.${minor}.${patch} is not supported`,
            impact: 'high',
            resolution: 'Use version 2.x or lower'
          });
        }
      }
    }

    // Check step type compatibility
    if (workflow.steps) {
      const supportedTypes = ['n8n', 'webhook', 'api', 'transform', 'condition', 'delay'];
      for (const step of workflow.steps) {
        if (!supportedTypes.includes(step.type)) {
          issues.push({
            type: 'unsupported',
            feature: 'step_type',
            description: `Step type '${step.type}' is not supported`,
            impact: 'medium',
            resolution: 'Use supported step types'
          });
        }
      }
    }

    // Check trigger type compatibility
    if (workflow.triggers) {
      const supportedTriggers = ['webhook', 'schedule', 'event', 'manual', 'form-submission'];
      for (const trigger of workflow.triggers) {
        if (!supportedTriggers.includes(trigger.type)) {
          issues.push({
            type: 'unsupported',
            feature: 'trigger_type',
            description: `Trigger type '${trigger.type}' is not supported`,
            impact: 'medium',
            resolution: 'Use supported trigger types'
          });
        }
      }
    }

    const score = Math.max(0, 100 - (issues.length * 20));
    const compatible = issues.filter(i => i.impact === 'critical' || i.impact === 'high').length === 0;

    return {
      compatible,
      score,
      issues,
      requiredFeatures: ['orchestration', 'versioning'],
      supportedEnvironments: ['dev', 'staging', 'prod'],
      versionConstraints: {
        minVersion: '1.0.0',
        maxVersion: '2.0.0',
        recommendedVersion: '1.5.0'
      }
    };
  }

  /**
   * Check security
   */
  private async checkSecurity(parsedData: any): Promise<SecurityResult> {
    const issues: SecurityIssue[] = [];
    const workflow = parsedData.workflow;

    // Check for exposed secrets
    if (workflow.config) {
      this.checkForSecrets(workflow.config, 'workflow.config', issues);
    }

    // Check steps for security issues
    if (workflow.steps) {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        this.checkForSecrets(step.config, `workflow.steps[${i}].config`, issues);
      }
    }

    // Check triggers for security issues
    if (workflow.triggers) {
      for (let i = 0; i < workflow.triggers.length; i++) {
        const trigger = workflow.triggers[i];
        this.checkForSecrets(trigger.config, `workflow.triggers[${i}].config`, issues);
      }
    }

    const riskLevel = this.calculateRiskLevel(issues);
    const secure = issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0;

    return {
      secure,
      issues,
      riskLevel,
      recommendations: this.generateSecurityRecommendations(issues)
    };
  }

  /**
   * Check for secrets in configuration
   */
  private checkForSecrets(obj: any, path: string, issues: SecurityIssue[]): void {
    if (!obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = `${path}.${key}`;

      if (typeof value === 'string') {
        // Check for common secret patterns
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('secret') || 
            key.toLowerCase().includes('key') || 
            key.toLowerCase().includes('token')) {
          issues.push({
            type: 'exposure',
            severity: 'high',
            description: `Potential secret exposure in ${key}`,
            path: currentPath,
            fix: 'Remove or mask sensitive values'
          });
        }

        // Check for hardcoded secrets
        if (value.length > 20 && /^[A-Za-z0-9+/=]+$/.test(value)) {
          issues.push({
            type: 'exposure',
            severity: 'medium',
            description: `Potential hardcoded secret in ${key}`,
            path: currentPath,
            fix: 'Use environment variables or secure storage'
          });
        }
      } else if (typeof value === 'object' && value !== null) {
        this.checkForSecrets(value, currentPath, issues);
      }
    }
  }

  /**
   * Calculate risk level
   */
  private calculateRiskLevel(issues: SecurityIssue[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const highCount = issues.filter(i => i.severity === 'high').length;
    const mediumCount = issues.filter(i => i.severity === 'medium').length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 0) return 'high';
    if (mediumCount > 0) return 'medium';
    return 'low';
  }

  /**
   * Generate security recommendations
   */
  private generateSecurityRecommendations(issues: SecurityIssue[]): string[] {
    const recommendations: string[] = [];

    if (issues.some(i => i.type === 'exposure')) {
      recommendations.push('Review and remove exposed secrets');
      recommendations.push('Use environment variables for sensitive configuration');
    }

    if (issues.some(i => i.type === 'vulnerability')) {
      recommendations.push('Update dependencies to latest secure versions');
      recommendations.push('Enable security scanning in CI/CD pipeline');
    }

    if (issues.some(i => i.type === 'misconfiguration')) {
      recommendations.push('Review security configuration settings');
      recommendations.push('Follow security best practices');
    }

    return recommendations;
  }

  /**
   * Check performance
   */
  private async checkPerformance(parsedData: any): Promise<PerformanceResult> {
    const issues: PerformanceIssue[] = [];
    const workflow = parsedData.workflow;

    // Check for performance issues
    if (workflow.config?.timeout && workflow.config.timeout > 300000) {
      issues.push({
        type: 'timeout',
        severity: 'medium',
        description: 'Workflow timeout is very high',
        path: 'workflow.config.timeout',
        impact: 'May cause resource exhaustion',
        fix: 'Consider reducing timeout or breaking into smaller workflows'
      });
    }

    if (workflow.config?.concurrency && workflow.config.concurrency > 10) {
      issues.push({
        type: 'concurrency',
        severity: 'medium',
        description: 'High concurrency setting',
        path: 'workflow.config.concurrency',
        impact: 'May overwhelm external services',
        fix: 'Consider reducing concurrency or implementing rate limiting'
      });
    }

    if (workflow.steps && workflow.steps.length > 50) {
      issues.push({
        type: 'resource',
        severity: 'low',
        description: 'Workflow has many steps',
        path: 'workflow.steps',
        impact: 'May impact execution performance',
        fix: 'Consider breaking into smaller sub-workflows'
      });
    }

    const acceptable = issues.filter(i => i.severity === 'high').length === 0;
    const estimatedImpact = issues.length > 5 ? 'high' : issues.length > 2 ? 'medium' : 'low';

    return {
      acceptable,
      issues,
      estimatedImpact,
      recommendations: this.generatePerformanceRecommendations(issues)
    };
  }

  /**
   * Generate performance recommendations
   */
  private generatePerformanceRecommendations(issues: PerformanceIssue[]): string[] {
    const recommendations: string[] = [];

    if (issues.some(i => i.type === 'timeout')) {
      recommendations.push('Optimize workflow execution time');
      recommendations.push('Consider breaking long-running workflows');
    }

    if (issues.some(i => i.type === 'concurrency')) {
      recommendations.push('Implement proper rate limiting');
      recommendations.push('Monitor external service capacity');
    }

    if (issues.some(i => i.type === 'resource')) {
      recommendations.push('Optimize workflow structure');
      recommendations.push('Consider workflow decomposition');
    }

    return recommendations;
  }

  /**
   * Check for conflicts
   */
  private async checkConflicts(
    parsedData: any,
    options: ImportOptions,
    environment: Environment
  ): Promise<ConflictResult[]> {
    const conflicts: ConflictResult[] = [];
    const workflow = parsedData.workflow;

    // Check if workflow already exists
    const existingVersions = await this.versioningEngine.getVersions({
      workflowId: workflow.id,
      environment
    });

    if (existingVersions.length > 0 && !options.overwriteExisting) {
      conflicts.push({
        type: 'workflow_exists',
        severity: 'medium',
        description: `Workflow ${workflow.id} already exists in ${environment}`,
        resolution: options.conflictResolution || 'prompt',
        suggestedAction: 'Choose to overwrite, rename, or skip',
        affectedResources: [workflow.id]
      });
    }

    // Check for version conflicts
    if (parsedData.version) {
      const existingVersion = existingVersions.find(v => v.version === parsedData.version.version);
      if (existingVersion) {
        conflicts.push({
          type: 'version_exists',
          severity: 'high',
          description: `Version ${parsedData.version.version} already exists`,
          resolution: options.conflictResolution || 'prompt',
          suggestedAction: 'Choose to overwrite, create new version, or skip',
          affectedResources: [workflow.id, parsedData.version.version]
        });
      }
    }

    return conflicts;
  }

  /**
   * Perform migration
   */
  private async performMigration(
    parsedData: any,
    compatibility: CompatibilityResult,
    options: ImportOptions
  ): Promise<MigrationResult> {
    const changes: MigrationChange[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Apply automatic migrations
      for (const issue of compatibility.issues) {
        if (issue.resolution && options.migrationStrategy === 'auto') {
          const change = await this.applyMigration(issue, parsedData);
          if (change) {
            changes.push(change);
          }
        }
      }

      return {
        required: true,
        performed: true,
        strategy: options.migrationStrategy || 'auto',
        changes,
        success: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        required: true,
        performed: false,
        strategy: options.migrationStrategy || 'auto',
        changes,
        success: false,
        errors: [error.message],
        warnings
      };
    }
  }

  /**
   * Apply migration for specific issue
   */
  private async applyMigration(issue: CompatibilityIssue, parsedData: any): Promise<MigrationChange | null> {
    switch (issue.type) {
      case 'unsupported':
        if (issue.feature === 'step_type') {
          // Convert unsupported step type to supported one
          return {
            type: 'transform',
            path: 'workflow.steps',
            description: `Convert unsupported step type to supported type`,
            impact: 'medium',
            breaking: false
          };
        }
        break;

      case 'deprecated':
        // Handle deprecated features
        return {
          type: 'modify',
          path: issue.feature,
          description: `Update deprecated feature: ${issue.description}`,
          impact: 'low',
          breaking: false
        };

      default:
        return null;
    }

    return null;
  }

  /**
   * Create or update workflow
   */
  private async createOrUpdateWorkflow(
    parsedData: any,
    options: {
      workflowId?: string;
      version?: string;
      environment: Environment;
      createdBy: string;
      source: string;
      options: ImportOptions;
      migration?: MigrationResult;
    }
  ): Promise<{ workflowId: string; versionId: string; version: string }> {
    const workflow = parsedData.workflow;

    // Use provided workflow ID or generate new one
    const workflowId = options.workflowId || workflow.id;

    // Create version
    const version = await this.versioningEngine.createVersion({
      workflowId,
      definition: workflow,
      version: options.version,
      description: `Imported from ${options.source}`,
      environment: options.environment,
      createdBy: options.createdBy,
      source: options.source
    });

    return {
      workflowId,
      versionId: version.id,
      version: version.version
    };
  }

  /**
   * Create import result
   */
  private createImportResult(options: {
    success: boolean;
    workflowId: string;
    versionId?: string;
    version?: string;
    environment: Environment;
    importedAt: Date;
    importedBy: string;
    source: string;
    validation: ValidationResult;
    migration?: MigrationResult;
    conflicts?: ConflictResult[];
    warnings: string[];
    errors: string[];
    metadata: ImportMetadata;
  }): ImportResult {
    return {
      success: options.success,
      workflowId: options.workflowId,
      versionId: options.versionId,
      version: options.version,
      environment: options.environment,
      importedAt: options.importedAt,
      importedBy: options.importedBy,
      source: options.source,
      validation: options.validation,
      migration: options.migration,
      conflicts: options.conflicts,
      warnings: options.warnings,
      errors: options.errors,
      metadata: options.metadata
    };
  }

  /**
   * Create empty validation result
   */
  private createEmptyValidation(): ValidationResult {
    return {
      valid: false,
      errors: [],
      warnings: [],
      compatibility: {
        compatible: false,
        score: 0,
        issues: [],
        requiredFeatures: [],
        supportedEnvironments: [],
        versionConstraints: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0',
          recommendedVersion: '1.5.0'
        }
      },
      security: {
        secure: false,
        issues: [],
        riskLevel: 'high',
        recommendations: []
      },
      performance: {
        acceptable: false,
        issues: [],
        estimatedImpact: 'high',
        recommendations: []
      }
    };
  }

  /**
   * Create import metadata
   */
  private createImportMetadata(
    format: ExportFormat,
    environment: Environment,
    data: string | Buffer,
    startTime: number,
    migration?: MigrationResult
  ): ImportMetadata {
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    return {
      sourceFormat: format,
      sourceVersion: '1.0.0',
      sourceEnvironment: environment,
      targetEnvironment: environment,
      importSize: Buffer.byteLength(data),
      importChecksum: '', // Would calculate actual checksum
      validationTime: totalTime * 0.7, // Estimate
      migrationTime: migration ? totalTime * 0.2 : undefined,
      totalTime,
      includes: {
        artifacts: true,
        dependencies: true,
        metadata: true,
        executionHistory: false,
        secrets: false,
        credentials: false,
        environmentVariables: false
      }
    };
  }

  /**
   * Initialize default templates
   */
  private initializeDefaultTemplates(): void {
    // Strict import template
    this.templates.set('strict', {
      id: 'strict',
      name: 'Strict Import',
      description: 'Strict validation with no automatic fixes',
      options: {
        validateCompatibility: true,
        autoMigrate: false,
        createNewVersion: true,
        overwriteExisting: false,
        includeSecrets: false,
        includeCredentials: false,
        includeEnvironmentVariables: false,
        dryRun: false,
        skipValidation: false,
        migrationStrategy: 'manual',
        conflictResolution: 'prompt'
      },
      validationRules: [],
      migrationRules: [],
      conflictResolution: 'prompt'
    });

    // Permissive import template
    this.templates.set('permissive', {
      id: 'permissive',
      name: 'Permissive Import',
      description: 'Lenient validation with automatic fixes',
      options: {
        validateCompatibility: true,
        autoMigrate: true,
        createNewVersion: true,
        overwriteExisting: true,
        includeSecrets: true,
        includeCredentials: true,
        includeEnvironmentVariables: true,
        dryRun: false,
        skipValidation: false,
        migrationStrategy: 'auto',
        conflictResolution: 'overwrite'
      },
      validationRules: [],
      migrationRules: [],
      conflictResolution: 'overwrite'
    });
  }
}

// ============================================================================
// Factory
// ============================================================================

export class WorkflowImporterFactory {
  /**
   * Create importer engine
   */
  static create(
    versioningEngine: WorkflowVersioningEngine,
    exporterEngine: WorkflowExporterEngine
  ): WorkflowImporterEngine {
    return new WorkflowImporterEngine(versioningEngine, exporterEngine);
  }

  /**
   * Create import request
   */
  static createImportRequest(
    data: string | Buffer,
    format: ExportFormat = 'json',
    options: Partial<ImportOptions> = {}
  ): ImportRequest {
    return {
      data,
      format,
      options: {
        validateCompatibility: true,
        autoMigrate: false,
        createNewVersion: true,
        overwriteExisting: false,
        includeSecrets: false,
        includeCredentials: false,
        includeEnvironmentVariables: false,
        includeArtifacts: true,
        includeDependencies: true,
        includeMetadata: true,
        includeExecutionHistory: false,
        dryRun: false,
        skipValidation: false,
        migrationStrategy: 'auto',
        conflictResolution: 'prompt',
        ...options
      }
    };
  }
}
