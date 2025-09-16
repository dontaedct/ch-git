/**
 * @fileoverview Synchronization Interface
 * Interface for managing real-time synchronization and data consistency
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

// Sync Metrics Interface
interface SyncMetrics {
  activeSyncSessions: number;
  syncSuccessRate: number;
  avgSyncTime: number;
  conflictsResolved: number;
  dataConsistency: number;
  realtimeConnections: number;
  lastSyncTime: string;
  totalSyncOperations: number;
}

// Sync Session Information
interface SyncSession {
  id: string;
  clientName: string;
  status: 'syncing' | 'idle' | 'error' | 'conflict';
  lastSync: string;
  operationsCount: number;
  syncSpeed: string;
  conflictsPending: number;
  priority: 'high' | 'normal' | 'low';
}

// Conflict Information
interface SyncConflict {
  id: string;
  type: 'data' | 'schema' | 'version';
  clients: string[];
  timestamp: string;
  severity: 'critical' | 'warning' | 'minor';
  autoResolvable: boolean;
}

export default function SynchronizationPage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'sessions' | 'conflicts' | 'analytics'>('sessions');

  const [metrics, setMetrics] = useState<SyncMetrics>({
    activeSyncSessions: 8,
    syncSuccessRate: 97.8,
    avgSyncTime: 245,
    conflictsResolved: 23,
    dataConsistency: 99.2,
    realtimeConnections: 45,
    lastSyncTime: '12 seconds ago',
    totalSyncOperations: 15847
  });

  const [syncSessions, setSyncSessions] = useState<SyncSession[]>([
    {
      id: '1',
      clientName: 'Acme Corp',
      status: 'syncing',
      lastSync: '2 min ago',
      operationsCount: 145,
      syncSpeed: '2.3 MB/s',
      conflictsPending: 0,
      priority: 'high'
    },
    {
      id: '2',
      clientName: 'TechStart Inc',
      status: 'idle',
      lastSync: '5 min ago',
      operationsCount: 87,
      syncSpeed: '1.1 MB/s',
      conflictsPending: 1,
      priority: 'normal'
    },
    {
      id: '3',
      clientName: 'Global Solutions',
      status: 'conflict',
      lastSync: '8 min ago',
      operationsCount: 234,
      syncSpeed: '0 MB/s',
      conflictsPending: 3,
      priority: 'high'
    },
    {
      id: '4',
      clientName: 'Innovation Labs',
      status: 'error',
      lastSync: '15 min ago',
      operationsCount: 45,
      syncSpeed: '0 MB/s',
      conflictsPending: 0,
      priority: 'low'
    }
  ]);

  const [conflicts, setConflicts] = useState<SyncConflict[]>([
    {
      id: '1',
      type: 'data',
      clients: ['Acme Corp', 'TechStart Inc'],
      timestamp: '5 min ago',
      severity: 'warning',
      autoResolvable: true
    },
    {
      id: '2',
      type: 'schema',
      clients: ['Global Solutions'],
      timestamp: '8 min ago',
      severity: 'critical',
      autoResolvable: false
    },
    {
      id: '3',
      type: 'version',
      clients: ['Global Solutions', 'Innovation Labs'],
      timestamp: '12 min ago',
      severity: 'minor',
      autoResolvable: true
    }
  ]);

  useEffect(() => {
    setMounted(true);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        avgSyncTime: 200 + Math.random() * 100,
        syncSuccessRate: 95 + Math.random() * 5,
        totalSyncOperations: prev.totalSyncOperations + Math.floor(Math.random() * 10)
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
                Synchronization Interface
              </h1>
              <p className={cn(
                "mt-2 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Manage real-time synchronization and resolve conflicts
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/state-management"
                className={cn(
                  "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300",
                  isDark
                    ? "border-white/30 hover:border-white/50"
                    : "border-black/30 hover:border-black/50"
                )}
              >
                ← Back to Dashboard
              </a>
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
          {/* Sync Metrics */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { label: "Active Sessions", value: metrics.activeSyncSessions, unit: "", color: "blue" },
              { label: "Success Rate", value: metrics.syncSuccessRate, unit: "%", color: "green" },
              { label: "Avg Sync Time", value: metrics.avgSyncTime, unit: "ms", color: "yellow" },
              { label: "Consistency", value: metrics.dataConsistency, unit: "%", color: "purple" }
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
                  <span className="text-sm ml-1">{metric.unit}</span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            variants={itemVariants}
            className="flex space-x-4"
          >
            {[
              { id: 'sessions', label: 'Sync Sessions' },
              { id: 'conflicts', label: 'Conflicts' },
              { id: 'analytics', label: 'Analytics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-6 py-3 rounded-lg border-2 font-bold transition-all duration-300",
                  activeTab === tab.id
                    ? isDark
                      ? "bg-white/10 border-white/50"
                      : "bg-black/10 border-black/50"
                    : isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Sync Sessions Tab */}
          {activeTab === 'sessions' && (
            <motion.div
              variants={itemVariants}
              className={cn(
                "p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold tracking-wide uppercase">
                  Active Sync Sessions
                </h2>
                <button
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300",
                    "hover:scale-105",
                    isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                  )}
                >
                  Force Sync All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={cn(
                      "border-b-2",
                      isDark ? "border-white/30" : "border-black/30"
                    )}>
                      <th className="text-left py-3 font-bold tracking-wide uppercase">Client</th>
                      <th className="text-left py-3 font-bold tracking-wide uppercase">Status</th>
                      <th className="text-left py-3 font-bold tracking-wide uppercase">Last Sync</th>
                      <th className="text-left py-3 font-bold tracking-wide uppercase">Speed</th>
                      <th className="text-left py-3 font-bold tracking-wide uppercase">Operations</th>
                      <th className="text-left py-3 font-bold tracking-wide uppercase">Conflicts</th>
                      <th className="text-left py-3 font-bold tracking-wide uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncSessions.map((session) => (
                      <tr
                        key={session.id}
                        className={cn(
                          "border-b transition-all duration-300",
                          isDark ? "border-white/20 hover:bg-white/5" : "border-black/20 hover:bg-black/5"
                        )}
                      >
                        <td className="py-3">
                          <div>
                            <div className="font-medium">{session.clientName}</div>
                            <div className={cn(
                              "text-xs",
                              session.priority === 'high' && "text-red-500",
                              session.priority === 'normal' && "text-yellow-500",
                              session.priority === 'low' && "text-green-500"
                            )}>
                              {session.priority.toUpperCase()} PRIORITY
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium uppercase",
                            session.status === 'syncing' && "bg-blue-500/20 text-blue-500",
                            session.status === 'idle' && "bg-gray-500/20 text-gray-500",
                            session.status === 'error' && "bg-red-500/20 text-red-500",
                            session.status === 'conflict' && "bg-yellow-500/20 text-yellow-500"
                          )}>
                            {session.status}
                          </span>
                        </td>
                        <td className="py-3 opacity-70">{session.lastSync}</td>
                        <td className="py-3">{session.syncSpeed}</td>
                        <td className="py-3">{session.operationsCount}</td>
                        <td className="py-3">
                          {session.conflictsPending > 0 ? (
                            <span className="px-2 py-1 rounded bg-red-500/20 text-red-500 text-xs font-medium">
                              {session.conflictsPending}
                            </span>
                          ) : (
                            <span className="text-green-500">None</span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex space-x-2">
                            <button
                              className={cn(
                                "text-xs px-2 py-1 rounded border transition-all duration-300",
                                isDark
                                  ? "border-white/30 hover:border-white/50"
                                  : "border-black/30 hover:border-black/50"
                              )}
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Conflicts Tab */}
          {activeTab === 'conflicts' && (
            <motion.div
              variants={itemVariants}
              className={cn(
                "p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold tracking-wide uppercase">
                  Sync Conflicts
                </h2>
                <button
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300",
                    "hover:scale-105",
                    isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                  )}
                >
                  Auto-Resolve All
                </button>
              </div>

              <div className="space-y-4">
                {conflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-300",
                      isDark
                        ? "border-white/30 hover:border-white/50"
                        : "border-black/30 hover:border-black/50"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium uppercase",
                            conflict.type === 'data' && "bg-blue-500/20 text-blue-500",
                            conflict.type === 'schema' && "bg-red-500/20 text-red-500",
                            conflict.type === 'version' && "bg-yellow-500/20 text-yellow-500"
                          )}>
                            {conflict.type}
                          </span>
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium uppercase",
                            conflict.severity === 'critical' && "bg-red-500/20 text-red-500",
                            conflict.severity === 'warning' && "bg-yellow-500/20 text-yellow-500",
                            conflict.severity === 'minor' && "bg-green-500/20 text-green-500"
                          )}>
                            {conflict.severity}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="font-medium">Clients: {conflict.clients.join(', ')}</div>
                          <div className="text-sm opacity-70">{conflict.timestamp}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {conflict.autoResolvable && (
                          <button className="text-xs px-3 py-1 rounded bg-green-500/20 text-green-500 hover:bg-green-500/30 transition-all">
                            Auto-Resolve
                          </button>
                        )}
                        <button className="text-xs px-3 py-1 rounded bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-all">
                          Manual Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
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
                Synchronization Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-bold uppercase text-sm mb-2">Total Operations</h3>
                  <div className="text-3xl font-bold">{metrics.totalSyncOperations.toLocaleString()}</div>
                  <div className="text-sm opacity-70">All-time sync operations</div>
                </div>
                <div>
                  <h3 className="font-bold uppercase text-sm mb-2">Conflicts Resolved</h3>
                  <div className="text-3xl font-bold">{metrics.conflictsResolved}</div>
                  <div className="text-sm opacity-70">This session</div>
                </div>
                <div>
                  <h3 className="font-bold uppercase text-sm mb-2">Real-time Connections</h3>
                  <div className="text-3xl font-bold">{metrics.realtimeConnections}</div>
                  <div className="text-sm opacity-70">Active connections</div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}