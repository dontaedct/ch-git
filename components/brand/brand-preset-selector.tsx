/**
 * @fileoverview Brand Preset Selector Component
 * @module components/brand/brand-preset-selector
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.4: Brand Configuration User Interface
 * Component for selecting and previewing brand presets.
 */

'use client';

import { useState } from 'react';
import { BrandPreset } from '@/types/brand-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Eye, Check } from 'lucide-react';

interface BrandPresetSelectorProps {
  presets: BrandPreset[];
  onPresetSelect: (preset: BrandPreset) => void;
  selectedPreset?: string;
}

export function BrandPresetSelector({ 
  presets, 
  onPresetSelect, 
  selectedPreset 
}: BrandPresetSelectorProps) {
  const [previewPreset, setPreviewPreset] = useState<BrandPreset | null>(null);

  const handlePresetClick = (preset: BrandPreset) => {
    onPresetSelect(preset);
  };

  const handlePreview = (preset: BrandPreset) => {
    setPreviewPreset(preset);
  };

  const handleClosePreview = () => {
    setPreviewPreset(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Brand Presets</CardTitle>
          <CardDescription>
            Start with a professional template
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all group ${
                selectedPreset === preset.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => handlePresetClick(preset)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: preset.baseConfig.colors?.primary || '#007AFF' }}
                  />
                  <span className="font-medium text-sm">{preset.name}</span>
                </div>
                {selectedPreset === preset.id && (
                  <Check className="h-4 w-4 text-blue-500" />
                )}
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {preset.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-xs">
                    {preset.metadata.style}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {preset.metadata.colorScheme}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(preset);
                  }}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          
          {presets.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Palette className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No presets available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preset Preview Modal */}
      {previewPreset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{previewPreset.name}</CardTitle>
                  <CardDescription>{previewPreset.description}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleClosePreview}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Preview */}
              <div>
                <h4 className="font-semibold mb-3">Color Palette</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {previewPreset.baseConfig.colors?.primary && (
                    <div className="text-center">
                      <div 
                        className="w-full h-16 rounded-lg mb-2"
                        style={{ backgroundColor: previewPreset.baseConfig.colors.primary }}
                      />
                      <p className="text-xs font-medium">Primary</p>
                      <p className="text-xs text-gray-500">{previewPreset.baseConfig.colors.primary}</p>
                    </div>
                  )}
                  {previewPreset.baseConfig.colors?.secondary && (
                    <div className="text-center">
                      <div 
                        className="w-full h-16 rounded-lg mb-2"
                        style={{ backgroundColor: previewPreset.baseConfig.colors.secondary }}
                      />
                      <p className="text-xs font-medium">Secondary</p>
                      <p className="text-xs text-gray-500">{previewPreset.baseConfig.colors.secondary}</p>
                    </div>
                  )}
                  {previewPreset.baseConfig.colors?.accent && (
                    <div className="text-center">
                      <div 
                        className="w-full h-16 rounded-lg mb-2"
                        style={{ backgroundColor: previewPreset.baseConfig.colors.accent }}
                      />
                      <p className="text-xs font-medium">Accent</p>
                      <p className="text-xs text-gray-500">{previewPreset.baseConfig.colors.accent}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Typography Preview */}
              {previewPreset.baseConfig.typography && (
                <div>
                  <h4 className="font-semibold mb-3">Typography</h4>
                  <div className="space-y-2">
                    <div 
                      className="text-2xl font-bold"
                      style={{ fontFamily: previewPreset.baseConfig.typography.fontFamily }}
                    >
                      Display Text
                    </div>
                    <div 
                      className="text-lg font-semibold"
                      style={{ fontFamily: previewPreset.baseConfig.typography.fontFamily }}
                    >
                      Heading Text
                    </div>
                    <div 
                      className="text-base"
                      style={{ fontFamily: previewPreset.baseConfig.typography.fontFamily }}
                    >
                      Body text with normal weight
                    </div>
                    <div 
                      className="text-sm text-gray-600"
                      style={{ fontFamily: previewPreset.baseConfig.typography.fontFamily }}
                    >
                      Caption text
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div>
                <h4 className="font-semibold mb-3">Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Style:</span>
                    <span className="ml-2 capitalize">{previewPreset.metadata.style}</span>
                  </div>
                  <div>
                    <span className="font-medium">Color Scheme:</span>
                    <span className="ml-2 capitalize">{previewPreset.metadata.colorScheme}</span>
                  </div>
                  <div>
                    <span className="font-medium">Industry:</span>
                    <span className="ml-2 capitalize">{previewPreset.metadata.industry}</span>
                  </div>
                  <div>
                    <span className="font-medium">Maturity:</span>
                    <span className="ml-2 capitalize">{previewPreset.metadata.maturity}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => {
                    handlePresetClick(previewPreset);
                    handleClosePreview();
                  }}
                  className="flex-1"
                >
                  Use This Preset
                </Button>
                <Button variant="outline" onClick={handleClosePreview}>
                  Close Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
