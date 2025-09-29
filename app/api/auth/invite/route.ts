/**
 * User Invitation API Endpoint
 * Handles user invitations with role assignment
 * Part of Phase 1.1 Authentication Infrastructure
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceRoleSupabase } from '@/lib/supabase/server'
import { PermissionChecker, UserRole } from '@/lib/auth/permissions'
import { headers } from 'next/headers'

export interface InviteRequest {
  email: string
  role: UserRole
  message?: string
  expiresIn?: number // hours
}

export interface InviteResponse {
  success: boolean
  message?: string
  error?: string
  invitationId?: string
}

/**
 * POST /api/auth/invite
 * Send user invitation
 */
export async function POST(request: NextRequest): Promise<NextResponse<InviteResponse>> {
  try {
    // Get request metadata for security logging
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // Check authentication
    const supabase = await createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get inviter's role
    const { data: inviter } = await supabase
      .from('clients')
      .select('role')
      .eq('id', user.id)
      .single()

    const inviterRole = inviter?.role || 'viewer'

    // Check if inviter has permission to invite users
    if (!PermissionChecker.hasPermission(inviterRole, 'invite:users')) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to invite users' },
        { status: 403 }
      )
    }

    // Parse request body
    const body: InviteRequest = await request.json()
    const { email, role, message, expiresIn = 72 } = body

    // Validate required fields
    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: 'Email and role are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address format' },
        { status: 400 }
      )
    }

    // Validate role
    if (!PermissionChecker.isValidRole(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    // Check if inviter can assign this role
    if (!canAssignRole(inviterRole, role)) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to assign this role' },
        { status: 403 }
      )
    }

    // Check if user already exists
    const serviceSupabase = createServiceRoleSupabase()
    const { data: existingUser } = await serviceSupabase
      .from('clients')
      .select('id, email, role')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Check for existing pending invitation
    const { data: existingInvitation } = await serviceSupabase
      .from('user_invitations')
      .select('id, expires_at')
      .eq('email', email.toLowerCase().trim())
      .eq('status', 'pending')
      .single()

    if (existingInvitation && new Date(existingInvitation.expires_at) > new Date()) {
      return NextResponse.json(
        { success: false, error: 'An invitation is already pending for this email' },
        { status: 409 }
      )
    }

    // Create invitation
    const expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000) // Convert hours to milliseconds
    const invitationToken = generateInvitationToken()

    const { data: invitation, error: inviteError } = await serviceSupabase
      .from('user_invitations')
      .insert({
        email: email.toLowerCase().trim(),
        role,
        invited_by: user.id,
        invitation_token: invitationToken,
        message: message || null,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (inviteError || !invitation) {
      console.error('Error creating invitation:', inviteError)
      return NextResponse.json(
        { success: false, error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // Send invitation email (this would integrate with your email service)
    try {
      await sendInvitationEmail({
        email: email.toLowerCase().trim(),
        role,
        inviterName: user.email || 'System Administrator',
        invitationToken,
        expiresAt,
        message
      })
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError)
      // Don't fail the invitation if email fails
    }

    // Log invitation creation
    await logInvitationEvent(email, ip, userAgent, 'invitation_created', {
      invitation_id: invitation.id,
      role,
      invited_by: user.id,
      expires_at: expiresAt.toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      invitationId: invitation.id
    })

  } catch (error) {
    console.error('Invitation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/invite?token=xxx
 * Accept invitation
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Invitation token is required' },
        { status: 400 }
      )
    }

    // Validate invitation token
    const serviceSupabase = createServiceRoleSupabase()
    const { data: invitation, error: inviteError } = await serviceSupabase
      .from('user_invitations')
      .select('*')
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invitation' },
        { status: 404 }
      )
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Invitation has expired' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        email: invitation.email,
        role: invitation.role,
        message: invitation.message,
        expiresAt: invitation.expires_at
      }
    })

  } catch (error) {
    console.error('Invitation validation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/auth/invite
 * Accept invitation and create user
 */
export async function PUT(request: NextRequest): Promise<NextResponse<InviteResponse>> {
  try {
    // Get request metadata
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    const body = await request.json()
    const { token, password } = body

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Invitation token is required' },
        { status: 400 }
      )
    }

    // Validate invitation
    const serviceSupabase = createServiceRoleSupabase()
    const { data: invitation, error: inviteError } = await serviceSupabase
      .from('user_invitations')
      .select('*')
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invitation' },
        { status: 404 }
      )
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Invitation has expired' },
        { status: 410 }
      )
    }

    // Create user account
    const supabase = await createServerSupabase()
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: invitation.email,
      password: password || generateRandomPassword(),
      email_confirm: true
    })

    if (authError || !authData.user) {
      console.error('Error creating user:', authError)
      return NextResponse.json(
        { success: false, error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create client record
    const { error: clientError } = await serviceSupabase
      .from('clients')
      .insert({
        id: authData.user.id,
        email: invitation.email,
        role: invitation.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (clientError) {
      console.error('Error creating client record:', clientError)
      return NextResponse.json(
        { success: false, error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    // Mark invitation as accepted
    await serviceSupabase
      .from('user_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: authData.user.id
      })
      .eq('id', invitation.id)

    // Log invitation acceptance
    await logInvitationEvent(invitation.email, ip, userAgent, 'invitation_accepted', {
      invitation_id: invitation.id,
      user_id: authData.user.id,
      role: invitation.role
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. You can now sign in.'
    })

  } catch (error) {
    console.error('Invitation acceptance error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper functions
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function canAssignRole(inviterRole: UserRole, targetRole: UserRole): boolean {
  // Admins can assign any role
  if (inviterRole === 'admin') return true
  
  // Editors can only assign viewer role
  if (inviterRole === 'editor' && targetRole === 'viewer') return true
  
  // Viewers cannot assign any roles
  return false
}

function generateInvitationToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function generateRandomPassword(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function sendInvitationEmail(params: {
  email: string
  role: UserRole
  inviterName: string
  invitationToken: string
  expiresAt: Date
  message?: string
}): Promise<void> {
  // This would integrate with your email service (Resend, SendGrid, etc.)
  // For now, we'll just log the invitation details
  console.log('Invitation email would be sent:', {
    to: params.email,
    role: params.role,
    inviter: params.inviterName,
    expiresAt: params.expiresAt,
    message: params.message
  })
}

async function logInvitationEvent(
  email: string,
  ip: string,
  userAgent: string,
  action: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const serviceSupabase = createServiceRoleSupabase()
    
    await serviceSupabase
      .from('auth_logs')
      .insert({
        email: email.toLowerCase().trim(),
        action,
        metadata: {
          ...metadata,
          ip_address: ip,
          user_agent: userAgent,
          timestamp: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error logging invitation event:', error)
  }
}
