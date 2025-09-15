/**
 * @fileoverview HT-007 Sandbox Tokens Page - Mono-Theme Enhancement
 * @module app/sandbox/tokens/page
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: HT-007 Phase 4 - Tokens Page Enhancement
 * Purpose: Sophisticated token showcase with HT-007 mono-theme system
 * Safety: Sandbox-isolated token preview environment with motion effects
 * Status: HT-007 Phase 4 implementation - Interactive token showcase
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useTokens, useThemeTokens } from '@/components-sandbox/providers/TokensProvider'
import { 
  Palette, 
  Type, 
  Move, 
  CornerDownRight, 
  Layers, 
  Zap, 
  Search,
  Filter,
  Copy,
  Download,
  Settings,
  Eye,
  Code,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Check,
  X
} from 'lucide-react'
import { 
  MotionSystemProvider,
  MotionPageWrapper,
  MotionCard,
  MotionButton,
  MotionText,
  MotionIcon,
  MotionGrid,
  MotionList,
  useMotionSystemConfig
} from '@/lib/motion/motion-integration'
import { 
  monoThemeMotionTokens,
  pageVariants,
  cardHoverVariants,
  buttonVariants,
  staggerContainerVariants,
  listItemVariants,
  iconVariants
} from '@/lib/motion/mono-theme-motion'
import { motion, AnimatePresence } from 'framer-motion'

// HT-007: Enhanced Token Showcase Component
export default function TokensPage() {
  const { brand, mode } = useTokens()
  const { tokens } = useThemeTokens()
  const motionConfig = useMotionSystemConfig()
  
  // HT-007: Prevent hydration mismatch
  const [mounted, setMounted] = useState(false)
  
  // HT-007: Interactive state management
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCode, setShowCode] = useState(false)
  const [motionDemo, setMotionDemo] = useState<'paused' | 'running'>('paused')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['colors', 'typography']))

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // HT-007: Token categories with enhanced organization
  const tokenCategories = {
    colors: {
      title: 'Color Tokens',
      icon: Palette,
      description: 'Sophisticated mono-theme color system',
      sections: [
        {
          title: 'Neutral Scale',
          description: 'Brandless gray scale for consistent foundations',
          colors: Object.entries(tokens.colors)
            .filter(([key]) => key.startsWith('color-neutral-'))
            .map(([key, value]) => ({
              name: key.replace('color-neutral-', ''),
              value,
              css: `var(--${key})`,
              category: 'neutral'
            }))
        },
        {
          title: 'Brand Colors', 
          description: `${brand === 'salon' ? 'Beauty & wellness' : 'Modern tech'} brand palette`,
          colors: Object.entries(tokens.colors)
            .filter(([key]) => key.startsWith('brand-'))
            .map(([key, value]) => ({
              name: key.replace('brand-', ''),
              value,
              css: `var(--${key})`,
              category: 'brand'
            }))
        },
        {
          title: 'Semantic Colors',
          description: `${mounted ? mode : 'light'} mode semantic color assignments`,
          colors: Object.entries(tokens.colors)
            .filter(([key]) => key.startsWith('semantic-'))
            .map(([key, value]) => ({
              name: key.replace('semantic-', ''),
              value,
              css: `var(--${key})`,
              category: 'semantic'
            }))
        }
      ]
    },
    typography: {
      title: 'Typography Tokens',
      icon: Type,
      description: 'Sophisticated typography hierarchy',
      tokens: {
        fontSize: tokens.fontSize,
        fontWeight: tokens.fontWeight,
        lineHeight: tokens.lineHeight
      }
    },
    spacing: {
      title: 'Spacing Tokens',
      icon: Move,
      description: 'Consistent spacing system',
      tokens: tokens.spacing
    },
    borderRadius: {
      title: 'Border Radius Tokens',
      icon: CornerDownRight,
      description: 'Sophisticated border radius system',
      tokens: tokens.borderRadius
    },
    shadows: {
      title: 'Shadow Tokens',
      icon: Layers,
      description: 'Elevation and depth system',
      tokens: tokens.shadow
    }
  }

  // HT-007: Interactive token utilities
  const copyToClipboard = useCallback(async (text: string, tokenName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedToken(tokenName)
      setTimeout(() => setCopiedToken(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }, [])

  const filteredCategories = Object.entries(tokenCategories).filter(([key, category]) => {
    if (selectedCategory !== 'all' && key !== selectedCategory) return false
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    return (
      category.title.toLowerCase().includes(searchLower) ||
      category.description.toLowerCase().includes(searchLower) ||
      ('sections' in category && category.sections && category.sections.some((section: any) => 
        section.title.toLowerCase().includes(searchLower) ||
        section.description.toLowerCase().includes(searchLower)
      ))
    )
  })

  return (
    <MotionSystemProvider enableReducedMotion={motionConfig.prefersReducedMotion}>
      <MotionPageWrapper>
        <motion.div 
          className="space-y-12"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* HT-007: Enhanced Header with Motion Effects */}
          <MotionCard className="border-b border-border pb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <MotionIcon>
                  <Palette className="w-10 h-10 text-foreground" />
                </MotionIcon>
                <div>
                  <MotionText>
                    <h1 className="text-5xl font-bold text-foreground mb-2">Design Tokens</h1>
                  </MotionText>
                  <MotionText delay={0.1}>
                    <p className="text-lg text-muted-foreground max-w-3xl">
                      HT-007 Enhanced Token Showcase with sophisticated mono-theme system, 
                      interactive demonstrations, and real-time editing capabilities.
                    </p>
                  </MotionText>
                </div>
              </div>
              
              {/* HT-007: Interactive Controls */}
              <MotionGrid className="flex items-center gap-3">
                <MotionButton
                  onClick={() => setMotionDemo(motionDemo === 'paused' ? 'running' : 'paused')}
                  className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  {motionDemo === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  <span className="text-sm font-medium">Motion Demo</span>
                </MotionButton>
                
                <MotionButton
                  onClick={() => setShowCode(!showCode)}
                  className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <Code className="w-4 h-4" />
                  <span className="text-sm font-medium">{showCode ? 'Hide' : 'Show'} Code</span>
                </MotionButton>
              </MotionGrid>
            </div>
            
            {/* HT-007: Current State with Enhanced Visuals */}
            <MotionGrid className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">Brand:</span>
                <span className="font-semibold text-foreground capitalize px-3 py-1 bg-card border border-border rounded-lg">{brand}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">Mode:</span>
                <span className="font-semibold text-foreground capitalize px-3 py-1 bg-card border border-border rounded-lg">{mounted ? mode : 'light'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">Motion:</span>
                <span className="font-semibold text-foreground capitalize px-3 py-1 bg-card border border-border rounded-lg">
                  {motionConfig.prefersReducedMotion ? 'Reduced' : 'Enhanced'}
                </span>
              </div>
            </MotionGrid>
          </MotionCard>

          {/* HT-007: Interactive Search and Filter Controls */}
          <MotionCard className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {Object.keys(tokenCategories).map(category => (
                    <option key={category} value={category}>
                      {tokenCategories[category as keyof typeof tokenCategories].title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 bg-background border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  {viewMode === 'grid' ? <Eye className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </MotionCard>

          {/* HT-007: Enhanced Token Categories with Motion */}
          <MotionList className="space-y-8">
            {filteredCategories.map(([categoryKey, category], index) => {
              const IconComponent = category.icon
              const isExpanded = expandedSections.has(categoryKey)
              
              return (
                <MotionCard
                  key={categoryKey}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  {/* Category Header */}
                  <div 
                    className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleSection(categoryKey)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <MotionIcon>
                          <IconComponent className="w-8 h-8 text-foreground" />
                        </MotionIcon>
                        <div>
                          <MotionText>
                            <h2 className="text-2xl font-semibold text-foreground">{category.title}</h2>
                          </MotionText>
                          <MotionText delay={0.1}>
                            <p className="text-muted-foreground">{category.description}</p>
                          </MotionText>
                        </div>
                      </div>
                      
                      <MotionIcon>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </MotionIcon>
                    </div>
                  </div>

                  {/* Category Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: monoThemeMotionTokens.duration.normal }}
                        className="border-t border-border"
                      >
                        <div className="p-6">
                          {categoryKey === 'colors' && 'sections' in category && category.sections ? (
                            <div className="space-y-8">
                              {category.sections.map((section: any, sectionIndex: number) => (
                                <MotionCard key={section.title}>
                                  <div className="space-y-4">
                                    <div>
                                      <h3 className="text-lg font-medium text-foreground">{section.title}</h3>
                                      <p className="text-sm text-muted-foreground">{section.description}</p>
                                    </div>
                                    
                                    <MotionGrid className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                                      {section.colors.map((color: any, colorIndex: number) => (
                                        <MotionCard
                                          key={color.name}
                                          className="group relative bg-background border border-border rounded-lg p-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                        >
                                          <div
                                            className="w-full h-16 rounded-md mb-3 border border-border relative overflow-hidden"
                                            style={{ backgroundColor: color.value }}
                                          >
                                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                              <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">
                                                {color.name}
                                              </span>
                                            </div>
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <div className="font-medium text-sm text-foreground">{color.name}</div>
                                            <div className="text-xs text-muted-foreground font-mono break-all">{color.value}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{color.css}</div>
                                            
                                            {/* Copy Button */}
                                            <MotionButton
                                              onClick={() => copyToClipboard(color.css, color.name)}
                                              className="absolute top-2 right-2 p-1 bg-background/80 border border-border rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            >
                                              {copiedToken === color.name ? (
                                                <Check className="w-3 h-3 text-green-500" />
                                              ) : (
                                                <Copy className="w-3 h-3 text-muted-foreground" />
                                              )}
                                            </MotionButton>
                                          </div>
                                        </MotionCard>
                                      ))}
                                    </MotionGrid>
                                  </div>
                                </MotionCard>
                              ))}
                            </div>
                          ) : (
                            <MotionGrid className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {Object.entries('tokens' in category ? category.tokens || {} : {}).map(([tokenKey, tokenValue], tokenIndex) => (
                                <MotionCard
                                  key={tokenKey}
                                  className="p-4 bg-background border border-border rounded-lg hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="font-medium text-sm text-foreground">{tokenKey}</div>
                                    <MotionButton
                                      onClick={() => copyToClipboard(`var(--${categoryKey}-${tokenKey})`, tokenKey)}
                                      className="p-1 hover:bg-muted rounded transition-colors"
                                    >
                                      {copiedToken === tokenKey ? (
                                        <Check className="w-3 h-3 text-green-500" />
                                      ) : (
                                        <Copy className="w-3 h-3 text-muted-foreground" />
                                      )}
                                    </MotionButton>
                                  </div>
                                  
                                  <div className="text-xs text-muted-foreground font-mono mb-2">{String(tokenValue)}</div>
                                  
                                  {/* Visual Representation */}
                                  {categoryKey === 'spacing' && (
                                    <div className="relative">
                                      <div 
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 rounded"
                                        style={{ height: '8px', width: tokenValue }}
                                      />
                                    </div>
                                  )}
                                  
                                  {categoryKey === 'borderRadius' && (
                                    <div 
                                      className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-border"
                                      style={{ borderRadius: tokenValue }}
                                    />
                                  )}
                                  
                                  {categoryKey === 'shadows' && (
                                    <div 
                                      className="w-16 h-16 bg-background border border-border rounded-lg"
                                      style={{ boxShadow: tokenValue }}
                                    />
                                  )}
                                  
                                  {categoryKey === 'typography' && (
                                    <div className="space-y-2">
                                      <div 
                                        className="text-foreground font-medium"
                                        style={{ 
                                          fontSize: (categoryKey as any) === 'fontSize' ? tokenValue : undefined,
                                          fontWeight: (categoryKey as any) === 'fontWeight' ? tokenValue : undefined,
                                          lineHeight: (categoryKey as any) === 'lineHeight' ? tokenValue : undefined
                                        }}
                                      >
                                        Aa
                                      </div>
                                    </div>
                                  )}
                                </MotionCard>
                              ))}
                            </MotionGrid>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </MotionCard>
              )
            })}
          </MotionList>

          {/* HT-007: Enhanced Implementation Notes */}
          <MotionCard className="border-t border-border pt-8">
            <div className="flex items-center gap-3 mb-6">
              <MotionIcon>
                <Zap className="w-8 h-8 text-foreground" />
              </MotionIcon>
              <MotionText>
                <h2 className="text-2xl font-semibold text-foreground">HT-007 Implementation Notes</h2>
              </MotionText>
            </div>
            
            <MotionCard className="bg-card border border-border rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Enhanced Token Architecture</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <strong className="text-foreground">Base Tokens:</strong>
                        <span className="text-muted-foreground ml-2">Foundation colors, spacing, typography in /tokens/base.json</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <strong className="text-foreground">Brand Overrides:</strong>
                        <span className="text-muted-foreground ml-2">Brand-specific customizations in /tokens/brands/</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <strong className="text-foreground">HT-007 Motion:</strong>
                        <span className="text-muted-foreground ml-2">Sophisticated motion system with accessibility support</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div>
                        <strong className="text-foreground">CSS Variables:</strong>
                        <span className="text-muted-foreground ml-2">Auto-generated via TokensProvider</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div>
                        <strong className="text-foreground">Theme Switching:</strong>
                        <span className="text-muted-foreground ml-2">Seamless light/dark transitions</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <div>
                        <strong className="text-foreground">Type Safety:</strong>
                        <span className="text-muted-foreground ml-2">Full TypeScript support</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* HT-007: Interactive Code Examples */}
              {showCode && (
                <MotionCard className="bg-muted/30 border border-border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground mb-3">Usage Examples</h4>
                  <pre className="text-xs text-muted-foreground font-mono overflow-x-auto">
{`// HT-007: Enhanced Token Usage
<div className="bg-primary text-primary-foreground p-token-md rounded-token-lg">
  Semantic colors with token spacing and radius
</div>

// Motion-enhanced components
<MotionCard className="hover:shadow-lg transition-all duration-300">
  <MotionText>Animated content</MotionText>
</MotionCard>`}
                  </pre>
                </MotionCard>
              )}
            </MotionCard>
          </MotionCard>
        </motion.div>
      </MotionPageWrapper>
    </MotionSystemProvider>
  )
}