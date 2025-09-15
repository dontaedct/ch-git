/**
 * @fileoverview Brand Export API
 * @module app/api/brand/[id]/export/route
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.5: Implement Brand Configuration API
 * RESTful API endpoint for exporting brand configurations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/flags/server';
import { BrandConfig } from '@/types/brand-config';

export const runtime = 'nodejs';

// =============================================================================
// GET /api/brand/[id]/export - Export brand configuration
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
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

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

    // Add export metadata
    const exportData = {
      ...brandConfig,
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: user.id,
        exportVersion: '1.0.0',
        source: 'DCT Micro-Apps Brand Configuration API',
      },
    };

    // Format the export data
    let exportContent: string;
    let contentType: string;
    let filename: string;

    switch (format.toLowerCase()) {
      case 'yaml':
        exportContent = convertToYAML(exportData);
        contentType = 'application/x-yaml';
        filename = `${brand.organization_name.replace(/[^a-zA-Z0-9]/g, '_')}_brand_config.yaml`;
        break;
      case 'json':
      default:
        exportContent = JSON.stringify(exportData, null, 2);
        contentType = 'application/json';
        filename = `${brand.organization_name.replace(/[^a-zA-Z0-9]/g, '_')}_brand_config.json`;
        break;
    }

    // Return the export file
    return new NextResponse(exportContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error in GET /api/brand/[id]/export:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Convert object to YAML format (simplified)
 */
function convertToYAML(obj: any, indent = 0): string {
  const spaces = '  '.repeat(indent);
  let yaml = '';

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      yaml += `${spaces}${key}: null\n`;
    } else if (typeof value === 'string') {
      yaml += `${spaces}${key}: "${value}"\n`;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      yaml += `${spaces}${key}: ${value}\n`;
    } else if (Array.isArray(value)) {
      yaml += `${spaces}${key}:\n`;
      for (const item of value) {
        if (typeof item === 'object') {
          yaml += `${spaces}  - ${convertToYAML(item, indent + 2).trim()}\n`;
        } else {
          yaml += `${spaces}  - ${item}\n`;
        }
      }
    } else if (typeof value === 'object') {
      yaml += `${spaces}${key}:\n`;
      yaml += convertToYAML(value, indent + 1);
    }
  }

  return yaml;
}