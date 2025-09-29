/**
 * Workflow Export Functionality
 * 
 * Implements comprehensive workflow export to JSON/YAML formats with
 * artifact bundling and environment-specific configurations per PRD Section 8.
 */

import {
  WorkflowDefinition,
  WorkflowArtifacts,
  Environment,
  WorkflowConfig,
  WorkflowStep,
  WorkflowTrigger,
  WorkflowMetadata,
  OrchestrationError
} from './architecture';
import { WorkflowVersion, WorkflowVersioningEngine } from './workflow-versioning';

// ============================================================================
// Export Types
// ============================================================================

export interface ExportRequest {
  workflowId: string;
  versionId?: string;
  environment?: Environment;
  format: ExportFormat;
  options: ExportOptions;
  includeArtifacts?: boolean;
  includeDependencies?: boolean;
  includeMetadata?: boolean;
  includeExecutionHistory?: boolean;
}

export type ExportFormat = 'json' | 'yaml' | 'zip' | 'tar' | 'n8n';

export interface ExportOptions {
  pretty?: boolean;
  minify?: boolean;
  includeSecrets?: boolean;
  includeCredentials?: boolean;
  includeEnvironmentVariables?: boolean;
  includeComments?: boolean;
  includeVersionHistory?: boolean;
  includeTests?: boolean;
  includeDocumentation?: boolean;
  compressionLevel?: number;
  encryptionKey?: string;
  signatureKey?: string;
}

export interface ExportResult {
  success: boolean;
  format: ExportFormat;
  data: string | Buffer;
  size: number;
  checksum: string;
  metadata: ExportMetadata;
  artifacts?: WorkflowArtifacts;
  errors?: string[];
  warnings?: string[];
}

export interface ExportMetadata {
  workflowId: string;
  versionId?: string;
  version?: string;
  environment: Environment;
  exportedAt: Date;
  exportedBy: string;
  format: ExportFormat;
  size: number;
  checksum: string;
  includes: {
    artifacts: boolean;
    dependencies: boolean;
    metadata: boolean;
    executionHistory: boolean;
    secrets: boolean;
    credentials: boolean;
    environmentVariables: boolean;
    comments: boolean;
    versionHistory: boolean;
    tests: boolean;
    documentation: boolean;
  };
  compatibility: {
    minVersion: string;
    maxVersion: string;
    supportedEnvironments: Environment[];
    requiredFeatures: string[];
  };
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: ExportFormat;
  options: ExportOptions;
  includes: {
    artifacts: boolean;
    dependencies: boolean;
    metadata: boolean;
    executionHistory: boolean;
    secrets: boolean;
    credentials: boolean;
    environmentVariables: boolean;
    comments: boolean;
    versionHistory: boolean;
    tests: boolean;
    documentation: boolean;
  };
  filters?: {
    environments?: Environment[];
    tags?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}

export interface BulkExportRequest {
  workflowIds: string[];
  format: ExportFormat;
  options: ExportOptions;
  includeArtifacts?: boolean;
  includeDependencies?: boolean;
  includeMetadata?: boolean;
  includeExecutionHistory?: boolean;
  outputFormat?: 'individual' | 'bundled' | 'archive';
}

export interface BulkExportResult {
  success: boolean;
  totalWorkflows: number;
  successfulExports: number;
  failedExports: number;
  results: ExportResult[];
  errors: string[];
  warnings: string[];
  metadata: {
    exportedAt: Date;
    exportedBy: string;
    format: ExportFormat;
    totalSize: number;
    checksum: string;
  };
}

// ============================================================================
// Workflow Exporter Engine
// ============================================================================

export class WorkflowExporterEngine {
  private templates: Map<string, ExportTemplate> = new Map();
  private versioningEngine: WorkflowVersioningEngine;

  constructor(versioningEngine: WorkflowVersioningEngine) {
    this.versioningEngine = versioningEngine;
    this.initializeDefaultTemplates();
  }

