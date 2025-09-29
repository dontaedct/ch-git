/**
 * HT-035.3.2: Module Installation API Endpoints
 * 
 * RESTful API endpoints for module installation, uninstallation, and management
 * per PRD requirements.
 * 
 * Features:
 * - Module installation with dependency resolution
 * - Module uninstallation with cleanup
 * - Installation progress tracking
 * - Installation history retrieval
 * - Rollback management
 * - Installation validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { moduleInstaller } from '@/lib/marketplace/module-installer';
import { dependencyResolver } from '@/lib/marketplace/dependency-resolver';
import { versionManager } from '@/lib/marketplace/version-manager';
import { installationValidator } from '@/lib/marketplace/installation-validator';
import { installationTracker } from '@/lib/marketplace/installation-tracker';

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const InstallModuleRequestSchema = z.object({
  moduleId: z.string().min(1),
  version: z.string().optional(),
  tenantId: z.string().min(1),
  options: z.object({
    skipValidation: z.boolean().default(false),
    skipTests: z.boolean().default(false),
    forceInstall: z.boolean().default(false),
    installDependencies: z.boolean().default(true),
  }).default({}),
});

const UninstallModuleRequestSchema = z.object({
  moduleId: z.string().min(1),
  tenantId: z.string().min(1),
  options: z.object({
    forceUninstall: z.boolean().default(false),
    cleanupData: z.boolean().default(true),
    skipValidation: z.boolean().default(false),
  }).default({}),
});

const UpdateModuleRequestSchema = z.object({
  moduleId: z.string().min(1),
  tenantId: z.string().min(1),
  targetVersion: z.string().min(1),
  options: z.object({
    backupCurrent: z.boolean().default(true),
    skipTests: z.boolean().default(false),
    forceUpdate: z.boolean().default(false),
  }).default({}),
});

const ValidateInstallationRequestSchema = z.object({
  moduleId: z.string().min(1),
  version: z.string().optional(),
  tenantId: z.string().min(1),
  options: z.object({
    includeSecurityScan: z.boolean().default(true),
    includePerformanceTest: z.boolean().default(false),
    includeCompatibilityCheck: z.boolean().default(true),
    skipCache: z.boolean().default(false),
  }).default({}),
});

// =============================================================================
// API ENDPOINTS
// =============================================================================

/**
 * POST /api/marketplace/install
 * Install a module for a tenant
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedRequest = InstallModuleRequestSchema.parse(body);

    // Start installation tracking
    const installationId = `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await installationTracker.startInstallationTracking(
      installationId,
      validatedRequest.moduleId,
      validatedRequest.tenantId,
      validatedRequest.version || 'latest',
      'api-user', // In real app, this would be the authenticated user
      { requestBody: validatedRequest }
    );

    // Update progress
    await installationTracker.updateInstallationProgress(installationId, {
      status: 'validating',
      progress: 10,
      currentStep: 'Validating installation requirements',
    });

    // Perform installation
    const result = await moduleInstaller.installModule(
      validatedRequest.moduleId,
      validatedRequest.tenantId,
      validatedRequest.version,
      validatedRequest.options
    );

    // Complete tracking
    await installationTracker.completeInstallationTracking(
      installationId,
      result.success,
      { result }
    );

    return NextResponse.json({
      success: result.success,
      installationId,
      moduleId: validatedRequest.moduleId,
      version: result.version,
      dependencies: result.dependencies,
      warnings: result.warnings,
      errors: result.errors,
      rollbackId: result.rollbackId,
    });

  } catch (error) {
    console.error('Installation API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/marketplace/uninstall
 * Uninstall a module from a tenant
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedRequest = UninstallModuleRequestSchema.parse(body);

    // Start tracking
    const installationId = `uninst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await installationTracker.startInstallationTracking(
      installationId,
      validatedRequest.moduleId,
      validatedRequest.tenantId,
      'uninstall',
      'api-user',
      { requestBody: validatedRequest }
    );

    // Update progress
    await installationTracker.updateInstallationProgress(installationId, {
      status: 'validating',
      progress: 20,
      currentStep: 'Validating uninstallation requirements',
    });

    // Perform uninstallation
    const result = await moduleInstaller.uninstallModule(
      validatedRequest.moduleId,
      validatedRequest.tenantId,
      validatedRequest.options
    );

    // Complete tracking
    await installationTracker.completeInstallationTracking(
      installationId,
      result.success,
      { result }
    );

    // Record history
    await installationTracker.recordInstallationHistory(
      validatedRequest.moduleId,
      validatedRequest.tenantId,
      'uninstall',
      'uninstall',
      'api-user',
      result.success ? 'success' : 'failed',
      0, // Duration will be calculated by tracker
      undefined,
      undefined,
      { result }
    );

    return NextResponse.json({
      success: result.success,
      moduleId: validatedRequest.moduleId,
      cleanupPerformed: result.cleanupPerformed,
      warnings: result.warnings,
      errors: result.errors,
    });

  } catch (error) {
    console.error('Uninstallation API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/marketplace/update
 * Update a module to a new version
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedRequest = UpdateModuleRequestSchema.parse(body);

    // Start tracking
    const installationId = `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await installationTracker.startInstallationTracking(
      installationId,
      validatedRequest.moduleId,
      validatedRequest.tenantId,
      validatedRequest.targetVersion,
      'api-user',
      { requestBody: validatedRequest }
    );

    // Update progress
    await installationTracker.updateInstallationProgress(installationId, {
      status: 'validating',
      progress: 15,
      currentStep: 'Validating update requirements',
    });

    // Perform update
    const result = await moduleInstaller.updateModule(
      validatedRequest.moduleId,
      validatedRequest.tenantId,
      validatedRequest.targetVersion,
      validatedRequest.options
    );

    // Complete tracking
    await installationTracker.completeInstallationTracking(
      installationId,
      result.success,
      { result }
    );

    // Record history
    await installationTracker.recordInstallationHistory(
      validatedRequest.moduleId,
      validatedRequest.tenantId,
      'update',
      validatedRequest.targetVersion,
      'api-user',
      result.success ? 'success' : 'failed',
      0, // Duration will be calculated by tracker
      result.fromVersion,
      result.rollbackId,
      { result }
    );

    return NextResponse.json({
      success: result.success,
      moduleId: validatedRequest.moduleId,
      fromVersion: result.fromVersion,
      toVersion: result.toVersion,
      updateId: result.updateId,
      breakingChanges: result.breakingChanges,
      warnings: result.warnings,
      errors: result.errors,
      rollbackId: result.rollbackId,
    });

  } catch (error) {
    console.error('Update API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/validate
 * Validate installation requirements
 */
