import { supabaseBrowser } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export interface AuthResult {
  success: boolean
  user?: User | null
  error?: string
}

export class AuthService {
  static async signUp(email: string, password?: string): Promise<AuthResult> {
    try {
      const supabase = supabaseBrowser
      
      if (password) {
        // Standard password signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        
        if (error) {
          return { success: false, error: error.message }
        }
        
        return { 
          success: true, 
          user: data.user,
          error: data.user?.email_confirmed_at ? undefined : 'Please check your email for a confirmation link'
        }
      } else {
        // Magic link signup
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        
        if (error) {
          return { success: false, error: error.message }
        }
        
        return { 
          success: true, 
          error: 'Check your email for a magic link to sign in'
        }
      }
    } catch (error) {
      console.error('Auth signup error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async signIn(email: string, password?: string): Promise<AuthResult> {
    try {
      const supabase = supabaseBrowser
      
      if (password) {
        // Standard password signin
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) {
          return { success: false, error: error.message }
        }
        
        return { success: true, user: data.user }
      } else {
        // Magic link signin
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        
        if (error) {
          return { success: false, error: error.message }
        }
        
        return { 
          success: true, 
          error: 'Check your email for a magic link to sign in'
        }
      }
    } catch (error) {
      console.error('Auth signin error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async signOut(): Promise<AuthResult> {
    try {
      const supabase = supabaseBrowser
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Auth signout error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const supabase = supabaseBrowser
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Get user error:', error)
        return null
      }
      
      return user
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }


  static onAuthStateChange(callback: (user: User | null) => void) {
    const supabase = supabaseBrowser
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null)
    })
    
    return () => subscription.unsubscribe()
  }
}