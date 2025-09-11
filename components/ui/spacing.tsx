/**
 * @fileoverview HT-008.5.5: Spacing Utility Components
 * @module components/ui/spacing
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.5 - Create systematic spacing and typography scales
 * Focus: Vercel/Apply-level spacing system with systematic utilities
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design consistency and layout)
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// HT-008.5.5: Enhanced Spacing Utility System
// Comprehensive spacing components following Vercel/Apply design principles

/**
 * Spacing Variants
 */
const spacingVariants = cva("", {
  variants: {
    size: {
      // Micro spacing
      "0": "p-0",
      "px": "p-px",
      "0.5": "p-0.5",
      "1": "p-1",
      "1.5": "p-1.5",
      "2": "p-2",
      "2.5": "p-2.5",
      "3": "p-3",
      "3.5": "p-3.5",
      "4": "p-4",
      "5": "p-5",
      "6": "p-6",
      "7": "p-7",
      "8": "p-8",
      "9": "p-9",
      "10": "p-10",
      "11": "p-11",
      "12": "p-12",
      "14": "p-14",
      "16": "p-16",
      "20": "p-20",
      "24": "p-24",
      "28": "p-28",
      "32": "p-32",
      "36": "p-36",
      "40": "p-40",
      "44": "p-44",
      "48": "p-48",
      "52": "p-52",
      "56": "p-56",
      "60": "p-60",
      "64": "p-64",
      "72": "p-72",
      "80": "p-80",
      "96": "p-96",
    },
    direction: {
      all: "",
      x: "px-",
      y: "py-",
      top: "pt-",
      right: "pr-",
      bottom: "pb-",
      left: "pl-",
    },
    responsive: {
      none: "",
      sm: "sm:",
      md: "md:",
      lg: "lg:",
      xl: "xl:",
      "2xl": "2xl:",
    },
  },
  compoundVariants: [
    // X direction variants
    { direction: "x", size: "0", className: "px-0" },
    { direction: "x", size: "px", className: "px-px" },
    { direction: "x", size: "0.5", className: "px-0.5" },
    { direction: "x", size: "1", className: "px-1" },
    { direction: "x", size: "1.5", className: "px-1.5" },
    { direction: "x", size: "2", className: "px-2" },
    { direction: "x", size: "2.5", className: "px-2.5" },
    { direction: "x", size: "3", className: "px-3" },
    { direction: "x", size: "3.5", className: "px-3.5" },
    { direction: "x", size: "4", className: "px-4" },
    { direction: "x", size: "5", className: "px-5" },
    { direction: "x", size: "6", className: "px-6" },
    { direction: "x", size: "7", className: "px-7" },
    { direction: "x", size: "8", className: "px-8" },
    { direction: "x", size: "9", className: "px-9" },
    { direction: "x", size: "10", className: "px-10" },
    { direction: "x", size: "11", className: "px-11" },
    { direction: "x", size: "12", className: "px-12" },
    { direction: "x", size: "14", className: "px-14" },
    { direction: "x", size: "16", className: "px-16" },
    { direction: "x", size: "20", className: "px-20" },
    { direction: "x", size: "24", className: "px-24" },
    { direction: "x", size: "28", className: "px-28" },
    { direction: "x", size: "32", className: "px-32" },
    { direction: "x", size: "36", className: "px-36" },
    { direction: "x", size: "40", className: "px-40" },
    { direction: "x", size: "44", className: "px-44" },
    { direction: "x", size: "48", className: "px-48" },
    { direction: "x", size: "52", className: "px-52" },
    { direction: "x", size: "56", className: "px-56" },
    { direction: "x", size: "60", className: "px-60" },
    { direction: "x", size: "64", className: "px-64" },
    { direction: "x", size: "72", className: "px-72" },
    { direction: "x", size: "80", className: "px-80" },
    { direction: "x", size: "96", className: "px-96" },
    
    // Y direction variants
    { direction: "y", size: "0", className: "py-0" },
    { direction: "y", size: "px", className: "py-px" },
    { direction: "y", size: "0.5", className: "py-0.5" },
    { direction: "y", size: "1", className: "py-1" },
    { direction: "y", size: "1.5", className: "py-1.5" },
    { direction: "y", size: "2", className: "py-2" },
    { direction: "y", size: "2.5", className: "py-2.5" },
    { direction: "y", size: "3", className: "py-3" },
    { direction: "y", size: "3.5", className: "py-3.5" },
    { direction: "y", size: "4", className: "py-4" },
    { direction: "y", size: "5", className: "py-5" },
    { direction: "y", size: "6", className: "py-6" },
    { direction: "y", size: "7", className: "py-7" },
    { direction: "y", size: "8", className: "py-8" },
    { direction: "y", size: "9", className: "py-9" },
    { direction: "y", size: "10", className: "py-10" },
    { direction: "y", size: "11", className: "py-11" },
    { direction: "y", size: "12", className: "py-12" },
    { direction: "y", size: "14", className: "py-14" },
    { direction: "y", size: "16", className: "py-16" },
    { direction: "y", size: "20", className: "py-20" },
    { direction: "y", size: "24", className: "py-24" },
    { direction: "y", size: "28", className: "py-28" },
    { direction: "y", size: "32", className: "py-32" },
    { direction: "y", size: "36", className: "py-36" },
    { direction: "y", size: "40", className: "py-40" },
    { direction: "y", size: "44", className: "py-44" },
    { direction: "y", size: "48", className: "py-48" },
    { direction: "y", size: "52", className: "py-52" },
    { direction: "y", size: "56", className: "py-56" },
    { direction: "y", size: "60", className: "py-60" },
    { direction: "y", size: "64", className: "py-64" },
    { direction: "y", size: "72", className: "py-72" },
    { direction: "y", size: "80", className: "py-80" },
    { direction: "y", size: "96", className: "py-96" },
  ],
  defaultVariants: {
    size: "4",
    direction: "all",
    responsive: "none",
  },
})

