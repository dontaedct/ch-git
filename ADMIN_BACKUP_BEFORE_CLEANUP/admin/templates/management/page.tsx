/**
 * @fileoverview Intelligent Template Management Interface - HT-032.2.3
 * @module app/admin/templates/management/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Intelligent template management interface with automated optimization,
 * performance monitoring, and AI-powered template health analysis.
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
  Unarchive
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

interface TemplateManagementState {
  loading: boolean;
  error: string | null;
  templates: Array<{
    id: string;
    name: string;
    description: string;
    version: string;
    status: 'installed' | 'available' | 'updating' | 'error';
    category: string;
    author: string;
    installedAt: Date;
    updatedAt: Date;
    enabled: boolean;
    health: {
      score: number;
      status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
      issues: string[];
      recommendations: string[];
    };
    metrics: {
      loadTime: number;
      renderTime: number;
      memoryUsage: number;
      errorRate: number;
      usage: number;
    };
    optimization: {
      available: boolean;
      applied: boolean;
      impact: number;
    };
  }>;
  selectedTemplates: string[];
  viewMode: 'grid' | 'list' | 'table';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filterStatus: string;
  filterCategory: string;
  searchTerm: string;
  bulkOperation: string | null;
  optimizationRunning: boolean;
}

export default function TemplateManagementPage() {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [state, setState] = useState<TemplateManagementState>({
    loading: true,
    error: null,
    templates: [],
    selectedTemplates: [],
    viewMode: 'grid',
    sortBy: 'name',
    sortOrder: 'asc',
    filterStatus: 'all',
    filterCategory: 'all',
    searchTerm: '',
    bulkOperation: null,
    optimizationRunning: false
  });

  useEffect(() => {
    setMounted(true);
    fetchTemplateData();
  }, []);

  const fetchTemplateData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // Mock template data - in real app, this would come from APIs
      const mockTemplates = [
        {
          id: 'ecommerce-catalog',
          name: 'E-commerce Catalog',
          description: 'Complete e-commerce product catalog with advanced filtering',
          version: '2.1.0',
          status: 'installed' as const,
          category: 'ecommerce',
          author: 'Template Studio',
          installedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          enabled: true,
          health: {
            score: 92,
            status: 'excellent' as const,
            issues: [],
            recommendations: ['Consider enabling lazy loading for better performance']
          },
          metrics: {
            loadTime: 850,
            renderTime: 420,
            memoryUsage: 45,
            errorRate: 0.02,
            usage: 89
          },
          optimization: {
            available: true,
            applied: true,
            impact: 15
          }
        },
        {
          id: 'lead-capture',
          name: 'Lead Capture Form',
          description: 'High-converting lead capture forms with validation',
          version: '1.8.3',
          status: 'installed' as const,
          category: 'forms',
          author: 'LeadGen Pro',
          installedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          enabled: true,
          health: {
            score: 78,
            status: 'good' as const,
            issues: ['High memory usage'],
            recommendations: ['Optimize form validation logic', 'Implement caching']
          },
          metrics: {
            loadTime: 1200,
            renderTime: 650,
            memoryUsage: 85,
            errorRate: 0.04,
            usage: 67
          },
          optimization: {
            available: true,
            applied: false,
            impact: 22
          }
        },
        {
          id: 'blog-layout',
          name: 'Blog Layout',
          description: 'Responsive blog layout with SEO optimization',
          version: '1.5.2',
          status: 'installed' as const,
          category: 'content',
          author: 'Content Masters',
          installedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          enabled: false,
          health: {
            score: 65,
            status: 'fair' as const,
            issues: ['Slow load time', 'Large bundle size'],
            recommendations: ['Enable code splitting', 'Optimize images', 'Update dependencies']
          },
          metrics: {
            loadTime: 2100,
            renderTime: 980,
            memoryUsage: 120,
            errorRate: 0.08,
            usage: 34
          },
          optimization: {
            available: true,
            applied: false,
            impact: 35
          }
        },
        {
          id: 'analytics-dashboard',
          name: 'Analytics Dashboard',
          description: 'Comprehensive analytics dashboard with real-time data',
          version: '3.0.1',
          status: 'updating' as const,
          category: 'analytics',
          author: 'Data Insights',
          installedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          enabled: true,
          health: {
            score: 88,
            status: 'good' as const,
            issues: [],
            recommendations: ['Consider implementing WebSocket for real-time updates']
          },
          metrics: {
            loadTime: 950,
            renderTime: 480,
            memoryUsage: 55,
            errorRate: 0.01,
            usage: 92
          },
          optimization: {
            available: true,
            applied: true,
            impact: 18
          }
        },
        {
          id: 'user-profile',
          name: 'User Profile Management',
          description: 'Complete user profile management system',
          version: '2.3.0',
          status: 'error' as const,
          category: 'user-management',
          author: 'UserFlow Inc',
          installedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          enabled: false,
          health: {
            score: 45,
            status: 'poor' as const,
            issues: ['High error rate', 'Memory leaks detected', 'Security vulnerabilities'],
            recommendations: ['Fix critical bugs', 'Update security patches', 'Optimize memory usage']
          },
          metrics: {
            loadTime: 3200,
            renderTime: 1500,
            memoryUsage: 180,
            errorRate: 0.15,
            usage: 23
          },
          optimization: {
            available: false,
            applied: false,
            impact: 0
          }
        }
      ];

      setState(prev => ({
        ...prev,
        loading: false,
        templates: mockTemplates
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load template data'
      }));
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthBgColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'installed': return 'text-green-600 bg-green-100';
      case 'available': return 'text-blue-600 bg-blue-100';
      case 'updating': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const toggleTemplateSelection = (templateId: string) => {
    setState(prev => ({
      ...prev,
      selectedTemplates: prev.selectedTemplates.includes(templateId)
        ? prev.selectedTemplates.filter(id => id !== templateId)
        : [...prev.selectedTemplates, templateId]
    }));
  };

  const selectAllTemplates = () => {
    setState(prev => ({
      ...prev,
      selectedTemplates: prev.templates.map(t => t.id)
    }));
  };

  const clearSelection = () => {
    setState(prev => ({
      ...prev,
      selectedTemplates: []
    }));
  };

  const runBulkOperation = async (operation: string) => {
    if (state.selectedTemplates.length === 0) return;

    setState(prev => ({ ...prev, bulkOperation: operation }));

    try {
      // Mock bulk operation - in real app, this would call APIs
      await new Promise(resolve => setTimeout(resolve, 2000));

      setState(prev => ({
        ...prev,
        bulkOperation: null,
        selectedTemplates: []
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        bulkOperation: null,
        error: error instanceof Error ? error.message : 'Bulk operation failed'
      }));
    }
  };

  const runOptimization = async () => {
    setState(prev => ({ ...prev, optimizationRunning: true }));

    try {
      // Mock optimization - in real app, this would call optimization APIs
      await new Promise(resolve => setTimeout(resolve, 3000));

      setState(prev => ({ ...prev, optimizationRunning: false }));
      fetchTemplateData(); // Refresh data
    } catch (error) {
      setState(prev => ({
        ...prev,
        optimizationRunning: false,
        error: error instanceof Error ? error.message : 'Optimization failed'
      }));
    }
  };

  const filteredTemplates = state.templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(state.searchTerm.toLowerCase());
    const matchesStatus = state.filterStatus === 'all' || template.status === state.filterStatus;
    const matchesCategory = state.filterCategory === 'all' || template.category === state.filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (state.sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'health':
        aValue = a.health.score;
        bValue = b.health.score;
        break;
      case 'usage':
        aValue = a.metrics.usage;
        bValue = b.metrics.usage;
        break;
      case 'updated':
        aValue = a.updatedAt;
        bValue = b.updatedAt;
        break;
      default:
        return 0;
    }

    if (state.sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    } else {
      return aValue > bValue ? 1 : -1;
    }
  });

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
          <span>Loading template management...</span>
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
          <h2 className="text-xl font-semibold mb-2">Template Management Error</h2>
          <p className="text-gray-500 mb-4">{state.error}</p>
          <Button
            onClick={fetchTemplateData}
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
                Template Management
              </h1>
              <p className={cn(
                "mt-1 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Intelligent Template Management & Automated Optimization
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={runOptimization}
                disabled={state.optimizationRunning}
                className={cn(
                  "px-6 py-2 rounded-lg border-2 font-bold transition-all duration-300",
                  isDark
                    ? "border-green-500/50 hover:border-green-500/70 bg-green-500/10 hover:bg-green-500/20"
                    : "border-green-600/50 hover:border-green-600/70 bg-green-600/10 hover:bg-green-600/20"
                )}
              >
                {state.optimizationRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Run Optimization
                  </>
                )}
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
          {/* Bulk Actions */}
          {state.selectedTemplates.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className={cn(
                "border-2",
                isDark ? "border-blue-500/50 bg-blue-500/5" : "border-blue-600/50 bg-blue-600/5"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="text-sm">
                        {state.selectedTemplates.length} selected
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSelection}
                      >
                        Clear Selection
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => runBulkOperation('enable')}
                        disabled={state.bulkOperation === 'enable'}
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Enable
                      </Button>
                      <Button
                        onClick={() => runBulkOperation('disable')}
                        disabled={state.bulkOperation === 'disable'}
                        size="sm"
                        variant="outline"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Disable
                      </Button>
                      <Button
                        onClick={() => runBulkOperation('optimize')}
                        disabled={state.bulkOperation === 'optimize'}
                        size="sm"
                        variant="outline"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Optimize
                      </Button>
                      <Button
                        onClick={() => runBulkOperation('update')}
                        disabled={state.bulkOperation === 'update'}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Update
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Filters and Controls */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search templates..."
                        value={state.searchTerm}
                        onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select
                      value={state.filterStatus}
                      onValueChange={(value) => setState(prev => ({ ...prev, filterStatus: value }))}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="installed">Installed</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="updating">Updating</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={state.filterCategory}
                      onValueChange={(value) => setState(prev => ({ ...prev, filterCategory: value }))}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="forms">Forms</SelectItem>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="analytics">Analytics</SelectItem>
                        <SelectItem value="user-management">User Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={state.viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={state.viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={state.viewMode === 'table' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setState(prev => ({ ...prev, viewMode: 'table' }))}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                    <Select
                      value={state.sortBy}
                      onValueChange={(value) => setState(prev => ({ ...prev, sortBy: value }))}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="usage">Usage</SelectItem>
                        <SelectItem value="updated">Updated</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setState(prev => ({ 
                        ...prev, 
                        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                      }))}
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllTemplates}
                    >
                      Select All
                    </Button>
                    <span className="text-sm text-gray-500">
                      {filteredTemplates.length} templates
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchTemplateData}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Template Grid */}
          <motion.div variants={itemVariants}>
            {state.viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={cn(
                      "cursor-pointer transition-all duration-300 hover:scale-105",
                      state.selectedTemplates.includes(template.id) && "ring-2 ring-blue-500",
                      isDark
                        ? "bg-black/5 border-white/30 hover:border-white/50"
                        : "bg-white/5 border-black/30 hover:border-black/50"
                    )}
                    onClick={() => toggleTemplateSelection(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{template.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {template.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            getHealthBgColor(template.health.status)
                          )} />
                          <Badge className={getStatusColor(template.status)}>
                            {template.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Version</span>
                        <span className="font-medium">{template.version}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Health Score</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={template.health.score} className="w-16 h-2" />
                          <span className="font-medium">{template.health.score}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Usage</span>
                        <span className="font-medium">{template.metrics.usage}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Load Time</span>
                        <span className="font-medium">{template.metrics.loadTime}ms</span>
                      </div>
                      {template.optimization.available && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Optimization</span>
                          <Badge variant={template.optimization.applied ? "default" : "outline"}>
                            {template.optimization.applied ? "Applied" : "Available"}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {state.viewMode === 'list' && (
              <div className="space-y-4">
                {sortedTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={cn(
                      "cursor-pointer transition-all duration-300",
                      state.selectedTemplates.includes(template.id) && "ring-2 ring-blue-500",
                      isDark
                        ? "bg-black/5 border-white/30 hover:border-white/50"
                        : "bg-white/5 border-black/30 hover:border-black/50"
                    )}
                    onClick={() => toggleTemplateSelection(template.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={cn(
                            "w-4 h-4 rounded-full",
                            getHealthBgColor(template.health.status)
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">{template.name}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(template.status)}>
                                {template.status}
                              </Badge>
                              <Badge variant="outline">
                                {template.category}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                          <div className="flex items-center space-x-6 mt-2 text-sm text-gray-500">
                            <span>v{template.version}</span>
                            <span>Health: {template.health.score}%</span>
                            <span>Usage: {template.metrics.usage}%</span>
                            <span>Load: {template.metrics.loadTime}ms</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Switch
                            checked={template.enabled}
                            onCheckedChange={(checked) => {
                              // Handle enable/disable
                              console.log(`Toggle template ${template.id}:`, checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {state.viewMode === 'table' && (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={cn(
                          "border-b",
                          isDark ? "border-white/20" : "border-black/20"
                        )}>
                          <th className="text-left p-4">
                            <input
                              type="checkbox"
                              checked={state.selectedTemplates.length === sortedTemplates.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  selectAllTemplates();
                                } else {
                                  clearSelection();
                                }
                              }}
                            />
                          </th>
                          <th className="text-left p-4">Template</th>
                          <th className="text-left p-4">Status</th>
                          <th className="text-left p-4">Health</th>
                          <th className="text-left p-4">Usage</th>
                          <th className="text-left p-4">Load Time</th>
                          <th className="text-left p-4">Updated</th>
                          <th className="text-left p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedTemplates.map((template) => (
                          <tr
                            key={template.id}
                            className={cn(
                              "border-b transition-colors hover:bg-gray-50",
                              isDark ? "border-white/10 hover:bg-white/5" : "border-black/10"
                            )}
                          >
                            <td className="p-4">
                              <input
                                type="checkbox"
                                checked={state.selectedTemplates.includes(template.id)}
                                onChange={() => toggleTemplateSelection(template.id)}
                              />
                            </td>
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{template.name}</div>
                                <div className="text-sm text-gray-500">{template.description}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusColor(template.status)}>
                                {template.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Progress value={template.health.score} className="w-16 h-2" />
                                <span className="text-sm">{template.health.score}%</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-sm">{template.metrics.usage}%</span>
                            </td>
                            <td className="p-4">
                              <span className="text-sm">{template.metrics.loadTime}ms</span>
                            </td>
                            <td className="p-4">
                              <span className="text-sm">{formatDate(template.updatedAt)}</span>
                            </td>
                            <td className="p-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Configure
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Zap className="w-4 h-4 mr-2" />
                                    Optimize
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Archive className="w-4 h-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
