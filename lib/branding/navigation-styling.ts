/**
 * @fileoverview Brand-Aware Navigation Styling Hook
 * @module lib/branding/navigation-styling
 * @author OSS Hero System
 * @version 1.0.0
 */

import { useBrandNames } from './hooks';
import { cn } from '@/lib/utils';

export interface BrandNavigationStyles {
  // Header styles
  headerBg: string;
  headerBorder: string;
  headerText: string;
  
  // Navigation link styles
  linkText: string;
  linkHover: string;
  linkActive: string;
  linkFocus: string;
  
  // Logo styles
  logoSize: 'sm' | 'md' | 'lg';
  logoClassName: string;
  
  // Brand text styles
  brandText: string;
  brandTextHover: string;
  
  // Mobile menu styles
  mobileMenuBg: string;
  mobileMenuBorder: string;
  mobileMenuText: string;
}

/**
 * Generate brand-aware navigation styles based on current brand configuration
 */
export function useBrandNavigationStyles(): BrandNavigationStyles {
  const { brandNames } = useBrandNames();
  
  // Default styles that work with any brand
  const defaultStyles: BrandNavigationStyles = {
    // Header styles
    headerBg: 'bg-white dark:bg-gray-900',
    headerBorder: 'border-gray-200 dark:border-gray-700',
    headerText: 'text-gray-900 dark:text-gray-100',
    
    // Navigation link styles
    linkText: 'text-gray-600 dark:text-gray-300',
    linkHover: 'hover:text-gray-900 dark:hover:text-gray-100',
    linkActive: 'text-blue-600 dark:text-blue-400',
    linkFocus: 'focus:ring-blue-500 focus:ring-offset-2',
    
    // Logo styles
    logoSize: 'md',
    logoClassName: 'rounded-lg',
    
    // Brand text styles
    brandText: 'text-gray-900 dark:text-gray-100',
    brandTextHover: 'hover:text-gray-700 dark:hover:text-gray-300',
    
    // Mobile menu styles
    mobileMenuBg: 'bg-white dark:bg-gray-900',
    mobileMenuBorder: 'border-gray-200 dark:border-gray-700',
    mobileMenuText: 'text-gray-900 dark:text-gray-100',
  };
  
  return defaultStyles;
}

/**
 * Generate brand-aware CSS classes for navigation components
 */
export function getBrandNavigationClasses(
  variant: 'header' | 'nav-link' | 'brand-text' | 'mobile-menu' = 'header',
  isActive: boolean = false,
  customClasses?: string
): string {
  const styles = useBrandNavigationStyles();
  
  switch (variant) {
    case 'header':
      return cn(
        styles.headerBg,
        styles.headerBorder,
        styles.headerText,
        customClasses
      );
      
    case 'nav-link':
      return cn(
        styles.linkText,
        isActive ? styles.linkActive : styles.linkHover,
        styles.linkFocus,
        'transition-colors duration-200',
        customClasses
      );
      
    case 'brand-text':
      return cn(
        styles.brandText,
        styles.brandTextHover,
        'transition-colors duration-200',
        customClasses
      );
      
    case 'mobile-menu':
      return cn(
        styles.mobileMenuBg,
        styles.mobileMenuBorder,
        styles.mobileMenuText,
        customClasses
      );
      
    default:
      return cn(customClasses);
  }
}

/**
 * Brand-aware navigation component props
 */
export interface BrandNavigationProps {
  /** Navigation variant */
  variant?: 'header' | 'nav-link' | 'brand-text' | 'mobile-menu';
  /** Whether the navigation item is active */
  isActive?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Generate brand-aware navigation configuration
 */
export function getBrandNavigationConfig() {
  const { brandNames } = useBrandNames();
  
  return {
    // Brand information
    brandName: brandNames.appName,
    organizationName: brandNames.organizationName,
    fullBrand: brandNames.fullBrand,
    shortBrand: brandNames.shortBrand,
    navBrand: brandNames.navBrand,
    
    // Navigation configuration
    logoSize: 'md' as const,
    brandVariant: 'short' as const,
    
    // Styling configuration
    styles: useBrandNavigationStyles(),
  };
}
