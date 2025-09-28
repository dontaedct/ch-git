/**
 * @fileoverview Monitoring & Management - Step 11 of Client App Creation Guide
 * PRD-compliant monitoring dashboard for rapid micro-app delivery
 * Focus: Essential monitoring tools, professional appearance, minimal complexity
 */
import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity, Server, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

// Simple interfaces for essential monitoring only
interface SimpleAlert {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  deliveryImpact: string;
  complexity: 'low' | 'medium';
}

interface MonitoringOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  deliveryImpact: string;
  complexity: 'low' | 'medium';
}

export default async function MonitoringManagementPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  // Essential monitoring options (5 only per PRD)
  const monitoringOptions: MonitoringOption[] = [
    {
      id: 'uptime-monitor',
      name: 'Uptime Monitoring',
      description: 'Monitor application availability and downtime',
      icon: Activity,
      deliveryImpact: 'Day 1 - Uptime tracking active',
      complexity: 'low'
    },
    {
      id: 'health-checks',
      name: 'Health Checks',
      description: 'Automated system health validation',
      icon: CheckCircle,
      deliveryImpact: 'Day 1 - Health monitoring ready',
      complexity: 'low'
    },
    {
      id: 'error-tracking',
      name: 'Error Tracking',
      description: 'Track and alert on application errors',
      icon: AlertTriangle,
      deliveryImpact: 'Day 2 - Error alerts active',
      complexity: 'medium'
    },
    {
      id: 'performance-alerts',
      name: 'Performance Alerts',
      description: 'Monitor response times and performance',
      icon: Clock,
      deliveryImpact: 'Day 2 - Performance monitoring',
      complexity: 'medium'
    },
    {
      id: 'system-status',
      name: 'System Status',
      description: 'Overall system status dashboard',
      icon: Server,
      deliveryImpact: 'Day 1 - Status page ready',
      complexity: 'low'
    }
  ];

  // Simple monitoring alerts (3 essential ones)
  const alerts: SimpleAlert[] = [
    {
      id: 'uptime',
      name: 'Application Uptime',
      status: 'healthy',
      deliveryImpact: 'Day 1 - 99.9% uptime target',
      complexity: 'low'
    },
    {
      id: 'response-time',
      name: 'Response Time',
      status: 'healthy',
      deliveryImpact: 'Day 1 - <200ms response time',
      complexity: 'low'
    },
    {
      id: 'error-rate',
      name: 'Error Rate',
      status: 'warning',
      deliveryImpact: 'Day 2 - Error rate monitoring',
      complexity: 'medium'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => window.location.href = '/agency-toolkit'}>
            <ArrowLeft className="w-4 h-4" />
            Back to Agency Toolkit
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Monitoring & Management</h1>
              <p className="text-muted-foreground">
                Essential monitoring tools for rapid micro-app delivery
              </p>
            </div>
          </div>

          {/* PRD Compliance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium">≤7 Day Delivery</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Rapid monitoring setup for quick deployment
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span className="font-medium">Essential Only</span>
              </div>
              <p className="text-sm text-muted-foreground">
                5 core monitoring tools for minimal complexity
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Professional</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Reliable monitoring for $2k-5k projects
              </p>
            </div>
          </div>
        </div>

        {/* Essential Monitoring Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {monitoringOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                className="p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{option.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        option.complexity === 'low'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {option.complexity} complexity
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {option.description}
                </p>
                <div className="text-xs text-primary font-medium">
                  {option.deliveryImpact}
                </div>
              </div>
            );
          })}
        </div>

        {/* Simple Monitoring Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Alerts */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">System Alerts</h3>

              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{alert.name}</h4>
                        <p className="text-sm text-muted-foreground">Monitoring active</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          alert.status === 'healthy' ? 'bg-green-500' :
                          alert.status === 'warning' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          alert.complexity === 'low'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {alert.complexity}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-medium">
                        {alert.deliveryImpact}
                      </span>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monitoring Actions */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <Activity className="w-4 h-4 mr-2" />
                Setup Monitoring
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                View Full Dashboard
              </Button>
            </div>
          </div>

          {/* Status Overview & Timeline */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Application Status</span>
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="font-semibold text-green-600">99.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Time</span>
                  <span className="font-semibold text-blue-600">145ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Alerts</span>
                  <span className="font-semibold text-yellow-600">1</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="p-6 border rounded-lg bg-green-50">
              <h3 className="text-lg font-semibold mb-3 text-green-800">
                Performance Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Avg Response Time</span>
                  <span className="font-semibold text-green-700">145ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Error Rate</span>
                  <span className="font-semibold text-green-700">0.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Requests/Hour</span>
                  <span className="font-semibold text-green-700">1,250</span>
                </div>
              </div>
            </div>

            {/* Monitoring Timeline */}
            <div className="p-6 border rounded-lg bg-blue-50">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">
                Monitoring Timeline
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-blue-700">Day 1: Basic monitoring setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-blue-700">Day 2: Error tracking & alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span className="text-sm text-blue-700">Day 3: Performance monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-blue-700">Days 4-7: Full monitoring suite</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">Active Monitors</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-sm text-muted-foreground">Monitor Types</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
