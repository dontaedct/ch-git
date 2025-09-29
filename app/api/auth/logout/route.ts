/**
 * Logout API Endpoint
 * Handles secure session termination with token invalidation
 * Part of Phase 1.1 Authentication Infrastructure
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceRoleSupabase } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export interface LogoutResponse {
  success: boolean
  message?: string
  error?: string
}

/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
export async function POST(request: NextRequest): Promise<NextResponse<LogoutResponse>> {
  try {
    // Get request metadata for security logging
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    const supabase = await createServerSupabase()
    
    // Get current user before logout
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'No active session found' },
        { status: 401 }
      )
    }

    // Log logout attempt
    await logLogoutAttempt(user.email!, ip, userAgent, 'attempt', {
      user_id: user.id,
      session_id: user.id // Using user ID as session identifier
    })

    // Sign out user
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.error('Logout error:', signOutError)
      
      // Log failed logout
      await logLogoutAttempt(user.email!, ip, userAgent, 'failed', {
        user_id: user.id,
        error: signOutError.message
      })

      return NextResponse.json(
        { success: false, error: 'Failed to logout. Please try again.' },
        { status: 500 }
      )
    }

    // Update last logout time in database
    try {
      const serviceSupabase = createServiceRoleSupabase()
      await serviceSupabase
        .from('clients')
        .update({ 
          last_logout_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
    } catch (dbError) {
      console.error('Error updating logout time:', dbError)
      // Don't fail logout if database update fails
    }

    // Log successful logout
    await logLogoutAttempt(user.email!, ip, userAgent, 'success', {
      user_id: user.id,
      logout_time: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully logged out'
    })

  } catch (error) {
    console.error('Logout API error:', error)
    
    // Log error
    try {
      const headersList = await headers()
      const ip = headersList.get('x-forwarded-for') || 'unknown'
      const userAgent = headersList.get('user-agent') || 'unknown'
      await logLogoutAttempt('unknown', ip, userAgent, 'error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } catch (logError) {
      console.error('Error logging logout attempt:', logError)
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/logout
 * Check logout status (for debugging)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabase()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    return NextResponse.json({
      success: true,
      data: {
        isAuthenticated: !!user && !error,
        userId: user?.id || null,
        email: user?.email || null
      }
    })

  } catch (error) {
    console.error('Logout status check error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Log logout attempts for security monitoring
 */
async function logLogoutAttempt(
  email: string,
  ip: string,
  userAgent: string,
  status: 'attempt' | 'success' | 'failed' | 'error',
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const serviceSupabase = createServiceRoleSupabase()
    
    await serviceSupabase
      .from('auth_logs')
      .insert({
        email: email.toLowerCase().trim(),
        action: `logout_${status}`,
        metadata: {
          ...metadata,
          ip_address: ip,
          user_agent: userAgent,
          timestamp: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error logging logout attempt:', error)
    // Don't throw - logging failures shouldn't break logout flow
  }
}