  /**
   * Export workflow to specified format
   */
  async exportWorkflow(request: ExportRequest): Promise<ExportResult> {
    const { workflowId, versionId, environment, format, options, includeArtifacts, includeDependencies, includeMetadata, includeExecutionHistory } = request;

    try {
      // Get workflow version
      const version = versionId 
        ? await this.versioningEngine.getVersion(versionId)
        : await this.versioningEngine.getLatestVersion(workflowId, environment || 'dev');

      if (!version) {
        throw new OrchestrationError(`Workflow version not found: ${workflowId}`, 'WORKFLOW_VERSION_NOT_FOUND');
      }

      // Prepare export data
      const exportData = await this.prepareExportData(version, {
        includeArtifacts: includeArtifacts ?? true,
        includeDependencies: includeDependencies ?? true,
        includeMetadata: includeMetadata ?? true,
        includeExecutionHistory: includeExecutionHistory ?? false,
        options
      });

      // Export to specified format
      const result = await this.exportToFormat(exportData, format, options);

      // Generate metadata
      const metadata = this.generateExportMetadata(version, format, result, options);

      return {
        success: true,
        format,
        data: result.data,
        size: result.size,
        checksum: result.checksum,
        metadata,
        artifacts: includeArtifacts ? version.artifacts : undefined
      };

    } catch (error) {
      return {
        success: false,
        format,
        data: '',
        size: 0,
        checksum: '',
        metadata: this.generateErrorMetadata(workflowId, format, error),
        errors: [error.message]
      };
    }
  }

  /**
   * Export multiple workflows
   */
  async exportBulk(request: BulkExportRequest): Promise<BulkExportResult> {
    const { workflowIds, format, options, includeArtifacts, includeDependencies, includeMetadata, includeExecutionHistory, outputFormat = 'individual' } = request;

    const results: ExportResult[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    let totalSize = 0;
    let successfulExports = 0;
    let failedExports = 0;

    // Export each workflow
    for (const workflowId of workflowIds) {
      try {
        const exportRequest: ExportRequest = {
          workflowId,
          format,
          options,
          includeArtifacts,
          includeDependencies,
          includeMetadata,
          includeExecutionHistory
        };

        const result = await this.exportWorkflow(exportRequest);
        results.push(result);

        if (result.success) {
          successfulExports++;
          totalSize += result.size;
        } else {
          failedExports++;
          errors.push(...(result.errors || []));
        }

        if (result.warnings) {
          warnings.push(...result.warnings);
        }

      } catch (error) {
        failedExports++;
        errors.push(`Failed to export workflow ${workflowId}: ${error.message}`);
      }
    }

    // Generate combined checksum
    const checksum = await this.calculateBulkChecksum(results);

    return {
      success: failedExports === 0,
      totalWorkflows: workflowIds.length,
      successfulExports,
      failedExports,
      results,
      errors,
      warnings,
      metadata: {
        exportedAt: new Date(),
        exportedBy: 'system',
        format,
        totalSize,
        checksum
      }
    };
  }

  /**
   * Create export template
   */
  async createTemplate(template: ExportTemplate): Promise<ExportTemplate> {
    this.templates.set(template.id, template);
    return template;
  }

  /**
   * Get export template
   */
  async getTemplate(templateId: string): Promise<ExportTemplate | null> {
    return this.templates.get(templateId) || null;
  }

  /**
   * Export using template
   */
  async exportWithTemplate(workflowId: string, templateId: string, overrides?: Partial<ExportOptions>): Promise<ExportResult> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new OrchestrationError(`Export template not found: ${templateId}`, 'TEMPLATE_NOT_FOUND');
    }

    const options = { ...template.options, ...overrides };

    const request: ExportRequest = {
      workflowId,
      format: template.format,
      options,
      includeArtifacts: template.includes.artifacts,
      includeDependencies: template.includes.dependencies,
      includeMetadata: template.includes.metadata,
      includeExecutionHistory: template.includes.executionHistory
    };

    return await this.exportWorkflow(request);
  }

  /**
   * Validate export data
   */
  async validateExport(data: string | Buffer, format: ExportFormat): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Parse based on format
      let parsed: any;
      switch (format) {
        case 'json':
          parsed = JSON.parse(data.toString());
          break;
        case 'yaml':
          const yaml = await import('yaml');
          parsed = yaml.parse(data.toString());
          break;
        case 'n8n':
          parsed = JSON.parse(data.toString());
          break;
        default:
          errors.push(`Unsupported format for validation: ${format}`);
          return { valid: false, errors, warnings };
      }

