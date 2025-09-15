/**
 * @fileoverview Tenant Branding Configuration API Routes
 * @module app/api/branding/route.ts
 * @author OSS Hero System
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { TenantBrandingService } from '@/lib/branding/tenant-service';
import { getClientEnv } from '@/lib/env-client';

const brandingService = new TenantBrandingService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/branding - Get tenant branding configuration
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

    const result = await brandingService.getTenantBrandingConfig(tenantId);
    
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

/**
 * POST /api/branding - Create tenant branding configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, ...configData } = body;
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const result = await brandingService.createTenantBrandingConfig(tenantId, configData);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/branding - Update tenant branding configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, ...configData } = body;
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const result = await brandingService.updateTenantBrandingConfig(tenantId, configData);
    
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
