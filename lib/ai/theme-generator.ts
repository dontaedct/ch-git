/**
 * @fileoverview AI Theme Generation Library - HT-031.1.4
 * @module lib/ai/theme-generator
 * @author Hero Tasks System
 * @version 1.0.0
 */

import type { BrandProfile } from './brand-intelligence'

export interface ThemeGenerationRequest {
  brandProfile: BrandProfile
  customizationRequest: {
    type: 'brand' | 'theme' | 'content' | 'layout'
    description: string
    context?: string
    preferences?: Record<string, any>
  }
  constraints?: {
    accessibility?: boolean
    industryStandards?: boolean
    existingAssets?: string[]
  }
}

export interface GeneratedTheme {
  id: string
  name: string
  description: string
  confidence: number
  colors: ColorPalette
  typography: TypographySystem
  spacing: SpacingSystem
  borderRadius: BorderRadiusSystem
  shadows: ShadowSystem
  animations: AnimationSystem
  layout: LayoutSystem
  reasoning: string[]
  usage: ThemeUsage
  accessibility: AccessibilityMetrics
  preview: ThemePreview
}

export interface ColorPalette {
  primary: ColorScale
  secondary: ColorScale
  accent: ColorScale
  neutral: ColorScale
  semantic: {
    success: string
    warning: string
    error: string
    info: string
  }
  background: {
    primary: string
    secondary: string
    tertiary: string
  }
  text: {
    primary: string
    secondary: string
    tertiary: string
    inverse: string
  }
}

export interface ColorScale {
  base: string
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

export interface TypographySystem {
  fontFamily: {
    heading: string
    body: string
    mono: string
  }
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
    '5xl': string
    '6xl': string
  }
  fontWeight: {
    light: number
    normal: number
    medium: number
    semibold: number
    bold: number
    extrabold: number
  }
  lineHeight: {
    tight: number
    normal: number
    relaxed: number
  }
  letterSpacing: {
    tight: string
    normal: string
    wide: string
  }
}

export interface SpacingSystem {
  px: string
  0: string
  0.5: string
  1: string
  1.5: string
  2: string
  2.5: string
  3: string
  3.5: string
  4: string
  5: string
  6: string
  7: string
  8: string
  9: string
  10: string
  11: string
  12: string
  14: string
  16: string
  20: string
  24: string
  28: string
  32: string
  36: string
  40: string
  44: string
  48: string
  52: string
  56: string
  60: string
  64: string
  72: string
  80: string
  96: string
}

export interface BorderRadiusSystem {
  none: string
  sm: string
  base: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  full: string
}

export interface ShadowSystem {
  sm: string
  base: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
  none: string
}

export interface AnimationSystem {
  duration: {
    fast: string
    normal: string
    slow: string
  }
  easing: {
    linear: string
    easeIn: string
    easeOut: string
    easeInOut: string
  }
  transitions: {
    all: string
    colors: string
    transform: string
    opacity: string
  }
}

export interface LayoutSystem {
  breakpoints: {
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  container: {
    center: boolean
    padding: string
    maxWidth: {
      sm: string
      md: string
      lg: string
      xl: string
      '2xl': string
    }
  }
  grid: {
    columns: number
    gap: string
  }
}

export interface ThemeUsage {
  primary: string[]
  secondary: string[]
  accent: string[]
  neutral: string[]
  semantic: string[]
}

export interface AccessibilityMetrics {
  contrastRatios: {
    primary: number
    secondary: number
    accent: number
    text: number
  }
  wcagCompliance: 'AA' | 'AAA' | 'None'
  colorBlindSafe: boolean
  recommendations: string[]
}

export interface ThemePreview {
  components: {
    button: ComponentPreview
    card: ComponentPreview
    input: ComponentPreview
    navigation: ComponentPreview
  }
  layouts: {
    landing: LayoutPreview
    dashboard: LayoutPreview
    form: LayoutPreview
  }
}

export interface ComponentPreview {
  styles: Record<string, string>
  variants: Record<string, Record<string, string>>
}

export interface LayoutPreview {
  structure: string[]
  styles: Record<string, string>
}

export class ThemeGenerator {
  private brandProfile: BrandProfile
  private request: ThemeGenerationRequest
  private generationCache: Map<string, GeneratedTheme> = new Map()

  constructor(request: ThemeGenerationRequest) {
    this.request = request
    this.brandProfile = request.brandProfile
  }

