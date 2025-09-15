/**
 * Base Component Foundation
 * HT-021.3.2 - Core Component Infrastructure Setup
 * 
 * Foundational component class and utilities for atomic design system
 */

import React, { forwardRef, useEffect, useRef, ElementType } from 'react';
import { cn } from '@/lib/utils';
import { usePerformanceMonitorHook } from '@/lib/hooks/use-performance-monitor';
import { useTheme } from '@/lib/hooks/use-theme';
import { 
  BaseComponentProps, 
  PolymorphicComponentPropsWithRef
} from '@/lib/types/component-system';

// ============================================================================
// BASE COMPONENT UTILITIES
// ============================================================================

/**
 * Generate component classes with design tokens
 */
export function createComponentClasses({
  base,
  variants = {},
  defaultVariants = {},
  compoundVariants = []
}: {
  base?: string | string[];
  variants?: Record<string, Record<string, string | string[]>>;
  defaultVariants?: Record<string, string>;
  compoundVariants?: Array<{
    condition: Record<string, string>;
    class: string | string[];
  }>;
}) {
  return function getClasses(props: Record<string, any> = {}) {
    // Base classes
    let classes = Array.isArray(base) ? base : [base || ''].filter(Boolean);
    
    // Apply variant classes
    Object.entries(variants).forEach(([variantKey, variantValues]) => {
      const value = props[variantKey] || defaultVariants[variantKey];
      if (value && variantValues[value]) {
        const variantClass = variantValues[value];
        classes.push(...(Array.isArray(variantClass) ? variantClass : [variantClass]));
      }
    });
    
    // Apply compound variant classes
    compoundVariants.forEach(({ condition, class: compoundClass }) => {
      const matches = Object.entries(condition).every(([key, value]) => props[key] === value);
      if (matches) {
        classes.push(...(Array.isArray(compoundClass) ? compoundClass : [compoundClass]));
      }
    });
    
    return cn(...classes, props.className);
  };
}

// ============================================================================
// BASE COMPONENT HOOK
// ============================================================================

/**
 * Base hook that provides common component functionality
 */
export function useBaseComponent<T extends BaseComponentProps>(props: T) {
  const {
    id,
    className,
    style,
    performance,
    theme,
    brand,
    customTokens,
    'data-testid': testId,
    ...rest
  } = props;
  
  const elementRef = useRef<HTMLElement>(null);
  
  // Performance monitoring
  const performanceData = usePerformanceMonitorHook({
    enabled: performance?.monitor || false,
    componentName: 'BaseComponent',
    budget: performance?.budget,
    ref: elementRef
  });
  
  // Accessibility enhancements
  const a11yProps = {};
  
  // Theme integration
  const { resolvedTheme, themeClasses } = useTheme({
    theme,
    brand,
    customTokens
  });
  
  // Combine all computed props
  const computedProps = {
    ref: elementRef,
    id: id || `component-${Math.random().toString(36).substr(2, 9)}`,
    className: cn(themeClasses, className),
    style: {
      ...style,
      ...(customTokens && Object.fromEntries(
        Object.entries(customTokens).map(([key, value]) => [`--${key}`, value])
      ))
    },
    'data-testid': testId,
    'data-theme': resolvedTheme,
    'data-brand': brand,
    ...a11yProps,
    ...rest
  };
  
  return {
    props: computedProps,
    ref: elementRef,
    theme: resolvedTheme,
    performance: performanceData,
    a11y: a11yProps
  };
}

// ============================================================================
// BASE COMPONENT FACTORY
// ============================================================================

/**
 * Factory for creating consistent base components
 */
export function createBaseComponent<T extends BaseComponentProps>(
  displayName: string,
  render: (props: T, ref: React.Ref<any>) => React.ReactElement | null
) {
  const Component = forwardRef<any, T>((props, ref) => {
    const { props: baseProps } = useBaseComponent(props);
    return render({ ...baseProps, ...props } as T, ref);
  });
  
  Component.displayName = displayName;
  return Component;
}

