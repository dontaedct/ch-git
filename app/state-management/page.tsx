/**
 * @fileoverview State Management Dashboard
 * Main dashboard for state management system with client data separation
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

// State Management Metrics Interface
interface StateMetrics {
  totalClients: number;
  activeStates: number;
  cacheHitRatio: number;
  avgResponseTime: number;
  dataConsistency: number;
  syncOperations: number;
}

// Client State Information
interface ClientState {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'syncing';
  lastUpdate: string;
  dataSize: string;
  operations: number;
}

export default function StateManagementPage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [metrics, setMetrics] = useState<StateMetrics>({
    totalClients: 12,
    activeStates: 8,
    cacheHitRatio: 78.5,
    avgResponseTime: 145,
    dataConsistency: 99.2,
    syncOperations: 1847
  });

  const [clients, setClients] = useState<ClientState[]>([
    { id: '1', name: 'Acme Corp', status: 'active', lastUpdate: '2 min ago', dataSize: '2.4 MB', operations: 45 },
    { id: '2', name: 'TechStart Inc', status: 'syncing', lastUpdate: '5 min ago', dataSize: '1.8 MB', operations: 32 },
    { id: '3', name: 'Global Solutions', status: 'active', lastUpdate: '1 min ago', dataSize: '3.2 MB', operations: 67 },
    { id: '4', name: 'Innovation Labs', status: 'idle', lastUpdate: '15 min ago', dataSize: '0.9 MB', operations: 12 },
  ]);

  useEffect(() => {
    setMounted(true);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        avgResponseTime: Math.floor(100 + Math.random() * 100),
        cacheHitRatio: 75 + Math.random() * 10,
        syncOperations: prev.syncOperations + Math.floor(Math.random() * 5)
      }));
    }, 3000);

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
                State Management Dashboard
              </h1>
              <p className={cn(
                "mt-2 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Client data separation and state synchronization control
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
          {/* Metrics Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {[
              { label: "Total Clients", value: metrics.totalClients, unit: "", color: "blue" },
              { label: "Active States", value: metrics.activeStates, unit: "", color: "green" },
              { label: "Cache Hit Ratio", value: metrics.cacheHitRatio, unit: "%", color: "yellow" },
              { label: "Avg Response", value: metrics.avgResponseTime, unit: "ms", color: "purple" },
              { label: "Data Consistency", value: metrics.dataConsistency, unit: "%", color: "emerald" },
              { label: "Sync Operations", value: metrics.syncOperations, unit: "", color: "red" }
            ].map((metric, index) => (
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
                  <span className="text-sm ml-1">{metric.unit}</span>
                </div>
              </div>
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
            <h2 className="text-xl font-bold tracking-wide uppercase mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Client Data", href: "/state-management/clients", icon: "👥" },
                { name: "Persistence", href: "/state-management/persistence", icon: "💾" },
                { name: "Synchronization", href: "/state-management/sync", icon: "🔄" },
                { name: "Performance", href: "/state-management/performance", icon: "⚡" }
              ].map((action) => (
                <a
                  key={action.name}
                  href={action.href}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-300 text-center",
                    "hover:scale-105",
                    isDark
                      ? "border-white/30 hover:border-white/50 hover:bg-white/10"
                      : "border-black/30 hover:border-black/50 hover:bg-black/10"
                  )}
                >
                  <div className="text-2xl mb-2">{action.icon}</div>
                  <div className="font-bold tracking-wide uppercase">{action.name}</div>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Client States */}
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
              Client States
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={cn(
                    "border-b-2",
                    isDark ? "border-white/30" : "border-black/30"
                  )}>
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Client</th>
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Status</th>
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Last Update</th>
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Data Size</th>
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client, index) => (
                    <tr
                      key={client.id}
                      className={cn(
                        "border-b transition-all duration-300",
                        isDark ? "border-white/20 hover:bg-white/5" : "border-black/20 hover:bg-black/5"
                      )}
                    >
                      <td className="py-3 font-medium">{client.name}</td>
                      <td className="py-3">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium uppercase",
                          client.status === 'active' && "bg-green-500/20 text-green-500",
                          client.status === 'syncing' && "bg-yellow-500/20 text-yellow-500",
                          client.status === 'idle' && "bg-gray-500/20 text-gray-500"
                        )}>
                          {client.status}
                        </span>
                      </td>
                      <td className="py-3 opacity-70">{client.lastUpdate}</td>
                      <td className="py-3">{client.dataSize}</td>
                      <td className="py-3">{client.operations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}