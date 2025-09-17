"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function EnvironmentManagement() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState("production");
  const [showConfigModal, setShowConfigModal] = useState(false);

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

  const environments = [
    {
      id: "production",
      name: "Production",
      status: "healthy",
      instances: 5,
      cpu: 45,
      memory: 62,
      uptime: "99.9%",
      lastDeploy: "2 hours ago",
      version: "v2.1.3",
      url: "https://app.company.com",
      region: "us-east-1",
      autoScale: true,
      monitoring: "comprehensive"
    },
    {
      id: "staging",
      name: "Staging",
      status: "healthy",
      instances: 3,
      cpu: 28,
      memory: 41,
      uptime: "99.7%",
      lastDeploy: "4 hours ago",
      version: "v2.1.4-rc.1",
      url: "https://staging.company.com",
      region: "us-east-1",
      autoScale: true,
      monitoring: "standard"
    },
    {
      id: "testing",
      name: "Testing",
      status: "warning",
      instances: 1,
      cpu: 78,
      memory: 85,
      uptime: "98.2%",
      lastDeploy: "6 hours ago",
      version: "v2.2.0-beta.1",
      url: "https://test.company.com",
      region: "us-west-2",
      autoScale: false,
      monitoring: "basic"
    },
    {
      id: "development",
      name: "Development",
      status: "healthy",
      instances: 2,
      cpu: 15,
      memory: 32,
      uptime: "97.8%",
      lastDeploy: "30 minutes ago",
      version: "v2.2.0-dev",
      url: "https://dev.company.com",
      region: "us-west-2",
      autoScale: false,
      monitoring: "basic"
    }
  ];

  const configurationCategories = [
    {
      name: "Application",
      configs: [
        { key: "NODE_ENV", value: "production", encrypted: false, source: "environment" },
        { key: "PORT", value: "3000", encrypted: false, source: "environment" },
        { key: "API_VERSION", value: "v1", encrypted: false, source: "environment" },
        { key: "LOG_LEVEL", value: "info", encrypted: false, source: "environment" }
      ]
    },
    {
      name: "Database",
      configs: [
        { key: "DATABASE_URL", value: "postgres://***", encrypted: true, source: "secret" },
        { key: "DB_POOL_SIZE", value: "10", encrypted: false, source: "environment" },
        { key: "DB_TIMEOUT", value: "30000", encrypted: false, source: "environment" },
        { key: "DB_SSL", value: "true", encrypted: false, source: "environment" }
      ]
    },
    {
      name: "External Services",
      configs: [
        { key: "STRIPE_SECRET_KEY", value: "sk_***", encrypted: true, source: "secret" },
        { key: "SENDGRID_API_KEY", value: "SG.***", encrypted: true, source: "secret" },
        { key: "REDIS_URL", value: "redis://***", encrypted: true, source: "secret" },
        { key: "S3_BUCKET", value: "app-assets-prod", encrypted: false, source: "environment" }
      ]
    },
    {
      name: "Security",
      configs: [
        { key: "JWT_SECRET", value: "***", encrypted: true, source: "secret" },
        { key: "ENCRYPTION_KEY", value: "***", encrypted: true, source: "secret" },
        { key: "CORS_ORIGINS", value: "https://company.com", encrypted: false, source: "environment" },
        { key: "RATE_LIMIT", value: "100", encrypted: false, source: "environment" }
      ]
    }
  ];

  const provisioningTemplates = [
    {
      name: "Micro Service",
      description: "Single containerized service with load balancer",
      resources: { cpu: "0.5 vCPU", memory: "1 GB", storage: "10 GB" },
      components: ["Container", "Load Balancer", "Auto Scaling", "Health Checks"],
      estimatedCost: "$45/month"
    },
    {
      name: "Full Stack App",
      description: "Complete application stack with database",
      resources: { cpu: "2 vCPU", memory: "4 GB", storage: "50 GB" },
      components: ["App Container", "Database", "Redis Cache", "File Storage", "CDN"],
      estimatedCost: "$180/month"
    },
    {
      name: "High Availability",
      description: "Multi-region deployment with redundancy",
      resources: { cpu: "4 vCPU", memory: "8 GB", storage: "100 GB" },
      components: ["Multi-AZ Deployment", "Load Balancer", "Database Cluster", "Backup System"],
      estimatedCost: "$450/month"
    }
  ];

  const validationChecks = [
    { name: "Health Endpoints", status: "passing", description: "API health check responses" },
    { name: "Database Connectivity", status: "passing", description: "Database connection and query tests" },
    { name: "External Service APIs", status: "warning", description: "Third-party service connectivity" },
    { name: "SSL Certificate", status: "passing", description: "Certificate validity and expiration" },
    { name: "Security Headers", status: "passing", description: "HTTP security header validation" },
    { name: "Performance Metrics", status: "passing", description: "Response time and throughput checks" },
    { name: "Resource Limits", status: "warning", description: "CPU and memory usage thresholds" },
    { name: "Backup Integrity", status: "passing", description: "Database backup validation" }
  ];

  const selectedEnv = environments.find(env => env.id === selectedEnvironment);

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
              Environment & Configuration Management
            </h1>
            <p className={cn(
              "text-base",
              isDark ? "text-white/70" : "text-black/70"
            )}>
              Manage environments, configurations, provisioning, and validation across all deployment stages
            </p>
          </div>

          {/* Environment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {environments.map((env) => (
              <motion.div
                key={env.id}
                className={cn(
                  "p-6 rounded-lg border-2 cursor-pointer transition-all duration-300",
                  selectedEnvironment === env.id
                    ? (isDark ? "bg-white/10 border-white/50" : "bg-black/10 border-black/50")
                    : (isDark ? "bg-black/40 border-white/20 hover:border-white/40" : "bg-white/60 border-black/20 hover:border-black/40")
                )}
                onClick={() => setSelectedEnvironment(env.id)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={cn(
                    "font-bold uppercase tracking-wide",
                    isDark ? "text-white" : "text-black"
                  )}>
                    {env.name}
                  </h3>
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    env.status === "healthy" ? "bg-green-500" :
                    env.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                  )} />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={cn(isDark ? "text-white/70" : "text-black/70")}>Instances:</span>
                    <span className={cn(isDark ? "text-white" : "text-black")}>{env.instances}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={cn(isDark ? "text-white/70" : "text-black/70")}>CPU:</span>
                    <span className={cn(isDark ? "text-white" : "text-black")}>{env.cpu}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={cn(isDark ? "text-white/70" : "text-black/70")}>Memory:</span>
                    <span className={cn(isDark ? "text-white" : "text-black")}>{env.memory}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={cn(isDark ? "text-white/70" : "text-black/70")}>Uptime:</span>
                    <span className="text-green-500">{env.uptime}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-xs space-y-1">
                    <div className={cn(isDark ? "text-white/60" : "text-black/60")}>
                      Version: {env.version}
                    </div>
                    <div className={cn(isDark ? "text-white/60" : "text-black/60")}>
                      Deploy: {env.lastDeploy}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Selected Environment Details */}
          {selectedEnv && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Environment Details */}
              <div className={cn(
                "p-6 rounded-lg border-2",
                isDark ? "bg-black/40 border-white/20" : "bg-white/60 border-black/20"
              )}>
                <h2 className={cn(
                  "text-xl font-bold mb-4 uppercase tracking-wide",
                  isDark ? "text-white" : "text-black"
                )}>
                  {selectedEnv.name} Environment Details
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={cn(
                        "text-sm font-medium uppercase tracking-wide",
                        isDark ? "text-white/80" : "text-black/80"
                      )}>
                        URL
                      </label>
                      <p className={cn(
                        "text-sm",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {selectedEnv.url}
                      </p>
                    </div>
                    <div>
                      <label className={cn(
                        "text-sm font-medium uppercase tracking-wide",
                        isDark ? "text-white/80" : "text-black/80"
                      )}>
                        Region
                      </label>
                      <p className={cn(
                        "text-sm",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {selectedEnv.region}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={cn(
                        "text-sm font-medium uppercase tracking-wide",
                        isDark ? "text-white/80" : "text-black/80"
                      )}>
                        Auto Scaling
                      </label>
                      <p className={cn(
                        "text-sm",
                        selectedEnv.autoScale ? "text-green-500" : "text-red-500"
                      )}>
                        {selectedEnv.autoScale ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                    <div>
                      <label className={cn(
                        "text-sm font-medium uppercase tracking-wide",
                        isDark ? "text-white/80" : "text-black/80"
                      )}>
                        Monitoring
                      </label>
                      <p className={cn(
                        "text-sm capitalize",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {selectedEnv.monitoring}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setShowConfigModal(true)}
                      className={cn(
                        "w-full p-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm uppercase tracking-wide",
                        isDark
                          ? "border-white/40 text-white hover:border-white hover:bg-white/5"
                          : "border-black/40 text-black hover:border-black hover:bg-black/5"
                      )}
                    >
                      Manage Configuration
                    </button>
                  </div>
                </div>
              </div>

              {/* Environment Validation */}
              <div className={cn(
                "p-6 rounded-lg border-2",
                isDark ? "bg-black/40 border-white/20" : "bg-white/60 border-black/20"
              )}>
                <h2 className={cn(
                  "text-xl font-bold mb-4 uppercase tracking-wide",
                  isDark ? "text-white" : "text-black"
                )}>
                  Environment Validation
                </h2>

                <div className="space-y-3">
                  {validationChecks.map((check) => (
                    <div key={check.name} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className={cn(
                          "font-medium",
                          isDark ? "text-white" : "text-black"
                        )}>
                          {check.name}
                        </h3>
                        <p className={cn(
                          "text-sm",
                          isDark ? "text-white/70" : "text-black/70"
                        )}>
                          {check.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          check.status === "passing" ? "bg-green-500" :
                          check.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                        )} />
                        <span className={cn(
                          "text-sm uppercase tracking-wide",
                          check.status === "passing" ? "text-green-500" :
                          check.status === "warning" ? "text-yellow-500" : "text-red-500"
                        )}>
                          {check.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <button className={cn(
                    "w-full p-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm uppercase tracking-wide",
                    isDark
                      ? "bg-white text-black border-white hover:bg-white/90"
                      : "bg-black text-white border-black hover:bg-black/90"
                  )}>
                    Run Full Validation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Environment Provisioning Templates */}
          <div className="mb-8">
            <h2 className={cn(
              "text-2xl font-bold mb-4 uppercase tracking-wide",
              isDark ? "text-white" : "text-black"
            )}>
              Environment Provisioning Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {provisioningTemplates.map((template) => (
                <div key={template.name} className={cn(
                  "p-6 rounded-lg border-2",
                  isDark ? "bg-black/40 border-white/20" : "bg-white/60 border-black/20"
                )}>
                  <h3 className={cn(
                    "font-bold mb-2 uppercase tracking-wide",
                    isDark ? "text-white" : "text-black"
                  )}>
                    {template.name}
                  </h3>
                  <p className={cn(
                    "text-sm mb-4",
                    isDark ? "text-white/70" : "text-black/70"
                  )}>
                    {template.description}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <h4 className={cn(
                        "text-xs font-medium mb-2 uppercase tracking-wide",
                        isDark ? "text-white/80" : "text-black/80"
                      )}>
                        Resources
                      </h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className={cn(isDark ? "text-white/70" : "text-black/70")}>CPU:</span>
                          <span className={cn(isDark ? "text-white" : "text-black")}>{template.resources.cpu}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={cn(isDark ? "text-white/70" : "text-black/70")}>Memory:</span>
                          <span className={cn(isDark ? "text-white" : "text-black")}>{template.resources.memory}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={cn(isDark ? "text-white/70" : "text-black/70")}>Storage:</span>
                          <span className={cn(isDark ? "text-white" : "text-black")}>{template.resources.storage}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className={cn(
                        "text-xs font-medium mb-2 uppercase tracking-wide",
                        isDark ? "text-white/80" : "text-black/80"
                      )}>
                        Components
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {template.components.map((component) => (
                          <span key={component} className={cn(
                            "px-2 py-1 rounded-full text-xs",
                            isDark ? "bg-white/10 text-white/80" : "bg-black/10 text-black/80"
                          )}>
                            {component}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3">
                      <span className={cn(
                        "text-sm font-medium",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {template.estimatedCost}
                      </span>
                      <button className={cn(
                        "px-3 py-1 rounded-lg border transition-all duration-300 text-xs uppercase tracking-wide",
                        isDark
                          ? "border-white/40 text-white hover:border-white hover:bg-white/5"
                          : "border-black/40 text-black hover:border-black hover:bg-black/5"
                      )}>
                        Deploy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Management Modal */}
          {showConfigModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className={cn(
                "max-w-4xl w-full max-h-[80vh] overflow-y-auto rounded-lg border-2 p-6",
                isDark ? "bg-black border-white/30" : "bg-white border-black/30"
              )}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={cn(
                    "text-xl font-bold uppercase tracking-wide",
                    isDark ? "text-white" : "text-black"
                  )}>
                    Configuration Management - {selectedEnv?.name}
                  </h2>
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className={cn(
                      "p-2 rounded-lg border transition-all duration-300",
                      isDark ? "border-white/40 text-white hover:bg-white/5" : "border-black/40 text-black hover:bg-black/5"
                    )}
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {configurationCategories.map((category) => (
                    <div key={category.name}>
                      <h3 className={cn(
                        "font-bold mb-3 uppercase tracking-wide",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {category.name}
                      </h3>
                      <div className="space-y-2">
                        {category.configs.map((config) => (
                          <div key={config.key} className={cn(
                            "flex items-center justify-between p-3 rounded-lg border",
                            isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                          )}>
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "font-medium",
                                isDark ? "text-white" : "text-black"
                              )}>
                                {config.key}
                              </span>
                              {config.encrypted && (
                                <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-500">
                                  ENCRYPTED
                                </span>
                              )}
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs",
                                config.source === "secret" ? "bg-purple-500/20 text-purple-500" : "bg-blue-500/20 text-blue-500"
                              )}>
                                {config.source}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-sm font-mono",
                                isDark ? "text-white/80" : "text-black/80"
                              )}>
                                {config.value}
                              </span>
                              <button className={cn(
                                "px-2 py-1 rounded text-xs",
                                isDark ? "bg-white/10 text-white/80 hover:bg-white/20" : "bg-black/10 text-black/80 hover:bg-black/20"
                              )}>
                                Edit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 mt-6">
                  <button className={cn(
                    "px-6 py-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm uppercase tracking-wide",
                    isDark
                      ? "bg-white text-black border-white hover:bg-white/90"
                      : "bg-black text-white border-black hover:bg-black/90"
                  )}>
                    Save Changes
                  </button>
                  <button className={cn(
                    "px-6 py-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm uppercase tracking-wide",
                    isDark
                      ? "border-white/40 text-white hover:border-white hover:bg-white/5"
                      : "border-black/40 text-black hover:border-black hover:bg-black/5"
                  )}>
                    Add Configuration
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className={cn(
              "px-6 py-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm uppercase tracking-wide",
              isDark
                ? "bg-white text-black border-white hover:bg-white/90"
                : "bg-black text-white border-black hover:bg-black/90"
            )}>
              Provision Environment
            </button>
            <button className={cn(
              "px-6 py-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm uppercase tracking-wide",
              isDark
                ? "border-white/40 text-white hover:border-white hover:bg-white/5"
                : "border-black/40 text-black hover:border-black hover:bg-black/5"
            )}>
              Export Configuration
            </button>
            <button className={cn(
              "px-6 py-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm uppercase tracking-wide",
              isDark
                ? "border-white/40 text-white hover:border-white hover:bg-white/5"
                : "border-black/40 text-black hover:border-black hover:bg-black/5"
            )}>
              Environment Logs
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}