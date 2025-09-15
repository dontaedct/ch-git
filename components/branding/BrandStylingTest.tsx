/**
 * @fileoverview Brand-Aware Styling Test Component for HT-011.3.2
 * @module components/branding/BrandStylingTest
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.3.2: Implement Brand-Aware Styling System
 * 
 * This component provides a comprehensive test interface for verifying
 * brand-aware styling functionality across different components and states.
 * 
 * Features:
 * - Test brand color variations
 * - Test brand typography
 * - Test brand spacing and sizing
 * - Test brand component styling
 * - Interactive brand configuration testing
 */

'use client';

import React, { useState } from 'react';
import { 
  BrandStylingProvider, 
  BrandAwareWrapper, 
  BrandStylingDebug,
  useBrandStylingContext 
} from './BrandStylingProvider';
import { BrandStylingConfig, BrandColorConfig } from '@/lib/branding/styling-utils';

/**
 * Brand styling test component props
 */
interface BrandStylingTestProps {
  /** Whether to show debug information */
  showDebug?: boolean;
  /** Initial test configuration */
  initialConfig?: BrandStylingConfig;
}

/**
 * Internal test component that uses brand styling context
 */
function BrandStylingTestContent({ showDebug = false }: { showDebug?: boolean }) {
  const { 
    config, 
    updateConfig, 
    getBrandClasses, 
    getBrandColor, 
    isValid, 
    error 
  } = useBrandStylingContext();
  
  const [testConfig, setTestConfig] = useState<Partial<BrandStylingConfig>>({});
  
  const handleColorChange = (colorType: keyof BrandStylingConfig['colors'], value: string) => {
    const newConfig: Partial<BrandStylingConfig> = {
      ...testConfig,
      colors: {
        ...testConfig.colors,
        [colorType]: value,
      } as BrandColorConfig,
    };
    setTestConfig(newConfig);
    updateConfig(newConfig);
  };
  
  const resetToDefaults = () => {
    setTestConfig({});
    updateConfig({});
  };
  
  return (
    <div className="p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 brand-heading-primary">
          Brand-Aware Styling System Test
        </h1>
        
        {/* Status Section */}
        <div className="brand-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 brand-heading-secondary">System Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Valid Configuration:</span>
              <span className={isValid ? 'text-green-600' : 'text-red-600'}>
                {isValid ? '✅ Valid' : '❌ Invalid'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Error Status:</span>
              <span className={error ? 'text-red-600' : 'text-green-600'}>
                {error ? `❌ ${error}` : '✅ No Errors'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Color Configuration */}
        <div className="brand-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 brand-heading-secondary">Brand Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(config.colors).map(([colorType, colorValue]) => (
              <div key={colorType} className="space-y-2">
                <label className="block text-sm font-medium capitalize">
                  {colorType}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorValue || '#000000'}
                    onChange={(e) => handleColorChange(colorType as keyof BrandStylingConfig['colors'], e.target.value)}
                    className="w-8 h-8 rounded border"
                  />
                  <input
                    type="text"
                    value={colorValue || ''}
                    onChange={(e) => handleColorChange(colorType as keyof BrandStylingConfig['colors'], e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border rounded"
                    placeholder={`${colorType} color`}
                  />
                </div>
                <div 
                  className="w-full h-4 rounded"
                  style={{ backgroundColor: colorValue }}
                />
              </div>
            ))}
          </div>
          <button
            onClick={resetToDefaults}
            className="mt-4 px-4 py-2 brand-button-secondary"
          >
            Reset to Defaults
          </button>
        </div>
        
        {/* Brand Color Tests */}
        <div className="brand-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 brand-heading-secondary">Brand Color Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary Color Tests */}
            <div className="space-y-4">
              <h3 className="font-medium brand-text-primary">Primary Color</h3>
              <div className="space-y-2">
                <div className="brand-primary-bg text-white p-3 rounded brand-rounded">
                  Primary Background
                </div>
                <div className="brand-primary-border border-2 p-3 rounded brand-rounded">
                  Primary Border
                </div>
                <div className="brand-primary text-brand-primary p-3 rounded brand-rounded">
                  Primary Text
                </div>
                <button className="brand-button-primary w-full">
                  Primary Button
                </button>
              </div>
            </div>
            
            {/* Secondary Color Tests */}
            <div className="space-y-4">
              <h3 className="font-medium brand-text-secondary">Secondary Color</h3>
              <div className="space-y-2">
                <div className="brand-secondary-bg text-white p-3 rounded brand-rounded">
                  Secondary Background
                </div>
                <div className="brand-secondary-border border-2 p-3 rounded brand-rounded">
                  Secondary Border
                </div>
                <div className="brand-secondary text-brand-secondary p-3 rounded brand-rounded">
                  Secondary Text
                </div>
                <button className="brand-button-secondary w-full">
                  Secondary Button
                </button>
              </div>
            </div>
            
            {/* Accent Color Tests */}
            <div className="space-y-4">
              <h3 className="font-medium brand-text-accent">Accent Color</h3>
              <div className="space-y-2">
                <div className="brand-accent-bg text-white p-3 rounded brand-rounded">
                  Accent Background
                </div>
                <div className="brand-accent-border border-2 p-3 rounded brand-rounded">
                  Accent Border
                </div>
                <div className="brand-accent text-brand-accent p-3 rounded brand-rounded">
                  Accent Text
                </div>
                <button className="brand-button-outline w-full">
                  Accent Outline Button
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* State Color Tests */}
        <div className="brand-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 brand-heading-secondary">State Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="brand-alert-success">
              <div className="font-medium">Success</div>
              <div className="text-sm">Operation completed successfully</div>
            </div>
            <div className="brand-alert-warning">
              <div className="font-medium">Warning</div>
              <div className="text-sm">Please review your input</div>
            </div>
            <div className="brand-alert-error">
              <div className="font-medium">Error</div>
              <div className="text-sm">Something went wrong</div>
            </div>
            <div className="brand-alert-info">
              <div className="font-medium">Info</div>
              <div className="text-sm">Additional information</div>
            </div>
          </div>
        </div>
        
        {/* Typography Tests */}
        <div className="brand-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 brand-heading-secondary">Typography</h2>
          <div className="space-y-4">
            <div className="brand-heading-primary text-2xl">
              Brand Heading Primary
            </div>
            <div className="brand-heading-secondary text-xl">
              Brand Heading Secondary
            </div>
            <div className="brand-text">
              Brand text with default styling
            </div>
            <div className="brand-text-primary">
              Brand text with primary color
            </div>
            <div className="brand-text-secondary">
              Brand text with secondary color
            </div>
            <div className="brand-text-muted">
              Brand text with muted color
            </div>
            <div className="brand-link">
              Brand link with hover effects
            </div>
          </div>
        </div>
        
        {/* Component Tests */}
        <div className="brand-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 brand-heading-secondary">Component Tests</h2>
          <div className="space-y-6">
            {/* Button Tests */}
            <div>
              <h3 className="font-medium mb-3">Buttons</h3>
              <div className="flex flex-wrap gap-3">
                <button className="brand-button-primary">Primary</button>
                <button className="brand-button-secondary">Secondary</button>
                <button className="brand-button-outline">Outline</button>
                <button className="brand-button-ghost">Ghost</button>
              </div>
            </div>
            
            {/* Badge Tests */}
            <div>
              <h3 className="font-medium mb-3">Badges</h3>
              <div className="flex flex-wrap gap-3">
                <span className="brand-badge-primary">Primary</span>
                <span className="brand-badge-secondary">Secondary</span>
                <span className="brand-badge-success">Success</span>
                <span className="brand-badge-warning">Warning</span>
                <span className="brand-badge-error">Error</span>
                <span className="brand-badge-info">Info</span>
                <span className="brand-badge-outline">Outline</span>
              </div>
            </div>
            
            {/* Input Tests */}
            <div>
              <h3 className="font-medium mb-3">Inputs</h3>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Default input" 
                  className="brand-input w-full p-3"
                />
                <input 
                  type="text" 
                  placeholder="Error input" 
                  className="brand-input-error w-full p-3"
                />
                <input 
                  type="text" 
                  placeholder="Success input" 
                  className="brand-input-success w-full p-3"
                />
              </div>
            </div>
            
            {/* Card Tests */}
            <div>
              <h3 className="font-medium mb-3">Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="brand-card-primary p-4">
                  <h4 className="font-medium mb-2">Primary Card</h4>
                  <p className="text-sm">Card with primary border accent</p>
                </div>
                <div className="brand-card-secondary p-4">
                  <h4 className="font-medium mb-2">Secondary Card</h4>
                  <p className="text-sm">Card with secondary border accent</p>
                </div>
                <div className="brand-card-accent p-4">
                  <h4 className="font-medium mb-2">Accent Card</h4>
                  <p className="text-sm">Card with accent border accent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Brand-Aware Wrapper Tests */}
        <div className="brand-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 brand-heading-secondary">Brand-Aware Wrappers</h2>
          <div className="space-y-4">
            <BrandAwareWrapper colorType="primary" className="p-4 rounded">
              <h3 className="font-medium mb-2">Primary Wrapper</h3>
              <p className="text-sm">This content is wrapped with primary brand styling</p>
            </BrandAwareWrapper>
            
            <BrandAwareWrapper colorType="secondary" className="p-4 rounded">
              <h3 className="font-medium mb-2">Secondary Wrapper</h3>
              <p className="text-sm">This content is wrapped with secondary brand styling</p>
            </BrandAwareWrapper>
            
            <BrandAwareWrapper colorType="accent" className="p-4 rounded">
              <h3 className="font-medium mb-2">Accent Wrapper</h3>
              <p className="text-sm">This content is wrapped with accent brand styling</p>
            </BrandAwareWrapper>
          </div>
        </div>
        
        {/* Debug Information */}
        {showDebug && <BrandStylingDebug show={true} />}
      </div>
    </div>
  );
}

/**
 * Main brand styling test component
 */
export function BrandStylingTest({ showDebug = false, initialConfig }: BrandStylingTestProps) {
  return (
    <BrandStylingProvider initialConfig={initialConfig}>
      <BrandStylingTestContent showDebug={showDebug} />
    </BrandStylingProvider>
  );
}
