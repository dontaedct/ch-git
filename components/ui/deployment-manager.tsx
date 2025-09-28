/**
 * @fileoverview Deployment Manager Component
 * Comprehensive deployment management interface for moving apps from sandbox to production
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { TenantApp } from '@/types/tenant-apps';
import { 
  Rocket, 
  Globe, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  ExternalLink,
  Copy,
  Eye,
  Play,
  Pause,
  RefreshCw,
  Shield,
  Database,
  Server,
  Cloud,
  Zap,
  Activity,
  TrendingUp,
  Users,
  FileText,
  Download
} from 'lucide-react';

interface DeploymentManagerProps {
  app: TenantApp;
  onStatusChange: (status: 'sandbox' | 'production' | 'disabled') => Promise<void>;
  onDomainUpdate: (domain: string) => Promise<void>;
  className?: string;
}

interface DeploymentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  icon: React.ComponentType<any>;
  duration?: string;
}

interface DomainConfig {
  customDomain: string;
  sslStatus: 'pending' | 'active' | 'error';
  dnsStatus: 'pending' | 'active' | 'error';
  lastChecked: string;
}

export function DeploymentManager({ 
  app, 
  onStatusChange, 
  onDomainUpdate, 
  className 
}: DeploymentManagerProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'deploy' | 'domains' | 'monitoring'>('overview');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([]);
  const [domainConfig, setDomainConfig] = useState<DomainConfig>({
    customDomain: '',
    sslStatus: 'pending',
    dnsStatus: 'pending',
    lastChecked: new Date().toISOString()
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const deploymentStepsTemplate: DeploymentStep[] = [
    {
      id: 'pre-deploy',
      title: 'Pre-deployment Checks',
      description: 'Validating app configuration and dependencies',
      status: 'pending',
      icon: Shield,
      duration: '30s'
    },
    {
      id: 'build',
      title: 'Building Application',
      description: 'Compiling and optimizing app assets',
      status: 'pending',
      icon: Settings,
      duration: '2m'
    },
    {
      id: 'test',
      title: 'Running Tests',
      description: 'Executing automated test suite',
      status: 'pending',
      icon: CheckCircle,
      duration: '1m'
    },
    {
      id: 'deploy',
      title: 'Deploying to Production',
      description: 'Pushing to production environment',
      status: 'pending',
      icon: Rocket,
      duration: '3m'
    },
    {
      id: 'verify',
      title: 'Verification',
      description: 'Testing production deployment',
      status: 'pending',
      icon: Eye,
      duration: '1m'
    }
  ];

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeploymentSteps([...deploymentStepsTemplate]);

    // Simulate deployment process
    for (let i = 0; i < deploymentStepsTemplate.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDeploymentSteps(prev => 
        prev.map((step, index) => ({
          ...step,
          status: index < i ? 'completed' : index === i ? 'in-progress' : 'pending'
        }))
      );
    }

    // Complete deployment
    setDeploymentSteps(prev => 
      prev.map(step => ({ ...step, status: 'completed' }))
    );

    // Update app status
    await onStatusChange('production');
    setIsDeploying(false);
  };

  const handleDomainUpdate = async () => {
    if (domainConfig.customDomain) {
      await onDomainUpdate(domainConfig.customDomain);
    }
  };

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
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-wide uppercase">Deployment Manager</h2>
          <p className={cn(
            "mt-1 text-sm",
            isDark ? "text-white/80" : "text-black/80"
          )}>
            Deploy and manage your app from sandbox to production
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            app.status === 'sandbox' && "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
            app.status === 'production' && "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
            app.status === 'disabled' && "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
          )}>
            {app.status === 'sandbox' && '🧪 Sandbox'}
            {app.status === 'production' && '🚀 Production'}
            {app.status === 'disabled' && '⏸️ Disabled'}
          </span>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="flex space-x-4"
      >
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'deploy', label: 'Deploy', icon: Rocket },
          { id: 'domains', label: 'Domains', icon: Globe },
          { id: 'monitoring', label: 'Monitoring', icon: TrendingUp }
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-6 py-3 rounded-lg border-2 font-bold transition-all duration-300 flex items-center space-x-2",
                activeTab === tab.id
                  ? isDark
                    ? "bg-white/10 border-white/50"
                    : "bg-black/10 border-black/50"
                  : isDark
                    ? "border-white/30 hover:border-white/50"
                    : "border-black/30 hover:border-black/50"
              )}
            >
              <IconComponent className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            "p-6 rounded-lg border-2 transition-all duration-300",
            isDark
              ? "bg-black/5 border-white/30"
              : "bg-white/5 border-black/30"
          )}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Server className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold">{app.status}</div>
              <div className="text-sm text-gray-500">Current Status</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold">{app.submissions_count}</div>
              <div className="text-sm text-gray-500">Submissions</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold">{app.documents_count}</div>
              <div className="text-sm text-gray-500">Documents</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold">
                {app.last_activity_at ? '2h ago' : 'Never'}
              </div>
              <div className="text-sm text-gray-500">Last Activity</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Deploy Tab */}
      {activeTab === 'deploy' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            "p-6 rounded-lg border-2 transition-all duration-300",
            isDark
              ? "bg-black/5 border-white/30"
              : "bg-white/5 border-black/30"
          )}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Deploy to Production</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Move your app from sandbox to production environment
                </p>
              </div>
              <button
                onClick={handleDeploy}
                disabled={isDeploying || app.status === 'production'}
                className={cn(
                  "px-6 py-3 rounded-lg border-2 font-bold transition-all duration-300 flex items-center space-x-2",
                  "hover:scale-105",
                  isDeploying || app.status === 'production'
                    ? "opacity-50 cursor-not-allowed"
                    : isDark
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-black text-white hover:bg-black/90"
                )}
              >
                {isDeploying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deploying...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Deploy to Production</span>
                  </>
                )}
              </button>
            </div>

            {/* Deployment Steps */}
            {deploymentSteps.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold">Deployment Progress</h4>
                {deploymentSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-300",
                        step.status === 'completed' && "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
                        step.status === 'in-progress' && "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
                        step.status === 'error' && "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
                        step.status === 'pending' && (isDark ? "border-white/30" : "border-black/30")
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        step.status === 'completed' && "bg-green-500 text-white",
                        step.status === 'in-progress' && "bg-blue-500 text-white animate-pulse",
                        step.status === 'error' && "bg-red-500 text-white",
                        step.status === 'pending' && "bg-gray-300 text-gray-600"
                      )}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : step.status === 'in-progress' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : step.status === 'error' ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <IconComponent className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{step.title}</div>
                        <div className="text-sm text-gray-500">{step.description}</div>
                      </div>
                      {step.duration && (
                        <div className="text-sm text-gray-500">{step.duration}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Domains Tab */}
      {activeTab === 'domains' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            "p-6 rounded-lg border-2 transition-all duration-300",
            isDark
              ? "bg-black/5 border-white/30"
              : "bg-white/5 border-black/30"
          )}
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4">Domain Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Current URL</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={`https://${app.slug}.yourapp.com`}
                      readOnly
                      className={cn(
                        "flex-1 px-3 py-2 border rounded-lg",
                        "bg-gray-100 dark:bg-gray-800 text-gray-500"
                      )}
                    />
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Domain</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="yourdomain.com"
                      value={domainConfig.customDomain}
                      onChange={(e) => setDomainConfig(prev => ({ ...prev, customDomain: e.target.value }))}
                      className={cn(
                        "flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                        "border-gray-300 dark:border-gray-600"
                      )}
                    />
                    <button
                      onClick={handleDomainUpdate}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">SSL Certificate</h4>
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    domainConfig.sslStatus === 'active' && "bg-green-500",
                    domainConfig.sslStatus === 'pending' && "bg-yellow-500",
                    domainConfig.sslStatus === 'error' && "bg-red-500"
                  )} />
                  <span className="text-sm">
                    {domainConfig.sslStatus === 'active' && 'Active'}
                    {domainConfig.sslStatus === 'pending' && 'Pending'}
                    {domainConfig.sslStatus === 'error' && 'Error'}
                  </span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">DNS Configuration</h4>
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    domainConfig.dnsStatus === 'active' && "bg-green-500",
                    domainConfig.dnsStatus === 'pending' && "bg-yellow-500",
                    domainConfig.dnsStatus === 'error' && "bg-red-500"
                  )} />
                  <span className="text-sm">
                    {domainConfig.dnsStatus === 'active' && 'Active'}
                    {domainConfig.dnsStatus === 'pending' && 'Pending'}
                    {domainConfig.dnsStatus === 'error' && 'Error'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            "p-6 rounded-lg border-2 transition-all duration-300",
            isDark
              ? "bg-black/5 border-white/30"
              : "bg-white/5 border-black/30"
          )}
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4">Performance Monitoring</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">99.9%</div>
                  <div className="text-sm text-gray-500">Uptime</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">245ms</div>
                  <div className="text-sm text-gray-500">Avg Response</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">1.2k</div>
                  <div className="text-sm text-gray-500">Requests/Hour</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Recent Activity</h4>
              <div className="space-y-3">
                {[
                  { time: '2 minutes ago', event: 'New form submission received', type: 'success' },
                  { time: '15 minutes ago', event: 'PDF document generated', type: 'info' },
                  { time: '1 hour ago', event: 'App deployed to production', type: 'success' },
                  { time: '2 hours ago', event: 'Domain configuration updated', type: 'info' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      activity.type === 'success' && "bg-green-500",
                      activity.type === 'info' && "bg-blue-500",
                      activity.type === 'warning' && "bg-yellow-500",
                      activity.type === 'error' && "bg-red-500"
                    )} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{activity.event}</div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
