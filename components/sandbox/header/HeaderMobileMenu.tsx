/**
 * @fileoverview Header Mobile Menu Component
 * @module components/sandbox/header/HeaderMobileMenu
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Header Mobile Menu Component
 * Purpose: Focused mobile menu component for sandbox header
 * Safety: Isolated mobile menu logic with proper accessibility
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { HeaderNavigation } from './HeaderNavigation'
import { HeaderThemeControls } from './HeaderThemeControls'
import { HeaderSearch } from './HeaderSearch'

interface HeaderMobileMenuProps {
  className?: string
  onSearch?: (query: string) => void
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void
}

export function HeaderMobileMenu({ 
  className,
  onSearch,
  onThemeChange
}: HeaderMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  const handleClose = () => {
    setIsOpen(false)
    setIsSearchExpanded(false)
  }

  const handleSearch = (query: string) => {
    onSearch?.(query)
    handleClose()
  }

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    onThemeChange?.(theme)
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <HeaderSearch
        isExpanded={isSearchExpanded}
        onToggleExpanded={() => setIsSearchExpanded(!isSearchExpanded)}
        onSearch={handleSearch}
        className="hidden sm:flex"
      />
      
      <HeaderThemeControls
        onThemeChange={handleThemeChange}
        className="hidden sm:flex"
      />
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 sm:hidden"
            aria-label="Open mobile menu"
          >
            <Menu className="w-4 h-4" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Search
              </h3>
              <HeaderSearch
                isExpanded={true}
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Theme
              </h3>
              <HeaderThemeControls
                onThemeChange={handleThemeChange}
                className="w-full"
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Navigation
              </h3>
              <HeaderNavigation
                isMobile={true}
                onItemClick={handleClose}
                className="w-full"
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
