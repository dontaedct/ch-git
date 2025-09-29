/**
 * @fileoverview Unified Layout and Organization System - HT-032.1.4
 * @module lib/admin/layout-system
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Unified layout and organization system for modular admin components.
 * Provides consistent layout patterns, responsive design, and adaptive organization.
 */

import { z } from 'zod';
import { LucideIcon } from 'lucide-react';

// Layout Types
export enum LayoutType {
  GRID = 'grid',
  FORM = 'form',
  TABS = 'tabs',
  ACCORDION = 'accordion',
  SIDEBAR = 'sidebar',
  SPLIT = 'split',
  STACK = 'stack',
  MASONRY = 'masonry'
}

export enum ResponsiveBreakpoint {
  XS = 'xs',    // < 640px
  SM = 'sm',    // >= 640px
  MD = 'md',    // >= 768px
  LG = 'lg',    // >= 1024px
  XL = 'xl',    // >= 1280px
  XXL = '2xl'   // >= 1536px
}

// Layout Configuration
export interface LayoutConfig {
  type: LayoutType;
  columns?: number | Record<ResponsiveBreakpoint, number>;
  gap?: number | Record<ResponsiveBreakpoint, number>;
  padding?: number | Record<ResponsiveBreakpoint, number>;
  alignment?: 'start' | 'center' | 'end' | 'stretch';
  distribution?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  adaptive?: boolean;
  className?: string;
}

// Layout Section
export interface LayoutSection {
  id: string;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  order: number;
  span?: number | Record<ResponsiveBreakpoint, number>;
  offset?: number | Record<ResponsiveBreakpoint, number>;
  visible?: boolean | Record<ResponsiveBreakpoint, boolean>;
  className?: string;
  content?: React.ReactNode;
}

// Layout Template
export interface LayoutTemplate {
  id: string;
  name: string;
  description?: string;
  type: LayoutType;
  config: LayoutConfig;
  sections: LayoutSection[];
  metadata?: {
    category?: string;
    tags?: string[];
    author?: string;
    version?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
}

// Layout Context
export interface LayoutContext {
  viewport: {
    width: number;
    height: number;
    breakpoint: ResponsiveBreakpoint;
  };
  theme: 'light' | 'dark';
  density: 'compact' | 'normal' | 'comfortable';
  direction: 'ltr' | 'rtl';
  preferences: {
    animations: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
  };
}

// Layout Manager Configuration
export interface LayoutManagerConfig {
  defaultTemplate: string;
  adaptiveLayouts: boolean;
  persistPreferences: boolean;
  animationDuration: number;
  breakpoints: Record<ResponsiveBreakpoint, number>;
  maxSections: number;
}

/**
 * Layout Manager Class
 * Manages layout templates, responsive behavior, and adaptive organization
 */
export class LayoutManager {
  private templates: Map<string, LayoutTemplate> = new Map();
  private config: LayoutManagerConfig;
  private context: LayoutContext;
  private observers: Array<(context: LayoutContext) => void> = [];

  constructor(config: Partial<LayoutManagerConfig> = {}) {
    this.config = {
      defaultTemplate: 'form',
      adaptiveLayouts: true,
      persistPreferences: true,
      animationDuration: 300,
      breakpoints: {
        [ResponsiveBreakpoint.XS]: 0,
        [ResponsiveBreakpoint.SM]: 640,
        [ResponsiveBreakpoint.MD]: 768,
        [ResponsiveBreakpoint.LG]: 1024,
        [ResponsiveBreakpoint.XL]: 1280,
        [ResponsiveBreakpoint.XXL]: 1536
      },
      maxSections: 50,
      ...config
    };

    this.context = this.initializeContext();
    this.initializeDefaultTemplates();
    this.setupViewportObserver();
  }

