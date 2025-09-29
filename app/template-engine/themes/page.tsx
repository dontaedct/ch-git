/**
 * @fileoverview Theme Application Interface
 * Advanced theme management and application system
 * HT-029.3.3 Implementation
 */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Palette,
  Download,
  Upload,
  Save,
  Copy,
  Trash2,
  Edit,
  Eye,
  Settings,
  RefreshCw,
  Plus,
  Zap,
  Paintbrush,
  Contrast,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  CheckCircle2,
  Star,
  Heart,
  Share2,
  Code,
  Layers,
  Grid,
  Type,
  Image,
  Layout
} from "lucide-react";

interface ThemePreset {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'creative' | 'minimal' | 'modern' | 'elegant';
  isPremium: boolean;
  rating: number;
  downloads: number;
  author: string;
  preview: {
    hero: string;
    colors: string[];
    features: string[];
  };
  theme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      border: string;
      success: string;
      warning: string;
      error: string;
    };
    typography: {
      fontFamily: string;
      headingFont: string;
      bodyFont: string;
      sizes: Record<string, string>;
      weights: Record<string, number>;
    };
    spacing: Record<string, string>;
    borderRadius: Record<string, string>;
    shadows: Record<string, string>;
  };
  customizations?: {
    headerStyle: string;
    buttonStyle: string;
    cardStyle: string;
    animations: boolean;
  };
}

interface AppliedTheme {
  id: string;
  presetId: string;
  name: string;
  appliedAt: Date;
  customizations: Record<string, any>;
  status: 'active' | 'draft' | 'archived';
}

