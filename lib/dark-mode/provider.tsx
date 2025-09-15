/**
 * @fileoverview HT-008.5.6: Complete Dark Mode Support System
 * @module lib/dark-mode/provider
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.6 - Implement complete dark mode support
 * Focus: Vercel/Apply-level dark mode with comprehensive theming
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (user experience and accessibility)
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

// HT-008.5.6: Enhanced Dark Mode Support System
// Comprehensive dark mode implementation following Vercel/Apply design principles

/**
 * Dark Mode Theme Configuration
 */
export interface DarkModeTheme {
  // Surface colors
  background: string
  surface: string
  surfaceElevated: string
  surfaceOverlay: string
  
  // Text colors
  text: string
  textSecondary: string
  textMuted: string
  textInverse: string
  
  // Border colors
  border: string
  borderSubtle: string
  borderStrong: string
  
  // Interactive colors
  primary: string
  primaryHover: string
  primaryActive: string
  secondary: string
  secondaryHover: string
  secondaryActive: string
  
  // State colors
  success: string
  warning: string
  error: string
  info: string
  
  // Shadow colors
  shadow: string
  shadowElevated: string
  shadowStrong: string
  
  // Accent colors
  accent: string
  accentHover: string
  accentActive: string
}

/**
 * Complete Dark Mode Theme Definitions
 */
export const darkModeThemes: Record<'light' | 'dark', DarkModeTheme> = {
  light: {
    // Surface colors
    background: '#ffffff',
    surface: '#ffffff',
    surfaceElevated: '#fafafa',
    surfaceOverlay: 'rgba(0, 0, 0, 0.5)',
    
    // Text colors
    text: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    textInverse: '#ffffff',
    
    // Border colors
    border: '#e5e7eb',
    borderSubtle: '#f3f4f6',
    borderStrong: '#d1d5db',
    
    // Interactive colors
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryActive: '#1e40af',
    secondary: '#6b7280',
    secondaryHover: '#4b5563',
    secondaryActive: '#374151',
    
    // State colors
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0284c7',
    
    // Shadow colors
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowElevated: 'rgba(0, 0, 0, 0.15)',
    shadowStrong: 'rgba(0, 0, 0, 0.25)',
    
    // Accent colors
    accent: '#7c3aed',
    accentHover: '#6d28d9',
    accentActive: '#5b21b6',
  },
  dark: {
    // Surface colors
    background: '#0a0a0a',
    surface: '#111111',
    surfaceElevated: '#1a1a1a',
    surfaceOverlay: 'rgba(0, 0, 0, 0.8)',
    
    // Text colors
    text: '#ffffff',
    textSecondary: '#a3a3a3',
    textMuted: '#737373',
    textInverse: '#000000',
    
    // Border colors
    border: '#262626',
    borderSubtle: '#171717',
    borderStrong: '#404040',
    
    // Interactive colors
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    primaryActive: '#1d4ed8',
    secondary: '#6b7280',
    secondaryHover: '#9ca3af',
    secondaryActive: '#d1d5db',
    
    // State colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    
    // Shadow colors
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowElevated: 'rgba(0, 0, 0, 0.4)',
    shadowStrong: 'rgba(0, 0, 0, 0.6)',
    
    // Accent colors
    accent: '#8b5cf6',
    accentHover: '#7c3aed',
    accentActive: '#6d28d9',
  },
}

/**
 * Dark Mode Context
 */
interface DarkModeContextValue {
  theme: DarkModeTheme
  isDark: boolean
  isLight: boolean
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  updateCSSVariables: () => void
}

const DarkModeContext = createContext<DarkModeContextValue | undefined>(undefined)

/**
 * Dark Mode Provider Props
 */
