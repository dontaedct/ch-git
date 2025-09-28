/**
 * @fileoverview Client Handover - Client-scoped handover for micro-app completion
 * PRD-compliant handover interface for rapid micro-app delivery
 * Focus: Essential handover tools, professional appearance, minimal complexity
 */
import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, FileText, Send, Key, CheckCircle, Clock, Building2 } from 'lucide-react';

interface HandoverOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  deliveryImpact: string;
  complexity: 'low' | 'medium';
}

interface ClientHandoverProps {
  params: {
    clientId: string;
  };
}

export default async function ClientHandoverPage({ params }: ClientHandoverProps) {
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
    handoverStatus: 'ready',
    deliveryDate: '2025-01-27',
    domain: `${clientId.toLowerCase()}-consultation.app`
  };

  // Essential handover options (5 only per PRD)
  const handoverOptions: HandoverOption[] = [
    {
      id: 'documentation',
      name: 'Documentation Package',
      description: `Complete user guide and setup instructions for ${clientData.name}`,
      icon: FileText,
      deliveryImpact: 'Day 1 - Client can manage app',
      complexity: 'low'
    },
    {
      id: 'credentials',
      name: 'Access Credentials',
      description: `Secure delivery of login and admin access for ${clientData.name}`,
      icon: Key,
      deliveryImpact: 'Day 1 - Client has full access',
      complexity: 'medium'
    },
    {
      id: 'delivery',
      name: 'Project Delivery',
      description: `Complete ${clientData.name} project package with all files`,
      icon: Package,
      deliveryImpact: 'Day 7 - Project fully delivered',
      complexity: 'medium'
    },
    {
      id: 'training',
      name: 'Client Training',
      description: `Video walkthrough and support materials for ${clientData.name}`,
      icon: CheckCircle,
      deliveryImpact: 'Day 7 - Client fully trained',
      complexity: 'medium'
    },
    {
      id: 'communication',
      name: 'Handover Communication',
      description: `Professional handover communication for ${clientData.name}`,
      icon: Send,
      deliveryImpact: 'Day 1 - Professional handover',
      complexity: 'low'
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
                <h1 className="text-3xl font-bold">Client Handover</h1>
                <span className="text-sm px-2 py-1 bg-pink-100 text-pink-700 rounded-full">
                  {clientData.name}
                </span>
              </div>
              <p className="text-muted-foreground">
                Complete handover package for {clientData.name}'s project
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
                Complete handover for {clientData.name}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-green-600" />
                <span className="font-medium">Client-Scoped</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Handover package for {clientData.projectType}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Professional</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete package for {clientData.name}
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
          {/* Client Handover Package */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {clientData.name}'s Handover Package
              </h3>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{clientData.projectType}</h4>
                      <p className="text-sm text-muted-foreground">{clientData.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        clientData.handoverStatus === 'ready' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        Ready
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Documentation complete</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Access credentials prepared</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Training materials ready</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary font-medium">
                      Target delivery: {clientData.deliveryDate}
                    </span>
                    <Button size="sm">
                      Deliver to {clientData.name}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Handover Actions */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <Package className="w-4 h-4 mr-2" />
                Deliver to {clientData.name}
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <FileText className="w-4 h-4 mr-2" />
                Generate Final Documentation
              </Button>
            </div>
          </div>

          {/* Handover Status & Timeline */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {clientData.name}'s Handover Status
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Documentation</span>
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Complete
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Credentials</span>
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Prepared
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Training Materials</span>
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Ready
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Final Delivery</span>
                  <span className="flex items-center gap-1 text-sm text-blue-600">
                    <Clock className="w-4 h-4" />
                    Pending
                  </span>
                </div>
              </div>
            </div>

            {/* Client Project Details */}
            <div className="p-6 border rounded-lg bg-pink-50">
              <h3 className="text-lg font-semibold mb-3 text-pink-800">
                {clientData.name}'s Project Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-pink-700">Project Type</span>
                  <span className="text-sm font-medium text-pink-800">{clientData.projectType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-pink-700">Domain</span>
                  <code className="text-sm font-mono text-pink-800 bg-pink-100 px-2 py-1 rounded">
                    {clientData.domain}
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-pink-700">Delivery Date</span>
                  <span className="text-sm font-medium text-pink-800">{clientData.deliveryDate}</span>
                </div>
                <div className="text-xs text-pink-600 mt-2">
                  All deliverables prepared for handover
                </div>
              </div>
            </div>

            {/* Client-Specific Timeline */}
            <div className="p-6 border rounded-lg bg-green-50">
              <h3 className="text-lg font-semibold mb-3 text-green-800">
                {clientData.name}'s Handover Timeline
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 1: {clientData.name}'s documentation & credentials</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 3: Client training materials</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 7: Complete {clientData.name} project delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-green-700">Post-delivery: Support & maintenance</span>
                </div>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Package Ready</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-pink-600">1</div>
                <div className="text-sm text-muted-foreground">Ready to Deliver</div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-semibold text-blue-800 mb-2">
                Final Steps for {clientData.name}
              </h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div>• Send handover email to {clientData.name}</div>
                <div>• Deliver complete project package</div>
                <div>• Schedule training session</div>
                <div>• Transition to support & maintenance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}