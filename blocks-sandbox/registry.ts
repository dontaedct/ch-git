/**
 * @fileoverview Block Registry - HT-006 Phase 3
 * @module blocks-sandbox/registry
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

// Import block schemas
import { HeroBlockSchema, HeroBlockContent, heroBlockConfig } from './Hero/schema';
import { FeaturesBlockSchema, FeaturesBlockContent, featuresBlockConfig } from './Features/schema';
import { TestimonialsBlockSchema, TestimonialsBlockContent, testimonialsBlockConfig } from './Testimonials/schema';
import { PricingBlockSchema, PricingBlockContent, pricingBlockConfig } from './Pricing/schema';
import { FAQBlockSchema, FAQBlockContent, faqBlockConfig } from './FAQ/schema';
import { CTABlockSchema, CTABlockContent, ctaBlockConfig } from './CTA/schema';

// Import block views
import { HeroBlockView } from './Hero/view';
import { FeaturesBlockView } from './Features/view';
import { TestimonialsBlockView } from './Testimonials/view';
import { PricingBlockView } from './Pricing/view';
import { FAQBlockView } from './FAQ/view';
import { CTABlockView } from './CTA/view';

/**
 * Union type for all block content types
 */
export type BlockContent = 
  | HeroBlockContent
  | FeaturesBlockContent
  | TestimonialsBlockContent
  | PricingBlockContent
  | FAQBlockContent
  | CTABlockContent;

/**
 * Block type enum for type safety
 */
export const BlockType = {
  HERO: 'hero',
  FEATURES: 'features',
  TESTIMONIALS: 'testimonials',
  PRICING: 'pricing',
  FAQ: 'faq',
  CTA: 'cta',
} as const;

export type BlockTypeValue = typeof BlockType[keyof typeof BlockType];

/**
 * Block configuration interface
 */
export interface BlockConfig {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly schema: z.ZodSchema<any>;
  readonly defaultContent: BlockContent;
}

/**
 * Block registry containing all available blocks
 */
export const blockRegistry: Record<string, BlockConfig> = {
  [BlockType.HERO]: heroBlockConfig as unknown as BlockConfig,
  [BlockType.FEATURES]: featuresBlockConfig as unknown as BlockConfig,
  [BlockType.TESTIMONIALS]: testimonialsBlockConfig as unknown as BlockConfig,
  [BlockType.PRICING]: pricingBlockConfig as unknown as BlockConfig,
  [BlockType.FAQ]: faqBlockConfig as unknown as BlockConfig,
  [BlockType.CTA]: ctaBlockConfig as unknown as BlockConfig,
};

/**
 * Block view components mapping
 */
export const blockViews: Record<string, React.ComponentType<any>> = {
  [BlockType.HERO]: HeroBlockView,
  [BlockType.FEATURES]: FeaturesBlockView,
  [BlockType.TESTIMONIALS]: TestimonialsBlockView,
  [BlockType.PRICING]: PricingBlockView,
  [BlockType.FAQ]: FAQBlockView,
  [BlockType.CTA]: CTABlockView,
};

/**
 * Validate block content against its schema
 */
export function validateBlockContent(content: any): { valid: boolean; data?: BlockContent; error?: string } {
  try {
    // Extract block type from content
    const blockType = content?.type;
    if (!blockType || !blockRegistry[blockType]) {
      return {
        valid: false,
        error: `Unknown block type: ${blockType}`,
      };
    }

    // Get the schema for this block type
    const schema = blockRegistry[blockType].schema;
    
    // Validate the content
    const validatedData = schema.parse(content);
    
    return {
      valid: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
      };
    }
    
    return {
      valid: false,
      error: `Unknown error: ${error}`,
    };
  }
}

/**
 * Get block configuration by type
 */
export function getBlockConfig(blockType: string): BlockConfig | null {
  return blockRegistry[blockType] || null;
}

/**
 * Get block view component by type
 */
export function getBlockView(blockType: string): React.ComponentType<any> | null {
  return blockViews[blockType] || null;
}

/**
 * Get all available block types
 */
export function getAvailableBlockTypes(): string[] {
  return Object.keys(blockRegistry);
}

/**
 * Get blocks by category
 */
export function getBlocksByCategory(category: string): BlockConfig[] {
  return Object.values(blockRegistry).filter(config => config.category === category);
}

/**
 * Get default content for a block type
 */
export function getDefaultBlockContent(blockType: string): BlockContent | null {
  const config = getBlockConfig(blockType);
  return config ? config.defaultContent : null;
}

/**
 * Block registry metadata
 */
export const registryMetadata = {
  version: '1.0.0',
  totalBlocks: Object.keys(blockRegistry).length,
  categories: [...new Set(Object.values(blockRegistry).map(config => config.category))],
  lastUpdated: new Date().toISOString(),
};

export default blockRegistry;
