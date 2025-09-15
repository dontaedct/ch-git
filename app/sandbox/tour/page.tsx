/**
 * @fileoverview HT-007 Developer Tour Page - Mono-Theme Enhancement
 * @module app/sandbox/tour/page
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: HT-007 Phase 7 - Playground & Tour Pages Upgrade
 * Purpose: Sophisticated interactive walkthrough with HT-007 mono-theme system
 * Safety: Sandbox-isolated tour environment
 * Status: HT-007 Phase 7 implementation - High-tech developer experience
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
import { 
  Play, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Palette,
  Layers,
  FileText,
  Settings,
  Eye,
  Code,
  Zap,
  Lightbulb,
  BookOpen,
  Target,
  Users,
  Clock,
  Sparkles,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Save,
  Share2,
  Maximize2,
  Minimize2,
  Star,
  Award,
  Rocket,
  Shield,
  Heart
} from 'lucide-react'

// HT-007: Enhanced Developer Tour with Mono-Theme System
export default function DeveloperTourPage() {
  // HT-007: Enhanced state management
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [tourSpeed, setTourSpeed] = useState<'slow' | 'normal' | 'fast'>('normal')
  const [showProgress, setShowProgress] = useState(true)
  const [mounted, setMounted] = useState(false)

  // HT-007: Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // HT-007: Auto-play functionality
  useEffect(() => {
    if (isAutoPlay && currentStep < tourSteps.length - 1) {
      const speedMap = { slow: 5000, normal: 3000, fast: 1500 }
      const timer = setTimeout(() => {
        handleNext()
      }, speedMap[tourSpeed])
      return () => clearTimeout(timer)
    }
  }, [currentStep, isAutoPlay, tourSpeed])

  const tourSteps = [
    {
      id: 'welcome',
      title: 'Welcome to HT-007',
      description: 'Sophisticated Mono-Theme Design System & High-Tech Architecture',
      icon: Rocket,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <motion.h3 
              className="text-2xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              🚀 Welcome to the HT-007 Design System
            </motion.h3>
            <motion.p 
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              This interactive tour will guide you through our sophisticated HT-007 mono-theme design system 
              and high-tech architecture. You'll learn how to use the mono-theme system, motion effects, 
              and advanced component showcases to build beautiful, consistent interfaces.
            </motion.p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center p-4 bg-card border border-border rounded-lg">
              <Palette className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-semibold">HT-007 Mono-Theme</h4>
              <p className="text-sm text-muted-foreground">Sophisticated grayscale design system</p>
            </div>
            <div className="text-center p-4 bg-card border border-border rounded-lg">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-semibold">Motion Effects</h4>
              <p className="text-sm text-muted-foreground">High-tech animations and transitions</p>
            </div>
            <div className="text-center p-4 bg-card border border-border rounded-lg">
              <Shield className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h4 className="font-semibold">Production Quality</h4>
              <p className="text-sm text-muted-foreground">Enterprise-grade UI/UX standards</p>
            </div>
          </motion.div>

          <motion.div 
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🎯 What You'll Learn with HT-007
            </h4>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• How to use HT-007 mono-theme for sophisticated designs</li>
              <li>• Building components with HT-007 motion effects</li>
              <li>• Creating pages with HT-007 high-tech aesthetics</li>
              <li>• Best practices for HT-007 accessibility and performance</li>
              <li>• Advanced HT-007 component showcases and interactions</li>
            </ul>
          </motion.div>
        </div>
      )
    },
    {
      id: 'tokens',
      title: 'Design Tokens',
      description: 'Understanding the DTCG token system',
      icon: Palette,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              🎨 Design Tokens Foundation
            </h3>
            <p className="text-lg text-muted-foreground">
              Our design system is built on DTCG-compliant tokens that provide consistent, 
              scalable design decisions across all components and brands.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Token Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <div>
                    <div className="font-medium">Colors</div>
                    <div className="text-sm text-muted-foreground">Brand, neutral, semantic colors</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <div>
                    <div className="font-medium">Typography</div>
                    <div className="text-sm text-muted-foreground">Font sizes, weights, line heights</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <div>
                    <div className="font-medium">Spacing</div>
                    <div className="text-sm text-muted-foreground">Consistent spacing scale</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <div>
                    <div className="font-medium">Shadows</div>
                    <div className="text-sm text-muted-foreground">Elevation and depth</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Brand System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Base Tokens</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Foundational design decisions in <code>/tokens/base.json</code>
                  </p>
                  <div className="bg-muted p-3 rounded text-sm font-mono">
                    {`{
  "colors": { "neutral-50": "#f9fafb" },
  "spacing": { "xs": "0.25rem" },
  "fontSize": { "sm": "0.875rem" }
}`}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Brand Overrides</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Brand-specific customizations in <code>/tokens/brands/</code>
                  </p>
                  <div className="bg-muted p-3 rounded text-sm font-mono">
                    {`{
  "colors": { "brand-primary": "#e91e63" },
  "fonts": { "heading": "Inter" }
}`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              💡 Pro Tip
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              Use the brand and theme toggles in the navigation to see how tokens adapt instantly 
              across different brands and light/dark modes. Try switching to the salon brand!
            </p>
          </div>

          <div className="text-center">
            <Button 
              variant="primary" 
              onClick={() => window.open('/sandbox/tokens', '_blank')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Tokens Live
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'components',
      title: 'UI Components',
      description: 'Token-driven components with CVA variants',
      icon: Layers,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              🧩 UI Components with CVA
            </h3>
            <p className="text-lg text-muted-foreground">
              Our components are built with Class Variance Authority (CVA) for type-safe, 
              token-driven styling with comprehensive variant systems.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Component Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Available Components</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Badge variant="soft" tone="brand">Button</Badge>
                    <Badge variant="soft" tone="brand">Input</Badge>
                    <Badge variant="soft" tone="brand">Card</Badge>
                    <Badge variant="soft" tone="brand">Badge</Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">CVA Variants</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Type-safe variant props</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Token-only styling</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Accessibility built-in</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Theme-aware colors</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Usage Example
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium">Button Component</h4>
                  <div className="bg-muted p-3 rounded text-sm font-mono">
                    {`<Button 
  variant="primary" 
  size="lg" 
  tone="brand"
  icon={<Download />}
>
  Download Now
</Button>`}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm">Primary</Button>
                    <Button variant="secondary" size="sm">Secondary</Button>
                    <Button variant="ghost" size="sm">Ghost</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🎯 Key Benefits
            </h4>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• <strong>Type Safety:</strong> TypeScript ensures correct variant usage</li>
              <li>• <strong>Token Integration:</strong> All styles come from design tokens</li>
              <li>• <strong>Accessibility:</strong> WCAG 2.1 AA compliance built-in</li>
              <li>• <strong>Consistency:</strong> Same API across all components</li>
            </ul>
          </div>

          <div className="text-center">
            <Button 
              variant="primary" 
              onClick={() => window.open('/sandbox/elements', '_blank')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Components Live
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'blocks',
      title: 'Content Blocks',
      description: 'JSON-driven page architecture',
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              📄 Content Blocks Architecture
            </h3>
            <p className="text-lg text-muted-foreground">
              Transform pages into JSON-driven block compositions with Zod validation, 
              error boundaries, and seamless content management.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Available Blocks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Hero</div>
                    <div className="text-xs text-muted-foreground">Compelling headers</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Features</div>
                    <div className="text-xs text-muted-foreground">Feature showcases</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Testimonials</div>
                    <div className="text-xs text-muted-foreground">Social proof</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Pricing</div>
                    <div className="text-xs text-muted-foreground">Pricing tables</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium text-sm">FAQ</div>
                    <div className="text-xs text-muted-foreground">Questions & answers</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium text-sm">CTA</div>
                    <div className="text-xs text-muted-foreground">Call-to-action</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Implementation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium">1. Define Page Content</h4>
                  <div className="bg-muted p-3 rounded text-sm font-mono">
                    {`const pageContent = {
  "blocks": [
    { "type": "hero", "content": {...} },
    { "type": "features", "content": {...} }
  ]
}`}
                  </div>
                  
                  <h4 className="font-medium">2. Render with BlocksRenderer</h4>
                  <div className="bg-muted p-3 rounded text-sm font-mono">
                    {`<BlocksRenderer 
  blocks={pageContent.blocks}
  fallback={<ErrorFallback />}
/>`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
              🚀 Game Changer
            </h4>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              Pages become JSON configuration files! Content creators can modify page layouts 
              without touching code, and developers get type safety with Zod validation.
            </p>
          </div>

          <div className="text-center">
            <Button 
              variant="primary" 
              onClick={() => window.open('/sandbox/blocks', '_blank')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Blocks Live
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      description: 'Guidelines for effective usage',
      icon: Lightbulb,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              💡 Best Practices & Guidelines
            </h3>
            <p className="text-lg text-muted-foreground">
              Follow these guidelines to get the most out of the HT-006 design system 
              and maintain consistency across your applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Token Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600 dark:text-green-400">✅ Do</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Use semantic color tokens (semantic-primary, semantic-success)</li>
                    <li>• Leverage spacing tokens for consistent layouts</li>
                    <li>• Use typography tokens for text hierarchy</li>
                    <li>• Test across all brand and theme combinations</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600 dark:text-red-400">❌ Don't</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Use hardcoded colors or spacing values</li>
                    <li>• Create custom variants without token support</li>
                    <li>• Mix token systems inconsistently</li>
                    <li>• Ignore accessibility requirements</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Component Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600 dark:text-green-400">✅ Do</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Use CVA variants for component customization</li>
                    <li>• Provide proper accessibility attributes</li>
                    <li>• Test keyboard navigation and screen readers</li>
                    <li>• Use semantic HTML elements</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600 dark:text-red-400">❌ Don't</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Override component styles with custom CSS</li>
                    <li>• Skip accessibility testing</li>
                    <li>• Use components outside their intended purpose</li>
                    <li>• Ignore loading and error states</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Block Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600 dark:text-green-400">✅ Do</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Validate content with Zod schemas</li>
                    <li>• Provide meaningful fallbacks</li>
                    <li>• Keep blocks focused and reusable</li>
                    <li>• Document block APIs clearly</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600 dark:text-red-400">❌ Don't</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Skip schema validation</li>
                    <li>• Create overly complex blocks</li>
                    <li>• Mix content and styling concerns</li>
                    <li>• Ignore error boundaries</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Accessibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600 dark:text-green-400">✅ Do</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Test with keyboard navigation</li>
                    <li>• Verify screen reader compatibility</li>
                    <li>• Maintain WCAG 2.1 AA compliance</li>
                    <li>• Use semantic HTML elements</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600 dark:text-red-400">❌ Don't</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Rely only on color for information</li>
                    <li>• Skip focus management</li>
                    <li>• Ignore contrast requirements</li>
                    <li>• Use non-semantic elements</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'next-steps',
      title: 'Next Steps',
      description: 'Continue your design system journey',
      icon: Target,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              🎯 What's Next?
            </h3>
            <p className="text-lg text-muted-foreground">
              You've completed the HT-006 developer tour! Here's how to continue 
              your journey with the design system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Phase 6 Deliverables</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Comprehensive documentation hub</li>
                    <li>• Implementation guides</li>
                    <li>• Migration strategies</li>
                    <li>• Best practices documentation</li>
                  </ul>
                </div>
                <Button variant="outline" className="w-full">
                  <a href="/docs" className="flex items-center gap-2">
                    View Documentation
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Get Involved</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Contribute to the design system</li>
                    <li>• Report issues and suggestions</li>
                    <li>• Share your implementations</li>
                    <li>• Help improve documentation</li>
                  </ul>
                </div>
                <Button variant="outline" className="w-full">
                  <a href="/docs/contributing" className="flex items-center gap-2">
                    Contribute
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="text-center">
              <h4 className="text-xl font-bold text-foreground mb-2">
                🚀 Ready to Build?
              </h4>
              <p className="text-muted-foreground mb-4">
                You now have everything you need to start building with the HT-006 design system. 
                Remember to follow the best practices and always test across different brands and themes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="primary" size="lg">
                  <a href="/sandbox" className="flex items-center gap-2">
                    Start Building
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
                <Button variant="outline" size="lg">
                  <a href="/docs" className="flex items-center gap-2">
                    Read Documentation
                    <BookOpen className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Tour Completed!</span>
            </div>
          </div>
        </div>
      )
    }
  ]

  // HT-007: Animation variants for motion effects
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeOut" }
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const scaleIn = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.2, ease: "easeOut" }
  }

  const slideIn = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: "easeOut" }
  }

  if (!mounted) {
    return <div className="min-h-screen bg-background" />
  }

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep])
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const currentStepData = tourSteps[currentStep]

  return (
    <div className="min-h-screen bg-background">
      {/* HT-007: Enhanced Header with Motion Effects */}
      <motion.div 
        className="border-b border-border bg-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                className="text-3xl font-bold text-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                HT-007 Developer Tour
              </motion.h1>
              <motion.p 
                className="text-lg text-muted-foreground mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Interactive walkthrough of the HT-007 mono-theme design system
              </motion.p>
              <div className="flex items-center gap-2 mt-3">
                <span className="mono-badge mono-badge-primary">HT-007 ✅</span>
                <span className="mono-text-xs mono-text-secondary">Mono-theme active</span>
              </div>
            </div>
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant={isAutoPlay ? 'primary' : 'outline'}
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                icon={<Play className="w-4 h-4" />}
              >
                {isAutoPlay ? 'Stop Auto' : 'Auto Play'}
              </Button>
              <Badge variant="soft" tone="brand">
                Step {currentStep + 1} of {tourSteps.length}
              </Badge>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          {/* HT-007: Enhanced Step Navigation */}
          <motion.div 
            className="lg:col-span-1"
            variants={fadeInUp}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  HT-007 Tour Steps
                </CardTitle>
                <CardDescription>
                  Navigate through the HT-007 mono-theme tour steps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <AnimatePresence>
                  {tourSteps.map((step, index) => (
                    <motion.button
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleStepClick(index)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        currentStep === index
                          ? 'border-primary bg-primary/5 text-primary'
                          : completedSteps.includes(index)
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {completedSteps.includes(index) ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <step.icon className="w-4 h-4" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{step.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {step.description}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* HT-007: Enhanced Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    HT-007 Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Completed</span>
                      <span>{completedSteps.length + (currentStep === tourSteps.length - 1 ? 1 : 0)}/{tourSteps.length}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <motion.div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${((completedSteps.length + (currentStep === tourSteps.length - 1 ? 1 : 0)) / tourSteps.length) * 100}%` 
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(((completedSteps.length + (currentStep === tourSteps.length - 1 ? 1 : 0)) / tourSteps.length) * 100)}% Complete
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* HT-007: Tour Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    HT-007 Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium mb-2">Auto Play Speed</div>
                    <div className="flex gap-2">
                      <Button
                        variant={tourSpeed === 'slow' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setTourSpeed('slow')}
                      >
                        Slow
                      </Button>
                      <Button
                        variant={tourSpeed === 'normal' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setTourSpeed('normal')}
                      >
                        Normal
                      </Button>
                      <Button
                        variant={tourSpeed === 'fast' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setTourSpeed('fast')}
                      >
                        Fast
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium mb-2">Display Options</div>
                    <div className="flex gap-2">
                      <Button
                        variant={showProgress ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setShowProgress(!showProgress)}
                        icon={<Eye className="w-4 h-4" />}
                      >
                        Progress
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* HT-007: Enhanced Step Content */}
          <motion.div 
            className="lg:col-span-3"
            variants={fadeInUp}
          >
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <currentStepData.icon className="w-6 h-6 text-primary" />
                      </motion.div>
                      <div>
                        <CardTitle>{currentStepData.title}</CardTitle>
                        <CardDescription>{currentStepData.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Step {currentStep + 1}
                      </Badge>
                      <Badge variant="soft" tone="brand">
                        HT-007
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {currentStepData.content}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* HT-007: Enhanced Navigation */}
            <motion.div 
              className="flex items-center justify-between mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {tourSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStep
                        ? 'bg-primary'
                        : completedSteps.includes(index)
                        ? 'bg-green-500'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="primary"
                onClick={handleNext}
                disabled={currentStep === tourSteps.length - 1}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {currentStep === tourSteps.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