export default function ThemeApplicationInterface() {
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset | null>(null);
  const [appliedThemes, setAppliedThemes] = useState<AppliedTheme[]>([]);
  const [currentTab, setCurrentTab] = useState("browse");
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [previewMode, setPreviewMode] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [themePresets] = useState<ThemePreset[]>([
    {
      id: 'professional-blue',
      name: 'Professional Blue',
      description: 'Clean, professional theme with blue accents perfect for business consultation',
      category: 'business',
      isPremium: false,
      rating: 4.8,
      downloads: 1247,
      author: 'Template Studio',
      preview: {
        hero: 'Clean header with blue CTA button',
        colors: ['#3B82F6', '#1E40AF', '#F8FAFC'],
        features: ['Professional layout', 'Clean typography', 'Trust-building design']
      },
      theme: {
        colors: {
          primary: '#3B82F6',
          secondary: '#1E40AF',
          accent: '#F59E0B',
          background: '#FFFFFF',
          surface: '#F8FAFC',
          text: '#1F2937',
          textSecondary: '#6B7280',
          border: '#E5E7EB',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444'
        },
        typography: {
          fontFamily: 'Inter',
          headingFont: 'Inter',
          bodyFont: 'Inter',
          sizes: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem'
          },
          weights: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem'
        },
        borderRadius: {
          none: '0',
          sm: '0.125rem',
          md: '0.375rem',
          lg: '0.5rem',
          xl: '0.75rem',
          full: '9999px'
        },
        shadows: {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
        }
      },
      customizations: {
        headerStyle: 'clean',
        buttonStyle: 'rounded',
        cardStyle: 'elevated',
        animations: true
      }
    },
    {
      id: 'modern-gradient',
      name: 'Modern Gradient',
      description: 'Vibrant gradient-based theme with modern styling and bold colors',
      category: 'modern',
      isPremium: true,
      rating: 4.9,
      downloads: 892,
      author: 'Design Collective',
      preview: {
        hero: 'Gradient background with modern typography',
        colors: ['#6366F1', '#8B5CF6', '#EC4899'],
        features: ['Gradient backgrounds', 'Modern animations', 'Bold typography']
      },
      theme: {
        colors: {
          primary: '#6366F1',
          secondary: '#8B5CF6',
          accent: '#EC4899',
          background: '#FFFFFF',
          surface: '#F9FAFB',
          text: '#111827',
          textSecondary: '#6B7280',
          border: '#E5E7EB',
          success: '#059669',
          warning: '#D97706',
          error: '#DC2626'
        },
        typography: {
          fontFamily: 'Poppins',
          headingFont: 'Poppins',
          bodyFont: 'Inter',
          sizes: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '2rem'
          },
          weights: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem'
        },
        borderRadius: {
          none: '0',
          sm: '0.25rem',
          md: '0.5rem',
          lg: '0.75rem',
          xl: '1rem',
          full: '9999px'
        },
        shadows: {
          sm: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
        }
      },
      customizations: {
        headerStyle: 'gradient',
        buttonStyle: 'pill',
        cardStyle: 'floating',
        animations: true
      }
    },
    {
      id: 'minimal-monochrome',
      name: 'Minimal Monochrome',
      description: 'Clean, minimal design with monochromatic color scheme',
      category: 'minimal',
      isPremium: false,
      rating: 4.7,
      downloads: 1156,
      author: 'Minimal Studio',
      preview: {
        hero: 'Clean white background with subtle typography',
        colors: ['#000000', '#6B7280', '#F9FAFB'],
        features: ['Minimal design', 'Excellent readability', 'Timeless aesthetic']
      },
      theme: {
        colors: {
          primary: '#000000',
          secondary: '#374151',
          accent: '#6B7280',
          background: '#FFFFFF',
          surface: '#F9FAFB',
          text: '#111827',
          textSecondary: '#6B7280',
          border: '#E5E7EB',
          success: '#065F46',
          warning: '#92400E',
          error: '#991B1B'
        },
        typography: {
          fontFamily: 'Source Sans Pro',
          headingFont: 'Source Sans Pro',
          bodyFont: 'Source Sans Pro',
          sizes: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem'
          },
          weights: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem'
        },
        borderRadius: {
          none: '0',
          sm: '0.125rem',
          md: '0.25rem',
          lg: '0.375rem',
          xl: '0.5rem',
          full: '9999px'
        },
        shadows: {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          md: '0 2px 4px 0 rgb(0 0 0 / 0.05)',
          lg: '0 4px 8px 0 rgb(0 0 0 / 0.05)',
          xl: '0 8px 16px 0 rgb(0 0 0 / 0.05)'
        }
      },
      customizations: {
        headerStyle: 'minimal',
        buttonStyle: 'sharp',
        cardStyle: 'flat',
        animations: false
      }
    },
    {
      id: 'elegant-serif',
      name: 'Elegant Serif',
      description: 'Sophisticated serif typography with warm color palette',
      category: 'elegant',
      isPremium: true,
      rating: 4.6,
      downloads: 673,
      author: 'Elegance Themes',
      preview: {
        hero: 'Serif typography with warm earth tones',
        colors: ['#7C2D12', '#EA580C', '#FEF3C7'],
        features: ['Serif typography', 'Warm colors', 'Sophisticated feel']
      },
      theme: {
        colors: {
          primary: '#7C2D12',
          secondary: '#EA580C',
          accent: '#F59E0B',
          background: '#FFFBEB',
          surface: '#FEF3C7',
          text: '#451A03',
          textSecondary: '#92400E',
          border: '#FDE68A',
          success: '#166534',
          warning: '#CA8A04',
          error: '#B91C1C'
        },
        typography: {
          fontFamily: 'Merriweather',
          headingFont: 'Playfair Display',
          bodyFont: 'Source Serif Pro',
          sizes: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '2rem'
          },
          weights: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem'
        },
        borderRadius: {
          none: '0',
          sm: '0.125rem',
          md: '0.375rem',
          lg: '0.5rem',
          xl: '0.75rem',
          full: '9999px'
        },
        shadows: {
          sm: '0 1px 2px 0 rgb(124 45 18 / 0.05)',
          md: '0 4px 6px -1px rgb(124 45 18 / 0.1)',
          lg: '0 10px 15px -3px rgb(124 45 18 / 0.1)',
          xl: '0 20px 25px -5px rgb(124 45 18 / 0.1)'
        }
      },
      customizations: {
        headerStyle: 'elegant',
        buttonStyle: 'classic',
        cardStyle: 'bordered',
        animations: true
      }
    },
    {
      id: 'creative-burst',
      name: 'Creative Burst',
      description: 'Bold, creative theme with vibrant colors and dynamic layouts',
      category: 'creative',
      isPremium: true,
      rating: 4.4,
      downloads: 489,
      author: 'Creative Labs',
      preview: {
        hero: 'Vibrant colors with creative layout elements',
        colors: ['#7C3AED', '#F59E0B', '#EF4444'],
        features: ['Vibrant colors', 'Creative layouts', 'Bold typography']
      },
      theme: {
        colors: {
          primary: '#7C3AED',
          secondary: '#F59E0B',
          accent: '#EF4444',
          background: '#FFFFFF',
          surface: '#F3F4F6',
          text: '#1F2937',
          textSecondary: '#6B7280',
          border: '#D1D5DB',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444'
        },
        typography: {
          fontFamily: 'Montserrat',
          headingFont: 'Oswald',
          bodyFont: 'Open Sans',
          sizes: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.625rem',
            '3xl': '2.25rem'
          },
          weights: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem'
        },
        borderRadius: {
          none: '0',
          sm: '0.375rem',
          md: '0.75rem',
          lg: '1rem',
          xl: '1.5rem',
          full: '9999px'
        },
        shadows: {
          sm: '0 2px 4px 0 rgb(124 58 237 / 0.1)',
          md: '0 6px 12px -2px rgb(124 58 237 / 0.1)',
          lg: '0 12px 24px -4px rgb(124 58 237 / 0.1)',
          xl: '0 24px 48px -8px rgb(124 58 237 / 0.15)'
        }
      },
      customizations: {
        headerStyle: 'bold',
        buttonStyle: 'creative',
        cardStyle: 'dynamic',
        animations: true
      }
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Themes', count: themePresets.length },
    { id: 'business', name: 'Business', count: themePresets.filter(t => t.category === 'business').length },
    { id: 'modern', name: 'Modern', count: themePresets.filter(t => t.category === 'modern').length },
    { id: 'minimal', name: 'Minimal', count: themePresets.filter(t => t.category === 'minimal').length },
    { id: 'elegant', name: 'Elegant', count: themePresets.filter(t => t.category === 'elegant').length },
    { id: 'creative', name: 'Creative', count: themePresets.filter(t => t.category === 'creative').length }
  ];

  const filteredThemes = themePresets.filter(theme => {
    const matchesCategory = categoryFilter === 'all' || theme.category === categoryFilter;
    const matchesSearch = searchQuery === '' ||
      theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApplyTheme = async (theme: ThemePreset) => {
    setIsApplying(true);

    // Simulate theme application
    await new Promise(resolve => setTimeout(resolve, 2000));

    const appliedTheme: AppliedTheme = {
      id: `applied-${Date.now()}`,
      presetId: theme.id,
      name: theme.name,
      appliedAt: new Date(),
      customizations: theme.customizations || {},
      status: 'active'
    };

    // Mark previous themes as archived
    const updatedThemes = appliedThemes.map(t => ({ ...t, status: 'archived' as const }));
    setAppliedThemes([...updatedThemes, appliedTheme]);

    setIsApplying(false);
  };

  const renderThemeCard = (theme: ThemePreset) => {
    const isApplied = appliedThemes.some(applied =>
      applied.presetId === theme.id && applied.status === 'active'
    );

    return (
      <motion.div
        layout
        className={`group relative bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-xl ${
          selectedTheme?.id === theme.id
            ? 'border-blue-500 shadow-lg'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        {/* Premium Badge */}
        {theme.isPremium && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              Premium
            </Badge>
          </div>
        )}

        {/* Applied Badge */}
        {isApplied && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Applied
            </Badge>
          </div>
        )}

        {/* Theme Preview */}
        <div className="p-6">
          <div className="relative h-32 mb-4 rounded-lg overflow-hidden"
               style={{ background: `linear-gradient(135deg, ${theme.theme.colors.primary}, ${theme.theme.colors.secondary})` }}>
            <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm">
              <div className="p-4 text-white">
                <div className="h-2 bg-white bg-opacity-30 rounded mb-2" style={{ width: '60%' }}></div>
                <div className="h-1 bg-white bg-opacity-20 rounded mb-1" style={{ width: '40%' }}></div>
                <div className="h-1 bg-white bg-opacity-20 rounded" style={{ width: '50%' }}></div>
              </div>
            </div>
          </div>

          {/* Color Palette */}
          <div className="flex space-x-2 mb-4">
            {theme.preview.colors.map((color, index) => (
              <div
                key={index}
                className="w-6 h-6 rounded-full border border-gray-200"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          {/* Theme Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{theme.name}</h3>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{theme.rating}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{theme.description}</p>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>by {theme.author}</span>
              <span>{theme.downloads.toLocaleString()} downloads</span>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-1">
              {theme.preview.features.slice(0, 2).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setSelectedTheme(theme)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleApplyTheme(theme)}
              disabled={isApplying || isApplied}
            >
              {isApplying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : isApplied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Applied
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Apply
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderThemePreview = () => {
    if (!selectedTheme) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-bold">{selectedTheme.name}</h2>
              <p className="text-gray-600">{selectedTheme.description}</p>
            </div>
            <Button variant="ghost" onClick={() => setSelectedTheme(null)}>
              ×
            </Button>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">
            {/* Preview Canvas */}
            <div className="bg-gray-100 rounded-lg p-8">
              <div
                className="bg-white rounded-lg shadow-lg overflow-hidden"
                style={{
                  fontFamily: selectedTheme.theme.typography.fontFamily,
                  color: selectedTheme.theme.colors.text
                }}
              >
                {/* Header */}
                <div
                  className="p-6 border-b"
                  style={{
                    backgroundColor: selectedTheme.theme.colors.surface,
                    borderColor: selectedTheme.theme.colors.border
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold" style={{ color: selectedTheme.theme.colors.text }}>
                      Business Solutions
                    </h1>
                    <button
                      className="px-4 py-2 rounded-lg text-white font-medium"
                      style={{
                        backgroundColor: selectedTheme.theme.colors.primary,
                        borderRadius: selectedTheme.theme.borderRadius.lg
                      }}
                    >
                      Get Started
                    </button>
                  </div>
                </div>

                {/* Hero Section */}
                <div className="p-8 text-center">
                  <h2
                    className="text-4xl font-bold mb-4"
                    style={{
                      fontFamily: selectedTheme.theme.typography.headingFont,
                      color: selectedTheme.theme.colors.text
                    }}
                  >
                    Transform Your Business
                  </h2>
                  <p
                    className="text-lg mb-6"
                    style={{ color: selectedTheme.theme.colors.textSecondary }}
                  >
                    Get expert consultation and grow your business with our proven strategies
                  </p>
                  <button
                    className="px-8 py-3 text-white font-semibold"
                    style={{
                      backgroundColor: selectedTheme.theme.colors.primary,
                      borderRadius: selectedTheme.theme.borderRadius.lg
                    }}
                  >
                    Start Free Consultation
                  </button>
                </div>

                {/* Features Grid */}
                <div
                  className="p-8"
                  style={{ backgroundColor: selectedTheme.theme.colors.surface }}
                >
                  <div className="grid md:grid-cols-3 gap-6">
                    {['Expert Analysis', 'Proven Results', '100% Free'].map((feature, index) => (
                      <div
                        key={index}
                        className="p-6 bg-white rounded-lg"
                        style={{
                          borderRadius: selectedTheme.theme.borderRadius.lg,
                          boxShadow: selectedTheme.theme.shadows.md
                        }}
                      >
                        <div
                          className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center"
                          style={{ backgroundColor: selectedTheme.theme.colors.primary }}
                        >
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2" style={{ color: selectedTheme.theme.colors.text }}>
                          {feature}
                        </h3>
                        <p className="text-sm" style={{ color: selectedTheme.theme.colors.textSecondary }}>
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Details */}
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Color Palette</h3>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(selectedTheme.theme.colors).slice(0, 8).map(([name, color]) => (
                    <div key={name} className="text-center">
                      <div
                        className="w-12 h-12 rounded-lg border mx-auto mb-1"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-xs text-gray-600 capitalize">{name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Typography</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Heading Font:</span>
                    <span className="ml-2 font-medium">{selectedTheme.theme.typography.headingFont}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Body Font:</span>
                    <span className="ml-2 font-medium">{selectedTheme.theme.typography.bodyFont}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Style:</span>
                    <span className="ml-2 font-medium capitalize">{selectedTheme.category}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center p-6 border-t bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{selectedTheme.rating}</span>
              </div>
              <div className="text-sm text-gray-600">
                {selectedTheme.downloads.toLocaleString()} downloads
              </div>
              {selectedTheme.isPremium && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Premium
                </Badge>
              )}
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={() => handleApplyTheme(selectedTheme)}>
                <Zap className="h-4 w-4 mr-2" />
                Apply Theme
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Theme Application</h1>
              <p className="text-gray-600 mt-1">
                Browse and apply professional themes to your templates
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/template-engine/customization">
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Customize Templates
                </Button>
              </Link>
              <Link href="/template-engine">
                <Button variant="outline">Back to Engine</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Themes</TabsTrigger>
            <TabsTrigger value="applied">Applied Themes</TabsTrigger>
            <TabsTrigger value="custom">Custom Themes</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex space-x-4">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={categoryFilter === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(category.id)}
                  >
                    {category.name}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Search themes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Theme Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredThemes.map((theme) => (
                  <motion.div
                    key={theme.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderThemeCard(theme)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredThemes.length === 0 && (
              <div className="text-center py-12">
                <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No themes found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="applied" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Applied Themes</CardTitle>
                <CardDescription>
                  Manage themes that have been applied to your templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appliedThemes.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applied themes</h3>
                    <p className="text-gray-600 mb-4">
                      Browse themes and apply one to get started
                    </p>
                    <Button onClick={() => setCurrentTab('browse')}>
                      Browse Themes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appliedThemes.map((applied) => {
                      const preset = themePresets.find(p => p.id === applied.presetId);
                      if (!preset) return null;

                      return (
                        <div
                          key={applied.id}
                          className={`p-4 border rounded-lg ${
                            applied.status === 'active' ? 'border-green-200 bg-green-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex space-x-2">
                                {preset.preview.colors.map((color, index) => (
                                  <div
                                    key={index}
                                    className="w-4 h-4 rounded-full border border-gray-200"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              <div>
                                <h3 className="font-medium">{applied.name}</h3>
                                <p className="text-sm text-gray-600">
                                  Applied {applied.appliedAt.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={applied.status === 'active' ? 'default' : 'secondary'}
                                className={applied.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                              >
                                {applied.status}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Themes</CardTitle>
                <CardDescription>
                  Create and manage your own custom themes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Create Custom Theme</h3>
                  <p className="text-gray-600 mb-4">
                    Build your own theme from scratch or customize an existing one
                  </p>
                  <div className="flex justify-center space-x-3">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Theme
                    </Button>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Theme
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Theme Preview Modal */}
      <AnimatePresence>
        {selectedTheme && renderThemePreview()}
      </AnimatePresence>
    </div>
  );
}