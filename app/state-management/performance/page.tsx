/**
 * @fileoverview Performance Optimization Dashboard
 * Interface for monitoring and optimizing state management performance
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

// Performance Metrics Interface
interface PerformanceMetrics {
  stateUpdateTime: number;
  dataRetrievalTime: number;
  clientSwitchingTime: number;
  cacheHitRatio: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  throughput: string;
}

// Performance Alert
interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  metric: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

// Optimization Suggestion
interface OptimizationSuggestion {
  id: string;
  category: 'cache' | 'memory' | 'network' | 'state';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'complex';
}

export default function PerformancePage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'alerts' | 'suggestions'>('metrics');

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    stateUpdateTime: 145,
    dataRetrievalTime: 67,
    clientSwitchingTime: 312,
    cacheHitRatio: 78.5,
    memoryUsage: 245,
    cpuUsage: 23.7,
    networkLatency: 45,
    throughput: '12.5 MB/s'
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([
    {
      id: '1',
      type: 'warning',
      metric: 'Client Switching Time',
      message: 'Client switching time exceeding 300ms threshold',
      timestamp: '5 min ago',
      resolved: false
    },
    {
      id: '2',
      type: 'info',
      metric: 'Cache Hit Ratio',
      message: 'Cache hit ratio improved to 78.5%',
      timestamp: '15 min ago',
      resolved: true
    },
    {
      id: '3',
      type: 'critical',
      metric: 'Memory Usage',
      message: 'Memory usage spike detected',
      timestamp: '1 hour ago',
      resolved: true
    }
  ]);

  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([
    {
      id: '1',
      category: 'cache',
      title: 'Implement LRU Cache Eviction',
      description: 'Replace current cache strategy with LRU to improve hit ratio',
      impact: 'high',
      effort: 'medium'
    },
    {
      id: '2',
      category: 'state',
      title: 'Optimize State Serialization',
      description: 'Use binary serialization for faster state updates',
      impact: 'medium',
      effort: 'complex'
    },
    {
      id: '3',
      category: 'network',
      title: 'Enable Compression',
      description: 'Add gzip compression for network requests',
      impact: 'medium',
      effort: 'easy'
    },
    {
      id: '4',
      category: 'memory',
      title: 'Implement Memory Pooling',
      description: 'Use object pooling to reduce garbage collection',
      impact: 'high',
      effort: 'complex'
    }
  ]);

  useEffect(() => {
    setMounted(true);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        stateUpdateTime: 100 + Math.random() * 100,
        dataRetrievalTime: 50 + Math.random() * 50,
        clientSwitchingTime: 250 + Math.random() * 150,
        cacheHitRatio: 75 + Math.random() * 10,
        memoryUsage: 200 + Math.random() * 100,
        cpuUsage: 20 + Math.random() * 20,
        networkLatency: 30 + Math.random() * 30
      }));
    }, 2000);

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

  const getMetricColor = (value: number, threshold: number, inverse = false) => {
    if (inverse) {
      return value > threshold ? 'text-green-500' : value > threshold * 0.7 ? 'text-yellow-500' : 'text-red-500';
    }
    return value < threshold ? 'text-green-500' : value < threshold * 1.5 ? 'text-yellow-500' : 'text-red-500';
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
                Performance Optimization
              </h1>
              <p className={cn(
                "mt-2 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Monitor and optimize state management performance
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
          {/* Performance Overview */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              {
                label: "State Updates",
                value: metrics.stateUpdateTime,
                unit: "ms",
                threshold: 200,
                target: "< 200ms"
              },
              {
                label: "Data Retrieval",
                value: metrics.dataRetrievalTime,
                unit: "ms",
                threshold: 100,
                target: "< 100ms"
              },
              {
                label: "Client Switching",
                value: metrics.clientSwitchingTime,
                unit: "ms",
                threshold: 500,
                target: "< 500ms"
              },
              {
                label: "Cache Hit Ratio",
                value: metrics.cacheHitRatio,
                unit: "%",
                threshold: 70,
                target: "> 70%",
                inverse: true
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
                <div className={cn(
                  "text-2xl font-bold mt-2",
                  getMetricColor(metric.value, metric.threshold, metric.inverse)
                )}>
                  {typeof metric.value === 'number' && metric.value % 1 !== 0
                    ? metric.value.toFixed(1)
                    : metric.value}
                  <span className="text-sm ml-1">{metric.unit}</span>
                </div>
                <div className="text-xs opacity-70 mt-1">Target: {metric.target}</div>
              </div>
            ))}
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            variants={itemVariants}
            className="flex space-x-4"
          >
            {[
              { id: 'metrics', label: 'Detailed Metrics' },
              { id: 'alerts', label: 'Performance Alerts' },
              { id: 'suggestions', label: 'Optimization Suggestions' }
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

          {/* Detailed Metrics Tab */}
          {activeTab === 'metrics' && (
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* System Resources */}
              <div className={cn(
                "p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}>
                <h3 className="text-lg font-bold tracking-wide uppercase mb-4">
                  System Resources
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm">{metrics.memoryUsage} MB</span>
                    </div>
                    <div className={cn(
                      "h-2 rounded-full",
                      isDark ? "bg-white/20" : "bg-black/20"
                    )}>
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          metrics.memoryUsage > 300 ? "bg-red-500" :
                          metrics.memoryUsage > 200 ? "bg-yellow-500" : "bg-green-500"
                        )}
                        style={{ width: `${Math.min((metrics.memoryUsage / 500) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm">{metrics.cpuUsage.toFixed(1)}%</span>
                    </div>
                    <div className={cn(
                      "h-2 rounded-full",
                      isDark ? "bg-white/20" : "bg-black/20"
                    )}>
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          metrics.cpuUsage > 70 ? "bg-red-500" :
                          metrics.cpuUsage > 50 ? "bg-yellow-500" : "bg-green-500"
                        )}
                        style={{ width: `${metrics.cpuUsage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Performance */}
              <div className={cn(
                "p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}>
                <h3 className="text-lg font-bold tracking-wide uppercase mb-4">
                  Network Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Latency</span>
                    <span className={cn(
                      getMetricColor(metrics.networkLatency, 50),
                      "text-sm font-bold"
                    )}>
                      {metrics.networkLatency.toFixed(1)}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Throughput</span>
                    <span className="text-sm font-bold">{metrics.throughput}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Connection Status</span>
                    <span className="text-sm text-green-500 font-bold">Healthy</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Performance Alerts Tab */}
          {activeTab === 'alerts' && (
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
                  Performance Alerts
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
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-300",
                      alert.resolved && "opacity-50",
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
                            alert.type === 'critical' && "bg-red-500/20 text-red-500",
                            alert.type === 'warning' && "bg-yellow-500/20 text-yellow-500",
                            alert.type === 'info' && "bg-blue-500/20 text-blue-500"
                          )}>
                            {alert.type}
                          </span>
                          {alert.resolved && (
                            <span className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-xs font-medium uppercase">
                              Resolved
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="font-medium">{alert.metric}</div>
                          <div className="text-sm opacity-70">{alert.message}</div>
                          <div className="text-xs opacity-60 mt-1">{alert.timestamp}</div>
                        </div>
                      </div>
                      {!alert.resolved && (
                        <button className="text-xs px-3 py-1 rounded bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-all">
                          Investigate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Optimization Suggestions Tab */}
          {activeTab === 'suggestions' && (
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
                Optimization Suggestions
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-300",
                      isDark
                        ? "border-white/30 hover:border-white/50"
                        : "border-black/30 hover:border-black/50"
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium uppercase",
                          suggestion.category === 'cache' && "bg-blue-500/20 text-blue-500",
                          suggestion.category === 'memory' && "bg-purple-500/20 text-purple-500",
                          suggestion.category === 'network' && "bg-green-500/20 text-green-500",
                          suggestion.category === 'state' && "bg-yellow-500/20 text-yellow-500"
                        )}>
                          {suggestion.category}
                        </span>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium uppercase",
                          suggestion.impact === 'high' && "bg-red-500/20 text-red-500",
                          suggestion.impact === 'medium' && "bg-yellow-500/20 text-yellow-500",
                          suggestion.impact === 'low' && "bg-green-500/20 text-green-500"
                        )}>
                          {suggestion.impact} impact
                        </span>
                      </div>
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        suggestion.effort === 'easy' && "bg-green-500/20 text-green-500",
                        suggestion.effort === 'medium' && "bg-yellow-500/20 text-yellow-500",
                        suggestion.effort === 'complex' && "bg-red-500/20 text-red-500"
                      )}>
                        {suggestion.effort}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium mb-2">{suggestion.title}</div>
                      <div className="text-sm opacity-70 mb-3">{suggestion.description}</div>
                      <button className="text-xs px-3 py-1 rounded bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-all">
                        Implement
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}