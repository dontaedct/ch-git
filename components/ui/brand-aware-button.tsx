/**
 * @fileoverview Brand-Aware Button Component for HT-011.3.1
 * @module components/ui/brand-aware-button
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.3.1: Update Component Library for Brand Customization
 * 
 * This component extends the base Button component with full brand customization support:
 * - Dynamic brand colors from tenant configuration
 * - Brand-aware styling that adapts to client brand
 * - Support for brand-specific color palettes
 * - Integration with dynamic branding system
 * 
 * @example
 * ```tsx
 * // Primary brand button
 * <BrandAwareButton variant="primary">
 *   Book Consultation
 * </BrandAwareButton>
 * 
 * // Secondary brand button
 * <BrandAwareButton variant="secondary">
 *   Learn More
 * </BrandAwareButton>
 * 
 * // Brand-aware CTA with custom colors
 * <BrandAwareButton variant="cta" brandColors={{ primary: '#FF6B6B' }}>
 *   Get Started
 * </BrandAwareButton>
 * ```
 */

'use client';

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDynamicBrand } from "@/lib/branding/hooks";
import { Button, ButtonProps as BaseButtonProps } from "./button";

/**
 * Brand-aware button variants that use dynamic brand colors
 */
const brandAwareButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:transition-all",
  {
    variants: {
      variant: {
        // Primary brand button using dynamic brand colors
        primary: [
          "text-white shadow-lg hover:shadow-xl",
          "font-bold tracking-wide transition-all duration-300 ease-out",
          "hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl",
          "focus-visible:outline-3 focus-visible:outline-offset-3",
        ],
        // Secondary brand button with subtle brand colors
        secondary: [
          "shadow-md hover:shadow-lg",
          "font-semibold transition-all duration-300 ease-out",
          "hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl",
        ],
        // Outline brand button with brand border
        outline: [
          "border bg-background shadow-sm hover:shadow-lg",
          "font-medium transition-all duration-200 ease-out",
          "hover:scale-[1.015] active:scale-[0.985] hover:shadow-xl",
        ],
        // Ghost brand button with brand text
        ghost: [
          "hover:bg-opacity-10 active:bg-opacity-20",
          "focus-visible:ring-opacity-20 font-medium transition-all duration-200 ease-out",
          "hover:scale-[1.015] active:scale-[0.985] hover:shadow-lg",
        ],
        // CTA variant with enhanced brand styling
        cta: [
          "text-white shadow-lg hover:shadow-xl",
          "font-bold tracking-wide transition-all duration-300 ease-out",
          "hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl",
          "focus-visible:outline-3 focus-visible:outline-offset-3",
        ],
        // Destructive variant with brand-aware error colors
        destructive: [
          "text-white shadow-sm hover:shadow-lg",
          "transition-all duration-200 ease-out",
          "hover:scale-[1.015] active:scale-[0.985]",
        ],
      },
      size: {
        xs: "h-7 px-2 py-1 text-xs gap-1 has-[>svg]:px-1.5",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        md: "h-9 px-4 py-2 has-[>svg]:px-3",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 px-8 py-3 text-base font-semibold has-[>svg]:px-6",
        icon: "size-9",
        "icon-sm": "size-7",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface BrandAwareButtonProps extends Omit<BaseButtonProps, 'variant' | 'className'> {
  /** Button variant using brand colors */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'cta' | 'destructive';
  /** Custom brand colors override */
  brandColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    destructive?: string;
  };
  /** Whether to use brand colors from configuration */
  useBrandColors?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Generate CSS custom properties for brand colors
 */
function generateBrandCSSProperties(brandColors: BrandAwareButtonProps['brandColors']) {
  if (!brandColors) return {};
  
  const cssProps: React.CSSProperties = {};
  
  if (brandColors.primary) {
    cssProps['--brand-primary'] = brandColors.primary;
    cssProps['--brand-primary-hover'] = adjustColorBrightness(brandColors.primary, -10);
    cssProps['--brand-primary-active'] = adjustColorBrightness(brandColors.primary, -20);
    cssProps['--brand-primary-ring'] = `${brandColors.primary}20`;
  }
  
  if (brandColors.secondary) {
    cssProps['--brand-secondary'] = brandColors.secondary;
    cssProps['--brand-secondary-hover'] = adjustColorBrightness(brandColors.secondary, -10);
    cssProps['--brand-secondary-active'] = adjustColorBrightness(brandColors.secondary, -20);
  }
  
  if (brandColors.accent) {
    cssProps['--brand-accent'] = brandColors.accent;
    cssProps['--brand-accent-hover'] = adjustColorBrightness(brandColors.accent, -10);
    cssProps['--brand-accent-active'] = adjustColorBrightness(brandColors.accent, -20);
  }
  
  if (brandColors.destructive) {
    cssProps['--brand-destructive'] = brandColors.destructive;
    cssProps['--brand-destructive-hover'] = adjustColorBrightness(brandColors.destructive, -10);
    cssProps['--brand-destructive-active'] = adjustColorBrightness(brandColors.destructive, -20);
  }
  
  return cssProps;
}

/**
 * Adjust color brightness for hover/active states
 */
function adjustColorBrightness(color: string, percent: number): string {
  // Simple brightness adjustment - in production, use a proper color manipulation library
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const newR = Math.max(0, Math.min(255, r + (r * percent / 100)));
  const newG = Math.max(0, Math.min(255, g + (g * percent / 100)));
  const newB = Math.max(0, Math.min(255, b + (b * percent / 100)));
  
  return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
}

/**
 * Generate brand-aware CSS classes based on variant and brand colors
 */
function getBrandAwareClasses(variant: string, brandColors?: BrandAwareButtonProps['brandColors']) {
  const baseClasses = brandAwareButtonVariants({ variant });
  
  if (!brandColors) return baseClasses;
  
  const brandClasses: string[] = [];
  
  switch (variant) {
    case 'primary':
    case 'cta':
      if (brandColors.primary) {
        brandClasses.push(
          'bg-[var(--brand-primary)]',
          'hover:bg-[var(--brand-primary-hover)]',
          'active:bg-[var(--brand-primary-active)]',
          'focus-visible:ring-[var(--brand-primary-ring)]',
          'focus-visible:outline-[var(--brand-primary)]'
        );
      }
      break;
      
    case 'secondary':
      if (brandColors.secondary) {
        brandClasses.push(
          'bg-[var(--brand-secondary)]',
          'hover:bg-[var(--brand-secondary-hover)]',
          'active:bg-[var(--brand-secondary-active)]',
          'text-white'
        );
      }
      break;
      
    case 'outline':
      if (brandColors.primary) {
        brandClasses.push(
          'border-[var(--brand-primary)]',
          'text-[var(--brand-primary)]',
          'hover:bg-[var(--brand-primary)]/5',
          'hover:border-[var(--brand-primary)]/30',
          'active:bg-[var(--brand-primary)]/10',
          'focus-visible:ring-[var(--brand-primary-ring)]'
        );
      }
      break;
      
    case 'ghost':
      if (brandColors.primary) {
        brandClasses.push(
          'text-[var(--brand-primary)]',
          'hover:bg-[var(--brand-primary)]/10',
          'active:bg-[var(--brand-primary)]/20',
          'focus-visible:ring-[var(--brand-primary-ring)]'
        );
      }
      break;
      
    case 'destructive':
      if (brandColors.destructive) {
        brandClasses.push(
          'bg-[var(--brand-destructive)]',
          'hover:bg-[var(--brand-destructive-hover)]',
          'active:bg-[var(--brand-destructive-active)]',
          'focus-visible:ring-[var(--brand-destructive)]/20'
        );
      }
      break;
  }
  
  return cn(baseClasses, brandClasses);
}

const BrandAwareButton = React.forwardRef<HTMLButtonElement, BrandAwareButtonProps>(({
  variant = 'primary',
  size = 'default',
  brandColors,
  useBrandColors = true,
  className,
  children,
  loading = false,
  loadingText,
  disabled,
  ...props
}, ref) => {
  const { config } = useDynamicBrand();
  
  // Get brand colors from configuration if not provided
  const effectiveBrandColors = brandColors || (useBrandColors ? {
    primary: config.theme?.colors?.primary || '#007AFF',
    secondary: config.theme?.colors?.secondary || '#6B7280',
    accent: config.theme?.colors?.accent || '#10B981',
    destructive: config.theme?.colors?.destructive || '#EF4444',
  } : undefined);
  
  // Generate CSS custom properties for brand colors
  const brandCSSProps = generateBrandCSSProperties(effectiveBrandColors);
  
  // Get brand-aware CSS classes
  const brandClasses = getBrandAwareClasses(variant, effectiveBrandColors);
  
  // Determine if button should be disabled
  const isDisabled = disabled || loading;
  
  return (
    <button
      ref={ref}
      data-slot="brand-aware-button"
      data-variant={variant}
      data-loading={loading}
      style={brandCSSProps}
      className={cn(brandClasses, className)}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      
      {children && (
        <span className={cn(loading && "opacity-0")}>
          {loading && loadingText ? loadingText : children}
        </span>
      )}
    </button>
  );
});

BrandAwareButton.displayName = "BrandAwareButton";

// Specialized brand-aware button components
export const BrandPrimaryButton = React.forwardRef<HTMLButtonElement, Omit<BrandAwareButtonProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <BrandAwareButton ref={ref} variant="primary" {...props}>
      {children}
    </BrandAwareButton>
  )
);
BrandPrimaryButton.displayName = "BrandPrimaryButton";

export const BrandSecondaryButton = React.forwardRef<HTMLButtonElement, Omit<BrandAwareButtonProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <BrandAwareButton ref={ref} variant="secondary" {...props}>
      {children}
    </BrandAwareButton>
  )
);
BrandSecondaryButton.displayName = "BrandSecondaryButton";

export const BrandCTAButton = React.forwardRef<HTMLButtonElement, Omit<BrandAwareButtonProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <BrandAwareButton ref={ref} variant="cta" {...props}>
      {children}
    </BrandAwareButton>
  )
);
BrandCTAButton.displayName = "BrandCTAButton";

export const BrandOutlineButton = React.forwardRef<HTMLButtonElement, Omit<BrandAwareButtonProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <BrandAwareButton ref={ref} variant="outline" {...props}>
      {children}
    </BrandAwareButton>
  )
);
BrandOutlineButton.displayName = "BrandOutlineButton";

export const BrandGhostButton = React.forwardRef<HTMLButtonElement, Omit<BrandAwareButtonProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <BrandAwareButton ref={ref} variant="ghost" {...props}>
      {children}
    </BrandAwareButton>
  )
);
BrandGhostButton.displayName = "BrandGhostButton";

export { 
  BrandAwareButton,
  brandAwareButtonVariants,
  BrandPrimaryButton,
  BrandSecondaryButton,
  BrandCTAButton,
  BrandOutlineButton,
  BrandGhostButton
};
