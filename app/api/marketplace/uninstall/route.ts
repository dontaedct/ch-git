/**
 * HT-035.3.2: Module Uninstallation API Endpoint
 * 
 * RESTful API endpoint for module uninstallation with cleanup and validation
 * per PRD requirements.
 * 
 * Features:
 * - Module uninstallation with dependency checking
 * - Data cleanup options
 * - Uninstallation validation
 * - Rollback capabilities
 * - Progress tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { moduleInstaller } from '@/lib/marketplace/module-installer';
import { installationTracker } from '@/lib/marketplace/installation-tracker';

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const UninstallModuleRequestSchema = z.object({
  moduleId: z.string().min(1),
  tenantId: z.string().min(1),
  options: z.object({
    forceUninstall: z.boolean().default(false),
    cleanupData: z.boolean().default(true),
    skipValidation: z.boolean().default(false),
    createBackup: z.boolean().default(true),
  }).default({}),
});

// =============================================================================
// API ENDPOINT
// =============================================================================

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
      progress: 10,
      currentStep: 'Validating uninstallation requirements',
    });

    // Check if module is installed
    const isInstalled = moduleInstaller.isModuleInstalled(
      validatedRequest.moduleId,
      validatedRequest.tenantId
    );

    if (!isInstalled) {
      await installationTracker.completeInstallationTracking(
        installationId,
        false,
        { error: 'Module is not installed' }
      );

      return NextResponse.json({
        success: false,
        error: 'Module is not installed',
        moduleId: validatedRequest.moduleId,
        tenantId: validatedRequest.tenantId,
      });
    }

    // Update progress
    await installationTracker.updateInstallationProgress(installationId, {
      status: 'validating',
      progress: 30,
      currentStep: 'Checking for dependent modules',
    });

    // Perform uninstallation
    const result = await moduleInstaller.uninstallModule(
      validatedRequest.moduleId,
      validatedRequest.tenantId,
      validatedRequest.options
    );

    // Update progress
    await installationTracker.updateInstallationProgress(installationId, {
      status: result.success ? 'completed' : 'failed',
      progress: result.success ? 100 : 50,
      currentStep: result.success ? 'Uninstallation completed' : 'Uninstallation failed',
      error: result.errors.length > 0 ? result.errors.join(', ') : undefined,
      warnings: result.warnings,
    });

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
      installationId,
      moduleId: validatedRequest.moduleId,
      tenantId: validatedRequest.tenantId,
      cleanupPerformed: result.cleanupPerformed,
      warnings: result.warnings,
      errors: result.errors,
      metadata: {
        uninstalledAt: new Date().toISOString(),
        options: validatedRequest.options,
      },
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
 * POST /api/marketplace/uninstall/validate
 * Validate uninstallation requirements
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { moduleId, tenantId, options = {} } = body;

    if (!moduleId || !tenantId) {
      return NextResponse.json(
        { success: false, error: 'Module ID and Tenant ID are required' },
        { status: 400 }
      );
    }

    // Check if module is installed
    const isInstalled = moduleInstaller.isModuleInstalled(moduleId, tenantId);

    if (!isInstalled) {
      return NextResponse.json({
        success: false,
        error: 'Module is not installed',
        moduleId,
        tenantId,
        canUninstall: false,
        issues: ['Module is not installed'],
      });
    }

    // Get installation history to check for dependencies
    const history = await installationTracker.getInstallationHistory(moduleId, tenantId);
    const recentInstallations = history.filter(h => h.status === 'success').slice(0, 5);

    // Mock dependency check - in real app, this would check actual dependencies
    const dependentModules: string[] = [];
    const issues: string[] = [];
    const warnings: string[] = [];

    if (dependentModules.length > 0 && !options.forceUninstall) {
      issues.push(`Cannot uninstall: ${dependentModules.length} modules depend on this module`);
    }

    if (recentInstallations.length > 0) {
      warnings.push('Module was recently installed - consider keeping it');
    }

    const canUninstall = issues.length === 0;

    return NextResponse.json({
      success: true,
      moduleId,
      tenantId,
      canUninstall,
      issues,
      warnings,
      dependentModules,
      recentInstallations: recentInstallations.length,
      recommendations: canUninstall ? [
        'Create a backup before uninstalling',
        'Verify no critical data will be lost',
        'Test the system after uninstallation',
      ] : [
        'Resolve dependency issues before uninstalling',
        'Consider updating dependent modules first',
      ],
    });

  } catch (error) {
    console.error('Uninstallation validation API error:', error);
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
