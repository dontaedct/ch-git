/**
 * @fileoverview Client Handover - Step 12 of Client App Creation Guide
 * PRD-compliant handover interface for rapid micro-app delivery
 * Focus: Essential handover tools, professional appearance, minimal complexity
 */
import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, FileText, Send, Key, CheckCircle, Clock } from 'lucide-react';

// Simple interfaces for essential handover only
interface SimpleHandoverPackage {
  id: string;
  clientName: string;
  projectName: string;
  status: 'preparing' | 'ready' | 'delivered';
  deliveryImpact: string;
  complexity: 'low' | 'medium';
}

interface HandoverOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  deliveryImpact: string;
  complexity: 'low' | 'medium';
}

export default async function ClientHandoverPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  // Essential handover options (5 only per PRD)
  const handoverOptions: HandoverOption[] = [
    {
      id: 'documentation',
      name: 'Documentation Package',
      description: 'Complete user guide and setup instructions',
      icon: FileText,
      deliveryImpact: 'Day 1 - Client can manage app',
      complexity: 'low'
    },
    {
      id: 'credentials',
      name: 'Access Credentials',
      description: 'Secure delivery of login and admin access',
      icon: Key,
      deliveryImpact: 'Day 1 - Client has full access',
      complexity: 'medium'
    },
    {
      id: 'delivery',
      name: 'Project Delivery',
      description: 'Complete project package with all files',
      icon: Package,
      deliveryImpact: 'Day 7 - Project fully delivered',
      complexity: 'medium'
    },
    {
      id: 'training',
      name: 'Client Training',
      description: 'Video walkthrough and support materials',
      icon: CheckCircle,
      deliveryImpact: 'Day 7 - Client fully trained',
      complexity: 'medium'
    },
    {
      id: 'communication',
      name: 'Handover Communication',
      description: 'Professional client communication templates',
      icon: Send,
      deliveryImpact: 'Day 1 - Professional handover',
      complexity: 'low'
    }
  ];

  // Simple handover packages (3 essential ones)
  const packages: SimpleHandoverPackage[] = [
    {
      id: 'ready-package',
      clientName: 'Acme Corp',
      projectName: 'Business Website',
      status: 'ready',
      deliveryImpact: 'Day 7 - Ready for delivery',
      complexity: 'low'
    },
    {
      id: 'preparing-package',
      clientName: 'TechStart',
      projectName: 'Landing Page',
      status: 'preparing',
      deliveryImpact: 'Day 5 - Documentation in progress',
      complexity: 'low'
    },
    {
      id: 'delivered-package',
      clientName: 'Green Solutions',
      projectName: 'Service Portal',
      status: 'delivered',
      deliveryImpact: 'Completed - Client onboarded',
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
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Client Handover</h1>
              <p className="text-muted-foreground">
                Essential handover tools for rapid micro-app delivery
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
                Rapid handover for quick client onboarding
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-green-600" />
                <span className="font-medium">Essential Only</span>
              </div>
              <p className="text-sm text-muted-foreground">
                5 core handover tools for minimal complexity
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Professional</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete handover package for $2k-5k projects
              </p>
            </div>
          </div>
        </div>

        {/* Essential Handover Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {handoverOptions.map((option) => {
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

        {/* Simple Handover Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Handover Packages */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Active Handover Packages</h3>

              <div className="space-y-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{pkg.projectName}</h4>
                        <p className="text-sm text-muted-foreground">{pkg.clientName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          pkg.status === 'delivered' ? 'bg-green-500' :
                          pkg.status === 'ready' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          pkg.complexity === 'low'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {pkg.complexity}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-medium">
                        {pkg.deliveryImpact}
                      </span>
                      <Button size="sm">
                        {pkg.status === 'delivered' ? 'Completed' :
                         pkg.status === 'ready' ? 'Deliver' : 'Preparing...'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Handover Actions */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <Package className="w-4 h-4 mr-2" />
                Create Handover Package
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                Generate Documentation
              </Button>
            </div>
          </div>

          {/* Handover Status & Timeline */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Handover Status</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Packages</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ready for Delivery</span>
                  <span className="font-semibold text-blue-600">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Delivered This Week</span>
                  <span className="font-semibold text-green-600">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Client Satisfaction</span>
                  <span className="font-semibold text-purple-600">98%</span>
                </div>
              </div>
            </div>

            {/* Handover Progress */}
            <div className="p-6 border rounded-lg bg-blue-50">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">
                Current Handover
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">TechStart - Landing Page</span>
                  <span className="text-sm font-semibold text-blue-700">75%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="text-xs text-blue-600">
                  Documentation complete, preparing delivery package
                </div>
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="p-6 border rounded-lg bg-green-50">
              <h3 className="text-lg font-semibold mb-3 text-green-800">
                Handover Timeline
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 1: Documentation & credentials</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 3: Client training materials</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 7: Complete project delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-green-700">Post-delivery: Support & maintenance</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">Active Packages</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-sm text-muted-foreground">Handover Tools</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}