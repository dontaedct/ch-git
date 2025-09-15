/**
 * HT-023.1.2: Responsive Template API
 * 
 * Responsive design system API for HT-023
 * Part of the Template Engine Integration
 */

import { Template, ResponsiveTemplate, ResponsiveBreakpoint, ResponsiveContext, ResponsiveVariant } from '../core/types';

export interface ResponsiveOptions {
  breakpoints?: ResponsiveBreakpoint[];
  enableTouchDetection?: boolean;
  enableOrientationDetection?: boolean;
  enableReducedMotionDetection?: boolean;
}

export interface ResponsiveTemplateOptions {
  generateVariants?: boolean;
  optimizeForMobile?: boolean;
  enableProgressiveEnhancement?: boolean;
}

export class ResponsiveTemplateAPI {
  private options: ResponsiveOptions;
  private breakpointListeners = new Map<string, (breakpoint: ResponsiveBreakpoint) => void>();

  constructor(options: ResponsiveOptions = {}) {
    this.options = {
      breakpoints: [
        { name: 'xs', minWidth: 0, maxWidth: 383 },
        { name: 'sm', minWidth: 384, maxWidth: 767 },
        { name: 'md', minWidth: 768, maxWidth: 1023 },
        { name: 'lg', minWidth: 1024, maxWidth: 1279 },
        { name: 'xl', minWidth: 1280, maxWidth: 1535 },
        { name: '2xl', minWidth: 1536, maxWidth: 1919 },
        { name: '3xl', minWidth: 1920, maxWidth: Infinity }
      ],
      enableTouchDetection: true,
      enableOrientationDetection: true,
      enableReducedMotionDetection: true,
      ...options
    };
  }

  /**
   * Generate responsive variants of a template
   */
  async generateResponsiveVariants(template: Template, options: ResponsiveTemplateOptions = {}): Promise<ResponsiveTemplate> {
    const {
      generateVariants = true,
      optimizeForMobile = true,
      enableProgressiveEnhancement = true
    } = options;

    const responsiveTemplate: ResponsiveTemplate = {
      ...template,
      breakpoints: this.options.breakpoints!,
      variants: generateVariants ? await this.createResponsiveVariants(template) as ResponsiveVariant[] : [] as ResponsiveVariant[]
    };

    return responsiveTemplate;
  }