export interface SpacingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spacingVariants> {
  as?: React.ElementType
  children?: React.ReactNode
}

/**
 * Base Spacing Component
 */
const Spacing = React.forwardRef<HTMLDivElement, SpacingProps>(
  ({ className, size, direction, responsive, as: Component = "div", ...props }, ref) => {
    return React.createElement(
      Component,
      {
        className: cn(spacingVariants({ size, direction, responsive }), className),
        ref,
        ...props,
      }
    )
  }
)
Spacing.displayName = "Spacing"

/**
 * Padding Components
 */
export const Padding = React.forwardRef<HTMLDivElement, SpacingProps>(
  ({ className, ...props }, ref) => (
    <Spacing
      ref={ref}
      direction="all"
      className={cn("", className)}
      {...props}
    />
  )
)
Padding.displayName = "Padding"

export const PaddingX = React.forwardRef<HTMLDivElement, SpacingProps>(
  ({ className, ...props }, ref) => (
    <Spacing
      ref={ref}
      direction="x"
      className={cn("", className)}
      {...props}
    />
  )
)
PaddingX.displayName = "PaddingX"

export const PaddingY = React.forwardRef<HTMLDivElement, SpacingProps>(
  ({ className, ...props }, ref) => (
    <Spacing
      ref={ref}
      direction="y"
      className={cn("", className)}
      {...props}
    />
  )
)
PaddingY.displayName = "PaddingY"

export const PaddingTop = React.forwardRef<HTMLDivElement, SpacingProps>(
  ({ className, ...props }, ref) => (
    <Spacing
      ref={ref}
      direction="top"
      className={cn("", className)}
      {...props}
    />
  )
)
PaddingTop.displayName = "PaddingTop"

export const PaddingRight = React.forwardRef<HTMLDivElement, SpacingProps>(
  ({ className, ...props }, ref) => (
    <Spacing
      ref={ref}
      direction="right"
      className={cn("", className)}
      {...props}
    />
  )
)
PaddingRight.displayName = "PaddingRight"

