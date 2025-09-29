/**
 * @fileoverview Analytics Alerting System Component
 * Manages alerts, notifications, and monitoring for analytics metrics
 */

"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Bell, AlertTriangle, CheckCircle, XCircle, Plus, Edit3, Trash2,
  Settings, Mail, MessageSquare, Slack, Webhook, TrendingUp, TrendingDown,
  Activity, Zap, Clock, Users, DollarSign, Target
} from 'lucide-react';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'changed' | 'percentage_change';
  threshold: number;
  timeWindow: string; // e.g., '5m', '1h', '24h'
  enabled: boolean;
  notificationChannels: NotificationChannel[];
  cooldownPeriod: number; // minutes
  lastTriggered?: Date;
  triggerCount: number;
  createdAt: Date;
}

interface NotificationChannel {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
  name: string;
  config: {
    email?: string;
    webhookUrl?: string;
    slackChannel?: string;
    phoneNumber?: string;
  };
  enabled: boolean;
}

interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  metric: string;
  value: number;
  threshold: number;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

const availableMetrics = [
  { id: 'submissions', name: 'Submissions', icon: Users, description: 'Total form submissions' },
  { id: 'conversions', name: 'Conversions', icon: Target, description: 'Successful conversions' },
  { id: 'revenue', name: 'Revenue', icon: DollarSign, description: 'Total revenue' },
  { id: 'visitors', name: 'Visitors', icon: Users, description: 'Unique visitors' },
  { id: 'conversion_rate', name: 'Conversion Rate', icon: TrendingUp, description: 'Visitor to conversion rate' },
  { id: 'bounce_rate', name: 'Bounce Rate', icon: TrendingDown, description: 'Page bounce rate' },
  { id: 'response_time', name: 'Response Time', icon: Zap, description: 'Average response time' },
  { id: 'error_rate', name: 'Error Rate', icon: XCircle, description: 'System error rate' }
];

const conditionOptions = [
  { value: 'greater_than', label: 'Greater than', description: 'Value exceeds threshold' },
  { value: 'less_than', label: 'Less than', description: 'Value below threshold' },
  { value: 'equals', label: 'Equals', description: 'Value equals threshold' },
  { value: 'changed', label: 'Changed', description: 'Value changed from previous' },
  { value: 'percentage_change', label: 'Percentage change', description: 'Percentage change from previous' }
];

const timeWindowOptions = [
  { value: '5m', label: '5 minutes' },
  { value: '15m', label: '15 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '4h', label: '4 hours' },
  { value: '24h', label: '24 hours' }
];

const severityOptions = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
];

