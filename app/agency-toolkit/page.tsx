/**
 * @fileoverview Main Agency Toolkit Dashboard
 * Central dashboard for agency toolkit operations and rapid micro-app development
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

// Agency Metrics Interface
interface AgencyMetrics {
  totalClients: number;
  activeMicroApps: number;
  templatesCreated: number;
  formsBuilt: number;
  documentsGenerated: number;
  avgDeliveryTime: string;
  clientSatisfaction: number;
  systemHealth: number;
}

// Quick Stats
interface QuickStat {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'stable';
}

// Toolkit Module
interface ToolkitModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  status: 'active' | 'maintenance' | 'new';
  usage: number;
  lastUsed: string;
}

export default function AgencyToolkitPage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [metrics, setMetrics] = useState<AgencyMetrics>({
    totalClients: 24,
    activeMicroApps: 47,
    templatesCreated: 12,
    formsBuilt: 28,
    documentsGenerated: 156,
    avgDeliveryTime: '4.2 days',
    clientSatisfaction: 94.5,
    systemHealth: 98.7
  });

  const [quickStats, setQuickStats] = useState<QuickStat[]>([
    { label: 'New Clients', value: 3, change: '+2 this week', trend: 'up' },
    { label: 'Templates Used', value: 45, change: '+12 this week', trend: 'up' },
    { label: 'Forms Submitted', value: 287, change: '+34 today', trend: 'up' },
    { label: 'Documents Generated', value: 89, change: '+15 today', trend: 'up' }
  ]);

  const [toolkitModules] = useState<ToolkitModule[]>([
    {
      id: '1',
      name: 'Component Library',
      description: 'Atomic design components with live examples and customization',
      icon: '🧩',
      href: '/agency-toolkit/components',
      status: 'active',
      usage: 95,
      lastUsed: '2 hours ago'
    },
    {
      id: '2',
      name: 'Template Engine',
      description: '5+ custom micro-app templates with rapid deployment',
      icon: '📋',
      href: '/agency-toolkit/templates',
      status: 'active',
      usage: 87,
      lastUsed: '30 min ago'
    },
    {
      id: '3',
      name: 'Form Builder',
      description: 'Advanced form builder with 21 field types and validation',
      icon: '📝',
      href: '/agency-toolkit/forms',
      status: 'active',
      usage: 78,
      lastUsed: '1 hour ago'
    },
    {
      id: '4',
      name: 'Document Generator',
      description: 'Multi-format document generation with client branding',
      icon: '📄',
      href: '/agency-toolkit/documents',
      status: 'active',
      usage: 72,
      lastUsed: '45 min ago'
    },
    {
      id: '5',
      name: 'Client Theming',
      description: 'Brand-aware theming system with customization tools',
      icon: '🎨',
      href: '/agency-toolkit/theming',
      status: 'active',
      usage: 84,
      lastUsed: '15 min ago'
    },
    {
      id: '6',
      name: 'Performance Monitor',
      description: 'Real-time performance monitoring and optimization',
      icon: '⚡',
      href: '/state-management/performance',
      status: 'active',
      usage: 91,
      lastUsed: '5 min ago'
    }
  ]);

  useEffect(() => {
    setMounted(true);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        systemHealth: 95 + Math.random() * 5,
        clientSatisfaction: 90 + Math.random() * 10
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
                Agency Toolkit Dashboard
              </h1>
              <p className={cn(
                "mt-2 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Rapid micro-app development and client delivery platform
              </p>
            </div>
            <ThemeToggle />
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
          {/* Key Metrics */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { label: "Total Clients", value: metrics.totalClients, unit: "", color: "blue" },
              { label: "Active Micro-Apps", value: metrics.activeMicroApps, unit: "", color: "green" },
              { label: "Avg Delivery", value: metrics.avgDeliveryTime, unit: "", color: "yellow" },
              { label: "Satisfaction", value: metrics.clientSatisfaction, unit: "%", color: "purple" }
            ].map((metric) => (
              <div
                key={metric.label}
                className={cn(
                  "p-6 rounded-lg border-2 transition-all duration-300",
                  isDark
                    ? "bg-black/5 border-white/30 hover:border-white/50"
                    : "bg-white/5 border-black/30 hover:border-black/50"
                )}
              >
                <div className="text-sm font-medium uppercase tracking-wide opacity-70">
                  {metric.label}
                </div>
                <div className="text-2xl font-bold mt-2">
                  {typeof metric.value === 'number' && metric.value % 1 !== 0
                    ? metric.value.toFixed(1)
                    : metric.value}
                  {metric.unit && <span className="text-sm ml-1">{metric.unit}</span>}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            variants={itemVariants}
            className={cn(
              "p-6 rounded-lg border-2 transition-all duration-300",
              isDark
                ? "bg-black/5 border-white/30"
                : "bg-white/5 border-black/30"
            )}
          >
            <h2 className="text-xl font-bold tracking-wide uppercase mb-6">
              Quick Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-300",
                    isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className={cn(
                      "text-xs px-2 py-1 rounded",
                      stat.trend === 'up' && "bg-green-500/20 text-green-500",
                      stat.trend === 'down' && "bg-red-500/20 text-red-500",
                      stat.trend === 'stable' && "bg-gray-500/20 text-gray-500"
                    )}>
                      {stat.trend === 'up' ? '↗' : stat.trend === 'down' ? '↘' : '→'}
                    </div>
                  </div>
                  <div className="font-medium text-sm mt-1">{stat.label}</div>
                  <div className="text-xs opacity-70">{stat.change}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Toolkit Modules */}
          <motion.div
            variants={itemVariants}
            className={cn(
              "p-6 rounded-lg border-2 transition-all duration-300",
              isDark
                ? "bg-black/5 border-white/30"
                : "bg-white/5 border-black/30"
            )}
          >
            <h2 className="text-xl font-bold tracking-wide uppercase mb-6">
              Toolkit Modules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {toolkitModules.map((module) => (
                <a
                  key={module.id}
                  href={module.href}
                  className={cn(
                    "p-6 rounded-lg border-2 transition-all duration-300 block",
                    "hover:scale-105",
                    isDark
                      ? "border-white/30 hover:border-white/50 hover:bg-white/10"
                      : "border-black/30 hover:border-black/50 hover:bg-black/10"
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{module.icon}</div>
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium uppercase",
                        module.status === 'active' && "bg-green-500/20 text-green-500",
                        module.status === 'maintenance' && "bg-yellow-500/20 text-yellow-500",
                        module.status === 'new' && "bg-blue-500/20 text-blue-500"
                      )}>
                        {module.status}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold tracking-wide uppercase text-lg mb-2">
                    {module.name}
                  </h3>
                  <p className="text-sm opacity-70 mb-4">
                    {module.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs opacity-70">
                      Last used: {module.lastUsed}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs font-medium">{module.usage}%</div>
                      <div className={cn(
                        "w-16 h-2 rounded-full",
                        isDark ? "bg-white/20" : "bg-black/20"
                      )}>
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${module.usage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            variants={itemVariants}
            className={cn(
              "p-6 rounded-lg border-2 transition-all duration-300",
              isDark
                ? "bg-black/5 border-white/30"
                : "bg-white/5 border-black/30"
            )}
          >
            <h2 className="text-xl font-bold tracking-wide uppercase mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {[
                { action: 'Template Created', client: 'Acme Corp', time: '15 min ago', type: 'success' },
                { action: 'Form Submitted', client: 'TechStart Inc', time: '32 min ago', type: 'info' },
                { action: 'Document Generated', client: 'Global Solutions', time: '1 hour ago', type: 'success' },
                { action: 'Client Onboarded', client: 'Innovation Labs', time: '2 hours ago', type: 'success' },
                { action: 'Theme Customized', client: 'Design Studio', time: '3 hours ago', type: 'info' }
              ].map((activity, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-all duration-300",
                    isDark ? "border-white/20 hover:bg-white/5" : "border-black/20 hover:bg-black/5"
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      activity.type === 'success' ? "bg-green-500" : "bg-blue-500"
                    )} />
                    <div>
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-sm opacity-70">{activity.client}</div>
                    </div>
                  </div>
                  <div className="text-sm opacity-70">{activity.time}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* System Health */}
          <motion.div
            variants={itemVariants}
            className={cn(
              "p-6 rounded-lg border-2 transition-all duration-300",
              isDark
                ? "bg-black/5 border-white/30"
                : "bg-white/5 border-black/30"
            )}
          >
            <h2 className="text-xl font-bold tracking-wide uppercase mb-4">
              System Health
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm font-medium mb-2">Overall Health</div>
                <div className="text-3xl font-bold text-green-500">{metrics.systemHealth.toFixed(1)}%</div>
                <div className="text-xs opacity-70">All systems operational</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Performance</div>
                <div className="text-3xl font-bold text-blue-500">Excellent</div>
                <div className="text-xs opacity-70">Sub-2s page loads</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Uptime</div>
                <div className="text-3xl font-bold text-purple-500">99.9%</div>
                <div className="text-xs opacity-70">Last 30 days</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}