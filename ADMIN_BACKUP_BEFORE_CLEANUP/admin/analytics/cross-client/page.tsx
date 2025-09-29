'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  AlertTriangle,
  Download,
  Filter,
  Calendar,
  Target,
  Zap
} from 'lucide-react';

interface CrossClientMetrics {
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  averageClientValue: number;
  performanceMetrics: {
    averageUptime: number;
    averageResponseTime: number;
    totalTraffic: number;
    errorRateDistribution: number[];
  };
  usagePatterns: {
    peakUsageHours: number[];
    deviceDistribution: Record<string, number>;
    geographicDistribution: Record<string, number>;
    featureUsageFrequency: Record<string, number>;
  };
  customizationTrends: {
    popularTemplates: Array<{ templateId: string; usage: number }>;
    commonCustomizations: Array<{ type: string; frequency: number }>;
    aiVsManualRatio: number;
  };
}

interface BusinessReport {
  summary: {
    totalClients: number;
    totalRevenue: number;
    averageClientValue: number;
    growthRate: number;
  };
  performance: {
    averageUptime: number;
    averageResponseTime: number;
    totalTraffic: number;
    errorRateDistribution: number[];
  };
  revenue: {
    monthly: number;
    quarterly: number;
    projections: {
      nextMonth: number;
      nextQuarter: number;
      nextYear: number;
    };
  };
  recommendations: string[];
  alerts: Array<{
    type: 'warning' | 'critical' | 'info';
    message: string;
    priority: string;
  }>;
}

