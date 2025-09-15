/**
 * @fileoverview HT-022 Blocks Page - Component System & UI Library
 * @module app/sandbox/blocks/page
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: HT-022 Phase 1 - Component System & UI Library
 * Purpose: Sophisticated block showcase with HT-022 component system
 * Safety: Sandbox-isolated block demonstration environment
 * Status: HT-022 Phase 1 implementation - Interactive block demonstrations
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { BlocksRenderer } from '@/components-sandbox/BlocksRenderer'
import { 
  FileText, 
  Eye, 
  Code, 
  Copy, 
  Play, 
  Settings,
  Layers,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Zap,
  Search,
  Filter,
  Download,
  Sparkles,
  Grid3X3,
  List,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'

// Import block demos
import heroDemo from '@/blocks-sandbox/Hero/demo.json'
import featuresDemo from '@/blocks-sandbox/Features/demo.json'
import testimonialsDemo from '@/blocks-sandbox/Testimonials/demo.json'
import { BlockContent } from '@/blocks-sandbox/registry'
import pricingDemo from '@/blocks-sandbox/Pricing/demo.json'
import faqDemo from '@/blocks-sandbox/FAQ/demo.json'
import ctaDemo from '@/blocks-sandbox/CTA/demo.json'

// HT-007: Enhanced Blocks Page Component
export default function BlocksPage() {
  // HT-007: Interactive state management
  const [selectedBlock, setSelectedBlock] = useState('hero')
  const [showCode, setShowCode] = useState(false)
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  // HT-007: Prevent hydration mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // HT-007: Block categories with enhanced organization
  const categories = [
    { id: 'all', name: 'All Blocks', icon: Grid3X3 },
    { id: 'Layout', name: 'Layout', icon: Layers },
    { id: 'Content', name: 'Content', icon: FileText },
    { id: 'Social Proof', name: 'Social Proof', icon: Eye },
    { id: 'Commerce', name: 'Commerce', icon: Settings },
    { id: 'Support', name: 'Support', icon: Code },
    { id: 'Conversion', name: 'Conversion', icon: ArrowRight }
  ]

  // HT-007: Enhanced blocks data with sophisticated metadata
  const blocks = [
    {
      id: 'hero',
      name: 'Hero',
      description: 'Compelling hero sections with CTAs and background options',
      icon: FileText,
      demo: heroDemo as BlockContent,
      features: ['Multiple layouts', 'Background options', 'CTA integration', 'Responsive design'],
      category: 'Layout',
      complexity: 'Advanced',
      popularity: 95,
      lastUpdated: '2025-01-15',
      tags: ['hero', 'cta', 'layout', 'responsive']
    },
    {
      id: 'features',
      name: 'Features',
      description: 'Feature showcase with icons, descriptions, and grid layouts',
      icon: Layers,
      demo: featuresDemo as BlockContent,
      features: ['Grid layouts', 'Icon support', 'Flexible content', 'Responsive columns'],
      category: 'Content',
      complexity: 'Intermediate',
      popularity: 88,
      lastUpdated: '2025-01-15',
      tags: ['features', 'grid', 'icons', 'content']
    },
    {
      id: 'testimonials',
      name: 'Testimonials',
      description: 'Customer testimonials with avatars and carousel support',
      icon: Eye,
      demo: testimonialsDemo as BlockContent,
      features: ['Carousel support', 'Avatar integration', 'Rating display', 'Multiple layouts'],
      category: 'Social Proof',
      complexity: 'Intermediate',
      popularity: 82,
      lastUpdated: '2025-01-15',
      tags: ['testimonials', 'carousel', 'social', 'ratings']
    },
    {
      id: 'pricing',
      name: 'Pricing',
      description: 'Pricing tables with tiers, features, and CTA buttons',
      icon: Settings,
      demo: pricingDemo as unknown as BlockContent,
      features: ['Tier comparison', 'Feature lists', 'CTA integration', 'Highlighted plans'],
      category: 'Commerce',
      complexity: 'Advanced',
      popularity: 91,
      lastUpdated: '2025-01-15',
      tags: ['pricing', 'commerce', 'tiers', 'comparison']
    },
    {
      id: 'faq',
      name: 'FAQ',
      description: 'Frequently asked questions with accordion functionality',
      icon: Code,
      demo: faqDemo as unknown as BlockContent,
      features: ['Accordion UI', 'Search functionality', 'Category grouping', 'Accessibility'],
      category: 'Support',
      complexity: 'Beginner',
      popularity: 76,
      lastUpdated: '2025-01-15',
      tags: ['faq', 'accordion', 'support', 'search']
    },
    {
      id: 'cta',
      name: 'CTA',
      description: 'Call-to-action sections with conversion optimization',
      icon: ArrowRight,
      demo: ctaDemo as unknown as BlockContent,
      features: ['Conversion focus', 'Multiple styles', 'Button variants', 'Urgency elements'],
      category: 'Conversion',
      complexity: 'Beginner',
      popularity: 94,
      lastUpdated: '2025-01-15',
      tags: ['cta', 'conversion', 'buttons', 'urgency']
    }
  ]

  // HT-007: Enhanced filtering and search functionality
  const filteredBlocks = blocks.filter(block => {
    const matchesSearch = block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         block.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         block.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || block.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const currentBlock = filteredBlocks.find(block => block.id === selectedBlock)

  // HT-007: Enhanced utility functions
  const copyToClipboard = async (content: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedBlock(blockId)
      setTimeout(() => setCopiedBlock(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const exportBlock = (block: typeof blocks[0]) => {
    const dataStr = JSON.stringify(block.demo, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${block.name.toLowerCase()}-block.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Beginner': return 'text-green-600 bg-green-50'
      case 'Intermediate': return 'text-yellow-600 bg-yellow-50'
      case 'Advanced': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getDevicePreviewClass = () => {
    switch (devicePreview) {
      case 'mobile': return 'max-w-sm mx-auto'
      case 'tablet': return 'max-w-2xl mx-auto'
      case 'desktop': return 'w-full'
      default: return 'w-full'
    }
  }

  // HT-007: Animation variants for motion effects
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }


  if (!mounted) return null

  return (
    <div className="min-h-screen mono-bg-primary">
      {/* HT-007: Enhanced Header with Motion Effects */}
      <motion.div 
        className="mono-glass-strong border-b mono-border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                className="mono-text-4xl font-bold mono-text-primary flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Sparkles className="w-8 h-8 text-primary" />
                HT-022 Blocks Showcase
              </motion.h1>
              <motion.p 
                className="mono-text-lg mono-text-secondary mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Sophisticated block demonstrations with HT-022 component system, 
                interactive previews, and advanced configuration tools
              </motion.p>
            </div>
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant={showCode ? 'primary' : 'ghost'}
                  onClick={() => setShowCode(!showCode)}
                  className="high-tech-button"
                >
                  <Code className="w-4 h-4 mr-2" />
                  {showCode ? 'Hide Code' : 'Show Code'}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* HT-007: Current State with Enhanced Visuals */}
        <motion.div 
          className="mb-8 mono-surface-elevated mono-spacing-lg mono-radius-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="mono-badge mono-badge-primary">HT-007 ✅</span>
                <span className="mono-text-sm mono-text-secondary">
                  {filteredBlocks.length} blocks available
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="mono-text-xs mono-text-secondary">Motion:</span>
                <span className="mono-badge mono-badge-outline">Active</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="mono-text-xs mono-text-secondary">HT-007 motion effects active</p>
            </div>
          </div>
        </motion.div>

        {/* HT-007: Interactive Search and Filter Controls */}
        <motion.div 
          className="mb-8 mono-surface mono-spacing-lg mono-radius-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 mono-text-secondary" />
              <Input
                placeholder="Search blocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 mono-input"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 mono-text-secondary" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 mono-input appearance-none"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                onClick={() => setViewMode('grid')}
                size="sm"
                className="high-tech-button"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                onClick={() => setViewMode('list')}
                size="sm"
                className="high-tech-button"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Device Preview Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={devicePreview === 'desktop' ? 'primary' : 'ghost'}
                onClick={() => setDevicePreview('desktop')}
                size="sm"
                className="high-tech-button"
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={devicePreview === 'tablet' ? 'primary' : 'ghost'}
                onClick={() => setDevicePreview('tablet')}
                size="sm"
                className="high-tech-button"
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={devicePreview === 'mobile' ? 'primary' : 'ghost'}
                onClick={() => setDevicePreview('mobile')}
                size="sm"
                className="high-tech-button"
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* HT-007: Enhanced Block Selector */}
          <div className="lg:col-span-1">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="mono-card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 mono-text-primary">
                    <Layers className="w-5 h-5" />
                    Available Blocks
                  </CardTitle>
                  <CardDescription className="mono-text-secondary">
                    Select a block to view its demo and configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <AnimatePresence>
                    {filteredBlocks.map((block) => (
                      <motion.button
                        key={block.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedBlock(block.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all high-tech-hover ${
                          selectedBlock === block.id
                            ? 'mono-border-strong mono-bg-accent mono-text-accent-foreground'
                            : 'mono-border hover:mono-border-strong hover:mono-bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <block.icon className="w-4 h-4" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm mono-text-primary">{block.name}</div>
                            <div className="text-xs mono-text-secondary truncate">
                              {block.description}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getComplexityColor(block.complexity)}`}
                              >
                                {block.complexity}
                              </Badge>
                              <span className="text-xs mono-text-secondary">
                                {block.popularity}% popular
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* HT-007: Enhanced Block Info */}
              {currentBlock && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="mt-6 mono-card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 mono-text-primary">
                        <currentBlock.icon className="w-5 h-5" />
                        {currentBlock.name} Block
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2 mono-text-primary">Features</h4>
                        <ul className="space-y-1">
                          {currentBlock.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm mono-text-secondary">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2 mono-text-primary">Complexity</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getComplexityColor(currentBlock.complexity)}`}>
                            {currentBlock.complexity}
                          </Badge>
                          <span className="text-xs mono-text-secondary">
                            {currentBlock.popularity}% popular
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2 mono-text-primary">Schema Validation</h4>
                        <div className="flex items-center gap-2 text-sm mono-text-secondary">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          Zod schema validation enabled
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2 mono-text-primary">Accessibility</h4>
                        <div className="flex items-center gap-2 text-sm mono-text-secondary">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          WCAG 2.1 AA compliant
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2 mono-text-primary">Actions</h4>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportBlock(currentBlock)}
                            className="high-tech-button"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Export
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(currentBlock.demo, null, 2), currentBlock.id)}
                            className="high-tech-button"
                          >
                            {copiedBlock === currentBlock.id ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <Copy className="w-3 h-3 mr-1" />
                            )}
                            {copiedBlock === currentBlock.id ? 'Copied!' : 'Copy JSON'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* HT-007: Enhanced Block Demo */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {currentBlock && (
                <motion.div 
                  key={currentBlock.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* HT-007: Enhanced Block Header */}
                  <Card className="mono-card-elevated">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 mono-text-primary">
                            <currentBlock.icon className="w-5 h-5" />
                            {currentBlock.name} Block Demo
                          </CardTitle>
                          <CardDescription className="mono-text-secondary">
                            Live demonstration of the {currentBlock.name.toLowerCase()} block
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(currentBlock.demo, null, 2), currentBlock.id)}
                            className="high-tech-button"
                          >
                            {copiedBlock === currentBlock.id ? (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            ) : (
                              <Copy className="w-4 h-4 mr-1" />
                            )}
                            {copiedBlock === currentBlock.id ? 'Copied!' : 'Copy JSON'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* HT-007: Enhanced Live Demo with Device Preview */}
                  <Card className="mono-card-elevated">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 mono-text-primary">
                            <Play className="w-5 h-5" />
                            Live Preview
                          </CardTitle>
                          <CardDescription className="mono-text-secondary">
                            Real-time rendering with {devicePreview} viewport
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="mono-text-xs mono-text-secondary">
                            Device: {devicePreview}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className={`border mono-border rounded-lg overflow-hidden ${getDevicePreviewClass()}`}>
                        <BlocksRenderer 
                          blocks={[currentBlock.demo]}
                          className="block-demo"
                          fallback={
                            <div className="p-8 text-center mono-text-secondary">
                              <AlertCircle className="w-8 h-8 mx-auto mb-4" />
                              <p>Failed to render block</p>
                            </div>
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* HT-007: Enhanced Code View */}
                  {showCode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="mono-card-elevated">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 mono-text-primary">
                            <Code className="w-5 h-5" />
                            Block Configuration
                          </CardTitle>
                          <CardDescription className="mono-text-secondary">
                            JSON configuration used to render this block
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="relative">
                            <pre className="mono-bg-muted mono-spacing-md rounded-lg overflow-x-auto text-sm mono-text-primary">
                              <code>{JSON.stringify(currentBlock.demo, null, 2)}</code>
                            </pre>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 high-tech-button"
                              onClick={() => copyToClipboard(JSON.stringify(currentBlock.demo, null, 2), `${currentBlock.id}-code`)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* HT-007: Enhanced Implementation Guide */}
                  <Card className="mono-card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 mono-text-primary">
                        <Zap className="w-5 h-5" />
                        Implementation Guide
                      </CardTitle>
                      <CardDescription className="mono-text-secondary">
                        How to use this block in your pages
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="font-medium mono-text-primary">1. Import the BlocksRenderer</h4>
                        <pre className="mono-bg-muted mono-spacing-sm rounded text-sm mono-text-primary">
                          <code>{`import { BlocksRenderer } from '@/components-sandbox/BlocksRenderer'`}</code>
                        </pre>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium mono-text-primary">2. Define your block configuration</h4>
                        <pre className="mono-bg-muted mono-spacing-sm rounded text-sm mono-text-primary">
                          <code>{`const blocks = [${JSON.stringify(currentBlock.demo, null, 2)}]`}</code>
                        </pre>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium mono-text-primary">3. Render the blocks</h4>
                        <pre className="mono-bg-muted mono-spacing-sm rounded text-sm mono-text-primary">
                          <code>{`<BlocksRenderer blocks={blocks} />`}</code>
                        </pre>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium mono-text-primary">4. HT-007 Integration</h4>
                        <pre className="mono-bg-muted mono-spacing-sm rounded text-sm mono-text-primary">
                          <code>{`// Apply HT-007 mono-theme classes
<div className="mono-surface-elevated mono-spacing-lg">
  <BlocksRenderer blocks={blocks} className="mono-card" />
</div>`}</code>
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* HT-007: Enhanced Full Page Demos */}
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="mono-card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 mono-text-primary">
                <FileText className="w-5 h-5" />
                Complete Page Demos
              </CardTitle>
              <CardDescription className="mono-text-secondary">
                See how blocks work together in complete page compositions with HT-007 styling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  className="space-y-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <h4 className="font-medium mono-text-primary">Home Page Demo</h4>
                  <p className="text-sm mono-text-secondary">
                    Complete home page using Hero, Features, Testimonials, and CTA blocks with HT-007 mono-theme
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full high-tech-button"
                    onClick={() => window.open('/sandbox/home', '_blank')}
                  >
                    <a href="/sandbox/home" className="flex items-center gap-2">
                      View Home Demo
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                </motion.div>
                
                <motion.div 
                  className="space-y-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <h4 className="font-medium mono-text-primary">Questionnaire Demo</h4>
                  <p className="text-sm mono-text-secondary">
                    Questionnaire page with intro blocks and form integration using HT-007 design system
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full high-tech-button"
                    onClick={() => window.open('/sandbox/questionnaire', '_blank')}
                  >
                    <a href="/sandbox/questionnaire" className="flex items-center gap-2">
                      View Questionnaire Demo
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
