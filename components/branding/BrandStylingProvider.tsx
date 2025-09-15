/**
 * @fileoverview Brand-Aware Styling Provider for HT-011.3.2
 * @module components/branding/BrandStylingProvider
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.3.2: Implement Brand-Aware Styling System
 * 
 * This provider component manages brand-aware styling throughout the application
 * and automatically applies brand colors, fonts, and styling based on configuration.
 * 
 * Features:
 * - Automatic brand styling application
 * - Dynamic CSS custom property injection
 * - Integration with existing branding system
 * - Support for custom brand overrides
 * - Dark/light mode brand variations
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  BrandStylingConfig, 
  BrandCSSProperties, 
  BrandStylingUtils, 
  brandStylingManager,
  DEFAULT_BRAND_STYLING_CONFIG 
} from '@/lib/branding/styling-utils';
import { useDynamicBrand } from '@/lib/branding/hooks';

/**
 * Brand styling context type
 */
interface BrandStylingContextType {
  /** Current brand styling configuration */
  config: BrandStylingConfig;
  /** CSS custom properties for brand styling */
  cssProperties: BrandCSSProperties;
  /** Whether styling is being applied */
  isLoading: boolean;
  /** Any error that occurred */
  error: string | null;
  /** Update brand styling configuration */
  updateConfig: (newConfig: Partial<BrandStylingConfig>) => void;
  /** Apply brand styling to an element */
  applyBrandStyling: (element: HTMLElement) => void;
  /** Remove brand styling from an element */
  removeBrandStyling: (element: HTMLElement) => void;
  /** Generate brand-aware CSS classes */
  getBrandClasses: (baseClasses?: string) => string;
  /** Get brand color value */
  getBrandColor: (colorType: keyof BrandStylingConfig['colors']) => string;
  /** Check if brand styling is valid */
  isValid: boolean;
}

/**
 * Brand styling context
 */
const BrandStylingContext = createContext<BrandStylingContextType | null>(null);

/**
 * Brand styling provider props
 */
interface BrandStylingProviderProps {
  /** Initial brand styling configuration */
  initialConfig?: BrandStylingConfig;
  /** Whether to automatically sync with dynamic brand configuration */
  syncWithBrand?: boolean;
  /** Children components */
  children: React.ReactNode;
}

/**
 * Brand styling provider component
 */
