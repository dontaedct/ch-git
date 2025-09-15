/**
 * @fileoverview Brand Migration API - Main Routes
 * @module app/api/brand/migration/route
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.6: Create Brand Migration System
 * RESTful API endpoints for brand migration management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/flags/server';
import { brandMigrationService } from '@/lib/brand/brand-migration-service';

export const runtime = 'nodejs';

// =============================================================================
// GET /api/brand/migration - List migration plans and status
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
    const tenantId = searchParams.get('tenantId') || user.id;
    const type = searchParams.get('type') || 'plans'; // 'plans', 'status', 'history'

    if (type === 'plans') {
      // Get available migration plans
      const { data: plans, error } = await supabase
        .from('brand_migration_plans')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching migration plans:', error);
        return NextResponse.json(
          { error: 'Failed to fetch migration plans' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: plans,
        count: plans?.length || 0,
      });

    } else if (type === 'status') {
      // Get current migration status for tenant
      const { data: status, error } = await supabase
        .from('brand_migration_status')
        .select(`
          *,
          brand_migration_plans (
            plan_name,
            description,
            from_version,
            to_version
          )
        `)
        .eq('tenant_id', tenantId)
        .in('status', ['pending', 'running'])
        .order('started_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching migration status:', error);
        return NextResponse.json(
          { error: 'Failed to fetch migration status' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: status?.[0] || null,
      });

    } else if (type === 'history') {
      // Get migration history for tenant
      const { data: history, error } = await supabase
        .from('brand_migration_status')
        .select(`
          *,
          brand_migration_plans (
            plan_name,
            description,
            from_version,
            to_version
          )
        `)
        .eq('tenant_id', tenantId)
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching migration history:', error);
        return NextResponse.json(
          { error: 'Failed to fetch migration history' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: history || [],
        count: history?.length || 0,
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter. Use: plans, status, or history' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in GET /api/brand/migration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/brand/migration - Start brand migration
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
    const { 
      planId, 
      tenantId = user.id, 
      fromVersion = '1.0.0', 
      toVersion = '2.0.0',
      createPlan = false,
      planData 
    } = body;

    if (!planId && !createPlan) {
      return NextResponse.json(
        { error: 'Missing required field: planId' },
        { status: 400 }
      );
    }

    let actualPlanId = planId;

    // Create migration plan if requested
    if (createPlan && planData) {
      const { data: newPlan, error: planError } = await supabase
        .from('brand_migration_plans')
        .insert({
          plan_name: planData.name || 'Custom Brand Migration',
          description: planData.description || 'Custom brand migration plan',
          from_version: fromVersion,
          to_version: toVersion,
          steps: planData.steps || [],
          prerequisites: planData.prerequisites || [],
          validation_config: planData.validation || {},
          estimated_duration: planData.estimatedDuration || 15,
          risk_level: planData.riskLevel || 'low',
          rollbackable: planData.rollbackable !== false,
          created_by: user.id,
        })
        .select()
        .single();

      if (planError) {
        console.error('Error creating migration plan:', planError);
        return NextResponse.json(
          { error: 'Failed to create migration plan' },
          { status: 500 }
        );
      }

      actualPlanId = newPlan.id;
    }

    // Check if migration plan exists
    const { data: plan, error: planFetchError } = await supabase
      .from('brand_migration_plans')
      .select('*')
      .eq('id', actualPlanId)
      .eq('is_active', true)
      .single();

    if (planFetchError) {
      return NextResponse.json(
        { error: 'Migration plan not found or inactive' },
        { status: 404 }
      );
    }

    // Check if tenant already has a running migration
    const { data: existingMigration } = await supabase
      .from('brand_migration_status')
      .select('id, status')
      .eq('tenant_id', tenantId)
      .in('status', ['pending', 'running'])
      .single();

    if (existingMigration) {
      return NextResponse.json(
        { 
          error: 'Tenant already has a migration in progress',
          existingMigrationId: existingMigration.id,
          status: existingMigration.status,
        },
        { status: 409 }
      );
    }

    // Create migration plan using the service
    const migrationPlan = await brandMigrationService.createMigrationPlan(
      tenantId,
      fromVersion,
      toVersion
    );

    // Start migration
    const { data: migration, error: migrationError } = await supabase
      .from('brand_migration_status')
      .insert({
        plan_id: actualPlanId,
        tenant_id: tenantId,
        status: 'pending',
        started_at: new Date().toISOString(),
        metadata: {
          fromVersion,
          toVersion,
          createdBy: user.id,
          servicePlan: migrationPlan,
        },
      })
      .select()
      .single();

    if (migrationError) {
      console.error('Error starting migration:', migrationError);
      return NextResponse.json(
        { error: 'Failed to start migration' },
        { status: 500 }
      );
    }

    // Execute migration asynchronously
    brandMigrationService.executeMigration(migrationPlan, tenantId)
      .then(async (result) => {
        // Update migration status with result
        await supabase
          .from('brand_migration_status')
          .update({
            status: result.success ? 'completed' : 'failed',
            completed_at: new Date().toISOString(),
            steps_completed: result.stepsCompleted,
            steps_failed: result.stepsFailed,
            errors: result.errors,
            warnings: result.warnings,
            duration: result.duration,
            rollback_available: result.rollbackAvailable,
            error_message: result.success ? null : result.errors[0]?.message,
            metadata: result.metadata,
          })
          .eq('id', migration.id);
      })
      .catch(async (error) => {
        // Update migration status with error
        await supabase
          .from('brand_migration_status')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: error.message,
            errors: [{ code: 'EXECUTION_ERROR', message: error.message }],
          })
          .eq('id', migration.id);
      });

    return NextResponse.json({
      success: true,
      data: {
        migrationId: migration.id,
        planId: actualPlanId,
        tenantId,
        status: 'pending',
        message: 'Migration started successfully',
      },
    });

  } catch (error) {
    console.error('Error in POST /api/brand/migration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
