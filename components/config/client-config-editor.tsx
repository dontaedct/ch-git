'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Settings,
  Palette,
  Shield,
  Zap,
  Link2,
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  FileJson,
  Code
} from 'lucide-react';

interface ClientConfig {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  environment: string;
  version: string;
  isActive: boolean;
  configurations: {
    app: AppConfig;
    branding: BrandingConfig;
    features: FeatureConfig;
    integrations: IntegrationConfig;
    security: SecurityConfig;
  };
}

interface AppConfig {
  name: string;
  description: string;
  domain?: string;
  subdomain?: string;
  customDomain?: string;
  ssl: boolean;
  analytics: {
    enabled: boolean;
    trackingId?: string;
    provider: string;
  };
  monitoring: {
    enabled: boolean;
    errorTracking: boolean;
    performanceMonitoring: boolean;
  };
}

interface BrandingConfig {
  logo: {
    url?: string;
    width?: number;
    height?: number;
    alt: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
  typography: {
    primaryFont: string;
    secondaryFont: string;
    headingFont: string;
  };
  theme: string;
  customCss?: string;
  favicon?: string;
}

interface FeatureConfig {
  [featureKey: string]: {
    enabled: boolean;
    config?: any;
    permissions?: string[];
    environments?: string[];
  };
}

interface IntegrationConfig {
  [integrationKey: string]: {
    enabled: boolean;
    apiKey?: string;
    endpoint?: string;
    config: any;
    webhooks?: {
      url: string;
      events: string[];
      secret?: string;
    }[];
  };
}

interface SecurityConfig {
  authentication: {
    provider: string;
    enableMfa: boolean;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
  };
  authorization: {
    rbac: boolean;
    defaultRole: string;
    customRoles?: string[];
  };
  rateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
  };
  cors: {
    enabled: boolean;
    allowedOrigins: string[];
    allowedMethods: string[];
    allowCredentials: boolean;
  };
}

