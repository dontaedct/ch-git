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
  Code,
  Play,
  Download,
  Upload,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Zap,
  Database,
  Layers
} from 'lucide-react';

interface TemplateCompilationResult {
  success: boolean;
  templateId: string;
  templateName: string;
  compilationTime: number;
  outputSize: number;
  warnings: string[];
  errors: string[];
  generatedFiles: string[];
  dependencies: string[];
}

interface CompilerConfiguration {
  target: 'es2020' | 'es2021' | 'es2022';
  module: 'esnext' | 'commonjs' | 'amd';
  jsx: 'react' | 'react-jsx' | 'react-jsxdev';
  strict: boolean;
  sourceMap: boolean;
  declaration: boolean;
  skipLibCheck: boolean;
  allowSyntheticDefaultImports: boolean;
  optimization: 'none' | 'basic' | 'advanced';
  bundling: boolean;
  minification: boolean;
  treeshaking: boolean;
}

interface TemplateSource {
  id: string;
  name: string;
  category: string;
  jsx: string;
  styles: string;
  config: Record<string, any>;
  lastModified: string;
}

export default function TemplateCompilerPage() {
  const [selectedTab, setSelectedTab] = useState('compile');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationResults, setCompilationResults] = useState<TemplateCompilationResult[]>([]);

  const [compilerConfig, setCompilerConfig] = useState<CompilerConfiguration>({
    target: 'es2022',
    module: 'esnext',
    jsx: 'react-jsx',
    strict: true,
    sourceMap: true,
    declaration: false,
    skipLibCheck: true,
    allowSyntheticDefaultImports: true,
    optimization: 'advanced',
    bundling: true,
    minification: true,
    treeshaking: true
  });

  const [currentTemplate, setCurrentTemplate] = useState<TemplateSource>({
    id: 'tmpl_landing_001',
    name: 'Consultation Landing Page',
    category: 'landing-page',
    jsx: `import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LandingPageProps {
  title: string;
  subtitle: string;
  ctaText: string;
  onCtaClick: () => void;
}

export default function LandingPage({ title, subtitle, ctaText, onCtaClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>

          <Card className="max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle>Free Consultation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Get personalized recommendations for your business needs.
              </p>
              <Button
                onClick={onCtaClick}
                className="w-full"
                size="lg"
              >
                {ctaText}
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Fast Setup</h3>
              <p className="text-gray-600">Quick and easy onboarding process</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Secure Data</h3>
              <p className="text-gray-600">Enterprise-grade security measures</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Scalable</h3>
              <p className="text-gray-600">Grows with your business needs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
    styles: `.landing-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.feature-card {
  transition: transform 0.2s ease-in-out;
}

.feature-card:hover {
  transform: translateY(-4px);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.125rem;
  }
}`,
    config: {
      props: {
        title: { type: 'string', default: 'Professional Business Solutions' },
        subtitle: { type: 'string', default: 'Transform your business with our expert consultation services' },
        ctaText: { type: 'string', default: 'Start Free Consultation' }
      },
      theme: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        backgroundColor: '#F8FAFC'
      },
      seo: {
        title: 'Professional Business Consultation',
        description: 'Get expert business consultation and recommendations',
        keywords: ['business', 'consultation', 'professional', 'advice']
      }
    },
    lastModified: '2025-09-18T20:30:00Z'
  });

  const handleCompile = async () => {
    setIsCompiling(true);

    // Simulate compilation process
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result: TemplateCompilationResult = {
      success: true,
      templateId: currentTemplate.id,
      templateName: currentTemplate.name,
      compilationTime: 1234,
      outputSize: 45600,
      warnings: [
        'Component uses inline styles, consider using CSS modules',
        'Missing accessibility attributes on interactive elements'
      ],
      errors: [],
      generatedFiles: [
        'LandingPage.jsx',
        'LandingPage.d.ts',
        'LandingPage.css',
        'index.js',
        'manifest.json'
      ],
      dependencies: [
        '@/components/ui/button',
        '@/components/ui/card',
        'react',
        'lucide-react'
      ]
    };

    setCompilationResults(prev => [result, ...prev.slice(0, 9)]);
    setIsCompiling(false);
  };

  const handleConfigChange = (key: keyof CompilerConfiguration, value: any) => {
    setCompilerConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTemplateSourceChange = (field: keyof TemplateSource, value: string) => {
    setCurrentTemplate(prev => ({
      ...prev,
      [field]: value,
      lastModified: new Date().toISOString()
    }));
  };

  const exportCompiledTemplate = (result: TemplateCompilationResult) => {
    // Simulate file download
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.templateName.replace(/\s+/g, '_').toLowerCase()}_compiled.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Compiler</h1>
          <p className="text-muted-foreground">
            Compile and build template components for deployment
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">v1.0.0-beta</Badge>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Template
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="compile">Compile Template</TabsTrigger>
          <TabsTrigger value="source">Source Editor</TabsTrigger>
          <TabsTrigger value="config">Compiler Config</TabsTrigger>
          <TabsTrigger value="results">Compilation Results</TabsTrigger>
        </TabsList>

        <TabsContent value="compile" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Template Compilation</CardTitle>
                      <CardDescription>
                        Compile {currentTemplate.name} for production deployment
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleCompile}
                      disabled={isCompiling}
                      className="flex items-center space-x-2"
                    >
                      {isCompiling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      <span>{isCompiling ? 'Compiling...' : 'Compile Template'}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="template-name">Template Name</Label>
                        <Input
                          id="template-name"
                          value={currentTemplate.name}
                          onChange={(e) => handleTemplateSourceChange('name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-category">Category</Label>
                        <Input
                          id="template-category"
                          value={currentTemplate.category}
                          onChange={(e) => handleTemplateSourceChange('category', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Code className="h-4 w-4 mr-2" />
                        Compilation Pipeline
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span>Parse JSX</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          <span>Type Check</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>Optimize</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                          <span>Bundle</span>
                        </div>
                      </div>
                    </div>

                    {isCompiling && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Compilation Progress</span>
                          <span>Processing...</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full animate-pulse w-2/3" />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Compilation Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Target</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={compilerConfig.target}
                      onChange={(e) => handleConfigChange('target', e.target.value)}
                    >
                      <option value="es2020">ES2020</option>
                      <option value="es2021">ES2021</option>
                      <option value="es2022">ES2022</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>JSX Transform</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={compilerConfig.jsx}
                      onChange={(e) => handleConfigChange('jsx', e.target.value)}
                    >
                      <option value="react">React</option>
                      <option value="react-jsx">React JSX</option>
                      <option value="react-jsxdev">React JSX Dev</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Optimization Level</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={compilerConfig.optimization}
                      onChange={(e) => handleConfigChange('optimization', e.target.value)}
                    >
                      <option value="none">None</option>
                      <option value="basic">Basic</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="strict">Strict Mode</Label>
                      <input
                        id="strict"
                        type="checkbox"
                        checked={compilerConfig.strict}
                        onChange={(e) => handleConfigChange('strict', e.target.checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sourcemap">Source Maps</Label>
                      <input
                        id="sourcemap"
                        type="checkbox"
                        checked={compilerConfig.sourceMap}
                        onChange={(e) => handleConfigChange('sourceMap', e.target.checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="minification">Minification</Label>
                      <input
                        id="minification"
                        type="checkbox"
                        checked={compilerConfig.minification}
                        onChange={(e) => handleConfigChange('minification', e.target.checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="treeshaking">Tree Shaking</Label>
                      <input
                        id="treeshaking"
                        type="checkbox"
                        checked={compilerConfig.treeshaking}
                        onChange={(e) => handleConfigChange('treeshaking', e.target.checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="source" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Source Editor</CardTitle>
              <CardDescription>Edit template JSX, styles, and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="jsx" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="jsx">JSX Component</TabsTrigger>
                  <TabsTrigger value="styles">Styles</TabsTrigger>
                  <TabsTrigger value="config">Configuration</TabsTrigger>
                </TabsList>

                <TabsContent value="jsx">
                  <div className="space-y-2">
                    <Label htmlFor="jsx-source">JSX Source Code</Label>
                    <Textarea
                      id="jsx-source"
                      value={currentTemplate.jsx}
                      onChange={(e) => handleTemplateSourceChange('jsx', e.target.value)}
                      className="min-h-[400px] font-mono text-sm"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="styles">
                  <div className="space-y-2">
                    <Label htmlFor="styles-source">CSS Styles</Label>
                    <Textarea
                      id="styles-source"
                      value={currentTemplate.styles}
                      onChange={(e) => handleTemplateSourceChange('styles', e.target.value)}
                      className="min-h-[300px] font-mono text-sm"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="config">
                  <div className="space-y-2">
                    <Label htmlFor="config-source">Template Configuration (JSON)</Label>
                    <Textarea
                      id="config-source"
                      value={JSON.stringify(currentTemplate.config, null, 2)}
                      onChange={(e) => {
                        try {
                          const config = JSON.parse(e.target.value);
                          setCurrentTemplate(prev => ({ ...prev, config }));
                        } catch {
                          // Invalid JSON, ignore
                        }
                      }}
                      className="min-h-[300px] font-mono text-sm"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compiler Configuration</CardTitle>
              <CardDescription>Advanced compiler settings and optimization options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">TypeScript Options</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="target-config">Target</Label>
                      <select
                        id="target-config"
                        className="w-full p-2 border rounded"
                        value={compilerConfig.target}
                        onChange={(e) => handleConfigChange('target', e.target.value)}
                      >
                        <option value="es2020">ES2020</option>
                        <option value="es2021">ES2021</option>
                        <option value="es2022">ES2022</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="module-config">Module</Label>
                      <select
                        id="module-config"
                        className="w-full p-2 border rounded"
                        value={compilerConfig.module}
                        onChange={(e) => handleConfigChange('module', e.target.value)}
                      >
                        <option value="esnext">ESNext</option>
                        <option value="commonjs">CommonJS</option>
                        <option value="amd">AMD</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="jsx-config">JSX</Label>
                      <select
                        id="jsx-config"
                        className="w-full p-2 border rounded"
                        value={compilerConfig.jsx}
                        onChange={(e) => handleConfigChange('jsx', e.target.value)}
                      >
                        <option value="react">React</option>
                        <option value="react-jsx">React JSX</option>
                        <option value="react-jsxdev">React JSX Dev</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Optimization Options</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="optimization-config">Optimization Level</Label>
                      <select
                        id="optimization-config"
                        className="w-full p-2 border rounded"
                        value={compilerConfig.optimization}
                        onChange={(e) => handleConfigChange('optimization', e.target.value)}
                      >
                        <option value="none">None</option>
                        <option value="basic">Basic</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="bundling-config">Bundling</Label>
                        <input
                          id="bundling-config"
                          type="checkbox"
                          checked={compilerConfig.bundling}
                          onChange={(e) => handleConfigChange('bundling', e.target.checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="minification-config">Minification</Label>
                        <input
                          id="minification-config"
                          type="checkbox"
                          checked={compilerConfig.minification}
                          onChange={(e) => handleConfigChange('minification', e.target.checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="treeshaking-config">Tree Shaking</Label>
                        <input
                          id="treeshaking-config"
                          type="checkbox"
                          checked={compilerConfig.treeshaking}
                          onChange={(e) => handleConfigChange('treeshaking', e.target.checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compilation Results</CardTitle>
              <CardDescription>Recent template compilation results and outputs</CardDescription>
            </CardHeader>
            <CardContent>
              {compilationResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No compilation results yet. Compile a template to see results here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {compilationResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${result.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                          </div>
                          <div>
                            <h4 className="font-medium">{result.templateName}</h4>
                            <p className="text-sm text-muted-foreground">ID: {result.templateId}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={result.success ? "default" : "destructive"}>
                            {result.success ? 'Success' : 'Failed'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportCompiledTemplate(result)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Compilation Time</p>
                          <p className="text-sm text-muted-foreground">{(result.compilationTime / 1000).toFixed(1)}s</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Output Size</p>
                          <p className="text-sm text-muted-foreground">{(result.outputSize / 1024).toFixed(1)} KB</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Generated Files</p>
                          <p className="text-sm text-muted-foreground">{result.generatedFiles.length} files</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Dependencies</p>
                          <p className="text-sm text-muted-foreground">{result.dependencies.length} modules</p>
                        </div>
                      </div>

                      {result.warnings.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-yellow-600 mb-1">Warnings:</p>
                          <ul className="text-sm text-yellow-600 space-y-1">
                            {result.warnings.map((warning, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.errors.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-red-600 mb-1">Errors:</p>
                          <ul className="text-sm text-red-600 space-y-1">
                            {result.errors.map((error, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="text-sm">
                        <p className="font-medium mb-1">Generated Files:</p>
                        <div className="flex flex-wrap gap-1">
                          {result.generatedFiles.map((file, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {file}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}