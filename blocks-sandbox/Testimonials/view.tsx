/**
 * @fileoverview Testimonials Block View Component - HT-006 Phase 3
 * @module blocks-sandbox/Testimonials/view
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestimonialsCarousel } from '@/components/ui/testimonials-carousel';
import { TestimonialsBlockContent } from './schema';

/**
 * Testimonials Block View Component
 * 
 * Renders a testimonials section with comprehensive support for:
 * - Carousel and grid layouts
 * - Customer feedback with ratings and verification
 * - Interactive carousel controls
 * - Accessibility features and SEO optimization
 * - Token-driven styling with brand switching
 */
interface TestimonialsBlockViewProps {
  content: TestimonialsBlockContent;
  className?: string;
}

export function TestimonialsBlockView({ content, className = '' }: TestimonialsBlockViewProps) {
  const {
    content: testimonialsContent,
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
      lg: 'py-16 sm:py-24 md:py-32',
      xl: 'py-20 sm:py-32 md:py-40',
    },
    background: {
      none: '',
      subtle: 'bg-gray-100 dark:bg-gray-900',
      gradient: 'bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
      pattern: 'bg-gray-100 dark:bg-gray-900',
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

  // Render star rating
  const renderRating = (rating: NonNullable<TestimonialsBlockContent['content']['testimonials'][0]['rating']>) => {
    if (!rating.show) return null;

    return (
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: rating.max }, (_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${
              i < rating.value
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
          {rating.value}/{rating.max}
        </span>
      </div>
    );
  };

  // Render testimonial card
  const renderTestimonialCard = (testimonial: TestimonialsBlockContent['content']['testimonials'][0]) => (
    <Card
      className={`
        group high-tech-card high-tech-glow high-tech-shimmer high-tech-border rounded-2xl h-full flex flex-col relative overflow-hidden transition-all duration-200
        ${layoutClasses.card.variant[layout.card.variant]}
        ${layoutClasses.card.padding[layout.card.padding]}
        ${layout.card.className || ''}
        ${testimonial.featured ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
      `}
      style={{
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-100/0 group-hover:from-blue-50/20 group-hover:via-blue-50/10 group-hover:to-blue-100/30 transition-all duration-100 ease-out" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-100 bg-gradient-to-r from-blue-400/20 via-transparent to-blue-600/20 blur-xl" />
      
      <CardContent className="flex flex-col h-full relative z-10">
        {/* Featured badge */}
        {testimonial.featured && (
          <Badge
            variant="secondary"
            className="mb-4 self-start bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
          >
            ⭐ Featured
          </Badge>
        )}

        {/* Rating */}
        {testimonial.rating && renderRating(testimonial.rating)}

        {/* Testimonial content */}
        <blockquote className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 flex-grow mb-6 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-100 high-tech-text">
          "{testimonial.content}"
        </blockquote>

        {/* Tags */}
        {testimonial.tags && testimonial.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {testimonial.tags.map((tag, tagIndex) => (
              <Badge
                key={tagIndex}
                variant="outline"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Author */}
        <div className="flex items-center gap-4">
          {testimonial.author.avatar && (
            <img
              src={testimonial.author.avatar.src}
              alt={testimonial.author.avatar.alt}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <cite className="text-sm font-semibold text-gray-900 dark:text-gray-100 not-italic">
                {testimonial.author.name}
              </cite>
              {testimonial.author.verified && (
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            {testimonial.author.title && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {testimonial.author.title}
                {testimonial.author.company && ` at ${testimonial.author.company}`}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Convert testimonials to carousel format
  const carouselTestimonials = testimonialsContent.testimonials.map((testimonial) => ({
    id: testimonial.id,
    name: testimonial.author.name,
    role: testimonial.author.title || testimonial.author.company || '',
    quote: testimonial.content,
    rating: testimonial.rating?.value || 5,
    avatar: testimonial.author.avatar?.src,
  }));

  return (
    <section
      className={`
        relative overflow-hidden
        ${layoutClasses.background[layout.background]}
        ${layoutClasses.padding[layout.padding]}
        ${className}
      `}
      aria-labelledby={testimonialsContent.header.title}
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
          <motion.div className="mb-12 sm:mb-16 md:mb-20" variants={itemVariants}>
            <h2
              id={testimonialsContent.header.title}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight text-gray-900 dark:text-gray-100"
            >
              {testimonialsContent.header.title}
            </h2>
            
            {testimonialsContent.header.subtitle && (
              <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-gray-700 dark:text-gray-300 px-4 sm:px-0">
                <strong className="text-gray-900 dark:text-gray-100">{testimonialsContent.header.subtitle}</strong>
              </p>
            )}
            
            {testimonialsContent.header.description && (
              <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-gray-700 dark:text-gray-300 px-4 sm:px-0">
                {testimonialsContent.header.description}
              </p>
            )}
          </motion.div>

          {/* Testimonials Display */}
          <motion.div variants={itemVariants}>
            {layout.variant === 'carousel' && testimonialsContent.carousel?.enabled ? (
              <div className="px-2 sm:px-4 md:px-0">
                <TestimonialsCarousel
                  testimonials={carouselTestimonials}
                  autoPlay={testimonialsContent.carousel.autoPlay}
                  autoPlayInterval={testimonialsContent.carousel.autoPlayInterval}
                  showDots={testimonialsContent.carousel.showDots}
                  showArrows={testimonialsContent.carousel.showArrows}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonialsContent.testimonials.map((testimonial) => (
                  <motion.div key={testimonial.id} variants={itemVariants}>
                    {renderTestimonialCard(testimonial)}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Section CTA */}
          {testimonialsContent.cta && (
            <motion.div
              className="mt-20 text-center"
              variants={itemVariants}
            >
              {testimonialsContent.cta.title && (
                <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                  {testimonialsContent.cta.title}
                </h3>
              )}
              
              {testimonialsContent.cta.description && (
                <p className="text-xl mb-8 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto whitespace-pre-line">
                  {testimonialsContent.cta.description}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  variant={testimonialsContent.cta.primary.variant}
                  size={testimonialsContent.cta.primary.size}
                  className="high-tech-button high-tech-glow high-tech-shimmer px-8 py-4 text-lg font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-black"
                >
                  <Link
                    href={testimonialsContent.cta.primary.href}
                    {...(testimonialsContent.cta.primary.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    <span className="high-tech-text">{testimonialsContent.cta.primary.text}</span>
                  </Link>
                </Button>

                {testimonialsContent.cta.secondary && (
                  <Button
                    asChild
                    variant={testimonialsContent.cta.secondary.variant}
                    size={testimonialsContent.cta.secondary.size}
                    className="high-tech-button high-tech-glow high-tech-shimmer high-tech-border px-8 py-4 text-lg font-medium border bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  >
                    <Link
                      href={testimonialsContent.cta.secondary.href}
                      {...(testimonialsContent.cta.secondary.external && { target: '_blank', rel: 'noopener noreferrer' })}
                    >
                      <span className="high-tech-text">{testimonialsContent.cta.secondary.text}</span>
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

export default TestimonialsBlockView;
