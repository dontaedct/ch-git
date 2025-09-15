/**
 * @fileoverview Brand Application API
 * @module app/api/brand/[id]/apply/route
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.5: Implement Brand Configuration API
 * RESTful API endpoint for applying brand configurations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/flags/server';
import { brandConfigService } from '@/lib/config/brand-config-service';

export const runtime = 'nodejs';

// =============================================================================
// POST /api/brand/[id]/apply - Apply brand configuration
// =============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(user.id);
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const { tenantId = 'default' } = await request.json();

    // Get brand configuration from database
    const { data: brand, error: fetchError } = await supabase
      .from('tenant_branding_configs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Brand configuration not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching brand configuration:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch brand configuration' },
        { status: 500 }
      );
    }

    // Apply brand configuration using the brand config service
    try {
      // Clear cache to ensure fresh configuration
      brandConfigService.clearCache();
      
      // Get enhanced configuration with the new brand
      const enhancedConfig = await brandConfigService.getEnhancedConfig(tenantId);
      
      // Update the last applied timestamp
      const { error: updateError } = await supabase
        .from('tenant_branding_configs')
        .update({
          last_applied: new Date().toISOString(),
          applied_by: user.id,
        })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating last applied timestamp:', updateError);
        // Don't fail the request for this, just log it
      }

      // Store the applied brand in global state (for runtime switching)
      if (typeof global !== 'undefined') {
        (global as any).__appliedBrand = {
          id: brand.id,
          name: brand.organization_name,
          tenantId: tenantId,
          appliedAt: new Date().toISOString(),
          appliedBy: user.id,
        };
      }

      return NextResponse.json({
        success: true,
        message: `Brand configuration "${brand.organization_name}" applied successfully`,
        data: {
          brandId: brand.id,
          brandName: brand.organization_name,
          tenantId: tenantId,
          appliedAt: new Date().toISOString(),
          appliedBy: user.id,
        },
      });

    } catch (applyError) {
      console.error('Error applying brand configuration:', applyError);
      return NextResponse.json(
        { error: 'Failed to apply brand configuration' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in POST /api/brand/[id]/apply:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}