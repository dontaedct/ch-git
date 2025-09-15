/**
 * @fileoverview HT-011.1.8: Brand Preview and Testing System Components Index
 * @module components/branding
 * @author OSS Hero System
 * @version 1.4.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.8 - Implement Brand Preview and Testing System
 * Focus: Export all branding components including preview and testing functionality
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (branding system enhancement)
 */

// Existing branding components
export { DynamicLogo, LogoWithFallback } from './DynamicLogo';
export { DynamicBrandName, ResponsiveBrandName, BrandWithLogo } from './DynamicBrandName';
export { BrandProvider, useBrandContext } from './BrandProvider';

// Dynamic brand content components (HT-011.3.3)
export {
  DynamicBrandContent,
  DynamicEmailFrom,
  DynamicWelcomeMessage,
  DynamicTransactionalFooter,
  DynamicPageTitle,
  DynamicPageDescription,
  DynamicBrandText
} from './DynamicBrandContent';

// Brand integration demo components (HT-011.3.3)
export {
  BrandIntegrationDemo,
  BrandElementPreview,
  EmailTemplatePreview
} from './BrandIntegrationDemo';

// Brand-aware navigation components (HT-011.3.4)
export {
  BrandAwareNavigation
} from './BrandAwareNavigation';

// Brand preset system components
export { 
  PresetCard, 
  PresetSelector, 
  PresetManager 
} from './preset-components';

// Brand validation framework components
export { 
  ValidationResultItem,
  ValidationSummary,
  ValidationDetails,
  ValidationConfig,
  ValidationStatusIndicator,
  BrandValidator
} from './validation-components';

// Brand import/export system components
export {
  BrandExport,
  BrandImport,
  FileUploadArea,
  ImportHistory,
  BrandAnalytics,
  BrandImportExportManager
} from './import-export-components';

// Brand preview and testing system components
export {
  BrandPreview,
  BrandTesting,
  BrandPreviewTestingManager,
  BrandPreviewMetrics
} from './preview-testing-components';
