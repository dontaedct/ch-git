/**
 * @fileoverview Core Settings Management Interface - HT-032.1.1
 * @module app/admin/settings/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Core settings management interface that serves as the foundation for all
 * template-specific settings. Provides unified navigation and consistent
 * user experience framework.
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  Users, 
  Globe, 
  Shield,
  Mail,
  Bell,
  Database,
  Server,
  Palette,
  Code,
  ArrowLeft,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  Info,
  HelpCircle,
  ExternalLink,
  Zap,
  Lock,
  Unlock,
  Download,
  Upload
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CoreSettings {
  general: {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    supportEmail: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
  };
  security: {
    twoFactorRequired: boolean;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
      requireUppercase: boolean;
    };
    ipWhitelist: string[];
    rateLimiting: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    webhookNotifications: boolean;
    notificationEmail: string;
  };
  branding: {
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    customCss: string;
  };
  system: {
    debugMode: boolean;
    logLevel: string;
    cacheEnabled: boolean;
    backupEnabled: boolean;
    backupFrequency: string;
    maxFileSize: number;
  };
}

export default function CoreSettingsPage() {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [settings, setSettings] = useState<CoreSettings>({
    general: {
      siteName: 'Admin Platform',
      siteDescription: 'Modular admin interface for managing applications',
      adminEmail: 'admin@example.com',
      supportEmail: 'support@example.com',
      timezone: 'UTC',
      language: 'en',
      maintenanceMode: false
    },
    security: {
      twoFactorRequired: false,
      sessionTimeout: 30,
      passwordPolicy: {
        minLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true
      },
      ipWhitelist: [],
      rateLimiting: true
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      webhookNotifications: false,
      notificationEmail: 'notifications@example.com'
    },
    branding: {
      logoUrl: '',
      faviconUrl: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      fontFamily: 'Inter, sans-serif',
      customCss: ''
    },
    system: {
      debugMode: false,
      logLevel: 'info',
      cacheEnabled: true,
      backupEnabled: true,
      backupFrequency: 'daily',
      maxFileSize: 10
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In real app, load from API
      // const response = await fetch('/api/admin/settings');
      // const data = await response.json();
      // setSettings(data);
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In real app, save to API
      // const response = await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Settings saved successfully!');
      setUnsavedChanges(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (path: string, value: any) => {
    const pathParts = path.split('.');
    const newSettings = { ...settings };
    
    let current: any = newSettings;
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = value;
    
    setSettings(newSettings);
    setUnsavedChanges(true);
  };

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
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
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
                className={cn(
                  "transition-all duration-300 hover:scale-105",
                  isDark
                    ? "border-white/30 hover:border-white/50"
                    : "border-black/30 hover:border-black/50"
                )}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-4xl font-bold tracking-wide uppercase">
                  Core Settings
                </h1>
                <p className={cn(
                  "mt-1 text-lg",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  Configure global system settings and preferences
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {unsavedChanges && (
                <Badge variant="outline" className="text-sm">
                  Unsaved Changes
                </Badge>
              )}
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
                Save Settings
              </Button>
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

          {/* Settings Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>General</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Security</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="branding" className="flex items-center space-x-2">
                  <Palette className="w-4 h-4" />
                  <span>Branding</span>
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center space-x-2">
                  <Server className="w-4 h-4" />
                  <span>System</span>
                </TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>General Configuration</CardTitle>
                    <CardDescription>
                      Basic site information and global settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input
                          id="siteName"
                          value={settings.general.siteName}
                          onChange={(e) => updateSetting('general.siteName', e.target.value)}
                          placeholder="Enter site name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="adminEmail">Admin Email</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          value={settings.general.adminEmail}
                          onChange={(e) => updateSetting('general.adminEmail', e.target.value)}
                          placeholder="admin@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Textarea
                        id="siteDescription"
                        value={settings.general.siteDescription}
                        onChange={(e) => updateSetting('general.siteDescription', e.target.value)}
                        placeholder="Describe your site"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select 
                          value={settings.general.timezone}
                          onValueChange={(value) => updateSetting('general.timezone', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                            <SelectItem value="America/Chicago">Central Time</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="language">Language</Label>
                        <Select 
                          value={settings.general.language}
                          onValueChange={(value) => updateSetting('general.language', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="supportEmail">Support Email</Label>
                        <Input
                          id="supportEmail"
                          type="email"
                          value={settings.general.supportEmail}
                          onChange={(e) => updateSetting('general.supportEmail', e.target.value)}
                          placeholder="support@example.com"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                        <p className="text-sm text-gray-500">
                          Temporarily disable site access for maintenance
                        </p>
                      </div>
                      <Switch
                        id="maintenanceMode"
                        checked={settings.general.maintenanceMode}
                        onCheckedChange={(checked) => updateSetting('general.maintenanceMode', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Configuration</CardTitle>
                    <CardDescription>
                      Authentication, authorization, and security policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-500">
                          Require 2FA for all admin users
                        </p>
                      </div>
                      <Switch
                        checked={settings.security.twoFactorRequired}
                        onCheckedChange={(checked) => updateSetting('security.twoFactorRequired', checked)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security.sessionTimeout', parseInt(e.target.value))}
                        min="5"
                        max="480"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Password Policy</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="minLength">Minimum Length</Label>
                          <Input
                            id="minLength"
                            type="number"
                            value={settings.security.passwordPolicy.minLength}
                            onChange={(e) => updateSetting('security.passwordPolicy.minLength', parseInt(e.target.value))}
                            min="6"
                            max="32"
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Require Special Characters</Label>
                            <Switch
                              checked={settings.security.passwordPolicy.requireSpecialChars}
                              onCheckedChange={(checked) => updateSetting('security.passwordPolicy.requireSpecialChars', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Require Numbers</Label>
                            <Switch
                              checked={settings.security.passwordPolicy.requireNumbers}
                              onCheckedChange={(checked) => updateSetting('security.passwordPolicy.requireNumbers', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Require Uppercase</Label>
                            <Switch
                              checked={settings.security.passwordPolicy.requireUppercase}
                              onCheckedChange={(checked) => updateSetting('security.passwordPolicy.requireUppercase', checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label>Rate Limiting</Label>
                        <p className="text-sm text-gray-500">
                          Enable rate limiting for API endpoints
                        </p>
                      </div>
                      <Switch
                        checked={settings.security.rateLimiting}
                        onCheckedChange={(checked) => updateSetting('security.rateLimiting', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Configuration</CardTitle>
                    <CardDescription>
                      Configure how and when notifications are sent
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="notificationEmail">Notification Email</Label>
                      <Input
                        id="notificationEmail"
                        type="email"
                        value={settings.notifications.notificationEmail}
                        onChange={(e) => updateSetting('notifications.notificationEmail', e.target.value)}
                        placeholder="notifications@example.com"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Notification Channels</Label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5" />
                            <div>
                              <Label>Email Notifications</Label>
                              <p className="text-sm text-gray-500">
                                Receive notifications via email
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.notifications.emailNotifications}
                            onCheckedChange={(checked) => updateSetting('notifications.emailNotifications', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Bell className="w-5 h-5" />
                            <div>
                              <Label>Push Notifications</Label>
                              <p className="text-sm text-gray-500">
                                Browser push notifications
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.notifications.pushNotifications}
                            onCheckedChange={(checked) => updateSetting('notifications.pushNotifications', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Zap className="w-5 h-5" />
                            <div>
                              <Label>Webhook Notifications</Label>
                              <p className="text-sm text-gray-500">
                                Send notifications to external webhooks
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.notifications.webhookNotifications}
                            onCheckedChange={(checked) => updateSetting('notifications.webhookNotifications', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Branding Settings */}
              <TabsContent value="branding" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Branding Configuration</CardTitle>
                    <CardDescription>
                      Customize the visual appearance of your admin interface
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input
                          id="logoUrl"
                          value={settings.branding.logoUrl}
                          onChange={(e) => updateSetting('branding.logoUrl', e.target.value)}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                      <div>
                        <Label htmlFor="faviconUrl">Favicon URL</Label>
                        <Input
                          id="faviconUrl"
                          value={settings.branding.faviconUrl}
                          onChange={(e) => updateSetting('branding.faviconUrl', e.target.value)}
                          placeholder="https://example.com/favicon.ico"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={settings.branding.primaryColor}
                            onChange={(e) => updateSetting('branding.primaryColor', e.target.value)}
                            className="w-12 h-10 border border-gray-300 rounded"
                          />
                          <Input
                            value={settings.branding.primaryColor}
                            onChange={(e) => updateSetting('branding.primaryColor', e.target.value)}
                            placeholder="#3B82F6"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={settings.branding.secondaryColor}
                            onChange={(e) => updateSetting('branding.secondaryColor', e.target.value)}
                            className="w-12 h-10 border border-gray-300 rounded"
                          />
                          <Input
                            value={settings.branding.secondaryColor}
                            onChange={(e) => updateSetting('branding.secondaryColor', e.target.value)}
                            placeholder="#1E40AF"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="fontFamily">Font Family</Label>
                      <Input
                        id="fontFamily"
                        value={settings.branding.fontFamily}
                        onChange={(e) => updateSetting('branding.fontFamily', e.target.value)}
                        placeholder="Inter, sans-serif"
                      />
                    </div>

                    <div>
                      <Label htmlFor="customCss">Custom CSS</Label>
                      <Textarea
                        id="customCss"
                        value={settings.branding.customCss}
                        onChange={(e) => updateSetting('branding.customCss', e.target.value)}
                        placeholder="/* Custom CSS styles */"
                        rows={6}
                        className="font-mono text-sm"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Add custom CSS to override default styles. Use with caution.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* System Settings */}
              <TabsContent value="system" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Configuration</CardTitle>
                    <CardDescription>
                      Advanced system settings and performance options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <Label>Debug Mode</Label>
                          <p className="text-sm text-gray-500">
                            Enable detailed error reporting
                          </p>
                        </div>
                        <Switch
                          checked={settings.system.debugMode}
                          onCheckedChange={(checked) => updateSetting('system.debugMode', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <Label>Cache Enabled</Label>
                          <p className="text-sm text-gray-500">
                            Enable system-wide caching
                          </p>
                        </div>
                        <Switch
                          checked={settings.system.cacheEnabled}
                          onCheckedChange={(checked) => updateSetting('system.cacheEnabled', checked)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="logLevel">Log Level</Label>
                        <Select 
                          value={settings.system.logLevel}
                          onValueChange={(value) => updateSetting('system.logLevel', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select log level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="warn">Warning</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="debug">Debug</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                        <Input
                          id="maxFileSize"
                          type="number"
                          value={settings.system.maxFileSize}
                          onChange={(e) => updateSetting('system.maxFileSize', parseInt(e.target.value))}
                          min="1"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Backup Configuration</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Backup Enabled</Label>
                            <p className="text-sm text-gray-500">
                              Enable automatic backups
                            </p>
                          </div>
                          <Switch
                            checked={settings.system.backupEnabled}
                            onCheckedChange={(checked) => updateSetting('system.backupEnabled', checked)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="backupFrequency">Backup Frequency</Label>
                          <Select 
                            value={settings.system.backupFrequency}
                            onValueChange={(value) => updateSetting('system.backupFrequency', value)}
                            disabled={!settings.system.backupEnabled}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
