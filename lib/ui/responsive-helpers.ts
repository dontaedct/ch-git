/**
 * @fileoverview Responsive Design Helpers and Utilities
 * @module lib/ui/responsive-helpers
 * @version 1.0.0
 *
 * HT-034.7.4: Enhanced responsive design utilities for consistent mobile-first approach
 */

/**
 * Responsive Breakpoints (matching Tailwind CSS defaults)
 */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export type Breakpoint = keyof typeof breakpoints;

/**
 * Responsive Grid Patterns
 */
export const gridPatterns = {
  // Standard responsive grids
  cards: {
    '1-2-3': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    '1-2-4': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
    '1-3-6': 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4',
    '2-4-6': 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'
  },

  // Dashboard layouts
  dashboard: {
    main: 'grid grid-cols-1 lg:grid-cols-4 gap-6',
    sidebar: 'lg:col-span-1',
    content: 'lg:col-span-3',
    stats: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
    charts: 'grid grid-cols-1 xl:grid-cols-2 gap-6'
  },

  // Form layouts
  form: {
    single: 'grid grid-cols-1 gap-4',
    double: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    triple: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    mixed: 'grid grid-cols-1 md:grid-cols-3 gap-4'
  },

  // Navigation layouts
  nav: {
    horizontal: 'hidden md:flex md:items-center md:space-x-6',
    mobile: 'md:hidden',
    burger: 'md:hidden flex items-center'
  }
};

/**
 * Responsive Spacing Utilities
 */
export const spacing = {
  // Container padding
  container: {
    padding: 'px-4 sm:px-6 lg:px-8',
    maxWidth: 'max-w-7xl mx-auto',
    section: 'py-8 md:py-12 lg:py-16'
  },

  // Component spacing
  component: {
    stack: 'space-y-4 md:space-y-6',
    grid: 'gap-4 md:gap-6 lg:gap-8',
    inline: 'space-x-2 md:space-x-4',
    section: 'space-y-6 md:space-y-8 lg:space-y-12'
  },

  // Layout margins
  layout: {
    header: 'mb-6 md:mb-8 lg:mb-12',
    footer: 'mt-12 md:mt-16 lg:mt-20',
    sidebar: 'ml-0 lg:ml-64',
    content: 'mr-0 lg:mr-4'
  }
};

/**
 * Responsive Typography
 */
export const typography = {
  // Heading scales
  headings: {
    h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
    h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold',
    h3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold',
    h4: 'text-base sm:text-lg md:text-xl lg:text-2xl font-medium',
    h5: 'text-sm sm:text-base md:text-lg lg:text-xl font-medium',
    h6: 'text-xs sm:text-sm md:text-base lg:text-lg font-medium'
  },

  // Body text scales
  body: {
    large: 'text-base md:text-lg lg:text-xl',
    normal: 'text-sm md:text-base',
    small: 'text-xs md:text-sm',
    caption: 'text-xs'
  },

  // Display text
  display: {
    hero: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold',
    large: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
    medium: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold'
  }
};

/**
 * Responsive Component Patterns
 */
export const components = {
  // Card responsive patterns
  card: {
    base: 'rounded-lg border bg-card text-card-foreground shadow-sm',
    padding: 'p-4 md:p-6',
    header: 'space-y-1.5 p-4 md:p-6',
    content: 'p-4 md:p-6 pt-0',
    footer: 'flex items-center p-4 md:p-6 pt-0'
  },

  // Button responsive patterns
  button: {
    size: {
      sm: 'text-xs px-2 py-1 md:text-sm md:px-3 md:py-2',
      md: 'text-sm px-3 py-2 md:text-base md:px-4 md:py-2',
      lg: 'text-base px-4 py-2 md:text-lg md:px-6 md:py-3'
    },
    stack: 'flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-3'
  },

  // Input responsive patterns
  input: {
    base: 'text-sm md:text-base px-3 py-2 md:px-4 md:py-3',
    group: 'space-y-3 md:space-y-4',
    inline: 'flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-3'
  },

  // Modal responsive patterns
  modal: {
    container: 'fixed inset-0 z-50 flex items-center justify-center p-4',
    content: 'w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl',
    padding: 'p-4 md:p-6 lg:p-8'
  },

  // Navigation responsive patterns
  navigation: {
    desktop: 'hidden lg:flex lg:items-center lg:space-x-6',
    mobile: 'lg:hidden',
    sidebar: 'w-64 h-full fixed inset-y-0 left-0 transform -translate-x-full lg:translate-x-0 transition-transform',
    overlay: 'fixed inset-0 bg-black bg-opacity-50 lg:hidden'
  }
};

/**
 * Responsive Image Patterns
 */
export const images = {
  // Responsive image containers
  containers: {
    square: 'aspect-square overflow-hidden',
    video: 'aspect-video overflow-hidden',
    portrait: 'aspect-[3/4] overflow-hidden',
    landscape: 'aspect-[4/3] overflow-hidden'
  },

  // Responsive image sizing
  sizing: {
    cover: 'object-cover w-full h-full',
    contain: 'object-contain w-full h-full',
    responsive: 'w-full h-auto',
    fixed: 'w-auto h-auto'
  },

  // Avatar responsive patterns
  avatar: {
    sm: 'w-6 h-6 md:w-8 md:h-8',
    md: 'w-8 h-8 md:w-10 md:h-10',
    lg: 'w-10 h-10 md:w-12 md:h-12',
    xl: 'w-12 h-12 md:w-16 md:h-16'
  }
};

