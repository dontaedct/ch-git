/**
 * @fileoverview Workflow Automation - Step 7 of Client App Creation Guide
 * PRD-compliant automation for rapid micro-app delivery
 * Focus: Essential workflows, professional appearance, minimal complexity
 */
import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Workflow, Mail, Zap, Clock, CheckCircle } from 'lucide-react';

// Simple interfaces for essential automation only
interface SimpleWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  deliveryImpact: string;
  complexity: 'low' | 'medium';
}

interface WorkflowOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  deliveryImpact: string;
  complexity: 'low' | 'medium';
}

export default async function OrchestrationPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  // Essential automation options (5 only per PRD)
  const workflowOptions: WorkflowOption[] = [
    {
      id: 'email',
      name: 'Email Automation',
      description: 'Welcome emails, follow-ups, and notifications',
      icon: Mail,
      deliveryImpact: 'Day 1 - Email sequences ready',
      complexity: 'low'
    },
    {
      id: 'notifications',
      name: 'Smart Notifications',
      description: 'Form submissions and user activity alerts',
      icon: Zap,
      deliveryImpact: 'Day 1 - Instant notifications',
      complexity: 'low'
    },
    {
      id: 'scheduling',
      name: 'Task Scheduling',
      description: 'Automated reminders and follow-up tasks',
      icon: Clock,
      deliveryImpact: 'Day 2 - Automated scheduling',
      complexity: 'medium'
    },
    {
      id: 'integration',
      name: 'Data Sync',
      description: 'Sync data between forms and external services',
      icon: Workflow,
      deliveryImpact: 'Day 2 - Data integration live',
      complexity: 'medium'
    },
    {
      id: 'approval',
      name: 'Approval Workflows',
      description: 'Multi-step approval processes for submissions',
      icon: CheckCircle,
      deliveryImpact: 'Day 3 - Approval system ready',
      complexity: 'medium'
    }
  ];

  // Simple workflow templates (3 essential ones)
  const workflows: SimpleWorkflow[] = [
    {
      id: 'welcome-email',
      name: 'Welcome Email',
      description: 'Send welcome email when someone submits contact form',
      trigger: 'Form Submission',
      deliveryImpact: 'Day 1 - Instant engagement',
      complexity: 'low'
    },
    {
      id: 'lead-notification',
      name: 'Lead Alert',
      description: 'Instant notification when new lead is captured',
      trigger: 'Form Submission',
      deliveryImpact: 'Day 1 - Never miss a lead',
      complexity: 'low'
    },
    {
      id: 'appointment-reminder',
      name: 'Appointment Reminder',
      description: 'Automated reminder 24 hours before appointment',
      trigger: 'Schedule',
      deliveryImpact: 'Day 2 - Reduce no-shows',
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
              <Workflow className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Workflow Automation</h1>
              <p className="text-muted-foreground">
                Essential automation for rapid micro-app delivery
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
                Rapid automation setup for quick deployment
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="font-medium">Essential Only</span>
              </div>
              <p className="text-sm text-muted-foreground">
                5 core automation types for minimal complexity
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Professional</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Reliable automation for $2k-5k projects
              </p>
            </div>
          </div>
        </div>

        {/* Essential Workflow Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {workflowOptions.map((option) => {
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

        {/* Simple Workflow Builder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Workflow Templates */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Ready-to-Use Workflows</h3>

              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{workflow.name}</h4>
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        workflow.complexity === 'low'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {workflow.complexity}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground mb-2">Triggered by:</div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {workflow.trigger}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-medium">
                        {workflow.deliveryImpact}
                      </span>
                      <Button size="sm">Activate</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Actions */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <Workflow className="w-4 h-4 mr-2" />
                Create Custom Workflow
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                Import Workflow Template
              </Button>
            </div>
          </div>

          {/* Status & Timeline */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Workflow Status</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Status</span>
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Workflows</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Today's Executions</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-semibold text-green-600">98%</span>
                </div>
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="p-6 border rounded-lg bg-green-50">
              <h3 className="text-lg font-semibold mb-3 text-green-800">
                Delivery Timeline
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 1: Email & notification setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 2: Scheduling & integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 3: Advanced workflows</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-green-700">Days 4-7: Testing & optimization</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">Ready Templates</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-sm text-muted-foreground">Automation Types</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