interface ClientConfigEditorProps {
  config?: ClientConfig;
  onSave?: (config: ClientConfig) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export default function ClientConfigEditor({
  config,
  onSave,
  onCancel,
  isEditing = false
}: ClientConfigEditorProps) {
  const [currentConfig, setCurrentConfig] = useState<ClientConfig | null>(config || null);
  const [activeSection, setActiveSection] = useState('app');
  const [showSecrets, setShowSecrets] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  const [copied, setCopied] = useState(false);

  // Initialize config if not provided
  useEffect(() => {
    if (!currentConfig && !config) {
      const defaultConfig: ClientConfig = {
        id: `config_${Date.now()}`,
        clientId: '',
        name: '',
        description: '',
        environment: 'development',
        version: '1.0.0',
        isActive: true,
        configurations: {
          app: {
            name: '',
            description: '',
            ssl: true,
            analytics: {
              enabled: false,
              provider: 'google',
            },
            monitoring: {
              enabled: true,
              errorTracking: true,
              performanceMonitoring: true,
            },
          },
          branding: {
            logo: {
              alt: 'Logo',
            },
            colors: {
              primary: '#2563eb',
              secondary: '#64748b',
              accent: '#f59e0b',
              background: '#ffffff',
              text: '#1f2937',
              border: '#e5e7eb',
            },
            typography: {
              primaryFont: 'Inter',
              secondaryFont: 'Inter',
              headingFont: 'Inter',
            },
            theme: 'light',
          },
          features: {},
          integrations: {},
          security: {
            authentication: {
              provider: 'supabase',
              enableMfa: false,
              sessionTimeout: 86400000, // 24 hours
              passwordPolicy: {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSymbols: false,
              },
            },
            authorization: {
              rbac: true,
              defaultRole: 'user',
            },
            rateLimit: {
              enabled: true,
              requestsPerMinute: 60,
              burstLimit: 120,
            },
            cors: {
              enabled: true,
              allowedOrigins: ['*'],
              allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
              allowCredentials: false,
            },
          },
        },
      };
      setCurrentConfig(defaultConfig);
    }
  }, [config, currentConfig]);

  // Update JSON content when config changes
  useEffect(() => {
    if (currentConfig) {
      setJsonContent(JSON.stringify(currentConfig, null, 2));
    }
  }, [currentConfig]);

  const updateConfig = (path: string, value: any) => {
    if (!currentConfig) return;

    const pathArray = path.split('.');
    const updatedConfig = { ...currentConfig };
    let current: any = updatedConfig;

    // Navigate to the parent object
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]];
    }

    // Set the value
    current[pathArray[pathArray.length - 1]] = value;

    setCurrentConfig(updatedConfig);
    setIsDirty(true);

    // Clear validation error for this field
    if (validationErrors[path]) {
      const newErrors = { ...validationErrors };
      delete newErrors[path];
      setValidationErrors(newErrors);
    }
  };

  const validateConfig = (config: ClientConfig): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Basic validation
    if (!config.name) {
      errors['name'] = 'Configuration name is required';
    }
    if (!config.clientId) {
      errors['clientId'] = 'Client ID is required';
    }

    // App config validation
    if (!config.configurations.app.name) {
      errors['configurations.app.name'] = 'App name is required';
    }
    if (!config.configurations.app.description) {
      errors['configurations.app.description'] = 'App description is required';
    }

    // Branding validation
    if (!config.configurations.branding.colors.primary) {
      errors['configurations.branding.colors.primary'] = 'Primary color is required';
    }

    // Security validation
    if (config.configurations.security.authentication.sessionTimeout < 300000) {
      errors['configurations.security.authentication.sessionTimeout'] = 'Session timeout must be at least 5 minutes';
    }

    return errors;
  };

  const handleSave = () => {
    if (!currentConfig) return;

    const errors = validateConfig(currentConfig);
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      onSave?.(currentConfig);
      setIsDirty(false);
    }
  };

  const handleJsonSave = () => {
    try {
      const parsedConfig = JSON.parse(jsonContent);
      setCurrentConfig(parsedConfig);
      setIsJsonMode(false);
      setIsDirty(true);
    } catch (error) {
      setValidationErrors({ json: 'Invalid JSON format' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportConfig = (format: 'json' | 'yaml' | 'env') => {
    if (!currentConfig) return;

    let content = '';
    let filename = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(currentConfig, null, 2);
        filename = `${currentConfig.name || 'config'}.json`;
        break;
      case 'yaml':
        // Simple YAML conversion - in production, use proper YAML library
        content = JSON.stringify(currentConfig, null, 2);
        filename = `${currentConfig.name || 'config'}.yaml`;
        break;
      case 'env':
        // Convert to env variables
        content = Object.entries(currentConfig.configurations.app)
          .map(([key, value]) => `NEXT_PUBLIC_${key.toUpperCase()}=${value}`)
          .join('\n');
        filename = `.env.${currentConfig.environment}`;
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addFeature = () => {
    if (!currentConfig) return;
    const featureKey = prompt('Enter feature key:');
    if (featureKey) {
      updateConfig(`configurations.features.${featureKey}`, {
        enabled: false,
        config: {},
        permissions: [],
        environments: ['development', 'staging', 'production'],
      });
    }
  };

  const removeFeature = (featureKey: string) => {
    if (!currentConfig) return;
    const updatedFeatures = { ...currentConfig.configurations.features };
    delete updatedFeatures[featureKey];
    updateConfig('configurations.features', updatedFeatures);
  };

  const addIntegration = () => {
    if (!currentConfig) return;
    const integrationKey = prompt('Enter integration key:');
    if (integrationKey) {
      updateConfig(`configurations.integrations.${integrationKey}`, {
        enabled: false,
        config: {},
      });
    }
  };

  const removeIntegration = (integrationKey: string) => {
    if (!currentConfig) return;
    const updatedIntegrations = { ...currentConfig.configurations.integrations };
    delete updatedIntegrations[integrationKey];
    updateConfig('configurations.integrations', updatedIntegrations);
  };

  if (!currentConfig) {
    return <div>Loading...</div>;
  }

  if (isJsonMode) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>JSON Configuration Editor</CardTitle>
              <CardDescription>
                Edit the configuration in JSON format
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setIsJsonMode(false)}>
                Form Editor
              </Button>
              <Button onClick={handleJsonSave}>
                <Save className="h-4 w-4 mr-2" />
                Apply JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {validationErrors.json && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-red-700">{validationErrors.json}</span>
                </div>
              </div>
            )}
            <Textarea
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              className="font-mono text-sm min-h-96"
              placeholder="Enter JSON configuration..."
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Configuration' : 'Create Configuration'}
          </h2>
          <p className="text-muted-foreground">
            Configure client-specific settings and customizations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Switch
              checked={showSecrets}
              onCheckedChange={setShowSecrets}
            />
            <Label>Show Secrets</Label>
          </div>
          <Button variant="outline" onClick={() => setIsJsonMode(true)}>
            <Code className="h-4 w-4 mr-2" />
            JSON Mode
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Configuration</DialogTitle>
                <DialogDescription>
                  Choose the format to export the configuration
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => exportConfig('json')}
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  JSON Format
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => exportConfig('yaml')}
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  YAML Format
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => exportConfig('env')}
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  Environment Variables
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={!isDirty}>
            <Save className="h-4 w-4 mr-2" />
            {isDirty ? 'Save Changes' : 'Saved'}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="font-medium text-red-700">Validation Errors</span>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(validationErrors).map(([field, error]) => (
                <li key={field} className="text-red-600 text-sm">{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Basic configuration details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Configuration Name</Label>
              <Input
                id="name"
                value={currentConfig.name}
                onChange={(e) => updateConfig('name', e.target.value)}
                className={validationErrors['name'] ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                value={currentConfig.clientId}
                onChange={(e) => updateConfig('clientId', e.target.value)}
                className={validationErrors['clientId'] ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label htmlFor="environment">Environment</Label>
              <Select
                value={currentConfig.environment}
                onValueChange={(value) => updateConfig('environment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={currentConfig.version}
                onChange={(e) => updateConfig('version', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={currentConfig.description || ''}
              onChange={(e) => updateConfig('description', e.target.value)}
              placeholder="Configuration description..."
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={currentConfig.isActive}
              onCheckedChange={(checked) => updateConfig('isActive', checked)}
            />
            <Label>Active Configuration</Label>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Sections */}
      <Accordion type="single" collapsible className="space-y-4">
        {/* App Configuration */}
        <AccordionItem value="app">
          <Card>
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                <span className="font-semibold">Application Configuration</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appName">App Name</Label>
                    <Input
                      id="appName"
                      value={currentConfig.configurations.app.name}
                      onChange={(e) => updateConfig('configurations.app.name', e.target.value)}
                      className={validationErrors['configurations.app.name'] ? 'border-red-500' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="domain">Domain</Label>
                    <Input
                      id="domain"
                      value={currentConfig.configurations.app.domain || ''}
                      onChange={(e) => updateConfig('configurations.app.domain', e.target.value)}
                      placeholder="example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subdomain">Subdomain</Label>
                    <Input
                      id="subdomain"
                      value={currentConfig.configurations.app.subdomain || ''}
                      onChange={(e) => updateConfig('configurations.app.subdomain', e.target.value)}
                      placeholder="app"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customDomain">Custom Domain</Label>
                    <Input
                      id="customDomain"
                      value={currentConfig.configurations.app.customDomain || ''}
                      onChange={(e) => updateConfig('configurations.app.customDomain', e.target.value)}
                      placeholder="custom.domain.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="appDescription">App Description</Label>
                  <Textarea
                    id="appDescription"
                    value={currentConfig.configurations.app.description}
                    onChange={(e) => updateConfig('configurations.app.description', e.target.value)}
                    className={validationErrors['configurations.app.description'] ? 'border-red-500' : ''}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={currentConfig.configurations.app.ssl}
                      onCheckedChange={(checked) => updateConfig('configurations.app.ssl', checked)}
                    />
                    <Label>SSL Enabled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={currentConfig.configurations.app.analytics.enabled}
                      onCheckedChange={(checked) => updateConfig('configurations.app.analytics.enabled', checked)}
                    />
                    <Label>Analytics Enabled</Label>
                  </div>
                  {currentConfig.configurations.app.analytics.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label htmlFor="analyticsProvider">Analytics Provider</Label>
                        <Select
                          value={currentConfig.configurations.app.analytics.provider}
                          onValueChange={(value) => updateConfig('configurations.app.analytics.provider', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="google">Google Analytics</SelectItem>
                            <SelectItem value="mixpanel">Mixpanel</SelectItem>
                            <SelectItem value="amplitude">Amplitude</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="trackingId">Tracking ID</Label>
                        <Input
                          id="trackingId"
                          value={currentConfig.configurations.app.analytics.trackingId || ''}
                          onChange={(e) => updateConfig('configurations.app.analytics.trackingId', e.target.value)}
                          placeholder="GA_MEASUREMENT_ID or tracking ID"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Branding Configuration */}
        <AccordionItem value="branding">
          <Card>
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                <span className="font-semibold">Branding Configuration</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-6">
                {/* Logo Configuration */}
                <div>
                  <h4 className="font-medium mb-4">Logo Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <Input
                        id="logoUrl"
                        value={currentConfig.configurations.branding.logo.url || ''}
                        onChange={(e) => updateConfig('configurations.branding.logo.url', e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div>
                      <Label htmlFor="logoAlt">Logo Alt Text</Label>
                      <Input
                        id="logoAlt"
                        value={currentConfig.configurations.branding.logo.alt}
                        onChange={(e) => updateConfig('configurations.branding.logo.alt', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="favicon">Favicon URL</Label>
                      <Input
                        id="favicon"
                        value={currentConfig.configurations.branding.favicon || ''}
                        onChange={(e) => updateConfig('configurations.branding.favicon', e.target.value)}
                        placeholder="https://example.com/favicon.ico"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Configuration */}
                <div>
                  <h4 className="font-medium mb-4">Color Scheme</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(currentConfig.configurations.branding.colors).map(([colorKey, colorValue]) => (
                      <div key={colorKey}>
                        <Label htmlFor={`color-${colorKey}`} className="capitalize">
                          {colorKey.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            id={`color-${colorKey}`}
                            value={colorValue}
                            onChange={(e) => updateConfig(`configurations.branding.colors.${colorKey}`, e.target.value)}
                            className="w-12 h-8 rounded border"
                          />
                          <Input
                            value={colorValue}
                            onChange={(e) => updateConfig(`configurations.branding.colors.${colorKey}`, e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography Configuration */}
                <div>
                  <h4 className="font-medium mb-4">Typography</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="primaryFont">Primary Font</Label>
                      <Input
                        id="primaryFont"
                        value={currentConfig.configurations.branding.typography.primaryFont}
                        onChange={(e) => updateConfig('configurations.branding.typography.primaryFont', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondaryFont">Secondary Font</Label>
                      <Input
                        id="secondaryFont"
                        value={currentConfig.configurations.branding.typography.secondaryFont}
                        onChange={(e) => updateConfig('configurations.branding.typography.secondaryFont', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="headingFont">Heading Font</Label>
                      <Input
                        id="headingFont"
                        value={currentConfig.configurations.branding.typography.headingFont}
                        onChange={(e) => updateConfig('configurations.branding.typography.headingFont', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Theme Configuration */}
                <div>
                  <h4 className="font-medium mb-4">Theme Settings</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select
                        value={currentConfig.configurations.branding.theme}
                        onValueChange={(value) => updateConfig('configurations.branding.theme', value)}
                      >
                        <SelectTrigger className="w-full md:w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="customCss">Custom CSS</Label>
                      <Textarea
                        id="customCss"
                        value={currentConfig.configurations.branding.customCss || ''}
                        onChange={(e) => updateConfig('configurations.branding.customCss', e.target.value)}
                        placeholder="/* Custom CSS styles */"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Features Configuration */}
        <AccordionItem value="features">
          <Card>
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Feature Configuration</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addFeature}
                  className="mr-4"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Feature
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-4">
                {Object.entries(currentConfig.configurations.features).map(([featureKey, featureConfig]) => (
                  <div key={featureKey} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={featureConfig.enabled}
                          onCheckedChange={(checked) =>
                            updateConfig(`configurations.features.${featureKey}.enabled`, checked)
                          }
                        />
                        <code className="bg-muted px-2 py-1 rounded text-sm">{featureKey}</code>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFeature(featureKey)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label>Feature Configuration (JSON)</Label>
                        <Textarea
                          value={JSON.stringify(featureConfig.config || {}, null, 2)}
                          onChange={(e) => {
                            try {
                              const config = JSON.parse(e.target.value);
                              updateConfig(`configurations.features.${featureKey}.config`, config);
                            } catch {
                              // Invalid JSON, don't update
                            }
                          }}
                          className="font-mono text-sm"
                          placeholder="{}"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(currentConfig.configurations.features).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No features configured. Click "Add Feature" to add a new feature.
                  </div>
                )}
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Security Configuration */}
        <AccordionItem value="security">
          <Card>
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                <span className="font-semibold">Security Configuration</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-6">
                {/* Authentication */}
                <div>
                  <h4 className="font-medium mb-4">Authentication</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="authProvider">Auth Provider</Label>
                      <Select
                        value={currentConfig.configurations.security.authentication.provider}
                        onValueChange={(value) => updateConfig('configurations.security.authentication.provider', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="supabase">Supabase</SelectItem>
                          <SelectItem value="auth0">Auth0</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (ms)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={currentConfig.configurations.security.authentication.sessionTimeout}
                        onChange={(e) => updateConfig('configurations.security.authentication.sessionTimeout', Number(e.target.value))}
                        className={validationErrors['configurations.security.authentication.sessionTimeout'] ? 'border-red-500' : ''}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={currentConfig.configurations.security.authentication.enableMfa}
                      onCheckedChange={(checked) => updateConfig('configurations.security.authentication.enableMfa', checked)}
                    />
                    <Label>Enable Multi-Factor Authentication</Label>
                  </div>
                </div>

                {/* Rate Limiting */}
                <div>
                  <h4 className="font-medium mb-4">Rate Limiting</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={currentConfig.configurations.security.rateLimit.enabled}
                        onCheckedChange={(checked) => updateConfig('configurations.security.rateLimit.enabled', checked)}
                      />
                      <Label>Enable Rate Limiting</Label>
                    </div>
                    {currentConfig.configurations.security.rateLimit.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                        <div>
                          <Label htmlFor="requestsPerMinute">Requests per Minute</Label>
                          <Input
                            id="requestsPerMinute"
                            type="number"
                            value={currentConfig.configurations.security.rateLimit.requestsPerMinute}
                            onChange={(e) => updateConfig('configurations.security.rateLimit.requestsPerMinute', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="burstLimit">Burst Limit</Label>
                          <Input
                            id="burstLimit"
                            type="number"
                            value={currentConfig.configurations.security.rateLimit.burstLimit}
                            onChange={(e) => updateConfig('configurations.security.rateLimit.burstLimit', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}