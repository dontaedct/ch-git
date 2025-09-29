"use client";

import { motion } from "framer-motion";
import { ExternalLink, ShoppingBag, TrendingUp, DollarSign, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface MarketplaceMetrics {
  totalInstalls: number;
  activeListings: number;
  monthlyRevenue: number;
  status: 'active' | 'maintenance' | 'offline';
}

export function MarketplaceModuleCard() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [metrics, setMetrics] = useState<MarketplaceMetrics>({
    totalInstalls: 0,
    activeListings: 0,
    monthlyRevenue: 0,
    status: 'active'
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch marketplace metrics
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/marketplace/metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Failed to fetch marketplace metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = () => {
    switch (metrics.status) {
      case 'active':
        return isDark ? "bg-green-500/20 text-green-400" : "bg-green-500/20 text-green-600";
      case 'maintenance':
        return isDark ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-500/20 text-yellow-600";
      case 'offline':
        return isDark ? "bg-red-500/20 text-red-400" : "bg-red-500/20 text-red-600";
      default:
        return isDark ? "bg-gray-500/20 text-gray-400" : "bg-gray-500/20 text-gray-600";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className={cn(
        "p-6 rounded-lg border transition-all duration-300 cursor-pointer group",
        isDark ? "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20" : "bg-black/5 border-black/10 hover:bg-black/8 hover:border-black/20"
      )}
      onClick={() => window.open('/agency-toolkit/marketplace', '_blank')}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-500/20 text-emerald-600"
        )}>
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Marketplace</h3>
          <p className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
            Template & Module Store
          </p>
        </div>
      </div>
      <p className={cn("text-sm mb-4", isDark ? "text-white/70" : "text-black/70")}>
        Template marketplace with monetization, module distribution, and revenue tracking for client solutions
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className={cn("p-2 rounded", isDark ? "bg-white/5" : "bg-black/5")}>
          <div className="flex items-center gap-1 text-xs mb-1">
            <Package className="w-3 h-3" />
            <span className={cn(isDark ? "text-white/60" : "text-black/60")}>Installs</span>
          </div>
          <div className="font-semibold">{metrics.totalInstalls}</div>
        </div>
        <div className={cn("p-2 rounded", isDark ? "bg-white/5" : "bg-black/5")}>
          <div className="flex items-center gap-1 text-xs mb-1">
            <DollarSign className="w-3 h-3" />
            <span className={cn(isDark ? "text-white/60" : "text-black/60")}>Revenue</span>
          </div>
          <div className="font-semibold">{formatCurrency(metrics.monthlyRevenue)}</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs px-2 py-1 rounded", getStatusColor())}>
            {metrics.activeListings} listings
          </span>
          {metrics.monthlyRevenue > 0 && (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <TrendingUp className="w-3 h-3" />
            </div>
          )}
        </div>
        <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}