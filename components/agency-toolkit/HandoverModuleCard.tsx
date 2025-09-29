"use client";

import { motion } from "framer-motion";
import { ExternalLink, Send, CheckCircle2, Clock, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface HandoverProgress {
  inProgress: number;
  completed: number;
  totalPackages: number;
  completionRate: number;
  status: 'active' | 'idle' | 'error';
}

export function HandoverModuleCard() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [progress, setProgress] = useState<HandoverProgress>({
    inProgress: 0,
    completed: 0,
    totalPackages: 0,
    completionRate: 0,
    status: 'idle'
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch handover progress
    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/handover/progress');
        if (response.ok) {
          const data = await response.json();
          setProgress(data);
        }
      } catch (error) {
        console.error('Failed to fetch handover progress:', error);
      }
    };

    fetchProgress();
    const interval = setInterval(fetchProgress, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'active':
        return <Clock className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'idle':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'error':
        return <FileText className="w-4 h-4 text-red-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'active':
        return isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-500/20 text-blue-600";
      case 'idle':
        return isDark ? "bg-green-500/20 text-green-400" : "bg-green-500/20 text-green-600";
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
      transition={{ duration: 0.6, delay: 0.9 }}
      className={cn(
        "p-6 rounded-lg border transition-all duration-300 cursor-pointer group",
        isDark ? "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20" : "bg-black/5 border-black/10 hover:bg-black/8 hover:border-black/20"
      )}
      onClick={() => window.open('/agency-toolkit/handover', '_blank')}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          isDark ? "bg-violet-500/20 text-violet-400" : "bg-violet-500/20 text-violet-600"
        )}>
          <Send className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Handover</h3>
          <p className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
            Package Automation
          </p>
        </div>
      </div>
      <p className={cn("text-sm mb-4", isDark ? "text-white/70" : "text-black/70")}>
        Automated client handover with SOP generation, video tutorials, credentials packaging, and delivery tracking
      </p>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm">
            {progress.completed} completed • {progress.inProgress} in progress
          </span>
        </div>
      </div>
      {progress.completionRate > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={cn(isDark ? "text-white/60" : "text-black/60")}>Completion Rate</span>
            <span className="font-semibold">{progress.completionRate}%</span>
          </div>
          <div className={cn("h-1.5 rounded-full overflow-hidden", isDark ? "bg-white/10" : "bg-black/10")}>
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress.completionRate}%` }}
            />
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className={cn("text-xs px-2 py-1 rounded", getStatusColor())}>
          {progress.status === 'active' ? 'Processing' : progress.status === 'idle' ? 'Ready' : 'Error'}
        </span>
        <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}