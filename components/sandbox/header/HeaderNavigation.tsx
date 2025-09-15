/**
 * @fileoverview Header Navigation Component
 * @module components/sandbox/header/HeaderNavigation
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Header Navigation Component
 * Purpose: Focused navigation component for sandbox header
 * Safety: Isolated navigation logic with proper accessibility
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Palette, 
  Layers, 
  FileText, 
  ArrowLeft, 
  Play, 
  Settings, 
  Sparkles,
  Code,
  Eye,
  Zap
} from 'lucide-react'

interface NavigationItem {
  href: string
  label: string
  icon: React.ReactNode
  description?: string
}

interface HeaderNavigationProps {
  className?: string
  isMobile?: boolean
  onItemClick?: () => void
}

const navigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: <Home className="w-4 h-4" />,
    description: 'Return to main dashboard'
  },
  {
    href: '/sandbox',
    label: 'Sandbox',
    icon: <Code className="w-4 h-4" />,
    description: 'Development sandbox environment'
  },
  {
    href: '/design-system',
    label: 'Design System',
    icon: <Palette className="w-4 h-4" />,
    description: 'Component library and tokens'
  },
  {
    href: '/modules',
    label: 'Modules',
    icon: <Layers className="w-4 h-4" />,
    description: 'Feature modules and configuration'
  },
  {
    href: '/docs',
    label: 'Documentation',
    icon: <FileText className="w-4 h-4" />,
    description: 'API documentation and guides'
  },
  {
    href: '/preview',
    label: 'Preview',
    icon: <Eye className="w-4 h-4" />,
    description: 'Live preview and testing'
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings className="w-4 h-4" />,
    description: 'Application configuration'
  }
]

export function HeaderNavigation({ 
  className, 
  isMobile = false, 
  onItemClick 
}: HeaderNavigationProps) {
  const pathname = usePathname()

  const handleItemClick = () => {
    onItemClick?.()
  }

  if (isMobile) {
    return (
      <nav className={cn("flex flex-col space-y-2", className)} role="navigation" aria-label="Mobile navigation">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleItemClick}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground"
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-describedby={item.description ? `${item.href}-desc` : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.description && (
                <span id={`${item.href}-desc`} className="sr-only">
                  {item.description}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className={cn("flex items-center space-x-1", className)} role="navigation" aria-label="Main navigation">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground"
            )}
            aria-current={isActive ? 'page' : undefined}
            aria-describedby={item.description ? `${item.href}-desc` : undefined}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.description && (
              <span id={`${item.href}-desc`} className="sr-only">
                {item.description}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
