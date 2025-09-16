"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Code2,
  Wand2,
  FileCode,
  Package,
  Database,
  Globe,
  Settings,
  Play,
  Download,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  Layers,
  Box,
  Component,
  Server
} from 'lucide-react';
import Link from 'next/link';

const CodeGenerationPage = () => {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('');
  // Removed unused features state
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  // Configuration options
  const customization = {
    typescript: true,
    tailwind: true,
    authentication: false,
    database: false,
    api: true,
    testing: false
  };

  const templates = [
    {
      id: 'micro-app',
      name: 'Micro App',
      description: 'Lightweight single-purpose application',
      icon: <Box className="w-8 h-8" />,
      estimatedTime: '2 min',
      features: ['React', 'TypeScript', 'Tailwind', 'Basic routing'],
      popularity: 95
    },
    {
      id: 'dashboard',
      name: 'Admin Dashboard',
      description: 'Full-featured admin interface',
      icon: <Layers className="w-8 h-8" />,
      estimatedTime: '4 min',
      features: ['Charts', 'Tables', 'Forms', 'Authentication'],
      popularity: 88
    },
    {
      id: 'api-service',
      name: 'API Service',
      description: 'RESTful API with database integration',
      icon: <Server className="w-8 h-8" />,
      estimatedTime: '3 min',
      features: ['Express', 'Database', 'Authentication', 'Validation'],
      popularity: 82
    },
    {
      id: 'component-library',
      name: 'Component Library',
      description: 'Reusable UI component collection',
      icon: <Component className="w-8 h-8" />,
      estimatedTime: '3 min',
      features: ['Storybook', 'TypeScript', 'Documentation', 'Testing'],
      popularity: 76
    },
    {
      id: 'landing-page',
      name: 'Landing Page',
      description: 'Marketing website with CMS',
      icon: <Globe className="w-8 h-8" />,
      estimatedTime: '2 min',
      features: ['SEO', 'CMS', 'Analytics', 'Contact forms'],
      popularity: 91
    },
    {
      id: 'e-commerce',
      name: 'E-commerce Store',
      description: 'Online store with payment integration',
      icon: <Package className="w-8 h-8" />,
      estimatedTime: '5 min',
      features: ['Products', 'Cart', 'Payments', 'Orders'],
      popularity: 79
    }
  ];

  const codeTemplates = [
    {
      name: 'React Component',
      description: 'Functional component with TypeScript',
      category: 'component',
      time: '30s'
    },
    {
      name: 'API Route Handler',
      description: 'Next.js API route with validation',
      category: 'api',
      time: '45s'
    },
    {
      name: 'Database Model',
      description: 'Prisma model with relations',
      category: 'database',
      time: '30s'
    },
    {
      name: 'Custom Hook',
      description: 'Reusable React hook',
      category: 'hook',
      time: '25s'
    },
    {
      name: 'Page Template',
      description: 'Complete page with layout',
      category: 'page',
      time: '60s'
    },
    {
      name: 'Test Suite',
      description: 'Jest/Testing Library tests',
      category: 'test',
      time: '40s'
    }
  ];

  const handleGenerate = () => {
    setGenerating(true);
    setGenerationProgress(0);

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setGenerating(false);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'component': return <Component className="w-4 h-4" />;
      case 'api': return <Server className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      case 'hook': return <Code2 className="w-4 h-4" />;
      case 'page': return <FileCode className="w-4 h-4" />;
      case 'test': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Code2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/developer-tools">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tools
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Code Generation & Scaffolding</h1>
                <p className="text-lg text-gray-600">AI-powered rapid development tools</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">&lt; 5 min</div>
                  <div className="text-sm text-gray-500">Generation Time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
                  <div className="text-sm text-gray-500">Templates</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Code2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{codeTemplates.length}</div>
                  <div className="text-sm text-gray-500">Code Templates</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Wand2 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">AI</div>
                  <div className="text-sm text-gray-500">Powered</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="project-templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="project-templates">Project Templates</TabsTrigger>
            <TabsTrigger value="code-generation">Code Generation</TabsTrigger>
            <TabsTrigger value="custom-scaffolding">Custom Scaffolding</TabsTrigger>
          </TabsList>

          {/* Project Templates */}
          <TabsContent value="project-templates" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Project Templates</span>
                </CardTitle>
                <CardDescription>
                  Pre-built project templates for rapid micro-app development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template, index) => (
                    <Card key={index} className="border hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                              {template.icon}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                            </div>
                          </div>
                          <Badge variant="secondary">{template.estimatedTime}</Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {template.features.map((feature, fIndex) => (
                              <Badge key={fIndex} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              {template.popularity}% popular
                            </div>
                            <Button size="sm" onClick={() => setProjectType(template.id)}>
                              Select
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Configuration */}
            {projectType && (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Project Configuration</CardTitle>
                  <CardDescription>
                    Customize your project settings and features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input
                          id="project-name"
                          placeholder="my-awesome-app"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your project..."
                          className="h-24"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Customization Options</Label>
                      {Object.entries(customization).map(([key, enabled]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label htmlFor={key} className="text-sm capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <Switch
                            id={key}
                            checked={enabled}
                            onCheckedChange={(checked) =>
                              setCustomization(prev => ({...prev, [key]: checked}))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {generating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Generating project...</span>
                        <span>{generationProgress}%</span>
                      </div>
                      <Progress value={generationProgress} className="h-2" />
                    </div>
                  )}

                  <Button
                    onClick={handleGenerate}
                    disabled={!projectName || generating}
                    className="w-full"
                    size="lg"
                  >
                    {generating ? (
                      <>
                        <Clock className="w-5 h-5 mr-2 animate-spin" />
                        Generating Project...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Generate Project
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Code Generation */}
          <TabsContent value="code-generation" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileCode className="w-5 h-5" />
                  <span>Code Templates</span>
                </CardTitle>
                <CardDescription>
                  Generate individual components, hooks, and utilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {codeTemplates.map((template, index) => (
                    <Card key={index} className="border hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="p-1 bg-blue-100 rounded">
                              {getCategoryIcon(template.category)}
                            </div>
                            <div className="font-medium text-sm">{template.name}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {template.time}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                        <Button size="sm" variant="outline" className="w-full">
                          Generate
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Scaffolding */}
          <TabsContent value="custom-scaffolding" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Custom Scaffolding</span>
                </CardTitle>
                <CardDescription>
                  Create custom templates and scaffolding patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        placeholder="My Custom Template"
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-type">Template Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="component">Component</SelectItem>
                          <SelectItem value="page">Page</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="utility">Utility</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file-structure">File Structure</Label>
                      <Textarea
                        id="file-structure"
                        placeholder="Define your file structure..."
                        className="h-32 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Save Template
                  </Button>
                  <Button>
                    <Play className="w-4 h-4 mr-2" />
                    Generate from Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CodeGenerationPage;