export function BrandStylingProvider({ 
  initialConfig, 
  syncWithBrand = true, 
  children 
}: BrandStylingProviderProps) {
  const [config, setConfig] = useState<BrandStylingConfig>(
    initialConfig || brandStylingManager.getCurrentConfig()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { config: brandConfig } = useDynamicBrand();

  // Generate CSS properties from current config
  const cssProperties = BrandStylingUtils.generateBrandCSSProperties(config);

  // Validate configuration
  const validation = BrandStylingUtils.validateBrandStylingConfig(config);
  const isValid = validation.isValid;

  // Subscribe to brand styling manager changes
  useEffect(() => {
    const unsubscribe = brandStylingManager.subscribe((newConfig) => {
      setConfig(newConfig);
    });

    return unsubscribe;
  }, []);

  // Sync with dynamic brand configuration
  useEffect(() => {
    if (syncWithBrand && brandConfig.theme?.colors) {
      const brandColors = {
        primary: brandConfig.theme.colors.primary || config.colors.primary,
        secondary: brandConfig.theme.colors.secondary || config.colors.secondary,
        accent: brandConfig.theme.colors.accent || config.colors.accent,
        success: brandConfig.theme.colors.success || config.colors.success,
        warning: brandConfig.theme.colors.warning || config.colors.warning,
        error: brandConfig.theme.colors.error || config.colors.error,
        info: brandConfig.theme.colors.info || config.colors.info,
        destructive: brandConfig.theme.colors.destructive || config.colors.destructive,
      };

      updateConfig({ colors: brandColors });
    }
  }, [syncWithBrand, brandConfig.theme?.colors, config.colors]);

  // Apply brand styling to document root
  useEffect(() => {
    try {
      BrandStylingUtils.applyBrandCSSProperties(cssProperties);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply brand styling');
    }
  }, [cssProperties]);

  const updateConfig = (newConfig: Partial<BrandStylingConfig>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      brandStylingManager.updateConfig(newConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update brand styling');
    } finally {
      setIsLoading(false);
    }
  };

  const applyBrandStyling = (element: HTMLElement) => {
    Object.entries(cssProperties).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  };

  const removeBrandStyling = (element: HTMLElement) => {
    Object.keys(cssProperties).forEach((property) => {
      element.style.removeProperty(property);
    });
  };

  const getBrandClasses = (baseClasses?: string) => {
    const brandClasses = BrandStylingUtils.generateBrandCSSClasses(config);
    return baseClasses ? `${baseClasses} ${brandClasses.join(' ')}` : brandClasses.join(' ');
  };

  const getBrandColor = (colorType: keyof BrandStylingConfig['colors']) => {
    return config.colors[colorType] || '';
  };

  const contextValue: BrandStylingContextType = {
    config,
    cssProperties,
    isLoading,
    error,
    updateConfig,
    applyBrandStyling,
    removeBrandStyling,
    getBrandClasses,
    getBrandColor,
    isValid,
  };

  return (
    <BrandStylingContext.Provider value={contextValue}>
      {children}
    </BrandStylingContext.Provider>
  );
}

/**
 * Hook to use brand styling context
 */
export function useBrandStylingContext(): BrandStylingContextType {
  const context = useContext(BrandStylingContext);
  
  if (!context) {
    throw new Error('useBrandStylingContext must be used within a BrandStylingProvider');
  }
  
  return context;
}

/**
 * Brand styling wrapper component for automatic styling application
 */
interface BrandStylingWrapperProps {
  /** Element to wrap */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether to apply brand styling automatically */
  applyStyling?: boolean;
}

export function BrandStylingWrapper({ 
  children, 
  className, 
  applyStyling = true 
}: BrandStylingWrapperProps) {
  const { getBrandClasses, cssProperties } = useBrandStylingContext();
  
  const combinedClassName = applyStyling 
    ? getBrandClasses(className)
    : className;
  
  const style = applyStyling ? cssProperties : undefined;
  
  return (
    <div className={combinedClassName} style={style}>
      {children}
    </div>
  );
}

/**
 * Brand-aware component wrapper that automatically applies brand styling
 */
interface BrandAwareWrapperProps {
  /** Element to wrap */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Brand color type to apply */
  colorType?: keyof BrandStylingConfig['colors'];
  /** Whether to apply hover effects */
  applyHover?: boolean;
  /** Whether to apply focus effects */
  applyFocus?: boolean;
}

export function BrandAwareWrapper({ 
  children, 
  className, 
  colorType = 'primary',
  applyHover = true,
  applyFocus = true
}: BrandAwareWrapperProps) {
  const { getBrandClasses, getBrandColor } = useBrandStylingContext();
  
  const baseClasses = [
    className,
    `brand-${colorType}`,
    applyHover && `brand-${colorType}-hover`,
    applyFocus && `brand-focus-${colorType}`,
  ].filter(Boolean).join(' ');
  
  const brandClasses = getBrandClasses(baseClasses);
  const brandColor = getBrandColor(colorType);
  
  return (
    <div 
      className={brandClasses}
      style={{ '--brand-color': brandColor } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * Brand styling debug component for development
 */
interface BrandStylingDebugProps {
  /** Whether to show debug information */
  show?: boolean;
}

export function BrandStylingDebug({ show = false }: BrandStylingDebugProps) {
  const { config, cssProperties, isValid, error } = useBrandStylingContext();
  
  if (!show) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Brand Styling Debug</h3>
      
      <div className="space-y-2">
        <div>
          <strong>Valid:</strong> {isValid ? '✅' : '❌'}
        </div>
        
        {error && (
          <div>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div>
          <strong>Primary Color:</strong> {config.colors.primary}
        </div>
        
        <div>
          <strong>Secondary Color:</strong> {config.colors.secondary}
        </div>
        
        <div>
          <strong>CSS Properties:</strong> {Object.keys(cssProperties).length}
        </div>
        
        <details className="mt-2">
          <summary className="cursor-pointer">CSS Properties</summary>
          <pre className="mt-2 text-xs overflow-auto max-h-32">
            {JSON.stringify(cssProperties, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
