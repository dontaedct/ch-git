/**
 * Task Permissions API Routes
 * HT-004.5.1: Granular Permissions System API
 * 
 * Provides API endpoints for managing task-level permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@lib/supabase/server';
import { requireClient } from '@lib/auth/guard';
import { TaskPermission } from '@lib/auth/task-permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const client = await requireClient();
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const subtaskId = searchParams.get('subtaskId');
    const actionId = searchParams.get('actionId');

    // Get task permissions
    const { data: permissions, error } = await supabase
      .from('hero_task_permissions')
      .select(`
        *,
        users:user_id (
          id,
          email,
          user_metadata
        )
      `)
      .or(`task_id.eq.${params.taskId},subtask_id.eq.${subtaskId},action_id.eq.${actionId}`)
      .is('expires_at', null)
      .or('expires_at.gt.' + new Date().toISOString());

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch permissions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ permissions });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const client = await requireClient();
    const supabase = await createServerSupabase();
    const body = await request.json();
    const { userId, permission, subtaskId, actionId, expiresAt } = body;

    if (!userId || !permission) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Grant permission using the database function
    const { data, error } = await supabase.rpc('grant_task_permission', {
      p_task_id: subtaskId ? null : params.taskId,
      p_subtask_id: subtaskId || null,
      p_action_id: actionId || null,
      p_user_id: userId,
      p_permission: permission,
      p_expires_at: expiresAt || null
    });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to grant permission' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const client = await requireClient();
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const permission = searchParams.get('permission') as TaskPermission;
    const subtaskId = searchParams.get('subtaskId');
    const actionId = searchParams.get('actionId');

    if (!userId || !permission) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Revoke permission using the database function
    const { data, error } = await supabase.rpc('revoke_task_permission', {
      p_task_id: subtaskId ? null : params.taskId,
      p_subtask_id: subtaskId || null,
      p_action_id: actionId || null,
      p_user_id: userId,
      p_permission: permission
    });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to revoke permission' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

/**
 * Check user permission endpoint
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const client = await requireClient();
    const supabase = await createServerSupabase();
    const body = await request.json();
    const { permission, subtaskId, actionId } = body;

    if (!permission) {
      return NextResponse.json(
        { error: 'Missing permission parameter' },
        { status: 400 }
      );
    }

    // Check permission using the database function
    const { data, error } = await supabase.rpc('has_task_permission', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
      p_task_id: subtaskId ? null : params.taskId,
      p_subtask_id: subtaskId || null,
      p_action_id: actionId || null,
      p_permission: permission
    });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to check permission' },
        { status: 500 }
      );
    }

    return NextResponse.json({ hasPermission: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
