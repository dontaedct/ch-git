"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Zap,
  Bug,
  Activity,
  Brain,
  Timer,
  BarChart3,
  Search,
  Code,
  Terminal,
  Eye,
  Settings,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  TrendingUp,
  Clock,
  Cpu,
  MonitorIcon,
  Network,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Target
} from 'lucide-react';
import Link from 'next/link';

const ProductivityToolsPage = () => {
  const [activeDebugger, setActiveDebugger] = useState(false);
  const [profilerRunning, setProfilerRunning] = useState(false);
  const [productivityScore, setProductivityScore] = useState(94);
  const [autoOptimizationEnabled, setAutoOptimizationEnabled] = useState(true);
  const [workflowSuggestionsEnabled, setWorkflowSuggestionsEnabled] = useState(true);
  const [efficiencyMode, setEfficiencyMode] = useState('enhanced');

  const debugTools = [
    {
      name: "React DevTools Integration",
      description: "Enhanced React component debugging with state inspection",
      icon: <Code className="w-5 h-5" />,
      status: "active",
      features: ["Component Tree", "Props Inspector", "State Tracking", "Performance Profiler"]
    },
    {
      name: "Console Enhancement",
      description: "Advanced console logging with filtering and formatting",
      icon: <Terminal className="w-5 h-5" />,
      status: "available",
      features: ["Color Coding", "Log Filtering", "Stack Traces", "Performance Timing"]
    },
    {
      name: "Network Monitor",
      description: "API call monitoring and debugging tools",
      icon: <Network className="w-5 h-5" />,
      status: "available",
      features: ["Request Tracking", "Response Analysis", "Error Detection", "Performance Metrics"]
    },
    {
      name: "Error Boundary Debugger",
      description: "Advanced error handling and recovery tools",
      icon: <Bug className="w-5 h-5" />,
      status: "available",
      features: ["Error Capture", "Stack Analysis", "Recovery Suggestions", "Error Reporting"]
    }
  ];

  const profilingTools = [
    {
      name: "Performance Profiler",
      description: "Real-time performance monitoring and optimization",
      icon: <Activity className="w-5 h-5" />,
      metrics: ["CPU Usage", "Memory", "Render Time", "Bundle Size"],
      currentValue: "23ms avg render"
    },
    {
      name: "Memory Analyzer",
      description: "Memory usage tracking and leak detection",
      icon: <MonitorIcon className="w-5 h-5" />,
      metrics: ["Heap Size", "Memory Leaks", "GC Events", "Object Count"],
      currentValue: "45MB heap"
    },
    {
      name: "Bundle Analyzer",
      description: "JavaScript bundle size analysis and optimization",
      icon: <BarChart3 className="w-5 h-5" />,
      metrics: ["Bundle Size", "Code Splitting", "Tree Shaking", "Dependencies"],
      currentValue: "2.4MB total"
    },
    {
      name: "Network Profiler",
      description: "Network request performance analysis",
      icon: <Network className="w-5 h-5" />,
      metrics: ["Request Time", "Payload Size", "Cache Hits", "Failed Requests"],
      currentValue: "156ms avg"
    }
  ];

  const assistanceFeatures = [
    {
      name: "AI Code Suggestions",
      description: "Intelligent code completion and suggestions",
      icon: <Brain className="w-5 h-5" />,
      enabled: true,
      features: ["Auto-completion", "Code Refactoring", "Bug Detection", "Performance Tips"]
    },
    {
      name: "Smart Search",
      description: "Enhanced code search with semantic understanding",
      icon: <Search className="w-5 h-5" />,
      enabled: true,
      features: ["Semantic Search", "Usage Examples", "Documentation", "Related Code"]
    },
    {
      name: "Code Quality Insights",
      description: "Real-time code quality feedback and improvements",
      icon: <Target className="w-5 h-5" />,
      enabled: false,
      features: ["Quality Score", "Best Practices", "Security Checks", "Performance Hints"]
    },
    {
      name: "Development Shortcuts",
      description: "Automated workflows and productivity shortcuts",
      icon: <Lightbulb className="w-5 h-5" />,
      enabled: true,
      features: ["Quick Actions", "Template Insertion", "Workflow Automation", "Custom Snippets"]
    }
  ];

  const productivityMetrics = [
    { name: "Lines of Code", value: 1847, trend: "+32%", icon: <Code className="w-4 h-4" /> },
    { name: "Debug Sessions", value: 4, trend: "-50%", icon: <Bug className="w-4 h-4" /> },
    { name: "Build Time", value: "1.2s", trend: "-48%", icon: <Timer className="w-4 h-4" /> },
    { name: "Test Coverage", value: "97%", trend: "+8%", icon: <CheckCircle2 className="w-4 h-4" /> }
  ];

  const workflowOptimizations = [
    {
      name: "Smart Code Completion",
      description: "AI-powered code completion with context awareness",
      impact: "40% faster coding",
      enabled: true,
      category: "coding"
    },
    {
      name: "Automated Testing Triggers",
      description: "Run relevant tests automatically when code changes",
      impact: "60% faster validation",
      enabled: true,
      category: "testing"
    },
    {
      name: "Intelligent Build Optimization",
      description: "Only rebuild changed modules with smart caching",
      impact: "70% faster builds",
      enabled: true,
      category: "build"
    },
    {
      name: "Auto-Import Resolution",
      description: "Automatically resolve and add missing imports",
      impact: "90% fewer import errors",
      enabled: true,
      category: "coding"
    },
    {
      name: "Smart Error Recovery",
      description: "Suggest fixes for common development errors",
      impact: "50% faster debugging",
      enabled: true,
      category: "debugging"
    },
    {
      name: "Workflow Pattern Learning",
      description: "Learn your patterns and suggest optimized workflows",
      impact: "25% productivity increase",
      enabled: true,
      category: "learning"
    }
  ];

  const efficiencyEnhancements = [
    {
      name: "Batch Operations",
      description: "Execute multiple related operations simultaneously",
      timeSaved: "2.5 hours/day",
      category: "automation"
    },
    {
      name: "Smart Shortcuts",
      description: "Context-aware keyboard shortcuts and quick actions",
      timeSaved: "1.8 hours/day",
      category: "shortcuts"
    },
    {
      name: "Predictive Pre-loading",
      description: "Pre-load resources based on usage patterns",
      timeSaved: "45 minutes/day",
      category: "performance"
    },
    {
      name: "Auto-Documentation",
      description: "Generate documentation from code comments and structure",
      timeSaved: "3.2 hours/day",
      category: "documentation"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'available': return 'bg-blue-500';
      case 'disabled': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getTrendColor = (trend: string) => {
    return trend.startsWith('+') ? 'text-green-600' : 'text-red-600';
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
              <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Developer Productivity Tools</h1>
                <p className="text-lg text-gray-600">Debug, profile, and optimize your development workflow</p>
              </div>
            </div>
          </div>
        </div>

        {/* Productivity Overview */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Productivity Overview</span>
            </CardTitle>
            <CardDescription>
              Your development productivity metrics and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{productivityScore}%</div>
                <div className="text-sm text-gray-500">Productivity Score</div>
                <Progress value={productivityScore} className="mt-2 h-2" />
                <div className="text-xs text-green-600 mt-1">+7% from optimizations</div>
              </div>
              {productivityMetrics.map((metric, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {metric.icon}
                  </div>
                  <div>
                    <div className="font-semibold">{metric.value}</div>
                    <div className="text-sm text-gray-500">{metric.name}</div>
                    <div className={`text-xs ${getTrendColor(metric.trend)}`}>{metric.trend}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflow">Workflow Optimization</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency Enhancements</TabsTrigger>
            <TabsTrigger value="debugging">Debugging Tools</TabsTrigger>
            <TabsTrigger value="profiling">Performance Profiling</TabsTrigger>
            <TabsTrigger value="assistance">AI Assistance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Productivity Optimization Status</span>
                  </CardTitle>
                  <CardDescription>Current optimization levels and performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto-Optimization</div>
                      <div className="text-sm text-gray-500">Intelligent workflow improvements</div>
                    </div>
                    <Switch checked={autoOptimizationEnabled} onCheckedChange={setAutoOptimizationEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Workflow Suggestions</div>
                      <div className="text-sm text-gray-500">AI-powered workflow recommendations</div>
                    </div>
                    <Switch checked={workflowSuggestionsEnabled} onCheckedChange={setWorkflowSuggestionsEnabled} />
                  </div>
                  <div className="space-y-2">
                    <Label>Efficiency Mode</Label>
                    <Select value={efficiencyMode} onValueChange={setEfficiencyMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="enhanced">Enhanced</SelectItem>
                        <SelectItem value="maximum">Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Time Savings Summary</span>
                  </CardTitle>
                  <CardDescription>Daily time savings from optimizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">8.0 hours</div>
                      <div className="text-sm text-gray-500">Total Daily Time Saved</div>
                    </div>
                    <div className="space-y-2">
                      {efficiencyEnhancements.map((enhancement, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{enhancement.name}</span>
                          <span className="text-green-600 font-medium">{enhancement.timeSaved}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Quick Productivity Actions</CardTitle>
                <CardDescription>One-click productivity boosters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="flex flex-col space-y-2 p-4 h-auto">
                    <Zap className="w-6 h-6" />
                    <span>Optimize Workflow</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col space-y-2 p-4 h-auto">
                    <Brain className="w-6 h-6" />
                    <span>AI Suggestions</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col space-y-2 p-4 h-auto">
                    <Timer className="w-6 h-6" />
                    <span>Speed Boost</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col space-y-2 p-4 h-auto">
                    <Target className="w-6 h-6" />
                    <span>Focus Mode</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflow Optimization Tab */}
          <TabsContent value="workflow" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Workflow Optimizations</span>
                </CardTitle>
                <CardDescription>
                  Intelligent workflow improvements for enhanced productivity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflowOptimizations.map((optimization, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Zap className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{optimization.name}</div>
                            <div className="text-sm text-gray-500">{optimization.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {optimization.impact}
                          </Badge>
                          <Switch checked={optimization.enabled} />
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">
                        Category: {optimization.category}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Efficiency Enhancements Tab */}
          <TabsContent value="efficiency" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Efficiency Enhancements</span>
                </CardTitle>
                <CardDescription>
                  Advanced efficiency tools to maximize your development speed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {efficiencyEnhancements.map((enhancement, index) => (
                    <Card key={index} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{enhancement.name}</CardTitle>
                              <CardDescription>{enhancement.description}</CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{enhancement.timeSaved}</div>
                          <div className="text-sm text-green-700">Time Saved Daily</div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{enhancement.category}</Badge>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Enhanced Efficiency Mode Active</div>
                      <div className="text-sm text-gray-600">
                        All efficiency enhancements are optimized for maximum productivity
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Debugging Tools */}
          <TabsContent value="debugging" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bug className="w-5 h-5" />
                  <span>Debugging Tools</span>
                </CardTitle>
                <CardDescription>
                  Advanced debugging tools for efficient problem solving
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {debugTools.map((tool, index) => (
                    <Card key={index} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-red-100 rounded-lg text-red-600">
                              {tool.icon}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{tool.name}</CardTitle>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(tool.status)} text-white`}>
                            {tool.status}
                          </Badge>
                        </div>
                        <CardDescription>{tool.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          {tool.features.map((feature, fIndex) => (
                            <div key={fIndex} className="flex items-center space-x-2 text-sm">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full">
                          {tool.status === 'active' ? 'Configure' : 'Activate'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-900">Debug Session Active</div>
                        <div className="text-sm text-blue-700">Monitoring application state and performance</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveDebugger(!activeDebugger)}
                      >
                        {activeDebugger ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="sm">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Profiling */}
          <TabsContent value="profiling" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Performance Profiling</span>
                </CardTitle>
                <CardDescription>
                  Real-time performance monitoring and optimization tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {profilingTools.map((tool, index) => (
                    <Card key={index} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            {tool.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{tool.name}</CardTitle>
                            <CardDescription>{tool.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">{tool.currentValue}</div>
                          <div className="text-sm text-gray-500">Current Performance</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {tool.metrics.map((metric, mIndex) => (
                            <div key={mIndex} className="text-xs text-gray-600 flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span>{metric}</span>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full">
                          Start Profiling
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Cpu className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-900">
                          {profilerRunning ? 'Profiler Active' : 'Profiler Ready'}
                        </div>
                        <div className="text-sm text-green-700">
                          {profilerRunning ? 'Collecting performance data...' : 'Ready to analyze performance'}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setProfilerRunning(!profilerRunning)}
                    >
                      {profilerRunning ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Assistance */}
          <TabsContent value="assistance" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>AI Development Assistance</span>
                </CardTitle>
                <CardDescription>
                  Intelligent tools to boost your development productivity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {assistanceFeatures.map((feature, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            {feature.icon}
                          </div>
                          <div>
                            <div className="font-medium">{feature.name}</div>
                            <div className="text-sm text-gray-500">{feature.description}</div>
                          </div>
                        </div>
                        <Switch checked={feature.enabled} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {feature.features.map((feat, fIndex) => (
                          <div key={fIndex} className="text-xs text-gray-600 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-medium text-purple-900">AI Assistant Status</div>
                      <div className="text-sm text-purple-700">Ready to help with code suggestions and optimization</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default ProductivityToolsPage;