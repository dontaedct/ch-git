"use client";

/**
 * @fileoverview HT-007 Sandbox Home Page - Mono-Theme Makeover
 * @module app/sandbox/page
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: HT-007 Phase 3 - Sandbox Home Page Makeover
 * Purpose: Sophisticated mono-theme sandbox environment with high-tech motion effects
 * Safety: Sandbox-isolated with clear development boundaries
 * Status: HT-007 Phase 3 implementation
 */

import Link from 'next/link'
import { Badge } from '../../components-sandbox/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components-sandbox/ui'
import { 
  Palette, 
  Layers, 
  FileText, 
  Settings, 
  Eye, 
  Wrench,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  Zap,
  Code,
  Play,
  Monitor,
  Smartphone,
  Globe,
  Shield,
  Rocket
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

/**
 * HT-007 Sandbox Home Page - Mono-Theme Makeover
 * 
 * Sophisticated mono-theme sandbox environment featuring:
 * - High-tech motion effects and animations
 * - Production-quality layouts inspired by home page patterns
 * - Advanced component showcases with interactive demonstrations
 * - Sophisticated typography and visual hierarchy
 * - Enhanced accessibility and responsive design
 * - Seamless integration with HT-006 token system
 */
export default function SandboxHomePage() {
  const [currentDemo, setCurrentDemo] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Auto-rotate demos every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % 3)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 via-transparent to-gray-200/50 dark:from-gray-800/50 dark:via-transparent dark:to-gray-700/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%)]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center"
          >
            {/* HT-007 Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <Badge className="high-tech-badge mono-theme-badge px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                <Sparkles className="w-4 h-4 mr-2" />
                HT-007 Mono-Theme System
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-6 leading-none tracking-tight text-gray-900 dark:text-gray-100"
            >
              <span className="inline-block mono-theme-text-gradient">
                Design System
              </span>
              <br />
              <span className="text-gray-600 dark:text-gray-400 font-mono text-4xl sm:text-5xl lg:text-6xl">
                Sandbox
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl sm:text-2xl max-w-4xl mx-auto leading-relaxed text-gray-700 dark:text-gray-300 mb-12"
            >
              Sophisticated mono-theme environment showcasing the full potential of our 
              <span className="font-semibold text-gray-900 dark:text-gray-100"> high-tech design system</span> 
              with motion effects, production-quality layouts, and interactive demonstrations.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="high-tech-button mono-theme-button px-8 py-4 text-lg font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-black rounded-lg"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Explore System
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="high-tech-button mono-theme-button-border px-8 py-4 text-lg font-medium border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                View Demos
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Live System Demos
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Interactive demonstrations showcasing the mono-theme system capabilities
            </p>
          </motion.div>

          {/* Demo Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="relative"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {demoCards.map((demo, index) => (
                <motion.div
                  key={demo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group"
                >
                  <Card className="mono-theme-card h-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 via-transparent to-gray-200/50 dark:from-gray-800/50 dark:via-transparent dark:to-gray-700/50 group-hover:from-gray-200/70 group-hover:to-gray-300/70 dark:group-hover:from-gray-700/70 dark:group-hover:to-gray-600/70 transition-all duration-300" />
                    
                    <CardHeader className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <demo.icon className="w-6 h-6 text-white dark:text-gray-900" />
                        </div>
                        <Badge className="mono-theme-badge">
                          {demo.status === 'live' ? <Zap className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                          {demo.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                        {demo.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {demo.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="relative z-10">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          {demo.stats.map((stat, statIndex) => (
                            <div key={statIndex} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="space-y-2">
                          {demo.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {feature}
                            </div>
                          ))}
                        </div>
                        
                        <Link 
                          href={demo.href}
                          className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 transition-colors group-hover:gap-3 transition-all"
                        >
                          {demo.action}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* System Features Section */}
      <section className="py-16 bg-gray-100/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              System Capabilities
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive design system features with production-quality implementations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {systemFeatures.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className="mono-theme-card h-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-gray-100/50 dark:from-gray-900/50 dark:via-transparent dark:to-gray-800/50 group-hover:from-gray-100/70 group-hover:to-gray-200/70 dark:group-hover:from-gray-800/70 dark:group-hover:to-gray-700/70 transition-all duration-300" />
                  
                  <CardHeader className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors">
                        <feature.icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      </div>
                      <Badge className="mono-theme-badge">
                        {feature.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <div className="space-y-3">
                      {feature.highlights.map((highlight, highlightIndex) => (
                        <div key={highlightIndex} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {highlight}
                        </div>
                      ))}
                      
                      <Link 
                        href={feature.href}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 transition-colors group-hover:gap-3 transition-all"
                      >
                        {feature.action}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Guidelines */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            Sandbox Safety Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-800">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
              <span><strong>Complete Isolation:</strong> All development is contained within the sandbox environment</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
              <span><strong>Zero Production Impact:</strong> Changes here will not affect live pages until Phase 7</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
              <span><strong>Import Restrictions:</strong> Sandbox components cannot be imported into production code</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
              <span><strong>Rollback Ready:</strong> Every change includes documented rollback procedures</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Documentation Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentation & Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {documentationLinks.map((doc) => (
              <Link 
                key={doc.href}
                href={doc.href}
                className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <doc.icon className="w-4 h-4" />
                  <span className="font-medium">{doc.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{doc.description}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Safety & Guidelines Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Sandbox Safety
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Secure development environment with comprehensive safety measures
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Safety Guidelines */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -20 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <Card className="mono-theme-card border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Shield className="w-5 h-5" />
                    Safety Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {safetyGuidelines.map((guideline, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 mt-0.5 text-green-500" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{guideline.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{guideline.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Documentation Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <Card className="mono-theme-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <FileText className="w-5 h-5" />
                    Documentation & Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documentationLinks.map((doc, index) => (
                      <Link 
                        key={doc.href}
                        href={doc.href}
                        className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <doc.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                              {doc.title}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {doc.description}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

/**
 * Demo cards data for interactive demonstrations
 */
const demoCards = [
  {
    id: 'motion-demo',
    title: 'Motion System',
    description: 'High-tech animations and transitions with Framer Motion integration',
    status: 'live' as const,
    icon: Zap,
    href: '/sandbox/mono-theme',
    action: 'Explore Motion',
    stats: [
      { value: '60fps', label: 'Performance' },
      { value: '12+', label: 'Variants' }
    ],
    features: [
      'Page transitions',
      'Micro-interactions',
      'Accessibility support',
      'Performance optimized'
    ]
  },
  {
    id: 'tokens-demo',
    title: 'Design Tokens',
    description: 'Sophisticated grayscale palette with comprehensive token system',
    status: 'live' as const,
    icon: Palette,
    href: '/sandbox/tokens',
    action: 'View Tokens',
    stats: [
      { value: '50+', label: 'Tokens' },
      { value: '100%', label: 'Coverage' }
    ],
    features: [
      'Mono-theme palette',
      'Semantic colors',
      'Typography scale',
      'Spacing system'
    ]
  },
  {
    id: 'components-demo',
    title: 'UI Components',
    description: 'Production-quality components with sophisticated interactions',
    status: 'live' as const,
    icon: Layers,
    href: '/sandbox/elements',
    action: 'Browse Components',
    stats: [
      { value: '25+', label: 'Components' },
      { value: 'WCAG', label: 'Compliant' }
    ],
    features: [
      'Interactive demos',
      'Accessibility features',
      'Responsive design',
      'Motion integration'
    ]
  }
]

/**
 * System features data
 */
const systemFeatures = [
  {
    id: 'mono-theme',
    title: 'Mono-Theme System',
    description: 'Sophisticated grayscale design system with high-tech aesthetics',
    status: 'HT-007 ✅',
    icon: Sparkles,
    href: '/sandbox/mono-theme',
    action: 'Explore Mono-Theme',
    highlights: [
      'Sophisticated grayscale palette',
      'High-tech visual effects',
      'Production-quality layouts',
      'Motion system integration'
    ]
  },
  {
    id: 'motion-effects',
    title: 'Motion Effects',
    description: 'Advanced animations and transitions powered by Framer Motion',
    status: 'HT-007 ✅',
    icon: Zap,
    href: '/sandbox/mono-theme',
    action: 'View Animations',
    highlights: [
      'Page transitions',
      'Micro-interactions',
      'Gesture handling',
      'Performance optimization'
    ]
  },
  {
    id: 'responsive-design',
    title: 'Responsive Design',
    description: 'Mobile-first responsive patterns with perfect cross-device behavior',
    status: 'HT-006 ✅',
    icon: Smartphone,
    href: '/sandbox/elements',
    action: 'Test Responsive',
    highlights: [
      'Mobile-first approach',
      'Touch optimizations',
      'Cross-device testing',
      'Performance metrics'
    ]
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    description: 'WCAG 2.1 AA compliant with enhanced accessibility patterns',
    status: 'HT-006 ✅',
    icon: Shield,
    href: '/sandbox/elements',
    action: 'Check A11y',
    highlights: [
      'WCAG 2.1 AA compliance',
      'Keyboard navigation',
      'Screen reader support',
      'Reduced motion support'
    ]
  },
  {
    id: 'documentation',
    title: 'Documentation',
    description: 'Comprehensive guides and interactive examples for developers',
    status: 'HT-006 ✅',
    icon: FileText,
    href: '/sandbox/tour',
    action: 'Read Docs',
    highlights: [
      'Interactive walkthrough',
      'Code examples',
      'Best practices',
      'Implementation guides'
    ]
  },
  {
    id: 'performance',
    title: 'Performance',
    description: 'Optimized for speed with Core Web Vitals compliance',
    status: 'HT-006 ✅',
    icon: Rocket,
    href: '/sandbox/blocks',
    action: 'Check Performance',
    highlights: [
      'Core Web Vitals',
      'Bundle optimization',
      'Lazy loading',
      'Performance monitoring'
    ]
  }
]

/**
 * Safety guidelines data
 */
const safetyGuidelines = [
  {
    title: 'Complete Isolation',
    description: 'All development is contained within the sandbox environment'
  },
  {
    title: 'Zero Production Impact',
    description: 'Changes here will not affect live pages until Phase 7'
  },
  {
    title: 'Import Restrictions',
    description: 'Sandbox components cannot be imported into production code'
  },
  {
    title: 'Rollback Ready',
    description: 'Every change includes documented rollback procedures'
  }
]

/**
 * Documentation navigation
 */
const documentationLinks = [
  {
    title: 'Repository Map',
    description: 'Complete codebase architecture and component mapping',
    href: '/docs/system/REPO_MAP.md',
    icon: FileText
  },
  {
    title: 'Technical Baseline',
    description: 'Current tech stack and configuration documentation',
    href: '/docs/system/TECH_BASELINE.md',
    icon: Settings
  },
  {
    title: 'Safety Envelope',
    description: 'Sandbox isolation and rollback procedures',
    href: '/docs/system/SAFETY_ENVELOPE.md',
    icon: Shield
  }
]
