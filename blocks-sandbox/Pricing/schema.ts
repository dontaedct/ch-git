/**
 * @fileoverview Pricing Block Schema - HT-006 Phase 3
 * @module blocks-sandbox/Pricing/schema
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
 * Pricing Block Content Schema
 * 
 * Defines the structure for pricing sections with comprehensive
 * validation for tier comparisons, pricing tables, and CTA integration.
 */
export const PricingBlockSchema = z.object({
  // Block identification
  id: z.string().min(1, 'Pricing block must have an ID'),
  type: z.literal('pricing'),
  
  // Content structure
  content: z.object({
    // Section header
    header: z.object({
      title: z.string().min(1, 'Pricing title is required'),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      alignment: z.enum(['left', 'center', 'right']).default('center'),
    }),
    
    // Pricing tiers
    tiers: z.array(z.object({
      id: z.string().min(1, 'Tier must have an ID'),
      name: z.string().min(1, 'Tier name is required'),
      description: z.string().optional(),
      price: z.object({
        amount: z.string().min(1, 'Price amount is required'),
        currency: z.string().default('$'),
        period: z.string().optional(),
        originalAmount: z.string().optional(),
      }),
      features: z.array(z.string()).min(1, 'Tier must have at least one feature'),
      cta: z.object({
        text: z.string().min(1, 'CTA text is required'),
        href: z.string().url('CTA must have valid URL'),
        variant: z.enum(['primary', 'secondary', 'ghost', 'link']).default('primary'),
        external: z.boolean().default(false),
      }),
      popular: z.boolean().default(false),
      badge: z.string().optional(),
      className: z.string().optional(),
    })).min(1, 'Pricing must have at least one tier'),
    
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
    variant: z.enum(['cards', 'table', 'comparison']).default('cards'),
    columns: z.enum(['1', '2', '3', '4']).default('3'),
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
export type PricingBlockContent = z.infer<typeof PricingBlockSchema>;

/**
 * Pricing block configuration for registry
 */
export const pricingBlockConfig = {
  id: 'pricing',
  name: 'Pricing Section',
  description: 'Pricing tiers with comparison and CTA integration',
  category: 'conversion',
  schema: PricingBlockSchema,
  defaultContent: {
    id: 'pricing-default',
    type: 'pricing' as const,
    content: {
      header: {
        title: 'Simple Pricing',
        subtitle: 'Choose your plan',
        description: 'Select the plan that works best for your business needs.',
        alignment: 'center' as const,
      },
      tiers: [
        {
          id: 'basic',
          name: 'Basic',
          description: 'Perfect for small businesses',
          price: {
            amount: '499',
            currency: '$',
            period: 'one-time',
          },
          features: [
            'Core functionality',
            'Basic customization',
            'Email support',
            '1 week delivery',
          ],
          cta: {
            text: 'Get Started',
            href: '/get-started?plan=basic',
            variant: 'primary' as const,
          },
        },
        {
          id: 'pro',
          name: 'Pro',
          description: 'Most popular choice',
          price: {
            amount: '899',
            currency: '$',
            period: 'one-time',
          },
          features: [
            'Everything in Basic',
            'Advanced customization',
            'Priority support',
            '5 day delivery',
            'Training session',
          ],
          cta: {
            text: 'Get Started',
            href: '/get-started?plan=pro',
            variant: 'primary' as const,
          },
          popular: true,
          badge: 'Most Popular',
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          description: 'For large organizations',
          price: {
            amount: '1,500',
            currency: '$',
            period: 'one-time',
          },
          features: [
            'Everything in Pro',
            'Full customization',
            'Dedicated support',
            '3 day delivery',
            'Training & onboarding',
            'Custom integrations',
          ],
          cta: {
            text: 'Contact Sales',
            href: '/contact?plan=enterprise',
            variant: 'secondary' as const,
          },
        },
      ],
    },
    layout: {
      variant: 'cards' as const,
      columns: '3' as const,
      alignment: 'center' as const,
      maxWidth: '7xl' as const,
      padding: 'lg' as const,
      background: 'subtle' as const,
    },
  },
} as const;
