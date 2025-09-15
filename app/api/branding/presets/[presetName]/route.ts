/**
 * @fileoverview Brand Preset Load API Route
 * @module app/api/branding/presets/[presetName]/route.ts
 * @author OSS Hero System
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { TenantBrandingService } from '@/lib/branding/tenant-service';

const brandingService = new TenantBrandingService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/branding/presets/[presetName] - Get specific brand preset
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { presetName: string } }
) {
  try {
    const { presetName } = params;
    
    if (!presetName) {
      return NextResponse.json(
        { success: false, error: 'Preset name is required' },
        { status: 400 }
      );
    }

    const result = await brandingService.getBrandPreset(presetName);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/branding/presets/[presetName] - Load brand preset for tenant
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { presetName: string } }
) {
  try {
    const { presetName } = params;
    const body = await request.json();
    const { tenantId, customizations } = body;
    
    if (!presetName) {
      return NextResponse.json(
        { success: false, error: 'Preset name is required' },
        { status: 400 }
      );
    }

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const result = await brandingService.loadBrandPreset(tenantId, {
      presetName,
      customizations,
    });
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
