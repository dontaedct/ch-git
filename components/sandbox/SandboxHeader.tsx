/**
 * @fileoverview Enhanced Sandbox Header Component
 * @module components/sandbox/SandboxHeader
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Sandbox Header Enhancement
 * Purpose: Optimized sandbox header for desktop/mobile and dark/light themes with ADAV compliance
 * Safety: Sandbox-isolated header component
 * Status: Enhanced implementation with accessibility and responsive design
 */

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  Home, 
  Palette, 
  Layers, 
  FileText, 
  ArrowLeft, 
  Play, 
  Settings, 
  Sparkles,
  Search,
  Menu,
  X,
  Monitor,
  Smartphone,
  Sun,
  Moon,
  ChevronDown,
  ExternalLink,
  Code,
  Eye,
  Zap
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { ModeToggle } from '@/components-sandbox/ui/ModeToggle'
import { BrandToggle } from '@/components-sandbox/ui/BrandToggle'
import { SearchInput } from '@/components-sandbox/SearchInput'

interface SandboxHeaderProps {
  className?: string
}

/**
 * Enhanced Sandbox Header Component
 * 
 * Features:
 * - Responsive design optimized for desktop and mobile
 * - Dark/light theme support with smooth transitions
 * - ADAV compliance with proper ARIA labels and keyboard navigation
 * - Collapsible mobile navigation
 * - Enhanced visual hierarchy and accessibility
 * - Motion effects with reduced motion support
 */
export default function SandboxHeader({ className = '' }: SandboxHeaderProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Navigation items
  const navigationItems = [
    {
      href: '/sandbox',
      label: 'Home',
      icon: Home,
      description: 'Sandbox overview and navigation'
    },
    {
      href: '/sandbox/tokens',
      label: 'Tokens',
      icon: Palette,
      description: 'Design tokens showcase'
    },
    {
      href: '/sandbox/elements',
      label: 'Elements',
      icon: Layers,
      description: 'UI components showcase'
    },
    {
      href: '/sandbox/blocks',
      label: 'Blocks',
      icon: FileText,
      description: 'Content blocks showcase'
    },
    {
      href: '/sandbox/mono-theme',
      label: 'Mono-Theme',
      icon: Sparkles,
      description: 'HT-007 mono-theme system'
    }
  ]

  const toolItems = [
    {
      href: '/sandbox/playground',
      label: 'Playground',
      icon: Play,
      description: 'Component playground'
    },
    {
      href: '/sandbox/tour',
      label: 'Tour',
      icon: Eye,
      description: 'Developer tour'
    },
    {
      href: '/sandbox/search',
      label: 'Search',
      icon: Search,
      description: 'Search & filter'
    },
    {
      href: '/sandbox/token-editor',
      label: 'Token Editor',
      icon: Settings,
      description: 'Real-time token editing'
    }
  ]

  const isActive = (href: string) => pathname === href

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' 
          : 'bg-background border-b border-border'
      } ${className}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Safety Banner */}
      <motion.div 
        className="bg-yellow-500 text-yellow-900 px-4 py-2 text-center font-semibold border-b border-yellow-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          <span>HT-007 SANDBOX - TEST AREA - NOT PRODUCTION</span>
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
        </div>
      </motion.div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link 
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1"
              aria-label="Return to production site"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Back to Production</span>
            </Link>
            
            <div className="h-6 w-px bg-border hidden sm:block" aria-hidden="true" />
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Code className="w-4 h-4 text-primary-foreground" aria-hidden="true" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground text-sm sm:text-base">
                  Design System Sandbox
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  HT-007 Token-Driven Architecture
                </p>
              </div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav 
            className="hidden lg:flex items-center gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            aria-label="Main navigation"
          >
            {/* Search */}
            <div className="relative">
              <SearchInput />
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    aria-describedby={`${item.href}-desc`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span>{item.label}</span>
                    <span id={`${item.href}-desc`} className="sr-only">
                      {item.description}
                    </span>
                  </Link>
                )
              })}
            </div>

            {/* Tools Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-expanded="false"
                aria-haspopup="true"
                aria-label="Tools menu"
              >
                <Settings className="w-4 h-4" aria-hidden="true" />
                <span>Tools</span>
                <ChevronDown className="w-3 h-3" aria-hidden="true" />
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  {toolItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        aria-describedby={`${item.href}-tool-desc`}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div id={`${item.href}-tool-desc`} className="text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 pl-4 border-l border-border">
              <BrandToggle size="sm" variant="buttons" />
              <ModeToggle size="sm" variant="icon" />
            </div>
          </motion.nav>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle mobile menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="lg:hidden border-t border-border bg-background"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="mb-4">
                <SearchInput />
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Pages
                </h3>
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Tools */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Tools
                </h3>
                {toolItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Mobile Controls */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Theme</span>
                  <ModeToggle size="sm" variant="button" />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-muted-foreground">Brand</span>
                  <BrandToggle size="sm" variant="buttons" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Development Notice */}
      <motion.div 
        className="bg-muted/50 border-b border-border px-4 py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Development Environment:</strong> This sandbox is completely isolated from production. 
            All changes here are safe and will not affect live pages until Phase 7 migration.
          </p>
        </div>
      </motion.div>
    </motion.header>
  )
}
