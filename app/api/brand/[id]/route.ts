/**
 * @fileoverview Brand Configuration API - Individual Brand Routes
 * @module app/api/brand/[id]/route
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.5: Implement Brand Configuration API
 * RESTful API endpoints for individual brand configuration management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/flags/server';
import { BrandConfig } from '@/types/brand-config';

export const runtime = 'nodejs';

// =============================================================================
// GET /api/brand/[id] - Get specific brand configuration
// =============================================================================

export async function GET(
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

    // Get brand configuration from database
    const { data: brand, error } = await supabase
      .from('tenant_branding_configs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Brand configuration not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching brand configuration:', error);
      return NextResponse.json(
        { error: 'Failed to fetch brand configuration' },
        { status: 500 }
      );
    }

    // Transform to BrandConfig format
    const brandConfig: BrandConfig = {
      id: brand.id,
      name: brand.organization_name,
      description: brand.description,
      basePreset: brand.preset_name,
      overrides: {
        colors: brand.brand_colors,
        typography: brand.typography_config,
        assets: {
          logo: brand.logo_src,
          logoDark: brand.logo_dark_src,
          favicon: brand.favicon_src,
          icon: brand.icon_src,
        },
        content: {
          tagline: brand.tagline,
          contact: {
            email: brand.contact_email,
            phone: brand.contact_phone,
            website: brand.contact_website,
          },
        },
      },
      metadata: {
        industry: brand.industry,
        style: brand.style,
        colorScheme: brand.color_scheme,
        maturity: brand.maturity,
        audience: brand.audience,
        keywords: brand.keywords,
        version: brand.brand_version,
      },
      timestamps: {
        createdAt: brand.created_at,
        updatedAt: brand.updated_at,
        lastApplied: brand.last_applied,
      },
    };

    return NextResponse.json({
      success: true,
      data: brandConfig,
    });

  } catch (error) {
    console.error('Error in GET /api/brand/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// PUT /api/brand/[id] - Update brand configuration
// =============================================================================

export async function PUT(
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
    const body = await request.json();
    const { name, description, basePreset, overrides, metadata } = body;

    // Check if brand exists
    const { data: existingBrand, error: fetchError } = await supabase
      .from('tenant_branding_configs')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Brand configuration not found' },
          { status: 404 }
        );
      }
      console.error('Error checking brand existence:', fetchError);
      return NextResponse.json(
        { error: 'Failed to check brand configuration' },
        { status: 500 }
      );
    }

    // Update brand configuration
    const updateData: any = {
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    };

    if (name !== undefined) updateData.organization_name = name;
    if (description !== undefined) updateData.description = description;
    if (basePreset !== undefined) updateData.preset_name = basePreset;
    if (overrides?.colors) updateData.brand_colors = overrides.colors;
    if (overrides?.typography) updateData.typography_config = overrides.typography;
    if (overrides?.assets?.logo) updateData.logo_src = overrides.assets.logo;
    if (overrides?.assets?.logoDark) updateData.logo_dark_src = overrides.assets.logoDark;
    if (overrides?.assets?.favicon) updateData.favicon_src = overrides.assets.favicon;
    if (overrides?.assets?.icon) updateData.icon_src = overrides.assets.icon;
    if (overrides?.content?.tagline) updateData.tagline = overrides.content.tagline;
    if (overrides?.content?.contact?.email) updateData.contact_email = overrides.content.contact.email;
    if (overrides?.content?.contact?.phone) updateData.contact_phone = overrides.content.contact.phone;
    if (overrides?.content?.contact?.website) updateData.contact_website = overrides.content.contact.website;
    if (metadata?.industry) updateData.industry = metadata.industry;
    if (metadata?.style) updateData.style = metadata.style;
    if (metadata?.colorScheme) updateData.color_scheme = metadata.colorScheme;
    if (metadata?.maturity) updateData.maturity = metadata.maturity;
    if (metadata?.audience) updateData.audience = metadata.audience;
    if (metadata?.keywords) updateData.keywords = metadata.keywords;
    if (metadata?.version) updateData.brand_version = metadata.version;

    const { data: updatedBrand, error } = await supabase
      .from('tenant_branding_configs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating brand configuration:', error);
      return NextResponse.json(
        { error: 'Failed to update brand configuration' },
        { status: 500 }
      );
    }

    // Transform to BrandConfig format
    const brandConfig: BrandConfig = {
      id: updatedBrand.id,
      name: updatedBrand.organization_name,
      description: updatedBrand.description,
      basePreset: updatedBrand.preset_name,
      overrides: {
        colors: updatedBrand.brand_colors,
        typography: updatedBrand.typography_config,
        assets: {
          logo: updatedBrand.logo_src,
          logoDark: updatedBrand.logo_dark_src,
          favicon: updatedBrand.favicon_src,
          icon: updatedBrand.icon_src,
        },
        content: {
          tagline: updatedBrand.tagline,
          contact: {
            email: updatedBrand.contact_email,
            phone: updatedBrand.contact_phone,
            website: updatedBrand.contact_website,
          },
        },
      },
      metadata: {
        industry: updatedBrand.industry,
        style: updatedBrand.style,
        colorScheme: updatedBrand.color_scheme,
        maturity: updatedBrand.maturity,
        audience: updatedBrand.audience,
        keywords: updatedBrand.keywords,
        version: updatedBrand.brand_version,
      },
      timestamps: {
        createdAt: updatedBrand.created_at,
        updatedAt: updatedBrand.updated_at,
        lastApplied: updatedBrand.last_applied,
      },
    };

    return NextResponse.json({
      success: true,
      data: brandConfig,
      message: 'Brand configuration updated successfully',
    });

  } catch (error) {
    console.error('Error in PUT /api/brand/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE /api/brand/[id] - Delete brand configuration
// =============================================================================

export async function DELETE(
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

    // Check if brand exists
    const { data: existingBrand, error: fetchError } = await supabase
      .from('tenant_branding_configs')
      .select('id, organization_name')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Brand configuration not found' },
          { status: 404 }
        );
      }
      console.error('Error checking brand existence:', fetchError);
      return NextResponse.json(
        { error: 'Failed to check brand configuration' },
        { status: 500 }
      );
    }

    // Delete brand configuration
    const { error } = await supabase
      .from('tenant_branding_configs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting brand configuration:', error);
      return NextResponse.json(
        { error: 'Failed to delete brand configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Brand configuration "${existingBrand.organization_name}" deleted successfully`,
    });

  } catch (error) {
    console.error('Error in DELETE /api/brand/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}