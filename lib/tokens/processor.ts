/**
 * @fileoverview HT-006 Token Processor
 * @module lib/tokens/processor
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-006 Phase 1 - Design Tokens & Theme Provider
 * Purpose: DTCG token processing with CSS variable generation
 * Safety: Type-safe token resolution with fallbacks
 * Status: Phase 1 implementation
 */

import baseTokens from '../../tokens/base.json'
import defaultBrand from '../../tokens/brands/default.json'
import salonBrand from '../../tokens/brands/salon.json'

export type TokenValue = string | number | object
export type Brand = 'default' | 'salon'
export type ThemeMode = 'light' | 'dark'

export interface ProcessedTokens {
  colors: Record<string, string>
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  fontSize: Record<string, string>
  fontWeight: Record<string, string>
  lineHeight: Record<string, string>
  shadow: Record<string, string>
}

const brands = {
  default: defaultBrand,
  salon: salonBrand
}

/**
 * Resolve token reference (e.g., "{color.brand.600}" -> actual value)
 */
function resolveTokenReference(value: string, tokens: any): string {
  if (typeof value !== 'string' || !value.startsWith('{') || !value.endsWith('}')) {
    return value
  }

  const path = value.slice(1, -1).split('.')
  let current = tokens

  for (const segment of path) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment]
    } else {
      console.warn(`Token reference not found: ${value}`)
      return value // Return original if not found
    }
  }

  // If the resolved value is still a reference, resolve it recursively
  if (typeof current === 'string' && current.startsWith('{') && current.endsWith('}')) {
    return resolveTokenReference(current, tokens)
  }

  return current?.$value ?? current ?? value
}

/**
 * Process base design tokens into flat structure
 */
function processBaseTokens(): Record<string, string> {
  const processed: Record<string, string> = {}

  // Process colors
  Object.entries(baseTokens.color).forEach(([category, scales]) => {
    if (typeof scales === 'object' && scales !== null) {
      Object.entries(scales).forEach(([scale, token]) => {
        if (token && typeof token === 'object' && '$value' in token) {
          processed[`color-${category}-${scale}`] = token.$value as string
        }
      })
    }
  })

  // Process spacing
  Object.entries(baseTokens.spacing).forEach(([key, token]) => {
    if (token && typeof token === 'object' && '$value' in token) {
      processed[`spacing-${key}`] = token.$value as string
    }
  })

  // Process border radius
  Object.entries(baseTokens.borderRadius).forEach(([key, token]) => {
    if (token && typeof token === 'object' && '$value' in token) {
      processed[`border-radius-${key}`] = token.$value as string
    }
  })

  // Process font sizes
  Object.entries(baseTokens.fontSize).forEach(([key, token]) => {
    if (token && typeof token === 'object' && '$value' in token) {
      processed[`font-size-${key}`] = token.$value as string
    }
  })

  // Process font weights
  Object.entries(baseTokens.fontWeight).forEach(([key, token]) => {
    if (token && typeof token === 'object' && '$value' in token) {
      processed[`font-weight-${key}`] = token.$value as string
    }
  })

  // Process line heights
  Object.entries(baseTokens.lineHeight).forEach(([key, token]) => {
    if (token && typeof token === 'object' && '$value' in token) {
      processed[`line-height-${key}`] = String(token.$value)
    }
  })

  // Process shadows
  Object.entries(baseTokens.shadow).forEach(([key, token]) => {
    if (token && typeof token === 'object' && '$value' in token) {
      const shadow = token.$value as any
      if (typeof shadow === 'object') {
        const shadowValue = `${shadow.offsetX} ${shadow.offsetY} ${shadow.blur} ${shadow.spread} ${shadow.color}`
        processed[`shadow-${key}`] = shadowValue
      }
    }
  })

  return processed
}

/**
 * Process brand tokens with reference resolution
 */
function processBrandTokens(brand: Brand, mode: ThemeMode): Record<string, string> {
  const brandTokens = brands[brand]
  const allTokens = { ...baseTokens, ...brandTokens }
  const processed: Record<string, string> = {}

  // Process semantic colors for the current theme mode
  const semanticColors = brandTokens.semantic[mode]
  
  Object.entries(semanticColors).forEach(([key, value]) => {
    if (value && typeof value === 'object' && '$value' in value) {
      const resolvedValue = resolveTokenReference(value.$value as string, allTokens)
      processed[`semantic-${key}`] = resolvedValue
    }
  })

  // Process brand-specific colors
  Object.entries(brandTokens.brand.colors).forEach(([key, value]) => {
    if (value && typeof value === 'object' && '$value' in value) {
      const resolvedValue = resolveTokenReference(value.$value as string, allTokens)
      processed[`brand-${key}`] = resolvedValue
    }
  })

  return processed
}

/**
 * Generate CSS custom properties for given brand and theme
 */
export function generateCSSVariables(brand: Brand = 'default', mode: ThemeMode = 'light'): string {
  const baseVars = processBaseTokens()
  const brandVars = processBrandTokens(brand, mode)
  
  const allVars = { ...baseVars, ...brandVars }
  
  const cssRules = Object.entries(allVars)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n')

  return `:root {\n${cssRules}\n}`
}

/**
 * Apply CSS variables to document root
 */
export function applyCSSVariables(brand: Brand = 'default', mode: ThemeMode = 'light'): void {
  if (typeof document === 'undefined') return

  const baseVars = processBaseTokens()
  const brandVars = processBrandTokens(brand, mode)
  const allVars = { ...baseVars, ...brandVars }

  const root = document.documentElement

  Object.entries(allVars).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })
}

/**
 * Get processed tokens for JavaScript usage
 */
export function getProcessedTokens(brand: Brand = 'default', mode: ThemeMode = 'light'): ProcessedTokens {
  const baseVars = processBaseTokens()
  const brandVars = processBrandTokens(brand, mode)
  const allVars = { ...baseVars, ...brandVars }

  return {
    colors: Object.fromEntries(
      Object.entries(allVars).filter(([key]) => key.startsWith('color-') || key.startsWith('semantic-') || key.startsWith('brand-'))
    ),
    spacing: Object.fromEntries(
      Object.entries(allVars).filter(([key]) => key.startsWith('spacing-'))
    ),
    borderRadius: Object.fromEntries(
      Object.entries(allVars).filter(([key]) => key.startsWith('border-radius-'))
    ),
    fontSize: Object.fromEntries(
      Object.entries(allVars).filter(([key]) => key.startsWith('font-size-'))
    ),
    fontWeight: Object.fromEntries(
      Object.entries(allVars).filter(([key]) => key.startsWith('font-weight-'))
    ),
    lineHeight: Object.fromEntries(
      Object.entries(allVars).filter(([key]) => key.startsWith('line-height-'))
    ),
    shadow: Object.fromEntries(
      Object.entries(allVars).filter(([key]) => key.startsWith('shadow-'))
    )
  }
}

export { brands, baseTokens }
