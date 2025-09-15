/**
 * @fileoverview HT-008.8.8: Comprehensive Alerting Dashboard
 * @module app/operability/alerting-dashboard/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.8 - Add comprehensive alerting and notification system
 * Focus: Real-time alerting dashboard with management and monitoring capabilities
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (production alerting, incident management)
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
  Bell, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Settings,
  Zap,
  Shield,
  Database,
  Server,
  Eye,
  EyeOff,
  MessageSquare,
  Mail,
  Webhook,
  Phone
} from 'lucide-react';

// Types
interface AlertInstance {
  id: string;
  definitionId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'error' | 'performance' | 'health' | 'security' | 'business' | 'infrastructure';
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  escalationLevel: number;
  lastEscalatedAt?: string;
  metadata: Record<string, any>;
  tags: string[];
  runbookUrl?: string;
}

interface AlertStatistics {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  alertsBySeverity: Record<string, number>;
  alertsByCategory: Record<string, number>;
  averageResolutionTime: number;
  escalationRate: number;
}

interface AlertDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: string;
  conditions: Array<{
    metric: string;
    operator: string;
    threshold: number;
    timeWindow: number;
  }>;
  channels: string[];
  escalationPolicy?: string;
  tags: string[];
  runbookUrl?: string;
}

export default function AlertingDashboardPage() {
  const [activeAlerts, setActiveAlerts] = useState<AlertInstance[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertInstance[]>([]);
  const [statistics, setStatistics] = useState<AlertStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<AlertInstance | null>(null);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);

  const fetchAlertData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/monitoring/alerts?includeHistory=true&includeStatistics=true');
      if (!response.ok) {
        throw new Error(`Failed to fetch alert data: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setActiveAlerts(data.activeAlerts || []);
        setAlertHistory(data.alertHistory || []);
        setStatistics(data.statistics || null);
      } else {
        throw new Error(data.error || 'Failed to fetch alert data');
      }
      
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alert data');
    } finally {
      setLoading(false);
    }
  }, []);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      setAcknowledging(alertId);
      
      const response = await fetch('/api/monitoring/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId,
          acknowledgedBy: 'current-user', // In real app, get from auth context
          note: 'Acknowledged via dashboard',
        }),
      });
      
      if (response.ok) {
        // Refresh data
        await fetchAlertData();
      } else {
        throw new Error('Failed to acknowledge alert');
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    } finally {
      setAcknowledging(null);
    }
  }, [fetchAlertData]);

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      setResolving(alertId);
      
      const response = await fetch('/api/monitoring/alerts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId,
          resolvedBy: 'current-user', // In real app, get from auth context
          resolution: 'Resolved via dashboard',
        }),
      });
      
      if (response.ok) {
        // Refresh data
        await fetchAlertData();
      } else {
        throw new Error('Failed to resolve alert');
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    } finally {
      setResolving(null);
    }
  }, [fetchAlertData]);

  useEffect(() => {
    fetchAlertData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchAlertData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchAlertData, autoRefresh]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600';
      case 'acknowledged': return 'text-yellow-600';
      case 'resolved': return 'text-green-600';
      case 'suppressed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'acknowledged': return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'suppressed': return <EyeOff className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'performance': return <BarChart3 className="h-4 w-4" />;
      case 'health': return <Shield className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'business': return <TrendingUp className="h-4 w-4" />;
      case 'infrastructure': return <Server className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'slack': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'webhook': return <Webhook className="h-4 w-4" />;
      case 'sms': return <Phone className="h-4 w-4" />;
      case 'pagerduty': return <Bell className="h-4 w-4" />;
      case 'discord': return <MessageSquare className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading && !activeAlerts.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading alerting dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerting Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive alerting system with escalation and notification management
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
          <Button variant="outline" size="sm" onClick={fetchAlertData}>
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
        {lastRefresh && (
          <span className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Key Metrics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statistics.activeAlerts}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.totalAlerts} total alerts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Alerts</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statistics.resolvedAlerts}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDuration(statistics.averageResolutionTime)} avg resolution
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Escalation Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.escalationRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Alerts requiring escalation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statistics.alertsBySeverity.critical || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                High priority issues
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>
                Currently active alerts requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No active alerts</p>
                  </div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(alert.status)}
                          {getCategoryIcon(alert.category)}
                          <div>
                            <h3 className="font-medium">{alert.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {alert.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityBadge(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {alert.category.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-sm font-medium">Created</div>
                          <div className="text-xs text-muted-foreground">
                            {formatTimestamp(alert.createdAt)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">Escalation</div>
                          <div className="text-xs text-muted-foreground">
                            Level {alert.escalationLevel}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">Status</div>
                          <div className="text-xs text-muted-foreground">
                            {alert.status.toUpperCase()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">Tags</div>
                          <div className="text-xs text-muted-foreground">
                            {alert.tags.length} tags
                          </div>
                        </div>
                      </div>
                      
                      {alert.tags.length > 0 && (
                        <div className="flex gap-1 mb-4">
                          {alert.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                          disabled={acknowledging === alert.id || alert.status !== 'active'}
                        >
                          {acknowledging === alert.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Eye className="h-4 w-4 mr-2" />
                          )}
                          Acknowledge
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveAlert(alert.id)}
                          disabled={resolving === alert.id || alert.status === 'resolved'}
                        >
                          {resolving === alert.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Resolve
                        </Button>
                        {alert.runbookUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={alert.runbookUrl} target="_blank" rel="noopener noreferrer">
                              <Settings className="h-4 w-4 mr-2" />
                              Runbook
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>
                Historical record of all alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alertHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No alert history available</p>
                  </div>
                ) : (
                  alertHistory.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(alert.status)}
                          <span className="font-medium">{alert.title}</span>
                          <Badge className={getSeverityBadge(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(alert.createdAt)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        {alert.description}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Category: {alert.category}</span>
                        <span>Status: {alert.status}</span>
                        {alert.acknowledgedBy && (
                          <span>Acknowledged by: {alert.acknowledgedBy}</span>
                        )}
                        {alert.resolvedBy && (
                          <span>Resolved by: {alert.resolvedBy}</span>
                        )}
                        {alert.escalationLevel > 0 && (
                          <span>Escalated to level {alert.escalationLevel}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          {statistics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardTitle>Alerts by Severity</CardTitle>
                <CardDescription>
                  Distribution of alerts by severity level
                </CardDescription>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(statistics.alertsBySeverity).map(([severity, count]) => (
                      <div key={severity} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityBadge(severity)}>
                            {severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(count / statistics.totalAlerts) * 100} 
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

              <Card>
                <CardTitle>Alerts by Category</CardTitle>
                <CardDescription>
                  Distribution of alerts by category
                </CardDescription>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(statistics.alertsByCategory).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          <span className="font-medium capitalize">{category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(count / statistics.totalAlerts) * 100} 
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

        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Management</CardTitle>
              <CardDescription>
                Manage alert definitions and escalation policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Alert management features coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    This will include alert definition management, escalation policy configuration,
                    and notification channel setup.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
