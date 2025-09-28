/**
 * @fileoverview Environment Configuration - Step 9 of Client App Creation Guide
 * PRD-compliant environment management for rapid micro-app delivery
 * Focus: Essential environment setup, professional appearance, minimal complexity
 */
import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Server, Settings, Globe, CheckCircle, Clock } from 'lucide-react';

// Simple interfaces for essential environment management only
interface SimpleEnvironment {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production';
  status: 'healthy' | 'setting-up' | 'ready';
  deliveryImpact: string;
  complexity: 'low' | 'medium';
}

interface EnvironmentOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  deliveryImpact: string;
  complexity: 'low' | 'medium';
}

export default async function EnvironmentConfigurationPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  // Essential environment options (5 only per PRD)
  const environmentOptions: EnvironmentOption[] = [
    {
      id: 'dev-setup',
      name: 'Development Setup',
      description: 'Local development environment configuration',
      icon: Server,
      deliveryImpact: 'Day 1 - Dev environment ready',
      complexity: 'low'
    },
    {
      id: 'staging-config',
      name: 'Staging Configuration',
      description: 'Pre-production environment setup',
      icon: Settings,
      deliveryImpact: 'Day 2 - Testing environment live',
      complexity: 'medium'
    },
    {
      id: 'prod-deploy',
      name: 'Production Deployment',
      description: 'Live environment configuration',
      icon: Globe,
      deliveryImpact: 'Day 3 - Production ready',
      complexity: 'medium'
    },
    {
      id: 'env-variables',
      name: 'Environment Variables',
      description: 'Secure configuration management',
      icon: Settings,
      deliveryImpact: 'Day 1 - Config secured',
      complexity: 'low'
    },
    {
      id: 'health-checks',
      name: 'Health Monitoring',
      description: 'Environment status validation',
      icon: CheckCircle,
      deliveryImpact: 'Day 2 - Monitoring active',
      complexity: 'medium'
    }
  ];

  // Simple environment setups (3 essential ones)
  const environments: SimpleEnvironment[] = [
    {
      id: 'development',
      name: 'Development',
      type: 'development',
      status: 'ready',
      deliveryImpact: 'Day 1 - Development ready',
      complexity: 'low'
    },
    {
      id: 'staging',
      name: 'Staging',
      type: 'staging',
      status: 'healthy',
      deliveryImpact: 'Day 2 - Pre-production testing',
      complexity: 'medium'
    },
    {
      id: 'production',
      name: 'Production',
      type: 'production',
      status: 'setting-up',
      deliveryImpact: 'Day 3 - Live deployment',
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
              <Server className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Environment Configuration</h1>
              <p className="text-muted-foreground">
                Essential environment setup for rapid micro-app delivery
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
                Rapid environment setup for quick deployment
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-5 h-5 text-green-600" />
                <span className="font-medium">Essential Only</span>
              </div>
              <p className="text-sm text-muted-foreground">
                5 core environment tools for minimal complexity
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Professional</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Secure environment setup for $2k-5k projects
              </p>
            </div>
          </div>
        </div>

        {/* Essential Environment Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {environmentOptions.map((option) => {
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

        {/* Simple Environment Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Environment Setup */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Environment Setup</h3>

              <div className="space-y-4">
                {environments.map((env) => (
                  <div
                    key={env.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{env.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{env.type} environment</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          env.status === 'healthy' ? 'bg-green-500' :
                          env.status === 'ready' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          env.complexity === 'low'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {env.complexity}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-medium">
                        {env.deliveryImpact}
                      </span>
                      <Button size="sm">
                        {env.status === 'setting-up' ? 'Configure' : 'Manage'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Environment Actions */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <Server className="w-4 h-4 mr-2" />
                Setup All Environments
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                Import Configuration
              </Button>
            </div>
          </div>

          {/* Configuration Status & Timeline */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Environment Status</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Development</span>
                  <span className="flex items-center gap-1 text-sm text-blue-600">
                    <CheckCircle className="w-4 h-4" />
                    Ready
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Staging</span>
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Production</span>
                  <span className="flex items-center gap-1 text-sm text-yellow-600">
                    <Clock className="w-4 h-4" />
                    Setting Up
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Config Validated</span>
                  <span className="font-semibold text-green-600">100%</span>
                </div>
              </div>
            </div>

            {/* Configuration Preview */}
            <div className="p-6 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-3">Essential Config</h3>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span>NODE_ENV</span>
                  <span className="text-green-600">production</span>
                </div>
                <div className="flex justify-between">
                  <span>DATABASE_URL</span>
                  <span className="text-blue-600">***configured***</span>
                </div>
                <div className="flex justify-between">
                  <span>API_KEYS</span>
                  <span className="text-purple-600">***secured***</span>
                </div>
              </div>
              <Button className="w-full mt-4" size="sm">
                Configure Variables
              </Button>
            </div>

            {/* Delivery Timeline */}
            <div className="p-6 border rounded-lg bg-green-50">
              <h3 className="text-lg font-semibold mb-3 text-green-800">
                Setup Timeline
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 1: Development & config setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 2: Staging & monitoring setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 3: Production deployment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-green-700">Days 4-7: Optimization & monitoring</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">Environments</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-sm text-muted-foreground">Config Tools</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}