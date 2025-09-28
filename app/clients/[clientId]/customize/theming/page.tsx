/**
 * @fileoverview Client Brand Customizer - Client-scoped theming for micro-app customization
 * PRD-compliant white-label theming for rapid micro-app delivery
 * Focus: Essential branding options, professional appearance, minimal complexity
 */
import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Palette, Upload, Type, Save, Clock, Building2 } from 'lucide-react';

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

interface ClientThemingProps {
  params: {
    clientId: string;
  };
}

export default async function ClientThemingPage({ params }: ClientThemingProps) {
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
    brandColors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
  };

  // Essential branding options (5 only per PRD)
  const brandingOptions: BrandingOption[] = [
    {
      id: 'logo',
      name: 'Logo Upload',
      description: `Upload ${clientData.name}'s brand logo for consistent identity`,
      icon: Upload,
      deliveryImpact: 'Day 1 - Brand identity established',
      complexity: 'low'
    },
    {
      id: 'colors',
      name: 'Brand Colors',
      description: `Set ${clientData.name}'s primary brand color for cohesive design`,
      icon: Palette,
      deliveryImpact: 'Day 1 - Visual consistency applied',
      complexity: 'low'
    },
    {
      id: 'typography',
      name: 'Font Selection',
      description: `Choose professional fonts for ${clientData.name}'s brand personality`,
      icon: Type,
      deliveryImpact: 'Day 1 - Typography unified',
      complexity: 'low'
    },
    {
      id: 'preview',
      name: 'Live Preview',
      description: `See ${clientData.name}'s brand changes applied instantly`,
      icon: Save,
      deliveryImpact: 'Day 1 - Visual validation complete',
      complexity: 'low'
    },
    {
      id: 'export',
      name: 'Export Theme',
      description: `Generate production-ready brand assets for ${clientData.name}`,
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
                <h1 className="text-3xl font-bold">Brand Customizer</h1>
                <span className="text-sm px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {clientData.name}
                </span>
              </div>
              <p className="text-muted-foreground">
                Essential white-labeling for {clientData.name}'s micro-app
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
                Rapid branding implementation for {clientData.name}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-5 h-5 text-green-600" />
                <span className="font-medium">Client-Scoped</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Branding designed specifically for {clientData.name}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Save className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Professional</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Clean, polished appearance for {clientData.projectType}
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
              <h3 className="text-lg font-semibold mb-4">
                {clientData.name}'s Brand Configuration
              </h3>

              <div className="space-y-4">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {clientData.name}'s Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload {clientData.name}'s logo (PNG, SVG, JPG)
                    </p>
                    <Button size="sm" variant="outline">
                      Choose File
                    </Button>
                  </div>
                </div>

                {/* Primary Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {clientData.name}'s Primary Brand Color
                  </label>
                  <div className="flex gap-2 mb-3">
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
                  {/* Color Suggestions */}
                  <div className="flex gap-2">
                    <span className="text-xs text-muted-foreground">Suggestions:</span>
                    {clientData.brandColors.map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded border cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Font Family for {clientData.name}
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
                    Display Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder={clientData.name}
                    defaultValue={clientData.name}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <Save className="w-4 h-4 mr-2" />
                Save {clientData.name}'s Brand Settings
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                Export {clientData.name}'s Theme Package
              </Button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                Live Preview - {clientData.name}'s App
              </h3>

              {/* Preview mockup */}
              <div className="border rounded-lg p-6 bg-gray-50" style={{
                fontFamily: 'Inter, system-ui, sans-serif'
              }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {clientData.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{clientData.name}</h4>
                    <p className="text-sm text-gray-500">Micro-App Preview</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white p-4 rounded border">
                    <h5 className="font-medium text-gray-900 mb-2">Sample Content</h5>
                    <p className="text-sm text-gray-600">
                      This is how {clientData.name}'s branded micro-app will appear to clients.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition-colors"
                    >
                      Contact {clientData.name}
                    </button>
                    <button
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium text-sm hover:bg-gray-50 transition-colors"
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Client-Specific Delivery Timeline */}
            <div className="p-6 border rounded-lg bg-purple-50">
              <h3 className="text-lg font-semibold mb-3 text-purple-800">
                {clientData.name}'s Delivery Timeline
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span className="text-sm text-purple-700">Day 1: {clientData.name} brand implementation complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm text-purple-700">Days 2-3: Content integration for {clientData.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                  <span className="text-sm text-purple-700">Days 4-5: Testing & refinement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-purple-700">Days 6-7: {clientData.name} handover ready</span>
                </div>
              </div>
            </div>

            {/* Brand Assets Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">5</div>
                <div className="text-sm text-muted-foreground">Brand Options</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-muted-foreground">Custom Assets</div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-semibold text-blue-800 mb-2">Next Steps for {clientData.name}</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div>• Upload {clientData.name}'s logo and brand assets</div>
                <div>• Configure primary brand colors</div>
                <div>• Select appropriate typography</div>
                <div>• Preview and test branding integration</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}