/**
 * @fileoverview Individual App Admin Interface - Phase 5.1 Implementation
 * Enhanced admin dashboard for managing a specific tenant application
 * Features: Overview dashboard, submission management, document library, user management, module toggles
 */

"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { TenantApp } from '@/types/tenant-apps';
import { 
  ArrowLeft, 
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
  Eye,
  Edit,
  Trash2,
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
  ToggleLeft,
  ToggleRight,
  MoreVertical,
  Copy,
  ExternalLink,
  Archive,
  Star,
  Bookmark,
  Grid3X3,
  List,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SimplePdfExport } from '@/components/ui/simple-pdf-export';
import { RoleManager } from '@/components/ui/role-manager';
import { DeploymentManager } from '@/components/ui/deployment-manager';

export default function AppAdminPage() {
  const params = useParams();
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [app, setApp] = useState<TenantApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'documents' | 'users' | 'roles' | 'settings' | 'deployment' | 'analytics' | 'reports'>('overview');
  
  // Enhanced state for Phase 5.1 features
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [appUsers, setAppUsers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [moduleToggles, setModuleToggles] = useState({
    analytics: true,
    reports: true,
    notifications: true,
    export: true,
    userManagement: true,
    deployment: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  }>>([]);

  // Enhanced data fetching for Phase 5.1
  useEffect(() => {
    const fetchAppData = async () => {
      try {
        setLoading(true);
        // In real app, fetch from API using slug
        const mockApp: TenantApp = {
          id: '1',
          name: 'Test Client – Lead Capture',
          slug: params.slug as string,
          admin_email: 'admin@testclient.com',
          template_id: 'lead-form-pdf',
          status: 'sandbox',
          environment: 'development',
          config: {
            companyName: 'Test Client Company',
            companyDescription: 'We help businesses grow with innovative solutions.',
            primaryColor: '#3B82F6',
            secondaryColor: '#1E40AF'
          },
          theme_config: {
            primaryColor: '#3B82F6',
            secondaryColor: '#1E40AF',
            fontFamily: 'Inter, sans-serif'
          },
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          admin_url: `/admin/${params.slug}`,
          public_url: `/${params.slug}`,
          submissions_count: 15,
          documents_count: 12,
          last_activity_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        };
        
        setApp(mockApp);
        
        // Fetch additional data for Phase 5.1 features
        await Promise.all([
          fetchSubmissions(),
          fetchDocuments(),
          fetchAppUsers(),
          fetchAnalytics(),
          fetchReports()
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load app');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchAppData();
    }
  }, [params.slug]);

  // Enhanced data fetching functions
  const fetchSubmissions = async () => {
    // Mock submissions data
    const mockSubmissions = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        message: 'Interested in your services. Please contact me.',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'new',
        source: 'contact-form',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        phone: '+1 (555) 987-6543',
        message: 'Looking for a consultation. Available next week.',
        submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'contacted',
        source: 'contact-form',
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0...'
      },
      {
        id: '3',
        name: 'Mike Wilson',
        email: 'mike@business.org',
        phone: '+1 (555) 456-7890',
        message: 'Need help with our digital strategy.',
        submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        status: 'qualified',
        source: 'contact-form',
        ipAddress: '192.168.1.3',
        userAgent: 'Mozilla/5.0...'
      }
    ];
    setSubmissions(mockSubmissions);
  };

  const fetchDocuments = async () => {
    // Mock documents data
    const mockDocuments = [
      {
        id: '1',
        name: 'Lead Receipt - John Smith',
        type: 'PDF Receipt',
        size: 245000,
        generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'ready',
        submissionId: '1',
        downloadUrl: '/api/documents/1/download'
      },
      {
        id: '2',
        name: 'Lead Receipt - Sarah Johnson',
        type: 'PDF Receipt',
        size: 198000,
        generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'ready',
        submissionId: '2',
        downloadUrl: '/api/documents/2/download'
      }
    ];
    setDocuments(mockDocuments);
  };

  const fetchAppUsers = async () => {
    // Mock app users data
    const mockUsers = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@testclient.com',
        role: 'admin',
        status: 'active',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        permissions: ['read', 'write', 'admin', 'export']
      },
      {
        id: '2',
        name: 'Client Manager',
        email: 'manager@testclient.com',
        role: 'manager',
        status: 'active',
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        permissions: ['read', 'write', 'export']
      }
    ];
    setAppUsers(mockUsers);
  };

  const fetchAnalytics = async () => {
    // Mock analytics data
    const mockAnalytics = {
      totalSubmissions: 15,
      totalDocuments: 12,
      conversionRate: 85.5,
      avgResponseTime: '2.3 hours',
      topSources: [
        { source: 'contact-form', count: 12, percentage: 80 },
        { source: 'direct', count: 2, percentage: 13.3 },
        { source: 'referral', count: 1, percentage: 6.7 }
      ],
      dailyStats: [
        { date: '2024-01-15', submissions: 3, documents: 2 },
        { date: '2024-01-14', submissions: 5, documents: 4 },
        { date: '2024-01-13', submissions: 2, documents: 1 }
      ]
    };
    setAnalytics(mockAnalytics);
  };

  const fetchReports = async () => {
    // Mock reports data
    const mockReports = [
      {
        id: '1',
        name: 'Weekly Submission Report',
        type: 'submissions',
        generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ready',
        size: 1024000,
        downloadUrl: '/api/reports/1/download'
      },
      {
        id: '2',
        name: 'Monthly Analytics Report',
        type: 'analytics',
        generatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ready',
        size: 2048000,
        downloadUrl: '/api/reports/2/download'
      }
    ];
    setReports(mockReports);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Utility functions for Phase 5.1
  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message, timestamp: new Date() }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'qualified': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const toggleModule = (module: keyof typeof moduleToggles) => {
    setModuleToggles(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
    addNotification('success', `${module} module ${moduleToggles[module] ? 'disabled' : 'enabled'}`);
  };

  const exportData = async (type: 'submissions' | 'documents' | 'reports') => {
    try {
      setIsExporting(true);
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let data: any[] = [];
      let filename = '';
      
      switch (type) {
        case 'submissions':
          data = submissions;
          filename = `submissions-export-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'documents':
          data = documents;
          filename = `documents-export-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'reports':
          data = reports;
          filename = `reports-export-${new Date().toISOString().split('T')[0]}.csv`;
          break;
      }
      
      // Create and download CSV file
      const csvContent = data.map(item => Object.values(item).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addNotification('success', `Successfully exported ${type} data`);
    } catch (error) {
      addNotification('error', `Failed to export ${type} data`);
    } finally {
      setIsExporting(false);
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

  if (loading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        isDark ? "bg-black text-white" : "bg-white text-black"
      )}>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading app...</span>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        isDark ? "bg-black text-white" : "bg-white text-black"
      )}>
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">App Not Found</h2>
          <p className="text-gray-500 mb-4">{error || 'The requested app could not be found.'}</p>
          <button
            onClick={() => router.push('/agency-toolkit')}
            className={cn(
              "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300",
              isDark
                ? "border-white/30 hover:border-white/50"
                : "border-black/30 hover:border-black/50"
            )}
          >
            Back to Dashboard
          </button>
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/agency-toolkit')}
                className={cn(
                  "p-2 rounded-lg border-2 transition-all duration-300",
                  "hover:scale-105",
                  isDark
                    ? "border-white/30 hover:border-white/50"
                    : "border-black/30 hover:border-black/50"
                )}
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-4xl font-bold tracking-wide uppercase">
                  {app.name}
                </h1>
                <p className={cn(
                  "mt-1 text-lg",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  App Admin Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  app.status === 'sandbox' && "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
                  app.status === 'production' && "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
                  app.status === 'disabled' && "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                )}>
                  {app.status === 'sandbox' && '🧪 Sandbox Mode'}
                  {app.status === 'production' && '🚀 Production'}
                  {app.status === 'disabled' && '⏸️ Disabled'}
                </span>
                <a
                  href={app.public_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "p-2 rounded-lg border-2 transition-all duration-300",
                    "hover:scale-105",
                    isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                  )}
                  title="View Public Site"
                >
                  <Globe className="w-5 h-5" />
                </a>
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
          {/* App Overview Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Submissions", value: app.submissions_count, icon: <FileText className="w-5 h-5" />, color: "blue" },
              { label: "Documents", value: app.documents_count, icon: <Download className="w-5 h-5" />, color: "green" },
              { label: "Users", value: 1, icon: <Users className="w-5 h-5" />, color: "purple" },
              { label: "Last Activity", value: app.last_activity_at ? '2h ago' : 'Never', icon: <Activity className="w-5 h-5" />, color: "yellow" }
            ].map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "p-6 rounded-lg border-2 transition-all duration-300",
                  isDark
                    ? "bg-black/5 border-white/30 hover:border-white/50"
                    : "bg-white/5 border-black/30 hover:border-black/50"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium uppercase tracking-wide opacity-70">
                    {stat.label}
                  </div>
                  <div className={cn(
                    "text-gray-500",
                    stat.color === 'blue' && "text-blue-500",
                    stat.color === 'green' && "text-green-500",
                    stat.color === 'purple' && "text-purple-500",
                    stat.color === 'yellow' && "text-yellow-500"
                  )}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            ))}
          </motion.div>

          {/* Enhanced Tab Navigation with Module Toggles */}
          <motion.div
            variants={itemVariants}
            className="space-y-4"
          >
            {/* Module Toggle Controls */}
            <div className={cn(
              "p-4 rounded-lg border-2",
              isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
            )}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Module Controls</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-70">Toggle modules on/off</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(moduleToggles).map(([module, enabled]) => (
                  <div key={module} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{module}</span>
                    <button
                      onClick={() => toggleModule(module as keyof typeof moduleToggles)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        enabled 
                          ? "bg-blue-500" 
                          : isDark ? "bg-white/20" : "bg-black/20"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          enabled ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
              {[
                { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" />, enabled: true },
                { id: 'submissions', label: 'Submissions', icon: <FileText className="w-4 h-4" />, enabled: true },
                { id: 'documents', label: 'Documents', icon: <Download className="w-4 h-4" />, enabled: true },
                { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" />, enabled: moduleToggles.userManagement },
                { id: 'roles', label: 'Roles', icon: <Shield className="w-4 h-4" />, enabled: moduleToggles.userManagement },
                { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" />, enabled: moduleToggles.analytics },
                { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" />, enabled: moduleToggles.reports },
                { id: 'deployment', label: 'Deployment', icon: <Rocket className="w-4 h-4" />, enabled: moduleToggles.deployment },
                { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, enabled: true }
              ].filter(tab => tab.enabled).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-2 border-b-2 font-medium transition-all duration-300 flex items-center space-x-2 text-sm",
                    activeTab === tab.id
                      ? isDark
                        ? "border-white/50 text-white"
                        : "border-black/50 text-black"
                      : isDark
                        ? "border-transparent text-white/70 hover:text-white"
                        : "border-transparent text-black/70 hover:text-black"
                  )}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            variants={itemVariants}
            className={cn(
              "p-6 rounded-lg border-2 transition-all duration-300",
              isDark
                ? "bg-black/5 border-white/30"
                : "bg-white/5 border-black/30"
            )}
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-wide uppercase">App Overview</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => exportData('submissions')}
                      disabled={isExporting}
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 transition-all duration-300 flex items-center space-x-2 text-sm",
                        isDark
                          ? "border-white/30 hover:border-white/50"
                          : "border-black/30 hover:border-black/50"
                      )}
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Data</span>
                    </button>
                  </div>
                </div>

                {/* Enhanced Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className={cn(
                    "p-6 rounded-lg border-2 transition-all duration-300",
                    isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium opacity-70">Total Submissions</div>
                      <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold mb-2">{analytics?.totalSubmissions || 0}</div>
                    <div className="text-sm text-green-500">+12% from last week</div>
                  </div>

                  <div className={cn(
                    "p-6 rounded-lg border-2 transition-all duration-300",
                    isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium opacity-70">Conversion Rate</div>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold mb-2">{analytics?.conversionRate || 0}%</div>
                    <div className="text-sm text-green-500">+5.2% from last week</div>
                  </div>

                  <div className={cn(
                    "p-6 rounded-lg border-2 transition-all duration-300",
                    isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium opacity-70">Avg Response Time</div>
                      <Clock className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="text-3xl font-bold mb-2">{analytics?.avgResponseTime || '0h'}</div>
                    <div className="text-sm text-green-500">-15min from last week</div>
                  </div>

                  <div className={cn(
                    "p-6 rounded-lg border-2 transition-all duration-300",
                    isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium opacity-70">Active Users</div>
                      <Users className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold mb-2">{appUsers.length}</div>
                    <div className="text-sm text-green-500">+1 this month</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">App Information</h4>
                    <div className={cn(
                      "p-4 rounded-lg border-2",
                      isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                    )}>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Name:</span>
                          <span>{app.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Slug:</span>
                          <span>{app.slug}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Admin Email:</span>
                          <span>{app.admin_email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Template:</span>
                          <span>{app.template_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            app.status === 'sandbox' && "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
                            app.status === 'production' && "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
                            app.status === 'disabled' && "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                          )}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Quick Actions</h4>
                    <div className="space-y-3">
                      <button 
                        onClick={() => window.open(app.public_url || `/${app.slug}`, '_blank')}
                        className={cn(
                          "w-full p-3 rounded-lg border-2 transition-all duration-300 flex items-center space-x-3",
                          "hover:scale-105",
                          isDark
                            ? "border-white/30 hover:border-white/50"
                            : "border-black/30 hover:border-black/50"
                        )}
                      >
                        <Eye className="w-5 h-5" />
                        <span>Preview Public Site</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('settings')}
                        className={cn(
                          "w-full p-3 rounded-lg border-2 transition-all duration-300 flex items-center space-x-3",
                          "hover:scale-105",
                          isDark
                            ? "border-white/30 hover:border-white/50"
                            : "border-black/30 hover:border-black/50"
                        )}
                      >
                        <Edit className="w-5 h-5" />
                        <span>Edit App Settings</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('deployment')}
                        className={cn(
                          "w-full p-3 rounded-lg border-2 transition-all duration-300 flex items-center space-x-3",
                          "hover:scale-105",
                          isDark
                            ? "border-white/30 hover:border-white/50"
                            : "border-black/30 hover:border-black/50"
                        )}
                      >
                        <Rocket className="w-5 h-5" />
                        <span>Deploy to Production</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-wide uppercase">Form Submissions</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search submissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={cn(
                          "pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                          "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                          "border-gray-300 dark:border-gray-600"
                        )}
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className={cn(
                        "px-3 py-2 border rounded-lg text-sm font-medium",
                        isDark ? "bg-white/5 border-white/10 text-white" : "bg-black/5 border-black/10 text-black"
                      )}
                    >
                      <option value="all">All Status</option>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                    </select>
                    <button 
                      onClick={() => exportData('submissions')}
                      disabled={isExporting}
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 transition-all duration-300 flex items-center space-x-2",
                        isDark
                          ? "border-white/30 hover:border-white/50"
                          : "border-black/30 hover:border-black/50"
                      )}
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Enhanced Submissions Data with Filtering */}
                <div className="space-y-4">
                  {submissions
                    .filter(submission => {
                      const matchesSearch = searchTerm === "" || 
                        submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        submission.message.toLowerCase().includes(searchTerm.toLowerCase());
                      
                      const matchesStatus = filterStatus === "all" || submission.status === filterStatus;
                      
                      return matchesSearch && matchesStatus;
                    })
                    .map((submission) => (
                    <div
                      key={submission.id}
                      className={cn(
                        "p-6 rounded-lg border-2 transition-all duration-300",
                        isDark
                          ? "border-white/30 hover:border-white/50"
                          : "border-black/30 hover:border-black/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {submission.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-lg">{submission.name}</div>
                            <div className="text-sm text-gray-500">{submission.email}</div>
                            <div className="text-sm text-gray-500">{submission.phone}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              IP: {submission.ipAddress} • Source: {submission.source}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            getStatusColor(submission.status)
                          )}>
                            {submission.status === 'new' && 'New'}
                            {submission.status === 'contacted' && 'Contacted'}
                            {submission.status === 'qualified' && 'Qualified'}
                          </span>
                          <div className="text-sm text-gray-500">{formatDate(submission.submittedAt)}</div>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => {
                                // View submission details
                                addNotification('info', `Viewing submission from ${submission.name}`);
                              }}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                // Edit submission status
                                addNotification('info', `Editing submission from ${submission.name}`);
                              }}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Edit Status"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                // Download submission as PDF
                                addNotification('success', `Downloading submission from ${submission.name}`);
                              }}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                // Copy submission data
                                navigator.clipboard.writeText(JSON.stringify(submission, null, 2));
                                addNotification('success', `Copied submission data from ${submission.name}`);
                              }}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Copy Data"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm leading-relaxed">{submission.message}</p>
                      </div>
                    </div>
                  ))}
                  
                  {submissions.filter(submission => {
                    const matchesSearch = searchTerm === "" || 
                      submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      submission.message.toLowerCase().includes(searchTerm.toLowerCase());
                    
                    const matchesStatus = filterStatus === "all" || submission.status === filterStatus;
                    
                    return matchesSearch && matchesStatus;
                  }).length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📝</div>
                      <h3 className="text-xl font-semibold mb-2">No submissions found</h3>
                      <p className="text-gray-500">
                        {searchTerm || filterStatus !== 'all' 
                          ? 'Try adjusting your search or filter criteria'
                          : 'No form submissions have been received yet'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-wide uppercase">Generated Documents</h3>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => exportData('documents')}
                      disabled={isExporting}
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 transition-all duration-300 flex items-center space-x-2",
                        isDark
                          ? "border-white/30 hover:border-white/50"
                          : "border-black/30 hover:border-black/50"
                      )}
                    >
                      <Download className="w-4 h-4" />
                      <span>Export List</span>
                    </button>
                    <button 
                      onClick={() => {
                        addNotification('info', 'Document generation feature coming soon');
                      }}
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 transition-all duration-300 flex items-center space-x-2",
                        isDark
                          ? "border-white/30 hover:border-white/50"
                          : "border-black/30 hover:border-black/50"
                      )}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Generate Document</span>
                    </button>
                  </div>
                </div>
                
                {/* Enhanced Documents Data */}
                <div className="space-y-4">
                  {documents.map((document) => (
                    <div
                      key={document.id}
                      className={cn(
                        "p-6 rounded-lg border-2 transition-all duration-300",
                        isDark
                          ? "border-white/30 hover:border-white/50"
                          : "border-black/30 hover:border-black/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-xl">
                            📄
                          </div>
                          <div>
                            <div className="font-semibold text-lg">{document.name}</div>
                            <div className="text-sm text-gray-500">{document.type} • {formatFileSize(document.size)}</div>
                            <div className="text-sm text-gray-500">Generated: {formatDate(document.generatedAt)}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              Submission ID: {document.submissionId}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            getStatusColor(document.status)
                          )}>
                            {document.status}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => {
                                // Preview document
                                addNotification('info', `Previewing document: ${document.name}`);
                              }}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Preview Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                // Download document
                                window.open(document.downloadUrl, '_blank');
                                addNotification('success', `Downloading document: ${document.name}`);
                              }}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Download Document"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                // Share document
                                navigator.clipboard.writeText(document.downloadUrl);
                                addNotification('success', `Document link copied to clipboard`);
                              }}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Share Document"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                // Delete document
                                if (confirm(`Are you sure you want to delete "${document.name}"?`)) {
                                  addNotification('warning', `Document "${document.name}" deleted`);
                                }
                              }}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-500 hover:text-red-600"
                              title="Delete Document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {documents.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📄</div>
                      <h3 className="text-xl font-semibold mb-2">No documents generated yet</h3>
                      <p className="text-gray-500">
                        Documents will appear here once form submissions are processed
                      </p>
                    </div>
                  )}
                </div>

                {/* Document Statistics */}
                <div className={cn(
                  "p-6 rounded-lg border-2",
                  isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                )}>
                  <h4 className="font-semibold mb-4">Document Statistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">{documents.length}</div>
                      <div className="text-sm text-gray-500">Total Documents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
                      </div>
                      <div className="text-sm text-gray-500">Total Size</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">
                        {documents.filter(doc => doc.status === 'ready').length}
                      </div>
                      <div className="text-sm text-gray-500">Ready for Download</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-wide uppercase">App Users</h3>
                  <button className={cn(
                    "px-4 py-2 rounded-lg border-2 transition-all duration-300 flex items-center space-x-2",
                    isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                  )}>
                    <Plus className="w-4 h-4" />
                    <span>Invite User</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      name: "Admin User",
                      email: app.admin_email,
                      role: "Admin",
                      status: "active",
                      lastActive: "2 hours ago",
                      avatar: app.admin_email.charAt(0).toUpperCase()
                    },
                    {
                      id: 2,
                      name: "Client Manager",
                      email: "manager@testclient.com",
                      role: "Manager",
                      status: "active",
                      lastActive: "1 day ago",
                      avatar: "M"
                    },
                    {
                      id: 3,
                      name: "Support Agent",
                      email: "support@testclient.com",
                      role: "Support",
                      status: "inactive",
                      lastActive: "1 week ago",
                      avatar: "S"
                    }
                  ].map((user) => (
                    <div
                      key={user.id}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all duration-300",
                        isDark
                          ? "border-white/30"
                          : "border-black/30"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user.avatar}
                          </div>
                          <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.role} • Last active: {user.lastActive}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            user.status === 'active' && "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
                            user.status === 'inactive' && "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                          )}>
                            {user.status}
                          </span>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'roles' && (
              <div className="space-y-6">
                <RoleManager
                  users={[
                    {
                      id: '1',
                      email: app.admin_email,
                      name: 'Admin User',
                      role: 'admin',
                      status: 'active',
                      lastActive: '2 hours ago'
                    },
                    {
                      id: '2',
                      email: 'manager@testclient.com',
                      name: 'Client Manager',
                      role: 'editor',
                      status: 'active',
                      lastActive: '1 day ago'
                    },
                    {
                      id: '3',
                      email: 'support@testclient.com',
                      name: 'Support Agent',
                      role: 'viewer',
                      status: 'inactive',
                      lastActive: '1 week ago'
                    }
                  ]}
                  currentUserRole="admin"
                  onRoleUpdate={async (userId, newRole) => {
                    console.log('Updating role:', userId, newRole);
                    // In real app, this would call the API
                  }}
                  onUserInvite={async (email, role) => {
                    console.log('Inviting user:', email, role);
                    // In real app, this would call the API
                  }}
                />
              </div>
            )}

            {activeTab === 'deployment' && (
              <div className="space-y-6">
                <DeploymentManager
                  app={app}
                  onStatusChange={async (status) => {
                    console.log('Status change requested:', status);
                    // In real app, this would call the API to update status
                    setApp(prev => prev ? { ...prev, status } : null);
                  }}
                  onDomainUpdate={async (domain) => {
                    console.log('Domain update requested:', domain);
                    // In real app, this would call the API to update domain
                  }}
                />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-wide uppercase">Analytics Dashboard</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => exportData('reports')}
                      disabled={isExporting}
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 transition-all duration-300 flex items-center space-x-2 text-sm",
                        isDark
                          ? "border-white/30 hover:border-white/50"
                          : "border-black/30 hover:border-black/50"
                      )}
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Analytics</span>
                    </button>
                  </div>
                </div>

                {/* Analytics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className={cn(
                    "p-6 rounded-lg border-2 transition-all duration-300",
                    isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium opacity-70">Total Submissions</div>
                      <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold mb-2">{analytics?.totalSubmissions || 0}</div>
                    <div className="text-sm text-green-500">+12% from last week</div>
                  </div>

                  <div className={cn(
                    "p-6 rounded-lg border-2 transition-all duration-300",
                    isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium opacity-70">Conversion Rate</div>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold mb-2">{analytics?.conversionRate || 0}%</div>
                    <div className="text-sm text-green-500">+5.2% from last week</div>
                  </div>

                  <div className={cn(
                    "p-6 rounded-lg border-2 transition-all duration-300",
                    isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium opacity-70">Avg Response Time</div>
                      <Clock className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="text-3xl font-bold mb-2">{analytics?.avgResponseTime || '0h'}</div>
                    <div className="text-sm text-green-500">-15min from last week</div>
                  </div>

                  <div className={cn(
                    "p-6 rounded-lg border-2 transition-all duration-300",
                    isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium opacity-70">Documents Generated</div>
                      <Download className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold mb-2">{analytics?.totalDocuments || 0}</div>
                    <div className="text-sm text-green-500">+8% from last week</div>
                  </div>
                </div>

                {/* Traffic Sources */}
                <div className={cn(
                  "p-6 rounded-lg border-2",
                  isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                )}>
                  <h4 className="font-semibold mb-4">Traffic Sources</h4>
                  <div className="space-y-4">
                    {analytics?.topSources?.map((source: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="font-medium capitalize">{source.source.replace('-', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">{source.count} submissions</span>
                          <span className="text-sm font-medium">{source.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily Stats Chart */}
                <div className={cn(
                  "p-6 rounded-lg border-2",
                  isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                )}>
                  <h4 className="font-semibold mb-4">Daily Activity (Last 7 Days)</h4>
                  <div className="space-y-3">
                    {analytics?.dailyStats?.map((stat: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{new Date(stat.date).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-blue-500">{stat.submissions} submissions</span>
                          <span className="text-sm text-green-500">{stat.documents} documents</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-wide uppercase">Reports & Exports</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => exportData('reports')}
                      disabled={isExporting}
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 transition-all duration-300 flex items-center space-x-2 text-sm",
                        isDark
                          ? "border-white/30 hover:border-white/50"
                          : "border-black/30 hover:border-black/50"
                      )}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Generate Report</span>
                    </button>
                  </div>
                </div>

                {/* Available Reports */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className={cn(
                        "p-6 rounded-lg border-2 transition-all duration-300",
                        isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{report.name}</h4>
                          <p className="text-sm text-gray-500 capitalize">{report.type} Report</p>
                        </div>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          getStatusColor(report.status)
                        )}>
                          {report.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Generated:</span>
                          <span>{formatDate(report.generatedAt)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Size:</span>
                          <span>{formatFileSize(report.size)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(report.downloadUrl, '_blank')}
                          className={cn(
                            "flex-1 px-4 py-2 rounded-lg border-2 transition-all duration-300 flex items-center justify-center space-x-2 text-sm",
                            isDark
                              ? "border-white/30 hover:border-white/50"
                              : "border-black/30 hover:border-black/50"
                          )}
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                        <button
                          className={cn(
                            "px-4 py-2 rounded-lg border-2 transition-all duration-300",
                            isDark
                              ? "border-white/30 hover:border-white/50"
                              : "border-black/30 hover:border-black/50"
                          )}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Report Generation Options */}
                <div className={cn(
                  "p-6 rounded-lg border-2",
                  isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                )}>
                  <h4 className="font-semibold mb-4">Generate New Report</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => exportData('submissions')}
                      disabled={isExporting}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all duration-300 flex flex-col items-center space-y-2",
                        isDark
                          ? "border-white/30 hover:border-white/50"
                          : "border-black/30 hover:border-black/50"
                      )}
                    >
                      <FileText className="w-8 h-8 text-blue-500" />
                      <span className="font-medium">Submissions Report</span>
                      <span className="text-sm text-gray-500">Export all form submissions</span>
                    </button>
                    
                    <button
                      onClick={() => exportData('documents')}
                      disabled={isExporting}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all duration-300 flex flex-col items-center space-y-2",
                        isDark
                          ? "border-white/30 hover:border-white/50"
                          : "border-black/30 hover:border-black/50"
                      )}
                    >
                      <Download className="w-8 h-8 text-green-500" />
                      <span className="font-medium">Documents Report</span>
                      <span className="text-sm text-gray-500">Export document generation stats</span>
                    </button>
                    
                    <button
                      onClick={() => exportData('reports')}
                      disabled={isExporting}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all duration-300 flex flex-col items-center space-y-2",
                        isDark
                          ? "border-white/30 hover:border-white/50"
                          : "border-black/30 hover:border-black/50"
                      )}
                    >
                      <TrendingUp className="w-8 h-8 text-purple-500" />
                      <span className="font-medium">Analytics Report</span>
                      <span className="text-sm text-gray-500">Export performance metrics</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold tracking-wide uppercase">App Settings</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">General Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">App Name</label>
                        <input
                          type="text"
                          value={app.name}
                          className={cn(
                            "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                            "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                            "border-gray-300 dark:border-gray-600"
                          )}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Admin Email</label>
                        <input
                          type="email"
                          value={app.admin_email}
                          className={cn(
                            "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                            "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                            "border-gray-300 dark:border-gray-600"
                          )}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">App Description</label>
                        <textarea
                          rows={3}
                          placeholder="Describe your app..."
                          className={cn(
                            "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                            "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                            "border-gray-300 dark:border-gray-600"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">App Status & Environment</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <select
                          value={app.status}
                          className={cn(
                            "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                            "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                            "border-gray-300 dark:border-gray-600"
                          )}
                        >
                          <option value="sandbox">Sandbox</option>
                          <option value="production">Production</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Environment</label>
                        <select
                          value={app.environment}
                          className={cn(
                            "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                            "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                            "border-gray-300 dark:border-gray-600"
                          )}
                        >
                          <option value="development">Development</option>
                          <option value="staging">Staging</option>
                          <option value="production">Production</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Template</label>
                        <select
                          value={app.template_id}
                          className={cn(
                            "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                            "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                            "border-gray-300 dark:border-gray-600"
                          )}
                        >
                          <option value="lead-form-pdf">Lead Form + PDF Receipt</option>
                          <option value="consultation-booking">Consultation Booking System</option>
                          <option value="ecommerce-catalog">E-Commerce Product Catalog</option>
                          <option value="survey-feedback">Survey & Feedback System</option>
                          <option value="consultation-ai">AI Consultation Generator</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Notification Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Email Notifications</div>
                          <div className="text-sm text-gray-500">Receive email alerts for new submissions</div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">SMS Notifications</div>
                          <div className="text-sm text-gray-500">Receive SMS alerts for urgent submissions</div>
                        </div>
                        <input type="checkbox" className="w-4 h-4" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Daily Reports</div>
                          <div className="text-sm text-gray-500">Receive daily summary reports</div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Security Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Two-Factor Authentication</div>
                          <div className="text-sm text-gray-500">Require 2FA for admin access</div>
                        </div>
                        <input type="checkbox" className="w-4 h-4" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">IP Restrictions</div>
                          <div className="text-sm text-gray-500">Restrict admin access to specific IPs</div>
                        </div>
                        <input type="checkbox" className="w-4 h-4" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Session Timeout</div>
                          <div className="text-sm text-gray-500">Auto-logout after inactivity</div>
                        </div>
                        <select className="px-3 py-1 border rounded text-sm">
                          <option>15 minutes</option>
                          <option>30 minutes</option>
                          <option>1 hour</option>
                          <option>2 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button className={cn(
                    "px-6 py-2 rounded-lg border-2 transition-all duration-300",
                    isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                  )}>
                    Cancel
                  </button>
                  <button className={cn(
                    "px-6 py-2 rounded-lg border-2 transition-all duration-300",
                    "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                  )}>
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Notification Toasts */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={cn(
              "p-4 rounded-lg border-2 shadow-lg max-w-sm backdrop-blur-sm",
              notification.type === 'success' && (isDark ? "bg-green-900/60 border-green-500/50 text-green-300" : "bg-green-100/90 border-green-300 text-green-800"),
              notification.type === 'error' && (isDark ? "bg-red-900/60 border-red-500/50 text-red-300" : "bg-red-100/90 border-red-300 text-red-800"),
              notification.type === 'warning' && (isDark ? "bg-yellow-900/60 border-yellow-500/50 text-yellow-300" : "bg-yellow-100/90 border-yellow-300 text-yellow-800"),
              notification.type === 'info' && (isDark ? "bg-blue-900/60 border-blue-500/50 text-blue-300" : "bg-blue-100/90 border-blue-300 text-blue-800")
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs opacity-60 mt-1">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="p-1 h-auto opacity-60 hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


