'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Database, Zap, Shield, GitBranch, RefreshCw, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface DataNode {
  id: string;
  type: 'source' | 'processor' | 'validator' | 'output';
  name: string;
  description: string;
  status: 'active' | 'idle' | 'error';
  throughput: number;
  connections: string[];
}

interface DataFlowStage {
  id: string;
  name: string;
  description: string;
  duration: number;
  dependencies: string[];
  outputs: string[];
  status: 'pending' | 'processing' | 'completed' | 'error';
}

interface DataTransformation {
  id: string;
  name: string;
  inputType: string;
  outputType: string;
  rules: string[];
  performance: {
    avgTime: number;
    successRate: number;
    errorRate: number;
  };
}

export default function TemplateDataFlowPage() {
  const [selectedNode, setSelectedNode] = useState<string>('template-parser');
  const [selectedStage, setSelectedStage] = useState<string>('data-ingestion');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'monitoring'>('overview');

  const dataNodes: DataNode[] = [
    {
      id: 'template-parser',
      type: 'source',
      name: 'Template Parser',
      description: 'Extracts template structure and variables',
      status: 'active',
      throughput: 850,
      connections: ['data-validator', 'schema-generator']
    },
    {
      id: 'data-validator',
      type: 'validator',
      name: 'Data Validator',
      description: 'Validates input data against schema',
      status: 'active',
      throughput: 720,
      connections: ['content-processor', 'error-handler']
    },
    {
      id: 'content-processor',
      type: 'processor',
      name: 'Content Processor',
      description: 'Processes and transforms template content',
      status: 'active',
      throughput: 650,
      connections: ['component-mapper', 'route-generator']
    },
    {
      id: 'component-mapper',
      type: 'processor',
      name: 'Component Mapper',
      description: 'Maps content to React components',
      status: 'active',
      throughput: 580,
      connections: ['page-generator']
    },
    {
      id: 'page-generator',
      type: 'output',
      name: 'Page Generator',
      description: 'Generates final page structure',
      status: 'active',
      throughput: 520,
      connections: []
    }
  ];

  const dataFlowStages: DataFlowStage[] = [
    {
      id: 'data-ingestion',
      name: 'Data Ingestion',
      description: 'Initial template and configuration data collection',
      duration: 150,
      dependencies: [],
      outputs: ['raw-template', 'config-data'],
      status: 'completed'
    },
    {
      id: 'schema-validation',
      name: 'Schema Validation',
      description: 'Validate data against predefined schemas',
      duration: 200,
      dependencies: ['data-ingestion'],
      outputs: ['validated-data', 'error-reports'],
      status: 'completed'
    },
    {
      id: 'data-transformation',
      name: 'Data Transformation',
      description: 'Transform data into processing format',
      duration: 300,
      dependencies: ['schema-validation'],
      outputs: ['processed-data', 'transformation-logs'],
      status: 'processing'
    },
    {
      id: 'component-generation',
      name: 'Component Generation',
      description: 'Generate React components from processed data',
      duration: 450,
      dependencies: ['data-transformation'],
      outputs: ['react-components', 'component-map'],
      status: 'pending'
    },
    {
      id: 'page-assembly',
      name: 'Page Assembly',
      description: 'Assemble components into complete pages',
      duration: 250,
      dependencies: ['component-generation'],
      outputs: ['page-files', 'route-config'],
      status: 'pending'
    }
  ];

  const transformations: DataTransformation[] = [
    {
      id: 'template-to-json',
      name: 'Template to JSON',
      inputType: 'Template File',
      outputType: 'JSON Schema',
      rules: ['Extract variables', 'Parse structure', 'Validate syntax'],
      performance: { avgTime: 120, successRate: 98.5, errorRate: 1.5 }
    },
    {
      id: 'json-to-component',
      name: 'JSON to Component',
      inputType: 'JSON Schema',
      outputType: 'React Component',
      rules: ['Map data types', 'Generate props', 'Apply styling'],
      performance: { avgTime: 180, successRate: 96.8, errorRate: 3.2 }
    },
    {
      id: 'component-to-page',
      name: 'Component to Page',
      inputType: 'React Component',
      outputType: 'Next.js Page',
      rules: ['Route generation', 'Layout application', 'SEO optimization'],
      performance: { avgTime: 200, successRate: 97.2, errorRate: 2.8 }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'idle': case 'pending': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'source': return <Database className="h-4 w-4" />;
      case 'processor': return <Zap className="h-4 w-4" />;
      case 'validator': return <Shield className="h-4 w-4" />;
      case 'output': return <CheckCircle className="h-4 w-4" />;
      default: return <GitBranch className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Template Data Flow</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and visualization of template data processing pipeline
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="monitoring">Monitoring</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="flow-diagram" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="flow-diagram">Flow Diagram</TabsTrigger>
          <TabsTrigger value="processing-stages">Processing Stages</TabsTrigger>
          <TabsTrigger value="transformations">Transformations</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="flow-diagram" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Data Flow Visualization</CardTitle>
                  <CardDescription>
                    Interactive diagram showing data flow through template processing pipeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-slate-50 rounded-lg p-6 min-h-[400px]">
                    <div className="grid grid-cols-2 gap-6 h-full">
                      {dataNodes.map((node, index) => (
                        <motion.div
                          key={node.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedNode === node.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedNode(node.id)}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-md ${getStatusColor(node.status)} text-white`}>
                              {getTypeIcon(node.type)}
                            </div>
                            <div>
                              <h4 className="font-semibold">{node.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {node.type}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {node.description}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {node.throughput} req/min
                            </span>
                            <Badge variant={node.status === 'active' ? 'default' : 'secondary'}>
                              {node.status}
                            </Badge>
                          </div>
                          {node.connections.length > 0 && (
                            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                              <ArrowRight className="h-4 w-4 text-blue-500" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Node Details</CardTitle>
                  <CardDescription>
                    Information about selected processing node
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const node = dataNodes.find(n => n.id === selectedNode);
                    if (!node) return null;

                    return (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">{node.name}</h4>
                          <p className="text-sm text-muted-foreground">{node.description}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Type:</span>
                            <Badge variant="outline">{node.type}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Status:</span>
                            <Badge variant={node.status === 'active' ? 'default' : 'secondary'}>
                              {node.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Throughput:</span>
                            <span className="text-sm font-medium">{node.throughput} req/min</span>
                          </div>
                        </div>

                        {node.connections.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Connections:</h5>
                            <div className="space-y-1">
                              {node.connections.map(conn => (
                                <div key={conn} className="text-xs p-2 bg-gray-50 rounded">
                                  {dataNodes.find(n => n.id === conn)?.name || conn}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="processing-stages" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Pipeline</CardTitle>
                <CardDescription>
                  Sequential stages of template data processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataFlowStages.map((stage, index) => (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedStage === stage.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedStage(stage.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{stage.name}</h4>
                        <Badge variant={
                          stage.status === 'completed' ? 'default' :
                          stage.status === 'processing' ? 'secondary' :
                          stage.status === 'error' ? 'destructive' : 'outline'
                        }>
                          {stage.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {stage.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span>Duration: {stage.duration}ms</span>
                        <span>Outputs: {stage.outputs.length}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stage Details</CardTitle>
                <CardDescription>
                  Detailed information about selected processing stage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const stage = dataFlowStages.find(s => s.id === selectedStage);
                  if (!stage) return null;

                  return (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">{stage.name}</h4>
                        <p className="text-sm text-muted-foreground">{stage.description}</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium mb-2">Performance</h5>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Average Duration:</span>
                              <span className="font-medium">{stage.duration}ms</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Status:</span>
                              <Badge variant={
                                stage.status === 'completed' ? 'default' :
                                stage.status === 'processing' ? 'secondary' : 'outline'
                              }>
                                {stage.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Dependencies</h5>
                          {stage.dependencies.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No dependencies</p>
                          ) : (
                            <div className="space-y-1">
                              {stage.dependencies.map(dep => (
                                <div key={dep} className="text-xs p-2 bg-gray-50 rounded">
                                  {dataFlowStages.find(s => s.id === dep)?.name || dep}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Outputs</h5>
                          <div className="space-y-1">
                            {stage.outputs.map(output => (
                              <div key={output} className="text-xs p-2 bg-green-50 rounded border border-green-200">
                                {output}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transformations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {transformations.map((transform, index) => (
              <motion.div
                key={transform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{transform.name}</CardTitle>
                    <CardDescription>
                      {transform.inputType} → {transform.outputType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Transformation Rules</h5>
                        <ul className="space-y-1">
                          {transform.rules.map((rule, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">
                              • {rule}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Avg Time:</span>
                          <span className="font-medium">{transform.performance.avgTime}ms</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Success Rate:</span>
                          <span className="font-medium text-green-600">
                            {transform.performance.successRate}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Error Rate:</span>
                          <span className="font-medium text-red-600">
                            {transform.performance.errorRate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Performance</CardTitle>
                <CardDescription>
                  Real-time performance metrics for the data processing pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800">Total Throughput</h4>
                      <p className="text-2xl font-bold text-green-600">3,320</p>
                      <p className="text-sm text-green-600">requests/minute</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800">Avg Latency</h4>
                      <p className="text-2xl font-bold text-blue-600">250ms</p>
                      <p className="text-sm text-blue-600">end-to-end</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium">Node Performance</h5>
                    {dataNodes.map(node => (
                      <div key={node.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{node.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{node.throughput} req/min</span>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(node.status)}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Overall system health and error tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800">System Status</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-600 font-medium">All Systems Operational</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium">Error Rates</h5>
                    {transformations.map(transform => (
                      <div key={transform.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{transform.name}</span>
                        <Badge variant={transform.performance.errorRate < 5 ? 'default' : 'destructive'}>
                          {transform.performance.errorRate}%
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium">Success Rates</h5>
                    {transformations.map(transform => (
                      <div key={transform.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{transform.name}</span>
                        <span className="text-sm font-medium text-green-600">
                          {transform.performance.successRate}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}