/**
 * @fileoverview Dynamic Logo Component
 * @module components/branding/DynamicLogo
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import Image from 'next/image';
import { useLogoConfig } from '@/lib/branding/hooks';
import { cn } from '@/lib/utils';

interface DynamicLogoProps {
  /** Additional CSS classes */
  className?: string;
  /** Logo size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show as image or initials */
  forceInitials?: boolean;
  /** Custom width override */
  width?: number;
  /** Custom height override */
  height?: number;
  /** Whether to show fallback on error */
  showFallback?: boolean;
}

const sizeVariants = {
  sm: { width: 20, height: 20, textSize: 'text-xs' },
  md: { width: 28, height: 28, textSize: 'text-sm' },
  lg: { width: 40, height: 40, textSize: 'text-lg' },
  xl: { width: 56, height: 56, textSize: 'text-xl' },
};

export function DynamicLogo({
  className,
  size = 'md',
  forceInitials = false,
  width,
  height,
  showFallback = true,
}: DynamicLogoProps) {
  const { logoConfig } = useLogoConfig();
  
  const sizeConfig = sizeVariants[size];
  const logoWidth = width || sizeConfig.width;
  const logoHeight = height || sizeConfig.height;
  
  const shouldShowAsImage = logoConfig.showAsImage && !forceInitials;
  const logoAlt = logoConfig.alt || 'Logo';
  
  if (shouldShowAsImage && logoConfig.src) {
    return (
      <Image
        src={logoConfig.src}
        alt={logoAlt}
        width={logoWidth}
        height={logoHeight}
        className={cn(
          logoConfig.className,
          className
        )}
        onError={(e) => {
          if (showFallback) {
            // Switch to initials fallback on image load error
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }
        }}
      />
    );
  }
  
  // Show initials fallback
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg bg-gradient-to-br',
        logoConfig.fallbackBgColor,
        sizeConfig.textSize,
        'font-bold text-white',
        className
      )}
      style={{
        width: logoWidth,
        height: logoHeight,
      }}
    >
      {logoConfig.initials}
    </div>
  );
}

/**
 * Logo with fallback component that shows image first, then initials on error
 */
export function LogoWithFallback({
  className,
  size = 'md',
  width,
  height,
}: Omit<DynamicLogoProps, 'forceInitials' | 'showFallback'>) {
  const { logoConfig } = useLogoConfig();
  
  const sizeConfig = sizeVariants[size];
  const logoWidth = width || sizeConfig.width;
  const logoHeight = height || sizeConfig.height;
  
  if (logoConfig.showAsImage && logoConfig.src) {
    return (
      <div className="relative">
        <Image
          src={logoConfig.src}
          alt={logoConfig.alt || 'Logo'}
          width={logoWidth}
          height={logoHeight}
          className={cn(
            logoConfig.className,
            className
          )}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }}
        />
        <div
          className={cn(
            'hidden items-center justify-center rounded-lg bg-gradient-to-br',
            logoConfig.fallbackBgColor,
            sizeConfig.textSize,
            'font-bold text-white',
            className
          )}
          style={{
            width: logoWidth,
            height: logoHeight,
          }}
        >
          {logoConfig.initials}
        </div>
      </div>
    );
  }
  
  // Show initials only
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg bg-gradient-to-br',
        logoConfig.fallbackBgColor,
        sizeConfig.textSize,
        'font-bold text-white',
        className
      )}
      style={{
        width: logoWidth,
        height: logoHeight,
      }}
    >
      {logoConfig.initials}
    </div>
  );
}
