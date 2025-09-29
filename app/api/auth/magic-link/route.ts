/**
 * Magic Link Generation API Endpoint
 * Handles secure magic link generation with rate limiting and validation
 * Part of Phase 1.1 Authentication Infrastructure
 */

import { NextRequest, NextResponse } from 'next/server'
import { MagicLinkProvider } from '@/lib/auth/magic-link'
import { createServiceRoleSupabase } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export interface MagicLinkRequest {
  email: string
  redirectTo?: string
  shouldCreateUser?: boolean
  emailTemplate?: 'default' | 'signup' | 'signin'
  metadata?: Record<string, any>
}

export interface MagicLinkResponse {
  success: boolean
  message?: string
  error?: string
  rateLimitInfo?: {
    remaining: number
    resetTime: number
  }
}

/**
 * POST /api/auth/magic-link
 * Generate and send magic link
 */
export async function POST(request: NextRequest): Promise<NextResponse<MagicLinkResponse>> {
  try {
    // Get request metadata for rate limiting
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // Parse request body
    const body: MagicLinkRequest = await request.json()
    const { email, redirectTo, shouldCreateUser = true, emailTemplate = 'default', metadata = {} } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      )
    }

    // Rate limiting check
    const rateLimitResult = await checkRateLimit(email, ip)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please wait before requesting another magic link.',
          rateLimitInfo: {
            remaining: 0,
            resetTime: rateLimitResult.resetTime
          }
        },
        { status: 429 }
      )
    }

    // Enhanced metadata with request info
    const enhancedMetadata = {
      ...metadata,
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      endpoint: '/api/auth/magic-link'
    }

    // Send magic link
    const result = await MagicLinkProvider.sendMagicLink({
      email: email.toLowerCase().trim(),
      redirectTo,
      shouldCreateUser,
      emailTemplate,
      metadata: enhancedMetadata
    })

    if (result.success) {
      // Log successful request
      await logApiRequest(email, ip, 'magic_link_sent', enhancedMetadata)
      
      return NextResponse.json({
        success: true,
        message: result.message,
        rateLimitInfo: {
          remaining: rateLimitResult.remaining - 1,
          resetTime: rateLimitResult.resetTime
        }
      })
    } else {
      // Log failed request
      await logApiRequest(email, ip, 'magic_link_failed', {
        ...enhancedMetadata,
        error: result.error
      })

      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Magic link API error:', error)
    
    // Log error
    try {
      const headersList = await headers()
      const ip = headersList.get('x-forwarded-for') || 'unknown'
      await logApiRequest('unknown', ip, 'magic_link_error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } catch (logError) {
      console.error('Error logging API request:', logError)
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/magic-link?email=user@example.com
 * Get magic link status and rate limit info
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // Get magic link status
    const status = await MagicLinkProvider.getMagicLinkStatus(email)
    
    // Get rate limit info
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await checkRateLimit(email, ip)

    return NextResponse.json({
      success: true,
      data: {
        ...status,
        rateLimit: {
          allowed: rateLimitResult.allowed,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime
        }
      }
    })

  } catch (error) {
    console.error('Magic link status API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Rate limiting implementation
 */
async function checkRateLimit(email: string, ip: string): Promise<{
  allowed: boolean
  remaining: number
  resetTime: number
}> {
  try {
    const serviceSupabase = createServiceRoleSupabase()
    const now = new Date()
    const windowStart = new Date(now.getTime() - 15 * 60 * 1000) // 15 minutes ago
    
    // Check recent attempts by email and IP
    const { data: recentAttempts } = await serviceSupabase
      .from('auth_logs')
      .select('created_at')
      .or(`email.eq.${email},metadata->ip_address.eq.${ip}`)
      .gte('created_at', windowStart.toISOString())
      .eq('action', 'sent')

    const attemptCount = recentAttempts?.length || 0
    const maxAttempts = 5 // 5 attempts per 15 minutes
    const resetTime = new Date(windowStart.getTime() + 15 * 60 * 1000).getTime()

    return {
      allowed: attemptCount < maxAttempts,
      remaining: Math.max(0, maxAttempts - attemptCount),
      resetTime
    }
  } catch (error) {
    console.error('Rate limit check error:', error)
    // Fail open - allow request if rate limiting fails
    return {
      allowed: true,
      remaining: 5,
      resetTime: Date.now() + 15 * 60 * 1000
    }
  }
}

/**
 * Log API requests for monitoring
 */
async function logApiRequest(
  email: string, 
  ip: string, 
  action: string, 
  metadata: Record<string, any>
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
          ip_address: ip
        },
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error logging API request:', error)
    // Don't throw - logging failures shouldn't break the API
  }
}
