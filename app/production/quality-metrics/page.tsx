'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Download,
  Calendar
} from 'lucide-react';

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  category: 'quality' | 'performance' | 'security' | 'coverage';
  unit: string;
  target: number;
  description: string;
}

interface QualityTrend {
  date: string;
  quality: number;
  tests: number;
  coverage: number;
  security: number;
}

interface QualityReport {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly';
  generated: string;
  status: 'ready' | 'generating' | 'failed';
  size: string;
}

export default function QualityMetricsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const metrics: MetricCard[] = [
    {
      id: 'overall-quality',
      title: 'Overall Quality Score',
      value: 94,
      change: 2.1,
      trend: 'up',
      category: 'quality',
      unit: '%',
      target: 90,
      description: 'Composite quality score based on all quality gates'
    },
    {
      id: 'test-coverage',
      title: 'Test Coverage',
      value: 92,
      change: 1.5,
      trend: 'up',
      category: 'coverage',
      unit: '%',
      target: 90,
      description: 'Code coverage across all test suites'
    },
    {
      id: 'security-score',
      title: 'Security Score',
      value: 98,
      change: 0.5,
      trend: 'up',
      category: 'security',
      unit: '%',
      target: 95,
      description: 'Security vulnerability and compliance score'
    },
    {
      id: 'performance-score',
      title: 'Performance Score',
      value: 89,
      change: -1.2,
      trend: 'down',
      category: 'performance',
      unit: '%',
      target: 85,
      description: 'Performance benchmarks and optimization metrics'
    },
    {
      id: 'build-success',
      title: 'Build Success Rate',
      value: 97,
      change: 0.8,
      trend: 'up',
      category: 'quality',
      unit: '%',
      target: 95,
      description: 'Percentage of successful builds in the last 30 days'
    },
    {
      id: 'deployment-time',
      title: 'Avg Deployment Time',
      value: 12,
      change: -2.3,
      trend: 'up',
      category: 'performance',
      unit: 'min',
      target: 15,
      description: 'Average time for successful deployments'
    },
    {
      id: 'defect-density',
      title: 'Defect Density',
      value: 0.3,
      change: -0.1,
      trend: 'up',
      category: 'quality',
      unit: 'per KLOC',
      target: 0.5,
      description: 'Number of defects per thousand lines of code'
    },
    {
      id: 'mttr',
      title: 'Mean Time to Recovery',
      value: 8,
      change: -1.5,
      trend: 'up',
      category: 'performance',
      unit: 'min',
      target: 10,
      description: 'Average time to recover from failures'
    }
  ];

  const qualityTrends: QualityTrend[] = [
    { date: '2025-09-09', quality: 91, tests: 89, coverage: 88, security: 96 },
    { date: '2025-09-10', quality: 92, tests: 90, coverage: 89, security: 97 },
    { date: '2025-09-11', quality: 93, tests: 91, coverage: 90, security: 97 },
    { date: '2025-09-12', quality: 92, tests: 90, coverage: 91, security: 98 },
    { date: '2025-09-13', quality: 94, tests: 92, coverage: 91, security: 98 },
    { date: '2025-09-14', quality: 93, tests: 91, coverage: 92, security: 98 },
    { date: '2025-09-15', quality: 94, tests: 92, coverage: 92, security: 98 },
    { date: '2025-09-16', quality: 94, tests: 92, coverage: 92, security: 98 }
  ];

  const qualityReports: QualityReport[] = [
    {
      id: 'daily-2025-09-16',
      title: 'Daily Quality Report - Sep 16, 2025',
      type: 'daily',
      generated: '2 hours ago',
      status: 'ready',
      size: '2.4 MB'
    },
    {
      id: 'weekly-2025-w37',
      title: 'Weekly Quality Report - Week 37, 2025',
      type: 'weekly',
      generated: '1 day ago',
      status: 'ready',
      size: '8.7 MB'
    },
    {
      id: 'monthly-2025-08',
      title: 'Monthly Quality Report - August 2025',
      type: 'monthly',
      generated: '16 days ago',
      status: 'ready',
      size: '24.1 MB'
    }
  ];

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up' && change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend === 'down' || change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quality':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'performance':
        return <Clock className="h-4 w-4 text-green-500" />;
      case 'security':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'coverage':
        return <BarChart3 className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'quality':
        return 'bg-blue-100 text-blue-800';
      case 'performance':
        return 'bg-green-100 text-green-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      case 'coverage':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const generateReport = async () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);
    }, 3000);
  };

  const isMetricOnTarget = (metric: MetricCard) => {
    const value = typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value;
    if (metric.unit === 'min' || metric.unit === 'per KLOC') {
      return value <= metric.target;
    }
    return value >= metric.target;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quality Metrics & Reporting</h1>
          <p className="text-muted-foreground">
            Quality dashboards, metrics tracking, and quality reporting
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={generateReport}
            disabled={isGeneratingReport}
            className="flex items-center gap-2"
          >
            {isGeneratingReport ? (
              <>
                <Activity className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Quality Dashboard</TabsTrigger>
          <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  {getCategoryIcon(metric.category)}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {metric.value}{metric.unit}
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend, metric.change)}
                      <span className={`text-sm ${
                        metric.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Target: {metric.target}{metric.unit}</span>
                      <span>
                        {isMetricOnTarget(metric) ? (
                          <CheckCircle className="h-3 w-3 text-green-500 inline" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-yellow-500 inline" />
                        )}
                      </span>
                    </div>
                    <Progress
                      value={isMetricOnTarget(metric) ? 100 : 75}
                      className="h-1"
                    />
                  </div>
                  <Badge className={`${getCategoryColor(metric.category)} mt-2`} variant="outline">
                    {metric.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quality Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Quality Gate Status</CardTitle>
                <CardDescription>Current status of all quality gates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Code Quality Gate</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Passed</span>
                    </div>
                  </div>
                  <Progress value={100} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Security Gate</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Passed</span>
                    </div>
                  </div>
                  <Progress value={100} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Performance Gate</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Passed</span>
                    </div>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Score Breakdown</CardTitle>
                <CardDescription>Components contributing to overall quality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Code Quality</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />

                  <div className="flex justify-between">
                    <span>Test Coverage</span>
                    <span className="font-medium">23%</span>
                  </div>
                  <Progress value={23} className="h-2" />

                  <div className="flex justify-between">
                    <span>Security</span>
                    <span className="font-medium">24%</span>
                  </div>
                  <Progress value={24} className="h-2" />

                  <div className="flex justify-between">
                    <span>Performance</span>
                    <span className="font-medium">22%</span>
                  </div>
                  <Progress value={22} className="h-2" />

                  <div className="flex justify-between">
                    <span>Documentation</span>
                    <span className="font-medium">6%</span>
                  </div>
                  <Progress value={6} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Quality Trends</h2>
            <div className="flex gap-2">
              {['7d', '30d', '90d'].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics Over Time</CardTitle>
              <CardDescription>Trends for key quality indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">94%</div>
                    <p className="text-sm text-muted-foreground">Current Quality</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">92%</div>
                    <p className="text-sm text-muted-foreground">Test Coverage</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">98%</div>
                    <p className="text-sm text-muted-foreground">Security Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">89%</div>
                    <p className="text-sm text-muted-foreground">Performance</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">Recent Trend Data</h4>
                  <div className="space-y-1 text-sm">
                    {qualityTrends.slice(-5).map((trend, index) => (
                      <div key={trend.date} className="flex justify-between items-center py-1">
                        <span>{trend.date}</span>
                        <div className="flex gap-4">
                          <span>Quality: {trend.quality}%</span>
                          <span>Tests: {trend.tests}%</span>
                          <span>Coverage: {trend.coverage}%</span>
                          <span>Security: {trend.security}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Quality Reports</h2>
            <Button onClick={generateReport} disabled={isGeneratingReport}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>

          <div className="grid gap-4">
            {qualityReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription>
                        Generated {report.generated} • {report.size}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Report Type: {report.type}</span>
                    <span>Format: PDF, Excel, JSON</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>Configure automated report generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Daily Reports</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Enabled</span>
                      <Badge variant="outline">Yes</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Time</span>
                      <Badge variant="outline">6:00 AM</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Recipients</span>
                      <Badge variant="outline">3 users</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Weekly Reports</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Enabled</span>
                      <Badge variant="outline">Yes</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Day</span>
                      <Badge variant="outline">Monday</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Recipients</span>
                      <Badge variant="outline">8 users</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Monthly Reports</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Enabled</span>
                      <Badge variant="outline">Yes</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Date</span>
                      <Badge variant="outline">1st</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Recipients</span>
                      <Badge variant="outline">12 users</Badge>
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