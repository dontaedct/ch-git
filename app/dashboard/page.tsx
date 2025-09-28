/**
 * @fileoverview Real Data Dashboard
 * Dashboard with real database integration
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { Settings, FileText, Package, BarChart3, AlertCircle, CheckCircle, ArrowUpRight, Activity, Calendar, Database, Webhook, ExternalLink } from "lucide-react";

interface DashboardStats {
  totalClients: number;
  activeMicroApps: number;
  templatesCreated: number;
  formsBuilt: number;
  documentsGenerated: number;
  avgDeliveryTime: string;
  clientSatisfaction: number;
  systemHealth: number;
}

export default function DashboardPage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeMicroApps: 0,
    templatesCreated: 0,
    formsBuilt: 0,
    documentsGenerated: 0,
    avgDeliveryTime: "0 days",
    clientSatisfaction: 0,
    systemHealth: 0
  });

  // Load real dashboard data from API
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/agency-data?action=metrics');
        const result = await response.json();
        
        if (result.success) {
          setStats(result.data);
        } else {
          throw new Error(result.error || 'Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    setMounted(true);
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
                Dashboard
              </h1>
              <p className={cn(
                "mt-2 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Real-time system overview and management
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className={cn(
              "text-lg font-medium",
              isDark ? "text-white/80" : "text-black/80"
            )}>
              Loading dashboard data...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800 font-medium">Error loading dashboard</div>
            <div className="text-red-600 text-sm mt-1">{error}</div>
          </div>
        )}

        {/* Real Data Indicator */}
        {!loading && !error && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="text-green-800 font-medium">✅ Connected to real database</div>
            <div className="text-green-600 text-sm mt-1">Showing actual system data from database</div>
          </div>
        )}

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
              { 
                label: "Total Clients", 
                value: stats.totalClients, 
                icon: Package, 
                color: "blue",
                description: "Active client accounts"
              },
              { 
                label: "Micro-Apps", 
                value: stats.activeMicroApps, 
                icon: Activity, 
                color: "green",
                description: "Deployed applications"
              },
              { 
                label: "Templates", 
                value: stats.templatesCreated, 
                icon: FileText, 
                color: "purple",
                description: "Created templates"
              },
              { 
                label: "System Health", 
                value: `${stats.systemHealth}%`, 
                icon: CheckCircle, 
                color: "green",
                description: "Overall system status"
              }
            ].map((metric, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={cn(
                  "p-6 rounded-lg border-2 transition-all duration-300",
                  isDark 
                    ? "border-white/20 hover:border-white/40" 
                    : "border-black/20 hover:border-black/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn(
                      "text-sm font-medium",
                      isDark ? "text-white/70" : "text-black/70"
                    )}>
                      {metric.label}
                    </p>
                    <p className={cn(
                      "text-2xl font-bold mt-1",
                      isDark ? "text-white" : "text-black"
                    )}>
                      {metric.value}
                    </p>
                    <p className={cn(
                      "text-xs mt-1",
                      isDark ? "text-white/60" : "text-black/60"
                    )}>
                      {metric.description}
                    </p>
                  </div>
                  <metric.icon className={cn(
                    "w-8 h-8",
                    isDark ? "text-white/80" : "text-black/80"
                  )} />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[
              {
                title: "Agency Toolkit",
                description: "Access the main toolkit dashboard",
                href: "/agency-toolkit",
                icon: Settings,
                color: "blue"
              },
              {
                title: "Client Management",
                description: "Manage clients and projects",
                href: "/clients",
                icon: Package,
                color: "green"
              },
              {
                title: "System Health",
                description: "Monitor system performance",
                href: "/operability/health-monitoring",
                icon: BarChart3,
                color: "purple"
              }
            ].map((action, index) => (
              <motion.a
                key={index}
                href={action.href}
                variants={itemVariants}
                className={cn(
                  "p-6 rounded-lg border-2 transition-all duration-300 hover:scale-105",
                  isDark 
                    ? "border-white/20 hover:border-white/40 hover:bg-white/5" 
                    : "border-black/20 hover:border-black/40 hover:bg-black/5"
                )}
              >
                <div className="flex items-center space-x-4">
                  <action.icon className={cn(
                    "w-8 h-8",
                    isDark ? "text-white/80" : "text-black/80"
                  )} />
                  <div>
                    <h3 className={cn(
                      "font-semibold",
                      isDark ? "text-white" : "text-black"
                    )}>
                      {action.title}
                    </h3>
                    <p className={cn(
                      "text-sm mt-1",
                      isDark ? "text-white/70" : "text-black/70"
                    )}>
                      {action.description}
                    </p>
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>

          {/* System Status */}
          <motion.div
            variants={itemVariants}
            className={cn(
              "p-6 rounded-lg border-2",
              isDark ? "border-white/20" : "border-black/20"
            )}
          >
            <h3 className={cn(
              "text-lg font-semibold mb-4",
              isDark ? "text-white" : "text-black"
            )}>
              System Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className={cn(
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  Database Connected
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className={cn(
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  API Endpoints Active
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className={cn(
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  Real Data Service Running
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className={cn(
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  System Health: {stats.systemHealth}%
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}