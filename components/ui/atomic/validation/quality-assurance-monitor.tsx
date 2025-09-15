/**
 * @fileoverview HT-022.4.3: Quality Assurance Monitor Component
 * @module components/ui/atomic/validation
 * @author Agency Component System
 * @version 1.0.0
 *
 * QUALITY ASSURANCE MONITOR: Continuous quality monitoring and alerting
 * Features:
 * - Real-time quality monitoring
 * - Automated quality gates
 * - Issue detection and alerting
 * - Quality trend analysis
 * - Performance benchmarking
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  performanceQualityValidator,
  type ValidationResult,
  type ValidationIssue
} from '@/lib/validation/performance-quality-validator';
import { Button, Input, Label } from '../atoms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../molecules';
import { Badge } from '../atoms';
import {
  Monitor,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Bell,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Target
} from 'lucide-react';

interface QualityAlert {
  id: string;
  type: 'performance' | 'quality' | 'reliability' | 'satisfaction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface MonitoringConfig {
  enabled: boolean;
  interval: number; // seconds
  performanceThreshold: number;
  qualityThreshold: number;
  satisfactionThreshold: number;
  reliabilityThreshold: number;
  alertsEnabled: boolean;
}

interface QualityAssuranceMonitorProps {
  className?: string;
}

export function QualityAssuranceMonitor({ className }: QualityAssuranceMonitorProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<QualityAlert[]>([]);
  const [validationHistory, setValidationHistory] = useState<ValidationResult[]>([]);
  const [config, setConfig] = useState<MonitoringConfig>({
    enabled: true,
    interval: 300, // 5 minutes
    performanceThreshold: 80,
    qualityThreshold: 85,
    satisfactionThreshold: 80,
    reliabilityThreshold: 90,
    alertsEnabled: true
  });

  const [currentMetrics, setCurrentMetrics] = useState({
    performance: 0,
    quality: 0,
    satisfaction: 0,
    reliability: 0,
    overall: 0
  });

  const updateConfig = useCallback((updates: Partial<MonitoringConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const generateAlert = useCallback((issue: ValidationIssue, type: string): QualityAlert => {
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: issue.category,
      severity: issue.severity,
      message: issue.message,
      timestamp: new Date(),
      acknowledged: false
    };
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const runMonitoringCycle = useCallback(async () => {
    try {
      // Mock theme and delivery for monitoring
      const mockTheme = {
        id: 'monitoring-theme',
        name: 'Monitoring Theme',
        colors: {
          primary: '#3b82f6',
          secondary: '#e2e8f0',
          accent: '#f1f5f9',
          background: '#ffffff',
          foreground: '#0f172a'
        },
        logo: {
          alt: 'Monitor Logo',
          initials: 'MT'
        },
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif'
        }
      };

      const mockDelivery = {
        deliveryId: 'monitor-delivery',
        clientName: 'Monitor Client',
        success: true,
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(),
        duration: 3600000,
        qualityGates: {},
        artifacts: [],
        errors: [],
        warnings: []
      };

      const results = await performanceQualityValidator.validateAll(
        mockTheme,
        mockDelivery
      );

      // Update metrics
      setCurrentMetrics({
        performance: results.performance.score,
        quality: results.quality.score,
        satisfaction: results.satisfaction.score,
        reliability: results.reliability.score,
        overall: results.overall.score
      });

      // Update history
      setValidationHistory(prev => [
        ...prev.slice(-19), // Keep last 19 results
        results.overall
      ]);

      // Check for alerts
      if (config.alertsEnabled) {
        const newAlerts: QualityAlert[] = [];

        // Check performance threshold
        if (results.performance.score < config.performanceThreshold) {
          results.performance.issues.forEach(issue => {
            newAlerts.push(generateAlert(issue, 'performance'));
          });
        }

        // Check quality threshold
        if (results.quality.score < config.qualityThreshold) {
          results.quality.issues.forEach(issue => {
            newAlerts.push(generateAlert(issue, 'quality'));
          });
        }

        // Check satisfaction threshold
        if (results.satisfaction.score < config.satisfactionThreshold) {
          results.satisfaction.issues.forEach(issue => {
            newAlerts.push(generateAlert(issue, 'satisfaction'));
          });
        }

        // Check reliability threshold
        if (results.reliability.score < config.reliabilityThreshold) {
          results.reliability.issues.forEach(issue => {
            newAlerts.push(generateAlert(issue, 'reliability'));
          });
        }

        if (newAlerts.length > 0) {
          setAlerts(prev => [...newAlerts, ...prev].slice(0, 100)); // Keep last 100 alerts
        }
      }

    } catch (error) {
      console.error('Monitoring cycle failed:', error);
    }
  }, [config, generateAlert]);

  // Monitoring interval
  useEffect(() => {
    if (!isMonitoring || !config.enabled) return;

    const interval = setInterval(runMonitoringCycle, config.interval * 1000);
    return () => clearInterval(interval);
  }, [isMonitoring, config.enabled, config.interval, runMonitoringCycle]);

  // Initial run
  useEffect(() => {
    runMonitoringCycle();
  }, [runMonitoringCycle]);

  const startMonitoring = () => {
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const getMetricTrend = (metric: string): 'up' | 'down' | 'stable' => {
    if (validationHistory.length < 2) return 'stable';

    const recent = validationHistory.slice(-2);
    const current = recent[1]?.metrics[metric] || 0;
    const previous = recent[0]?.metrics[metric] || 0;

    if (current > previous + 2) return 'up';
    if (current < previous - 2) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter(a => a.severity === 'critical');
  const highAlerts = unacknowledgedAlerts.filter(a => a.severity === 'high');

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Quality Assurance Monitor
            </CardTitle>
            <CardDescription>
              Continuous monitoring and alerting for quality metrics
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {unacknowledgedAlerts.length > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                {unacknowledgedAlerts.length}
              </Badge>
            )}
            <Badge variant={isMonitoring ? "default" : "secondary"}>
              {isMonitoring ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Control Panel */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isMonitoring ? (
                <Button onClick={stopMonitoring} variant="outline" size="sm">
                  <Pause className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button onClick={startMonitoring} size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
              )}
              <Button onClick={runMonitoringCycle} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Manual Run
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Interval: {config.interval}s
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={clearAllAlerts} variant="outline" size="sm" disabled={alerts.length === 0}>
              Clear Alerts
            </Button>
          </div>
        </div>

        {/* Current Metrics */}
        <div className="grid gap-4 md:grid-cols-5">
          {Object.entries(currentMetrics).map(([key, value]) => {
            const trend = getMetricTrend(key);
            return (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{key}</span>
                    {getTrendIcon(trend)}
                  </div>
                  <div className={`text-2xl font-bold ${
                    value >= 90 ? 'text-green-600' :
                    value >= 75 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Threshold: {
                      key === 'performance' ? config.performanceThreshold :
                      key === 'quality' ? config.qualityThreshold :
                      key === 'satisfaction' ? config.satisfactionThreshold :
                      key === 'reliability' ? config.reliabilityThreshold :
                      80
                    }
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Active Alerts */}
        {unacknowledgedAlerts.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Active Alerts ({unacknowledgedAlerts.length})
              </CardTitle>
              {criticalAlerts.length > 0 && (
                <div className="text-sm text-red-600">
                  {criticalAlerts.length} critical alerts require immediate attention
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {unacknowledgedAlerts.slice(0, 10).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 border-l-4 rounded-r-lg ${
                      alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                      alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                      alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={
                            alert.severity === 'critical' ? 'destructive' :
                            alert.severity === 'high' ? 'destructive' :
                            'secondary'
                          }>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className={`text-sm font-medium ${
                          alert.severity === 'critical' ? 'text-red-800' :
                          alert.severity === 'high' ? 'text-orange-800' :
                          alert.severity === 'medium' ? 'text-yellow-800' :
                          'text-blue-800'
                        }`}>
                          {alert.message}
                        </div>
                      </div>
                      <Button
                        onClick={() => acknowledgeAlert(alert.id)}
                        size="sm"
                        variant="outline"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monitoring Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Monitoring Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label>Monitoring Interval (seconds)</Label>
                  <Input
                    type="number"
                    min="30"
                    max="3600"
                    value={config.interval}
                    onChange={(e) => updateConfig({ interval: parseInt(e.target.value) || 300 })}
                  />
                </div>

                <div>
                  <Label>Performance Threshold</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={config.performanceThreshold}
                    onChange={(e) => updateConfig({ performanceThreshold: parseInt(e.target.value) || 80 })}
                  />
                </div>

                <div>
                  <Label>Quality Threshold</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={config.qualityThreshold}
                    onChange={(e) => updateConfig({ qualityThreshold: parseInt(e.target.value) || 85 })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Satisfaction Threshold</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={config.satisfactionThreshold}
                    onChange={(e) => updateConfig({ satisfactionThreshold: parseInt(e.target.value) || 80 })}
                  />
                </div>

                <div>
                  <Label>Reliability Threshold</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={config.reliabilityThreshold}
                    onChange={(e) => updateConfig({ reliabilityThreshold: parseInt(e.target.value) || 90 })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="alerts-enabled"
                    checked={config.alertsEnabled}
                    onChange={(e) => updateConfig({ alertsEnabled: e.target.checked })}
                  />
                  <Label htmlFor="alerts-enabled">Enable Alerts</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality Trend */}
        {validationHistory.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quality Trend</CardTitle>
              <CardDescription>Historical quality metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground mb-4">
                  Last {validationHistory.length} validation cycles
                </div>
                <div className="grid gap-2">
                  {validationHistory.slice(-10).map((result, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs w-12 text-muted-foreground">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                      <div className="flex-1 flex items-center gap-1">
                        {result.passed ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              result.score >= 90 ? 'bg-green-500' :
                              result.score >= 75 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${result.score}%` }}
                          />
                        </div>
                        <span className="text-xs w-8">{result.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}