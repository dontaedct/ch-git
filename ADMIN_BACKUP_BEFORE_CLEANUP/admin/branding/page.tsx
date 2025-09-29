'use client';

/**
 * Client Branding Management Interface
 *
 * Comprehensive admin interface for managing client branding configurations,
 * white-labeling settings, and theme generation.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { BrandAssetManager } from '@/components/branding/brand-asset-manager';
import {
  whiteLabelBranding,
  type ClientBranding,
  type BrandValidation,
  type BrandingPreset
} from '@/lib/branding/white-label-manager';
import {
  themeGenerator,
  dynamicThemes,
  type GeneratedTheme,
  type ThemeValidation
} from '@/lib/branding/theme-generator';
import {
  Palette,
  Save,
  Download,
  Upload,
  Copy,
  Trash2,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  Plus,
  Edit,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Lock,
  Users,
  BarChart3,
  Zap,
  Star,
  Layers,
  Paintbrush
} from 'lucide-react';

interface BrandingPageState {
  selectedBranding: ClientBranding | null;
  brandings: ClientBranding[];
  selectedPreset: string | null;
  editMode: boolean;
  validation: BrandValidation | null;
  generatedTheme: GeneratedTheme | null;
  themeValidation: ThemeValidation | null;
  unsavedChanges: boolean;
  previewMode: 'desktop' | 'tablet' | 'mobile';
}

export default function BrandingManagementPage() {
  const [state, setState] = useState<BrandingPageState>({
    selectedBranding: null,
    brandings: [],
    selectedPreset: null,
    editMode: false,
    validation: null,
    generatedTheme: null,
    themeValidation: null,
    unsavedChanges: false,
    previewMode: 'desktop'
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'visual' | 'assets' | 'theme' | 'advanced'>('overview');
  const presets = whiteLabelBranding.getPresets();

  useEffect(() => {
    // In a real app, this would load from API
    const mockBrandings: ClientBranding[] = [];
    setState(prev => ({ ...prev, brandings: mockBrandings }));
  }, []);

  const handleCreateFromPreset = (presetId: string) => {
    try {
      const preset = presets.find(p => p.id === presetId);
      if (!preset) return;

      const newBranding = whiteLabelBranding.createFromPreset(presetId, {
        client_id: 'demo-client',
        template_id: 'demo-template',
        company_name: 'Demo Company'
      });

      setState(prev => ({
        ...prev,
        selectedBranding: newBranding,
        selectedPreset: presetId,
        editMode: true,
        validation: whiteLabelBranding.validate(newBranding),
        unsavedChanges: true
      }));

      generateTheme(newBranding);
    } catch (error) {
      alert(`Error creating branding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBrandingSelect = (branding: ClientBranding) => {
    if (state.unsavedChanges) {
      if (!confirm('You have unsaved changes. Continue?')) {
        return;
      }
    }

    setState(prev => ({
      ...prev,
      selectedBranding: branding,
      editMode: false,
      validation: whiteLabelBranding.validate(branding),
      unsavedChanges: false
    }));

    generateTheme(branding);
  };

  const generateTheme = (branding: ClientBranding) => {
    try {
      const theme = dynamicThemes.generate(branding);
      const validation = dynamicThemes.validate(theme);

      setState(prev => ({
        ...prev,
        generatedTheme: theme,
        themeValidation: validation
      }));
    } catch (error) {
      console.error('Error generating theme:', error);
    }
  };

  const handleSaveBranding = async () => {
    if (!state.selectedBranding) return;

    try {
      let savedBranding: ClientBranding;

      if (state.brandings.find(b => b.id === state.selectedBranding!.id)) {
        // Update existing
        savedBranding = whiteLabelBranding.update(state.selectedBranding.id, state.selectedBranding);
      } else {
        // Create new
        const { id, created_at, updated_at, version, ...brandingData } = state.selectedBranding;
        savedBranding = whiteLabelBranding.create(brandingData);
      }

      setState(prev => ({
        ...prev,
        selectedBranding: savedBranding,
        editMode: false,
        validation: whiteLabelBranding.validate(savedBranding),
        unsavedChanges: false,
        brandings: prev.brandings.some(b => b.id === savedBranding.id)
          ? prev.brandings.map(b => b.id === savedBranding.id ? savedBranding : b)
          : [...prev.brandings, savedBranding]
      }));

      generateTheme(savedBranding);
      alert('Branding saved successfully!');
    } catch (error) {
      alert(`Error saving branding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const updateBrandingField = (field: string, value: any) => {
    if (!state.selectedBranding) return;

    const updatedBranding = { ...state.selectedBranding };

    // Handle nested field updates
    if (field.includes('.')) {
      const parts = field.split('.');
      let current: any = updatedBranding;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }

      current[parts[parts.length - 1]] = value;
    } else {
      (updatedBranding as any)[field] = value;
    }

    setState(prev => ({
      ...prev,
      selectedBranding: updatedBranding,
      validation: whiteLabelBranding.validate(updatedBranding),
      unsavedChanges: true
    }));

    // Regenerate theme on color or typography changes
    if (field.includes('color_palette') || field.includes('typography')) {
      generateTheme(updatedBranding);
    }
  };

  const handleAssetUpload = (asset: any) => {
    // This would typically trigger a re-render or update
    console.log('Asset uploaded:', asset);
  };

  const getValidationSummary = () => {
    if (!state.validation) return null;

    return (
      <Card className={`mb-6 ${state.validation.is_valid ? 'border-green-200' : 'border-red-200'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {state.validation.is_valid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                Quality Score: {state.validation.quality_score}/100
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={state.validation.is_valid ? 'default' : 'destructive'}>
                {state.validation.is_valid ? 'Valid' : 'Invalid'}
              </Badge>
              {state.validation.compliance_score < 100 && (
                <Badge variant="outline">
                  Compliance: {state.validation.compliance_score}/100
                </Badge>
              )}
            </div>
          </div>

          {state.validation.errors.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-red-600 mb-2">Errors:</h4>
              <ul className="text-sm text-red-600 space-y-1">
                {state.validation.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {state.validation.warnings.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-600 mb-2">Warnings:</h4>
              <ul className="text-sm text-yellow-600 space-y-1">
                {state.validation.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const getThemeValidationSummary = () => {
    if (!state.themeValidation) return null;

    return (
      <Card className={`mb-4 ${state.themeValidation.is_accessible ? 'border-green-200' : 'border-yellow-200'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {state.themeValidation.is_accessible ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              <span className="font-medium">Theme Quality</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                Readability: {state.themeValidation.readability_score}/100
              </Badge>
              <Badge variant="outline">
                Harmony: {state.themeValidation.color_harmony_score}/100
              </Badge>
            </div>
          </div>

          {state.themeValidation.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-blue-600 mb-2">Recommendations:</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                {state.themeValidation.recommendations.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Branding</h1>
          <p className="text-gray-600 mt-2">
            Manage white-labeling, brand assets, and visual identity for your clients.
          </p>
        </div>
        <div className="space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Branding
          </Button>
        </div>
      </div>

      {state.selectedBranding ? (
        <div className="space-y-6">
          {/* Validation Summary */}
          {getValidationSummary()}

          {/* Branding Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{state.selectedBranding.company_name}</span>
                    {state.editMode && (
                      <Badge variant="outline">Editing</Badge>
                    )}
                    {state.selectedBranding.is_active && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {state.selectedBranding.company_description || 'No description provided'}
                  </CardDescription>
                </div>
                <div className="space-x-2">
                  {state.editMode ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setState(prev => ({ ...prev, editMode: false, unsavedChanges: false }))}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveBranding}
                        disabled={!state.validation?.is_valid}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setState(prev => ({ ...prev, editMode: true }))}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Configuration Tabs */}
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="visual">Visual Identity</TabsTrigger>
              <TabsTrigger value="assets">Brand Assets</TabsTrigger>
              <TabsTrigger value="theme">Theme & Preview</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Company Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Company Name</Label>
                      <input
                        type="text"
                        value={state.selectedBranding.company_name}
                        onChange={(e) => updateBrandingField('company_name', e.target.value)}
                        disabled={!state.editMode}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <Label>Tagline</Label>
                      <input
                        type="text"
                        value={state.selectedBranding.company_tagline || ''}
                        onChange={(e) => updateBrandingField('company_tagline', e.target.value)}
                        disabled={!state.editMode}
                        placeholder="Your company tagline"
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={state.selectedBranding.company_description || ''}
                        onChange={(e) => updateBrandingField('company_description', e.target.value)}
                        disabled={!state.editMode}
                        placeholder="Describe your company..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Website</Label>
                        <input
                          type="url"
                          value={state.selectedBranding.website_url || ''}
                          onChange={(e) => updateBrandingField('website_url', e.target.value)}
                          disabled={!state.editMode}
                          placeholder="https://example.com"
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label>Contact Email</Label>
                        <input
                          type="email"
                          value={state.selectedBranding.contact_email || ''}
                          onChange={(e) => updateBrandingField('contact_email', e.target.value)}
                          disabled={!state.editMode}
                          placeholder="contact@example.com"
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* White-Label Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      White-Label Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Hide "Powered By"</Label>
                        <p className="text-sm text-gray-600">Remove attribution text</p>
                      </div>
                      <Switch
                        checked={state.selectedBranding.white_label_config.hide_powered_by}
                        onCheckedChange={(checked) =>
                          updateBrandingField('white_label_config.hide_powered_by', checked)
                        }
                        disabled={!state.editMode}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Hide Company Branding</Label>
                        <p className="text-sm text-gray-600">Remove our branding entirely</p>
                      </div>
                      <Switch
                        checked={state.selectedBranding.white_label_config.hide_company_branding}
                        onCheckedChange={(checked) =>
                          updateBrandingField('white_label_config.hide_company_branding', checked)
                        }
                        disabled={!state.editMode}
                      />
                    </div>

                    <div>
                      <Label>Custom Domain</Label>
                      <input
                        type="text"
                        value={state.selectedBranding.white_label_config.custom_domain || ''}
                        onChange={(e) => updateBrandingField('white_label_config.custom_domain', e.target.value)}
                        disabled={!state.editMode}
                        placeholder="app.yourcompany.com"
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <Label>Support Email</Label>
                      <input
                        type="email"
                        value={state.selectedBranding.white_label_config.support_email || ''}
                        onChange={(e) => updateBrandingField('white_label_config.support_email', e.target.value)}
                        disabled={!state.editMode}
                        placeholder="support@yourcompany.com"
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status and Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Status & Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <div className="font-medium">
                        {state.selectedBranding.is_active ? 'Active' : 'Draft'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Version:</span>
                      <div className="font-medium">{state.selectedBranding.version}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <div className="font-medium">
                        {new Date(state.selectedBranding.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Updated:</span>
                      <div className="font-medium">
                        {new Date(state.selectedBranding.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visual" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Color Palette */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Palette className="h-5 w-5 mr-2" />
                      Color Palette
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(state.selectedBranding.color_palette).map(([colorName, colorValue]) => (
                        <div key={colorName}>
                          <Label className="capitalize">{colorName.replace('_', ' ')}</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <input
                              type="color"
                              value={colorValue}
                              onChange={(e) => updateBrandingField(`color_palette.${colorName}`, e.target.value)}
                              disabled={!state.editMode}
                              className="w-12 h-8 border border-gray-300 rounded"
                            />
                            <input
                              type="text"
                              value={colorValue}
                              onChange={(e) => updateBrandingField(`color_palette.${colorName}`, e.target.value)}
                              disabled={!state.editMode}
                              className="flex-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50 text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Typography */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Paintbrush className="h-5 w-5 mr-2" />
                      Typography
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Primary Font Family</Label>
                      <input
                        type="text"
                        value={state.selectedBranding.typography.primary_font_family}
                        onChange={(e) => updateBrandingField('typography.primary_font_family', e.target.value)}
                        disabled={!state.editMode}
                        placeholder="Inter, sans-serif"
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <Label>Secondary Font Family</Label>
                      <input
                        type="text"
                        value={state.selectedBranding.typography.secondary_font_family}
                        onChange={(e) => updateBrandingField('typography.secondary_font_family', e.target.value)}
                        disabled={!state.editMode}
                        placeholder="Georgia, serif"
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Heading Weight</Label>
                        <input
                          type="number"
                          min="100"
                          max="900"
                          step="100"
                          value={state.selectedBranding.typography.heading_font_weight}
                          onChange={(e) => updateBrandingField('typography.heading_font_weight', parseInt(e.target.value))}
                          disabled={!state.editMode}
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label>Body Weight</Label>
                        <input
                          type="number"
                          min="100"
                          max="900"
                          step="100"
                          value={state.selectedBranding.typography.body_font_weight}
                          onChange={(e) => updateBrandingField('typography.body_font_weight', parseInt(e.target.value))}
                          disabled={!state.editMode}
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Social Media Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(state.selectedBranding.social_links).map(([platform, url]) => (
                      <div key={platform}>
                        <Label className="capitalize">{platform}</Label>
                        <input
                          type="url"
                          value={url || ''}
                          onChange={(e) => updateBrandingField(`social_links.${platform}`, e.target.value)}
                          disabled={!state.editMode}
                          placeholder={`https://${platform}.com/yourcompany`}
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assets" className="space-y-6">
              <BrandAssetManager
                branding={state.selectedBranding}
                onBrandingUpdate={(updates) => {
                  setState(prev => ({
                    ...prev,
                    selectedBranding: prev.selectedBranding ? { ...prev.selectedBranding, ...updates } : null,
                    unsavedChanges: true
                  }));
                }}
                onAssetUpload={handleAssetUpload}
                allowEditing={state.editMode}
              />
            </TabsContent>

            <TabsContent value="theme" className="space-y-6">
              {/* Theme Validation */}
              {getThemeValidationSummary()}

              {/* Preview Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Theme Preview
                  </CardTitle>
                  <CardDescription>
                    Preview your branding across different devices and contexts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={state.previewMode === 'desktop' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setState(prev => ({ ...prev, previewMode: 'desktop' }))}
                      >
                        <Monitor className="h-4 w-4 mr-2" />
                        Desktop
                      </Button>
                      <Button
                        variant={state.previewMode === 'tablet' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setState(prev => ({ ...prev, previewMode: 'tablet' }))}
                      >
                        <Tablet className="h-4 w-4 mr-2" />
                        Tablet
                      </Button>
                      <Button
                        variant={state.previewMode === 'mobile' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setState(prev => ({ ...prev, previewMode: 'mobile' }))}
                      >
                        <Smartphone className="h-4 w-4 mr-2" />
                        Mobile
                      </Button>
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSS
                    </Button>
                  </div>

                  {/* Preview Area */}
                  <div className={`border rounded-lg overflow-hidden ${
                    state.previewMode === 'desktop' ? 'max-w-full' :
                    state.previewMode === 'tablet' ? 'max-w-2xl mx-auto' :
                    'max-w-sm mx-auto'
                  }`}>
                    <div
                      className="p-6 min-h-96"
                      style={{
                        backgroundColor: state.selectedBranding.color_palette.background,
                        color: state.selectedBranding.color_palette.text_primary,
                        fontFamily: state.selectedBranding.typography.primary_font_family
                      }}
                    >
                      {/* Mock content */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                          {state.selectedBranding.logo_primary && (
                            <img
                              src={state.selectedBranding.logo_primary.url}
                              alt="Logo"
                              className="h-12 object-contain"
                            />
                          )}
                          <div>
                            <h1
                              className="text-2xl font-bold"
                              style={{
                                color: state.selectedBranding.color_palette.primary,
                                fontWeight: state.selectedBranding.typography.heading_font_weight
                              }}
                            >
                              {state.selectedBranding.company_name}
                            </h1>
                            {state.selectedBranding.company_tagline && (
                              <p className="text-sm" style={{ color: state.selectedBranding.color_palette.text_secondary }}>
                                {state.selectedBranding.company_tagline}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <button
                            className="px-4 py-2 rounded-md font-medium"
                            style={{
                              backgroundColor: state.selectedBranding.color_palette.primary,
                              color: '#FFFFFF'
                            }}
                          >
                            Primary Button
                          </button>

                          <button
                            className="px-4 py-2 rounded-md font-medium border"
                            style={{
                              borderColor: state.selectedBranding.color_palette.primary,
                              color: state.selectedBranding.color_palette.primary
                            }}
                          >
                            Secondary Button
                          </button>

                          <div
                            className="p-4 rounded-lg"
                            style={{ backgroundColor: state.selectedBranding.color_palette.surface }}
                          >
                            <h3
                              className="font-semibold mb-2"
                              style={{ color: state.selectedBranding.color_palette.text_primary }}
                            >
                              Sample Card
                            </h3>
                            <p style={{ color: state.selectedBranding.color_palette.text_secondary }}>
                              This is how your content will look with the current color palette and typography settings.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generated Theme Details */}
              {state.generatedTheme && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Layers className="h-5 w-5 mr-2" />
                      Generated Theme
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">CSS Variables:</span>
                        <div className="font-medium">
                          {Object.keys(state.generatedTheme.css_variables).length}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Color Scales:</span>
                        <div className="font-medium">
                          {Object.keys(state.generatedTheme.design_tokens.colors).length}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Generated:</span>
                        <div className="font-medium">
                          {new Date(state.generatedTheme.generated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              {/* Customization Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Customization Permissions
                  </CardTitle>
                  <CardDescription>
                    Control what aspects of the branding clients can modify
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(state.selectedBranding.white_label_config.allowed_customizations).map(([permission, allowed]) => (
                    <div key={permission} className="flex items-center justify-between">
                      <div>
                        <Label className="capitalize">{permission.replace('_', ' ')}</Label>
                        <p className="text-sm text-gray-600">
                          Allow clients to modify {permission.replace('_', ' ').toLowerCase()}
                        </p>
                      </div>
                      <Switch
                        checked={allowed}
                        onCheckedChange={(checked) =>
                          updateBrandingField(`white_label_config.allowed_customizations.${permission}`, checked)
                        }
                        disabled={!state.editMode}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Compliance Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Compliance Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>GDPR Compliance</Label>
                      <p className="text-sm text-gray-600">Enable GDPR compliance features</p>
                    </div>
                    <Switch
                      checked={state.selectedBranding.white_label_config.gdpr_compliance}
                      onCheckedChange={(checked) =>
                        updateBrandingField('white_label_config.gdpr_compliance', checked)
                      }
                      disabled={!state.editMode}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>CCPA Compliance</Label>
                      <p className="text-sm text-gray-600">Enable CCPA compliance features</p>
                    </div>
                    <Switch
                      checked={state.selectedBranding.white_label_config.ccpa_compliance}
                      onCheckedChange={(checked) =>
                        updateBrandingField('white_label_config.ccpa_compliance', checked)
                      }
                      disabled={!state.editMode}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Accessibility Compliance</Label>
                      <p className="text-sm text-gray-600">Enable accessibility features</p>
                    </div>
                    <Switch
                      checked={state.selectedBranding.white_label_config.accessibility_compliance}
                      onCheckedChange={(checked) =>
                        updateBrandingField('white_label_config.accessibility_compliance', checked)
                      }
                      disabled={!state.editMode}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Custom CSS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Custom CSS
                  </CardTitle>
                  <CardDescription>
                    Add custom CSS for advanced styling (use with caution)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={state.selectedBranding.custom_css || ''}
                    onChange={(e) => updateBrandingField('custom_css', e.target.value)}
                    disabled={!state.editMode}
                    placeholder="/* Custom CSS styles */"
                    rows={8}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Branding Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Quick Start with Presets
              </CardTitle>
              <CardDescription>
                Choose a preset to get started quickly, then customize to match your brand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {presets.map((preset) => (
                  <Card
                    key={preset.id}
                    className="cursor-pointer transition-all hover:shadow-md hover:scale-105"
                    onClick={() => handleCreateFromPreset(preset.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Color Preview */}
                        <div className="flex space-x-1">
                          <div
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: preset.base_colors.primary }}
                          />
                          <div
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: preset.base_colors.secondary }}
                          />
                          <div
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: preset.base_colors.accent }}
                          />
                        </div>

                        <div>
                          <h3 className="font-medium">{preset.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {preset.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {preset.style}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {preset.industry}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Create from Scratch */}
          <Card>
            <CardContent className="p-8 text-center">
              <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Create Custom Branding
              </h3>
              <p className="text-gray-600 mb-4">
                Start with a blank canvas and build your brand identity from scratch.
              </p>
              <Button onClick={() => handleCreateFromPreset('minimal-modern')}>
                <Plus className="h-4 w-4 mr-2" />
                Create from Scratch
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}