export function AlertingSystem({ className }: { className?: string }) {
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [alertEvents, setAlertEvents] = useState<AlertEvent[]>([]);
  const [notificationChannels, setNotificationChannels] = useState<NotificationChannel[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertRule | null>(null);
  const [formData, setFormData] = useState<Partial<AlertRule>>({
    name: '',
    description: '',
    metric: '',
    condition: 'greater_than',
    threshold: 0,
    timeWindow: '1h',
    enabled: true,
    notificationChannels: [],
    cooldownPeriod: 60
  });

  // Load mock data
  useEffect(() => {
    const mockAlerts: AlertRule[] = [
      {
        id: '1',
        name: 'High Conversion Rate',
        description: 'Alert when conversion rate exceeds 5%',
        metric: 'conversion_rate',
        condition: 'greater_than',
        threshold: 5,
        timeWindow: '1h',
        enabled: true,
        notificationChannels: [],
        cooldownPeriod: 60,
        triggerCount: 3,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        name: 'Low Submissions',
        description: 'Alert when submissions drop below 10 per hour',
        metric: 'submissions',
        condition: 'less_than',
        threshold: 10,
        timeWindow: '1h',
        enabled: true,
        notificationChannels: [],
        cooldownPeriod: 30,
        triggerCount: 1,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockEvents: AlertEvent[] = [
      {
        id: '1',
        ruleId: '1',
        ruleName: 'High Conversion Rate',
        metric: 'conversion_rate',
        value: 6.2,
        threshold: 5,
        condition: 'greater_than',
        severity: 'medium',
        message: 'Conversion rate is 6.2%, exceeding threshold of 5%',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        acknowledged: false
      },
      {
        id: '2',
        ruleId: '2',
        ruleName: 'Low Submissions',
        metric: 'submissions',
        value: 8,
        threshold: 10,
        condition: 'less_than',
        severity: 'high',
        message: 'Submissions dropped to 8, below threshold of 10',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        acknowledged: true,
        acknowledgedBy: 'admin@example.com',
        acknowledgedAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      }
    ];

    const mockChannels: NotificationChannel[] = [
      {
        id: '1',
        type: 'email',
        name: 'Admin Email',
        config: { email: 'admin@example.com' },
        enabled: true
      },
      {
        id: '2',
        type: 'slack',
        name: 'Analytics Channel',
        config: { slackChannel: '#analytics' },
        enabled: true
      }
    ];

    setAlerts(mockAlerts);
    setAlertEvents(mockEvents);
    setNotificationChannels(mockChannels);
  }, []);

  const handleCreateAlert = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedAlert(null);
    setFormData({
      name: '',
      description: '',
      metric: '',
      condition: 'greater_than',
      threshold: 0,
      timeWindow: '1h',
      enabled: true,
      notificationChannels: [],
      cooldownPeriod: 60
    });
  };

  const handleEditAlert = (alert: AlertRule) => {
    setSelectedAlert(alert);
    setIsEditing(true);
    setIsCreating(false);
    setFormData(alert);
  };

  const handleSaveAlert = () => {
    if (!formData.name || !formData.metric) {
      alert('Please fill in all required fields');
      return;
    }

    const newAlert: AlertRule = {
      id: selectedAlert?.id || Date.now().toString(),
      name: formData.name!,
      description: formData.description || '',
      metric: formData.metric!,
      condition: formData.condition!,
      threshold: formData.threshold!,
      timeWindow: formData.timeWindow!,
      enabled: formData.enabled!,
      notificationChannels: formData.notificationChannels || [],
      cooldownPeriod: formData.cooldownPeriod!,
      triggerCount: selectedAlert?.triggerCount || 0,
      createdAt: selectedAlert?.createdAt || new Date()
    };

    if (isEditing && selectedAlert) {
      setAlerts(prev => prev.map(a => a.id === selectedAlert.id ? newAlert : a));
    } else {
      setAlerts(prev => [...prev, newAlert]);
    }

    setIsCreating(false);
    setIsEditing(false);
    setSelectedAlert(null);
    setFormData({});
  };

  const handleDeleteAlert = (alertId: string) => {
    if (confirm('Are you sure you want to delete this alert?')) {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    }
  };

  const handleToggleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, enabled: !a.enabled } : a
    ));
  };

  const handleAcknowledgeEvent = (eventId: string) => {
    setAlertEvents(prev => prev.map(e => 
      e.id === eventId 
        ? { 
            ...e, 
            acknowledged: true, 
            acknowledgedBy: 'current-user@example.com',
            acknowledgedAt: new Date()
          }
        : e
    ));
  };

  const getMetricIcon = (metricId: string) => {
    const metric = availableMetrics.find(m => m.id === metricId);
    return metric?.icon || Activity;
  };

  const getSeverityColor = (severity: string) => {
    const option = severityOptions.find(s => s.value === severity);
    return option?.color || 'bg-gray-100 text-gray-800';
  };

  const getConditionText = (condition: string) => {
    const option = conditionOptions.find(c => c.value === condition);
    return option?.label || condition;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alerting System</h2>
          <p className="text-gray-600">Monitor metrics and get notified of important changes</p>
        </div>
        <Button onClick={handleCreateAlert} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Alert
        </Button>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts">Alert Rules</TabsTrigger>
          <TabsTrigger value="events">Alert Events</TabsTrigger>
          <TabsTrigger value="channels">Notification Channels</TabsTrigger>
        </TabsList>

        {/* Alert Rules */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((alert) => {
              const MetricIcon = getMetricIcon(alert.metric);
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <MetricIcon className="w-5 h-5" />
                            {alert.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={alert.enabled}
                            onCheckedChange={() => handleToggleAlert(alert.id)}
                          />
                          <Badge className={alert.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {alert.enabled ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <span className="font-medium">Condition:</span>
                          <span className="ml-2">
                            {getConditionText(alert.condition)} {alert.threshold}
                          </span>
                        </div>
                        
                        <div className="text-sm">
                          <span className="font-medium">Time Window:</span>
                          <span className="ml-2">{alert.timeWindow}</span>
                        </div>
                        
                        <div className="text-sm">
                          <span className="font-medium">Triggered:</span>
                          <span className="ml-2">{alert.triggerCount} times</span>
                        </div>

                        {alert.lastTriggered && (
                          <div className="text-sm">
                            <span className="font-medium">Last Triggered:</span>
                            <span className="ml-2">{alert.lastTriggered.toLocaleDateString()}</span>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAlert(alert)}
                            className="flex-1"
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Alert Events */}
        <TabsContent value="events" className="space-y-4">
          <div className="space-y-4">
            {alertEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={cn(
                  "border-l-4",
                  event.severity === 'critical' ? "border-red-500" :
                  event.severity === 'high' ? "border-orange-500" :
                  event.severity === 'medium' ? "border-yellow-500" :
                  "border-blue-500"
                )}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity.toUpperCase()}
                          </Badge>
                          <h3 className="font-semibold">{event.ruleName}</h3>
                          {event.acknowledged && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Acknowledged
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{event.message}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Metric:</span>
                            <span className="ml-2">{event.metric}</span>
                          </div>
                          <div>
                            <span className="font-medium">Value:</span>
                            <span className="ml-2">{event.value}</span>
                          </div>
                          <div>
                            <span className="font-medium">Threshold:</span>
                            <span className="ml-2">{event.threshold}</span>
                          </div>
                          <div>
                            <span className="font-medium">Time:</span>
                            <span className="ml-2">{event.timestamp.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      {!event.acknowledged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledgeEvent(event.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Notification Channels */}
        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notificationChannels.map((channel) => (
              <Card key={channel.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {channel.type === 'email' && <Mail className="w-5 h-5" />}
                      {channel.type === 'slack' && <MessageSquare className="w-5 h-5" />}
                      {channel.type === 'webhook' && <Webhook className="w-5 h-5" />}
                      {channel.name}
                    </CardTitle>
                    <Switch
                      checked={channel.enabled}
                      onCheckedChange={(enabled) => {
                        setNotificationChannels(prev => prev.map(c => 
                          c.id === channel.id ? { ...c, enabled } : c
                        ));
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Type:</span>
                      <span className="ml-2 capitalize">{channel.type}</span>
                    </div>
                    {channel.config.email && (
                      <div>
                        <span className="font-medium">Email:</span>
                        <span className="ml-2">{channel.config.email}</span>
                      </div>
                    )}
                    {channel.config.slackChannel && (
                      <div>
                        <span className="font-medium">Slack Channel:</span>
                        <span className="ml-2">{channel.config.slackChannel}</span>
                      </div>
                    )}
                    {channel.config.webhookUrl && (
                      <div>
                        <span className="font-medium">Webhook URL:</span>
                        <span className="ml-2 text-xs text-gray-500 truncate">
                          {channel.config.webhookUrl}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Alert Modal */}
      {(isCreating || isEditing) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setIsCreating(false);
            setIsEditing(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {isEditing ? 'Edit Alert Rule' : 'Create Alert Rule'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                }}
              >
                ×
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="alert-name">Alert Name *</Label>
                <Input
                  id="alert-name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter alert name..."
                />
              </div>
              
              <div>
                <Label htmlFor="alert-description">Description</Label>
                <Input
                  id="alert-description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this alert monitors..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Metric *</Label>
                  <Select
                    value={formData.metric}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, metric: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMetrics.map((metric) => (
                        <SelectItem key={metric.id} value={metric.id}>
                          <div className="flex items-center gap-2">
                            <metric.icon className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{metric.name}</div>
                              <div className="text-sm text-gray-500">{metric.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Condition *</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, condition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="threshold">Threshold *</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={formData.threshold || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                    placeholder="Enter threshold value..."
                  />
                </div>

                <div>
                  <Label>Time Window</Label>
                  <Select
                    value={formData.timeWindow}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, timeWindow: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeWindowOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="cooldown">Cooldown Period (minutes)</Label>
                <Input
                  id="cooldown"
                  type="number"
                  value={formData.cooldownPeriod || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, cooldownPeriod: Number(e.target.value) }))}
                  placeholder="60"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.enabled}
                  onCheckedChange={(enabled) => setFormData(prev => ({ ...prev, enabled }))}
                />
                <Label>Enable this alert rule</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAlert}
                  className="flex-1"
                >
                  {isEditing ? 'Update Alert' : 'Create Alert'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default AlertingSystem;
