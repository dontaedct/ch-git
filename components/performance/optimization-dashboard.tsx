'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface OptimizationMetrics {
  templateOptimization: {
    cacheHitRate: number;
    averageLoadTime: number;
    cacheSize: number;
    totalRequests: number;
  };
  customizationCache: {
    size: number;
    hitRate: number;
    utilizationPercent: number;
    totalHits: number;
    totalMisses: number;
  };
  deploymentOptimization: {
    averageDeploymentTime: number;
    successRate: number;
    totalDeployments: number;
    throughput: number;
  };
  analyticsOptimization: {
    cacheSize: number;
    activeQueries: number;
    cacheHitRate: number;
    averageQueryTime: number;
    totalQueries: number;
  };
}

export default function OptimizationDashboard() {
  const [metrics, setMetrics] = useState<OptimizationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchOptimizationMetrics();
    const interval = setInterval(fetchOptimizationMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOptimizationMetrics = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockMetrics: OptimizationMetrics = {
        templateOptimization: {
          cacheHitRate: 85.4,
          averageLoadTime: 234,
          cacheSize: 128,
          totalRequests: 1247
        },
        customizationCache: {
          size: 89,
          hitRate: 92.1,
          utilizationPercent: 67.3,
          totalHits: 1156,
          totalMisses: 94
        },
        deploymentOptimization: {
          averageDeploymentTime: 127000, // milliseconds
          successRate: 98.7,
          totalDeployments: 543,
          throughput: 24.2
        },
        analyticsOptimization: {
          cacheSize: 156,
          activeQueries: 3,
          cacheHitRate: 78.9,
          averageQueryTime: 89,
          totalQueries: 2341
        }
      };

      setMetrics(mockMetrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch optimization metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getPerformanceStatus = (value: number, thresholds: { good: number; warning: number }): 'good' | 'warning' | 'poor' => {
    if (value >= thresholds.good) return 'good';
    if (value >= thresholds.warning) return 'warning';
    return 'poor';
  };

  const getStatusColor = (status: 'good' | 'warning' | 'poor'): string => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
    }
  };

  if (isLoading && !metrics) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-gray-500">Failed to load optimization metrics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Performance Optimization Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="customization">Customization</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Template Cache Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.templateOptimization.cacheHitRate}%</div>
                <Badge className={getStatusColor(getPerformanceStatus(metrics.templateOptimization.cacheHitRate, { good: 80, warning: 60 }))}>
                  {getPerformanceStatus(metrics.templateOptimization.cacheHitRate, { good: 80, warning: 60 })}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.templateOptimization.averageLoadTime}ms</div>
                <Badge className={getStatusColor(getPerformanceStatus(500 - metrics.templateOptimization.averageLoadTime, { good: 250, warning: 150 }))}>
                  {getPerformanceStatus(500 - metrics.templateOptimization.averageLoadTime, { good: 250, warning: 150 })}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Deployment Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.deploymentOptimization.successRate}%</div>
                <Badge className={getStatusColor(getPerformanceStatus(metrics.deploymentOptimization.successRate, { good: 95, warning: 90 }))}>
                  {getPerformanceStatus(metrics.deploymentOptimization.successRate, { good: 95, warning: 90 })}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Analytics Cache Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.analyticsOptimization.cacheHitRate}%</div>
                <Badge className={getStatusColor(getPerformanceStatus(metrics.analyticsOptimization.cacheHitRate, { good: 75, warning: 60 }))}>
                  {getPerformanceStatus(metrics.analyticsOptimization.cacheHitRate, { good: 75, warning: 60 })}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Cache Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Cache Hit Rate</span>
                  <span className="font-semibold">{metrics.templateOptimization.cacheHitRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Load Time</span>
                  <span className="font-semibold">{metrics.templateOptimization.averageLoadTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache Size</span>
                  <span className="font-semibold">{metrics.templateOptimization.cacheSize} templates</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Requests</span>
                  <span className="font-semibold">{metrics.templateOptimization.totalRequests.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-800">Cache performing well</div>
                    <div className="text-sm text-green-600">Hit rate above 80% threshold</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-800">Consider preloading</div>
                    <div className="text-sm text-blue-600">Popular templates for faster access</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>E-commerce Template</span>
                    <span>34%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '34%' }}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Portfolio Template</span>
                    <span>28%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Blog Template</span>
                    <span>23%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customization">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customization Cache Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Cache Size</span>
                  <span className="font-semibold">{metrics.customizationCache.size} entries</span>
                </div>
                <div className="flex justify-between">
                  <span>Hit Rate</span>
                  <span className="font-semibold">{metrics.customizationCache.hitRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory Utilization</span>
                  <span className="font-semibold">{metrics.customizationCache.utilizationPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Hits</span>
                  <span className="font-semibold">{metrics.customizationCache.totalHits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Misses</span>
                  <span className="font-semibold">{metrics.customizationCache.totalMisses.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory Usage</span>
                      <span>{metrics.customizationCache.utilizationPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${metrics.customizationCache.utilizationPercent}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{metrics.customizationCache.totalHits}</div>
                      <div className="text-sm text-gray-500">Cache Hits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{metrics.customizationCache.totalMisses}</div>
                      <div className="text-sm text-gray-500">Cache Misses</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployment">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Deployment Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Average Time</span>
                  <span className="font-semibold">{formatDuration(metrics.deploymentOptimization.averageDeploymentTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate</span>
                  <span className="font-semibold">{metrics.deploymentOptimization.successRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Deployments</span>
                  <span className="font-semibold">{metrics.deploymentOptimization.totalDeployments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Throughput</span>
                  <span className="font-semibold">{metrics.deploymentOptimization.throughput}/hour</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deployment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{formatDuration(metrics.deploymentOptimization.averageDeploymentTime)}</div>
                    <div className="text-sm text-gray-500">Average Deployment Time</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Target: &lt;2min</span>
                      <span className="text-green-600">✓ Achieved</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Success Rate Target: &gt;95%</span>
                      <span className="text-green-600">✓ Achieved</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-800">Excellent performance</div>
                    <div className="text-sm text-green-600">All targets met consistently</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-800">Consider parallel builds</div>
                    <div className="text-sm text-blue-600">For further speed improvements</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Cache Size</span>
                  <span className="font-semibold">{metrics.analyticsOptimization.cacheSize} queries</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Queries</span>
                  <span className="font-semibold">{metrics.analyticsOptimization.activeQueries}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache Hit Rate</span>
                  <span className="font-semibold">{metrics.analyticsOptimization.cacheHitRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Query Time</span>
                  <span className="font-semibold">{metrics.analyticsOptimization.averageQueryTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Queries</span>
                  <span className="font-semibold">{metrics.analyticsOptimization.totalQueries.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Query Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>&lt; 100ms</span>
                      <span>65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>100-500ms</span>
                      <span>28%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>&gt; 500ms</span>
                      <span>7%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '7%' }}></div>
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