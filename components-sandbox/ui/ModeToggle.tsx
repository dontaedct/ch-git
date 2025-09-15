/**
 * @fileoverview HT-006 Mode Toggle Component
 * @module components-sandbox/ui/ModeToggle
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-006 Phase 1 - Design Tokens & Theme Provider
 * Purpose: Light/dark mode toggle for sandbox environment
 * Safety: Sandbox-isolated component with next-themes integration
 * Status: Phase 1 implementation
 */

'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

interface ModeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'button' | 'icon'
}

export function ModeToggle({ className = '', size = 'md', variant = 'button' }: ModeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={`w-9 h-9 ${className}`} />
  }

  const isDark = theme === 'dark'
  
  const sizeClasses = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-11 h-11 text-lg'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  }

  const baseClasses = `
    inline-flex items-center justify-center rounded-xl
    transition-all duration-300 ease-out
    hover:bg-gray-100 dark:hover:bg-gray-800
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
    border border-gray-200 dark:border-gray-700
    bg-white dark:bg-gray-900
    shadow-sm hover:shadow-md
    ${sizeClasses[size]}
    ${className}
  `.trim()

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        className={baseClasses}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
          <Sun className={`${iconSizes[size]} text-yellow-500 dark:text-yellow-400`} />
        ) : (
          <Moon className={`${iconSizes[size]} text-blue-600 dark:text-blue-400`} />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      className={`
        ${baseClasses}
        px-4 py-3 gap-2 min-w-0
        font-semibold text-sm
        text-gray-700 dark:text-gray-200
      `.trim()}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <>
          <Sun className={`${iconSizes[size]} text-yellow-500 dark:text-yellow-400`} />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className={`${iconSizes[size]} text-blue-600 dark:text-blue-400`} />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  )
}
