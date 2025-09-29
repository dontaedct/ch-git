/**
 * @fileoverview Template Analysis Interface - HT-033.1.1
 * @module app/admin/templates/analysis/page
 * @author Hero Task System
 * @version 1.0.0
 *
 * Administrative interface for template system analysis,
 * providing comprehensive insights, recommendations, and management tools.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Search,
  RefreshCw,
  Download,
  Upload,
  Settings,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  FileText,
  Code,
  Zap,
  Shield,
  Eye,
  Users,
  Layers,
  GitBranch,
  Package,
  Cpu,
  Database,
  Network,
  Lock,
  Gauge,
  Target,
  BookOpen,
  Lightbulb,
  Wrench,
  Filter,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Share,
  Star,
  Heart,
  MessageSquare
} from 'lucide-react';

// Types and interfaces
interface TemplateSystemAnalysis {
  overview: SystemOverview;
  templates: TemplateAnalysis[];
  infrastructure: InfrastructureAnalysis;
  dependencies: DependencyAnalysis;
  customizationPoints: CustomizationPoint[];
  performance: PerformanceAnalysis;
  security: SecurityAnalysis;
  recommendations: RecommendationList;
  migrationPath: MigrationPath;
  compatibility: CompatibilityMatrix;
}

interface SystemOverview {
  totalTemplates: number;
  templateTypes: TemplateTypeStats[];
  systemVersion: string;
  lastUpdated: Date;
  maturityLevel: 'basic' | 'intermediate' | 'advanced' | 'enterprise';
  architectureType: 'monolithic' | 'modular' | 'microservices' | 'hybrid';
  scalabilityScore: number;
  maintainabilityScore: number;
  extensibilityScore: number;
}

interface TemplateAnalysis {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  complexity: ComplexityMetrics;
  dependencies: string[];
  customizationPotential: number;
  reusabilityScore: number;
  qualityScore: number;
  lastModified: Date;
  issues: AnalysisIssue[];
  enhancementOpportunities: EnhancementOpportunity[];
}

interface ComplexityMetrics {
  cyclomaticComplexity: number;
  nestingDepth: number;
  linesOfCode: number;
  couplingScore: number;
  cohesionScore: number;
  abstractionLevel: number;
}

interface AnalysisIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution: string[];
}

interface EnhancementOpportunity {
  type: string;
  description: string;
  benefit: string[];
  effort: number;
  priority: number;
}

interface TemplateTypeStats {
  type: string;
  count: number;
  percentage: number;
  averageComplexity: number;
  totalSize: number;
}

interface RecommendationList {
  priority: PriorityRecommendation[];
  enhancement: EnhancementRecommendation[];
  optimization: OptimizationRecommendation[];
  security: SecurityRecommendation[];
  architecture: ArchitecturalRecommendation[];
}

interface PriorityRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: number;
  impact: number;
  timeline: string;
  dependencies: string[];
}

// Main component
export default function TemplateAnalysisPage() {
  const [analysis, setAnalysis] = useState<TemplateSystemAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  // Initialize analysis
  useEffect(() => {
    performAnalysis();
  }, []);

  const performAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call to template analyzer
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock analysis data
      const mockAnalysis: TemplateSystemAnalysis = {
        overview: {
          totalTemplates: 127,
          templateTypes: [
            { type: 'component', count: 45, percentage: 35.4, averageComplexity: 3.2, totalSize: 2048576 },
            { type: 'page', count: 32, percentage: 25.2, averageComplexity: 4.1, totalSize: 3145728 },
            { type: 'layout', count: 18, percentage: 14.2, averageComplexity: 2.8, totalSize: 1572864 },
            { type: 'micro-app', count: 12, percentage: 9.4, averageComplexity: 5.6, totalSize: 4194304 },
            { type: 'form', count: 20, percentage: 15.7, averageComplexity: 3.9, totalSize: 2621440 }
          ],
          systemVersion: '2.1.0',
          lastUpdated: new Date(),
          maturityLevel: 'advanced',
          architectureType: 'hybrid',
          scalabilityScore: 87,
          maintainabilityScore: 78,
          extensibilityScore: 92
        },
        templates: [
          {
            id: 'dashboard-template',
            name: 'Dashboard Template',
            path: 'app/dashboard/page.tsx',
            type: 'page',
            size: 45632,
            complexity: {
              cyclomaticComplexity: 12,
              nestingDepth: 4,
              linesOfCode: 234,
              couplingScore: 0.6,
              cohesionScore: 0.8,
              abstractionLevel: 0.7
            },
            dependencies: ['react', 'next', 'tailwindcss'],
            customizationPotential: 85,
            reusabilityScore: 78,
            qualityScore: 82,
            lastModified: new Date('2024-03-15'),
            issues: [
              {
                type: 'warning',
                category: 'performance',
                description: 'Large bundle size detected',
                location: 'dashboard/components/Chart.tsx',
                severity: 'medium',
                resolution: ['Implement code splitting', 'Lazy load heavy components']
              }
            ],
            enhancementOpportunities: [
              {
                type: 'performance',
                description: 'Add virtualization for large data tables',
                benefit: ['Improved scroll performance', 'Reduced memory usage'],
                effort: 16,
                priority: 3
              }
            ]
          }
        ],
        infrastructure: {} as InfrastructureAnalysis,
        dependencies: {} as DependencyAnalysis,
        customizationPoints: [],
        performance: {} as PerformanceAnalysis,
        security: {} as SecurityAnalysis,
        recommendations: {
          priority: [
            {
              id: 'perf-optimization',
              title: 'Performance Optimization',
              description: 'Optimize bundle sizes and implement lazy loading',
              priority: 'high',
              effort: 32,
              impact: 8,
              timeline: '2-3 weeks',
              dependencies: []
            },
            {
              id: 'type-safety',
              title: 'Improve Type Safety',
              description: 'Add comprehensive TypeScript interfaces',
              priority: 'medium',
              effort: 16,
              impact: 6,
              timeline: '1-2 weeks',
              dependencies: []
            }
          ],
          enhancement: [],
          optimization: [],
          security: [],
          architecture: []
        },
        migrationPath: {} as MigrationPath,
        compatibility: {} as CompatibilityMatrix
      };

      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredTemplates = analysis?.templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || template.type === filterType;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    const aValue = a[sortBy as keyof typeof a];
    const bValue = b[sortBy as keyof typeof b];
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  }) || [];

  const toggleDetails = (id: string) => {
    setShowDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Analyzing Template System</h2>
            <p className="text-gray-600">Performing comprehensive analysis of templates, dependencies, and architecture...</p>
            <div className="mt-4 w-64 mx-auto">
              <Progress value={75} className="h-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription>
            Unable to load template system analysis. Please try again.
            <Button onClick={performAnalysis} variant="outline" size="sm" className="ml-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template System Analysis</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analysis and insights for template management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={performAnalysis} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Analysis
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-3xl font-bold">{analysis.overview.totalTemplates}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary">{analysis.overview.maturityLevel}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scalability Score</p>
                <p className="text-3xl font-bold">{analysis.overview.scalabilityScore}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Progress value={analysis.overview.scalabilityScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maintainability</p>
                <p className="text-3xl font-bold">{analysis.overview.maintainabilityScore}</p>
              </div>
              <Wrench className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4">
              <Progress value={analysis.overview.maintainabilityScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Extensibility</p>
                <p className="text-3xl font-bold">{analysis.overview.extensibilityScore}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <Progress value={analysis.overview.extensibilityScore} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="migration">Migration</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Template Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.overview.templateTypes.map((type, index) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                        />
                        <span className="font-medium capitalize">{type.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{type.count}</div>
                        <div className="text-sm text-gray-500">{type.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Architecture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layers className="h-5 w-5 mr-2" />
                  System Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Architecture Type</span>
                    <Badge variant="outline" className="capitalize">
                      {analysis.overview.architectureType}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">System Version</span>
                    <Badge variant="secondary">{analysis.overview.systemVersion}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Updated</span>
                    <span className="text-sm text-gray-600">
                      {analysis.overview.lastUpdated.toLocaleDateString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Scalability</span>
                        <span>{analysis.overview.scalabilityScore}%</span>
                      </div>
                      <Progress value={analysis.overview.scalabilityScore} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Maintainability</span>
                        <span>{analysis.overview.maintainabilityScore}%</span>
                      </div>
                      <Progress value={analysis.overview.maintainabilityScore} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Extensibility</span>
                        <span>{analysis.overview.extensibilityScore}%</span>
                      </div>
                      <Progress value={analysis.overview.extensibilityScore} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Templates</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name or path..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="filter">Filter by Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px] mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="component">Components</SelectItem>
                      <SelectItem value="page">Pages</SelectItem>
                      <SelectItem value="layout">Layouts</SelectItem>
                      <SelectItem value="micro-app">Micro Apps</SelectItem>
                      <SelectItem value="form">Forms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sort">Sort By</Label>
                  <div className="flex gap-2 mt-1">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="type">Type</SelectItem>
                        <SelectItem value="size">Size</SelectItem>
                        <SelectItem value="qualityScore">Quality</SelectItem>
                        <SelectItem value="lastModified">Modified</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates List */}
          <div className="space-y-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{template.name}</h3>
                        <Badge variant="outline" className="capitalize">
                          {template.type}
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <Gauge className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Quality: {template.qualityScore}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.path}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Size</p>
                          <p className="text-sm font-medium">
                            {(template.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Complexity</p>
                          <p className="text-sm font-medium">
                            {template.complexity.cyclomaticComplexity}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Reusability</p>
                          <p className="text-sm font-medium">{template.reusabilityScore}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Customization</p>
                          <p className="text-sm font-medium">{template.customizationPotential}%</p>
                        </div>
                      </div>

                      {/* Issues and Opportunities */}
                      {(template.issues.length > 0 || template.enhancementOpportunities.length > 0) && (
                        <div className="flex items-center space-x-4 mb-3">
                          {template.issues.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                              <span className="text-sm text-orange-600">
                                {template.issues.length} issue{template.issues.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                          {template.enhancementOpportunities.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Lightbulb className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-blue-600">
                                {template.enhancementOpportunities.length} enhancement{template.enhancementOpportunities.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDetails(template.id)}
                      >
                        {showDetails[template.id] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Detailed Information */}
                  {showDetails[template.id] && (
                    <div className="mt-6 pt-6 border-t">
                      <Tabs defaultValue="complexity" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="complexity">Complexity</TabsTrigger>
                          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                          <TabsTrigger value="issues">Issues</TabsTrigger>
                          <TabsTrigger value="enhancements">Enhancements</TabsTrigger>
                        </TabsList>

                        <TabsContent value="complexity" className="mt-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm font-medium">Cyclomatic Complexity</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {template.complexity.cyclomaticComplexity}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Nesting Depth</p>
                              <p className="text-2xl font-bold text-green-600">
                                {template.complexity.nestingDepth}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Lines of Code</p>
                              <p className="text-2xl font-bold text-purple-600">
                                {template.complexity.linesOfCode}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Coupling Score</p>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1">
                                  <Progress
                                    value={template.complexity.couplingScore * 100}
                                    className="h-2"
                                  />
                                </div>
                                <span className="text-sm font-medium">
                                  {(template.complexity.couplingScore * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Cohesion Score</p>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1">
                                  <Progress
                                    value={template.complexity.cohesionScore * 100}
                                    className="h-2"
                                  />
                                </div>
                                <span className="text-sm font-medium">
                                  {(template.complexity.cohesionScore * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Abstraction Level</p>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1">
                                  <Progress
                                    value={template.complexity.abstractionLevel * 100}
                                    className="h-2"
                                  />
                                </div>
                                <span className="text-sm font-medium">
                                  {(template.complexity.abstractionLevel * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="dependencies" className="mt-4">
                          <div className="space-y-2">
                            {template.dependencies.length > 0 ? (
                              template.dependencies.map((dep, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <span className="font-mono text-sm">{dep}</span>
                                  <Badge variant="secondary">external</Badge>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 text-sm">No external dependencies detected</p>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="issues" className="mt-4">
                          <div className="space-y-3">
                            {template.issues.length > 0 ? (
                              template.issues.map((issue, index) => (
                                <Alert key={index}>
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertTitle className="flex items-center justify-between">
                                    <span>{issue.category}</span>
                                    <Badge className={getSeverityColor(issue.severity)}>
                                      {issue.severity}
                                    </Badge>
                                  </AlertTitle>
                                  <AlertDescription>
                                    <p className="mb-2">{issue.description}</p>
                                    <p className="text-xs text-gray-600 mb-2">
                                      Location: {issue.location}
                                    </p>
                                    <div className="space-y-1">
                                      <p className="text-xs font-medium">Recommended actions:</p>
                                      <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                                        {issue.resolution.map((action, actionIndex) => (
                                          <li key={actionIndex}>{action}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </AlertDescription>
                                </Alert>
                              ))
                            ) : (
                              <p className="text-gray-500 text-sm">No issues detected</p>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="enhancements" className="mt-4">
                          <div className="space-y-3">
                            {template.enhancementOpportunities.length > 0 ? (
                              template.enhancementOpportunities.map((opportunity, index) => (
                                <Card key={index}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className="font-medium">{opportunity.type}</h4>
                                      <div className="flex items-center space-x-2">
                                        <Badge variant="outline">
                                          {opportunity.effort}h effort
                                        </Badge>
                                        <Badge className={getPriorityColor(
                                          opportunity.priority >= 4 ? 'high' :
                                          opportunity.priority >= 3 ? 'medium' : 'low'
                                        )}>
                                          Priority {opportunity.priority}/5
                                        </Badge>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                      {opportunity.description}
                                    </p>
                                    <div>
                                      <p className="text-xs font-medium mb-1">Benefits:</p>
                                      <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                                        {opportunity.benefit.map((benefit, benefitIndex) => (
                                          <li key={benefitIndex}>{benefit}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
                            ) : (
                              <p className="text-gray-500 text-sm">No enhancement opportunities identified</p>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription>
                System performance metrics and optimization opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Performance analysis will be available in the next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Analysis</CardTitle>
              <CardDescription>
                Security assessment and vulnerability analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Security analysis will be available in the next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Priority Recommendations</CardTitle>
              <CardDescription>
                High-impact improvements for your template system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.recommendations.priority.map((recommendation) => (
                  <Card key={recommendation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold">{recommendation.title}</h3>
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        {recommendation.description}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Effort</p>
                          <p className="text-sm font-medium">{recommendation.effort} hours</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Impact</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={recommendation.impact * 10} className="h-2 flex-1" />
                            <span className="text-sm font-medium">{recommendation.impact}/10</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Timeline</p>
                          <p className="text-sm font-medium">{recommendation.timeline}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {recommendation.dependencies.length} dependencies
                          </span>
                        </div>
                        <Button size="sm">
                          <Target className="h-4 w-4 mr-2" />
                          Plan Implementation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Migration Tab */}
        <TabsContent value="migration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Migration Path</CardTitle>
              <CardDescription>
                Recommended migration strategy and implementation plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Migration planning will be available in the next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}