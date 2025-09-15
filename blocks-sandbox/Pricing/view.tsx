/**
 * @fileoverview Pricing Block View - HT-006 Phase 3
 * @module blocks-sandbox/Pricing/view
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PricingBlockContent } from './schema';

/**
 * Pricing Block View Component
 * 
 * Renders pricing tiers with comparison functionality, CTA integration,
 * and responsive design using design tokens exclusively.
 * Enhanced with high-tech aesthetic matching the home page design theme.
 */
interface PricingBlockViewProps {
  content: PricingBlockContent;
  className?: string;
}

export function PricingBlockView({ content, className = '' }: PricingBlockViewProps) {
  const { content: pricingContent, layout, accessibility, seo } = content;
  const { header, tiers, cta } = pricingContent;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
        staggerChildren: 0.1,
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
    },
  };

  // Grid configuration
  const gridClasses = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[layout.columns];

  return (
    <section 
      className={`
        relative overflow-hidden
        ${layoutClasses.background[layout.background]}
        ${layoutClasses.padding[layout.padding]}
        ${className}
      `}
      aria-label={accessibility?.ariaLabel || 'Pricing Section'}
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
          {/* Header */}
          <motion.div className="mb-20" variants={itemVariants}>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight tracking-tight text-gray-900 dark:text-gray-100">
              {header.title}
            </h2>
            {header.subtitle && (
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
                {header.subtitle}
              </p>
            )}
            {header.description && (
              <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                {header.description}
              </p>
            )}
          </motion.div>

          {/* Pricing Tiers */}
          <motion.div 
            className={`grid ${gridClasses} gap-8 mb-20`}
            variants={containerVariants}
          >
            {tiers.map((tier) => (
              <motion.div key={tier.id} variants={itemVariants}>
                <Card 
                  className={`
                    group high-tech-card high-tech-glow high-tech-shimmer high-tech-border rounded-2xl h-full flex flex-col relative overflow-hidden transition-all duration-200
                    ${tier.popular ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''} 
                    ${tier.className || ''}
                  `}
                  style={{
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                  }}
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-100/0 group-hover:from-blue-50/20 group-hover:via-blue-50/10 group-hover:to-blue-100/30 transition-all duration-100 ease-out" />
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-100 bg-gradient-to-r from-blue-400/20 via-transparent to-blue-600/20 blur-xl" />
                  
                  {tier.popular && tier.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge variant="default" className="bg-blue-500 text-white high-tech-button high-tech-glow">
                        <span className="high-tech-text">{tier.badge}</span>
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4 relative z-10">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors duration-100 high-tech-text">
                      {tier.name}
                    </CardTitle>
                    {tier.description && (
                      <p className="text-gray-600 dark:text-gray-400 mt-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-100 high-tech-text">
                        {tier.description}
                      </p>
                    )}
                    
                    {/* Price */}
                    <div className="mt-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors duration-100 high-tech-text">
                          {tier.price.currency}{tier.price.amount}
                        </span>
                        {tier.price.period && (
                          <span className="text-gray-600 dark:text-gray-400 ml-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-100 high-tech-text">
                            {tier.price.period}
                          </span>
                        )}
                      </div>
                      {tier.price.originalAmount && (
                        <div className="mt-2">
                          <span className="text-lg text-gray-500 dark:text-gray-400 line-through group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-100 high-tech-text">
                            {tier.price.currency}{tier.price.originalAmount}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 relative z-10">
                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg 
                            className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0 group-hover:text-blue-600 transition-colors duration-100" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-100 high-tech-text">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      variant={tier.cta.variant}
                      size="lg"
                      className="w-full high-tech-button high-tech-glow high-tech-shimmer"
                      asChild
                    >
                      <a 
                        href={tier.cta.href}
                        target={tier.cta.external ? '_blank' : undefined}
                        rel={tier.cta.external ? 'noopener noreferrer' : undefined}
                      >
                        <span className="high-tech-text">{tier.cta.text}</span>
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Section CTA */}
          {cta && (
            <motion.div 
              className="text-center"
              variants={itemVariants}
            >
              {cta.title && (
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {cta.title}
                </h3>
              )}
              {cta.description && (
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  {cta.description}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant={cta.primary.variant}
                  size={cta.primary.size}
                  className="high-tech-button high-tech-glow high-tech-shimmer px-8 py-4 text-lg font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-black"
                  asChild
                >
                  <a 
                    href={cta.primary.href}
                    target={cta.primary.external ? '_blank' : undefined}
                    rel={cta.primary.external ? 'noopener noreferrer' : undefined}
                  >
                    <span className="high-tech-text">{cta.primary.text}</span>
                  </a>
                </Button>
                
                {cta.secondary && (
                  <Button
                    variant={cta.secondary.variant}
                    size={cta.secondary.size}
                    className="high-tech-button high-tech-glow high-tech-shimmer high-tech-border px-8 py-4 text-lg font-medium border bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    asChild
                  >
                    <a 
                      href={cta.secondary.href}
                      target={cta.secondary.external ? '_blank' : undefined}
                      rel={cta.secondary.external ? 'noopener noreferrer' : undefined}
                    >
                      <span className="high-tech-text">{cta.secondary.text}</span>
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
