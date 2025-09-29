'use client';

/**
 * Template Configuration Admin Interface
 *
 * Comprehensive admin interface for managing universal template configurations,
 * industry settings, and template customization options.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { IndustrySelector } from '@/components/templates/industry-selector';
import {
  universalTemplates,
  type UniversalTemplateConfig,
  type TemplateValidation
} from '@/lib/templates/universal-config';
import {
  industryConfigs,
  type IndustryConfig
} from '@/lib/templates/industry-configs';
import {
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
  Palette,
  FileText,
  Users,
  Shield,
  BarChart3
} from 'lucide-react';

interface TemplateConfigPageState {
  selectedTemplate: UniversalTemplateConfig | null;
  templates: UniversalTemplateConfig[];
  selectedIndustry: string;
  editMode: boolean;
  validation: TemplateValidation | null;
  unsavedChanges: boolean;
}

export default function TemplateConfigPage() {
  const [state, setState] = useState<TemplateConfigPageState>({
    selectedTemplate: null,
    templates: [],
    selectedIndustry: 'universal',
    editMode: false,
    validation: null,
    unsavedChanges: false
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'branding' | 'content' | 'features' | 'settings'>('overview');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const templates = universalTemplates.getAll();
    setState(prev => ({ ...prev, templates }));
  };

  const handleIndustrySelect = (industryId: string, config: IndustryConfig) => {
    setState(prev => ({
      ...prev,
      selectedIndustry: industryId,
      unsavedChanges: true
    }));

    // Generate template from industry config
    generateTemplateFromIndustry(industryId);
  };

  const generateTemplateFromIndustry = (industryId: string) => {
    const industryConfig = industryConfigs.get(industryId);
    const templateConfig = industryConfigs.generateTemplate(industryId);

    const newTemplate: Partial<UniversalTemplateConfig> = {
      name: `${industryConfig.name} Template`,
      description: `Customized template for ${industryConfig.name.toLowerCase()} businesses`,
      version: '1.0.0',
      industry: industryId,
      is_active: false,
      tags: [industryId, ...industryConfig.keywords],
      ...templateConfig
    };

    setState(prev => ({
      ...prev,
      selectedTemplate: newTemplate as UniversalTemplateConfig,
      editMode: true,
      unsavedChanges: true
    }));
  };

  const handleTemplateSelect = (template: UniversalTemplateConfig) => {
    if (state.unsavedChanges) {
      if (!confirm('You have unsaved changes. Continue?')) {
        return;
      }
    }

    setState(prev => ({
      ...prev,
      selectedTemplate: template,
      selectedIndustry: template.industry,
      editMode: false,
      validation: universalTemplates.validate(template),
      unsavedChanges: false
    }));
  };

  const handleSaveTemplate = async () => {
    if (!state.selectedTemplate) return;

    try {
      let savedTemplate: UniversalTemplateConfig;

      if (state.selectedTemplate.id) {
        // Update existing template
        savedTemplate = universalTemplates.update(state.selectedTemplate.id, state.selectedTemplate);
      } else {
        // Create new template
        const { id, created_at, updated_at, ...templateData } = state.selectedTemplate as any;
        savedTemplate = universalTemplates.create(templateData);
      }

      setState(prev => ({
        ...prev,
        selectedTemplate: savedTemplate,
        editMode: false,
        validation: universalTemplates.validate(savedTemplate),
        unsavedChanges: false
      }));

      loadTemplates();
      alert('Template saved successfully!');
    } catch (error) {
      alert(`Error saving template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      universalTemplates.delete(templateId);
      loadTemplates();

      if (state.selectedTemplate?.id === templateId) {
        setState(prev => ({
          ...prev,
          selectedTemplate: null,
          editMode: false,
          validation: null,
          unsavedChanges: false
        }));
      }

      alert('Template deleted successfully!');
    } catch (error) {
      alert(`Error deleting template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDuplicateTemplate = (template: UniversalTemplateConfig) => {
    try {
      const duplicated = universalTemplates.duplicate(template.id, `${template.name} (Copy)`);
      loadTemplates();
      handleTemplateSelect(duplicated);
      alert('Template duplicated successfully!');
    } catch (error) {
      alert(`Error duplicating template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const updateTemplateField = (field: string, value: any) => {
    if (!state.selectedTemplate) return;

    const updatedTemplate = { ...state.selectedTemplate };

    // Handle nested field updates
    if (field.includes('.')) {
      const parts = field.split('.');
      let current: any = updatedTemplate;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }

      current[parts[parts.length - 1]] = value;
    } else {
      (updatedTemplate as any)[field] = value;
    }

    setState(prev => ({
      ...prev,
      selectedTemplate: updatedTemplate,
      validation: universalTemplates.validate(updatedTemplate),
      unsavedChanges: true
    }));
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
                Template Quality Score: {state.validation.score}/100
              </span>
            </div>
            <Badge
              variant={state.validation.is_valid ? 'default' : 'destructive'}
            >
              {state.validation.is_valid ? 'Valid' : 'Invalid'}
            </Badge>
          </div>

          {state.validation.errors.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-red-600 mb-2">Errors:</h4>
              <ul className="text-sm text-red-600 space-y-1">
                {state.validation.errors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {state.validation.warnings.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-600 mb-2">Warnings:</h4>
              <ul className="text-sm text-yellow-600 space-y-1">
                {state.validation.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    {warning}
                  </li>
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
          <h1 className="text-3xl font-bold text-gray-900">Template Configuration</h1>
          <p className="text-gray-600 mt-2">
            Manage universal consultation templates and industry-specific configurations.
          </p>
        </div>
        <div className="space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Templates</CardTitle>
              <CardDescription>
                {state.templates.length} configured templates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2 max-h-96 overflow-y-auto p-4">
                {state.templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      state.selectedTemplate?.id === template.id
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm truncate">{template.name}</h3>
                          <Badge
                            variant={template.is_active ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {template.is_active ? 'Active' : 'Draft'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">{template.industry}</span>
                          <div className="space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateTemplate(template);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Configuration */}
        <div className="lg:col-span-3">
          {state.selectedTemplate ? (
            <div className="space-y-6">
              {/* Validation Summary */}
              {getValidationSummary()}

              {/* Template Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{state.selectedTemplate.name}</span>
                        {state.editMode && (
                          <Badge variant="outline">Editing</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {state.selectedTemplate.description}
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
                            onClick={handleSaveTemplate}
                            disabled={!state.validation?.is_valid}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Template
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
                  <TabsTrigger value="branding">Branding</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Info className="h-5 w-5 mr-2" />
                        Template Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Template Name</Label>
                          <input
                            type="text"
                            value={state.selectedTemplate.name}
                            onChange={(e) => updateTemplateField('name', e.target.value)}
                            disabled={!state.editMode}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label>Version</Label>
                          <input
                            type="text"
                            value={state.selectedTemplate.version}
                            onChange={(e) => updateTemplateField('version', e.target.value)}
                            disabled={!state.editMode}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={state.selectedTemplate.description}
                          onChange={(e) => updateTemplateField('description', e.target.value)}
                          disabled={!state.editMode}
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={state.selectedTemplate.is_active}
                          onCheckedChange={(checked) => updateTemplateField('is_active', checked)}
                          disabled={!state.editMode}
                        />
                        <Label>Active Template</Label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Industry Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {state.editMode ? (
                        <IndustrySelector
                          selectedIndustry={state.selectedIndustry}
                          onIndustrySelect={handleIndustrySelect}
                          showDetails={false}
                        />
                      ) : (
                        <div className="text-sm text-gray-600">
                          Industry: <strong>{state.selectedTemplate.industry}</strong>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="branding" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Palette className="h-5 w-5 mr-2" />
                        Visual Branding
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Primary Color</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <input
                              type="color"
                              value={state.selectedTemplate.branding.primary_color}
                              onChange={(e) => updateTemplateField('branding.primary_color', e.target.value)}
                              disabled={!state.editMode}
                              className="w-12 h-8 border border-gray-300 rounded"
                            />
                            <input
                              type="text"
                              value={state.selectedTemplate.branding.primary_color}
                              onChange={(e) => updateTemplateField('branding.primary_color', e.target.value)}
                              disabled={!state.editMode}
                              className="flex-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Secondary Color</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <input
                              type="color"
                              value={state.selectedTemplate.branding.secondary_color}
                              onChange={(e) => updateTemplateField('branding.secondary_color', e.target.value)}
                              disabled={!state.editMode}
                              className="w-12 h-8 border border-gray-300 rounded"
                            />
                            <input
                              type="text"
                              value={state.selectedTemplate.branding.secondary_color}
                              onChange={(e) => updateTemplateField('branding.secondary_color', e.target.value)}
                              disabled={!state.editMode}
                              className="flex-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Accent Color</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <input
                              type="color"
                              value={state.selectedTemplate.branding.accent_color}
                              onChange={(e) => updateTemplateField('branding.accent_color', e.target.value)}
                              disabled={!state.editMode}
                              className="w-12 h-8 border border-gray-300 rounded"
                            />
                            <input
                              type="text"
                              value={state.selectedTemplate.branding.accent_color}
                              onChange={(e) => updateTemplateField('branding.accent_color', e.target.value)}
                              disabled={!state.editMode}
                              className="flex-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Company Name</Label>
                          <input
                            type="text"
                            value={state.selectedTemplate.branding.company_name}
                            onChange={(e) => updateTemplateField('branding.company_name', e.target.value)}
                            disabled={!state.editMode}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label>Font Family</Label>
                          <input
                            type="text"
                            value={state.selectedTemplate.branding.font_family}
                            onChange={(e) => updateTemplateField('branding.font_family', e.target.value)}
                            disabled={!state.editMode}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Landing Page Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Hero Title</Label>
                        <input
                          type="text"
                          value={state.selectedTemplate.content.landing_page.hero_title}
                          onChange={(e) => updateTemplateField('content.landing_page.hero_title', e.target.value)}
                          disabled={!state.editMode}
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <Label>Hero Subtitle</Label>
                        <Textarea
                          value={state.selectedTemplate.content.landing_page.hero_subtitle}
                          onChange={(e) => updateTemplateField('content.landing_page.hero_subtitle', e.target.value)}
                          disabled={!state.editMode}
                          className="mt-1"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>Call to Action</Label>
                        <input
                          type="text"
                          value={state.selectedTemplate.content.landing_page.hero_cta}
                          onChange={(e) => updateTemplateField('content.landing_page.hero_cta', e.target.value)}
                          disabled={!state.editMode}
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="features" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="h-5 w-5 mr-2" />
                        Feature Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(state.selectedTemplate.customization_options.features).map(([feature, enabled]) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <Switch
                              checked={enabled}
                              onCheckedChange={(checked) =>
                                updateTemplateField(`customization_options.features.${feature}`, checked)
                              }
                              disabled={!state.editMode}
                            />
                            <Label className="capitalize">
                              {feature.replace(/_/g, ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Template Restrictions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Max Monthly Consultations</Label>
                          <input
                            type="number"
                            value={state.selectedTemplate.restrictions.max_monthly_consultations}
                            onChange={(e) =>
                              updateTemplateField('restrictions.max_monthly_consultations', parseInt(e.target.value))
                            }
                            disabled={!state.editMode}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label>Max Clients</Label>
                          <input
                            type="number"
                            value={state.selectedTemplate.restrictions.max_clients}
                            onChange={(e) =>
                              updateTemplateField('restrictions.max_clients', parseInt(e.target.value))
                            }
                            disabled={!state.editMode}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Template Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Created:</span>
                          <div className="font-medium">
                            {new Date(state.selectedTemplate.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Updated:</span>
                          <div className="font-medium">
                            {new Date(state.selectedTemplate.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Service Packages:</span>
                          <div className="font-medium">
                            {state.selectedTemplate.service_packages.length}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Tags:</span>
                          <div className="font-medium">
                            {state.selectedTemplate.tags.length}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Template
                </h3>
                <p className="text-gray-600 mb-4">
                  Choose a template from the list to view and edit its configuration.
                </p>
                <Button onClick={() => generateTemplateFromIndustry('universal')}>
                  Create New Template
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}