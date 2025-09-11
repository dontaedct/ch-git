/**
 * @fileoverview HT-011.1.8: Brand Preview and Testing System Exports
 * @module lib/branding/index
 * @author OSS Hero System
 * @version 1.3.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.8 - Implement Brand Preview and Testing System
 * Focus: Export all branding system components including preview and testing functionality
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (branding system enhancement)
 */

// Brand preview and testing system exports
export * from './preview-testing-manager';
export * from './preview-testing-hooks';

// Brand import/export system exports
export * from './import-export-manager';
export * from './import-export-hooks';

// Brand preset system exports
export * from './preset-manager';
export * from './preset-hooks';

// Brand validation framework exports
export * from './validation-framework';
export * from './validation-hooks';

// Email system exports (HT-011.3.5)
export * from './email-templates';
export * from './email-styling';
export * from './marketing-templates';
export * from './email-customization';

// Existing branding system exports
export * from './logo-manager';
export * from './types';

// Brand quality assurance exports (HT-011.4.8)
export * from './brand-quality-assurance';

// Design tokens exports
export * from '../design-tokens/multi-brand-generator';
export * from '../design-tokens/provider';
export * from '../design-tokens/tokens';
