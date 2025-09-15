/**
 * @fileoverview Testimonials Block Schema - HT-006 Phase 3
 * @module blocks-sandbox/Testimonials/schema
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
 * Testimonials Block Content Schema
 * 
 * Defines the structure for testimonials sections with comprehensive
 * validation for carousel layouts, customer feedback, and social proof.
 */
export const TestimonialsBlockSchema = z.object({
  // Block identification
  id: z.string().min(1, 'Testimonials block must have an ID'),
  type: z.literal('testimonials'),
  
  // Content structure
  content: z.object({
    // Section header
    header: z.object({
      title: z.string().min(1, 'Testimonials title is required'),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      alignment: z.enum(['left', 'center', 'right']).default('center'),
    }),
    
    // Testimonial items
    testimonials: z.array(z.object({
      id: z.string().min(1, 'Testimonial must have an ID'),
      content: z.string().min(1, 'Testimonial content is required'),
      author: z.object({
        name: z.string().min(1, 'Author name is required'),
        title: z.string().optional(),
        company: z.string().optional(),
        avatar: z.object({
          src: z.string().url('Avatar must have valid URL'),
          alt: z.string().min(1, 'Avatar must have alt text'),
        }).optional(),
        verified: z.boolean().default(false),
      }),
      rating: z.object({
        value: z.number().min(1).max(5).default(5),
        max: z.number().default(5),
        show: z.boolean().default(true),
      }).optional(),
      tags: z.array(z.string()).optional(),
      featured: z.boolean().default(false),
    })).min(1, 'Testimonials must have at least one item'),
    
    // Carousel configuration
    carousel: z.object({
      enabled: z.boolean().default(true),
      autoPlay: z.boolean().default(true),
      autoPlayInterval: z.number().min(1000).default(6000),
      showDots: z.boolean().default(true),
      showArrows: z.boolean().default(true),
      slidesToShow: z.number().min(1).default(1),
      slidesToScroll: z.number().min(1).default(1),
      infinite: z.boolean().default(true),
    }).optional(),
    
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
    variant: z.enum(['carousel', 'grid', 'list']).default('carousel'),
    alignment: z.enum(['left', 'center', 'right']).default('center'),
    maxWidth: z.enum(['sm', 'md', 'lg', 'xl', '2xl', '4xl', '6xl', '7xl', 'full']).default('6xl'),
    padding: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('lg'),
    background: z.enum(['none', 'subtle', 'gradient', 'pattern']).default('subtle'),
    card: z.object({
      variant: z.enum(['default', 'elevated', 'outlined', 'filled']).default('default'),
      padding: z.enum(['sm', 'md', 'lg']).default('lg'),
      className: z.string().optional(),
    }),
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
export type TestimonialsBlockContent = z.infer<typeof TestimonialsBlockSchema>;

/**
 * Testimonials block configuration for registry
 */
export const testimonialsBlockConfig = {
  id: 'testimonials',
  name: 'Testimonials Section',
  description: 'Customer testimonials with carousel or grid layout',
  category: 'social-proof',
  schema: TestimonialsBlockSchema,
  defaultContent: {
    id: 'testimonials-default',
    type: 'testimonials' as const,
    content: {
      header: {
        title: 'What Our Clients Say',
        subtitle: 'Real feedback from businesses',
        description: 'Hear from businesses who got their micro-apps delivered in ~a week.',
        alignment: 'center' as const,
      },
      testimonials: [
        {
          id: 'testimonial-1',
          content: 'The salon booking system was delivered exactly as promised. Our waitlist management is now automated and our staff loves the simple interface.',
          author: {
            name: 'Sarah Johnson',
            title: 'Owner',
            company: 'Bella Vista Salon',
            verified: true,
          },
          rating: {
            value: 5,
            max: 5,
            show: true,
          },
          featured: true,
        },
        {
          id: 'testimonial-2',
          content: 'As a realtor, the MLS integration saved me hours every week. The branded listing pages look professional and convert better than our old system.',
          author: {
            name: 'Mike Chen',
            title: 'Real Estate Agent',
            company: 'Premier Properties',
            verified: true,
          },
          rating: {
            value: 5,
            max: 5,
            show: true,
          },
        },
      ],
      carousel: {
        enabled: true,
        autoPlay: true,
        autoPlayInterval: 6000,
        showDots: true,
        showArrows: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
      },
    },
    layout: {
      variant: 'carousel' as const,
      alignment: 'center' as const,
      maxWidth: '6xl' as const,
      padding: 'lg' as const,
      background: 'subtle' as const,
      card: {
        variant: 'default' as const,
        padding: 'lg' as const,
      },
    },
  },
} as const;
