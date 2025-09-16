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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CheckCircle2,
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  BarChart3,
  Clock,
  Target,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ArrowLeft,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Send,
  Download,
  Eye,
  Settings,
  Zap,
  Brain,
  Timer,
  Bug
} from 'lucide-react';
import Link from 'next/link';

const DeveloperExperienceValidationPage = () => {
  const [usabilityTestRunning, setUsabilityTestRunning] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [validationScore, setValidationScore] = useState(92);
  const [selectedTester, setSelectedTester] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [satisfactionRating, setSatisfactionRating] = useState(5);

  const usabilityTests = [
    {
      name: "Environment Setup Flow",
      description: "Test the developer environment setup experience",
      status: "completed",
      score: 94,
      duration: "12 minutes",
      participants: 8,
      issues: 1,
      category: "setup"
    },
    {
      name: "Code Generation Workflow",
      description: "Validate AI-assisted code generation usability",
      status: "completed",
      score: 96,
      duration: "8 minutes",
      participants: 12,
      issues: 0,
      category: "generation"
    },
    {
      name: "Debugging Tools Interface",
      description: "Test debugging workflow and tool accessibility",
      status: "running",
      score: 89,
      duration: "15 minutes",
      participants: 6,
      issues: 2,
      category: "debugging"
    },
    {
      name: "Productivity Dashboard Navigation",
      description: "Evaluate dashboard usability and information architecture",
      status: "completed",
      score: 93,
      duration: "10 minutes",
      participants: 10,
      issues: 1,
      category: "navigation"
    },
    {
      name: "Deployment Pipeline Experience",
      description: "Test end-to-end deployment workflow usability",
      status: "pending",
      score: 0,
      duration: "20 minutes",
      participants: 0,
      issues: 0,
      category: "deployment"
    }
  ];

  const feedbackCategories = [
    {
      name: "Developer Productivity",
      score: 94,
      responses: 24,
      trend: "+8%",
      issues: ["Need faster code completion", "Build times could be improved"],
      suggestions: ["Add more AI suggestions", "Implement smart caching"]
    },
    {
      name: "Tool Usability",
      score: 91,
      responses: 28,
      trend: "+5%",
      issues: ["Debugging UI complex", "Too many tabs in productivity tools"],
      suggestions: ["Simplify debug interface", "Add workflow wizards"]
    },
    {
      name: "Learning Curve",
      score: 88,
      responses: 18,
      trend: "+12%",
      issues: ["Documentation scattered", "Onboarding overwhelming"],
      suggestions: ["Centralize docs", "Create guided tours"]
    },
    {
      name: "Performance",
      score: 96,
      responses: 32,
      trend: "+3%",
      issues: ["Memory usage in profiler", "Occasional lag in AI features"],
      suggestions: ["Optimize memory usage", "Add performance presets"]
    }
  ];

  const experienceMetrics = [
    { name: "Task Completion Rate", value: "94%", trend: "+6%", icon: <CheckCircle2 className="w-4 h-4" /> },
    { name: "Average Satisfaction", value: "4.6/5", trend: "+0.3", icon: <Star className="w-4 h-4" /> },
    { name: "Time to Productivity", value: "18min", trend: "-42%", icon: <Clock className="w-4 h-4" /> },
    { name: "Support Requests", value: "12", trend: "-67%", icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const optimizationRecommendations = [
    {
      title: "Streamline Debugging Interface",
      description: "Simplify the debugging tools UI to reduce cognitive load",
      impact: "High",
      effort: "Medium",
      category: "usability",
      priority: "high"
    },
    {
      title: "Enhanced Onboarding Flow",
      description: "Create interactive tutorials for new developer experience",
      impact: "High",
      effort: "High",
      category: "learning",
      priority: "high"
    },
    {
      title: "Smart Context Suggestions",
      description: "Add AI-powered contextual help throughout the interface",
      impact: "Medium",
      effort: "Medium",
      category: "assistance",
      priority: "medium"
    },
    {
      title: "Performance Optimization",
      description: "Optimize memory usage and response times in productivity tools",
      impact: "Medium",
      effort: "Low",
      category: "performance",
      priority: "medium"
    },
    {
      title: "Centralized Documentation",
      description: "Consolidate scattered documentation into unified knowledge base",
      impact: "High",
      effort: "Low",
      category: "documentation",
      priority: "high"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'running': return 'Running';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTrendColor = (trend: string) => {
    return trend.startsWith('+') ? 'text-green-600' : 'text-red-600';
  };

  const handleFeedbackSubmit = () => {
    setFeedbackSubmitted(true);
    setFeedbackText('');
    setSatisfactionRating(5);
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
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Developer Experience Validation</h1>
                <p className="text-lg text-gray-600">Usability testing, feedback collection, and experience optimization</p>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Overview */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Developer Experience Metrics</span>
            </CardTitle>
            <CardDescription>
              Current developer satisfaction and experience validation results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{validationScore}%</div>
                <div className="text-sm text-gray-500">Overall DX Score</div>
                <Progress value={validationScore} className="mt-2 h-2" />
                <div className="text-xs text-green-600 mt-1">Target: &gt;90%</div>
              </div>
              {experienceMetrics.map((metric, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
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

        <Tabs defaultValue="usability" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="usability">Usability Testing</TabsTrigger>
            <TabsTrigger value="feedback">Feedback Collection</TabsTrigger>
            <TabsTrigger value="optimization">Experience Optimization</TabsTrigger>
            <TabsTrigger value="results">Validation Results</TabsTrigger>
          </TabsList>

          {/* Usability Testing */}
          <TabsContent value="usability" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Usability Testing Suite</span>
                </CardTitle>
                <CardDescription>
                  Comprehensive usability tests for developer tools and workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usabilityTests.map((test, index) => (
                    <Card key={index} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Eye className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{test.name}</CardTitle>
                              <CardDescription>{test.description}</CardDescription>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(test.status)} text-white`}>
                            {getStatusText(test.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-xl font-bold text-gray-900">{test.score}</div>
                            <div className="text-xs text-gray-500">Usability Score</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-xl font-bold text-gray-900">{test.duration}</div>
                            <div className="text-xs text-gray-500">Avg Duration</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-xl font-bold text-gray-900">{test.participants}</div>
                            <div className="text-xs text-gray-500">Participants</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-xl font-bold text-gray-900">{test.issues}</div>
                            <div className="text-xs text-gray-500">Issues Found</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{test.category}</Badge>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Results
                            </Button>
                            <Button variant="outline" size="sm" disabled={test.status === 'completed'}>
                              {test.status === 'running' ? (
                                <>
                                  <PauseCircle className="w-4 h-4 mr-2" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="w-4 h-4 mr-2" />
                                  Start Test
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <PlayCircle className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-900">
                          {usabilityTestRunning ? 'Test Suite Running' : 'Test Suite Ready'}
                        </div>
                        <div className="text-sm text-blue-700">
                          {usabilityTestRunning ? 'Collecting usability data...' : 'Ready to run comprehensive usability tests'}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setUsabilityTestRunning(!usabilityTestRunning)}
                    >
                      {usabilityTestRunning ? (
                        <>
                          <PauseCircle className="w-4 h-4 mr-2" />
                          Pause Suite
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Run All Tests
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Collection */}
          <TabsContent value="feedback" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Submit Feedback</span>
                  </CardTitle>
                  <CardDescription>
                    Share your developer experience feedback and suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Developer Role</Label>
                    <Select value={selectedTester} onValueChange={setSelectedTester}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">Frontend Developer</SelectItem>
                        <SelectItem value="backend">Backend Developer</SelectItem>
                        <SelectItem value="fullstack">Full-Stack Developer</SelectItem>
                        <SelectItem value="devops">DevOps Engineer</SelectItem>
                        <SelectItem value="lead">Technical Lead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Overall Satisfaction</Label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setSatisfactionRating(rating)}
                          className={`p-1 ${rating <= satisfactionRating ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                      <span className="text-sm text-gray-500 ml-2">{satisfactionRating}/5</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Detailed Feedback</Label>
                    <Textarea
                      placeholder="Share your thoughts on the developer experience, tools, workflows, and suggestions for improvement..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <Button
                    onClick={handleFeedbackSubmit}
                    className="w-full"
                    disabled={!feedbackText.trim() || !selectedTester}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </Button>

                  {feedbackSubmitted && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 text-sm">Feedback submitted successfully!</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Feedback Analytics</span>
                  </CardTitle>
                  <CardDescription>
                    Aggregated feedback insights and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feedbackCategories.map((category, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-gray-500">{category.responses} responses</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-lg font-bold">{category.score}%</div>
                            <div className={`text-sm ${getTrendColor(category.trend)}`}>{category.trend}</div>
                          </div>
                        </div>
                        <Progress value={category.score} className="mb-3 h-2" />
                        <div className="text-xs text-gray-600">
                          <div className="mb-1">Recent Issues: {category.issues.join(', ')}</div>
                          <div>Suggestions: {category.suggestions.join(', ')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Experience Optimization */}
          <TabsContent value="optimization" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Experience Optimization Recommendations</span>
                </CardTitle>
                <CardDescription>
                  Data-driven recommendations to improve developer experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimizationRecommendations.map((rec, index) => (
                    <Card key={index} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{rec.title}</CardTitle>
                            <CardDescription>{rec.description}</CardDescription>
                          </div>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority} priority
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm font-medium text-blue-900">{rec.impact}</div>
                            <div className="text-xs text-blue-700">Impact</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-sm font-medium text-green-900">{rec.effort}</div>
                            <div className="text-xs text-green-700">Effort</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-sm font-medium text-purple-900">{rec.category}</div>
                            <div className="text-xs text-purple-700">Category</div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Target className="w-4 h-4 mr-2" />
                            Implement
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Discuss
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">Optimization Impact Projection</div>
                      <div className="text-sm text-gray-600">
                        Implementing high-priority recommendations could increase DX score to 96%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Validation Results */}
          <TabsContent value="results" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Developer Experience Validation Results</span>
                </CardTitle>
                <CardDescription>
                  Comprehensive validation outcomes and satisfaction metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-6 bg-green-50 rounded-lg text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-green-900">92%</div>
                    <div className="text-green-700 font-medium">Developer Satisfaction</div>
                    <div className="text-sm text-green-600 mt-2">Exceeds 90% target</div>
                  </div>
                  <div className="p-6 bg-blue-50 rounded-lg text-center">
                    <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-blue-900">94%</div>
                    <div className="text-blue-700 font-medium">Task Success Rate</div>
                    <div className="text-sm text-blue-600 mt-2">High usability achieved</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-3">Validation Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Usability testing completed across 5 core workflows</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Feedback collected from 32 developers</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Experience optimization recommendations identified</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Developer satisfaction score: 92% (target: &gt;90%)</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Task completion rate: 94%</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Validation page created and functional</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                    <Button variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Re-run Validation
                    </Button>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Tests
                    </Button>
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

export default DeveloperExperienceValidationPage;