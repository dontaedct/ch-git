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
  FileText,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  Play,
  Square,
  RefreshCw,
  Download,
  Upload,
  Copy,
  Eye,
  Edit,
  Layers,
  GitBranch,
  Database,
  Package,
  Terminal
} from 'lucide-react';

interface ParsedTemplate {
  id: string;
  name: string;
  source: string;
  status: 'parsing' | 'parsed' | 'error' | 'validating' | 'ready';
  parseTime: number;
  size: number;
  ast: {
    type: string;
    components: number;
    dependencies: number;
    props: number;
    complexity: number;
  };
  metadata: {
    framework: string;
    version: string;
    language: string;
    type: string;
  };
  components: Array<{
    id: string;
    name: string;
    type: string;
    props: string[];
    children: number;
    imports: string[];
  }>;
  dependencies: Array<{
    name: string;
    version?: string;
    type: 'internal' | 'external' | 'system';
    required: boolean;
  }>;
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  };
  performance: {
    bundleSize: number;
    renderComplexity: number;
    memoryUsage: number;
    estimatedLoadTime: number;
  };
  createdAt: string;
}

interface ParsingRule {
  id: string;
  name: string;
  pattern: string;
  action: string;
  priority: number;
  isEnabled: boolean;
  description: string;
}

interface ParserConfiguration {
  strictMode: boolean;
  validateImports: boolean;
  analyzePerformance: boolean;
  extractMetadata: boolean;
  generateAST: boolean;
  enableOptimizations: boolean;
  timeout: number;
  maxFileSize: number;
}

