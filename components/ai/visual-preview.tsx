'use client'

/**
 * @fileoverview Visual Customization Preview Component - HT-033.2.2
 * @module components/ai/visual-preview
 * @author Hero Tasks System
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  Palette,
  Type,
  Layout,
  Download,
  RefreshCw,
  Settings,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Contrast,
  Copy,
  Check
} from 'lucide-react'

interface VisualPreviewProps {
  customization?: CustomizationData
  onCustomizationChange?: (customization: CustomizationData) => void
  className?: string
}

interface CustomizationData {
  colors: ColorPalette
  typography: TypographySystem
  layout: LayoutSystem
  components: ComponentCustomization[]
  themes: ThemeVariation[]
  metadata: CustomizationMetadata
}

interface ColorPalette {
  primary: string
  secondary: string[]
  accent: string[]
  neutral: string[]
  semantic: {
    success: string
    warning: string
    error: string
    info: string
  }
}

interface TypographySystem {
  fontFamily: string
  fontSizes: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
  }
  fontWeights: {
    normal: number
    medium: number
    semibold: number
    bold: number
  }
  lineHeights: {
    tight: number
    normal: number
    relaxed: number
  }
}

interface LayoutSystem {
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
  }
  breakpoints: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

interface ComponentCustomization {
  name: string
  variants: ComponentVariant[]
  states: ComponentState[]
}

interface ComponentVariant {
  name: string
  styles: Record<string, string>
  example: React.ReactNode
}

interface ComponentState {
  name: string
  styles: Record<string, string>
}

interface ThemeVariation {
  name: string
  type: 'light' | 'dark' | 'high-contrast'
  colors: ColorPalette
}

interface CustomizationMetadata {
  version: string
  generatedAt: string
  confidence: number
}

interface PreviewSettings {
  device: 'desktop' | 'tablet' | 'mobile'
  theme: 'light' | 'dark' | 'high-contrast'
  zoom: number
  showGrid: boolean
  showSpacing: boolean
  enableAnimations: boolean
}

export const VisualPreview: React.FC<VisualPreviewProps> = ({
  customization,
  onCustomizationChange,
  className = ''
}) => {
  const [previewSettings, setPreviewSettings] = useState<PreviewSettings>({
    device: 'desktop',
    theme: 'light',
    zoom: 100,
    showGrid: false,
    showSpacing: false,
    enableAnimations: true
  })

  const [activeTab, setActiveTab] = useState('preview')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [selectedComponent, setSelectedComponent] = useState<string>('button')

  // Mock customization data if none provided
  const mockCustomization: CustomizationData = useMemo(() => ({
    colors: {
      primary: '#2563EB',
      secondary: ['#7C3AED', '#059669'],
      accent: ['#F59E0B', '#EF4444'],
      neutral: ['#F9FAFB', '#E5E7EB', '#9CA3AF', '#6B7280', '#374151', '#111827'],
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      }
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      fontWeights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    layout: {
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem'
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
      },
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px'
      }
    },
    components: [
      {
        name: 'button',
        variants: [
          {
            name: 'primary',
            styles: {
              backgroundColor: '#2563EB',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer'
            },
            example: <button style={{ backgroundColor: '#2563EB', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: '500', border: 'none', cursor: 'pointer' }}>Primary Button</button>
          },
          {
            name: 'secondary',
            styles: {
              backgroundColor: 'transparent',
              color: '#2563EB',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontWeight: '500',
              border: '1px solid #2563EB',
              cursor: 'pointer'
            },
            example: <button style={{ backgroundColor: 'transparent', color: '#2563EB', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: '500', border: '1px solid #2563EB', cursor: 'pointer' }}>Secondary Button</button>
          }
        ],
        states: [
          {
            name: 'hover',
            styles: {
              opacity: '0.9',
              transform: 'translateY(-1px)'
            }
          },
          {
            name: 'active',
            styles: {
              transform: 'translateY(0)'
            }
          }
        ]
      },
      {
        name: 'card',
        variants: [
          {
            name: 'default',
            styles: {
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              border: '1px solid #E5E7EB'
            },
            example: (
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', border: '1px solid #E5E7EB', maxWidth: '300px' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: '600' }}>Card Title</h3>
                <p style={{ margin: '0', color: '#6B7280', fontSize: '0.875rem' }}>This is a sample card component with the customized styling.</p>
              </div>
            )
          }
        ],
        states: [
          {
            name: 'hover',
            styles: {
              transform: 'translateY(-2px)',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
            }
          }
        ]
      }
    ],
    themes: [
      {
        name: 'Light',
        type: 'light',
        colors: {
          primary: '#2563EB',
          secondary: ['#7C3AED', '#059669'],
          accent: ['#F59E0B', '#EF4444'],
          neutral: ['#F9FAFB', '#E5E7EB', '#9CA3AF', '#6B7280', '#374151', '#111827'],
          semantic: {
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6'
          }
        }
      },
      {
        name: 'Dark',
        type: 'dark',
        colors: {
          primary: '#3B82F6',
          secondary: ['#8B5CF6', '#10B981'],
          accent: ['#FBBF24', '#F87171'],
          neutral: ['#111827', '#1F2937', '#374151', '#6B7280', '#9CA3AF', '#F9FAFB'],
          semantic: {
            success: '#34D399',
            warning: '#FBBF24',
            error: '#F87171',
            info: '#60A5FA'
          }
        }
      }
    ],
    metadata: {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      confidence: 85
    }
  }), [])

  const activeCustomization = customization || mockCustomization

  // Get current theme colors
  const currentTheme = useMemo(() => {
    const theme = activeCustomization.themes.find(t => t.type === previewSettings.theme)
    return theme?.colors || activeCustomization.colors
  }, [activeCustomization, previewSettings.theme])

  // Device dimensions
  const deviceDimensions = useMemo(() => {
    switch (previewSettings.device) {
      case 'mobile':
        return { width: '375px', height: '667px' }
      case 'tablet':
        return { width: '768px', height: '1024px' }
      default:
        return { width: '1200px', height: '800px' }
    }
  }, [previewSettings.device])

  // Handle copy to clipboard
  const handleCopyCode = useCallback(async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(type)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }, [])

  // Generate CSS code
  const generateCSSCode = useCallback(() => {
    const theme = currentTheme
    return `:root {
  /* Colors */
  --color-primary: ${theme.primary};
  --color-secondary-1: ${theme.secondary[0] || theme.primary};
  --color-secondary-2: ${theme.secondary[1] || theme.primary};
  --color-accent-1: ${theme.accent[0] || '#F59E0B'};
  --color-accent-2: ${theme.accent[1] || '#EF4444'};
  --color-success: ${theme.semantic.success};
  --color-warning: ${theme.semantic.warning};
  --color-error: ${theme.semantic.error};
  --color-info: ${theme.semantic.info};

  /* Typography */
  --font-family: ${activeCustomization.typography.fontFamily};
  --font-size-base: ${activeCustomization.typography.fontSizes.base};
  --font-weight-normal: ${activeCustomization.typography.fontWeights.normal};
  --font-weight-medium: ${activeCustomization.typography.fontWeights.medium};
  --font-weight-bold: ${activeCustomization.typography.fontWeights.bold};

  /* Spacing */
  --spacing-xs: ${activeCustomization.layout.spacing.xs};
  --spacing-sm: ${activeCustomization.layout.spacing.sm};
  --spacing-md: ${activeCustomization.layout.spacing.md};
  --spacing-lg: ${activeCustomization.layout.spacing.lg};
  --spacing-xl: ${activeCustomization.layout.spacing.xl};

  /* Border Radius */
  --border-radius-sm: ${activeCustomization.layout.borderRadius.sm};
  --border-radius-md: ${activeCustomization.layout.borderRadius.md};
  --border-radius-lg: ${activeCustomization.layout.borderRadius.lg};

  /* Shadows */
  --shadow-sm: ${activeCustomization.layout.shadows.sm};
  --shadow-md: ${activeCustomization.layout.shadows.md};
  --shadow-lg: ${activeCustomization.layout.shadows.lg};
}`
  }, [activeCustomization, currentTheme])

  // Generate Tailwind config
  const generateTailwindConfig = useCallback(() => {
    const theme = currentTheme
    return `module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${theme.primary}',
        secondary: {
          100: '${theme.secondary[0] || theme.primary}',
          200: '${theme.secondary[1] || theme.primary}',
        },
        accent: {
          100: '${theme.accent[0] || '#F59E0B'}',
          200: '${theme.accent[1] || '#EF4444'}',
        },
        success: '${theme.semantic.success}',
        warning: '${theme.semantic.warning}',
        error: '${theme.semantic.error}',
        info: '${theme.semantic.info}',
      },
      fontFamily: {
        sans: ['${activeCustomization.typography.fontFamily}'],
      },
      fontSize: ${JSON.stringify(activeCustomization.typography.fontSizes, null, 8)},
      spacing: ${JSON.stringify(activeCustomization.layout.spacing, null, 8)},
      borderRadius: ${JSON.stringify(activeCustomization.layout.borderRadius, null, 8)},
      boxShadow: ${JSON.stringify(activeCustomization.layout.shadows, null, 8)},
    }
  }
}`
  }, [activeCustomization, currentTheme])

  // Render preview content
  const renderPreviewContent = () => {
    const styles: React.CSSProperties = {
      fontFamily: activeCustomization.typography.fontFamily,
      fontSize: activeCustomization.typography.fontSizes.base,
      lineHeight: activeCustomization.typography.lineHeights.normal,
      backgroundColor: previewSettings.theme === 'dark' ? currentTheme.neutral[0] : currentTheme.neutral[0],
      color: previewSettings.theme === 'dark' ? currentTheme.neutral[5] : currentTheme.neutral[5],
      padding: activeCustomization.layout.spacing.lg,
      minHeight: '100%',
      transition: previewSettings.enableAnimations ? 'all 0.3s ease' : 'none'
    }

    return (
      <div style={styles}>
        {/* Header */}
        <header style={{ marginBottom: activeCustomization.layout.spacing.xl }}>
          <h1 style={{
            fontSize: activeCustomization.typography.fontSizes['3xl'],
            fontWeight: activeCustomization.typography.fontWeights.bold,
            color: currentTheme.primary,
            margin: `0 0 ${activeCustomization.layout.spacing.md} 0`
          }}>
            Brand Customization Preview
          </h1>
          <p style={{
            fontSize: activeCustomization.typography.fontSizes.lg,
            color: previewSettings.theme === 'dark' ? currentTheme.neutral[3] : currentTheme.neutral[3],
            margin: '0'
          }}>
            Experience your brand identity in action
          </p>
        </header>

        {/* Color Palette Showcase */}
        <section style={{ marginBottom: activeCustomization.layout.spacing.xl }}>
          <h2 style={{
            fontSize: activeCustomization.typography.fontSizes['2xl'],
            fontWeight: activeCustomization.typography.fontWeights.semibold,
            margin: `0 0 ${activeCustomization.layout.spacing.lg} 0`
          }}>
            Color Palette
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: activeCustomization.layout.spacing.md
          }}>
            <div style={{
              backgroundColor: currentTheme.primary,
              height: '80px',
              borderRadius: activeCustomization.layout.borderRadius.lg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: activeCustomization.typography.fontWeights.medium,
              fontSize: activeCustomization.typography.fontSizes.sm
            }}>
              Primary
            </div>
            {currentTheme.secondary.slice(0, 2).map((color, index) => (
              <div key={index} style={{
                backgroundColor: color,
                height: '80px',
                borderRadius: activeCustomization.layout.borderRadius.lg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: activeCustomization.typography.fontWeights.medium,
                fontSize: activeCustomization.typography.fontSizes.sm
              }}>
                Secondary {index + 1}
              </div>
            ))}
            {currentTheme.accent.slice(0, 2).map((color, index) => (
              <div key={index} style={{
                backgroundColor: color,
                height: '80px',
                borderRadius: activeCustomization.layout.borderRadius.lg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: activeCustomization.typography.fontWeights.medium,
                fontSize: activeCustomization.typography.fontSizes.sm
              }}>
                Accent {index + 1}
              </div>
            ))}
          </div>
        </section>

        {/* Component Showcase */}
        <section style={{ marginBottom: activeCustomization.layout.spacing.xl }}>
          <h2 style={{
            fontSize: activeCustomization.typography.fontSizes['2xl'],
            fontWeight: activeCustomization.typography.fontWeights.semibold,
            margin: `0 0 ${activeCustomization.layout.spacing.lg} 0`
          }}>
            Components
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: activeCustomization.layout.spacing.lg
          }}>
            {activeCustomization.components.map((component) => (
              <div key={component.name}>
                <h3 style={{
                  fontSize: activeCustomization.typography.fontSizes.lg,
                  fontWeight: activeCustomization.typography.fontWeights.medium,
                  margin: `0 0 ${activeCustomization.layout.spacing.md} 0`,
                  textTransform: 'capitalize'
                }}>
                  {component.name}
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: activeCustomization.layout.spacing.md
                }}>
                  {component.variants.map((variant) => (
                    <div key={variant.name} style={{
                      padding: activeCustomization.layout.spacing.md,
                      backgroundColor: previewSettings.theme === 'dark' ? currentTheme.neutral[1] : 'white',
                      borderRadius: activeCustomization.layout.borderRadius.lg,
                      border: `1px solid ${previewSettings.theme === 'dark' ? currentTheme.neutral[2] : currentTheme.neutral[1]}`,
                      boxShadow: activeCustomization.layout.shadows.sm
                    }}>
                      <div style={{
                        fontSize: activeCustomization.typography.fontSizes.sm,
                        fontWeight: activeCustomization.typography.fontWeights.medium,
                        marginBottom: activeCustomization.layout.spacing.sm,
                        color: previewSettings.theme === 'dark' ? currentTheme.neutral[4] : currentTheme.neutral[3],
                        textTransform: 'capitalize'
                      }}>
                        {variant.name}
                      </div>
                      {variant.example}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography Showcase */}
        <section style={{ marginBottom: activeCustomization.layout.spacing.xl }}>
          <h2 style={{
            fontSize: activeCustomization.typography.fontSizes['2xl'],
            fontWeight: activeCustomization.typography.fontWeights.semibold,
            margin: `0 0 ${activeCustomization.layout.spacing.lg} 0`
          }}>
            Typography
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: activeCustomization.layout.spacing.md }}>
            <h1 style={{
              fontSize: activeCustomization.typography.fontSizes['4xl'],
              fontWeight: activeCustomization.typography.fontWeights.bold,
              margin: '0'
            }}>
              Heading 1 - The quick brown fox
            </h1>
            <h2 style={{
              fontSize: activeCustomization.typography.fontSizes['3xl'],
              fontWeight: activeCustomization.typography.fontWeights.semibold,
              margin: '0'
            }}>
              Heading 2 - The quick brown fox
            </h2>
            <h3 style={{
              fontSize: activeCustomization.typography.fontSizes['2xl'],
              fontWeight: activeCustomization.typography.fontWeights.medium,
              margin: '0'
            }}>
              Heading 3 - The quick brown fox
            </h3>
            <p style={{
              fontSize: activeCustomization.typography.fontSizes.base,
              lineHeight: activeCustomization.typography.lineHeights.relaxed,
              margin: '0'
            }}>
              Body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
            <p style={{
              fontSize: activeCustomization.typography.fontSizes.sm,
              color: previewSettings.theme === 'dark' ? currentTheme.neutral[3] : currentTheme.neutral[3],
              margin: '0'
            }}>
              Small text - Additional information or captions
            </p>
          </div>
        </section>

        {/* Interactive Elements */}
        <section>
          <h2 style={{
            fontSize: activeCustomization.typography.fontSizes['2xl'],
            fontWeight: activeCustomization.typography.fontWeights.semibold,
            margin: `0 0 ${activeCustomization.layout.spacing.lg} 0`
          }}>
            Interactive Elements
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: activeCustomization.layout.spacing.lg,
            alignItems: 'start'
          }}>
            {/* Form Elements */}
            <div>
              <h3 style={{
                fontSize: activeCustomization.typography.fontSizes.lg,
                fontWeight: activeCustomization.typography.fontWeights.medium,
                margin: `0 0 ${activeCustomization.layout.spacing.md} 0`
              }}>
                Form Elements
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: activeCustomization.layout.spacing.sm }}>
                <input
                  type="text"
                  placeholder="Text input"
                  style={{
                    padding: activeCustomization.layout.spacing.sm,
                    borderRadius: activeCustomization.layout.borderRadius.md,
                    border: `1px solid ${previewSettings.theme === 'dark' ? currentTheme.neutral[2] : currentTheme.neutral[1]}`,
                    backgroundColor: previewSettings.theme === 'dark' ? currentTheme.neutral[1] : 'white',
                    color: previewSettings.theme === 'dark' ? currentTheme.neutral[5] : currentTheme.neutral[5],
                    fontSize: activeCustomization.typography.fontSizes.base,
                    fontFamily: activeCustomization.typography.fontFamily
                  }}
                />
                <select style={{
                  padding: activeCustomization.layout.spacing.sm,
                  borderRadius: activeCustomization.layout.borderRadius.md,
                  border: `1px solid ${previewSettings.theme === 'dark' ? currentTheme.neutral[2] : currentTheme.neutral[1]}`,
                  backgroundColor: previewSettings.theme === 'dark' ? currentTheme.neutral[1] : 'white',
                  color: previewSettings.theme === 'dark' ? currentTheme.neutral[5] : currentTheme.neutral[5],
                  fontSize: activeCustomization.typography.fontSizes.base,
                  fontFamily: activeCustomization.typography.fontFamily
                }}>
                  <option>Select option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </div>
            </div>

            {/* Status Indicators */}
            <div>
              <h3 style={{
                fontSize: activeCustomization.typography.fontSizes.lg,
                fontWeight: activeCustomization.typography.fontWeights.medium,
                margin: `0 0 ${activeCustomization.layout.spacing.md} 0`
              }}>
                Status Indicators
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: activeCustomization.layout.spacing.sm }}>
                {Object.entries(currentTheme.semantic).map(([name, color]) => (
                  <div key={name} style={{
                    padding: activeCustomization.layout.spacing.sm,
                    backgroundColor: color,
                    color: 'white',
                    borderRadius: activeCustomization.layout.borderRadius.md,
                    fontSize: activeCustomization.typography.fontSizes.sm,
                    fontWeight: activeCustomization.typography.fontWeights.medium,
                    textAlign: 'center',
                    textTransform: 'capitalize'
                  }}>
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="grid w-auto grid-cols-3">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Components
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Code
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {/* Device Selector */}
            <Select value={previewSettings.device} onValueChange={(value: any) => setPreviewSettings(prev => ({ ...prev, device: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desktop">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Desktop
                  </div>
                </SelectItem>
                <SelectItem value="tablet">
                  <div className="flex items-center gap-2">
                    <Tablet className="h-4 w-4" />
                    Tablet
                  </div>
                </SelectItem>
                <SelectItem value="mobile">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Theme Selector */}
            <Select value={previewSettings.theme} onValueChange={(value: any) => setPreviewSettings(prev => ({ ...prev, theme: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="high-contrast">
                  <div className="flex items-center gap-2">
                    <Contrast className="h-4 w-4" />
                    High Contrast
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewSettings(prev => ({ ...prev, zoom: Math.max(50, prev.zoom - 10) }))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium w-12 text-center">{previewSettings.zoom}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewSettings(prev => ({ ...prev, zoom: Math.min(200, prev.zoom + 10) }))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Live Preview
                  </CardTitle>
                  <CardDescription>
                    Interactive preview of your brand customization
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="animations"
                      checked={previewSettings.enableAnimations}
                      onCheckedChange={(checked) => setPreviewSettings(prev => ({ ...prev, enableAnimations: checked }))}
                    />
                    <Label htmlFor="animations" className="text-sm">Animations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="grid"
                      checked={previewSettings.showGrid}
                      onCheckedChange={(checked) => setPreviewSettings(prev => ({ ...prev, showGrid: checked }))}
                    />
                    <Label htmlFor="grid" className="text-sm">Grid</Label>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <div
                  className="mx-auto bg-white transition-all duration-300 origin-top"
                  style={{
                    width: deviceDimensions.width,
                    height: deviceDimensions.height,
                    maxWidth: '100%',
                    transform: `scale(${previewSettings.zoom / 100})`,
                    transformOrigin: 'top center'
                  }}
                >
                  <div
                    className="relative overflow-auto"
                    style={{
                      height: '100%',
                      backgroundImage: previewSettings.showGrid ?
                        'linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)' :
                        'none',
                      backgroundSize: previewSettings.showGrid ? '20px 20px' : 'auto'
                    }}
                  >
                    {renderPreviewContent()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Component Library
              </CardTitle>
              <CardDescription>
                Explore and customize individual components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Component Selector */}
                <div className="space-y-4">
                  <Label>Select Component</Label>
                  <div className="space-y-2">
                    {activeCustomization.components.map((component) => (
                      <Button
                        key={component.name}
                        variant={selectedComponent === component.name ? "default" : "outline"}
                        className="w-full justify-start text-left"
                        onClick={() => setSelectedComponent(component.name)}
                      >
                        <span className="capitalize">{component.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Component Preview */}
                <div className="lg:col-span-2 space-y-4">
                  {activeCustomization.components
                    .filter(component => component.name === selectedComponent)
                    .map((component) => (
                      <div key={component.name} className="space-y-4">
                        <h3 className="text-lg font-semibold capitalize">{component.name}</h3>

                        {/* Variants */}
                        <div className="space-y-4">
                          <Label>Variants</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {component.variants.map((variant) => (
                              <Card key={variant.name}>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm capitalize">{variant.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg mb-4">
                                    {variant.example}
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs">Styles</Label>
                                    <div className="text-xs font-mono bg-gray-100 p-2 rounded">
                                      {Object.entries(variant.styles).slice(0, 3).map(([key, value]) => (
                                        <div key={key}>
                                          {key}: {value};
                                        </div>
                                      ))}
                                      {Object.keys(variant.styles).length > 3 && (
                                        <div className="text-gray-500">
                                          ... +{Object.keys(variant.styles).length - 3} more
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* States */}
                        {component.states.length > 0 && (
                          <div className="space-y-4">
                            <Label>Interactive States</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {component.states.map((state) => (
                                <Card key={state.name}>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm capitalize">{state.name}</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-xs font-mono bg-gray-100 p-2 rounded">
                                      {Object.entries(state.styles).map(([key, value]) => (
                                        <div key={key}>
                                          {key}: {value};
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CSS Variables */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    CSS Variables
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyCode(generateCSSCode(), 'css')}
                  >
                    {copiedCode === 'css' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                  <code>{generateCSSCode()}</code>
                </pre>
              </CardContent>
            </Card>

            {/* Tailwind Config */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Tailwind Config
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyCode(generateTailwindConfig(), 'tailwind')}
                  >
                    {copiedCode === 'tailwind' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                  <code>{generateTailwindConfig()}</code>
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Color Palette Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Primary Colors */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Primary</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-200"
                        style={{ backgroundColor: currentTheme.primary }}
                      />
                      <code className="text-xs">{currentTheme.primary}</code>
                    </div>
                  </div>
                </div>

                {/* Secondary Colors */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Secondary</Label>
                  <div className="space-y-2">
                    {currentTheme.secondary.slice(0, 2).map((color, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                        <code className="text-xs">{color}</code>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accent Colors */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Accent</Label>
                  <div className="space-y-2">
                    {currentTheme.accent.slice(0, 2).map((color, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                        <code className="text-xs">{color}</code>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Semantic Colors */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Semantic</Label>
                  <div className="space-y-2">
                    {Object.entries(currentTheme.semantic).map(([name, color]) => (
                      <div key={name} className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                        <code className="text-xs">{color}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default VisualPreview