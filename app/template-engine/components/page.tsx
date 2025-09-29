/**
 * @fileoverview Component Mapping Interface
 * Interface for managing template-to-component injection and mapping system
 * HT-029.1.3 Implementation
 */
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ComponentMapping {
  id: string;
  name: string;
  type: 'ui' | 'layout' | 'form' | 'content' | 'integration' | 'custom';
  templatePath: string;
  componentPath: string;
  injectionMethod: 'static' | 'dynamic' | 'lazy' | 'server';
  dependencies: string[];
  props: ComponentProps;
  usage: ComponentUsage;
  performance: ComponentPerformance;
  status: 'active' | 'deprecated' | 'experimental' | 'maintenance';
  lastModified: Date;
  version: string;
}

interface ComponentProps {
  required: PropDefinition[];
  optional: PropDefinition[];
  children?: boolean;
  slots?: string[];
}

interface PropDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'node';
  description: string;
  defaultValue?: any;
  validation?: string;
  example?: any;
}

interface ComponentUsage {
  templates: string[];
  instances: number;
  popularProps: Record<string, number>;
  lastUsed: Date;
}

interface ComponentPerformance {
  bundleSize: number;
  renderTime: number;
  loadTime: number;
  memoryUsage: number;
  cacheability: 'high' | 'medium' | 'low';
}

interface InjectionStrategy {
  id: string;
  name: string;
  description: string;
  method: 'static' | 'dynamic' | 'lazy' | 'server';
  useCases: string[];
  performance: {
    buildTime: 'fast' | 'medium' | 'slow';
    runtime: 'fast' | 'medium' | 'slow';
    bundleImpact: 'minimal' | 'moderate' | 'significant';
  };
  pros: string[];
  cons: string[];
}