  /**
   * Get current responsive context
   */
  getCurrentContext(): ResponsiveContext {
    if (typeof window === 'undefined') {
      return this.getDefaultContext();
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = this.getCurrentBreakpoint(width);
    
    return {
      breakpoint: breakpoint.name,
      device: this.getDeviceType(width) as 'mobile' | 'tablet' | 'desktop',
      orientation: this.options.enableOrientationDetection ? this.getOrientation() : 'landscape',
      width,
      height
    };
  }

  /**
   * Get device type based on width
   */
  getDeviceType(width: number): 'mobile' | 'tablet' | 'desktop' {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Get current breakpoint based on width
   */
  getCurrentBreakpoint(width: number): ResponsiveBreakpoint {
    const breakpoint = this.options.breakpoints!.find(bp => 
      width >= bp.minWidth && (bp.maxWidth === undefined || width <= bp.maxWidth)
    );
    
    return breakpoint || this.options.breakpoints![0];
  }

  /**
   * Check if current context is mobile
   */
  isMobile(): boolean {
    const context = this.getCurrentContext();
    return ['xs', 'sm'].includes(context.breakpoint);
  }

  /**
   * Check if current context is tablet
   */
  isTablet(): boolean {
    const context = this.getCurrentContext();
    return ['md', 'lg'].includes(context.breakpoint);
  }

  /**
   * Check if current context is desktop
   */
  isDesktop(): boolean {
    const context = this.getCurrentContext();
    return ['xl', '2xl', '3xl'].includes(context.breakpoint);
  }

  /**
   * Check if current context is touch device
   */
  isTouch(): boolean {
    return this.detectTouch();
  }

  /**
   * Get responsive CSS for template
   */
  generateResponsiveCSS(template: Template): string {
    const css: string[] = [];
    
    // Base styles
    css.push(`
      /* Base responsive styles */
      .responsive-container {
        width: 100%;
        max-width: 100%;
        margin: 0 auto;
        padding: 0 1rem;
      }
    `);

    // Breakpoint-specific styles
    this.options.breakpoints!.forEach(breakpoint => {
      if (breakpoint.minWidth > 0) {
        css.push(`
          @media (min-width: ${breakpoint.minWidth}px) {
            .responsive-container {
              max-width: ${this.getContainerMaxWidth(breakpoint.name)};
              padding: 0 ${this.getContainerPadding(breakpoint.name)};
            }
          }
        `);
      }
    });

    return css.join('\n');
  }

  /**
   * Create responsive variants for template
   */
  private async createResponsiveVariants(template: Template): Promise<Record<string, any>> {
    const variants: Record<string, any> = {};

    this.options.breakpoints!.forEach(breakpoint => {
      variants[breakpoint.name] = this.createVariantForBreakpoint(template, breakpoint);
    });

    return variants;
  }

  /**
   * Create variant for specific breakpoint
   */
  private createVariantForBreakpoint(template: Template, breakpoint: ResponsiveBreakpoint): any {
    return {
      ...template,
      content: this.adaptContentForBreakpoint(template.content, breakpoint),
      metadata: {
        ...template.metadata,
        breakpoint: breakpoint.name,
        adaptedAt: new Date()
      }
    };
  }

  /**
   * Adapt content for specific breakpoint
   */
  private adaptContentForBreakpoint(content: any, breakpoint: ResponsiveBreakpoint): any {
    const adapted = JSON.parse(JSON.stringify(content));

    // Mobile optimizations
    if (['xs', 'sm'].includes(breakpoint.name)) {
      this.optimizeForMobile(adapted);
    }

    // Tablet optimizations
    if (['md', 'lg'].includes(breakpoint.name)) {
      this.optimizeForTablet(adapted);
    }

    // Desktop optimizations
    if (['xl', '2xl', '3xl'].includes(breakpoint.name)) {
      this.optimizeForDesktop(adapted);
    }

    return adapted;
  }

  /**
   * Optimize content for mobile
   */
  private optimizeForMobile(content: any): void {
    // Reduce font sizes, spacing, etc.
    if (content.styles) {
      content.styles.fontSize = '14px';
      content.styles.padding = '1rem';
      content.styles.margin = '0.5rem';
    }
  }

  /**
   * Optimize content for tablet
   */
  private optimizeForTablet(content: any): void {
    // Medium font sizes, spacing
    if (content.styles) {
      content.styles.fontSize = '16px';
      content.styles.padding = '1.5rem';
      content.styles.margin = '1rem';
    }
  }

  /**
   * Optimize content for desktop
   */
  private optimizeForDesktop(content: any): void {
    // Larger font sizes, spacing
    if (content.styles) {
      content.styles.fontSize = '18px';
      content.styles.padding = '2rem';
      content.styles.margin = '1.5rem';
    }
  }

  /**
   * Get container max width for breakpoint
   */
  private getContainerMaxWidth(breakpointName: string): string {
    const maxWidths: Record<string, string> = {
      xs: '100%',
      sm: '100%',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px'
    };
    
    return maxWidths[breakpointName] || '100%';
  }

  /**
   * Get container padding for breakpoint
   */
  private getContainerPadding(breakpointName: string): string {
    const paddings: Record<string, string> = {
      xs: '1rem',
      sm: '1.5rem',
      md: '2rem',
      lg: '2.5rem',
      xl: '3rem',
      '2xl': '4rem',
      '3xl': '5rem'
    };
    
    return paddings[breakpointName] || '1rem';
  }

  /**
   * Detect touch capability
   */
  private detectTouch(): boolean {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Get device orientation
   */
  private getOrientation(): 'portrait' | 'landscape' {
    if (typeof window === 'undefined') return 'landscape';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  /**
   * Check if user prefers reduced motion
   */
  private prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Get default context for SSR
   */
  private getDefaultContext(): ResponsiveContext {
    return {
      breakpoint: this.options.breakpoints![2]?.name || 'md', // Default to 'md'
      device: 'desktop',
      orientation: 'landscape',
      width: 1024,
      height: 768
    };
  }

  /**
   * Add breakpoint change listener
   */
  addBreakpointListener(id: string, callback: (breakpoint: ResponsiveBreakpoint) => void): void {
    this.breakpointListeners.set(id, callback);
  }

  /**
   * Remove breakpoint change listener
   */
  removeBreakpointListener(id: string): void {
    this.breakpointListeners.delete(id);
  }

  /**
   * Notify breakpoint change
   */
  private notifyBreakpointChange(breakpoint: ResponsiveBreakpoint): void {
    this.breakpointListeners.forEach(callback => callback(breakpoint));
  }
}
