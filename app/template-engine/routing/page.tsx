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
  Route,
  Globe,
  Settings,
  Zap,
  LinkIcon,
  MapPin,
  Network,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface DynamicRoute {
  id: string;
  templateId: string;
  templateName: string;
  tenantId: string;
  tenantName: string;
  path: string;
  fullUrl: string;
  customDomain?: string;
  status: 'active' | 'inactive' | 'pending' | 'error';
  createdAt: string;
  lastAccessed: string;
  accessCount: number;
  seoScore: number;
  loadTime: number;
  isGenerated: boolean;
}

interface RouteTemplate {
  id: string;
  name: string;
  pattern: string;
  variables: string[];
  description: string;
  category: string;
}

interface RouteGenerationRequest {
  templateId: string;
  tenantId: string;
  customPath?: string;
  customDomain?: string;
  variables: Record<string, string>;
  seoSettings: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export default function DynamicRoutingPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [routes, setRoutes] = useState<DynamicRoute[]>([
    {
      id: 'route_001',
      templateId: 'tmpl_landing_001',
      templateName: 'Consultation Landing Page',
      tenantId: 'tenant_abc123',
      tenantName: 'Acme Consulting',
      path: '/acme-consulting/consultation',
      fullUrl: 'https://app.example.com/acme-consulting/consultation',
      status: 'active',
      createdAt: '2025-09-18T20:30:00Z',
      lastAccessed: '2025-09-18T20:45:00Z',
      accessCount: 47,
      seoScore: 85,
      loadTime: 1.2,
      isGenerated: true
    },
    {
      id: 'route_002',
      templateId: 'tmpl_questionnaire_001',
      templateName: 'Client Questionnaire Flow',
      tenantId: 'tenant_abc123',
      tenantName: 'Acme Consulting',
      path: '/acme-consulting/questionnaire',
      fullUrl: 'https://app.example.com/acme-consulting/questionnaire',
      status: 'active',
      createdAt: '2025-09-18T20:32:00Z',
      lastAccessed: '2025-09-18T20:42:00Z',
      accessCount: 23,
      seoScore: 78,
      loadTime: 0.9,
      isGenerated: true
    },
    {
      id: 'route_003',
      templateId: 'tmpl_pdf_001',
      templateName: 'PDF Consultation Report',
      tenantId: 'tenant_def456',
      tenantName: 'Beta Solutions',
      path: '/beta-solutions/consultation-report',
      fullUrl: 'https://app.example.com/beta-solutions/consultation-report',
      customDomain: 'consulting.betasolutions.com',
      status: 'pending',
      createdAt: '2025-09-18T20:35:00Z',
      lastAccessed: '2025-09-18T20:35:00Z',
      accessCount: 0,
      seoScore: 92,
      loadTime: 0,
      isGenerated: false
    }
  ]);

  const [routeTemplates] = useState<RouteTemplate[]>([
    {
      id: 'rt_001',
      name: 'Landing Page Route',
      pattern: '/{tenant-slug}/{template-slug}',
      variables: ['tenant-slug', 'template-slug'],
      description: 'Standard landing page routing pattern',
      category: 'landing-page'
    },
    {
      id: 'rt_002',
      name: 'Questionnaire Route',
      pattern: '/{tenant-slug}/questionnaire/{step?}',
      variables: ['tenant-slug', 'step'],
      description: 'Multi-step questionnaire routing with optional step parameter',
      category: 'questionnaire'
    },
    {
      id: 'rt_003',
      name: 'Custom Domain Route',
      pattern: '/{custom-path}',
      variables: ['custom-path'],
      description: 'Custom domain routing for branded experiences',
      category: 'custom-domain'
    }
  ]);

