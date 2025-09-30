/**
 * @fileoverview Client Settings Form - Comprehensive PRD-aligned configuration
 * Handles all client micro-app settings: booking, email, branding, modules
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Save,
  Upload,
  ExternalLink,
  Mail,
  Calendar,
  Palette,
  Package,
  Shield,
  Eye,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useCSRF } from '@/lib/security/csrf';

// PRD-aligned settings interface
interface ClientSettings {
  // Booking Configuration
  bookingUrl: string;
  calendarProvider: string;
  timezone: string;
  appointmentTypes: string[];

  // Email Configuration
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  emailFrom: string;
  emailSubjectTemplate: string;
  emailBodyTemplate: string;

  // Client Branding
  clientLogo: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  customCss: string;

  // Module Configuration
  enabledModules: string[];

  // Feature Flags
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enableMultiLanguage: boolean;

  // Security
  enableRLS: boolean;
  sessionTimeout: number;
}

export function ClientSettingsForm() {
  const { getCSRFHeaders } = useCSRF();
  const [activeTab, setActiveTab] = useState('booking');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Default settings aligned with PRD requirements
  const [settings, setSettings] = useState<ClientSettings>({
    bookingUrl: '',
    calendarProvider: 'calendly',
    timezone: 'America/New_York',
    appointmentTypes: [],
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    emailFrom: '',
    emailSubjectTemplate: 'Your Consultation Results from {{clientName}}',
    emailBodyTemplate: '',
    clientLogo: '',
    primaryColor: '#0066cc',
    secondaryColor: '#f0f9ff',
    fontFamily: 'Inter',
    customCss: '',
    enabledModules: ['forms', 'documents', 'analytics'],
    enableAnalytics: true,
    enableNotifications: true,
    enableMultiLanguage: false,
    enableRLS: true,
    sessionTimeout: 24
  });

  // Available modules per PRD
  const availableModules = [
    { id: 'forms', name: 'Form Builder', description: 'Advanced forms with validation', tier: 'core' },
    { id: 'documents', name: 'Document Generator', description: 'PDF/HTML generation', tier: 'core' },
    { id: 'analytics', name: 'Basic Analytics', description: 'Usage metrics and reports', tier: 'professional' },
    { id: 'automation', name: 'Workflow Automation', description: 'n8n integration', tier: 'professional' },
    { id: 'integrations', name: 'API Integrations', description: 'External service connections', tier: 'business' },
    { id: 'advanced-auth', name: 'Advanced Auth', description: 'SSO and multi-factor auth', tier: 'business' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Try to load from API first, fallback to localStorage
      const response = await fetch('/api/client-settings', {
        headers: getCSRFHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prevSettings => ({ ...prevSettings, ...data }));
      } else {
        // Fallback to localStorage for demo
        const saved = localStorage.getItem('client-settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSettings(prevSettings => ({ ...prevSettings, ...parsed }));
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings, using defaults');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/client-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getCSRFHeaders(),
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Settings saved successfully!');
        // Also save to localStorage as backup
        localStorage.setItem('client-settings', JSON.stringify(settings));
      } else {
        throw new Error('Failed to save to API');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Fallback to localStorage
      localStorage.setItem('client-settings', JSON.stringify(settings));
      toast.success('Settings saved locally');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof ClientSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleModule = (moduleId: string) => {
    setSettings(prev => ({
      ...prev,
      enabledModules: prev.enabledModules.includes(moduleId)
        ? prev.enabledModules.filter(id => id !== moduleId)
        : [...prev.enabledModules, moduleId]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="booking" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Booking
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Booking Settings */}
        <TabsContent value="booking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="booking-url">Booking URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="booking-url"
                      placeholder="https://calendly.com/your-username"
                      value={settings.bookingUrl}
                      onChange={(e) => updateSetting('bookingUrl', e.target.value)}
                    />
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calendar-provider">Calendar Provider</Label>
                  <Select value={settings.calendarProvider} onValueChange={(value) => updateSetting('calendarProvider', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calendly">Calendly</SelectItem>
                      <SelectItem value="acuity">Acuity Scheduling</SelectItem>
                      <SelectItem value="google">Google Calendar</SelectItem>
                      <SelectItem value="outlook">Outlook</SelectItem>
                      <SelectItem value="custom">Custom Integration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    placeholder="smtp.gmail.com"
                    value={settings.smtpHost}
                    onChange={(e) => updateSetting('smtpHost', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    placeholder="587"
                    value={settings.smtpPort}
                    onChange={(e) => updateSetting('smtpPort', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-user">SMTP Username</Label>
                  <Input
                    id="smtp-user"
                    placeholder="your.email@domain.com"
                    value={settings.smtpUser}
                    onChange={(e) => updateSetting('smtpUser', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">SMTP Password</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    placeholder="app-password"
                    value={settings.smtpPassword}
                    onChange={(e) => updateSetting('smtpPassword', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-from">From Address</Label>
                <Input
                  id="email-from"
                  placeholder="noreply@yourdomain.com"
                  value={settings.emailFrom}
                  onChange={(e) => updateSetting('emailFrom', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject Template</Label>
                <Input
                  id="email-subject"
                  placeholder="Your Consultation Results from {{clientName}}"
                  value={settings.emailSubjectTemplate}
                  onChange={(e) => updateSetting('emailSubjectTemplate', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Available variables: <code>{'{{clientName}}'}</code>, <code>{'{{planTitle}}'}</code>, <code>{'{{date}}'}</code>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-body">Body Template</Label>
                <Textarea
                  id="email-body"
                  placeholder="Dear {{clientName}}, attached are your consultation results..."
                  className="min-h-[120px]"
                  value={settings.emailBodyTemplate}
                  onChange={(e) => updateSetting('emailBodyTemplate', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visual Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Client Logo</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                  {settings.clientLogo && (
                    <Badge variant="secondary">Logo uploaded</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Recommended: PNG or SVG, 200x80px maximum
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      className="w-16"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      placeholder="#0066cc"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                      className="w-16"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                      placeholder="#f0f9ff"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-family">Typography</Label>
                <Select value={settings.fontFamily} onValueChange={(value) => updateSetting('fontFamily', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter (Modern)</SelectItem>
                    <SelectItem value="Roboto">Roboto (Clean)</SelectItem>
                    <SelectItem value="Open Sans">Open Sans (Friendly)</SelectItem>
                    <SelectItem value="Lato">Lato (Professional)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-css">Custom CSS</Label>
                <Textarea
                  id="custom-css"
                  placeholder=".custom-styles { /* Your custom styles */ }"
                  className="min-h-[120px] font-mono"
                  value={settings.customCss}
                  onChange={(e) => updateSetting('customCss', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Advanced: Add custom CSS for additional styling
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Module Settings */}
        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Modules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {availableModules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={settings.enabledModules.includes(module.id)}
                        onCheckedChange={() => toggleModule(module.id)}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{module.name}</span>
                          <Badge variant={
                            module.tier === 'core' ? 'default' :
                            module.tier === 'professional' ? 'secondary' :
                            'outline'
                          }>
                            {module.tier}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                    {settings.enabledModules.includes(module.id) && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'enableAnalytics', label: 'Analytics & Tracking', description: 'Enable usage analytics and reporting' },
                { key: 'enableNotifications', label: 'Email Notifications', description: 'Send automatic email notifications' },
                { key: 'enableMultiLanguage', label: 'Multi-Language Support', description: 'Enable internationalization' }
              ].map((flag) => (
                <div key={flag.key} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={flag.key}>{flag.label}</Label>
                    <p className="text-sm text-muted-foreground">{flag.description}</p>
                  </div>
                  <Switch
                    id={flag.key}
                    checked={settings[flag.key as keyof ClientSettings] as boolean}
                    onCheckedChange={(checked) => updateSetting(flag.key as keyof ClientSettings, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-rls">Row Level Security (RLS)</Label>
                  <p className="text-sm text-muted-foreground">
                    Enforce data isolation between clients
                  </p>
                </div>
                <Switch
                  id="enable-rls"
                  checked={settings.enableRLS}
                  onCheckedChange={(checked) => updateSetting('enableRLS', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                <Select
                  value={settings.sessionTimeout.toString()}
                  onValueChange={(value) => updateSetting('sessionTimeout', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="8">8 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="168">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <div className="flex gap-3">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview Changes
          </Button>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}