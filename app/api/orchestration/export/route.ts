/**
 * Workflow Export API Endpoint
 * 
 * Provides RESTful API for exporting workflows in various formats
 * with comprehensive validation and error handling per PRD Section 8.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  WorkflowExporterEngine,
  ExportRequest,
  ExportFormat,
  ExportOptions,
  BulkExportRequest
} from '@/lib/orchestration/workflow-exporter';
import { WorkflowVersioningEngine } from '@/lib/orchestration/workflow-versioning';
import { ArtifactStorageEngine } from '@/lib/orchestration/artifact-storage';
import { Environment } from '@/lib/orchestration/architecture';

// ============================================================================
// Request/Response Schemas
// ============================================================================

const ExportRequestSchema = z.object({
  workflowId: z.string().min(1, 'Workflow ID is required'),
  versionId: z.string().optional(),
  environment: z.enum(['dev', 'staging', 'prod']).optional(),
  format: z.enum(['json', 'yaml', 'zip', 'tar', 'n8n']).default('json'),
  options: z.object({
    pretty: z.boolean().optional(),
    minify: z.boolean().optional(),
    includeSecrets: z.boolean().optional(),
    includeCredentials: z.boolean().optional(),
    includeEnvironmentVariables: z.boolean().optional(),
    includeComments: z.boolean().optional(),
    includeVersionHistory: z.boolean().optional(),
    includeTests: z.boolean().optional(),
    includeDocumentation: z.boolean().optional(),
    compressionLevel: z.number().min(1).max(9).optional(),
    encryptionKey: z.string().optional(),
    signatureKey: z.string().optional()
  }).optional(),
  includeArtifacts: z.boolean().optional(),
  includeDependencies: z.boolean().optional(),
  includeMetadata: z.boolean().optional(),
  includeExecutionHistory: z.boolean().optional()
});

const BulkExportRequestSchema = z.object({
  workflowIds: z.array(z.string()).min(1, 'At least one workflow ID is required'),
  format: z.enum(['json', 'yaml', 'zip', 'tar', 'n8n']).default('json'),
  options: z.object({
    pretty: z.boolean().optional(),
    minify: z.boolean().optional(),
    includeSecrets: z.boolean().optional(),
    includeCredentials: z.boolean().optional(),
    includeEnvironmentVariables: z.boolean().optional(),
    includeComments: z.boolean().optional(),
    includeVersionHistory: z.boolean().optional(),
    includeTests: z.boolean().optional(),
    includeDocumentation: z.boolean().optional(),
    compressionLevel: z.number().min(1).max(9).optional(),
    encryptionKey: z.string().optional(),
    signatureKey: z.string().optional()
  }).optional(),
  includeArtifacts: z.boolean().optional(),
  includeDependencies: z.boolean().optional(),
  includeMetadata: z.boolean().optional(),
  includeExecutionHistory: z.boolean().optional(),
  outputFormat: z.enum(['individual', 'bundled', 'archive']).default('individual')
});

const TemplateExportRequestSchema = z.object({
  workflowId: z.string().min(1, 'Workflow ID is required'),
  templateId: z.string().min(1, 'Template ID is required'),
  overrides: z.object({
    pretty: z.boolean().optional(),
    minify: z.boolean().optional(),
    includeSecrets: z.boolean().optional(),
    includeCredentials: z.boolean().optional(),
    includeEnvironmentVariables: z.boolean().optional(),
    includeComments: z.boolean().optional(),
    includeVersionHistory: z.boolean().optional(),
    includeTests: z.boolean().optional(),
    includeDocumentation: z.boolean().optional(),
    compressionLevel: z.number().min(1).max(9).optional(),
    encryptionKey: z.string().optional(),
    signatureKey: z.string().optional()
  }).optional()
});

// ============================================================================
// API Handlers
// ============================================================================

/**
 * POST /api/orchestration/export
 * Export a single workflow
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = ExportRequestSchema.parse(body);

    // Initialize engines
    const versioningEngine = new WorkflowVersioningEngine();
    const exporterEngine = new WorkflowExporterEngine(versioningEngine);

    // Create export request
    const exportRequest: ExportRequest = {
      workflowId: validatedData.workflowId,
      versionId: validatedData.versionId,
      environment: validatedData.environment as Environment,
      format: validatedData.format as ExportFormat,
      options: validatedData.options || {},
      includeArtifacts: validatedData.includeArtifacts,
      includeDependencies: validatedData.includeDependencies,
      includeMetadata: validatedData.includeMetadata,
      includeExecutionHistory: validatedData.includeExecutionHistory
    };

    // Export workflow
    const result = await exporterEngine.exportWorkflow(exportRequest);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Export failed',
          details: result.errors,
          warnings: result.warnings
        },
        { status: 400 }
      );
    }

    // Return export result
    return NextResponse.json({
      success: true,
      data: {
        format: result.format,
        size: result.size,
        checksum: result.checksum,
        metadata: result.metadata
      },
      downloadUrl: `/api/orchestration/export/download/${result.metadata.workflowId}?format=${result.format}&checksum=${result.checksum}`,
      warnings: result.warnings
    });

  } catch (error) {
    console.error('Export API error:', error);

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
 * GET /api/orchestration/export
 * Get export templates and options
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Initialize engines
    const versioningEngine = new WorkflowVersioningEngine();
    const exporterEngine = new WorkflowExporterEngine(versioningEngine);

    switch (action) {
      case 'templates':
        // Get available export templates
        const templates = [
          {
            id: 'full',
            name: 'Full Export',
            description: 'Complete workflow export with all components',
            format: 'json',
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
          },
          {
            id: 'minimal',
            name: 'Minimal Export',
            description: 'Basic workflow export with essential components only',
            format: 'json',
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
          },
          {
            id: 'n8n',
            name: 'n8n Export',
            description: 'Export in n8n format for direct import',
            format: 'n8n',
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
          }
        ];

        return NextResponse.json({
          success: true,
          templates
        });

      case 'formats':
        // Get supported export formats
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
        // Get export options
        const options = {
          pretty: {
            type: 'boolean',
            description: 'Format output with indentation',
            default: true
          },
          minify: {
            type: 'boolean',
            description: 'Minify output to reduce size',
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
          includeComments: {
            type: 'boolean',
            description: 'Include comments and documentation',
            default: true
          },
          includeVersionHistory: {
            type: 'boolean',
            description: 'Include version history information',
            default: false
          },
          includeTests: {
            type: 'boolean',
            description: 'Include test files and configurations',
            default: false
          },
          includeDocumentation: {
            type: 'boolean',
            description: 'Include documentation files',
            default: true
          },
          compressionLevel: {
            type: 'number',
            description: 'Compression level (1-9)',
            default: 6,
            min: 1,
            max: 9
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
    console.error('Export API error:', error);

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
 * PUT /api/orchestration/export
 * Bulk export multiple workflows
 */