export const PaddingBottom = React.forwardRef<HTMLDivElement, SpacingProps>(
  ({ className, ...props }, ref) => (
    <Spacing
      ref={ref}
      direction="bottom"
      className={cn("", className)}
      {...props}
    />
  )
)
PaddingBottom.displayName = "PaddingBottom"

export const PaddingLeft = React.forwardRef<HTMLDivElement, SpacingProps>(
  ({ className, ...props }, ref) => (
    <Spacing
      ref={ref}
      direction="left"
      className={cn("", className)}
      {...props}
    />
  )
)
PaddingLeft.displayName = "PaddingLeft"

/**
 * Margin Components
 */
const marginVariants = cva("", {
  variants: {
    size: {
      "0": "m-0",
      "px": "m-px",
      "0.5": "m-0.5",
      "1": "m-1",
      "1.5": "m-1.5",
      "2": "m-2",
      "2.5": "m-2.5",
      "3": "m-3",
      "3.5": "m-3.5",
      "4": "m-4",
      "5": "m-5",
      "6": "m-6",
      "7": "m-7",
      "8": "m-8",
      "9": "m-9",
      "10": "m-10",
      "11": "m-11",
      "12": "m-12",
      "14": "m-14",
      "16": "m-16",
      "20": "m-20",
      "24": "m-24",
      "28": "m-28",
      "32": "m-32",
      "36": "m-36",
      "40": "m-40",
      "44": "m-44",
      "48": "m-48",
      "52": "m-52",
      "56": "m-56",
      "60": "m-60",
      "64": "m-64",
      "72": "m-72",
      "80": "m-80",
      "96": "m-96",
      auto: "m-auto",
    },
    direction: {
      all: "",
      x: "mx-",
      y: "my-",
      top: "mt-",
      right: "mr-",
      bottom: "mb-",
      left: "ml-",
    },
  },
  compoundVariants: [
    // X direction variants
    { direction: "x", size: "0", className: "mx-0" },
    { direction: "x", size: "px", className: "mx-px" },
    { direction: "x", size: "0.5", className: "mx-0.5" },
    { direction: "x", size: "1", className: "mx-1" },
    { direction: "x", size: "1.5", className: "mx-1.5" },
    { direction: "x", size: "2", className: "mx-2" },
    { direction: "x", size: "2.5", className: "mx-2.5" },
    { direction: "x", size: "3", className: "mx-3" },
    { direction: "x", size: "3.5", className: "mx-3.5" },
    { direction: "x", size: "4", className: "mx-4" },
    { direction: "x", size: "5", className: "mx-5" },
    { direction: "x", size: "6", className: "mx-6" },
    { direction: "x", size: "7", className: "mx-7" },
    { direction: "x", size: "8", className: "mx-8" },
    { direction: "x", size: "9", className: "mx-9" },
    { direction: "x", size: "10", className: "mx-10" },
    { direction: "x", size: "11", className: "mx-11" },
    { direction: "x", size: "12", className: "mx-12" },
    { direction: "x", size: "14", className: "mx-14" },
    { direction: "x", size: "16", className: "mx-16" },
    { direction: "x", size: "20", className: "mx-20" },
    { direction: "x", size: "24", className: "mx-24" },
    { direction: "x", size: "28", className: "mx-28" },
    { direction: "x", size: "32", className: "mx-32" },
    { direction: "x", size: "36", className: "mx-36" },
    { direction: "x", size: "40", className: "mx-40" },
    { direction: "x", size: "44", className: "mx-44" },
    { direction: "x", size: "48", className: "mx-48" },
    { direction: "x", size: "52", className: "mx-52" },
    { direction: "x", size: "56", className: "mx-56" },
    { direction: "x", size: "60", className: "mx-60" },
    { direction: "x", size: "64", className: "mx-64" },
    { direction: "x", size: "72", className: "mx-72" },
    { direction: "x", size: "80", className: "mx-80" },
    { direction: "x", size: "96", className: "mx-96" },
    { direction: "x", size: "auto", className: "mx-auto" },
    
    // Y direction variants
    { direction: "y", size: "0", className: "my-0" },
    { direction: "y", size: "px", className: "my-px" },
    { direction: "y", size: "0.5", className: "my-0.5" },
    { direction: "y", size: "1", className: "my-1" },
    { direction: "y", size: "1.5", className: "my-1.5" },
    { direction: "y", size: "2", className: "my-2" },
    { direction: "y", size: "2.5", className: "my-2.5" },
    { direction: "y", size: "3", className: "my-3" },
    { direction: "y", size: "3.5", className: "my-3.5" },
    { direction: "y", size: "4", className: "my-4" },
    { direction: "y", size: "5", className: "my-5" },
    { direction: "y", size: "6", className: "my-6" },
    { direction: "y", size: "7", className: "my-7" },
    { direction: "y", size: "8", className: "my-8" },
    { direction: "y", size: "9", className: "my-9" },
    { direction: "y", size: "10", className: "my-10" },
    { direction: "y", size: "11", className: "my-11" },
    { direction: "y", size: "12", className: "my-12" },
    { direction: "y", size: "14", className: "my-14" },
    { direction: "y", size: "16", className: "my-16" },
    { direction: "y", size: "20", className: "my-20" },
    { direction: "y", size: "24", className: "my-24" },
    { direction: "y", size: "28", className: "my-28" },
    { direction: "y", size: "32", className: "my-32" },
    { direction: "y", size: "36", className: "my-36" },
    { direction: "y", size: "40", className: "my-40" },
    { direction: "y", size: "44", className: "my-44" },
    { direction: "y", size: "48", className: "my-48" },
    { direction: "y", size: "52", className: "my-52" },
    { direction: "y", size: "56", className: "my-56" },
    { direction: "y", size: "60", className: "my-60" },
    { direction: "y", size: "64", className: "my-64" },
    { direction: "y", size: "72", className: "my-72" },
    { direction: "y", size: "80", className: "my-80" },
    { direction: "y", size: "96", className: "my-96" },
    { direction: "y", size: "auto", className: "my-auto" },
  ],
  defaultVariants: {
    size: "4",
    direction: "all",
  },
})

