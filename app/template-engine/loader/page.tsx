'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Database,
  Settings,
  Code,
  Zap,
  Shield,
  Eye,
  Edit,
  Trash2,
  Copy,
  Plus,
  Play,
  Pause
} from 'lucide-react';

interface TemplateConfiguration {
  id: string;
  name: string;
  version: string;
  templateId: string;
  status: 'loaded' | 'loading' | 'error' | 'validating' | 'ready';
  source: 'file' | 'database' | 'api' | 'manual';
  size: number;
  loadTime: number;
  lastModified: string;
  config: {
    meta: {
      title: string;
      description: string;
      category: string;
      tags: string[];
      author: string;
      version: string;
    };
    template: {
      type: string;
      framework: string;
      entry: string;
      styles: string[];
      scripts: string[];
    };
    components: Array<{
      id: string;
      type: string;
      slot: string;
      props: Record<string, any>;
      children?: any[];
    }>;
    theme: {
      colors: Record<string, string>;
      fonts: Record<string, string>;
      spacing: Record<string, string>;
      breakpoints: Record<string, string>;
    };
    seo: {
      title: string;
      description: string;
      keywords: string[];
      ogImage?: string;
    };
    performance: {
      caching: boolean;
      lazy: boolean;
      prefetch: boolean;
      compression: boolean;
    };
  };
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

interface LoaderStats {
  totalConfigurations: number;
  loadedConfigurations: number;
  failedConfigurations: number;
  averageLoadTime: number;
  cachingEnabled: boolean;
  autoReload: boolean;
}

export default function ConfigurationLoaderPage() {
  const [selectedTab, setSelectedTab] = useState('loader');
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const [configurations, setConfigurations] = useState<TemplateConfiguration[]>([
    {
      id: 'config_001',
      name: 'Consultation Landing Page Config',
      version: '1.2.0',
      templateId: 'tmpl_landing_001',
      status: 'ready',
      source: 'file',
      size: 8640,
      loadTime: 145,
      lastModified: '2025-09-18T20:30:00Z',
      config: {
        meta: {
          title: 'Professional Business Consultation',
          description: 'Expert consultation services for business growth',
          category: 'landing-page',
          tags: ['consultation', 'business', 'professional'],
          author: 'Template Engine',
          version: '1.2.0'
        },
        template: {
          type: 'landing-page',
          framework: 'react',
          entry: 'LandingPage.tsx',
          styles: ['styles.css', 'theme.css'],
          scripts: ['analytics.js', 'tracking.js']
        },
        components: [
          {
            id: 'hero',
            type: 'HeroSection',
            slot: 'header',
            props: {
              title: 'Professional Business Solutions',
              subtitle: 'Transform your business with our expert consultation services',
              ctaText: 'Start Free Consultation',
              backgroundImage: '/images/hero-bg.jpg'
            }
          },
          {
            id: 'features',
            type: 'FeatureGrid',
            slot: 'content',
            props: {
              features: [
                { title: 'Fast Setup', description: 'Quick onboarding', icon: 'zap' },
                { title: 'Secure Data', description: 'Enterprise security', icon: 'shield' },
                { title: 'Scalable', description: 'Grows with you', icon: 'trending-up' }
              ],
              columns: 3
            }
          }
        ],
        theme: {
          colors: {
            primary: '#3B82F6',
            secondary: '#1E40AF',
            background: '#F8FAFC',
            text: '#1F2937',
            accent: '#F59E0B'
          },
          fonts: {
            heading: 'Inter',
            body: 'Inter',
            mono: 'JetBrains Mono'
          },
          spacing: {
            xs: '0.25rem',
            sm: '0.5rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem'
          },
          breakpoints: {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px'
          }
        },
        seo: {
          title: 'Professional Business Consultation | Expert Services',
          description: 'Get expert business consultation and recommendations from experienced professionals.',
          keywords: ['business consultation', 'professional advice', 'business growth', 'strategic planning'],
          ogImage: '/images/og-consultation.jpg'
        },
        performance: {
          caching: true,
          lazy: true,
          prefetch: false,
          compression: true
        }
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: ['Consider optimizing image sizes for better performance']
      }
    },
    {
      id: 'config_002',
      name: 'Questionnaire Flow Config',
      version: '1.0.5',
      templateId: 'tmpl_questionnaire_001',
      status: 'loaded',
      source: 'database',
      size: 12450,
      loadTime: 234,
      lastModified: '2025-09-18T19:45:00Z',
      config: {
        meta: {
          title: 'Client Assessment Questionnaire',
          description: 'Multi-step questionnaire for client assessment',
          category: 'questionnaire',
          tags: ['questionnaire', 'assessment', 'multi-step'],
          author: 'Template Engine',
          version: '1.0.5'
        },
        template: {
          type: 'questionnaire',
          framework: 'react',
          entry: 'QuestionnaireFlow.tsx',
          styles: ['questionnaire.css', 'progress.css'],
          scripts: ['validation.js', 'progress-tracking.js']
        },
        components: [
          {
            id: 'progress',
            type: 'ProgressBar',
            slot: 'header',
            props: {
              steps: 5,
              currentStep: 1,
              showLabels: true
            }
          },
          {
            id: 'questions',
            type: 'QuestionStep',
            slot: 'content',
            props: {
              questions: [],
              validation: true,
              autoSave: true
            }
          }
        ],
        theme: {
          colors: {
            primary: '#10B981',
            secondary: '#059669',
            background: '#F9FAFB',
            text: '#111827',
            accent: '#6366F1'
          },
          fonts: {
            heading: 'Inter',
            body: 'Inter',
            mono: 'JetBrains Mono'
          },
          spacing: {
            xs: '0.25rem',
            sm: '0.5rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem'
          },
          breakpoints: {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px'
          }
        },
        seo: {
          title: 'Client Assessment Questionnaire',
          description: 'Complete our assessment to receive personalized recommendations.',
          keywords: ['client assessment', 'questionnaire', 'personalized service'],
          ogImage: '/images/og-questionnaire.jpg'
        },
        performance: {
          caching: true,
          lazy: false,
          prefetch: true,
          compression: true
        }
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: []
      }
    },
    {
      id: 'config_003',
      name: 'PDF Report Config',
      version: '0.9.2',
      templateId: 'tmpl_pdf_001',
      status: 'error',
      source: 'api',
      size: 5680,
      loadTime: 0,
      lastModified: '2025-09-18T18:15:00Z',
      config: {
        meta: {
          title: 'PDF Consultation Report',
          description: 'Generated PDF report template',
          category: 'document',
          tags: ['pdf', 'report', 'consultation'],
          author: 'Template Engine',
          version: '0.9.2'
        },
        template: {
          type: 'document',
          framework: 'react-pdf',
          entry: 'PDFReport.tsx',
          styles: ['pdf-styles.css'],
          scripts: ['pdf-generator.js']
        },
        components: [],
        theme: {
          colors: {
            primary: '#1F2937',
            secondary: '#6B7280',
            background: '#FFFFFF',
            text: '#111827',
            accent: '#3B82F6'
          },
          fonts: {
            heading: 'Arial',
            body: 'Arial',
            mono: 'Courier New'
          },
          spacing: {
            xs: '4px',
            sm: '8px',
            md: '16px',
            lg: '24px',
            xl: '32px'
          },
          breakpoints: {
            page: '8.5in'
          }
        },
        seo: {
          title: 'Consultation Report',
          description: 'Your personalized consultation report',
          keywords: ['consultation', 'report', 'analysis']
        },
        performance: {
          caching: false,
          lazy: false,
          prefetch: false,
          compression: false
        }
      },
      validation: {
        isValid: false,
        errors: ['Missing required component: ReportHeader', 'Invalid PDF configuration'],
        warnings: ['PDF generation may be slow without optimization']
      }
    }
  ]);

  const [loaderSettings, setLoaderSettings] = useState({
    autoReload: true,
    caching: true,
    validation: true,
    compression: true,
    timeout: 30000,
    retryAttempts: 3
  });

  const [newConfigJson, setNewConfigJson] = useState('');

  const handleLoadConfiguration = async (source: 'file' | 'url' | 'json') => {
    setIsLoading(true);
    setLoadProgress(0);

    // Simulate loading process
    const steps = ['Fetching configuration', 'Parsing JSON', 'Validating schema', 'Loading components', 'Finalizing'];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setLoadProgress(((i + 1) / steps.length) * 100);
    }

    if (source === 'json' && newConfigJson) {
      try {
        const config = JSON.parse(newConfigJson);
        const newConfiguration: TemplateConfiguration = {
          id: `config_${Date.now()}`,
          name: config.meta?.title || 'New Configuration',
          version: config.meta?.version || '1.0.0',
          templateId: `tmpl_${Date.now()}`,
          status: 'ready',
          source: 'manual',
          size: new Blob([newConfigJson]).size,
          loadTime: Math.random() * 300 + 100,
          lastModified: new Date().toISOString(),
          config: config,
          validation: {
            isValid: true,
            errors: [],
            warnings: []
          }
        };

        setConfigurations(prev => [newConfiguration, ...prev]);
        setNewConfigJson('');
      } catch (error) {
        // Handle JSON parsing error
        console.error('Invalid JSON configuration');
      }
    }

    setIsLoading(false);
    setLoadProgress(0);
  };

