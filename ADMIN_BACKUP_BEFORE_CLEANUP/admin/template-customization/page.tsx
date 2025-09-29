'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ContentEditor } from '@/components/admin/content-editor';
import { QuestionnaireBuilder } from '@/components/admin/questionnaire-builder';
import { CustomizationEngine, TemplateCustomization } from '@/lib/templates/customization-engine';
import { Save, Undo, Redo, Eye, Download, Upload, Copy, Trash2, Settings, FileText, MessageSquare, Palette, Code } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateCustomizationPageProps {
  searchParams?: {
    templateId?: string;
    customizationId?: string;
    clientId?: string;
  };
}

export default function TemplateCustomizationPage({ searchParams }: TemplateCustomizationPageProps) {
  const [customization, setCustomization] = useState<TemplateCustomization | null>(null);
  const [baseTemplate, setBaseTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('overview');
  const [customizations, setCustomizations] = useState<TemplateCustomization[]>([]);
  const [selectedCustomizationId, setSelectedCustomizationId] = useState<string>('');

  const customizationEngine = new CustomizationEngine();

  useEffect(() => {
    loadData();
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load base template
      if (searchParams?.templateId) {
        // In a real implementation, this would fetch from your API
        const mockTemplate = {
          id: searchParams.templateId,
          name: 'Universal Consultation Template',
          version: '1.0.0',
          config: {
            landing: {
              hero: {
                title: 'Professional Consultation',
                subtitle: 'Get expert advice tailored to your needs'
              }
            },
            questionnaire: {
              questions: [
                {
                  id: 'q1',
                  type: 'text',
                  question: 'What is your primary goal?',
                  required: true
                }
              ]
            }
          }
        };
        setBaseTemplate(mockTemplate);
      }

      // Load existing customization or create new one
      if (searchParams?.customizationId) {
        const existingCustomization = customizationEngine.getCustomization(searchParams.customizationId);
        if (existingCustomization) {
          setCustomization(existingCustomization);
          setSelectedCustomizationId(existingCustomization.id);
        }
      } else if (searchParams?.templateId && searchParams?.clientId) {
        // Create new customization
        const newCustomization = customizationEngine.createCustomization(
          searchParams.templateId,
          searchParams.clientId,
          `Customization for ${searchParams.clientId}`
        );
        setCustomization(newCustomization);
        setSelectedCustomizationId(newCustomization.id);
      }

      // Load all customizations for the template
      if (searchParams?.templateId) {
        const allCustomizations = customizationEngine.getCustomizations(searchParams.templateId);
        setCustomizations(allCustomizations);
      }

    } catch (error) {
      console.error('Error loading template customization data:', error);
      toast.error('Failed to load customization data');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomizationUpdate = (updates: Partial<TemplateCustomization>) => {
    if (!customization) return;

    try {
      const updatedCustomization = customizationEngine.updateCustomization(
        customization.id,
        updates,
        'Manual update via interface'
      );
      setCustomization(updatedCustomization);
      toast.success('Customization updated');
    } catch (error) {
      console.error('Error updating customization:', error);
      toast.error('Failed to update customization');
    }
  };

  const handleSave = async () => {
    if (!customization) return;

    try {
      setSaving(true);
      // In a real implementation, this would save to your database
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Customization saved successfully');
    } catch (error) {
      console.error('Error saving customization:', error);
      toast.error('Failed to save customization');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (!customization || !baseTemplate) return;

    try {
      const previewTemplate = customizationEngine.applyCustomizationToTemplate(
        customization.id,
        baseTemplate.config
      );

      // In a real implementation, this would open a preview window
      console.log('Preview template:', previewTemplate);
      toast.success('Opening preview...');
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate preview');
    }
  };

  const handleExport = () => {
    if (!customization) return;

    try {
      const exportData = customizationEngine.exportCustomization(customization.id);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customization-${customization.name}-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Customization exported');
    } catch (error) {
      console.error('Error exporting customization:', error);
      toast.error('Failed to export customization');
    }
  };

  const handleDuplicate = () => {
    if (!customization) return;

    try {
      const duplicated = customizationEngine.createCustomization(
        customization.templateId,
        customization.clientId,
        `${customization.name} (Copy)`,
        customization
      );
      setCustomization(duplicated);
      setSelectedCustomizationId(duplicated.id);
      setCustomizations(prev => [...prev, duplicated]);
      toast.success('Customization duplicated');
    } catch (error) {
      console.error('Error duplicating customization:', error);
      toast.error('Failed to duplicate customization');
    }
  };

  const handleUndo = () => {
    if (!customization) return;

    try {
      const previousVersion = customizationEngine.revertCustomization(customization.id);
      if (previousVersion) {
        setCustomization(previousVersion);
        toast.success('Changes reverted');
      } else {
        toast.info('No changes to revert');
      }
    } catch (error) {
      console.error('Error reverting customization:', error);
      toast.error('Failed to revert changes');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!customization || !baseTemplate) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">No Customization Found</h2>
              <p className="text-gray-600 mb-4">
                Please select a template and client to begin customization.
              </p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Customization</h1>
          <p className="text-gray-600 mt-1">
            Customize {baseTemplate.name} for {customization.clientId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={customization.status === 'active' ? 'default' : 'secondary'}>
            {customization.status}
          </Badge>
          <Badge variant="outline">
            v{customization.version}
          </Badge>
        </div>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button onClick={handleSave} disabled={saving} size="sm">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={handleUndo} variant="outline" size="sm">
                <Undo className="w-4 h-4 mr-2" />
                Undo
              </Button>
              <Button onClick={handlePreview} variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button onClick={handleDuplicate} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="preview-mode">Preview:</Label>
                <Select value={previewMode} onValueChange={(value: any) => setPreviewMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {customizations.length > 1 && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="customization-select">Version:</Label>
                  <Select value={selectedCustomizationId} onValueChange={setSelectedCustomizationId}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {customizations.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} (v{c.version})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="questionnaire" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Questionnaire
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Branding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customization Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customization-name">Customization Name</Label>
                  <Input
                    id="customization-name"
                    value={customization.name}
                    onChange={(e) => handleCustomizationUpdate({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customization-status">Status</Label>
                  <Select
                    value={customization.status}
                    onValueChange={(value: any) => handleCustomizationUpdate({ status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customization-description">Description</Label>
                <Input
                  id="customization-description"
                  value={customization.description || ''}
                  onChange={(e) => handleCustomizationUpdate({ description: e.target.value })}
                  placeholder="Describe this customization..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium">Template ID</Label>
                  <p className="text-sm text-gray-600">{customization.templateId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Client ID</Label>
                  <p className="text-sm text-gray-600">{customization.clientId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(customization.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label className="text-sm font-medium">Version History</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {customization.versionHistory.slice(-5).reverse().map((version, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <span>v{version.version}</span>
                      <span className="text-gray-600">{version.changeSummary || 'No description'}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(version.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <ContentEditor
            customization={customization}
            onCustomizationUpdate={handleCustomizationUpdate}
            previewMode={previewMode}
            className="min-h-[600px]"
          />
        </TabsContent>

        <TabsContent value="questionnaire">
          <QuestionnaireBuilder
            customization={customization}
            baseQuestionnaire={baseTemplate.config.questionnaire}
            onCustomizationUpdate={handleCustomizationUpdate}
            className="min-h-[600px]"
          />
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Colors</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Label htmlFor="primary-color" className="w-20">Primary</Label>
                      <Input
                        id="primary-color"
                        type="color"
                        value={customization.brandingCustomizations?.colors?.primary || '#0066cc'}
                        onChange={(e) => handleCustomizationUpdate({
                          brandingCustomizations: {
                            ...customization.brandingCustomizations,
                            colors: {
                              ...customization.brandingCustomizations?.colors,
                              primary: e.target.value
                            }
                          }
                        })}
                        className="w-20 h-10"
                      />
                      <span className="text-sm text-gray-600">
                        {customization.brandingCustomizations?.colors?.primary || '#0066cc'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="secondary-color" className="w-20">Secondary</Label>
                      <Input
                        id="secondary-color"
                        type="color"
                        value={customization.brandingCustomizations?.colors?.secondary || '#6b7280'}
                        onChange={(e) => handleCustomizationUpdate({
                          brandingCustomizations: {
                            ...customization.brandingCustomizations,
                            colors: {
                              ...customization.brandingCustomizations?.colors,
                              secondary: e.target.value
                            }
                          }
                        })}
                        className="w-20 h-10"
                      />
                      <span className="text-sm text-gray-600">
                        {customization.brandingCustomizations?.colors?.secondary || '#6b7280'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Typography</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="font-family">Font Family</Label>
                      <Select
                        value={customization.brandingCustomizations?.typography?.fontFamily || 'Inter'}
                        onValueChange={(value) => handleCustomizationUpdate({
                          brandingCustomizations: {
                            ...customization.brandingCustomizations,
                            typography: {
                              ...customization.brandingCustomizations?.typography,
                              fontFamily: value
                            }
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Lato">Lato</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Logo & Assets</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo-url">Logo URL</Label>
                    <Input
                      id="logo-url"
                      value={customization.brandingCustomizations?.logo?.url || ''}
                      onChange={(e) => handleCustomizationUpdate({
                        brandingCustomizations: {
                          ...customization.brandingCustomizations,
                          logo: {
                            ...customization.brandingCustomizations?.logo,
                            url: e.target.value
                          }
                        }
                      })}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo-alt">Logo Alt Text</Label>
                    <Input
                      id="logo-alt"
                      value={customization.brandingCustomizations?.logo?.alt || ''}
                      onChange={(e) => handleCustomizationUpdate({
                        brandingCustomizations: {
                          ...customization.brandingCustomizations,
                          logo: {
                            ...customization.brandingCustomizations?.logo,
                            alt: e.target.value
                          }
                        }
                      })}
                      placeholder="Company logo"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}