/**
 * @fileoverview Brand Configuration API - Main Routes
 * @module app/api/brand/route
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.5: Implement Brand Configuration API
 * RESTful API endpoints for brand configuration management and integration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/flags/server';
import { BrandConfig, BrandValidationResult } from '@/types/brand-config';
import { brandConfigService } from '@/lib/config/brand-config-service';

export const runtime = 'nodejs';

// =============================================================================
// GET /api/brand - List all brand configurations
// =============================================================================

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'default';

    // Get brand configurations from database
    const { data: brands, error } = await supabase
      .from('tenant_branding_configs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching brand configurations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch brand configurations' },
        { status: 500 }
      );
    }

    // Transform database records to BrandConfig format
    const brandConfigs: BrandConfig[] = brands.map(brand => ({
      id: brand.id,
      name: brand.organization_name || 'Unnamed Brand',
      description: `Brand configuration for ${brand.organization_name}`,
      basePreset: brand.preset_name || 'default',
      overrides: {
        colors: {
          primary: brand.brand_colors?.primary,
          secondary: brand.brand_colors?.secondary,
          accent: brand.brand_colors?.accent,
        },
        typography: {
          fontFamily: brand.typography_config?.fontFamily,
          fontWeights: brand.typography_config?.fontWeights,
          scales: brand.typography_config?.fontSizes,
        },
        assets: {
          logo: brand.logo_src,
          logoDark: brand.logo_dark_src,
          favicon: brand.favicon_src,
          icon: brand.icon_src,
        },
        content: {
          tagline: brand.tagline,
          description: brand.description,
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
    }));

    return NextResponse.json({
      success: true,
      data: brandConfigs,
      count: brandConfigs.length,
    });

  } catch (error) {
    console.error('Error in GET /api/brand:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/brand - Create new brand configuration
// =============================================================================

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, description, basePreset, overrides, metadata, tenantId = 'default' } = body;

    // Validate required fields
    if (!name || !overrides) {
      return NextResponse.json(
        { error: 'Missing required fields: name, overrides' },
        { status: 400 }
      );
    }

    // Create brand configuration in database
    const { data: newBrand, error } = await supabase
      .from('tenant_branding_configs')
      .insert({
        tenant_id: tenantId,
        organization_name: name,
        description: description,
        preset_name: basePreset || 'default',
        brand_colors: overrides.colors || {},
        typography_config: overrides.typography || {},
        logo_src: overrides.assets?.logo,
        logo_dark_src: overrides.assets?.logoDark,
        favicon_src: overrides.assets?.favicon,
        icon_src: overrides.assets?.icon,
        tagline: overrides.content?.tagline,
        contact_email: overrides.content?.contact?.email,
        contact_phone: overrides.content?.contact?.phone,
        contact_website: overrides.content?.contact?.website,
        industry: metadata?.industry,
        style: metadata?.style,
        color_scheme: metadata?.colorScheme,
        maturity: metadata?.maturity,
        audience: metadata?.audience,
        keywords: metadata?.keywords,
        brand_version: metadata?.version || '1.0.0',
        validation_status: 'pending',
        validation_errors: [],
        validation_warnings: [],
        is_custom: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating brand configuration:', error);
      return NextResponse.json(
        { error: 'Failed to create brand configuration' },
        { status: 500 }
      );
    }

    // Transform to BrandConfig format
    const brandConfig: BrandConfig = {
      id: newBrand.id,
      name: newBrand.organization_name,
      description: newBrand.description,
      basePreset: newBrand.preset_name,
      overrides: {
        colors: newBrand.brand_colors,
        typography: newBrand.typography_config,
        assets: {
          logo: newBrand.logo_src,
          logoDark: newBrand.logo_dark_src,
          favicon: newBrand.favicon_src,
          icon: newBrand.icon_src,
        },
        content: {
          tagline: newBrand.tagline,
          contact: {
            email: newBrand.contact_email,
            phone: newBrand.contact_phone,
            website: newBrand.contact_website,
          },
        },
      },
      metadata: {
        industry: newBrand.industry,
        style: newBrand.style,
        colorScheme: newBrand.color_scheme,
        maturity: newBrand.maturity,
        audience: newBrand.audience,
        keywords: newBrand.keywords,
        version: newBrand.brand_version,
      },
      timestamps: {
        createdAt: newBrand.created_at,
        updatedAt: newBrand.updated_at,
        lastApplied: newBrand.last_applied,
      },
    };

    return NextResponse.json({
      success: true,
      data: brandConfig,
      message: 'Brand configuration created successfully',
    });

  } catch (error) {
    console.error('Error in POST /api/brand:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}