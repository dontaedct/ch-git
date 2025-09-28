/**
 * @fileoverview Client Production Deployment - Client-scoped deployment for micro-app launch
 * PRD-compliant deployment workflows for rapid micro-app delivery
 * Focus: Essential deployment tools, professional appearance, minimal complexity
 */
import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Rocket, Server, Globe, CheckCircle, Clock, Building2 } from 'lucide-react';

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

interface ClientDeploymentProps {
  params: {
    clientId: string;
  };
}

export default async function ClientDeploymentPage({ params }: ClientDeploymentProps) {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';
  const { clientId } = params;

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  // Mock client data for context
  const clientData = {
    name: `Client ${clientId.slice(0, 8)}`,
    projectType: 'consultation-app',
    domain: `${clientId.toLowerCase()}-consultation.app`,
    stagingDomain: `staging-${clientId.toLowerCase()}.app`
  };

  // Essential deployment options (5 only per PRD)
  const deploymentOptions: DeploymentOption[] = [
    {
      id: 'staging-deploy',
      name: 'Staging Deployment',
      description: `Deploy ${clientData.name}'s app to staging environment`,
      icon: Server,
      deliveryImpact: 'Day 1 - Staging ready for testing',
      complexity: 'low'
    },
    {
      id: 'prod-deploy',
      name: 'Production Deployment',
      description: `Deploy ${clientData.name}'s app live to production`,
      icon: Rocket,
      deliveryImpact: 'Day 3 - Live deployment',
      complexity: 'medium'
    },
    {
      id: 'domain-setup',
      name: 'Domain Configuration',
      description: `Configure ${clientData.name}'s custom domain and SSL`,
      icon: Globe,
      deliveryImpact: 'Day 2 - Custom domain live',
      complexity: 'medium'
    },
    {
      id: 'health-monitoring',
      name: 'Health Monitoring',
      description: `Monitor ${clientData.name}'s application health and uptime`,
      icon: CheckCircle,
      deliveryImpact: 'Day 1 - Monitoring active',
      complexity: 'low'
    },
    {
      id: 'quick-rollback',
      name: 'Quick Rollback',
      description: `Instant rollback for ${clientData.name}'s deployment`,
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
      status: 'ready',
      deliveryImpact: 'Day 3 - Live deployment',
      complexity: 'medium'
    },
    {
      id: 'testing',
      name: 'Testing',
      environment: 'testing',
      status: 'ready',
      deliveryImpact: 'Day 2 - QA validation',
      complexity: 'medium'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => window.location.href = `/clients/${clientId}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Client Workspace
          </Button>
        </div>

        {/* Client Context Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">Production Deployment</h1>
                <span className="text-sm px-2 py-1 bg-red-100 text-red-700 rounded-full">
                  {clientData.name}
                </span>
              </div>
              <p className="text-muted-foreground">
                Deploy {clientData.name}'s micro-app to production
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
                Rapid deployment for {clientData.name}'s launch
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-5 h-5 text-green-600" />
                <span className="font-medium">Client-Scoped</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Deployment configured for {clientData.projectType}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Professional</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Production-ready for {clientData.name}
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
              <h3 className="text-lg font-semibold mb-4">
                {clientData.name}'s Deployment Environments
              </h3>

              <div className="space-y-4">
                {deployments.map((deployment) => (
                  <div
                    key={deployment.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{deployment.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {deployment.environment === 'staging' ? clientData.stagingDomain :
                           deployment.environment === 'production' ? clientData.domain :
                           `testing-${clientData.name.toLowerCase()}.app`}
                        </p>
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
                         deployment.status === 'ready' ? `Deploy for ${clientData.name}` : 'Manage'}
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
                Deploy {clientData.name} to Production
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                Test {clientData.name}'s Deployment
              </Button>
            </div>
          </div>

          {/* Deployment Status & Timeline */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {clientData.name}'s Deployment Status
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Staging</span>
                  <span className="flex items-center gap-1 text-sm text-blue-600">
                    <CheckCircle className="w-4 h-4" />
                    Ready for {clientData.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Testing</span>
                  <span className="flex items-center gap-1 text-sm text-blue-600">
                    <CheckCircle className="w-4 h-4" />
                    Ready for {clientData.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Production</span>
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    Not Deployed
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-semibold text-green-600">100%</span>
                </div>
              </div>
            </div>

            {/* Client Domain Information */}
            <div className="p-6 border rounded-lg bg-blue-50">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">
                {clientData.name}'s Domains
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Production</span>
                  <code className="text-sm font-mono text-blue-800 bg-blue-100 px-2 py-1 rounded">
                    {clientData.domain}
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Staging</span>
                  <code className="text-sm font-mono text-blue-800 bg-blue-100 px-2 py-1 rounded">
                    {clientData.stagingDomain}
                  </code>
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  SSL certificates will be automatically configured
                </div>
              </div>
            </div>

            {/* Client-Specific Delivery Timeline */}
            <div className="p-6 border rounded-lg bg-red-50">
              <h3 className="text-lg font-semibold mb-3 text-red-800">
                {clientData.name}'s Deployment Timeline
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm text-red-700">Day 1: {clientData.name}'s staging & testing setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-sm text-red-700">Day 2: Domain & SSL for {clientData.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-300 rounded-full"></div>
                  <span className="text-sm text-red-700">Day 3: {clientData.name}'s production deployment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-red-700">Days 4-7: Monitoring & optimization</span>
                </div>
              </div>
            </div>

            {/* Client Progress Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">Environments</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">0</div>
                <div className="text-sm text-muted-foreground">Deployments</div>
              </div>
            </div>

            {/* Next Steps for Client */}
            <div className="p-4 border rounded-lg bg-green-50">
              <h4 className="font-semibold text-green-800 mb-2">
                Next Steps for {clientData.name}
              </h4>
              <div className="space-y-2 text-sm text-green-700">
                <div>• Deploy to staging for {clientData.name}'s testing</div>
                <div>• Configure custom domain ({clientData.domain})</div>
                <div>• Set up SSL certificates</div>
                <div>• Launch {clientData.name} to production</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}