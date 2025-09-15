/**
 * @fileoverview Brand-Aware Analytics Dashboard
 * @module components/analytics/brand-aware-analytics-dashboard
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  Target, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Settings,
  Calendar,
  Activity,
  Palette,
  Zap,
  Eye
} from 'lucide-react';
import { BrandAnalyticsMetrics, brandAnalytics, BrandAnalyticsUtils } from '@/lib/analytics/brand-aware-analytics';
import { logoManager } from '@/lib/branding/logo-manager';

interface BrandAwareAnalyticsDashboardProps {
  className?: string;
}

export function BrandAwareAnalyticsDashboard({ className }: BrandAwareAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('last30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<BrandAnalyticsMetrics | null>(null);
  const [currentBrand, setCurrentBrand] = useState(logoManager.getCurrentConfig());

  useEffect(() => {
    loadAnalytics();
    
    // Subscribe to brand changes
    const unsubscribe = logoManager.subscribe((newConfig) => {
      setCurrentBrand(newConfig);
      loadAnalytics();
    });

    return unsubscribe;
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const analyticsMetrics = await brandAnalytics.getMetrics();
      setMetrics(analyticsMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brand analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    if (!metrics) return;
    
    if (format === 'json') {
      const data = BrandAnalyticsUtils.exportData(metrics);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brand-analytics-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const report = BrandAnalyticsUtils.generateReport(metrics);
      console.log('PDF export not implemented yet:', report);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading brand analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brand Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track brand usage and performance for {currentBrand.brandName.appName}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Current Brand Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Current Brand Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Brand Name</div>
              <div className="text-lg font-semibold">{currentBrand.brandName.appName}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Organization</div>
              <div className="text-lg font-semibold">{currentBrand.brandName.organizationName}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Configuration</div>
              <div className="flex items-center space-x-2">
                <Badge variant={currentBrand.isCustom ? 'default' : 'secondary'}>
                  {currentBrand.isCustom ? 'Custom' : 'Preset'}
                </Badge>
                {currentBrand.presetName && (
                  <Badge variant="outline">{currentBrand.presetName}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.brandUsage.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                Brand-aware events tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Brand Interactions</CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.engagement.brandInteractionRate * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                User engagement with brand
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Load Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.performance.averageLoadTime}ms
              </div>
              <p className="text-xs text-muted-foreground">
                Brand-aware performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.performance.errorRate * 100).toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Brand-related errors
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="brand-usage">Brand Usage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Brand Usage Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Usage Distribution</CardTitle>
                <CardDescription>Events by brand configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>Custom Brand</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{metrics?.brandUsage.customBrandEvents}</span>
                      <Progress 
                        value={(metrics?.brandUsage.customBrandEvents || 0) / (metrics?.brandUsage.totalEvents || 1) * 100} 
                        className="w-20"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Preset Brand</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{metrics?.brandUsage.presetBrandEvents}</span>
                      <Progress 
                        value={(metrics?.brandUsage.presetBrandEvents || 0) / (metrics?.brandUsage.totalEvents || 1) * 100} 
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Brand-aware performance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span>Load Time</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{metrics?.performance.averageLoadTime}ms</div>
                      <div className="text-sm text-muted-foreground">Average</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Response Time</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{metrics?.performance.averageResponseTime}ms</div>
                      <div className="text-sm text-muted-foreground">Average</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      <span>Brand Switch Time</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{metrics?.performance.brandSwitchTime}ms</div>
                      <div className="text-sm text-muted-foreground">Average</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="brand-usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Usage Analytics</CardTitle>
              <CardDescription>Detailed brand usage and interaction metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Brand Events */}
                <div>
                  <h4 className="font-medium mb-3">Events by Brand</h4>
                  <div className="space-y-2">
                    {metrics && Object.entries(metrics.brandUsage.eventsByBrand).map(([brand, count]) => (
                      <div key={brand} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Palette className="h-4 w-4 text-muted-foreground" />
                          <span>{brand}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{count}</div>
                          <div className="text-sm text-muted-foreground">events</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preset Usage */}
                <div>
                  <h4 className="font-medium mb-3">Events by Preset</h4>
                  <div className="space-y-2">
                    {metrics && Object.entries(metrics.brandUsage.eventsByPreset).map(([preset, count]) => (
                      <div key={preset} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Palette className="h-4 w-4 text-muted-foreground" />
                          <span>{preset}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{count}</div>
                          <div className="text-sm text-muted-foreground">events</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Brand-aware performance metrics and optimization insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Performance Comparison */}
                <div>
                  <h4 className="font-medium mb-3">Brand Performance Comparison</h4>
                  <div className="space-y-2">
                    {metrics?.insights.brandPerformanceComparison.map((brand, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span>{brand.brand}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{brand.performance}%</div>
                          <div className="text-sm text-muted-foreground">performance score</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Load Time</span>
                      <span className="text-sm text-muted-foreground">
                        {metrics?.performance.averageLoadTime}ms
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((metrics?.performance.averageLoadTime || 0) / 2000 * 100, 100)} 
                      className="w-full"
                    />
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Error Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {(metrics?.performance.errorRate || 0) * 100}%
                      </span>
                    </div>
                    <Progress 
                      value={(metrics?.performance.errorRate || 0) * 100} 
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Used Presets */}
            <Card>
              <CardHeader>
                <CardTitle>Most Used Presets</CardTitle>
                <CardDescription>Popular brand presets and adoption rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.insights.mostUsedPresets.map((preset, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <span>{preset.preset}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{preset.count}</div>
                        <div className="text-sm text-muted-foreground">events</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Brand Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Insights</CardTitle>
                <CardDescription>Key insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Custom Brand Adoption</span>
                      <Badge variant="outline">
                        {(metrics?.insights.customBrandAdoption || 0) * 100}%
                      </Badge>
                    </div>
                    <Progress 
                      value={(metrics?.insights.customBrandAdoption || 0) * 100} 
                      className="w-full"
                    />
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Brand Switch Frequency</span>
                      <Badge variant="outline">
                        {(metrics?.insights.brandSwitchFrequency || 0) * 100}%
                      </Badge>
                    </div>
                    <Progress 
                      value={(metrics?.insights.brandSwitchFrequency || 0) * 100} 
                      className="w-full"
                    />
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
