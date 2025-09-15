/**
 * @fileoverview Brand Typography Editor Component
 * @module components/brand/brand-typography-editor
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.4: Brand Configuration User Interface
 * Component for customizing brand typography with font selection and type scales.
 */

'use client';

import { useState, useEffect } from 'react';
import { BrandConfig } from '@/types/brand-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Type, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface BrandTypographyEditorProps {
  brand: BrandConfig;
  onBrandChange: (brand: BrandConfig) => void;
}

const FONT_FAMILIES = [
  { value: 'system-ui, -apple-system, sans-serif', label: 'System UI (Default)' },
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'Poppins, system-ui, sans-serif', label: 'Poppins' },
  { value: 'Roboto, system-ui, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, system-ui, sans-serif', label: 'Open Sans' },
  { value: 'Lato, system-ui, sans-serif', label: 'Lato' },
  { value: 'Montserrat, system-ui, sans-serif', label: 'Montserrat' },
  { value: 'Source Sans Pro, system-ui, sans-serif', label: 'Source Sans Pro' },
  { value: 'Nunito, system-ui, sans-serif', label: 'Nunito' },
  { value: 'Work Sans, system-ui, sans-serif', label: 'Work Sans' },
  { value: 'DM Sans, system-ui, sans-serif', label: 'DM Sans' },
  { value: 'Manrope, system-ui, sans-serif', label: 'Manrope' }
];

const FONT_WEIGHTS = [
  { value: 300, label: 'Light (300)' },
  { value: 400, label: 'Normal (400)' },
  { value: 500, label: 'Medium (500)' },
  { value: 600, label: 'Semibold (600)' },
  { value: 700, label: 'Bold (700)' },
  { value: 800, label: 'Extra Bold (800)' },
  { value: 900, label: 'Black (900)' }
];

