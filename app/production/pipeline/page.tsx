"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function DeploymentPipeline() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState("standard");
  const [pipelineStatus, setPipelineStatus] = useState("idle");

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

  const pipelineStages = [
    {
      id: "source",
      name: "Source Control",
      description: "Code checkout and version control",
      duration: "30s",
      status: "completed",
      tasks: ["Git checkout", "Dependency scan", "Code analysis"]
    },
    {
      id: "build",
      name: "Build & Compile",
      description: "Application build and compilation",
      duration: "3-5 min",
      status: "completed",
      tasks: ["Install dependencies", "Compile TypeScript", "Bundle assets", "Generate artifacts"]
    },
    {
      id: "test",
      name: "Testing",
      description: "Automated testing suite execution",
      duration: "2-4 min",
      status: "running",
      tasks: ["Unit tests", "Integration tests", "E2E tests", "Performance tests"]
    },
    {
      id: "security",
      name: "Security Scan",
      description: "Security vulnerability assessment",
      duration: "1-2 min",
      status: "pending",
      tasks: ["SAST analysis", "Dependency audit", "Container scan", "Compliance check"]
    },
    {
      id: "package",
      name: "Package & Registry",
      description: "Container packaging and registry push",
      duration: "2-3 min",
      status: "pending",
      tasks: ["Docker build", "Image scan", "Registry push", "Tag versioning"]
    },
    {
      id: "deploy",
      name: "Deployment",
      description: "Application deployment to target environment",
      duration: "3-5 min",
      status: "pending",
      tasks: ["Environment prep", "Database migration", "Application deploy", "Health checks"]
    }
  ];

  const buildAutomation = {
    triggers: [
      { name: "Git Push", description: "Automatic trigger on code push", enabled: true },
      { name: "Schedule", description: "Daily automated builds", enabled: true },
      { name: "Manual", description: "On-demand pipeline execution", enabled: true },
      { name: "Release Tag", description: "Trigger on release tag creation", enabled: true }
    ],
    tools: [
      { name: "GitHub Actions", status: "configured", type: "CI/CD" },
      { name: "Docker", status: "configured", type: "Containerization" },
      { name: "Jest", status: "configured", type: "Testing" },
      { name: "ESLint", status: "configured", type: "Code Quality" },
      { name: "Sonar", status: "configured", type: "Security" }
    ]
  };

  const pipelineMetrics = {
    successRate: 94.2,
    avgDuration: "12 min",
    deploymentsToday: 8,
    failureRate: 5.8,
    lastRun: "23 minutes ago",
    nextScheduled: "Tomorrow 6:00 AM"
  };

  const recentRuns = [
    { id: "run-001", branch: "main", status: "success", duration: "11m 34s", time: "23 min ago", triggeredBy: "john.doe" },
    { id: "run-002", branch: "feature/auth", status: "failed", duration: "8m 12s", time: "1h ago", triggeredBy: "jane.smith" },
    { id: "run-003", branch: "main", status: "success", duration: "12m 45s", time: "2h ago", triggeredBy: "automation" },
    { id: "run-004", branch: "hotfix/security", status: "success", duration: "9m 23s", time: "4h ago", triggeredBy: "security.team" },
    { id: "run-005", branch: "develop", status: "success", duration: "13m 56s", time: "6h ago", triggeredBy: "dev.team" }
  ];

  const runPipeline = () => {
    setPipelineStatus("running");
    // Simulate pipeline execution
    setTimeout(() => setPipelineStatus("completed"), 3000);
  };

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
              Deployment Pipeline Design
            </h1>
            <p className={cn(
              "text-base",
              isDark ? "text-white/70" : "text-black/70"
            )}>
              Design and configure deployment pipeline with build automation, testing integration, and deployment stages
            </p>
          </div>

          {/* Pipeline Status & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className={cn(
              "p-4 rounded-lg border-2",
              isDark ? "bg-black/60 border-white/30" : "bg-white/80 border-black/30"
            )}>
              <h3 className={cn(
                "text-xs font-medium mb-1 uppercase tracking-wide",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Success Rate
              </h3>
              <p className="text-lg font-bold text-green-500">
                {pipelineMetrics.successRate}%
              </p>
            </div>

            <div className={cn(
              "p-4 rounded-lg border-2",
              isDark ? "bg-black/60 border-white/30" : "bg-white/80 border-black/30"
            )}>
              <h3 className={cn(
                "text-xs font-medium mb-1 uppercase tracking-wide",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Avg Duration
              </h3>
              <p className={cn(
                "text-lg font-bold",
                isDark ? "text-white" : "text-black"
              )}>
                {pipelineMetrics.avgDuration}
              </p>
            </div>

            <div className={cn(
              "p-4 rounded-lg border-2",
              isDark ? "bg-black/60 border-white/30" : "bg-white/80 border-black/30"
            )}>
              <h3 className={cn(
                "text-xs font-medium mb-1 uppercase tracking-wide",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Today's Runs
              </h3>
              <p className={cn(
                "text-lg font-bold",
                isDark ? "text-white" : "text-black"
              )}>
                {pipelineMetrics.deploymentsToday}
              </p>
            </div>

            <div className={cn(
              "p-4 rounded-lg border-2",
              isDark ? "bg-black/60 border-white/30" : "bg-white/80 border-black/30"
            )}>
              <h3 className={cn(
                "text-xs font-medium mb-1 uppercase tracking-wide",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Failure Rate
              </h3>
              <p className="text-lg font-bold text-red-500">
                {pipelineMetrics.failureRate}%
              </p>
            </div>

            <div className={cn(
              "p-4 rounded-lg border-2",
              isDark ? "bg-black/60 border-white/30" : "bg-white/80 border-black/30"
            )}>
              <h3 className={cn(
                "text-xs font-medium mb-1 uppercase tracking-wide",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Last Run
              </h3>
              <p className={cn(
                "text-lg font-bold",
                isDark ? "text-white" : "text-black"
              )}>
                {pipelineMetrics.lastRun}
              </p>
            </div>

            <div className={cn(
              "p-4 rounded-lg border-2",
              isDark ? "bg-black/60 border-white/30" : "bg-white/80 border-black/30"
            )}>
              <h3 className={cn(
                "text-xs font-medium mb-1 uppercase tracking-wide",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Next Scheduled
              </h3>
              <p className={cn(
                "text-sm font-bold",
                isDark ? "text-white" : "text-black"
              )}>
                {pipelineMetrics.nextScheduled}
              </p>
            </div>
          </div>

          {/* Pipeline Visualization */}
          <div className={cn(
            "p-6 rounded-lg border-2 mb-8",
            isDark ? "bg-black/40 border-white/20" : "bg-white/60 border-black/20"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={cn(
                "text-xl font-bold uppercase tracking-wide",
                isDark ? "text-white" : "text-black"
              )}>
                Pipeline Stages
              </h2>
              <button
                onClick={runPipeline}
                className={cn(
                  "px-4 py-2 rounded-lg border-2 transition-all duration-300 font-medium text-sm uppercase tracking-wide",
                  isDark
                    ? "bg-white text-black border-white hover:bg-white/90"
                    : "bg-black text-white border-black hover:bg-black/90"
                )}
              >
                Run Pipeline
              </button>
            </div>

            <div className="space-y-4">
              {pipelineStages.map((stage, index) => (
                <motion.div
                  key={stage.id}
                  className={cn(
                    "flex items-center p-4 rounded-lg border transition-all duration-300",
                    stage.status === "completed" ? (isDark ? "bg-green-500/10 border-green-500/30" : "bg-green-500/10 border-green-500/30") :
                    stage.status === "running" ? (isDark ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-500/10 border-blue-500/30") :
                    (isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10")
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      stage.status === "completed" ? "bg-green-500 text-white" :
                      stage.status === "running" ? "bg-blue-500 text-white" :
                      (isDark ? "bg-white/20 text-white/60" : "bg-black/20 text-black/60")
                    )}>
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <h3 className={cn(
                        "font-bold uppercase tracking-wide mb-1",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {stage.name}
                      </h3>
                      <p className={cn(
                        "text-sm mb-2",
                        isDark ? "text-white/70" : "text-black/70"
                      )}>
                        {stage.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {stage.tasks.map((task) => (
                          <span key={task} className={cn(
                            "px-2 py-1 rounded-full text-xs",
                            isDark ? "bg-white/10 text-white/80" : "bg-black/10 text-black/80"
                          )}>
                            {task}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={cn(
                        "text-sm font-medium",
                        isDark ? "text-white/80" : "text-black/80"
                      )}>
                        {stage.duration}
                      </div>
                      <div className={cn(
                        "text-xs uppercase tracking-wide",
                        stage.status === "completed" ? "text-green-500" :
                        stage.status === "running" ? "text-blue-500" :
                        (isDark ? "text-white/60" : "text-black/60")
                      )}>
                        {stage.status}
                      </div>
                    </div>
                  </div>

                  {stage.status === "running" && (
                    <motion.div
                      className="ml-4 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Build Automation & Testing Integration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Build Automation */}
            <div className={cn(
              "p-6 rounded-lg border-2",
              isDark ? "bg-black/40 border-white/20" : "bg-white/60 border-black/20"
            )}>
              <h2 className={cn(
                "text-xl font-bold mb-4 uppercase tracking-wide",
                isDark ? "text-white" : "text-black"
              )}>
                Build Automation
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className={cn(
                    "font-bold mb-3 uppercase tracking-wide",
                    isDark ? "text-white" : "text-black"
                  )}>
                    Triggers
                  </h3>
                  <div className="space-y-2">
                    {buildAutomation.triggers.map((trigger) => (
                      <div key={trigger.name} className="flex items-center justify-between">
                        <div>
                          <span className={cn(
                            "font-medium",
                            isDark ? "text-white" : "text-black"
                          )}>
                            {trigger.name}
                          </span>
                          <p className={cn(
                            "text-sm",
                            isDark ? "text-white/70" : "text-black/70"
                          )}>
                            {trigger.description}
                          </p>
                        </div>
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          trigger.enabled ? "bg-green-500" : "bg-gray-500"
                        )} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className={cn(
                    "font-bold mb-3 uppercase tracking-wide",
                    isDark ? "text-white" : "text-black"
                  )}>
                    Tools & Integration
                  </h3>
                  <div className="space-y-2">
                    {buildAutomation.tools.map((tool) => (
                      <div key={tool.name} className="flex items-center justify-between">
                        <div>
                          <span className={cn(
                            "font-medium",
                            isDark ? "text-white" : "text-black"
                          )}>
                            {tool.name}
                          </span>
                          <span className={cn(
                            "ml-2 px-2 py-1 rounded-full text-xs",
                            tool.type === "CI/CD" ? "bg-blue-500/20 text-blue-500" :
                            tool.type === "Testing" ? "bg-green-500/20 text-green-500" :
                            tool.type === "Security" ? "bg-red-500/20 text-red-500" :
                            "bg-purple-500/20 text-purple-500"
                          )}>
                            {tool.type}
                          </span>
                        </div>
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          tool.status === "configured" ? "bg-green-500" : "bg-yellow-500"
                        )} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Pipeline Runs */}
            <div className={cn(
              "p-6 rounded-lg border-2",
              isDark ? "bg-black/40 border-white/20" : "bg-white/60 border-black/20"
            )}>
              <h2 className={cn(
                "text-xl font-bold mb-4 uppercase tracking-wide",
                isDark ? "text-white" : "text-black"
              )}>
                Recent Pipeline Runs
              </h2>

              <div className="space-y-3">
                {recentRuns.map((run) => (
                  <div key={run.id} className={cn(
                    "p-3 rounded-lg border",
                    isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          run.status === "success" ? "bg-green-500" : "bg-red-500"
                        )} />
                        <span className={cn(
                          "font-medium",
                          isDark ? "text-white" : "text-black"
                        )}>
                          {run.branch}
                        </span>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs uppercase",
                          run.status === "success"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-red-500/20 text-red-500"
                        )}>
                          {run.status}
                        </span>
                      </div>
                      <span className={cn(
                        "text-sm",
                        isDark ? "text-white/70" : "text-black/70"
                      )}>
                        {run.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn(
                        isDark ? "text-white/70" : "text-black/70"
                      )}>
                        Duration: {run.duration}
                      </span>
                      <span className={cn(
                        isDark ? "text-white/70" : "text-black/70"
                      )}>
                        By: {run.triggeredBy}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pipeline Optimization */}
          <div className={cn(
            "p-6 rounded-lg border-2",
            isDark ? "bg-black/40 border-white/20" : "bg-white/60 border-black/20"
          )}>
            <h2 className={cn(
              "text-xl font-bold mb-4 uppercase tracking-wide",
              isDark ? "text-white" : "text-black"
            )}>
              Pipeline Optimization
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className={cn(
                  "font-bold mb-3 uppercase tracking-wide",
                  isDark ? "text-white" : "text-black"
                )}>
                  Performance
                </h3>
                <ul className="space-y-2">
                  {["Parallel test execution", "Incremental builds", "Artifact caching", "Resource optimization"].map((item) => (
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

              <div>
                <h3 className={cn(
                  "font-bold mb-3 uppercase tracking-wide",
                  isDark ? "text-white" : "text-black"
                )}>
                  Reliability
                </h3>
                <ul className="space-y-2">
                  {["Retry mechanisms", "Health checks", "Rollback automation", "Error notifications"].map((item) => (
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

              <div>
                <h3 className={cn(
                  "font-bold mb-3 uppercase tracking-wide",
                  isDark ? "text-white" : "text-black"
                )}>
                  Security
                </h3>
                <ul className="space-y-2">
                  {["Secret management", "Access controls", "Audit logging", "Compliance checks"].map((item) => (
                    <li key={item} className={cn(
                      "text-sm flex items-center gap-2",
                      isDark ? "text-white/80" : "text-black/80"
                    )}>
                      <div className="w-1 h-1 rounded-full bg-red-500" />
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
              Save Pipeline
            </button>
            <button className={cn(
              "px-6 py-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm uppercase tracking-wide",
              isDark
                ? "border-white/40 text-white hover:border-white hover:bg-white/5"
                : "border-black/40 text-black hover:border-black hover:bg-black/5"
            )}>
              Test Pipeline
            </button>
            <button className={cn(
              "px-6 py-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm uppercase tracking-wide",
              isDark
                ? "border-white/40 text-white hover:border-white hover:bg-white/5"
                : "border-black/40 text-black hover:border-black hover:bg-black/5"
            )}>
              View Logs
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}