/**
 * @fileoverview Client Theming Interface
 * Brand-aware theming system with customization tools
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

// Theme Configuration Interface
interface ThemeConfig {
  id: string;
  name: string;
  client: string;
  colors: ColorPalette;
  typography: Typography;
  spacing: SpacingConfig;
  borders: BorderConfig;
  shadows: ShadowConfig;
  lastModified: string;
  isActive: boolean;
}

// Color Palette Interface
interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

// Typography Interface
interface Typography {
  fontPrimary: string;
  fontSecondary: string;
  headingScale: number;
  bodySize: number;
  lineHeight: number;
  letterSpacing: number;
}

// Spacing Configuration
interface SpacingConfig {
  base: number;
  scale: number;
  containerMaxWidth: number;
  sectionPadding: number;
}

// Border Configuration
interface BorderConfig {
  radius: number;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
}

// Shadow Configuration
interface ShadowConfig {
  elevation: number;
  blur: number;
  spread: number;
  opacity: number;
}

// Brand Assets
interface BrandAssets {
  logo: string;
  favicon: string;
  brandColors: string[];
  brandFonts: string[];
  guidelines: string;
}

export default function ClientThemingPage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'themes' | 'customizer' | 'preview'>('themes');
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig | null>(null);

  const [presetThemes] = useState<ThemeConfig[]>([
    {
      id: '1',
      name: 'Corporate Blue',
      client: 'Acme Corp',
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#0ea5e9',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      typography: {
        fontPrimary: 'Inter',
        fontSecondary: 'Roboto',
        headingScale: 1.25,
        bodySize: 16,
        lineHeight: 1.6,
        letterSpacing: 0
      },
      spacing: {
        base: 4,
        scale: 1.5,
        containerMaxWidth: 1200,
        sectionPadding: 64
      },
      borders: {
        radius: 8,
        width: 1,
        style: 'solid'
      },
      shadows: {
        elevation: 4,
        blur: 16,
        spread: 0,
        opacity: 0.1
      },
      lastModified: '2 hours ago',
      isActive: true
    },
    {
      id: '2',
      name: 'Modern Purple',
      client: 'TechStart Inc',
      colors: {
        primary: '#7c3aed',
        secondary: '#6b7280',
        accent: '#a855f7',
        background: '#ffffff',
        surface: '#faf9ff',
        text: '#111827',
        textSecondary: '#6b7280',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        info: '#2563eb'
      },
      typography: {
        fontPrimary: 'Poppins',
        fontSecondary: 'Open Sans',
        headingScale: 1.333,
        bodySize: 15,
        lineHeight: 1.7,
        letterSpacing: 0.01
      },
      spacing: {
        base: 4,
        scale: 1.618,
        containerMaxWidth: 1024,
        sectionPadding: 48
      },
      borders: {
        radius: 12,
        width: 2,
        style: 'solid'
      },
      shadows: {
        elevation: 6,
        blur: 24,
        spread: -4,
        opacity: 0.15
      },
      lastModified: '1 day ago',
      isActive: false
    },
    {
      id: '3',
      name: 'Minimal Green',
      client: 'Global Solutions',
      colors: {
        primary: '#059669',
        secondary: '#64748b',
        accent: '#10b981',
        background: '#ffffff',
        surface: '#f0fdf4',
        text: '#1f2937',
        textSecondary: '#6b7280',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      typography: {
        fontPrimary: 'Nunito Sans',
        fontSecondary: 'Source Sans Pro',
        headingScale: 1.2,
        bodySize: 16,
        lineHeight: 1.5,
        letterSpacing: -0.01
      },
      spacing: {
        base: 8,
        scale: 1.25,
        containerMaxWidth: 1440,
        sectionPadding: 80
      },
      borders: {
        radius: 4,
        width: 1,
        style: 'solid'
      },
      shadows: {
        elevation: 2,
        blur: 8,
        spread: 0,
        opacity: 0.05
      },
      lastModified: '3 days ago',
      isActive: false
    }
  ]);

  const [customTheme, setCustomTheme] = useState<ThemeConfig>({
    id: 'custom',
    name: 'Custom Theme',
    client: 'New Client',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    typography: {
      fontPrimary: 'Inter',
      fontSecondary: 'Roboto',
      headingScale: 1.25,
      bodySize: 16,
      lineHeight: 1.6,
      letterSpacing: 0
    },
    spacing: {
      base: 4,
      scale: 1.5,
      containerMaxWidth: 1200,
      sectionPadding: 64
    },
    borders: {
      radius: 8,
      width: 1,
      style: 'solid'
    },
    shadows: {
      elevation: 4,
      blur: 16,
      spread: 0,
      opacity: 0.1
    },
    lastModified: 'Now',
    isActive: false
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

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

  const updateCustomTheme = (section: string, key: string, value: any) => {
    setCustomTheme(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as Record<string, any>),
        [key]: value
      }
    }));
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
              <h1 className="text-4xl font-bold tracking-wide uppercase">
                Client Theming Interface
              </h1>
              <p className={cn(
                "mt-2 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Brand-aware theming system with customization tools
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/agency-toolkit"
                className={cn(
                  "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300",
                  isDark
                    ? "border-white/30 hover:border-white/50"
                    : "border-black/30 hover:border-black/50"
                )}
              >
                ← Back to Toolkit
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Theme Statistics */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Active Themes", value: presetThemes.filter(t => t.isActive).length, color: "blue" },
              { label: "Total Themes", value: presetThemes.length, color: "green" },
              { label: "Clients Served", value: 24, color: "yellow" },
              { label: "Brand Assets", value: 156, color: "purple" }
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
                <div className="text-2xl font-bold mt-2">{stat.value}</div>
              </div>
            ))}
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            variants={itemVariants}
            className="flex space-x-4"
          >
            {[
              { id: 'themes', label: 'Client Themes' },
              { id: 'customizer', label: 'Theme Customizer' },
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

          {/* Client Themes Tab */}
          {activeTab === 'themes' && (
            <motion.div
              variants={itemVariants}
              className={cn(
                "p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold tracking-wide uppercase">
                  Client Themes ({presetThemes.length})
                </h2>
                <button
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300",
                    "hover:scale-105",
                    isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                  )}
                >
                  Create New Theme
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {presetThemes.map((themeConfig) => (
                  <div
                    key={themeConfig.id}
                    className={cn(
                      "p-6 rounded-lg border-2 transition-all duration-300 cursor-pointer",
                      "hover:scale-105",
                      themeConfig.isActive && "ring-2 ring-blue-500",
                      isDark
                        ? "border-white/30 hover:border-white/50 hover:bg-white/10"
                        : "border-black/30 hover:border-black/50 hover:bg-black/10"
                    )}
                    onClick={() => setSelectedTheme(themeConfig)}
                  >
                    {/* Theme Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold tracking-wide uppercase text-lg">
                          {themeConfig.name}
                        </h3>
                        <p className="text-sm opacity-70 mt-1">
                          {themeConfig.client}
                        </p>
                      </div>
                      {themeConfig.isActive && (
                        <span className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-xs font-medium uppercase">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Color Palette Preview */}
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Color Palette:</div>
                      <div className="flex space-x-2">
                        {Object.entries(themeConfig.colors).slice(0, 6).map(([key, color]) => (
                          <div
                            key={key}
                            className="w-8 h-8 rounded border-2 border-gray-300"
                            style={{ backgroundColor: color }}
                            title={`${key}: ${color}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Typography Preview */}
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Typography:</div>
                      <div className="text-xs opacity-70">
                        Primary: {themeConfig.typography.fontPrimary} •
                        Secondary: {themeConfig.typography.fontSecondary}
                      </div>
                    </div>

                    {/* Theme Stats */}
                    <div className="text-xs opacity-70 mb-4">
                      Last modified: {themeConfig.lastModified}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-all">
                        Apply Theme
                      </button>
                      <button className={cn(
                        "px-3 py-2 rounded-lg border-2 text-sm font-bold transition-all duration-300",
                        isDark
                          ? "border-white/30 hover:border-white/50"
                          : "border-black/30 hover:border-black/50"
                      )}>
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Theme Customizer Tab */}
          {activeTab === 'customizer' && (
            <motion.div
              variants={itemVariants}
              className={cn(
                "p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}
            >
              <h2 className="text-xl font-bold tracking-wide uppercase mb-6">
                Theme Customizer
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customization Controls */}
                <div className="space-y-6">
                  {/* Colors Section */}
                  <div>
                    <h3 className="font-bold uppercase tracking-wide mb-4">Colors</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(customTheme.colors).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium mb-1 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="color"
                              value={value}
                              onChange={(e) => updateCustomTheme('colors', key, e.target.value)}
                              className="w-12 h-8 border-2 border-gray-300 rounded"
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => updateCustomTheme('colors', key, e.target.value)}
                              className="flex-1 px-2 py-1 border-2 border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Typography Section */}
                  <div>
                    <h3 className="font-bold uppercase tracking-wide mb-4">Typography</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Primary Font</label>
                        <select
                          value={customTheme.typography.fontPrimary}
                          onChange={(e) => updateCustomTheme('typography', 'fontPrimary', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded"
                        >
                          {['Inter', 'Poppins', 'Nunito Sans', 'Open Sans', 'Roboto', 'Lato'].map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Body Size (px)</label>
                          <input
                            type="number"
                            value={customTheme.typography.bodySize}
                            onChange={(e) => updateCustomTheme('typography', 'bodySize', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Line Height</label>
                          <input
                            type="number"
                            step="0.1"
                            value={customTheme.typography.lineHeight}
                            onChange={(e) => updateCustomTheme('typography', 'lineHeight', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Spacing Section */}
                  <div>
                    <h3 className="font-bold uppercase tracking-wide mb-4">Spacing & Layout</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Base Spacing</label>
                        <input
                          type="number"
                          value={customTheme.spacing.base}
                          onChange={(e) => updateCustomTheme('spacing', 'base', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Container Width</label>
                        <input
                          type="number"
                          value={customTheme.spacing.containerMaxWidth}
                          onChange={(e) => updateCustomTheme('spacing', 'containerMaxWidth', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Borders Section */}
                  <div>
                    <h3 className="font-bold uppercase tracking-wide mb-4">Borders & Effects</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Border Radius</label>
                        <input
                          type="number"
                          value={customTheme.borders.radius}
                          onChange={(e) => updateCustomTheme('borders', 'radius', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Shadow Blur</label>
                        <input
                          type="number"
                          value={customTheme.shadows.blur}
                          onChange={(e) => updateCustomTheme('shadows', 'blur', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div>
                  <h3 className="font-bold uppercase tracking-wide mb-4">Live Preview</h3>
                  <div
                    className="p-6 rounded-lg border-2 space-y-4"
                    style={{
                      backgroundColor: customTheme.colors.background,
                      color: customTheme.colors.text,
                      fontFamily: customTheme.typography.fontPrimary,
                      fontSize: `${customTheme.typography.bodySize}px`,
                      lineHeight: customTheme.typography.lineHeight,
                      borderRadius: `${customTheme.borders.radius}px`
                    }}
                  >
                    <h4
                      style={{
                        color: customTheme.colors.primary,
                        fontSize: `${customTheme.typography.bodySize * customTheme.typography.headingScale}px`
                      }}
                      className="font-bold"
                    >
                      Sample Heading
                    </h4>
                    <p style={{ color: customTheme.colors.textSecondary }}>
                      This is a preview of how your theme will look. You can see the colors, typography, and spacing in action.
                    </p>
                    <button
                      style={{
                        backgroundColor: customTheme.colors.primary,
                        color: customTheme.colors.background,
                        borderRadius: `${customTheme.borders.radius}px`,
                        padding: `${customTheme.spacing.base * 2}px ${customTheme.spacing.base * 4}px`
                      }}
                      className="font-bold"
                    >
                      Sample Button
                    </button>
                    <div
                      style={{
                        backgroundColor: customTheme.colors.surface,
                        borderRadius: `${customTheme.borders.radius}px`,
                        padding: `${customTheme.spacing.base * 3}px`
                      }}
                    >
                      <p style={{ color: customTheme.colors.text }}>
                        This is a surface element with your custom styling applied.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all">
                      Save Custom Theme
                    </button>
                    <button className={cn(
                      "w-full px-4 py-3 rounded-lg border-2 font-bold transition-all duration-300",
                      isDark
                        ? "border-white/30 hover:border-white/50"
                        : "border-black/30 hover:border-black/50"
                    )}>
                      Export Theme CSS
                    </button>
                  </div>
                </div>
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
              <h2 className="text-xl font-bold tracking-wide uppercase mb-6">
                Live Theme Preview
              </h2>
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-4">Preview different page layouts with your theme</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['Homepage', 'Dashboard', 'Forms'].map((layout) => (
                      <button
                        key={layout}
                        className={cn(
                          "p-4 rounded-lg border-2 font-bold transition-all duration-300",
                          isDark
                            ? "border-white/30 hover:border-white/50"
                            : "border-black/30 hover:border-black/50"
                        )}
                      >
                        Preview {layout}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-center text-sm opacity-70">
                  Select a layout above to see how your theme applies to different page types
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}