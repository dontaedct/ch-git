/**
 * Enhanced Magic Link Callback Handler
 * Handles magic link verification with comprehensive error handling and security logging
 * Part of Phase 1.1 Authentication Infrastructure
 */

import { createServerSupabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleSupabase } from '@/lib/supabase/server'
import { MagicLinkProvider } from '@/lib/auth/magic-link'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth callback error:', { error, errorDescription })
    return NextResponse.redirect(
      `${origin}/login?error=oauth_error&message=${encodeURIComponent(errorDescription || error)}`
    )
  }

  if (!code) {
    console.error('No authorization code provided in callback')
    return NextResponse.redirect(
      `${origin}/login?error=missing_code&message=${encodeURIComponent('No authorization code provided')}`
    )
  }

  try {
    // Get request metadata for security logging
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // Verify magic link using enhanced provider
    const result = await MagicLinkProvider.verifyMagicLink(code, next)
    
    if (result.success && result.user) {
      // Log successful authentication
      await logAuthCallback(result.user.email!, ip, userAgent, 'success', {
        user_id: result.user.id,
        next_url: next,
        callback_type: 'magic_link'
      })

      // Determine redirect URL based on user role and context
      const redirectUrl = await determineRedirectUrl(result.user, next, origin)
      
      return NextResponse.redirect(redirectUrl)
    } else {
      // Log failed authentication
      await logAuthCallback('unknown', ip, userAgent, 'failed', {
        error: result.error,
        code: code.substring(0, 10) + '...', // Log partial code for debugging
        next_url: next
      })

      return NextResponse.redirect(
        `${origin}/login?error=verification_failed&message=${encodeURIComponent(result.error || 'Magic link verification failed')}`
      )
    }
  } catch (error) {
    console.error('Auth callback error:', error)
    
    // Log error
    try {
      const headersList = await headers()
      const ip = headersList.get('x-forwarded-for') || 'unknown'
      const userAgent = headersList.get('user-agent') || 'unknown'
      await logAuthCallback('unknown', ip, userAgent, 'error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        code: code?.substring(0, 10) + '...',
        next_url: next
      })
    } catch (logError) {
      console.error('Error logging auth callback:', logError)
    }

    return NextResponse.redirect(
      `${origin}/login?error=callback_error&message=${encodeURIComponent('An unexpected error occurred during authentication')}`
    )
  }
}

/**
 * Determine the appropriate redirect URL after successful authentication
 */
async function determineRedirectUrl(user: any, next: string, origin: string): Promise<string> {
  try {
    // If next is provided and it's a safe internal URL, use it
    if (next && next !== '/' && isSafeRedirectUrl(next)) {
      return `${origin}${next}`
    }

    // Get user role to determine default redirect
    const serviceSupabase = createServiceRoleSupabase()
    const { data: client } = await serviceSupabase
      .from('clients')
      .select('role')
      .eq('id', user.id)
      .single()

    // Redirect based on role
    switch (client?.role) {
      case 'admin':
        return `${origin}/agency-toolkit`
      case 'editor':
        return `${origin}/dashboard`
      case 'viewer':
      default:
        return `${origin}/dashboard`
    }
  } catch (error) {
    console.error('Error determining redirect URL:', error)
    // Fallback to dashboard
    return `${origin}/dashboard`
  }
}

/**
 * Check if redirect URL is safe (internal, no protocol, no host)
 */
function isSafeRedirectUrl(url: string): boolean {
  try {
    // Must start with / and not contain protocol or host
    if (!url.startsWith('/')) return false
    
    // Check for protocol or host indicators
    if (url.includes('://') || url.includes('//')) return false
    
    // Check for suspicious patterns
    const suspiciousPatterns = ['javascript:', 'data:', 'vbscript:', 'file:']
    if (suspiciousPatterns.some(pattern => url.toLowerCase().includes(pattern))) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

/**
 * Log authentication callback attempts for security monitoring
 */
async function logAuthCallback(
  email: string,
  ip: string,
  userAgent: string,
  status: 'success' | 'failed' | 'error',
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const serviceSupabase = createServiceRoleSupabase()
    
    await serviceSupabase
      .from('auth_logs')
      .insert({
        email: email.toLowerCase().trim(),
        action: `callback_${status}`,
        metadata: {
          ...metadata,
          ip_address: ip,
          user_agent: userAgent,
          timestamp: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error logging auth callback:', error)
    // Don't throw - logging failures shouldn't break auth flow
  }
}