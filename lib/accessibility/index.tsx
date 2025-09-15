/**
 * Accessibility Utilities
 * HT-021.3.2 - Core Component Infrastructure Setup
 * 
 * Comprehensive accessibility utilities for WCAG 2.1 AAA compliance
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// ============================================================================
// ACCESSIBILITY CONSTANTS
// ============================================================================

/**
 * WCAG 2.1 color contrast ratios
 */
export const CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5
} as const;

/**
 * Standard keyboard keys for navigation
 */
export const KEYBOARD_KEYS = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown'
} as const;

/**
 * ARIA roles for common component patterns
 */
export const ARIA_ROLES = {
  BUTTON: 'button',
  TAB: 'tab',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel',
  MENUBAR: 'menubar',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  LISTBOX: 'listbox',
  OPTION: 'option',
  COMBOBOX: 'combobox',
  DIALOG: 'dialog',
  ALERTDIALOG: 'alertdialog',
  ALERT: 'alert',
  STATUS: 'status',
  PROGRESSBAR: 'progressbar',
  SLIDER: 'slider',
  SPINBUTTON: 'spinbutton',
  SWITCH: 'switch',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  RADIOGROUP: 'radiogroup'
} as const;

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

/**
 * Hook for managing focus trap within a container
 */
export function useFocusTrap(active: boolean = false) {
  const containerRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!active || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.TAB) {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);
  
  return containerRef;
}

/**
 * Hook for restoring focus to previous element
 */
export function useRestoreFocus() {
  const previousActiveElement = useRef<HTMLElement | null>(null);
  
  const saveFocus = useCallback(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
  }, []);
  
  const restoreFocus = useCallback(() => {
    if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
      previousActiveElement.current.focus();
    }
  }, []);
  
  return { saveFocus, restoreFocus };
}

/**
 * Hook for managing focus visible state
 */
export function useFocusVisible() {
  const [focusVisible, setFocusVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    let hadKeyboardEvent = false;
    
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.TAB || e.key === KEYBOARD_KEYS.ENTER || e.key === KEYBOARD_KEYS.SPACE) {
        hadKeyboardEvent = true;
      }
    };
    
    const onFocus = () => {
      if (hadKeyboardEvent) {
        setFocusVisible(true);
      }
    };
    
    const onBlur = () => {
      setFocusVisible(false);
      hadKeyboardEvent = false;
    };
    
    const onMouseDown = () => {
      hadKeyboardEvent = false;
    };
    
    document.addEventListener('keydown', onKeyDown);
    element.addEventListener('focus', onFocus);
    element.addEventListener('blur', onBlur);
    element.addEventListener('mousedown', onMouseDown);
    
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      element.removeEventListener('focus', onFocus);
      element.removeEventListener('blur', onBlur);
      element.removeEventListener('mousedown', onMouseDown);
    };
  }, []);
  
  return { focusVisible, ref };
}

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

/**
 * Hook for arrow key navigation in lists
 */
export function useArrowNavigation<T extends HTMLElement>({
  orientation = 'vertical',
  loop = true,
  onNavigate
}: {
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  onNavigate?: (index: number, element: T) => void;
} = {}) {
  const containerRef = useRef<HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  const getFocusableElements = useCallback((): T[] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll('[role="option"], button, [tabindex="0"]')
    ) as T[];
  }, []);
  
  const navigate = useCallback((direction: 'next' | 'prev' | 'first' | 'last') => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;
    
    let nextIndex = currentIndex;
    
    switch (direction) {
      case 'next':
        nextIndex = currentIndex + 1;
        if (nextIndex >= elements.length) {
          nextIndex = loop ? 0 : elements.length - 1;
        }
        break;
      case 'prev':
        nextIndex = currentIndex - 1;
        if (nextIndex < 0) {
          nextIndex = loop ? elements.length - 1 : 0;
        }
        break;
      case 'first':
        nextIndex = 0;
        break;
      case 'last':
        nextIndex = elements.length - 1;
        break;
    }
    
    const targetElement = elements[nextIndex];
    if (targetElement) {
      targetElement.focus();
      setCurrentIndex(nextIndex);
      onNavigate?.(nextIndex, targetElement);
    }
  }, [currentIndex, getFocusableElements, loop, onNavigate]);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isVerticalKey = e.key === KEYBOARD_KEYS.ARROW_UP || e.key === KEYBOARD_KEYS.ARROW_DOWN;
    const isHorizontalKey = e.key === KEYBOARD_KEYS.ARROW_LEFT || e.key === KEYBOARD_KEYS.ARROW_RIGHT;
    
    if ((orientation === 'vertical' && !isVerticalKey) ||
        (orientation === 'horizontal' && !isHorizontalKey) ||
        (orientation !== 'both' && !isVerticalKey && !isHorizontalKey)) {
      return;
    }
    
    e.preventDefault();
    
    switch (e.key) {
      case KEYBOARD_KEYS.ARROW_UP:
      case KEYBOARD_KEYS.ARROW_LEFT:
        navigate('prev');
        break;
      case KEYBOARD_KEYS.ARROW_DOWN:
      case KEYBOARD_KEYS.ARROW_RIGHT:
        navigate('next');
        break;
      case KEYBOARD_KEYS.HOME:
        navigate('first');
        break;
      case KEYBOARD_KEYS.END:
        navigate('last');
        break;
    }
  }, [orientation, navigate]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  return {
    containerRef,
    currentIndex,
    navigate,
    setCurrentIndex
  };
}

