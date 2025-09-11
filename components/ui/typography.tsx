/**
 * @fileoverview HT-008.5.5: Typography Component System
 * @module components/ui/typography
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.5 - Create systematic spacing and typography scales
 * Focus: Vercel/Apply-level typography components with systematic spacing
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design consistency and readability)
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// HT-008.5.5: Enhanced Typography Component System
// Comprehensive typography components following Vercel/Apply design principles

/**
 * Typography Variants
 */
const typographyVariants = cva("", {
  variants: {
    variant: {
      // Display styles
      "display-2xl": "text-display-2xl font-display",
      "display-xl": "text-display-xl font-display",
      "display-lg": "text-display-lg font-display",
      "display-md": "text-display-md font-display",
      "display-sm": "text-display-sm font-display",
      
      // Heading styles
      "heading-xl": "text-heading-xl font-semibold",
      "heading-lg": "text-heading-lg font-semibold",
      "heading-md": "text-heading-md font-semibold",
      "heading-sm": "text-heading-sm font-semibold",
      "heading-xs": "text-heading-xs font-semibold",
      
      // Body text styles
      "body-xl": "text-body-xl font-normal",
      "body-lg": "text-body-lg font-normal",
      "body-md": "text-body-md font-normal",
      "body-sm": "text-body-sm font-normal",
      "body-xs": "text-body-xs font-normal",
      
      // Label styles
      "label-lg": "text-label-lg font-medium",
      "label-md": "text-label-md font-medium",
      "label-sm": "text-label-sm font-medium",
      "label-xs": "text-label-xs font-medium",
      
      // Caption styles
      "caption-lg": "text-caption-lg font-normal",
      "caption-md": "text-caption-md font-normal",
      "caption-sm": "text-caption-sm font-normal",
      
      // Code styles
      "code-lg": "text-code-lg font-mono",
      "code-md": "text-code-md font-mono",
      "code-sm": "text-code-sm font-mono",
    },
    color: {
      primary: "text-gray-900 dark:text-gray-100",
      secondary: "text-gray-600 dark:text-gray-400",
      muted: "text-gray-500 dark:text-gray-500",
      accent: "text-blue-600 dark:text-blue-400",
      destructive: "text-red-600 dark:text-red-400",
      success: "text-green-600 dark:text-green-400",
      warning: "text-yellow-600 dark:text-yellow-400",
      info: "text-blue-600 dark:text-blue-400",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
    weight: {
      thin: "font-thin",
      extralight: "font-extralight",
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
      black: "font-black",
    },
    spacing: {
      tight: "tracking-tight",
      normal: "tracking-normal",
      wide: "tracking-wide",
    },
  },
  defaultVariants: {
    variant: "body-md",
    color: "primary",
    align: "left",
    weight: "normal",
    spacing: "normal",
  },
})

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType
  children: React.ReactNode
}

/**
 * Base Typography Component
 */
const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, color, align, weight, spacing, as: Component = "p", ...props }, ref) => {
    return React.createElement(
      Component,
      {
        className: cn(typographyVariants({ variant, color, align, weight, spacing }), className),
        ref,
        ...props,
      }
    )
  }
)
Typography.displayName = "Typography"

/**
 * Display Components
 */
export const Display2XL = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="display-2xl"
    as="h1"
    className={cn("mb-6", className)}
    {...props}
  />
))
Display2XL.displayName = "Display2XL"

export const DisplayXL = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="display-xl"
    as="h1"
    className={cn("mb-5", className)}
    {...props}
  />
))
DisplayXL.displayName = "DisplayXL"

export const DisplayLG = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="display-lg"
    as="h1"
    className={cn("mb-4", className)}
    {...props}
  />
))
DisplayLG.displayName = "DisplayLG"

export const DisplayMD = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="display-md"
    as="h1"
    className={cn("mb-4", className)}
    {...props}
  />
))
DisplayMD.displayName = "DisplayMD"

export const DisplaySM = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="display-sm"
    as="h1"
    className={cn("mb-3", className)}
    {...props}
  />
))
DisplaySM.displayName = "DisplaySM"

/**
 * Heading Components
 */
export const HeadingXL = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="heading-xl"
    as="h2"
    className={cn("mb-3", className)}
    {...props}
  />
))
HeadingXL.displayName = "HeadingXL"

export const HeadingLG = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="heading-lg"
    as="h3"
    className={cn("mb-3", className)}
    {...props}
  />
))
HeadingLG.displayName = "HeadingLG"

export const HeadingMD = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="heading-md"
    as="h4"
    className={cn("mb-2", className)}
    {...props}
  />
))
HeadingMD.displayName = "HeadingMD"

export const HeadingSM = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="heading-sm"
    as="h5"
    className={cn("mb-2", className)}
    {...props}
  />
))
HeadingSM.displayName = "HeadingSM"

export const HeadingXS = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="heading-xs"
    as="h6"
    className={cn("mb-2", className)}
    {...props}
  />
))
HeadingXS.displayName = "HeadingXS"

/**
 * Body Text Components
 */
export const BodyXL = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="body-xl"
    as="p"
    className={cn("mb-4", className)}
    {...props}
  />
))
BodyXL.displayName = "BodyXL"

export const BodyLG = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="body-lg"
    as="p"
    className={cn("mb-3", className)}
    {...props}
  />
))
BodyLG.displayName = "BodyLG"

