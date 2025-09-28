/**
 * @fileoverview Brand Customizer - Step 5 of Client App Creation Guide
 * PRD-compliant white-label theming for rapid micro-app delivery
 * Focus: Essential branding options, professional appearance, minimal complexity
 */
import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Palette, Upload, Type, Save, Clock } from 'lucide-react';

// Simple interfaces for essential branding only
interface SimpleBranding {
  logo: string;
  primaryColor: string;
  fontFamily: string;
  name: string;
}

interface BrandingOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  deliveryImpact: string;
  complexity: 'low' | 'medium' | 'high';
}

export default async function ThemingPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  // Essential branding options (5 only per PRD)
  const brandingOptions: BrandingOption[] = [
    {
      id: 'logo',
      name: 'Logo Upload',
      description: 'Upload your brand logo for consistent identity',
      icon: Upload,
      deliveryImpact: 'Day 1 - Brand identity established',
      complexity: 'low'
    },
    {
      id: 'colors',
      name: 'Brand Colors',
      description: 'Set primary brand color for cohesive design',
      icon: Palette,
      deliveryImpact: 'Day 1 - Visual consistency applied',
      complexity: 'low'
    },
    {
      id: 'typography',
      name: 'Font Selection',
      description: 'Choose professional fonts for brand personality',
      icon: Type,
      deliveryImpact: 'Day 1 - Typography unified',
      complexity: 'low'
    },
    {
      id: 'preview',
      name: 'Live Preview',
      description: 'See your brand changes applied instantly',
      icon: Save,
      deliveryImpact: 'Day 1 - Visual validation complete',
      complexity: 'low'
    },
    {
      id: 'export',
      name: 'Export Theme',
      description: 'Generate production-ready brand assets',
      icon: Clock,
      deliveryImpact: 'Day 1 - Ready for deployment',
      complexity: 'low'
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
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Brand Customizer</h1>
              <p className="text-muted-foreground">
                Essential white-labeling for rapid micro-app delivery
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
                Rapid branding implementation for quick deployment
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-5 h-5 text-green-600" />
                <span className="font-medium">Essential Only</span>
              </div>
              <p className="text-sm text-muted-foreground">
                5 core branding tools for minimal complexity
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Save className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Professional</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Clean, polished appearance for $2k-5k projects
              </p>
            </div>
          </div>
        </div>

        {/* Essential Branding Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {brandingOptions.map((option) => {
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

        {/* Simple Brand Customizer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Brand Configuration</h3>

              <div className="space-y-4">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Brand Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload your logo (PNG, SVG, JPG)
                    </p>
                    <Button size="sm" variant="outline">
                      Choose File
                    </Button>
                  </div>
                </div>

                {/* Primary Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Primary Brand Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      defaultValue="#3b82f6"
                      className="w-12 h-10 border rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      defaultValue="#3b82f6"
                      className="flex-1 px-3 py-2 border rounded"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Font Family
                  </label>
                  <select className="w-full px-3 py-2 border rounded">
                    <option value="Inter">Inter (Recommended)</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                  </select>
                </div>

                {/* Brand Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your Brand Name"
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <Save className="w-4 h-4 mr-2" />
                Save Brand Settings
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                Export Theme Package
              </Button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Live Preview</h3>

              {/* Preview mockup */}
              <div className="border rounded-lg p-6 bg-gray-50" style={{
                fontFamily: 'Inter, system-ui, sans-serif'
              }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">L</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Your Brand Name</h4>
                    <p className="text-sm text-gray-500">Micro-App Preview</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white p-4 rounded border">
                    <h5 className="font-medium text-gray-900 mb-2">Sample Content</h5>
                    <p className="text-sm text-gray-600">
                      This is how your branded micro-app will appear to clients.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition-colors"
                    >
                      Primary Action
                    </button>
                    <button
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium text-sm hover:bg-gray-50 transition-colors"
                    >
                      Secondary
                    </button>
                  </div>
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
                  <span className="text-sm text-green-700">Day 1: Brand implementation complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-700">Days 2-3: Content integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span className="text-sm text-green-700">Days 4-5: Testing & refinement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-green-700">Days 6-7: Client handover ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}