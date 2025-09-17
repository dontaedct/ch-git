"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function ProductionArchitecture() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState("blue-green");

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

  const deploymentStrategies = [
    {
      id: "blue-green",
      name: "Blue-Green Deployment",
      description: "Zero-downtime deployment with instant rollback capability",
      pros: ["Zero downtime", "Instant rollback", "Full environment testing"],
      cons: ["Resource intensive", "Database sync complexity"],
      complexity: "Medium",
      reliability: "High"
    },
    {
      id: "rolling",
      name: "Rolling Deployment",
      description: "Gradual replacement of instances with new version",
      pros: ["Resource efficient", "Gradual rollout", "Real-time monitoring"],
      cons: ["Longer deployment time", "Mixed versions during deploy"],
      complexity: "Low",
      reliability: "Medium"
    },
    {
      id: "canary",
      name: "Canary Deployment",
      description: "Small subset deployment for testing before full rollout",
      pros: ["Risk mitigation", "Real user feedback", "A/B testing"],
      cons: ["Complex monitoring", "Slower full deployment"],
      complexity: "High",
      reliability: "High"
    }
  ];

  const architectureComponents = [
    {
      name: "Load Balancer",
      description: "Traffic distribution and health checking",
      status: "configured",
      type: "infrastructure"
    },
    {
      name: "Container Registry",
      description: "Docker image storage and versioning",
      status: "configured",
      type: "infrastructure"
    },
    {
      name: "CI/CD Pipeline",
      description: "Automated build, test, and deployment",
      status: "configured",
      type: "automation"
    },
    {
      name: "Monitoring Stack",
      description: "Application and infrastructure monitoring",
      status: "configured",
      type: "observability"
    },
    {
      name: "Secret Management",
      description: "Secure storage and rotation of credentials",
      status: "configured",
      type: "security"
    },
    {
      name: "Backup System",
      description: "Automated backup and restore capabilities",
      status: "configured",
      type: "data"
    }
  ];

  const environments = [
    {
      name: "Development",
      description: "Feature development and initial testing",
      instances: 2,
      autoScale: false,
      monitoring: "basic"
    },
    {
      name: "Testing",
      description: "Quality assurance and integration testing",
      instances: 1,
      autoScale: false,
      monitoring: "standard"
    },
    {
      name: "Staging",
      description: "Production-like environment for final validation",
      instances: 3,
      autoScale: true,
      monitoring: "comprehensive"
    },
    {
      name: "Production",
      description: "Live environment serving end users",
      instances: 5,
      autoScale: true,
      monitoring: "comprehensive"
    }
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
              Production Deployment Architecture
            </h1>
            <p className={cn(
              "text-base",
              isDark ? "text-white/70" : "text-black/70"
            )}>
              Design and configure production deployment architecture with deployment strategies, environment management, and automation
            </p>
          </div>

          {/* Deployment Strategies */}
          <div className="mb-8">
            <h2 className={cn(
              "text-2xl font-bold mb-4 uppercase tracking-wide",
              isDark ? "text-white" : "text-black"
            )}>
              Deployment Strategies
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {deploymentStrategies.map((strategy) => (
                <motion.div
                  key={strategy.id}
                  className={cn(
                    "p-6 rounded-lg border-2 cursor-pointer transition-all duration-300",
                    selectedStrategy === strategy.id
                      ? (isDark ? "bg-white/10 border-white/50" : "bg-black/10 border-black/50")
                      : (isDark ? "bg-black/40 border-white/20 hover:border-white/40" : "bg-white/60 border-black/20 hover:border-black/40")
                  )}
                  onClick={() => setSelectedStrategy(strategy.id)}
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className={cn(
                    "text-lg font-bold mb-2 uppercase tracking-wide",
                    isDark ? "text-white" : "text-black"
                  )}>
                    {strategy.name}
                  </h3>
                  <p className={cn(
                    "text-sm mb-4",
                    isDark ? "text-white/80" : "text-black/80"
                  )}>
                    {strategy.description}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <h4 className={cn(
                        "text-xs font-medium mb-1 uppercase tracking-wide",
                        isDark ? "text-green-400" : "text-green-600"
                      )}>
                        Pros
                      </h4>
                      <ul className="space-y-1">
                        {strategy.pros.map((pro, index) => (
                          <li key={index} className={cn(
                            "text-xs flex items-center gap-2",
                            isDark ? "text-white/80" : "text-black/80"
                          )}>
                            <div className="w-1 h-1 rounded-full bg-green-500" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className={cn(
                        "text-xs font-medium mb-1 uppercase tracking-wide",
                        isDark ? "text-red-400" : "text-red-600"
                      )}>
                        Cons
                      </h4>
                      <ul className="space-y-1">
                        {strategy.cons.map((con, index) => (
                          <li key={index} className={cn(
                            "text-xs flex items-center gap-2",
                            isDark ? "text-white/80" : "text-black/80"
                          )}>
                            <div className="w-1 h-1 rounded-full bg-red-500" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <div>
                        <span className={cn(
                          "text-xs font-medium uppercase tracking-wide",
                          isDark ? "text-white/60" : "text-black/60"
                        )}>
                          Complexity:
                        </span>
                        <span className={cn(
                          "text-xs ml-1",
                          strategy.complexity === "Low" ? "text-green-500" :
                          strategy.complexity === "Medium" ? "text-yellow-500" : "text-red-500"
                        )}>
                          {strategy.complexity}
                        </span>
                      </div>
                      <div>
                        <span className={cn(
                          "text-xs font-medium uppercase tracking-wide",
                          isDark ? "text-white/60" : "text-black/60"
                        )}>
                          Reliability:
                        </span>
                        <span className={cn(
                          "text-xs ml-1",
                          strategy.reliability === "High" ? "text-green-500" : "text-yellow-500"
                        )}>
                          {strategy.reliability}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Architecture Components */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className={cn(
              "p-6 rounded-lg border-2",
              isDark ? "bg-black/40 border-white/20" : "bg-white/60 border-black/20"
            )}>
              <h2 className={cn(
                "text-xl font-bold mb-4 uppercase tracking-wide",
                isDark ? "text-white" : "text-black"
              )}>
                Architecture Components
              </h2>
              <div className="space-y-4">
                {architectureComponents.map((component) => (
                  <div key={component.name} className="flex items-center justify-between">
                    <div>
                      <h3 className={cn(
                        "font-medium",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {component.name}
                      </h3>
                      <p className={cn(
                        "text-sm",
                        isDark ? "text-white/70" : "text-black/70"
                      )}>
                        {component.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium uppercase",
                        component.type === "infrastructure" ? "bg-blue-500/20 text-blue-500" :
                        component.type === "automation" ? "bg-purple-500/20 text-purple-500" :
                        component.type === "observability" ? "bg-green-500/20 text-green-500" :
                        component.type === "security" ? "bg-red-500/20 text-red-500" :
                        "bg-yellow-500/20 text-yellow-500"
                      )}>
                        {component.type}
                      </span>
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Environment Configuration */}
            <div className={cn(
              "p-6 rounded-lg border-2",
              isDark ? "bg-black/40 border-white/20" : "bg-white/60 border-black/20"
            )}>
              <h2 className={cn(
                "text-xl font-bold mb-4 uppercase tracking-wide",
                isDark ? "text-white" : "text-black"
              )}>
                Environment Configuration
              </h2>
              <div className="space-y-4">
                {environments.map((env) => (
                  <div key={env.name} className={cn(
                    "p-4 rounded-lg border",
                    isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={cn(
                        "font-bold uppercase tracking-wide",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {env.name}
                      </h3>
                      <span className={cn(
                        "text-sm",
                        isDark ? "text-white/80" : "text-black/80"
                      )}>
                        {env.instances} instances
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm mb-3",
                      isDark ? "text-white/70" : "text-black/70"
                    )}>
                      {env.description}
                    </p>
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          env.autoScale ? "bg-green-500" : "bg-gray-500"
                        )} />
                        <span className={cn(
                          isDark ? "text-white/80" : "text-black/80"
                        )}>
                          Auto-scale: {env.autoScale ? "On" : "Off"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          env.monitoring === "comprehensive" ? "bg-green-500" :
                          env.monitoring === "standard" ? "bg-yellow-500" : "bg-blue-500"
                        )} />
                        <span className={cn(
                          isDark ? "text-white/80" : "text-black/80"
                        )}>
                          Monitoring: {env.monitoring}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deployment Automation Framework */}
          <div className={cn(
            "p-6 rounded-lg border-2",
            isDark ? "bg-black/40 border-white/20" : "bg-white/60 border-black/20"
          )}>
            <h2 className={cn(
              "text-xl font-bold mb-4 uppercase tracking-wide",
              isDark ? "text-white" : "text-black"
            )}>
              Deployment Automation Framework
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className={cn(
                  "font-bold uppercase tracking-wide",
                  isDark ? "text-white" : "text-black"
                )}>
                  Build Stage
                </h3>
                <ul className="space-y-2">
                  {["Code compilation", "Dependency resolution", "Unit testing", "Static analysis", "Security scanning"].map((item) => (
                    <li key={item} className={cn(
                      "text-sm flex items-center gap-2",
                      isDark ? "text-white/80" : "text-black/80"
                    )}>
                      <div className="w-1 h-1 rounded-full bg-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className={cn(
                  "font-bold uppercase tracking-wide",
                  isDark ? "text-white" : "text-black"
                )}>
                  Test Stage
                </h3>
                <ul className="space-y-2">
                  {["Integration testing", "End-to-end testing", "Performance testing", "Load testing", "Acceptance testing"].map((item) => (
                    <li key={item} className={cn(
                      "text-sm flex items-center gap-2",
                      isDark ? "text-white/80" : "text-black/80"
                    )}>
                      <div className="w-1 h-1 rounded-full bg-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className={cn(
                  "font-bold uppercase tracking-wide",
                  isDark ? "text-white" : "text-black"
                )}>
                  Deploy Stage
                </h3>
                <ul className="space-y-2">
                  {["Environment preparation", "Database migration", "Application deployment", "Health checks", "Rollback capability"].map((item) => (
                    <li key={item} className={cn(
                      "text-sm flex items-center gap-2",
                      isDark ? "text-white/80" : "text-black/80"
                    )}>
                      <div className="w-1 h-1 rounded-full bg-purple-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button className={cn(
              "px-6 py-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm uppercase tracking-wide",
              isDark
                ? "bg-white text-black border-white hover:bg-white/90"
                : "bg-black text-white border-black hover:bg-black/90"
            )}>
              Save Architecture
            </button>
            <button className={cn(
              "px-6 py-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm uppercase tracking-wide",
              isDark
                ? "border-white/40 text-white hover:border-white hover:bg-white/5"
                : "border-black/40 text-black hover:border-black hover:bg-black/5"
            )}>
              Deploy Pipeline
            </button>
            <button className={cn(
              "px-6 py-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm uppercase tracking-wide",
              isDark
                ? "border-white/40 text-white hover:border-white hover:bg-white/5"
                : "border-black/40 text-black hover:border-black hover:bg-black/5"
            )}>
              Test Configuration
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}