export function BrandTypographyEditor({ brand, onBrandChange }: BrandTypographyEditorProps) {
  const [typography, setTypography] = useState(brand.overrides.typography || {});
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setTypography(brand.overrides.typography || {});
  }, [brand.overrides.typography]);

  const handleTypographyChange = (field: string, value: any) => {
    const newTypography = {
      ...typography,
      [field]: value
    };
    setTypography(newTypography);
    
    onBrandChange({
      ...brand,
      overrides: {
        ...brand.overrides,
        typography: newTypography
      }
    });
  };

  const handleFontWeightChange = (weight: string, value: number) => {
    const newTypography = {
      ...typography,
      fontWeights: {
        ...typography.fontWeights,
        [weight]: value
      }
    };
    setTypography(newTypography);
    
    onBrandChange({
      ...brand,
      overrides: {
        ...brand.overrides,
        typography: newTypography
      }
    });
  };

  const handleTypeScaleChange = (scale: string, value: string) => {
    const newTypography = {
      ...typography,
      scales: {
        ...typography.scales,
        [scale]: value
      }
    };
    setTypography(newTypography);
    
    onBrandChange({
      ...brand,
      overrides: {
        ...brand.overrides,
        typography: newTypography
      }
    });
  };

  const generateTypography = async () => {
    setIsGenerating(true);
    
    // Simulate typography generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const generatedTypography = {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeights: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      scales: {
        display: '2.5rem',
        headline: '1.5rem',
        body: '1rem',
        caption: '0.875rem'
      }
    };
    
    setTypography(generatedTypography);
    onBrandChange({
      ...brand,
      overrides: {
        ...brand.overrides,
        typography: generatedTypography
      }
    });
    
    setIsGenerating(false);
  };

  const resetToPreset = () => {
    if (brand.basePreset) {
      setTypography({});
      onBrandChange({
        ...brand,
        overrides: {
          ...brand.overrides,
          typography: {}
        }
      });
    }
  };

  const isValidFontSize = (size: string) => {
    return /^\d+(\.\d+)?(rem|px|em)$/.test(size);
  };

  const FontSizeInput = ({ 
    label, 
    value, 
    onChange, 
    placeholder = '1rem' 
  }: {
    label: string;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }) => {
    const [isValid, setIsValid] = useState(true);
    
    const handleChange = (newValue: string) => {
      const valid = isValidFontSize(newValue) || newValue === '';
      setIsValid(valid);
      onChange(newValue);
    };

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="flex items-center gap-2">
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
      {/* Font Family */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Font Family</CardTitle>
              <CardDescription>
                Choose the primary font family for your brand
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateTypography}
                disabled={isGenerating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                Generate Typography
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Font Family
            </label>
            <Select
              value={typography.fontFamily || ''}
              onValueChange={(value) => handleTypographyChange('fontFamily', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font family" />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Font Preview */}
          {typography.fontFamily && (
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <div 
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: typography.fontFamily }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
              <div 
                className="text-base"
                style={{ fontFamily: typography.fontFamily }}
              >
                ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Font Weights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Font Weights</CardTitle>
          <CardDescription>
            Configure font weights for different text styles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries({
              light: 'Light',
              normal: 'Normal',
              medium: 'Medium',
              semibold: 'Semibold',
              bold: 'Bold'
            }).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </label>
                <Select
                  value={typography.fontWeights?.[key as keyof typeof typography.fontWeights]?.toString() || '400'}
                  onValueChange={(value) => handleFontWeightChange(key, parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_WEIGHTS.map((weight) => (
                      <SelectItem key={weight.value} value={weight.value.toString()}>
                        {weight.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Type Scale */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Type Scale</CardTitle>
          <CardDescription>
            Define font sizes for different text elements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries({
              display: 'Display',
              headline: 'Headline',
              body: 'Body',
              caption: 'Caption'
            }).map(([key, label]) => (
              <FontSizeInput
                key={key}
                label={label}
                value={typography.scales?.[key as keyof typeof typography.scales]}
                onChange={(value) => handleTypeScaleChange(key, value)}
                placeholder={key === 'display' ? '2.5rem' : key === 'headline' ? '1.5rem' : key === 'body' ? '1rem' : '0.875rem'}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Typography Preview</CardTitle>
          <CardDescription>
            See how your typography looks in practice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Display Text */}
            {typography.scales?.display && (
              <div>
                <Badge variant="outline" className="mb-2">Display</Badge>
                <div 
                  className="text-4xl font-bold text-gray-900 dark:text-gray-100"
                  style={{ 
                    fontFamily: typography.fontFamily,
                    fontSize: typography.scales.display,
                    fontWeight: typography.fontWeights?.bold || 700
                  }}
                >
                  Brand Display Text
                </div>
              </div>
            )}

            {/* Headline Text */}
            {typography.scales?.headline && (
              <div>
                <Badge variant="outline" className="mb-2">Headline</Badge>
                <div 
                  className="text-2xl font-semibold text-gray-900 dark:text-gray-100"
                  style={{ 
                    fontFamily: typography.fontFamily,
                    fontSize: typography.scales.headline,
                    fontWeight: typography.fontWeights?.semibold || 600
                  }}
                >
                  Section Headline
                </div>
              </div>
            )}

            {/* Body Text */}
            {typography.scales?.body && (
              <div>
                <Badge variant="outline" className="mb-2">Body</Badge>
                <div 
                  className="text-gray-700 dark:text-gray-300 leading-relaxed"
                  style={{ 
                    fontFamily: typography.fontFamily,
                    fontSize: typography.scales.body,
                    fontWeight: typography.fontWeights?.normal || 400
                  }}
                >
                  This is body text that demonstrates how your chosen font family and size will look in paragraphs and regular content. It should be comfortable to read and maintain good contrast with the background.
                </div>
              </div>
            )}

            {/* Caption Text */}
            {typography.scales?.caption && (
              <div>
                <Badge variant="outline" className="mb-2">Caption</Badge>
                <div 
                  className="text-gray-600 dark:text-gray-400"
                  style={{ 
                    fontFamily: typography.fontFamily,
                    fontSize: typography.scales.caption,
                    fontWeight: typography.fontWeights?.normal || 400
                  }}
                >
                  This is caption text for smaller details and metadata.
                </div>
              </div>
            )}

            {/* Font Weight Examples */}
            {typography.fontWeights && (
              <div>
                <Badge variant="outline" className="mb-2">Font Weights</Badge>
                <div className="space-y-2">
                  {Object.entries(typography.fontWeights).map(([weight, value]) => (
                    <div 
                      key={weight}
                      className="text-lg"
                      style={{ 
                        fontFamily: typography.fontFamily,
                        fontWeight: value
                      }}
                    >
                      {weight.charAt(0).toUpperCase() + weight.slice(1)} ({value}) - The quick brown fox
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
