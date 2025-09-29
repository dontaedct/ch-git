/**
 * @fileoverview Accessibility Helpers and WCAG 2.1 Compliance Utilities
 * @module lib/ui/accessibility-helpers
 * @version 1.0.0
 *
 * HT-034.7.4: Enhanced accessibility utilities for WCAG 2.1 compliance
 */

/**
 * ARIA Helpers
 */
export const aria = {
  // Common ARIA attributes
  describedBy: (id: string) => ({ 'aria-describedby': id }),
  labelledBy: (id: string) => ({ 'aria-labelledby': id }),
  label: (label: string) => ({ 'aria-label': label }),
  expanded: (expanded: boolean) => ({ 'aria-expanded': expanded }),
  hidden: (hidden: boolean = true) => ({ 'aria-hidden': hidden }),
  current: (current: string) => ({ 'aria-current': current }),
  selected: (selected: boolean) => ({ 'aria-selected': selected }),
  pressed: (pressed: boolean) => ({ 'aria-pressed': pressed }),
  disabled: (disabled: boolean = true) => ({ 'aria-disabled': disabled }),
  required: (required: boolean = true) => ({ 'aria-required': required }),
  invalid: (invalid: boolean = true) => ({ 'aria-invalid': invalid }),
  live: (politeness: 'polite' | 'assertive' | 'off' = 'polite') => ({ 'aria-live': politeness }),
  atomic: (atomic: boolean = true) => ({ 'aria-atomic': atomic }),
  role: (role: string) => ({ role }),

  // Composite attributes for common patterns
  button: (label: string, pressed?: boolean) => ({
    role: 'button',
    'aria-label': label,
    ...(pressed !== undefined && { 'aria-pressed': pressed })
  }),

  combobox: (expanded: boolean, hasPopup: string = 'listbox') => ({
    role: 'combobox',
    'aria-expanded': expanded,
    'aria-haspopup': hasPopup
  }),

  dialog: (labelledBy: string, describedBy?: string) => ({
    role: 'dialog',
    'aria-labelledby': labelledBy,
    'aria-modal': true,
    ...(describedBy && { 'aria-describedby': describedBy })
  }),

  tab: (selected: boolean, controls: string) => ({
    role: 'tab',
    'aria-selected': selected,
    'aria-controls': controls,
    tabIndex: selected ? 0 : -1
  }),

  tabpanel: (labelledBy: string) => ({
    role: 'tabpanel',
    'aria-labelledby': labelledBy,
    tabIndex: 0
  }),

  listbox: (labelledBy?: string) => ({
    role: 'listbox',
    ...(labelledBy && { 'aria-labelledby': labelledBy })
  }),

  option: (selected: boolean) => ({
    role: 'option',
    'aria-selected': selected
  }),

  menu: (labelledBy?: string) => ({
    role: 'menu',
    ...(labelledBy && { 'aria-labelledby': labelledBy })
  }),

  menuitem: (hasSubMenu?: boolean) => ({
    role: 'menuitem',
    ...(hasSubMenu && { 'aria-haspopup': 'menu' })
  })
};

/**
 * Focus Management
 */
export const focus = {
  // Focus trap for modals and dialogs
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusableElement = focusableElements[0] as HTMLElement;
    const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstFocusableElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  // Save and restore focus
  saveFocus: () => {
    const activeElement = document.activeElement as HTMLElement;
    return () => activeElement?.focus();
  },

  // Focus management for dynamic content
  announceFocus: (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
};

/**
 * Keyboard Navigation Helpers
 */
export const keyboard = {
  // Common key codes
  keys: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    TAB: 'Tab',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown'
  },

  // Navigation handlers
  handleArrowNavigation: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onChange: (index: number) => void,
    wrap: boolean = true
  ) => {
    const { ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, HOME, END } = keyboard.keys;

    switch (event.key) {
      case ARROW_UP:
      case ARROW_LEFT:
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : wrap ? items.length - 1 : currentIndex;
        onChange(prevIndex);
        items[prevIndex]?.focus();
        break;

      case ARROW_DOWN:
      case ARROW_RIGHT:
        event.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : wrap ? 0 : currentIndex;
        onChange(nextIndex);
        items[nextIndex]?.focus();
        break;

      case HOME:
        event.preventDefault();
        onChange(0);
        items[0]?.focus();
        break;

      case END:
        event.preventDefault();
        const lastIndex = items.length - 1;
        onChange(lastIndex);
        items[lastIndex]?.focus();
        break;
    }
  },

  // Make element focusable
  makeFocusable: (element: HTMLElement, tabIndex: number = 0) => {
    element.tabIndex = tabIndex;
    return element;
  }
};

/**
 * Screen Reader Utilities
 */
export const screenReader = {
  // Visually hidden but available to screen readers
  srOnly: 'sr-only',

  // Show on focus (for skip links)
  srOnlyFocusable: 'sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-2 focus:py-1 focus:bg-background focus:text-foreground focus:border focus:rounded',

  // Live regions for dynamic content
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 2000);
  },

  // Status announcements
  announceStatus: (status: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const prefix = {
      success: 'Success: ',
      error: 'Error: ',
      warning: 'Warning: ',
      info: 'Information: '
    };

    screenReader.announce(`${prefix[type]}${status}`, type === 'error' ? 'assertive' : 'polite');
  }
};

