/**
 * @fileoverview Brand Migration Logs API
 * @module app/api/brand/migration/[id]/logs/route
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.6: Create Brand Migration System
 * RESTful API endpoint for migration logs and detailed tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/flags/server';

export const runtime = 'nodejs';

// =============================================================================
// GET /api/brand/migration/[id]/logs - Get migration logs
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
    const stepId = searchParams.get('stepId');
    const logLevel = searchParams.get('logLevel');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('brand_migration_logs')
      .select('*')
      .eq('migration_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (stepId) {
      query = query.eq('step_id', stepId);
    }

    if (logLevel) {
      query = query.eq('log_level', logLevel);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching migration logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch migration logs' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('brand_migration_logs')
      .select('*', { count: 'exact', head: true })
      .eq('migration_id', id);

    if (stepId) {
      countQuery = countQuery.eq('step_id', stepId);
    }

    if (logLevel) {
      countQuery = countQuery.eq('log_level', logLevel);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error fetching log count:', countError);
    }

    return NextResponse.json({
      success: true,
      data: logs || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });

  } catch (error) {
    console.error('Error in GET /api/brand/migration/[id]/logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/brand/migration/[id]/logs - Add migration log entry
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
    const body = await request.json();
    const {
      stepId,
      stepName,
      logLevel = 'info',
      message,
      details = {},
      executionTime,
      success,
    } = body;

    // Validate required fields
    if (!stepId || !stepName || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: stepId, stepName, message' },
        { status: 400 }
      );
    }

    // Validate log level
    if (!['info', 'warn', 'error', 'debug'].includes(logLevel)) {
      return NextResponse.json(
        { error: 'Invalid log level. Must be: info, warn, error, debug' },
        { status: 400 }
      );
    }

    // Check if migration exists
    const { data: migration, error: migrationError } = await supabase
      .from('brand_migration_status')
      .select('id')
      .eq('id', id)
      .single();

    if (migrationError) {
      return NextResponse.json(
        { error: 'Migration not found' },
        { status: 404 }
      );
    }

    // Insert log entry
    const { data: log, error } = await supabase
      .from('brand_migration_logs')
      .insert({
        migration_id: id,
        step_id: stepId,
        step_name: stepName,
        log_level: logLevel,
        message,
        details,
        execution_time: executionTime,
        success,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating migration log:', error);
      return NextResponse.json(
        { error: 'Failed to create migration log' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: log,
      message: 'Migration log created successfully',
    });

  } catch (error) {
    console.error('Error in POST /api/brand/migration/[id]/logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
