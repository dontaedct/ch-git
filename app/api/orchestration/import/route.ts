/**
 * Workflow Import API Endpoint
 * 
 * Provides RESTful API for importing workflows with validation,
 * compatibility checking, and automatic migration per PRD Section 8.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  WorkflowImporterEngine,
  ImportRequest,
  ExportFormat,
  ImportOptions
} from '@/lib/orchestration/workflow-importer';
import { WorkflowExporterEngine } from '@/lib/orchestration/workflow-exporter';
import { WorkflowVersioningEngine } from '@/lib/orchestration/workflow-versioning';
import { ArtifactStorageEngine } from '@/lib/orchestration/artifact-storage';
import { Environment } from '@/lib/orchestration/architecture';

// ============================================================================
// Request/Response Schemas
// ============================================================================

const ImportRequestSchema = z.object({
  data: z.string().min(1, 'Import data is required'),
  format: z.enum(['json', 'yaml', 'zip', 'tar', 'n8n']).default('json'),
  options: z.object({
    validateCompatibility: z.boolean().optional(),
    autoMigrate: z.boolean().optional(),
    createNewVersion: z.boolean().optional(),
    overwriteExisting: z.boolean().optional(),
    includeSecrets: z.boolean().optional(),
    includeCredentials: z.boolean().optional(),
    includeEnvironmentVariables: z.boolean().optional(),
    includeArtifacts: z.boolean().optional(),
    includeDependencies: z.boolean().optional(),
    includeMetadata: z.boolean().optional(),
    includeExecutionHistory: z.boolean().optional(),
    dryRun: z.boolean().optional(),
    skipValidation: z.boolean().optional(),
    migrationStrategy: z.enum(['auto', 'manual', 'preserve', 'overwrite']).optional(),
    conflictResolution: z.enum(['skip', 'overwrite', 'merge', 'rename', 'prompt']).optional()
  }).optional(),
  targetEnvironment: z.enum(['dev', 'staging', 'prod']).optional(),
  workflowId: z.string().optional(),
  version: z.string().optional(),
  createdBy: z.string().optional(),
  source: z.string().optional()
});

const TemplateImportRequestSchema = z.object({
  data: z.string().min(1, 'Import data is required'),
  templateId: z.string().min(1, 'Template ID is required'),
  overrides: z.object({
    validateCompatibility: z.boolean().optional(),
    autoMigrate: z.boolean().optional(),
    createNewVersion: z.boolean().optional(),
    overwriteExisting: z.boolean().optional(),
    includeSecrets: z.boolean().optional(),
    includeCredentials: z.boolean().optional(),
    includeEnvironmentVariables: z.boolean().optional(),
    includeArtifacts: z.boolean().optional(),
    includeDependencies: z.boolean().optional(),
    includeMetadata: z.boolean().optional(),
    includeExecutionHistory: z.boolean().optional(),
    dryRun: z.boolean().optional(),
    skipValidation: z.boolean().optional(),
    migrationStrategy: z.enum(['auto', 'manual', 'preserve', 'overwrite']).optional(),
    conflictResolution: z.enum(['skip', 'overwrite', 'merge', 'rename', 'prompt']).optional()
  }).optional(),
  targetEnvironment: z.enum(['dev', 'staging', 'prod']).optional(),
  workflowId: z.string().optional(),
  version: z.string().optional(),
  createdBy: z.string().optional(),
  source: z.string().optional()
});

const ValidationRequestSchema = z.object({
  data: z.string().min(1, 'Validation data is required'),
  format: z.enum(['json', 'yaml', 'zip', 'tar', 'n8n']).default('json')
});

const PreviewRequestSchema = z.object({
  data: z.string().min(1, 'Preview data is required'),
  format: z.enum(['json', 'yaml', 'zip', 'tar', 'n8n']).default('json')
});

// ============================================================================
// API Handlers
// ============================================================================

/**
 * POST /api/orchestration/import
 * Import a workflow
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = ImportRequestSchema.parse(body);

    // Initialize engines
    const versioningEngine = new WorkflowVersioningEngine();
    const exporterEngine = new WorkflowExporterEngine(versioningEngine);
    const artifactStorage = new ArtifactStorageEngine({
      provider: 'local',
      bucket: 'workflow-artifacts',
      region: 'us-east-1',
      encryption: { enabled: false, algorithm: 'AES-256', keyRotation: false, keyRotationInterval: 90 },
      compression: { enabled: false, algorithm: 'gzip', level: 6, threshold: 1024 },
      retention: { enabled: false, defaultRetentionDays: 365, maxRetentionDays: 1095, archiveAfterDays: 90, deleteAfterDays: 365, policies: [] },
      access: { publicRead: false, authenticatedRead: true, authenticatedWrite: true, adminOnly: false, rateLimiting: { enabled: false, requestsPerMinute: 100, requestsPerHour: 1000, requestsPerDay: 10000, burstLimit: 50 } },
      monitoring: { enabled: false, metrics: false, logging: false, alerting: false, retentionDays: 30 }
    });
    const importerEngine = new WorkflowImporterEngine(versioningEngine, exporterEngine);

    // Create import request
    const importRequest: ImportRequest = {
      data: validatedData.data,
      format: validatedData.format as ExportFormat,
      options: validatedData.options || {},
      targetEnvironment: validatedData.targetEnvironment as Environment,
      workflowId: validatedData.workflowId,
      version: validatedData.version,
      createdBy: validatedData.createdBy || 'system',
      source: validatedData.source || 'api'
    };

    // Import workflow
    const result = await importerEngine.importWorkflow(importRequest);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Import failed',
          details: result.errors,
          warnings: result.warnings,
          validation: result.validation
        },
        { status: 400 }
      );
    }

    // Return import result
    return NextResponse.json({
      success: true,
      data: {
        workflowId: result.workflowId,
        versionId: result.versionId,
        version: result.version,
        environment: result.environment,
        importedAt: result.importedAt,
        importedBy: result.importedBy,
        source: result.source
      },
      validation: result.validation,
      migration: result.migration,
      conflicts: result.conflicts,
      warnings: result.warnings,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Import API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orchestration/import
 * Get import templates and options
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Initialize engines
    const versioningEngine = new WorkflowVersioningEngine();
    const exporterEngine = new WorkflowExporterEngine(versioningEngine);
    const artifactStorage = new ArtifactStorageEngine({
      provider: 'local',
      bucket: 'workflow-artifacts',
      region: 'us-east-1',
      encryption: { enabled: false, algorithm: 'AES-256', keyRotation: false, keyRotationInterval: 90 },
      compression: { enabled: false, algorithm: 'gzip', level: 6, threshold: 1024 },
      retention: { enabled: false, defaultRetentionDays: 365, maxRetentionDays: 1095, archiveAfterDays: 90, deleteAfterDays: 365, policies: [] },
      access: { publicRead: false, authenticatedRead: true, authenticatedWrite: true, adminOnly: false, rateLimiting: { enabled: false, requestsPerMinute: 100, requestsPerHour: 1000, requestsPerDay: 10000, burstLimit: 50 } },
      monitoring: { enabled: false, metrics: false, logging: false, alerting: false, retentionDays: 30 }
    });
    const importerEngine = new WorkflowImporterEngine(versioningEngine, exporterEngine);

    switch (action) {
      case 'templates':
        // Get available import templates
        const templates = [
          {
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
            }
          },
          {
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
            }
          }
        ];

        return NextResponse.json({
          success: true,
          templates
        });

      case 'formats':
        // Get supported import formats
        const formats = [
          {
            id: 'json',
            name: 'JSON',
            description: 'JavaScript Object Notation format',
            mimeType: 'application/json',
            extensions: ['.json']
          },
          {
            id: 'yaml',
            name: 'YAML',
            description: 'YAML Ain\'t Markup Language format',
            mimeType: 'application/x-yaml',
            extensions: ['.yaml', '.yml']
          },
          {
            id: 'zip',
            name: 'ZIP Archive',
            description: 'Compressed archive with multiple files',
            mimeType: 'application/zip',
            extensions: ['.zip']
          },
          {
            id: 'tar',
            name: 'TAR Archive',
            description: 'Unix tape archive format',
            mimeType: 'application/x-tar',
            extensions: ['.tar', '.tar.gz']
          },
          {
            id: 'n8n',
            name: 'n8n Format',
            description: 'Native n8n workflow format',
            mimeType: 'application/json',
            extensions: ['.json']
          }
        ];

        return NextResponse.json({
          success: true,
          formats
        });

      case 'options':
        // Get import options
        const options = {
          validateCompatibility: {
            type: 'boolean',
            description: 'Validate compatibility with target environment',
            default: true
          },
          autoMigrate: {
            type: 'boolean',
            description: 'Automatically migrate incompatible changes',
            default: false
          },
          createNewVersion: {
            type: 'boolean',
            description: 'Create new version instead of updating existing',
            default: true
          },
          overwriteExisting: {
            type: 'boolean',
            description: 'Overwrite existing workflow if it exists',
            default: false
          },
          includeSecrets: {
            type: 'boolean',
            description: 'Include sensitive configuration values',
            default: false
          },
          includeCredentials: {
            type: 'boolean',
            description: 'Include credential information',
            default: false
          },
          includeEnvironmentVariables: {
            type: 'boolean',
            description: 'Include environment variable values',
            default: false
          },
          includeArtifacts: {
            type: 'boolean',
            description: 'Include workflow artifacts',
            default: true
          },
          includeDependencies: {
            type: 'boolean',
            description: 'Include dependency information',
            default: true
          },
          includeMetadata: {
            type: 'boolean',
            description: 'Include metadata information',
            default: true
          },
          includeExecutionHistory: {
            type: 'boolean',
            description: 'Include execution history',
            default: false
          },
          dryRun: {
            type: 'boolean',
            description: 'Perform validation without importing',
            default: false
          },
          skipValidation: {
            type: 'boolean',
            description: 'Skip validation checks',
            default: false
          },
          migrationStrategy: {
            type: 'enum',
            description: 'Strategy for handling migrations',
            options: ['auto', 'manual', 'preserve', 'overwrite'],
            default: 'auto'
          },
          conflictResolution: {
            type: 'enum',
            description: 'Strategy for resolving conflicts',
            options: ['skip', 'overwrite', 'merge', 'rename', 'prompt'],
            default: 'prompt'
          }
        };

        return NextResponse.json({
          success: true,
          options
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            message: 'Supported actions: templates, formats, options'
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Import API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orchestration/import
 * Import using template
 */
