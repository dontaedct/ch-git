/**
 * @fileoverview Brand-Aware UI Components Index for HT-011.3.1
 * @module components/ui/brand-aware
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.3.1: Update Component Library for Brand Customization
 * 
 * This module exports all brand-aware UI components that support:
 * - Dynamic brand colors from tenant configuration
 * - Brand-aware styling that adapts to client brand
 * - Support for brand-specific color palettes
 * - Integration with dynamic branding system
 * 
 * @example
 * ```tsx
 * import { 
 *   BrandAwareButton, 
 *   BrandAwareBadge, 
 *   BrandAwareInput,
 *   BrandAwareErrorNotification 
 * } from '@/components/ui/brand-aware';
 * 
 * // Use brand-aware components
 * <BrandAwareButton variant="primary">Click me</BrandAwareButton>
 * <BrandAwareBadge variant="success">Success</BrandAwareBadge>
 * <BrandAwareInput placeholder="Enter text" />
 * <BrandAwareErrorNotification severity="high" message="Error occurred" />
 * ```
 */

// Brand-aware button components
export {
  BrandAwareButton,
  brandAwareButtonVariants,
  BrandPrimaryButton,
  BrandSecondaryButton,
  BrandCTAButton,
  BrandOutlineButton,
  BrandGhostButton
} from './brand-aware-button';

// Brand-aware badge components
export {
  BrandAwareBadge,
  brandAwareBadgeVariants,
  BrandPrimaryBadge,
  BrandSecondaryBadge,
  BrandSuccessBadge,
  BrandWarningBadge,
  BrandErrorBadge,
  BrandInfoBadge,
  BrandOutlineBadge
} from './brand-aware-badge';

// Brand-aware input components
export {
  BrandAwareInput,
  brandAwareInputVariants,
  BrandAwareTextInput,
  BrandAwareEmailInput,
  BrandAwarePasswordInput,
  BrandAwareNumberInput
} from './brand-aware-input';

// Brand-aware error notification components
export {
  BrandAwareErrorNotification,
  brandAwareErrorVariants,
  BrandInfoNotification,
  BrandWarningNotification,
  BrandErrorNotification,
  BrandCriticalNotification,
  ErrorSeverity,
  ErrorCategory
} from './brand-aware-error-notification';

// Re-export types for convenience
export type { BrandAwareButtonProps } from './brand-aware-button';
export type { BrandAwareBadgeProps } from './brand-aware-badge';
export type { BrandAwareInputProps } from './brand-aware-input';
export type { BrandAwareErrorNotificationProps } from './brand-aware-error-notification';
