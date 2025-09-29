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
  Package,
  Puzzle,
  GitBranch,
  Link2,
  Unlink,
  Play,
  Square,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Code,
  Settings,
  Layers,
  Zap,
  Database,
  Upload,
  Download,
  Copy,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

interface ComponentDefinition {
  id: string;
  name: string;
  type: string;
  path: string;
  version: string;
  status: 'available' | 'loading' | 'loaded' | 'error' | 'injected';
  props: Record<string, any>;
  dependencies: string[];
  size: number;
  loadTime: number;
  lastUsed: string;
  usageCount: number;
  description: string;
  tags: string[];
}

interface InjectionPoint {
  id: string;
  templateId: string;
  componentId: string;
  slot: string;
  position: number;
  props: Record<string, any>;
  isActive: boolean;
  injectedAt: string;
  renderTime: number;
}

interface InjectionRule {
  id: string;
  name: string;
  condition: string;
  componentId: string;
  targetSlot: string;
  priority: number;
  isEnabled: boolean;
  description: string;
}

export default function ComponentInjectionPage() {
  const [selectedTab, setSelectedTab] = useState('components');
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectionProgress, setInjectionProgress] = useState(0);

  const [components, setComponents] = useState<ComponentDefinition[]>([
    {
      id: 'comp_hero_001',
      name: 'HeroSection',
      type: 'section',
      path: '@/components/sections/HeroSection',
      version: '1.2.0',
      status: 'loaded',
      props: {
        title: { type: 'string', required: true, default: 'Welcome' },
        subtitle: { type: 'string', required: false, default: '' },
        backgroundImage: { type: 'string', required: false, default: '' },
        ctaButton: { type: 'object', required: false, default: {} }
      },
      dependencies: ['@/components/ui/button', 'react'],
      size: 15420,
      loadTime: 234,
      lastUsed: '2025-09-18T20:30:00Z',
      usageCount: 47,
      description: 'Hero section with customizable title, subtitle, and call-to-action button',
      tags: ['hero', 'landing', 'cta']
    },
    {
      id: 'comp_feature_001',
      name: 'FeatureGrid',
      type: 'grid',
      path: '@/components/sections/FeatureGrid',
      version: '1.0.3',
      status: 'loaded',
      props: {
        features: { type: 'array', required: true, default: [] },
        columns: { type: 'number', required: false, default: 3 },
        layout: { type: 'string', required: false, default: 'grid' }
      },
      dependencies: ['@/components/ui/card', 'react'],
      size: 8760,
      loadTime: 156,
      lastUsed: '2025-09-18T20:25:00Z',
      usageCount: 32,
      description: 'Responsive grid layout for showcasing product features',
      tags: ['features', 'grid', 'showcase']
    },
    {
      id: 'comp_form_001',
      name: 'ContactForm',
      type: 'form',
      path: '@/components/forms/ContactForm',
      version: '2.1.0',
      status: 'available',
      props: {
        title: { type: 'string', required: false, default: 'Contact Us' },
        fields: { type: 'array', required: true, default: [] },
        submitUrl: { type: 'string', required: true, default: '' },
        validation: { type: 'object', required: false, default: {} }
      },
      dependencies: ['@/components/ui/input', '@/components/ui/button', 'react-hook-form'],
      size: 12340,
      loadTime: 189,
      lastUsed: '2025-09-18T19:45:00Z',
      usageCount: 18,
      description: 'Customizable contact form with validation and submission handling',
      tags: ['form', 'contact', 'validation']
    },
    {
      id: 'comp_cta_001',
      name: 'CTASection',
      type: 'section',
      path: '@/components/sections/CTASection',
      version: '1.1.2',
      status: 'error',
      props: {
        title: { type: 'string', required: true, default: 'Get Started' },
        description: { type: 'string', required: false, default: '' },
        buttonText: { type: 'string', required: true, default: 'Start Now' },
        buttonAction: { type: 'function', required: true, default: null }
      },
      dependencies: ['@/components/ui/button', 'react'],
      size: 6890,
      loadTime: 0,
      lastUsed: '2025-09-18T18:30:00Z',
      usageCount: 25,
      description: 'Call-to-action section with customizable messaging and button',
      tags: ['cta', 'action', 'conversion']
    }
  ]);

  const [injectionPoints, setInjectionPoints] = useState<InjectionPoint[]>([
    {
      id: 'inj_001',
      templateId: 'tmpl_landing_001',
      componentId: 'comp_hero_001',
      slot: 'header',
      position: 1,
      props: {
        title: 'Professional Business Solutions',
        subtitle: 'Transform your business with our expert consultation services',
        ctaButton: { text: 'Start Free Consultation', action: 'navigate:/consultation' }
      },
      isActive: true,
      injectedAt: '2025-09-18T20:30:00Z',
      renderTime: 234
    },
    {
      id: 'inj_002',
      templateId: 'tmpl_landing_001',
      componentId: 'comp_feature_001',
      slot: 'content',
      position: 2,
      props: {
        features: [
          { title: 'Fast Setup', description: 'Quick onboarding', icon: 'zap' },
          { title: 'Secure Data', description: 'Enterprise security', icon: 'shield' },
          { title: 'Scalable', description: 'Grows with you', icon: 'trending-up' }
        ],
        columns: 3,
        layout: 'grid'
      },
      isActive: true,
      injectedAt: '2025-09-18T20:32:00Z',
      renderTime: 156
    }
  ]);

  const [injectionRules, setInjectionRules] = useState<InjectionRule[]>([
    {
      id: 'rule_001',
      name: 'Landing Page Hero',
      condition: 'templateType === "landing-page" && slot === "header"',
      componentId: 'comp_hero_001',
      targetSlot: 'header',
      priority: 100,
      isEnabled: true,
      description: 'Automatically inject hero section for all landing pages'
    },
    {
      id: 'rule_002',
      name: 'Feature Grid for Business',
      condition: 'templateCategory === "business" && slot === "content"',
      componentId: 'comp_feature_001',
      targetSlot: 'content',
      priority: 80,
      isEnabled: true,
      description: 'Add feature grid to business-focused templates'
    },
    {
      id: 'rule_003',
      name: 'Contact Form CTA',
      condition: 'hasContactForm === false && slot === "footer"',
      componentId: 'comp_cta_001',
      targetSlot: 'footer',
      priority: 60,
      isEnabled: false,
      description: 'Add CTA section when no contact form is present'
    }
  ]);

  const [newInjection, setNewInjection] = useState({
    templateId: '',
    componentId: '',
    slot: '',
    position: 1,
    props: '{}'
  });

  const handleLoadComponent = async (componentId: string) => {
    setComponents(prev =>
      prev.map(comp =>
        comp.id === componentId
          ? { ...comp, status: 'loading' }
          : comp
      )
    );

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));

    setComponents(prev =>
      prev.map(comp =>
        comp.id === componentId
          ? { ...comp, status: 'loaded', loadTime: Math.random() * 300 + 100 }
          : comp
      )
    );
  };

  const handleInjectComponent = async () => {
    if (!newInjection.templateId || !newInjection.componentId || !newInjection.slot) return;

    setIsInjecting(true);
    setInjectionProgress(0);

    // Simulate injection process
    const steps = ['Validating component', 'Preparing injection point', 'Injecting component', 'Validating render'];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setInjectionProgress(((i + 1) / steps.length) * 100);
    }

    const injection: InjectionPoint = {
      id: `inj_${Date.now()}`,
      templateId: newInjection.templateId,
      componentId: newInjection.componentId,
      slot: newInjection.slot,
      position: newInjection.position,
      props: JSON.parse(newInjection.props || '{}'),
      isActive: true,
      injectedAt: new Date().toISOString(),
      renderTime: Math.random() * 200 + 50
    };

    setInjectionPoints(prev => [injection, ...prev]);
    setIsInjecting(false);
    setInjectionProgress(0);
    setNewInjection({
      templateId: '',
      componentId: '',
      slot: '',
      position: 1,
      props: '{}'
    });
  };

  const handleToggleInjection = (injectionId: string) => {
    setInjectionPoints(prev =>
      prev.map(inj =>
        inj.id === injectionId
          ? { ...inj, isActive: !inj.isActive }
          : inj
      )
    );
  };

  const handleRemoveInjection = (injectionId: string) => {
    setInjectionPoints(prev => prev.filter(inj => inj.id !== injectionId));
  };

  const handleToggleRule = (ruleId: string) => {
    setInjectionRules(prev =>
      prev.map(rule =>
        rule.id === ruleId
          ? { ...rule, isEnabled: !rule.isEnabled }
          : rule
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loaded': return 'bg-green-500';
      case 'loading': return 'bg-blue-500';
      case 'available': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'injected': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loaded': return <CheckCircle className="h-4 w-4" />;
      case 'loading': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'available': return <Package className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'injected': return <Link2 className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getComponentById = (id: string) => components.find(comp => comp.id === id);

  const injectionStats = {
    totalComponents: components.length,
    loadedComponents: components.filter(c => c.status === 'loaded').length,
    activeInjections: injectionPoints.filter(i => i.isActive).length,
    totalInjections: injectionPoints.length,
    enabledRules: injectionRules.filter(r => r.isEnabled).length,
    avgRenderTime: Math.round(injectionPoints.reduce((sum, i) => sum + i.renderTime, 0) / injectionPoints.length || 0)
  };

  useEffect(() => {
    // Simulate real-time component usage updates
    const interval = setInterval(() => {
      setComponents(prev =>
        prev.map(comp =>
          Math.random() > 0.8
            ? { ...comp, usageCount: comp.usageCount + Math.floor(Math.random() * 3) }
            : comp
        )
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Component Injection System</h1>
          <p className="text-muted-foreground">
            Dynamic component loading and template injection management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {injectionStats.loadedComponents}/{injectionStats.totalComponents} Components Loaded
          </Badge>
          <Badge variant="outline">
            {injectionStats.activeInjections} Active Injections
          </Badge>
          <Button onClick={() => setSelectedTab('inject')}>
            <Plus className="h-4 w-4 mr-2" />
            Inject Component
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="injections">Active Injections</TabsTrigger>
          <TabsTrigger value="rules">Injection Rules</TabsTrigger>
          <TabsTrigger value="inject">Inject Component</TabsTrigger>
          <TabsTrigger value="mapping">Component Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Components</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{injectionStats.totalComponents}</div>
                <p className="text-xs text-muted-foreground">
                  {injectionStats.loadedComponents} loaded
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Injections</CardTitle>
                <Link2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{injectionStats.activeInjections}</div>
                <p className="text-xs text-muted-foreground">
                  {injectionStats.totalInjections} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enabled Rules</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{injectionStats.enabledRules}</div>
                <p className="text-xs text-muted-foreground">
                  Automation rules
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Render Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{injectionStats.avgRenderTime}ms</div>
                <p className="text-xs text-muted-foreground">
                  Injection performance
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Available Components</CardTitle>
              <CardDescription>Component library for template injection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {components.map((component) => (
                  <div key={component.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getStatusColor(component.status)} text-white`}>
                        {getStatusIcon(component.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{component.name}</h4>
                          <Badge variant="outline">{component.type}</Badge>
                          <Badge variant="secondary">v{component.version}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{component.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Path: {component.path}</span>
                          <span>Size: {(component.size / 1024).toFixed(1)}KB</span>
                          <span>Used: {component.usageCount} times</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {component.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right mr-4">
                        <p className="text-sm font-medium">{component.loadTime}ms</p>
                        <p className="text-xs text-muted-foreground">load time</p>
                      </div>
                      {component.status === 'available' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadComponent(component.id)}
                        >
                          Load
                        </Button>
                      )}
                      {component.status === 'loaded' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setNewInjection(prev => ({ ...prev, componentId: component.id }));
                            setSelectedTab('inject');
                          }}
                        >
                          Inject
                        </Button>
                      )}
                      {component.status === 'error' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleLoadComponent(component.id)}
                        >
                          Retry
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="injections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Component Injections</CardTitle>
              <CardDescription>Currently injected components and their configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {injectionPoints.map((injection) => {
                  const component = getComponentById(injection.componentId);
                  return (
                    <div key={injection.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${injection.isActive ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                          {injection.isActive ? <Link2 className="h-4 w-4" /> : <Unlink className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{component?.name || 'Unknown Component'}</h4>
                            <Badge variant="outline">{injection.slot}</Badge>
                            <Badge variant="secondary">Position {injection.position}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Template: {injection.templateId}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Injected: {new Date(injection.injectedAt).toLocaleString()}</span>
                            <span>Render: {injection.renderTime}ms</span>
                            <span>Props: {Object.keys(injection.props).length} configured</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={injection.isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleInjection(injection.id)}
                        >
                          {injection.isActive ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          {injection.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveInjection(injection.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Injection Rules</CardTitle>
              <CardDescription>Automated component injection rules based on conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {injectionRules.map((rule) => {
                  const component = getComponentById(rule.componentId);
                  return (
                    <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${rule.isEnabled ? 'bg-blue-500' : 'bg-gray-500'} text-white`}>
                          <GitBranch className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{rule.name}</h4>
                            <Badge variant="outline">Priority {rule.priority}</Badge>
                            <Badge variant={rule.isEnabled ? "default" : "secondary"}>
                              {rule.isEnabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{rule.description}</p>
                          <div className="space-y-1 text-xs">
                            <div><strong>Condition:</strong> <code className="bg-muted px-1 rounded">{rule.condition}</code></div>
                            <div><strong>Component:</strong> {component?.name || 'Unknown'}</div>
                            <div><strong>Target Slot:</strong> {rule.targetSlot}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={rule.isEnabled ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleRule(rule.id)}
                        >
                          {rule.isEnabled ? 'Disable' : 'Enable'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inject" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inject Component</CardTitle>
              <CardDescription>Manually inject a component into a template</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-id">Template ID</Label>
                    <Input
                      id="template-id"
                      placeholder="e.g., tmpl_landing_001"
                      value={newInjection.templateId}
                      onChange={(e) => setNewInjection(prev => ({ ...prev, templateId: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="component-select">Component</Label>
                    <select
                      id="component-select"
                      className="w-full p-2 border rounded"
                      value={newInjection.componentId}
                      onChange={(e) => setNewInjection(prev => ({ ...prev, componentId: e.target.value }))}
                    >
                      <option value="">Select a component...</option>
                      {components.filter(c => c.status === 'loaded').map((component) => (
                        <option key={component.id} value={component.id}>
                          {component.name} ({component.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="slot">Injection Slot</Label>
                    <select
                      id="slot"
                      className="w-full p-2 border rounded"
                      value={newInjection.slot}
                      onChange={(e) => setNewInjection(prev => ({ ...prev, slot: e.target.value }))}
                    >
                      <option value="">Select a slot...</option>
                      <option value="header">Header</option>
                      <option value="content">Content</option>
                      <option value="sidebar">Sidebar</option>
                      <option value="footer">Footer</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      type="number"
                      min="1"
                      value={newInjection.position}
                      onChange={(e) => setNewInjection(prev => ({ ...prev, position: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="component-props">Component Props (JSON)</Label>
                    <Textarea
                      id="component-props"
                      placeholder='{"title": "Example Title", "subtitle": "Example Subtitle"}'
                      value={newInjection.props}
                      onChange={(e) => setNewInjection(prev => ({ ...prev, props: e.target.value }))}
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>

                  <Button
                    onClick={handleInjectComponent}
                    disabled={isInjecting || !newInjection.templateId || !newInjection.componentId || !newInjection.slot}
                    className="w-full"
                  >
                    {isInjecting ? 'Injecting...' : 'Inject Component'}
                  </Button>

                  {isInjecting && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Injection Progress</span>
                        <span>{injectionProgress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${injectionProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {newInjection.componentId && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Selected Component</h4>
                      {(() => {
                        const component = getComponentById(newInjection.componentId);
                        return component ? (
                          <div className="space-y-2 text-sm">
                            <p><strong>Name:</strong> {component.name}</p>
                            <p><strong>Type:</strong> {component.type}</p>
                            <p><strong>Description:</strong> {component.description}</p>
                            <div>
                              <strong>Required Props:</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(component.props)
                                  .filter(([, config]: [string, any]) => config.required)
                                  .map(([prop]) => (
                                    <Badge key={prop} variant="outline" className="text-xs">
                                      {prop}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Component Dependency Mapping</CardTitle>
              <CardDescription>Visual representation of component dependencies and relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {components.map((component) => (
                  <div key={component.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getStatusColor(component.status)} text-white`}>
                          <Puzzle className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{component.name}</h4>
                          <p className="text-sm text-muted-foreground">{component.path}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{component.dependencies.length} dependencies</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs font-medium">Props Schema</Label>
                        <div className="mt-1 space-y-1">
                          {Object.entries(component.props).map(([prop, config]: [string, any]) => (
                            <div key={prop} className="flex items-center justify-between text-xs">
                              <span className={config.required ? 'font-medium' : 'text-muted-foreground'}>
                                {prop}
                              </span>
                              <div className="flex items-center space-x-1">
                                <Badge variant="outline" className="text-xs">{config.type}</Badge>
                                {config.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium">Dependencies</Label>
                        <div className="mt-1 space-y-1">
                          {component.dependencies.map((dep) => (
                            <div key={dep} className="text-xs">
                              <code className="bg-muted px-1 rounded">{dep}</code>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium">Usage Statistics</Label>
                        <div className="mt-1 space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Usage Count:</span>
                            <span className="font-medium">{component.usageCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Load Time:</span>
                            <span className="font-medium">{component.loadTime}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bundle Size:</span>
                            <span className="font-medium">{(component.size / 1024).toFixed(1)}KB</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Used:</span>
                            <span className="font-medium">{new Date(component.lastUsed).toLocaleDateString()}</span>
                          </div>
                        </div>
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