/**
 * @fileoverview Hero Block Schema - HT-006 Phase 3
 * @module blocks-sandbox/Hero/schema
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-006 - Token-Driven Design System & Block-Based Architecture
 * Focus: JSON-driven block architecture with Zod validation
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: Medium (new architecture patterns, complex validation)
 */

import { z } from 'zod';

/**
 * Hero Block Content Schema
 * 
 * Defines the structure for hero section content with comprehensive
 * validation for all possible hero configurations including:
 * - Headlines and subheadings
 * - Call-to-action buttons
 * - Background and visual elements
 * - Accessibility and SEO metadata
 */
export const HeroBlockSchema = z.object({
  // Block identification
  id: z.string().min(1, 'Hero block must have an ID'),
  type: z.literal('hero'),
  
  // Content structure
  content: z.object({
    // Primary headline
    headline: z.object({
      text: z.string().min(1, 'Headline text is required'),
      level: z.enum(['h1', 'h2', 'h3']).default('h1'),
      className: z.string().optional(),
    }),
    
    // Subheading
    subheading: z.object({
      text: z.string().min(1, 'Subheading text is required'),
      level: z.enum(['h2', 'h3', 'h4']).default('h2'),
      className: z.string().optional(),
    }).optional(),
    
    // Description paragraph
    description: z.object({
      text: z.string().min(1, 'Description text is required'),
      className: z.string().optional(),
    }).optional(),
    
    // Call-to-action buttons
    cta: z.object({
      primary: z.object({
        text: z.string().min(1, 'Primary CTA text is required'),
        href: z.string().url('Primary CTA must have valid URL'),
        variant: z.enum(['primary', 'secondary', 'ghost', 'link']).default('primary'),
        size: z.enum(['sm', 'md', 'lg']).default('lg'),
        className: z.string().optional(),
        external: z.boolean().default(false),
      }),
      secondary: z.object({
        text: z.string().min(1, 'Secondary CTA text is required'),
        href: z.string().url('Secondary CTA must have valid URL'),
        variant: z.enum(['primary', 'secondary', 'ghost', 'link']).default('secondary'),
        size: z.enum(['sm', 'md', 'lg']).default('lg'),
        className: z.string().optional(),
        external: z.boolean().default(false),
      }).optional(),
    }),
    
    // Visual elements
    visual: z.object({
      type: z.enum(['image', 'video', 'carousel', 'animation', 'none']).default('none'),
      src: z.string().optional(),
      alt: z.string().optional(),
      className: z.string().optional(),
      // Carousel-specific properties
      carousel: z.object({
        slides: z.array(z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          mockup: z.string().optional(), // Component reference
        })).min(1, 'Carousel must have at least one slide').optional(),
        autoPlay: z.boolean().default(true),
        autoPlayInterval: z.number().min(1000).default(8000),
        showDots: z.boolean().default(true),
        showArrows: z.boolean().default(true),
      }).optional(),
    }).optional(),
    
    // Badge/announcement
    badge: z.object({
      text: z.string().min(1, 'Badge text is required'),
      variant: z.enum(['default', 'secondary', 'destructive', 'outline']).default('default'),
      className: z.string().optional(),
    }).optional(),
  }),
  
  // Layout configuration
  layout: z.object({
    alignment: z.enum(['left', 'center', 'right']).default('center'),
    maxWidth: z.enum(['sm', 'md', 'lg', 'xl', '2xl', '4xl', '6xl', '7xl', 'full']).default('6xl'),
    padding: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('lg'),
    background: z.enum(['none', 'subtle', 'gradient', 'pattern']).default('gradient'),
    className: z.string().optional(),
  }),
  
  // Accessibility and SEO
  accessibility: z.object({
    ariaLabel: z.string().optional(),
    ariaDescribedBy: z.string().optional(),
    role: z.string().optional(),
  }).optional(),
  
  // SEO metadata
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
});

/**
 * Type inference from schema
 */
export type HeroBlockContent = z.infer<typeof HeroBlockSchema>;

/**
 * Hero block configuration for registry
 */
export const heroBlockConfig = {
  id: 'hero',
  name: 'Hero Section',
  description: 'Primary landing section with headline, CTA, and visual elements',
  category: 'layout',
  schema: HeroBlockSchema,
  defaultContent: {
    id: 'hero-default',
    type: 'hero' as const,
    content: {
      headline: {
        text: 'Welcome to Our Platform',
        level: 'h1' as const,
      },
      subheading: {
        text: 'Build amazing experiences',
        level: 'h2' as const,
      },
      description: {
        text: 'Transform your business with our innovative solutions.',
      },
      cta: {
        primary: {
          text: 'Get Started',
          href: '/get-started',
          variant: 'primary' as const,
          size: 'lg' as const,
          external: false,
        },
        secondary: {
          text: 'Learn More',
          href: '/learn-more',
          variant: 'secondary' as const,
          size: 'lg' as const,
          external: false,
        },
      },
    },
    layout: {
      alignment: 'center' as const,
      maxWidth: '6xl' as const,
      padding: 'lg' as const,
      background: 'gradient' as const,
    },
  },
} as const;
