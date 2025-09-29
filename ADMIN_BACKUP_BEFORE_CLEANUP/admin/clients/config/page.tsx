'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Settings,
  Database,
  Flag,
  Play,
  Plus,
  Edit3,
  Trash2,
  Save,
  Download,
  Upload,
  Eye,
  EyeOff,
  Copy,
  RefreshCw
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
    app: any;
    branding: any;
    features: any;
    integrations: any;
    security: any;
  };
}

interface EnvironmentVariable {
  key: string;
  value: string;
  description?: string;
  isSecret: boolean;
  environment: string;
  isRequired: boolean;
}

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  type: string;
  value: any;
  isEnabled: boolean;
  environment: string;
}

interface RuntimeConfig {
  id: string;
  key: string;
  value: any;
  type: string;
  description?: string;
  namespace: string;
  isSecret: boolean;
}

export default function ClientConfigPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClient, setSelectedClient] = useState('client_001');
  const [selectedEnvironment, setSelectedEnvironment] = useState('production');
  const [clientConfig, setClientConfig] = useState<ClientConfig | null>(null);
  const [environmentVars, setEnvironmentVars] = useState<EnvironmentVariable[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [runtimeConfigs, setRuntimeConfigs] = useState<RuntimeConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingVar, setEditingVar] = useState<string | null>(null);
  const [editingFlag, setEditingFlag] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      // Mock client configuration
      setClientConfig({
        id: 'config_001',
        clientId: selectedClient,
        name: 'E-commerce Platform',
        description: 'Complete e-commerce solution for retail business',
        environment: selectedEnvironment,
        version: '2.1.0',
        isActive: true,
        configurations: {
          app: {
            name: 'RetailHub Pro',
            domain: 'retailhub.example.com',
            ssl: true,
            analytics: { enabled: true, provider: 'google' }
          },
          branding: {
            colors: { primary: '#2563eb', secondary: '#64748b' },
            logo: { url: '/logo.png', alt: 'RetailHub Logo' }
          },
          features: {
            payment_processing: { enabled: true },
            inventory_management: { enabled: true },
            order_tracking: { enabled: false }
          },
          integrations: {
            stripe: { enabled: true, apiKey: 'sk_test_***' },
            sendgrid: { enabled: true, apiKey: 'SG.***' }
          },
          security: {
            authentication: { provider: 'supabase', enableMfa: true },
            rateLimit: { enabled: true, requestsPerMinute: 60 }
          }
        }
      });

      // Mock environment variables
      setEnvironmentVars([
        {
          key: 'NEXT_PUBLIC_APP_NAME',
          value: 'RetailHub Pro',
          description: 'Public application name',
          isSecret: false,
          environment: selectedEnvironment,
          isRequired: true
        },
        {
          key: 'DATABASE_URL',
          value: 'postgresql://user:***@localhost:5432/retailhub',
          description: 'Database connection string',
          isSecret: true,
          environment: selectedEnvironment,
          isRequired: true
        },
        {
          key: 'STRIPE_SECRET_KEY',
          value: 'sk_test_***',
          description: 'Stripe secret key for payments',
          isSecret: true,
          environment: selectedEnvironment,
          isRequired: true
        },
        {
          key: 'SENDGRID_API_KEY',
          value: 'SG.***',
          description: 'SendGrid API key for emails',
          isSecret: true,
          environment: selectedEnvironment,
          isRequired: false
        }
      ]);

      // Mock feature flags
      setFeatureFlags([
        {
          id: 'flag_001',
          key: 'enable_checkout',
          name: 'Enable Checkout',
          description: 'Enable the checkout functionality',
          type: 'boolean',
          value: true,
          isEnabled: true,
          environment: selectedEnvironment
        },
        {
          id: 'flag_002',
          key: 'max_cart_items',
          name: 'Maximum Cart Items',
          description: 'Maximum number of items in cart',
          type: 'number',
          value: 50,
          isEnabled: true,
          environment: selectedEnvironment
        },
        {
          id: 'flag_003',
          key: 'payment_methods',
          name: 'Available Payment Methods',
          description: 'List of available payment methods',
          type: 'array',
          value: ['credit_card', 'paypal', 'apple_pay'],
          isEnabled: true,
          environment: selectedEnvironment
        }
      ]);

      // Mock runtime configurations
      setRuntimeConfigs([
        {
          id: 'runtime_001',
          key: 'maintenance_mode',
          value: false,
          type: 'boolean',
          description: 'Enable maintenance mode',
          namespace: 'system',
          isSecret: false
        },
        {
          id: 'runtime_002',
          key: 'api_rate_limit',
          value: 1000,
          type: 'number',
          description: 'API requests per hour',
          namespace: 'api',
          isSecret: false
        },
        {
          id: 'runtime_003',
          key: 'feature_announcement',
          value: 'New payment methods now available!',
          type: 'string',
          description: 'Current feature announcement',
          namespace: 'ui',
          isSecret: false
        }
      ]);

      setIsLoading(false);
    }, 1000);
  }, [selectedClient, selectedEnvironment]);

  const handleSaveConfig = async () => {
    // TODO: Implement configuration saving
    console.log('Saving configuration...');
  };

  const handleExportConfig = () => {
    // TODO: Implement configuration export
    console.log('Exporting configuration...');
  };

  const handleImportConfig = () => {
    // TODO: Implement configuration import
    console.log('Importing configuration...');
  };

  const handleAddEnvironmentVar = () => {
    const newVar: EnvironmentVariable = {
      key: 'NEW_VARIABLE',
      value: '',
      description: '',
      isSecret: false,
      environment: selectedEnvironment,
      isRequired: false
    };
    setEnvironmentVars([...environmentVars, newVar]);
    setEditingVar('NEW_VARIABLE');
  };

  const handleUpdateEnvironmentVar = (key: string, updates: Partial<EnvironmentVariable>) => {
    setEnvironmentVars(vars => vars.map(v => v.key === key ? { ...v, ...updates } : v));
  };

  const handleDeleteEnvironmentVar = (key: string) => {
    setEnvironmentVars(vars => vars.filter(v => v.key !== key));
  };

  const handleAddFeatureFlag = () => {
    const newFlag: FeatureFlag = {
      id: `flag_${Date.now()}`,
      key: 'new_feature',
      name: 'New Feature',
      description: '',
      type: 'boolean',
      value: false,
      isEnabled: false,
      environment: selectedEnvironment
    };
    setFeatureFlags([...featureFlags, newFlag]);
    setEditingFlag(newFlag.id);
  };

  const handleUpdateFeatureFlag = (id: string, updates: Partial<FeatureFlag>) => {
    setFeatureFlags(flags => flags.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleDeleteFeatureFlag = (id: string) => {
    setFeatureFlags(flags => flags.filter(f => f.id !== id));
  };

  const handleAddRuntimeConfig = () => {
    const newConfig: RuntimeConfig = {
      id: `runtime_${Date.now()}`,
      key: 'new_config',
      value: '',
      type: 'string',
      description: '',
      namespace: 'default',
      isSecret: false
    };
    setRuntimeConfigs([...runtimeConfigs, newConfig]);
    setEditingConfig(newConfig.id);
  };

  const handleUpdateRuntimeConfig = (id: string, updates: Partial<RuntimeConfig>) => {
    setRuntimeConfigs(configs => configs.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleDeleteRuntimeConfig = (id: string) => {
    setRuntimeConfigs(configs => configs.filter(c => c.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Configuration</h1>
          <p className="text-muted-foreground">
            Manage client-specific configurations, environment variables, and feature flags
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleImportConfig}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExportConfig}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleSaveConfig}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Client and Environment Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="client-select">Client</Label>
              <select
                id="client-select"
                className="w-full p-2 border rounded-md"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
              >
                <option value="client_001">RetailHub (client_001)</option>
                <option value="client_002">TechCorp (client_002)</option>
                <option value="client_003">DesignStudio (client_003)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="environment-select">Environment</Label>
              <select
                id="environment-select"
                className="w-full p-2 border rounded-md"
                value={selectedEnvironment}
                onChange={(e) => setSelectedEnvironment(e.target.value)}
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showSecrets}
                  onCheckedChange={setShowSecrets}
                />
                <Label>Show Secrets</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="environment" className="flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Environment
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center">
            <Flag className="h-4 w-4 mr-2" />
            Feature Flags
          </TabsTrigger>
          <TabsTrigger value="runtime" className="flex items-center">
            <Play className="h-4 w-4 mr-2" />
            Runtime Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {clientConfig && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Application Configuration</CardTitle>
                  <CardDescription>Basic application settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>App Name</Label>
                    <Input value={clientConfig.configurations.app.name} readOnly />
                  </div>
                  <div>
                    <Label>Domain</Label>
                    <Input value={clientConfig.configurations.app.domain} readOnly />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={clientConfig.configurations.app.ssl} disabled />
                    <Label>SSL Enabled</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Configuration</CardTitle>
                  <CardDescription>Security and authentication settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Auth Provider</Label>
                    <Input value={clientConfig.configurations.security.authentication.provider} readOnly />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={clientConfig.configurations.security.authentication.enableMfa} disabled />
                    <Label>MFA Enabled</Label>
                  </div>
                  <div>
                    <Label>Rate Limit (per minute)</Label>
                    <Input value={clientConfig.configurations.security.rateLimit.requestsPerMinute} readOnly />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Status</CardTitle>
                  <CardDescription>Current feature configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(clientConfig.configurations.features).map(([feature, config]: [string, any]) => (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                        <Badge variant={config.enabled ? 'default' : 'secondary'}>
                          {config.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>External service integrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(clientConfig.configurations.integrations).map(([integration, config]: [string, any]) => (
                      <div key={integration} className="flex items-center justify-between">
                        <span className="capitalize">{integration}</span>
                        <Badge variant={config.enabled ? 'default' : 'secondary'}>
                          {config.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="environment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Environment Variables</CardTitle>
                  <CardDescription>
                    Manage environment-specific configuration variables
                  </CardDescription>
                </div>
                <Button onClick={handleAddEnvironmentVar}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {environmentVars.map((envVar) => (
                  <div key={envVar.key} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Key</Label>
                        {editingVar === envVar.key ? (
                          <Input
                            value={envVar.key}
                            onChange={(e) => handleUpdateEnvironmentVar(envVar.key, { key: e.target.value })}
                            onBlur={() => setEditingVar(null)}
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <code className="bg-muted px-2 py-1 rounded text-sm">{envVar.key}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingVar(envVar.key)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Value</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type={envVar.isSecret && !showSecrets ? 'password' : 'text'}
                            value={envVar.isSecret && !showSecrets ? '***' : envVar.value}
                            onChange={(e) => handleUpdateEnvironmentVar(envVar.key, { value: e.target.value })}
                          />
                          {envVar.isSecret && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(envVar.value)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={envVar.isSecret}
                            onCheckedChange={(checked) => handleUpdateEnvironmentVar(envVar.key, { isSecret: checked })}
                          />
                          <Label>Secret</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={envVar.isRequired}
                            onCheckedChange={(checked) => handleUpdateEnvironmentVar(envVar.key, { isRequired: checked })}
                          />
                          <Label>Required</Label>
                        </div>
                      </div>
                      <div className="flex items-end">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteEnvironmentVar(envVar.key)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {envVar.description && (
                      <div className="mt-2">
                        <Label>Description</Label>
                        <Input
                          value={envVar.description}
                          onChange={(e) => handleUpdateEnvironmentVar(envVar.key, { description: e.target.value })}
                          placeholder="Variable description..."
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Feature Flags</CardTitle>
                  <CardDescription>
                    Control feature availability and behavior
                  </CardDescription>
                </div>
                <Button onClick={handleAddFeatureFlag}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Flag
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureFlags.map((flag) => (
                  <div key={flag.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <Label>Key</Label>
                        {editingFlag === flag.id ? (
                          <Input
                            value={flag.key}
                            onChange={(e) => handleUpdateFeatureFlag(flag.id, { key: e.target.value })}
                            onBlur={() => setEditingFlag(null)}
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <code className="bg-muted px-2 py-1 rounded text-sm">{flag.key}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingFlag(flag.id)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={flag.name}
                          onChange={(e) => handleUpdateFeatureFlag(flag.id, { name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={flag.type}
                          onChange={(e) => handleUpdateFeatureFlag(flag.id, { type: e.target.value })}
                        >
                          <option value="boolean">Boolean</option>
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="array">Array</option>
                          <option value="json">JSON</option>
                        </select>
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input
                          value={typeof flag.value === 'object' ? JSON.stringify(flag.value) : flag.value}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (flag.type === 'boolean') {
                              value = e.target.value === 'true';
                            } else if (flag.type === 'number') {
                              value = Number(e.target.value);
                            } else if (flag.type === 'array' || flag.type === 'json') {
                              try {
                                value = JSON.parse(e.target.value);
                              } catch {
                                value = e.target.value;
                              }
                            }
                            handleUpdateFeatureFlag(flag.id, { value });
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={flag.isEnabled}
                            onCheckedChange={(checked) => handleUpdateFeatureFlag(flag.id, { isEnabled: checked })}
                          />
                          <Label>Enabled</Label>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteFeatureFlag(flag.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label>Description</Label>
                      <Input
                        value={flag.description}
                        onChange={(e) => handleUpdateFeatureFlag(flag.id, { description: e.target.value })}
                        placeholder="Flag description..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runtime" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Runtime Configuration</CardTitle>
                  <CardDescription>
                    Dynamic configuration that can be changed without deployment
                  </CardDescription>
                </div>
                <Button onClick={handleAddRuntimeConfig}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Config
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {runtimeConfigs.map((config) => (
                  <div key={config.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <Label>Key</Label>
                        {editingConfig === config.id ? (
                          <Input
                            value={config.key}
                            onChange={(e) => handleUpdateRuntimeConfig(config.id, { key: e.target.value })}
                            onBlur={() => setEditingConfig(null)}
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <code className="bg-muted px-2 py-1 rounded text-sm">{config.key}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingConfig(config.id)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Namespace</Label>
                        <Input
                          value={config.namespace}
                          onChange={(e) => handleUpdateRuntimeConfig(config.id, { namespace: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={config.type}
                          onChange={(e) => handleUpdateRuntimeConfig(config.id, { type: e.target.value })}
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="json">JSON</option>
                          <option value="array">Array</option>
                        </select>
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input
                          type={config.isSecret && !showSecrets ? 'password' : 'text'}
                          value={config.isSecret && !showSecrets ? '***' : (typeof config.value === 'object' ? JSON.stringify(config.value) : config.value)}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (config.type === 'boolean') {
                              value = e.target.value === 'true';
                            } else if (config.type === 'number') {
                              value = Number(e.target.value);
                            } else if (config.type === 'array' || config.type === 'json') {
                              try {
                                value = JSON.parse(e.target.value);
                              } catch {
                                value = e.target.value;
                              }
                            }
                            handleUpdateRuntimeConfig(config.id, { value });
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={config.isSecret}
                            onCheckedChange={(checked) => handleUpdateRuntimeConfig(config.id, { isSecret: checked })}
                          />
                          <Label>Secret</Label>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteRuntimeConfig(config.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label>Description</Label>
                      <Input
                        value={config.description || ''}
                        onChange={(e) => handleUpdateRuntimeConfig(config.id, { description: e.target.value })}
                        placeholder="Configuration description..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}