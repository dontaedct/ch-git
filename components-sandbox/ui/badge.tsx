/**
 * @fileoverview HT-006 Token-Driven Badge Component
 * @module components-sandbox/ui/badge
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-006 Phase 2 - Elements & CVA Variants
 * Purpose: Token-driven Badge with tone and variant combinations
 * Safety: Sandbox-isolated, no production impact
 * Status: Phase 2 implementation
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    // Base styles using CSS variables from tokens
    "inline-flex items-center justify-center gap-1 whitespace-nowrap",
    "border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "text-[--badge-text-size] font-[--badge-font-weight] leading-[--badge-line-height]",
    "rounded-[--badge-border-radius] px-[--badge-padding-x] py-[--badge-padding-y]"
  ],
  {
    variants: {
      variant: {
        solid: "",
        soft: "",
        outline: "bg-transparent"
      },
      tone: {
        brand: "",
        neutral: "",
        success: "",
        warning: "",
        danger: ""
      },
      size: {
        sm: [
          "[--badge-text-size:var(--font-size-xs)]",
          "[--badge-font-weight:var(--font-weight-medium)]",
          "[--badge-line-height:var(--line-height-tight)]",
          "[--badge-border-radius:var(--border-radius-sm)]",
          "[--badge-padding-x:var(--spacing-xs)]",
          "[--badge-padding-y:calc(var(--spacing-xs)/2)]"
        ],
        md: [
          "[--badge-text-size:var(--font-size-sm)]",
          "[--badge-font-weight:var(--font-weight-medium)]",
          "[--badge-line-height:var(--line-height-tight)]",
          "[--badge-border-radius:var(--border-radius-md)]",
          "[--badge-padding-x:var(--spacing-sm)]",
          "[--badge-padding-y:calc(var(--spacing-xs)/2)]"
        ],
        lg: [
          "[--badge-text-size:var(--font-size-base)]",
          "[--badge-font-weight:var(--font-weight-semibold)]",
          "[--badge-line-height:var(--line-height-tight)]",
          "[--badge-border-radius:var(--border-radius-md)]",
          "[--badge-padding-x:var(--spacing-md)]",
          "[--badge-padding-y:var(--spacing-xs)]"
        ]
      }
    },
    compoundVariants: [
      // Brand tone variants
      {
        variant: "solid",
        tone: "brand",
        className: [
          "bg-[--brand-primary] text-[--color-neutral-50] border-[--brand-primary]"
        ]
      },
      {
        variant: "soft",
        tone: "brand",
        className: [
          "bg-[--brand-accent-subtle] text-[--brand-primary] border-[--brand-accent-subtle]"
        ]
      },
      {
        variant: "outline",
        tone: "brand",
        className: [
          "text-[--brand-primary] border-[--brand-primary]"
        ]
      },
      // Neutral tone variants
      {
        variant: "solid",
        tone: "neutral",
        className: [
          "bg-[--semantic-muted] text-[--semantic-muted-foreground] border-[--semantic-muted]"
        ]
      },
      {
        variant: "soft",
        tone: "neutral",
        className: [
          "bg-[--semantic-accent] text-[--semantic-accent-foreground] border-[--semantic-accent]"
        ]
      },
      {
        variant: "outline",
        tone: "neutral",
        className: [
          "text-[--semantic-muted-foreground] border-[--semantic-border]"
        ]
      },
      // Success tone variants
      {
        variant: "solid",
        tone: "success",
        className: [
          "bg-[--color-success-500] text-[--color-neutral-50] border-[--color-success-500]"
        ]
      },
      {
        variant: "soft",
        tone: "success",
        className: [
          "bg-[--color-success-50] text-[--color-success-700] border-[--color-success-50]",
          "dark:bg-[--color-success-950] dark:text-[--color-success-300]"
        ]
      },
      {
        variant: "outline",
        tone: "success",
        className: [
          "text-[--color-success-600] border-[--color-success-500]"
        ]
      },
      // Warning tone variants
      {
        variant: "solid",
        tone: "warning",
        className: [
          "bg-[--color-warning-500] text-[--color-neutral-50] border-[--color-warning-500]"
        ]
      },
      {
        variant: "soft",
        tone: "warning",
        className: [
          "bg-[--color-warning-50] text-[--color-warning-700] border-[--color-warning-50]",
          "dark:bg-[--color-warning-950] dark:text-[--color-warning-300]"
        ]
      },
      {
        variant: "outline",
        tone: "warning",
        className: [
          "text-[--color-warning-600] border-[--color-warning-500]"
        ]
      },
      // Danger tone variants
      {
        variant: "solid",
        tone: "danger",
        className: [
          "bg-[--color-danger-500] text-[--color-neutral-50] border-[--color-danger-500]"
        ]
      },
      {
        variant: "soft",
        tone: "danger",
        className: [
          "bg-[--color-danger-50] text-[--color-danger-700] border-[--color-danger-50]",
          "dark:bg-[--color-danger-950] dark:text-[--color-danger-300]"
        ]
      },
      {
        variant: "outline",
        tone: "danger",
        className: [
          "text-[--color-danger-600] border-[--color-danger-500]"
        ]
      }
    ],
    defaultVariants: {
      variant: "solid",
      tone: "neutral",
      size: "md"
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, tone, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "div"
    
    return (
      <Comp
        ref={ref}
        className={cn(badgeVariants({ variant, tone, size, className }))}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
