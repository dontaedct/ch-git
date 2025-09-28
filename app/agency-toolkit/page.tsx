/**
 * @fileoverview Agency Toolkit Dashboard - Step 1 of Client App Creation Guide
 * Main control center for rapid micro-app development (≤7 days delivery)
 * PRD-compliant: Minimal complexity, professional appearance, clear CTAs
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrchestrationModuleCard } from "@/components/agency-toolkit/OrchestrationModuleCard";
import { ModulesModuleCard } from "@/components/agency-toolkit/ModulesModuleCard";
import { MarketplaceModuleCard } from "@/components/agency-toolkit/MarketplaceModuleCard";
import { HandoverModuleCard } from "@/components/agency-toolkit/HandoverModuleCard";
import {
  TrendingUp,
  Users,
  Zap,
  Timer,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Activity,
  BarChart3,
  Settings,
  Monitor,
  Rocket
} from "lucide-react";

// PRD-aligned interfaces for agency toolkit optimization
interface AgencyMetrics {
  totalClients: number;
  activeMicroApps: number;
  monthlyRevenue: number;
  avgDeliveryTime: string;
  avgProjectValue: number;
  clientSatisfaction: number;
  systemHealth: number;
  aiProductivity: number; // AI-assisted development efficiency
}

interface EssentialTool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  tier: 'core' | 'professional' | 'business';
  deliveryImpact: string;
  lastUsed?: string;
}

interface ProjectMetric {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  trend?: 'up' | 'down' | 'stable';
  color: string;
}

export default function AgencyToolkitPage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PRD-aligned metrics for agency business
  const [metrics, setMetrics] = useState<AgencyMetrics>({
    totalClients: 0,
    activeMicroApps: 0,
    monthlyRevenue: 0,
    avgDeliveryTime: '4.2 days',
    avgProjectValue: 3500,
    clientSatisfaction: 94.5,
    systemHealth: 98.7,
    aiProductivity: 85 // AI-assisted development efficiency
  });

  // Organized by workflow stages for better UX
  const workflowStages = {
    'Project Setup': [
      {
        id: 'clients',
        name: 'Client Management',
        description: 'Select & manage client workspaces for development',
        icon: Users,
        href: '/clients',
        tier: 'core',
        deliveryImpact: 'Step 1 - Client selection & workspace access'
      },
      {
        id: 'intake',
        name: 'Client Intake',
        description: 'Rapid client onboarding & requirements capture',
        icon: Users,
        href: '/intake',
        tier: 'core',
        deliveryImpact: 'Day 0 - Project initiation'
      }
    ],
    'Development Tools': [
      {
        id: 'templates',
        name: 'Template Library',
        description: 'Pre-built micro-app templates for <7 day delivery',
        icon: Zap,
        href: '/agency-toolkit/templates',
        tier: 'core',
        deliveryImpact: 'Days 1-2 - Foundation setup'
      },
      {
        id: 'forms',
        name: 'Form Builder',
        description: 'Advanced forms with validation & automation',
        icon: CheckCircle,
        href: '/agency-toolkit/forms',
        tier: 'professional',
        deliveryImpact: 'Days 2-3 - Core functionality'
      },
      {
        id: 'theming',
        name: 'Brand Customizer',
        description: 'White-label theming & client branding',
        icon: BarChart3,
        href: '/agency-toolkit/theming',
        tier: 'professional',
        deliveryImpact: 'Days 3-4 - Brand integration'
      },
      {
        id: 'documents',
        name: 'Document Generator',
        description: 'PDF/HTML generation with client branding',
        icon: Activity,
        href: '/agency-toolkit/documents',
        tier: 'business',
        deliveryImpact: 'Days 4-5 - Output systems'
      }
    ],
    'Operations & Management': [
      {
        id: 'deployment',
        name: 'Production Deploy',
        description: 'Deploy completed apps to production',
        icon: Rocket,
        href: '/production/dashboards',
        tier: 'business',
        deliveryImpact: 'Days 6-7 - Production deployment'
      },
      {
        id: 'admin',
        name: 'Admin Dashboard',
        description: 'Agency-level management & system oversight',
        icon: Settings,
        href: '/admin',
        tier: 'business',
        deliveryImpact: 'Management - Agency oversight'
      },
      {
        id: 'monitoring',
        name: 'System Health',
        description: 'Monitor system performance & health metrics',
        icon: Monitor,
        href: '/operability/health-monitoring',
        tier: 'business',
        deliveryImpact: 'Operations - System monitoring'
      }
    ]
  };

  // Key project metrics for agency dashboard
  const projectMetrics: ProjectMetric[] = [
    {
      label: 'Monthly Revenue',
      value: `$${metrics.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-500',
      trend: 'up'
    },
    {
      label: 'Avg Project Value',
      value: `$${metrics.avgProjectValue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-blue-500',
      trend: 'up'
    },
    {
      label: 'Delivery Time',
      value: metrics.avgDeliveryTime,
      icon: Timer,
      color: 'text-purple-500',
      trend: 'down' // Lower is better for delivery time
    },
    {
      label: 'AI Productivity',
      value: `${metrics.aiProductivity}%`,
      icon: Zap,
      color: 'text-yellow-500',
      trend: 'up'
    }
  ];

  // Load agency metrics from database
  useEffect(() => {
    const loadAgencyData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch agency metrics
        const response = await fetch('/api/agency-data?action=metrics');
        const result = await response.json();

        console.log('Agency data API response:', result);

        if (result.success && result.data) {
          // Map database data to PRD-aligned metrics
          const updatedMetrics: AgencyMetrics = {
            totalClients: result.data.totalClients || 0,
            activeMicroApps: result.data.activeMicroApps || 0,
            monthlyRevenue: result.data.totalClients * 3500 || 0, // Avg $3.5k per client
            avgDeliveryTime: result.data.avgDeliveryTime || '4.2 days',
            avgProjectValue: 3500, // PRD target pricing
            clientSatisfaction: result.data.clientSatisfaction || 94.5,
            systemHealth: result.data.systemHealth || 98.7,
            aiProductivity: 85 // AI-assisted development efficiency
          };

          setMetrics(updatedMetrics);
        } else {
          // Use demo data for fresh installations
          setMetrics({
            totalClients: 5,
            activeMicroApps: 8,
            monthlyRevenue: 17500,
            avgDeliveryTime: '4.2 days',
            avgProjectValue: 3500,
            clientSatisfaction: 94.5,
            systemHealth: 98.7,
            aiProductivity: 85
          });
        }

      } catch (err) {
        console.error('Error loading agency data:', err);
        setError('Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadAgencyData();
  }, []);

  // Mount effect for theme handling
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading agency dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-destructive text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Unable to Load Dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header Section */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex justify-between items-start">
            <div className="space-y-8">
              {/* Refined Title Section */}
              <div className="space-y-3">
                <h1 className="text-5xl font-bold text-high-emphasis tracking-tight">
                  Agency Toolkit
                </h1>
                <p className="text-xl text-medium-emphasis max-w-2xl leading-relaxed">
                  Rapid micro-app development platform with ≤7 day delivery guarantee
                </p>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  className="font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
                  onClick={() => window.location.href = '/clients'}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Manage Clients
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-medium border-2 hover:border-primary/50 px-6 py-3"
                  onClick={() => window.location.href = '/intake'}
                >
                  Start New Project
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-medium border-2 hover:border-primary/50 px-6 py-3"
                  onClick={() => window.location.href = '/production/dashboards'}
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy Apps
                </Button>
              </div>

              {/* Polished Stats Bar */}
              <div className="flex items-center gap-8 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm ring-2 ring-green-500/20"></div>
                  <span className="text-sm font-medium text-high-emphasis">{metrics.totalClients} Active Clients</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm ring-2 ring-blue-500/20"></div>
                  <span className="text-sm font-medium text-high-emphasis">{metrics.avgDeliveryTime} Avg Delivery</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full shadow-sm ring-2 ring-purple-500/20"></div>
                  <span className="text-sm font-medium text-high-emphasis">{metrics.systemHealth.toFixed(1)}% System Health</span>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Enhanced Performance Metrics */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-high-emphasis">Performance Overview</h2>
            <p className="text-medium-emphasis">Real-time metrics and key performance indicators</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projectMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <p className="text-xs font-semibold text-medium-emphasis uppercase tracking-wider">
                          {metric.label}
                        </p>
                        <p className="text-3xl font-bold text-high-emphasis group-hover:scale-105 transition-transform duration-200">
                          {metric.value}
                        </p>
                        {metric.trend && (
                          <div className="flex items-center gap-1">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              metric.trend === 'up' ? "bg-green-500" :
                              metric.trend === 'down' ? "bg-red-500" : "bg-gray-500"
                            )} />
                            <span className="text-xs text-medium-emphasis">
                              {metric.trend === 'up' ? 'Trending up' :
                               metric.trend === 'down' ? 'Trending down' : 'Stable'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={cn(
                        "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
                        metric.color.replace('text-', 'bg-'), "bg-opacity-10 group-hover:bg-opacity-20"
                      )}>
                        <IconComponent className={cn("w-6 h-6", metric.color)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Enhanced Workflow Tools */}
        {Object.entries(workflowStages).map(([stageName, tools], stageIndex) => (
          <section key={stageName} className="space-y-6">
            <Card className="border-0 bg-gradient-to-r from-card/50 to-transparent backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
                    <span className="text-lg font-bold text-primary">{stageIndex + 1}</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-high-emphasis">{stageName}</CardTitle>
                    <p className="text-medium-emphasis mt-1">
                      {stageName === 'Project Setup' && 'Initialize projects and establish client relationships'}
                      {stageName === 'Development Tools' && 'Build, customize, and refine micro-applications'}
                      {stageName === 'Operations & Management' && 'Deploy, monitor, and maintain production systems'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tools.map((tool) => {
                    const IconComponent = tool.icon;
                    return (
                      <Card
                        key={tool.id}
                        className="group cursor-pointer hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm"
                        onClick={() => window.location.href = tool.href}
                      >
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors duration-200">
                              <IconComponent className="w-6 h-6 text-primary" />
                            </div>
                            <Badge
                              variant={
                                tool.tier === 'core' ? 'default' :
                                tool.tier === 'professional' ? 'secondary' :
                                'outline'
                              }
                              className="text-xs font-medium"
                            >
                              {tool.tier}
                            </Badge>
                          </div>
                          <div className="space-y-3 text-left">
                            <h3 className="font-semibold text-lg text-high-emphasis group-hover:text-primary transition-colors duration-200">
                              {tool.name}
                            </h3>
                            <p className="text-sm text-medium-emphasis leading-relaxed">
                              {tool.description}
                            </p>
                            <div className="pt-2 border-t border-border/50">
                              <p className="text-xs font-medium text-primary bg-primary/5 px-3 py-1 rounded-full inline-block">
                                {tool.deliveryImpact}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        ))}

        {/* Enhanced System Status */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-high-emphasis">System Status</h2>
            <p className="text-medium-emphasis">Real-time monitoring and health indicators</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="group hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300 border-0 bg-gradient-to-br from-green-50/50 to-card dark:from-green-950/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-medium-emphasis uppercase tracking-wider">System Health</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{metrics.systemHealth.toFixed(1)}%</p>
                    <p className="text-xs text-green-600/70 dark:text-green-400/70">All systems operational</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 border-0 bg-gradient-to-br from-blue-50/50 to-card dark:from-blue-950/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Activity className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-medium-emphasis uppercase tracking-wider">Client Satisfaction</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{metrics.clientSatisfaction.toFixed(1)}%</p>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Above industry average</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 border-0 bg-gradient-to-br from-purple-50/50 to-card dark:from-purple-950/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Zap className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-medium-emphasis uppercase tracking-wider">AI Productivity</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{metrics.aiProductivity}%</p>
                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70">AI-enhanced workflows</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Enhanced Advanced Features */}
        <section className="space-y-6">
          <Card className="border-0 bg-gradient-to-r from-card/50 to-transparent backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-high-emphasis">Advanced Features</CardTitle>
                  <p className="text-medium-emphasis mt-1">
                    Extended capabilities for enterprise-grade development workflows
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <OrchestrationModuleCard />
                <ModulesModuleCard />
                <MarketplaceModuleCard />
                <HandoverModuleCard />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}