/**
 * Color Contrast Utilities
 */
export const contrast = {
  // Minimum contrast ratios per WCAG 2.1
  ratios: {
    AA_NORMAL: 4.5,
    AA_LARGE: 3,
    AAA_NORMAL: 7,
    AAA_LARGE: 4.5
  },

  // Calculate relative luminance
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio
  getContrastRatio: (foreground: [number, number, number], background: [number, number, number]): number => {
    const [r1, g1, b1] = foreground;
    const [r2, g2, b2] = background;

    const l1 = contrast.getLuminance(r1, g1, b1);
    const l2 = contrast.getLuminance(r2, g2, b2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  },

  // Check if contrast meets WCAG requirements
  meetsWCAG: (ratio: number, level: 'AA' | 'AAA' = 'AA', isLargeText: boolean = false): boolean => {
    const threshold = level === 'AA'
      ? (isLargeText ? contrast.ratios.AA_LARGE : contrast.ratios.AA_NORMAL)
      : (isLargeText ? contrast.ratios.AAA_LARGE : contrast.ratios.AAA_NORMAL);

    return ratio >= threshold;
  }
};

/**
 * Form Accessibility Helpers
 */
export const form = {
  // Associate label with input
  labelFor: (inputId: string) => ({ htmlFor: inputId }),

  // Error announcement
  errorFor: (inputId: string, errorId: string) => ({
    'aria-describedby': errorId,
    'aria-invalid': true
  }),

  // Form validation state
  validationState: (isValid: boolean, errorId?: string) => ({
    'aria-invalid': !isValid,
    ...(errorId && !isValid && { 'aria-describedby': errorId })
  }),

  // Required field indicator
  required: () => ({
    'aria-required': true,
    required: true
  }),

  // Fieldset and legend
  fieldset: (legendId: string) => ({
    'aria-labelledby': legendId
  })
};

/**
 * Motion and Animation Accessibility
 */
export const motion = {
  // Respect user's motion preferences
  respectsReducedMotion: 'motion-reduce:transition-none motion-reduce:animate-none',

  // Safe animation classes
  fadeIn: 'animate-in fade-in duration-200 motion-reduce:animate-none',
  slideIn: 'animate-in slide-in-from-top-2 duration-200 motion-reduce:animate-none',

  // Check if user prefers reduced motion
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};

/**
 * Skip Links
 */
export const skipLinks = {
  // Main content skip link
  toMainContent: {
    href: '#main-content',
    className: screenReader.srOnlyFocusable,
    children: 'Skip to main content'
  },

  // Navigation skip link
  toNavigation: {
    href: '#navigation',
    className: screenReader.srOnlyFocusable,
    children: 'Skip to navigation'
  }
};

/**
 * Complete accessibility audit function
 */
export const audit = {
  // Basic accessibility check
  checkBasicAccessibility: (element: HTMLElement) => {
    const checks = {
      hasProperHeadings: element.querySelector('h1, h2, h3, h4, h5, h6') !== null,
      hasAltTextOnImages: Array.from(element.querySelectorAll('img')).every(img => img.hasAttribute('alt')),
      hasFormLabels: Array.from(element.querySelectorAll('input, select, textarea')).every(input => {
        const id = input.getAttribute('id');
        return id && element.querySelector(`label[for="${id}"]`) !== null;
      }),
      hasFocusManagement: element.querySelectorAll('[tabindex]').length > 0,
      hasSemanticMarkup: element.querySelector('main, nav, aside, section, article') !== null,
      hasSkipLinks: element.querySelector('a[href^="#"]') !== null
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const score = Math.round((passedChecks / totalChecks) * 100);

    return {
      score,
      checks,
      recommendations: audit.getRecommendations(checks)
    };
  },

  // Get recommendations based on failed checks
  getRecommendations: (checks: Record<string, boolean>) => {
    const recommendations: string[] = [];

    if (!checks.hasProperHeadings) {
      recommendations.push('Add semantic heading structure (h1, h2, h3, etc.)');
    }
    if (!checks.hasAltTextOnImages) {
      recommendations.push('Add descriptive alt text to all images');
    }
    if (!checks.hasFormLabels) {
      recommendations.push('Associate all form inputs with labels');
    }
    if (!checks.hasFocusManagement) {
      recommendations.push('Implement proper focus management with tabindex');
    }
    if (!checks.hasSemanticMarkup) {
      recommendations.push('Use semantic HTML elements (main, nav, section, etc.)');
    }
    if (!checks.hasSkipLinks) {
      recommendations.push('Add skip links for keyboard navigation');
    }

    return recommendations;
  }
};

export default {
  aria,
  focus,
  keyboard,
  screenReader,
  contrast,
  form,
  motion,
  skipLinks,
  audit
};