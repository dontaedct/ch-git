/**
 * @fileoverview FAQ Block Schema - HT-006 Phase 3
 * @module blocks-sandbox/FAQ/schema
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
 * FAQ Block Content Schema
 * 
 * Defines the structure for FAQ sections with comprehensive
 * validation for accordion functionality and keyboard navigation.
 */
export const FAQBlockSchema = z.object({
  // Block identification
  id: z.string().min(1, 'FAQ block must have an ID'),
  type: z.literal('faq'),
  
  // Content structure
  content: z.object({
    // Section header
    header: z.object({
      title: z.string().min(1, 'FAQ title is required'),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      alignment: z.enum(['left', 'center', 'right']).default('center'),
    }),
    
    // FAQ items
    faqs: z.array(z.object({
      id: z.string().min(1, 'FAQ must have an ID'),
      question: z.string().min(1, 'FAQ question is required'),
      answer: z.string().min(1, 'FAQ answer is required'),
      category: z.string().optional(),
      featured: z.boolean().default(false),
    })).min(1, 'FAQ must have at least one item'),
    
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
    variant: z.enum(['accordion', 'list', 'grid']).default('accordion'),
    columns: z.enum(['1', '2']).default('1'),
    alignment: z.enum(['left', 'center', 'right']).default('center'),
    maxWidth: z.enum(['sm', 'md', 'lg', 'xl', '2xl', '4xl', 'full']).default('4xl'),
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
export type FAQBlockContent = z.infer<typeof FAQBlockSchema>;

/**
 * FAQ block configuration for registry
 */
export const faqBlockConfig = {
  id: 'faq',
  name: 'FAQ Section',
  description: 'Frequently asked questions with accordion functionality',
  category: 'content',
  schema: FAQBlockSchema,
  defaultContent: {
    id: 'faq-default',
    type: 'faq' as const,
    content: {
      header: {
        title: 'Frequently Asked Questions',
        subtitle: 'Got questions?',
        description: 'Find answers to common questions about our micro-apps.',
        alignment: 'center' as const,
      },
      faqs: [
        {
          id: 'delivery-time',
          question: 'How long does it take to deliver a micro-app?',
          answer: 'Most micro-apps are delivered within 5-7 business days. We provide a fixed timeline upfront and stick to it.',
          featured: true,
        },
        {
          id: 'customization',
          question: 'Can I customize the micro-app after delivery?',
          answer: 'Yes! All micro-apps come with admin panels that allow you to customize content, settings, and branding.',
        },
        {
          id: 'support',
          question: 'What kind of support do you provide?',
          answer: 'We provide email support for 30 days after delivery, plus optional ongoing support packages.',
        },
      ],
    },
    layout: {
      variant: 'accordion' as const,
      columns: '1' as const,
      alignment: 'center' as const,
      maxWidth: '4xl' as const,
      padding: 'lg' as const,
      background: 'subtle' as const,
    },
  },
} as const;
