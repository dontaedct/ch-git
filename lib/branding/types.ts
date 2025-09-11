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
  };
  /** Brand logo configuration */
  logo: {
    src?: string;
    alt: string;
    width: number;
    height: number;
    initials: string;
    fallbackBgColor: string;
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
