/**
 * @fileoverview HT-008.5.2: Design System Utilities
 * @module lib/design-system/utils
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.2 - Create consistent design system with proper tokens
 * Focus: Unified design token system with Vercel/Apply-level consistency
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design consistency and maintainability)
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { designTokens } from './tokens';

// HT-008.5.2: Enhanced utility functions for consistent design system usage

/**
 * Enhanced cn utility that merges Tailwind classes with design system tokens
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get design token value by path
 */
export function getToken(path: string): string {
  const parts = path.split('.');
  let value: any = designTokens;
  
  for (const part of parts) {
    value = value[part];
    if (value === undefined) {
      console.warn(`Design token path "${path}" not found`);
      return '';
    }
  }
  
  return typeof value === 'string' ? value : '';
}

/**
 * Create CSS custom property string
 */
export function createCSSVar(name: string, value: string): string {
  return `--${name}: ${value};`;
}

/**
 * Create CSS custom property with fallback
 */
export function createCSSVarWithFallback(name: string, value: string, fallback: string): string {
  return `--${name}: ${fallback}; --${name}: ${value};`;
}

/**
 * Get CSS variable value from document
 */
export function getCSSVar(variable: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

/**
 * Set CSS variable value on document
 */
export function setCSSVar(variable: string, value: string): void {
  if (typeof window === 'undefined') return;
  document.documentElement.style.setProperty(variable, value);
}

/**
 * Generate responsive classes based on breakpoints
 */
export function responsive(classes: Record<string, string>): string {
  const breakpoints = ['sm', 'md', 'lg', 'xl', '2xl'];
  const result: string[] = [];
  
  // Base classes (no prefix)
  if (classes.base) {
    result.push(classes.base);
  }
  
  // Responsive classes
  breakpoints.forEach(breakpoint => {
    if (classes[breakpoint]) {
      result.push(`${breakpoint}:${classes[breakpoint]}`);
    }
  });
  
  return result.join(' ');
}

/**
 * Generate spacing classes based on design tokens
 */
export function spacing(
  property: 'p' | 'px' | 'py' | 'pt' | 'pr' | 'pb' | 'pl' | 'm' | 'mx' | 'my' | 'mt' | 'mr' | 'mb' | 'ml',
  size: keyof typeof designTokens.spacing,
  responsive?: boolean
): string {
  const baseClass = `${property}-${size}`;
  
  if (!responsive) {
    return baseClass;
  }
  
  // Generate responsive spacing classes
  const responsiveClasses = [
    baseClass,
    `sm:${property}-${size}`,
    `md:${property}-${size}`,
    `lg:${property}-${size}`,
    `xl:${property}-${size}`,
  ];
  
  return responsiveClasses.join(' ');
}

/**
 * Generate typography classes based on design tokens
 */
export function typography(
  variant: 'display' | 'heading' | 'body' | 'caption' | 'label',
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
): string {
  const baseClasses = {
    display: 'font-display font-bold tracking-tight',
    heading: 'font-semibold tracking-tight',
    body: 'font-normal leading-relaxed',
    caption: 'font-medium text-muted-foreground',
    label: 'font-medium tracking-wide',
  };
  
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  };
  
  const classes = [baseClasses[variant]];
  
  if (size) {
    classes.push(sizeClasses[size]);
  }
  
  return classes.join(' ');
}

/**
 * Generate color classes based on design tokens
 */
export function color(
  type: 'text' | 'bg' | 'border',
  color: 'primary' | 'secondary' | 'accent' | 'muted' | 'destructive' | 'success' | 'warning' | 'info',
  variant?: 'foreground' | 'hover' | 'active'
): string {
  const colorName = variant ? `${color}-${variant}` : color;
  return `${type}-${colorName}`;
}

/**
 * Generate shadow classes based on design tokens
 */
export function shadow(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner' | 'none'): string {
  return `shadow-${size}`;
}

/**
 * Generate border radius classes based on design tokens
 */
export function radius(size: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'): string {
  return `rounded-${size}`;
}

/**
 * Generate motion classes based on design tokens
 */
export function motion(
  property: 'duration' | 'easing' | 'spring',
  value: string
): string {
  return `motion-${property}-${value}`;
}

/**
 * Generate component-specific classes
 */
export function component(
  component: 'button' | 'input' | 'card' | 'badge' | 'chip' | 'tabs' | 'toast' | 'modal',
  variant?: string,
  size?: string
): string {
  const baseClass = `component-${component}`;
  const classes = [baseClass];
  
  if (variant) {
    classes.push(`${baseClass}-${variant}`);
  }
  
  if (size) {
    classes.push(`${baseClass}-${size}`);
  }
  
  return classes.join(' ');
}

/**
 * Generate layout classes based on design tokens
 */
export function layout(
  type: 'container' | 'grid' | 'flex' | 'stack',
  options?: {
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
    columns?: number;
    gap?: 'sm' | 'md' | 'lg' | 'xl';
    direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  }
): string {
  const classes: string[] = [];
  
  switch (type) {
    case 'container':
      classes.push('container');
      if (options?.maxWidth) {
        classes.push(`max-w-${options.maxWidth}`);
      }
      break;
      
    case 'grid':
      classes.push('grid');
      if (options?.columns) {
        classes.push(`grid-cols-${options.columns}`);
      }
      if (options?.gap) {
        classes.push(`gap-${options.gap}`);
      }
      break;
      
    case 'flex':
      classes.push('flex');
      if (options?.direction) {
        classes.push(`flex-${options.direction}`);
      }
      if (options?.align) {
        classes.push(`items-${options.align}`);
      }
      if (options?.justify) {
        classes.push(`justify-${options.justify}`);
      }
      if (options?.gap) {
        classes.push(`gap-${options.gap}`);
      }
      break;
      
    case 'stack':
      classes.push('flex flex-col');
      if (options?.gap) {
        classes.push(`gap-${options.gap}`);
      }
      break;
  }
  
  return classes.join(' ');
}

