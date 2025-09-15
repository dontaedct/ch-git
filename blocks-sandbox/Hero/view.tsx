/**
 * @fileoverview Hero Block View Component - HT-006 Phase 3
 * @module blocks-sandbox/Hero/view
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
import { Badge } from '@/components/ui/badge';
import { SingleCardCarousel, CarouselSlide } from '@/components/ui/single-card-carousel';
import { HeroBlockContent } from './schema';

/**
 * Hero Block View Component
 * 
 * Renders a hero section with comprehensive support for:
 * - Dynamic headlines and content
 * - Call-to-action buttons with proper routing
 * - Visual elements including carousels
 * - Accessibility features and SEO optimization
 * - Token-driven styling with brand switching
 */
interface HeroBlockViewProps {
  content: HeroBlockContent;
  className?: string;
}

export function HeroBlockView({ content, className = '' }: HeroBlockViewProps) {
  const {
    content: heroContent,
    layout,
    accessibility,
    seo,
  } = content;

  // Animation variants for staggered entrance
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
      lg: 'py-24',
      xl: 'py-32',
    },
    background: {
      none: '',
      subtle: 'bg-muted',
      gradient: 'bg-gradient-to-br from-background via-muted to-background',
      pattern: 'bg-muted',
    },
  };

  // Render visual element
  const renderVisual = () => {
    if (!heroContent.visual) return null;

    const { visual } = heroContent;

    switch (visual.type) {
      case 'carousel':
        if (!visual.carousel?.slides) return null;
        
        return (
          <motion.div
            className="mt-16 mb-24"
            variants={itemVariants}
          >
            <div className="text-center mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
                See It In Action
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Interactive demos showcasing our solutions in real-time
              </p>
            </div>

            <SingleCardCarousel 
              className="gap-8 max-w-7xl mx-auto"
              showDots={visual.carousel.showDots}
              showArrows={visual.carousel.showArrows}
              autoPlay={visual.carousel.autoPlay}
              autoPlayInterval={visual.carousel.autoPlayInterval}
            >
              {visual.carousel.slides.map((slide) => (
                <CarouselSlide key={slide.id}>
                  <div className="group rounded-2xl p-6 border bg-card border-border relative overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/20 group-hover:via-primary/10 group-hover:to-primary/30 transition-all duration-300 ease-out" />
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 blur-xl" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300">
                          {slide.title}
                        </h4>
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        {slide.description}
                      </p>
                      
                      <button className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300">
                        <span className="high-tech-text">Try Demo</span>
                      </button>
                    </div>
                  </div>
                </CarouselSlide>
              ))}
            </SingleCardCarousel>
          </motion.div>
        );

      case 'image':
        return (
          <motion.div
            className="mt-16"
            variants={itemVariants}
          >
            <img
              src={visual.src}
              alt={visual.alt || ''}
              className={`w-full h-auto ${visual.className || ''}`}
            />
          </motion.div>
        );

      case 'video':
        return (
          <motion.div
            className="mt-16"
            variants={itemVariants}
          >
            <video
              src={visual.src}
              className={`w-full h-auto ${visual.className || ''}`}
              controls
              aria-label={visual.alt || 'Hero video'}
            />
          </motion.div>
        );

      case 'animation':
        return (
          <motion.div
            className="mt-16"
            variants={itemVariants}
          >
            <div className={`w-full h-96 ${visual.className || 'bg-gray-200 dark:bg-gray-700 rounded-lg'}`}>
              {/* Placeholder for animation component */}
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                Animation Placeholder
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <section
      className={`
        relative min-h-screen flex items-center justify-center overflow-hidden
        ${layoutClasses.background[layout.background]}
        ${layoutClasses.padding[layout.padding]}
        ${className}
      `}
      aria-labelledby={heroContent.headline.text}
      aria-describedby={heroContent.description?.text}
      {...(accessibility?.ariaLabel && { 'aria-label': accessibility.ariaLabel })}
      {...(accessibility?.ariaDescribedBy && { 'aria-describedby': accessibility.ariaDescribedBy })}
      {...(accessibility?.role && { role: accessibility.role })}
    >
      {/* SEO metadata */}
      {seo?.title && <title>{seo.title}</title>}
      {seo?.description && <meta name="description" content={seo.description} />}
      {seo?.keywords && <meta name="keywords" content={seo.keywords.join(', ')} />}

      <div className={`mx-auto ${layoutClasses.maxWidth[layout.maxWidth]} ${layoutClasses.alignment[layout.alignment]} relative z-10`}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge/Announcement */}
          {heroContent.badge && (
            <motion.div
              className="mb-16"
              variants={itemVariants}
            >
              <Badge
                variant={heroContent.badge.variant}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium border bg-card border-border text-card-foreground ${heroContent.badge.className || ''}`}
              >
                <span className="mr-2 text-xs high-tech-icon">⚡</span>
                <span className="high-tech-text">{heroContent.badge.text}</span>
              </Badge>
            </motion.div>
          )}

          {/* Headline */}
          <motion.div variants={itemVariants}>
            {React.createElement(
              heroContent.headline.level,
              {
                id: heroContent.headline.text,
                className: `text-6xl sm:text-7xl lg:text-8xl font-bold mb-4 leading-none tracking-tight text-foreground ${heroContent.headline.className || ''}`,
              },
              heroContent.headline.text
            )}
          </motion.div>

          {/* Subheading */}
          {heroContent.subheading && (
            <motion.div variants={itemVariants}>
              {React.createElement(
                heroContent.subheading.level,
                {
                  className: `text-2xl sm:text-3xl lg:text-4xl font-medium mb-8 leading-relaxed tracking-wide text-muted-foreground font-mono ${heroContent.subheading.className || ''}`,
                },
                heroContent.subheading.text
              )}
            </motion.div>
          )}

          {/* Description */}
          {heroContent.description && (
            <motion.p
              className={`mx-auto mb-20 max-w-4xl text-xl leading-relaxed text-muted-foreground ${heroContent.description.className || ''}`}
              variants={itemVariants}
            >
              {heroContent.description.text}
            </motion.p>
          )}

          {/* Call-to-Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            variants={itemVariants}
          >
            <Button
              asChild
              variant={heroContent.cta.primary.variant}
              size={heroContent.cta.primary.size}
              className={`px-8 py-4 text-lg font-medium bg-primary text-primary-foreground ${heroContent.cta.primary.className || ''}`}
            >
              <Link
                href={heroContent.cta.primary.href}
                {...(heroContent.cta.primary.external && { target: '_blank', rel: 'noopener noreferrer' })}
              >
                <span className="high-tech-text">{heroContent.cta.primary.text}</span>
              </Link>
            </Button>

            {heroContent.cta.secondary && (
              <Button
                asChild
                variant={heroContent.cta.secondary.variant}
                size={heroContent.cta.secondary.size}
                className={`high-tech-button high-tech-glow high-tech-shimmer high-tech-border px-8 py-4 text-lg font-medium border bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 ${heroContent.cta.secondary.className || ''}`}
              >
                <Link
                  href={heroContent.cta.secondary.href}
                  {...(heroContent.cta.secondary.external && { target: '_blank', rel: 'noopener noreferrer' })}
                >
                  <span className="high-tech-text">{heroContent.cta.secondary.text}</span>
                </Link>
              </Button>
            )}
          </motion.div>

          {/* Visual Element */}
          {renderVisual()}
        </motion.div>
      </div>
    </section>
  );
}

export default HeroBlockView;
