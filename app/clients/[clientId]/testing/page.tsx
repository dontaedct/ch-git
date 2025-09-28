/**
 * @fileoverview Client Testing & QA - Client-scoped testing for micro-app validation
 * PRD-compliant testing interface for rapid micro-app delivery
 * Focus: Essential testing tools, professional appearance, minimal complexity
 */
import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TestTube2, Play, Eye, CheckCircle, Clock, Building2 } from 'lucide-react';

// Simple interfaces for essential testing only
interface SimpleTestType {
  id: string;
  name: string;
  description: string;
  deliveryImpact: string;
  complexity: 'low' | 'medium';
}

interface TestOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  deliveryImpact: string;
  complexity: 'low' | 'medium';
}

interface ClientTestingProps {
  params: {
    clientId: string;
  };
}

export default async function ClientTestingPage({ params }: ClientTestingProps) {
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
    domain: 'client-consultation.app'
  };

  // Essential testing options (5 only per PRD)
  const testingOptions: TestOption[] = [
    {
      id: 'functional',
      name: 'Functional Testing',
      description: `Test ${clientData.name}'s core features and user flows`,
      icon: TestTube2,
      deliveryImpact: 'Day 1 - Core functionality verified',
      complexity: 'low'
    },
    {
      id: 'preview',
      name: 'Live Preview',
      description: `Real-time preview of ${clientData.name}'s app appearance`,
      icon: Eye,
      deliveryImpact: 'Day 1 - Instant client feedback',
      complexity: 'low'
    },
    {
      id: 'mobile',
      name: 'Mobile Testing',
      description: `Validate ${clientData.name}'s responsive design`,
      icon: TestTube2,
      deliveryImpact: 'Day 2 - Mobile compatibility confirmed',
      complexity: 'medium'
    },
    {
      id: 'performance',
      name: 'Speed Testing',
      description: `Load time and performance validation for ${clientData.name}`,
      icon: Clock,
      deliveryImpact: 'Day 2 - Performance optimized',
      complexity: 'medium'
    },
    {
      id: 'integration',
      name: 'Integration Testing',
      description: `Test ${clientData.name}'s email, forms, and third-party connections`,
      icon: CheckCircle,
      deliveryImpact: 'Day 3 - All integrations working',
      complexity: 'medium'
    }
  ];

  // Simple test scenarios (3 essential ones)
  const testScenarios: SimpleTestType[] = [
    {
      id: 'contact-form',
      name: 'Contact Form Test',
      description: `Submit ${clientData.name}'s contact form and verify email delivery`,
      deliveryImpact: 'Day 1 - Lead capture verified',
      complexity: 'low'
    },
    {
      id: 'booking-flow',
      name: 'Booking Flow Test',
      description: `Complete ${clientData.name}'s appointment booking process`,
      deliveryImpact: 'Day 2 - Booking system confirmed',
      complexity: 'medium'
    },
    {
      id: 'mobile-view',
      name: 'Mobile View Test',
      description: `Test ${clientData.name}'s app on different device sizes`,
      deliveryImpact: 'Day 1 - Mobile experience validated',
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
                <h1 className="text-3xl font-bold">Testing & QA</h1>
                <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  {clientData.name}
                </span>
              </div>
              <p className="text-muted-foreground">
                Quality assurance for {clientData.name}'s micro-app
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
                Rapid testing for {clientData.name}'s deployment
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <TestTube2 className="w-5 h-5 text-green-600" />
                <span className="font-medium">Client-Scoped</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Testing specifically for {clientData.projectType}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Professional</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Quality assurance for {clientData.name}
              </p>
            </div>
          </div>
        </div>

        {/* Essential Testing Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {testingOptions.map((option) => {
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

        {/* Simple Testing Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Scenarios */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                Quick Test Scenarios for {clientData.name}
              </h3>

              <div className="space-y-4">
                {testScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{scenario.name}</h4>
                        <p className="text-sm text-muted-foreground">{scenario.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        scenario.complexity === 'low'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {scenario.complexity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-medium">
                        {scenario.deliveryImpact}
                      </span>
                      <Button size="sm">
                        <Play className="w-3 h-3 mr-1" />
                        Test for {clientData.name}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testing Actions */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <Play className="w-4 h-4 mr-2" />
                Run All Tests for {clientData.name}
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <Eye className="w-4 h-4 mr-2" />
                Launch {clientData.name}'s Preview
              </Button>
            </div>
          </div>

          {/* Live Preview & Status */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {clientData.name}'s Live Preview
              </h3>

              {/* Sample preview window */}
              <div className="border-2 border-dashed rounded-lg p-4 bg-gray-50 min-h-[200px]">
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 font-medium">{clientData.name}'s App Preview</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {clientData.domain}
                  </p>
                  <Button className="mt-4" size="sm">
                    Launch {clientData.name}'s Preview
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                * Preview shows {clientData.name}'s app as visitors will see it
              </p>
            </div>

            {/* Client-Specific Test Status */}
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {clientData.name}'s Test Status
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Health</span>
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Ready for {clientData.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tests Passed</span>
                  <span className="font-semibold text-green-600">0/8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Test Run</span>
                  <span className="font-semibold">Never</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ready for Launch</span>
                  <span className="flex items-center gap-1 text-sm text-yellow-600">
                    <Clock className="w-4 h-4" />
                    Testing Required
                  </span>
                </div>
              </div>
            </div>

            {/* Client-Specific Testing Timeline */}
            <div className="p-6 border rounded-lg bg-green-50">
              <h3 className="text-lg font-semibold mb-3 text-green-800">
                {clientData.name}'s Testing Timeline
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 1: {clientData.name}'s functional & preview testing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 2: Mobile & performance testing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 3: {clientData.name}'s integration testing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-green-700">Days 4-7: Final validation & {clientData.name} launch</span>
                </div>
              </div>
            </div>

            {/* Client Progress Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">Test Scenarios</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-muted-foreground">Tests Completed</div>
              </div>
            </div>

            {/* Next Steps for Client */}
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-semibold text-blue-800 mb-2">
                Next Steps for {clientData.name}
              </h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div>• Test {clientData.name}'s contact form functionality</div>
                <div>• Validate mobile responsiveness</div>
                <div>• Check performance and load times</div>
                <div>• Verify all integrations work properly</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}