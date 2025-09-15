/**
 * @fileoverview Brand Configuration Types
 * @module lib/branding/types
 * @author OSS Hero System
 * @version 1.0.0
 */

export interface BrandConfig {
  /** Unique brand identifier */
  id: string;
  /** Brand name */
  name: string;
  /** Brand description */
  description?: string;
  /** Whether this is a custom brand */
  isCustom: boolean;
  /** Brand preset name if applicable */
  presetName?: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

export interface BrandPalette {
  /** Brand name */
  name: string;
  /** Primary brand color */
  primary: string;
  /** Secondary brand color */
  secondary: string;
  /** Neutral brand color */
  neutral?: string;
  /** Accent brand color */
  accent?: string;
  /** Success color */
  success?: string;
  /** Warning color */
  warning?: string;
  /** Error color */
  error?: string;
  /** Info color */
  info?: string;
  /** Brand description */
  description?: string;
}

export interface BrandTheme {
  /** Brand colors */
  colors: BrandPalette;
  /** Brand typography */
  typography: {
    fontFamily: string;
    fontWeights: number[];
    fontDisplay?: string;
    scale?: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
  };
  /** Brand spacing system */
  spacing?: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  /** Brand logo configuration */
  logo: {
    src?: string;
    alt: string;
    width: number;
    height: number;
    initials: string;
    fallbackBgColor: string;
    showAsImage?: boolean;
  };
}

export interface TenantBrandConfig {
  /** Tenant ID */
  tenantId: string;
  /** Brand configuration */
  brand: BrandConfig;
  /** Brand theme */
  theme: BrandTheme;
  /** Whether branding is active */
  isActive: boolean;
  /** Brand validation status */
  validationStatus: 'valid' | 'invalid' | 'pending';
  /** Validation errors */
  validationErrors?: string[];
}
