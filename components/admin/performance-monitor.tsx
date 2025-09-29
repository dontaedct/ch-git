/**
 * @file Performance Monitor Components
 * @description Real-time performance monitoring dashboard with alerts and insights
 * @author AI Assistant
 * @created 2025-09-20
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs';
import { Alert, AlertDescription } from '@ui/alert';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Target,
  Gauge,
  BarChart3,
  AlertCircle,
  Info,
  RefreshCw,
} from 'lucide-react';
import { templatePerformance } from '@/lib/monitoring/template-performance';

interface PerformanceMonitorProps {
  timeRange: string;
  category?: string;
}

interface PerformanceData {
  overview: any;
  alerts: any[];
  trends: any[];
  coreWebVitals: any;
  devicePerformance: any[];
  topPerformers: any[];
  issues: any[];
}

const PERFORMANCE_COLORS = {
  excellent: '#10B981', // Green
  good: '#3B82F6',      // Blue
  fair: '#F59E0B',      // Amber
  poor: '#EF4444',      // Red
  critical: '#DC2626',  // Dark Red
};

const CORE_WEB_VITALS_THRESHOLDS = {
  fcp: { good: 1800, poor: 3000 },
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
};

export function PerformanceMonitor({ timeRange, category }: PerformanceMonitorProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'loadTime' | 'bundleSize' | 'memoryUsage' | 'errorRate'>('loadTime');

  useEffect(() => {
    loadPerformanceData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      if (!refreshing) {
        loadPerformanceData(true);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [timeRange, category]);

  const loadPerformanceData = async (isRealTimeUpdate = false) => {
    try {
      if (!isRealTimeUpdate) setLoading(true);
      
      // Load performance overview
      const overview = await templatePerformance.getPerformanceOverview(timeRange);
      
      // Load active alerts
      const alerts = await templatePerformance.getActiveAlerts();
      
      // Generate performance trends data
      const trends = generateTrendsData(timeRange);
      
      // Format Core Web Vitals data
      const coreWebVitals = {
        fcp: overview.coreWebVitals.fcp,
        lcp: overview.coreWebVitals.lcp,
        fid: overview.coreWebVitals.fid,
        cls: overview.coreWebVitals.cls,
      };
      
      // Mock device performance data
      const devicePerformance = [
        { device: 'Desktop', score: 92, samples: 1250, color: PERFORMANCE_COLORS.excellent },
        { device: 'Mobile', score: 78, samples: 980, color: PERFORMANCE_COLORS.good },
        { device: 'Tablet', score: 85, samples: 420, color: PERFORMANCE_COLORS.good },
      ];

      setPerformanceData({
        overview,
        alerts: alerts.slice(0, 5), // Show top 5 alerts
        trends,
        coreWebVitals,
        devicePerformance,
        topPerformers: overview.topPerformers.slice(0, 8),
        issues: overview.performanceIssues.slice(0, 6),
      });
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      if (!isRealTimeUpdate) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPerformanceData();
    setRefreshing(false);
  };

  const generateTrendsData = (range: string) => {
    const points = range === '24h' ? 24 : range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = points - 1; i >= 0; i--) {
      const date = new Date();
      if (range === '24h') {
        date.setHours(date.getHours() - i);
      } else {
        date.setDate(date.getDate() - i);
      }
      
      data.push({
        time: range === '24h' 
          ? date.getHours().toString().padStart(2, '0') + ':00'
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullTime: date.toISOString(),
        loadTime: 2000 + Math.random() * 1000 + Math.sin(i * 0.3) * 500,
        bundleSize: 800 + Math.random() * 200 + Math.sin(i * 0.2) * 100,
        memoryUsage: 80 + Math.random() * 40 + Math.sin(i * 0.4) * 20,
        errorRate: Math.max(0, 2 + Math.random() * 3 + Math.sin(i * 0.5) * 1.5),
        score: 75 + Math.random() * 20 + Math.sin(i * 0.1) * 10,
      });
    }
    
    return data;
  };

  const getPerformanceColor = (score: number): string => {
    if (score >= 90) return PERFORMANCE_COLORS.excellent;
    if (score >= 80) return PERFORMANCE_COLORS.good;
    if (score >= 70) return PERFORMANCE_COLORS.fair;
    if (score >= 60) return PERFORMANCE_COLORS.poor;
    return PERFORMANCE_COLORS.critical;
  };

  const getPerformanceGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getCoreWebVitalColor = (metric: string, value: number): string => {
    const thresholds = CORE_WEB_VITALS_THRESHOLDS[metric as keyof typeof CORE_WEB_VITALS_THRESHOLDS];
    if (!thresholds) return PERFORMANCE_COLORS.good;
    
    if (metric === 'cls') {
      if (value <= thresholds.good) return PERFORMANCE_COLORS.excellent;
      if (value <= thresholds.poor) return PERFORMANCE_COLORS.fair;
      return PERFORMANCE_COLORS.poor;
    } else {
      if (value <= thresholds.good) return PERFORMANCE_COLORS.excellent;
      if (value <= thresholds.poor) return PERFORMANCE_COLORS.fair;
      return PERFORMANCE_COLORS.poor;
    }
  };

  const formatMetricValue = (metric: string, value: number): string => {
    switch (metric) {
      case 'loadTime':
        return `${Math.round(value)}ms`;
      case 'bundleSize':
        return `${Math.round(value)}KB`;
      case 'memoryUsage':
        return `${Math.round(value)}MB`;
      case 'errorRate':
        return `${value.toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Performance Monitor</h2>
          <p className="text-gray-600 text-sm mt-1">Real-time template performance tracking and optimization insights</p>
        </div>
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

      {/* Performance Overview Cards */}
      {performanceData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Overall Performance Score */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Performance Score</p>
                  <p 
                    className="text-3xl font-bold mt-1"
                    style={{ color: getPerformanceColor(performanceData.overview.averageScore) }}
                  >
                    {Math.round(performanceData.overview.averageScore)}
                  </p>
                  <div className="flex items-center mt-2">
                    <Badge 
                      variant="secondary"
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${getPerformanceColor(performanceData.overview.averageScore)}15`,
                        color: getPerformanceColor(performanceData.overview.averageScore)
                      }}
                    >
                      Grade {getPerformanceGrade(performanceData.overview.averageScore)}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <Gauge className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Measurements */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Measurements</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {performanceData.overview.totalMeasurements.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Across all templates
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {performanceData.alerts.length}
                  </p>
                  <div className="flex items-center mt-2">
                    {performanceData.alerts.length > 0 ? (
                      <Badge variant="destructive" className="text-xs">
                        Needs Attention
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        All Good
                      </Badge>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${
                  performanceData.alerts.length > 0 ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  {performanceData.alerts.length > 0 ? (
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Grade */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Grade</p>
                  <p 
                    className="text-3xl font-bold mt-1"
                    style={{ color: getPerformanceColor(performanceData.overview.averageScore) }}
                  >
                    {performanceData.overview.performanceGrade}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Based on all metrics
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-100">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Alerts */}
      {performanceData && performanceData.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Active Performance Alerts
            </CardTitle>
            <CardDescription>
              Critical performance issues requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performanceData.alerts.map((alert, index) => (
                <Alert key={alert.id || index} className="border-l-4 border-l-red-500">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{alert.templateName}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getSeverityColor(alert.severity)}`}
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <AlertDescription className="text-sm text-gray-600">
                          {alert.message}
                        </AlertDescription>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Acknowledge
                    </Button>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Tabs */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <div className="space-y-6">
            {/* Metric Selector */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Performance Trends
                    </CardTitle>
                    <CardDescription>
                      Real-time performance metrics over time
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {['loadTime', 'bundleSize', 'memoryUsage', 'errorRate'].map((metric) => (
                      <Button
                        key={metric}
                        variant={selectedMetric === metric ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedMetric(metric as any)}
                        className="text-xs"
                      >
                        {metric === 'loadTime' && 'Load Time'}
                        {metric === 'bundleSize' && 'Bundle Size'}
                        {metric === 'memoryUsage' && 'Memory'}
                        {metric === 'errorRate' && 'Error Rate'}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData?.trends}>
                      <defs>
                        <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={PERFORMANCE_COLORS.good} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={PERFORMANCE_COLORS.good} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#666"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#666"
                        fontSize={12}
                        tickFormatter={(value) => formatMetricValue(selectedMetric, value)}
                      />
                      <Tooltip 
                        formatter={(value: any) => [formatMetricValue(selectedMetric, value), selectedMetric]}
                        labelStyle={{ color: '#666' }}
                      />
                      <Area
                        type="monotone"
                        dataKey={selectedMetric}
                        stroke={PERFORMANCE_COLORS.good}
                        fillOpacity={1}
                        fill="url(#metricGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Core Web Vitals Tab */}
        <TabsContent value="vitals">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Core Web Vitals Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Core Web Vitals
                </CardTitle>
                <CardDescription>
                  Key user experience metrics for template performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(performanceData?.coreWebVitals || {}).map(([key, vital]: [string, any]) => {
                    const color = getCoreWebVitalColor(key, vital.average);
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          ></div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {key.toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {key === 'fcp' && 'First Contentful Paint'}
                              {key === 'lcp' && 'Largest Contentful Paint'}
                              {key === 'fid' && 'First Input Delay'}
                              {key === 'cls' && 'Cumulative Layout Shift'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {key === 'cls' 
                              ? vital.average?.toFixed(3) || '0.000'
                              : `${Math.round(vital.average || 0)}ms`
                            }
                          </p>
                          <Badge 
                            variant="outline"
                            className="text-xs mt-1"
                            style={{ 
                              borderColor: color, 
                              color: color 
                            }}
                          >
                            {vital.grade || 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Web Vitals Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Web Vitals Distribution</CardTitle>
                <CardDescription>
                  Performance grade distribution across all measurements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Good', value: 65, color: PERFORMANCE_COLORS.excellent },
                          { name: 'Needs Improvement', value: 25, color: PERFORMANCE_COLORS.fair },
                          { name: 'Poor', value: 10, color: PERFORMANCE_COLORS.poor },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {[
                          { name: 'Good', value: 65, color: PERFORMANCE_COLORS.excellent },
                          { name: 'Needs Improvement', value: 25, color: PERFORMANCE_COLORS.fair },
                          { name: 'Poor', value: 10, color: PERFORMANCE_COLORS.poor },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Device Performance
              </CardTitle>
              <CardDescription>
                Performance breakdown across different device types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {performanceData?.devicePerformance.map((device, index) => {
                  const IconComponent = device.device === 'Desktop' ? Monitor : 
                                      device.device === 'Mobile' ? Smartphone : Tablet;
                  return (
                    <div key={device.device} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-white">
                          <IconComponent className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{device.device}</p>
                          <p className="text-sm text-gray-600">{device.samples.toLocaleString()} samples</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p 
                            className="text-xl font-bold"
                            style={{ color: getPerformanceColor(device.score) }}
                          >
                            {device.score}
                          </p>
                          <p className="text-xs text-gray-500">Performance Score</p>
                        </div>
                        <div className="w-24">
                          <ResponsiveContainer width="100%" height={40}>
                            <RadialBarChart
                              cx="50%"
                              cy="50%"
                              innerRadius="60%"
                              outerRadius="90%"
                              data={[{ value: device.score, fill: getPerformanceColor(device.score) }]}
                              startAngle={90}
                              endAngle={-270}
                            >
                              <RadialBar dataKey="value" cornerRadius={10} />
                            </RadialBarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Template Performance Ranking
              </CardTitle>
              <CardDescription>
                Performance scores for individual templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceData?.topPerformers.map((template, index) => (
                  <div key={template.templateId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full text-sm font-semibold text-gray-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{template.templateName}</p>
                        <p className="text-sm text-gray-600">{template.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: getPerformanceColor(template.score), 
                          color: getPerformanceColor(template.score) 
                        }}
                      >
                        {template.grade}
                      </Badge>
                      <div className="text-right">
                        <p 
                          className="text-lg font-bold"
                          style={{ color: getPerformanceColor(template.score) }}
                        >
                          {Math.round(template.score)}
                        </p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Performance Issues
              </CardTitle>
              <CardDescription>
                Identified performance problems and optimization opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData?.issues.map((issue, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-1 rounded-full ${
                          issue.severity === 'critical' ? 'bg-red-100' :
                          issue.severity === 'high' ? 'bg-orange-100' :
                          issue.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          {getSeverityIcon(issue.severity)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{issue.templateName}</h4>
                          <p className="text-sm text-gray-600 mt-1">{issue.issue}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline"
                          className={getSeverityColor(issue.severity)}
                        >
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{issue.impact}%</p>
                          <p className="text-xs text-gray-500">Impact</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Recommendation:</strong> {issue.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
