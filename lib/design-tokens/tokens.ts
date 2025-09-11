/**
 * @fileoverview HT-011.1.2: Multi-Brand Design Token System with Typography
 * @module lib/design-tokens/tokens
 * @author OSS Hero System
 * @version 3.1.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.2 - Implement Custom Typography System
 * Focus: Create flexible typography system supporting custom client fonts
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design system foundation)
 */

// Import the generator
import { generateDesignTokens } from './generator';

// Export the generated design tokens (default brand)
export const designTokens = generateDesignTokens();

// Export types
export type { DesignTokens, SemanticColors, ComponentTokens, ColorScale, LayoutTokens } from './generator';
export type { BrandPalette, MultiBrandConfig } from './multi-brand-generator';
export type { FontFamily, TypographyConfig, MultiTypographyConfig, TypographyScale, TypographyWeights } from './typography-generator';

// Export multi-brand utilities
export { 
  DEFAULT_BRAND_PALETTES,
  createMultiBrandConfig,
  validateBrandPalette 
} from './multi-brand-generator';

// Export generator utilities
export { generateDesignTokens } from './generator';

// Export typography utilities
export {
  DEFAULT_FONT_FAMILIES,
  generateTypographyConfig,
  createMultiTypographyConfig,
  validateFontFamily,
  generateGoogleFontsUrl,
  generateCustomFontFaces
} from './typography-generator';

// Export font loading utilities
export { fontLoader, useFontLoader } from './font-loader';
