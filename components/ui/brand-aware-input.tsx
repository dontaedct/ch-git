/**
 * @fileoverview Brand-Aware Input Component for HT-011.3.1
 * @module components/ui/brand-aware-input
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.3.1: Update Component Library for Brand Customization
 * 
 * This component extends the base Input component with brand customization support:
 * - Dynamic brand colors for input states (focus, error, success)
 * - Brand-aware styling that adapts to client brand
 * - Support for brand-specific input color palettes
 * - Integration with dynamic branding system
 * 
 * @example
 * ```tsx
 * // Brand-aware input
 * <BrandAwareInput 
 *   placeholder="Enter your email"
 *   variant="default"
 * />
 * 
 * // Custom brand colors
 * <BrandAwareInput 
 *   variant="error"
 *   brandColors={{ error: '#FF0000', focus: '#007AFF' }}
 * />
 * ```
 */

'use client';

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useDynamicBrand } from "@/lib/branding/hooks";

/**
 * Brand-aware input variants
 */
const brandAwareInputVariants = cva(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        // Default brand input
        default: "border-input focus-visible:ring-ring",
        // Error state with brand colors
        error: "border-destructive focus-visible:ring-destructive",
        // Success state with brand colors
        success: "border-green-500 focus-visible:ring-green-500",
        // Warning state with brand colors
        warning: "border-yellow-500 focus-visible:ring-yellow-500",
        // Info state with brand colors
        info: "border-blue-500 focus-visible:ring-blue-500",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        default: "h-9 px-3 text-sm",
        lg: "h-10 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BrandAwareInputProps extends 
  Omit<React.ComponentProps<"input">, 'size'>,
  VariantProps<typeof brandAwareInputVariants> {
  /** Custom brand colors for input states */
  brandColors?: {
    primary?: string;
    error?: string;
    success?: string;
    warning?: string;
    info?: string;
    focus?: string;
  };
  /** Whether to use brand colors from configuration */
  useBrandColors?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Label for the input */
  label?: string;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Helper text */
  helperText?: string;
}

/**
 * Generate CSS custom properties for brand input colors
 */
function generateInputBrandCSSProperties(brandColors: BrandAwareInputProps['brandColors']) {
  if (!brandColors) return {};
  
  const cssProps: React.CSSProperties & Record<string, string> = {};
  
  if (brandColors.primary) {
    cssProps['--brand-primary'] = brandColors.primary;
    cssProps['--brand-primary-ring'] = `${brandColors.primary}20`;
  }
  
  if (brandColors.error) {
    cssProps['--brand-error'] = brandColors.error;
    cssProps['--brand-error-ring'] = `${brandColors.error}20`;
  }
  
  if (brandColors.success) {
    cssProps['--brand-success'] = brandColors.success;
    cssProps['--brand-success-ring'] = `${brandColors.success}20`;
  }
  
  if (brandColors.warning) {
    cssProps['--brand-warning'] = brandColors.warning;
    cssProps['--brand-warning-ring'] = `${brandColors.warning}20`;
  }
  
  if (brandColors.info) {
    cssProps['--brand-info'] = brandColors.info;
    cssProps['--brand-info-ring'] = `${brandColors.info}20`;
  }
  
  if (brandColors.focus) {
    cssProps['--brand-focus'] = brandColors.focus;
    cssProps['--brand-focus-ring'] = `${brandColors.focus}20`;
  }
  
  return cssProps;
}

/**
 * Generate brand-aware CSS classes for input variant
 */
function getInputVariantClasses(variant: string, brandColors?: BrandAwareInputProps['brandColors']) {
  const baseClasses = brandAwareInputVariants({ variant: variant as any });
  
  if (!brandColors) {
    // Fallback to default colors
    const defaultColors = {
      default: 'border-input focus-visible:ring-ring',
      error: 'border-destructive focus-visible:ring-destructive',
      success: 'border-green-500 focus-visible:ring-green-500',
      warning: 'border-yellow-500 focus-visible:ring-yellow-500',
      info: 'border-blue-500 focus-visible:ring-blue-500',
    };
    return cn(baseClasses, defaultColors[variant as keyof typeof defaultColors]);
  }
  
  const brandClasses: string[] = [];
  
  switch (variant) {
    case 'default':
      if (brandColors.focus) {
        brandClasses.push(
          'focus-visible:border-[var(--brand-focus)]',
          'focus-visible:ring-[var(--brand-focus-ring)]'
        );
      }
      break;
      
    case 'error':
      if (brandColors.error) {
        brandClasses.push(
          'border-[var(--brand-error)]',
          'focus-visible:ring-[var(--brand-error-ring)]'
        );
      }
      break;
      
    case 'success':
      if (brandColors.success) {
        brandClasses.push(
          'border-[var(--brand-success)]',
          'focus-visible:ring-[var(--brand-success-ring)]'
        );
      }
      break;
      
    case 'warning':
      if (brandColors.warning) {
        brandClasses.push(
          'border-[var(--brand-warning)]',
          'focus-visible:ring-[var(--brand-warning-ring)]'
        );
      }
      break;
      
    case 'info':
      if (brandColors.info) {
        brandClasses.push(
          'border-[var(--brand-info)]',
          'focus-visible:ring-[var(--brand-info-ring)]'
        );
      }
      break;
  }
  
  return cn(baseClasses, brandClasses);
}

const BrandAwareInput = React.forwardRef<HTMLInputElement, BrandAwareInputProps>(({
  variant = 'default',
  size = 'default',
  brandColors,
  useBrandColors = true,
  className,
  label,
  error,
  success,
  helperText,
  ...props
}, ref) => {
  const { config } = useDynamicBrand();
  
  // Get brand colors from configuration if not provided
  const effectiveBrandColors = brandColors || (useBrandColors ? {
    primary: (config as any).theme?.colors?.primary || '#007AFF',
    error: (config as any).theme?.colors?.error || '#EF4444',
    success: (config as any).theme?.colors?.success || '#10B981',
    warning: (config as any).theme?.colors?.warning || '#F59E0B',
    info: (config as any).theme?.colors?.info || '#3B82F6',
    focus: (config as any).theme?.colors?.focus || '#007AFF',
  } : undefined);
  
  // Generate CSS custom properties for brand colors
  const brandCSSProps = generateInputBrandCSSProperties(effectiveBrandColors);
  
  // Determine effective variant based on error/success state
  const effectiveVariant = error ? 'error' : success ? 'success' : variant;
  
  // Get brand-aware CSS classes
  const variantClasses = getInputVariantClasses(effectiveVariant || 'default', effectiveBrandColors);
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        data-slot="brand-aware-input"
        data-variant={effectiveVariant}
        style={brandCSSProps}
        className={cn(variantClasses, className)}
        {...props}
      />
      
      {(error || success || helperText) && (
        <div className="mt-1 text-sm">
          {error && (
            <p className="text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-600 dark:text-green-400">
              {success}
            </p>
          )}
          {helperText && !error && !success && (
            <p className="text-gray-500 dark:text-gray-400">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

BrandAwareInput.displayName = "BrandAwareInput";

// Export the main component
export { BrandAwareInput, brandAwareInputVariants };

// Specialized brand-aware input components
export const BrandAwareTextInput = React.forwardRef<HTMLInputElement, Omit<BrandAwareInputProps, 'type'>>(
  ({ children, ...props }, ref) => (
    <BrandAwareInput ref={ref} type="text" {...props}>
      {children}
    </BrandAwareInput>
  )
);
BrandAwareTextInput.displayName = "BrandAwareTextInput";

export const BrandAwareEmailInput = React.forwardRef<HTMLInputElement, Omit<BrandAwareInputProps, 'type'>>(
  ({ children, ...props }, ref) => (
    <BrandAwareInput ref={ref} type="email" {...props}>
      {children}
    </BrandAwareInput>
  )
);
BrandAwareEmailInput.displayName = "BrandAwareEmailInput";

export const BrandAwarePasswordInput = React.forwardRef<HTMLInputElement, Omit<BrandAwareInputProps, 'type'>>(
  ({ children, ...props }, ref) => (
    <BrandAwareInput ref={ref} type="password" {...props}>
      {children}
    </BrandAwareInput>
  )
);
BrandAwarePasswordInput.displayName = "BrandAwarePasswordInput";

export const BrandAwareNumberInput = React.forwardRef<HTMLInputElement, Omit<BrandAwareInputProps, 'type'>>(
  ({ children, ...props }, ref) => (
    <BrandAwareInput ref={ref} type="number" {...props}>
      {children}
    </BrandAwareInput>
  )
);
BrandAwareNumberInput.displayName = "BrandAwareNumberInput";

// All exports are already declared above individually
