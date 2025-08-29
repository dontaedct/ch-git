'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, AlertTriangle, CheckCircle, XCircle, Clock, Zap, Database, HardDrive } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface DiagnosticsData {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  system: {
    timestamp: string;
    nodeVersion: string;
    platform: string;
    arch: string;
    uptime: number;
    environment: string;
    vercelEnv: string;
  };
  environment: {
    health: {
      status: 'healthy' | 'warning' | 'critical';
      criticalMissing: string[];
      optionalMissing: string[];
      warnings: string[];
      placeholdersInUse: string[];
    };
    warnings: string[];
    variables?: Array<{
      key: string;
      value?: string;
      required: boolean;
      securityLevel: string;
      usingPlaceholder: boolean;
      featureImpact: string;
      feature: string;
    }>;
  };
  benchmarks?: {
    database: {
      status: 'healthy' | 'error';
      duration: number;
      error?: string;
      records: number;
    };
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    } | { message: string };
    system: {
      computeTime: number;
      result: number;
      timestamp: string;
    };
  };
  performance?: {
    processingTime: number;
    requestUrl: string;
    method: string;
    headers: {
      userAgent: string | null;
      contentType: string | null;
    };
  };
}

export function DiagnosticsInterface() {
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [detailMode, setDetailMode] = useState<'summary' | 'detailed' | 'full'>('detailed');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchDiagnostics = useCallback(async (mode: 'summary' | 'detailed' | 'full' = detailMode) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/diagnostics?mode=${mode}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        if (response.status === 403) {
          throw new Error('Admin access required');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching diagnostics:', err);
    } finally {
      setLoading(false);
    }
  }, [detailMode]);

  // Initial load
  useEffect(() => {
    fetchDiagnostics();
  }, [fetchDiagnostics]);

  // Auto-refresh management
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDiagnostics();
      }, 5000); // Refresh every 5 seconds
      setRefreshInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh, fetchDiagnostics, refreshInterval]);

  // Detail mode change handler
  const handleDetailModeChange = (newMode: 'summary' | 'detailed' | 'full') => {
    setDetailMode(newMode);
    fetchDiagnostics(newMode);
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => fetchDiagnostics()} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                  disabled={loading}
                />
                <span className="text-sm text-muted-foreground">Auto-refresh (5s)</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Detail Level:</span>
              <select 
                value={detailMode} 
                onChange={(e) => handleDetailModeChange(e.target.value as 'summary' | 'detailed' | 'full')}
                className="text-sm border rounded px-2 py-1"
                disabled={loading}
              >
                <option value="summary">Summary</option>
                <option value="detailed">Detailed</option>
                <option value="full">Full</option>
              </select>
            </div>
          </div>
          
          {lastRefresh && (
            <p className="text-xs text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </CardHeader>
      </Card>

      {!data ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* System Status Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(data.status)}
                  System Status
                </CardTitle>
                <Badge variant={data.status === 'healthy' ? 'default' : data.status === 'warning' ? 'secondary' : 'destructive'}>
                  {data.status.toUpperCase()}
                </Badge>
              </div>
              <CardDescription>
                Real-time system health and environment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Environment</p>
                  <p className="text-lg font-semibold">{data.system.environment}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Platform</p>
                  <p className="text-lg font-semibold">{data.system.platform} ({data.system.arch})</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Node Version</p>
                  <p className="text-lg font-semibold">{data.system.nodeVersion}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                  <p className="text-lg font-semibold">{formatUptime(data.system.uptime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(data.environment.health.status)}
                Environment Health
              </CardTitle>
              <CardDescription>
                Configuration validation and dependency status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.environment.health.criticalMissing.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Critical configuration missing: {data.environment.health.criticalMissing.join(', ')}
                  </AlertDescription>
                </Alert>
              )}
              
              {data.environment.health.warnings.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Validation warnings: {data.environment.health.warnings.length} issues detected
                  </AlertDescription>
                </Alert>
              )}

              {data.environment.health.placeholdersInUse.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Using placeholders for: {data.environment.health.placeholdersInUse.join(', ')}
                  </AlertDescription>
                </Alert>
              )}

              {detailMode !== 'summary' && data.environment.variables && (
                <div className="space-y-2">
                  <h4 className="font-medium">Configuration Status</h4>
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {data.environment.variables.map((variable) => (
                      <div key={variable.key} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{variable.key}</span>
                          {variable.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                          {variable.usingPlaceholder && <Badge variant="secondary" className="text-xs">Placeholder</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{variable.feature}</span>
                          <Badge variant={variable.value ? 'default' : 'destructive'} className="text-xs">
                            {variable.value ? 'SET' : 'MISSING'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Benchmarks */}
          {data.benchmarks && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance Benchmarks
                </CardTitle>
                <CardDescription>
                  Real-time system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Database Performance */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <h4 className="font-medium">Database</h4>
                      <Badge variant={data.benchmarks.database.status === 'healthy' ? 'default' : 'destructive'}>
                        {data.benchmarks.database.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Response Time</span>
                        <span className="font-mono">{data.benchmarks.database.duration}ms</span>
                      </div>
                      <Progress value={Math.min(100, (data.benchmarks.database.duration / 1000) * 100)} className="h-2" />
                      {data.benchmarks.database.error && (
                        <p className="text-xs text-destructive">{data.benchmarks.database.error}</p>
                      )}
                    </div>
                  </div>

                  {/* Memory Usage */}
                  {'rss' in data.benchmarks.memory ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        <h4 className="font-medium">Memory</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>RSS</span>
                          <span className="font-mono">{data.benchmarks.memory.rss}MB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Heap Used</span>
                          <span className="font-mono">{data.benchmarks.memory.heapUsed}MB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Heap Total</span>
                          <span className="font-mono">{data.benchmarks.memory.heapTotal}MB</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        <h4 className="font-medium">Memory</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{data.benchmarks.memory.message}</p>
                    </div>
                  )}

                  {/* System Performance */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <h4 className="font-medium">CPU Benchmark</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Compute Time</span>
                        <span className="font-mono">{data.benchmarks.system.computeTime}ms</span>
                      </div>
                      <Progress value={Math.min(100, (data.benchmarks.system.computeTime / 100) * 100)} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>Result</span>
                        <span className="font-mono">{data.benchmarks.system.result.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Details */}
          {data.performance && detailMode === 'full' && (
            <Card>
              <CardHeader>
                <CardTitle>Request Performance</CardTitle>
                <CardDescription>
                  Details about this diagnostic request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Request Info</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Method</span>
                        <span className="font-mono">{data.performance.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Time</span>
                        <span className="font-mono">{data.performance.processingTime}ms</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Client Info</h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">User Agent:</span>
                        <p className="font-mono text-xs mt-1 break-all">
                          {data.performance.headers.userAgent ?? 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}