export async function POST_VALIDATE(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedRequest = ValidateInstallationRequestSchema.parse(body);

    // Perform validation
    const validation = await installationValidator.validateInstallation(
      validatedRequest.moduleId,
      validatedRequest.version || 'latest',
      validatedRequest.tenantId,
      validatedRequest.options
    );

    return NextResponse.json({
      success: validation.passed,
      validationId: validation.validationId,
      moduleId: validatedRequest.moduleId,
      version: validatedRequest.version || 'latest',
      tenantId: validatedRequest.tenantId,
      overallScore: validation.overallScore,
      passed: validation.passed,
      results: validation.results,
      duration: validation.duration,
      metadata: validation.metadata,
    });

  } catch (error) {
    console.error('Validation API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/marketplace/progress/:installationId
 * Get installation progress
 */
export async function GET_PROGRESS(request: NextRequest, { params }: { params: { installationId: string } }) {
  try {
    const { installationId } = params;

    const progress = await installationTracker.getInstallationProgress(installationId);
    
    if (!progress) {
      return NextResponse.json(
        { success: false, error: 'Installation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      progress: {
        installationId: progress.installationId,
        moduleId: progress.moduleId,
        tenantId: progress.tenantId,
        version: progress.version,
        status: progress.status,
        progress: progress.progress,
        currentStep: progress.currentStep,
        totalSteps: progress.totalSteps,
        startedAt: progress.startedAt,
        completedAt: progress.completedAt,
        estimatedCompletion: progress.estimatedCompletion,
        duration: progress.duration,
        error: progress.error,
        warnings: progress.warnings,
      },
    });

  } catch (error) {
    console.error('Progress API error:', error);
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/marketplace/history/:moduleId/:tenantId
 * Get installation history
 */
export async function GET_HISTORY(request: NextRequest, { params }: { params: { moduleId: string; tenantId: string } }) {
  try {
    const { moduleId, tenantId } = params;
    const { searchParams } = new URL(request.url);
    
    const options = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
      action: searchParams.get('action') as any,
      status: searchParams.get('status') as any,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
    };

    const history = await installationTracker.getInstallationHistory(moduleId, tenantId, options);

    return NextResponse.json({
      success: true,
      moduleId,
      tenantId,
      history,
      count: history.length,
    });

  } catch (error) {
    console.error('History API error:', error);
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/marketplace/analytics/:moduleId/:tenantId
 * Get installation analytics
 */
export async function GET_ANALYTICS(request: NextRequest, { params }: { params: { moduleId: string; tenantId: string } }) {
  try {
    const { moduleId, tenantId } = params;
    const { searchParams } = new URL(request.url);
    
    const options = {
      includeTrends: searchParams.get('includeTrends') === 'true',
      days: searchParams.get('days') ? parseInt(searchParams.get('days')!) : 30,
    };

    const analytics = await installationTracker.getInstallationAnalytics(moduleId, tenantId, options);

    return NextResponse.json({
      success: true,
      moduleId,
      tenantId,
      analytics,
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/marketplace/statistics
 * Get installation statistics
 */
export async function GET_STATISTICS(request: NextRequest) {
  try {
    const statistics = await installationTracker.getInstallationStatistics();

    return NextResponse.json({
      success: true,
      statistics,
    });

  } catch (error) {
    console.error('Statistics API error:', error);
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/rollback
 * Create rollback record
 */
export async function POST_ROLLBACK(request: NextRequest) {
  try {
    const body = await request.json();
    const { installationId, moduleId, tenantId, fromVersion, toVersion, reason, backupPath } = body;

    if (!installationId || !moduleId || !tenantId || !fromVersion || !toVersion || !reason) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const rollbackRecord = await installationTracker.createRollbackRecord(
      installationId,
      moduleId,
      tenantId,
      fromVersion,
      toVersion,
      reason,
      'api-user',
      backupPath
    );

    return NextResponse.json({
      success: true,
      rollbackRecord,
    });

  } catch (error) {
    console.error('Rollback API error:', error);
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/marketplace/rollback/:rollbackId
 * Update rollback status
 */
export async function PUT_ROLLBACK(request: NextRequest, { params }: { params: { rollbackId: string } }) {
  try {
    const { rollbackId } = params;
    const body = await request.json();
    const { status, restorePath, duration, metadata } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const rollbackRecord = await installationTracker.updateRollbackStatus(
      rollbackId,
      status,
      restorePath,
      duration,
      metadata
    );

    if (!rollbackRecord) {
      return NextResponse.json(
        { success: false, error: 'Rollback record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      rollbackRecord,
    });

  } catch (error) {
    console.error('Rollback update API error:', error);
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/marketplace/rollbacks
 * Get rollback records
 */
export async function GET_ROLLBACKS(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const moduleId = searchParams.get('moduleId') || undefined;
    const tenantId = searchParams.get('tenantId') || undefined;
    const status = searchParams.get('status') as any;

    const rollbacks = await installationTracker.getRollbackRecords(moduleId, tenantId, status);

    return NextResponse.json({
      success: true,
      rollbacks,
      count: rollbacks.length,
    });

  } catch (error) {
    console.error('Rollbacks API error:', error);
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
