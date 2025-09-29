"use client";

/**
 * Customization Quality Dashboard
 * HT-033.2.4: Customization Quality Assurance & Validation System
 *
 * Comprehensive dashboard for:
 * - Quality metrics overview
 * - Trend analysis and tracking
 * - Issue management and resolution
 * - Optimization recommendations
 * - Testing status and results
 * - Compliance monitoring
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Zap,
  Shield,
  Users,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Calendar
} from 'lucide-react';
import {
  QualityMetrics,
  QualityAssessment,
  QualityTrend,
  qualityAssuranceEngine
} from '@/lib/ai/quality-assurance-engine';
import {
  OptimizationRecommendation,
  OptimizationPlan,
  optimizationRecommender
} from '@/lib/ai/optimization-recommender';
import {
  TestExecution,
  TestSummary,
  customizationTester
} from '@/lib/ai/customization-tester';

interface QualityDashboardProps {
  customizationId: string;
  clientId: string;
  className?: string;
}

interface DashboardData {
  currentAssessment: QualityAssessment | null;
  trends: QualityTrend[];
  optimizationPlan: OptimizationPlan | null;
  testExecution: TestExecution | null;
  isLoading: boolean;
  error: string | null;
}

export function QualityDashboard({
  customizationId,
  clientId,
  className
}: QualityDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    currentAssessment: null,
    trends: [],
    optimizationPlan: null,
    testExecution: null,
    isLoading: true,
    error: null
  });

  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadDashboardData();
  }, [customizationId, selectedTimeRange]);

  const loadDashboardData = async () => {
    setDashboardData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate loading quality assessment data
      const mockAssessment: QualityAssessment = {
        id: 'qa-' + Date.now(),
        customizationId,
        clientId,
        assessmentDate: new Date(),
        metrics: {
          overallQuality: 85,
          reliability: 88,
          maintainability: 82,
          performance: 79,
          security: 92,
          usability: 86,
          accessibility: 81,
          brandCompliance: 90,
          technicalDebt: 75,
          testCoverage: 68
        },
        grade: 'B+',
        status: 'good',
        issues: [],
        recommendations: [],
        complianceScore: 87,
        riskLevel: 'low',
        estimatedImprovementTime: 16
      };

      // Generate trends data
      const trends = generateMockTrends();

      setDashboardData({
        currentAssessment: mockAssessment,
        trends,
        optimizationPlan: null,
        testExecution: null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setDashboardData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data'
      }));
    }
  };

  const generateMockTrends = (): QualityTrend[] => {
    const trends: QualityTrend[] = [];
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      trends.push({
        date,
        metrics: {
          overallQuality: 75 + Math.random() * 20,
          reliability: 80 + Math.random() * 15,
          maintainability: 70 + Math.random() * 25,
          performance: 65 + Math.random() * 30,
          security: 85 + Math.random() * 10,
          usability: 75 + Math.random() * 20,
          accessibility: 70 + Math.random() * 25,
          brandCompliance: 80 + Math.random() * 15,
          technicalDebt: 60 + Math.random() * 30,
          testCoverage: 50 + Math.random() * 40
        },
        grade: 'B',
        issues: Math.floor(Math.random() * 10),
        improvements: Math.floor(Math.random() * 5)
      });
    }

    return trends;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getGradeColor = (grade: string) => {
    switch (grade.charAt(0)) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const { currentAssessment, trends, isLoading, error } = dashboardData;

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <p>Loading quality dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              <p>Error: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentAssessment) {
    return (
      <div className={`${className}`}>
        <Card>
          <CardContent className="pt-6">
            <p>No quality assessment data available. Run a validation to get started.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive quality metrics and insights
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{currentAssessment.metrics.overallQuality}</p>
                <p className="text-sm text-muted-foreground">Overall Quality</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getGradeColor(currentAssessment.grade)}>
                  {currentAssessment.grade}
                </Badge>
                {trends.length > 1 && getTrendIcon(
                  currentAssessment.metrics.overallQuality,
                  trends[trends.length - 2].metrics.overallQuality
                )}
              </div>
            </div>
            <Progress value={currentAssessment.metrics.overallQuality} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{currentAssessment.complianceScore}%</p>
                <p className="text-sm text-muted-foreground">Compliance Score</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={currentAssessment.complianceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold capitalize">{currentAssessment.riskLevel}</p>
                <p className="text-sm text-muted-foreground">Risk Level</p>
              </div>
              <Badge className={getRiskColor(currentAssessment.riskLevel)}>
                {currentAssessment.riskLevel.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{currentAssessment.estimatedImprovementTime}h</p>
                <p className="text-sm text-muted-foreground">Est. Fix Time</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(currentAssessment.metrics).map(([key, value]) => {
              if (key === 'overallQuality') return null;

              const icons: Record<string, any> = {
                reliability: Target,
                maintainability: Settings,
                performance: Zap,
                security: Shield,
                usability: Users,
                accessibility: Users,
                brandCompliance: BarChart3,
                technicalDebt: AlertTriangle,
                testCoverage: CheckCircle
              };

              const Icon = icons[key] || BarChart3;

              return (
                <Card key={key}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold">{Math.round(value)}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                      </div>
                      <Icon className="h-6 w-6 text-blue-500" />
                    </div>
                    <Progress value={value} className="mt-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Trends</CardTitle>
              <CardDescription>
                Quality metrics over time ({selectedTimeRange})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>Quality trend chart would be rendered here with actual charting library</p>
              </div>
            </CardContent>
          </Card>

          {/* Trend Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {trends.reduce((sum, t) => sum + t.improvements, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Improvements</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {trends[trends.length - 1]?.issues || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Current Issues</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {currentAssessment.assessmentDate.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Last Assessment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Issues</CardTitle>
              <CardDescription>
                Issues requiring attention ({currentAssessment.issues.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentAssessment.issues.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-medium">No active issues</p>
                  <p className="text-muted-foreground">All quality checks are passing</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentAssessment.issues.map((issue, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={
                                issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                issue.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }>
                                {issue.severity}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {issue.category}
                              </Badge>
                            </div>
                            <h4 className="font-medium mb-1">{issue.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {issue.description}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>
                AI-powered suggestions to improve quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentAssessment.recommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">{rec}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Apply
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testing Status</CardTitle>
              <CardDescription>
                Automated testing results and coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-lg font-medium">No active test runs</p>
                <p className="text-muted-foreground mb-4">Start automated testing to see results</p>
                <Button>
                  Start Test Suite
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}