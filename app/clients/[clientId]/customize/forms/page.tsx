/**
 * @fileoverview Client Form Builder - Client-scoped form builder for micro-app customization
 * PRD-compliant form builder for rapid micro-app delivery
 * Focus: Essential form creation, professional appearance, minimal complexity
 */
import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Plus, Eye, Save, Clock, Building2 } from 'lucide-react';

// Simple interfaces for essential form building only
interface SimpleFormTemplate {
  id: string;
  name: string;
  description: string;
  fields: string[];
  deliveryImpact: string;
  complexity: 'low' | 'medium';
}

interface FormOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  deliveryImpact: string;
  complexity: 'low' | 'medium';
}

interface ClientFormsProps {
  params: {
    clientId: string;
  };
}

export default async function ClientFormsPage({ params }: ClientFormsProps) {
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
    projectType: 'consultation-app'
  };

  // Essential form options (5 only per PRD)
  const formOptions: FormOption[] = [
    {
      id: 'contact',
      name: 'Contact Form',
      description: 'Simple contact form with name, email, and message',
      icon: FileText,
      deliveryImpact: 'Day 1 - Lead capture ready',
      complexity: 'low'
    },
    {
      id: 'newsletter',
      name: 'Newsletter Signup',
      description: 'Email collection form with optional preferences',
      icon: Plus,
      deliveryImpact: 'Day 1 - Email list building',
      complexity: 'low'
    },
    {
      id: 'booking',
      name: 'Service Booking',
      description: 'Appointment booking with date and time selection',
      icon: Clock,
      deliveryImpact: 'Day 2 - Booking system active',
      complexity: 'medium'
    },
    {
      id: 'feedback',
      name: 'Feedback Form',
      description: 'Customer feedback with rating and comments',
      icon: Eye,
      deliveryImpact: 'Day 1 - Customer insights',
      complexity: 'low'
    },
    {
      id: 'quote',
      name: 'Quote Request',
      description: 'Project details form for service quotes',
      icon: Save,
      deliveryImpact: 'Day 2 - Quote generation ready',
      complexity: 'medium'
    }
  ];

  // Simple form templates (3 essential ones)
  const templates: SimpleFormTemplate[] = [
    {
      id: 'basic-contact',
      name: 'Basic Contact',
      description: 'Name, email, message - the essentials',
      fields: ['Full Name', 'Email', 'Message'],
      deliveryImpact: 'Day 1 - Ready for leads',
      complexity: 'low'
    },
    {
      id: 'service-inquiry',
      name: 'Service Inquiry',
      description: 'Contact form with service selection',
      fields: ['Name', 'Email', 'Phone', 'Service Needed', 'Message'],
      deliveryImpact: 'Day 1 - Service leads ready',
      complexity: 'low'
    },
    {
      id: 'appointment-booking',
      name: 'Appointment Booking',
      description: 'Scheduling form with date/time picker',
      fields: ['Name', 'Email', 'Phone', 'Service Type', 'Preferred Date', 'Preferred Time'],
      deliveryImpact: 'Day 2 - Booking system live',
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
                <h1 className="text-3xl font-bold">Form Builder</h1>
                <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {clientData.name}
                </span>
              </div>
              <p className="text-muted-foreground">
                Essential form creation for {clientData.name}'s micro-app
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
                Rapid form implementation for {clientData.name}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="font-medium">Client-Scoped</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Forms designed specifically for this client
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Save className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Professional</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Clean, responsive forms for {clientData.projectType}
              </p>
            </div>
          </div>
        </div>

        {/* Essential Form Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {formOptions.map((option) => {
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

        {/* Simple Form Builder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Templates */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Quick Start Templates</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Pre-built forms optimized for {clientData.name}'s needs
              </p>

              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        template.complexity === 'low'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {template.complexity}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground mb-2">Included Fields:</div>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.map((field, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-medium">
                        {template.deliveryImpact}
                      </span>
                      <Button size="sm">
                        Use for {clientData.name}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Form for {clientData.name}
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                Import Form Template
              </Button>
            </div>
          </div>

          {/* Live Preview & Timeline */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                Live Preview - {clientData.name}'s Form
              </h3>

              {/* Sample form preview */}
              <div className="space-y-4 p-4 border-2 border-dashed rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 border rounded-md"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border rounded-md"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <textarea
                    placeholder={`Tell ${clientData.name} about your project...`}
                    className="w-full px-3 py-2 border rounded-md h-20"
                    disabled
                  />
                </div>

                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium">
                  Send Message to {clientData.name}
                </button>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                * Preview shows how forms will appear to {clientData.name}'s visitors
              </p>
            </div>

            {/* Client-Specific Delivery Timeline */}
            <div className="p-6 border rounded-lg bg-blue-50">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">
                {clientData.name}'s Delivery Timeline
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-blue-700">Day 1: Form creation & {clientData.name} branding</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-blue-700">Day 2: Client integration & testing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span className="text-sm text-blue-700">Day 3: Email notifications for {clientData.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-blue-700">Days 4-7: {clientData.name}'s forms go live</span>
                </div>
              </div>
            </div>

            {/* Client Progress Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">Ready Templates</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-muted-foreground">Client Forms</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border rounded-lg bg-green-50">
              <h4 className="font-semibold text-green-800 mb-2">Next Steps</h4>
              <div className="space-y-2 text-sm text-green-700">
                <div>• Select a form template for {clientData.name}</div>
                <div>• Customize fields and styling</div>
                <div>• Test form functionality</div>
                <div>• Deploy to {clientData.name}'s app</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}