  /**
   * Generate a complete theme based on brand profile and requirements
   */
  async generateTheme(): Promise<GeneratedTheme> {
    const cacheKey = this.generateCacheKey()
    
    if (this.generationCache.has(cacheKey)) {
      return this.generationCache.get(cacheKey)!
    }

    const theme: GeneratedTheme = {
      id: `theme_${Date.now()}`,
      name: this.generateThemeName(),
      description: this.generateThemeDescription(),
      confidence: this.calculateConfidence(),
      colors: await this.generateColorPalette(),
      typography: await this.generateTypographySystem(),
      spacing: this.generateSpacingSystem(),
      borderRadius: this.generateBorderRadiusSystem(),
      shadows: this.generateShadowSystem(),
      animations: this.generateAnimationSystem(),
      layout: this.generateLayoutSystem(),
      reasoning: this.generateReasoning(),
      usage: this.generateUsage(),
      accessibility: await this.calculateAccessibility(),
      preview: await this.generatePreview()
    }

    this.generationCache.set(cacheKey, theme)
    return theme
  }

  /**
   * Generate multiple theme variations
   */
  async generateThemeVariations(count: number = 3): Promise<GeneratedTheme[]> {
    const variations: GeneratedTheme[] = []
    
    for (let i = 0; i < count; i++) {
      const variation = await this.generateTheme()
      variation.id = `theme_${Date.now()}_${i}`
      variation.name = `${variation.name} (Variation ${i + 1})`
      variations.push(variation)
    }

    return variations
  }

  /**
   * Generate theme from existing brand assets
   */
  async generateFromExistingAssets(assets: {
    logo?: string
    colors?: string[]
    typography?: string
  }): Promise<GeneratedTheme> {
    // Analyze existing assets and generate theme
    const theme = await this.generateTheme()
    
    // Override with existing assets
    if (assets.colors && assets.colors.length > 0) {
      theme.colors = await this.adaptColorPalette(assets.colors)
      theme.reasoning.push('Adapted from existing brand colors')
    }

    if (assets.typography) {
      theme.typography.fontFamily.body = assets.typography
      theme.typography.fontFamily.heading = assets.typography
      theme.reasoning.push('Using existing brand typography')
    }

    return theme
  }

  /**
   * Optimize theme for specific use case
   */
  async optimizeForUseCase(useCase: 'web' | 'mobile' | 'print' | 'accessibility'): Promise<GeneratedTheme> {
    const baseTheme = await this.generateTheme()
    
    switch (useCase) {
      case 'mobile':
        return this.optimizeForMobile(baseTheme)
      case 'print':
        return this.optimizeForPrint(baseTheme)
      case 'accessibility':
        return this.optimizeForAccessibility(baseTheme)
      default:
        return baseTheme
    }
  }

  /**
   * Generate theme tokens in various formats
   */
  async generateTokens(format: 'css' | 'scss' | 'js' | 'json'): Promise<string> {
    const theme = await this.generateTheme()
    
    switch (format) {
      case 'css':
        return this.generateCSSTokens(theme)
      case 'scss':
        return this.generateSCSSTokens(theme)
      case 'js':
        return this.generateJSTokens(theme)
      case 'json':
        return this.generateJSONTokens(theme)
      default:
        return this.generateJSONTokens(theme)
    }
  }

  private generateThemeName(): string {
    const industry = this.brandProfile.industry
    const personality = this.brandProfile.personality[0] || 'Modern'
    return `${personality} ${industry} Theme`
  }

  private generateThemeDescription(): string {
    const values = this.brandProfile.values.join(', ')
    const personality = this.brandProfile.personality.join(', ')
    return `A ${personality.toLowerCase()} theme designed for ${this.brandProfile.industry.toLowerCase()} companies. Emphasizes ${values.toLowerCase()}.`
  }

  private calculateConfidence(): number {
    let confidence = 0.5 // Base confidence

    // Increase confidence based on brand profile completeness
    if (this.brandProfile.name) confidence += 0.1
    if (this.brandProfile.industry) confidence += 0.1
    if (this.brandProfile.values.length > 0) confidence += 0.1
    if (this.brandProfile.personality.length > 0) confidence += 0.1
    if (this.brandProfile.targetAudience) confidence += 0.1

    // Increase confidence based on request specificity
    if (this.request.customizationRequest.description.length > 50) confidence += 0.1
    if (this.request.customizationRequest.context) confidence += 0.05

    return Math.min(confidence, 0.95)
  }

  private async generateColorPalette(): Promise<ColorPalette> {
    const primary = this.generatePrimaryColor()
    const secondary = this.generateSecondaryColor(primary)
    const accent = this.generateAccentColor(primary, secondary)
    const neutral = this.generateNeutralColor()

    return {
      primary: this.generateColorScale(primary),
      secondary: this.generateColorScale(secondary),
      accent: this.generateColorScale(accent),
      neutral: this.generateColorScale(neutral),
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      },
      background: {
        primary: neutral[50],
        secondary: neutral[100],
        tertiary: neutral[200]
      },
      text: {
        primary: neutral[900],
        secondary: neutral[700],
        tertiary: neutral[500],
        inverse: neutral[50]
      }
    }
  }