export default function TemplateParserPage() {
  const [selectedTab, setSelectedTab] = useState('parser');
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);

  const [parsedTemplates, setParsedTemplates] = useState<ParsedTemplate[]>([
    {
      id: 'parsed_001',
      name: 'LandingPage.tsx',
      source: 'tmpl_landing_001',
      status: 'ready',
      parseTime: 234,
      size: 15420,
      ast: {
        type: 'ReactComponent',
        components: 8,
        dependencies: 12,
        props: 6,
        complexity: 42
      },
      metadata: {
        framework: 'React',
        version: '18.2.0',
        language: 'TypeScript',
        type: 'FunctionalComponent'
      },
      components: [
        {
          id: 'comp_hero',
          name: 'HeroSection',
          type: 'section',
          props: ['title', 'subtitle', 'ctaText', 'backgroundImage'],
          children: 3,
          imports: ['@/components/ui/button', 'react']
        },
        {
          id: 'comp_features',
          name: 'FeatureGrid',
          type: 'grid',
          props: ['features', 'columns', 'layout'],
          children: 1,
          imports: ['@/components/ui/card', 'react']
        },
        {
          id: 'comp_cta',
          name: 'CTASection',
          type: 'section',
          props: ['title', 'description', 'buttonText'],
          children: 2,
          imports: ['@/components/ui/button', 'react']
        }
      ],
      dependencies: [
        { name: 'react', version: '18.2.0', type: 'external', required: true },
        { name: '@/components/ui/button', type: 'internal', required: true },
        { name: '@/components/ui/card', type: 'internal', required: true },
        { name: 'lucide-react', version: '0.263.1', type: 'external', required: false }
      ],
      validation: {
        isValid: true,
        errors: [],
        warnings: ['Consider memoizing expensive calculations in FeatureGrid'],
        suggestions: ['Add loading states for better UX', 'Consider lazy loading for images']
      },
      performance: {
        bundleSize: 45600,
        renderComplexity: 8,
        memoryUsage: 2.4,
        estimatedLoadTime: 1200
      },
      createdAt: '2025-09-18T20:30:00Z'
    },
    {
      id: 'parsed_002',
      name: 'QuestionnaireFlow.tsx',
      source: 'tmpl_questionnaire_001',
      status: 'parsed',
      parseTime: 189,
      size: 12340,
      ast: {
        type: 'ReactComponent',
        components: 6,
        dependencies: 8,
        props: 4,
        complexity: 35
      },
      metadata: {
        framework: 'React',
        version: '18.2.0',
        language: 'TypeScript',
        type: 'FunctionalComponent'
      },
      components: [
        {
          id: 'comp_progress',
          name: 'ProgressBar',
          type: 'indicator',
          props: ['current', 'total', 'showLabels'],
          children: 0,
          imports: ['react']
        },
        {
          id: 'comp_question',
          name: 'QuestionStep',
          type: 'form',
          props: ['question', 'value', 'onChange', 'validation'],
          children: 2,
          imports: ['@/components/ui/input', 'react-hook-form']
        }
      ],
      dependencies: [
        { name: 'react', version: '18.2.0', type: 'external', required: true },
        { name: 'react-hook-form', version: '7.45.1', type: 'external', required: true },
        { name: '@/components/ui/input', type: 'internal', required: true },
        { name: '@/lib/validation', type: 'internal', required: true }
      ],
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: ['Add accessibility attributes', 'Consider form persistence']
      },
      performance: {
        bundleSize: 32100,
        renderComplexity: 6,
        memoryUsage: 1.8,
        estimatedLoadTime: 950
      },
      createdAt: '2025-09-18T20:25:00Z'
    },
    {
      id: 'parsed_003',
      name: 'PDFReport.tsx',
      source: 'tmpl_pdf_001',
      status: 'error',
      parseTime: 0,
      size: 8760,
      ast: {
        type: 'ReactComponent',
        components: 0,
        dependencies: 0,
        props: 0,
        complexity: 0
      },
      metadata: {
        framework: 'React',
        version: '18.2.0',
        language: 'TypeScript',
        type: 'Unknown'
      },
      components: [],
      dependencies: [],
      validation: {
        isValid: false,
        errors: ['Syntax error at line 45: Unexpected token', 'Missing import for @react-pdf/renderer'],
        warnings: [],
        suggestions: []
      },
      performance: {
        bundleSize: 0,
        renderComplexity: 0,
        memoryUsage: 0,
        estimatedLoadTime: 0
      },
      createdAt: '2025-09-18T20:20:00Z'
    }
  ]);

  const [parsingRules, setParsingRules] = useState<ParsingRule[]>([
    {
      id: 'rule_001',
      name: 'React Component Detection',
      pattern: 'export\\s+(default\\s+)?function\\s+\\w+|const\\s+\\w+\\s*=\\s*\\(',
      action: 'extract_component_info',
      priority: 100,
      isEnabled: true,
      description: 'Detect React functional components and extract metadata'
    },
    {
      id: 'rule_002',
      name: 'Import Statement Analysis',
      pattern: 'import\\s+.*\\s+from\\s+[\'"].*[\'"]',
      action: 'analyze_dependencies',
      priority: 90,
      isEnabled: true,
      description: 'Parse import statements and build dependency graph'
    },
    {
      id: 'rule_003',
      name: 'Props Interface Extraction',
      pattern: 'interface\\s+\\w+Props\\s*\\{[^}]*\\}',
      action: 'extract_props_schema',
      priority: 80,
      isEnabled: true,
      description: 'Extract TypeScript interface definitions for component props'
    },
    {
      id: 'rule_004',
      name: 'JSX Element Detection',
      pattern: '<\\w+[^>]*>.*<\\/\\w+>|<\\w+[^>]*\\/>',
      action: 'analyze_jsx_structure',
      priority: 70,
      isEnabled: true,
      description: 'Analyze JSX element structure and nesting'
    }
  ]);

  const [parserConfig, setParserConfig] = useState<ParserConfiguration>({
    strictMode: true,
    validateImports: true,
    analyzePerformance: true,
    extractMetadata: true,
    generateAST: true,
    enableOptimizations: false,
    timeout: 30000,
    maxFileSize: 1048576 // 1MB
  });

  const [sourceCode, setSourceCode] = useState(`import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LandingPageProps {
  title: string;
  subtitle: string;
  ctaText: string;
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

export default function LandingPage({
  title,
  subtitle,
  ctaText,
  features
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {subtitle}
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            {ctaText}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <CardTitle className="flex items-center justify-center mb-2">
                  <span className="text-2xl mr-2">{feature.icon}</span>
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}`);

  const handleParseTemplate = async () => {
    setIsParsing(true);
    setParseProgress(0);

    // Simulate parsing process
    const steps = [
      'Lexical analysis',
      'Syntax parsing',
      'AST generation',
      'Dependency analysis',
      'Component extraction',
      'Performance analysis',
      'Validation'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setParseProgress(((i + 1) / steps.length) * 100);
    }

    // Create new parsed template
    const newTemplate: ParsedTemplate = {
      id: `parsed_${Date.now()}`,
      name: 'CustomTemplate.tsx',
      source: 'manual_input',
      status: 'ready',
      parseTime: Math.random() * 300 + 100,
      size: new Blob([sourceCode]).size,
      ast: {
        type: 'ReactComponent',
        components: 4,
        dependencies: 8,
        props: 4,
        complexity: Math.floor(Math.random() * 50) + 20
      },
      metadata: {
        framework: 'React',
        version: '18.2.0',
        language: 'TypeScript',
        type: 'FunctionalComponent'
      },
      components: [
        {
          id: 'comp_main',
          name: 'LandingPage',
          type: 'page',
          props: ['title', 'subtitle', 'ctaText', 'features'],
          children: 3,
          imports: ['@/components/ui/button', '@/components/ui/card', 'react']
        }
      ],
      dependencies: [
        { name: 'react', version: '18.2.0', type: 'external', required: true },
        { name: '@/components/ui/button', type: 'internal', required: true },
        { name: '@/components/ui/card', type: 'internal', required: true }
      ],
      validation: {
        isValid: true,
        errors: [],
        warnings: ['Consider adding loading states'],
        suggestions: ['Add error boundaries', 'Implement memoization']
      },
      performance: {
        bundleSize: Math.floor(Math.random() * 50000) + 20000,
        renderComplexity: Math.floor(Math.random() * 10) + 5,
        memoryUsage: Math.random() * 3 + 1,
        estimatedLoadTime: Math.floor(Math.random() * 1000) + 500
      },
      createdAt: new Date().toISOString()
    };

    setParsedTemplates(prev => [newTemplate, ...prev]);
    setIsParsing(false);
    setParseProgress(0);
  };

  const handleToggleRule = (ruleId: string) => {
    setParsingRules(prev =>
      prev.map(rule =>
        rule.id === ruleId
          ? { ...rule, isEnabled: !rule.isEnabled }
          : rule
      )
    );
  };

  const handleDeleteTemplate = (templateId: string) => {
    setParsedTemplates(prev => prev.filter(template => template.id !== templateId));
  };

  const handleExportTemplate = (template: ParsedTemplate) => {
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\.[^/.]+$/, '')}_parsed.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-500';
      case 'parsed': return 'bg-blue-500';
      case 'parsing': return 'bg-yellow-500';
      case 'validating': return 'bg-purple-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'parsed': return <Code className="h-4 w-4" />;
      case 'parsing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'validating': return <Settings className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity < 20) return 'text-green-600';
    if (complexity < 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const parserStats = {
    totalTemplates: parsedTemplates.length,
    readyTemplates: parsedTemplates.filter(t => t.status === 'ready').length,
    errorTemplates: parsedTemplates.filter(t => t.status === 'error').length,
    avgParseTime: Math.round(parsedTemplates.reduce((sum, t) => sum + t.parseTime, 0) / parsedTemplates.length || 0),
    avgComplexity: Math.round(parsedTemplates.reduce((sum, t) => sum + t.ast.complexity, 0) / parsedTemplates.length || 0),
    enabledRules: parsingRules.filter(r => r.isEnabled).length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Parser</h1>
          <p className="text-muted-foreground">
            Advanced template parsing, AST generation, and code analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {parserStats.readyTemplates}/{parserStats.totalTemplates} Parsed
          </Badge>
          <Badge variant="outline">
            {parserStats.enabledRules} Rules Active
          </Badge>
          <Button onClick={() => setSelectedTab('parse')}>
            <Play className="h-4 w-4 mr-2" />
            Parse Template
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="parser">Parser Status</TabsTrigger>
          <TabsTrigger value="templates">Parsed Templates</TabsTrigger>
          <TabsTrigger value="parse">Parse Template</TabsTrigger>
          <TabsTrigger value="rules">Parsing Rules</TabsTrigger>
          <TabsTrigger value="config">Parser Config</TabsTrigger>
        </TabsList>

        <TabsContent value="parser" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{parserStats.totalTemplates}</div>
                <p className="text-xs text-muted-foreground">
                  {parserStats.readyTemplates} successfully parsed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Parse Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {parserStats.totalTemplates > 0 ? Math.round((parserStats.readyTemplates / parserStats.totalTemplates) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {parserStats.errorTemplates} parsing errors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Parse Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{parserStats.avgParseTime}ms</div>
                <p className="text-xs text-muted-foreground">
                  Processing time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Complexity</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getComplexityColor(parserStats.avgComplexity)}`}>
                  {parserStats.avgComplexity}
                </div>
                <p className="text-xs text-muted-foreground">
                  Code complexity score
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Parser Overview</CardTitle>
              <CardDescription>Template parsing engine capabilities and features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Parsing Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">TypeScript/JSX parsing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">AST generation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Dependency analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Component extraction</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Analysis Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-4 w-4 ${parserConfig.analyzePerformance ? 'text-green-500' : 'text-gray-500'}`} />
                      <span className="text-sm">Performance analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-4 w-4 ${parserConfig.validateImports ? 'text-green-500' : 'text-gray-500'}`} />
                      <span className="text-sm">Import validation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-4 w-4 ${parserConfig.extractMetadata ? 'text-green-500' : 'text-gray-500'}`} />
                      <span className="text-sm">Metadata extraction</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-4 w-4 ${parserConfig.strictMode ? 'text-green-500' : 'text-gray-500'}`} />
                      <span className="text-sm">Strict mode validation</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parsed Templates</CardTitle>
              <CardDescription>Templates that have been processed and analyzed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {parsedTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getStatusColor(template.status)} text-white`}>
                        {getStatusIcon(template.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant="outline">{template.metadata.framework}</Badge>
                          <Badge variant="secondary">{template.metadata.type}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-2">
                          <span>Parse time: {template.parseTime}ms</span>
                          <span>Size: {(template.size / 1024).toFixed(1)}KB</span>
                          <span>Components: {template.ast.components}</span>
                          <span className={`font-medium ${getComplexityColor(template.ast.complexity)}`}>
                            Complexity: {template.ast.complexity}
                          </span>
                        </div>
                        {template.validation.errors.length > 0 && (
                          <div className="text-sm text-red-600">
                            {template.validation.errors.length} error(s): {template.validation.errors[0]}
                          </div>
                        )}
                        {template.validation.warnings.length > 0 && (
                          <div className="text-sm text-yellow-600">
                            {template.validation.warnings.length} warning(s)
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportTemplate(template)}
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
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parse Template</CardTitle>
              <CardDescription>Parse and analyze template source code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="source-code">Template Source Code</Label>
                  <Textarea
                    id="source-code"
                    value={sourceCode}
                    onChange={(e) => setSourceCode(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                    placeholder="Paste your React/TypeScript template code here..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">
                      {sourceCode.length.toLocaleString()} characters
                    </Badge>
                    <Badge variant="outline">
                      {sourceCode.split('\n').length} lines
                    </Badge>
                  </div>
                  <Button
                    onClick={handleParseTemplate}
                    disabled={isParsing || !sourceCode.trim()}
                  >
                    {isParsing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                    {isParsing ? 'Parsing...' : 'Parse Template'}
                  </Button>
                </div>

                {isParsing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Parsing Progress</span>
                      <span>{parseProgress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${parseProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Terminal className="h-4 w-4 mr-2" />
                    Parsing Pipeline
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Lexical</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Syntax</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span>AST</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span>Analysis</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parsing Rules</CardTitle>
              <CardDescription>Configure parsing rules and patterns for template analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {parsingRules.map((rule) => (
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
                        <div className="text-xs">
                          <div><strong>Pattern:</strong> <code className="bg-muted px-1 rounded">{rule.pattern}</code></div>
                          <div><strong>Action:</strong> {rule.action}</div>
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parser Configuration</CardTitle>
              <CardDescription>Configure parser behavior and analysis options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Parsing Options</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="strict-mode">Strict Mode</Label>
                      <input
                        id="strict-mode"
                        type="checkbox"
                        checked={parserConfig.strictMode}
                        onChange={(e) => setParserConfig(prev => ({ ...prev, strictMode: e.target.checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="validate-imports">Validate Imports</Label>
                      <input
                        id="validate-imports"
                        type="checkbox"
                        checked={parserConfig.validateImports}
                        onChange={(e) => setParserConfig(prev => ({ ...prev, validateImports: e.target.checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="analyze-performance">Performance Analysis</Label>
                      <input
                        id="analyze-performance"
                        type="checkbox"
                        checked={parserConfig.analyzePerformance}
                        onChange={(e) => setParserConfig(prev => ({ ...prev, analyzePerformance: e.target.checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="extract-metadata">Extract Metadata</Label>
                      <input
                        id="extract-metadata"
                        type="checkbox"
                        checked={parserConfig.extractMetadata}
                        onChange={(e) => setParserConfig(prev => ({ ...prev, extractMetadata: e.target.checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="generate-ast">Generate AST</Label>
                      <input
                        id="generate-ast"
                        type="checkbox"
                        checked={parserConfig.generateAST}
                        onChange={(e) => setParserConfig(prev => ({ ...prev, generateAST: e.target.checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-optimizations">Enable Optimizations</Label>
                      <input
                        id="enable-optimizations"
                        type="checkbox"
                        checked={parserConfig.enableOptimizations}
                        onChange={(e) => setParserConfig(prev => ({ ...prev, enableOptimizations: e.target.checked }))}
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
                        value={parserConfig.timeout}
                        onChange={(e) => setParserConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30000 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-file-size">Max File Size (bytes)</Label>
                      <Input
                        id="max-file-size"
                        type="number"
                        min="1024"
                        max="10485760"
                        value={parserConfig.maxFileSize}
                        onChange={(e) => setParserConfig(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) || 1048576 }))}
                      />
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h5 className="font-medium mb-2">Current Configuration</h5>
                      <div className="space-y-1 text-sm">
                        <div>Timeout: {(parserConfig.timeout / 1000).toFixed(1)}s</div>
                        <div>Max Size: {(parserConfig.maxFileSize / 1024).toFixed(0)}KB</div>
                        <div>Enabled Features: {Object.values(parserConfig).filter(Boolean).length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}