export interface MarginProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof marginVariants> {
  as?: React.ElementType
  children?: React.ReactNode
}

const Margin = React.forwardRef<HTMLDivElement, MarginProps>(
  ({ className, size, direction, as: Component = "div", ...props }, ref) => {
    return React.createElement(
      Component,
      {
        className: cn(marginVariants({ size, direction }), className),
        ref,
        ...props,
      }
    )
  }
)
Margin.displayName = "Margin"

export const MarginX = React.forwardRef<HTMLDivElement, MarginProps>(
  ({ className, ...props }, ref) => (
    <Margin
      ref={ref}
      direction="x"
      className={cn("", className)}
      {...props}
    />
  )
)
MarginX.displayName = "MarginX"

export const MarginY = React.forwardRef<HTMLDivElement, MarginProps>(
  ({ className, ...props }, ref) => (
    <Margin
      ref={ref}
      direction="y"
      className={cn("", className)}
      {...props}
    />
  )
)
MarginY.displayName = "MarginY"

export const MarginTop = React.forwardRef<HTMLDivElement, MarginProps>(
  ({ className, ...props }, ref) => (
    <Margin
      ref={ref}
      direction="top"
      className={cn("", className)}
      {...props}
    />
  )
)
MarginTop.displayName = "MarginTop"

export const MarginRight = React.forwardRef<HTMLDivElement, MarginProps>(
  ({ className, ...props }, ref) => (
    <Margin
      ref={ref}
      direction="right"
      className={cn("", className)}
      {...props}
    />
  )
)
MarginRight.displayName = "MarginRight"

export const MarginBottom = React.forwardRef<HTMLDivElement, MarginProps>(
  ({ className, ...props }, ref) => (
    <Margin
      ref={ref}
      direction="bottom"
      className={cn("", className)}
      {...props}
    />
  )
)
MarginBottom.displayName = "MarginBottom"

