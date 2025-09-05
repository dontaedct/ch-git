import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const surfaceVariants = cva(
  "relative overflow-hidden transition-all duration-200 ease-in-out",
  {
    variants: {
      variant: {
        default: [
          "bg-white/50 dark:bg-white/[0.03]",
          "border border-gray-200/60 dark:border-gray-800/[0.06]",
          "shadow-[var(--shadow-elevation-1)] hover:shadow-[var(--shadow-elevation-2)]",
          "backdrop-blur-sm"
        ],
        elevated: [
          "bg-white/70 dark:bg-white/[0.05]",
          "border border-gray-200/80 dark:border-gray-800/[0.08]",
          "shadow-[var(--shadow-elevation-2)] hover:shadow-[var(--shadow-elevation-3)]",
          "backdrop-blur-sm"
        ],
        subtle: [
          "bg-gray-50/80 dark:bg-gray-900/40",
          "border border-gray-200/40 dark:border-gray-800/[0.04]",
          "shadow-[var(--shadow-elevation-0)] hover:shadow-[var(--shadow-elevation-1)]",
          "backdrop-blur-xs"
        ],
        ghost: [
          "bg-transparent",
          "border border-gray-200/20 dark:border-gray-800/[0.02]",
          "hover:bg-white/30 dark:hover:bg-white/[0.02]",
          "hover:border-gray-200/40 dark:hover:border-gray-800/[0.04]"
        ],
        card: [
          "bg-white dark:bg-gray-900/50",
          "border border-gray-200 dark:border-gray-800/[0.06]",
          "shadow-[var(--shadow-elevation-1)] hover:shadow-[var(--shadow-elevation-2)]",
          "rounded-xl"
        ],
        floating: [
          "bg-white/90 dark:bg-gray-900/80",
          "border border-gray-200/60 dark:border-gray-800/[0.06]",
          "shadow-[var(--shadow-elevation-3)] hover:shadow-[var(--shadow-elevation-4)]",
          "backdrop-blur-md"
        ]
      },
      size: {
        sm: "p-3",
        default: "p-4",
        lg: "p-6",
        xl: "p-8"
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        default: "rounded-lg",
        lg: "rounded-xl",
        xl: "rounded-2xl",
        full: "rounded-full"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default"
    }
  }
)

export interface SurfaceProps 
  extends React.HTMLAttributes<HTMLDivElement>, 
    VariantProps<typeof surfaceVariants> {
  asChild?: boolean
  interactive?: boolean
}

const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant, size, rounded, interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="surface"
        className={cn(
          surfaceVariants({ variant, size, rounded }),
          interactive && "cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
          className
        )}
        {...props}
      />
    )
  }
)
Surface.displayName = "Surface"

// Additional Surface components for common use cases
const SurfaceCard = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, ...props }, ref) => {
    return (
      <Surface
        ref={ref}
        variant="card"
        className={cn("hover:shadow-lg transition-shadow duration-300", className)}
        {...props}
      />
    )
  }
)
SurfaceCard.displayName = "SurfaceCard"

const SurfaceElevated = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, ...props }, ref) => {
    return (
      <Surface
        ref={ref}
        variant="elevated"
        className={cn("hover:shadow-[var(--shadow-elevation-3)] transition-all duration-300", className)}
        {...props}
      />
    )
  }
)
SurfaceElevated.displayName = "SurfaceElevated"

const SurfaceFloating = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, ...props }, ref) => {
    return (
      <Surface
        ref={ref}
        variant="floating"
        className={cn("hover:shadow-[var(--shadow-elevation-4)] transition-all duration-300", className)}
        {...props}
      />
    )
  }
)
SurfaceFloating.displayName = "SurfaceFloating"

const SurfaceSubtle = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, ...props }, ref) => {
    return (
      <Surface
        ref={ref}
        variant="subtle"
        className={cn("hover:bg-gray-100/50 dark:hover:bg-gray-800/20", className)}
        {...props}
      />
    )
  }
)
SurfaceSubtle.displayName = "SurfaceSubtle"

export { 
  Surface, 
  SurfaceCard, 
  SurfaceElevated, 
  SurfaceFloating,
  SurfaceSubtle, 
  surfaceVariants 
}
