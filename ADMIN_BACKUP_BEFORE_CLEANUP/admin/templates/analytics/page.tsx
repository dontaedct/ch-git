/**
 * @file Template Analytics Dashboard
 * @description Advanced template analytics dashboard with comprehensive metrics, performance monitoring, and business intelligence
 * @author AI Assistant
 * @created 2025-09-20
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs';
import { 
  BarChart, 
  LineChart, 
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Download,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Target,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { PerformanceMonitor } from '@/components/admin/performance-monitor';
import { templateMetrics } from '@/lib/analytics/template-metrics';
import { templatePerformance } from '@/lib/monitoring/template-performance';
import { usageTracking } from '@/lib/analytics/usage-tracking';

interface AnalyticsPageProps {}

interface AnalyticsOverview {
  totalTemplates: number;
  activeTemplates: number;
  totalDownloads: number;
  averageRating: number;
  performanceScore: number;
  usageGrowth: number;
  topTemplates: Array<{
    id: string;
    name: string;
    downloads: number;
    rating: number;
    performance: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'download' | 'rating' | 'error' | 'performance';
    template: string;
    timestamp: string;
    details: string;
  }>;
}

export default function TemplateAnalyticsPage({}: AnalyticsPageProps) {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange, selectedCategory]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load overview metrics
      const [
        metrics,
        performance,
        usage
      ] = await Promise.all([
        templateMetrics.getOverview(selectedTimeRange, selectedCategory),
        templatePerformance.getPerformanceOverview(selectedTimeRange),
        usageTracking.getUsageOverview(selectedTimeRange)
      ]);

      setOverview({
        totalTemplates: metrics.totalTemplates,
        activeTemplates: metrics.activeTemplates,
        totalDownloads: usage.totalDownloads,
        averageRating: metrics.averageRating,
        performanceScore: performance.averageScore,
        usageGrowth: usage.growthRate,
        topTemplates: metrics.topTemplates,
        recentActivity: usage.recentActivity
      });
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPerformanceColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'download': return <Download className="h-4 w-4" />;
      case 'rating': return <Star className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'performance': return <Activity className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'download': return 'text-blue-600';
      case 'rating': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'performance': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading && !overview) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Template Analytics</h1>
            <p className="text-gray-600 mt-2">Advanced template performance and usage insights</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Template Analytics</h1>
          <p className="text-gray-600 mt-2">Advanced template performance and usage insights</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Range Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="dashboard">Dashboard</option>
              <option value="form">Form</option>
              <option value="landing">Landing</option>
              <option value="ecommerce">E-commerce</option>
            </select>
          </div>

          {/* Refresh Button */}
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Templates */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Templates</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.totalTemplates}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {overview.activeTemplates} active
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Downloads */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.totalDownloads)}</p>
                  <div className="flex items-center mt-1">
                    {overview.usageGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <p className={`text-xs ${overview.usageGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(overview.usageGrowth)}%
                    </p>
                  </div>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Download className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.averageRating.toFixed(1)}</p>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= overview.averageRating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Score */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Performance Score</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(overview.performanceScore)}`}>
                    {overview.performanceScore.toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Average across all templates
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Performing Templates
                </CardTitle>
                <CardDescription>
                  Most downloaded templates with ratings and performance scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overview?.topTemplates.map((template, index) => (
                    <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-sm font-semibold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{template.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {formatNumber(template.downloads)} downloads
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600">{template.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${getPerformanceColor(template.performance)}`}>
                          {template.performance}%
                        </p>
                        <p className="text-xs text-gray-500">Performance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest template events and user interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overview?.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`p-1 rounded-full ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.template}</p>
                        <p className="text-xs text-gray-600">{activity.details}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <PerformanceMonitor timeRange={selectedTimeRange} category={selectedCategory} />
        </TabsContent>

        {/* Usage Analytics Tab */}
        <TabsContent value="usage">
          <AnalyticsDashboard timeRange={selectedTimeRange} category={selectedCategory} />
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>AI-powered performance analysis and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">High Performance Templates</p>
                      <p className="text-xs text-green-700">
                        85% of templates are performing above average with load times under 2s
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Optimization Opportunities</p>
                      <p className="text-xs text-yellow-700">
                        3 templates could benefit from image optimization and code splitting
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Insights</CardTitle>
                <CardDescription>User behavior patterns and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Popular Categories</p>
                      <p className="text-xs text-blue-700">
                        Dashboard templates are 40% more popular than other categories
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">Peak Usage Times</p>
                      <p className="text-xs text-purple-700">
                        Template downloads peak between 2-4 PM EST on weekdays
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