export const MarginLeft = React.forwardRef<HTMLDivElement, MarginProps>(
  ({ className, ...props }, ref) => (
    <Margin
      ref={ref}
      direction="left"
      className={cn("", className)}
      {...props}
    />
  )
)
MarginLeft.displayName = "MarginLeft"

/**
 * Gap Components
 */
const gapVariants = cva("", {
  variants: {
    size: {
      "0": "gap-0",
      "px": "gap-px",
      "0.5": "gap-0.5",
      "1": "gap-1",
      "1.5": "gap-1.5",
      "2": "gap-2",
      "2.5": "gap-2.5",
      "3": "gap-3",
      "3.5": "gap-3.5",
      "4": "gap-4",
      "5": "gap-5",
      "6": "gap-6",
      "7": "gap-7",
      "8": "gap-8",
      "9": "gap-9",
      "10": "gap-10",
      "11": "gap-11",
      "12": "gap-12",
      "14": "gap-14",
      "16": "gap-16",
      "20": "gap-20",
      "24": "gap-24",
      "28": "gap-28",
      "32": "gap-32",
      "36": "gap-36",
      "40": "gap-40",
      "44": "gap-44",
      "48": "gap-48",
      "52": "gap-52",
      "56": "gap-56",
      "60": "gap-60",
      "64": "gap-64",
      "72": "gap-72",
      "80": "gap-80",
      "96": "gap-96",
    },
    direction: {
      all: "",
      x: "gap-x-",
      y: "gap-y-",
    },
  },
  compoundVariants: [
    { direction: "x", size: "0", className: "gap-x-0" },
    { direction: "x", size: "px", className: "gap-x-px" },
    { direction: "x", size: "0.5", className: "gap-x-0.5" },
    { direction: "x", size: "1", className: "gap-x-1" },
    { direction: "x", size: "1.5", className: "gap-x-1.5" },
    { direction: "x", size: "2", className: "gap-x-2" },
    { direction: "x", size: "2.5", className: "gap-x-2.5" },
    { direction: "x", size: "3", className: "gap-x-3" },
    { direction: "x", size: "3.5", className: "gap-x-3.5" },
    { direction: "x", size: "4", className: "gap-x-4" },
    { direction: "x", size: "5", className: "gap-x-5" },
    { direction: "x", size: "6", className: "gap-x-6" },
    { direction: "x", size: "7", className: "gap-x-7" },
    { direction: "x", size: "8", className: "gap-x-8" },
    { direction: "x", size: "9", className: "gap-x-9" },
    { direction: "x", size: "10", className: "gap-x-10" },
    { direction: "x", size: "11", className: "gap-x-11" },
    { direction: "x", size: "12", className: "gap-x-12" },
    { direction: "x", size: "14", className: "gap-x-14" },
    { direction: "x", size: "16", className: "gap-x-16" },
    { direction: "x", size: "20", className: "gap-x-20" },
    { direction: "x", size: "24", className: "gap-x-24" },
    { direction: "x", size: "28", className: "gap-x-28" },
    { direction: "x", size: "32", className: "gap-x-32" },
    { direction: "x", size: "36", className: "gap-x-36" },
    { direction: "x", size: "40", className: "gap-x-40" },
    { direction: "x", size: "44", className: "gap-x-44" },
    { direction: "x", size: "48", className: "gap-x-48" },
    { direction: "x", size: "52", className: "gap-x-52" },
    { direction: "x", size: "56", className: "gap-x-56" },
    { direction: "x", size: "60", className: "gap-x-60" },
    { direction: "x", size: "64", className: "gap-x-64" },
    { direction: "x", size: "72", className: "gap-x-72" },
    { direction: "x", size: "80", className: "gap-x-80" },
    { direction: "x", size: "96", className: "gap-x-96" },
    
    { direction: "y", size: "0", className: "gap-y-0" },
    { direction: "y", size: "px", className: "gap-y-px" },
    { direction: "y", size: "0.5", className: "gap-y-0.5" },
    { direction: "y", size: "1", className: "gap-y-1" },
    { direction: "y", size: "1.5", className: "gap-y-1.5" },
    { direction: "y", size: "2", className: "gap-y-2" },
    { direction: "y", size: "2.5", className: "gap-y-2.5" },
    { direction: "y", size: "3", className: "gap-y-3" },
    { direction: "y", size: "3.5", className: "gap-y-3.5" },
    { direction: "y", size: "4", className: "gap-y-4" },
    { direction: "y", size: "5", className: "gap-y-5" },
    { direction: "y", size: "6", className: "gap-y-6" },
    { direction: "y", size: "7", className: "gap-y-7" },
    { direction: "y", size: "8", className: "gap-y-8" },
    { direction: "y", size: "9", className: "gap-y-9" },
    { direction: "y", size: "10", className: "gap-y-10" },
    { direction: "y", size: "11", className: "gap-y-11" },
    { direction: "y", size: "12", className: "gap-y-12" },
    { direction: "y", size: "14", className: "gap-y-14" },
    { direction: "y", size: "16", className: "gap-y-16" },
    { direction: "y", size: "20", className: "gap-y-20" },
    { direction: "y", size: "24", className: "gap-y-24" },
    { direction: "y", size: "28", className: "gap-y-28" },
    { direction: "y", size: "32", className: "gap-y-32" },
    { direction: "y", size: "36", className: "gap-y-36" },
    { direction: "y", size: "40", className: "gap-y-40" },
    { direction: "y", size: "44", className: "gap-y-44" },
    { direction: "y", size: "48", className: "gap-y-48" },
    { direction: "y", size: "52", className: "gap-y-52" },
    { direction: "y", size: "56", className: "gap-y-56" },
    { direction: "y", size: "60", className: "gap-y-60" },
    { direction: "y", size: "64", className: "gap-y-64" },
    { direction: "y", size: "72", className: "gap-y-72" },
    { direction: "y", size: "80", className: "gap-y-80" },
    { direction: "y", size: "96", className: "gap-y-96" },
  ],
  defaultVariants: {
    size: "4",
    direction: "all",
  },
})

