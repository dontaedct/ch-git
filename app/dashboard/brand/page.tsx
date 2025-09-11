/**
 * @fileoverview Brand Configuration Dashboard
 * @module app/dashboard/brand/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.4: Brand Configuration User Interface
 * Main dashboard for brand configuration management with preset selection,
 * customization options, and real-time preview.
 */

'use client';

import { useState } from 'react';
import { useBrandConfig } from '@/hooks/use-brand-config';
import { BrandConfig, BrandPreset } from '@/types/brand-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Type, 
  Image, 
  Settings, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Save,
  Plus,
  Trash2,
  Copy
} from 'lucide-react';
import { BrandPresetSelector } from '@/components/brand/brand-preset-selector';
import { BrandColorCustomizer } from '@/components/brand/brand-color-customizer';
import { BrandTypographyEditor } from '@/components/brand/brand-typography-editor';
import { BrandAssetManager } from '@/components/brand/brand-asset-manager';
import { BrandPreview } from '@/components/brand/brand-preview';
import { BrandValidationPanel } from '@/components/brand/brand-validation-panel';

export default function BrandConfigurationPage() {
  const {
    brands,
    presets,
    currentBrand,
    isLoading,
    isApplying,
    isValidating,
    error,
    validationResult,
    createBrand,
    updateBrand,
    deleteBrand,
    applyBrand,
    validateBrand,
    exportBrand,
    importBrand,
    refreshBrands
  } = useBrandConfig();

  const [selectedBrand, setSelectedBrand] = useState<BrandConfig | null>(currentBrand);
  const [isCreating, setIsCreating] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const handleCreateBrand = async () => {
    try {
      const newBrand = await createBrand({
        name: 'New Brand',
        description: 'A new brand configuration',
        overrides: {},
        metadata: {
          industry: 'general',
          style: 'modern',
          colorScheme: 'duotone',
          maturity: 'startup'
        }
      });
      setSelectedBrand(newBrand);
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create brand:', err);
    }
  };

  const handleSaveBrand = async () => {
    if (!selectedBrand) return;
    
    try {
      await updateBrand(selectedBrand.id, selectedBrand);
      await refreshBrands();
    } catch (err) {
      console.error('Failed to save brand:', err);
    }
  };

  const handleApplyBrand = async () => {
    if (!selectedBrand) return;
    
    try {
      await applyBrand(selectedBrand.id);
    } catch (err) {
      console.error('Failed to apply brand:', err);
    }
  };

  const handleValidateBrand = async () => {
    if (!selectedBrand) return;
    
    try {
      await validateBrand(selectedBrand.id);
      setShowValidation(true);
    } catch (err) {
      console.error('Failed to validate brand:', err);
    }
  };

  const handleExportBrand = async () => {
    if (!selectedBrand) return;
    
    try {
      const exported = await exportBrand(selectedBrand.id);
      const blob = new Blob([exported], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brand-${selectedBrand.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export brand:', err);
    }
  };

  const handlePresetSelect = (preset: BrandPreset) => {
    if (!selectedBrand) return;
    
    setSelectedBrand({
      ...selectedBrand,
      basePreset: preset.id,
      overrides: {
        ...selectedBrand.overrides,
        ...preset.baseConfig
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Brand Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Customize your brand identity with colors, typography, and assets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Brand
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Exit Preview' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Brand Status */}
      {currentBrand && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: currentBrand.overrides.colors?.primary || '#007AFF' }}
                />
                <div>
                  <h3 className="font-semibold">{currentBrand.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Currently applied brand
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand List Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Brand Library</CardTitle>
              <CardDescription>
                Manage your brand configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedBrand?.id === brand.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedBrand(brand)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: brand.overrides.colors?.primary || '#007AFF' }}
                      />
                      <span className="font-medium text-sm">{brand.name}</span>
                    </div>
                    {brand.id === currentBrand?.id && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  {brand.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {brand.description}
                    </p>
                  )}
                </div>
              ))}
              
              {brands.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Palette className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No brands created yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={handleCreateBrand}
                  >
                    Create Your First Brand
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preset Selector */}
          <BrandPresetSelector
            presets={presets}
            onPresetSelect={handlePresetSelect}
            selectedPreset={selectedBrand?.basePreset}
          />
        </div>

        {/* Main Configuration Area */}
        <div className="lg:col-span-2 space-y-6">
          {selectedBrand ? (
            <>
              {/* Brand Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedBrand.name}</CardTitle>
                      <CardDescription>
                        {selectedBrand.description || 'Brand configuration'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleValidateBrand}
                        disabled={isValidating}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Validate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportBrand}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleApplyBrand}
                        disabled={isApplying}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isApplying ? 'Applying...' : 'Apply Brand'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Configuration Tabs */}
              <Tabs defaultValue="colors" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="colors" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Colors
                  </TabsTrigger>
                  <TabsTrigger value="typography" className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Typography
                  </TabsTrigger>
                  <TabsTrigger value="assets" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Assets
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="colors" className="space-y-4">
                  <BrandColorCustomizer
                    brand={selectedBrand}
                    onBrandChange={setSelectedBrand}
                  />
                </TabsContent>

                <TabsContent value="typography" className="space-y-4">
                  <BrandTypographyEditor
                    brand={selectedBrand}
                    onBrandChange={setSelectedBrand}
                  />
                </TabsContent>

                <TabsContent value="assets" className="space-y-4">
                  <BrandAssetManager
                    brand={selectedBrand}
                    onBrandChange={setSelectedBrand}
                  />
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Brand Settings</CardTitle>
                      <CardDescription>
                        Configure brand metadata and general settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Brand Name"
                          value={selectedBrand.name}
                          onChange={(e) => setSelectedBrand({
                            ...selectedBrand,
                            name: e.target.value
                          })}
                        />
                        <Input
                          label="Industry"
                          value={selectedBrand.metadata.industry || ''}
                          onChange={(e) => setSelectedBrand({
                            ...selectedBrand,
                            metadata: {
                              ...selectedBrand.metadata,
                              industry: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Description
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          value={selectedBrand.description || ''}
                          onChange={(e) => setSelectedBrand({
                            ...selectedBrand,
                            description: e.target.value
                          })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Palette className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Brand Selected</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Select a brand from the sidebar or create a new one to get started
                  </p>
                  <Button onClick={handleCreateBrand}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Brand
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Preview Mode */}
      {isPreviewMode && selectedBrand && (
        <BrandPreview brand={selectedBrand} />
      )}

      {/* Validation Panel */}
      {showValidation && validationResult && (
        <BrandValidationPanel
          validation={validationResult}
          onClose={() => setShowValidation(false)}
        />
      )}
    </div>
  );
}
