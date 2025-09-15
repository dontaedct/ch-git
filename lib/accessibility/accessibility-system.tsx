/**
 * @fileoverview HT-008 Phase 3: Comprehensive Accessibility System
 * @module lib/accessibility/accessibility-system
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.3 - Accessibility Violations Correction
 * Focus: WCAG 2.1 AAA compliance with comprehensive accessibility features
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (accessibility compliance requirements)
 */

import React from 'react';

/**
 * Accessibility System - Comprehensive WCAG 2.1 AAA Compliance
 * 
 * This system provides comprehensive accessibility features including:
 * - ARIA labels and roles management
 * - Keyboard navigation utilities
 * - Focus management and trapping
 * - Screen reader support
 * - Color contrast validation
 * - Reduced motion support
 * - Live regions for dynamic content
 * - Skip links and navigation aids
 */

// ============================================================================
// ARIA LABELS AND ROLES MANAGEMENT
// ============================================================================

export interface AriaLabelConfig {
  label?: string;
  description?: string;
  describedBy?: string;
  labelledBy?: string;
  role?: string;
  expanded?: boolean;
  selected?: boolean;
  checked?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  live?: 'off' | 'polite' | 'assertive';
  atomic?: boolean;
}

export const createAriaProps = (config: AriaLabelConfig) => {
  const props: Record<string, any> = {};
  
  if (config.label) props['aria-label'] = config.label;
  if (config.description) props['aria-description'] = config.description;
  if (config.describedBy) props['aria-describedby'] = config.describedBy;
  if (config.labelledBy) props['aria-labelledby'] = config.labelledBy;
  if (config.role) props['role'] = config.role;
  if (config.expanded !== undefined) props['aria-expanded'] = config.expanded;
  if (config.selected !== undefined) props['aria-selected'] = config.selected;
  if (config.checked !== undefined) props['aria-checked'] = config.checked;
  if (config.disabled !== undefined) props['aria-disabled'] = config.disabled;
  if (config.hidden !== undefined) props['aria-hidden'] = config.hidden;
  if (config.live) props['aria-live'] = config.live;
  if (config.atomic !== undefined) props['aria-atomic'] = config.atomic;
  
  return props;
};

// ============================================================================
// KEYBOARD NAVIGATION UTILITIES
// ============================================================================

export interface KeyboardNavigationConfig {
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onPageUp?: () => void;
  onPageDown?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  preventDefault?: boolean;
}

export const createKeyboardHandlers = (config: KeyboardNavigationConfig) => {
  return (event: React.KeyboardEvent) => {
    const { key, shiftKey } = event;
    
    if (config.preventDefault !== false) {
      event.preventDefault();
    }
    
    switch (key) {
      case 'Enter':
        config.onEnter?.();
        break;
      case ' ':
        config.onSpace?.();
        break;
      case 'Escape':
        config.onEscape?.();
        break;
      case 'ArrowUp':
        config.onArrowUp?.();
        break;
      case 'ArrowDown':
        config.onArrowDown?.();
        break;
      case 'ArrowLeft':
        config.onArrowLeft?.();
        break;
      case 'ArrowRight':
        config.onArrowRight?.();
        break;
      case 'Home':
        config.onHome?.();
        break;
      case 'End':
        config.onEnd?.();
        break;
      case 'PageUp':
        config.onPageUp?.();
        break;
      case 'PageDown':
        config.onPageDown?.();
        break;
      case 'Tab':
        if (shiftKey) {
          config.onShiftTab?.();
        } else {
          config.onTab?.();
        }
        break;
    }
  };
};

// ============================================================================
// FOCUS MANAGEMENT AND TRAPPING
// ============================================================================

export interface FocusTrapConfig {
  containerRef: React.RefObject<HTMLElement>;
  initialFocusRef?: React.RefObject<HTMLElement>;
  returnFocusRef?: React.RefObject<HTMLElement>;
  disabled?: boolean;
}

export const useFocusTrap = (config: FocusTrapConfig) => {
  const { containerRef, initialFocusRef, returnFocusRef, disabled = false } = config;
  
  React.useEffect(() => {
    if (disabled || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    // Set initial focus
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else if (firstElement) {
      firstElement.focus();
    }
    
    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
      // Return focus to previous element
      returnFocusRef?.current?.focus();
    };
  }, [containerRef, initialFocusRef, returnFocusRef, disabled]);
};

// ============================================================================
// SCREEN READER SUPPORT
// ============================================================================

export interface ScreenReaderConfig {
  announce?: string;
  polite?: boolean;
  atomic?: boolean;
}