export async function PUT(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = TemplateImportRequestSchema.parse(body);

    // Initialize engines
    const versioningEngine = new WorkflowVersioningEngine();
    const exporterEngine = new WorkflowExporterEngine(versioningEngine);
    const artifactStorage = new ArtifactStorageEngine({
      provider: 'local',
      bucket: 'workflow-artifacts',
      region: 'us-east-1',
      encryption: { enabled: false, algorithm: 'AES-256', keyRotation: false, keyRotationInterval: 90 },
      compression: { enabled: false, algorithm: 'gzip', level: 6, threshold: 1024 },
      retention: { enabled: false, defaultRetentionDays: 365, maxRetentionDays: 1095, archiveAfterDays: 90, deleteAfterDays: 365, policies: [] },
      access: { publicRead: false, authenticatedRead: true, authenticatedWrite: true, adminOnly: false, rateLimiting: { enabled: false, requestsPerMinute: 100, requestsPerHour: 1000, requestsPerDay: 10000, burstLimit: 50 } },
      monitoring: { enabled: false, metrics: false, logging: false, alerting: false, retentionDays: 30 }
    });
    const importerEngine = new WorkflowImporterEngine(versioningEngine, exporterEngine);

    // Import using template
    const result = await importerEngine.importWithTemplate(
      validatedData.data,
      validatedData.templateId,
      validatedData.overrides
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template import failed',
          details: result.errors,
          warnings: result.warnings,
          validation: result.validation
        },
        { status: 400 }
      );
    }

    // Return template import result
    return NextResponse.json({
      success: true,
      data: {
        workflowId: result.workflowId,
        versionId: result.versionId,
        version: result.version,
        environment: result.environment,
        importedAt: result.importedAt,
        importedBy: result.importedBy,
        source: result.source
      },
      validation: result.validation,
      migration: result.migration,
      conflicts: result.conflicts,
      warnings: result.warnings,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Template import API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orchestration/import
 * Validate import data
 */
export async function PATCH(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = ValidationRequestSchema.parse(body);

    // Initialize engines
    const versioningEngine = new WorkflowVersioningEngine();
    const exporterEngine = new WorkflowExporterEngine(versioningEngine);
    const artifactStorage = new ArtifactStorageEngine({
      provider: 'local',
      bucket: 'workflow-artifacts',
      region: 'us-east-1',
      encryption: { enabled: false, algorithm: 'AES-256', keyRotation: false, keyRotationInterval: 90 },
      compression: { enabled: false, algorithm: 'gzip', level: 6, threshold: 1024 },
      retention: { enabled: false, defaultRetentionDays: 365, maxRetentionDays: 1095, archiveAfterDays: 90, deleteAfterDays: 365, policies: [] },
      access: { publicRead: false, authenticatedRead: true, authenticatedWrite: true, adminOnly: false, rateLimiting: { enabled: false, requestsPerMinute: 100, requestsPerHour: 1000, requestsPerDay: 10000, burstLimit: 50 } },
      monitoring: { enabled: false, metrics: false, logging: false, alerting: false, retentionDays: 30 }
    });
    const importerEngine = new WorkflowImporterEngine(versioningEngine, exporterEngine);

    // Validate import data
    const validation = await importerEngine.validateImport(
      validatedData.data,
      validatedData.format as ExportFormat
    );

    return NextResponse.json({
      success: true,
      validation: {
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
        compatibility: validation.compatibility,
        security: validation.security,
        performance: validation.performance
      }
    });

  } catch (error) {
    console.error('Validation API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orchestration/import
 * Get import preview
 */
export async function DELETE(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = PreviewRequestSchema.parse(body);

    // Initialize engines
    const versioningEngine = new WorkflowVersioningEngine();
    const exporterEngine = new WorkflowExporterEngine(versioningEngine);
    const artifactStorage = new ArtifactStorageEngine({
      provider: 'local',
      bucket: 'workflow-artifacts',
      region: 'us-east-1',
      encryption: { enabled: false, algorithm: 'AES-256', keyRotation: false, keyRotationInterval: 90 },
      compression: { enabled: false, algorithm: 'gzip', level: 6, threshold: 1024 },
      retention: { enabled: false, defaultRetentionDays: 365, maxRetentionDays: 1095, archiveAfterDays: 90, deleteAfterDays: 365, policies: [] },
      access: { publicRead: false, authenticatedRead: true, authenticatedWrite: true, adminOnly: false, rateLimiting: { enabled: false, requestsPerMinute: 100, requestsPerHour: 1000, requestsPerDay: 10000, burstLimit: 50 } },
      monitoring: { enabled: false, metrics: false, logging: false, alerting: false, retentionDays: 30 }
    });
    const importerEngine = new WorkflowImporterEngine(versioningEngine, exporterEngine);

    // Get import preview
    const preview = await importerEngine.getImportPreview(
      validatedData.data,
      validatedData.format as ExportFormat
    );

    return NextResponse.json({
      success: true,
      preview: {
        workflow: {
          id: preview.workflow.id,
          name: preview.workflow.name,
          description: preview.workflow.description,
          version: preview.workflow.version,
          status: preview.workflow.status,
          type: preview.workflow.type,
          steps: preview.workflow.steps.map(step => ({
            id: step.id,
            name: step.name,
            type: step.type,
            order: step.order
          })),
          triggers: preview.workflow.triggers.map(trigger => ({
            id: trigger.id,
            type: trigger.type,
            enabled: trigger.enabled
          }))
        },
        metadata: preview.metadata,
        validation: preview.validation,
        conflicts: preview.conflicts,
        migration: preview.migration
      }
    });

  } catch (error) {
    console.error('Preview API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validate import format
 */
function isValidImportFormat(format: string): format is ExportFormat {
  return ['json', 'yaml', 'zip', 'tar', 'n8n'].includes(format);
}

/**
 * Detect format from data
 */
function detectFormat(data: string): ExportFormat {
  try {
    const parsed = JSON.parse(data);
    if (parsed.nodes && parsed.connections) {
      return 'n8n';
    }
    return 'json';
  } catch {
    if (data.includes('---') || data.includes(':')) {
      return 'yaml';
    }
  }
  return 'json';
}

/**
 * Validate import data structure
 */
function validateImportDataStructure(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data) {
    errors.push('Import data is required');
    return { valid: false, errors };
  }

  if (!data.workflow) {
    errors.push('Workflow definition is required');
  } else {
    if (!data.workflow.id) {
      errors.push('Workflow ID is required');
    }
    if (!data.workflow.name) {
      errors.push('Workflow name is required');
    }
    if (!data.workflow.steps || !Array.isArray(data.workflow.steps)) {
      errors.push('Workflow steps are required');
    }
    if (!data.workflow.triggers || !Array.isArray(data.workflow.triggers)) {
      errors.push('Workflow triggers are required');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Create error response
 */
function createErrorResponse(error: string, message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
      message
    },
    { status }
  );
}

/**
 * Create validation error response
 */
function createValidationErrorResponse(errors: any[]) {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      details: errors
    },
    { status: 400 }
  );
}

/**
 * Create internal server error response
 */
function createInternalErrorResponse(error: Error) {
  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      message: error.message
    },
    { status: 500 }
  );
}
