/**
 * @fileoverview Features Block Schema - HT-006 Phase 3
 * @module blocks-sandbox/Features/schema
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
 * Features Block Content Schema
 * 
 * Defines the structure for features showcase sections with comprehensive
 * validation for grid layouts, feature cards, and interactive elements.
 */
export const FeaturesBlockSchema = z.object({
  // Block identification
  id: z.string().min(1, 'Features block must have an ID'),
  type: z.literal('features'),
  
  // Content structure
  content: z.object({
    // Section header
    header: z.object({
      title: z.string().min(1, 'Features title is required'),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      alignment: z.enum(['left', 'center', 'right']).default('center'),
    }),
    
    // Feature items
    features: z.array(z.object({
      id: z.string().min(1, 'Feature must have an ID'),
      title: z.string().min(1, 'Feature title is required'),
      description: z.string().min(1, 'Feature description is required'),
      icon: z.object({
        type: z.enum(['emoji', 'svg', 'component', 'image']).default('emoji'),
        value: z.string().min(1, 'Icon value is required'),
        className: z.string().optional(),
      }).optional(),
      image: z.object({
        src: z.string().url('Feature image must have valid URL'),
        alt: z.string().min(1, 'Feature image must have alt text'),
        className: z.string().optional(),
      }).optional(),
      cta: z.object({
        text: z.string().min(1, 'CTA text is required'),
        href: z.string().url('CTA must have valid URL'),
        variant: z.enum(['primary', 'secondary', 'ghost', 'link']).default('primary'),
        external: z.boolean().default(false),
      }).optional(),
      tags: z.array(z.string()).optional(),
      price: z.object({
        amount: z.string().min(1, 'Price amount is required'),
        currency: z.string().default('$'),
        period: z.string().optional(),
      }).optional(),
    })).min(1, 'Features must have at least one item'),
    
    // Call-to-action section
    cta: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      primary: z.object({
        text: z.string().min(1, 'Primary CTA text is required'),
        href: z.string().url('Primary CTA must have valid URL'),
        variant: z.enum(['primary', 'secondary', 'ghost', 'link']).default('primary'),
        size: z.enum(['sm', 'md', 'lg']).default('lg'),
        external: z.boolean().default(false),
      }),
      secondary: z.object({
        text: z.string().min(1, 'Secondary CTA text is required'),
        href: z.string().url('Secondary CTA must have valid URL'),
        variant: z.enum(['primary', 'secondary', 'ghost', 'link']).default('secondary'),
        size: z.enum(['sm', 'md', 'lg']).default('lg'),
        external: z.boolean().default(false),
      }).optional(),
    }).optional(),
  }),
  
  // Layout configuration
  layout: z.object({
    grid: z.object({
      columns: z.enum(['1', '2', '3', '4', '6']).default('3'),
      gap: z.enum(['sm', 'md', 'lg', 'xl']).default('lg'),
      responsive: z.object({
        mobile: z.enum(['1', '2']).default('1'),
        tablet: z.enum(['1', '2', '3']).default('2'),
        desktop: z.enum(['2', '3', '4', '6']).default('3'),
      }).optional(),
    }),
    card: z.object({
      variant: z.enum(['default', 'elevated', 'outlined', 'filled']).default('default'),
      padding: z.enum(['sm', 'md', 'lg']).default('lg'),
      hover: z.boolean().default(true),
      className: z.string().optional(),
    }),
    alignment: z.enum(['left', 'center', 'right']).default('center'),
    maxWidth: z.enum(['sm', 'md', 'lg', 'xl', '2xl', '4xl', '6xl', '7xl', 'full']).default('7xl'),
    padding: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('lg'),
    background: z.enum(['none', 'subtle', 'gradient', 'pattern']).default('subtle'),
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
export type FeaturesBlockContent = z.infer<typeof FeaturesBlockSchema>;

/**
 * Features block configuration for registry
 */
export const featuresBlockConfig = {
  id: 'features',
  name: 'Features Section',
  description: 'Showcase features with grid layout and interactive cards',
  category: 'content',
  schema: FeaturesBlockSchema,
  defaultContent: {
    id: 'features-default',
    type: 'features' as const,
    content: {
      header: {
        title: 'Our Features',
        subtitle: 'What we offer',
        description: 'Discover the powerful features that make our platform unique.',
        alignment: 'center' as const,
      },
      features: [
        {
          id: 'feature-1',
          title: 'Fast Delivery',
          description: 'Get your micro-app delivered in just one week with our proven development process.',
          icon: {
            type: 'emoji' as const,
            value: '⚡',
          },
        },
        {
          id: 'feature-2',
          title: 'Fixed Scope',
          description: 'No scope creep - we deliver exactly what we promise within the agreed timeline.',
          icon: {
            type: 'emoji' as const,
            value: '🎯',
          },
        },
        {
          id: 'feature-3',
          title: 'One-time Fee',
          description: 'Pay once and own your micro-app forever. No subscriptions or recurring costs.',
          icon: {
            type: 'emoji' as const,
            value: '💰',
          },
        },
      ],
    },
    layout: {
      grid: {
        columns: '3' as const,
        gap: 'lg' as const,
      },
      card: {
        variant: 'default' as const,
        padding: 'lg' as const,
        hover: true,
      },
      alignment: 'center' as const,
      maxWidth: '7xl' as const,
      padding: 'lg' as const,
      background: 'subtle' as const,
    },
  },
} as const;
