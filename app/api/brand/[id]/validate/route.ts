/**
 * @fileoverview Brand Validation API
 * @module app/api/brand/[id]/validate/route
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.5: Implement Brand Configuration API
 * RESTful API endpoint for brand configuration validation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/flags/server';
import { BrandValidationResult, BrandValidationError, BrandValidationWarning } from '@/types/brand-config';
import { brandConfigValidator, BrandConfigValidationUtils } from '@/lib/branding/brand-config-validation';
import { TenantBrandConfig, ValidationContext } from '@/lib/branding/brand-config-validation';

export const runtime = 'nodejs';

// =============================================================================
// POST /api/brand/[id]/validate - Validate brand configuration
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

    // Convert database record to TenantBrandConfig
    const tenantBrandConfig: TenantBrandConfig = {
      tenantId: brand.tenant_id,
      brand: {
        id: brand.id,
        name: brand.organization_name,
        description: brand.description,
        isCustom: brand.is_custom,
        presetName: brand.preset_name,
        createdAt: new Date(brand.created_at),
        updatedAt: new Date(brand.updated_at)
      },
      theme: {
        colors: brand.brand_colors,
        typography: brand.typography_config,
        logo: {
          src: brand.logo_src,
          alt: brand.logo_alt || '',
          width: brand.logo_width || 40,
          height: brand.logo_height || 40,
          initials: brand.logo_initials || '',
          fallbackBgColor: brand.logo_fallback_bg_color || 'from-blue-600 to-indigo-600'
        }
      },
      isActive: brand.is_active,
      validationStatus: brand.validation_status || 'pending'
    };

    // Create validation context
    const validationContext: ValidationContext = {
      tenantId: brand.tenant_id,
      industry: brand.industry,
      audience: brand.audience,
      maturity: brand.maturity,
      strictness: 'standard'
    };

    // Perform comprehensive brand validation
    const validationResult = await brandConfigValidator.validateBrandConfig(tenantBrandConfig, validationContext);

    // Update validation status in database
    const { error: updateError } = await supabase
      .from('tenant_branding_configs')
      .update({
        validation_status: validationResult.valid ? 'valid' : 'invalid',
        validation_errors: validationResult.errors.map(e => e.message),
        validation_warnings: validationResult.warnings.map(w => w.message),
        validation_scores: {
          accessibility: validationResult.accessibilityScore,
          usability: validationResult.usabilityScore,
          design: validationResult.designScore,
          brand: validationResult.brandScore,
          overall: validationResult.overallScore
        },
        wcag_compliance: validationResult.wcagCompliance,
        validated_at: new Date().toISOString(),
        validated_by: user.id,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating validation status:', updateError);
      // Don't fail the request for this, just log it
    }

    // Format validation result for response
    const formattedResult = BrandConfigValidationUtils.formatValidationResult(validationResult);

    return NextResponse.json({
      success: true,
      data: {
        ...validationResult,
        summary: formattedResult,
        statistics: {
          totalErrors: validationResult.errors.length,
          totalWarnings: validationResult.warnings.length,
          criticalErrors: validationResult.errors.filter(e => e.severity === 'error').length,
          accessibilityIssues: validationResult.errors.filter(e => e.category === 'accessibility').length,
          usabilityIssues: validationResult.errors.filter(e => e.category === 'usability').length,
          designIssues: validationResult.errors.filter(e => e.category === 'design').length,
          brandingIssues: validationResult.errors.filter(e => e.category === 'branding').length
        }
      },
      message: formattedResult.message,
    });

  } catch (error) {
    console.error('Error in POST /api/brand/[id]/validate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

// All validation functions have been moved to the comprehensive 
// BrandConfigValidationService in lib/branding/brand-config-validation.ts