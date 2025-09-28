/**
 * @fileoverview Admin Dashboard - Agency-level management interface
 * Centralized management for agency operations and client oversight
 */
import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Settings,
  Users,
  BarChart3,
  Package,
  Database,
  Shield,
  Zap,
  Clock,
  Building,
  Globe
} from 'lucide-react';

export default async function AdminDashboard() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  const agencyTools = [
    {
      id: 'client-management',
      title: 'Client Management',
      description: 'Manage all clients and project oversight',
      href: '/admin/clients',
      icon: Users,
      count: 12,
      status: 'active',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 'agency-analytics',
      title: 'Agency Analytics',
      description: 'Cross-client performance and business metrics',
      href: '/admin/analytics',
      icon: BarChart3,
      count: 24,
      status: 'active',
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 'template-management',
      title: 'Template Library',
      description: 'Manage reusable templates across projects',
      href: '/admin/templates',
      icon: Package,
      count: 8,
      status: 'active',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure agency-wide settings and preferences',
      href: '/admin/settings',
      icon: Settings,
      count: null,
      status: 'active',
      color: 'text-orange-600 bg-orange-100'
    },
    {
      id: 'data-management',
      title: 'Data Management',
      description: 'Database administration and data governance',
      href: '/admin/data',
      icon: Database,
      count: null,
      status: 'active',
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      id: 'security-compliance',
      title: 'Security & Compliance',
      description: 'Security monitoring and compliance management',
      href: '/admin/security',
      icon: Shield,
      count: 3,
      status: 'warning',
      color: 'text-red-600 bg-red-100'
    }
  ];

  const quickStats = [
    {
      label: 'Active Clients',
      value: '12',
      change: '+2 this week',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Projects Delivered',
      value: '48',
      change: '+7 this month',
      icon: Package,
      color: 'text-green-600'
    },
    {
      label: 'Revenue (MTD)',
      value: '$127k',
      change: '+18% vs last month',
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      label: 'Avg Delivery Time',
      value: '4.2 days',
      change: '-0.8 days improved',
      icon: Clock,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => window.location.href = '/'}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Building className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Agency Administration</h1>
              <p className="text-muted-foreground">
                Centralized management for agency operations and client oversight
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {quickStats.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </span>
                      <IconComponent className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.change}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Agency Tools */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Agency Management Tools</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agencyTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Card key={tool.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${tool.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        {tool.count && (
                          <Badge variant="outline" className="text-xs">
                            {tool.count}
                          </Badge>
                        )}
                        <div className={`w-2 h-2 rounded-full ${
                          tool.status === 'active' ? 'bg-green-500' :
                          tool.status === 'warning' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}></div>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = tool.href}
                    >
                      Access Tool
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Platform Health</span>
                  <Badge className="bg-green-100 text-green-700">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Deployments</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Load</span>
                  <span className="font-medium">23%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="font-medium text-green-600">99.9%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>New client onboarded: TechStart Inc.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Project delivered: Acme Corp website</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Template updated: Consultation framework</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>System maintenance scheduled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}