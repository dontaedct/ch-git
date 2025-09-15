/**
 * @fileoverview HT-006 Token-Driven Card Component
 * @module components-sandbox/ui/card
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-006 Phase 2 - Elements & CVA Variants
 * Purpose: Token-driven Card with elevation and padding variants
 * Safety: Sandbox-isolated, no production impact
 * Status: Phase 2 implementation
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  [
    // Base styles using CSS variables from tokens
    "rounded-[--card-border-radius] border text-[--semantic-card-foreground]",
    "bg-[--semantic-card] border-[--semantic-border]",
    "transition-all duration-200"
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-[--semantic-card] border-[--semantic-border]"
        ],
        outlined: [
          "bg-transparent border-[--semantic-border] border-2"
        ],
        filled: [
          "bg-[--semantic-muted] border-transparent"
        ]
      },
      elevation: {
        none: "shadow-none",
        sm: "shadow-[--shadow-sm]",
        md: "shadow-[--shadow-md]",
        lg: "shadow-[--shadow-lg]"
      },
      padding: {
        none: "p-0",
        sm: "p-[--spacing-sm]",
        md: "p-[--spacing-md]",
        lg: "p-[--spacing-lg]"
      }
    },
    compoundVariants: [
      {
        elevation: "sm",
        className: "hover:shadow-[--shadow-md]"
      },
      {
        elevation: "md", 
        className: "hover:shadow-[--shadow-lg]"
      },
      {
        elevation: "lg",
        className: "hover:shadow-[--shadow-xl]"
      }
    ],
    defaultVariants: {
      variant: "default",
      elevation: "sm",
      padding: "md"
    }
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, elevation, padding, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "div" : "div"
    
    return (
      <Comp
        ref={ref}
        className={cn(
          cardVariants({ variant, elevation, padding, className }),
          "[--card-border-radius:var(--border-radius-lg)]"
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-[--spacing-md]", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-[--font-size-lg] font-[--font-weight-semibold] leading-none tracking-tight",
      "text-[--semantic-card-foreground]",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-[--font-size-sm] text-[--semantic-muted-foreground]",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-[--spacing-md] pt-0", className)} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-[--spacing-md] pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  cardVariants 
}
