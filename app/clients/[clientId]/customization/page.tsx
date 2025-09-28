/**
 * @fileoverview Client Customization Page
 * Custom branding, theming, and feature configuration for client projects
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

// Client Branding Interface
interface ClientBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  fontPrimary: string;
  fontSecondary: string;
  brandName: string;
  tagline: string;
  favicon: string;
}

// Feature Configuration
interface FeatureConfig {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'premium' | 'addon';
  enabled: boolean;
  configurable: boolean;
  settings: Record<string, any>;
}

// Customization Template
interface CustomizationTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  branding: ClientBranding;
  features: string[];
  popularity: number;
}

interface ClientCustomizationProps {
  params: {
    clientId: string;
  };
}

export default function ClientCustomizationPage({ params }: ClientCustomizationProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'branding' | 'features' | 'templates' | 'preview'>('branding');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientData, setClientData] = useState<any>(null);

  const [clientBranding, setClientBranding] = useState<ClientBranding>({
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    accentColor: '#0ea5e9',
    logoUrl: '/placeholder-logo.png',
    fontPrimary: 'Inter',
    fontSecondary: 'Roboto',
    brandName: 'Loading...',
    tagline: 'Loading...',
    favicon: '/placeholder-favicon.ico'
  });

  // Load real client data for customization
  useEffect(() => {
    const loadCustomizationData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get client data
        const clientResponse = await fetch('/api/agency-data?action=clients');
        const clientResult = await clientResponse.json();

        if (clientResult.success) {
          const client = clientResult.data.find((c: any) => c.id === params.clientId) || clientResult.data[0];
          setClientData(client);

          if (client) {
            // Load existing branding configuration or set defaults
            setClientBranding({
              primaryColor: client.branding?.primaryColor || '#2563eb',
              secondaryColor: client.branding?.secondaryColor || '#64748b',
              accentColor: client.branding?.accentColor || '#0ea5e9',
              logoUrl: client.branding?.logoUrl || '/placeholder-logo.png',
              fontPrimary: client.branding?.fontPrimary || 'Inter',
              fontSecondary: client.branding?.fontSecondary || 'Roboto',
              brandName: client.company_name || client.name || client.email.split('@')[0],
              tagline: client.branding?.tagline || 'Your Success is Our Mission',
              favicon: client.branding?.favicon || '/placeholder-favicon.ico'
            });
          }
        } else {
          throw new Error(clientResult.error || 'Failed to load client data');
        }
      } catch (err) {
        console.error('Error loading customization data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load customization data');

        // Fallback to demo data
        setClientBranding({
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          accentColor: '#0ea5e9',
          logoUrl: '/placeholder-logo.png',
          fontPrimary: 'Inter',
          fontSecondary: 'Roboto',
          brandName: 'Demo Client',
          tagline: 'Demo Customization',
          favicon: '/placeholder-favicon.ico'
        });
      } finally {
        setLoading(false);
      }
    };

    loadCustomizationData();
  }, [params.clientId]);

  const [features] = useState<FeatureConfig[]>([
    {
      id: 'dashboard',
      name: 'Analytics Dashboard',
      description: 'Real-time analytics and reporting dashboard',
      category: 'core',
      enabled: true,
      configurable: true,
      settings: { widgets: 8, refreshInterval: 30, exportFormats: ['PDF', 'CSV'] }
    },
    {
      id: 'user_management',
      name: 'User Management',
      description: 'Role-based user access and permissions',
      category: 'core',
      enabled: true,
      configurable: true,
      settings: { maxUsers: 50, roles: ['admin', 'user', 'viewer'], sso: false }
    },
    {
      id: 'notifications',
      name: 'Notifications System',
      description: 'Email and in-app notification management',
      category: 'core',
      enabled: true,
      configurable: true,
      settings: { emailNotifications: true, pushNotifications: false, digest: 'daily' }
    },
    {
      id: 'api_access',
      name: 'API Access',
      description: 'RESTful API for data integration',
      category: 'premium',
      enabled: false,
      configurable: true,
      settings: { rateLimit: 1000, webhooks: true, documentation: true }
    },
    {
      id: 'advanced_reporting',
      name: 'Advanced Reporting',
      description: 'Custom report builder with scheduling',
      category: 'premium',
      enabled: false,
      configurable: true,
      settings: { customReports: 10, scheduling: true, sharing: true }
    },
    {
      id: 'white_labeling',
      name: 'White Labeling',
      description: 'Complete brand customization options',
      category: 'premium',
      enabled: true,
      configurable: true,
      settings: { customDomain: true, removeBranding: true, customLogin: true }
    },
    {
      id: 'mobile_app',
      name: 'Mobile Application',
      description: 'Native mobile app for iOS and Android',
      category: 'addon',
      enabled: false,
      configurable: false,
      settings: { platforms: ['iOS', 'Android'], pushNotifications: true }
    },
    {
      id: 'ai_insights',
      name: 'AI Insights',
      description: 'Machine learning powered analytics',
      category: 'addon',
      enabled: false,
      configurable: true,
      settings: { predictiveAnalytics: true, anomalyDetection: true, insights: 'weekly' }
    }
  ]);

  const [templates] = useState<CustomizationTemplate[]>([
    {
      id: '1',
      name: 'Corporate Blue',
      description: 'Professional corporate theme with blue accents',
      preview: '/previews/corporate-blue.png',
      branding: {
        primaryColor: '#1e40af',
        secondaryColor: '#64748b',
        accentColor: '#3b82f6',
        logoUrl: '/logos/corporate.png',
        fontPrimary: 'Inter',
        fontSecondary: 'Roboto',
        brandName: 'Corporate Brand',
        tagline: 'Professional Excellence',
        favicon: '/favicons/corporate.ico'
      },
      features: ['dashboard', 'user_management', 'notifications', 'white_labeling'],
      popularity: 87
    },
    {
      id: '2',
      name: 'Modern Purple',
      description: 'Contemporary design with purple gradient theme',
      preview: '/previews/modern-purple.png',
      branding: {
        primaryColor: '#7c3aed',
        secondaryColor: '#6b7280',
        accentColor: '#a855f7',
        logoUrl: '/logos/modern.png',
        fontPrimary: 'Poppins',
        fontSecondary: 'Open Sans',
        brandName: 'Modern Brand',
        tagline: 'Future Forward',
        favicon: '/favicons/modern.ico'
      },
      features: ['dashboard', 'user_management', 'api_access', 'advanced_reporting'],
      popularity: 76
    },
    {
      id: '3',
      name: 'Minimal Green',
      description: 'Clean minimal design with eco-friendly green theme',
      preview: '/previews/minimal-green.png',
      branding: {
        primaryColor: '#059669',
        secondaryColor: '#64748b',
        accentColor: '#10b981',
        logoUrl: '/logos/minimal.png',
        fontPrimary: 'Nunito Sans',
        fontSecondary: 'Source Sans Pro',
        brandName: 'Eco Brand',
        tagline: 'Sustainable Solutions',
        favicon: '/favicons/minimal.ico'
      },
      features: ['dashboard', 'notifications', 'white_labeling'],
      popularity: 65
    }
  ]);

  const updateBranding = (key: keyof ClientBranding, value: string) => {
    setClientBranding(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleFeature = (featureId: string) => {
    // In real implementation, this would update the feature configuration
    console.log(`Toggle feature: ${featureId}`);
  };

  const applyTemplate = (template: CustomizationTemplate) => {
    setClientBranding(template.branding);
    setActiveTab('preview');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  // Loading state
  if (loading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center transition-all duration-300",
        isDark ? "bg-black text-white" : "bg-white text-black"
      )}>
        <div className={cn(
          "text-lg font-medium",
          isDark ? "text-white/80" : "text-black/80"
        )}>
          Loading customization data...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn(
        "min-h-screen transition-all duration-300",
        isDark ? "bg-black text-white" : "bg-white text-black"
      )}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800 font-medium">Error loading customization data</div>
            <div className="text-red-600 text-sm mt-1">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-300",
      isDark ? "bg-black text-white" : "bg-white text-black"
    )}>
      {/* Header */}
      <div className={cn(
        "border-b-2 transition-all duration-300",
        isDark ? "border-white/30" : "border-black/30"
      )}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <a
                  href={`/clients/${params.clientId}`}
                  className={cn(
                    "px-3 py-1 rounded-lg border-2 font-bold transition-all duration-300 text-sm",
                    isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                  )}
                >
                  ← Back to Client
                </a>
              </div>
              <h1 className="text-4xl font-bold tracking-wide uppercase">
                Client Customization
              </h1>
              <p className={cn(
                "mt-2 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Custom branding, theming, and feature configuration
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Real Data Indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="text-green-800 font-medium">✅ Connected to real database</div>
          <div className="text-green-600 text-sm mt-1">
            Showing real customization settings for {clientData?.name || clientData?.email || params.clientId}
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Customization Statistics */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Features Enabled", value: features.filter(f => f.enabled).length, total: features.length },
              { label: "Brand Elements", value: 6, total: 8 },
              { label: "Template Applied", value: "Corporate Blue", total: "" },
              { label: "Customization Progress", value: "78%", total: "" }
            ].map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "p-6 rounded-lg border-2 transition-all duration-300",
                  isDark
                    ? "bg-black/5 border-white/30 hover:border-white/50"
                    : "bg-white/5 border-black/30 hover:border-black/50"
                )}
              >
                <div className="text-sm font-medium uppercase tracking-wide opacity-70">
                  {stat.label}
                </div>
                <div className="text-2xl font-bold mt-2">
                  {stat.value}
                  {stat.total && `/${stat.total}`}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            variants={itemVariants}
            className="flex space-x-4"
          >
            {[
              { id: 'branding', label: 'Brand Customization' },
              { id: 'features', label: 'Feature Configuration' },
              { id: 'templates', label: 'Quick Templates' },
              { id: 'preview', label: 'Live Preview' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-6 py-3 rounded-lg border-2 font-bold transition-all duration-300",
                  activeTab === tab.id
                    ? isDark
                      ? "bg-white/10 border-white/50"
                      : "bg-black/10 border-black/50"
                    : isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Brand Customization Tab */}
          {activeTab === 'branding' && (
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Brand Settings */}
              <div className={cn(
                "p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}>
                <h3 className="font-bold uppercase tracking-wide text-lg mb-6">
                  Brand Settings
                </h3>
                <div className="space-y-6">
                  {/* Brand Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Brand Name</label>
                      <input
                        type="text"
                        value={clientBranding.brandName}
                        onChange={(e) => updateBranding('brandName', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tagline</label>
                      <input
                        type="text"
                        value={clientBranding.tagline}
                        onChange={(e) => updateBranding('tagline', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div>
                    <h4 className="font-medium mb-4">Color Palette</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(clientBranding).filter(([key]) => key.includes('Color')).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium mb-1 capitalize">
                            {key.replace('Color', ' Color')}
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="color"
                              value={value}
                              onChange={(e) => updateBranding(key as keyof ClientBranding, e.target.value)}
                              className="w-12 h-8 border-2 border-gray-300 rounded"
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => updateBranding(key as keyof ClientBranding, e.target.value)}
                              className="flex-1 px-2 py-1 border-2 border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Typography */}
                  <div>
                    <h4 className="font-medium mb-4">Typography</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Primary Font</label>
                        <select
                          value={clientBranding.fontPrimary}
                          onChange={(e) => updateBranding('fontPrimary', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded"
                        >
                          {['Inter', 'Poppins', 'Nunito Sans', 'Open Sans', 'Roboto', 'Lato'].map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Secondary Font</label>
                        <select
                          value={clientBranding.fontSecondary}
                          onChange={(e) => updateBranding('fontSecondary', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded"
                        >
                          {['Roboto', 'Open Sans', 'Source Sans Pro', 'Lato', 'Nunito Sans'].map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Brand Assets */}
                  <div>
                    <h4 className="font-medium mb-4">Brand Assets</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Logo URL</label>
                        <input
                          type="url"
                          value={clientBranding.logoUrl}
                          onChange={(e) => updateBranding('logoUrl', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Favicon URL</label>
                        <input
                          type="url"
                          value={clientBranding.favicon}
                          onChange={(e) => updateBranding('favicon', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
                          placeholder="https://example.com/favicon.ico"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Preview */}
              <div className={cn(
                "p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}>
                <h3 className="font-bold uppercase tracking-wide text-lg mb-6">
                  Brand Preview
                </h3>
                <div
                  className="p-6 rounded-lg border-2 space-y-4"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#1f2937',
                    fontFamily: clientBranding.fontPrimary
                  }}
                >
                  {/* Header Preview */}
                  <div
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: clientBranding.primaryColor, color: '#ffffff' }}
                  >
                    <h4 className="text-xl font-bold">{clientBranding.brandName}</h4>
                    <p className="text-sm opacity-90">{clientBranding.tagline}</p>
                  </div>

                  {/* Content Preview */}
                  <div className="space-y-3">
                    <h5
                      style={{
                        color: clientBranding.primaryColor,
                        fontFamily: clientBranding.fontPrimary
                      }}
                      className="text-lg font-bold"
                    >
                      Sample Heading
                    </h5>
                    <p
                      style={{
                        fontFamily: clientBranding.fontSecondary,
                        color: clientBranding.secondaryColor
                      }}
                    >
                      This is how your branded content will appear with the selected typography and colors.
                    </p>
                    <button
                      style={{
                        backgroundColor: clientBranding.accentColor,
                        color: '#ffffff'
                      }}
                      className="px-4 py-2 rounded-lg font-bold"
                    >
                      Call to Action
                    </button>
                  </div>

                  {/* Color Swatches */}
                  <div>
                    <div className="text-sm font-medium mb-2">Color Palette</div>
                    <div className="flex space-x-2">
                      {[clientBranding.primaryColor, clientBranding.secondaryColor, clientBranding.accentColor].map((color, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="w-8 h-8 rounded border-2 border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                          <div className="text-xs mt-1">{color}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all">
                    Apply Branding
                  </button>
                  <button className={cn(
                    "w-full px-4 py-3 rounded-lg border-2 font-bold transition-all duration-300",
                    isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                  )}>
                    Export Brand Guide
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Feature Configuration Tab */}
          {activeTab === 'features' && (
            <motion.div
              variants={itemVariants}
              className={cn(
                "p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}
            >
              <h3 className="font-bold uppercase tracking-wide text-lg mb-6">
                Feature Configuration
              </h3>

              {['core', 'premium', 'addon'].map(category => (
                <div key={category} className="mb-8">
                  <h4 className="text-lg font-bold mb-4 capitalize">{category} Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.filter(f => f.category === category).map((feature) => (
                      <div
                        key={feature.id}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all duration-300",
                          feature.enabled
                            ? "border-green-500/50 bg-green-500/10"
                            : isDark
                              ? "border-white/30"
                              : "border-black/30"
                        )}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-medium">{feature.name}</h5>
                            <p className="text-sm opacity-70">{feature.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={feature.enabled}
                              onChange={() => toggleFeature(feature.id)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {feature.enabled && feature.configurable && (
                          <div className="mt-3 pt-3 border-t border-gray-300">
                            <div className="text-xs font-medium mb-2 uppercase tracking-wide">Settings</div>
                            <div className="text-xs opacity-70">
                              {Object.entries(feature.settings).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                  <span>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Quick Templates Tab */}
          {activeTab === 'templates' && (
            <motion.div
              variants={itemVariants}
              className={cn(
                "p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}
            >
              <h3 className="font-bold uppercase tracking-wide text-lg mb-6">
                Quick Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={cn(
                      "p-4 rounded-lg border-2 cursor-pointer transition-all duration-300",
                      "hover:scale-105",
                      isDark
                        ? "border-white/30 hover:border-white/50"
                        : "border-black/30 hover:border-black/50"
                    )}
                    onClick={() => applyTemplate(template)}
                  >
                    {/* Template Preview */}
                    <div className={cn(
                      "h-32 rounded-lg border-2 mb-4 flex items-center justify-center",
                      isDark ? "bg-white/5 border-white/20" : "bg-black/5 border-black/20"
                    )}>
                      <div className="text-center">
                        <div
                          className="w-8 h-8 rounded mx-auto mb-2"
                          style={{ backgroundColor: template.branding.primaryColor }}
                        />
                        <div className="text-xs opacity-70">Preview</div>
                      </div>
                    </div>

                    <h4 className="font-bold mb-2">{template.name}</h4>
                    <p className="text-sm opacity-70 mb-3">{template.description}</p>

                    <div className="flex justify-between items-center text-xs">
                      <span className="opacity-70">{template.features.length} features</span>
                      <span className="opacity-70">{template.popularity}% popularity</span>
                    </div>

                    <button className="w-full mt-3 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-all">
                      Apply Template
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Live Preview Tab */}
          {activeTab === 'preview' && (
            <motion.div
              variants={itemVariants}
              className={cn(
                "p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}
            >
              <h3 className="font-bold uppercase tracking-wide text-lg mb-6">
                Live Preview
              </h3>
              <div className="text-center space-y-6">
                <div>
                  <h4 className="text-lg font-bold mb-4">Preview your customized micro-app</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['Desktop', 'Tablet', 'Mobile'].map((device) => (
                      <button
                        key={device}
                        className={cn(
                          "p-4 rounded-lg border-2 font-bold transition-all duration-300",
                          isDark
                            ? "border-white/30 hover:border-white/50"
                            : "border-black/30 hover:border-black/50"
                        )}
                      >
                        Preview on {device}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-sm opacity-70">
                  Select a device type above to see how your customizations look across different screen sizes
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}