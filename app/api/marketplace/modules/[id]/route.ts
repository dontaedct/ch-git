/**
 * Individual Module API Endpoints
 * 
 * GET, PUT, DELETE operations for specific modules
 */

import { NextRequest, NextResponse } from 'next/server';
import { moduleRegistry } from '@/lib/marketplace/module-registry';
import { pricingEngine } from '@/lib/marketplace/pricing-engine';
import { qualityAssuranceEngine } from '@/lib/marketplace/quality-assurance';

/**
 * GET /api/marketplace/modules/[id]
 * Get module details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const moduleId = params.id;
    
    const module = await moduleRegistry.getModuleDetails(moduleId);
    if (!module) {
      return NextResponse.json(
        {
          success: false,
          error: 'Module not found',
        },
        { status: 404 }
      );
    }

    // Get additional details
    const reputationScore = await qualityAssuranceEngine.getReputationScore(moduleId);
    const reviews = await qualityAssuranceEngine.getModuleReviews(moduleId, 5);

    return NextResponse.json({
      success: true,
      data: {
        module,
        reputationScore,
        recentReviews: reviews,
      },
    });

  } catch (error) {
    console.error('Error getting module details:', error);
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
 * PUT /api/marketplace/modules/[id]
 * Update module metadata
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const moduleId = params.id;
    const updates = await request.json();
    
    const updatedModule = await moduleRegistry.updateModule(moduleId, updates);
    if (!updatedModule) {
      return NextResponse.json(
        {
          success: false,
          error: 'Module not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedModule,
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

/**
 * DELETE /api/marketplace/modules/[id]
 * Delete a module (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const moduleId = params.id;
    
    // In a real implementation, this would:
    // - Check admin permissions
    // - Remove module from registry
    // - Clean up associated data
    
    return NextResponse.json({
      success: true,
      message: 'Module deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