  /**
   * Initialize layout context
   */
  private initializeContext(): LayoutContext {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const height = typeof window !== 'undefined' ? window.innerHeight : 768;

    return {
      viewport: {
        width,
        height,
        breakpoint: this.getBreakpoint(width)
      },
      theme: 'light',
      density: 'normal',
      direction: 'ltr',
      preferences: {
        animations: true,
        reducedMotion: false,
        highContrast: false
      }
    };
  }

  /**
   * Register a layout template
   */
  registerTemplate(template: LayoutTemplate): void {
    // Validate template
    if (template.sections.length > this.config.maxSections) {
      throw new Error(`Template cannot have more than ${this.config.maxSections} sections`);
    }

    this.templates.set(template.id, template);
    console.log(`Registered layout template: ${template.id}`);
  }

  /**
   * Get a layout template
   */
  getTemplate(templateId: string): LayoutTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get all registered templates
   */
  getAllTemplates(): LayoutTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by type
   */
  getTemplatesByType(type: LayoutType): LayoutTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => template.type === type);
  }

  /**
   * Create layout from template
   */
  createLayout(templateId: string, sections: LayoutSection[]): LayoutTemplate {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return {
      ...template,
      sections: this.organizeSections(sections, template.config)
    };
  }

  /**
   * Organize sections according to layout configuration
   */
  private organizeSections(sections: LayoutSection[], config: LayoutConfig): LayoutSection[] {
    // Sort sections by order
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);

    // Apply adaptive organization if enabled
    if (this.config.adaptiveLayouts) {
      return this.applyAdaptiveOrganization(sortedSections, config);
    }

    return sortedSections;
  }

  /**
   * Apply adaptive organization based on context
   */
  private applyAdaptiveOrganization(
    sections: LayoutSection[], 
    config: LayoutConfig
  ): LayoutSection[] {
    const { breakpoint } = this.context.viewport;
    
    // Filter visible sections for current breakpoint
    const visibleSections = sections.filter(section => {
      if (typeof section.visible === 'boolean') {
        return section.visible;
      }
      if (typeof section.visible === 'object') {
        return section.visible[breakpoint] ?? true;
      }
      return true;
    });

    // Adjust spans for current breakpoint
    return visibleSections.map(section => ({
      ...section,
      span: this.getResponsiveValue(section.span, breakpoint),
      offset: this.getResponsiveValue(section.offset, breakpoint)
    }));
  }

  /**
   * Get responsive value for current breakpoint
   */
  private getResponsiveValue<T>(
    value: T | Record<ResponsiveBreakpoint, T> | undefined,
    breakpoint: ResponsiveBreakpoint
  ): T | undefined {
    if (value === undefined) return undefined;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const responsiveValue = value as Record<ResponsiveBreakpoint, T>;
      return responsiveValue[breakpoint] ?? responsiveValue[ResponsiveBreakpoint.MD];
    }
    
    return value as T;
  }

  /**
   * Generate CSS classes for layout
   */
  generateLayoutClasses(config: LayoutConfig, context?: LayoutContext): string {
    const ctx = context || this.context;
    const { breakpoint } = ctx.viewport;
    const classes: string[] = [];

    // Base layout type classes
    switch (config.type) {
      case LayoutType.GRID:
        classes.push('grid');
        break;
      case LayoutType.FORM:
        classes.push('space-y-6');
        break;
      case LayoutType.TABS:
        classes.push('tabs-container');
        break;
      case LayoutType.ACCORDION:
        classes.push('accordion-container');
        break;
      case LayoutType.SIDEBAR:
        classes.push('flex');
        break;
      case LayoutType.SPLIT:
        classes.push('grid grid-cols-2');
        break;
      case LayoutType.STACK:
        classes.push('flex flex-col');
        break;
      case LayoutType.MASONRY:
        classes.push('masonry-container');
        break;
    }

    // Grid-specific classes
    if (config.type === LayoutType.GRID) {
      const columns = this.getResponsiveValue(config.columns, breakpoint) || 1;
      classes.push(`grid-cols-${Math.min(columns, 12)}`);
    }

    // Gap classes
    const gap = this.getResponsiveValue(config.gap, breakpoint);
    if (gap !== undefined) {
      classes.push(`gap-${gap}`);
    }

    // Padding classes
    const padding = this.getResponsiveValue(config.padding, breakpoint);
    if (padding !== undefined) {
      classes.push(`p-${padding}`);
    }

    // Alignment classes
    if (config.alignment) {
      switch (config.alignment) {
        case 'start':
          classes.push('items-start');
          break;
        case 'center':
          classes.push('items-center');
          break;
        case 'end':
          classes.push('items-end');
          break;
        case 'stretch':
          classes.push('items-stretch');
          break;
      }
    }

    // Distribution classes
    if (config.distribution) {
      switch (config.distribution) {
        case 'start':
          classes.push('justify-start');
          break;
        case 'center':
          classes.push('justify-center');
          break;
        case 'end':
          classes.push('justify-end');
          break;
        case 'between':
          classes.push('justify-between');
          break;
        case 'around':
          classes.push('justify-around');
          break;
        case 'evenly':
          classes.push('justify-evenly');
          break;
      }
    }

    // Wrap classes
    if (config.wrap) {
      classes.push('flex-wrap');
    }

    // Custom classes
    if (config.className) {
      classes.push(config.className);
    }

    return classes.join(' ');
  }

  /**
   * Generate CSS classes for section
   */
  generateSectionClasses(section: LayoutSection, context?: LayoutContext): string {
    const ctx = context || this.context;
    const { breakpoint } = ctx.viewport;
    const classes: string[] = [];

    // Span classes
    const span = this.getResponsiveValue(section.span, breakpoint);
    if (span !== undefined) {
      classes.push(`col-span-${Math.min(span, 12)}`);
    }

    // Offset classes
    const offset = this.getResponsiveValue(section.offset, breakpoint);
    if (offset !== undefined) {
      classes.push(`col-start-${offset + 1}`);
    }

    // Custom classes
    if (section.className) {
      classes.push(section.className);
    }

    return classes.join(' ');
  }

  /**
   * Get current breakpoint
   */
  private getBreakpoint(width: number): ResponsiveBreakpoint {
    const breakpoints = this.config.breakpoints;
    
    if (width >= breakpoints[ResponsiveBreakpoint.XXL]) return ResponsiveBreakpoint.XXL;
    if (width >= breakpoints[ResponsiveBreakpoint.XL]) return ResponsiveBreakpoint.XL;
    if (width >= breakpoints[ResponsiveBreakpoint.LG]) return ResponsiveBreakpoint.LG;
    if (width >= breakpoints[ResponsiveBreakpoint.MD]) return ResponsiveBreakpoint.MD;
    if (width >= breakpoints[ResponsiveBreakpoint.SM]) return ResponsiveBreakpoint.SM;
    
    return ResponsiveBreakpoint.XS;
  }

  /**
   * Update layout context
   */
  updateContext(updates: Partial<LayoutContext>): void {
    this.context = { ...this.context, ...updates };
    this.notifyObservers();
  }

  /**
   * Subscribe to context changes
   */
  subscribe(observer: (context: LayoutContext) => void): () => void {
    this.observers.push(observer);
    
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  /**
   * Get current context
   */
  getContext(): LayoutContext {
    return { ...this.context };
  }

  /**
   * Setup viewport observer
   */
  private setupViewportObserver(): void {
    if (typeof window === 'undefined') return;

    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const breakpoint = this.getBreakpoint(width);

      this.updateContext({
        viewport: { width, height, breakpoint }
      });
    };

    window.addEventListener('resize', updateViewport);
    
    // Initial update
    updateViewport();
  }

  /**
   * Notify context observers
   */
  private notifyObservers(): void {
    this.observers.forEach(observer => {
      try {
        observer(this.context);
      } catch (error) {
        console.error('Error in layout context observer:', error);
      }
    });
  }

  /**
   * Initialize default layout templates
   */
  private initializeDefaultTemplates(): void {
    // Form Layout Template
    this.registerTemplate({
      id: 'form',
      name: 'Form Layout',
      description: 'Vertical form layout with consistent spacing',
      type: LayoutType.FORM,
      config: {
        type: LayoutType.FORM,
        gap: 6,
        padding: 0,
        alignment: 'stretch'
      },
      sections: [],
      metadata: {
        category: 'basic',
        tags: ['form', 'vertical'],
        version: '1.0.0'
      }
    });

    // Grid Layout Template
    this.registerTemplate({
      id: 'grid-2col',
      name: '2-Column Grid',
      description: 'Responsive 2-column grid layout',
      type: LayoutType.GRID,
      config: {
        type: LayoutType.GRID,
        columns: {
          [ResponsiveBreakpoint.XS]: 1,
          [ResponsiveBreakpoint.SM]: 1,
          [ResponsiveBreakpoint.MD]: 2,
          [ResponsiveBreakpoint.LG]: 2,
          [ResponsiveBreakpoint.XL]: 2,
          [ResponsiveBreakpoint.XXL]: 2
        },
        gap: 6,
        alignment: 'start'
      },
      sections: [],
      metadata: {
        category: 'grid',
        tags: ['grid', '2-column', 'responsive'],
        version: '1.0.0'
      }
    });

    // Sidebar Layout Template
    this.registerTemplate({
      id: 'sidebar',
      name: 'Sidebar Layout',
      description: 'Layout with sidebar navigation',
      type: LayoutType.SIDEBAR,
      config: {
        type: LayoutType.SIDEBAR,
        gap: 0,
        alignment: 'stretch'
      },
      sections: [],
      metadata: {
        category: 'navigation',
        tags: ['sidebar', 'navigation'],
        version: '1.0.0'
      }
    });

    // Tabs Layout Template
    this.registerTemplate({
      id: 'tabs',
      name: 'Tabbed Layout',
      description: 'Tabbed interface for organizing content',
      type: LayoutType.TABS,
      config: {
        type: LayoutType.TABS,
        gap: 0,
        alignment: 'stretch'
      },
      sections: [],
      metadata: {
        category: 'navigation',
        tags: ['tabs', 'navigation'],
        version: '1.0.0'
      }
    });
  }
}

