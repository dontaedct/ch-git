/**
 * @fileoverview HT-011.1.5: Brand Preset System UI Components
 * @module components/branding/preset-components
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.5 - Implement Brand Preset System
 * Focus: Create UI components for brand preset selection and management
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (branding system enhancement)
 */

'use client';

import React, { useState } from 'react';
import { BrandPreset, PresetCustomization } from '@/lib/branding/preset-manager';
import { useBrandPresetSystem } from '@/lib/branding/preset-hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Palette, Upload, Download, Plus, Settings, Eye, Check } from 'lucide-react';

/**
 * Brand Preset Card Component
 */
interface PresetCardProps {
  preset: BrandPreset;
  onSelect: (preset: BrandPreset) => void;
  onPreview: (preset: BrandPreset) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

export function PresetCard({ 
  preset, 
  onSelect, 
  onPreview, 
  isSelected = false,
  showActions = true 
}: PresetCardProps) {
  return (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Color Preview */}
            <div className="flex space-x-1">
              <div 
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: preset.palette.primary }}
              />
              {preset.palette.secondary && (
                <div 
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: preset.palette.secondary }}
                />
              )}
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{preset.name}</CardTitle>
              <CardDescription className="text-xs">{preset.industry}</CardDescription>
            </div>
          </div>
          {isSelected && (
            <Check className="w-4 h-4 text-primary" />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground mb-3">{preset.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {preset.metadata.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(preset);
              }}
              className="flex-1"
            >
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(preset);
              }}
              className="flex-1"
            >
              Select
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Brand Preset Selector Component
 */
interface PresetSelectorProps {
  onPresetSelect: (preset: BrandPreset, customizations?: PresetCustomization) => void;
  currentPreset?: BrandPreset;
  showCustomizations?: boolean;
}

export function PresetSelector({ 
  onPresetSelect, 
  currentPreset,
  showCustomizations = true 
}: PresetSelectorProps) {
  const {
    presets,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    searchIndustry,
    setSearchIndustry,
    searchResults,
    industryCategories,
    recommendations,
    loadRecommendations,
    generatePreview,
    preview,
    clearPreview
  } = useBrandPresetSystem();

  const [showCustomizationDialog, setShowCustomizationDialog] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<BrandPreset | null>(null);
  const [customizations, setCustomizations] = useState<PresetCustomization>({});

  const handlePresetSelect = (preset: BrandPreset) => {
    if (showCustomizations) {
      setSelectedPreset(preset);
      setShowCustomizationDialog(true);
    } else {
      onPresetSelect(preset);
    }
  };

  const handleApplyCustomizations = () => {
    if (selectedPreset) {
      onPresetSelect(selectedPreset, customizations);
      setShowCustomizationDialog(false);
      setCustomizations({});
    }
  };

  const handlePreview = (preset: BrandPreset) => {
    generatePreview(preset);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading presets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-sm text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Presets</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search"
                placeholder="Search by name, industry, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-48">
            <Label htmlFor="industry">Industry</Label>
            <Select value={searchIndustry} onValueChange={setSearchIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Industries</SelectItem>
                {industryCategories.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onSelect={handlePresetSelect}
            onPreview={handlePreview}
            isSelected={currentPreset?.id === preset.id}
          />
        ))}
      </div>

      {/* Customization Dialog */}
      <Dialog open={showCustomizationDialog} onOpenChange={setShowCustomizationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customize Brand Preset</DialogTitle>
            <DialogDescription>
              Customize the selected preset to match your brand requirements.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPreset && (
            <div className="space-y-6">
              {/* Brand Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    placeholder={selectedPreset.brandName.organizationName}
                    value={customizations.organizationName || ''}
                    onChange={(e) => setCustomizations(prev => ({
                      ...prev,
                      organizationName: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="appName">App Name</Label>
                  <Input
                    id="appName"
                    placeholder={selectedPreset.brandName.appName}
                    value={customizations.appName || ''}
                    onChange={(e) => setCustomizations(prev => ({
                      ...prev,
                      appName: e.target.value
                    }))}
                  />
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primaryColor"
                      placeholder={selectedPreset.palette.primary}
                      value={customizations.primaryColor || ''}
                      onChange={(e) => setCustomizations(prev => ({
                        ...prev,
                        primaryColor: e.target.value
                      }))}
                    />
                    <div 
                      className="w-10 h-10 rounded border border-gray-200"
                      style={{ 
                        backgroundColor: customizations.primaryColor || selectedPreset.palette.primary 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="secondaryColor"
                      placeholder={selectedPreset.palette.secondary || selectedPreset.palette.primary}
                      value={customizations.secondaryColor || ''}
                      onChange={(e) => setCustomizations(prev => ({
                        ...prev,
                        secondaryColor: e.target.value
                      }))}
                    />
                    <div 
                      className="w-10 h-10 rounded border border-gray-200"
                      style={{ 
                        backgroundColor: customizations.secondaryColor || selectedPreset.palette.secondary || selectedPreset.palette.primary 
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div>
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select 
                  value={customizations.fontFamily || selectedPreset.typography.fontFamily}
                  onValueChange={(value) => setCustomizations(prev => ({
                    ...prev,
                    fontFamily: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Geist">Geist</SelectItem>
                    <SelectItem value="SF Pro Display">SF Pro Display</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCustomizationDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleApplyCustomizations}>
                  Apply Preset
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {preview && (
        <Dialog open={!!preview} onOpenChange={clearPreview}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Preset Preview</DialogTitle>
              <DialogDescription>
                Preview of the selected brand preset.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">{preview.name}</h3>
                <p className="text-sm text-muted-foreground">{preview.industry}</p>
              </div>
              
              <div className="flex justify-center space-x-2">
                {preview.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium">Logo Preview</p>
                <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                  <div className="w-16 h-16 mx-auto bg-gray-200 rounded flex items-center justify-center">
                    <Palette className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/**
 * Brand Preset Manager Component
 */
export function PresetManager() {
  const {
    customPresets,
    loading,
    error,
    createPreset,
    updatePreset,
    deletePreset,
    exportPreset,
    importPreset
  } = useBrandPresetSystem();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');

  const handleCreatePreset = async (presetData: Omit<BrandPreset, 'id' | 'metadata'>) => {
    const result = await createPreset(presetData);
    if (result) {
      setShowCreateDialog(false);
    }
  };

  const handleImportPreset = async () => {
    const result = await importPreset(importData);
    if (result) {
      setShowImportDialog(false);
      setImportData('');
    }
  };

  const handleExportPreset = (presetId: string) => {
    const exported = exportPreset(presetId);
    if (exported) {
      // Create download link
      const blob = new Blob([exported], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `preset-${presetId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Brand Preset Manager</h2>
          <p className="text-muted-foreground">Manage your custom brand presets</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowImportDialog(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Preset
          </Button>
        </div>
      </div>

      {/* Custom Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customPresets.map((preset) => (
          <Card key={preset.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">{preset.name}</CardTitle>
                  <CardDescription className="text-xs">{preset.industry}</CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleExportPreset(preset.id)}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deletePreset(preset.id)}
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">{preset.description}</p>
              <div className="flex space-x-1">
                {preset.metadata.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Brand Preset</DialogTitle>
            <DialogDescription>
              Paste the exported preset JSON data to import a brand preset.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="importData">Preset JSON</Label>
              <textarea
                id="importData"
                className="w-full h-32 p-3 border rounded-md font-mono text-sm"
                placeholder="Paste preset JSON data here..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowImportDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleImportPreset}>
                Import Preset
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
