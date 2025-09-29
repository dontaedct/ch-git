/**
 * @fileoverview Real-time Metrics Component
 * Displays live analytics metrics with real-time updates
 */

"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAnalytics, RealTimeMetrics } from '@/lib/hooks/use-analytics';
import {
  Users, FileText, Target, Zap, Activity, TrendingUp, TrendingDown,
  RefreshCw, Wifi, WifiOff, AlertTriangle, CheckCircle
} from 'lucide-react';

interface RealTimeMetricsProps {
  className?: string;
  showRefreshButton?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function RealTimeMetricsComponent({
  className,
  showRefreshButton = true,
  autoRefresh = true,
  refreshInterval = 5000
}: RealTimeMetricsProps) {
  const { data, loading, error, refresh, lastRefresh } = useAnalytics({ timeRange: '24h' });
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Simulate connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.1); // 90% uptime simulation
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Update last update time
  useEffect(() => {
    if (data?.lastUpdated) {
      setLastUpdate(data.lastUpdated);
    }
  }, [data?.lastUpdated]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (loading && !data) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
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

  if (error) {
    return (
      <Card className={cn("border-red-200 bg-red-50", className)}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Failed to load real-time metrics</span>
          </div>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <Button 
            onClick={refresh} 
            variant="outline" 
            size="sm" 
            className="mt-3"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const realTimeData = data?.realTime;
  const metrics = data?.metrics;

  if (!realTimeData || !metrics) {
    return null;
  }

  const metricsCards = [
    {
      title: "Active Users",
      value: realTimeData.activeUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      status: realTimeData.activeUsers > 20 ? 'healthy' : realTimeData.activeUsers > 10 ? 'warning' : 'critical',
      trend: realTimeData.activeUsers > 15 ? 'up' : 'down',
      description: "currently online"
    },
    {
      title: "Submissions Today",
      value: realTimeData.submissionsToday,
      icon: FileText,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      status: realTimeData.submissionsToday > 10 ? 'healthy' : realTimeData.submissionsToday > 5 ? 'warning' : 'critical',
      trend: realTimeData.submissionsToday > 8 ? 'up' : 'down',
      description: "new submissions"
    },
    {
      title: "Conversion Rate",
      value: `${realTimeData.conversionRate.toFixed(1)}%`,
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      status: realTimeData.conversionRate > 3 ? 'healthy' : realTimeData.conversionRate > 2 ? 'warning' : 'critical',
      trend: realTimeData.conversionRate > 2.5 ? 'up' : 'down',
      description: "visitor to lead"
    },
    {
      title: "Avg Response",
      value: `${realTimeData.avgResponseTime}ms`,
      icon: Zap,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      status: realTimeData.avgResponseTime < 200 ? 'healthy' : realTimeData.avgResponseTime < 500 ? 'warning' : 'critical',
      trend: realTimeData.avgResponseTime < 300 ? 'up' : 'down',
      description: "response time"
    }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Real-time Metrics</h3>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="outline" className="text-green-600 border-green-200">
                <Wifi className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-200">
                <WifiOff className="w-3 h-3 mr-1" />
                Disconnected
              </Badge>
            )}
            {lastUpdate && (
              <span className="text-sm text-gray-500">
                Updated {formatTimeAgo(lastUpdate)}
              </span>
            )}
          </div>
        </div>
        
        {showRefreshButton && (
          <Button
            onClick={refresh}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </Button>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {metricsCards.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-md",
                metric.borderColor
              )}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg", metric.bgColor)}>
                      <metric.icon className={cn("w-4 h-4", metric.color)} />
                    </div>
                    <div className={cn("flex items-center", getStatusColor(metric.status))}>
                      {getStatusIcon(metric.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="flex items-center gap-1">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                  
                  {/* Animated pulse indicator */}
                  <div className="absolute top-2 right-2">
                    <motion.div
                      className={cn("w-2 h-2 rounded-full", 
                        metric.status === 'healthy' ? 'bg-green-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* System Status */}
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-3 h-3 rounded-full animate-pulse",
                isConnected ? "bg-green-500" : "bg-red-500"
              )} />
              <span className="text-sm font-medium">
                Analytics System Status
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Data Freshness: {data ? formatTimeAgo(data.lastUpdated) : 'Unknown'}</span>
              <span>API Response: {realTimeData.avgResponseTime}ms</span>
              <span>Uptime: 99.9%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RealTimeMetricsComponent;
