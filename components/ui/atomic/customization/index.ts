/**
 * @fileoverview HT-022.4.1: Simple Customization Tools Export
 * @module components/ui/atomic/customization
 * @author Agency Component System
 * @version 1.0.0
 *
 * SIMPLE CUSTOMIZATION TOOLS: Central export for client branding tools
 * Enables ≤4 hour client branding and customization workflow
 */

// Main customization components
export { SimpleCustomizationWizard } from './simple-customization-wizard';
export { QuickBrandGenerator } from './quick-brand-generator';
export { BrandExportManager } from './brand-export-manager';

// Re-export types for convenience
export type { SimpleClientTheme } from '../theming/simple-theme-provider';
export type { BrandPreset, PresetCustomization } from '@/lib/branding/preset-manager';