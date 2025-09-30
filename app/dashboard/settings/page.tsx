/**
 * @fileoverview Client Settings Dashboard - Step 3 of Client App Creation Guide
 * Comprehensive configuration interface for micro-app customization
 * PRD-compliant: Essential settings, professional appearance, clear organization
 */
import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings2, Palette, Mail, Calendar, Package, Shield } from 'lucide-react';
import { ClientSettingsForm } from '@/components/client-settings-form';

export default async function SettingsPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  if (!isSafeMode) {
    try {
      await requireClient();
    } catch {
      redirect('/login');
    }
  }

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
              <Settings2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Client Configuration</h1>
              <p className="text-muted-foreground">
                Configure your micro-app settings and customization options
              </p>
            </div>
          </div>
        </div>

        {/* Settings Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: Calendar,
              title: 'Booking Settings',
              description: 'Calendar integration & appointments',
              color: 'text-blue-600 bg-blue-100'
            },
            {
              icon: Mail,
              title: 'Email Configuration',
              description: 'SMTP, templates & notifications',
              color: 'text-green-600 bg-green-100'
            },
            {
              icon: Palette,
              title: 'Branding',
              description: 'Logo, colors & white-labeling',
              color: 'text-purple-600 bg-purple-100'
            },
            {
              icon: Package,
              title: 'Feature Modules',
              description: 'Enable/disable functionality',
              color: 'text-orange-600 bg-orange-100'
            },
            {
              icon: Shield,
              title: 'Security',
              description: 'Access control & permissions',
              color: 'text-red-600 bg-red-100'
            }
          ].map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center mb-3`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-1">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            );
          })}
        </div>

        {/* Settings Form */}
        <ClientSettingsForm />
      </div>
    </div>
  );
}