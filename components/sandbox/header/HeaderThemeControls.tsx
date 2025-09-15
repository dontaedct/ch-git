/**
 * @fileoverview Header Theme Controls Component
 * @module components/sandbox/header/HeaderThemeControls
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Header Theme Controls Component
 * Purpose: Focused theme control component for sandbox header
 * Safety: Isolated theme logic with proper accessibility
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { 
  Sun, 
  Moon, 
  Monitor,
  Palette
} from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

interface HeaderThemeControlsProps {
  className?: string
  currentTheme?: Theme
  onThemeChange?: (theme: Theme) => void
}

const themeOptions = [
  {
    value: 'light' as const,
    label: 'Light',
    icon: <Sun className="w-4 h-4" />,
    description: 'Use light theme'
  },
  {
    value: 'dark' as const,
    label: 'Dark',
    icon: <Moon className="w-4 h-4" />,
    description: 'Use dark theme'
  },
  {
    value: 'system' as const,
    label: 'System',
    icon: <Monitor className="w-4 h-4" />,
    description: 'Follow system preference'
  }
]

export function HeaderThemeControls({ 
  className, 
  currentTheme = 'system',
  onThemeChange 
}: HeaderThemeControlsProps) {
  const [theme, setTheme] = useState<Theme>(currentTheme)

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    onThemeChange?.(newTheme)
    
    // Apply theme to document
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(newTheme)
    }
  }

  const currentThemeOption = themeOptions.find(option => option.value === theme)

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
            aria-label="Change theme"
            aria-describedby="theme-description"
          >
            <Palette className="w-4 h-4" />
            <span className="sr-only">Theme: {currentThemeOption?.label}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {themeOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleThemeChange(option.value)}
              className={cn(
                "flex items-center space-x-2 cursor-pointer",
                theme === option.value && "bg-accent"
              )}
              aria-current={theme === option.value ? 'true' : 'false'}
            >
              {option.icon}
              <span>{option.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <span id="theme-description" className="sr-only">
        Choose between light, dark, or system theme
      </span>
    </div>
  )
}