// Global layout manager instance
let globalLayoutManager: LayoutManager | null = null;

/**
 * Get the global layout manager instance
 */
export function getLayoutManager(config?: Partial<LayoutManagerConfig>): LayoutManager {
  if (!globalLayoutManager) {
    globalLayoutManager = new LayoutManager(config);
  }
  return globalLayoutManager;
}

/**
 * Initialize layout manager with custom configuration
 */
export function initializeLayoutManager(config?: Partial<LayoutManagerConfig>): LayoutManager {
  globalLayoutManager = new LayoutManager(config);
  return globalLayoutManager;
}

// Utility functions
export function createLayoutTemplate(
  id: string,
  name: string,
  type: LayoutType,
  config: LayoutConfig,
  options: Partial<LayoutTemplate> = {}
): LayoutTemplate {
  return {
    id,
    name,
    type,
    config,
    sections: [],
    metadata: {
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    ...options
  };
}

export function createLayoutSection(
  id: string,
  order: number,
  options: Partial<LayoutSection> = {}
): LayoutSection {
  return {
    id,
    order,
    visible: true,
    ...options
  };
}

export function createResponsiveConfig<T>(
  mobile: T,
  tablet?: T,
  desktop?: T
): Record<ResponsiveBreakpoint, T> {
  return {
    [ResponsiveBreakpoint.XS]: mobile,
    [ResponsiveBreakpoint.SM]: mobile,
    [ResponsiveBreakpoint.MD]: tablet ?? mobile,
    [ResponsiveBreakpoint.LG]: desktop ?? tablet ?? mobile,
    [ResponsiveBreakpoint.XL]: desktop ?? tablet ?? mobile,
    [ResponsiveBreakpoint.XXL]: desktop ?? tablet ?? mobile
  };
}