export async function PUT(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = BulkExportRequestSchema.parse(body);

    // Initialize engines
    const versioningEngine = new WorkflowVersioningEngine();
    const exporterEngine = new WorkflowExporterEngine(versioningEngine);

    // Create bulk export request
    const bulkExportRequest: BulkExportRequest = {
      workflowIds: validatedData.workflowIds,
      format: validatedData.format as ExportFormat,
      options: validatedData.options || {},
      includeArtifacts: validatedData.includeArtifacts,
      includeDependencies: validatedData.includeDependencies,
      includeMetadata: validatedData.includeMetadata,
      includeExecutionHistory: validatedData.includeExecutionHistory,
      outputFormat: validatedData.outputFormat
    };

    // Export workflows
    const result = await exporterEngine.exportBulk(bulkExportRequest);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bulk export failed',
          details: result.errors,
          warnings: result.warnings
        },
        { status: 400 }
      );
    }

    // Return bulk export result
    return NextResponse.json({
      success: true,
      data: {
        totalWorkflows: result.totalWorkflows,
        successfulExports: result.successfulExports,
        failedExports: result.failedExports,
        totalSize: result.metadata.totalSize,
        checksum: result.metadata.checksum
      },
      results: result.results.map(r => ({
        workflowId: r.metadata.workflowId,
        success: r.success,
        format: r.format,
        size: r.size,
        checksum: r.checksum,
        errors: r.errors,
        warnings: r.warnings
      })),
      warnings: result.warnings
    });

  } catch (error) {
    console.error('Bulk export API error:', error);

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
 * PATCH /api/orchestration/export
 * Export using template
 */
export async function PATCH(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = TemplateExportRequestSchema.parse(body);

    // Initialize engines
    const versioningEngine = new WorkflowVersioningEngine();
    const exporterEngine = new WorkflowExporterEngine(versioningEngine);

    // Export using template
    const result = await exporterEngine.exportWithTemplate(
      validatedData.workflowId,
      validatedData.templateId,
      validatedData.overrides
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template export failed',
          details: result.errors,
          warnings: result.warnings
        },
        { status: 400 }
      );
    }

    // Return template export result
    return NextResponse.json({
      success: true,
      data: {
        format: result.format,
        size: result.size,
        checksum: result.checksum,
        metadata: result.metadata
      },
      downloadUrl: `/api/orchestration/export/download/${result.metadata.workflowId}?format=${result.format}&checksum=${result.checksum}`,
      warnings: result.warnings
    });

  } catch (error) {
    console.error('Template export API error:', error);

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
 * Validate export format
 */
function isValidExportFormat(format: string): format is ExportFormat {
  return ['json', 'yaml', 'zip', 'tar', 'n8n'].includes(format);
}

/**
 * Get MIME type for export format
 */
function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'json':
    case 'n8n':
      return 'application/json';
    case 'yaml':
      return 'application/x-yaml';
    case 'zip':
      return 'application/zip';
    case 'tar':
      return 'application/x-tar';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Get file extension for export format
 */
function getFileExtension(format: ExportFormat): string {
  switch (format) {
    case 'json':
    case 'n8n':
      return '.json';
    case 'yaml':
      return '.yaml';
    case 'zip':
      return '.zip';
    case 'tar':
      return '.tar';
    default:
      return '.bin';
  }
}

/**
 * Generate filename for export
 */
function generateFilename(workflowId: string, format: ExportFormat, version?: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const versionSuffix = version ? `_v${version}` : '';
  const extension = getFileExtension(format);
  
  return `workflow_${workflowId}${versionSuffix}_${timestamp}${extension}`;
}

// ============================================================================
// Error Responses
// ============================================================================

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