export const useScreenReaderAnnouncement = () => {
  const [announcement, setAnnouncement] = React.useState<string>('');
  const [polite, setPolite] = React.useState<boolean>(true);
  const [atomic, setAtomic] = React.useState<boolean>(true);
  
  const announce = React.useCallback((message: string, options?: { polite?: boolean; atomic?: boolean }) => {
    setAnnouncement(message);
    setPolite(options?.polite ?? true);
    setAtomic(options?.atomic ?? true);
    
    // Clear announcement after a short delay
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);
  
  const ScreenReaderAnnouncer = React.useMemo(() => (
    <div
      aria-live={polite ? 'polite' : 'assertive'}
      aria-atomic={atomic}
      className="sr-only"
      role="status"
    >
      {announcement}
    </div>
  ), [announcement, polite, atomic]);
  
  return { announce, ScreenReaderAnnouncer };
};

// ============================================================================
// COLOR CONTRAST VALIDATION
// ============================================================================

export interface ColorContrastConfig {
  foreground: string;
  background: string;
  level?: 'AA' | 'AAA';
  fontSize?: 'normal' | 'large';
}

export const validateColorContrast = (config: ColorContrastConfig): boolean => {
  const { foreground, background, level = 'AA', fontSize = 'normal' } = config;
  
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  
  if (!fgRgb || !bgRgb) return false;
  
  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const fgLuminance = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  
  const contrast = (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05);
  
  // WCAG contrast ratios
  const requiredContrast = level === 'AAA' 
    ? (fontSize === 'large' ? 4.5 : 7.0)
    : (fontSize === 'large' ? 3.0 : 4.5);
  
  return contrast >= requiredContrast;
};

// ============================================================================
// REDUCED MOTION SUPPORT
// ============================================================================

export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return prefersReducedMotion;
};

// ============================================================================
// LIVE REGIONS FOR DYNAMIC CONTENT
// ============================================================================

export interface LiveRegionConfig {
  message: string;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
}

export const LiveRegion: React.FC<LiveRegionConfig> = ({ 
  message, 
  priority = 'polite', 
  atomic = true 
}) => {
  return (
    <div
      aria-live={priority}
      aria-atomic={atomic}
      className="sr-only"
      role="status"
    >
      {message}
    </div>
  );
};

// ============================================================================
// SKIP LINKS AND NAVIGATION AIDS
// ============================================================================

export interface SkipLinkConfig {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkConfig> = ({ 
  href, 
  children, 
  className = '' 
}) => {
  return (
    <a
      href={href}
      className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg ${className}`}
      onFocus={(e) => {
        e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
    >
      {children}
    </a>
  );
};

// ============================================================================
// ACCESSIBILITY HOOKS
// ============================================================================

export const useAccessibility = () => {
  const prefersReducedMotion = useReducedMotion();
  const { announce, ScreenReaderAnnouncer } = useScreenReaderAnnouncement();
  
  return {
    prefersReducedMotion,
    announce,
    ScreenReaderAnnouncer,
    createAriaProps,
    createKeyboardHandlers,
    useFocusTrap,
    validateColorContrast,
    LiveRegion,
    SkipLink,
  };
};

// ============================================================================
// ACCESSIBILITY UTILITIES
// ============================================================================

export const accessibilityUtils = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix: string = 'a11y') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Check if element is focusable
  isFocusable: (element: HTMLElement): boolean => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    return focusableSelectors.some(selector => element.matches(selector));
  },
  
  // Get all focusable elements within a container
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    
    return Array.from(container.querySelectorAll(focusableSelectors));
  },
  
  // Validate heading hierarchy
  validateHeadingHierarchy: (container: HTMLElement): boolean => {
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let previousLevel = 0;
    
    for (const heading of headings) {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      
      if (currentLevel > previousLevel + 1) {
        return false; // Skipped heading level
      }
      
      previousLevel = currentLevel;
    }
    
    return true;
  },
  
  // Check for missing alt text
  validateImageAltText: (container: HTMLElement): HTMLElement[] => {
    const images = Array.from(container.querySelectorAll('img'));
    return images.filter(img => !img.alt && !img.getAttribute('aria-label'));
  },
  
  // Validate form labels
  validateFormLabels: (container: HTMLElement): HTMLElement[] => {
    const inputs = Array.from(container.querySelectorAll('input, select, textarea')) as HTMLElement[];
    return inputs.filter(input => {
      const id = input.id;
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      
      if (ariaLabel || ariaLabelledBy) return false;
      
      if (id) {
        const label = container.querySelector(`label[for="${id}"]`);
        return !label;
      }
      
      return true;
    });
  }
};

export default accessibilityUtils;
