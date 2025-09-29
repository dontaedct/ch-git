'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Play,
  Pause,
  RefreshCw,
  Code,
  Eye,
  Settings,
  Monitor,
  Smartphone,
  Tablet,
  Layers,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  Copy,
  Edit,
  Maximize,
  Minimize
} from 'lucide-react';

interface TemplateRenderState {
  id: string;
  templateId: string;
  templateName: string;
  status: 'idle' | 'rendering' | 'rendered' | 'error';
  progress: number;
  renderTime: number;
  componentCount: number;
  props: Record<string, any>;
  renderedHtml: string;
  error?: string;
  timestamp: string;
}

interface ComponentMapping {
  id: string;
  name: string;
  type: string;
  path: string;
  props: Record<string, any>;
  children: ComponentMapping[];
  isLoaded: boolean;
  renderTime: number;
}

interface RenderConfiguration {
  templateId: string;
  viewport: 'desktop' | 'tablet' | 'mobile';
  theme: 'light' | 'dark' | 'auto';
  hydration: boolean;
  ssr: boolean;
  optimization: 'none' | 'basic' | 'aggressive';
  caching: boolean;
  debugging: boolean;
}

export default function TemplateRendererPage() {
  const [selectedTab, setSelectedTab] = useState('renderer');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const previewRef = useRef<HTMLIFrameElement>(null);

  const [renderStates, setRenderStates] = useState<TemplateRenderState[]>([
    {
      id: 'render_001',
      templateId: 'tmpl_landing_001',
      templateName: 'Consultation Landing Page',
      status: 'rendered',
      progress: 100,
      renderTime: 1234,
      componentCount: 8,
      props: {
        title: 'Professional Business Solutions',
        subtitle: 'Transform your business with our expert consultation services',
        ctaText: 'Start Free Consultation'
      },
      renderedHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Professional Business Solutions</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; }
    .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4rem 2rem; text-align: center; }
    .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
    .hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; }
    .cta-button { background: #ff6b6b; color: white; padding: 1rem 2rem; border: none; border-radius: 0.5rem; font-size: 1.1rem; cursor: pointer; }
    .features { padding: 4rem 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto; }
    .feature-card { background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); text-align: center; }
  </style>
</head>
<body>
  <div class="hero">
    <h1>Professional Business Solutions</h1>
    <p>Transform your business with our expert consultation services</p>
    <button class="cta-button">Start Free Consultation</button>
  </div>
  <div class="features">
    <div class="feature-card">
      <h3>Fast Setup</h3>
      <p>Quick and easy onboarding process</p>
    </div>
    <div class="feature-card">
      <h3>Secure Data</h3>
      <p>Enterprise-grade security measures</p>
    </div>
    <div class="feature-card">
      <h3>Scalable</h3>
      <p>Grows with your business needs</p>
    </div>
  </div>
</body>
</html>`,
      timestamp: '2025-09-18T20:30:00Z'
    }
  ]);

  const [componentMappings] = useState<ComponentMapping[]>([
    {
      id: 'comp_001',
      name: 'HeroSection',
      type: 'hero',
      path: '@/components/sections/HeroSection',
      props: { title: 'string', subtitle: 'string', ctaText: 'string' },
      children: [
        {
          id: 'comp_002',
          name: 'CTAButton',
          type: 'button',
          path: '@/components/ui/button',
          props: { text: 'string', variant: 'primary' },
          children: [],
          isLoaded: true,
          renderTime: 45
        }
      ],
      isLoaded: true,
      renderTime: 234
    },
    {
      id: 'comp_003',
      name: 'FeatureGrid',
      type: 'grid',
      path: '@/components/sections/FeatureGrid',
      props: { features: 'array', columns: 'number' },
      children: [
        {
          id: 'comp_004',
          name: 'FeatureCard',
          type: 'card',
          path: '@/components/cards/FeatureCard',
          props: { title: 'string', description: 'string', icon: 'string' },
          children: [],
          isLoaded: true,
          renderTime: 67
        }
      ],
      isLoaded: true,
      renderTime: 189
    }
  ]);

  const [renderConfig, setRenderConfig] = useState<RenderConfiguration>({
    templateId: 'tmpl_landing_001',
    viewport: 'desktop',
    theme: 'light',
    hydration: true,
    ssr: true,
    optimization: 'basic',
    caching: true,
    debugging: false
  });

  const [currentTemplate, setCurrentTemplate] = useState({
    id: 'tmpl_landing_001',
    name: 'Consultation Landing Page',
    jsx: `import React from 'react';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  title: string;
  subtitle: string;
  ctaText: string;
}

