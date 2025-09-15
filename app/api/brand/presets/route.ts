/**
 * @fileoverview Brand Presets API
 * @module app/api/brand/presets/route
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.5: Implement Brand Configuration API
 * RESTful API endpoints for brand preset management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/flags/server';
import { BrandPreset } from '@/types/brand-config';

export const runtime = 'nodejs';

// =============================================================================
// GET /api/brand/presets - List all brand presets
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

    // Get brand presets from database
    const { data: presets, error } = await supabase
      .from('brand_presets')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching brand presets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch brand presets' },
        { status: 500 }
      );
    }

    // Transform database records to BrandPreset format
    const brandPresets: BrandPreset[] = presets.map(preset => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
      baseConfig: {
        colors: preset.base_config?.colors || {},
        typography: preset.base_config?.typography || {},
        assets: preset.base_config?.assets || {},
        content: preset.base_config?.content || {},
        layout: preset.base_config?.layout || {},
        motion: preset.base_config?.motion || {},
      },
      metadata: {
        industry: preset.metadata?.industry,
        style: preset.metadata?.style,
        colorScheme: preset.metadata?.colorScheme,
        maturity: preset.metadata?.maturity,
        audience: preset.metadata?.audience,
        keywords: preset.metadata?.keywords,
        version: preset.metadata?.version,
      },
      category: preset.category || 'template',
    }));

    return NextResponse.json({
      success: true,
      data: brandPresets,
      count: brandPresets.length,
    });

  } catch (error) {
    console.error('Error in GET /api/brand/presets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/brand/presets - Create new brand preset
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
    const { name, description, baseConfig, metadata, category = 'template' } = body;

    // Validate required fields
    if (!name || !description || !baseConfig) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, baseConfig' },
        { status: 400 }
      );
    }

    // Create brand preset in database
    const { data: newPreset, error } = await supabase
      .from('brand_presets')
      .insert({
        name,
        description,
        base_config: baseConfig,
        metadata: metadata || {},
        category,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating brand preset:', error);
      return NextResponse.json(
        { error: 'Failed to create brand preset' },
        { status: 500 }
      );
    }

    // Transform to BrandPreset format
    const brandPreset: BrandPreset = {
      id: newPreset.id,
      name: newPreset.name,
      description: newPreset.description,
      baseConfig: newPreset.base_config,
      metadata: newPreset.metadata,
      category: newPreset.category,
    };

    return NextResponse.json({
      success: true,
      data: brandPreset,
      message: 'Brand preset created successfully',
    });

  } catch (error) {
    console.error('Error in POST /api/brand/presets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}