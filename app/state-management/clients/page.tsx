/**
 * @fileoverview Client Data Separation Interface
 * Interface for managing client data isolation and separation
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

// Client Data Interface
interface ClientData {
  id: string;
  name: string;
  status: 'active' | 'isolated' | 'maintenance';
  dataSize: string;
  lastAccess: string;
  isolationLevel: 'strict' | 'standard' | 'minimal';
  encryptionStatus: 'enabled' | 'disabled';
  backupStatus: 'current' | 'pending' | 'failed';
  operations: number;
  connectedUsers: number;
}

// Data Separation Metrics
interface SeparationMetrics {
  totalClients: number;
  isolatedClients: number;
  encryptedClients: number;
  dataLeakageIncidents: number;
  isolationScore: number;
  complianceScore: number;
}

export default function ClientDataPage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<SeparationMetrics>({
    totalClients: 12,
    isolatedClients: 12,
    encryptedClients: 11,
    dataLeakageIncidents: 0,
    isolationScore: 98.7,
    complianceScore: 95.2
  });

  const [clients, setClients] = useState<ClientData[]>([
    {
      id: '1',
      name: 'Acme Corp',
      status: 'active',
      dataSize: '2.4 MB',
      lastAccess: '2 min ago',
      isolationLevel: 'strict',
      encryptionStatus: 'enabled',
      backupStatus: 'current',
      operations: 45,
      connectedUsers: 3
    },
    {
      id: '2',
      name: 'TechStart Inc',
      status: 'active',
      dataSize: '1.8 MB',
      lastAccess: '5 min ago',
      isolationLevel: 'standard',
      encryptionStatus: 'enabled',
      backupStatus: 'current',
      operations: 32,
      connectedUsers: 2
    },
    {
      id: '3',
      name: 'Global Solutions',
      status: 'maintenance',
      dataSize: '3.2 MB',
      lastAccess: '1 hour ago',
      isolationLevel: 'strict',
      encryptionStatus: 'enabled',
      backupStatus: 'pending',
      operations: 0,
      connectedUsers: 0
    },
    {
      id: '4',
      name: 'Innovation Labs',
      status: 'isolated',
      dataSize: '0.9 MB',
      lastAccess: '15 min ago',
      isolationLevel: 'minimal',
      encryptionStatus: 'disabled',
      backupStatus: 'failed',
      operations: 12,
      connectedUsers: 1
    }
  ]);

  useEffect(() => {
    setMounted(true);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        isolationScore: 95 + Math.random() * 5,
        complianceScore: 90 + Math.random() * 10
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
                Client Data Separation
              </h1>
              <p className={cn(
                "mt-2 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Manage client data isolation and separation controls
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
          {/* Separation Metrics */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {[
              { label: "Total Clients", value: metrics.totalClients, unit: "", color: "blue" },
              { label: "Isolated", value: metrics.isolatedClients, unit: "", color: "green" },
              { label: "Encrypted", value: metrics.encryptedClients, unit: "", color: "purple" },
              { label: "Incidents", value: metrics.dataLeakageIncidents, unit: "", color: "red" },
              { label: "Isolation Score", value: metrics.isolationScore, unit: "%", color: "emerald" },
              { label: "Compliance", value: metrics.complianceScore, unit: "%", color: "yellow" }
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

          {/* Client Data Table */}
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
                Client Data Management
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
                Add Client
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
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Isolation</th>
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Encryption</th>
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Backup</th>
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Data Size</th>
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Users</th>
                    <th className="text-left py-3 font-bold tracking-wide uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      className={cn(
                        "border-b transition-all duration-300",
                        isDark ? "border-white/20 hover:bg-white/5" : "border-black/20 hover:bg-black/5"
                      )}
                    >
                      <td className="py-3">
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm opacity-70">{client.lastAccess}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium uppercase",
                          client.status === 'active' && "bg-green-500/20 text-green-500",
                          client.status === 'isolated' && "bg-yellow-500/20 text-yellow-500",
                          client.status === 'maintenance' && "bg-red-500/20 text-red-500"
                        )}>
                          {client.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium uppercase",
                          client.isolationLevel === 'strict' && "bg-red-500/20 text-red-500",
                          client.isolationLevel === 'standard' && "bg-yellow-500/20 text-yellow-500",
                          client.isolationLevel === 'minimal' && "bg-green-500/20 text-green-500"
                        )}>
                          {client.isolationLevel}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium uppercase",
                          client.encryptionStatus === 'enabled' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                        )}>
                          {client.encryptionStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium uppercase",
                          client.backupStatus === 'current' && "bg-green-500/20 text-green-500",
                          client.backupStatus === 'pending' && "bg-yellow-500/20 text-yellow-500",
                          client.backupStatus === 'failed' && "bg-red-500/20 text-red-500"
                        )}>
                          {client.backupStatus}
                        </span>
                      </td>
                      <td className="py-3">{client.dataSize}</td>
                      <td className="py-3">{client.connectedUsers}</td>
                      <td className="py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedClient(client.id)}
                            className={cn(
                              "text-xs px-2 py-1 rounded border transition-all duration-300",
                              isDark
                                ? "border-white/30 hover:border-white/50"
                                : "border-black/30 hover:border-black/50"
                            )}
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Security Controls */}
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
              Security Controls
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Encryption Keys", action: "Rotate", status: "Current" },
                { name: "Access Logs", action: "View", status: "Real-time" },
                { name: "Audit Trail", action: "Export", status: "Available" },
                { name: "Compliance Check", action: "Run", status: "Scheduled" }
              ].map((control) => (
                <div
                  key={control.name}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-300",
                    isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                  )}
                >
                  <div className="font-bold tracking-wide uppercase text-sm">{control.name}</div>
                  <div className="text-xs opacity-70 mt-1">{control.status}</div>
                  <button className="mt-2 text-xs px-3 py-1 rounded bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-all">
                    {control.action}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}