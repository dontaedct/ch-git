'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Bell, Clock, CheckCircle, XCircle, Users, Mail, Phone, MessageSquare, Settings, Plus, Edit, Trash2 } from 'lucide-react';

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notifications: string[];
  description: string;
  lastTriggered?: string;
}

interface ActiveAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved';
  triggeredAt: string;
  assignedTo?: string;
  source: string;
  affectedServices: string[];
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  assignedTo: string;
  affectedServices: string[];
  timeline: IncidentTimelineEvent[];
}

interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  event: string;
  description: string;
  user: string;
}

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'slack' | 'webhook';
  enabled: boolean;
  configuration: Record<string, any>;
}

export default function AlertingPage() {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: '1',
      name: 'High CPU Usage',
      metric: 'cpu_usage',
      condition: 'greater_than',
      threshold: 80,
      severity: 'high',
      enabled: true,
      notifications: ['email', 'slack'],
      description: 'Alert when CPU usage exceeds 80%',
      lastTriggered: '2 hours ago'
    },
    {
      id: '2',
      name: 'Memory Usage Critical',
      metric: 'memory_usage',
      condition: 'greater_than',
      threshold: 90,
      severity: 'critical',
      enabled: true,
      notifications: ['email', 'sms', 'slack'],
      description: 'Critical alert when memory usage exceeds 90%'
    },
    {
      id: '3',
      name: 'Response Time High',
      metric: 'response_time',
      condition: 'greater_than',
      threshold: 1000,
      severity: 'medium',
      enabled: true,
      notifications: ['email'],
      description: 'Alert when response time exceeds 1000ms',
      lastTriggered: '1 day ago'
    }
  ]);

  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([
    {
      id: 'alert-1',
      title: 'Database Connection Pool Exhausted',
      description: 'All database connections are in use, new requests are being queued',
      severity: 'critical',
      status: 'open',
      triggeredAt: '5 minutes ago',
      source: 'Database Monitor',
      affectedServices: ['API Gateway', 'User Service', 'Order Service']
    },
    {
      id: 'alert-2',
      title: 'High Memory Usage on Web Server 2',
      description: 'Memory usage has exceeded 85% threshold',
      severity: 'high',
      status: 'acknowledged',
      triggeredAt: '15 minutes ago',
      assignedTo: 'DevOps Team',
      source: 'Infrastructure Monitor',
      affectedServices: ['Web Server 2']
    },
    {
      id: 'alert-3',
      title: 'API Response Time Degradation',
      description: 'Average response time has increased to 850ms',
      severity: 'medium',
      status: 'open',
      triggeredAt: '30 minutes ago',
      source: 'Performance Monitor',
      affectedServices: ['API Gateway']
    }
  ]);

  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'inc-1',
      title: 'Service Outage - Payment Processing',
      description: 'Payment processing service is experiencing intermittent failures',
      severity: 'critical',
      status: 'monitoring',
      createdAt: '2 hours ago',
      assignedTo: 'John Smith',
      affectedServices: ['Payment Service', 'Checkout API'],
      timeline: [
        {
          id: 't1',
          timestamp: '2 hours ago',
          event: 'Incident Created',
          description: 'Multiple payment failures detected',
          user: 'System'
        },
        {
          id: 't2',
          timestamp: '1.5 hours ago',
          event: 'Investigation Started',
          description: 'Team assigned and investigation begun',
          user: 'John Smith'
        },
        {
          id: 't3',
          timestamp: '1 hour ago',
          event: 'Root Cause Identified',
          description: 'Database connection timeout identified as root cause',
          user: 'John Smith'
        },
        {
          id: 't4',
          timestamp: '30 minutes ago',
          event: 'Fix Deployed',
          description: 'Connection pool configuration updated',
          user: 'DevOps Team'
        }
      ]
    }
  ]);

  const [notificationChannels, setNotificationChannels] = useState<NotificationChannel[]>([
    {
      id: '1',
      name: 'Email Alerts',
      type: 'email',
      enabled: true,
      configuration: { recipients: ['ops@company.com', 'alerts@company.com'] }
    },
    {
      id: '2',
      name: 'Slack Ops Channel',
      type: 'slack',
      enabled: true,
      configuration: { webhook: 'https://hooks.slack.com/services/...', channel: '#ops' }
    },
    {
      id: '3',
      name: 'SMS Alerts',
      type: 'sms',
      enabled: true,
      configuration: { numbers: ['+1234567890', '+0987654321'] }
    }
  ]);

  const [newAlertRule, setNewAlertRule] = useState<Partial<AlertRule>>({
    name: '',
    metric: '',
    condition: 'greater_than',
    threshold: 0,
    severity: 'medium',
    enabled: true,
    notifications: [],
    description: ''
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'acknowledged':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'identified':
        return 'bg-purple-100 text-purple-800';
      case 'monitoring':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Bell className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <Phone className="h-4 w-4" />;
      case 'slack':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setActiveAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'acknowledged', assignedTo: 'Current User' }
        : alert
    ));
  };

  const resolveAlert = (alertId: string) => {
    setActiveAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'resolved' }
        : alert
    ));
  };

  const createAlertRule = () => {
    if (newAlertRule.name && newAlertRule.metric && newAlertRule.threshold) {
      const rule: AlertRule = {
        id: Date.now().toString(),
        name: newAlertRule.name!,
        metric: newAlertRule.metric!,
        condition: newAlertRule.condition!,
        threshold: newAlertRule.threshold!,
        severity: newAlertRule.severity!,
        enabled: newAlertRule.enabled!,
        notifications: newAlertRule.notifications!,
        description: newAlertRule.description!
      };
      setAlertRules(prev => [...prev, rule]);
      setNewAlertRule({
        name: '',
        metric: '',
        condition: 'greater_than',
        threshold: 0,
        severity: 'medium',
        enabled: true,
        notifications: [],
        description: ''
      });
    }
  };

  const toggleAlertRule = (ruleId: string) => {
    setAlertRules(prev => prev.map(rule =>
      rule.id === ruleId
        ? { ...rule, enabled: !rule.enabled }
        : rule
    ));
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerting & Incident Management</h1>
          <p className="text-muted-foreground">
            Monitor system health, manage alerts, and coordinate incident response
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {activeAlerts.filter(alert => alert.status === 'open').length} Active Alerts
          </Badge>
          <Badge variant="outline" className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {incidents.filter(inc => inc.status !== 'resolved').length} Open Incidents
          </Badge>
        </div>
      </div>

      {activeAlerts.filter(alert => alert.status === 'open' && alert.severity === 'critical').length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {activeAlerts.filter(alert => alert.status === 'open' && alert.severity === 'critical').length} critical alert(s) require immediate attention!
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="channels">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid gap-4">
            {activeAlerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${alert.severity === 'critical' ? 'border-l-red-500' : alert.severity === 'high' ? 'border-l-orange-500' : alert.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      {getSeverityIcon(alert.severity)}
                      <div>
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                        <CardDescription>{alert.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium">Triggered</p>
                      <p className="text-sm text-muted-foreground">{alert.triggeredAt}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Source</p>
                      <p className="text-sm text-muted-foreground">{alert.source}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Assigned To</p>
                      <p className="text-sm text-muted-foreground">{alert.assignedTo || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Affected Services</p>
                      <p className="text-sm text-muted-foreground">{alert.affectedServices.join(', ')}</p>
                    </div>
                  </div>
                  {alert.status === 'open' && (
                    <div className="flex space-x-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                      <Button size="sm" variant="outline">
                        Create Incident
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Alert Rule</CardTitle>
              <CardDescription>Define conditions that trigger alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    value={newAlertRule.name || ''}
                    onChange={(e) => setNewAlertRule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter rule name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metric">Metric</Label>
                  <Select value={newAlertRule.metric} onValueChange={(value) => setNewAlertRule(prev => ({ ...prev, metric: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpu_usage">CPU Usage</SelectItem>
                      <SelectItem value="memory_usage">Memory Usage</SelectItem>
                      <SelectItem value="response_time">Response Time</SelectItem>
                      <SelectItem value="error_rate">Error Rate</SelectItem>
                      <SelectItem value="disk_usage">Disk Usage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select value={newAlertRule.condition} onValueChange={(value) => setNewAlertRule(prev => ({ ...prev, condition: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                      <SelectItem value="equals">Equals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold">Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={newAlertRule.threshold || ''}
                    onChange={(e) => setNewAlertRule(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
                    placeholder="Enter threshold value"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={newAlertRule.severity} onValueChange={(value: any) => setNewAlertRule(prev => ({ ...prev, severity: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAlertRule.description || ''}
                  onChange={(e) => setNewAlertRule(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe when this alert should trigger"
                />
              </div>
              <Button onClick={createAlertRule} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Alert Rule
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {alertRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      <CardDescription>{rule.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(rule.severity)}>
                        {rule.severity.toUpperCase()}
                      </Badge>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleAlertRule(rule.id)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium">Metric</p>
                      <p className="text-sm text-muted-foreground">{rule.metric}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Condition</p>
                      <p className="text-sm text-muted-foreground">{rule.condition} {rule.threshold}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Notifications</p>
                      <div className="flex space-x-1">
                        {rule.notifications.map(notif => (
                          <Badge key={notif} variant="outline" className="text-xs">
                            {notif}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Triggered</p>
                      <p className="text-sm text-muted-foreground">{rule.lastTriggered || 'Never'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <div className="grid gap-4">
            {incidents.map((incident) => (
              <Card key={incident.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{incident.title}</CardTitle>
                      <CardDescription>{incident.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 mb-4">
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">{incident.createdAt}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Assigned To</p>
                      <p className="text-sm text-muted-foreground">{incident.assignedTo}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Affected Services</p>
                      <p className="text-sm text-muted-foreground">{incident.affectedServices.join(', ')}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Timeline</h4>
                    <div className="space-y-2">
                      {incident.timeline.map((event) => (
                        <div key={event.id} className="flex items-start space-x-3 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{event.event}</span>
                              <span className="text-muted-foreground">{event.timestamp}</span>
                            </div>
                            <p className="text-muted-foreground">{event.description}</p>
                            <p className="text-xs text-muted-foreground">by {event.user}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <div className="grid gap-4">
            {notificationChannels.map((channel) => (
              <Card key={channel.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      {getNotificationIcon(channel.type)}
                      <div>
                        <CardTitle className="text-lg">{channel.name}</CardTitle>
                        <CardDescription>Type: {channel.type}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={channel.enabled ? "default" : "secondary"}>
                        {channel.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Switch checked={channel.enabled} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Configuration</p>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {Object.entries(channel.configuration).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium">{key}:</span>
                          <span className="text-muted-foreground">
                            {Array.isArray(value) ? value.join(', ') : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}