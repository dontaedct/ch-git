/**
 * @fileoverview HT-006 Tokens Provider for Sandbox
 * @module components-sandbox/providers/TokensProvider
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-006 Phase 1 - Design Tokens & Theme Provider
 * Purpose: Sandbox-isolated token provider with brand switching
 * Safety: Complete isolation from production theming
 * Status: Phase 1 implementation
 */

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Brand, ThemeMode, applyCSSVariables, getProcessedTokens, ProcessedTokens } from '@/lib/tokens/processor'

interface TokensContextValue {
  brand: Brand
  setBrand: (brand: Brand) => void
  mode: ThemeMode
  tokens: ProcessedTokens
  availableBrands: Brand[]
}

const TokensContext = createContext<TokensContextValue | undefined>(undefined)

interface TokensProviderProps {
  children: React.ReactNode
  defaultBrand?: Brand
}

export function TokensProvider({ children, defaultBrand = 'default' }: TokensProviderProps) {
  const { theme, systemTheme } = useTheme()
  const [brand, setBrand] = useState<Brand>(defaultBrand)
  const [mounted, setMounted] = useState(false)

  // Determine current theme mode - use default during SSR to prevent hydration mismatch
  const currentTheme = mounted ? (theme === 'system' ? systemTheme : theme) : 'light'
  const mode: ThemeMode = currentTheme === 'dark' ? 'dark' : 'light'

  // Get processed tokens
  const tokens = getProcessedTokens(brand, mode)

  // Available brands
  const availableBrands: Brand[] = ['default', 'salon']

  // Apply CSS variables when brand or mode changes
  useEffect(() => {
    if (mounted) {
      applyCSSVariables(brand, mode)
      
      // Apply brand class to HTML element for CSS cascade
      document.documentElement.classList.remove('brand-default', 'brand-salon')
      document.documentElement.classList.add(`brand-${brand}`)
    }
  }, [brand, mode, mounted])

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  const value: TokensContextValue = {
    brand,
    setBrand,
    mode,
    tokens,
    availableBrands
  }

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return (
      <TokensContext.Provider value={{
        brand: defaultBrand,
        setBrand,
        mode: 'light', // Default to light during SSR
        tokens: getProcessedTokens(defaultBrand, 'light'),
        availableBrands
      }}>
        {children}
      </TokensContext.Provider>
    )
  }

  return (
    <TokensContext.Provider value={value}>
      {children}
    </TokensContext.Provider>
  )
}

export function useTokens() {
  const context = useContext(TokensContext)
  if (context === undefined) {
    throw new Error('useTokens must be used within a TokensProvider')
  }
  return context
}

export function useBrand() {
  const { brand, setBrand, availableBrands } = useTokens()
  return { brand, setBrand, availableBrands }
}

export function useThemeTokens() {
  const { tokens, mode } = useTokens()
  return { tokens, mode }
}