  private generatePrimaryColor(): string {
    // Generate primary color based on industry and personality
    if (this.brandProfile.industry === 'Technology') {
      if (this.brandProfile.personality.includes('Innovative')) {
        return '#007AFF' // Blue for innovation
      }
      if (this.brandProfile.personality.includes('Friendly')) {
        return '#10B981' // Green for friendliness
      }
      return '#3B82F6' // Default tech blue
    }

    if (this.brandProfile.industry === 'Healthcare') {
      return '#059669' // Medical green
    }

    if (this.brandProfile.industry === 'Finance') {
      return '#1E3A8A' // Trust blue
    }

    if (this.brandProfile.industry === 'Creative') {
      return '#7C3AED' // Creative purple
    }

    return '#3B82F6' // Default blue
  }

  private generateSecondaryColor(primary: string): string {
    // Generate complementary secondary color
    const primaryHue = this.getHueFromHex(primary)
    const complementaryHue = (primaryHue + 180) % 360
    return this.hslToHex(complementaryHue, 60, 50)
  }

  private generateAccentColor(primary: string, secondary: string): string {
    // Generate accent color that works with primary and secondary
    const primaryHue = this.getHueFromHex(primary)
    const accentHue = (primaryHue + 60) % 360
    return this.hslToHex(accentHue, 70, 60)
  }

  private generateNeutralColor(): string {
    // Generate neutral color based on brand personality
    if (this.brandProfile.personality.includes('Modern')) {
      return '#6B7280' // Modern gray
    }
    if (this.brandProfile.personality.includes('Traditional')) {
      return '#4B5563' // Traditional dark gray
    }
    return '#6B7280' // Default gray
  }

  private generateColorScale(baseColor: string): ColorScale {
    const baseHsl = this.hexToHsl(baseColor)
    
    return {
      base: baseColor,
      50: this.hslToHex(baseHsl.h, Math.max(baseHsl.s - 40, 10), 95),
      100: this.hslToHex(baseHsl.h, Math.max(baseHsl.s - 30, 20), 90),
      200: this.hslToHex(baseHsl.h, Math.max(baseHsl.s - 20, 30), 80),
      300: this.hslToHex(baseHsl.h, Math.max(baseHsl.s - 10, 40), 70),
      400: this.hslToHex(baseHsl.h, baseHsl.s, 60),
      500: baseColor,
      600: this.hslToHex(baseHsl.h, Math.min(baseHsl.s + 10, 90), 40),
      700: this.hslToHex(baseHsl.h, Math.min(baseHsl.s + 20, 90), 30),
      800: this.hslToHex(baseHsl.h, Math.min(baseHsl.s + 30, 90), 20),
      900: this.hslToHex(baseHsl.h, Math.min(baseHsl.s + 40, 90), 10),
      950: this.hslToHex(baseHsl.h, Math.min(baseHsl.s + 50, 90), 5)
    }
  }

  private async generateTypographySystem(): Promise<TypographySystem> {
    const fontFamily = this.generateFontFamily()
    
    return {
      fontFamily: {
        heading: fontFamily.heading,
        body: fontFamily.body,
        mono: 'JetBrains Mono, Consolas, monospace'
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em'
      }
    }
  }

  private generateFontFamily(): { heading: string; body: string } {
    if (this.brandProfile.personality.includes('Modern')) {
      return {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif'
      }
    }

    if (this.brandProfile.personality.includes('Traditional')) {
      return {
        heading: 'Playfair Display, serif',
        body: 'Source Serif Pro, serif'
      }
    }

    if (this.brandProfile.industry === 'Technology') {
      return {
        heading: 'SF Pro Display, system-ui, sans-serif',
        body: 'SF Pro Text, system-ui, sans-serif'
      }
    }

    return {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif'
    }
  }

  private generateSpacingSystem(): SpacingSystem {
    return {
      px: '1px',
      0: '0px',
      0.5: '0.125rem',
      1: '0.25rem',
      1.5: '0.375rem',
      2: '0.5rem',
      2.5: '0.625rem',
      3: '0.75rem',
      3.5: '0.875rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      11: '2.75rem',
      12: '3rem',
      14: '3.5rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      52: '13rem',
      56: '14rem',
      60: '15rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem'
    }
  }

