/**
 * @fileoverview Features Block View Component - HT-006 Phase 3
 * @module blocks-sandbox/Features/view
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
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FeaturesBlockContent } from './schema';

/**
 * Features Block View Component
 * 
 * Renders a features showcase section with comprehensive support for:
 * - Grid layouts with responsive columns
 * - Feature cards with icons, images, and CTAs
 * - Interactive hover effects and animations
 * - Accessibility features and SEO optimization
 * - Token-driven styling with brand switching
 */
interface FeaturesBlockViewProps {
  content: FeaturesBlockContent;
  className?: string;
}

export function FeaturesBlockView({ content, className = '' }: FeaturesBlockViewProps) {
  const {
    content: featuresContent,
    layout,
    accessibility,
    seo,
  } = content;

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

  // Layout class mapping
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
    grid: {
      gap: {
        sm: 'gap-4',
        md: 'gap-6',
        lg: 'gap-8',
        xl: 'gap-12',
      },
      columns: {
        '1': 'grid-cols-1',
        '2': 'grid-cols-1 md:grid-cols-2',
        '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        '6': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
      },
    },
    card: {
      variant: {
        default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        elevated: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700',
        outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
        filled: 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      },
      padding: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
  };

  // Render icon
  const renderIcon = (icon: NonNullable<FeaturesBlockContent['content']['features'][0]['icon']>) => {
    switch (icon.type) {
      case 'emoji':
        return (
          <div className={`text-4xl ${icon.className || ''}`}>
            {icon.value}
          </div>
        );
      case 'svg':
        return (
          <div className={`w-12 h-12 ${icon.className || ''}`}>
            <div dangerouslySetInnerHTML={{ __html: icon.value }} />
          </div>
        );
      case 'image':
        return (
          <img
            src={icon.value}
            alt="Feature icon"
            className={`w-12 h-12 ${icon.className || ''}`}
          />
        );
      default:
        return (
          <div className={`w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center ${icon.className || ''}`}>
            <span className="text-gray-600 dark:text-gray-400 text-lg">?</span>
          </div>
        );
    }
  };

  return (
    <section
      className={`
        relative overflow-hidden
        ${layoutClasses.background[layout.background]}
        ${layoutClasses.padding[layout.padding]}
        ${className}
      `}
      aria-labelledby={featuresContent.header.title}
      {...(accessibility?.ariaLabel && { 'aria-label': accessibility.ariaLabel })}
      {...(accessibility?.ariaDescribedBy && { 'aria-describedby': accessibility.ariaDescribedBy })}
      {...(accessibility?.role && { role: accessibility.role })}
    >
      {/* SEO metadata */}
      {seo?.title && <title>{seo.title}</title>}
      {seo?.description && <meta name="description" content={seo.description} />}
      {seo?.keywords && <meta name="keywords" content={seo.keywords.join(', ')} />}

      <div className={`mx-auto ${layoutClasses.maxWidth[layout.maxWidth]} ${layoutClasses.alignment[layout.alignment]}`}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Section Header */}
          <motion.div className="mb-20" variants={itemVariants}>
            <h2
              id={featuresContent.header.title}
              className="text-5xl sm:text-6xl font-bold mb-6 leading-tight tracking-tight text-gray-900 dark:text-gray-100"
            >
              {featuresContent.header.title}
            </h2>
            
            {featuresContent.header.subtitle && (
              <p className="text-xl max-w-3xl mx-auto leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
                <strong className="text-gray-900 dark:text-gray-100">{featuresContent.header.subtitle}</strong>
              </p>
            )}
            
            {featuresContent.header.description && (
              <p className="text-xl max-w-3xl mx-auto leading-relaxed text-gray-700 dark:text-gray-300">
                {featuresContent.header.description}
              </p>
            )}
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className={`
              grid ${layoutClasses.grid.columns[layout.grid.columns]} ${layoutClasses.grid.gap[layout.grid.gap]}
            `}
            variants={containerVariants}
          >
            {featuresContent.features.map((feature, index) => (
              <motion.div key={feature.id} variants={itemVariants}>
                <Card
                  className={`
                    group high-tech-card high-tech-glow high-tech-shimmer high-tech-border rounded-2xl h-full flex flex-col relative overflow-hidden transition-all duration-200
                    ${layoutClasses.card.variant[layout.card.variant]}
                    ${layoutClasses.card.padding[layout.card.padding]}
                    ${layout.card.hover ? 'hover:shadow-xl hover:scale-105' : ''}
                    ${layout.card.className || ''}
                  `}
                  style={{
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                  }}
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-100/0 group-hover:from-blue-50/20 group-hover:via-blue-50/10 group-hover:to-blue-100/30 transition-all duration-100 ease-out" />
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-100 bg-gradient-to-r from-blue-400/20 via-transparent to-blue-600/20 blur-xl" />
                  
                  <div className="flex flex-col h-full relative z-10">
                    {/* Icon */}
                    {feature.icon && (
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 bg-blue-500 group-hover:bg-blue-600 transition-all duration-100 relative overflow-hidden">
                        {/* Shining trace effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" />
                        <div className="relative z-10">
                          {renderIcon(feature.icon)}
                        </div>
                      </div>
                    )}

                    {/* Image */}
                    {feature.image && (
                      <div className="mb-4">
                        <img
                          src={feature.image.src}
                          alt={feature.image.alt}
                          className={`w-full h-48 object-cover rounded-lg ${feature.image.className || ''}`}
                        />
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors duration-100 high-tech-text">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="leading-relaxed text-gray-700 dark:text-gray-300 flex-grow group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-100 high-tech-text">
                      {feature.description}
                    </p>

                    {/* Tags */}
                    {feature.tags && feature.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {feature.tags.map((tag, tagIndex) => (
                          <Badge
                            key={tagIndex}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Price */}
                    {feature.price && (
                      <div className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-100 high-tech-text">
                        {feature.price.currency}{feature.price.amount}
                        {feature.price.period && (
                          <span className="text-gray-500 dark:text-gray-400">/{feature.price.period}</span>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    {feature.cta && (
                      <div className="mt-6">
                        <Button
                          asChild
                          variant={feature.cta.variant}
                          size="sm"
                          className="w-full high-tech-button high-tech-glow"
                        >
                          <Link
                            href={feature.cta.href}
                            {...(feature.cta.external && { target: '_blank', rel: 'noopener noreferrer' })}
                          >
                            <span className="high-tech-text">{feature.cta.text}</span>
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Section CTA */}
          {featuresContent.cta && (
            <motion.div
              className="mt-20 text-center"
              variants={itemVariants}
            >
              {featuresContent.cta.title && (
                <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                  {featuresContent.cta.title}
                </h3>
              )}
              
              {featuresContent.cta.description && (
                <p className="text-xl mb-8 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                  {featuresContent.cta.description}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  variant={featuresContent.cta.primary.variant}
                  size={featuresContent.cta.primary.size}
                  className="high-tech-button high-tech-glow high-tech-shimmer px-8 py-4 text-lg font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-black"
                >
                  <Link
                    href={featuresContent.cta.primary.href}
                    {...(featuresContent.cta.primary.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    <span className="high-tech-text">{featuresContent.cta.primary.text}</span>
                  </Link>
                </Button>

                {featuresContent.cta.secondary && (
                  <Button
                    asChild
                    variant={featuresContent.cta.secondary.variant}
                    size={featuresContent.cta.secondary.size}
                    className="high-tech-button high-tech-glow high-tech-shimmer high-tech-border px-8 py-4 text-lg font-medium border bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  >
                    <Link
                      href={featuresContent.cta.secondary.href}
                      {...(featuresContent.cta.secondary.external && { target: '_blank', rel: 'noopener noreferrer' })}
                    >
                      <span className="high-tech-text">{featuresContent.cta.secondary.text}</span>
                    </Link>
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

export default FeaturesBlockView;
