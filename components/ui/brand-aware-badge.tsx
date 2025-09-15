/**
 * @fileoverview Brand-Aware Badge Component for HT-011.3.1
 * @module components/ui/brand-aware-badge
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.3.1: Update Component Library for Brand Customization
 * 
 * This component extends the base Badge component with brand customization support:
 * - Dynamic brand colors for different badge variants
 * - Brand-aware styling that adapts to client brand
 * - Support for brand-specific badge color palettes
 * - Integration with dynamic branding system
 * 
 * @example
 * ```tsx
 * // Brand-aware badge
 * <BrandAwareBadge variant="primary">
 *   New Feature
 * </BrandAwareBadge>
 * 
 * // Custom brand colors
 * <BrandAwareBadge 
 *   variant="secondary" 
 *   brandColors={{ primary: '#FF6B6B', secondary: '#4ECDC4' }}
 * />
 * ```
 */

'use client';

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useDynamicBrand } from "@/lib/branding/hooks";

/**
 * Brand-aware badge variants
 */
const brandAwareBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Primary brand badge
        primary: "border-transparent text-white shadow-sm",
        // Secondary brand badge
        secondary: "border-transparent text-white shadow-sm",
        // Outline brand badge
        outline: "text-foreground shadow-sm",
        // Success badge with brand colors
        success: "border-transparent text-white shadow-sm",
        // Warning badge with brand colors
        warning: "border-transparent text-white shadow-sm",
        // Error badge with brand colors
        error: "border-transparent text-white shadow-sm",
        // Info badge with brand colors
        info: "border-transparent text-white shadow-sm",
        // Destructive badge
        destructive: "border-transparent text-white shadow-sm",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface BrandAwareBadgeProps extends VariantProps<typeof brandAwareBadgeVariants> {
  /** Custom brand colors for badge variants */
  brandColors?: {
    primary?: string;
    secondary?: string;
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
    destructive?: string;
  };
  /** Whether to use brand colors from configuration */
  useBrandColors?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Badge content */
  children: React.ReactNode;
}

/**
 * Generate CSS custom properties for brand badge colors
 */
function generateBadgeBrandCSSProperties(brandColors: BrandAwareBadgeProps['brandColors']) {
  if (!brandColors) return {};
  
  const cssProps: React.CSSProperties & Record<string, string> = {};
  
  if (brandColors.primary) {
    cssProps['--brand-primary'] = brandColors.primary;
    cssProps['--brand-primary-hover'] = adjustColorBrightness(brandColors.primary, -10);
  }
  
  if (brandColors.secondary) {
    cssProps['--brand-secondary'] = brandColors.secondary;
    cssProps['--brand-secondary-hover'] = adjustColorBrightness(brandColors.secondary, -10);
  }
  
  if (brandColors.success) {
    cssProps['--brand-success'] = brandColors.success;
    cssProps['--brand-success-hover'] = adjustColorBrightness(brandColors.success, -10);
  }
  
  if (brandColors.warning) {
    cssProps['--brand-warning'] = brandColors.warning;
    cssProps['--brand-warning-hover'] = adjustColorBrightness(brandColors.warning, -10);
  }
  
  if (brandColors.error) {
    cssProps['--brand-error'] = brandColors.error;
    cssProps['--brand-error-hover'] = adjustColorBrightness(brandColors.error, -10);
  }
  
  if (brandColors.info) {
    cssProps['--brand-info'] = brandColors.info;
    cssProps['--brand-info-hover'] = adjustColorBrightness(brandColors.info, -10);
  }
  
  if (brandColors.destructive) {
    cssProps['--brand-destructive'] = brandColors.destructive;
    cssProps['--brand-destructive-hover'] = adjustColorBrightness(brandColors.destructive, -10);
  }
  
  return cssProps;
}

/**
 * Adjust color brightness for hover states
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
 * Generate brand-aware CSS classes for badge variant
 */