export default function ComponentMappingPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [componentMappings, setComponentMappings] = useState<ComponentMapping[]>([]);
  const [injectionStrategies] = useState<InjectionStrategy[]>([
    {
      id: "static",
      name: "Static Injection",
      description: "Components are bundled at build time with the template",
      method: "static",
      useCases: ["Core UI components", "Layout components", "Headers/Footers"],
      performance: {
        buildTime: "fast",
        runtime: "fast",
        bundleImpact: "moderate"
      },
      pros: ["Fastest runtime performance", "No loading states", "SEO friendly"],
      cons: ["Larger initial bundle", "No dynamic updates", "Build-time dependency"]
    },
    {
      id: "dynamic",
      name: "Dynamic Injection",
      description: "Components are loaded at runtime based on template requirements",
      method: "dynamic",
      useCases: ["Conditional components", "Feature-based components", "A/B test variants"],
      performance: {
        buildTime: "medium",
        runtime: "medium",
        bundleImpact: "minimal"
      },
      pros: ["Smaller initial bundle", "Runtime flexibility", "Feature toggling"],
      cons: ["Loading states required", "Network dependency", "Runtime overhead"]
    },
    {
      id: "lazy",
      name: "Lazy Loading",
      description: "Components are loaded only when needed (viewport/interaction)",
      method: "lazy",
      useCases: ["Below-fold content", "Modal dialogs", "Advanced features"],
      performance: {
        buildTime: "fast",
        runtime: "slow",
        bundleImpact: "minimal"
      },
      pros: ["Optimal initial load", "Reduced memory usage", "Progressive enhancement"],
      cons: ["Loading delays", "Complex state management", "Hydration complexity"]
    },
    {
      id: "server",
      name: "Server-Side Injection",
      description: "Components are rendered on the server and injected as HTML",
      method: "server",
      useCases: ["SEO-critical content", "Static content", "Performance-critical views"],
      performance: {
        buildTime: "slow",
        runtime: "fast",
        bundleImpact: "minimal"
      },
      pros: ["Best SEO", "Fastest perceived performance", "No hydration cost"],
      cons: ["No client interactivity", "Server complexity", "Limited dynamic behavior"]
    }
  ]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadComponentData = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockMappings: ComponentMapping[] = [
        {
          id: "hero-section",
          name: "Hero Section",
          type: "layout",
          templatePath: "templates/consultation-mvp/components/Hero.tsx",
          componentPath: "components/ui/hero.tsx",
          injectionMethod: "static",
          dependencies: ["Button", "Container", "Typography"],
          props: {
            required: [
              {
                name: "title",
                type: "string",
                description: "Main hero title text",
                example: "Free Business Consultation"
              },
              {
                name: "subtitle",
                type: "string",
                description: "Supporting subtitle text",
                example: "Get expert insights for your business"
              }
            ],
            optional: [
              {
                name: "backgroundImage",
                type: "string",
                description: "URL to background image",
                defaultValue: null
              },
              {
                name: "ctaText",
                type: "string",
                description: "Call-to-action button text",
                defaultValue: "Get Started"
              }
            ],
            children: false,
            slots: ["cta", "media"]
          },
          usage: {
            templates: ["consultation-mvp", "landing-basic", "business-website"],
            instances: 23,
            popularProps: { title: 23, subtitle: 21, ctaText: 18, backgroundImage: 12 },
            lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          performance: {
            bundleSize: 8400,
            renderTime: 12,
            loadTime: 45,
            memoryUsage: 2.1,
            cacheability: "high"
          },
          status: "active",
          lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          version: "2.1.0"
        },
        {
          id: "business-questionnaire",
          name: "Business Questionnaire",
          type: "form",
          templatePath: "templates/consultation-mvp/components/Questionnaire.tsx",
          componentPath: "components/forms/BusinessQuestionnaire.tsx",
          injectionMethod: "dynamic",
          dependencies: ["FormField", "ProgressBar", "ValidationEngine", "ConditionalLogic"],
          props: {
            required: [
              {
                name: "questions",
                type: "array",
                description: "Array of question configurations",
                example: [{ id: "company-name", type: "text", required: true }]
              },
              {
                name: "onSubmit",
                type: "function",
                description: "Callback function when form is submitted"
              }
            ],
            optional: [
              {
                name: "showProgress",
                type: "boolean",
                description: "Whether to show progress indicator",
                defaultValue: true
              },
              {
                name: "saveProgress",
                type: "boolean",
                description: "Auto-save form progress",
                defaultValue: true
              }
            ],
            children: false,
            slots: ["header", "footer", "sidebar"]
          },
          usage: {
            templates: ["consultation-mvp", "intake-form", "assessment-tool"],
            instances: 8,
            popularProps: { questions: 8, onSubmit: 8, showProgress: 6, saveProgress: 5 },
            lastUsed: new Date(Date.now() - 30 * 60 * 1000)
          },
          performance: {
            bundleSize: 24600,
            renderTime: 28,
            loadTime: 120,
            memoryUsage: 5.4,
            cacheability: "medium"
          },
          status: "active",
          lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          version: "1.8.3"
        },
        {
          id: "pdf-generator",
          name: "PDF Report Generator",
          type: "integration",
          templatePath: "templates/consultation-mvp/components/PDFGenerator.tsx",
          componentPath: "components/integrations/PDFGenerator.tsx",
          injectionMethod: "lazy",
          dependencies: ["ChartGenerator", "TemplateRenderer", "BrandingEngine"],
          props: {
            required: [
              {
                name: "data",
                type: "object",
                description: "Report data to be rendered in PDF"
              },
              {
                name: "template",
                type: "string",
                description: "PDF template identifier"
              }
            ],
            optional: [
              {
                name: "branding",
                type: "object",
                description: "Client branding configuration",
                defaultValue: {}
              },
              {
                name: "options",
                type: "object",
                description: "PDF generation options",
                defaultValue: { format: "A4", orientation: "portrait" }
              }
            ],
            children: false
          },
          usage: {
            templates: ["consultation-mvp", "report-generator"],
            instances: 12,
            popularProps: { data: 12, template: 12, branding: 8, options: 6 },
            lastUsed: new Date(Date.now() - 10 * 60 * 1000)
          },
          performance: {
            bundleSize: 45200,
            renderTime: 85,
            loadTime: 320,
            memoryUsage: 12.8,
            cacheability: "low"
          },
          status: "active",
          lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          version: "3.2.1"
        },
        {
          id: "analytics-tracker",
          name: "Analytics Tracker",
          type: "integration",
          templatePath: "templates/common/components/Analytics.tsx",
          componentPath: "components/analytics/AnalyticsTracker.tsx",
          injectionMethod: "server",
          dependencies: ["EventEmitter", "DataLayer"],
          props: {
            required: [
              {
                name: "trackingId",
                type: "string",
                description: "Analytics tracking identifier"
              }
            ],
            optional: [
              {
                name: "events",
                type: "array",
                description: "Custom events to track",
                defaultValue: []
              },
              {
                name: "anonymize",
                type: "boolean",
                description: "Anonymize user data",
                defaultValue: true
              }
            ],
            children: true
          },
          usage: {
            templates: ["consultation-mvp", "landing-basic", "business-website", "ecommerce-store"],
            instances: 34,
            popularProps: { trackingId: 34, events: 22, anonymize: 28 },
            lastUsed: new Date(Date.now() - 5 * 60 * 1000)
          },
          performance: {
            bundleSize: 3200,
            renderTime: 8,
            loadTime: 25,
            memoryUsage: 1.2,
            cacheability: "high"
          },
          status: "active",
          lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          version: "1.5.2"
        }
      ];

      setComponentMappings(mockMappings);
      setIsLoading(false);
    };

    loadComponentData();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ui': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'layout': return 'bg-green-100 text-green-800 border-green-200';
      case 'form': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'content': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'integration': return 'bg-red-100 text-red-800 border-red-200';
      case 'custom': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInjectionColor = (method: string) => {
    switch (method) {
      case 'static': return 'bg-green-50 text-green-700 border-green-200';
      case 'dynamic': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'lazy': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'server': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'deprecated': return 'bg-red-100 text-red-800 border-red-200';
      case 'experimental': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPerformanceColor = (value: string) => {
    switch (value) {
      case 'fast':
      case 'high':
      case 'minimal': return 'text-green-600';
      case 'medium':
      case 'moderate': return 'text-yellow-600';
      case 'slow':
      case 'low':
      case 'significant': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const filteredComponents = componentMappings.filter(comp =>
    filterType === "all" || comp.type === filterType
  );

  const componentTypes = ["all", "ui", "layout", "form", "content", "integration", "custom"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black/60">Loading component mapping interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-wide uppercase text-black">
                Component Mapping
              </h1>
              <p className="text-black/60 mt-2">
                Template-to-component injection strategies and mapping system architecture
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex gap-3">
              <Link href="/template-engine">
                <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                  ← Dashboard
                </Button>
              </Link>
              <Link href="/template-engine/generation">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                  Page Generation
                </Button>
              </Link>
              <Button className="bg-black text-white hover:bg-gray-800">
                Map Component
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Component Type Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {componentTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 text-sm font-medium uppercase tracking-wide ${
                  filterType === type
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black/30 hover:border-black/50"
                }`}
              >
                {type} {type !== "all" && `(${componentMappings.filter(c => c.type === type).length})`}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Component Mapping Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Component Overview</TabsTrigger>
              <TabsTrigger value="mappings">Active Mappings</TabsTrigger>
              <TabsTrigger value="strategies">Injection Strategies</TabsTrigger>
              <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="border-2 border-black/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-black/60">Total Components</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-black">{componentMappings.length}</div>
                    <Badge variant="outline" className="mt-1 text-xs">Mapped</Badge>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-600">Active</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {componentMappings.filter(c => c.status === 'active').length}
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs border-green-300 text-green-600">Ready</Badge>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-600">Total Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {componentMappings.reduce((sum, c) => sum + c.usage.instances, 0)}
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs border-blue-300 text-blue-600">Instances</Badge>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-600">Avg Bundle Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(componentMappings.reduce((sum, c) => sum + c.performance.bundleSize, 0) / componentMappings.length / 1024)}KB
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs border-purple-300 text-purple-600">Optimized</Badge>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredComponents.map((component, index) => (
                  <motion.div
                    key={component.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`cursor-pointer transition-all duration-300 ${selectedComponent === component.id ? 'scale-105' : 'hover:scale-102'}`}
                    onClick={() => setSelectedComponent(selectedComponent === component.id ? null : component.id)}
                  >
                    <Card className={`border-2 border-black/30 hover:border-black/50 ${selectedComponent === component.id ? 'ring-2 ring-black/20 border-black' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{component.name}</CardTitle>
                            <CardDescription className="mt-1">v{component.version}</CardDescription>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge className={`${getStatusColor(component.status)} text-xs`}>
                              {component.status}
                            </Badge>
                            <Badge className={`${getTypeColor(component.type)} text-xs`}>
                              {component.type}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs font-medium text-black/60 mb-1">Injection Method</div>
                            <Badge className={`${getInjectionColor(component.injectionMethod)} text-xs`}>
                              {component.injectionMethod}
                            </Badge>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-black/60 mb-1">Usage Stats</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>Templates: <span className="font-medium">{component.usage.templates.length}</span></div>
                              <div>Instances: <span className="font-medium">{component.usage.instances}</span></div>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-black/60 mb-1">Performance</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>Size: <span className="font-medium">{(component.performance.bundleSize / 1024).toFixed(1)}KB</span></div>
                              <div>Render: <span className="font-medium">{component.performance.renderTime}ms</span></div>
                            </div>
                          </div>

                          {selectedComponent === component.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="space-y-3 border-t pt-3"
                            >
                              <div>
                                <div className="text-xs font-medium text-black/60 mb-1">Dependencies</div>
                                <div className="flex flex-wrap gap-1">
                                  {component.dependencies.map((dep, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{dep}</Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs font-medium text-black/60 mb-1">Required Props</div>
                                <div className="space-y-1">
                                  {component.props.required.slice(0, 2).map((prop, i) => (
                                    <div key={i} className="text-xs">
                                      <span className="font-mono">{prop.name}</span>
                                      <span className="text-black/60 mx-1">:</span>
                                      <span className="text-blue-600">{prop.type}</span>
                                    </div>
                                  ))}
                                  {component.props.required.length > 2 && (
                                    <div className="text-xs text-black/60">+{component.props.required.length - 2} more props</div>
                                  )}
                                </div>
                              </div>

                              <div className="text-xs text-black/60">
                                Last used {formatTimeAgo(component.usage.lastUsed)}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="mappings" className="mt-6">
              <div className="space-y-4">
                {filteredComponents.map((component, index) => (
                  <motion.div
                    key={component.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card className="border-2 border-black/30">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{component.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {component.templatePath} → {component.componentPath}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getInjectionColor(component.injectionMethod)} text-xs`}>
                              {component.injectionMethod}
                            </Badge>
                            <Badge className={`${getStatusColor(component.status)} text-xs`}>
                              {component.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <div className="text-sm font-medium mb-3">Component Details</div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-black/60">Type:</span>
                                <Badge className={`${getTypeColor(component.type)} text-xs`}>{component.type}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-black/60">Version:</span>
                                <span>{component.version}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-black/60">Dependencies:</span>
                                <span>{component.dependencies.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-black/60">Last Modified:</span>
                                <span>{formatTimeAgo(component.lastModified)}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-3">Performance Metrics</div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-black/60">Bundle Size:</span>
                                <span>{(component.performance.bundleSize / 1024).toFixed(1)} KB</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-black/60">Render Time:</span>
                                <span>{component.performance.renderTime}ms</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-black/60">Load Time:</span>
                                <span>{component.performance.loadTime}ms</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-black/60">Memory Usage:</span>
                                <span>{component.performance.memoryUsage} MB</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-black/60">Cache:</span>
                                <span className={getPerformanceColor(component.performance.cacheability)}>
                                  {component.performance.cacheability}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="strategies" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {injectionStrategies.map((strategy, index) => (
                  <motion.div
                    key={strategy.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card className="border-2 border-black/30">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{strategy.name}</CardTitle>
                            <CardDescription className="mt-1">{strategy.description}</CardDescription>
                          </div>
                          <Badge className={`${getInjectionColor(strategy.method)} text-xs`}>
                            {strategy.method}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium mb-2">Performance Characteristics</div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="text-center p-2 rounded border border-black/20">
                                <div className="text-xs text-black/60">Build Time</div>
                                <div className={`font-medium ${getPerformanceColor(strategy.performance.buildTime)}`}>
                                  {strategy.performance.buildTime}
                                </div>
                              </div>
                              <div className="text-center p-2 rounded border border-black/20">
                                <div className="text-xs text-black/60">Runtime</div>
                                <div className={`font-medium ${getPerformanceColor(strategy.performance.runtime)}`}>
                                  {strategy.performance.runtime}
                                </div>
                              </div>
                              <div className="text-center p-2 rounded border border-black/20">
                                <div className="text-xs text-black/60">Bundle Impact</div>
                                <div className={`font-medium ${getPerformanceColor(strategy.performance.bundleImpact)}`}>
                                  {strategy.performance.bundleImpact}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-2">Use Cases</div>
                            <div className="flex flex-wrap gap-1">
                              {strategy.useCases.map((useCase, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{useCase}</Badge>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm font-medium mb-2 text-green-600">Pros</div>
                              <ul className="text-xs space-y-1">
                                {strategy.pros.map((pro, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span>{pro}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <div className="text-sm font-medium mb-2 text-red-600">Cons</div>
                              <ul className="text-xs space-y-1">
                                {strategy.cons.map((con, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-red-500 mt-0.5">✗</span>
                                    <span>{con}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-black/30">
                  <CardHeader>
                    <CardTitle>Component Performance Overview</CardTitle>
                    <CardDescription>Bundle size and performance metrics by component type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {componentTypes.filter(t => t !== 'all').map((type) => {
                        const typeComponents = componentMappings.filter(c => c.type === type);
                        const avgBundleSize = typeComponents.length > 0
                          ? typeComponents.reduce((sum, c) => sum + c.performance.bundleSize, 0) / typeComponents.length / 1024
                          : 0;
                        const avgRenderTime = typeComponents.length > 0
                          ? typeComponents.reduce((sum, c) => sum + c.performance.renderTime, 0) / typeComponents.length
                          : 0;

                        return (
                          <div key={type} className="flex items-center justify-between p-3 rounded border border-black/20">
                            <div className="flex items-center gap-3">
                              <Badge className={`${getTypeColor(type)} text-xs`}>{type}</Badge>
                              <div className="text-sm">
                                <div className="font-medium">{typeComponents.length} components</div>
                                <div className="text-black/60">{typeComponents.reduce((sum, c) => sum + c.usage.instances, 0)} instances</div>
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <div className="font-medium">{avgBundleSize.toFixed(1)} KB</div>
                              <div className="text-black/60">{avgRenderTime.toFixed(1)}ms render</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-black/30">
                  <CardHeader>
                    <CardTitle>Injection Method Analysis</CardTitle>
                    <CardDescription>Performance comparison across injection strategies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {injectionStrategies.map((strategy) => {
                        const strategyComponents = componentMappings.filter(c => c.injectionMethod === strategy.method);
                        const totalUsage = strategyComponents.reduce((sum, c) => sum + c.usage.instances, 0);
                        const avgPerformance = strategyComponents.length > 0
                          ? strategyComponents.reduce((sum, c) => sum + c.performance.renderTime, 0) / strategyComponents.length
                          : 0;

                        return (
                          <div key={strategy.id} className="p-3 rounded border border-black/20">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge className={`${getInjectionColor(strategy.method)} text-xs`}>
                                  {strategy.method}
                                </Badge>
                                <span className="text-sm font-medium">{strategy.name}</span>
                              </div>
                              <div className="text-sm text-black/60">
                                {strategyComponents.length} components
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <div className="text-black/60">Usage</div>
                                <div className="font-medium">{totalUsage} instances</div>
                              </div>
                              <div>
                                <div className="text-black/60">Avg Render</div>
                                <div className="font-medium">{avgPerformance.toFixed(1)}ms</div>
                              </div>
                              <div>
                                <div className="text-black/60">Performance</div>
                                <div className={`font-medium ${getPerformanceColor(strategy.performance.runtime)}`}>
                                  {strategy.performance.runtime}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}