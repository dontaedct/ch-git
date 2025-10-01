/**
 * @fileoverview Brand History API Routes
 * @module app/api/branding/history/route.ts
 * @author OSS Hero System
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
// TODO: Re-enable when branding system is implemented
// import { TenantBrandingService } from '@/lib/branding/tenant-service';

// Temporary stub for MVP
class TenantBrandingService {
  constructor(_url: string, _key: string) {}
  async getHistory() { return { data: [] }; }
}

const brandingService = new TenantBrandingService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/branding/history - Get tenant branding history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const result = await brandingService.getTenantBrandingHistory(tenantId);
    
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
