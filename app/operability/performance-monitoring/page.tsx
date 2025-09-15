/**
 * @fileoverview HT-008.8.3: Performance Monitoring Dashboard
 * @module app/operability/performance-monitoring/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.3 - Implement performance monitoring and alerting
 * Focus: Real-time performance monitoring dashboard with Core Web Vitals
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (production monitoring, alerting systems)
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Gauge,
  BarChart3,
  Monitor
} from 'lucide-react';

// Types
interface CoreWebVitals {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
}

interface CoreWebVitalsAnalytics {
  lcp: { average: number; p95: number; trend: string };
  fid: { average: number; p95: number; trend: string };
  cls: { average: number; p95: number; trend: string };
  fcp: { average: number; p95: number; trend: string };
  ttfb: { average: number; p95: number; trend: string };
}

interface PerformanceAlert {
  id: string;
  type: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  url: string;
  resolved: boolean;
  resolution?: string;
}

interface PerformanceAnalytics {
  coreWebVitals: CoreWebVitalsAnalytics;
  alerts: PerformanceAlert[];
  trends: any[];
}

export default function PerformanceMonitoringPage() {
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [latestMetrics, setLatestMetrics] = useState<CoreWebVitals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/monitoring/performance?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch performance data: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
        setLatestMetrics(data.latestMetrics?.coreWebVitals || null);
      } else {
        throw new Error(data.error || 'Failed to fetch performance data');
      }
      
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchPerformanceData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchPerformanceData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchPerformanceData, autoRefresh]);

  const resolveAlert = async (alertId: string, resolution: string) => {
    try {
      const response = await fetch('/api/monitoring/performance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, resolution }),
      });
      
      if (response.ok) {
        await fetchPerformanceData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const getCoreWebVitalScore = (metric: string, value: number): { score: number; color: string; label: string } => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 600, poor: 1500 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return { score: 0, color: 'gray', label: 'Unknown' };

    if (value <= threshold.good) {
      return { score: 100, color: 'green', label: 'Good' };
    } else if (value <= threshold.poor) {
      return { score: 50, color: 'yellow', label: 'Needs Improvement' };
    } else {
      return { score: 0, color: 'red', label: 'Poor' };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'degrading': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading performance monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time performance tracking with Core Web Vitals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchPerformanceData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Time Range:</span>
        <div className="flex gap-1">
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
        {lastRefresh && (
          <span className="text-sm text-muted-foreground ml-4">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Core Web Vitals Overview */}
      {latestMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(latestMetrics).map(([metric, value]) => {
            const score = getCoreWebVitalScore(metric, value);
            return (
              <Card key={metric}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium uppercase">
                    {metric}
                  </CardTitle>
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{value.toFixed(0)}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        score.color === 'green' ? 'text-green-600 border-green-600' :
                        score.color === 'yellow' ? 'text-yellow-600 border-yellow-600' :
                        score.color === 'red' ? 'text-red-600 border-red-600' :
                        'text-gray-600 border-gray-600'
                      }`}
                    >
                      {score.label}
                    </Badge>
                    <div className="flex-1">
                      <Progress value={score.score} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="core-web-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="alerts">Performance Alerts</TabsTrigger>
          <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Performance Summary */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                  <CardDescription>
                    Overall performance metrics for the selected time range
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Alerts</span>
                      <Badge variant="secondary">{analytics.alerts.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Unresolved Alerts</span>
                      <Badge variant="destructive">
                        {analytics.alerts.filter(a => !a.resolved).length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Critical Alerts</span>
                      <Badge variant="destructive">
                        {analytics.alerts.filter(a => a.severity === 'critical').length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>
                    Performance trend indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.trends.slice(0, 3).map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTrendIcon(trend.trend)}
                          <span className="text-sm font-medium">{trend.metric}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {trend.trend}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="core-web-vitals" className="space-y-4">
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals Analytics</CardTitle>
                <CardDescription>
                  Detailed Core Web Vitals metrics and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(analytics.coreWebVitals).map(([metric, data]) => {
                    const score = getCoreWebVitalScore(metric, data.average);
                    return (
                      <div key={metric} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium uppercase">{metric}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                score.color === 'green' ? 'text-green-600 border-green-600' :
                                score.color === 'yellow' ? 'text-yellow-600 border-yellow-600' :
                                score.color === 'red' ? 'text-red-600 border-red-600' :
                                'text-gray-600 border-gray-600'
                              }`}
                            >
                              {score.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(data.trend)}
                            <span className="text-sm text-muted-foreground">
                              {data.trend}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{data.average.toFixed(0)}</div>
                            <div className="text-sm text-muted-foreground">Average</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{data.p95.toFixed(0)}</div>
                            <div className="text-sm text-muted-foreground">P95</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{score.score}</div>
                            <div className="text-sm text-muted-foreground">Score</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Alerts</CardTitle>
              <CardDescription>
                Active performance alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No performance alerts</p>
                  </div>
                ) : (
                  analytics?.alerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getSeverityIcon(alert.severity)}
                            <span className="font-medium">{alert.metric}</span>
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {alert.message}
                          </p>
                          <div className="text-sm text-muted-foreground">
                            Value: {alert.value.toFixed(2)} | Threshold: {alert.threshold}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.resolved ? (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolved
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const resolution = prompt('Enter resolution details:');
                                if (resolution) {
                                  resolveAlert(alert.id, resolution);
                                }
                              }}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()} • {alert.url}
                      </div>
                      {alert.resolution && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                          <strong>Resolution:</strong> {alert.resolution}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>
                    Performance trend analysis over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.trends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          {getTrendIcon(trend.trend)}
                          <span className="font-medium">{trend.metric}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {trend.trend}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>
                    Automated performance insights and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span className="text-sm">
                        Monitor Core Web Vitals regularly to maintain optimal user experience
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Monitor className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">
                        Focus on LCP and FID improvements for better performance scores
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <span className="text-sm">
                        Address critical alerts immediately to prevent user impact
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
