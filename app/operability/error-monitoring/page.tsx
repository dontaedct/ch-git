/**
 * @fileoverview HT-008.8.2: Real-time Error Monitoring Dashboard
 * @module app/operability/error-monitoring/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.2 - Add real-time error tracking and reporting
 * Focus: Real-time error monitoring dashboard with analytics
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
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Zap
} from 'lucide-react';

// Types
interface ErrorAnalytics {
  totalErrors: number;
  errorsBySeverity: Record<string, number>;
  errorsByCategory: Record<string, number>;
  errorsByHour: Record<string, number>;
  topErrorMessages: Array<{ message: string; count: number }>;
  errorRate: number;
  criticalErrorRate: number;
  averageResolutionTime: number;
  userImpactScore: number;
}

interface ErrorPattern {
  id: string;
  pattern: string;
  frequency: number;
  severity: string;
  affectedUsers: number;
  firstSeen: string;
  lastSeen: string;
  isResolved: boolean;
  resolution?: string;
}

interface ErrorTrend {
  period: string;
  errorCount: number;
  severity: string;
  category: string;
}

interface ErrorInsights {
  trends: ErrorTrend[];
  insights: string[];
  recommendations: string[];
}

export default function ErrorMonitoringPage() {
  const [analytics, setAnalytics] = useState<ErrorAnalytics | null>(null);
  const [patterns, setPatterns] = useState<ErrorPattern[]>([]);
  const [insights, setInsights] = useState<ErrorInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchErrorData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/monitoring/errors?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch error data: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
        setPatterns(data.patterns);
        setInsights(data.trends);
      } else {
        throw new Error(data.error || 'Failed to fetch error data');
      }
      
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch error data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchErrorData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchErrorData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchErrorData, autoRefresh]);

  const resolvePattern = async (patternId: string, resolution: string) => {
    try {
      const response = await fetch('/api/monitoring/errors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patternId, resolution }),
      });
      
      if (response.ok) {
        await fetchErrorData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to resolve pattern:', err);
    }
  };

  const exportData = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/monitoring/errors?format=${format}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-data-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <XCircle className="h-4 w-4" />;
      case 'HIGH': return <AlertTriangle className="h-4 w-4" />;
      case 'MEDIUM': return <Clock className="h-4 w-4" />;
      case 'LOW': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading error monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Error Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time error tracking and analytics dashboard
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
          <Button variant="outline" size="sm" onClick={fetchErrorData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData('json')}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
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

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalErrors}</div>
              <p className="text-xs text-muted-foreground">
                Error rate: {analytics.errorRate.toFixed(2)}/hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {analytics.errorsBySeverity.CRITICAL || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Rate: {(analytics.criticalErrorRate * 100).toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Impact</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(analytics.userImpactScore * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Users affected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.averageResolutionTime.toFixed(1)}h
              </div>
              <p className="text-xs text-muted-foreground">
                Average time to resolve
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Error Patterns</TabsTrigger>
          <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
          <TabsTrigger value="analytics">Detailed Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Error Severity Distribution */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>Error Severity Distribution</CardTitle>
                <CardDescription>
                  Breakdown of errors by severity level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.errorsBySeverity).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(severity)}
                        <span className="font-medium">{severity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(count / analytics.totalErrors) * 100} 
                          className="w-32"
                        />
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Error Messages */}
          {analytics && analytics.topErrorMessages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Most Common Errors</CardTitle>
                <CardDescription>
                  Top error messages by frequency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topErrorMessages.slice(0, 5).map((error, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{error.message}</p>
                      </div>
                      <Badge variant="secondary">{error.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Patterns</CardTitle>
              <CardDescription>
                Recurring error patterns detected by the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patterns.map((pattern) => (
                  <div key={pattern.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{pattern.pattern}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getSeverityColor(pattern.severity)}>
                            {pattern.severity}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {pattern.frequency} occurrences
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {pattern.affectedUsers} users affected
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {pattern.isResolved ? (
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
                                resolvePattern(pattern.id, resolution);
                              }
                            }}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      First seen: {new Date(pattern.firstSeen).toLocaleString()}
                      {' • '}
                      Last seen: {new Date(pattern.lastSeen).toLocaleString()}
                    </div>
                    {pattern.resolution && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                        <strong>Resolution:</strong> {pattern.resolution}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {insights && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Insights</CardTitle>
                  <CardDescription>
                    Automated insights from error analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights.insights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span className="text-sm">{insight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>
                    Suggested actions to improve error handling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Error Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Error Categories</CardTitle>
                  <CardDescription>
                    Distribution by error category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.errorsByCategory).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category}</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(count / analytics.totalErrors) * 100} 
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground w-8 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Hourly Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Hourly Error Distribution</CardTitle>
                  <CardDescription>
                    Errors by hour of day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(analytics.errorsByHour)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([hour, count]) => (
                        <div key={hour} className="flex items-center justify-between">
                          <span className="text-sm font-medium w-12">
                            {hour}:00
                          </span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(count / Math.max(...Object.values(analytics.errorsByHour))) * 100} 
                              className="w-32"
                            />
                            <span className="text-sm text-muted-foreground w-8 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
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
