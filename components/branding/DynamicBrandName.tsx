/**
 * @fileoverview Dynamic Brand Name Component
 * @module components/branding/DynamicBrandName
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import { useBrandNames, useLogoConfig } from '@/lib/branding/hooks';
import { DynamicLogo } from './DynamicLogo';
import { cn } from '@/lib/utils';

interface DynamicBrandNameProps {
  /** Brand name variant to display */
  variant?: 'full' | 'short' | 'nav' | 'organization' | 'app';
  /** Additional CSS classes */
  className?: string;
  /** Whether to show on mobile (for responsive variants) */
  showOnMobile?: boolean;
  /** Whether to show on desktop (for responsive variants) */
  showOnDesktop?: boolean;
}

export function DynamicBrandName({
  variant = 'full',
  className,
  showOnMobile = true,
  showOnDesktop = true,
}: DynamicBrandNameProps) {
  const { brandNames } = useBrandNames();
  
  const getBrandText = () => {
    switch (variant) {
      case 'full':
        return brandNames.fullBrand;
      case 'short':
        return brandNames.shortBrand;
      case 'nav':
        return brandNames.navBrand;
      case 'organization':
        return brandNames.organizationName;
      case 'app':
        return brandNames.appName;
      default:
        return brandNames.fullBrand;
    }
  };
  
  const brandText = getBrandText();
  
  const responsiveClasses = cn(
    showOnMobile ? 'sm:hidden' : '',
    showOnDesktop ? 'hidden sm:inline' : ''
  );
  
  return (
    <span className={cn(responsiveClasses, className)}>
      {brandText}
    </span>
  );
}

/**
 * Responsive brand name that shows different variants on mobile vs desktop
 */
export function ResponsiveBrandName({
  mobileVariant = 'short',
  desktopVariant = 'full',
  className,
}: {
  mobileVariant?: 'full' | 'short' | 'nav' | 'organization' | 'app';
  desktopVariant?: 'full' | 'short' | 'nav' | 'organization' | 'app';
  className?: string;
}) {
  return (
    <>
      <DynamicBrandName
        variant={mobileVariant}
        className={cn('sm:hidden', className)}
      />
      <DynamicBrandName
        variant={desktopVariant}
        className={cn('hidden sm:inline', className)}
      />
    </>
  );
}

/**
 * Brand name with logo component
 */
export function BrandWithLogo({
  logoSize = 'md',
  brandVariant = 'full',
  className,
  logoClassName,
  brandClassName,
}: {
  logoSize?: 'sm' | 'md' | 'lg' | 'xl';
  brandVariant?: 'full' | 'short' | 'nav' | 'organization' | 'app';
  className?: string;
  logoClassName?: string;
  brandClassName?: string;
}) {
  const { logoConfig } = useLogoConfig();
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DynamicLogo
        size={logoSize}
        className={logoClassName}
      />
      <DynamicBrandName
        variant={brandVariant}
        className={brandClassName}
      />
    </div>
  );
}
