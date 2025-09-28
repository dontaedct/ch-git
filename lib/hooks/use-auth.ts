/**
 * Authentication State Management Hook
 * Provides comprehensive authentication state and operations
 * Part of Phase 1.2 Database Schema & State Management
 */

import { useState, useEffect, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { AuthService } from '@/lib/auth/auth'
import { MagicLinkProvider } from '@/lib/auth/magic-link'
import { PermissionChecker, UserRole, Permission } from '@/lib/auth/permissions'

export interface AuthUser extends User {
  role?: UserRole
  permissions?: Permission[]
  metadata?: Record<string, any>
  preferences?: Record<string, any>
  lastLoginAt?: string
  lastLogoutAt?: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  role: UserRole | null
  permissions: Permission[]
}

export interface AuthActions {
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  sendMagicLink: (email: string, options?: {
    redirectTo?: string
    shouldCreateUser?: boolean
    emailTemplate?: 'default' | 'signup' | 'signin'
    metadata?: Record<string, any>
  }) => Promise<{ success: boolean; error?: string; message?: string }>
  resendMagicLink: (email: string, redirectTo?: string) => Promise<{ success: boolean; error?: string }>
  refreshUser: () => Promise<void>
  updateProfile: (updates: {
    metadata?: Record<string, any>
    preferences?: Record<string, any>
  }) => Promise<{ success: boolean; error?: string }>
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  canPerformAction: (action: string, resource: string) => boolean
}

export interface UseAuthReturn extends AuthState, AuthActions {}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Derived state
  const isAuthenticated = !!user
  const role = user?.role || null
  const permissions = user?.permissions || []

  /**
   * Fetch user profile from API
   */
  const fetchUserProfile = useCallback(async (authUser: User): Promise<AuthUser> => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }

      const data = await response.json()
      if (!data.success || !data.user) {
        throw new Error('Invalid user profile data')
      }

      return {
        ...authUser,
        role: data.user.role,
        permissions: data.user.permissions,
        metadata: data.user.metadata,
        preferences: data.user.preferences,
        lastLoginAt: data.user.last_login_at,
        lastLogoutAt: data.user.last_logout_at
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      // Return basic user if profile fetch fails
      return {
        ...authUser,
        role: 'viewer' as UserRole,
        permissions: PermissionChecker.getPermissionsForRole('viewer')
      }
    }
  }, [])

  /**
   * Initialize authentication state
   */
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const authUser = await AuthService.getCurrentUser()
      if (authUser) {
        const userWithProfile = await fetchUserProfile(authUser)
        setUser(userWithProfile)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Auth initialization error:', err)
      setError(err instanceof Error ? err.message : 'Authentication initialization failed')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [fetchUserProfile])

  /**
   * Handle authentication state changes
   */
  const handleAuthStateChange = useCallback(async (authUser: User | null) => {
    try {
      if (authUser) {
        const userWithProfile = await fetchUserProfile(authUser)
        setUser(userWithProfile)
      } else {
        setUser(null)
      }
      setError(null)
    } catch (err) {
      console.error('Auth state change error:', err)
      setError(err instanceof Error ? err.message : 'Authentication state change failed')
      setUser(null)
    }
  }, [fetchUserProfile])

  /**
   * Sign in with email and optional password
   */
  const signIn = useCallback(async (email: string, password?: string) => {
    try {
      setError(null)
      const result = await AuthService.signIn(email, password)
      
      if (result.success && result.user) {
        const userWithProfile = await fetchUserProfile(result.user)
        setUser(userWithProfile)
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchUserProfile])

  /**
   * Sign up with email and optional password
   */
  const signUp = useCallback(async (email: string, password?: string) => {
    try {
      setError(null)
      const result = await AuthService.signUp(email, password)
      
      if (result.success && result.user) {
        const userWithProfile = await fetchUserProfile(result.user)
        setUser(userWithProfile)
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchUserProfile])

  /**
   * Sign out user
   */
  const signOut = useCallback(async () => {
    try {
      setError(null)
      const result = await AuthService.signOut()
      
      if (result.success) {
        setUser(null)
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  /**
   * Send magic link
   */
  const sendMagicLink = useCallback(async (email: string, options = {}) => {
    try {
      setError(null)
      const result = await MagicLinkProvider.sendMagicLink({
        email,
        ...options
      })
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send magic link'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  /**
   * Resend magic link
   */
  const resendMagicLink = useCallback(async (email: string, redirectTo?: string) => {
    try {
      setError(null)
      const result = await MagicLinkProvider.resendMagicLink(email, redirectTo)
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend magic link'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    if (!user) return

    try {
      setError(null)
      const userWithProfile = await fetchUserProfile(user)
      setUser(userWithProfile)
    } catch (err) {
      console.error('Error refreshing user:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh user data')
    }
  }, [user, fetchUserProfile])

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates: {
    metadata?: Record<string, any>
    preferences?: Record<string, any>
  }) => {
    try {
      setError(null)
      
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const data = await response.json()
      if (data.success && data.user) {
        setUser(prev => prev ? {
          ...prev,
          metadata: data.user.metadata,
          preferences: data.user.preferences
        } : null)
      }

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  /**
   * Permission checking methods
   */
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!role) return false
    return PermissionChecker.hasPermission(role, permission)
  }, [role])

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    if (!role) return false
    return PermissionChecker.hasAnyPermission(role, permissions)
  }, [role])

  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    if (!role) return false
    return PermissionChecker.hasAllPermissions(role, permissions)
  }, [role])

  const canPerformAction = useCallback((action: string, resource: string): boolean => {
    if (!role) return false
    return PermissionChecker.canPerformAction(role, action, resource)
  }, [role])

  // Initialize auth state and set up listener
  useEffect(() => {
    initializeAuth()

    // Set up auth state change listener
    const unsubscribe = AuthService.onAuthStateChange(handleAuthStateChange)

    return () => {
      unsubscribe()
    }
  }, [initializeAuth, handleAuthStateChange])

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,
    role,
    permissions,

    // Actions
    signIn,
    signUp,
    signOut,
    sendMagicLink,
    resendMagicLink,
    refreshUser,
    updateProfile,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canPerformAction
  }
}
