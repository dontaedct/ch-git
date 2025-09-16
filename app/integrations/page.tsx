import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { Settings, Workflow, ExternalLink, Webhook, Database, Activity, ArrowUpRight, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function IntegrationsPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  const integrationStats = {
    activeConnections: 12,
    runningWorkflows: 8,
    webhooksProcessed: 456,
    automationCoverage: 72
  };

  const integrationModules = [
    {
      title: 'Integration Architecture',
      description: 'Design and manage integration patterns, service connectors, and data flow',
      href: '/integrations/architecture',
      icon: Database,
      status: 'active',
      connections: 5
    },
    {
      title: 'Workflow Engine',
      description: 'Create and orchestrate automated workflows with business logic',
      href: '/integrations/workflow-engine',
      icon: Workflow,
      status: 'active',
      workflows: 8
    },
    {
      title: 'External Services',
      description: 'Connect and manage external APIs, authentication, and service integrations',
      href: '/integrations/external-services',
      icon: ExternalLink,
      status: 'active',
      services: 12
    },
    {
      title: 'Webhooks',
      description: 'Handle incoming webhooks, event processing, and real-time notifications',
      href: '/integrations/webhooks',
      icon: Webhook,
      status: 'active',
      events: 456
    }
  ];

  const activeIntegrations = [
    { name: 'Stripe Payment Processing', status: 'healthy', lastSync: '2 min ago' },
    { name: 'SendGrid Email Service', status: 'healthy', lastSync: '5 min ago' },
    { name: 'AWS S3 Storage', status: 'warning', lastSync: '15 min ago' },
    { name: 'Slack Notifications', status: 'healthy', lastSync: '1 min ago' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Integration Dashboard</h1>
          <p className="text-gray-600">
            Manage workflows, external services, and business automation
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrationStats.activeConnections}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running Workflows</CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrationStats.runningWorkflows}</div>
              <p className="text-xs text-muted-foreground">
                +3 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Webhooks Processed</CardTitle>
              <Webhook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrationStats.webhooksProcessed}</div>
              <p className="text-xs text-muted-foreground">
                Today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Automation Coverage</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrationStats.automationCoverage}%</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Integration Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {integrationModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      </div>
                    </div>
                    <Badge variant={module.status === 'active' ? 'default' : 'secondary'}>
                      {module.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {module.connections && (
                        <span>{module.connections} connections</span>
                      )}
                      {module.workflows && (
                        <span>{module.workflows} workflows</span>
                      )}
                      {module.services && (
                        <span>{module.services} services</span>
                      )}
                      {module.events && (
                        <span>{module.events} events</span>
                      )}
                    </div>
                    <Link
                      href={module.href}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      Configure
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Active Integrations Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Active Integrations Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeIntegrations.map((integration, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {integration.status === 'healthy' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : integration.status === 'warning' ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="font-medium">{integration.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Last sync: {integration.lastSync}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}