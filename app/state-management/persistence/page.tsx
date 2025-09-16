/**
 * @fileoverview Data Persistence Monitoring
 * Interface for monitoring data persistence and storage systems
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

// Persistence Metrics Interface
interface PersistenceMetrics {
  totalStorage: string;
  usedStorage: string;
  storageUtilization: number;
  backupStatus: 'healthy' | 'warning' | 'critical';
  lastBackup: string;
  persistenceReliability: number;
  avgWriteTime: number;
  avgReadTime: number;
}

// Storage Layer Information
interface StorageLayer {
  id: string;
  name: string;
  type: 'primary' | 'backup' | 'cache';
  status: 'online' | 'offline' | 'degraded';
  capacity: string;
  used: string;
  utilization: number;
  latency: number;
  throughput: string;
}

export default function PersistencePage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [metrics, setMetrics] = useState<PersistenceMetrics>({
    totalStorage: '500 GB',
    usedStorage: '234 GB',
    storageUtilization: 46.8,
    backupStatus: 'healthy',
    lastBackup: '2 hours ago',
    persistenceReliability: 99.7,
    avgWriteTime: 12,
    avgReadTime: 8
  });

  const [storageLayers, setStorageLayers] = useState<StorageLayer[]>([
    {
      id: '1',
      name: 'Primary Database',
      type: 'primary',
      status: 'online',
      capacity: '200 GB',
      used: '156 GB',
      utilization: 78,
      latency: 5,
      throughput: '1.2 GB/s'
    },
    {
      id: '2',
      name: 'Backup Storage',
      type: 'backup',
      status: 'online',
      capacity: '200 GB',
      used: '156 GB',
      utilization: 78,
      latency: 45,
      throughput: '300 MB/s'
    },
    {
      id: '3',
      name: 'Cache Layer',
      type: 'cache',
      status: 'online',
      capacity: '100 GB',
      used: '67 GB',
      utilization: 67,
      latency: 1,
      throughput: '8.5 GB/s'
    }
  ]);

  useEffect(() => {
    setMounted(true);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        avgWriteTime: 10 + Math.random() * 5,
        avgReadTime: 6 + Math.random() * 4,
        storageUtilization: prev.storageUtilization + (Math.random() - 0.5) * 0.5
      }));

      setStorageLayers(prev => prev.map(layer => ({
        ...layer,
        latency: layer.type === 'cache' ? 1 + Math.random() * 2 :
                layer.type === 'primary' ? 4 + Math.random() * 3 :
                40 + Math.random() * 10
      })));
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
                Data Persistence Monitoring
              </h1>
              <p className={cn(
                "mt-2 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Monitor storage systems and data persistence operations
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
          {/* Persistence Metrics */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              {
                label: "Storage Used",
                value: `${metrics.usedStorage} / ${metrics.totalStorage}`,
                percentage: metrics.storageUtilization,
                color: "blue"
              },
              {
                label: "Reliability",
                value: metrics.persistenceReliability,
                unit: "%",
                color: "green"
              },
              {
                label: "Write Time",
                value: metrics.avgWriteTime,
                unit: "ms",
                color: "yellow"
              },
              {
                label: "Read Time",
                value: metrics.avgReadTime,
                unit: "ms",
                color: "purple"
              }
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
                {metric.percentage && (
                  <div className="mt-2">
                    <div className={cn(
                      "h-2 rounded-full",
                      isDark ? "bg-white/20" : "bg-black/20"
                    )}>
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${metric.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs mt-1 opacity-70">{metric.percentage.toFixed(1)}%</div>
                  </div>
                )}
              </div>
            ))}
          </motion.div>

          {/* Storage Layers */}
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
              Storage Layers
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={cn(
                    "border-b-2",
                    isDark ? "border-white/30" : "border-black/30"
                  )}>
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Layer</th>
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Type</th>
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Status</th>
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Utilization</th>
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Latency</th>
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Throughput</th>
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {storageLayers.map((layer) => (
                    <tr
                      key={layer.id}
                      className={cn(
                        "border-b transition-all duration-300",
                        isDark ? "border-white/20 hover:bg-white/5" : "border-black/20 hover:bg-black/5"
                      )}
                    >
                      <td className="py-3">
                        <div>
                          <div className="font-medium">{layer.name}</div>
                          <div className="text-sm opacity-70">{layer.used} / {layer.capacity}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium uppercase",
                          layer.type === 'primary' && "bg-blue-500/20 text-blue-500",
                          layer.type === 'backup' && "bg-green-500/20 text-green-500",
                          layer.type === 'cache' && "bg-purple-500/20 text-purple-500"
                        )}>
                          {layer.type}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium uppercase",
                          layer.status === 'online' && "bg-green-500/20 text-green-500",
                          layer.status === 'degraded' && "bg-yellow-500/20 text-yellow-500",
                          layer.status === 'offline' && "bg-red-500/20 text-red-500"
                        )}>
                          {layer.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="w-24">
                          <div className={cn(
                            "h-2 rounded-full",
                            isDark ? "bg-white/20" : "bg-black/20"
                          )}>
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-300",
                                layer.utilization > 80 ? "bg-red-500" :
                                layer.utilization > 60 ? "bg-yellow-500" : "bg-green-500"
                              )}
                              style={{ width: `${layer.utilization}%` }}
                            />
                          </div>
                          <div className="text-xs mt-1">{layer.utilization}%</div>
                        </div>
                      </td>
                      <td className="py-3">{layer.latency.toFixed(1)}ms</td>
                      <td className="py-3">{layer.throughput}</td>
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

          {/* Backup Status */}
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
              Backup & Recovery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Last Backup", value: metrics.lastBackup, action: "View Log" },
                { name: "Backup Status", value: metrics.backupStatus, action: "Run Backup" },
                { name: "Recovery Time", value: "< 2 min", action: "Test Recovery" },
                { name: "Retention", value: "30 days", action: "Configure" }
              ].map((backup) => (
                <div
                  key={backup.name}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-300",
                    isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                  )}
                >
                  <div className="font-bold tracking-wide uppercase text-sm">{backup.name}</div>
                  <div className="text-lg mt-1">{backup.value}</div>
                  <button className="mt-2 text-xs px-3 py-1 rounded bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-all">
                    {backup.action}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Performance Analytics */}
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
              Performance Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-bold uppercase text-sm mb-2">Read Operations</h3>
                <div className="text-2xl font-bold">{metrics.avgReadTime.toFixed(1)}ms</div>
                <div className="text-sm opacity-70">Average latency</div>
              </div>
              <div>
                <h3 className="font-bold uppercase text-sm mb-2">Write Operations</h3>
                <div className="text-2xl font-bold">{metrics.avgWriteTime.toFixed(1)}ms</div>
                <div className="text-sm opacity-70">Average latency</div>
              </div>
              <div>
                <h3 className="font-bold uppercase text-sm mb-2">Reliability</h3>
                <div className="text-2xl font-bold">{metrics.persistenceReliability}%</div>
                <div className="text-sm opacity-70">Uptime percentage</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}