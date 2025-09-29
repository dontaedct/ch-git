/**
 * @fileoverview Unified Experience Component - HT-032.4.1
 * @module components/admin/unified-experience
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * React component for managing unified user experience across all
 * admin interface components with consistent design patterns,
 * performance monitoring, and user experience optimization.
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { 
  Activity,
  Eye,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Target,
  Palette,
  Layout,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle2,
  AlertTriangle,
  Info,
  Settings,
  Sparkles,
  Heart,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

// User Experience Metrics Types
interface UserExperienceMetrics {
  userSatisfaction: {
    overallRating: number;
    totalResponses: number;
    trends: {
      thisWeek: number;
      lastWeek: number;
      change: number;
    };
  };
  usabilityMetrics: {
    taskCompletionRate: number;
    averageTaskTime: number;
    errorRate: number;
    learnabilityScore: number;
  };
  accessibilityCompliance: {
    wcagAALevel: number;
    wcagAAALevel: number;
    colorContrastPass: boolean;
    keyboardNavigationPass: boolean;
    screenReaderCompatible: boolean;
  };
  performanceMetrics: {
    pageLoadTime: number;
    timeToInteractive: number;
    cumulativeLayoutShift: number;
    firstContentfulPaint: number;
  };
  deviceCompatibility: {
    desktop: { support: number; issues: string[] };
    tablet: { support: number; issues: string[] };
    mobile: { support: number; issues: string[] };
  };
}

interface DesignSystemMetrics {
  consistency: {
    colorUsage: number;
    typographyConsistency: number;
    componentReuse: number;
    spacingConsistency: number;
  };
  designTokens: {
    totalTokens: number;
    activeTokens: number;
    deprecatedTokens: number;
    customOverrides: number;
  };
  componentLibrary: {
    totalComponents: number;
    reusableComponents: number;
    documentedComponents: number;
    testedComponents: number;
  };
}

interface UnifiedExperienceProps {
  systemHealth: {
    overallHealth: number;
    componentHealth: Array<{
      component: string;
      status: 'healthy' | 'warning' | 'error';
      score: number;
      message: string;
    }>;
  };
  performanceMetrics: {
    adminInterfaceLoadTime: number;
    templateRegistrationTime: number;
    settingsRenderingTime: number;
    templateDiscoveryTime: number;
    marketplaceSearchTime: number;
  };
}

export function UnifiedExperienceComponent({ 
  systemHealth, 
  performanceMetrics 
}: UnifiedExperienceProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');

  // Mock user experience metrics
  const [uxMetrics, setUxMetrics] = useState<UserExperienceMetrics>({
    userSatisfaction: {
      overallRating: 4.7,
      totalResponses: 156,
      trends: {
        thisWeek: 4.7,
        lastWeek: 4.5,
        change: 0.2
      }
    },
    usabilityMetrics: {
      taskCompletionRate: 94.5,
      averageTaskTime: 3.2,
      errorRate: 2.1,
      learnabilityScore: 88
    },
    accessibilityCompliance: {
      wcagAALevel: 96,
      wcagAAALevel: 84,
      colorContrastPass: true,
      keyboardNavigationPass: true,
      screenReaderCompatible: true
    },
    performanceMetrics: {
      pageLoadTime: performanceMetrics.adminInterfaceLoadTime,
      timeToInteractive: 1200,
      cumulativeLayoutShift: 0.08,
      firstContentfulPaint: 800
    },
    deviceCompatibility: {
      desktop: { support: 99, issues: [] },
      tablet: { support: 95, issues: ['Minor layout adjustments needed'] },
      mobile: { support: 92, issues: ['Touch target sizes', 'Responsive navigation'] }
    }
  });

  const [designMetrics, setDesignMetrics] = useState<DesignSystemMetrics>({
    consistency: {
      colorUsage: 94,
      typographyConsistency: 96,
      componentReuse: 88,
      spacingConsistency: 92
    },
    designTokens: {
      totalTokens: 147,
      activeTokens: 142,
      deprecatedTokens: 3,
      customOverrides: 2
    },
    componentLibrary: {
      totalComponents: 68,
      reusableComponents: 63,
      documentedComponents: 65,
      testedComponents: 58
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-500';
    if (score >= 85) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 95) return 'default';
    if (score >= 85) return 'secondary';
    return 'destructive';
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTrend = (change: number) => {
    const isPositive = change > 0;
    return (
      <div className={cn(
        "flex items-center text-sm",
        isPositive ? "text-green-500" : "text-red-500"
      )}>
        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {Math.abs(change).toFixed(1)}
      </div>
    );
  };

  if (!mounted) return null;

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  return (
    <div className="space-y-6">
      {/* User Experience Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            User Experience Overview
          </CardTitle>
          <CardDescription>
            Comprehensive view of user experience metrics and satisfaction scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* User Satisfaction */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-1">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-2xl font-bold">{uxMetrics.userSatisfaction.overallRating}</span>
                <span className="text-sm text-gray-500">/5.0</span>
              </div>
              <div className="text-sm font-medium">User Satisfaction</div>
              <div className="text-xs text-gray-500">
                {uxMetrics.userSatisfaction.totalResponses} responses
              </div>
              {formatTrend(uxMetrics.userSatisfaction.trends.change)}
            </div>

            {/* Task Completion Rate */}
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-500">
                {uxMetrics.usabilityMetrics.taskCompletionRate}%
              </div>
              <div className="text-sm font-medium">Task Completion</div>
              <Progress 
                value={uxMetrics.usabilityMetrics.taskCompletionRate} 
                className="h-2 w-full"
              />
            </div>

            {/* Average Task Time */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <Clock className="w-4 h-4 mr-1 text-blue-500" />
                <span className="text-2xl font-bold">{uxMetrics.usabilityMetrics.averageTaskTime}</span>
                <span className="text-sm text-gray-500 ml-1">min</span>
              </div>
              <div className="text-sm font-medium">Avg. Task Time</div>
              <div className="text-xs text-gray-500">Target: &lt;5 min</div>
            </div>

            {/* Error Rate */}
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-500">
                {uxMetrics.usabilityMetrics.errorRate}%
              </div>
              <div className="text-sm font-medium">Error Rate</div>
              <div className="text-xs text-gray-500">Target: &lt;5%</div>
              <CheckCircle2 className="w-4 h-4 mx-auto text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics Tabs */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="design">Design System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usability Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Usability Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Task Completion Rate', value: uxMetrics.usabilityMetrics.taskCompletionRate, unit: '%', target: 90 },
                    { label: 'Learnability Score', value: uxMetrics.usabilityMetrics.learnabilityScore, unit: '%', target: 80 },
                    { label: 'Error Rate', value: uxMetrics.usabilityMetrics.errorRate, unit: '%', target: 5, inverse: true }
                  ].map((metric) => (
                    <div key={metric.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.label}</span>
                        <span className={cn(
                          "text-sm font-bold",
                          metric.inverse 
                            ? (metric.value <= metric.target ? "text-green-500" : "text-red-500")
                            : (metric.value >= metric.target ? "text-green-500" : "text-red-500")
                        )}>
                          {metric.value}{metric.unit}
                        </span>
                      </div>
                      <Progress 
                        value={metric.inverse ? 100 - metric.value : metric.value} 
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500">
                        Target: {metric.inverse ? '≤' : '≥'}{metric.target}{metric.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Device Compatibility */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Layout className="w-4 h-4 mr-2" />
                  Device Compatibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { device: 'Desktop', icon: Monitor, data: uxMetrics.deviceCompatibility.desktop },
                    { device: 'Tablet', icon: Tablet, data: uxMetrics.deviceCompatibility.tablet },
                    { device: 'Mobile', icon: Smartphone, data: uxMetrics.deviceCompatibility.mobile }
                  ].map(({ device, icon: Icon, data }) => (
                    <div key={device} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Icon className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm font-medium">{device}</span>
                        </div>
                        <Badge variant={getScoreBadgeVariant(data.support)} className="text-xs">
                          {data.support}%
                        </Badge>
                      </div>
                      <Progress value={data.support} className="h-2" />
                      {data.issues.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Issues: {data.issues.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* WCAG Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  WCAG Compliance
                </CardTitle>
                <CardDescription>
                  Web Content Accessibility Guidelines compliance levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">WCAG 2.1 AA Level</span>
                      <span className={cn("text-sm font-bold", getScoreColor(uxMetrics.accessibilityCompliance.wcagAALevel))}>
                        {uxMetrics.accessibilityCompliance.wcagAALevel}%
                      </span>
                    </div>
                    <Progress value={uxMetrics.accessibilityCompliance.wcagAALevel} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">WCAG 2.1 AAA Level</span>
                      <span className={cn("text-sm font-bold", getScoreColor(uxMetrics.accessibilityCompliance.wcagAAALevel))}>
                        {uxMetrics.accessibilityCompliance.wcagAAALevel}%
                      </span>
                    </div>
                    <Progress value={uxMetrics.accessibilityCompliance.wcagAAALevel} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accessibility Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  Accessibility Features
                </CardTitle>
                <CardDescription>
                  Core accessibility feature compliance status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Color Contrast', status: uxMetrics.accessibilityCompliance.colorContrastPass },
                    { label: 'Keyboard Navigation', status: uxMetrics.accessibilityCompliance.keyboardNavigationPass },
                    { label: 'Screen Reader Compatible', status: uxMetrics.accessibilityCompliance.screenReaderCompatible }
                  ].map((feature) => (
                    <div key={feature.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm font-medium">{feature.label}</span>
                      <div className="flex items-center">
                        {feature.status ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="ml-2 text-sm font-medium">
                          {feature.status ? 'Compliant' : 'Needs Review'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Core Web Vitals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Core Web Vitals
                </CardTitle>
                <CardDescription>
                  Essential performance metrics for user experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      label: 'Page Load Time', 
                      value: uxMetrics.performanceMetrics.pageLoadTime, 
                      format: formatTime,
                      target: 500,
                      good: uxMetrics.performanceMetrics.pageLoadTime < 500
                    },
                    { 
                      label: 'Time to Interactive', 
                      value: uxMetrics.performanceMetrics.timeToInteractive, 
                      format: formatTime,
                      target: 1500,
                      good: uxMetrics.performanceMetrics.timeToInteractive < 1500
                    },
                    { 
                      label: 'First Contentful Paint', 
                      value: uxMetrics.performanceMetrics.firstContentfulPaint, 
                      format: formatTime,
                      target: 1000,
                      good: uxMetrics.performanceMetrics.firstContentfulPaint < 1000
                    },
                    { 
                      label: 'Cumulative Layout Shift', 
                      value: uxMetrics.performanceMetrics.cumulativeLayoutShift, 
                      format: (v: number) => v.toFixed(3),
                      target: 0.1,
                      good: uxMetrics.performanceMetrics.cumulativeLayoutShift < 0.1
                    }
                  ].map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm font-medium">{metric.label}</span>
                      <div className="flex items-center space-x-2">
                        <span className={cn(
                          "text-sm font-bold",
                          metric.good ? "text-green-500" : "text-red-500"
                        )}>
                          {metric.format(metric.value)}
                        </span>
                        {metric.good ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Component Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Component Performance
                </CardTitle>
                <CardDescription>
                  Performance metrics for key platform components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Template Registration', value: performanceMetrics.templateRegistrationTime * 1000, target: 2000 },
                    { label: 'Settings Rendering', value: performanceMetrics.settingsRenderingTime, target: 200 },
                    { label: 'Template Discovery', value: performanceMetrics.templateDiscoveryTime * 1000, target: 1000 },
                    { label: 'Marketplace Search', value: performanceMetrics.marketplaceSearchTime, target: 300 }
                  ].map((metric) => (
                    <div key={metric.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.label}</span>
                        <span className={cn(
                          "text-sm font-bold",
                          metric.value < metric.target ? "text-green-500" : "text-red-500"
                        )}>
                          {formatTime(metric.value)}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, (metric.target - metric.value) / metric.target * 100)} 
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500">
                        Target: &lt;{formatTime(metric.target)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="design" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Design Consistency */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Palette className="w-4 h-4 mr-2" />
                  Design Consistency
                </CardTitle>
                <CardDescription>
                  Consistency metrics across design system elements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Color Usage', value: designMetrics.consistency.colorUsage },
                    { label: 'Typography', value: designMetrics.consistency.typographyConsistency },
                    { label: 'Component Reuse', value: designMetrics.consistency.componentReuse },
                    { label: 'Spacing', value: designMetrics.consistency.spacingConsistency }
                  ].map((metric) => (
                    <div key={metric.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.label}</span>
                        <span className={cn("text-sm font-bold", getScoreColor(metric.value))}>
                          {metric.value}%
                        </span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Component Library Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Layout className="w-4 h-4 mr-2" />
                  Component Library
                </CardTitle>
                <CardDescription>
                  Statistics about the design system component library
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-blue-500">
                      {designMetrics.componentLibrary.totalComponents}
                    </div>
                    <div className="text-sm text-gray-500">Total Components</div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-green-500">
                      {designMetrics.componentLibrary.reusableComponents}
                    </div>
                    <div className="text-sm text-gray-500">Reusable</div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-purple-500">
                      {designMetrics.componentLibrary.documentedComponents}
                    </div>
                    <div className="text-sm text-gray-500">Documented</div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-orange-500">
                      {designMetrics.componentLibrary.testedComponents}
                    </div>
                    <div className="text-sm text-gray-500">Tested</div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Documentation Coverage</span>
                    <span className="text-sm font-medium">
                      {Math.round((designMetrics.componentLibrary.documentedComponents / designMetrics.componentLibrary.totalComponents) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(designMetrics.componentLibrary.documentedComponents / designMetrics.componentLibrary.totalComponents) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Experience Optimization Recommendations
          </CardTitle>
          <CardDescription>
            Actionable recommendations to improve unified user experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {uxMetrics.deviceCompatibility.mobile.support < 95 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Mobile Experience:</strong> Consider optimizing touch targets and responsive navigation to improve mobile compatibility from {uxMetrics.deviceCompatibility.mobile.support}% to 95%+.
                </AlertDescription>
              </Alert>
            )}
            
            {uxMetrics.accessibilityCompliance.wcagAAALevel < 90 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Accessibility:</strong> Work on improving WCAG AAA compliance from {uxMetrics.accessibilityCompliance.wcagAAALevel}% to 90%+ by addressing color contrast and semantic markup issues.
                </AlertDescription>
              </Alert>
            )}
            
            {designMetrics.consistency.componentReuse < 90 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Design Consistency:</strong> Increase component reuse from {designMetrics.consistency.componentReuse}% to 90%+ by identifying and consolidating duplicate UI patterns.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
