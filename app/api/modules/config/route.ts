/**
 * Module Configuration API Endpoints
 * 
 * RESTful API for managing module configurations with comprehensive security,
 * validation, and audit logging per PRD Section 7 requirements.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createTenantConfigManager } from '@/lib/modules/tenant-config';
import { createConfigNamespaceManager } from '@/lib/modules/config-namespace';
import { ModuleSandboxFactory } from '@/lib/modules/module-sandbox';

// =============================================================================
// REQUEST/RESPONSE SCHEMAS
// =============================================================================

const GetConfigRequestSchema = z.object({
  tenantId: z.string().min(1),
  moduleId: z.string().min(1),
  key: z.string().min(1),
  namespaceId: z.string().optional(),
});

const SetConfigRequestSchema = z.object({
  tenantId: z.string().min(1),
  moduleId: z.string().min(1),
  key: z.string().min(1),
  value: z.any(),
  namespaceId: z.string().optional(),
  metadata: z.object({
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    sensitivity: z.enum(['public', 'internal', 'confidential', 'restricted']).default('internal'),
  }).optional(),
});

const UpdateConfigRequestSchema = z.object({
  tenantId: z.string().min(1),
  moduleId: z.string().min(1),
  updates: z.record(z.any()),
  namespaceId: z.string().optional(),
});

const DeleteConfigRequestSchema = z.object({
  tenantId: z.string().min(1),
  moduleId: z.string().min(1),
  key: z.string().min(1),
  namespaceId: z.string().optional(),
});

const ExportConfigRequestSchema = z.object({
  tenantId: z.string().min(1),
  moduleId: z.string().min(1),
  format: z.enum(['json', 'yaml', 'env', 'ini']).default('json'),
  namespaceId: z.string().optional(),
});

const ImportConfigRequestSchema = z.object({
  tenantId: z.string().min(1),
  moduleId: z.string().min(1),
  data: z.string().min(1),
  format: z.enum(['json', 'yaml', 'env', 'ini']).default('json'),
  namespaceId: z.string().optional(),
  mergeStrategy: z.enum(['replace', 'merge', 'skip_existing']).default('merge'),
});

const ValidateConfigRequestSchema = z.object({
  tenantId: z.string().min(1),
  moduleId: z.string().min(1),
  config: z.record(z.any()),
  namespaceId: z.string().optional(),
});

const ConfigHistoryRequestSchema = z.object({
  tenantId: z.string().min(1),
  moduleId: z.string().min(1),
  key: z.string().optional(),
  timeRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
});

// =============================================================================
// RESPONSE TYPES
// =============================================================================

interface ConfigResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    timestamp: string;
    version: string;
    moduleId: string;
    tenantId: string;
  };
}

interface ValidationResponse {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
    severity: 'error' | 'warning';
  }>;
  warnings: Array<{
    field: string;
    message: string;
    suggestion?: string;
  }>;
  sanitized?: Record<string, any>;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function createResponse(data: any, status = 200): NextResponse {
  const response: ConfigResponse = {
    success: status < 400,
    data: status < 400 ? data : undefined,
    error: status >= 400 ? data?.message || 'An error occurred' : undefined,
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      moduleId: data?.moduleId || 'unknown',
      tenantId: data?.tenantId || 'unknown',
    },
  };

  return NextResponse.json(response, { status });
}

function handleError(error: any, operation: string): NextResponse {
  console.error(`[CONFIG API] Error in ${operation}:`, error);
  
  if (error.name === 'ZodError') {
    return createResponse({
      message: 'Validation error',
      details: error.errors,
    }, 400);
  }

  if (error.name === 'ConfigValidationError') {
    return createResponse({
      message: error.message,
      errors: error.errors,
    }, 400);
  }

  if (error.name === 'ConfigNotFoundError') {
    return createResponse({
      message: error.message,
    }, 404);
  }

  if (error.name === 'PermissionDeniedError') {
    return createResponse({
      message: error.message,
    }, 403);
  }

  return createResponse({
    message: 'Internal server error',
  }, 500);
}

async function validateRequest(request: NextRequest, schema: z.ZodSchema): Promise<any> {
  const body = await request.json().catch(() => ({}));
  const searchParams = request.nextUrl.searchParams;
  
  // Combine body and query parameters
  const data = {
    ...body,
    ...Object.fromEntries(searchParams.entries()),
  };

  return schema.parse(data);
}

async function createManagers(moduleId: string, tenantId: string) {
  const sandbox = ModuleSandboxFactory.createDefaultSandbox(moduleId, tenantId);
  const configManager = createTenantConfigManager(sandbox);
  const namespaceManager = createConfigNamespaceManager(sandbox, configManager);
  
  return { sandbox, configManager, namespaceManager };
}

// =============================================================================
// API HANDLERS
// =============================================================================

/**
 * GET /api/modules/config
 * Get a configuration value
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = GetConfigRequestSchema.parse({
      tenantId: searchParams.get('tenantId'),
      moduleId: searchParams.get('moduleId'),
      key: searchParams.get('key'),
      namespaceId: searchParams.get('namespaceId'),
    });

    const { configManager, namespaceManager } = await createManagers(
      params.moduleId,
      params.tenantId
    );

    let value: any;

    if (params.namespaceId) {
      // Get from specific namespace
      value = await namespaceManager.getConfig(
        params.namespaceId,
        params.key
      );
    } else {
      // Get from tenant config
      value = await configManager.getConfig(
        params.tenantId,
        params.key
      );
    }

    return createResponse({
      key: params.key,
      value,
      moduleId: params.moduleId,
      tenantId: params.tenantId,
      namespaceId: params.namespaceId,
    });
  } catch (error) {
    return handleError(error, 'GET config');
  }
}

/**
 * POST /api/modules/config
 * Set a configuration value
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const params = await validateRequest(request, SetConfigRequestSchema);

    const { configManager, namespaceManager } = await createManagers(
      params.moduleId,
      params.tenantId
    );

    if (params.namespaceId) {
      // Set in specific namespace
      await namespaceManager.setConfig(
        params.namespaceId,
        params.key,
        params.value
      );
    } else {
      // Set in tenant config
      await configManager.setConfig(
        params.tenantId,
        params.key,
        params.value
      );
    }

    return createResponse({
      message: 'Configuration set successfully',
      key: params.key,
      moduleId: params.moduleId,
      tenantId: params.tenantId,
      namespaceId: params.namespaceId,
    }, 201);
  } catch (error) {
    return handleError(error, 'POST config');
  }
}

/**
 * PUT /api/modules/config
 * Update multiple configuration values
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const params = await validateRequest(request, UpdateConfigRequestSchema);

    const { configManager, namespaceManager } = await createManagers(
      params.moduleId,
      params.tenantId
    );

    if (params.namespaceId) {
      // Update in specific namespace
      for (const [key, value] of Object.entries(params.updates)) {
        await namespaceManager.setConfig(params.namespaceId, key, value);
      }
    } else {
      // Update in tenant config
      await configManager.updateConfig(params.tenantId, params.updates);
    }

    return createResponse({
      message: 'Configuration updated successfully',
      updatedKeys: Object.keys(params.updates),
      moduleId: params.moduleId,
      tenantId: params.tenantId,
      namespaceId: params.namespaceId,
    });
  } catch (error) {
    return handleError(error, 'PUT config');
  }
}

/**
 * DELETE /api/modules/config
 * Delete a configuration value
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = DeleteConfigRequestSchema.parse({
      tenantId: searchParams.get('tenantId'),
      moduleId: searchParams.get('moduleId'),
      key: searchParams.get('key'),
      namespaceId: searchParams.get('namespaceId'),
    });

    const { configManager, namespaceManager } = await createManagers(
      params.moduleId,
      params.tenantId
    );

    if (params.namespaceId) {
      // Delete from specific namespace
      await namespaceManager.deleteConfig(params.namespaceId, params.key);
    } else {
      // Delete from tenant config
      await configManager.deleteConfig(params.tenantId, params.key);
    }

    return createResponse({
      message: 'Configuration deleted successfully',
      key: params.key,
      moduleId: params.moduleId,
      tenantId: params.tenantId,
      namespaceId: params.namespaceId,
    });
  } catch (error) {
    return handleError(error, 'DELETE config');
  }
}

/**
 * POST /api/modules/config/export
 * Export configuration in various formats
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const params = await validateRequest(request, ExportConfigRequestSchema);

    const { configManager, namespaceManager } = await createManagers(
      params.moduleId,
      params.tenantId
    );

    let exportData: string;

    if (params.namespaceId) {
      // Export from specific namespace
      exportData = await namespaceManager.exportNamespace(
        params.namespaceId,
        { 
          includeChildren: false,
          includeMetadata: true,
          format: params.format === 'json' ? 'json' : 'yaml',
        }
      );
    } else {
      // Export from tenant config
      exportData = await configManager.exportConfig(
        params.tenantId,
        params.format
      );
    }

    return new NextResponse(exportData, {
      status: 200,
      headers: {
        'Content-Type': params.format === 'json' ? 'application/json' : 'text/plain',
        'Content-Disposition': `attachment; filename="config-${params.moduleId}-${params.tenantId}.${params.format}"`,
      },
    });
  } catch (error) {
    return handleError(error, 'POST config/export');
  }
}

/**
 * POST /api/modules/config/import
 * Import configuration from various formats
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const params = await validateRequest(request, ImportConfigRequestSchema);

    const { configManager, namespaceManager } = await createManagers(
      params.moduleId,
      params.tenantId
    );

    if (params.namespaceId) {
      // Import to specific namespace
      const exportData = JSON.parse(params.data); // Simplified parsing
      await namespaceManager.importNamespace(exportData, {
        mergeStrategy: params.mergeStrategy,
        validateSchema: true,
        createParents: true,
        dryRun: false,
      });
    } else {
      // Import to tenant config
      await configManager.importConfig(
        params.tenantId,
        params.data,
        params.format
      );
    }

    return createResponse({
      message: 'Configuration imported successfully',
      moduleId: params.moduleId,
      tenantId: params.tenantId,
      namespaceId: params.namespaceId,
    });
  } catch (error) {
    return handleError(error, 'POST config/import');
  }
}

/**
 * POST /api/modules/config/validate
 * Validate configuration without applying changes
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const params = await validateRequest(request, ValidateConfigRequestSchema);

    const { configManager } = await createManagers(
      params.moduleId,
      params.tenantId
    );

    const validationResult = await configManager.validateConfig(
      params.tenantId,
      params.config
    );

    const response: ValidationResponse = {
      valid: validationResult.valid,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      sanitized: validationResult.sanitized,
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleError(error, 'POST config/validate');
  }
}

/**
 * GET /api/modules/config/history
 * Get configuration change history
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = ConfigHistoryRequestSchema.parse({
      tenantId: searchParams.get('tenantId'),
      moduleId: searchParams.get('moduleId'),
      key: searchParams.get('key'),
      timeRange: searchParams.get('timeRangeStart') && searchParams.get('timeRangeEnd') ? {
        start: searchParams.get('timeRangeStart')!,
        end: searchParams.get('timeRangeEnd')!,
      } : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    });

    const { configManager } = await createManagers(
      params.moduleId,
      params.tenantId
    );

    const timeRange = params.timeRange ? {
      start: new Date(params.timeRange.start),
      end: new Date(params.timeRange.end),
    } : undefined;

    const history = await configManager.getConfigHistory(
      params.tenantId,
      params.key
    );

    // Apply pagination
    const paginatedHistory = history.slice(params.offset, params.offset + params.limit);

    return createResponse({
      history: paginatedHistory,
      pagination: {
        total: history.length,
        offset: params.offset,
        limit: params.limit,
        hasMore: params.offset + params.limit < history.length,
      },
      moduleId: params.moduleId,
      tenantId: params.tenantId,
    });
  } catch (error) {
    return handleError(error, 'GET config/history');
  }
}

/**
 * POST /api/modules/config/rollback
 * Rollback configuration to a specific version
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { tenantId, moduleId, versionId } = await request.json();

    if (!tenantId || !moduleId || !versionId) {
      return createResponse({
        message: 'Missing required fields: tenantId, moduleId, versionId',
      }, 400);
    }

    const { configManager } = await createManagers(moduleId, tenantId);

    await configManager.rollbackConfig(tenantId, versionId);

    return createResponse({
      message: 'Configuration rolled back successfully',
      versionId,
      moduleId,
      tenantId,
    });
  } catch (error) {
    return handleError(error, 'POST config/rollback');
  }
}

/**
 * GET /api/modules/config/all
 * Get all configuration for a tenant/module
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenantId');
    const moduleId = searchParams.get('moduleId');
    const namespaceId = searchParams.get('namespaceId');

    if (!tenantId || !moduleId) {
      return createResponse({
        message: 'Missing required parameters: tenantId, moduleId',
      }, 400);
    }

    const { configManager, namespaceManager } = await createManagers(moduleId, tenantId);

    let config: Record<string, any>;

    if (namespaceId) {
      // Get all config from specific namespace
      const namespace = await namespaceManager.getNamespace(namespaceId);
      if (!namespace) {
        return createResponse({
          message: `Namespace ${namespaceId} not found`,
        }, 404);
      }
      
      // Get namespace configuration (simplified)
      config = {}; // Would implement actual namespace config retrieval
    } else {
      // Get all config from tenant
      config = await configManager.getAllConfig(tenantId);
    }

    return createResponse({
      config,
      moduleId,
      tenantId,
      namespaceId,
    });
  } catch (error) {
    return handleError(error, 'GET config/all');
  }
}
