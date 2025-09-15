/**
 * @fileoverview HT-022.4.1: Simple Customization Wizard
 * @module components/ui/atomic/customization
 * @author Agency Component System
 * @version 1.0.0
 *
 * SIMPLE CUSTOMIZATION WIZARD: ≤4 hour client branding tool
 * Features:
 * - Step-by-step client branding workflow
 * - Preset-based customization
 * - Real-time preview
 * - Quick export and deployment
 * - Quality assurance automation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSimpleTheme, createSimpleTheme, type SimpleClientTheme } from '../theming/simple-theme-provider';
import { brandPresetManager, type BrandPreset, type PresetCustomization } from '@/lib/branding/preset-manager';
import { Button, Input, Label } from '../atoms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../molecules';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../molecules';
import { Badge } from '../atoms';
import {
  Wand2,
  Palette,
  Image,
  Type,
  Save,
  Eye,
  Download,
  Check,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Clock,
  Zap
} from 'lucide-react';

interface CustomizationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface ClientCustomizationData {
  clientName: string;
  industry: string;
  selectedPreset?: BrandPreset;
  customizations: PresetCustomization;
  finalTheme?: SimpleClientTheme;
  estimatedTime: number;
}

interface SimpleCustomizationWizardProps {
  onComplete?: (theme: SimpleClientTheme, exportData: any) => void;
  className?: string;
}

export function SimpleCustomizationWizard({
  onComplete,
  className
}: SimpleCustomizationWizardProps) {
  const { addCustomTheme, switchTheme } = useSimpleTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [clientData, setClientData] = useState<ClientCustomizationData>({
    clientName: '',
    industry: 'Technology',
    customizations: {},
    estimatedTime: 0
  });

  const steps: CustomizationStep[] = [
    {
      id: 'client-info',
      title: 'Client Information',
      description: 'Basic client details and industry',
      icon: <Wand2 className="h-5 w-5" />,
      completed: Boolean(clientData.clientName && clientData.industry)
    },
    {
      id: 'preset-selection',
      title: 'Brand Preset',
      description: 'Choose industry template',
      icon: <Palette className="h-5 w-5" />,
      completed: Boolean(clientData.selectedPreset)
    },
    {
      id: 'customization',
      title: 'Brand Customization',
      description: 'Colors, logo, and typography',
      icon: <Sparkles className="h-5 w-5" />,
      completed: Boolean(clientData.customizations.primaryColor)
    },
    {
      id: 'preview-export',
      title: 'Preview & Export',
      description: 'Final review and deployment',
      icon: <Eye className="h-5 w-5" />,
      completed: Boolean(clientData.finalTheme)
    }
  ];

  // Calculate estimated time based on customizations
  useEffect(() => {
    let time = 30; // Base time: 30 minutes

    if (clientData.customizations.primaryColor) time += 15;
    if (clientData.customizations.customLogo) time += 30;
    if (clientData.customizations.fontFamily) time += 15;
    if (clientData.customizations.organizationName) time += 10;

    setClientData(prev => ({ ...prev, estimatedTime: time }));
  }, [clientData.customizations]);

  const updateClientData = (updates: Partial<ClientCustomizationData>) => {
    setClientData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateFinalTheme = () => {
    if (!clientData.selectedPreset) return;

    const preset = clientData.selectedPreset;
    const customizations = clientData.customizations;

    // Create theme based on preset and customizations
    const finalTheme = createSimpleTheme(
      `client-${Date.now()}`,
      customizations.organizationName || clientData.clientName,
      customizations.primaryColor || preset.palette.primary,
      clientData.clientName.substring(0, 2).toUpperCase(),
      customizations.fontFamily || preset.typography.fontFamily
    );

    // Apply logo if provided
    if (customizations.customLogo) {
      finalTheme.logo.src = customizations.customLogo;
    }

    updateClientData({ finalTheme });
    addCustomTheme(finalTheme);
    switchTheme(finalTheme.id);

    return finalTheme;
  };

  const exportCustomization = () => {
    if (!clientData.finalTheme) return null;

    const exportData = {
      clientName: clientData.clientName,
      industry: clientData.industry,
      theme: clientData.finalTheme,
      presetUsed: clientData.selectedPreset?.id,
      customizations: clientData.customizations,
      exportedAt: new Date().toISOString(),
      estimatedImplementationTime: clientData.estimatedTime,
      deploymentInstructions: {
        theme: 'Apply theme using SimpleThemeProvider',
        components: 'Use atomic components with theme context',
        testing: 'Verify accessibility and performance targets',
        deployment: 'Export configuration and implement'
      }
    };

    // Create downloadable JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${clientData.clientName.toLowerCase().replace(/\s+/g, '-')}-brand-config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onComplete?.(clientData.finalTheme, exportData);
    return exportData;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Simple Customization Wizard</CardTitle>
            <CardDescription>
              Create client brands in ≤4 hours with guided customization
            </CardDescription>
          </div>
        </div>

        {clientData.estimatedTime > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Estimated time: {clientData.estimatedTime} minutes</span>
            <Badge variant={clientData.estimatedTime <= 240 ? "default" : "secondary"}>
              {clientData.estimatedTime <= 240 ? "On Target" : "Extended"}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 ${
                index === currentStep
                  ? 'text-primary font-medium'
                  : step.completed
                    ? 'text-green-600'
                    : 'text-muted-foreground'
              }`}
            >
              <div className={`p-2 rounded-full border ${
                index === currentStep
                  ? 'border-primary bg-primary/10'
                  : step.completed
                    ? 'border-green-600 bg-green-600/10'
                    : 'border-muted bg-muted/50'
              }`}>
                {step.completed ? <Check className="h-4 w-4" /> : step.icon}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="border-t pt-6">
          {/* Step 1: Client Information */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Wand2 className="h-12 w-12 mx-auto text-primary mb-2" />
                <h3 className="text-lg font-semibold">Client Information</h3>
                <p className="text-sm text-muted-foreground">
                  Tell us about your client to get started
                </p>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input
                    id="client-name"
                    value={clientData.clientName}
                    onChange={(e) => updateClientData({ clientName: e.target.value })}
                    placeholder="Enter client name"
                  />
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <select
                    id="industry"
                    value={clientData.industry}
                    onChange={(e) => updateClientData({ industry: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Creative">Creative</option>
                    <option value="Retail">Retail</option>
                    <option value="Education">Education</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Preset Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Palette className="h-12 w-12 mx-auto text-primary mb-2" />
                <h3 className="text-lg font-semibold">Choose Brand Preset</h3>
                <p className="text-sm text-muted-foreground">
                  Select an industry template to start with
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {brandPresetManager.getAvailablePresets().map((preset) => (
                  <div
                    key={preset.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      clientData.selectedPreset?.id === preset.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => updateClientData({ selectedPreset: preset })}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: preset.palette.primary }}
                      >
                        {preset.logo.initials}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{preset.name}</h4>
                        <p className="text-sm text-muted-foreground">{preset.industry}</p>
                      </div>
                      {clientData.selectedPreset?.id === preset.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {preset.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Customization */}
          {currentStep === 2 && clientData.selectedPreset && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Sparkles className="h-12 w-12 mx-auto text-primary mb-2" />
                <h3 className="text-lg font-semibold">Customize Brand</h3>
                <p className="text-sm text-muted-foreground">
                  Personalize colors, logo, and typography
                </p>
              </div>

              <Tabs defaultValue="colors" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="logo">Logo</TabsTrigger>
                  <TabsTrigger value="typography">Type</TabsTrigger>
                </TabsList>

                <TabsContent value="colors" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="org-name">Organization Name</Label>
                      <Input
                        id="org-name"
                        value={clientData.customizations.organizationName || ''}
                        onChange={(e) => updateClientData({
                          customizations: {
                            ...clientData.customizations,
                            organizationName: e.target.value
                          }
                        })}
                        placeholder={clientData.clientName}
                      />
                    </div>

                    <div>
                      <Label htmlFor="app-name">App Name</Label>
                      <Input
                        id="app-name"
                        value={clientData.customizations.appName || ''}
                        onChange={(e) => updateClientData({
                          customizations: {
                            ...clientData.customizations,
                            appName: e.target.value
                          }
                        })}
                        placeholder={clientData.selectedPreset.brandName.appName}
                      />
                    </div>

                    <div>
                      <Label htmlFor="primary-color">Primary Brand Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="primary-color"
                          value={clientData.customizations.primaryColor || clientData.selectedPreset.palette.primary}
                          onChange={(e) => updateClientData({
                            customizations: {
                              ...clientData.customizations,
                              primaryColor: e.target.value
                            }
                          })}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={clientData.customizations.primaryColor || clientData.selectedPreset.palette.primary}
                          onChange={(e) => updateClientData({
                            customizations: {
                              ...clientData.customizations,
                              primaryColor: e.target.value
                            }
                          })}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="logo" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="custom-logo">Logo URL (Optional)</Label>
                      <Input
                        id="custom-logo"
                        value={clientData.customizations.customLogo || ''}
                        onChange={(e) => updateClientData({
                          customizations: {
                            ...clientData.customizations,
                            customLogo: e.target.value
                          }
                        })}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Logo Preview</h4>
                      <div className="flex items-center gap-2">
                        {clientData.customizations.customLogo ? (
                          <img
                            src={clientData.customizations.customLogo}
                            alt={`${clientData.clientName} Logo`}
                            className="w-10 h-10 object-contain border rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{
                              backgroundColor: clientData.customizations.primaryColor || clientData.selectedPreset.palette.primary
                            }}
                          >
                            {clientData.clientName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm">
                          {clientData.customizations.organizationName || clientData.clientName}
                        </span>
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
                        value={clientData.customizations.fontFamily || clientData.selectedPreset.typography.fontFamily}
                        onChange={(e) => updateClientData({
                          customizations: {
                            ...clientData.customizations,
                            fontFamily: e.target.value
                          }
                        })}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      >
                        <option value="Inter, system-ui, sans-serif">Inter (Default)</option>
                        <option value="system-ui, sans-serif">System UI</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Helvetica, sans-serif">Helvetica</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Times, serif">Times</option>
                      </select>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Typography Preview</h4>
                      <div style={{
                        fontFamily: clientData.customizations.fontFamily || clientData.selectedPreset.typography.fontFamily
                      }}>
                        <h3 className="text-lg font-bold mb-2">
                          {clientData.customizations.organizationName || clientData.clientName}
                        </h3>
                        <p className="text-sm mb-2">
                          This is how your content will appear with the selected font family.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Step 4: Preview & Export */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Eye className="h-12 w-12 mx-auto text-primary mb-2" />
                <h3 className="text-lg font-semibold">Preview & Export</h3>
                <p className="text-sm text-muted-foreground">
                  Final review and deployment preparation
                </p>
              </div>

              {!clientData.finalTheme && (
                <Button onClick={generateFinalTheme} className="w-full mb-4">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Final Theme
                </Button>
              )}

              {clientData.finalTheme && (
                <div className="space-y-4">
                  {/* Theme Preview */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b">
                      {clientData.finalTheme.logo.src ? (
                        <img
                          src={clientData.finalTheme.logo.src}
                          alt={clientData.finalTheme.logo.alt}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: clientData.finalTheme.colors.primary }}
                        >
                          {clientData.finalTheme.logo.initials}
                        </div>
                      )}
                      <h3
                        className="font-semibold"
                        style={{ fontFamily: clientData.finalTheme.typography.fontFamily }}
                      >
                        {clientData.finalTheme.name}
                      </h3>
                      <Badge variant="secondary">Live Preview</Badge>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 rounded-md text-white font-medium text-sm"
                        style={{ backgroundColor: clientData.finalTheme.colors.primary }}
                      >
                        Primary Button
                      </button>
                      <button
                        className="px-4 py-2 rounded-md border text-sm"
                        style={{
                          borderColor: clientData.finalTheme.colors.primary,
                          color: clientData.finalTheme.colors.primary
                        }}
                      >
                        Secondary
                      </button>
                    </div>

                    <div style={{ fontFamily: clientData.finalTheme.typography.fontFamily }}>
                      <h4 className="font-medium mb-2">Content Example</h4>
                      <p className="text-sm text-muted-foreground">
                        This is how content will appear with the final theme applied.
                      </p>
                    </div>
                  </div>

                  {/* Export Actions */}
                  <div className="flex gap-2">
                    <Button onClick={exportCustomization} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Export Configuration
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.print()}
                    >
                      Print Preview
                    </Button>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 border rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {clientData.estimatedTime}min
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Setup Time
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {Object.keys(clientData.customizations).length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Customizations
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        Ready
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Status
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={previousStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={nextStep}
              disabled={!steps[currentStep].completed}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (clientData.finalTheme) {
                  exportCustomization();
                }
              }}
              disabled={!clientData.finalTheme}
            >
              Complete
              <Check className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}