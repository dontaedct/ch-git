/**
 * @fileoverview Advanced Code Generation Interface
 * @module app/agency-toolkit/code-gen/page
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * HT-031.2.3: Advanced Code Generation & Template Intelligence
 * 
 * This interface provides comprehensive code generation capabilities with:
 * - Template intelligence system
 * - Automated scaffolding
 * - Intelligent code suggestions
 * - Real-time code preview and validation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import { Badge } from '@ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { Alert, AlertDescription } from '@ui/alert';
import { Progress } from '@ui/progress';
import { 
  Code2, 
  Wand2, 
  FileCode, 
  Lightbulb, 
  Download, 
  Play, 
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Copy,
  Eye,
  Zap
} from 'lucide-react';

import { TemplateIntelligence } from '@/lib/code-gen/template-intelligence';
import { AutomatedScaffolding } from '@/lib/code-gen/automated-scaffolding';
import { IntelligentSuggestions } from '@/components/code-gen/intelligent-suggestions';

interface GeneratedCode {
  id: string;
  name: string;
  type: string;
  content: string;
  language: string;
  size: number;
  createdAt: Date;
  template: string;
  confidence: number;
}

interface CodeGenProject {
  name: string;
  description: string;
  type: 'component' | 'page' | 'api' | 'hook' | 'utility' | 'full-app';
  framework: 'react' | 'next' | 'vue' | 'angular' | 'vanilla';
  styling: 'tailwind' | 'styled-components' | 'css-modules' | 'emotion' | 'none';
  features: string[];
  customRequirements: string;
}

export default function CodeGenerationPage() {
  // State Management
  const [activeTab, setActiveTab] = useState('generator');
  const [project, setProject] = useState<CodeGenProject>({
    name: '',
    description: '',
    type: 'component',
    framework: 'react',
    styling: 'tailwind',
    features: [],
    customRequirements: ''
  });
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [previewCode, setPreviewCode] = useState('');

  // Initialize services
  const [templateIntelligence] = useState(() => new TemplateIntelligence());
  const [scaffolding] = useState(() => new AutomatedScaffolding());

  // Load suggestions on project changes
  useEffect(() => {
    if (project.name && project.type) {
      loadSuggestions();
    }
  }, [project]);

  const loadSuggestions = async () => {
    try {
      const projectSuggestions = await templateIntelligence.getSuggestions(project);
      setSuggestions(projectSuggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleProjectChange = (field: keyof CodeGenProject, value: any) => {
    setProject(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setProject(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const generateCode = async () => {
    if (!project.name || !project.description) {
      alert('Please provide project name and description');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Generate code using scaffolding system
      const result = await scaffolding.generateProject(project);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Add generated code to list
      const newCode: GeneratedCode = {
        id: Date.now().toString(),
        name: project.name,
        type: project.type,
        content: result.code,
        language: getLanguageFromFramework(project.framework),
        size: result.code.length,
        createdAt: new Date(),
        template: result.template,
        confidence: result.confidence
      };

      setGeneratedCode(prev => [newCode, ...prev]);
      setPreviewCode(result.code);

      // Reset progress after delay
      setTimeout(() => {
        setGenerationProgress(0);
        setIsGenerating(false);
      }, 1000);

    } catch (error) {
      console.error('Code generation failed:', error);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const getLanguageFromFramework = (framework: string): string => {
    const map: Record<string, string> = {
      'react': 'tsx',
      'next': 'tsx',
      'vue': 'vue',
      'angular': 'ts',
      'vanilla': 'js'
    };
    return map[framework] || 'tsx';
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const downloadCode = (code: GeneratedCode) => {
    const blob = new Blob([code.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${code.name}.${code.language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const availableFeatures = [
    'TypeScript Support',
    'Responsive Design',
    'Dark Mode',
    'Accessibility (a11y)',
    'Internationalization (i18n)',
    'State Management',
    'API Integration',
    'Form Validation',
    'Error Boundaries',
    'Testing Setup',
    'Storybook Integration',
    'Performance Optimization'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white">
              <Code2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Advanced Code Generation</h1>
              <p className="text-lg text-gray-600 mt-2">
                AI-powered template intelligence with automated scaffolding
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>Template Intelligence</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span>Automated Scaffolding</span>
            </div>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span>Smart Suggestions</span>
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Code Generator
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Generated Code
            </TabsTrigger>
          </TabsList>

          {/* Code Generator Tab */}
          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Project Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your project settings for intelligent code generation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="projectName">Project Name</Label>
                      <Input
                        id="projectName"
                        placeholder="MyAwesomeComponent"
                        value={project.name}
                        onChange={(e) => handleProjectChange('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectType">Type</Label>
                      <Select 
                        value={project.type} 
                        onValueChange={(value) => handleProjectChange('type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="component">Component</SelectItem>
                          <SelectItem value="page">Page</SelectItem>
                          <SelectItem value="api">API Route</SelectItem>
                          <SelectItem value="hook">Custom Hook</SelectItem>
                          <SelectItem value="utility">Utility</SelectItem>
                          <SelectItem value="full-app">Full App</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what your code should do..."
                      value={project.description}
                      onChange={(e) => handleProjectChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Framework</Label>
                      <Select 
                        value={project.framework} 
                        onValueChange={(value) => handleProjectChange('framework', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="react">React</SelectItem>
                          <SelectItem value="next">Next.js</SelectItem>
                          <SelectItem value="vue">Vue.js</SelectItem>
                          <SelectItem value="angular">Angular</SelectItem>
                          <SelectItem value="vanilla">Vanilla JS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Styling</Label>
                      <Select 
                        value={project.styling} 
                        onValueChange={(value) => handleProjectChange('styling', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                          <SelectItem value="styled-components">Styled Components</SelectItem>
                          <SelectItem value="css-modules">CSS Modules</SelectItem>
                          <SelectItem value="emotion">Emotion</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Features</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableFeatures.map((feature) => (
                        <div
                          key={feature}
                          className={`p-2 text-sm rounded-lg cursor-pointer transition-colors ${
                            project.features.includes(feature)
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          onClick={() => handleFeatureToggle(feature)}
                        >
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customRequirements">Custom Requirements</Label>
                    <Textarea
                      id="customRequirements"
                      placeholder="Any specific requirements or constraints..."
                      value={project.customRequirements}
                      onChange={(e) => handleProjectChange('customRequirements', e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Generation Controls & Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Code Generation
                  </CardTitle>
                  <CardDescription>
                    Generate intelligent code based on your configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Generation Button */}
                  <Button
                    onClick={generateCode}
                    disabled={isGenerating || !project.name || !project.description}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Code...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Code
                      </>
                    )}
                  </Button>

                  {/* Progress Bar */}
                  {isGenerating && (
                    <div className="space-y-2">
                      <Progress value={generationProgress} className="w-full" />
                      <p className="text-sm text-gray-600 text-center">
                        {generationProgress < 30 && "Analyzing requirements..."}
                        {generationProgress >= 30 && generationProgress < 60 && "Selecting templates..."}
                        {generationProgress >= 60 && generationProgress < 90 && "Generating code..."}
                        {generationProgress >= 90 && "Finalizing..."}
                      </p>
                    </div>
                  )}

                  {/* Code Preview */}
                  {previewCode && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Generated Code Preview</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(previewCode)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-64 text-sm font-mono">
                        <pre>{previewCode}</pre>
                      </div>
                    </div>
                  )}

                  {/* Quick Stats */}
                  {generatedCode.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{generatedCode.length}</div>
                        <div className="text-sm text-gray-600">Generated</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(generatedCode.reduce((acc, code) => acc + code.confidence, 0) / generatedCode.length)}%
                        </div>
                        <div className="text-sm text-gray-600">Avg Confidence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(generatedCode.reduce((acc, code) => acc + code.size, 0) / 1024)}KB
                        </div>
                        <div className="text-sm text-gray-600">Total Size</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Template Intelligence</CardTitle>
                <CardDescription>
                  Browse and manage intelligent code templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Template management interface will be implemented here</p>
                  <p className="text-sm">Features: Template library, custom templates, version control</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions">
            <IntelligentSuggestions 
              project={project}
              suggestions={suggestions}
              onApplySuggestion={(suggestion) => {
                // Apply suggestion to project
                console.log('Applying suggestion:', suggestion);
              }}
            />
          </TabsContent>

          {/* Generated Code History */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Generated Code History</CardTitle>
                <CardDescription>
                  View and manage your generated code
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedCode.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Code2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No code generated yet</p>
                    <p className="text-sm">Generate your first code to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generatedCode.map((code) => (
                      <Card key={code.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{code.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">{code.type}</Badge>
                                <Badge variant="outline">{code.language}</Badge>
                                <Badge variant="outline">{code.template}</Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right text-sm text-gray-600">
                                <div>Confidence: {code.confidence}%</div>
                                <div>Size: {Math.round(code.size / 1024)}KB</div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(code.content)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadCode(code)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <pre className="text-sm overflow-auto max-h-32 text-gray-800">
                              {code.content.substring(0, 200)}
                              {code.content.length > 200 && '...'}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
