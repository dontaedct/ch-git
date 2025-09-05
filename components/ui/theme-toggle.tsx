/**
 * @fileoverview Theme Toggle Component for HT-002.1.2 - Linear/Vercel-inspired theme switching
 * @module components/ui/theme-toggle
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-002.1.2 - Create theme toggle component with accessibility
 * 
 * Features:
 * - Full accessibility support (ARIA labels, keyboard navigation, screen readers)
 * - Linear/Vercel-inspired design with subtle micro-interactions
 * - Icon switching between light/dark/system modes
 * - Integration with next-themes and design tokens
 * - Reduced motion support
 * - Focus states and proper semantic structure
 * - UI Polish integration with dark-first theming
 * 
 * UI POLISH NOTE: This component will be EXTENDED (not duplicated) for Swift-inspired
 * aesthetic changes. All modifications behind FEATURE_UI_POLISH_TARGET_STYLE flag.
 * 
 * @example
 * ```tsx
 * // Basic theme toggle
 * <ThemeToggle />
 * 
 * // With custom size
 * <ThemeToggle size="sm" />
 * 
 * // With custom variant
 * <ThemeToggle variant="outline" />
 * ```
 */

"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { isUiPolishEnabled } from "@/lib/ui-polish-flags"

const themeToggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all duration-200 ease-spring hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-muted hover:text-muted-foreground",
        outline: "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        subtle: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
      },
      size: {
        sm: "h-8 px-2 min-w-8",
        default: "h-9 px-3 min-w-9",
        lg: "h-10 px-4 min-w-10",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ThemeToggleProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof themeToggleVariants> {
  /**
   * Whether to show the current theme label
   * @default false
   */
  showLabel?: boolean
  /**
   * Custom labels for each theme
   */
  labels?: {
    light?: string
    dark?: string
    system?: string
  }
  /**
   * Whether to disable system theme option
   * @default false
   */
  disableSystem?: boolean
}

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const

const defaultLabels = {
  light: "Switch to light theme",
  dark: "Switch to dark theme", 
  system: "Switch to system theme",
} as const

function ThemeToggle({
  className,
  variant,
  size,
  showLabel = false,
  labels = defaultLabels,
  disableSystem = false,
  ...props
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const isUiPolishOn = isUiPolishEnabled()

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <button
        className={cn(themeToggleVariants({ variant, size, className }))}
        disabled
        aria-label="Theme toggle loading"
        {...props}
      >
        <div className="size-4 animate-pulse bg-muted rounded" />
        {showLabel && <span className="sr-only">Loading theme toggle</span>}
      </button>
    )
  }

  const currentTheme = theme || "system"
  const Icon = themeIcons[currentTheme as keyof typeof themeIcons]
  
  const cycleTheme = () => {
    // When UI polish is enabled, prioritize dark/light toggle (no system)
    const themes = isUiPolishOn || disableSystem ? ["light", "dark"] : ["light", "dark", "system"]
    const currentIndex = themes.indexOf(currentTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      cycleTheme()
    }
  }

  const getAriaLabel = () => {
    if (showLabel) {
      return labels[currentTheme as keyof typeof labels] || `Current theme: ${currentTheme}`
    }
    return labels[currentTheme as keyof typeof labels] || `Switch theme from ${currentTheme}`
  }

  // Only render when UI polish is enabled
  if (!isUiPolishOn) {
    return null
  }

  return (
    <button
      type="button"
      className={cn(themeToggleVariants({ variant, size, className }))}
      onClick={cycleTheme}
      onKeyDown={handleKeyDown}
      aria-label={getAriaLabel()}
      aria-pressed={false}
      role="button"
      tabIndex={0}
      data-theme={currentTheme}
      data-resolved-theme={resolvedTheme}
      {...props}
    >
      <Icon 
        className="size-4 transition-transform duration-200 ease-spring" 
        aria-hidden="true"
      />
      {showLabel && (
        <span className="sr-only sm:not-sr-only">
          {currentTheme === "light" && "Light"}
          {currentTheme === "dark" && "Dark"}
          {currentTheme === "system" && "System"}
        </span>
      )}
    </button>
  )
}

// Specialized theme toggle variants
const LightThemeToggle = React.forwardRef<HTMLButtonElement, Omit<ThemeToggleProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <ThemeToggle ref={ref} variant="outline" {...props}>
      {children}
    </ThemeToggle>
  )
)
LightThemeToggle.displayName = "LightThemeToggle"

const GhostThemeToggle = React.forwardRef<HTMLButtonElement, Omit<ThemeToggleProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <ThemeToggle ref={ref} variant="ghost" {...props}>
      {children}
    </ThemeToggle>
  )
)
GhostThemeToggle.displayName = "GhostThemeToggle"

const SubtleThemeToggle = React.forwardRef<HTMLButtonElement, Omit<ThemeToggleProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <ThemeToggle ref={ref} variant="subtle" {...props}>
      {children}
    </ThemeToggle>
  )
)
SubtleThemeToggle.displayName = "SubtleThemeToggle"

// Icon-only variants
const IconThemeToggle = React.forwardRef<HTMLButtonElement, Omit<ThemeToggleProps, 'size'>>(
  ({ children, ...props }, ref) => (
    <ThemeToggle ref={ref} size="icon" {...props}>
      {children}
    </ThemeToggle>
  )
)
IconThemeToggle.displayName = "IconThemeToggle"

const SmallIconThemeToggle = React.forwardRef<HTMLButtonElement, Omit<ThemeToggleProps, 'size'>>(
  ({ children, ...props }, ref) => (
    <ThemeToggle ref={ref} size="icon-sm" {...props}>
      {children}
    </ThemeToggle>
  )
)
SmallIconThemeToggle.displayName = "SmallIconThemeToggle"

const LargeIconThemeToggle = React.forwardRef<HTMLButtonElement, Omit<ThemeToggleProps, 'size'>>(
  ({ children, ...props }, ref) => (
    <ThemeToggle ref={ref} size="icon-lg" {...props}>
      {children}
    </ThemeToggle>
  )
)
LargeIconThemeToggle.displayName = "LargeIconThemeToggle"

export { 
  ThemeToggle,
  themeToggleVariants,
  LightThemeToggle,
  GhostThemeToggle,
  SubtleThemeToggle,
  IconThemeToggle,
  SmallIconThemeToggle,
  LargeIconThemeToggle
}
