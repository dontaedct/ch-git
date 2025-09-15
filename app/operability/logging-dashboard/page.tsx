/**
 * @fileoverview HT-008.8.5: Comprehensive Logging Dashboard
 * @module app/operability/logging-dashboard/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.5 - Implement comprehensive logging system
 * Focus: Real-time logging dashboard with analytics and management
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (production logging, data retention, compliance)
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Search,
  Download,
  Filter,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  Database,
  Shield
} from 'lucide-react';

// Types
interface LogMetrics {
  totalLogs: number;
  logsByLevel: Record<string, number>;
  logsByComponent: Record<string, number>;
  logsByHour: Record<string, number>;
  errorRate: number;
  averageLogSize: number;
  topErrorMessages: Array<{ message: string; count: number }>;
  logVolumeTrend: 'increasing' | 'stable' | 'decreasing';
  performanceImpact: number;
}

interface LogAnalysis {
  anomalies: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    metrics: Record<string, any>;
  }>;
  patterns: Array<{
    pattern: string;
    frequency: number;
    firstSeen: string;
    lastSeen: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  insights: string[];
  recommendations: string[];
  healthScore: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  correlationId?: string;
  component: string;
  userId?: string;
  sessionId?: string;
  tags: string[];
  metadata: Record<string, any>;
}

interface LogStatistics {
  totalLogs: number;
  logsByLevel: Record<string, number>;
  logsByComponent: Record<string, number>;
  averageLogSize: number;
  oldestLog: string | null;
  newestLog: string | null;
  retentionPolicies: number;
  activeFilters: number;
}

export default function LoggingDashboardPage() {
  const [analytics, setAnalytics] = useState<LogMetrics | null>(null);
  const [analysis, setAnalysis] = useState<LogAnalysis | null>(null);
  const [statistics, setStatistics] = useState<LogStatistics | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedComponent, setSelectedComponent] = useState<string>('');

  const fetchLogData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        timeRange,
        includeAnalysis: 'true',
      });
      
      const response = await fetch(`/api/monitoring/logs?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch log data: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
        setAnalysis(data.analysis);
        setStatistics(data.statistics);
      } else {
        throw new Error(data.error || 'Failed to fetch log data');
      }
      
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch log data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const searchLogs = useCallback(async () => {
    try {
      const searchParams: any = {};
      
      if (searchQuery) searchParams.message = searchQuery;
      if (selectedLevel) searchParams.level = selectedLevel;
      if (selectedComponent) searchParams.component = selectedComponent;
      if (searchParams.message || searchParams.level || searchParams.component) {
        searchParams.limit = 100;
      }

      const response = await fetch('/api/monitoring/logs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLogs(data.logs);
        }
      }
    } catch (err) {
      console.error('Failed to search logs:', err);
    }
  }, [searchQuery, selectedLevel, selectedComponent]);

  useEffect(() => {
    fetchLogData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchLogData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchLogData, autoRefresh]);

  useEffect(() => {
    if (searchQuery || selectedLevel || selectedComponent) {
      const timeoutId = setTimeout(searchLogs, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, selectedLevel, selectedComponent, searchLogs]);

  const exportLogs = async (format: 'json' | 'csv' | 'log') => {
    try {
      const params = new URLSearchParams({ format });
      if (selectedLevel) params.set('level', selectedLevel);
      if (selectedComponent) params.set('component', selectedComponent);
      
      const response = await fetch(`/api/monitoring/logs?${params}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Failed to export logs:', err);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debug': return 'bg-gray-500';
      case 'info': return 'bg-blue-500';
      case 'warn': return 'bg-yellow-500';
      case 'error': return 'bg-orange-500';
      case 'fatal': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'debug': return <Activity className="h-4 w-4" />;
      case 'info': return <CheckCircle className="h-4 w-4" />;
      case 'warn': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'fatal': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading logging dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logging Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive logging system with analytics and management
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
          <Button variant="outline" size="sm" onClick={fetchLogData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportLogs('json')}>
            <Download className="h-4 w-4 mr-2" />
            Export
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

      {/* Controls */}
      <div className="flex items-center gap-4">
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
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalLogs.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Avg size: {formatBytes(analytics.averageLogSize)}
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
                {(analytics.errorRate * 100).toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.logsByLevel.error + analytics.logsByLevel.fatal} errors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Log Volume Trend</CardTitle>
              {analytics.logVolumeTrend === 'increasing' ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : analytics.logVolumeTrend === 'decreasing' ? (
                <TrendingDown className="h-4 w-4 text-green-500" />
              ) : (
                <Activity className="h-4 w-4 text-blue-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {analytics.logVolumeTrend}
              </div>
              <p className="text-xs text-muted-foreground">
                Volume trend
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analysis?.healthScore.toFixed(0) || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                System health
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Log Search</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Log Level Distribution */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>Log Level Distribution</CardTitle>
                <CardDescription>
                  Breakdown of logs by severity level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.logsByLevel).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getLevelIcon(level)}
                        <span className="font-medium capitalize">{level}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(count / analytics.totalLogs) * 100} 
                          className="w-32"
                        />
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Component Distribution */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>Component Distribution</CardTitle>
                <CardDescription>
                  Logs by component
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.logsByComponent)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([component, count]) => (
                      <div key={component} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{component}</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(count / analytics.totalLogs) * 100} 
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          {/* Search Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Log Search</CardTitle>
              <CardDescription>
                Search and filter logs in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search log messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">All Levels</option>
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warn</option>
                  <option value="error">Error</option>
                  <option value="fatal">Fatal</option>
                </select>
                <select
                  value={selectedComponent}
                  onChange={(e) => setSelectedComponent(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">All Components</option>
                  {analytics && Object.keys(analytics.logsByComponent).map(component => (
                    <option key={component} value={component}>{component}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Log Results */}
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                {logs.length} logs found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No logs found</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getLevelColor(log.level)}>
                            {log.level.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">{log.component}</span>
                          {log.correlationId && (
                            <span className="text-xs text-muted-foreground">
                              {log.correlationId}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{log.message}</p>
                      {log.tags.length > 0 && (
                        <div className="flex gap-1 mb-2">
                          {log.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {log.userId && (
                        <div className="text-xs text-muted-foreground">
                          User: {log.userId} | Session: {log.sessionId || 'N/A'}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Hourly Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Hourly Log Distribution</CardTitle>
                  <CardDescription>
                    Log volume by hour of day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(analytics.logsByHour)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([hour, count]) => (
                        <div key={hour} className="flex items-center justify-between">
                          <span className="text-sm font-medium w-12">
                            {hour}:00
                          </span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(count / Math.max(...Object.values(analytics.logsByHour))) * 100} 
                              className="w-32"
                            />
                            <span className="text-sm text-muted-foreground w-12 text-right">
                              {count.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Error Messages */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Error Messages</CardTitle>
                  <CardDescription>
                    Most frequent error messages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topErrorMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <p className="text-muted-foreground">No errors found</p>
                      </div>
                    ) : (
                      analytics.topErrorMessages.slice(0, 5).map((error, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{error.message}</p>
                          </div>
                          <Badge variant="secondary">{error.count}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {analysis && (
            <>
              {/* Health Score */}
              <Card>
                <CardHeader>
                  <CardTitle>System Health Analysis</CardTitle>
                  <CardDescription>
                    Overall system health based on log analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      <span className={analysis.healthScore >= 80 ? 'text-green-600' : 
                                     analysis.healthScore >= 60 ? 'text-yellow-600' : 
                                     'text-red-600'}>
                        {analysis.healthScore.toFixed(0)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Health Score
                    </div>
                    <Progress value={analysis.healthScore} className="w-64 mx-auto" />
                  </div>
                </CardContent>
              </Card>

              {/* Insights and Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Insights</CardTitle>
                    <CardDescription>
                      Key insights from log analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysis.insights.length === 0 ? (
                        <p className="text-muted-foreground">No insights available</p>
                      ) : (
                        analysis.insights.map((insight, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-sm">{insight}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>
                      Suggested actions to improve system health
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysis.recommendations.length === 0 ? (
                        <p className="text-muted-foreground">No recommendations available</p>
                      ) : (
                        analysis.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-sm">{recommendation}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Patterns and Anomalies */}
              {(analysis.patterns.length > 0 || analysis.anomalies.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {analysis.patterns.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Detected Patterns</CardTitle>
                        <CardDescription>
                          Recurring patterns in logs
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysis.patterns.slice(0, 5).map((pattern, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{pattern.pattern}</span>
                                <Badge className={getSeverityColor(pattern.severity)}>
                                  {pattern.severity}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Frequency: {pattern.frequency} | 
                                First: {formatTimestamp(pattern.firstSeen)} | 
                                Last: {formatTimestamp(pattern.lastSeen)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {analysis.anomalies.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Anomalies Detected</CardTitle>
                        <CardDescription>
                          Unusual patterns or spikes
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysis.anomalies.slice(0, 5).map((anomaly, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{anomaly.type}</span>
                                <Badge className={getSeverityColor(anomaly.severity)}>
                                  {anomaly.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {anomaly.description}
                              </p>
                              <div className="text-xs text-muted-foreground">
                                {formatTimestamp(anomaly.timestamp)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          {statistics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Log Statistics</CardTitle>
                  <CardDescription>
                    Current logging system statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Logs</span>
                      <span className="font-bold">{statistics.totalLogs.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Log Size</span>
                      <span className="font-bold">{formatBytes(statistics.averageLogSize)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Retention Policies</span>
                      <span className="font-bold">{statistics.retentionPolicies}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active Filters</span>
                      <span className="font-bold">{statistics.activeFilters}</span>
                    </div>
                    {statistics.oldestLog && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Oldest Log</span>
                        <span className="font-bold text-xs">
                          {formatTimestamp(statistics.oldestLog)}
                        </span>
                      </div>
                    )}
                    {statistics.newestLog && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Newest Log</span>
                        <span className="font-bold text-xs">
                          {formatTimestamp(statistics.newestLog)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>
                    Export logs in various formats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => exportLogs('json')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as JSON
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => exportLogs('csv')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as CSV
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => exportLogs('log')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as Log Format
                    </Button>
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
