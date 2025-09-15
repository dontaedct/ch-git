/**
 * @fileoverview HT-006 Brand Toggle Component
 * @module components-sandbox/ui/BrandToggle
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-006 Phase 1 - Design Tokens & Theme Provider
 * Purpose: Brand switching component for multi-vertical demonstration
 * Safety: Sandbox-isolated component with smooth transitions
 * Status: Phase 1 implementation
 */

'use client'

import * as React from 'react'
import { Palette, ChevronDown } from 'lucide-react'
import { useBrand } from '../providers/TokensProvider'
import { Brand } from '@/lib/tokens/processor'

interface BrandToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'dropdown' | 'buttons'
}

const brandLabels: Record<Brand, string> = {
  default: 'Tech',
  salon: 'Salon'
}

const brandDescriptions: Record<Brand, string> = {
  default: 'Modern tech aesthetic',
  salon: 'Beauty & wellness theme'
}

export function BrandToggle({ className = '', size = 'md', variant = 'dropdown' }: BrandToggleProps) {
  const { brand, setBrand, availableBrands } = useBrand()
  const [isOpen, setIsOpen] = React.useState(false)

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {availableBrands.map((brandOption) => (
          <button
            key={brandOption}
            onClick={() => setBrand(brandOption)}
            className={`
              ${sizeClasses[size]}
              rounded-md transition-all duration-200
              border font-medium
              ${brand === brandOption
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg hover:shadow-xl'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm hover:shadow-md'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
              transition-all duration-300 ease-out
            `.trim()}
            title={brandDescriptions[brandOption]}
          >
            {brandLabels[brandOption]}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${sizeClasses[size]}
          inline-flex items-center gap-2 rounded-xl
          bg-white dark:bg-gray-900 
          text-gray-700 dark:text-gray-200
          border border-gray-200 dark:border-gray-700
          hover:bg-gray-50 dark:hover:bg-gray-800
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
          transition-all duration-300 ease-out
          font-semibold min-w-0 shadow-sm hover:shadow-md
        `.trim()}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Palette className={iconSizes[size]} />
        <span className="hidden sm:inline">{brandLabels[brand]}</span>
        <ChevronDown className={`${iconSizes[size]} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 z-20 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
            <div className="py-2">
              {availableBrands.map((brandOption) => (
                <button
                  key={brandOption}
                  onClick={() => {
                    setBrand(brandOption)
                    setIsOpen(false)
                  }}
                  className={`
                    w-full text-left px-4 py-3 text-sm
                    transition-all duration-200 ease-out
                    ${brand === brandOption
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                    focus:outline-none focus:bg-blue-500 focus:text-white
                    first:rounded-t-xl last:rounded-b-xl
                  `.trim()}
                  role="option"
                  aria-selected={brand === brandOption}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{brandLabels[brandOption]}</span>
                    {brand === brandOption && (
                      <div className="w-2 h-2 bg-current rounded-full" />
                    )}
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    {brandDescriptions[brandOption]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
