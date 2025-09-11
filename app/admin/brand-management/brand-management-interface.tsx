/**
 * @fileoverview Brand Management Interface Component
 * @module app/admin/brand-management/brand-management-interface
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Palette, 
  Type, 
  Image, 
  Save, 
  RotateCcw, 
  Eye, 
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Settings,
  Brand
} from 'lucide-react';
import { toast } from 'sonner';
import { logoManager, BRAND_PRESETS, BrandUtils } from '@/lib/branding/logo-manager';
import { DynamicBrandConfig, BrandNameConfig, LogoConfig } from '@/lib/branding/logo-manager';
import { BrandAwareSuccessNotification, BrandAwareErrorNotification } from '@/components/ui/brand-aware-error-notification';

export function BrandManagementInterface() {
  const [currentConfig, setCurrentConfig] = useState<DynamicBrandConfig>(logoManager.getCurrentConfig());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Subscribe to brand configuration changes
  useEffect(() => {
    const unsubscribe = logoManager.subscribe((config) => {
      setCurrentConfig(config);
      setHasChanges(false);
    });
    return unsubscribe;
  }, []);

  // Validate configuration
  const validateConfig = (config: DynamicBrandConfig): string[] => {
    const errors: string[] = [];
    
    if (!config.brandName.organizationName.trim()) {
      errors.push('Organization name is required');
    }
    
    if (!config.brandName.appName.trim()) {
      errors.push('App name is required');
    }
    
    if (config.logo.initials && config.logo.initials.length > 3) {
      errors.push('Brand initials should be 3 characters or less');
    }
    
    return errors;
  };

  // Handle configuration update
  const updateConfig = (updates: Partial<DynamicBrandConfig>) => {
    const newConfig = { ...currentConfig, ...updates };
    const errors = validateConfig(newConfig);
    setValidationErrors(errors);
    setCurrentConfig(newConfig);
    setHasChanges(true);
  };

  // Handle brand name updates
  const updateBrandNames = (updates: Partial<BrandNameConfig>) => {
    updateConfig({
      brandName: { ...currentConfig.brandName, ...updates }
    });
  };

  // Handle logo updates
  const updateLogo = (updates: Partial<LogoConfig>) => {
    updateConfig({
      logo: { ...currentConfig.logo, ...updates }
    });
  };

  // Save configuration
  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      const errors = validateConfig(currentConfig);
      if (errors.length > 0) {
        setValidationErrors(errors);
        toast.error('Please fix validation errors before saving');
        return;
      }

      // Update the logo manager
      logoManager.updateConfig(currentConfig);
      
      // In a real implementation, this would save to the database
      localStorage.setItem('brand-config', JSON.stringify(currentConfig));
      
      setHasChanges(false);
      setValidationErrors([]);
      toast.success('Brand configuration saved successfully');
    } catch (error) {
      console.error('Failed to save brand configuration:', error);
      toast.error('Failed to save brand configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const resetToDefault = () => {
    logoManager.loadPreset('default');
    setHasChanges(false);
    setValidationErrors([]);
    toast.success('Reset to default brand configuration');
  };

  // Load preset
  const loadPreset = (presetName: string) => {
    const success = logoManager.loadPreset(presetName);
    if (success) {
      setHasChanges(false);
      setValidationErrors([]);
      toast.success(`Loaded ${presetName} brand preset`);
    } else {
      toast.error(`Failed to load ${presetName} preset`);
    }
  };

  // Export configuration
  const exportConfiguration = () => {
    const configJson = JSON.stringify(currentConfig, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brand-config.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Brand configuration exported');
  };

  // Import configuration
  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        const success = logoManager.importConfig(JSON.stringify(config));
        if (success) {
          setHasChanges(false);
          setValidationErrors([]);
          toast.success('Brand configuration imported successfully');
        } else {
          toast.error('Invalid brand configuration file');
        }
      } catch (error) {
        toast.error('Failed to parse brand configuration file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Brand Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brand className="h-5 w-5" />
            Current Brand Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {currentConfig.logo.showAsImage ? (
                <img
                  src={currentConfig.logo.src}
                  alt={currentConfig.logo.alt}
                  width={64}
                  height={64}
                  className="rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${currentConfig.logo.fallbackBgColor} flex items-center justify-center text-white font-bold text-lg ${currentConfig.logo.showAsImage ? 'hidden' : ''}`}>
                {currentConfig.logo.initials}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{currentConfig.brandName.fullBrand}</h3>
              <p className="text-sm text-muted-foreground">
                {currentConfig.isCustom ? 'Custom Brand' : `Preset: ${currentConfig.presetName || 'default'}`}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={currentConfig.isCustom ? 'default' : 'secondary'}>
                  {currentConfig.isCustom ? 'Custom' : 'Preset'}
                </Badge>
                {hasChanges && (
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    Unsaved Changes
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Management Tabs */}
      <Tabs defaultValue="brand-names" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="brand-names">Brand Names</TabsTrigger>
          <TabsTrigger value="logo">Logo & Visual</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Brand Names Tab */}
        <TabsContent value="brand-names" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Brand Names Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organization-name">Organization Name</Label>
                  <Input
                    id="organization-name"
                    value={currentConfig.brandName.organizationName}
                    onChange={(e) => updateBrandNames({ organizationName: e.target.value })}
                    placeholder="Your Organization"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-name">App Name</Label>
                  <Input
                    id="app-name"
                    value={currentConfig.brandName.appName}
                    onChange={(e) => updateBrandNames({ appName: e.target.value })}
                    placeholder="Micro App"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="full-brand">Full Brand Name</Label>
                <Input
                  id="full-brand"
                  value={currentConfig.brandName.fullBrand}
                  onChange={(e) => updateBrandNames({ fullBrand: e.target.value })}
                  placeholder="Your Organization — Micro App"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="short-brand">Short Brand Name</Label>
                  <Input
                    id="short-brand"
                    value={currentConfig.brandName.shortBrand}
                    onChange={(e) => updateBrandNames({ shortBrand: e.target.value })}
                    placeholder="Micro App"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nav-brand">Navigation Brand Name</Label>
                  <Input
                    id="nav-brand"
                    value={currentConfig.brandName.navBrand}
                    onChange={(e) => updateBrandNames({ navBrand: e.target.value })}
                    placeholder="Micro App"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logo & Visual Tab */}
        <TabsContent value="logo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Logo Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo-url">Logo URL</Label>
                <Input
                  id="logo-url"
                  value={currentConfig.logo.src}
                  onChange={(e) => updateLogo({ src: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo-alt">Logo Alt Text</Label>
                <Input
                  id="logo-alt"
                  value={currentConfig.logo.alt}
                  onChange={(e) => updateLogo({ alt: e.target.value })}
                  placeholder="Your Organization logo"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-width">Width (px)</Label>
                  <Input
                    id="logo-width"
                    type="number"
                    value={currentConfig.logo.width}
                    onChange={(e) => updateLogo({ width: parseInt(e.target.value) || 28 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-height">Height (px)</Label>
                  <Input
                    id="logo-height"
                    type="number"
                    value={currentConfig.logo.height}
                    onChange={(e) => updateLogo({ height: parseInt(e.target.value) || 28 })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo-initials">Fallback Initials</Label>
                <Input
                  id="logo-initials"
                  value={currentConfig.logo.initials}
                  onChange={(e) => updateLogo({ initials: e.target.value.toUpperCase() })}
                  placeholder="CH"
                  maxLength={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fallback-bg">Fallback Background</Label>
                <Input
                  id="fallback-bg"
                  value={currentConfig.logo.fallbackBgColor}
                  onChange={(e) => updateLogo({ fallbackBgColor: e.target.value })}
                  placeholder="from-blue-600 to-indigo-600"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Presets Tab */}
        <TabsContent value="presets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Brand Presets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(BRAND_PRESETS).map(([presetName, preset]) => (
                  <div
                    key={presetName}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      currentConfig.presetName === presetName
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => loadPreset(presetName)}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-8 h-8 rounded bg-gradient-to-br ${preset.logo.fallbackBgColor} flex items-center justify-center text-white text-xs font-bold`}>
                        {preset.logo.initials}
                      </div>
                      <div>
                        <h4 className="font-medium">{preset.brandName.appName}</h4>
                        <p className="text-xs text-muted-foreground">{preset.brandName.organizationName}</p>
                      </div>
                    </div>
                    <Badge variant={presetName === 'default' ? 'default' : 'secondary'} className="text-xs">
                      {presetName}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={exportConfiguration}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Configuration
                </Button>
                
                <label className="cursor-pointer">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4" />
                      Import Configuration
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importConfiguration}
                    className="hidden"
                  />
                </label>
                
                <Button
                  variant="outline"
                  onClick={resetToDefault}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to Default
                </Button>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Configuration JSON</h4>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(currentConfig, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              Unsaved Changes
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'Hide Preview' : 'Show Preview'}
          </Button>
          
          <Button
            onClick={saveConfiguration}
            disabled={isSaving || validationErrors.length > 0}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>
    </div>
  );
}