/**
 * Responsive Utilities and Hooks
 */
export const utils = {
  // Media query helpers
  createMediaQuery: (breakpoint: Breakpoint) => {
    return `(min-width: ${breakpoints[breakpoint]}px)`;
  },

  // Responsive class generator
  responsive: (base: string, overrides: Partial<Record<Breakpoint, string>>) => {
    let classes = base;

    Object.entries(overrides).forEach(([bp, value]) => {
      if (bp === 'sm') classes += ` sm:${value}`;
      else if (bp === 'md') classes += ` md:${value}`;
      else if (bp === 'lg') classes += ` lg:${value}`;
      else if (bp === 'xl') classes += ` xl:${value}`;
      else if (bp === '2xl') classes += ` 2xl:${value}`;
    });

    return classes;
  },

  // Hide on specific breakpoints
  hide: {
    mobile: 'hidden sm:block',
    tablet: 'sm:hidden lg:block',
    desktop: 'lg:hidden'
  },

  // Show only on specific breakpoints
  show: {
    mobile: 'block sm:hidden',
    tablet: 'hidden sm:block lg:hidden',
    desktop: 'hidden lg:block'
  }
};

/**
 * Touch and Mobile Optimizations
 */
export const touch = {
  // Touch target sizes (minimum 44px)
  targets: {
    minimum: 'min-h-[44px] min-w-[44px]',
    comfortable: 'min-h-[48px] min-w-[48px]',
    large: 'min-h-[56px] min-w-[56px]'
  },

  // Touch-friendly spacing
  spacing: {
    buttons: 'space-y-3 md:space-y-2',
    links: 'space-y-4 md:space-y-2',
    interactive: 'p-3 md:p-2'
  },

  // Mobile-specific interactions
  interactions: {
    tap: 'active:scale-95 transition-transform',
    swipe: 'touch-pan-x',
    scroll: 'overflow-x-auto touch-pan-x',
    pinch: 'touch-pinch-zoom'
  }
};

/**
 * Performance Optimizations
 */
export const performance = {
  // Lazy loading patterns
  lazy: {
    images: 'loading="lazy" decoding="async"',
    content: 'content-visibility-auto'
  },

  // Mobile performance
  mobile: {
    // Reduce animations on mobile
    reducedMotion: 'motion-reduce:animate-none motion-reduce:transition-none',
    // Optimize for mobile rendering
    willChange: 'will-change-transform',
    // GPU acceleration for smooth scrolling
    transform3d: 'transform-gpu'
  }
};

/**
 * Responsive Design Validation
 */
export const validation = {
  // Check if viewport is mobile
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoints.md;
  },

  // Check if viewport is tablet
  isTablet: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg;
  },

  // Check if viewport is desktop
  isDesktop: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= breakpoints.lg;
  },

  // Get current breakpoint
  getCurrentBreakpoint: (): Breakpoint => {
    if (typeof window === 'undefined') return 'lg';

    const width = window.innerWidth;
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    return 'sm';
  },

  // Responsive design audit
  auditResponsive: (element: HTMLElement) => {
    const checks = {
      hasMobileBreakpoints: element.className.includes('sm:') || element.className.includes('md:'),
      hasTabletBreakpoints: element.className.includes('md:') || element.className.includes('lg:'),
      hasDesktopBreakpoints: element.className.includes('lg:') || element.className.includes('xl:'),
      hasFlexibleGrid: element.className.includes('grid') && element.className.includes('grid-cols-'),
      hasResponsiveText: element.className.includes('text-') && (element.className.includes('sm:') || element.className.includes('md:')),
      hasTouchFriendlyTargets: element.querySelectorAll('button, a, input').length > 0
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const score = Math.round((passedChecks / totalChecks) * 100);

    return {
      score,
      checks,
      recommendations: validation.getResponsiveRecommendations(checks)
    };
  },

  // Get recommendations for responsive improvements
  getResponsiveRecommendations: (checks: Record<string, boolean>) => {
    const recommendations: string[] = [];

    if (!checks.hasMobileBreakpoints) {
      recommendations.push('Add mobile-first responsive breakpoints (sm:, md:)');
    }
    if (!checks.hasTabletBreakpoints) {
      recommendations.push('Add tablet-specific responsive breakpoints (md:, lg:)');
    }
    if (!checks.hasDesktopBreakpoints) {
      recommendations.push('Add desktop-specific responsive breakpoints (lg:, xl:)');
    }
    if (!checks.hasFlexibleGrid) {
      recommendations.push('Use flexible grid systems for layout');
    }
    if (!checks.hasResponsiveText) {
      recommendations.push('Add responsive typography scaling');
    }
    if (!checks.hasTouchFriendlyTargets) {
      recommendations.push('Ensure touch targets are at least 44px in size');
    }

    return recommendations;
  }
};

export default {
  breakpoints,
  gridPatterns,
  spacing,
  typography,
  components,
  images,
  utils,
  touch,
  performance,
  validation
};