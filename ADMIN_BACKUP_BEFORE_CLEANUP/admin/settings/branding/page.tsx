/**
 * @fileoverview Branding Settings Interface - HT-032.1.3
 * @module app/admin/settings/branding/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Branding settings interface for managing visual identity, logos, colors,
 * fonts, and custom styling. Part of the foundation settings system that
 * provides universal configuration management.
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { 
  Palette,
  Upload,
  Download,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  Save,
  RefreshCw,
  ArrowLeft,
  Image as ImageIcon,
  Type,
  Paintbrush,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Code,
  Zap
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  getCoreSettingsManager,
  BrandingSettings,
  type SettingsValidationResult 
} from '@/lib/admin/foundation-settings';

interface BrandingPreview {
  logoPreview: string | null;
  faviconPreview: string | null;
  primaryColorPreview: string;
  secondaryColorPreview: string;
  fontPreview: string;
  customCssEnabled: boolean;
}

interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
  description: string;
}

const COLOR_PALETTES: ColorPalette[] = [
  {
    name: 'Ocean Blue',
    primary: '#3B82F6',
    secondary: '#1E40AF',
    description: 'Professional and trustworthy'
  },
  {
    name: 'Forest Green',
    primary: '#10B981',
    secondary: '#047857',
    description: 'Natural and growth-oriented'
  },
  {
    name: 'Sunset Orange',
    primary: '#F59E0B',
    secondary: '#D97706',
    description: 'Energetic and creative'
  },
  {
    name: 'Royal Purple',
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    description: 'Luxurious and innovative'
  },
  {
    name: 'Ruby Red',
    primary: '#EF4444',
    secondary: '#DC2626',
    description: 'Bold and attention-grabbing'
  },
  {
    name: 'Slate Gray',
    primary: '#64748B',
    secondary: '#475569',
    description: 'Modern and minimalist'
  }
];

const FONT_OPTIONS = [
  'Inter, sans-serif',
  'Roboto, sans-serif',
  'Open Sans, sans-serif',
  'Lato, sans-serif',
  'Montserrat, sans-serif',
  'Poppins, sans-serif',
  'Source Sans Pro, sans-serif',
  'Nunito, sans-serif',
  'Raleway, sans-serif',
  'Ubuntu, sans-serif',
  'Playfair Display, serif',
  'Merriweather, serif',
  'Georgia, serif',
  'Times New Roman, serif',
  'JetBrains Mono, monospace',
  'Fira Code, monospace'
];

export default function BrandingSettingsPage() {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const settingsManager = getCoreSettingsManager();
  
  const [settings, setSettings] = useState<BrandingSettings>(
    settingsManager.getSection('branding')
  );
  
  const [preview, setPreview] = useState<BrandingPreview>({
    logoPreview: null,
    faviconPreview: null,
    primaryColorPreview: settings.primaryColor,
    secondaryColorPreview: settings.secondaryColor,
    fontPreview: settings.fontFamily,
    customCssEnabled: Boolean(settings.customCss)
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [validationResult, setValidationResult] = useState<SettingsValidationResult | null>(null);
  const [activeTab, setActiveTab] = useState('visual');
  const [showColorPicker, setShowColorPicker] = useState<'primary' | 'secondary' | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = settingsManager.subscribe((event) => {
      if (event.section === 'branding') {
        setSettings(settingsManager.getSection('branding'));
        setUnsavedChanges(false);
      }
    });

    return unsubscribe;
  }, [settingsManager]);

  const updateSetting = <K extends keyof BrandingSettings>(
    key: K,
    value: BrandingSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setUnsavedChanges(true);
    
    // Update preview
    setPreview(prev => ({
      ...prev,
      [`${key}Preview`]: value
    }));

    // Clear previous messages
    setError(null);
    setSuccess(null);
  };

  const applyColorPalette = (palette: ColorPalette) => {
    updateSetting('primaryColor', palette.primary);
    updateSetting('secondaryColor', palette.secondary);
    setPreview(prev => ({
      ...prev,
      primaryColorPreview: palette.primary,
      secondaryColorPreview: palette.secondary
    }));
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const validation = await settingsManager.updateSection('branding', settings);
      setValidationResult(validation);
      
      if (validation.isValid) {
        setSuccess('Branding settings saved successfully!');
        setUnsavedChanges(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Please fix validation errors before saving');
      }
      
    } catch (error) {
      setError('Failed to save branding settings');
      console.error('Save settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = async () => {
    if (confirm('Are you sure you want to reset all branding settings to defaults?')) {
      try {
        setLoading(true);
        
        const defaultBranding = settingsManager.getSection('branding');
        await settingsManager.updateSection('branding', {
          logoUrl: '',
          faviconUrl: '',
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          fontFamily: 'Inter, sans-serif',
          customCss: ''
        });
        
        setSuccess('Branding settings reset to defaults');
        setTimeout(() => setSuccess(null), 3000);
        
      } catch (error) {
        setError('Failed to reset settings');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileUpload = async (type: 'logo' | 'favicon', file: File) => {
    try {
      setLoading(true);
      
      // In a real app, upload to storage service
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'logo') {
          updateSetting('logoUrl', result);
          setPreview(prev => ({ ...prev, logoPreview: result }));
        } else {
          updateSetting('faviconUrl', result);
          setPreview(prev => ({ ...prev, faviconPreview: result }));
        }
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      setError(`Failed to upload ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const exportBrandingSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'branding-settings.json';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const importBrandingSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          const validation = await settingsManager.updateSection('branding', importedSettings);
          
          if (validation.isValid) {
            setSuccess('Branding settings imported successfully');
            setTimeout(() => setSuccess(null), 3000);
          } else {
            setError('Invalid branding settings file');
          }
        } catch (error) {
          setError('Failed to import settings - invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

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

  return (
    <AdminLayout
      title="Branding Settings"
      description="Manage visual identity, logos, colors, fonts, and custom styling"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header Actions */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/settings')}
                className="transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Settings
              </Button>
              
              {unsavedChanges && (
                <Badge variant="outline" className="text-sm">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={exportBrandingSettings}
                disabled={loading}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <label className="cursor-pointer">
                <Button variant="outline" disabled={loading} asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={importBrandingSettings}
                  className="hidden"
                />
              </label>
              
              <Button
                variant="outline"
                onClick={resetToDefaults}
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              
              <Button
                onClick={saveSettings}
                disabled={loading || !unsavedChanges}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </motion.div>

          {/* Status Messages */}
          {error && (
            <motion.div variants={itemVariants}>
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 dark:text-red-300">{error}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setError(null)}
                      className="ml-auto"
                    >
                      ×
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {success && (
            <motion.div variants={itemVariants}>
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 dark:text-green-300">{success}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="visual" className="flex items-center space-x-2">
                  <Palette className="w-4 h-4" />
                  <span>Visual Identity</span>
                </TabsTrigger>
                <TabsTrigger value="colors" className="flex items-center space-x-2">
                  <Paintbrush className="w-4 h-4" />
                  <span>Colors</span>
                </TabsTrigger>
                <TabsTrigger value="typography" className="flex items-center space-x-2">
                  <Type className="w-4 h-4" />
                  <span>Typography</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center space-x-2">
                  <Code className="w-4 h-4" />
                  <span>Advanced</span>
                </TabsTrigger>
              </TabsList>

              {/* Visual Identity Tab */}
              <TabsContent value="visual" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Logo Upload */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <ImageIcon className="w-5 h-5 mr-2" />
                        Logo
                      </CardTitle>
                      <CardDescription>
                        Upload your organization's logo. Recommended size: 200x50px
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        {preview.logoPreview || settings.logoUrl ? (
                          <div className="relative">
                            <img
                              src={preview.logoPreview || settings.logoUrl}
                              alt="Logo preview"
                              className="max-h-24 max-w-48 object-contain"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 p-0"
                              onClick={() => {
                                updateSetting('logoUrl', '');
                                setPreview(prev => ({ ...prev, logoPreview: null }));
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No logo uploaded</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="logoUrl"
                            value={settings.logoUrl}
                            onChange={(e) => updateSetting('logoUrl', e.target.value)}
                            placeholder="https://example.com/logo.png"
                          />
                          <label className="cursor-pointer">
                            <Button variant="outline" asChild>
                              <span>
                                <Upload className="w-4 h-4" />
                              </span>
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload('logo', file);
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Favicon Upload */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Globe className="w-5 h-5 mr-2" />
                        Favicon
                      </CardTitle>
                      <CardDescription>
                        Upload your favicon. Recommended size: 32x32px ICO or PNG
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        {preview.faviconPreview || settings.faviconUrl ? (
                          <div className="relative">
                            <img
                              src={preview.faviconPreview || settings.faviconUrl}
                              alt="Favicon preview"
                              className="w-8 h-8 object-contain"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 p-0"
                              onClick={() => {
                                updateSetting('faviconUrl', '');
                                setPreview(prev => ({ ...prev, faviconPreview: null }));
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Globe className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No favicon uploaded</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="faviconUrl">Favicon URL</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="faviconUrl"
                            value={settings.faviconUrl}
                            onChange={(e) => updateSetting('faviconUrl', e.target.value)}
                            placeholder="https://example.com/favicon.ico"
                          />
                          <label className="cursor-pointer">
                            <Button variant="outline" asChild>
                              <span>
                                <Upload className="w-4 h-4" />
                              </span>
                            </Button>
                            <input
                              type="file"
                              accept="image/*,.ico"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload('favicon', file);
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Brand Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      Brand Preview
                    </CardTitle>
                    <CardDescription>
                      Preview how your branding will appear across different devices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Desktop Preview */}
                      <div className="text-center">
                        <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                        <p className="text-sm font-medium mb-3">Desktop</p>
                        <div 
                          className="border rounded-lg p-4 h-32 flex items-center justify-center"
                          style={{ 
                            backgroundColor: preview.primaryColorPreview + '10',
                            borderColor: preview.primaryColorPreview
                          }}
                        >
                          {preview.logoPreview || settings.logoUrl ? (
                            <img
                              src={preview.logoPreview || settings.logoUrl}
                              alt="Logo"
                              className="max-h-12 object-contain"
                            />
                          ) : (
                            <div 
                              className="px-4 py-2 rounded text-white font-medium"
                              style={{ backgroundColor: preview.primaryColorPreview }}
                            >
                              Your Brand
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tablet Preview */}
                      <div className="text-center">
                        <Tablet className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                        <p className="text-sm font-medium mb-3">Tablet</p>
                        <div 
                          className="border rounded-lg p-3 h-32 flex items-center justify-center"
                          style={{ 
                            backgroundColor: preview.primaryColorPreview + '10',
                            borderColor: preview.primaryColorPreview
                          }}
                        >
                          {preview.logoPreview || settings.logoUrl ? (
                            <img
                              src={preview.logoPreview || settings.logoUrl}
                              alt="Logo"
                              className="max-h-10 object-contain"
                            />
                          ) : (
                            <div 
                              className="px-3 py-1 rounded text-white font-medium text-sm"
                              style={{ backgroundColor: preview.primaryColorPreview }}
                            >
                              Your Brand
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mobile Preview */}
                      <div className="text-center">
                        <Smartphone className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                        <p className="text-sm font-medium mb-3">Mobile</p>
                        <div 
                          className="border rounded-lg p-2 h-32 flex items-center justify-center"
                          style={{ 
                            backgroundColor: preview.primaryColorPreview + '10',
                            borderColor: preview.primaryColorPreview
                          }}
                        >
                          {preview.faviconPreview || settings.faviconUrl ? (
                            <img
                              src={preview.faviconPreview || settings.faviconUrl}
                              alt="Favicon"
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <div 
                              className="w-8 h-8 rounded text-white font-bold text-xs flex items-center justify-center"
                              style={{ backgroundColor: preview.primaryColorPreview }}
                            >
                              YB
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-6">
                {/* Color Palettes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pre-made Color Palettes</CardTitle>
                    <CardDescription>
                      Choose from professionally designed color combinations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {COLOR_PALETTES.map((palette) => (
                        <div
                          key={palette.name}
                          className="border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
                          onClick={() => applyColorPalette(palette)}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: palette.primary }}
                            />
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: palette.secondary }}
                            />
                            <h3 className="font-medium">{palette.name}</h3>
                          </div>
                          <p className="text-sm text-gray-500">{palette.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Custom Colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Primary Color</CardTitle>
                      <CardDescription>
                        Main brand color used for buttons, links, and accents
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-16 h-16 rounded-lg border-2 cursor-pointer"
                          style={{ backgroundColor: preview.primaryColorPreview }}
                          onClick={() => setShowColorPicker('primary')}
                        />
                        <div className="flex-1">
                          <Label htmlFor="primaryColor">Hex Color</Label>
                          <Input
                            id="primaryColor"
                            value={settings.primaryColor}
                            onChange={(e) => updateSetting('primaryColor', e.target.value)}
                            placeholder="#3B82F6"
                          />
                        </div>
                        <input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Secondary Color</CardTitle>
                      <CardDescription>
                        Supporting color for hover states and secondary actions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-16 h-16 rounded-lg border-2 cursor-pointer"
                          style={{ backgroundColor: preview.secondaryColorPreview }}
                          onClick={() => setShowColorPicker('secondary')}
                        />
                        <div className="flex-1">
                          <Label htmlFor="secondaryColor">Hex Color</Label>
                          <Input
                            id="secondaryColor"
                            value={settings.secondaryColor}
                            onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                            placeholder="#1E40AF"
                          />
                        </div>
                        <input
                          type="color"
                          value={settings.secondaryColor}
                          onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Color Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Color Preview</CardTitle>
                    <CardDescription>
                      See how your colors will look in different contexts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex space-x-4">
                        <Button style={{ backgroundColor: preview.primaryColorPreview, borderColor: preview.primaryColorPreview }}>
                          Primary Button
                        </Button>
                        <Button 
                          variant="outline"
                          style={{ borderColor: preview.primaryColorPreview, color: preview.primaryColorPreview }}
                        >
                          Outline Button
                        </Button>
                        <Button 
                          variant="secondary"
                          style={{ backgroundColor: preview.secondaryColorPreview, borderColor: preview.secondaryColorPreview }}
                        >
                          Secondary Button
                        </Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Sample Content</h3>
                        <p className="text-gray-600 mb-3">
                          This is how your content will look with the selected colors.
                        </p>
                        <a 
                          href="#" 
                          className="underline"
                          style={{ color: preview.primaryColorPreview }}
                        >
                          This is a sample link
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Typography Tab */}
              <TabsContent value="typography" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Font Family</CardTitle>
                    <CardDescription>
                      Choose the font family for your admin interface
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select 
                      value={settings.fontFamily}
                      onValueChange={(value) => updateSetting('fontFamily', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select font family" />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font} value={font}>
                            <span style={{ fontFamily: font }}>{font}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Font Preview */}
                    <div className="border rounded-lg p-6" style={{ fontFamily: preview.fontPreview }}>
                      <h1 className="text-3xl font-bold mb-2">Heading 1</h1>
                      <h2 className="text-2xl font-semibold mb-2">Heading 2</h2>
                      <h3 className="text-xl font-medium mb-4">Heading 3</h3>
                      <p className="text-base mb-3">
                        This is a paragraph of regular text to show how the selected font family 
                        will appear in your admin interface. The quick brown fox jumps over the lazy dog.
                      </p>
                      <p className="text-sm text-gray-600">
                        This is smaller text that might be used for descriptions or metadata.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Custom CSS</CardTitle>
                    <CardDescription>
                      Add custom CSS to override default styles. Use with caution.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="customCssEnabled">Enable Custom CSS</Label>
                      <Switch
                        id="customCssEnabled"
                        checked={preview.customCssEnabled}
                        onCheckedChange={(checked) => {
                          setPreview(prev => ({ ...prev, customCssEnabled: checked }));
                          if (!checked) {
                            updateSetting('customCss', '');
                          }
                        }}
                      />
                    </div>

                    {preview.customCssEnabled && (
                      <div>
                        <Textarea
                          value={settings.customCss}
                          onChange={(e) => updateSetting('customCss', e.target.value)}
                          placeholder="/* Add your custom CSS here */
.admin-interface {
  /* Custom styles */
}"
                          rows={12}
                          className="font-mono text-sm"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Custom CSS will be applied globally to the admin interface. 
                          Make sure to test thoroughly before deploying to production.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* CSS Variables */}
                <Card>
                  <CardHeader>
                    <CardTitle>Generated CSS Variables</CardTitle>
                    <CardDescription>
                      CSS variables that will be available throughout your admin interface
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
                      <div className="space-y-1">
                        <div>--brand-primary: {settings.primaryColor};</div>
                        <div>--brand-secondary: {settings.secondaryColor};</div>
                        <div>--brand-font-family: {settings.fontFamily};</div>
                        {settings.logoUrl && <div>--brand-logo-url: url({settings.logoUrl});</div>}
                        {settings.faviconUrl && <div>--brand-favicon-url: url({settings.faviconUrl});</div>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      These variables can be used in your custom CSS or by developers 
                      when creating custom components.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