  const [newRoute, setNewRoute] = useState<Partial<RouteGenerationRequest>>({
    templateId: '',
    tenantId: '',
    customPath: '',
    customDomain: '',
    variables: {},
    seoSettings: {}
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleGenerateRoute = async () => {
    if (!newRoute.templateId || !newRoute.tenantId) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate route generation process
    const steps = ['Validating template', 'Generating route pattern', 'Setting up navigation', 'Optimizing SEO', 'Deploying route'];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setGenerationProgress(((i + 1) / steps.length) * 100);
    }

    // Create new route
    const route: DynamicRoute = {
      id: `route_${Date.now()}`,
      templateId: newRoute.templateId,
      templateName: `Template ${newRoute.templateId.slice(-3)}`,
      tenantId: newRoute.tenantId,
      tenantName: `Tenant ${newRoute.tenantId.slice(-3)}`,
      path: newRoute.customPath || `/${newRoute.tenantId}/${newRoute.templateId}`,
      fullUrl: newRoute.customDomain
        ? `https://${newRoute.customDomain}${newRoute.customPath || '/'}`
        : `https://app.example.com/${newRoute.tenantId}/${newRoute.templateId}`,
      customDomain: newRoute.customDomain,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      accessCount: 0,
      seoScore: 88,
      loadTime: 1.1,
      isGenerated: true
    };

    setRoutes(prev => [route, ...prev]);
    setIsGenerating(false);
    setGenerationProgress(0);
    setNewRoute({
      templateId: '',
      tenantId: '',
      customPath: '',
      customDomain: '',
      variables: {},
      seoSettings: {}
    });
  };

  const handleDeleteRoute = (routeId: string) => {
    setRoutes(prev => prev.filter(route => route.id !== routeId));
  };

  const handleToggleRouteStatus = (routeId: string) => {
    setRoutes(prev =>
      prev.map(route =>
        route.id === routeId
          ? { ...route, status: route.status === 'active' ? 'inactive' : 'active' }
          : route
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <AlertCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const routeStats = {
    totalRoutes: routes.length,
    activeRoutes: routes.filter(r => r.status === 'active').length,
    totalAccess: routes.reduce((sum, r) => sum + r.accessCount, 0),
    avgSeoScore: Math.round(routes.reduce((sum, r) => sum + r.seoScore, 0) / routes.length),
    avgLoadTime: Number((routes.reduce((sum, r) => sum + r.loadTime, 0) / routes.length).toFixed(1)),
    customDomains: routes.filter(r => r.customDomain).length
  };

  useEffect(() => {
    // Simulate real-time route access updates
    const interval = setInterval(() => {
      setRoutes(prev =>
        prev.map(route =>
          route.status === 'active' && Math.random() > 0.7
            ? {
                ...route,
                accessCount: route.accessCount + Math.floor(Math.random() * 3),
                lastAccessed: new Date().toISOString()
              }
            : route
        )
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dynamic Routing System</h1>
          <p className="text-muted-foreground">
            Template-based route generation and management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{routeStats.totalRoutes} Routes</Badge>
          <Button onClick={() => setSelectedTab('generate')}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Route
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="routes">Active Routes</TabsTrigger>
          <TabsTrigger value="templates">Route Templates</TabsTrigger>
          <TabsTrigger value="generate">Generate Route</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
                <Route className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routeStats.totalRoutes}</div>
                <p className="text-xs text-muted-foreground">
                  {routeStats.activeRoutes} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Access</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routeStats.totalAccess.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Route visits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg SEO Score</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routeStats.avgSeoScore}</div>
                <p className="text-xs text-muted-foreground">
                  Out of 100
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routeStats.avgLoadTime}s</div>
                <p className="text-xs text-muted-foreground">
                  Response time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Custom Domains</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routeStats.customDomains}</div>
                <p className="text-xs text-muted-foreground">
                  Branded routes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Route Network</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground">
                  System status
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Route Generation Overview</CardTitle>
              <CardDescription>Dynamic routing system capabilities and features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Routing Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Template-based route generation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Custom domain support</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">SEO optimization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Real-time navigation</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">System Capabilities</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Automatic URL generation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Route conflict detection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Performance monitoring</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Analytics integration</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Routes</CardTitle>
              <CardDescription>Currently deployed dynamic routes and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routes.map((route) => (
                  <div key={route.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getStatusColor(route.status)} text-white`}>
                        {getStatusIcon(route.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{route.templateName}</h4>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{route.tenantName}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <LinkIcon className="h-3 w-3" />
                            <span>{route.path}</span>
                          </div>
                          {route.customDomain && (
                            <div className="flex items-center space-x-1">
                              <Globe className="h-3 w-3" />
                              <span>{route.customDomain}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium">{route.accessCount}</p>
                            <p className="text-muted-foreground">visits</p>
                          </div>
                          <div>
                            <p className="font-medium">{route.seoScore}</p>
                            <p className="text-muted-foreground">SEO</p>
                          </div>
                          <div>
                            <p className="font-medium">{route.loadTime}s</p>
                            <p className="text-muted-foreground">load</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleRouteStatus(route.id)}
                        >
                          {route.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRoute(route.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Route Templates</CardTitle>
              <CardDescription>Predefined routing patterns for different template types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {routeTemplates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs font-medium">Pattern</Label>
                          <code className="block p-2 bg-muted rounded text-sm font-mono">
                            {template.pattern}
                          </code>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">Variables</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.variables.map((variable, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Route</CardTitle>
              <CardDescription>Create a new dynamic route from a template</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-id">Template ID</Label>
                    <Input
                      id="template-id"
                      placeholder="e.g., tmpl_landing_001"
                      value={newRoute.templateId || ''}
                      onChange={(e) => setNewRoute(prev => ({ ...prev, templateId: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tenant-id">Tenant ID</Label>
                    <Input
                      id="tenant-id"
                      placeholder="e.g., tenant_abc123"
                      value={newRoute.tenantId || ''}
                      onChange={(e) => setNewRoute(prev => ({ ...prev, tenantId: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="custom-path">Custom Path (Optional)</Label>
                    <Input
                      id="custom-path"
                      placeholder="e.g., /my-custom-path"
                      value={newRoute.customPath || ''}
                      onChange={(e) => setNewRoute(prev => ({ ...prev, customPath: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="custom-domain">Custom Domain (Optional)</Label>
                    <Input
                      id="custom-domain"
                      placeholder="e.g., consulting.example.com"
                      value={newRoute.customDomain || ''}
                      onChange={(e) => setNewRoute(prev => ({ ...prev, customDomain: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="seo-title">SEO Title</Label>
                    <Input
                      id="seo-title"
                      placeholder="Page title for SEO"
                      value={newRoute.seoSettings?.title || ''}
                      onChange={(e) => setNewRoute(prev => ({
                        ...prev,
                        seoSettings: { ...prev.seoSettings, title: e.target.value }
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="seo-description">SEO Description</Label>
                    <Textarea
                      id="seo-description"
                      placeholder="Meta description for search engines"
                      value={newRoute.seoSettings?.description || ''}
                      onChange={(e) => setNewRoute(prev => ({
                        ...prev,
                        seoSettings: { ...prev.seoSettings, description: e.target.value }
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="seo-keywords">SEO Keywords</Label>
                    <Input
                      id="seo-keywords"
                      placeholder="keyword1, keyword2, keyword3"
                      value={newRoute.seoSettings?.keywords?.join(', ') || ''}
                      onChange={(e) => setNewRoute(prev => ({
                        ...prev,
                        seoSettings: {
                          ...prev.seoSettings,
                          keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                        }
                      }))}
                    />
                  </div>

                  <Button
                    onClick={handleGenerateRoute}
                    disabled={isGenerating || !newRoute.templateId || !newRoute.tenantId}
                    className="w-full"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Route'}
                  </Button>

                  {isGenerating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Generation Progress</span>
                        <span>{generationProgress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}