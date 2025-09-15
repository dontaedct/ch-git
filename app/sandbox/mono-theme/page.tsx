/**
 * @fileoverview HT-007 Mono-Theme Sandbox Page
 * @module app/sandbox/mono-theme/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-007 Phase 1 - Mono-Theme Implementation
 * Purpose: Sophisticated mono-theme showcase with Framer Motion integration
 * Safety: Sandbox-isolated mono-theme demonstration
 * Status: Phase 1 implementation - Mono-theme foundation
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette, 
  Zap, 
  Layers, 
  MousePointer, 
  Eye, 
  Code, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  Star,
  Heart,
  Download,
  Share,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { 
  monoMotionPresets,
  useMonoMotionPreferences,
  useMonoMotionVariants,
  MonoMotionCard,
  MonoMotionButton,
  MonoMotionSurface,
  MonoMotionBadge,
  MonoMotionIcon
} from '@/lib/motion/mono-theme-motion'

export default function MonoThemePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const { shouldAnimate } = useMonoMotionPreferences()
  const variants = useMonoMotionVariants()

  const features = [
    {
      icon: Palette,
      title: 'Sophisticated Mono-Theme',
      description: 'Elegant grayscale palette with sophisticated visual hierarchy',
      color: 'gray'
    },
    {
      icon: Zap,
      title: 'Framer Motion Integration',
      description: 'Smooth animations and micro-interactions with accessibility support',
      color: 'gray'
    },
    {
      icon: Layers,
      title: 'Production-Quality Layouts',
      description: 'Clean spacing, typography, and visual effects inspired by production',
      color: 'gray'
    },
    {
      icon: MousePointer,
      title: 'High-Tech Interactions',
      description: 'Sophisticated hover effects, glass morphism, and premium micro-interactions',
      color: 'gray'
    }
  ]

  const cards = [
    {
      id: 1,
      title: 'Design System',
      description: 'Comprehensive token-driven design system with mono-theme implementation',
      icon: Palette,
      stats: { components: 24, tokens: 156, variants: 89 }
    },
    {
      id: 2,
      title: 'Motion System',
      description: 'Sophisticated animation system with Framer Motion integration',
      icon: Zap,
      stats: { animations: 12, presets: 8, variants: 15 }
    },
    {
      id: 3,
      title: 'UI Components',
      description: 'Production-quality components with mono-theme styling',
      icon: Layers,
      stats: { components: 18, states: 45, interactions: 23 }
    },
    {
      id: 4,
      title: 'Accessibility',
      description: 'WCAG 2.1 AA compliant with reduced motion support',
      icon: Eye,
      stats: { standards: 3, tests: 12, coverage: '100%' }
    }
  ]

  return (
    <motion.div 
      className="min-h-screen mono-bg-primary mono-text-primary"
      {...monoMotionPresets.pageTransition}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden mono-mesh-bg">
        <div className="relative z-10 container mx-auto px-6 py-24">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 mono-badge mono-badge-primary mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4" />
              <span>HT-007 Mono-Theme System</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              className="mono-text-6xl font-bold mb-6 mono-text-primary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Sophisticated Mono-Theme
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              className="mono-text-xl mono-text-secondary mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              High-tech design system with elegant grayscale palette, sophisticated motion, 
              and production-quality layouts inspired by modern design trends.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <MonoMotionButton
                className="mono-button mono-button-primary mono-spacing-lg mono-radius-lg mono-hover-lift mono-focus-ring"
                {...monoMotionPresets.buttonInteraction}
              >
                <span className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Explore System
                </span>
              </MonoMotionButton>
              
              <MonoMotionButton
                className="mono-button mono-button-secondary mono-spacing-lg mono-radius-lg mono-hover-lift mono-focus-ring"
                {...monoMotionPresets.buttonInteraction}
              >
                <span className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  View Code
                </span>
              </MonoMotionButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mono-spacing-3xl">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="mono-text-4xl font-bold mb-6 mono-text-primary">
              System Features
            </h2>
            <p className="mono-text-lg mono-text-secondary max-w-2xl mx-auto">
              Comprehensive design system with sophisticated mono-theme implementation
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            {...monoMotionPresets.staggerContainer}
          >
            {features.map((feature, index) => (
              <MonoMotionCard
                key={feature.title}
                className="mono-card mono-card-elevated mono-spacing-lg mono-radius-xl mono-hover-lift mono-focus-ring"
                {...monoMotionPresets.cardInteraction}
                custom={index}
              >
                <MonoMotionIcon
                  className="mono-spacing-md mono-radius-lg mono-bg-accent mono-text-accent-foreground mb-6"
                  {...monoMotionPresets.iconInteraction}
                >
                  <feature.icon className="w-8 h-8" />
                </MonoMotionIcon>
                
                <h3 className="mono-text-xl font-semibold mb-3 mono-text-primary">
                  {feature.title}
                </h3>
                
                <p className="mono-text-secondary">
                  {feature.description}
                </p>
              </MonoMotionCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interactive Cards Section */}
      <section className="mono-spacing-3xl mono-bg-secondary">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="mono-text-4xl font-bold mb-6 mono-text-primary">
              Interactive Components
            </h2>
            <p className="mono-text-lg mono-text-secondary max-w-2xl mx-auto">
              Sophisticated components with mono-theme styling and motion integration
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cards.map((card, index) => (
              <MonoMotionCard
                key={card.id}
                className={`mono-card mono-card-elevated mono-spacing-xl mono-radius-2xl mono-hover-lift mono-focus-ring cursor-pointer transition-all duration-300 ${
                  selectedCard === card.id ? 'mono-shadow-xl scale-105' : ''
                }`}
                {...monoMotionPresets.cardInteraction}
                onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-6">
                  <MonoMotionIcon
                    className="mono-spacing-lg mono-radius-xl mono-bg-primary mono-text-primary-foreground mono-shadow-md"
                    {...monoMotionPresets.iconInteraction}
                  >
                    <card.icon className="w-10 h-10" />
                  </MonoMotionIcon>
                  
                  <div className="flex-1">
                    <h3 className="mono-text-2xl font-bold mb-3 mono-text-primary">
                      {card.title}
                    </h3>
                    
                    <p className="mono-text-secondary mb-6">
                      {card.description}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(card.stats).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="mono-text-2xl font-bold mono-text-primary">
                            {value}
                          </div>
                          <div className="mono-text-sm mono-text-secondary capitalize">
                            {key}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedCard === card.id && (
                    <motion.div
                      className="mt-6 pt-6 border-t mono-border"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex gap-3">
                        <MonoMotionButton
                          className="mono-button mono-button-primary mono-spacing-sm mono-radius-md mono-hover-lift"
                          {...monoMotionPresets.buttonInteraction}
                        >
                          <Star className="w-4 h-4" />
                        </MonoMotionButton>
                        
                        <MonoMotionButton
                          className="mono-button mono-button-secondary mono-spacing-sm mono-radius-md mono-hover-lift"
                          {...monoMotionPresets.buttonInteraction}
                        >
                          <Heart className="w-4 h-4" />
                        </MonoMotionButton>
                        
                        <MonoMotionButton
                          className="mono-button mono-button-secondary mono-spacing-sm mono-radius-md mono-hover-lift"
                          {...monoMotionPresets.buttonInteraction}
                        >
                          <Share className="w-4 h-4" />
                        </MonoMotionButton>
                        
                        <MonoMotionButton
                          className="mono-button mono-button-secondary mono-spacing-sm mono-radius-md mono-hover-lift"
                          {...monoMotionPresets.buttonInteraction}
                        >
                          <Download className="w-4 h-4" />
                        </MonoMotionButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </MonoMotionCard>
            ))}
          </div>
        </div>
      </section>

      {/* Glass Morphism Section */}
      <section className="mono-spacing-3xl mono-mesh-bg">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="mono-text-4xl font-bold mb-6 mono-text-primary">
              Glass Morphism Effects
            </h2>
            <p className="mono-text-lg mono-text-secondary max-w-2xl mx-auto">
              Sophisticated glass morphism with backdrop blur and subtle transparency
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MonoMotionSurface
              className="mono-glass mono-spacing-xl mono-radius-2xl mono-hover-lift mono-focus-ring"
              {...monoMotionPresets.cardInteraction}
            >
              <MonoMotionIcon
                className="mono-spacing-lg mono-radius-xl mono-bg-primary mono-text-primary-foreground mono-shadow-md mb-6"
                {...monoMotionPresets.iconInteraction}
              >
                <Settings className="w-8 h-8" />
              </MonoMotionIcon>
              
              <h3 className="mono-text-xl font-semibold mb-3 mono-text-primary">
                Glass Surface
              </h3>
              
              <p className="mono-text-secondary">
                Subtle glass morphism with backdrop blur and transparency effects
              </p>
            </MonoMotionSurface>

            <MonoMotionSurface
              className="mono-glass-strong mono-spacing-xl mono-radius-2xl mono-hover-lift mono-focus-ring"
              {...monoMotionPresets.cardInteraction}
            >
              <MonoMotionIcon
                className="mono-spacing-lg mono-radius-xl mono-bg-primary mono-text-primary-foreground mono-shadow-md mb-6"
                {...monoMotionPresets.iconInteraction}
              >
                <Zap className="w-8 h-8" />
              </MonoMotionIcon>
              
              <h3 className="mono-text-xl font-semibold mb-3 mono-text-primary">
                Strong Glass
              </h3>
              
              <p className="mono-text-secondary">
                Enhanced glass morphism with stronger blur and opacity effects
              </p>
            </MonoMotionSurface>

            <MonoMotionSurface
              className="mono-glass-subtle mono-spacing-xl mono-radius-2xl mono-hover-lift mono-focus-ring"
              {...monoMotionPresets.cardInteraction}
            >
              <MonoMotionIcon
                className="mono-spacing-lg mono-radius-xl mono-bg-primary mono-text-primary-foreground mono-shadow-md mb-6"
                {...monoMotionPresets.iconInteraction}
              >
                <Eye className="w-8 h-8" />
              </MonoMotionIcon>
              
              <h3 className="mono-text-xl font-semibold mb-3 mono-text-primary">
                Subtle Glass
              </h3>
              
              <p className="mono-text-secondary">
                Minimal glass morphism with subtle blur and transparency
              </p>
            </MonoMotionSurface>
          </div>
        </div>
      </section>

      {/* Motion Controls Section */}
      <section className="mono-spacing-3xl mono-bg-secondary">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="mono-text-4xl font-bold mb-6 mono-text-primary">
              Motion Controls
            </h2>
            <p className="mono-text-lg mono-text-secondary max-w-2xl mx-auto">
              Interactive motion controls with accessibility support and reduced motion preferences
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <MonoMotionSurface
              className="mono-surface mono-surface-elevated mono-spacing-xl mono-radius-2xl"
              {...monoMotionPresets.cardInteraction}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="mono-text-2xl font-bold mb-2 mono-text-primary">
                    Motion Preferences
                  </h3>
                  <p className="mono-text-secondary">
                    Current motion settings and accessibility preferences
                  </p>
                </div>
                
                <MonoMotionBadge
                  className={`mono-badge mono-badge-primary ${
                    shouldAnimate ? 'mono-badge-primary' : 'mono-badge-secondary'
                  }`}
                  {...monoMotionPresets.buttonInteraction}
                >
                  <CheckCircle className="w-4 h-4" />
                  {shouldAnimate ? 'Animations Enabled' : 'Reduced Motion'}
                </MonoMotionBadge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MonoMotionButton
                  className={`mono-button mono-spacing-lg mono-radius-lg mono-hover-lift mono-focus-ring ${
                    isPlaying ? 'mono-button-primary' : 'mono-button-secondary'
                  }`}
                  {...monoMotionPresets.buttonInteraction}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  <span className="flex items-center gap-2">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </span>
                </MonoMotionButton>

                <MonoMotionButton
                  className="mono-button mono-button-secondary mono-spacing-lg mono-radius-lg mono-hover-lift mono-focus-ring"
                  {...monoMotionPresets.buttonInteraction}
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </span>
                </MonoMotionButton>

                <MonoMotionButton
                  className="mono-button mono-button-secondary mono-spacing-lg mono-radius-lg mono-hover-lift mono-focus-ring"
                  {...monoMotionPresets.buttonInteraction}
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Settings
                  </span>
                </MonoMotionButton>
              </div>
            </MonoMotionSurface>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mono-spacing-3xl mono-bg-primary mono-border-t">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="mono-text-2xl font-bold mb-4 mono-text-primary">
              HT-007 Mono-Theme System
            </h3>
            
            <p className="mono-text-secondary mb-8 max-w-2xl mx-auto">
              Sophisticated mono-theme design system with Framer Motion integration, 
              production-quality layouts, and comprehensive accessibility support.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MonoMotionButton
                className="mono-button mono-button-primary mono-spacing-lg mono-radius-lg mono-hover-lift mono-focus-ring"
                {...monoMotionPresets.buttonInteraction}
              >
                <span className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5" />
                  Get Started
                </span>
              </MonoMotionButton>
              
              <MonoMotionButton
                className="mono-button mono-button-secondary mono-spacing-lg mono-radius-lg mono-hover-lift mono-focus-ring"
                {...monoMotionPresets.buttonInteraction}
              >
                <span className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Documentation
                </span>
              </MonoMotionButton>
            </div>
          </motion.div>
        </div>
      </footer>
    </motion.div>
  )
}
