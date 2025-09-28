/**
 * @fileoverview Production Deployment - Step 10 of Client App Creation Guide
 * PRD-compliant deployment workflows for rapid micro-app delivery
 * Focus: Essential deployment tools, professional appearance, minimal complexity
 */
import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Rocket, Server, Globe, CheckCircle, Clock } from 'lucide-react';

// Simple interfaces for essential deployment only
interface SimpleDeployment {
  id: string;
  name: string;
  environment: 'staging' | 'production' | 'testing';
  status: 'ready' | 'deploying' | 'live';
  deliveryImpact: string;
  complexity: 'low' | 'medium';
}

interface DeploymentOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  deliveryImpact: string;
  complexity: 'low' | 'medium';
}

export default async function ProductionDeploymentPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  // Essential deployment options (5 only per PRD)
  const deploymentOptions: DeploymentOption[] = [
    {
      id: 'staging-deploy',
      name: 'Staging Deployment',
      description: 'Deploy to staging environment for testing',
      icon: Server,
      deliveryImpact: 'Day 1 - Staging ready for testing',
      complexity: 'low'
    },
    {
      id: 'prod-deploy',
      name: 'Production Deployment',
      description: 'Deploy live to production environment',
      icon: Rocket,
      deliveryImpact: 'Day 3 - Live deployment',
      complexity: 'medium'
    },
    {
      id: 'domain-setup',
      name: 'Domain Configuration',
      description: 'Configure custom domain and SSL',
      icon: Globe,
      deliveryImpact: 'Day 2 - Custom domain live',
      complexity: 'medium'
    },
    {
      id: 'health-monitoring',
      name: 'Health Monitoring',
      description: 'Monitor application health and uptime',
      icon: CheckCircle,
      deliveryImpact: 'Day 1 - Monitoring active',
      complexity: 'low'
    },
    {
      id: 'quick-rollback',
      name: 'Quick Rollback',
      description: 'Instant rollback to previous version',
      icon: Clock,
      deliveryImpact: 'Day 1 - Safety net ready',
      complexity: 'low'
    }
  ];

  // Simple deployment environments (3 essential ones)
  const deployments: SimpleDeployment[] = [
    {
      id: 'staging',
      name: 'Staging',
      environment: 'staging',
      status: 'ready',
      deliveryImpact: 'Day 1 - Testing environment',
      complexity: 'low'
    },
    {
      id: 'production',
      name: 'Production',
      environment: 'production',
      status: 'deploying',
      deliveryImpact: 'Day 3 - Live deployment',
      complexity: 'medium'
    },
    {
      id: 'testing',
      name: 'Testing',
      environment: 'testing',
      status: 'live',
      deliveryImpact: 'Day 2 - QA validation',
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
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Production Deployment</h1>
              <p className="text-muted-foreground">
                Essential deployment workflows for rapid micro-app delivery
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
                Rapid deployment for quick market launch
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-5 h-5 text-green-600" />
                <span className="font-medium">Essential Only</span>
              </div>
              <p className="text-sm text-muted-foreground">
                5 core deployment tools for minimal complexity
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Professional</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Production-ready deployment for $2k-5k projects
              </p>
            </div>
          </div>
        </div>

        {/* Essential Deployment Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {deploymentOptions.map((option) => {
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

        {/* Simple Deployment Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deployment Environments */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Deployment Environments</h3>

              <div className="space-y-4">
                {deployments.map((deployment) => (
                  <div
                    key={deployment.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{deployment.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{deployment.environment} environment</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          deployment.status === 'live' ? 'bg-green-500' :
                          deployment.status === 'ready' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          deployment.complexity === 'low'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {deployment.complexity}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-medium">
                        {deployment.deliveryImpact}
                      </span>
                      <Button size="sm">
                        {deployment.status === 'deploying' ? 'Deploying...' :
                         deployment.status === 'ready' ? 'Deploy' : 'Manage'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deployment Actions */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <Rocket className="w-4 h-4 mr-2" />
                Deploy to Production
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                Test Deployment
              </Button>
            </div>
          </div>

          {/* Deployment Status & Timeline */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Deployment Status</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Staging</span>
                  <span className="flex items-center gap-1 text-sm text-blue-600">
                    <CheckCircle className="w-4 h-4" />
                    Ready
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Testing</span>
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Live
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Production</span>
                  <span className="flex items-center gap-1 text-sm text-yellow-600">
                    <Clock className="w-4 h-4" />
                    Deploying
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-semibold text-green-600">98%</span>
                </div>
              </div>
            </div>

            {/* Deployment Progress */}
            <div className="p-6 border rounded-lg bg-blue-50">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">
                Current Deployment
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Production Deploy</span>
                  <span className="text-sm font-semibold text-blue-700">75%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="text-xs text-blue-600">
                  Step 3 of 4: Final validation and SSL setup
                </div>
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="p-6 border rounded-lg bg-green-50">
              <h3 className="text-lg font-semibold mb-3 text-green-800">
                Deployment Timeline
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 1: Staging & testing setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 2: Domain & SSL configuration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 3: Production deployment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-green-700">Days 4-7: Monitoring & optimization</span>
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
                <div className="text-sm text-muted-foreground">Deploy Tools</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}