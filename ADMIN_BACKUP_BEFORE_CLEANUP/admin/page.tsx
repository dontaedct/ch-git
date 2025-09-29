/**
 * @fileoverview Main Modular Admin Interface Dashboard - HT-032.1.1
 * @module app/admin/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Revolutionary modular admin interface that automatically expands with dynamic
 * template-specific settings. Like a smartphone's settings app - core system
 * settings are always present, but when new templates are installed, their
 * settings automatically appear in the same unified interface.
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn, useThemeDetection, animationVariants, spacing, typography } from '@/lib/ui/shared-patterns';
import { 
  Settings, 
  Users, 
  FileText, 
  BarChart3, 
  Globe, 
  Shield,
  Activity,
  Calendar,
  Mail,
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Rocket,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Zap,
  Database,
  Server,
  Layers,
  Grid3X3,
  List,
  Palette,
  Package,
  Wrench,
  Target,
  Lightbulb
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminDashboardState {
  loading: boolean;
  error: string | null;
  stats: {
    totalApps: number;
    totalUsers: number;
    totalTemplates: number;
    systemHealth: number;
    activeDeployments: number;
    pendingUpdates: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'app_created' | 'user_invited' | 'template_installed' | 'deployment' | 'setting_changed';
    message: string;
    timestamp: Date;
    user: string;
  }>;
  quickActions: Array<{
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    action: string;
    enabled: boolean;
  }>;
  systemAlerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: Date;
    dismissible: boolean;
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [state, setState] = useState<AdminDashboardState>({
    loading: true,
    error: null,
    stats: {
      totalApps: 0,
      totalUsers: 0,
      totalTemplates: 0,
      systemHealth: 0,
      activeDeployments: 0,
      pendingUpdates: 0
    },
    recentActivity: [],
    quickActions: [],
    systemAlerts: []
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // Mock data - in real app, this would come from APIs
      const mockStats = {
        totalApps: 24,
        totalUsers: 156,
        totalTemplates: 12,
        systemHealth: 98,
        activeDeployments: 8,
        pendingUpdates: 3
      };

      const mockActivity = [
        {
          id: '1',
          type: 'app_created' as const,
          message: 'New app "Client Portal" created by John Smith',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          user: 'John Smith'
        },
        {
          id: '2',
          type: 'template_installed' as const,
          message: 'Template "E-commerce Catalog" installed',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          user: 'Sarah Johnson'
        },
        {
          id: '3',
          type: 'deployment' as const,
          message: 'Production deployment completed for "Lead Capture"',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          user: 'System'
        },
        {
          id: '4',
          type: 'user_invited' as const,
          message: 'New user invited: mike@example.com',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          user: 'Admin'
        }
      ];

      const mockQuickActions = [
        {
          id: 'create_app',
          title: 'Create New App',
          description: 'Launch the app creation wizard',
          icon: <Plus className="w-5 h-5" />,
          action: '/agency-toolkit/create',
          enabled: true
        },
        {
          id: 'manage_templates',
          title: 'Manage Templates',
          description: 'Install, update, and configure templates',
          icon: <Package className="w-5 h-5" />,
          action: '/admin/templates',
          enabled: true
        },
        {
          id: 'user_management',
          title: 'User Management',
          description: 'Invite users and manage permissions',
          icon: <Users className="w-5 h-5" />,
          action: '/admin/users',
          enabled: true
        },
        {
          id: 'system_settings',
          title: 'System Settings',
          description: 'Configure global system settings',
          icon: <Settings className="w-5 h-5" />,
          action: '/admin/settings/system',
          enabled: true
        },
        {
          id: 'analytics',
          title: 'Analytics Dashboard',
          description: 'View platform-wide analytics',
          icon: <BarChart3 className="w-5 h-5" />,
          action: '/admin/analytics',
          enabled: true
        },
        {
          id: 'brand_management',
          title: 'Brand Management',
          description: 'Manage branding and white-labeling',
          icon: <Palette className="w-5 h-5" />,
          action: '/admin/branding',
          enabled: true
        }
      ];

      const mockAlerts = [
        {
          id: '1',
          type: 'info' as const,
          message: '3 templates have pending updates available',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          dismissible: true
        },
        {
          id: '2',
          type: 'success' as const,
          message: 'System backup completed successfully',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          dismissible: true
        }
      ];

      setState(prev => ({
        ...prev,
        loading: false,
        stats: mockStats,
        recentActivity: mockActivity,
        quickActions: mockQuickActions,
        systemAlerts: mockAlerts
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data'
      }));
    }
  };

  const dismissAlert = (alertId: string) => {
    setState(prev => ({
      ...prev,
      systemAlerts: prev.systemAlerts.filter(alert => alert.id !== alertId)
    }));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'app_created': return <Plus className="w-4 h-4 text-blue-500" />;
      case 'user_invited': return <Users className="w-4 h-4 text-green-500" />;
      case 'template_installed': return <Package className="w-4 h-4 text-purple-500" />;
      case 'deployment': return <Rocket className="w-4 h-4 text-orange-500" />;
      case 'setting_changed': return <Settings className="w-4 h-4 text-gray-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'info': return <Bell className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!mounted) return null;

  const { isDark } = useThemeDetection();

  const containerVariants = animationVariants.container;
  const itemVariants = animationVariants.item;

  if (state.loading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        isDark ? "bg-black text-white" : "bg-white text-black"
      )}>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        isDark ? "bg-black text-white" : "bg-white text-black"
      )}>
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Dashboard Error</h2>
          <p className="text-gray-500 mb-4">{state.error}</p>
          <Button
            onClick={fetchDashboardData}
            className={cn(
              "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300",
              isDark
                ? "border-white/30 hover:border-white/50"
                : "border-black/30 hover:border-black/50"
            )}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
                Admin Dashboard
              </h1>
              <p className={cn(
                "mt-1 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Modular Admin Interface - Central Command
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-sm">
                  System Health: {state.stats.systemHealth}%
                </Badge>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
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
          {/* System Alerts */}
          {state.systemAlerts.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-4">
              {state.systemAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={cn(
                    "border-l-4",
                    alert.type === 'info' && "border-l-blue-500",
                    alert.type === 'warning' && "border-l-yellow-500",
                    alert.type === 'error' && "border-l-red-500",
                    alert.type === 'success' && "border-l-green-500"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getAlertIcon(alert.type)}
                        <span className="font-medium">{alert.message}</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(alert.timestamp)}
                        </span>
                      </div>
                      {alert.dismissible && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissAlert(alert.id)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Platform Statistics */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
          >
            {[
              { label: "Total Apps", value: state.stats.totalApps, icon: <Globe className="w-5 h-5" />, color: "blue" },
              { label: "Active Users", value: state.stats.totalUsers, icon: <Users className="w-5 h-5" />, color: "green" },
              { label: "Templates", value: state.stats.totalTemplates, icon: <Package className="w-5 h-5" />, color: "purple" },
              { label: "System Health", value: `${state.stats.systemHealth}%`, icon: <Activity className="w-5 h-5" />, color: "yellow" },
              { label: "Deployments", value: state.stats.activeDeployments, icon: <Rocket className="w-5 h-5" />, color: "orange" },
              { label: "Updates", value: state.stats.pendingUpdates, icon: <Download className="w-5 h-5" />, color: "red" }
            ].map((stat) => (
              <Card
                key={stat.label}
                className={cn(
                  "transition-all duration-300 hover:scale-105",
                  isDark
                    ? "bg-black/5 border-white/30 hover:border-white/50"
                    : "bg-white/5 border-black/30 hover:border-black/50"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium uppercase tracking-wide opacity-70">
                      {stat.label}
                    </div>
                    <div className={cn(
                      "text-gray-500",
                      stat.color === 'blue' && "text-blue-500",
                      stat.color === 'green' && "text-green-500",
                      stat.color === 'purple' && "text-purple-500",
                      stat.color === 'yellow' && "text-yellow-500",
                      stat.color === 'orange' && "text-orange-500",
                      stat.color === 'red' && "text-red-500"
                    )}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Quick Actions</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search actions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className={cn(
              "gap-6",
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "space-y-4"
            )}>
              {state.quickActions
                .filter(action => 
                  searchTerm === '' || 
                  action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  action.description.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((action) => (
                <Card
                  key={action.id}
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:scale-105",
                    !action.enabled && "opacity-50 cursor-not-allowed",
                    isDark
                      ? "bg-black/5 border-white/30 hover:border-white/50"
                      : "bg-white/5 border-black/30 hover:border-black/50"
                  )}
                  onClick={() => action.enabled && router.push(action.action)}
                >
                  <CardContent className={cn(
                    "p-6",
                    viewMode === 'list' && "flex items-center space-x-4"
                  )}>
                    <div className={cn(
                      viewMode === 'grid' && "space-y-4",
                      viewMode === 'list' && "flex items-center space-x-4 flex-1"
                    )}>
                      <div className={cn(
                        "flex items-center",
                        viewMode === 'grid' && "justify-center",
                        viewMode === 'list' && "flex-shrink-0"
                      )}>
                        <div className={cn(
                          "p-3 rounded-lg",
                          isDark ? "bg-white/10" : "bg-black/10"
                        )}>
                          {action.icon}
                        </div>
                      </div>
                      <div className={cn(
                        viewMode === 'grid' && "text-center",
                        viewMode === 'list' && "flex-1"
                      )}>
                        <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                        <p className="text-sm opacity-70">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest system events and user actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className={cn(
                        "flex items-center space-x-4 p-4 rounded-lg transition-all duration-300",
                        isDark ? "bg-white/5 hover:bg-white/10" : "bg-black/5 hover:bg-black/10"
                      )}
                    >
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(activity.timestamp)} • by {activity.user}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Status */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="w-5 h-5 mr-2" />
                  System Status
                </CardTitle>
                <CardDescription>
                  Real-time system health and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-2">
                      {state.stats.systemHealth}%
                    </div>
                    <div className="text-sm text-gray-500">System Health</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500 mb-2">
                      {state.stats.activeDeployments}
                    </div>
                    <div className="text-sm text-gray-500">Active Deployments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500 mb-2">
                      {state.stats.pendingUpdates}
                    </div>
                    <div className="text-sm text-gray-500">Pending Updates</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
