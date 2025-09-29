"use client";

import { motion } from "framer-motion";
import { ExternalLink, Puzzle, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ModuleRegistryStatus {
  installed: number;
  available: number;
  pendingActivation: number;
  status: 'operational' | 'syncing' | 'error';
}

export function ModulesModuleCard() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [registryStatus, setRegistryStatus] = useState<ModuleRegistryStatus>({
    installed: 0,
    available: 0,
    pendingActivation: 0,
    status: 'operational'
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch module registry status
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/modules/registry-status');
        if (response.ok) {
          const data = await response.json();
          setRegistryStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch module registry status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const getStatusIcon = () => {
    switch (registryStatus.status) {
      case 'operational':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'syncing':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (registryStatus.status) {
      case 'operational':
        return isDark ? "bg-green-500/20 text-green-400" : "bg-green-500/20 text-green-600";
      case 'syncing':
        return isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-500/20 text-blue-600";
      case 'error':
        return isDark ? "bg-red-500/20 text-red-400" : "bg-red-500/20 text-red-600";
      default:
        return isDark ? "bg-gray-500/20 text-gray-400" : "bg-gray-500/20 text-gray-600";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className={cn(
        "p-6 rounded-lg border transition-all duration-300 cursor-pointer group",
        isDark ? "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20" : "bg-black/5 border-black/10 hover:bg-black/8 hover:border-black/20"
      )}
      onClick={() => window.open('/agency-toolkit/modules', '_blank')}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          isDark ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-500/20 text-cyan-600"
        )}>
          <Puzzle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Modules</h3>
          <p className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
            Hot-Pluggable System
          </p>
        </div>
      </div>
      <p className={cn("text-sm mb-4", isDark ? "text-white/70" : "text-black/70")}>
        Comprehensive module management with hot-pluggable architecture, registry system, and zero-downtime activation
      </p>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm">
            {registryStatus.installed} installed • {registryStatus.available} available
          </span>
        </div>
      </div>
      {registryStatus.pendingActivation > 0 && (
        <div className={cn("text-xs mb-2 px-2 py-1 rounded inline-block", isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-500/20 text-orange-600")}>
          {registryStatus.pendingActivation} pending activation
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className={cn("text-xs px-2 py-1 rounded", getStatusColor())}>
          {registryStatus.status === 'operational' ? 'Active' : registryStatus.status === 'syncing' ? 'Syncing' : 'Error'}
        </span>
        <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}