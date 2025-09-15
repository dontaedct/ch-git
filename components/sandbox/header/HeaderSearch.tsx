/**
 * @fileoverview Header Search Component
 * @module components/sandbox/header/HeaderSearch
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Header Search Component
 * Purpose: Focused search component for sandbox header
 * Safety: Isolated search logic with proper accessibility
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'

interface HeaderSearchProps {
  className?: string
  placeholder?: string
  onSearch?: (query: string) => void
  onClear?: () => void
  isExpanded?: boolean
  onToggleExpanded?: () => void
}

export function HeaderSearch({ 
  className,
  placeholder = "Search...",
  onSearch,
  onClear,
  isExpanded = false,
  onToggleExpanded
}: HeaderSearchProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim())
    }
  }

  const handleClear = () => {
    setQuery('')
    onClear?.()
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(query)
    } else if (e.key === 'Escape') {
      handleClear()
      inputRef.current?.blur()
    }
  }

  const handleToggleExpanded = () => {
    onToggleExpanded?.()
    if (!isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  if (!isExpanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleExpanded}
        className={cn("flex items-center space-x-2", className)}
        aria-label="Open search"
      >
        <Search className="w-4 h-4" />
        <span className="sr-only">Search</span>
      </Button>
    )
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "pl-10 pr-10",
            isFocused && "ring-2 ring-ring ring-offset-2"
          )}
          aria-label="Search input"
          aria-describedby="search-description"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleExpanded}
        aria-label="Close search"
      >
        <X className="w-4 h-4" />
      </Button>
      
      <span id="search-description" className="sr-only">
        Search for components, documentation, or features. Press Enter to search or Escape to clear.
      </span>
    </div>
  )
}
