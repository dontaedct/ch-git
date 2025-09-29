/**
 * @fileoverview Template System Architecture Interface
 * Visual representation and management of template engine architecture
 * HT-029.1.1 Implementation
 */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ArchitectureComponent {
  id: string;
  name: string;
  type: 'core' | 'storage' | 'processing' | 'interface' | 'external';
  status: 'active' | 'inactive' | 'error' | 'warning';
  description: string;
  dependencies: string[];
  endpoints?: string[];
  version: string;
  performance: {
    cpu: number;
    memory: number;
    throughput: number;
  };
}

interface ArchitectureFlow {
  id: string;
  from: string;
  to: string;
  type: 'data' | 'control' | 'event';
  protocol: string;
  latency: number;
}

export default function TemplateArchitecturePage() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const components: ArchitectureComponent[] = [
    {
      id: 'template-engine-core',
      name: 'Template Engine Core',
      type: 'core',
      status: 'active',
      description: 'Central template processing engine with compilation and rendering capabilities',
      dependencies: ['template-parser', 'template-renderer', 'template-validator'],
      endpoints: ['/api/templates/compile', '/api/templates/render'],
      version: '2.1.0',
      performance: { cpu: 15, memory: 45, throughput: 95 }
    },
    {
      id: 'template-storage',
      name: 'Template Storage',
      type: 'storage',
      status: 'active',
      description: 'Distributed template storage with versioning and caching',
      dependencies: ['database', 'cache-layer'],
      endpoints: ['/api/templates/store', '/api/templates/retrieve'],
      version: '1.8.2',
      performance: { cpu: 8, memory: 32, throughput: 88 }
    },
    {
      id: 'compilation-pipeline',
      name: 'Compilation Pipeline',
      type: 'processing',
      status: 'active',
      description: 'Multi-stage template compilation with optimization and validation',
      dependencies: ['template-engine-core', 'asset-optimizer'],
      endpoints: ['/api/compile/start', '/api/compile/status'],
      version: '1.5.1',
      performance: { cpu: 22, memory: 28, throughput: 92 }
    },
    {
      id: 'generation-engine',
      name: 'Generation Engine',
      type: 'processing',
      status: 'active',
      description: 'Dynamic client app generation with routing and deployment',
      dependencies: ['template-engine-core', 'deployment-manager'],
      endpoints: ['/api/generate/app', '/api/generate/status'],
      version: '2.0.0',
      performance: { cpu: 18, memory: 38, throughput: 89 }
    },
    {
      id: 'api-gateway',
      name: 'API Gateway',
      type: 'interface',
      status: 'active',
      description: 'RESTful API gateway with authentication and rate limiting',
      dependencies: ['auth-service', 'rate-limiter'],
      endpoints: ['/api/*'],
      version: '3.2.1',
      performance: { cpu: 12, memory: 25, throughput: 97 }
    },
    {
      id: 'monitoring-system',
      name: 'Monitoring System',
      type: 'external',
      status: 'active',
      description: 'Real-time system monitoring with alerts and analytics',
      dependencies: ['metrics-collector', 'alert-manager'],
      endpoints: ['/api/metrics', '/api/health'],
      version: '1.9.3',
      performance: { cpu: 5, memory: 15, throughput: 94 }
    }
  ];

  const flows: ArchitectureFlow[] = [
    { id: 'f1', from: 'api-gateway', to: 'template-engine-core', type: 'data', protocol: 'HTTP/REST', latency: 12 },
    { id: 'f2', from: 'template-engine-core', to: 'template-storage', type: 'data', protocol: 'TCP/Binary', latency: 8 },
    { id: 'f3', from: 'template-engine-core', to: 'compilation-pipeline', type: 'control', protocol: 'Event/Queue', latency: 5 },
    { id: 'f4', from: 'compilation-pipeline', to: 'generation-engine', type: 'data', protocol: 'TCP/Binary', latency: 15 },
    { id: 'f5', from: 'generation-engine', to: 'monitoring-system', type: 'event', protocol: 'WebSocket', latency: 3 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'core': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'storage': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'processing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'interface': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'external': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

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
                Template System Architecture
              </h1>
              <p className="text-black/60 mt-2">
                Comprehensive view of template engine infrastructure and data flow
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex gap-3">
              <Link href="/template-engine">
                <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                  ← Dashboard
                </Button>
              </Link>
              <Button className="bg-black text-white hover:bg-gray-800">
                Export Architecture
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Architecture Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">System Overview</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="data-flow">Data Flow</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Architecture Diagram */}
                <div className="lg:col-span-2">
                  <Card className="border-2 border-black/30">
                    <CardHeader>
                      <CardTitle>Template Engine Architecture</CardTitle>
                      <CardDescription>Logical component layout and relationships</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative bg-gray-50 rounded-lg p-6 min-h-[400px]">
                        {/* Core Components */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                          <div className="bg-blue-200 border-2 border-blue-300 rounded-lg p-3 text-center">
                            <div className="font-bold text-blue-800">API Gateway</div>
                            <div className="text-xs text-blue-600">v3.2.1</div>
                          </div>
                        </div>

                        <div className="absolute top-24 left-1/2 transform -translate-x-1/2">
                          <div className="bg-blue-100 border-2 border-blue-200 rounded-lg p-4 text-center">
                            <div className="font-bold text-blue-800">Template Engine Core</div>
                            <div className="text-xs text-blue-600">v2.1.0</div>
                          </div>
                        </div>

                        {/* Storage Layer */}
                        <div className="absolute top-48 left-8">
                          <div className="bg-purple-100 border-2 border-purple-200 rounded-lg p-3 text-center">
                            <div className="font-bold text-purple-800">Template Storage</div>
                            <div className="text-xs text-purple-600">v1.8.2</div>
                          </div>
                        </div>

                        {/* Processing Layer */}
                        <div className="absolute top-48 right-8">
                          <div className="bg-orange-100 border-2 border-orange-200 rounded-lg p-3 text-center">
                            <div className="font-bold text-orange-800">Compilation Pipeline</div>
                            <div className="text-xs text-orange-600">v1.5.1</div>
                          </div>
                        </div>

                        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
                          <div className="bg-orange-200 border-2 border-orange-300 rounded-lg p-3 text-center">
                            <div className="font-bold text-orange-800">Generation Engine</div>
                            <div className="text-xs text-orange-600">v2.0.0</div>
                          </div>
                        </div>

                        {/* Monitoring */}
                        <div className="absolute bottom-4 right-4">
                          <div className="bg-gray-100 border-2 border-gray-200 rounded-lg p-2 text-center">
                            <div className="font-bold text-gray-800 text-sm">Monitoring</div>
                            <div className="text-xs text-gray-600">v1.9.3</div>
                          </div>
                        </div>

                        {/* Connection Lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                          <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7"
                             refX="0" refY="3.5" orient="auto">
                              <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                            </marker>
                          </defs>
                          <line x1="50%" y1="60" x2="50%" y2="90" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
                          <line x1="50%" y1="150" x2="20%" y2="190" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
                          <line x1="50%" y1="150" x2="80%" y2="190" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
                          <line x1="70%" y1="220" x2="50%" y2="280" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
                        </svg>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* System Stats */}
                <div className="space-y-4">
                  <Card className="border-2 border-green-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-green-800">System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">98.7%</div>
                      <div className="text-sm text-green-600">Uptime (30 days)</div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-blue-800">Active Components</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600">
                        {components.filter(c => c.status === 'active').length}
                      </div>
                      <div className="text-sm text-blue-600">of {components.length} total</div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-purple-800">Average Latency</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600">
                        {Math.round(flows.reduce((sum, f) => sum + f.latency, 0) / flows.length)}ms
                      </div>
                      <div className="text-sm text-purple-600">Cross-component</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="components" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {components.map((component, index) => (
                  <motion.div
                    key={component.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card
                      className={`border-2 border-black/30 cursor-pointer transition-all hover:border-black/50 ${selectedComponent === component.id ? 'ring-2 ring-black/20' : ''}`}
                      onClick={() => setSelectedComponent(selectedComponent === component.id ? null : component.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{component.name}</CardTitle>
                            <CardDescription className="text-sm mt-1">v{component.version}</CardDescription>
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
                        <p className="text-sm text-black/70 mb-3">{component.description}</p>

                        {selectedComponent === component.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3 border-t pt-3"
                          >
                            <div>
                              <div className="text-xs font-medium text-black/60 mb-1">Performance</div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>CPU: <span className={getPerformanceColor(component.performance.cpu)}>{component.performance.cpu}%</span></div>
                                <div>Memory: <span className={getPerformanceColor(component.performance.memory)}>{component.performance.memory}%</span></div>
                                <div>Throughput: <span className={getPerformanceColor(component.performance.throughput)}>{component.performance.throughput}%</span></div>
                              </div>
                            </div>

                            <div>
                              <div className="text-xs font-medium text-black/60 mb-1">Dependencies</div>
                              <div className="flex flex-wrap gap-1">
                                {component.dependencies.map((dep, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{dep}</Badge>
                                ))}
                              </div>
                            </div>

                            {component.endpoints && (
                              <div>
                                <div className="text-xs font-medium text-black/60 mb-1">Endpoints</div>
                                <div className="space-y-1">
                                  {component.endpoints.map((endpoint, i) => (
                                    <div key={i} className="text-xs font-mono bg-gray-50 px-2 py-1 rounded">{endpoint}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="data-flow" className="mt-6">
              <Card className="border-2 border-black/30">
                <CardHeader>
                  <CardTitle>Component Data Flow</CardTitle>
                  <CardDescription>Inter-component communication patterns and protocols</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {flows.map((flow, index) => (
                      <motion.div
                        key={flow.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between p-4 rounded-lg border border-black/20"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-medium">
                            {components.find(c => c.id === flow.from)?.name}
                          </div>
                          <div className="text-black/40">→</div>
                          <div className="text-sm font-medium">
                            {components.find(c => c.id === flow.to)?.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge className={`${getTypeColor(flow.type)} text-xs`}>
                            {flow.type}
                          </Badge>
                          <div className="text-black/60">{flow.protocol}</div>
                          <div className={`font-medium ${flow.latency < 10 ? 'text-green-600' : flow.latency < 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {flow.latency}ms
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-black/30">
                  <CardHeader>
                    <CardTitle>System Performance Overview</CardTitle>
                    <CardDescription>Real-time performance metrics across all components</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {components.map((component) => (
                        <div key={component.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{component.name}</span>
                            <span className="text-black/60">v{component.version}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <div className="text-black/60">CPU</div>
                              <div className={`font-medium ${getPerformanceColor(100 - component.performance.cpu)}`}>
                                {component.performance.cpu}%
                              </div>
                            </div>
                            <div>
                              <div className="text-black/60">Memory</div>
                              <div className={`font-medium ${getPerformanceColor(100 - component.performance.memory)}`}>
                                {component.performance.memory}%
                              </div>
                            </div>
                            <div>
                              <div className="text-black/60">Throughput</div>
                              <div className={`font-medium ${getPerformanceColor(component.performance.throughput)}`}>
                                {component.performance.throughput}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-black/30">
                  <CardHeader>
                    <CardTitle>Architecture Health</CardTitle>
                    <CardDescription>Overall system health and recommendations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="font-medium text-green-800 text-sm">System Status: Healthy</div>
                        <div className="text-green-600 text-xs mt-1">All components operational</div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Performance Recommendations</div>
                        <div className="space-y-2 text-xs">
                          <div className="p-2 rounded bg-yellow-50 border border-yellow-200">
                            <div className="font-medium text-yellow-800">Compilation Pipeline</div>
                            <div className="text-yellow-600">Consider scaling for CPU usage &gt; 20%</div>
                          </div>
                          <div className="p-2 rounded bg-blue-50 border border-blue-200">
                            <div className="font-medium text-blue-800">Template Storage</div>
                            <div className="text-blue-600">Excellent cache hit rate - no action needed</div>
                          </div>
                        </div>
                      </div>
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