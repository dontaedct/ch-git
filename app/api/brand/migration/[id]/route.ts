/**
 * @fileoverview Brand Migration API - Individual Migration Routes
 * @module app/api/brand/migration/[id]/route
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.6: Create Brand Migration System
 * RESTful API endpoints for individual migration management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/flags/server';
import { brandMigrationService } from '@/lib/brand/brand-migration-service';

export const runtime = 'nodejs';

// =============================================================================
// GET /api/brand/migration/[id] - Get migration status
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

    // Get migration status
    const migrationStatus = await brandMigrationService.getMigrationStatus(id);

    if (!migrationStatus) {
      return NextResponse.json(
        { error: 'Migration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: migrationStatus,
    });

  } catch (error) {
    console.error('Error in GET /api/brand/migration/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/brand/migration/[id]/rollback - Rollback migration
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

    // Get migration status
    const migrationStatus = await brandMigrationService.getMigrationStatus(id);

    if (!migrationStatus) {
      return NextResponse.json(
        { error: 'Migration not found' },
        { status: 404 }
      );
    }

    if (!migrationStatus.result?.rollbackAvailable) {
      return NextResponse.json(
        { error: 'Migration cannot be rolled back' },
        { status: 400 }
      );
    }

    if (migrationStatus.status === 'running') {
      return NextResponse.json(
        { error: 'Cannot rollback a migration that is currently running' },
        { status: 400 }
      );
    }

    // Get migration plan
    const { data: plan, error: planError } = await supabase
      .from('brand_migration_plans')
      .select('*')
      .eq('id', migrationStatus.planId)
      .single();

    if (planError) {
      return NextResponse.json(
        { error: 'Migration plan not found' },
        { status: 404 }
      );
    }

    // Create migration plan object
    const migrationPlan = {
      id: plan.id,
      name: plan.plan_name,
      description: plan.description,
      fromVersion: plan.from_version,
      toVersion: plan.to_version,
      steps: plan.steps,
      estimatedDuration: plan.estimated_duration,
      riskLevel: plan.risk_level,
      rollbackable: plan.rollbackable,
      prerequisites: plan.prerequisites,
      validation: plan.validation_config,
    };

    // Update migration status to rolling back
    await supabase
      .from('brand_migration_status')
      .update({
        status: 'running',
        current_step: 'rollback',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Execute rollback asynchronously
    brandMigrationService.rollbackMigration(migrationPlan, migrationStatus.tenantId, migrationStatus.result!)
      .then(async (rollbackResult) => {
        // Update migration status with rollback result
        await supabase
          .from('brand_migration_status')
          .update({
            status: rollbackResult.success ? 'rolled_back' : 'failed',
            completed_at: new Date().toISOString(),
            steps_completed: rollbackResult.stepsCompleted,
            steps_failed: rollbackResult.stepsFailed,
            errors: rollbackResult.errors,
            warnings: rollbackResult.warnings,
            duration: rollbackResult.duration,
            error_message: rollbackResult.success ? null : rollbackResult.errors[0]?.message,
            metadata: {
              ...migrationStatus.result?.metadata,
              rollback: true,
              rollbackResult,
            },
          })
          .eq('id', id);
      })
      .catch(async (error) => {
        // Update migration status with rollback error
        await supabase
          .from('brand_migration_status')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: `Rollback failed: ${error.message}`,
            errors: [
              ...(migrationStatus.result?.errors || []),
              { code: 'ROLLBACK_ERROR', message: error.message },
            ],
          })
          .eq('id', id);
      });

    return NextResponse.json({
      success: true,
      message: 'Migration rollback started successfully',
      data: {
        migrationId: id,
        status: 'rolling_back',
      },
    });

  } catch (error) {
    console.error('Error in POST /api/brand/migration/[id]/rollback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE /api/brand/migration/[id] - Cancel migration
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

    // Get migration status
    const migrationStatus = await brandMigrationService.getMigrationStatus(id);

    if (!migrationStatus) {
      return NextResponse.json(
        { error: 'Migration not found' },
        { status: 404 }
      );
    }

    if (migrationStatus.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot cancel a completed migration' },
        { status: 400 }
      );
    }

    if (migrationStatus.status === 'failed') {
      return NextResponse.json(
        { error: 'Migration has already failed' },
        { status: 400 }
      );
    }

    // Update migration status to cancelled
    const { error } = await supabase
      .from('brand_migration_status')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: 'Migration cancelled by user',
        errors: [
          ...(migrationStatus.result?.errors || []),
          { code: 'CANCELLED', message: 'Migration cancelled by user' },
        ],
      })
      .eq('id', id);

    if (error) {
      console.error('Error cancelling migration:', error);
      return NextResponse.json(
        { error: 'Failed to cancel migration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Migration cancelled successfully',
      data: {
        migrationId: id,
        status: 'cancelled',
      },
    });

  } catch (error) {
    console.error('Error in DELETE /api/brand/migration/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
