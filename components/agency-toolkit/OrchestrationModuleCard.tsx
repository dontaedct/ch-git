"use client";

import { motion } from "framer-motion";
import { ExternalLink, Workflow, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface WorkflowStatus {
  active: number;
  total: number;
  lastRun?: string;
  status: 'healthy' | 'warning' | 'error';
}

export function OrchestrationModuleCard() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>({
    active: 0,
    total: 0,
    status: 'healthy'
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch workflow status
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/orchestration/status');
        if (response.ok) {
          const data = await response.json();
          setWorkflowStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch orchestration status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const getStatusIcon = () => {
    switch (workflowStatus.status) {
      case 'healthy':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (workflowStatus.status) {
      case 'healthy':
        return isDark ? "bg-green-500/20 text-green-400" : "bg-green-500/20 text-green-600";
      case 'warning':
        return isDark ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-500/20 text-yellow-600";
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
      transition={{ duration: 0.6, delay: 0.6 }}
      className={cn(
        "p-6 rounded-lg border transition-all duration-300 cursor-pointer group",
        isDark ? "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20" : "bg-black/5 border-black/10 hover:bg-black/8 hover:border-black/20"
      )}
      onClick={() => window.open('/agency-toolkit/orchestration', '_blank')}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-500/20 text-indigo-600"
        )}>
          <Workflow className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Orchestration</h3>
          <p className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
            Workflow Automation
          </p>
        </div>
      </div>
      <p className={cn("text-sm mb-4", isDark ? "text-white/70" : "text-black/70")}>
        Advanced workflow orchestration with n8n integration, visual automation builder, and real-time monitoring
      </p>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm">
            {workflowStatus.active} of {workflowStatus.total} active
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={cn("text-xs px-2 py-1 rounded", getStatusColor())}>
          {workflowStatus.status === 'healthy' ? 'Active' : workflowStatus.status === 'warning' ? 'Warning' : 'Error'}
        </span>
        <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}