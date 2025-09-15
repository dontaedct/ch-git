/**
 * @fileoverview HT-006 Token-Driven Button Component
 * @module components-sandbox/ui/button
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-006 Phase 2 - Elements & CVA Variants
 * Purpose: Token-driven Button with comprehensive CVA variants
 * Safety: Sandbox-isolated, no production impact
 * Status: Phase 2 implementation
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    // Base styles using CSS variables from tokens
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-[--button-text-size] font-[--button-font-weight] leading-[--button-line-height]",
    "rounded-[--button-border-radius] border-[--button-border-width]",
    "transition-all duration-200 ease-out",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--button-focus-ring] focus-visible:ring-offset-2",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-[--semantic-primary] text-[--semantic-primary-foreground] border-[--semantic-primary]",
          "hover:bg-[--semantic-primary]/90 hover:border-[--semantic-primary]/90",
          "active:bg-[--semantic-primary]/80 active:border-[--semantic-primary]/80",
          "shadow-[--shadow-sm]"
        ],
        secondary: [
          "bg-[--semantic-secondary] text-[--semantic-secondary-foreground] border-[--semantic-secondary]",
          "hover:bg-[--semantic-secondary]/80 hover:border-[--semantic-secondary]/80",
          "active:bg-[--semantic-secondary]/70 active:border-[--semantic-secondary]/70",
          "shadow-[--shadow-sm]"
        ],
        ghost: [
          "border-transparent text-[--semantic-foreground]",
          "hover:bg-[--semantic-accent] hover:text-[--semantic-accent-foreground]",
          "active:bg-[--semantic-accent]/80"
        ],
        link: [
          "border-transparent text-[--semantic-primary] underline-offset-4",
          "hover:underline hover:text-[--semantic-primary]/80",
          "active:text-[--semantic-primary]/60"
        ],
        destructive: [
          "bg-[--color-danger-500] text-[--color-neutral-50] border-[--color-danger-500]",
          "hover:bg-[--color-danger-600] hover:border-[--color-danger-600]",
          "active:bg-[--color-danger-700] active:border-[--color-danger-700]",
          "shadow-[--shadow-sm]"
        ],
        outline: [
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50"
        ]
      },
      size: {
        sm: [
          "h-8 px-3 py-2",
          "[--button-text-size:var(--font-size-sm)]",
          "[--button-font-weight:var(--font-weight-medium)]",
          "[--button-line-height:var(--line-height-tight)]",
          "[--button-border-radius:var(--border-radius-sm)]",
          "[--button-border-width:1px]"
        ],
        md: [
          "h-9 px-4 py-2",
          "[--button-text-size:var(--font-size-sm)]",
          "[--button-font-weight:var(--font-weight-medium)]",
          "[--button-line-height:var(--line-height-normal)]",
          "[--button-border-radius:var(--border-radius-md)]",
          "[--button-border-width:1px]"
        ],
        lg: [
          "h-10 px-6 py-3",
          "[--button-text-size:var(--font-size-base)]",
          "[--button-font-weight:var(--font-weight-semibold)]",
          "[--button-line-height:var(--line-height-normal)]",
          "[--button-border-radius:var(--border-radius-md)]",
          "[--button-border-width:1px]"
        ]
      },
      tone: {
        brand: [
          "[--button-focus-ring:var(--brand-primary)]"
        ],
        neutral: [
          "[--button-focus-ring:var(--semantic-accent)]"
        ],
        success: [
          "[--button-focus-ring:var(--color-success-500)]"
        ],
        warning: [
          "[--button-focus-ring:var(--color-warning-500)]"
        ],
        danger: [
          "[--button-focus-ring:var(--color-danger-500)]"
        ]
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto"
      }
    },
    compoundVariants: [
      // Brand tone variants
      {
        variant: "primary",
        tone: "brand",
        className: [
          "bg-[--brand-primary] text-[--semantic-primary-foreground] border-[--brand-primary]",
          "hover:bg-[--brand-primary-hover] hover:border-[--brand-primary-hover]"
        ]
      },
      {
        variant: "primary",
        tone: "success",
        className: [
          "bg-[--color-success-500] text-[--color-neutral-50] border-[--color-success-500]",
          "hover:bg-[--color-success-600] hover:border-[--color-success-600]"
        ]
      },
      {
        variant: "primary",
        tone: "warning",
        className: [
          "bg-[--color-warning-500] text-[--color-neutral-50] border-[--color-warning-500]",
          "hover:bg-[--color-warning-600] hover:border-[--color-warning-600]"
        ]
      },
      {
        variant: "ghost",
        tone: "brand",
        className: [
          "text-[--brand-primary]",
          "hover:bg-[--brand-accent-subtle] hover:text-[--brand-primary]"
        ]
      }
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      tone: "brand",
      fullWidth: false
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    tone, 
    fullWidth, 
    asChild = false, 
    loading = false,
    icon,
    iconPosition = 'left',
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, tone, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="animate-spin" aria-hidden="true" />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span aria-hidden="true">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span aria-hidden="true">{icon}</span>
        )}
        {loading && <span className="sr-only">Loading...</span>}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
