'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Settings,
  User,
  Bell,
  Palette,
  Layout,
  Zap,
  Shield,
  BarChart3,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Moon,
  Sun,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  compactMode: boolean;
  notifications: {
    desktop: boolean;
    email: boolean;
    push: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list' | 'cards';
    widgets: string[];
    autoRefresh: boolean;
    refreshInterval: number;
  };
  accessibility: {
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    reducedMotion: boolean;
    screenReader: boolean;
  };
  advanced: {
    developerMode: boolean;
    debugMode: boolean;
    betaFeatures: boolean;
    apiAccess: boolean;
  };
}

interface ExperienceMetrics {
  userSatisfaction: number;
  taskCompletionRate: number;
  averageSessionTime: number;
  errorRate: number;
  performanceScore: number;
  accessibilityScore: number;
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  tier: 'free' | 'pro' | 'enterprise';
  category: 'ui' | 'functionality' | 'performance' | 'security';
}

export default function ExperienceManager() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    compactMode: false,
    notifications: {
      desktop: true,
      email: true,
      push: false
    },
    dashboard: {
      layout: 'grid',
      widgets: ['metrics', 'recent-apps', 'notifications', 'quick-actions'],
      autoRefresh: true,
      refreshInterval: 30
    },
    accessibility: {
      highContrast: false,
      fontSize: 'medium',
      reducedMotion: false,
      screenReader: false
    },
    advanced: {
      developerMode: false,
      debugMode: false,
      betaFeatures: false,
      apiAccess: false
    }
  });

  const [metrics, setMetrics] = useState<ExperienceMetrics>({
    userSatisfaction: 4.7,
    taskCompletionRate: 94.2,
    averageSessionTime: 18.5,
    errorRate: 0.8,
    performanceScore: 92.1,
    accessibilityScore: 87.6
  });

  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([
    {
      id: 'ai-suggestions',
      name: 'AI-Powered Suggestions',
      description: 'Get intelligent suggestions during app creation',
      enabled: true,
      tier: 'pro',
      category: 'functionality'
    },
    {
      id: 'advanced-theming',
      name: 'Advanced Theming',
      description: 'Access to premium themes and customization options',
      enabled: false,
      tier: 'enterprise',
      category: 'ui'
    },
    {
      id: 'real-time-collaboration',
      name: 'Real-time Collaboration',
      description: 'Collaborate with team members in real-time',
      enabled: true,
      tier: 'pro',
      category: 'functionality'
    },
    {
      id: 'performance-insights',
      name: 'Performance Insights',
      description: 'Detailed performance analytics and optimization tips',
      enabled: true,
      tier: 'enterprise',
      category: 'performance'
    },
    {
      id: 'advanced-security',
      name: 'Advanced Security Features',
      description: 'Enhanced security scanning and compliance tools',
      enabled: true,
      tier: 'enterprise',
      category: 'security'
    }
  ]);

  const updatePreference = (category: keyof UserPreferences, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const toggleFeatureFlag = (flagId: string) => {
    setFeatureFlags(prev =>
      prev.map(flag =>
        flag.id === flagId ? { ...flag, enabled: !flag.enabled } : flag
      )
    );
  };

  const getMetricsColor = (value: number, threshold: { good: number; warning: number }) => {
    if (value >= threshold.good) return 'text-green-600';
    if (value >= threshold.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ui': return Palette;
      case 'functionality': return Zap;
      case 'performance': return BarChart3;
      case 'security': return Shield;
      default: return Settings;
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Unified Experience Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Customize your platform experience and monitor user satisfaction
          </p>
        </div>
        <Badge variant="outline" className="px-4 py-2">
          <Eye className="w-4 h-4 mr-2" />
          Experience Score: {Math.round((metrics.userSatisfaction / 5) * 100)}%
        </Badge>
      </div>

      {/* Experience Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.userSatisfaction}/5.0</div>
            <p className="text-xs text-muted-foreground">
              Based on user feedback
            </p>
            <Progress value={(metrics.userSatisfaction / 5) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricsColor(metrics.taskCompletionRate, { good: 90, warning: 75 })}`}>
              {metrics.taskCompletionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Successful task completions
            </p>
            <Progress value={metrics.taskCompletionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricsColor(metrics.performanceScore, { good: 85, warning: 70 })}`}>
              {metrics.performanceScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall platform performance
            </p>
            <Progress value={metrics.performanceScore} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preferences">User Preferences</TabsTrigger>
          <TabsTrigger value="features">Feature Management</TabsTrigger>
          <TabsTrigger value="analytics">Experience Analytics</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Theme & Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Theme & Appearance
                </CardTitle>
                <CardDescription>
                  Customize the visual appearance of your platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme">Theme Mode</Label>
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    <Switch
                      id="theme"
                      checked={preferences.theme === 'dark'}
                      onCheckedChange={(checked) =>
                        updatePreference('theme', 'theme', checked ? 'dark' : 'light')
                      }
                    />
                    <Moon className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="compact">Compact Mode</Label>
                  <Switch
                    id="compact"
                    checked={preferences.compactMode}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, compactMode: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dashboard Layout</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['grid', 'list', 'cards'].map((layout) => (
                      <Button
                        key={layout}
                        variant={preferences.dashboard.layout === layout ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updatePreference('dashboard', 'layout', layout)}
                        className="capitalize"
                      >
                        {layout}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
                  <Switch
                    id="desktop-notifications"
                    checked={preferences.notifications.desktop}
                    onCheckedChange={(checked) =>
                      updatePreference('notifications', 'desktop', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch
                    id="email-notifications"
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked) =>
                      updatePreference('notifications', 'email', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <Switch
                    id="push-notifications"
                    checked={preferences.notifications.push}
                    onCheckedChange={(checked) =>
                      updatePreference('notifications', 'push', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-refresh">Auto Refresh Dashboard</Label>
                  <Switch
                    id="auto-refresh"
                    checked={preferences.dashboard.autoRefresh}
                    onCheckedChange={(checked) =>
                      updatePreference('dashboard', 'autoRefresh', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                Developer and power user options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="developer-mode">Developer Mode</Label>
                  <Switch
                    id="developer-mode"
                    checked={preferences.advanced.developerMode}
                    onCheckedChange={(checked) =>
                      updatePreference('advanced', 'developerMode', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="debug-mode">Debug Mode</Label>
                  <Switch
                    id="debug-mode"
                    checked={preferences.advanced.debugMode}
                    onCheckedChange={(checked) =>
                      updatePreference('advanced', 'debugMode', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="beta-features">Beta Features</Label>
                  <Switch
                    id="beta-features"
                    checked={preferences.advanced.betaFeatures}
                    onCheckedChange={(checked) =>
                      updatePreference('advanced', 'betaFeatures', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="api-access">API Access</Label>
                  <Switch
                    id="api-access"
                    checked={preferences.advanced.apiAccess}
                    onCheckedChange={(checked) =>
                      updatePreference('advanced', 'apiAccess', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureFlags.map((feature) => {
              const IconComponent = getCategoryIcon(feature.category);
              return (
                <Card key={feature.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <IconComponent className="w-5 h-5" />
                        {feature.name}
                      </CardTitle>
                      <Badge className={getTierBadgeColor(feature.tier)}>
                        {feature.tier}
                      </Badge>
                    </div>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {feature.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={() => toggleFeatureFlag(feature.id)}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Usage Analytics
                </CardTitle>
                <CardDescription>
                  How users interact with the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Session Time</span>
                    <span className="font-medium">{metrics.averageSessionTime} min</span>
                  </div>
                  <Progress value={(metrics.averageSessionTime / 30) * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Error Rate</span>
                    <span className={`font-medium ${getMetricsColor(100 - metrics.errorRate, { good: 95, warning: 90 })}`}>
                      {metrics.errorRate}%
                    </span>
                  </div>
                  <Progress value={100 - metrics.errorRate} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Accessibility Score</span>
                    <span className={`font-medium ${getMetricsColor(metrics.accessibilityScore, { good: 85, warning: 70 })}`}>
                      {metrics.accessibilityScore}%
                    </span>
                  </div>
                  <Progress value={metrics.accessibilityScore} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Device & Browser Analytics
                </CardTitle>
                <CardDescription>
                  Platform usage across different devices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <Monitor className="w-8 h-8 mx-auto text-blue-600" />
                    <div className="text-sm font-medium">Desktop</div>
                    <div className="text-2xl font-bold">68%</div>
                  </div>
                  <div className="space-y-2">
                    <Tablet className="w-8 h-8 mx-auto text-green-600" />
                    <div className="text-sm font-medium">Tablet</div>
                    <div className="text-2xl font-bold">19%</div>
                  </div>
                  <div className="space-y-2">
                    <Smartphone className="w-8 h-8 mx-auto text-purple-600" />
                    <div className="text-sm font-medium">Mobile</div>
                    <div className="text-2xl font-bold">13%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Accessibility Settings
              </CardTitle>
              <CardDescription>
                Configure accessibility features for better usability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-contrast">High Contrast Mode</Label>
                    <Switch
                      id="high-contrast"
                      checked={preferences.accessibility.highContrast}
                      onCheckedChange={(checked) =>
                        updatePreference('accessibility', 'highContrast', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduced-motion">Reduced Motion</Label>
                    <Switch
                      id="reduced-motion"
                      checked={preferences.accessibility.reducedMotion}
                      onCheckedChange={(checked) =>
                        updatePreference('accessibility', 'reducedMotion', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="screen-reader">Screen Reader Support</Label>
                    <Switch
                      id="screen-reader"
                      checked={preferences.accessibility.screenReader}
                      onCheckedChange={(checked) =>
                        updatePreference('accessibility', 'screenReader', checked)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['small', 'medium', 'large'].map((size) => (
                        <Button
                          key={size}
                          variant={preferences.accessibility.fontSize === size ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updatePreference('accessibility', 'fontSize', size)}
                          className="capitalize"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800 mb-2">
                      <Info className="w-4 h-4" />
                      <span className="font-medium">Accessibility Score</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900 mb-2">
                      {metrics.accessibilityScore}%
                    </div>
                    <p className="text-sm text-blue-700">
                      Based on WCAG 2.1 guidelines
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}