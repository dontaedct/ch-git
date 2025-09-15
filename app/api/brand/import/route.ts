/**
 * @fileoverview Brand Import API
 * @module app/api/brand/import/route
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.5: Implement Brand Configuration API
 * RESTful API endpoint for importing brand configurations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/flags/server';
import { BrandConfig } from '@/types/brand-config';

export const runtime = 'nodejs';

// =============================================================================
// POST /api/brand/import - Import brand configuration
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
    const { config, tenantId = 'default' } = body;

    if (!config) {
      return NextResponse.json(
        { error: 'Missing required field: config' },
        { status: 400 }
      );
    }

    // Parse the configuration
    let brandConfig: BrandConfig;
    try {
      if (typeof config === 'string') {
        brandConfig = JSON.parse(config);
      } else {
        brandConfig = config;
      }
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid configuration format. Expected valid JSON.' },
        { status: 400 }
      );
    }

    // Validate the configuration structure
    const validation = validateBrandConfigStructure(brandConfig);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid brand configuration structure',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Check if a brand with the same name already exists
    const { data: existingBrand } = await supabase
      .from('tenant_branding_configs')
      .select('id, organization_name')
      .eq('tenant_id', tenantId)
      .eq('organization_name', brandConfig.name)
      .single();

    if (existingBrand) {
      return NextResponse.json(
        { 
          error: `Brand configuration with name "${brandConfig.name}" already exists`,
          existingBrandId: existingBrand.id,
        },
        { status: 409 }
      );
    }

    // Create the brand configuration in database
    const { data: newBrand, error } = await supabase
      .from('tenant_branding_configs')
      .insert({
        tenant_id: tenantId,
        organization_name: brandConfig.name,
        description: brandConfig.description,
        preset_name: brandConfig.basePreset || 'default',
        brand_colors: brandConfig.overrides?.colors || {},
        typography_config: brandConfig.overrides?.typography || {},
        logo_src: brandConfig.overrides?.assets?.logo,
        logo_dark_src: brandConfig.overrides?.assets?.logoDark,
        favicon_src: brandConfig.overrides?.assets?.favicon,
        icon_src: brandConfig.overrides?.assets?.icon,
        tagline: brandConfig.overrides?.content?.tagline,
        contact_email: brandConfig.overrides?.content?.contact?.email,
        contact_phone: brandConfig.overrides?.content?.contact?.phone,
        contact_website: brandConfig.overrides?.content?.contact?.website,
        industry: brandConfig.metadata?.industry,
        style: brandConfig.metadata?.style,
        color_scheme: brandConfig.metadata?.colorScheme,
        maturity: brandConfig.metadata?.maturity,
        audience: brandConfig.metadata?.audience,
        keywords: brandConfig.metadata?.keywords,
        brand_version: brandConfig.metadata?.version || '1.0.0',
        validation_status: 'pending',
        validation_errors: [],
        validation_warnings: [],
        is_custom: true,
        created_by: user.id,
        imported_at: new Date().toISOString(),
        imported_from: (brandConfig as any)?.exportMetadata?.source || 'Unknown',
      })
      .select()
      .single();

    if (error) {
      console.error('Error importing brand configuration:', error);
      return NextResponse.json(
        { error: 'Failed to import brand configuration' },
        { status: 500 }
      );
    }

    // Transform to BrandConfig format for response
    const importedBrandConfig: BrandConfig = {
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
      data: importedBrandConfig,
      message: `Brand configuration "${brandConfig.name}" imported successfully`,
      importMetadata: {
        importedAt: new Date().toISOString(),
        importedBy: user.id,
        originalSource: (brandConfig as any)?.exportMetadata?.source,
        originalExportedAt: (brandConfig as any)?.exportMetadata?.exportedAt,
      },
    });

  } catch (error) {
    console.error('Error in POST /api/brand/import:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate brand configuration structure
 */
function validateBrandConfigStructure(config: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!config.id && !config.name) {
    errors.push('Brand configuration must have either an id or name');
  }

  if (!config.overrides) {
    errors.push('Brand configuration must have overrides');
  }

  // Validate overrides structure
  if (config.overrides) {
    if (config.overrides.colors && typeof config.overrides.colors !== 'object') {
      errors.push('Colors override must be an object');
    }

    if (config.overrides.typography && typeof config.overrides.typography !== 'object') {
      errors.push('Typography override must be an object');
    }

    if (config.overrides.assets && typeof config.overrides.assets !== 'object') {
      errors.push('Assets override must be an object');
    }

    if (config.overrides.content && typeof config.overrides.content !== 'object') {
      errors.push('Content override must be an object');
    }
  }

  // Validate metadata structure
  if (config.metadata && typeof config.metadata !== 'object') {
    errors.push('Metadata must be an object');
  }

  // Validate timestamps structure
  if (config.timestamps && typeof config.timestamps !== 'object') {
    errors.push('Timestamps must be an object');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}