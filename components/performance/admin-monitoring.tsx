/**
 * @fileoverview Admin Interface Performance Monitoring Components
 * @module components/performance/admin-monitoring
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Progress } from '@ui/progress';
import { Alert, AlertDescription } from '@ui/alert';
import { 
  Activity, 
  Zap, 
  Database, 
  Cpu, 
  MemoryStick, 
  Network, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Gauge,
  Brain
} from 'lucide-react';

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  cacheHitRate: number;
  templateLoadTime: number;
  settingsRenderTime: number;
  aiProcessingTime: number;
  databaseQueryTime: number;
}

/**
 * Performance alert interface
 */
interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  resolved: boolean;
}

/**
 * Real-time performance metrics component
 */
export function RealTimePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    cacheHitRate: 0,
    templateLoadTime: 0,
    settingsRenderTime: 0,
    aiProcessingTime: 0,
    databaseQueryTime: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchMetrics = useCallback(async () => {
    try {
      // In a real implementation, this would fetch from your performance monitoring API
      const mockMetrics: PerformanceMetrics = {
        loadTime: Math.random() * 500 + 100,
        renderTime: Math.random() * 200 + 50,
        memoryUsage: Math.random() * 50 + 20,
        cpuUsage: Math.random() * 60 + 10,
        networkLatency: Math.random() * 100 + 20,
        cacheHitRate: Math.random() * 20 + 80,
        templateLoadTime: Math.random() * 800 + 200,
        settingsRenderTime: Math.random() * 300 + 100,
        aiProcessingTime: Math.random() * 1500 + 500,
        databaseQueryTime: Math.random() * 400 + 100
      };

      setMetrics(mockMetrics);
      setLastUpdated(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const getStatusColor = (value: number, threshold: number, reverse = false) => {
    if (reverse) {
      return value >= threshold ? 'text-green-600' : value >= threshold * 0.8 ? 'text-yellow-600' : 'text-red-600';
    }
    return value <= threshold ? 'text-green-600' : value <= threshold * 1.2 ? 'text-yellow-600' : 'text-red-600';
  };

  const getStatusIcon = (value: number, threshold: number, reverse = false) => {
    if (reverse) {
      return value >= threshold ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />;
    }
    return value <= threshold ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Metrics
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {lastUpdated.toLocaleTimeString()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchMetrics}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Load Time</span>
              </div>
              <div className={`flex items-center gap-1 ${getStatusColor(metrics.loadTime, 500)}`}>
                {getStatusIcon(metrics.loadTime, 500)}
                <span className="text-sm font-mono">{metrics.loadTime.toFixed(0)}ms</span>
              </div>
            </div>
            <Progress value={(metrics.loadTime / 1000) * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Render Time</span>
              </div>
              <div className={`flex items-center gap-1 ${getStatusColor(metrics.renderTime, 200)}`}>
                {getStatusIcon(metrics.renderTime, 200)}
                <span className="text-sm font-mono">{metrics.renderTime.toFixed(0)}ms</span>
              </div>
            </div>
            <Progress value={(metrics.renderTime / 500) * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MemoryStick className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Memory</span>
              </div>
              <div className={`flex items-center gap-1 ${getStatusColor(metrics.memoryUsage, 80, true)}`}>
                {getStatusIcon(metrics.memoryUsage, 80, true)}
                <span className="text-sm font-mono">{metrics.memoryUsage.toFixed(1)}MB</span>
              </div>
            </div>
            <Progress value={metrics.memoryUsage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">CPU</span>
              </div>
              <div className={`flex items-center gap-1 ${getStatusColor(metrics.cpuUsage, 80, true)}`}>
                {getStatusIcon(metrics.cpuUsage, 80, true)}
                <span className="text-sm font-mono">{metrics.cpuUsage.toFixed(1)}%</span>
              </div>
            </div>
            <Progress value={metrics.cpuUsage} className="h-2" />
          </div>
        </div>

        {/* Cache and Network Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium">Cache Hit Rate</span>
              </div>
              <div className={`flex items-center gap-1 ${getStatusColor(metrics.cacheHitRate, 85, true)}`}>
                {getStatusIcon(metrics.cacheHitRate, 85, true)}
                <span className="text-sm font-mono">{metrics.cacheHitRate.toFixed(1)}%</span>
              </div>
            </div>
            <Progress value={metrics.cacheHitRate} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-cyan-600" />
                <span className="text-sm font-medium">Network Latency</span>
              </div>
              <div className={`flex items-center gap-1 ${getStatusColor(metrics.networkLatency, 100)}`}>
                {getStatusIcon(metrics.networkLatency, 100)}
                <span className="text-sm font-mono">{metrics.networkLatency.toFixed(0)}ms</span>
              </div>
            </div>
            <Progress value={(metrics.networkLatency / 200) * 100} className="h-2" />
          </div>
        </div>

        {/* Template and AI Processing Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-pink-600" />
                <span className="text-sm font-medium">Template Load</span>
              </div>
              <div className={`flex items-center gap-1 ${getStatusColor(metrics.templateLoadTime, 1000)}`}>
                {getStatusIcon(metrics.templateLoadTime, 1000)}
                <span className="text-sm font-mono">{metrics.templateLoadTime.toFixed(0)}ms</span>
              </div>
            </div>
            <Progress value={(metrics.templateLoadTime / 2000) * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium">Settings Render</span>
              </div>
              <div className={`flex items-center gap-1 ${getStatusColor(metrics.settingsRenderTime, 300)}`}>
                {getStatusIcon(metrics.settingsRenderTime, 300)}
                <span className="text-sm font-mono">{metrics.settingsRenderTime.toFixed(0)}ms</span>
              </div>
            </div>
            <Progress value={(metrics.settingsRenderTime / 600) * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium">AI Processing</span>
              </div>
              <div className={`flex items-center gap-1 ${getStatusColor(metrics.aiProcessingTime, 2000)}`}>
                {getStatusIcon(metrics.aiProcessingTime, 2000)}
                <span className="text-sm font-mono">{metrics.aiProcessingTime.toFixed(0)}ms</span>
              </div>
            </div>
            <Progress value={(metrics.aiProcessingTime / 3000) * 100} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Performance alerts component
 */
export function PerformanceAlerts() {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High Memory Usage',
      message: 'Memory usage has exceeded 85% for the last 5 minutes',
      timestamp: Date.now() - 300000,
      resolved: false
    },
    {
      id: '2',
      type: 'info',
      title: 'Cache Optimization',
      message: 'Cache hit rate improved by 15% after recent optimizations',
      timestamp: Date.now() - 600000,
      resolved: false
    },
    {
      id: '3',
      type: 'error',
      title: 'Database Query Timeout',
      message: 'Database queries are taking longer than expected',
      timestamp: Date.now() - 900000,
      resolved: true
    }
  ]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Performance Alerts
          </div>
          <Badge variant="outline">
            {unresolvedAlerts.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {unresolvedAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <p>All systems operating normally</p>
          </div>
        ) : (
          unresolvedAlerts.map(alert => (
            <Alert key={alert.id} variant={getAlertVariant(alert.type)}>
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <AlertDescription>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{alert.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                  </AlertDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resolveAlert(alert.id)}
                  className="ml-2"
                >
                  Resolve
                </Button>
              </div>
            </Alert>
          ))
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Performance trends component
 */
export function PerformanceTrends() {
  const [trends, setTrends] = useState({
    loadTime: { current: 245, previous: 280, trend: 'down' },
    memoryUsage: { current: 65, previous: 58, trend: 'up' },
    cacheHitRate: { current: 92, previous: 87, trend: 'up' },
    cpuUsage: { current: 45, previous: 52, trend: 'down' }
  });

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Performance Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(trends).map(([key, trend]) => (
            <div key={key} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div className={`flex items-center gap-1 ${getTrendColor(trend.trend)}`}>
                  {getTrendIcon(trend.trend)}
                  <span className="text-sm font-mono">
                    {Math.abs(((trend.current - trend.previous) / trend.previous) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-2xl font-bold">
                <span>{trend.current}</span>
                <span className="text-sm text-muted-foreground">
                  vs {trend.previous}
                </span>
              </div>
              
              <Progress 
                value={(trend.current / Math.max(trend.current, trend.previous)) * 100} 
                className="h-2" 
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main performance monitoring dashboard
 */
export function AdminPerformanceMonitoring() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time performance metrics and system health monitoring
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RealTimePerformanceMetrics />
        </div>
        <div>
          <PerformanceAlerts />
        </div>
      </div>

      <PerformanceTrends />
    </div>
  );
}