/**
 * Generate responsive layout classes
 */
export function responsiveLayout(
  type: 'container' | 'grid' | 'flex' | 'stack',
  breakpoints: Record<string, any>
): string {
  const classes: string[] = [];
  
  // Base classes
  if (breakpoints.base) {
    classes.push(layout(type, breakpoints.base));
  }
  
  // Responsive classes
  Object.entries(breakpoints).forEach(([breakpoint, options]) => {
    if (breakpoint !== 'base') {
      const responsiveClass = layout(type, options);
      if (responsiveClass) {
        classes.push(`${breakpoint}:${responsiveClass}`);
      }
    }
  });
  
  return classes.join(' ');
}

/**
 * Generate z-index classes based on design tokens
 */
export function zIndex(
  level: 'hide' | 'auto' | 'base' | 'docked' | 'dropdown' | 'sticky' | 'banner' | 'overlay' | 'modal' | 'popover' | 'skipLink' | 'toast' | 'tooltip'
): string {
  return `z-${level}`;
}

/**
 * Generate focus ring classes
 */
export function focusRing(color: 'primary' | 'secondary' | 'accent' | 'destructive' = 'primary'): string {
  return `focus-visible:ring-2 focus-visible:ring-${color} focus-visible:ring-offset-2`;
}

/**
 * Generate hover classes
 */
export function hover(property: 'bg' | 'text' | 'border', color: string): string {
  return `hover:${property}-${color}`;
}

/**
 * Generate active classes
 */
export function active(property: 'bg' | 'text' | 'border', color: string): string {
  return `active:${property}-${color}`;
}

/**
 * Generate disabled classes
 */
export function disabled(): string {
  return 'disabled:pointer-events-none disabled:opacity-50';
}

/**
 * Generate transition classes based on design tokens
 */
export function transition(
  properties: string[] = ['all'],
  duration: '75' | '100' | '150' | '200' | '300' | '500' | '700' | '1000' = '150',
  easing: 'linear' | 'in' | 'out' | 'in-out' | 'smooth' | 'bounce' | 'elastic' = 'in-out'
): string {
  const propertyString = properties.join(', ');
  return `transition-[${propertyString}] duration-${duration} ease-${easing}`;
}

/**
 * Generate animation classes
 */
export function animation(
  name: string,
  duration: '75' | '100' | '150' | '200' | '300' | '500' | '700' | '1000' = '200',
  easing: 'linear' | 'in' | 'out' | 'in-out' | 'smooth' | 'bounce' | 'elastic' = 'smooth',
  delay?: '75' | '100' | '150' | '200' | '300' | '500' | '700' | '1000'
): string {
  const classes = [`animate-${name}`, `duration-${duration}`, `ease-${easing}`];
  
  if (delay) {
    classes.push(`delay-${delay}`);
  }
  
  return classes.join(' ');
}

/**
 * Generate accessibility classes
 */
export function a11y(
  type: 'focus' | 'screen-reader' | 'skip-link' | 'sr-only' | 'not-sr-only'
): string {
  const classes = {
    focus: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    'screen-reader': 'sr-only',
    'skip-link': 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-skipLink focus:p-4 focus:bg-primary focus:text-primary-foreground',
    'sr-only': 'sr-only',
    'not-sr-only': 'not-sr-only',
  };
  
  return classes[type];
}

/**
 * Generate responsive visibility classes
 */
export function visibility(
  breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl',
  action: 'show' | 'hide'
): string {
  return action === 'show' ? `${breakpoint}:block` : `${breakpoint}:hidden`;
}

/**
 * Generate responsive text size classes
 */
export function responsiveText(
  base: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl',
  breakpoints: Record<string, 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'>
): string {
  const classes = [`text-${base}`];
  
  Object.entries(breakpoints).forEach(([breakpoint, size]) => {
    classes.push(`${breakpoint}:text-${size}`);
  });
  
  return classes.join(' ');
}

/**
 * Generate responsive spacing classes
 */
export function responsiveSpacing(
  property: 'p' | 'px' | 'py' | 'pt' | 'pr' | 'pb' | 'pl' | 'm' | 'mx' | 'my' | 'mt' | 'mr' | 'mb' | 'ml',
  base: keyof typeof designTokens.spacing,
  breakpoints: Record<string, keyof typeof designTokens.spacing>
): string {
  const classes = [`${property}-${base}`];
  
  Object.entries(breakpoints).forEach(([breakpoint, size]) => {
    classes.push(`${breakpoint}:${property}-${size}`);
  });
  
  return classes.join(' ');
}

export default {
  cn,
  getToken,
  createCSSVar,
  createCSSVarWithFallback,
  getCSSVar,
  setCSSVar,
  responsive,
  spacing,
  typography,
  color,
  shadow,
  radius,
  motion,
  component,
  layout,
  responsiveLayout,
  zIndex,
  focusRing,
  hover,
  active,
  disabled,
  transition,
  animation,
  a11y,
  visibility,
  responsiveText,
  responsiveSpacing,
};