export const BodyMD = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="body-md"
    as="p"
    className={cn("mb-3", className)}
    {...props}
  />
))
BodyMD.displayName = "BodyMD"

export const BodySM = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="body-sm"
    as="p"
    className={cn("mb-2", className)}
    {...props}
  />
))
BodySM.displayName = "BodySM"

export const BodyXS = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="body-xs"
    as="p"
    className={cn("mb-2", className)}
    {...props}
  />
))
BodyXS.displayName = "BodyXS"

/**
 * Label Components
 */
export const LabelLG = React.forwardRef<
  HTMLLabelElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="label-lg"
    as="label"
    className={cn("block mb-1", className)}
    {...props}
  />
))
LabelLG.displayName = "LabelLG"

export const LabelMD = React.forwardRef<
  HTMLLabelElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="label-md"
    as="label"
    className={cn("block mb-1", className)}
    {...props}
  />
))
LabelMD.displayName = "LabelMD"

export const LabelSM = React.forwardRef<
  HTMLLabelElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="label-sm"
    as="label"
    className={cn("block mb-1", className)}
    {...props}
  />
))
LabelSM.displayName = "LabelSM"

export const LabelXS = React.forwardRef<
  HTMLLabelElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="label-xs"
    as="label"
    className={cn("block mb-1", className)}
    {...props}
  />
))
LabelXS.displayName = "LabelXS"

/**
 * Caption Components
 */
export const CaptionLG = React.forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="caption-lg"
    as="span"
    className={cn("block", className)}
    {...props}
  />
))
CaptionLG.displayName = "CaptionLG"

export const CaptionMD = React.forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="caption-md"
    as="span"
    className={cn("block", className)}
    {...props}
  />
))
CaptionMD.displayName = "CaptionMD"

export const CaptionSM = React.forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="caption-sm"
    as="span"
    className={cn("block", className)}
    {...props}
  />
))
CaptionSM.displayName = "CaptionSM"

/**
 * Code Components
 */
export const CodeLG = React.forwardRef<
  HTMLCodeElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="code-lg"
    as="code"
    className={cn("bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200", className)}
    {...props}
  />
))
CodeLG.displayName = "CodeLG"

export const CodeMD = React.forwardRef<
  HTMLCodeElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="code-md"
    as="code"
    className={cn("bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200", className)}
    {...props}
  />
))
CodeMD.displayName = "CodeMD"

export const CodeSM = React.forwardRef<
  HTMLCodeElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="code-sm"
    as="code"
    className={cn("bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200", className)}
    {...props}
  />
))
CodeSM.displayName = "CodeSM"

/**
 * Specialized Typography Components
 */

/**
 * Lead Text Component - For introductory paragraphs
 */
export const Lead = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant" | "color">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="body-xl"
    color="secondary"
    className={cn("max-w-3xl", className)}
    {...props}
  />
))
Lead.displayName = "Lead"

/**
 * Large Text Component - For emphasized content
 */
export const Large = React.forwardRef<
  HTMLDivElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="body-lg"
    className={cn("font-medium", className)}
    {...props}
  />
))
Large.displayName = "Large"

/**
 * Small Text Component - For fine print and metadata
 */
export const Small = React.forwardRef<
  HTMLSmallElement,
  Omit<TypographyProps, "variant" | "color">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="body-xs"
    color="muted"
    as="small"
    className={cn("", className)}
    {...props}
  />
))
Small.displayName = "Small"

/**
 * Muted Text Component - For secondary information
 */
export const Muted = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant" | "color">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="body-sm"
    color="muted"
    className={cn("", className)}
    {...props}
  />
))
Muted.displayName = "Muted"

/**
 * Blockquote Component - For quoted content
 */
export const Blockquote = React.forwardRef<
  HTMLQuoteElement,
  Omit<TypographyProps, "variant" | "color">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="body-lg"
    color="secondary"
    as="blockquote"
    className={cn("border-l-4 border-gray-200 dark:border-gray-700 pl-4 italic", className)}
    {...props}
  />
))
Blockquote.displayName = "Blockquote"

/**
 * List Component - For structured content
 */
export const List = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("my-4 ml-6 list-disc space-y-2", className)}
    {...props}
  />
))
List.displayName = "List"

/**
 * ListItem Component - For list items
 */
export const ListItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("text-body-md", className)}
    {...props}
  />
))
ListItem.displayName = "ListItem"

/**
 * Inline Code Component - For inline code snippets
 */
export const InlineCode = React.forwardRef<
  HTMLCodeElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="code-sm"
    as="code"
    className={cn("bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200 font-mono", className)}
    {...props}
  />
))
InlineCode.displayName = "InlineCode"

/**
 * Typography Container - For consistent spacing
 */
export const TypographyContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: "tight" | "normal" | "loose"
  }
>(({ className, spacing = "normal", ...props }, ref) => {
  const spacingClasses = {
    tight: "space-y-2",
    normal: "space-y-3",
    loose: "space-y-4",
  }

  return (
    <div
      ref={ref}
      className={cn(spacingClasses[spacing], className)}
      {...props}
    />
  )
})
TypographyContainer.displayName = "TypographyContainer"

export {
  Typography,
  typographyVariants,
}
