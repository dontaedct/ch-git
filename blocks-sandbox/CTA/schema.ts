/**
 * @fileoverview CTA Block Schema - HT-006 Phase 3
 * @module blocks-sandbox/CTA/schema
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
 * CTA Block Content Schema
 * 
 * Defines the structure for call-to-action sections with comprehensive
 * validation for conversion optimization and brand awareness.
 */
export const CTABlockSchema = z.object({
  // Block identification
  id: z.string().min(1, 'CTA block must have an ID'),
  type: z.literal('cta'),
  
  // Content structure
  content: z.object({
    // Main content
    headline: z.string().min(1, 'CTA headline is required'),
    description: z.string().optional(),
    subtext: z.string().optional(),
    
    // Call-to-action buttons
    primary: z.object({
      text: z.string().min(1, 'Primary CTA text is required'),
      href: z.string().url('Primary CTA must have valid URL'),
      variant: z.enum(['primary', 'secondary', 'ghost', 'link']).default('primary'),
      size: z.enum(['sm', 'md', 'lg']).default('lg'),
      external: z.boolean().default(false),
      className: z.string().optional(),
    }),
    secondary: z.object({
      text: z.string().min(1, 'Secondary CTA text is required'),
      href: z.string().url('Secondary CTA must have valid URL'),
      variant: z.enum(['primary', 'secondary', 'ghost', 'link']).default('secondary'),
      size: z.enum(['sm', 'md', 'lg']).default('lg'),
      external: z.boolean().default(false),
      className: z.string().optional(),
    }).optional(),
    
    // Visual elements
    visual: z.object({
      type: z.enum(['image', 'icon', 'emoji', 'none']).default('none'),
      value: z.string().optional(),
      className: z.string().optional(),
    }).optional(),
    
    // Trust indicators
    trust: z.object({
      badges: z.array(z.string()).optional(),
      testimonials: z.array(z.string()).optional(),
      guarantees: z.array(z.string()).optional(),
    }).optional(),
  }),
  
  // Layout configuration
  layout: z.object({
    variant: z.enum(['centered', 'split', 'minimal']).default('centered'),
    alignment: z.enum(['left', 'center', 'right']).default('center'),
    maxWidth: z.enum(['sm', 'md', 'lg', 'xl', '2xl', '4xl', 'full']).default('4xl'),
    padding: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('lg'),
    background: z.enum(['none', 'subtle', 'gradient', 'pattern', 'brand']).default('gradient'),
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
export type CTABlockContent = z.infer<typeof CTABlockSchema>;

/**
 * CTA block configuration for registry
 */
export const ctaBlockConfig = {
  id: 'cta',
  name: 'Call-to-Action Section',
  description: 'Conversion-focused CTA with trust indicators',
  category: 'conversion',
  schema: CTABlockSchema,
  defaultContent: {
    id: 'cta-default',
    type: 'cta' as const,
    content: {
      headline: 'Ready to get your micro-app?',
      description: '• Fixed scope — no scope creep\n• ~1 week delivery — fast turnaround\n• One-time fee — no subscriptions\n• U.S.-focused — proven templates',
      primary: {
        text: 'Get Started',
        href: '/get-started',
        variant: 'primary' as const,
        size: 'lg' as const,
        external: false,
      },
      secondary: {
        text: 'View Examples',
        href: '/examples',
        variant: 'secondary' as const,
        size: 'lg' as const,
        external: false,
      },
    },
    layout: {
      variant: 'centered' as const,
      alignment: 'center' as const,
      maxWidth: '4xl' as const,
      padding: 'lg' as const,
      background: 'gradient' as const,
    },
  },
} as const;
