/**
 * @fileoverview Enhanced Button primitive for HT-001.3.5 - CTA-focused implementation
 * @module components/ui/button
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-001.3.5 - Button primitive (for CTA later)
 * 
 * Features:
 * - Comprehensive CTA-focused button variants
 * - Enhanced accessibility and semantic structure
 * - Loading states and micro-interactions
 * - Icon positioning and responsive behavior
 * - Integration with design tokens and motion system
 * - Support for booking, download, and action CTAs
 * 
 * UI POLISH NOTE: This component will be EXTENDED (not duplicated) for Swift-inspired
 * aesthetic changes. All modifications behind FEATURE_UI_POLISH_TARGET_STYLE flag.
 * 
 * @example
 * ```tsx
 * // Primary CTA
 * <Button variant="cta" size="lg">
 *   Book Consultation
 * </Button>
 * 
 * // Secondary CTA with icon
 * <Button variant="cta-secondary" icon={<Download />}>
 *   Download PDF
 * </Button>
 * 
 * // Loading CTA
 * <Button variant="cta" loading>
 *   Processing...
 * </Button>
 * ```
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium motion-button-idle motion-button-hover motion-button-active transition-button-hover disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:transition-button-focus aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 focus-visible:shadow-[0_0_0_4px_hsl(var(--ring)/0.2)]",
  {
    variants: {
      variant: {
        // CTA-focused variants
        cta: [
          "bg-primary text-primary-foreground shadow-sm hover:shadow-lg",
          "hover:bg-primary/90 active:bg-primary/80 focus-visible:ring-primary/20",
          "font-semibold tracking-wide transition-all duration-200 ease-out",
          "hover:scale-[1.015] active:scale-[0.985] hover:shadow-xl",
          "focus-visible:outline-3 focus-visible:outline-primary focus-visible:outline-offset-3 focus-visible:shadow-[0_0_0_6px_hsl(var(--primary)/0.3)]"
        ],
        "cta-secondary": [
          "bg-secondary text-secondary-foreground shadow-sm hover:shadow-lg",
          "hover:bg-secondary/80 active:bg-secondary/70 focus-visible:ring-secondary/20",
          "font-medium transition-all duration-200 ease-out",
          "hover:scale-[1.015] active:scale-[0.985] hover:shadow-xl"
        ],
        "cta-outline": [
          "border border-primary/20 bg-background text-primary shadow-sm hover:shadow-lg",
          "hover:bg-primary/5 hover:border-primary/30 active:bg-primary/10 focus-visible:ring-primary/20",
          "font-medium transition-all duration-200 ease-out",
          "hover:scale-[1.015] active:scale-[0.985] hover:shadow-xl"
        ],
        "cta-ghost": [
          "text-primary hover:bg-primary/10 active:bg-primary/20",
          "focus-visible:ring-primary/20 font-medium transition-all duration-200 ease-out",
          "hover:scale-[1.015] active:scale-[0.985] hover:shadow-lg"
        ],
        // Standard variants (enhanced with micro-motion)
        solid:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/80 focus-visible:ring-primary/20 transition-all duration-200 ease-out hover:scale-[1.015] active:scale-[0.985] hover:shadow-lg",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent/80 focus-visible:ring-accent/20 transition-all duration-200 ease-out hover:scale-[1.015] active:scale-[0.985]",
        subtle:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70 focus-visible:ring-secondary/20 transition-all duration-200 ease-out hover:scale-[1.015] active:scale-[0.985] hover:shadow-lg",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 active:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 transition-all duration-200 ease-out hover:scale-[1.015] active:scale-[0.985] hover:shadow-lg",
        outline:
          "border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80 focus-visible:ring-accent/20 transition-all duration-200 ease-out hover:scale-[1.015] active:scale-[0.985] hover:shadow-lg",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80 focus-visible:ring-primary/20 transition-all duration-200 ease-out hover:scale-[1.015] active:scale-[0.985]",
        // Legacy aliases for backward compatibility
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/80 focus-visible:ring-primary/20 transition-all duration-200 ease-out hover:scale-[1.015] active:scale-[0.985] hover:shadow-lg",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70 focus-visible:ring-secondary/20 transition-all duration-200 ease-out hover:scale-[1.015] active:scale-[0.985] hover:shadow-lg",
      },
      size: {
        xs: "h-7 px-2 py-1 text-xs gap-1 has-[>svg]:px-1.5",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 px-8 py-3 text-base font-semibold has-[>svg]:px-6",
        icon: "size-9",
        "icon-sm": "size-7",
        "icon-lg": "size-11",
      },
      intent: {
        default: "",
        booking: "bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-500/20",
        download: "bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500/20",
        email: "bg-purple-600 hover:bg-purple-700 text-white focus-visible:ring-purple-500/20",
        danger: "bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500/20",
        success: "bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:ring-emerald-500/20",
      },
    },
    compoundVariants: [
      // CTA variants with intent combinations
      {
        variant: "cta",
        intent: "booking",
        className: "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
      },
      {
        variant: "cta",
        intent: "download",
        className: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
      },
      {
        variant: "cta",
        intent: "email",
        className: "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl"
      },
      {
        variant: "cta-secondary",
        intent: "booking",
        className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
      },
      {
        variant: "cta-secondary",
        intent: "download",
        className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
      },
      {
        variant: "cta-secondary",
        intent: "email",
        className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
      },
    ],
    defaultVariants: {
      variant: "solid",
      size: "default",
      intent: "default",
    },
  }
)

export interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
  loadingText?: string
  fullWidth?: boolean
  ctaType?: 'primary' | 'secondary' | 'outline' | 'ghost'
}

function Button({
  className,
  variant,
  size,
  intent,
  asChild = false,
  icon,
  iconPosition = 'left',
  loading = false,
  loadingText,
  fullWidth = false,
  ctaType,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  const hasIcon = Boolean(icon)
  const hasChildren = Boolean(children)
  
  // Auto-determine variant based on ctaType if provided
  const resolvedVariant = ctaType ? 
    (ctaType === 'primary' ? 'cta' : 
     ctaType === 'secondary' ? 'cta-secondary' :
     ctaType === 'outline' ? 'cta-outline' :
     ctaType === 'ghost' ? 'cta-ghost' : 'cta') : 
    variant
  
  // Determine if button should be disabled
  const isDisabled = disabled || loading

  return (
    <Comp
      data-slot="button"
      data-cta-type={ctaType}
      data-loading={loading}
      className={cn(
        buttonVariants({ 
          variant: resolvedVariant, 
          size, 
          intent,
          className: cn(
            fullWidth && "w-full",
            className
          )
        })
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      
      {!loading && hasIcon && iconPosition === 'left' && icon}
      
      {hasChildren && (
        <span className={cn(loading && "opacity-0")}>
          {loading && loadingText ? loadingText : children}
        </span>
      )}
      
      {!loading && hasIcon && iconPosition === 'right' && icon}
    </Comp>
  )
}

// Specialized CTA components for common use cases
const CTAButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'ctaType'>>(
  ({ children, ...props }, ref) => (
    <Button ref={ref} ctaType="primary" {...props}>
      {children}
    </Button>
  )
)
CTAButton.displayName = "CTAButton"

const SecondaryCTAButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'ctaType'>>(
  ({ children, ...props }, ref) => (
    <Button ref={ref} ctaType="secondary" {...props}>
      {children}
    </Button>
  )
)
SecondaryCTAButton.displayName = "SecondaryCTAButton"

const OutlineCTAButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'ctaType'>>(
  ({ children, ...props }, ref) => (
    <Button ref={ref} ctaType="outline" {...props}>
      {children}
    </Button>
  )
)
OutlineCTAButton.displayName = "OutlineCTAButton"

const GhostCTAButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'ctaType'>>(
  ({ children, ...props }, ref) => (
    <Button ref={ref} ctaType="ghost" {...props}>
      {children}
    </Button>
  )
)
GhostCTAButton.displayName = "GhostCTAButton"

// Intent-specific CTA components
const BookingCTAButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'intent'>>(
  ({ children, ...props }, ref) => (
    <Button ref={ref} intent="booking" {...props}>
      {children}
    </Button>
  )
)
BookingCTAButton.displayName = "BookingCTAButton"

const DownloadCTAButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'intent'>>(
  ({ children, ...props }, ref) => (
    <Button ref={ref} intent="download" {...props}>
      {children}
    </Button>
  )
)
DownloadCTAButton.displayName = "DownloadCTAButton"

const EmailCTAButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'intent'>>(
  ({ children, ...props }, ref) => (
    <Button ref={ref} intent="email" {...props}>
      {children}
    </Button>
  )
)
EmailCTAButton.displayName = "EmailCTAButton"

export { 
  Button, 
  buttonVariants,
  CTAButton,
  SecondaryCTAButton,
  OutlineCTAButton,
  GhostCTAButton,
  BookingCTAButton,
  DownloadCTAButton,
  EmailCTAButton
}