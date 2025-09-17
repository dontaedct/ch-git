"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function ProductionDashboard() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [deploymentStats, setDeploymentStats] = useState({
    activeDeployments: 12,
    successRate: 98.5,
    avgDeploymentTime: 18,
    lastDeployment: "2 hours ago"
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  const deploymentEnvironments = [
    { name: "Production", status: "healthy", apps: 8, uptime: "99.9%" },
    { name: "Staging", status: "healthy", apps: 5, uptime: "99.7%" },
    { name: "Development", status: "warning", apps: 15, uptime: "98.2%" },
    { name: "Testing", status: "healthy", apps: 3, uptime: "99.5%" }
  ];

  const recentDeployments = [
    { app: "Client Portal v2.1", environment: "Production", status: "success", time: "2h ago", duration: "14 min" },
    { app: "Analytics Dashboard", environment: "Staging", status: "success", time: "4h ago", duration: "12 min" },
    { app: "Form Builder", environment: "Production", status: "success", time: "6h ago", duration: "16 min" },
    { app: "Document Generator", environment: "Testing", status: "failed", time: "8h ago", duration: "8 min" },
    { app: "API Gateway", environment: "Production", status: "success", time: "12h ago", duration: "22 min" }
  ];

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500",
      isDark ? "bg-black text-white" : "bg-white text-black"
    )}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className={cn(
              "text-3xl font-bold mb-2 tracking-wide uppercase",
              isDark ? "text-white" : "text-black"
            )}>
              Production Deployment Dashboard
            </h1>
            <p className={cn(
              "text-base",
              isDark ? "text-white/70" : "text-black/70"
            )}>
              Monitor and manage production deployments across all environments
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={cn(
              "p-6 rounded-lg border-2",
              isDark ? "bg-black/60 border-white/30" : "bg-white/80 border-black/30"
            )}>
              <h3 className={cn(
                "text-sm font-medium mb-2 uppercase tracking-wide",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Active Deployments
              </h3>
              <p className={cn(
                "text-2xl font-bold",
                isDark ? "text-white" : "text-black"
              )}>
                {deploymentStats.activeDeployments}
              </p>
            </div>

            <div className={cn(
              "p-6 rounded-lg border-2",
              isDark ? "bg-black/60 border-white/30" : "bg-white/80 border-black/30"
            )}>
              <h3 className={cn(
                "text-sm font-medium mb-2 uppercase tracking-wide",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Success Rate
              </h3>
              <p className={cn(
                "text-2xl font-bold text-green-500"
              )}>
                {deploymentStats.successRate}%
              </p>
            </div>

            <div className={cn(
              "p-6 rounded-lg border-2",
              isDark ? "bg-black/60 border-white/30" : "bg-white/80 border-black/30"
            )}>
              <h3 className={cn(
                "text-sm font-medium mb-2 uppercase tracking-wide",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Avg Deploy Time
              </h3>
              <p className={cn(
                "text-2xl font-bold",
                isDark ? "text-white" : "text-black"
              )}>
                {deploymentStats.avgDeploymentTime} min
              </p>
            </div>

            <div className={cn(
              "p-6 rounded-lg border-2",
              isDark ? "bg-black/60 border-white/30" : "bg-white/80 border-black/30"
            )}>
              <h3 className={cn(
                "text-sm font-medium mb-2 uppercase tracking-wide",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Last Deployment
              </h3>
              <p className={cn(
                "text-2xl font-bold",
                isDark ? "text-white" : "text-black"
              )}>
                {deploymentStats.lastDeployment}
              </p>
            </div>
          </div>

          {/* Environment Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className={cn(
              "p-6 rounded-lg border-2",
              isDark ? "bg-black/40 border-white/20" : "bg-white/60 border-black/20"
            )}>
              <h2 className={cn(
                "text-xl font-bold mb-4 uppercase tracking-wide",
                isDark ? "text-white" : "text-black"
              )}>
                Environment Status
              </h2>
              <div className="space-y-4">
                {deploymentEnvironments.map((env) => (
                  <div key={env.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        env.status === "healthy" ? "bg-green-500" :
                        env.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                      )} />
                      <span className={cn(
                        "font-medium",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {env.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-sm font-medium",
                        isDark ? "text-white/80" : "text-black/80"
                      )}>
                        {env.apps} apps
                      </div>
                      <div className={cn(
                        "text-xs",
                        isDark ? "text-white/60" : "text-black/60"
                      )}>
                        {env.uptime} uptime
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={cn(
              "p-6 rounded-lg border-2",
              isDark ? "bg-black/40 border-white/20" : "bg-white/60 border-black/20"
            )}>
              <h2 className={cn(
                "text-xl font-bold mb-4 uppercase tracking-wide",
                isDark ? "text-white" : "text-black"
              )}>
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button className={cn(
                  "w-full p-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm uppercase tracking-wide",
                  isDark
                    ? "border-white/40 text-white hover:border-white hover:bg-white/5"
                    : "border-black/40 text-black hover:border-black hover:bg-black/5"
                )}>
                  Deploy New Application
                </button>
                <button className={cn(
                  "w-full p-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm uppercase tracking-wide",
                  isDark
                    ? "border-white/40 text-white hover:border-white hover:bg-white/5"
                    : "border-black/40 text-black hover:border-black hover:bg-black/5"
                )}>
                  View Pipeline Status
                </button>
                <button className={cn(
                  "w-full p-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm uppercase tracking-wide",
                  isDark
                    ? "border-white/40 text-white hover:border-white hover:bg-white/5"
                    : "border-black/40 text-black hover:border-black hover:bg-black/5"
                )}>
                  Quality Assurance
                </button>
              </div>
            </div>
          </div>

          {/* Recent Deployments */}
          <div className={cn(
            "p-6 rounded-lg border-2",
            isDark ? "bg-black/40 border-white/20" : "bg-white/60 border-black/20"
          )}>
            <h2 className={cn(
              "text-xl font-bold mb-4 uppercase tracking-wide",
              isDark ? "text-white" : "text-black"
            )}>
              Recent Deployments
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={cn(
                    "border-b",
                    isDark ? "border-white/20" : "border-black/20"
                  )}>
                    <th className={cn(
                      "text-left py-2 px-4 text-sm font-medium uppercase tracking-wide",
                      isDark ? "text-white/80" : "text-black/80"
                    )}>
                      Application
                    </th>
                    <th className={cn(
                      "text-left py-2 px-4 text-sm font-medium uppercase tracking-wide",
                      isDark ? "text-white/80" : "text-black/80"
                    )}>
                      Environment
                    </th>
                    <th className={cn(
                      "text-left py-2 px-4 text-sm font-medium uppercase tracking-wide",
                      isDark ? "text-white/80" : "text-black/80"
                    )}>
                      Status
                    </th>
                    <th className={cn(
                      "text-left py-2 px-4 text-sm font-medium uppercase tracking-wide",
                      isDark ? "text-white/80" : "text-black/80"
                    )}>
                      Time
                    </th>
                    <th className={cn(
                      "text-left py-2 px-4 text-sm font-medium uppercase tracking-wide",
                      isDark ? "text-white/80" : "text-black/80"
                    )}>
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeployments.map((deployment, index) => (
                    <tr key={index} className={cn(
                      "border-b",
                      isDark ? "border-white/10" : "border-black/10"
                    )}>
                      <td className={cn(
                        "py-3 px-4 font-medium",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {deployment.app}
                      </td>
                      <td className={cn(
                        "py-3 px-4",
                        isDark ? "text-white/80" : "text-black/80"
                      )}>
                        {deployment.environment}
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium uppercase",
                          deployment.status === "success"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-red-500/20 text-red-500"
                        )}>
                          {deployment.status}
                        </span>
                      </td>
                      <td className={cn(
                        "py-3 px-4",
                        isDark ? "text-white/80" : "text-black/80"
                      )}>
                        {deployment.time}
                      </td>
                      <td className={cn(
                        "py-3 px-4",
                        isDark ? "text-white/80" : "text-black/80"
                      )}>
                        {deployment.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}