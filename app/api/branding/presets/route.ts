/**
 * @fileoverview Brand Presets API Routes
 * @module app/api/branding/presets/route.ts
 * @author OSS Hero System
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
// TODO: Re-enable when branding system is implemented
// import { TenantBrandingService } from '@/lib/branding/tenant-service';

// Temporary stub for MVP
class TenantBrandingService {
  constructor(_url: string, _key: string) {}
  async getPresets() { return { data: [] }; }
  async applyPreset() { return { data: null }; }
}

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
