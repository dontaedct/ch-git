/**
 * Enhanced Magic Link Authentication Provider
 * Implements secure email verification flow with comprehensive error handling
 * Part of Phase 1.1 Authentication Infrastructure
 */

import { createServerSupabase, createServiceRoleSupabase } from '@/lib/supabase/server'
import { supabaseBrowser } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export interface MagicLinkResult {
  success: boolean
  user?: User | null
  error?: string
  message?: string
}

export interface MagicLinkOptions {
  email: string
  redirectTo?: string
  shouldCreateUser?: boolean
  emailTemplate?: 'default' | 'signup' | 'signin'
  metadata?: Record<string, any>
}

export class MagicLinkProvider {
  /**
   * Generate and send magic link for authentication
   */
  static async sendMagicLink(options: MagicLinkOptions): Promise<MagicLinkResult> {
    try {
      const { email, redirectTo, shouldCreateUser = true, emailTemplate = 'default', metadata = {} } = options
      
      // Validate email format
      if (!this.isValidEmail(email)) {
        return {
          success: false,
          error: 'Invalid email address format'
        }
      }

      const supabase = supabaseBrowser
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const finalRedirectTo = redirectTo || `${baseUrl}/auth/callback`

      // Configure magic link options
      const magicLinkOptions = {
        emailRedirectTo: finalRedirectTo,
        shouldCreateUser,
        data: {
          email_template: emailTemplate,
          ...metadata
        }
      }

      // Send magic link
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: magicLinkOptions
      })

      if (error) {
        console.error('Magic link error:', error)
        return {
          success: false,
          error: this.getUserFriendlyError(error.message)
        }
      }

      // Log magic link attempt for security monitoring
      await this.logMagicLinkAttempt(email, 'sent', metadata)

      return {
        success: true,
        message: 'Magic link sent successfully. Please check your email.',
        user: data.user
      }

    } catch (error) {
      console.error('Magic link provider error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred while sending the magic link'
      }
    }
  }

  /**
   * Verify magic link and complete authentication
   */
  static async verifyMagicLink(code: string, next?: string): Promise<MagicLinkResult> {
    try {
      const supabase = await createServerSupabase()
      
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Magic link verification error:', error)
        return {
          success: false,
          error: this.getUserFriendlyError(error.message)
        }
      }

      if (!data?.user?.email) {
        return {
          success: false,
          error: 'Invalid magic link or user data missing'
        }
      }

      // Create or update user profile
      await this.ensureUserProfile(data.user)

      // Log successful verification
      await this.logMagicLinkAttempt(data.user.email, 'verified', {
        user_id: data.user.id,
        next_url: next
      })

      return {
        success: true,
        user: data.user,
        message: 'Authentication successful'
      }

    } catch (error) {
      console.error('Magic link verification error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during verification'
      }
    }
  }

  /**
   * Resend magic link for existing user
   */
  static async resendMagicLink(email: string, redirectTo?: string): Promise<MagicLinkResult> {
    try {
      // Check if user exists
      const serviceSupabase = createServiceRoleSupabase()
      const { data: existingUser } = await serviceSupabase
        .from('clients')
        .select('id, email')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (!existingUser) {
        return {
          success: false,
          error: 'No account found with this email address'
        }
      }

      // Send new magic link
      return await this.sendMagicLink({
        email,
        redirectTo,
        shouldCreateUser: false,
        emailTemplate: 'signin',
        metadata: { resend: true }
      })

    } catch (error) {
      console.error('Resend magic link error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred while resending the magic link'
      }
    }
  }

  /**
   * Validate magic link token (for additional security)
   */
  static async validateMagicLinkToken(token: string): Promise<boolean> {
    try {
      const supabase = await createServerSupabase()
      const { data, error } = await supabase.auth.getUser(token)
      
      return !error && !!data?.user
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  }

  /**
   * Ensure user profile exists in clients table
   */
  private static async ensureUserProfile(user: User): Promise<void> {
    try {
      const serviceSupabase = createServiceRoleSupabase()
      
      // Check if client record exists
      const { data: existingClient } = await serviceSupabase
        .from('clients')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingClient) {
        // Create new client record
        const { error: insertError } = await serviceSupabase
          .from('clients')
          .insert({
            id: user.id,
            email: user.email,
            role: 'viewer', // Default role
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError && !insertError.message.includes('duplicate')) {
          console.error('Error creating client record:', insertError)
        }
      } else {
        // Update last login time
        await serviceSupabase
          .from('clients')
          .update({ 
            updated_at: new Date().toISOString(),
            last_login_at: new Date().toISOString()
          })
          .eq('id', user.id)
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error)
    }
  }

  /**
   * Log magic link attempts for security monitoring
   */
  private static async logMagicLinkAttempt(
    email: string, 
    action: 'sent' | 'verified' | 'failed',
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      const serviceSupabase = createServiceRoleSupabase()
      
      await serviceSupabase
        .from('auth_logs')
        .insert({
          email: email.toLowerCase().trim(),
          action,
          metadata,
          ip_address: metadata.ip_address || null,
          user_agent: metadata.user_agent || null,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error logging magic link attempt:', error)
      // Don't throw - logging failures shouldn't break auth flow
    }
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Convert technical errors to user-friendly messages
   */
  private static getUserFriendlyError(errorMessage: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password',
      'Email not confirmed': 'Please check your email and click the confirmation link',
      'Too many requests': 'Too many attempts. Please wait a few minutes before trying again',
      'User not found': 'No account found with this email address',
      'Invalid token': 'The magic link has expired or is invalid. Please request a new one',
      'Token expired': 'The magic link has expired. Please request a new one',
      'Email rate limit exceeded': 'Too many emails sent. Please wait before requesting another magic link'
    }

    return errorMap[errorMessage] || 'An authentication error occurred. Please try again.'
  }

  /**
   * Get magic link status for debugging
   */
  static async getMagicLinkStatus(email: string): Promise<{
    exists: boolean
    lastSent?: string
    attempts: number
  }> {
    try {
      const serviceSupabase = createServiceRoleSupabase()
      
      // Check if user exists
      const { data: user } = await serviceSupabase
        .from('clients')
        .select('id, created_at')
        .eq('email', email.toLowerCase().trim())
        .single()

      // Get recent magic link attempts
      const { data: attempts } = await serviceSupabase
        .from('auth_logs')
        .select('created_at, action')
        .eq('email', email.toLowerCase().trim())
        .eq('action', 'sent')
        .order('created_at', { ascending: false })
        .limit(5)

      return {
        exists: !!user,
        lastSent: attempts?.[0]?.created_at,
        attempts: attempts?.length || 0
      }
    } catch (error) {
      console.error('Error getting magic link status:', error)
      return {
        exists: false,
        attempts: 0
      }
    }
  }
}
