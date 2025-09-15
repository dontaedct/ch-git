/**
 * @fileoverview Brand Presets API Routes
 * @module app/api/branding/presets/route.ts
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
 * GET /api/branding/presets - Get available brand presets
 */
export async function GET(request: NextRequest) {
  try {
    const result = await brandingService.getBrandPresets();
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
