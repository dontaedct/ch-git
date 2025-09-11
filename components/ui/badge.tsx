/**
 * @fileoverview Badge primitive component
 * @module components/ui/badge
 * 
 * UI POLISH NOTE: This component will be EXTENDED (not duplicated) for Swift-inspired
 * aesthetic changes. All modifications behind FEATURE_UI_POLISH_TARGET_STYLE flag.
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-xl border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-300 ease-out overflow-hidden high-tech-badge",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg [a&]:hover:from-blue-700 [a&]:hover:to-blue-800",
        secondary:
          "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm hover:shadow-md [a&]:hover:bg-gray-200 dark:[a&]:hover:bg-gray-700",
        destructive:
          "border-transparent bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md hover:shadow-lg [a&]:hover:from-red-700 [a&]:hover:to-red-800 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/40",
        outline:
          "text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md [a&]:hover:bg-gray-50 dark:[a&]:hover:bg-gray-800 [a&]:hover:text-gray-900 dark:[a&]:hover:text-gray-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