function getBadgeVariantClasses(variant: string, brandColors?: BrandAwareBadgeProps['brandColors']) {
  const baseClasses = brandAwareBadgeVariants({ variant: variant as any });
  
  if (!brandColors) {
    // Fallback to default colors
    const defaultColors = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/80',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border-border',
      success: 'bg-green-500 text-white hover:bg-green-600',
      warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
      error: 'bg-red-500 text-white hover:bg-red-600',
      info: 'bg-blue-500 text-white hover:bg-blue-600',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
    };
    return cn(baseClasses, defaultColors[variant as keyof typeof defaultColors]);
  }
  
  const brandClasses: string[] = [];
  
  switch (variant) {
    case 'primary':
      if (brandColors.primary) {
        brandClasses.push(
          'bg-[var(--brand-primary)]',
          'hover:bg-[var(--brand-primary-hover)]'
        );
      }
      break;
      
    case 'secondary':
      if (brandColors.secondary) {
        brandClasses.push(
          'bg-[var(--brand-secondary)]',
          'hover:bg-[var(--brand-secondary-hover)]'
        );
      }
      break;
      
    case 'outline':
      if (brandColors.primary) {
        brandClasses.push(
          'border-[var(--brand-primary)]',
          'text-[var(--brand-primary)]',
          'hover:bg-[var(--brand-primary)]/10'
        );
      }
      break;
      
    case 'success':
      if (brandColors.success) {
        brandClasses.push(
          'bg-[var(--brand-success)]',
          'hover:bg-[var(--brand-success-hover)]'
        );
      }
      break;
      
    case 'warning':
      if (brandColors.warning) {
        brandClasses.push(
          'bg-[var(--brand-warning)]',
          'hover:bg-[var(--brand-warning-hover)]'
        );
      }
      break;
      
    case 'error':
      if (brandColors.error) {
        brandClasses.push(
          'bg-[var(--brand-error)]',
          'hover:bg-[var(--brand-error-hover)]'
        );
      }
      break;
      
    case 'info':
      if (brandColors.info) {
        brandClasses.push(
          'bg-[var(--brand-info)]',
          'hover:bg-[var(--brand-info-hover)]'
        );
      }
      break;
      
    case 'destructive':
      if (brandColors.destructive) {
        brandClasses.push(
          'bg-[var(--brand-destructive)]',
          'hover:bg-[var(--brand-destructive-hover)]'
        );
      }
      break;
  }
  
  return cn(baseClasses, brandClasses);
}

const BrandAwareBadge = React.forwardRef<HTMLDivElement, BrandAwareBadgeProps>(({
  variant = 'primary',
  size = 'default',
  brandColors,
  useBrandColors = true,
  className,
  children,
  ...props
}, ref) => {
  const { config } = useDynamicBrand();
  
  // Get brand colors from configuration if not provided
  const effectiveBrandColors = brandColors || (useBrandColors ? {
    primary: (config as any).theme?.colors?.primary || '#007AFF',
    secondary: (config as any).theme?.colors?.secondary || '#6B7280',
    success: (config as any).theme?.colors?.success || '#10B981',
    warning: (config as any).theme?.colors?.warning || '#F59E0B',
    error: (config as any).theme?.colors?.error || '#EF4444',
    info: (config as any).theme?.colors?.info || '#3B82F6',
    destructive: (config as any).theme?.colors?.destructive || '#DC2626',
  } : undefined);
  
  // Generate CSS custom properties for brand colors
  const brandCSSProps = generateBadgeBrandCSSProperties(effectiveBrandColors);
  
  // Get brand-aware CSS classes
  const variantClasses = getBadgeVariantClasses(variant || 'primary', effectiveBrandColors);
  
  return (
    <div
      ref={ref}
      data-slot="brand-aware-badge"
      data-variant={variant}
      style={brandCSSProps}
      className={cn(variantClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
});

BrandAwareBadge.displayName = "BrandAwareBadge";

// Export the main component
export { BrandAwareBadge, brandAwareBadgeVariants };

// Specialized brand-aware badge components
export const BrandPrimaryBadge = React.forwardRef<HTMLDivElement, Omit<BrandAwareBadgeProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <BrandAwareBadge ref={ref} variant="primary" {...props}>
      {children}
    </BrandAwareBadge>
  )
);
BrandPrimaryBadge.displayName = "BrandPrimaryBadge";

export const BrandSecondaryBadge = React.forwardRef<HTMLDivElement, Omit<BrandAwareBadgeProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <BrandAwareBadge ref={ref} variant="secondary" {...props}>
      {children}
    </BrandAwareBadge>
  )
);
BrandSecondaryBadge.displayName = "BrandSecondaryBadge";

export const BrandSuccessBadge = React.forwardRef<HTMLDivElement, Omit<BrandAwareBadgeProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <BrandAwareBadge ref={ref} variant="success" {...props}>
      {children}
    </BrandAwareBadge>
  )
);
BrandSuccessBadge.displayName = "BrandSuccessBadge";

export const BrandWarningBadge = React.forwardRef<HTMLDivElement, Omit<BrandAwareBadgeProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <BrandAwareBadge ref={ref} variant="warning" {...props}>
      {children}
    </BrandAwareBadge>
  )
);
BrandWarningBadge.displayName = "BrandWarningBadge";

export const BrandErrorBadge = React.forwardRef<HTMLDivElement, Omit<BrandAwareBadgeProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <BrandAwareBadge ref={ref} variant="error" {...props}>
      {children}
    </BrandAwareBadge>
  )
);
BrandErrorBadge.displayName = "BrandErrorBadge";

export const BrandInfoBadge = React.forwardRef<HTMLDivElement, Omit<BrandAwareBadgeProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <BrandAwareBadge ref={ref} variant="info" {...props}>
      {children}
    </BrandAwareBadge>
  )
);
BrandInfoBadge.displayName = "BrandInfoBadge";

export const BrandOutlineBadge = React.forwardRef<HTMLDivElement, Omit<BrandAwareBadgeProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <BrandAwareBadge ref={ref} variant="outline" {...props}>
      {children}
    </BrandAwareBadge>
  )
);
BrandOutlineBadge.displayName = "BrandOutlineBadge";

// All exports are already declared above individually