// ============================================================================
// POLYMORPHIC COMPONENT FACTORY
// ============================================================================

/**
 * Factory for creating polymorphic components
 */
export function createPolymorphicComponent<
  DefaultElement extends ElementType,
  Props extends Record<string, any> = {}
>(
  displayName: string,
  defaultElement: DefaultElement,
  render: (
    props: PolymorphicComponentPropsWithRef<DefaultElement, Props>,
    ref: React.Ref<any>
  ) => React.ReactElement | null
) {
  const Component = forwardRef<any, PolymorphicComponentPropsWithRef<DefaultElement, Props>>(
    ({ as: Element = defaultElement, ...props }, ref) => {
      const { props: baseProps } = useBaseComponent(props);
      return render({ 
        as: Element, 
        ...baseProps, 
        ...props 
      } as PolymorphicComponentPropsWithRef<DefaultElement, Props>, ref);
    }
  );
  
  Component.displayName = displayName;
  return Component;
}

// ============================================================================
// COMPONENT COMPOSITION UTILITIES
// ============================================================================

/**
 * Higher-order component for adding base functionality
 */
export function withBaseComponent<T extends BaseComponentProps>(
  WrappedComponent: React.ComponentType<T>,
  options: {
    displayName?: string;
    forwardRef?: boolean;
  } = {}
) {
  const { displayName, forwardRef: enableForwardRef = true } = options;
  
  const EnhancedComponent = enableForwardRef
    ? forwardRef<any, T>((props, ref) => {
        const { props: baseProps } = useBaseComponent(props);
        return <WrappedComponent {...(baseProps as any)} ref={ref} />;
      })
    : (props: T) => {
        const { props: baseProps } = useBaseComponent(props);
        return <WrappedComponent {...(baseProps as any)} />;
      };
  
  (EnhancedComponent as any).displayName = displayName || `withBaseComponent(${(WrappedComponent as any).displayName || WrappedComponent.name || 'Component'})`;
  
  return EnhancedComponent;
}

/**
 * Compose multiple higher-order components
 */
export function compose<T>(...hocs: Array<(component: React.ComponentType<T>) => React.ComponentType<T>>) {
  return (Component: React.ComponentType<T>) => 
    hocs.reduceRight((acc, hoc) => hoc(acc), Component);
}

// ============================================================================
// COMPONENT REGISTRY
// ============================================================================

/**
 * Registry for tracking design system components
 */
class ComponentRegistry {
  private components = new Map<string, React.ComponentType<any>>();
  private metadata = new Map<string, {
    category: 'atom' | 'molecule' | 'organism';
    version: string;
    dependencies: string[];
  }>();
  
  register<T>(
    name: string,
    component: React.ComponentType<T>,
    meta: {
      category: 'atom' | 'molecule' | 'organism';
      version: string;
      dependencies?: string[];
    }
  ) {
    this.components.set(name, component);
    this.metadata.set(name, {
      category: meta.category,
      version: meta.version,
      dependencies: meta.dependencies || []
    });
  }
  
  get<T = any>(name: string): React.ComponentType<T> | undefined {
    return this.components.get(name);
  }
  
  getMetadata(name: string) {
    return this.metadata.get(name);
  }
  
  list() {
    return Array.from(this.components.keys());
  }
  
  getByCategory(category: 'atom' | 'molecule' | 'organism') {
    return this.list().filter(name => this.metadata.get(name)?.category === category);
  }
}

export const componentRegistry = new ComponentRegistry();

// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

/**
 * Development mode component inspector
 */
export function ComponentInspector({ children, name }: { 
  children: React.ReactNode; 
  name: string; 
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const element = ref.current;
      if (element) {
        element.dataset.componentName = name;
        element.dataset.componentInspector = 'true';
      }
    }
  }, [name]);
  
  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }
  
  return (
    <div ref={ref} style={{ display: 'contents' }}>
      {children}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

// All exports are already declared above individually

export type {
  BaseComponentProps
};