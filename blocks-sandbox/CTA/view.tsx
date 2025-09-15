/**
 * @fileoverview CTA Block View - HT-006 Phase 3
 * @module blocks-sandbox/CTA/view
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-006 - Token-Driven Design System & Block-Based Architecture
 * Focus: JSON-driven block architecture with Zod validation
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: Medium (new architecture patterns, complex validation)
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CTABlockContent } from './schema';

/**
 * CTA Block View Component
 * 
 * Renders conversion-focused call-to-action sections with trust indicators,
 * visual elements, and responsive design using design tokens exclusively.
 * Enhanced with high-tech aesthetic matching the home page design theme.
 */
interface CTABlockViewProps {
  content: CTABlockContent;
  className?: string;
}

export function CTABlockView({ content, className = '' }: CTABlockViewProps) {
  const { content: ctaContent, layout, accessibility, seo } = content;
  const { headline, description, subtext, primary, secondary, visual, trust } = ctaContent;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  // Layout configuration with home page theme
  const layoutClasses = {
    alignment: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    maxWidth: {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '4xl': 'max-w-4xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
      full: 'max-w-full',
    },
    padding: {
      none: 'py-0',
      sm: 'py-8',
      md: 'py-16',
      lg: 'py-32',
      xl: 'py-40',
    },
    background: {
      none: '',
      subtle: 'bg-gray-100 dark:bg-gray-900',
      gradient: 'bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
      pattern: 'bg-gray-100 dark:bg-gray-900',
      brand: 'bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-200',
    },
  };

  // Variant-specific styling
  const variantClasses = {
    centered: 'flex flex-col items-center',
    split: 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center',
    minimal: 'flex flex-col items-center max-w-2xl mx-auto',
  }[layout.variant];

  return (
    <section 
      className={`
        relative overflow-hidden
        ${layoutClasses.background[layout.background]}
        ${layoutClasses.padding[layout.padding]}
        ${className}
      `}
      aria-label={accessibility?.ariaLabel || 'Call to Action Section'}
      role={accessibility?.role || 'region'}
    >
      {/* SEO metadata */}
      {seo?.title && <title>{seo.title}</title>}
      {seo?.description && <meta name="description" content={seo.description} />}
      {seo?.keywords && <meta name="keywords" content={seo.keywords.join(', ')} />}

      <div className={`mx-auto ${layoutClasses.maxWidth[layout.maxWidth]} ${layoutClasses.alignment[layout.alignment]} relative z-10`}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className={`${variantClasses}`}>
            {/* Visual Element */}
            {visual && visual.type !== 'none' && (
              <motion.div 
                className={`mb-8 ${layout.variant === 'split' ? 'order-2' : ''}`}
                variants={itemVariants}
              >
                {visual.type === 'image' && (
                  <img 
                    src={visual.value} 
                    alt="" 
                    className={`w-full max-w-md mx-auto rounded-2xl ${visual.className || ''}`}
                  />
                )}
                {visual.type === 'icon' && (
                  <div className={`text-6xl text-gray-900 dark:text-gray-100 ${visual.className || ''}`}>
                    {visual.value}
                  </div>
                )}
                {visual.type === 'emoji' && (
                  <div className={`text-6xl ${visual.className || ''}`}>
                    {visual.value}
                  </div>
                )}
              </motion.div>
            )}

            {/* Content */}
            <div className={`${layout.variant === 'split' ? 'order-1' : ''}`}>
              {/* Headline */}
              <motion.h2 
                className={`text-5xl sm:text-6xl font-bold mb-6 leading-tight tracking-tight text-gray-900 dark:text-gray-100 ${layout.background === 'brand' ? 'text-white' : ''}`}
                variants={itemVariants}
              >
                {headline}
              </motion.h2>

              {/* Description */}
              {description && (
                <motion.div 
                  className={`text-xl leading-relaxed text-gray-700 dark:text-gray-300 mb-6 max-w-2xl ${layout.background === 'brand' ? 'text-white/90' : ''}`}
                  variants={itemVariants}
                >
                  {description.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">
                      {line}
                    </p>
                  ))}
                </motion.div>
              )}

              {/* Subtext */}
              {subtext && (
                <motion.p 
                  className={`text-lg text-gray-600 dark:text-gray-400 mb-8 ${layout.background === 'brand' ? 'text-white/80' : ''}`}
                  variants={itemVariants}
                >
                  {subtext}
                </motion.p>
              )}

              {/* Trust Indicators */}
              {trust && (
                <motion.div 
                  className="mb-8"
                  variants={itemVariants}
                >
                  {/* Badges */}
                  {trust.badges && trust.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 justify-center">
                      {trust.badges.map((badge, index) => (
                        <Badge key={index} variant="secondary" className="text-xs high-tech-button high-tech-glow">
                          <span className="high-tech-text">{badge}</span>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Testimonials */}
                  {trust.testimonials && trust.testimonials.length > 0 && (
                    <div className="mb-4">
                      {trust.testimonials.map((testimonial, index) => (
                        <p key={index} className={`text-sm text-gray-600 dark:text-gray-400 italic ${layout.background === 'brand' ? 'text-white/80' : ''}`}>
                          "{testimonial}"
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Guarantees */}
                  {trust.guarantees && trust.guarantees.length > 0 && (
                    <div className="flex flex-wrap gap-4 justify-center">
                      {trust.guarantees.map((guarantee, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <svg className="w-4 h-4 text-gray-900 dark:text-gray-100 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {guarantee}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                variants={itemVariants}
              >
                <Button
                  variant={primary.variant}
                  size={primary.size}
                  className={`high-tech-button high-tech-glow high-tech-shimmer px-8 py-4 text-lg font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-black ${primary.className || ''} ${layout.background === 'brand' ? 'bg-white text-gray-900 hover:bg-white/90' : ''}`}
                  asChild
                >
                  <a 
                    href={primary.href}
                    target={primary.external ? '_blank' : undefined}
                    rel={primary.external ? 'noopener noreferrer' : undefined}
                  >
                    <span className="high-tech-text">{primary.text}</span>
                  </a>
                </Button>
                
                {secondary && (
                  <Button
                    variant={secondary.variant}
                    size={secondary.size}
                    className={`high-tech-button high-tech-glow high-tech-shimmer high-tech-border px-8 py-4 text-lg font-medium border bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 ${secondary.className || ''} ${layout.background === 'brand' ? 'bg-transparent border-white text-white hover:bg-white hover:text-gray-900' : ''}`}
                    asChild
                  >
                    <a 
                      href={secondary.href}
                      target={secondary.external ? '_blank' : undefined}
                      rel={secondary.external ? 'noopener noreferrer' : undefined}
                    >
                      <span className="high-tech-text">{secondary.text}</span>
                    </a>
                  </Button>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
