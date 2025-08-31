import { NextResponse } from 'next/server'
import { createServiceRoleSupabase } from '@/lib/supabase/server'
import { requireClient } from '@/lib/auth/guard'
import { isValidRole, USER_ROLES } from '@/lib/auth/roles'

export const runtime = 'nodejs'

/**
 * Admin API: Update a user's role
 * Requires current user with canManageUsers (owner or admin)
 */
export async function POST(request: Request) {
  try {
    const actor = await requireClient()

    // Only allow admins/owners to manage roles
    if (!actor.role || (actor.role !== USER_ROLES.ADMIN && actor.role !== USER_ROLES.OWNER)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { targetUserId, role } = await request.json()

    if (!targetUserId || !role || typeof role !== 'string') {
      return NextResponse.json({ error: 'Missing targetUserId or role' }, { status: 400 })
    }

    if (!isValidRole(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Only owner can assign owner role, and cannot demote another owner unless actor is owner
    if (role === USER_ROLES.OWNER && actor.role !== USER_ROLES.OWNER) {
      return NextResponse.json({ error: 'Only owner can assign owner role' }, { status: 403 })
    }

    const supabase = createServiceRoleSupabase()

    // Fetch current target role for safety checks
    const { data: target, error: fetchErr } = await supabase
      .from('clients')
      .select('id, role')
      .eq('id', targetUserId)
      .single()

    if (fetchErr || !target) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    if (target.role === USER_ROLES.OWNER && actor.role !== USER_ROLES.OWNER) {
      return NextResponse.json({ error: 'Only owner can modify another owner' }, { status: 403 })
    }

    const { error: updateErr } = await supabase
      .from('clients')
      .update({ role })
      .eq('id', targetUserId)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, targetUserId, role })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin role update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

