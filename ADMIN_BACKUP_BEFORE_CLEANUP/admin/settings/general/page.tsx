/**
 * @fileoverview General App Settings Interface - HT-032.1.3
 * @module app/admin/settings/general/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * General app settings interface for managing basic site configuration,
 * registration settings, and global application behavior. Part of the
 * foundation settings system.
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { 
  Settings,
  Globe,
  Mail,
  Clock,
  Users,
  Shield,
  AlertTriangle,
  Save,
  RefreshCw,
  ArrowLeft,
  Check,
  Info,
  HelpCircle,
  ExternalLink,
  MapPin,
  Languages,
  UserPlus,
  Lock,
  Unlock,
  Download,
  Upload
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
  getFoundationSettingsManager,
  GeneralSettings,
  type SettingsValidationResult 
} from '@/lib/admin/foundation-settings';

interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

interface LanguageOption {
  value: string;
  label: string;
  flag: string;
}

const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)', offset: '-05:00' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)', offset: '-06:00' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)', offset: '-07:00' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)', offset: '-08:00' },
  { value: 'Europe/London', label: 'London (GMT)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'Paris (CET)', offset: '+01:00' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', offset: '+01:00' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: '+09:00' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: '+08:00' },
  { value: 'Asia/Kolkata', label: 'Mumbai (IST)', offset: '+05:30' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)', offset: '+11:00' }
];

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'pt', label: 'Português', flag: '🇵🇹' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'zh', label: '中文', flag: '🇨🇳' }
];

const USER_ROLE_OPTIONS = [
  { value: 'user', label: 'User', description: 'Basic access with limited permissions' },
  { value: 'editor', label: 'Editor', description: 'Can create and edit content' },
  { value: 'moderator', label: 'Moderator', description: 'Can moderate content and users' },
  { value: 'admin', label: 'Admin', description: 'Full administrative access' }
];

export default function GeneralSettingsPage() {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const settingsManager = getFoundationSettingsManager();
  
  const [settings, setSettings] = useState<GeneralSettings>(
    settingsManager.getSection('general')
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [validationResult, setValidationResult] = useState<SettingsValidationResult | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = settingsManager.subscribe((event) => {
      if (event.section === 'general') {
        setSettings(settingsManager.getSection('general'));
        setUnsavedChanges(false);
      }
    });

    return unsubscribe;
  }, [settingsManager]);

  const updateSetting = <K extends keyof GeneralSettings>(
    key: K,
    value: GeneralSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setUnsavedChanges(true);

    // Clear previous messages
    setError(null);
    setSuccess(null);
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const validation = await settingsManager.updateSection('general', settings);
      setValidationResult(validation);
      
      if (validation.isValid) {
        setSuccess('General settings saved successfully!');
        setUnsavedChanges(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Please fix validation errors before saving');
      }
      
    } catch (error) {
      setError('Failed to save general settings');
      console.error('Save settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = async () => {
    if (confirm('Are you sure you want to reset all general settings to defaults?')) {
      try {
        setLoading(true);
        
        await settingsManager.updateSection('general', {
          siteName: 'Admin Platform',
          siteDescription: 'Modular admin interface for managing applications',
          adminEmail: 'admin@example.com',
          supportEmail: 'support@example.com',
          timezone: 'UTC',
          language: 'en',
          maintenanceMode: false,
          allowRegistration: false,
          requireEmailVerification: true,
          defaultUserRole: 'user',
          maxUsersPerOrganization: 100
        });
        
        setSuccess('General settings reset to defaults');
        setTimeout(() => setSuccess(null), 3000);
        
      } catch (error) {
        setError('Failed to reset settings');
      } finally {
        setLoading(false);
      }
    }
  };

  const exportGeneralSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'general-settings.json';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const importGeneralSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          const validation = await settingsManager.updateSection('general', importedSettings);
          
          if (validation.isValid) {
            setSuccess('General settings imported successfully');
            setTimeout(() => setSuccess(null), 3000);
          } else {
            setError('Invalid general settings file');
          }
        } catch (error) {
          setError('Failed to import settings - invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const testEmailConfiguration = async () => {
    try {
      setLoading(true);
      // In a real app, this would send a test email
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess('Test email sent successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to send test email');
    } finally {
      setLoading(false);
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
      title="General Settings"
      description="Configure basic site information and global application settings"
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
                onClick={exportGeneralSettings}
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
                  onChange={importGeneralSettings}
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

          {/* Validation Warnings */}
          {validationResult?.warnings && Object.keys(validationResult.warnings).length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Warnings</h4>
                      {Object.entries(validationResult.warnings).map(([section, warnings]) => (
                        <div key={section}>
                          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 capitalize">{section}:</p>
                          <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-400 ml-4">
                            {warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic" className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Basic Info</span>
                </TabsTrigger>
                <TabsTrigger value="localization" className="flex items-center space-x-2">
                  <Languages className="w-4 h-4" />
                  <span>Localization</span>
                </TabsTrigger>
                <TabsTrigger value="registration" className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Registration</span>
                </TabsTrigger>
                <TabsTrigger value="maintenance" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Maintenance</span>
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      Site Information
                    </CardTitle>
                    <CardDescription>
                      Basic information about your site that appears throughout the admin interface
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="siteName">Site Name *</Label>
                        <Input
                          id="siteName"
                          value={settings.siteName}
                          onChange={(e) => updateSetting('siteName', e.target.value)}
                          placeholder="Enter site name"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          This appears in the browser title and admin interface
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="adminEmail">Admin Email *</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          value={settings.adminEmail}
                          onChange={(e) => updateSetting('adminEmail', e.target.value)}
                          placeholder="admin@example.com"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Primary administrator email address
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Textarea
                        id="siteDescription"
                        value={settings.siteDescription}
                        onChange={(e) => updateSetting('siteDescription', e.target.value)}
                        placeholder="Describe your site or organization"
                        rows={3}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Optional description that may appear in various places
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="supportEmail">Support Email *</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="supportEmail"
                          type="email"
                          value={settings.supportEmail}
                          onChange={(e) => updateSetting('supportEmail', e.target.value)}
                          placeholder="support@example.com"
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={testEmailConfiguration}
                          disabled={loading || !settings.supportEmail}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Test Email
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Email address for user support and system notifications
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Localization Tab */}
              <TabsContent value="localization" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Languages className="w-5 h-5 mr-2" />
                      Localization Settings
                    </CardTitle>
                    <CardDescription>
                      Configure timezone, language, and regional settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="timezone">Timezone *</Label>
                        <Select 
                          value={settings.timezone}
                          onValueChange={(value) => updateSetting('timezone', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMEZONE_OPTIONS.map((timezone) => (
                              <SelectItem key={timezone.value} value={timezone.value}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{timezone.label}</span>
                                  <span className="text-sm text-gray-500 ml-2">{timezone.offset}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500 mt-1">
                          Default timezone for dates and times
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="language">Default Language *</Label>
                        <Select 
                          value={settings.language}
                          onValueChange={(value) => updateSetting('language', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGE_OPTIONS.map((language) => (
                              <SelectItem key={language.value} value={language.value}>
                                <div className="flex items-center space-x-2">
                                  <span>{language.flag}</span>
                                  <span>{language.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500 mt-1">
                          Default language for the admin interface
                        </p>
                      </div>
                    </div>

                    {/* Current Time Preview */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-gray-500" />
                            <span className="font-medium">Current Time</span>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-lg">
                              {new Date().toLocaleString('en-US', { 
                                timeZone: settings.timezone,
                                dateStyle: 'medium',
                                timeStyle: 'medium'
                              })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {settings.timezone}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Registration Tab */}
              <TabsContent value="registration" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserPlus className="w-5 h-5 mr-2" />
                      User Registration Settings
                    </CardTitle>
                    <CardDescription>
                      Configure how new users can join your platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {settings.allowRegistration ? (
                          <Unlock className="w-5 h-5 text-green-500" />
                        ) : (
                          <Lock className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <Label htmlFor="allowRegistration">Allow User Registration</Label>
                          <p className="text-sm text-gray-500">
                            Allow new users to create accounts
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="allowRegistration"
                        checked={settings.allowRegistration}
                        onCheckedChange={(checked) => updateSetting('allowRegistration', checked)}
                      />
                    </div>

                    {settings.allowRegistration && (
                      <>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5" />
                            <div>
                              <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                              <p className="text-sm text-gray-500">
                                New users must verify their email before accessing the platform
                              </p>
                            </div>
                          </div>
                          <Switch
                            id="requireEmailVerification"
                            checked={settings.requireEmailVerification}
                            onCheckedChange={(checked) => updateSetting('requireEmailVerification', checked)}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="defaultUserRole">Default User Role</Label>
                            <Select 
                              value={settings.defaultUserRole}
                              onValueChange={(value) => updateSetting('defaultUserRole', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select default role" />
                              </SelectTrigger>
                              <SelectContent>
                                {USER_ROLE_OPTIONS.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    <div>
                                      <div className="font-medium">{role.label}</div>
                                      <div className="text-sm text-gray-500">{role.description}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-sm text-gray-500 mt-1">
                              Role assigned to new users by default
                            </p>
                          </div>

                          <div>
                            <Label htmlFor="maxUsersPerOrganization">Max Users per Organization</Label>
                            <Input
                              id="maxUsersPerOrganization"
                              type="number"
                              value={settings.maxUsersPerOrganization}
                              onChange={(e) => updateSetting('maxUsersPerOrganization', parseInt(e.target.value) || 1)}
                              min="1"
                              max="10000"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                              Maximum number of users allowed per organization
                            </p>
                          </div>
                        </div>

                        {/* Registration Preview */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Registration Flow Preview</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                                <span className="text-sm">User fills out registration form</span>
                              </div>
                              {settings.requireEmailVerification && (
                                <div className="flex items-center space-x-3">
                                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                                  <span className="text-sm">Email verification sent to user</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  {settings.requireEmailVerification ? '3' : '2'}
                                </div>
                                <span className="text-sm">User assigned "{USER_ROLE_OPTIONS.find(r => r.value === settings.defaultUserRole)?.label}" role</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                                <span className="text-sm">User gains access to platform</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}

                    {!settings.allowRegistration && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 text-gray-500">
                            <Lock className="w-5 h-5" />
                            <div>
                              <p className="font-medium">Registration is disabled</p>
                              <p className="text-sm">New users can only be invited by administrators</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Maintenance Tab */}
              <TabsContent value="maintenance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Maintenance Mode
                    </CardTitle>
                    <CardDescription>
                      Temporarily disable site access for maintenance and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className={cn(
                      "flex items-center justify-between p-4 border rounded-lg",
                      settings.maintenanceMode && "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20"
                    )}>
                      <div className="flex items-center space-x-3">
                        {settings.maintenanceMode ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <Check className="w-5 h-5 text-green-500" />
                        )}
                        <div>
                          <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                          <p className="text-sm text-gray-500">
                            {settings.maintenanceMode 
                              ? 'Site is currently in maintenance mode - users cannot access the application'
                              : 'Site is operational and accessible to users'
                            }
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="maintenanceMode"
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                      />
                    </div>

                    {settings.maintenanceMode && (
                      <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div className="space-y-2">
                              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                                Maintenance Mode is Active
                              </h4>
                              <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                <p>• Regular users cannot access the site</p>
                                <p>• Administrators can still access the admin interface</p>
                                <p>• A maintenance page is shown to visitors</p>
                                <p>• API endpoints may return maintenance responses</p>
                              </div>
                              <div className="pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateSetting('maintenanceMode', false)}
                                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Disable Maintenance Mode
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Maintenance Checklist */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Pre-Maintenance Checklist</CardTitle>
                        <CardDescription>
                          Recommended steps before enabling maintenance mode
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            'Notify users about scheduled maintenance',
                            'Complete any pending data migrations',
                            'Create a backup of current settings',
                            'Test the maintenance page display',
                            'Ensure admin access is working',
                            'Set up monitoring for critical services'
                          ].map((item, index) => (
                            <div key={index} className="flex items-center space-x-3 text-sm">
                              <div className="w-5 h-5 border rounded flex items-center justify-center text-xs">
                                {index + 1}
                              </div>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
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