// ============================================================================
// SCREEN READER UTILITIES
// ============================================================================

/**
 * Hook for managing live region announcements
 */
export function useLiveRegion() {
  const [announcements, setAnnouncements] = useState<Array<{
    id: string;
    message: string;
    priority: 'polite' | 'assertive';
  }>>([]);
  
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const id = `announcement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const announcement = { id, message, priority };
    
    setAnnouncements(prev => [...prev, announcement]);
    
    // Remove announcement after it's been announced
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 1000);
  }, []);
  
  const LiveRegion = useCallback(() => (
    <>
      {announcements.map(({ id, message, priority }) => (
        <div
          key={id}
          aria-live={priority}
          aria-atomic="true"
          className="sr-only"
        >
          {message}
        </div>
      ))}
    </>
  ), [announcements]);
  
  return { announce, LiveRegion };
}

/**
 * Generate accessible labels and descriptions
 */
export function generateA11yProps({
  label,
  description,
  error,
  required
}: {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
} = {}) {
  const id = `field-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ');
  
  return {
    id,
    'aria-label': label,
    'aria-describedby': describedBy || undefined,
    'aria-required': required,
    'aria-invalid': !!error,
    descriptionId,
    errorId
  };
}

// ============================================================================
// COLOR CONTRAST UTILITIES
// ============================================================================

/**
 * Calculate color contrast ratio
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Calculate relative luminance
    const adjustColor = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    
    return 0.2126 * adjustColor(r) + 0.7152 * adjustColor(g) + 0.0722 * adjustColor(b);
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const lightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (lightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG standards
 */
export function checkColorContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): {
  ratio: number;
  passes: boolean;
  level: string;
} {
  const ratio = calculateContrastRatio(foreground, background);
  
  let threshold: number;
  if (level === 'AAA') {
    threshold = size === 'large' ? CONTRAST_RATIOS.AAA_LARGE : CONTRAST_RATIOS.AAA_NORMAL;
  } else {
    threshold = size === 'large' ? CONTRAST_RATIOS.AA_LARGE : CONTRAST_RATIOS.AA_NORMAL;
  }
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    passes: ratio >= threshold,
    level: `${level} ${size}`
  };
}

// ============================================================================
// COMPONENT ACCESSIBILITY HOOK
// ============================================================================

/**
 * Main accessibility hook for components
 */
export function useAccessibility({
  element,
  role,
  label,
  description,
  keyboardNavigation = true,
  focusManagement = true,
  ...ariaProps
}: {
  element?: HTMLElement | null;
  role?: string;
  label?: string;
  description?: string;
  keyboardNavigation?: boolean;
  focusManagement?: boolean;
  [key: string]: any;
} = {}) {
  const { focusVisible, ref: focusRef } = useFocusVisible();
  const { announce } = useLiveRegion();
  
  // Generate ARIA props
  const a11yProps = generateA11yProps({
    label,
    description,
    required: ariaProps['aria-required'],
    error: ariaProps['aria-invalid'] ? 'Field has validation errors' : undefined
  });
  
  // Combine all accessibility props
  const accessibilityProps = {
    role,
    ...a11yProps,
    ...ariaProps,
    'data-focus-visible': focusVisible || undefined,
    ref: focusRef
  };
  
  return {
    ...accessibilityProps,
    announce,
    focusVisible
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

// All exports are already declared above individually