  const handleReloadConfiguration = async (configId: string) => {
    setConfigurations(prev =>
      prev.map(config =>
        config.id === configId
          ? { ...config, status: 'loading' }
          : config
      )
    );

    await new Promise(resolve => setTimeout(resolve, 1000));

    setConfigurations(prev =>
      prev.map(config =>
        config.id === configId
          ? {
              ...config,
              status: 'ready',
              loadTime: Math.random() * 300 + 100,
              lastModified: new Date().toISOString()
            }
          : config
      )
    );
  };

  const handleDeleteConfiguration = (configId: string) => {
    setConfigurations(prev => prev.filter(config => config.id !== configId));
  };

  const handleExportConfiguration = (config: TemplateConfiguration) => {
    const blob = new Blob([JSON.stringify(config.config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name.replace(/\s+/g, '_').toLowerCase()}_config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-500';
      case 'loaded': return 'bg-blue-500';
      case 'loading': return 'bg-yellow-500';
      case 'validating': return 'bg-purple-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'loaded': return <Database className="h-4 w-4" />;
      case 'loading': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'validating': return <Shield className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const loaderStats: LoaderStats = {
    totalConfigurations: configurations.length,
    loadedConfigurations: configurations.filter(c => c.status === 'ready' || c.status === 'loaded').length,
    failedConfigurations: configurations.filter(c => c.status === 'error').length,
    averageLoadTime: Math.round(configurations.reduce((sum, c) => sum + c.loadTime, 0) / configurations.length),
    cachingEnabled: loaderSettings.caching,
    autoReload: loaderSettings.autoReload
  };

  useEffect(() => {
    // Auto-reload configurations periodically if enabled
    if (loaderSettings.autoReload) {
      const interval = setInterval(() => {
        // Simulate periodic configuration checks
        setConfigurations(prev =>
          prev.map(config => ({
            ...config,
            lastModified: new Date().toISOString()
          }))
        );
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [loaderSettings.autoReload]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuration Loader</h1>
          <p className="text-muted-foreground">
            Template configuration loading, parsing, and validation system
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {loaderStats.loadedConfigurations}/{loaderStats.totalConfigurations} Loaded
          </Badge>
          <Button onClick={() => setSelectedTab('load')}>
            <Plus className="h-4 w-4 mr-2" />
            Load Configuration
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="loader">Loader Status</TabsTrigger>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
          <TabsTrigger value="load">Load Config</TabsTrigger>
          <TabsTrigger value="settings">Loader Settings</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="loader" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Configs</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loaderStats.totalConfigurations}</div>
                <p className="text-xs text-muted-foreground">
                  {loaderStats.loadedConfigurations} successfully loaded
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Load Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((loaderStats.loadedConfigurations / loaderStats.totalConfigurations) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {loaderStats.failedConfigurations} failed loads
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loaderStats.averageLoadTime}ms</div>
                <p className="text-xs text-muted-foreground">
                  Configuration processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loader Status</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground">
                  {loaderSettings.caching ? 'Caching enabled' : 'No caching'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Loader Overview</CardTitle>
              <CardDescription>Configuration loading system status and capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Loader Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">JSON configuration parsing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Schema validation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Multi-source loading</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Auto-reload capability</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Performance Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-4 w-4 ${loaderSettings.caching ? 'text-green-500' : 'text-gray-500'}`} />
                      <span className="text-sm">Configuration caching</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-4 w-4 ${loaderSettings.compression ? 'text-green-500' : 'text-gray-500'}`} />
                      <span className="text-sm">Compression support</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Lazy loading</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Error recovery</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configurations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loaded Configurations</CardTitle>
              <CardDescription>Template configurations currently loaded in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {configurations.map((config) => (
                  <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getStatusColor(config.status)} text-white`}>
                        {getStatusIcon(config.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{config.name}</h4>
                          <Badge variant="outline">{config.source}</Badge>
                          <Badge variant="secondary">v{config.version}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Template: {config.templateId} • Category: {config.config.meta.category}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Size: {(config.size / 1024).toFixed(1)}KB</span>
                          <span>Load time: {config.loadTime}ms</span>
                          <span>Modified: {new Date(config.lastModified).toLocaleString()}</span>
                        </div>
                        {config.validation.errors.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-red-600">
                              {config.validation.errors.length} error(s): {config.validation.errors[0]}
                            </p>
                          </div>
                        )}
                        {config.validation.warnings.length > 0 && (
                          <div className="mt-1">
                            <p className="text-xs text-yellow-600">
                              {config.validation.warnings.length} warning(s)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReloadConfiguration(config.id)}
                        disabled={config.status === 'loading'}
                      >
                        <RefreshCw className={`h-4 w-4 ${config.status === 'loading' ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportConfiguration(config)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteConfiguration(config.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="load" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Load Configuration</CardTitle>
              <CardDescription>Load template configurations from various sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => handleLoadConfiguration('file')}
                    disabled={isLoading}
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                  >
                    <Upload className="h-6 w-6" />
                    <span>Load from File</span>
                  </Button>
                  <Button
                    onClick={() => handleLoadConfiguration('url')}
                    disabled={isLoading}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                  >
                    <Database className="h-6 w-6" />
                    <span>Load from URL</span>
                  </Button>
                  <Button
                    onClick={() => handleLoadConfiguration('json')}
                    disabled={isLoading || !newConfigJson.trim()}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                  >
                    <Code className="h-6 w-6" />
                    <span>Load JSON</span>
                  </Button>
                </div>

                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Loading Configuration</span>
                      <span>{loadProgress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${loadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="config-json">JSON Configuration</Label>
                  <Textarea
                    id="config-json"
                    placeholder='Paste your JSON configuration here...'
                    value={newConfigJson}
                    onChange={(e) => setNewConfigJson(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a valid JSON configuration to load it manually
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loader Settings</CardTitle>
              <CardDescription>Configure the template configuration loader behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Loading Options</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-reload">Auto-reload</Label>
                      <input
                        id="auto-reload"
                        type="checkbox"
                        checked={loaderSettings.autoReload}
                        onChange={(e) => setLoaderSettings(prev => ({ ...prev, autoReload: e.target.checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="caching">Configuration Caching</Label>
                      <input
                        id="caching"
                        type="checkbox"
                        checked={loaderSettings.caching}
                        onChange={(e) => setLoaderSettings(prev => ({ ...prev, caching: e.target.checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="validation">Schema Validation</Label>
                      <input
                        id="validation"
                        type="checkbox"
                        checked={loaderSettings.validation}
                        onChange={(e) => setLoaderSettings(prev => ({ ...prev, validation: e.target.checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="compression">Compression</Label>
                      <input
                        id="compression"
                        type="checkbox"
                        checked={loaderSettings.compression}
                        onChange={(e) => setLoaderSettings(prev => ({ ...prev, compression: e.target.checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Performance Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="timeout">Timeout (ms)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        min="1000"
                        max="60000"
                        value={loaderSettings.timeout}
                        onChange={(e) => setLoaderSettings(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30000 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="retry-attempts">Retry Attempts</Label>
                      <Input
                        id="retry-attempts"
                        type="number"
                        min="0"
                        max="10"
                        value={loaderSettings.retryAttempts}
                        onChange={(e) => setLoaderSettings(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) || 3 }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Validation</CardTitle>
              <CardDescription>Validation results for loaded configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {configurations.map((config) => (
                  <div key={config.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{config.name}</h4>
                        <Badge variant={config.validation.isValid ? "default" : "destructive"}>
                          {config.validation.isValid ? 'Valid' : 'Invalid'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {config.validation.errors.length} errors, {config.validation.warnings.length} warnings
                      </div>
                    </div>

                    {config.validation.errors.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-red-600 mb-1">Errors:</h5>
                        <ul className="text-sm text-red-600 space-y-1">
                          {config.validation.errors.map((error, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {config.validation.warnings.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-yellow-600 mb-1">Warnings:</h5>
                        <ul className="text-sm text-yellow-600 space-y-1">
                          {config.validation.warnings.map((warning, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {config.validation.isValid && config.validation.errors.length === 0 && config.validation.warnings.length === 0 && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Configuration is valid with no issues</span>
                      </div>
                    )}
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