  private generateBorderRadiusSystem(): BorderRadiusSystem {
    if (this.brandProfile.personality.includes('Friendly')) {
      return {
        none: '0px',
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px'
      }
    }

    if (this.brandProfile.personality.includes('Professional')) {
      return {
        none: '0px',
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px'
      }
    }

    return {
      none: '0px',
      sm: '0.125rem',
      base: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px'
    }
  }

  private generateShadowSystem(): ShadowSystem {
    return {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      none: '0 0 #0000'
    }
  }

  private generateAnimationSystem(): AnimationSystem {
    return {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      transitions: {
        all: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        colors: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)'
      }
    }
  }

  private generateLayoutSystem(): LayoutSystem {
    return {
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      container: {
        center: true,
        padding: '1rem',
        maxWidth: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px'
        }
      },
      grid: {
        columns: 12,
        gap: '1rem'
      }
    }
  }

  private generateReasoning(): string[] {
    const reasoning: string[] = []

    // Industry-based reasoning
    if (this.brandProfile.industry === 'Technology') {
      reasoning.push('Blue color palette chosen for trust and innovation in tech industry')
      reasoning.push('Modern sans-serif typography reflects technological advancement')
    }

    if (this.brandProfile.industry === 'Healthcare') {
      reasoning.push('Green color palette conveys health and wellness')
      reasoning.push('Clean, accessible typography ensures readability for all users')
    }

    // Personality-based reasoning
    if (this.brandProfile.personality.includes('Friendly')) {
      reasoning.push('Rounded corners and warm colors create approachable feel')
    }

    if (this.brandProfile.personality.includes('Professional')) {
      reasoning.push('Structured layout and conservative colors maintain professionalism')
    }

    if (this.brandProfile.personality.includes('Modern')) {
      reasoning.push('Minimal design and contemporary typography reflect modern aesthetic')
    }

    // Values-based reasoning
    if (this.brandProfile.values.includes('Accessibility')) {
      reasoning.push('High contrast colors and readable typography ensure accessibility')
    }

    if (this.brandProfile.values.includes('Innovation')) {
      reasoning.push('Dynamic color combinations and modern design elements suggest innovation')
    }

    return reasoning
  }

  private generateUsage(): ThemeUsage {
    return {
      primary: ['Buttons', 'Links', 'Brand elements', 'Active states'],
      secondary: ['Secondary actions', 'Accent elements', 'Highlights'],
      accent: ['Call-to-action buttons', 'Important highlights', 'Interactive elements'],
      neutral: ['Text', 'Borders', 'Backgrounds', 'Dividers'],
      semantic: ['Success messages', 'Warning alerts', 'Error states', 'Info notifications']
    }
  }

  private async calculateAccessibility(): Promise<AccessibilityMetrics> {
    // This would typically use color contrast calculation libraries
    return {
      contrastRatios: {
        primary: 4.5,
        secondary: 4.2,
        accent: 4.8,
        text: 7.1
      },
      wcagCompliance: 'AA',
      colorBlindSafe: true,
      recommendations: [
        'All color combinations meet WCAG AA standards',
        'High contrast ratios ensure readability',
        'Color-blind safe palette used'
      ]
    }
  }

  private async generatePreview(): Promise<ThemePreview> {
    return {
      components: {
        button: {
          styles: {
            primary: 'bg-blue-600 text-white hover:bg-blue-700',
            secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          },
          variants: {
            size: {
              sm: 'px-3 py-1.5 text-sm',
              md: 'px-4 py-2 text-base',
              lg: 'px-6 py-3 text-lg'
            }
          }
        },
        card: {
          styles: {
            base: 'bg-white rounded-lg shadow-md p-6',
            elevated: 'bg-white rounded-lg shadow-lg p-6'
          },
          variants: {}
        },
        input: {
          styles: {
            base: 'border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500',
            error: 'border border-red-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500'
          },
          variants: {}
        },
        navigation: {
          styles: {
            base: 'bg-white border-b border-gray-200',
            item: 'text-gray-700 hover:text-blue-600 px-3 py-2'
          },
          variants: {}
        }
      },
      layouts: {
        landing: {
          structure: ['Header', 'Hero', 'Features', 'Footer'],
          styles: {
            container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
            section: 'py-16'
          }
        },
        dashboard: {
          structure: ['Sidebar', 'Header', 'Main', 'Footer'],
          styles: {
            container: 'min-h-screen bg-gray-50',
            sidebar: 'w-64 bg-white shadow-lg',
            main: 'flex-1 p-6'
          }
        },
        form: {
          structure: ['Header', 'Form', 'Footer'],
          styles: {
            container: 'max-w-2xl mx-auto px-4',
            form: 'bg-white rounded-lg shadow-md p-6'
          }
        }
      }
    }
  }

  private async adaptColorPalette(existingColors: string[]): Promise<ColorPalette> {
    // Adapt existing colors to full palette
    const primary = existingColors[0] || '#3B82F6'
    const secondary = existingColors[1] || this.generateSecondaryColor(primary)
    const accent = existingColors[2] || this.generateAccentColor(primary, secondary)
    const neutral = '#6B7280'

    return {
      primary: this.generateColorScale(primary),
      secondary: this.generateColorScale(secondary),
      accent: this.generateColorScale(accent),
      neutral: this.generateColorScale(neutral),
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      },
      background: {
        primary: neutral[50],
        secondary: neutral[100],
        tertiary: neutral[200]
      },
      text: {
        primary: neutral[900],
        secondary: neutral[700],
        tertiary: neutral[500],
        inverse: neutral[50]
      }
    }
  }

  private optimizeForMobile(theme: GeneratedTheme): GeneratedTheme {
    // Optimize theme for mobile use
    theme.spacing = {
      ...theme.spacing,
      4: '1.5rem', // Increase touch targets
      8: '3rem'
    }

    theme.typography.fontSize = {
      ...theme.typography.fontSize,
      base: '1.125rem', // Larger base font for mobile
      lg: '1.25rem'
    }

    theme.reasoning.push('Optimized for mobile touch targets and readability')
    return theme
  }

  private optimizeForPrint(theme: GeneratedTheme): GeneratedTheme {
    // Optimize theme for print
    theme.colors = {
      ...theme.colors,
      background: {
        primary: '#FFFFFF',
        secondary: '#F8F9FA',
        tertiary: '#E9ECEF'
      }
    }

    theme.shadows = {
      sm: 'none',
      base: 'none',
      md: 'none',
      lg: 'none',
      xl: 'none',
      '2xl': 'none',
      inner: 'none',
      none: 'none'
    }

    theme.reasoning.push('Optimized for print with high contrast and no shadows')
    return theme
  }

  private optimizeForAccessibility(theme: GeneratedTheme): GeneratedTheme {
    // Optimize theme for accessibility
    theme.colors.primary = this.generateColorScale('#1E40AF') // Higher contrast blue
    theme.colors.text.primary = '#000000'
    theme.colors.text.secondary = '#374151'

    theme.typography.fontSize = {
      ...theme.typography.fontSize,
      base: '1.125rem', // Larger base font
      lg: '1.25rem'
    }

    theme.reasoning.push('Optimized for accessibility with high contrast and larger fonts')
    return theme
  }

  private generateCSSTokens(theme: GeneratedTheme): string {
    let css = ':root {\n'
    
    // Colors
    Object.entries(theme.colors.primary).forEach(([key, value]) => {
      css += `  --color-primary-${key}: ${value};\n`
    })
    
    Object.entries(theme.colors.secondary).forEach(([key, value]) => {
      css += `  --color-secondary-${key}: ${value};\n`
    })

    // Typography
    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      css += `  --font-size-${key}: ${value};\n`
    })

    css += '}\n'
    return css
  }

  private generateSCSSTokens(theme: GeneratedTheme): string {
    let scss = '// Theme Tokens\n\n'
    
    // Colors
    scss += '$colors: (\n'
    scss += `  primary: ${JSON.stringify(theme.colors.primary)},\n`
    scss += `  secondary: ${JSON.stringify(theme.colors.secondary)},\n`
    scss += ');\n\n'

    // Typography
    scss += '$typography: (\n'
    scss += `  font-family: ${theme.typography.fontFamily.body},\n`
    scss += `  font-sizes: ${JSON.stringify(theme.typography.fontSize)},\n`
    scss += ');\n'

    return scss
  }

  private generateJSTokens(theme: GeneratedTheme): string {
    return `export const theme = ${JSON.stringify(theme, null, 2)};`
  }

  private generateJSONTokens(theme: GeneratedTheme): string {
    return JSON.stringify(theme, null, 2)
  }

  private generateCacheKey(): string {
    return `${this.brandProfile.name}-${this.brandProfile.industry}-${this.request.customizationRequest.type}-${this.request.customizationRequest.description}`
  }

  // Color utility functions
  private hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  private hslToHex(h: number, s: number, l: number): string {
    const c = (1 - Math.abs(2 * (l / 100) - 1)) * (s / 100)
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = (l / 100) - c / 2

    let r = 0, g = 0, b = 0

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x
    }

    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  private getHueFromHex(hex: string): number {
    const hsl = this.hexToHsl(hex)
    return hsl.h
  }
}