export default function CrossClientAnalyticsPage() {
  const [metrics, setMetrics] = useState<CrossClientMetrics | null>(null);
  const [businessReport, setBusinessReport] = useState<BusinessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [selectedTimeRange, selectedClients, selectedTemplates]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockMetrics: CrossClientMetrics = {
        totalClients: 85,
        activeClients: 78,
        totalRevenue: 2450000,
        averageClientValue: 28824,
        performanceMetrics: {
          averageUptime: 99.2,
          averageResponseTime: 245,
          totalTraffic: 1250000,
          errorRateDistribution: [0.1, 0.2, 0.05, 0.15, 0.08, 0.12, 0.03]
        },
        usagePatterns: {
          peakUsageHours: [9, 10, 11, 14, 15, 16],
          deviceDistribution: { desktop: 60, mobile: 35, tablet: 5 },
          geographicDistribution: { 'North America': 45, 'Europe': 30, 'Asia': 25 },
          featureUsageFrequency: { 'dashboard': 95, 'reports': 80, 'settings': 65, 'analytics': 70 }
        },
        customizationTrends: {
          popularTemplates: [
            { templateId: 'e-commerce-pro', usage: 25 },
            { templateId: 'business-suite', usage: 20 },
            { templateId: 'portfolio-premium', usage: 15 },
            { templateId: 'saas-starter', usage: 12 }
          ],
          commonCustomizations: [
            { type: 'branding', frequency: 90 },
            { type: 'layout', frequency: 75 },
            { type: 'features', frequency: 60 },
            { type: 'integrations', frequency: 45 }
          ],
          aiVsManualRatio: 2.3
        }
      };

      const mockBusinessReport: BusinessReport = {
        summary: {
          totalClients: 85,
          totalRevenue: 2450000,
          averageClientValue: 28824,
          growthRate: 15.5
        },
        performance: {
          averageUptime: 99.2,
          averageResponseTime: 245,
          totalTraffic: 1250000,
          errorRateDistribution: [0.1, 0.2, 0.05, 0.15, 0.08, 0.12, 0.03]
        },
        revenue: {
          monthly: 204167,
          quarterly: 612500,
          projections: {
            nextMonth: 215000,
            nextQuarter: 645000,
            nextYear: 2822500
          }
        },
        recommendations: [
          'Focus on template standardization to improve efficiency',
          'Invest in AI customization capabilities to reduce manual work',
          'Consider geographic expansion in high-performing regions',
          'Implement proactive monitoring for underperforming clients'
        ],
        alerts: [
          {
            type: 'warning',
            message: '3 clients showing declining performance trends',
            priority: 'medium'
          },
          {
            type: 'info',
            message: 'Q4 revenue target 87% achieved',
            priority: 'low'
          }
        ]
      };

      setMetrics(mockMetrics);
      setBusinessReport(mockBusinessReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    // Export functionality
    console.log('Exporting cross-client analytics report...');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cross-client analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Error loading analytics: {error}</span>
            </div>
            <Button onClick={loadAnalytics} className="mt-4" variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics || !businessReport) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">No analytics data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Cross-Client Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive analytics and insights across all client deployments
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Analytics Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="timeRange">Time Range</Label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="clientFilter">Client Filter</Label>
              <Input placeholder="Filter by client ID" />
            </div>
            <div>
              <Label htmlFor="templateFilter">Template Filter</Label>
              <Input placeholder="Filter by template" />
            </div>
            <div>
              <Label htmlFor="revenueRange">Revenue Range</Label>
              <Input placeholder="Min - Max revenue" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold">{metrics.totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center space-x-1">
              <Badge variant="secondary" className="text-xs">
                {metrics.activeClients} active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center space-x-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">+{formatPercentage(businessReport.summary.growthRate)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Client Value</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.averageClientValue)}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Monthly: {formatCurrency(businessReport.revenue.monthly)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Uptime</p>
                <p className="text-2xl font-bold">{formatPercentage(metrics.performanceMetrics.averageUptime)}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {metrics.performanceMetrics.averageResponseTime}ms avg response
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          <TabsTrigger value="customization">Customization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Revenue trend chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Performance Distribution</CardTitle>
                <CardDescription>Performance metrics across all clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Performance distribution chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Client distribution by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.usagePatterns.geographicDistribution).map(([region, percentage]) => (
                    <div key={region} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{region}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 min-w-[3rem]">{percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Popularity</CardTitle>
                <CardDescription>Most used templates across clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.customizationTrends.popularTemplates.map((template, index) => (
                    <div key={template.templateId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                        <span className="text-sm font-medium">{template.templateId}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(template.usage / metrics.customizationTrends.popularTemplates[0].usage) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 min-w-[2rem]">{template.usage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators across all clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">Average Uptime</span>
                    <Badge variant={metrics.performanceMetrics.averageUptime > 99 ? "default" : "secondary"}>
                      {formatPercentage(metrics.performanceMetrics.averageUptime)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">Average Response Time</span>
                    <Badge variant={metrics.performanceMetrics.averageResponseTime < 300 ? "default" : "secondary"}>
                      {metrics.performanceMetrics.averageResponseTime}ms
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">Total Traffic</span>
                    <Badge variant="outline">
                      {(metrics.performanceMetrics.totalTraffic / 1000000).toFixed(1)}M requests
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate Distribution</CardTitle>
                <CardDescription>Error rates across client applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Error rate distribution chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Current period revenue analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Revenue</span>
                    <span className="font-semibold">{formatCurrency(businessReport.revenue.monthly)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quarterly Revenue</span>
                    <span className="font-semibold">{formatCurrency(businessReport.revenue.quarterly)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <span className="text-lg font-bold">{formatCurrency(businessReport.summary.totalRevenue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Projections</CardTitle>
                <CardDescription>Forecasted revenue based on current trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Next Month</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(businessReport.revenue.projections.nextMonth)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Next Quarter</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(businessReport.revenue.projections.nextQuarter)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Next Year</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(businessReport.revenue.projections.nextYear)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
                <CardDescription>Key growth indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Growth Rate</span>
                    <Badge variant="default" className="text-green-600 bg-green-100">
                      +{formatPercentage(businessReport.summary.growthRate)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Client Value</span>
                    <span className="font-semibold">{formatCurrency(businessReport.summary.averageClientValue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Clients</span>
                    <span className="font-semibold">{metrics.activeClients}/{metrics.totalClients}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>Client usage by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Device distribution pie chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Usage Frequency</CardTitle>
                <CardDescription>Most and least used features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.usagePatterns.featureUsageFrequency).map(([feature, frequency]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{feature}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${frequency}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 min-w-[3rem]">{frequency}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Usage Hours</CardTitle>
                <CardDescription>Highest traffic periods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 24 }, (_, i) => (
                    <div
                      key={i}
                      className={`p-2 text-center text-xs rounded ${
                        metrics.usagePatterns.peakUsageHours.includes(i)
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {i}:00
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
                <CardDescription>Additional usage insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">AI vs Manual Customization</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      AI-powered customizations are {metrics.customizationTrends.aiVsManualRatio.toFixed(1)}x more common than manual ones
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Peak Performance</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Best performance during {metrics.usagePatterns.peakUsageHours.slice(0, 3).join(', ')}:00 hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customization Types</CardTitle>
                <CardDescription>Most common customization categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.customizationTrends.commonCustomizations.map((customization, index) => (
                    <div key={customization.type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                        <span className="text-sm font-medium capitalize">{customization.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${customization.frequency}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 min-w-[3rem]">{customization.frequency}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI vs Manual Customization</CardTitle>
                <CardDescription>Automation effectiveness analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-blue-600">
                    {metrics.customizationTrends.aiVsManualRatio.toFixed(1)}:1
                  </div>
                  <p className="text-sm text-gray-600">
                    AI-powered customizations vs Manual customizations
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>AI Customizations</span>
                      <span className="font-semibold">
                        {Math.round((metrics.customizationTrends.aiVsManualRatio / (metrics.customizationTrends.aiVsManualRatio + 1)) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Manual Customizations</span>
                      <span className="font-semibold">
                        {Math.round((1 / (metrics.customizationTrends.aiVsManualRatio + 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recommendations and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Recommendations</CardTitle>
            <CardDescription>AI-generated insights and suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {businessReport.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Current alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {businessReport.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-2 p-3 rounded ${
                    alert.type === 'warning' ? 'bg-yellow-50' :
                    alert.type === 'critical' ? 'bg-red-50' : 'bg-blue-50'
                  }`}
                >
                  <AlertTriangle
                    className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      alert.type === 'warning' ? 'text-yellow-600' :
                      alert.type === 'critical' ? 'text-red-600' : 'text-blue-600'
                    }`}
                  />
                  <div>
                    <span className="text-sm font-medium">{alert.message}</span>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          alert.priority === 'high' ? 'border-red-300 text-red-700' :
                          alert.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                          'border-blue-300 text-blue-700'
                        }`}
                      >
                        {alert.priority} priority
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}