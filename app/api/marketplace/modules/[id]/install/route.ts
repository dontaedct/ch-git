/**
 * Module Installation API Endpoints
 * 
 * Install, uninstall, and update modules
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { installationEngine } from '@/lib/marketplace/installation-engine';
import { pricingEngine } from '@/lib/marketplace/pricing-engine';

const InstallModuleSchema = z.object({
  tenantId: z.string(),
  version: z.string().optional(),
  skipDependencies: z.boolean().default(false),
  forceInstall: z.boolean().default(false),
});

const UninstallModuleSchema = z.object({
  tenantId: z.string(),
  forceUninstall: z.boolean().default(false),
  cleanupData: z.boolean().default(true),
});

const UpdateModuleSchema = z.object({
  tenantId: z.string(),
  targetVersion: z.string(),
  backupCurrent: z.boolean().default(true),
});

/**
 * POST /api/marketplace/modules/[id]/install
 * Install a module
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const moduleId = params.id;
    const body = await request.json();
    
    const installRequest = InstallModuleSchema.parse({
      ...body,
      moduleId,
    });

    // Check if module requires payment
    const pricingInfo = await pricingEngine.calculatePrice(
      moduleId,
      installRequest.tenantId,
      { type: 'free' } // Mock pricing model
    );

    if (pricingInfo.totalAmount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment required',
          pricingInfo,
        },
        { status: 402 } // Payment Required
      );
    }

    const result = await installationEngine.installModule(installRequest);

    return NextResponse.json({
      success: result.success,
      data: result,
    });

  } catch (error) {
    console.error('Error installing module:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/marketplace/modules/[id]/install
 * Uninstall a module
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const moduleId = params.id;
    const body = await request.json();
    
    const uninstallRequest = UninstallModuleSchema.parse({
      ...body,
      moduleId,
    });

    const result = await installationEngine.uninstallModule(uninstallRequest);

    return NextResponse.json({
      success: result.success,
      data: result,
    });

  } catch (error) {
    console.error('Error uninstalling module:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/marketplace/modules/[id]/install
 * Update a module
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const moduleId = params.id;
    const body = await request.json();
    
    const updateRequest = UpdateModuleSchema.parse({
      ...body,
      moduleId,
    });

    const result = await installationEngine.updateModule(updateRequest);

    return NextResponse.json({
      success: result.success,
      data: result,
    });

  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