interface DarkModeProviderProps {
  children: React.ReactNode
  defaultTheme?: 'light' | 'dark' | 'system'
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

/**
 * Enhanced Dark Mode Provider
 */
export function DarkModeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true,
  disableTransitionOnChange = false,
}: DarkModeProviderProps) {
  const { theme, setTheme: setNextTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Determine current theme
  const currentTheme = theme === 'system' ? resolvedTheme : theme
  const isDark = currentTheme === 'dark'
  const isLight = currentTheme === 'light'
  
  // Get theme configuration
  const themeConfig = darkModeThemes[currentTheme as 'light' | 'dark'] || darkModeThemes.light
  
  // Update CSS custom properties
  const updateCSSVariables = useCallback(() => {
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    
    // Set theme-specific CSS variables
    Object.entries(themeConfig).forEach(([key, value]) => {
      root.style.setProperty(`--dark-mode-${key}`, value)
    })
    
    // Set theme class
    root.classList.toggle('dark', isDark)
    root.classList.toggle('light', isLight)
    
    // Set theme-specific classes
    root.classList.toggle('theme-dark', isDark)
    root.classList.toggle('theme-light', isLight)
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#0a0a0a' : '#ffffff')
    }
    
    // Update status bar style for mobile
    const metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
    if (metaStatusBar) {
      metaStatusBar.setAttribute('content', isDark ? 'black-translucent' : 'default')
    }
  }, [themeConfig, isDark, isLight])
  
  // Toggle theme function
  const toggleTheme = useCallback(() => {
    setNextTheme(isDark ? 'light' : 'dark')
  }, [isDark, setNextTheme])
  
  // Set theme function
  const setTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setNextTheme(newTheme)
  }, [setNextTheme])
  
  // Mount effect
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Update CSS variables when theme changes
  useEffect(() => {
    if (mounted) {
      updateCSSVariables()
    }
  }, [mounted, updateCSSVariables])
  
  // Disable transitions during theme change if requested
  useEffect(() => {
    if (disableTransitionOnChange && mounted) {
      const root = document.documentElement
      root.style.setProperty('transition', 'none')
      
      const timeout = setTimeout(() => {
        root.style.removeProperty('transition')
      }, 100)
      
      return () => clearTimeout(timeout)
    }
  }, [theme, disableTransitionOnChange, mounted])
  
  const contextValue: DarkModeContextValue = {
    theme: themeConfig,
    isDark,
    isLight,
    toggleTheme,
    setTheme,
    updateCSSVariables,
  }
  
  // Don't render until mounted (hydration safety)
  if (!mounted) {
    return <div className="opacity-0">{children}</div>
  }
  
  return (
    <DarkModeContext.Provider value={contextValue}>
      <div className={cn(
        'dark-mode-provider',
        isDark && 'dark-mode-active',
        isLight && 'light-mode-active'
      )}>
        {children}
      </div>
    </DarkModeContext.Provider>
  )
}

/**
 * Hook to use dark mode context
 */
export function useDarkMode(): DarkModeContextValue {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}

/**
 * Hook to get current theme configuration
 */
export function useThemeConfig(): DarkModeTheme {
  const { theme } = useDarkMode()
  return theme
}

/**
 * Hook to check if dark mode is active
 */
export function useIsDark(): boolean {
  const { isDark } = useDarkMode()
  return isDark
}

/**
 * Hook to check if light mode is active
 */
export function useIsLight(): boolean {
  const { isLight } = useDarkMode()
  return isLight
}

/**
 * Dark Mode Toggle Component
 */
interface DarkModeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'button' | 'switch' | 'icon'
  showLabel?: boolean
}

export function DarkModeToggle({
  className,
  size = 'md',
  variant = 'button',
  showLabel = true,
}: DarkModeToggleProps) {
  const { isDark, toggleTheme } = useDarkMode()
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }
  
  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }
  
  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white',
          sizeClasses[size],
          className
        )}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <svg className={iconSizeClasses[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className={iconSizeClasses[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    )
  }
  
  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          isDark ? 'bg-blue-600' : 'bg-gray-200',
          className
        )}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            isDark ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    )
  }
  
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
        sizeClasses[size],
        className
      )}
    >
      {isDark ? (
        <>
          <svg className={iconSizeClasses[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          {showLabel && 'Light'}
        </>
      ) : (
        <>
          <svg className={iconSizeClasses[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          {showLabel && 'Dark'}
        </>
      )}
    </button>
  )
}

/**
 * Dark Mode CSS Variables Generator
 */
export function generateDarkModeCSSVariables(): Record<string, string> {
  const variables: Record<string, string> = {}
  
  Object.entries(darkModeThemes.light).forEach(([key, value]) => {
    variables[`--light-${key}`] = value
  })
  
  Object.entries(darkModeThemes.dark).forEach(([key, value]) => {
    variables[`--dark-${key}`] = value
  })
  
  return variables
}

/**
 * Dark Mode Utility Functions
 */
export const darkModeUtils = {
  /**
   * Get CSS variable for current theme
   */
  getCSSVar: (property: keyof DarkModeTheme): string => {
    return `var(--dark-mode-${property})`
  },
  
  /**
   * Get CSS variable for specific theme
   */
  getThemeCSSVar: (theme: 'light' | 'dark', property: keyof DarkModeTheme): string => {
    return `var(--${theme}-${property})`
  },
  
  /**
   * Generate theme-aware CSS classes
   */
  getThemeClasses: (baseClasses: string, darkClasses: string): string => {
    return `${baseClasses} dark:${darkClasses}`
  },
  
  /**
   * Check if system prefers dark mode
   */
  prefersDarkMode: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  },
  
  /**
   * Listen for system theme changes
   */
  onSystemThemeChange: (callback: (isDark: boolean) => void): (() => void) => {
    if (typeof window === 'undefined') return () => {}
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => callback(e.matches)
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  },
}

export default DarkModeProvider
