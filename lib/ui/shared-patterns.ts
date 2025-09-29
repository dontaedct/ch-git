/**
 * @fileoverview Shared UI Patterns for Component Standardization
 * @module lib/ui/shared-patterns
 * @version 1.0.0
 *
 * Implementation of HT-034.7.2: Component Standardization & Shared Pattern Implementation
 * Provides standardized UI patterns, themes, and component utilities
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Enhanced cn utility with design token support
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Standardized theme detection utility
 * Replaces manual theme detection with design system utility
 */
export interface ThemeContext {
  isDark: boolean;
  theme: string;
  systemTheme: string;
}

export function useThemeDetection(): ThemeContext {
  // This would integrate with your existing theme system
  // For now, returning a compatible interface
  if (typeof window === 'undefined') {
    return { isDark: false, theme: 'light', systemTheme: 'light' };
  }

  const theme = localStorage.getItem('theme') || 'system';
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  return { isDark, theme, systemTheme };
}

/**
 * Standardized card patterns with consistent styling
 */
export const cardPatterns = {
  // Standard admin card with proper description
  admin: {
    className: "bg-card border-border hover:shadow-md transition-shadow duration-200",
    headerClassName: "pb-3",
    contentClassName: "pt-0"
  },

  // Analytics card with enhanced styling
  analytics: {
    className: "bg-card border-border hover:shadow-lg transition-all duration-300 hover:border-accent",
    headerClassName: "pb-4 border-b border-border/50",
    contentClassName: "pt-4"
  },

  // Feature card with emphasis
  feature: {
    className: "bg-card border-border hover:bg-accent/5 transition-colors duration-200",
    headerClassName: "pb-3",
    contentClassName: "pt-0"
  }
};

/**
 * Standardized animation variants
 */
export const animationVariants = {
  // Standard container animation
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  },

  // Standard item animation
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  },

  // Card hover animation
  cardHover: {
    rest: { scale: 1 },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  }
};

/**
 * Standardized spacing using design tokens
 */
export const spacing = {
  section: "space-y-6",
  cardGrid: "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
  form: "space-y-4",
  buttonGroup: "flex gap-3",
  inline: "space-x-2"
};

/**
 * Standardized typography classes
 */
export const typography = {
  pageTitle: "text-3xl font-bold tracking-tight",
  pageDescription: "text-muted-foreground mt-2",
  sectionTitle: "text-xl font-semibold",
  cardTitle: "text-lg font-medium",
  cardDescription: "text-sm text-muted-foreground"
};

/**
 * Standardized status badges
 */
export const statusBadges = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
};

/**
 * Standardized button variants
 */
export const buttonVariants = {
  primary: "bg-primary hover:bg-primary/90 text-primary-foreground",
  secondary: "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
  outline: "border border-input hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground"
};

/**
 * Accessibility helpers
 */
export const a11y = {
  skipToContent: "sr-only focus:not-sr-only",
  visuallyHidden: "sr-only",
  focusRing: "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
};

/**
 * Responsive breakpoints
 */
export const breakpoints = {
  mobile: "max-md:",
  tablet: "md:",
  desktop: "lg:",
  wide: "xl:"
};