export interface GapProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gapVariants> {
  as?: React.ElementType
  children?: React.ReactNode
}

const Gap = React.forwardRef<HTMLDivElement, GapProps>(
  ({ className, size, direction, as: Component = "div", ...props }, ref) => {
    return React.createElement(
      Component,
      {
        className: cn(gapVariants({ size, direction }), className),
        ref,
        ...props,
      }
    )
  }
)
Gap.displayName = "Gap"

export const GapX = React.forwardRef<HTMLDivElement, GapProps>(
  ({ className, ...props }, ref) => (
    <Gap
      ref={ref}
      direction="x"
      className={cn("", className)}
      {...props}
    />
  )
)
GapX.displayName = "GapX"

export const GapY = React.forwardRef<HTMLDivElement, GapProps>(
  ({ className, ...props }, ref) => (
    <Gap
      ref={ref}
      direction="y"
      className={cn("", className)}
      {...props}
    />
  )
)
GapY.displayName = "GapY"

/**
 * Space Components - For vertical spacing between elements
 */
const spaceVariants = cva("", {
  variants: {
    size: {
      "0": "space-y-0",
      "px": "space-y-px",
      "0.5": "space-y-0.5",
      "1": "space-y-1",
      "1.5": "space-y-1.5",
      "2": "space-y-2",
      "2.5": "space-y-2.5",
      "3": "space-y-3",
      "3.5": "space-y-3.5",
      "4": "space-y-4",
      "5": "space-y-5",
      "6": "space-y-6",
      "7": "space-y-7",
      "8": "space-y-8",
      "9": "space-y-9",
      "10": "space-y-10",
      "11": "space-y-11",
      "12": "space-y-12",
      "14": "space-y-14",
      "16": "space-y-16",
      "20": "space-y-20",
      "24": "space-y-24",
      "28": "space-y-28",
      "32": "space-y-32",
      "36": "space-y-36",
      "40": "space-y-40",
      "44": "space-y-44",
      "48": "space-y-48",
      "52": "space-y-52",
      "56": "space-y-56",
      "60": "space-y-60",
      "64": "space-y-64",
      "72": "space-y-72",
      "80": "space-y-80",
      "96": "space-y-96",
    },
    direction: {
      y: "space-y-",
      x: "space-x-",
    },
  },
  compoundVariants: [
    { direction: "x", size: "0", className: "space-x-0" },
    { direction: "x", size: "px", className: "space-x-px" },
    { direction: "x", size: "0.5", className: "space-x-0.5" },
    { direction: "x", size: "1", className: "space-x-1" },
    { direction: "x", size: "1.5", className: "space-x-1.5" },
    { direction: "x", size: "2", className: "space-x-2" },
    { direction: "x", size: "2.5", className: "space-x-2.5" },
    { direction: "x", size: "3", className: "space-x-3" },
    { direction: "x", size: "3.5", className: "space-x-3.5" },
    { direction: "x", size: "4", className: "space-x-4" },
    { direction: "x", size: "5", className: "space-x-5" },
    { direction: "x", size: "6", className: "space-x-6" },
    { direction: "x", size: "7", className: "space-x-7" },
    { direction: "x", size: "8", className: "space-x-8" },
    { direction: "x", size: "9", className: "space-x-9" },
    { direction: "x", size: "10", className: "space-x-10" },
    { direction: "x", size: "11", className: "space-x-11" },
    { direction: "x", size: "12", className: "space-x-12" },
    { direction: "x", size: "14", className: "space-x-14" },
    { direction: "x", size: "16", className: "space-x-16" },
    { direction: "x", size: "20", className: "space-x-20" },
    { direction: "x", size: "24", className: "space-x-24" },
    { direction: "x", size: "28", className: "space-x-28" },
    { direction: "x", size: "32", className: "space-x-32" },
    { direction: "x", size: "36", className: "space-x-36" },
    { direction: "x", size: "40", className: "space-x-40" },
    { direction: "x", size: "44", className: "space-x-44" },
    { direction: "x", size: "48", className: "space-x-48" },
    { direction: "x", size: "52", className: "space-x-52" },
    { direction: "x", size: "56", className: "space-x-56" },
    { direction: "x", size: "60", className: "space-x-60" },
    { direction: "x", size: "64", className: "space-x-64" },
    { direction: "x", size: "72", className: "space-x-72" },
    { direction: "x", size: "80", className: "space-x-80" },
    { direction: "x", size: "96", className: "space-x-96" },
  ],
  defaultVariants: {
    size: "4",
    direction: "y",
  },
})

export interface SpaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spaceVariants> {
  as?: React.ElementType
  children?: React.ReactNode
}

const Space = React.forwardRef<HTMLDivElement, SpaceProps>(
  ({ className, size, direction, as: Component = "div", ...props }, ref) => {
    return React.createElement(
      Component,
      {
        className: cn(spaceVariants({ size, direction }), className),
        ref,
        ...props,
      }
    )
  }
)
Space.displayName = "Space"

export const SpaceX = React.forwardRef<HTMLDivElement, SpaceProps>(
  ({ className, ...props }, ref) => (
    <Space
      ref={ref}
      direction="x"
      className={cn("", className)}
      {...props}
    />
  )
)
SpaceX.displayName = "SpaceX"

export const SpaceY = React.forwardRef<HTMLDivElement, SpaceProps>(
  ({ className, ...props }, ref) => (
    <Space
      ref={ref}
      direction="y"
      className={cn("", className)}
      {...props}
    />
  )
)
SpaceY.displayName = "SpaceY"

export {
  Spacing,
  spacingVariants,
  Margin,
  marginVariants,
  Gap,
  gapVariants,
  Space,
  spaceVariants,
}
