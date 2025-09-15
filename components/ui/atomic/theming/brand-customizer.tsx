/**
 * @fileoverview HT-022.2.2: Simple Brand Customization Component
 * @module components/ui/atomic/theming
 * @author Agency Component System
 * @version 1.0.0
 *
 * BRAND CUSTOMIZER: Basic white-labeling and brand customization
 */

'use client';

import React, { useState } from 'react';
import { useSimpleTheme, createSimpleTheme, type SimpleClientTheme } from './simple-theme-provider';
import { Button, Input, Label } from '../atoms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../molecules';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../molecules';
import { Badge } from '../atoms';
import { Paintbrush, Image, Type, Save, Eye } from 'lucide-react';

interface BrandCustomizerProps {
  onSave?: (theme: SimpleClientTheme) => void;
  className?: string;
}

export function BrandCustomizer({ onSave, className }: BrandCustomizerProps) {
  const { addCustomTheme } = useSimpleTheme();
  const [brandData, setBrandData] = useState({
    name: 'Custom Brand',
    primaryColor: '#3b82f6',
    logoInitials: 'CB',
    logoUrl: '',
    fontFamily: 'Inter, system-ui, sans-serif'
  });
  const [previewTheme, setPreviewTheme] = useState<SimpleClientTheme | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setBrandData(prev => ({ ...prev, [field]: value }));
    updatePreview({ [field]: value });
  };

  const updatePreview = (updates: Partial<typeof brandData> = {}) => {
    const data = { ...brandData, ...updates };
    const theme = createSimpleTheme(
      `custom-${Date.now()}`,
      data.name,
      data.primaryColor,
      data.logoInitials,
      data.fontFamily
    );

    if (data.logoUrl) {
      theme.logo.src = data.logoUrl;
    }

    setPreviewTheme(theme);
  };

  const saveBrand = () => {
    const theme = createSimpleTheme(
      `custom-${Date.now()}`,
      brandData.name,
      brandData.primaryColor,
      brandData.logoInitials,
      brandData.fontFamily
    );

    if (brandData.logoUrl) {
      theme.logo.src = brandData.logoUrl;
    }

    addCustomTheme(theme);
    onSave?.(theme);
  };

  // Update preview when component mounts or brandData changes
  React.useEffect(() => {
    updatePreview();
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5" />
          Brand Customizer
        </CardTitle>
        <CardDescription>
          Create a custom theme for your client brand
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="logo">Logo</TabsTrigger>
            <TabsTrigger value="typography">Type</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input
                  id="brand-name"
                  value={brandData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <Label htmlFor="primary-color">Primary Brand Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="primary-color"
                    value={brandData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-12 h-10 rounded border"
                  />
                  <Input
                    value={brandData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="text-sm font-medium mb-2">Color Preview</h4>
                <div className="flex gap-2">
                  <div className="text-center">
                    <div
                      className="w-8 h-8 rounded border mb-1"
                      style={{ backgroundColor: brandData.primaryColor }}
                    />
                    <span className="text-xs">Primary</span>
                  </div>
                  <div className="text-center">
                    <div
                      className="w-8 h-8 rounded border mb-1"
                      style={{
                        backgroundColor: brandData.primaryColor + '20' // Add transparency
                      }}
                    />
                    <span className="text-xs">Light</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logo" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="logo-initials">Logo Initials</Label>
                <Input
                  id="logo-initials"
                  value={brandData.logoInitials}
                  onChange={(e) => handleInputChange('logoInitials', e.target.value.toUpperCase().slice(0, 2))}
                  maxLength={2}
                  placeholder="CB"
                  className="text-center"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used when no logo image is provided
                </p>
              </div>

              <div>
                <Label htmlFor="logo-url">Logo Image URL (Optional)</Label>
                <Input
                  id="logo-url"
                  value={brandData.logoUrl}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to use initials
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="text-sm font-medium mb-2">Logo Preview</h4>
                <div className="flex items-center gap-2">
                  {brandData.logoUrl ? (
                    <img
                      src={brandData.logoUrl}
                      alt={`${brandData.name} Logo`}
                      className="w-10 h-10 object-contain border rounded"
                      onError={(e) => {
                        // Fallback to initials on image error
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: brandData.primaryColor }}
                    >
                      {brandData.logoInitials}
                    </div>
                  )}
                  <span className="text-sm">{brandData.name}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="font-family">Font Family</Label>
                <select
                  id="font-family"
                  value={brandData.fontFamily}
                  onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="Inter, system-ui, sans-serif">Inter (Default)</option>
                  <option value="system-ui, sans-serif">System UI</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Helvetica, sans-serif">Helvetica</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="Times, serif">Times</option>
                  <option value="'Courier New', monospace">Courier New</option>
                </select>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="text-sm font-medium mb-2">Typography Preview</h4>
                <div style={{ fontFamily: brandData.fontFamily }}>
                  <h3 className="text-lg font-bold mb-2">Heading Example</h3>
                  <p className="text-sm mb-2">
                    This is how your regular text will appear with the selected font family.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Font: {brandData.fontFamily.split(',')[0]}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <h4 className="font-medium">Theme Preview</h4>
                <Badge variant="secondary">Live Preview</Badge>
              </div>

              {previewTheme && (
                <div className="border rounded-lg p-4 space-y-4">
                  {/* Header with logo */}
                  <div className="flex items-center gap-3 pb-3 border-b">
                    {previewTheme.logo.src ? (
                      <img
                        src={previewTheme.logo.src}
                        alt={previewTheme.logo.alt}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: previewTheme.colors.primary }}
                      >
                        {previewTheme.logo.initials}
                      </div>
                    )}
                    <h3
                      className="font-semibold"
                      style={{ fontFamily: previewTheme.typography.fontFamily }}
                    >
                      {previewTheme.name}
                    </h3>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 rounded-md text-white font-medium text-sm"
                      style={{ backgroundColor: previewTheme.colors.primary }}
                    >
                      Primary Button
                    </button>
                    <button
                      className="px-4 py-2 rounded-md border text-sm"
                      style={{
                        borderColor: previewTheme.colors.primary,
                        color: previewTheme.colors.primary
                      }}
                    >
                      Secondary
                    </button>
                  </div>

                  {/* Content */}
                  <div style={{ fontFamily: previewTheme.typography.fontFamily }}>
                    <h4 className="font-medium mb-2">Content Example</h4>
                    <p className="text-sm text-muted-foreground">
                      This is how your content will appear with the selected theme.
                    </p>
                  </div>
                </div>
              )}

              <Button onClick={saveBrand} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save & Apply Custom Brand
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}