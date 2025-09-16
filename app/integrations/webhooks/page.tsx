import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { ArrowLeft, Webhook, Zap, Shield, AlertCircle, CheckCircle, Clock, Activity, Settings, GitBranch, Database, Bell, MessageSquare, Filter, ArrowUpRight, RefreshCw, Play, Pause } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function WebhooksPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  const webhookStats = {
    totalWebhooks: 12,
    activeEndpoints: 8,
    eventsProcessed: 2456,
    successRate: 98.5
  };

  const eventProcessingComponents = [
    {
      title: 'Event Ingestion',
      description: 'Receive and validate incoming webhook events from external services',
      icon: Webhook,
      status: 'active',
      features: [
        'HTTP Endpoint Management',
        'Signature Verification',
        'Payload Validation',
        'Rate Limiting Protection'
      ]
    },
    {
      title: 'Event Processing',
      description: 'Transform, filter, and enrich incoming events for business logic',
      icon: Database,
      status: 'active',
      features: [
        'Event Transformation',
        'Content Filtering',
        'Data Enrichment',
        'Schema Validation'
      ]
    },
    {
      title: 'Event Routing',
      description: 'Route events to appropriate handlers and downstream systems',
      icon: GitBranch,
      status: 'active',
      features: [
        'Rule-based Routing',
        'Content-based Routing',
        'Topic-based Routing',
        'Dynamic Routing'
      ]
    },
    {
      title: 'Event Monitoring',
      description: 'Track event processing, failures, and system health metrics',
      icon: Activity,
      status: 'active',
      features: [
        'Real-time Monitoring',
        'Error Tracking',
        'Performance Metrics',
        'Alert Management'
      ]
    }
  ];

  const webhookEndpoints = [
    {
      name: 'Stripe Payment Events',
      url: '/api/webhooks/stripe',
      events: ['payment_intent.succeeded', 'charge.failed', 'invoice.paid'],
      status: 'active',
      lastEvent: '2 minutes ago',
      successRate: 99.2,
      eventsToday: 145
    },
    {
      name: 'GitHub Repository Events',
      url: '/api/webhooks/github',
      events: ['push', 'pull_request', 'issues'],
      status: 'active',
      lastEvent: '15 minutes ago',
      successRate: 98.8,
      eventsToday: 67
    },
    {
      name: 'SendGrid Email Events',
      url: '/api/webhooks/sendgrid',
      events: ['delivered', 'opened', 'clicked', 'bounced'],
      status: 'active',
      lastEvent: '5 minutes ago',
      successRate: 97.5,
      eventsToday: 234
    },
    {
      name: 'Slack Workspace Events',
      url: '/api/webhooks/slack',
      events: ['message', 'channel_created', 'user_joined'],
      status: 'paused',
      lastEvent: '2 hours ago',
      successRate: 95.0,
      eventsToday: 12
    }
  ];

  const routingRules = [
    {
      rule: 'Payment Success',
      condition: 'event.type === "payment_intent.succeeded"',
      action: 'Trigger order fulfillment workflow',
      priority: 'High'
    },
    {
      rule: 'Email Bounce',
      condition: 'event.type === "bounced" && event.reason === "invalid"',
      action: 'Update user email status and notify admin',
      priority: 'Medium'
    },
    {
      rule: 'Security Alert',
      condition: 'event.category === "security" && event.severity >= 8',
      action: 'Send immediate notification to security team',
      priority: 'Critical'
    },
    {
      rule: 'User Activity',
      condition: 'event.type === "user_action" && event.action === "signup"',
      action: 'Send welcome email and update CRM',
      priority: 'Low'
    }
  ];

  const reliabilityMechanisms = [
    {
      mechanism: 'Retry Logic',
      description: 'Automatic retry with exponential backoff for failed webhook deliveries',
      implementation: 'Max 5 retries with 1s, 2s, 4s, 8s, 16s delays',
      status: 'implemented'
    },
    {
      mechanism: 'Dead Letter Queue',
      description: 'Store failed events for manual inspection and reprocessing',
      implementation: 'Failed events after max retries go to DLQ',
      status: 'implemented'
    },
    {
      mechanism: 'Idempotency Handling',
      description: 'Prevent duplicate processing of the same event',
      implementation: 'Event ID-based deduplication within 24h window',
      status: 'implemented'
    },
    {
      mechanism: 'Circuit Breaker',
      description: 'Prevent cascading failures when downstream services are unavailable',
      implementation: 'Open circuit after 10 consecutive failures',
      status: 'planned'
    }
  ];

  const eventTypes = [
    { type: 'payment.succeeded', count: 245, source: 'Stripe', lastSeen: '2 min ago' },
    { type: 'email.delivered', count: 189, source: 'SendGrid', lastSeen: '5 min ago' },
    { type: 'user.signup', count: 67, source: 'Auth Service', lastSeen: '8 min ago' },
    { type: 'order.created', count: 134, source: 'E-commerce', lastSeen: '12 min ago' },
    { type: 'message.sent', count: 89, source: 'Chat Service', lastSeen: '15 min ago' }
  ];

  const monitoringMetrics = [
    { metric: 'Processing Latency', value: '145ms avg', trend: 'down', status: 'good' },
    { metric: 'Success Rate', value: '98.5%', trend: 'up', status: 'excellent' },
    { metric: 'Failed Events', value: '23', trend: 'down', status: 'good' },
    { metric: 'Queue Depth', value: '8', trend: 'stable', status: 'normal' },
    { metric: 'Throughput', value: '450/min', trend: 'up', status: 'good' },
    { metric: 'Active Endpoints', value: '8/12', trend: 'stable', status: 'normal' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/integrations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Integrations
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Webhook & Event Management</h1>
          <p className="text-gray-600">
            Manage webhook endpoints, event processing, routing, and monitoring
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Webhooks</CardTitle>
              <Webhook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{webhookStats.totalWebhooks}</div>
              <p className="text-xs text-muted-foreground">
                {webhookStats.activeEndpoints} active endpoints
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events Today</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{webhookStats.eventsProcessed}</div>
              <p className="text-xs text-muted-foreground">
                +12% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{webhookStats.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                +0.3% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">145ms</div>
              <p className="text-xs text-muted-foreground">
                -23ms from last hour
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Event Processing Architecture */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Event Processing Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {eventProcessingComponents.map((component) => {
                const Icon = component.icon;
                return (
                  <div key={component.title} className="text-center">
                    <div className="bg-orange-50 p-3 rounded-lg mb-3 inline-block">
                      <Icon className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{component.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{component.description}</p>
                    <Badge variant={component.status === 'active' ? 'default' : 'secondary'}>
                      {component.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Webhook Endpoints */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Webhook className="mr-2 h-5 w-5" />
                Webhook Endpoints
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Add Endpoint
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {webhookEndpoints.map((endpoint, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{endpoint.name}</h3>
                      <p className="text-sm text-gray-600">{endpoint.url}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={endpoint.status === 'active' ? 'default' : 'secondary'}>
                        {endpoint.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        {endpoint.status === 'active' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Events:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {endpoint.events.slice(0, 2).map((event, i) => (
                          <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {event}
                          </span>
                        ))}
                        {endpoint.events.length > 2 && (
                          <span className="text-gray-500 text-xs">+{endpoint.events.length - 2} more</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Success Rate:</span>
                      <div className="font-medium">{endpoint.successRate}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Events Today:</span>
                      <div className="font-medium">{endpoint.eventsToday}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Event:</span>
                      <div className="font-medium">{endpoint.lastEvent}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Event Routing & Reliability */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitBranch className="mr-2 h-5 w-5" />
                Event Routing Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routingRules.map((rule, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{rule.rule}</h4>
                      <Badge variant={rule.priority === 'Critical' ? 'destructive' : rule.priority === 'High' ? 'default' : 'secondary'}>
                        {rule.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rule.condition}</p>
                    <p className="text-sm text-blue-600">{rule.action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Reliability Mechanisms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reliabilityMechanisms.map((mechanism, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{mechanism.mechanism}</h4>
                      <Badge variant={mechanism.status === 'implemented' ? 'default' : 'secondary'}>
                        {mechanism.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{mechanism.description}</p>
                    <p className="text-xs text-gray-500">{mechanism.implementation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Processing Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {eventProcessingComponents.slice(0, 2).map((component) => {
            const Icon = component.icon;
            return (
              <Card key={component.title}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icon className="mr-2 h-5 w-5" />
                    {component.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {component.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{feature}</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure Component
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Events & Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Recent Event Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventTypes.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border-l-4 border-blue-500 pl-3">
                    <div>
                      <div className="font-medium text-sm">{event.type}</div>
                      <div className="text-xs text-gray-500">{event.source}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">{event.count}</div>
                      <div className="text-xs text-gray-500">{event.lastSeen}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Monitoring Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {monitoringMetrics.map((metric, index) => (
                  <div key={index} className="text-center p-3 border rounded-lg">
                    <h4 className="text-xs font-medium text-gray-500 mb-1">{metric.metric}</h4>
                    <div className="text-lg font-bold text-gray-900 mb-1">{metric.value}</div>
                    <div className="flex items-center justify-center space-x-1">
                      {metric.status === 'excellent' ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : metric.status === 'good' ? (
                        <CheckCircle className="h-3 w-3 text-blue-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                      )}
                      <span className="text-xs text-gray-600">{metric.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t text-center">
                <Button variant="outline" size="sm">
                  <Activity className="h-4 w-4 mr-1" />
                  View Detailed Logs
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}