      // Validate structure
      if (!parsed.workflow) {
        errors.push('Missing workflow definition');
      }

      if (!parsed.metadata) {
        warnings.push('Missing metadata section');
      }

      if (!parsed.version) {
        warnings.push('Missing version information');
      }

      // Validate workflow structure
      if (parsed.workflow) {
        if (!parsed.workflow.id) {
          errors.push('Workflow missing ID');
        }

        if (!parsed.workflow.name) {
          errors.push('Workflow missing name');
        }

        if (!parsed.workflow.steps || !Array.isArray(parsed.workflow.steps)) {
          errors.push('Workflow missing or invalid steps');
        }

        if (!parsed.workflow.triggers || !Array.isArray(parsed.workflow.triggers)) {
          errors.push('Workflow missing or invalid triggers');
        }
      }

      // Validate artifacts if present
      if (parsed.artifacts) {
        if (!parsed.artifacts.checksum) {
          warnings.push('Artifacts missing checksum');
        }

        if (!parsed.artifacts.exportedAt) {
          warnings.push('Artifacts missing export timestamp');
        }
      }

    } catch (error) {
      errors.push(`Failed to parse ${format} data: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Prepare export data
   */
  private async prepareExportData(
    version: WorkflowVersion,
    options: {
      includeArtifacts: boolean;
      includeDependencies: boolean;
      includeMetadata: boolean;
      includeExecutionHistory: boolean;
      options: ExportOptions;
    }
  ): Promise<any> {
    const { includeArtifacts, includeDependencies, includeMetadata, includeExecutionHistory, options: exportOptions } = options;

    const exportData: any = {
      workflow: version.definition,
      version: {
        id: version.id,
        version: version.version,
        semanticVersion: version.semanticVersion,
        status: version.status,
        createdAt: version.createdAt,
        createdBy: version.createdBy,
        environment: version.environment,
        checksum: version.checksum
      }
    };

    // Include artifacts
    if (includeArtifacts) {
      exportData.artifacts = version.artifacts;
    }

    // Include metadata
    if (includeMetadata) {
      exportData.metadata = {
        ...version.metadata,
        changes: version.changes,
        compatibility: version.metadata.compatibility
      };
    }

    // Include dependencies
    if (includeDependencies) {
      exportData.dependencies = await this.getDependencyData(version);
    }

    // Include execution history
    if (includeExecutionHistory) {
      exportData.executionHistory = await this.getExecutionHistory(version.workflowId);
    }

    // Include comments if requested
    if (exportOptions.includeComments) {
      exportData.comments = await this.getWorkflowComments(version.workflowId);
    }

    // Include tests if requested
    if (exportOptions.includeTests) {
      exportData.tests = await this.getWorkflowTests(version.workflowId);
    }

    // Include documentation if requested
    if (exportOptions.includeDocumentation) {
      exportData.documentation = await this.getWorkflowDocumentation(version.workflowId);
    }

    // Include version history if requested
    if (exportOptions.includeVersionHistory) {
      exportData.versionHistory = await this.getVersionHistory(version.workflowId);
    }

    // Sanitize sensitive data
    if (!exportOptions.includeSecrets) {
      this.sanitizeSecrets(exportData);
    }

    if (!exportOptions.includeCredentials) {
      this.sanitizeCredentials(exportData);
    }

    if (!exportOptions.includeEnvironmentVariables) {
      this.sanitizeEnvironmentVariables(exportData);
    }

    return exportData;
  }

  /**
   * Export to specific format
   */
  private async exportToFormat(data: any, format: ExportFormat, options: ExportOptions): Promise<{ data: string | Buffer; size: number; checksum: string }> {
    let output: string | Buffer;
    let size: number;
    let checksum: string;

    switch (format) {
      case 'json':
        output = JSON.stringify(data, null, options.pretty ? 2 : 0);
        size = Buffer.byteLength(output, 'utf8');
        checksum = await this.calculateChecksum(output);
        break;

      case 'yaml':
        const yaml = await import('yaml');
        output = yaml.stringify(data, { indent: options.pretty ? 2 : 0 });
        size = Buffer.byteLength(output, 'utf8');
        checksum = await this.calculateChecksum(output);
        break;

      case 'n8n':
        const n8nData = this.convertToN8nFormat(data);
        output = JSON.stringify(n8nData, null, options.pretty ? 2 : 0);
        size = Buffer.byteLength(output, 'utf8');
        checksum = await this.calculateChecksum(output);
        break;

      case 'zip':
        const zipData = await this.createZipArchive(data, options);
        output = zipData;
        size = zipData.length;
        checksum = await this.calculateChecksum(zipData);
        break;

      case 'tar':
        const tarData = await this.createTarArchive(data, options);
        output = tarData;
        size = tarData.length;
        checksum = await this.calculateChecksum(tarData);
        break;

      default:
        throw new OrchestrationError(`Unsupported export format: ${format}`, 'UNSUPPORTED_FORMAT');
    }

    return { data: output, size, checksum };
  }

  /**
   * Convert to n8n format
   */
  private convertToN8nFormat(data: any): any {
    const workflow = data.workflow;
    
    return {
      id: workflow.id,
      name: workflow.name,
      nodes: workflow.steps.map((step: WorkflowStep) => ({
        id: step.id,
        name: step.name,
        type: step.type,
        typeVersion: 1,
        position: [0, 0], // Default position
        parameters: step.config,
        disabled: false
      })),
      connections: this.generateN8nConnections(workflow.steps),
      active: workflow.status === 'active',
      settings: {
        executionOrder: 'v1',
        saveManualExecutions: true,
        callerPolicy: 'workflowsFromSameOwner'
      },
      staticData: {},
      tags: workflow.metadata?.tags || [],
      pinData: {},
      versionId: data.version?.id || '1'
    };
  }

  /**
   * Generate n8n connections
   */
  private generateN8nConnections(steps: WorkflowStep[]): any {
    const connections: any = {};
    
    for (const step of steps) {
      if (step.dependencies.length > 0) {
        connections[step.id] = step.dependencies.map((depId: string) => ({
          node: depId,
          type: 'main',
          index: 0
        }));
      }
    }

    return connections;
  }

  /**
   * Create ZIP archive
   */
  private async createZipArchive(data: any, options: ExportOptions): Promise<Buffer> {
    const JSZip = await import('jszip');
    const zip = new JSZip.default();

    // Add main workflow file
    zip.file('workflow.json', JSON.stringify(data, null, 2));

    // Add artifacts if present
    if (data.artifacts) {
      zip.file('artifacts.json', JSON.stringify(data.artifacts, null, 2));
    }

    // Add dependencies if present
    if (data.dependencies) {
      zip.file('dependencies.json', JSON.stringify(data.dependencies, null, 2));
    }

    // Add metadata if present
    if (data.metadata) {
      zip.file('metadata.json', JSON.stringify(data.metadata, null, 2));
    }

    // Add documentation if present
    if (data.documentation) {
      zip.file('README.md', data.documentation);
    }

    // Add tests if present
    if (data.tests) {
      zip.file('tests.json', JSON.stringify(data.tests, null, 2));
    }

    return await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: options.compressionLevel || 6
      }
    });
  }

  /**
   * Create TAR archive
   */
  private async createTarArchive(data: any, options: ExportOptions): Promise<Buffer> {
    const tar = await import('tar');
    const { Readable } = await import('stream');

    const files = [
      { name: 'workflow.json', content: JSON.stringify(data, null, 2) }
    ];

    if (data.artifacts) {
      files.push({ name: 'artifacts.json', content: JSON.stringify(data.artifacts, null, 2) });
    }

    if (data.dependencies) {
      files.push({ name: 'dependencies.json', content: JSON.stringify(data.dependencies, null, 2) });
    }

    if (data.metadata) {
      files.push({ name: 'metadata.json', content: JSON.stringify(data.metadata, null, 2) });
    }

    if (data.documentation) {
      files.push({ name: 'README.md', content: data.documentation });
    }

    if (data.tests) {
      files.push({ name: 'tests.json', content: JSON.stringify(data.tests, null, 2) });
    }

    const streams = files.map(file => ({
      name: file.name,
      stream: Readable.from([file.content])
    }));

    return await tar.create({ gzip: true }, streams);
  }

  /**
   * Get dependency data
   */
  private async getDependencyData(version: WorkflowVersion): Promise<any> {
    // In a real implementation, this would fetch actual dependency information
    return {
      workflowDependencies: version.metadata.dependencies,
      externalDependencies: [],
      versionConstraints: {},
      resolvedVersions: {}
    };
  }

  /**
   * Get execution history
   */
  private async getExecutionHistory(workflowId: string): Promise<any> {
    // In a real implementation, this would fetch execution history
    return {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecution: null
    };
  }

  /**
   * Get workflow comments
   */
  private async getWorkflowComments(workflowId: string): Promise<any> {
    // In a real implementation, this would fetch comments
    return [];
  }

  /**
   * Get workflow tests
   */
  private async getWorkflowTests(workflowId: string): Promise<any> {
    // In a real implementation, this would fetch tests
    return [];
  }

  /**
   * Get workflow documentation
   */
  private async getWorkflowDocumentation(workflowId: string): Promise<string> {
    // In a real implementation, this would fetch documentation
    return `# Workflow: ${workflowId}\n\nThis workflow was exported from the orchestration system.`;
  }

  /**
   * Get version history
   */
  private async getVersionHistory(workflowId: string): Promise<any> {
    const versions = await this.versioningEngine.getVersions({ workflowId });
    return versions.map(v => ({
      id: v.id,
      version: v.version,
      status: v.status,
      createdAt: v.createdAt,
      createdBy: v.createdBy,
      changes: v.changes.length
    }));
  }

  /**
   * Sanitize secrets
   */
  private sanitizeSecrets(data: any): void {
    // Remove or mask sensitive data
    if (data.workflow?.config) {
      // Mask sensitive configuration values
      this.maskSensitiveFields(data.workflow.config, ['password', 'secret', 'key', 'token']);
    }

    if (data.workflow?.steps) {
      for (const step of data.workflow.steps) {
        if (step.config) {
          this.maskSensitiveFields(step.config, ['password', 'secret', 'key', 'token']);
        }
      }
    }
  }

  /**
   * Sanitize credentials
   */
  private sanitizeCredentials(data: any): void {
    // Remove credential information
    if (data.workflow?.steps) {
      for (const step of data.workflow.steps) {
        if (step.config?.credentials) {
          step.config.credentials = '[REDACTED]';
        }
      }
    }
  }

  /**
   * Sanitize environment variables
   */
  private sanitizeEnvironmentVariables(data: any): void {
    // Remove environment variable values
    if (data.workflow?.config?.environment) {
      data.workflow.config.environment = '[REDACTED]';
    }
  }

  /**
   * Mask sensitive fields
   */
  private maskSensitiveFields(obj: any, sensitiveKeys: string[]): void {
    for (const key in obj) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.maskSensitiveFields(obj[key], sensitiveKeys);
      }
    }
  }

  /**
   * Calculate checksum
   */
  private async calculateChecksum(data: string | Buffer): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Calculate bulk checksum
   */
  private async calculateBulkChecksum(results: ExportResult[]): Promise<string> {
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256');
    
    for (const result of results) {
      if (result.success) {
        hash.update(result.checksum);
      }
    }
    
    return hash.digest('hex');
  }

  /**
   * Generate export metadata
   */
  private generateExportMetadata(version: WorkflowVersion, format: ExportFormat, result: any, options: ExportOptions): ExportMetadata {
    return {
      workflowId: version.workflowId,
      versionId: version.id,
      version: version.version,
      environment: version.environment,
      exportedAt: new Date(),
      exportedBy: 'system',
      format,
      size: result.size,
      checksum: result.checksum,
      includes: {
        artifacts: true,
        dependencies: true,
        metadata: true,
        executionHistory: false,
        secrets: options.includeSecrets || false,
        credentials: options.includeCredentials || false,
        environmentVariables: options.includeEnvironmentVariables || false,
        comments: options.includeComments || false,
        versionHistory: options.includeVersionHistory || false,
        tests: options.includeTests || false,
        documentation: options.includeDocumentation || false
      },
      compatibility: {
        minVersion: '1.0.0',
        maxVersion: '2.0.0',
        supportedEnvironments: ['dev', 'staging', 'prod'],
        requiredFeatures: ['orchestration', 'versioning']
      }
    };
  }

  /**
   * Generate error metadata
   */
  private generateErrorMetadata(workflowId: string, format: ExportFormat, error: any): ExportMetadata {
    return {
      workflowId,
      environment: 'dev',
      exportedAt: new Date(),
      exportedBy: 'system',
      format,
      size: 0,
      checksum: '',
      includes: {
        artifacts: false,
        dependencies: false,
        metadata: false,
        executionHistory: false,
        secrets: false,
        credentials: false,
        environmentVariables: false,
        comments: false,
        versionHistory: false,
        tests: false,
        documentation: false
      },
      compatibility: {
        minVersion: '1.0.0',
        maxVersion: '2.0.0',
        supportedEnvironments: ['dev', 'staging', 'prod'],
        requiredFeatures: ['orchestration', 'versioning']
      }
    };
  }

  /**
   * Initialize default templates
   */
  private initializeDefaultTemplates(): void {
    // Full export template
    this.templates.set('full', {
      id: 'full',
      name: 'Full Export',
      description: 'Complete workflow export with all components',
      format: 'json',
      options: {
        pretty: true,
        includeSecrets: false,
        includeCredentials: false,
        includeEnvironmentVariables: false,
        includeComments: true,
        includeVersionHistory: true,
        includeTests: true,
        includeDocumentation: true
      },
      includes: {
        artifacts: true,
        dependencies: true,
        metadata: true,
        executionHistory: true,
        secrets: false,
        credentials: false,
        environmentVariables: false,
        comments: true,
        versionHistory: true,
        tests: true,
        documentation: true
      }
    });

    // Minimal export template
    this.templates.set('minimal', {
      id: 'minimal',
      name: 'Minimal Export',
      description: 'Basic workflow export with essential components only',
      format: 'json',
      options: {
        pretty: false,
        includeSecrets: false,
        includeCredentials: false,
        includeEnvironmentVariables: false,
        includeComments: false,
        includeVersionHistory: false,
        includeTests: false,
        includeDocumentation: false
      },
      includes: {
        artifacts: false,
        dependencies: false,
        metadata: false,
        executionHistory: false,
        secrets: false,
        credentials: false,
        environmentVariables: false,
        comments: false,
        versionHistory: false,
        tests: false,
        documentation: false
      }
    });

    // n8n export template
    this.templates.set('n8n', {
      id: 'n8n',
      name: 'n8n Export',
      description: 'Export in n8n format for direct import',
      format: 'n8n',
      options: {
        pretty: true,
        includeSecrets: false,
        includeCredentials: false,
        includeEnvironmentVariables: false,
        includeComments: false,
        includeVersionHistory: false,
        includeTests: false,
        includeDocumentation: false
      },
      includes: {
        artifacts: false,
        dependencies: false,
        metadata: false,
        executionHistory: false,
        secrets: false,
        credentials: false,
        environmentVariables: false,
        comments: false,
        versionHistory: false,
        tests: false,
        documentation: false
      }
    });
  }
}

// ============================================================================
// Factory
// ============================================================================

export class WorkflowExporterFactory {
  /**
   * Create exporter engine
   */
  static create(versioningEngine: WorkflowVersioningEngine): WorkflowExporterEngine {
    return new WorkflowExporterEngine(versioningEngine);
  }

  /**
   * Create export request
   */
  static createExportRequest(
    workflowId: string,
    format: ExportFormat = 'json',
    options: Partial<ExportOptions> = {}
  ): ExportRequest {
    return {
      workflowId,
      format,
      options: {
        pretty: true,
        includeSecrets: false,
        includeCredentials: false,
        includeEnvironmentVariables: false,
        includeComments: true,
        includeVersionHistory: false,
        includeTests: false,
        includeDocumentation: false,
        ...options
      },
      includeArtifacts: true,
      includeDependencies: true,
      includeMetadata: true,
      includeExecutionHistory: false
    };
  }
}
