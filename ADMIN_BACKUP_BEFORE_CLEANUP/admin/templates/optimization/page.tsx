/**
 * @fileoverview Template Optimization Dashboard - HT-032.2.3
 * @module app/admin/templates/optimization/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Template optimization dashboard with automated optimization engine,
 * performance monitoring, and comprehensive optimization insights.
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
  Lightbulb,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  MoreVertical,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Star,
  Heart,
  AlertCircle,
  Info,
  ExternalLink,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Trash2,
  Edit,
  Copy,
  Share,
  Archive,
  Unarchive,
  Gauge,
  TrendingDown,
  Minus,
  Maximize,
  Minimize,
  RotateCw,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  SignalLow,
  SignalZero,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Rainbow,
  Sparkles
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OptimizationState {
  loading: boolean;
  error: string | null;
  optimizationPlans: Array<{
    templateId: string;
    templateName: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'scheduled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    strategies: Array<{
      id: string;
      name: string;
      category: string;
      impact: number;
      effort: number;
      risk: 'low' | 'medium' | 'high';
      autoApplicable: boolean;
      applied: boolean;
      status: 'pending' | 'applying' | 'completed' | 'failed' | 'skipped';
    }>;
    estimatedImpact: number;
    estimatedEffort: number;
    riskAssessment: 'low' | 'medium' | 'high';
    scheduledAt?: Date;
    completedAt?: Date;
    error?: string;
  }>;
  optimizationHistory: Array<{
    id: string;
    templateId: string;
    templateName: string;
    operation: string;
    status: 'completed' | 'failed' | 'cancelled';
    impact: {
      performance: number;
      security: number;
      accessibility: number;
      seo: number;
      maintainability: number;
      overall: number;
    };
    duration: number;
    appliedAt: Date;
    completedAt: Date;
  }>;
  performanceMetrics: {
    before: {
      loadTime: number;
      renderTime: number;
      memoryUsage: number;
      bundleSize: number;
      errorRate: number;
    };
    after: {
      loadTime: number;
      renderTime: number;
      memoryUsage: number;
      bundleSize: number;
      errorRate: number;
    };
    improvements: {
      loadTime: number;
      renderTime: number;
      memoryUsage: number;
      bundleSize: number;
      errorRate: number;
    };
  };
  autoOptimizationEnabled: boolean;
  selectedTemplate: string | null;
  optimizationRunning: boolean;
}

export default function TemplateOptimizationPage() {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [state, setState] = useState<OptimizationState>({
    loading: true,
    error: null,
    optimizationPlans: [],
    optimizationHistory: [],
    performanceMetrics: {
      before: {
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0,
        bundleSize: 0,
        errorRate: 0
      },
      after: {
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0,
        bundleSize: 0,
        errorRate: 0
      },
      improvements: {
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0,
        bundleSize: 0,
        errorRate: 0
      }
    },
    autoOptimizationEnabled: true,
    selectedTemplate: null,
    optimizationRunning: false
  });

  useEffect(() => {
    setMounted(true);
    fetchOptimizationData();
  }, []);

  const fetchOptimizationData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // Mock optimization data - in real app, this would come from APIs
      const mockOptimizationPlans = [
        {
          templateId: 'ecommerce-catalog',
          templateName: 'E-commerce Catalog',
          status: 'completed' as const,
          priority: 'medium' as const,
          strategies: [
            {
              id: 'enable-lazy-loading',
              name: 'Enable Lazy Loading',
              category: 'performance',
              impact: 25,
              effort: 2,
              risk: 'low' as const,
              autoApplicable: true,
              applied: true,
              status: 'completed' as const
            },
            {
              id: 'optimize-bundle-size',
              name: 'Optimize Bundle Size',
              category: 'performance',
              impact: 35,
              effort: 4,
              risk: 'medium' as const,
              autoApplicable: false,
              applied: false,
              status: 'pending' as const
            },
            {
              id: 'improve-caching',
              name: 'Improve Caching Strategy',
              category: 'performance',
              impact: 30,
              effort: 3,
              risk: 'low' as const,
              autoApplicable: true,
              applied: true,
              status: 'completed' as const
            }
          ],
          estimatedImpact: 90,
          estimatedEffort: 9,
          riskAssessment: 'low' as const,
          completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          templateId: 'lead-capture',
          templateName: 'Lead Capture Form',
          status: 'running' as const,
          priority: 'high' as const,
          strategies: [
            {
              id: 'security-headers',
              name: 'Add Security Headers',
              category: 'security',
              impact: 40,
              effort: 1,
              risk: 'low' as const,
              autoApplicable: true,
              applied: true,
              status: 'completed' as const
            },
            {
              id: 'accessibility-improvements',
              name: 'Accessibility Enhancements',
              category: 'accessibility',
              impact: 35,
              effort: 3,
              risk: 'low' as const,
              autoApplicable: true,
              applied: false,
              status: 'applying' as const
            },
            {
              id: 'performance-optimization',
              name: 'Performance Optimization',
              category: 'performance',
              impact: 45,
              effort: 5,
              risk: 'medium' as const,
              autoApplicable: false,
              applied: false,
              status: 'pending' as const
            }
          ],
          estimatedImpact: 120,
          estimatedEffort: 9,
          riskAssessment: 'medium' as const
        },
        {
          templateId: 'blog-layout',
          templateName: 'Blog Layout',
          status: 'pending' as const,
          priority: 'critical' as const,
          strategies: [
            {
              id: 'bundle-splitting',
              name: 'Bundle Splitting & Code Splitting',
              category: 'performance',
              impact: 50,
              effort: 6,
              risk: 'high' as const,
              autoApplicable: false,
              applied: false,
              status: 'pending' as const
            },
            {
              id: 'image-optimization',
              name: 'Image Optimization',
              category: 'performance',
              impact: 25,
              effort: 2,
              risk: 'low' as const,
              autoApplicable: true,
              applied: false,
              status: 'pending' as const
            },
            {
              id: 'dependency-update',
              name: 'Update Dependencies',
              category: 'maintainability',
              impact: 20,
              effort: 3,
              risk: 'medium' as const,
              autoApplicable: false,
              applied: false,
              status: 'pending' as const
            }
          ],
          estimatedImpact: 95,
          estimatedEffort: 11,
          riskAssessment: 'high' as const
        }
      ];

      const mockOptimizationHistory = [
        {
          id: 'opt-1',
          templateId: 'ecommerce-catalog',
          templateName: 'E-commerce Catalog',
          operation: 'Performance Optimization',
          status: 'completed' as const,
          impact: {
            performance: 25,
            security: 10,
            accessibility: 5,
            seo: 8,
            maintainability: 15,
            overall: 18
          },
          duration: 1800000, // 30 minutes
          appliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 1800000)
        },
        {
          id: 'opt-2',
          templateId: 'analytics-dashboard',
          templateName: 'Analytics Dashboard',
          operation: 'Security Enhancement',
          status: 'completed' as const,
          impact: {
            performance: 5,
            security: 40,
            accessibility: 0,
            seo: 0,
            maintainability: 10,
            overall: 12
          },
          duration: 900000, // 15 minutes
          appliedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 48 * 60 * 60 * 1000 + 900000)
        }
      ];

      const mockPerformanceMetrics = {
        before: {
          loadTime: 2100,
          renderTime: 1200,
          memoryUsage: 150,
          bundleSize: 850000,
          errorRate: 0.08
        },
        after: {
          loadTime: 1650,
          renderTime: 890,
          memoryUsage: 95,
          bundleSize: 680000,
          errorRate: 0.03
        },
        improvements: {
          loadTime: 21.4,
          renderTime: 25.8,
          memoryUsage: 36.7,
          bundleSize: 20.0,
          errorRate: 62.5
        }
      };

      setState(prev => ({
        ...prev,
        loading: false,
        optimizationPlans: mockOptimizationPlans,
        optimizationHistory: mockOptimizationHistory,
        performanceMetrics: mockPerformanceMetrics
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load optimization data'
      }));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'scheduled': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <Gauge className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'accessibility': return <Eye className="w-4 h-4" />;
      case 'seo': return <Search className="w-4 h-4" />;
      case 'maintainability': return <Wrench className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const runOptimization = async (templateId: string) => {
    setState(prev => ({ ...prev, optimizationRunning: true }));

    try {
      // Mock optimization - in real app, this would call optimization APIs
      await new Promise(resolve => setTimeout(resolve, 3000));

      setState(prev => ({ ...prev, optimizationRunning: false }));
      fetchOptimizationData(); // Refresh data
    } catch (error) {
      setState(prev => ({
        ...prev,
        optimizationRunning: false,
        error: error instanceof Error ? error.message : 'Optimization failed'
      }));
    }
  };

  const scheduleOptimization = async (templateId: string, scheduledTime: Date) => {
    try {
      // Mock scheduling - in real app, this would call scheduling APIs
      console.log(`Scheduling optimization for ${templateId} at ${scheduledTime}`);
      
      setState(prev => ({
        ...prev,
        optimizationPlans: prev.optimizationPlans.map(plan =>
          plan.templateId === templateId
            ? { ...plan, status: 'scheduled', scheduledAt: scheduledTime }
            : plan
        )
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to schedule optimization'
      }));
    }
  };

  const toggleAutoOptimization = (enabled: boolean) => {
    setState(prev => ({ ...prev, autoOptimizationEnabled: enabled }));
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
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

  if (state.loading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        isDark ? "bg-black text-white" : "bg-white text-black"
      )}>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading optimization dashboard...</span>
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
          <h2 className="text-xl font-semibold mb-2">Optimization Dashboard Error</h2>
          <p className="text-gray-500 mb-4">{state.error}</p>
          <Button
            onClick={fetchOptimizationData}
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
                Template Optimization
              </h1>
              <p className={cn(
                "mt-1 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Automated Optimization Engine & Performance Monitoring
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Auto Optimization</span>
                <Switch
                  checked={state.autoOptimizationEnabled}
                  onCheckedChange={toggleAutoOptimization}
                />
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
          {/* Performance Overview */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Performance Overview
                </CardTitle>
                <CardDescription>
                  Overall performance improvements from optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {[
                    { label: 'Load Time', before: state.performanceMetrics.before.loadTime, after: state.performanceMetrics.after.loadTime, improvement: state.performanceMetrics.improvements.loadTime, unit: 'ms' },
                    { label: 'Render Time', before: state.performanceMetrics.before.renderTime, after: state.performanceMetrics.after.renderTime, improvement: state.performanceMetrics.improvements.renderTime, unit: 'ms' },
                    { label: 'Memory Usage', before: state.performanceMetrics.before.memoryUsage, after: state.performanceMetrics.after.memoryUsage, improvement: state.performanceMetrics.improvements.memoryUsage, unit: 'MB' },
                    { label: 'Bundle Size', before: state.performanceMetrics.before.bundleSize, after: state.performanceMetrics.after.bundleSize, improvement: state.performanceMetrics.improvements.bundleSize, unit: 'KB' },
                    { label: 'Error Rate', before: (state.performanceMetrics.before.errorRate * 100).toFixed(1), after: (state.performanceMetrics.after.errorRate * 100).toFixed(1), improvement: state.performanceMetrics.improvements.errorRate, unit: '%' }
                  ].map((metric) => (
                    <div key={metric.label} className="text-center">
                      <div className="text-sm text-gray-500 mb-2">{metric.label}</div>
                      <div className="text-2xl font-bold mb-1">
                        {typeof metric.after === 'number' ? metric.after.toLocaleString() : metric.after}
                        <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <TrendingDown className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-500 font-medium">
                          {metric.improvement.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Optimization Plans */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Optimization Plans
                </CardTitle>
                <CardDescription>
                  Current optimization plans and their progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {state.optimizationPlans.map((plan) => (
                    <div
                      key={plan.templateId}
                      className={cn(
                        "p-6 rounded-lg border-2 transition-all duration-300",
                        isDark
                          ? "bg-white/5 border-white/30 hover:border-white/50"
                          : "bg-black/5 border-black/30 hover:border-black/50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-lg">{plan.templateName}</h3>
                            <p className="text-sm text-gray-500">Template ID: {plan.templateId}</p>
                          </div>
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status}
                          </Badge>
                          <Badge className={getPriorityColor(plan.priority)}>
                            {plan.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          {plan.status === 'pending' && (
                            <Button
                              onClick={() => runOptimization(plan.templateId)}
                              disabled={state.optimizationRunning}
                              size="sm"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Run Now
                            </Button>
                          )}
                          {plan.status === 'running' && (
                            <Button
                              disabled
                              size="sm"
                            >
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                              Running...
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Calendar className="w-4 h-4 mr-2" />
                                Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset Plan
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Estimated Impact</div>
                          <div className="text-xl font-bold text-green-500">{plan.estimatedImpact}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Estimated Effort</div>
                          <div className="text-xl font-bold text-blue-500">{plan.estimatedEffort}h</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Risk Assessment</div>
                          <div className={cn("text-xl font-bold", getRiskColor(plan.riskAssessment))}>
                            {plan.riskAssessment}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm font-medium">Optimization Strategies</div>
                        {plan.strategies.map((strategy) => (
                          <div
                            key={strategy.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg",
                              isDark ? "bg-white/5" : "bg-black/5"
                            )}
                          >
                            <div className="flex items-center space-x-3">
                              {getCategoryIcon(strategy.category)}
                              <div>
                                <div className="font-medium">{strategy.name}</div>
                                <div className="text-sm text-gray-500 capitalize">{strategy.category}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-sm">
                                <span className="text-green-500">+{strategy.impact}%</span>
                                <span className="text-gray-500 ml-1">impact</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-blue-500">{strategy.effort}h</span>
                                <span className="text-gray-500 ml-1">effort</span>
                              </div>
                              <div className={cn("text-sm", getRiskColor(strategy.risk))}>
                                {strategy.risk} risk
                              </div>
                              <Badge
                                variant={strategy.status === 'completed' ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                {strategy.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>

                      {plan.completedAt && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-sm text-gray-500">
                            Completed: {formatDate(plan.completedAt)}
                          </div>
                        </div>
                      )}

                      {plan.error && (
                        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                          <div className="text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4 inline mr-2" />
                            {plan.error}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Optimization History */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Optimization History
                </CardTitle>
                <CardDescription>
                  Recent optimization operations and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.optimizationHistory.map((history) => (
                    <div
                      key={history.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border",
                        isDark ? "bg-white/5 border-white/30" : "bg-black/5 border-black/30"
                      )}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          history.status === 'completed' ? "bg-green-500" : 
                          history.status === 'failed' ? "bg-red-500" : "bg-yellow-500"
                        )} />
                        <div>
                          <div className="font-medium">{history.templateName}</div>
                          <div className="text-sm text-gray-500">{history.operation}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Overall Impact</div>
                          <div className="text-lg font-bold text-green-500">+{history.impact.overall}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Duration</div>
                          <div className="text-sm font-medium">{formatDuration(history.duration)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Completed</div>
                          <div className="text-sm font-medium">{formatDate(history.completedAt)}</div>
                        </div>
                        <Badge
                          variant={history.status === 'completed' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {history.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance Trends */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Performance Trends
                </CardTitle>
                <CardDescription>
                  Performance metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Performance', value: 85, change: 12, color: 'text-green-500' },
                    { label: 'Security', value: 92, change: 8, color: 'text-blue-500' },
                    { label: 'Accessibility', value: 78, change: 15, color: 'text-purple-500' },
                    { label: 'SEO', value: 88, change: 6, color: 'text-orange-500' }
                  ].map((metric) => (
                    <div key={metric.label} className="text-center">
                      <div className="text-sm text-gray-500 mb-2">{metric.label}</div>
                      <div className="text-3xl font-bold mb-2">{metric.value}%</div>
                      <div className="flex items-center justify-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className={cn("text-sm font-medium", metric.color)}>
                          +{metric.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