export default function LandingPage({ title, subtitle, ctaText }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="hero-section bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">{title}</h1>
          <p className="text-xl mb-8 opacity-90">{subtitle}</p>
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
            {ctaText}
          </Button>
        </div>
      </div>

      <div className="features-section py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Setup</h3>
              <p className="text-gray-600">Quick and easy onboarding process</p>
            </div>

            <div className="feature-card text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Data</h3>
              <p className="text-gray-600">Enterprise-grade security measures</p>
            </div>

            <div className="feature-card text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Scalable</h3>
              <p className="text-gray-600">Grows with your business needs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
    props: {
      title: 'Professional Business Solutions',
      subtitle: 'Transform your business with our expert consultation services',
      ctaText: 'Start Free Consultation'
    }
  });

  const handleRender = async () => {
    setIsRendering(true);
    setRenderProgress(0);

    // Simulate rendering process
    const steps = [
      'Parsing template',
      'Loading components',
      'Mapping props',
      'Rendering JSX',
      'Optimizing output',
      'Finalizing render'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRenderProgress(((i + 1) / steps.length) * 100);
    }

    // Create new render state
    const newRender: TemplateRenderState = {
      id: `render_${Date.now()}`,
      templateId: renderConfig.templateId,
      templateName: currentTemplate.name,
      status: 'rendered',
      progress: 100,
      renderTime: 1234 + Math.random() * 500,
      componentCount: componentMappings.length,
      props: currentTemplate.props,
      renderedHtml: renderStates[0].renderedHtml, // Use existing HTML for demo
      timestamp: new Date().toISOString()
    };

    setRenderStates(prev => [newRender, ...prev.slice(0, 4)]);
    setIsRendering(false);
    setRenderProgress(0);

    // Update preview iframe
    if (previewRef.current) {
      previewRef.current.srcdoc = newRender.renderedHtml;
    }
  };

  const handleConfigChange = (key: keyof RenderConfiguration, value: any) => {
    setRenderConfig(prev => ({ ...prev, [key]: value }));
  };

  const handlePropsChange = (key: string, value: string) => {
    setCurrentTemplate(prev => ({
      ...prev,
      props: { ...prev.props, [key]: value }
    }));
  };

  const getViewportIcon = (viewport: string) => {
    switch (viewport) {
      case 'desktop': return <Monitor className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rendered': return 'bg-green-500';
      case 'rendering': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      case 'idle': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'rendered': return <CheckCircle className="h-4 w-4" />;
      case 'rendering': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'idle': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    // Initialize preview with first render
    if (previewRef.current && renderStates.length > 0) {
      previewRef.current.srcdoc = renderStates[0].renderedHtml;
    }
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Renderer</h1>
          <p className="text-muted-foreground">
            Dynamic template rendering and component injection system
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {componentMappings.filter(c => c.isLoaded).length}/{componentMappings.length} Components Loaded
          </Badge>
          <Button
            onClick={handleRender}
            disabled={isRendering}
            className="flex items-center space-x-2"
          >
            {isRendering ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{isRendering ? 'Rendering...' : 'Render Template'}</span>
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="renderer">Renderer</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
          <TabsTrigger value="components">Component Map</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="history">Render History</TabsTrigger>
        </TabsList>

        <TabsContent value="renderer" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Template Rendering Engine</CardTitle>
                      <CardDescription>
                        Render {currentTemplate.name} with dynamic component injection
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{renderConfig.viewport}</Badge>
                      {getViewportIcon(renderConfig.viewport)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="template-jsx">Template JSX Source</Label>
                      <Textarea
                        id="template-jsx"
                        value={currentTemplate.jsx}
                        onChange={(e) => setCurrentTemplate(prev => ({ ...prev, jsx: e.target.value }))}
                        className="min-h-[300px] font-mono text-sm"
                      />
                    </div>

                    {isRendering && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Rendering Progress</span>
                          <span>{renderProgress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${renderProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Layers className="h-4 w-4 mr-2" />
                        Rendering Pipeline
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span>Parse</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          <span>Load</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                          <span>Map</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>Render</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          <span>Optimize</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span>Output</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Template Props</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(currentTemplate.props).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={key} className="capitalize">{key}</Label>
                      <Input
                        id={key}
                        value={value as string}
                        onChange={(e) => handlePropsChange(key, e.target.value)}
                      />
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Render Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <Label>Viewport</Label>
                        <select
                          className="w-full p-2 border rounded"
                          value={renderConfig.viewport}
                          onChange={(e) => handleConfigChange('viewport', e.target.value)}
                        >
                          <option value="desktop">Desktop</option>
                          <option value="tablet">Tablet</option>
                          <option value="mobile">Mobile</option>
                        </select>
                      </div>

                      <div>
                        <Label>Theme</Label>
                        <select
                          className="w-full p-2 border rounded"
                          value={renderConfig.theme}
                          onChange={(e) => handleConfigChange('theme', e.target.value)}
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="hydration">Hydration</Label>
                          <input
                            id="hydration"
                            type="checkbox"
                            checked={renderConfig.hydration}
                            onChange={(e) => handleConfigChange('hydration', e.target.checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="ssr">SSR</Label>
                          <input
                            id="ssr"
                            type="checkbox"
                            checked={renderConfig.ssr}
                            onChange={(e) => handleConfigChange('ssr', e.target.checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="caching">Caching</Label>
                          <input
                            id="caching"
                            type="checkbox"
                            checked={renderConfig.caching}
                            onChange={(e) => handleConfigChange('caching', e.target.checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Live Preview</CardTitle>
                  <CardDescription>Real-time template rendering preview</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Maximize className="h-4 w-4 mr-2" />
                    Fullscreen
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy HTML
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-4 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={renderConfig.viewport === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleConfigChange('viewport', 'desktop')}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      Desktop
                    </Button>
                    <Button
                      variant={renderConfig.viewport === 'tablet' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleConfigChange('viewport', 'tablet')}
                    >
                      <Tablet className="h-4 w-4 mr-2" />
                      Tablet
                    </Button>
                    <Button
                      variant={renderConfig.viewport === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleConfigChange('viewport', 'mobile')}
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Mobile
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    </div>
                    <div className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                      {renderConfig.viewport === 'desktop' ? '1024px' : renderConfig.viewport === 'tablet' ? '768px' : '375px'}
                    </div>
                  </div>
                  <iframe
                    ref={previewRef}
                    className={`w-full bg-white transition-all duration-300 ${
                      renderConfig.viewport === 'desktop' ? 'h-[600px]' :
                      renderConfig.viewport === 'tablet' ? 'h-[500px] max-w-[768px] mx-auto' :
                      'h-[600px] max-w-[375px] mx-auto'
                    }`}
                    title="Template Preview"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Component Mapping</CardTitle>
              <CardDescription>Dynamic component loading and injection system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {componentMappings.map((component) => (
                  <div key={component.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${component.isLoaded ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                          <Layers className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{component.name}</h4>
                          <p className="text-sm text-muted-foreground">{component.path}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={component.isLoaded ? "default" : "secondary"}>
                          {component.isLoaded ? 'Loaded' : 'Loading'}
                        </Badge>
                        <Badge variant="outline">{component.type}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <Label className="text-xs">Render Time</Label>
                        <div className="text-sm font-medium">{component.renderTime}ms</div>
                      </div>
                      <div>
                        <Label className="text-xs">Children</Label>
                        <div className="text-sm font-medium">{component.children.length} components</div>
                      </div>
                      <div>
                        <Label className="text-xs">Props</Label>
                        <div className="text-sm font-medium">{Object.keys(component.props).length} properties</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Props Schema</Label>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(component.props).map(([key, type]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {type as string}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {component.children.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-200">
                        <Label className="text-xs text-muted-foreground">Child Components</Label>
                        <div className="space-y-2 mt-1">
                          {component.children.map((child) => (
                            <div key={child.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${child.isLoaded ? 'bg-green-500' : 'bg-gray-500'}`} />
                                <span>{child.name}</span>
                                <Badge variant="outline" className="text-xs">{child.type}</Badge>
                              </div>
                              <span className="text-muted-foreground">{child.renderTime}ms</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Renderer Configuration</CardTitle>
              <CardDescription>Advanced rendering and optimization settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Rendering Options</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="optimization">Optimization Level</Label>
                      <select
                        id="optimization"
                        className="w-full p-2 border rounded"
                        value={renderConfig.optimization}
                        onChange={(e) => handleConfigChange('optimization', e.target.value)}
                      >
                        <option value="none">None</option>
                        <option value="basic">Basic</option>
                        <option value="aggressive">Aggressive</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="hydration-config">Client Hydration</Label>
                        <input
                          id="hydration-config"
                          type="checkbox"
                          checked={renderConfig.hydration}
                          onChange={(e) => handleConfigChange('hydration', e.target.checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ssr-config">Server-Side Rendering</Label>
                        <input
                          id="ssr-config"
                          type="checkbox"
                          checked={renderConfig.ssr}
                          onChange={(e) => handleConfigChange('ssr', e.target.checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="caching-config">Component Caching</Label>
                        <input
                          id="caching-config"
                          type="checkbox"
                          checked={renderConfig.caching}
                          onChange={(e) => handleConfigChange('caching', e.target.checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="debugging-config">Debug Mode</Label>
                        <input
                          id="debugging-config"
                          type="checkbox"
                          checked={renderConfig.debugging}
                          onChange={(e) => handleConfigChange('debugging', e.target.checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Performance Settings</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Component Caching:</span>
                        <span className={renderConfig.caching ? 'text-green-600' : 'text-red-600'}>
                          {renderConfig.caching ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lazy Loading:</span>
                        <span className="text-green-600">Enabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Code Splitting:</span>
                        <span className="text-green-600">Enabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tree Shaking:</span>
                        <span className={renderConfig.optimization !== 'none' ? 'text-green-600' : 'text-red-600'}>
                          {renderConfig.optimization !== 'none' ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Render History</CardTitle>
              <CardDescription>Recent template rendering results and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {renderStates.map((render) => (
                  <div key={render.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getStatusColor(render.status)} text-white`}>
                        {getStatusIcon(render.status)}
                      </div>
                      <div>
                        <h4 className="font-medium">{render.templateName}</h4>
                        <p className="text-sm text-muted-foreground">ID: {render.templateId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium">{render.renderTime}ms</p>
                            <p className="text-muted-foreground">render time</p>
                          </div>
                          <div>
                            <p className="font-medium">{render.componentCount}</p>
                            <p className="text-muted-foreground">components</p>
                          </div>
                          <div>
                            <p className="font-medium">{render.progress}%</p>
                            <p className="text-muted-foreground">complete</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
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