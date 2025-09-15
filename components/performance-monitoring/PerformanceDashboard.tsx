/**
 * @fileoverview Performance Monitoring Dashboard Component
 * @module components/performance-monitoring/PerformanceDashboard
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Database, 
  MemoryStick, 
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';

interface PerformanceDashboardProps {
  className?: string;
}

interface PerformanceMetrics {
  client: {
    memoryUsage: number;
    cpuUsage: number;
    responseTime: number;
    errorRate: number;
  };
  server: {
    memoryUsage: { heapUsed: number; heapTotal: number };
    uptime: number;
    loadAverage: number[];
  };
  database: {
    queryTime: number;
    connectionStatus: string;
  };
}

interface PerformanceAlert {
  id: string;
  type: string;
  severity: string;
  message: string;
  timestamp: string;
}

export default function PerformanceDashboard({ className }: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/performance-monitoring?action=collect_metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'collect_metrics' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      
      const data = await response.json();
      setMetrics(data.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/performance-monitoring/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchAlerts();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(() => {
      fetchMetrics();
      fetchAlerts();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getHealthScore = (): number => {
    if (!metrics) return 0;
    
    let score = 100;
    
    // Deduct points for high response time
    if (metrics.client.responseTime > 1000) score -= 20;
    else if (metrics.client.responseTime > 500) score -= 10;
    
    // Deduct points for high memory usage
    if (metrics.client.memoryUsage > 0.8) score -= 25;
    else if (metrics.client.memoryUsage > 0.6) score -= 15;
    
    // Deduct points for high error rate
    if (metrics.client.errorRate > 0.05) score -= 30;
    else if (metrics.client.errorRate > 0.02) score -= 15;
    
    // Deduct points for high CPU usage
    if (metrics.client.cpuUsage > 0.8) score -= 20;
    else if (metrics.client.cpuUsage > 0.6) score -= 10;
    
    return Math.max(0, score);
  };

  const getHealthStatus = (score: number): { status: string; color: string; icon: React.ReactNode } => {
    if (score >= 90) {
      return { 
        status: 'Excellent', 
        color: 'text-green-600', 
        icon: <CheckCircle className="h-4 w-4" /> 
      };
    } else if (score >= 70) {
      return { 
        status: 'Good', 
        color: 'text-yellow-600', 
        icon: <Activity className="h-4 w-4" /> 
      };
    } else {
      return { 
        status: 'Needs Attention', 
        color: 'text-red-600', 
        icon: <AlertTriangle className="h-4 w-4" /> 
      };
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading && !metrics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading performance metrics...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load performance metrics: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const healthScore = getHealthScore();
  const healthStatus = getHealthStatus(healthScore);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time system performance metrics and alerts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchMetrics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {healthStatus.icon}
            <span>System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Health Score</span>
              <span className={`font-bold ${healthStatus.color}`}>
                {healthScore}/100
              </span>
            </div>
            <Progress value={healthScore} className="h-2" />
            <div className="flex items-center space-x-2">
              <Badge variant={healthScore >= 90 ? 'default' : healthScore >= 70 ? 'secondary' : 'destructive'}>
                {healthStatus.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Active Alerts</span>
              <Badge variant="destructive">{alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>{alert.message}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Response Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Response Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.client.responseTime ? `${metrics.client.responseTime.toFixed(0)}ms` : 'N/A'}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {metrics?.client.responseTime && metrics.client.responseTime > 1000 ? (
                <TrendingUp className="h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500" />
              )}
              <span>
                {metrics?.client.responseTime && metrics.client.responseTime > 1000 
                  ? 'High' 
                  : metrics?.client.responseTime && metrics.client.responseTime > 500 
                    ? 'Medium' 
                    : 'Good'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <MemoryStick className="h-4 w-4" />
              <span>Memory Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.client.memoryUsage ? `${(metrics.client.memoryUsage * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {metrics?.client.memoryUsage && metrics.client.memoryUsage > 0.8 ? (
                <TrendingUp className="h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500" />
              )}
              <span>
                {metrics?.client.memoryUsage && metrics.client.memoryUsage > 0.8 
                  ? 'High' 
                  : metrics?.client.memoryUsage && metrics.client.memoryUsage > 0.6 
                    ? 'Medium' 
                    : 'Good'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* CPU Usage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Cpu className="h-4 w-4" />
              <span>CPU Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.client.cpuUsage ? `${(metrics.client.cpuUsage * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {metrics?.client.cpuUsage && metrics.client.cpuUsage > 0.8 ? (
                <TrendingUp className="h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500" />
              )}
              <span>
                {metrics?.client.cpuUsage && metrics.client.cpuUsage > 0.8 
                  ? 'High' 
                  : metrics?.client.cpuUsage && metrics.client.cpuUsage > 0.6 
                    ? 'Medium' 
                    : 'Good'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Error Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.client.errorRate ? `${(metrics.client.errorRate * 100).toFixed(2)}%` : 'N/A'}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {metrics?.client.errorRate && metrics.client.errorRate > 0.05 ? (
                <TrendingUp className="h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500" />
              )}
              <span>
                {metrics?.client.errorRate && metrics.client.errorRate > 0.05 
                  ? 'High' 
                  : metrics?.client.errorRate && metrics.client.errorRate > 0.02 
                    ? 'Medium' 
                    : 'Good'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Server Metrics */}
      {metrics?.server && (
        <Card>
          <CardHeader>
            <CardTitle>Server Metrics</CardTitle>
            <CardDescription>Backend server performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Uptime</div>
                <div className="text-lg font-semibold">
                  {formatUptime(metrics.server.uptime)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Heap Used</div>
                <div className="text-lg font-semibold">
                  {formatBytes(metrics.server.memoryUsage.heapUsed)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Load Average</div>
                <div className="text-lg font-semibold">
                  {metrics.server.loadAverage[0]?.toFixed(2) || 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Database Metrics */}
      {metrics?.database && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Database Performance</span>
            </CardTitle>
            <CardDescription>Database connection and query performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Query Time</div>
                <div className="text-lg font-semibold">
                  {metrics.database.queryTime}ms
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Connection Status</div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={metrics.database.connectionStatus === 'healthy' ? 'default' : 'destructive'}
                  >
                    {metrics.database.connectionStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
