/**
 * @fileoverview HT-006 Sandbox Search Page
 * @module app/sandbox/search/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-006 Phase 6 - Developer Experience Enhancement
 * Purpose: Comprehensive search and filtering across all sandbox content
 * Safety: Sandbox-isolated search environment
 * Status: Phase 6 implementation - Enhanced developer experience
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Input
} from '../../../components-sandbox/ui'
import { 
  Search, 
  Filter, 
  Code, 
  Palette,
  Layers,
  FileText,
  Settings,
  Eye,
  ArrowRight,
  CheckCircle,
  Clock,
  Tag,
  Zap
} from 'lucide-react'

export default function SandboxSearchPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')

  // Initialize search query from URL params
  useEffect(() => {
    if (searchParams) {
      const query = searchParams.get('q') || ''
      setSearchQuery(query)
    }
  }, [searchParams])

  // Mock data - in a real implementation, this would come from the actual sandbox content
  const searchableContent = [
    // Tokens
    {
      id: 'token-colors',
      title: 'Color Tokens',
      description: 'DTCG-compliant color token system with brand overrides',
      category: 'tokens',
      type: 'documentation',
      tags: ['colors', 'brand', 'theme', 'css-variables'],
      content: 'Design tokens for colors including brand, neutral, semantic colors with CSS variable integration',
      href: '/sandbox/tokens',
      icon: Palette
    },
    {
      id: 'token-spacing',
      title: 'Spacing Tokens',
      description: 'Consistent spacing scale for layouts and components',
      category: 'tokens',
      type: 'documentation',
      tags: ['spacing', 'layout', 'margin', 'padding'],
      content: 'Spacing tokens from xs to 4xl with section-specific spacing values',
      href: '/sandbox/tokens',
      icon: Palette
    },
    {
      id: 'token-typography',
      title: 'Typography Tokens',
      description: 'Font sizes, weights, and line heights for consistent text styling',
      category: 'tokens',
      type: 'documentation',
      tags: ['typography', 'fonts', 'text', 'sizing'],
      content: 'Typography tokens including font sizes, weights, and line heights',
      href: '/sandbox/tokens',
      icon: Palette
    },

    // Components
    {
      id: 'component-button',
      title: 'Button Component',
      description: 'Interactive button with CVA variants and accessibility features',
      category: 'components',
      type: 'component',
      tags: ['button', 'interactive', 'cva', 'variants', 'accessibility'],
      content: 'Button component with primary, secondary, ghost, link, and destructive variants',
      href: '/sandbox/elements',
      icon: Layers
    },
    {
      id: 'component-input',
      title: 'Input Component',
      description: 'Form input with validation states and accessibility support',
      category: 'components',
      type: 'component',
      tags: ['input', 'form', 'validation', 'accessibility'],
      content: 'Input component with outline and filled variants, validation states',
      href: '/sandbox/elements',
      icon: Layers
    },
    {
      id: 'component-card',
      title: 'Card Component',
      description: 'Container component with elevation and padding variants',
      category: 'components',
      type: 'component',
      tags: ['card', 'container', 'elevation', 'layout'],
      content: 'Card component with default, outlined, and filled variants',
      href: '/sandbox/elements',
      icon: Layers
    },
    {
      id: 'component-badge',
      title: 'Badge Component',
      description: 'Status indicator with semantic tones and variants',
      category: 'components',
      type: 'component',
      tags: ['badge', 'status', 'indicator', 'semantic'],
      content: 'Badge component with solid, soft, and outline variants',
      href: '/sandbox/elements',
      icon: Layers
    },

    // Blocks
    {
      id: 'block-hero',
      title: 'Hero Block',
      description: 'Compelling hero sections with CTAs and background options',
      category: 'blocks',
      type: 'block',
      tags: ['hero', 'cta', 'background', 'layout'],
      content: 'Hero block with multiple layouts, background styles, and CTA integration',
      href: '/sandbox/blocks',
      icon: FileText
    },
    {
      id: 'block-features',
      title: 'Features Block',
      description: 'Feature showcase with icons, descriptions, and grid layouts',
      category: 'blocks',
      type: 'block',
      tags: ['features', 'grid', 'icons', 'showcase'],
      content: 'Features block with responsive grid layouts and icon support',
      href: '/sandbox/blocks',
      icon: FileText
    },
    {
      id: 'block-testimonials',
      title: 'Testimonials Block',
      description: 'Customer testimonials with avatars and carousel support',
      category: 'blocks',
      type: 'block',
      tags: ['testimonials', 'carousel', 'social-proof', 'avatars'],
      content: 'Testimonials block with carousel functionality and avatar integration',
      href: '/sandbox/blocks',
      icon: FileText
    },
    {
      id: 'block-pricing',
      title: 'Pricing Block',
      description: 'Pricing tables with tiers, features, and CTA buttons',
      category: 'blocks',
      type: 'block',
      tags: ['pricing', 'tables', 'tiers', 'commerce'],
      content: 'Pricing block with tier comparison and feature lists',
      href: '/sandbox/blocks',
      icon: FileText
    },

    // Tools
    {
      id: 'tool-token-editor',
      title: 'Token Editor',
      description: 'Real-time token editing with live preview capabilities',
      category: 'tools',
      type: 'tool',
      tags: ['editor', 'tokens', 'preview', 'real-time'],
      content: 'Interactive token editor with live preview and export capabilities',
      href: '/sandbox/token-editor',
      icon: Settings
    },
    {
      id: 'tool-playground',
      title: 'Component Playground',
      description: 'Interactive component builder with code generation',
      category: 'tools',
      type: 'tool',
      tags: ['playground', 'builder', 'code-generation', 'interactive'],
      content: 'Component playground with prop configuration and code generation',
      href: '/sandbox/playground',
      icon: Settings
    },
    {
      id: 'tool-tour',
      title: 'Developer Tour',
      description: 'Interactive walkthrough of the design system',
      category: 'tools',
      type: 'tool',
      tags: ['tour', 'walkthrough', 'guide', 'onboarding'],
      content: 'Guided tour through the design system with interactive demos',
      href: '/sandbox/tour',
      icon: Eye
    },

    // Documentation
    {
      id: 'doc-best-practices',
      title: 'Best Practices',
      description: 'Guidelines for effective design system usage',
      category: 'documentation',
      type: 'documentation',
      tags: ['best-practices', 'guidelines', 'usage', 'standards'],
      content: 'Comprehensive best practices for tokens, components, and blocks',
      href: '/sandbox/tour',
      icon: Code
    },
    {
      id: 'doc-accessibility',
      title: 'Accessibility Guide',
      description: 'WCAG 2.1 AA compliance guidelines and testing',
      category: 'documentation',
      type: 'documentation',
      tags: ['accessibility', 'wcag', 'a11y', 'compliance'],
      content: 'Accessibility guidelines and testing procedures for all components',
      href: '/sandbox/tour',
      icon: Code
    }
  ]

  const categories = [
    { id: 'all', label: 'All', count: searchableContent.length },
    { id: 'tokens', label: 'Tokens', count: searchableContent.filter(item => item.category === 'tokens').length },
    { id: 'components', label: 'Components', count: searchableContent.filter(item => item.category === 'components').length },
    { id: 'blocks', label: 'Blocks', count: searchableContent.filter(item => item.category === 'blocks').length },
    { id: 'tools', label: 'Tools', count: searchableContent.filter(item => item.category === 'tools').length },
    { id: 'documentation', label: 'Documentation', count: searchableContent.filter(item => item.category === 'documentation').length }
  ]

  const types = [
    { id: 'all', label: 'All Types' },
    { id: 'component', label: 'Components' },
    { id: 'block', label: 'Blocks' },
    { id: 'tool', label: 'Tools' },
    { id: 'documentation', label: 'Documentation' }
  ]

  const filteredResults = useMemo(() => {
    let results = searchableContent

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(item => item.category === selectedCategory)
    }

    // Filter by type
    if (selectedType !== 'all') {
      results = results.filter(item => item.type === selectedType)
    }

    return results
  }, [searchQuery, selectedCategory, selectedType])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedType('all')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'component': return Layers
      case 'block': return FileText
      case 'tool': return Settings
      case 'documentation': return Code
      default: return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'component': return 'blue'
      case 'block': return 'purple'
      case 'tool': return 'green'
      case 'documentation': return 'orange'
      default: return 'gray'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Search & Filter
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Find components, blocks, tools, and documentation
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="soft" tone="brand">
                {filteredResults.length} results
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Search & Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search
                </CardTitle>
                <CardDescription>
                  Find what you're looking for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search components, blocks, tools..."
                  icon={<Search className="w-4 h-4" />}
                />

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left p-2 rounded-lg border transition-all ${
                          selectedCategory === category.id
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{category.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {category.count}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Types</h4>
                  <div className="space-y-2">
                    {types.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`w-full text-left p-2 rounded-lg border transition-all ${
                          selectedType === type.id
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <span className="text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {(searchQuery || selectedCategory !== 'all' || selectedType !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/sandbox/tour">
                    <Eye className="w-4 h-4 mr-2" />
                    Start Developer Tour
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/sandbox/playground">
                    <Settings className="w-4 h-4 mr-2" />
                    Component Playground
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/sandbox/token-editor">
                    <Palette className="w-4 h-4 mr-2" />
                    Token Editor
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            {filteredResults.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No results found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredResults.map((item) => {
                  const TypeIcon = getTypeIcon(item.type)
                  const typeColor = getTypeColor(item.type)
                  
                  return (
                    <Card key={item.id} className="group hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-lg bg-${typeColor}-100 dark:bg-${typeColor}-900/20 flex items-center justify-center`}>
                              <item.icon className={`w-5 h-5 text-${typeColor}-600 dark:text-${typeColor}-400`} />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                {item.title}
                              </h3>
                              <Badge variant="soft" tone={typeColor as any}>
                                <TypeIcon className="w-3 h-3 mr-1" />
                                {item.type}
                              </Badge>
                            </div>
                            
                            <p className="text-muted-foreground mb-3">
                              {item.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-1 mb-3">
                              {item.tags.slice(0, 4).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  <Tag className="w-2 h-2 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                              {item.tags.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.tags.length - 4} more
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-muted-foreground">
                                {item.content}
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                <a href={item.href} className="flex items-center gap-1">
                                  View
                                  <ArrowRight className="w-3 h-3" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Search Tips */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Tips
              </CardTitle>
              <CardDescription>
                Get the most out of the search functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Search by Content</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Component names (e.g., "button", "input")</li>
                    <li>• Block types (e.g., "hero", "pricing")</li>
                    <li>• Tool names (e.g., "playground", "editor")</li>
                    <li>• Feature descriptions (e.g., "accessibility", "validation")</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Filter Options</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Use category filters to narrow results</li>
                    <li>• Filter by type (component, block, tool)</li>
                    <li>• Combine multiple filters for precise results</li>
                    <li>• Clear filters to see all content</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
