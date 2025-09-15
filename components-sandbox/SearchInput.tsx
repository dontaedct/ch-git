/**
 * @fileoverview HT-006 Sandbox Search Input Component
 * @module components-sandbox/SearchInput
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-006 Phase 6 - Developer Experience Enhancement
 * Purpose: Client-side search input for sandbox navigation
 * Safety: Sandbox-isolated search functionality
 * Status: Phase 6 implementation - Interactive development tools
 */

'use client'

import React from 'react'
import { Search } from 'lucide-react'

interface SearchInputProps {
  className?: string
}

export function SearchInput({ className }: SearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = e.currentTarget.value
      if (query.trim()) {
        window.location.href = `/sandbox/search?q=${encodeURIComponent(query)}`
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder="Search sandbox..."
        className="w-64 px-4 py-3 pl-10 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-out shadow-sm hover:shadow-md focus:shadow-lg high-tech-input"
        onKeyDown={handleKeyDown}
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
    </div>
  )
}
