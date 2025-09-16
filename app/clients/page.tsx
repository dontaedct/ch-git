/**
 * @fileoverview Client Management Dashboard
 * Central dashboard for client onboarding, management, and oversight
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

// Client Interface
interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'active' | 'onboarding' | 'completed' | 'inactive';
  projectType: string;
  startDate: string;
  deliveryDate: string;
  progress: number;
  satisfaction: number;
  revenue: number;
  microApps: number;
  lastActivity: string;
  priority: 'high' | 'medium' | 'low';
  manager: string;
}

// Management Statistics
interface ManagementStats {
  totalClients: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  avgSatisfaction: number;
  onTimeDelivery: number;
  newClientsThisMonth: number;
  retentionRate: number;
}

export default function ClientManagementPage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [stats] = useState<ManagementStats>({
    totalClients: 48,
    activeProjects: 32,
    completedProjects: 16,
    totalRevenue: 284750,
    avgSatisfaction: 4.6,
    onTimeDelivery: 94.2,
    newClientsThisMonth: 8,
    retentionRate: 87.5
  });

  const [clients] = useState<Client[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      company: 'Acme Corp',
      email: 'sarah@acmecorp.com',
      phone: '+1 (555) 123-4567',
      status: 'active',
      projectType: 'CRM Dashboard',
      startDate: '2024-01-15',
      deliveryDate: '2024-02-28',
      progress: 78,
      satisfaction: 4.8,
      revenue: 25000,
      microApps: 3,
      lastActivity: '2 hours ago',
      priority: 'high',
      manager: 'Alex Rodriguez'
    },
    {
      id: '2',
      name: 'Michael Chen',
      company: 'TechStart Inc',
      email: 'michael@techstart.com',
      phone: '+1 (555) 234-5678',
      status: 'active',
      projectType: 'E-Commerce Platform',
      startDate: '2024-01-20',
      deliveryDate: '2024-03-15',
      progress: 45,
      satisfaction: 4.5,
      revenue: 45000,
      microApps: 5,
      lastActivity: '1 day ago',
      priority: 'high',
      manager: 'Lisa Thompson'
    },
    {
      id: '3',
      name: 'Emma Wilson',
      company: 'Global Solutions',
      email: 'emma@globalsolutions.com',
      phone: '+1 (555) 345-6789',
      status: 'onboarding',
      projectType: 'Analytics Dashboard',
      startDate: '2024-02-01',
      deliveryDate: '2024-03-30',
      progress: 15,
      satisfaction: 0,
      revenue: 32000,
      microApps: 2,
      lastActivity: '3 hours ago',
      priority: 'medium',
      manager: 'David Kim'
    },
    {
      id: '4',
      name: 'James Brown',
      company: 'Innovation Labs',
      email: 'james@innovlabs.com',
      phone: '+1 (555) 456-7890',
      status: 'completed',
      projectType: 'Service Portal',
      startDate: '2023-11-15',
      deliveryDate: '2024-01-10',
      progress: 100,
      satisfaction: 4.9,
      revenue: 38000,
      microApps: 4,
      lastActivity: '1 week ago',
      priority: 'low',
      manager: 'Sophie Martinez'
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      company: 'Design Studio',
      email: 'lisa@designstudio.com',
      phone: '+1 (555) 567-8901',
      status: 'active',
      projectType: 'Portfolio Website',
      startDate: '2024-01-25',
      deliveryDate: '2024-02-20',
      progress: 92,
      satisfaction: 4.7,
      revenue: 18500,
      microApps: 2,
      lastActivity: '30 min ago',
      priority: 'medium',
      manager: 'Alex Rodriguez'
    },
    {
      id: '6',
      name: 'Robert Taylor',
      company: 'Enterprise Systems',
      email: 'robert@enterprise.com',
      phone: '+1 (555) 678-9012',
      status: 'inactive',
      projectType: 'Legacy Migration',
      startDate: '2023-08-10',
      deliveryDate: '2023-12-15',
      progress: 100,
      satisfaction: 4.2,
      revenue: 75000,
      microApps: 8,
      lastActivity: '2 months ago',
      priority: 'low',
      manager: 'Lisa Thompson'
    }
  ]);

  const filteredClients = clients.filter(client => {
    const matchesFilter = selectedFilter === 'all' || client.status === selectedFilter;
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.projectType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
                Client Management Dashboard
              </h1>
              <p className={cn(
                "mt-2 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Comprehensive client onboarding, management, and project oversight
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
          {/* Management Statistics */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { label: "Total Clients", value: stats.totalClients, format: "number", color: "blue" },
              { label: "Active Projects", value: stats.activeProjects, format: "number", color: "green" },
              { label: "Total Revenue", value: stats.totalRevenue, format: "currency", color: "yellow" },
              { label: "Satisfaction", value: stats.avgSatisfaction, format: "rating", color: "purple" }
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
                <div className="text-sm font-medium uppercase tracking-wide opacity-70">
                  {stat.label}
                </div>
                <div className="text-2xl font-bold mt-2">
                  {stat.format === 'currency' && '$'}
                  {stat.format === 'currency' ? stat.value.toLocaleString() : stat.value}
                  {stat.format === 'rating' && '/5'}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Performance Metrics */}
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
              Performance Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "On-Time Delivery", value: `${stats.onTimeDelivery}%`, target: ">90%" },
                { label: "New Clients", value: stats.newClientsThisMonth, target: "8+ monthly" },
                { label: "Retention Rate", value: `${stats.retentionRate}%`, target: ">85%" },
                { label: "Completed Projects", value: stats.completedProjects, target: "15+ monthly" }
              ].map((metric) => (
                <div key={metric.label} className="text-center">
                  <div className="text-3xl font-bold text-blue-500">{metric.value}</div>
                  <div className="font-medium">{metric.label}</div>
                  <div className="text-sm opacity-70">Target: {metric.target}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Client Filters and Search */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
          >
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Clients', count: clients.length },
                { id: 'active', label: 'Active', count: clients.filter(c => c.status === 'active').length },
                { id: 'onboarding', label: 'Onboarding', count: clients.filter(c => c.status === 'onboarding').length },
                { id: 'completed', label: 'Completed', count: clients.filter(c => c.status === 'completed').length },
                { id: 'inactive', label: 'Inactive', count: clients.filter(c => c.status === 'inactive').length }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300",
                    selectedFilter === filter.id
                      ? isDark
                        ? "bg-white/10 border-white/50"
                        : "bg-black/10 border-black/50"
                      : isDark
                        ? "border-white/30 hover:border-white/50"
                        : "border-black/30 hover:border-black/50"
                  )}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "px-4 py-2 rounded-lg border-2 transition-all duration-300",
                  isDark
                    ? "bg-black border-white/30 text-white placeholder-white/50"
                    : "bg-white border-black/30 text-black placeholder-black/50"
                )}
              />
              <button
                className={cn(
                  "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300",
                  "hover:scale-105",
                  isDark
                    ? "border-white/30 hover:border-white/50"
                    : "border-black/30 hover:border-black/50"
                )}
              >
                Add Client
              </button>
            </div>
          </motion.div>

          {/* Client Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredClients.map((client) => (
              <a
                key={client.id}
                href={`/clients/${client.id}`}
                className={cn(
                  "p-6 rounded-lg border-2 transition-all duration-300 block",
                  "hover:scale-105",
                  isDark
                    ? "border-white/30 hover:border-white/50 hover:bg-white/10"
                    : "border-black/30 hover:border-black/50 hover:bg-black/10"
                )}
              >
                {/* Client Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold tracking-wide uppercase text-lg">
                      {client.name}
                    </h3>
                    <p className="text-sm opacity-70">{client.company}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium uppercase",
                      client.status === 'active' && "bg-green-500/20 text-green-500",
                      client.status === 'onboarding' && "bg-blue-500/20 text-blue-500",
                      client.status === 'completed' && "bg-purple-500/20 text-purple-500",
                      client.status === 'inactive' && "bg-gray-500/20 text-gray-500"
                    )}>
                      {client.status}
                    </span>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium uppercase",
                      client.priority === 'high' && "bg-red-500/20 text-red-500",
                      client.priority === 'medium' && "bg-yellow-500/20 text-yellow-500",
                      client.priority === 'low' && "bg-green-500/20 text-green-500"
                    )}>
                      {client.priority}
                    </span>
                  </div>
                </div>

                {/* Project Info */}
                <div className="mb-4">
                  <div className="font-medium text-sm mb-2">{client.projectType}</div>
                  <div className="text-xs opacity-70 space-y-1">
                    <div>Start: {new Date(client.startDate).toLocaleDateString()}</div>
                    <div>Delivery: {new Date(client.deliveryDate).toLocaleDateString()}</div>
                    <div>Manager: {client.manager}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm">{client.progress}%</span>
                  </div>
                  <div className={cn(
                    "h-2 rounded-full",
                    isDark ? "bg-white/20" : "bg-black/20"
                  )}>
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        client.progress >= 80 ? "bg-green-500" :
                        client.progress >= 50 ? "bg-yellow-500" : "bg-blue-500"
                      )}
                      style={{ width: `${client.progress}%` }}
                    />
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="text-center">
                    <div className="font-bold">${client.revenue.toLocaleString()}</div>
                    <div className="opacity-70">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{client.microApps}</div>
                    <div className="opacity-70">Apps</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">
                      {client.satisfaction > 0 ? `${client.satisfaction}/5` : 'N/A'}
                    </div>
                    <div className="opacity-70">Rating</div>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="mt-4 pt-4 border-t border-gray-300 text-xs opacity-70">
                  Last activity: {client.lastActivity}
                </div>
              </a>
            ))}
          </motion.div>

          {/* Quick Actions */}
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
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Client Onboarding", action: "Start", icon: "👥", href: "/clients/onboarding" },
                { name: "Project Templates", action: "View", icon: "📋", href: "/agency-toolkit/templates" },
                { name: "Delivery Pipeline", action: "Monitor", icon: "🚀", href: "/delivery" },
                { name: "Performance Reports", action: "Generate", icon: "📊", href: "/reports" }
              ].map((action) => (
                <a
                  key={action.name}
                  href={action.href}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-300 text-center block",
                    "hover:scale-105",
                    isDark
                      ? "border-white/30 hover:border-white/50 hover:bg-white/10"
                      : "border-black/30 hover:border-black/50 hover:bg-black/10"
                  )}
                >
                  <div className="text-2xl mb-2">{action.icon}</div>
                  <div className="font-bold tracking-wide uppercase text-sm">{action.name}</div>
                  <div className="text-xs opacity-70 mt-1">{action.action}</div>
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}