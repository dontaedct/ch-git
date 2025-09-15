/**
 * @fileoverview HT-008.8.6: Error Recovery Dashboard
 * @module app/operability/error-recovery/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.6 - Add automated error recovery mechanisms
 * Focus: Real-time error recovery monitoring and management dashboard
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (production error recovery, system resilience)
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
  Shield, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  Zap,
  RotateCcw,
  Settings,
  TrendingUp,
  TrendingDown,
  Circle,
  Square,
  Triangle
} from 'lucide-react';

// Types
interface CircuitBreakerEntry {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  consecutiveFailures: number;
  totalRequests: number;
}

interface ServiceHealth {
  service: string;
  healthy: boolean;
  lastCheck: string;
  responseTime: number;
  errorRate: number;
  circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

interface RecoveryAction {
  id: string;
  type: 'retry' | 'fallback' | 'circuit_breaker_open' | 'circuit_breaker_close' | 'health_check';
  service: string;
  timestamp: string;
  success: boolean;
  details: Record<string, any>;
}

interface RecoveryStatistics {
  circuitBreakers: Record<string, CircuitBreakerEntry>;
  serviceHealth: Record<string, ServiceHealth>;
  recentActions: RecoveryAction[];
  totalActions: number;
}

export default function ErrorRecoveryPage() {
  const [statistics, setStatistics] = useState<RecoveryStatistics | null>(null);
  const [allServiceHealth, setAllServiceHealth] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedService, setSelectedService] = useState<string>('');

  const fetchRecoveryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/monitoring/recovery');
      if (!response.ok) {
        throw new Error(`Failed to fetch recovery data: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setStatistics(data.statistics);
        setAllServiceHealth(data.allServiceHealth);
      } else {
        throw new Error(data.error || 'Failed to fetch recovery data');
      }
      
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recovery data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchServiceHealth = useCallback(async (serviceName: string) => {
    try {
      const response = await fetch(`/api/monitoring/recovery?serviceName=${serviceName}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update the specific service health in the state
          setAllServiceHealth(prev => 
            prev.map(service => 
              service.service === serviceName ? data.health : service
            )
          );
        }
      }
    } catch (err) {
      console.error('Failed to fetch service health:', err);
    }
  }, []);

  useEffect(() => {
    fetchRecoveryData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchRecoveryData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchRecoveryData, autoRefresh]);

  const getCircuitBreakerIcon = (state: string) => {
    switch (state) {
      case 'CLOSED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'OPEN': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'HALF_OPEN': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCircuitBreakerColor = (state: string) => {
    switch (state) {
      case 'CLOSED': return 'bg-green-500';
      case 'OPEN': return 'bg-red-500';
      case 'HALF_OPEN': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'retry': return <RotateCcw className="h-4 w-4" />;
      case 'fallback': return <Shield className="h-4 w-4" />;
      case 'circuit_breaker_open': return <AlertTriangle className="h-4 w-4" />;
      case 'circuit_breaker_close': return <CheckCircle className="h-4 w-4" />;
      case 'health_check': return <Activity className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getActionColor = (type: string, success: boolean) => {
    if (!success) return 'text-red-500';
    
    switch (type) {
      case 'retry': return 'text-blue-500';
      case 'fallback': return 'text-green-500';
      case 'circuit_breaker_open': return 'text-red-500';
      case 'circuit_breaker_close': return 'text-green-500';
      case 'health_check': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getHealthScore = () => {
    if (!allServiceHealth.length) return 0;
    const healthyServices = allServiceHealth.filter(s => s.healthy).length;
    return Math.round((healthyServices / allServiceHealth.length) * 100);
  };

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading error recovery data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Error Recovery System</h1>
          <p className="text-muted-foreground">
            Automated error recovery with circuit breakers and fallback services
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
          <Button variant="outline" size="sm" onClick={fetchRecoveryData}>
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

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Service:</span>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="">All Services</option>
            {allServiceHealth.map(service => (
              <option key={service.service} value={service.service}>
                {service.service}
              </option>
            ))}
          </select>
        </div>
        
        {lastRefresh && (
          <span className="text-sm text-muted-foreground ml-4">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Key Metrics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getHealthScore()}%
              </div>
              <p className="text-xs text-muted-foreground">
                {allServiceHealth.filter(s => s.healthy).length} of {allServiceHealth.length} services healthy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Circuit Breakers</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(statistics.circuitBreakers).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {Object.values(statistics.circuitBreakers).filter(cb => cb.state === 'OPEN').length} open
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recovery Actions</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.totalActions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.recentActions.filter(a => a.success).length} successful today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Services</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allServiceHealth.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {allServiceHealth.filter(s => s.circuitBreakerState === 'CLOSED').length} operational
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="circuit-breakers">Circuit Breakers</TabsTrigger>
          <TabsTrigger value="services">Service Health</TabsTrigger>
          <TabsTrigger value="actions">Recovery Actions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Circuit Breaker Status */}
          {statistics && (
            <Card>
              <CardHeader>
                <CardTitle>Circuit Breaker Status</CardTitle>
                <CardDescription>
                  Current state of all circuit breakers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(statistics.circuitBreakers).map(([service, cb]) => (
                    <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getCircuitBreakerIcon(cb.state)}
                        <div>
                          <span className="font-medium">{service}</span>
                          <div className="text-sm text-muted-foreground">
                            {cb.totalRequests} requests • {cb.failures} failures
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCircuitBreakerColor(cb.state)}>
                          {cb.state}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {cb.consecutiveFailures} consecutive
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Recovery Actions */}
          {statistics && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Recovery Actions</CardTitle>
                <CardDescription>
                  Latest recovery actions and their outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {statistics.recentActions.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">No recent recovery actions</p>
                    </div>
                  ) : (
                    statistics.recentActions.slice(0, 20).map((action) => (
                      <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={getActionColor(action.type, action.success)}>
                            {getActionIcon(action.type)}
                          </div>
                          <div>
                            <span className="font-medium capitalize">
                              {action.type.replace(/_/g, ' ')}
                            </span>
                            <div className="text-sm text-muted-foreground">
                              {action.service} • {formatTimestamp(action.timestamp)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={action.success ? "default" : "destructive"}>
                            {action.success ? 'Success' : 'Failed'}
                          </Badge>
                          {action.details.duration && (
                            <span className="text-sm text-muted-foreground">
                              {formatDuration(action.details.duration)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="circuit-breakers" className="space-y-4">
          {statistics && (
            <Card>
              <CardHeader>
                <CardTitle>Circuit Breaker Details</CardTitle>
                <CardDescription>
                  Detailed information about circuit breaker states and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(statistics.circuitBreakers).map(([service, cb]) => (
                    <div key={service} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{service}</span>
                          {getCircuitBreakerIcon(cb.state)}
                        </div>
                        <Badge className={getCircuitBreakerColor(cb.state)}>
                          {cb.state}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{cb.totalRequests}</div>
                          <div className="text-sm text-muted-foreground">Total Requests</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-500">{cb.failures}</div>
                          <div className="text-sm text-muted-foreground">Failures</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-500">{cb.consecutiveFailures}</div>
                          <div className="text-sm text-muted-foreground">Consecutive</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {cb.totalRequests > 0 ? 
                              Math.round(((cb.totalRequests - cb.failures) / cb.totalRequests) * 100) : 
                              100}%
                          </div>
                          <div className="text-sm text-muted-foreground">Success Rate</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-sm text-muted-foreground">
                        <div>Last Success: {cb.lastSuccessTime ? formatTimestamp(new Date(cb.lastSuccessTime).toISOString()) : 'Never'}</div>
                        <div>Last Failure: {cb.lastFailureTime ? formatTimestamp(new Date(cb.lastFailureTime).toISOString()) : 'Never'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Health Status</CardTitle>
              <CardDescription>
                Health status of all monitored services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allServiceHealth.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No services monitored</p>
                  </div>
                ) : (
                  allServiceHealth.map((service) => (
                    <div key={service.service} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {service.healthy ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <span className="font-medium">{service.service}</span>
                          <div className="text-sm text-muted-foreground">
                            Last check: {formatTimestamp(service.lastCheck)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCircuitBreakerColor(service.circuitBreakerState)}>
                          {service.circuitBreakerState}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {formatDuration(service.responseTime)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(service.errorRate * 100).toFixed(1)}% errors
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          {statistics && (
            <Card>
              <CardHeader>
                <CardTitle>Recovery Actions History</CardTitle>
                <CardDescription>
                  Complete history of recovery actions and their outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {statistics.recentActions.map((action) => (
                    <div key={action.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={getActionColor(action.type, action.success)}>
                            {getActionIcon(action.type)}
                          </div>
                          <span className="font-medium capitalize">
                            {action.type.replace(/_/g, ' ')}
                          </span>
                          <Badge variant={action.success ? "default" : "destructive"}>
                            {action.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(action.timestamp)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        Service: {action.service}
                      </div>
                      
                      {Object.keys(action.details).length > 0 && (
                        <div className="text-sm">
                          <strong>Details:</strong>
                          <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                            {JSON.stringify(action.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {statistics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardTitle>Recovery Success Rate</CardTitle>
                <CardDescription>
                  Success rate of recovery actions over time
                </CardDescription>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold mb-2">
                      {statistics.recentActions.length > 0 ? 
                        Math.round((statistics.recentActions.filter(a => a.success).length / statistics.recentActions.length) * 100) : 
                        100}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Recovery Success Rate
                    </div>
                    <Progress 
                      value={statistics.recentActions.length > 0 ? 
                        (statistics.recentActions.filter(a => a.success).length / statistics.recentActions.length) * 100 : 
                        100} 
                      className="w-64 mx-auto mt-4" 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardTitle>Circuit Breaker Distribution</CardTitle>
                <CardDescription>
                  Distribution of circuit breaker states
                </CardDescription>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      Object.values(statistics.circuitBreakers).reduce((acc, cb) => {
                        acc[cb.state] = (acc[cb.state] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([state, count]) => (
                      <div key={state} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCircuitBreakerIcon(state)}
                          <span className="font-medium">{state}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(count / Object.keys(statistics.circuitBreakers).length) * 100} 
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
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
