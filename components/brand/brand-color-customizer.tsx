/**
 * @fileoverview Brand Color Customizer Component
 * @module components/brand/brand-color-customizer
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.4: Brand Configuration User Interface
 * Component for customizing brand colors with real-time preview.
 */

'use client';

import { useState, useEffect } from 'react';
import { BrandConfig } from '@/types/brand-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Palette, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface BrandColorCustomizerProps {
  brand: BrandConfig;
  onBrandChange: (brand: BrandConfig) => void;
}

export function BrandColorCustomizer({ brand, onBrandChange }: BrandColorCustomizerProps) {
  const [colors, setColors] = useState(brand.overrides.colors || {});
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setColors(brand.overrides.colors || {});
  }, [brand.overrides.colors]);

  const handleColorChange = (colorType: string, value: string) => {
    const newColors = {
      ...colors,
      [colorType]: value
    };
    setColors(newColors);
    
    onBrandChange({
      ...brand,
      overrides: {
        ...brand.overrides,
        colors: newColors
      }
    });
  };

  const handleNeutralColorChange = (shade: string, value: string) => {
    const newColors = {
      ...colors,
      neutral: {
        ...colors.neutral,
        [shade]: value
      }
    };
    setColors(newColors);
    
    onBrandChange({
      ...brand,
      overrides: {
        ...brand.overrides,
        colors: newColors
      }
    });
  };

  const generateColorPalette = async () => {
    setIsGenerating(true);
    
    // Simulate color palette generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const generatedColors = {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#F59E0B',
      neutral: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A'
      }
    };
    
    setColors(generatedColors);
    onBrandChange({
      ...brand,
      overrides: {
        ...brand.overrides,
        colors: generatedColors
      }
    });
    
    setIsGenerating(false);
  };

  const resetToPreset = () => {
    if (brand.basePreset) {
      // Reset to preset colors
      setColors({});
      onBrandChange({
        ...brand,
        overrides: {
          ...brand.overrides,
          colors: {}
        }
      });
    }
  };

  const isValidColor = (color: string) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) ||
           /^rgb\(|^rgba\(/.test(color) ||
           /^hsl\(|^hsla\(/.test(color);
  };

  const ColorInput = ({ 
    label, 
    value, 
    onChange, 
    placeholder = '#000000' 
  }: {
    label: string;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }) => {
    const [isValid, setIsValid] = useState(true);
    
    const handleChange = (newValue: string) => {
      const valid = isValidColor(newValue) || newValue === '';
      setIsValid(valid);
      onChange(newValue);
    };

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
            style={{ backgroundColor: value || '#f3f4f6' }}
          />
          <Input
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className={!isValid ? 'border-red-500' : ''}
          />
          {!isValid && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Primary Colors */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Primary Colors</CardTitle>
              <CardDescription>
                Main brand colors for buttons, links, and highlights
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateColorPalette}
                disabled={isGenerating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                Generate Palette
              </Button>
              {brand.basePreset && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToPreset}
                >
                  Reset to Preset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ColorInput
              label="Primary Color"
              value={colors.primary}
              onChange={(value) => handleColorChange('primary', value)}
              placeholder="#3B82F6"
            />
            <ColorInput
              label="Secondary Color"
              value={colors.secondary}
              onChange={(value) => handleColorChange('secondary', value)}
              placeholder="#8B5CF6"
            />
            <ColorInput
              label="Accent Color"
              value={colors.accent}
              onChange={(value) => handleColorChange('accent', value)}
              placeholder="#F59E0B"
            />
          </div>
        </CardContent>
      </Card>

      {/* Neutral Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Neutral Colors</CardTitle>
          <CardDescription>
            Grayscale colors for text, backgrounds, and borders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <ColorInput
                key={shade}
                label={`Gray ${shade}`}
                value={colors.neutral?.[shade as keyof typeof colors.neutral]}
                onChange={(value) => handleNeutralColorChange(shade.toString(), value)}
                placeholder={`#${shade === 50 ? 'F8FAFC' : shade === 100 ? 'F1F5F9' : shade === 200 ? 'E2E8F0' : shade === 300 ? 'CBD5E1' : shade === 400 ? '94A3B8' : shade === 500 ? '64748B' : shade === 600 ? '475569' : shade === 700 ? '334155' : shade === 800 ? '1E293B' : '0F172A'}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Colors</CardTitle>
          <CardDescription>
            Additional brand-specific colors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add custom color variables for your brand
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newColors = {
                    ...colors,
                    custom: {
                      ...colors.custom,
                      [`custom-${Object.keys(colors.custom || {}).length + 1}`]: '#000000'
                    }
                  };
                  setColors(newColors);
                  onBrandChange({
                    ...brand,
                    overrides: {
                      ...brand.overrides,
                      colors: newColors
                    }
                  });
                }}
              >
                Add Custom Color
              </Button>
            </div>
            
            {colors.custom && Object.entries(colors.custom).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <ColorInput
                  label={key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  value={value}
                  onChange={(newValue) => {
                    const newColors = {
                      ...colors,
                      custom: {
                        ...colors.custom,
                        [key]: newValue
                      }
                    };
                    setColors(newColors);
                    onBrandChange({
                      ...brand,
                      overrides: {
                        ...brand.overrides,
                        colors: newColors
                      }
                    });
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newCustom = { ...colors.custom };
                    delete newCustom[key];
                    const newColors = {
                      ...colors,
                      custom: newCustom
                    };
                    setColors(newColors);
                    onBrandChange({
                      ...brand,
                      overrides: {
                        ...brand.overrides,
                        colors: newColors
                      }
                    });
                  }}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Color Preview</CardTitle>
          <CardDescription>
            See how your colors look together
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {colors.primary && (
              <div className="text-center">
                <div 
                  className="w-full h-20 rounded-lg mb-2 flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: colors.primary }}
                >
                  Primary
                </div>
                <p className="text-xs font-medium">Primary</p>
                <p className="text-xs text-gray-500">{colors.primary}</p>
              </div>
            )}
            {colors.secondary && (
              <div className="text-center">
                <div 
                  className="w-full h-20 rounded-lg mb-2 flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: colors.secondary }}
                >
                  Secondary
                </div>
                <p className="text-xs font-medium">Secondary</p>
                <p className="text-xs text-gray-500">{colors.secondary}</p>
              </div>
            )}
            {colors.accent && (
              <div className="text-center">
                <div 
                  className="w-full h-20 rounded-lg mb-2 flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: colors.accent }}
                >
                  Accent
                </div>
                <p className="text-xs font-medium">Accent</p>
                <p className="text-xs text-gray-500">{colors.accent}</p>
              </div>
            )}
            {colors.neutral?.[500] && (
              <div className="text-center">
                <div 
                  className="w-full h-20 rounded-lg mb-2 flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: colors.neutral[500] }}
                >
                  Neutral
                </div>
                <p className="text-xs font-medium">Neutral</p>
                <p className="text-xs text-gray-500">{colors.neutral[500]}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
