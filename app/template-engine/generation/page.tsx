/**
 * @fileoverview Dynamic Page Generation Interface
 * Interface for managing dynamic client app generation from templates
 * HT-029.1.3 Implementation
 */
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GenerationJob {
  id: string;
  templateId: string;
  templateName: string;
  clientId: string;
  clientName: string;
  status: 'queued' | 'generating' | 'deploying' | 'completed' | 'failed';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  generatedUrl?: string;
  error?: string;
  steps: GenerationStep[];
  performance: {
    totalTime: number;
    routeGenerationTime: number;
    componentInjectionTime: number;
    deploymentTime: number;
  };
}

interface GenerationStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  details: string;
  output?: string;
}

interface RouteGeneration {
  id: string;
  templateId: string;
  route: string;
  components: ComponentMapping[];
  variables: VariableMapping[];
  generatedAt: Date;
  performance: {
    compilationTime: number;
    bundleSize: number;
    loadTime: number;
  };
}

interface ComponentMapping {
  componentId: string;
  templatePath: string;
  generatedPath: string;
  props: Record<string, any>;
  dependencies: string[];
  injectionMethod: 'static' | 'dynamic' | 'lazy';
}

interface VariableMapping {
  variable: string;
  templateValue: string;
  resolvedValue: any;
  type: 'text' | 'number' | 'object' | 'array' | 'computed';
}

export default function DynamicGenerationPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [generationJobs, setGenerationJobs] = useState<GenerationJob[]>([]);
  const [routeGenerations, setRouteGenerations] = useState<RouteGeneration[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGenerationData = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockJobs: GenerationJob[] = [
        {
          id: "gen_001",
          templateId: "consultation-mvp",
          templateName: "Consultation MVP",
          clientId: "client_001",
          clientName: "TechStartup Co",
          status: "completed",
          progress: 100,
          startedAt: new Date(Date.now() - 5 * 60 * 1000),
          completedAt: new Date(Date.now() - 2 * 60 * 1000),
          generatedUrl: "https://techstartup.app.example.com",
          steps: [
            {
              id: "step_1",
              name: "Template Validation",
              status: "completed",
              startTime: new Date(Date.now() - 5 * 60 * 1000),
              endTime: new Date(Date.now() - 4.8 * 60 * 1000),
              duration: 12000,
              details: "Validated template structure and dependencies"
            },
            {
              id: "step_2",
              name: "Route Generation",
              status: "completed",
              startTime: new Date(Date.now() - 4.8 * 60 * 1000),
              endTime: new Date(Date.now() - 4.2 * 60 * 1000),
              duration: 36000,
              details: "Generated 5 routes with SEO optimization"
            },
            {
              id: "step_3",
              name: "Component Injection",
              status: "completed",
              startTime: new Date(Date.now() - 4.2 * 60 * 1000),
              endTime: new Date(Date.now() - 3.5 * 60 * 1000),
              duration: 42000,
              details: "Injected 12 components with props mapping"
            },
            {
              id: "step_4",
              name: "Asset Optimization",
              status: "completed",
              startTime: new Date(Date.now() - 3.5 * 60 * 1000),
              endTime: new Date(Date.now() - 3 * 60 * 1000),
              duration: 30000,
              details: "Optimized images and compiled CSS/JS"
            },
            {
              id: "step_5",
              name: "Deployment",
              status: "completed",
              startTime: new Date(Date.now() - 3 * 60 * 1000),
              endTime: new Date(Date.now() - 2 * 60 * 1000),
              duration: 60000,
              details: "Deployed to production with custom domain"
            }
          ],
          performance: {
            totalTime: 180000,
            routeGenerationTime: 36000,
            componentInjectionTime: 42000,
            deploymentTime: 60000
          }
        },
        {
          id: "gen_002",
          templateId: "consultation-mvp",
          templateName: "Consultation MVP",
          clientId: "client_002",
          clientName: "Health Clinic",
          status: "generating",
          progress: 65,
          startedAt: new Date(Date.now() - 2 * 60 * 1000),
          steps: [
            {
              id: "step_1",
              name: "Template Validation",
              status: "completed",
              startTime: new Date(Date.now() - 2 * 60 * 1000),
              endTime: new Date(Date.now() - 1.9 * 60 * 1000),
              duration: 6000,
              details: "Template validated successfully"
            },
            {
              id: "step_2",
              name: "Route Generation",
              status: "completed",
              startTime: new Date(Date.now() - 1.9 * 60 * 1000),
              endTime: new Date(Date.now() - 1.4 * 60 * 1000),
              duration: 30000,
              details: "Generated 5 routes with healthcare branding"
            },
            {
              id: "step_3",
              name: "Component Injection",
              status: "running",
              startTime: new Date(Date.now() - 1.4 * 60 * 1000),
              details: "Injecting healthcare-specific components..."
            },
            {
              id: "step_4",
              name: "Asset Optimization",
              status: "pending",
              details: "Waiting for component injection completion"
            },
            {
              id: "step_5",
              name: "Deployment",
              status: "pending",
              details: "Waiting for optimization completion"
            }
          ],
          performance: {
            totalTime: 0,
            routeGenerationTime: 30000,
            componentInjectionTime: 0,
            deploymentTime: 0
          }
        },
        {
          id: "gen_003",
          templateId: "landing-basic",
          templateName: "Basic Landing",
          clientId: "client_003",
          clientName: "Local Business",
          status: "queued",
          progress: 0,
          startedAt: new Date(Date.now() - 30 * 1000),
          steps: [
            {
              id: "step_1",
              name: "Template Validation",
              status: "pending",
              details: "Waiting in queue..."
            },
            {
              id: "step_2",
              name: "Route Generation",
              status: "pending",
              details: "Pending validation completion"
            },
            {
              id: "step_3",
              name: "Component Injection",
              status: "pending",
              details: "Pending route generation"
            },
            {
              id: "step_4",
              name: "Asset Optimization",
              status: "pending",
              details: "Pending component injection"
            },
            {
              id: "step_5",
              name: "Deployment",
              status: "pending",
              details: "Pending optimization"
            }
          ],
          performance: {
            totalTime: 0,
            routeGenerationTime: 0,
            componentInjectionTime: 0,
            deploymentTime: 0
          }
        }
      ];

      const mockRoutes: RouteGeneration[] = [
        {
          id: "route_001",
          templateId: "consultation-mvp",
          route: "/consultation",
          components: [
            {
              componentId: "hero-section",
              templatePath: "components/hero/ConsultationHero.tsx",
              generatedPath: "app/consultation/components/Hero.tsx",
              props: { title: "Free Business Consultation", subtitle: "Get expert insights" },
              dependencies: ["Button", "Container"],
              injectionMethod: "static"
            },
            {
              componentId: "questionnaire",
              templatePath: "components/forms/BusinessQuestionnaire.tsx",
              generatedPath: "app/consultation/components/Questionnaire.tsx",
              props: { steps: 5, validation: true },
              dependencies: ["FormField", "ProgressBar", "ValidationEngine"],
              injectionMethod: "dynamic"
            }
          ],
          variables: [
            {
              variable: "companyName",
              templateValue: "{{companyName}}",
              resolvedValue: "TechStartup Co",
              type: "text"
            },
            {
              variable: "questionnaire",
              templateValue: "{{questionnaire}}",
              resolvedValue: { steps: 5, questions: 24 },
              type: "object"
            }
          ],
          generatedAt: new Date(Date.now() - 3 * 60 * 1000),
          performance: {
            compilationTime: 1200,
            bundleSize: 245000,
            loadTime: 850
          }
        }
      ];

      setGenerationJobs(mockJobs);
      setRouteGenerations(mockRoutes);
      setIsLoading(false);
    };

    loadGenerationData();

    // Simulate real-time updates for running jobs
    const interval = setInterval(() => {
      setGenerationJobs(prev => prev.map(job => {
        if (job.status === "generating" && job.progress < 100) {
          const newProgress = Math.min(job.progress + Math.random() * 5, 100);
          if (newProgress >= 100) {
            return {
              ...job,
              status: "completed" as const,
              progress: 100,
              completedAt: new Date(),
              generatedUrl: `https://${job.clientName.toLowerCase().replace(/\s+/g, '')}.app.example.com`
            };
          }
          return { ...job, progress: newProgress };
        }
        return job;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'generating': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deploying': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'queued': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500 animate-pulse';
      case 'pending': return 'bg-gray-300';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.round(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.round(diffMins / 60);
    return `${diffHours}h ago`;
  };

  const filteredJobs = generationJobs.filter(job => {
    switch (activeTab) {
      case 'active': return ['generating', 'deploying', 'queued'].includes(job.status);
      case 'completed': return job.status === 'completed';
      case 'failed': return job.status === 'failed';
      default: return true;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black/60">Loading dynamic generation interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-wide uppercase text-black">
                Dynamic Page Generation
              </h1>
              <p className="text-black/60 mt-2">
                Real-time client app generation with route management and component injection
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex gap-3">
              <Link href="/template-engine">
                <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                  ← Dashboard
                </Button>
              </Link>
              <Link href="/template-engine/components">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                  Component Mapping
                </Button>
              </Link>
              <Button className="bg-black text-white hover:bg-gray-800">
                New Generation
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Generation Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="border-2 border-green-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {generationJobs.filter(j => j.status === 'completed').length}
              </div>
              <Badge variant="outline" className="mt-1 text-xs border-green-300 text-green-600">Total</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {generationJobs.filter(j => ['generating', 'deploying'].includes(j.status)).length}
              </div>
              <Badge variant="outline" className="mt-1 text-xs border-blue-300 text-blue-600">Running</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Queued</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {generationJobs.filter(j => j.status === 'queued').length}
              </div>
              <Badge variant="outline" className="mt-1 text-xs border-yellow-300 text-yellow-600">Waiting</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">Avg Generation Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatDuration(
                  generationJobs
                    .filter(j => j.status === 'completed')
                    .reduce((sum, j) => sum + j.performance.totalTime, 0) /
                  Math.max(generationJobs.filter(j => j.status === 'completed').length, 1)
                )}
              </div>
              <Badge variant="outline" className="mt-1 text-xs border-purple-300 text-purple-600">Performance</Badge>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generation Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active">Active ({generationJobs.filter(j => ['generating', 'deploying', 'queued'].includes(j.status)).length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({generationJobs.filter(j => j.status === 'completed').length})</TabsTrigger>
              <TabsTrigger value="failed">Failed ({generationJobs.filter(j => j.status === 'failed').length})</TabsTrigger>
              <TabsTrigger value="routes">Route Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              <div className="space-y-4">
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`cursor-pointer transition-all duration-300 ${selectedJob === job.id ? 'scale-102' : 'hover:scale-102'}`}
                    onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                  >
                    <Card className={`border-2 border-black/30 hover:border-black/50 ${selectedJob === job.id ? 'ring-2 ring-black/20 border-black' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{job.clientName}</CardTitle>
                            <CardDescription className="mt-1">
                              {job.templateName} • Started {formatTimeAgo(job.startedAt)}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge className={`${getStatusColor(job.status)} text-xs`}>
                              {job.status}
                            </Badge>
                            <div className="text-right">
                              <div className="text-sm font-medium">{job.progress}%</div>
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 transition-all duration-500"
                                  style={{ width: `${job.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {/* Generation Steps */}
                        <div className="flex items-center gap-2 mb-4">
                          {job.steps.map((step, stepIndex) => (
                            <div key={step.id} className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${getStepStatusColor(step.status)}`}
                                title={step.name}
                              />
                              {stepIndex < job.steps.length - 1 && (
                                <div className="w-4 h-px bg-gray-300" />
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="text-sm text-black/70 mb-3">
                          Current: {job.steps.find(s => s.status === 'running')?.name ||
                                   job.steps.filter(s => s.status === 'completed').length === job.steps.length
                                   ? 'Completed' : 'Initializing...'}
                        </div>

                        {selectedJob === job.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3 border-t pt-3"
                          >
                            <div className="space-y-2">
                              {job.steps.map((step) => (
                                <div key={step.id} className="flex items-center justify-between p-2 rounded border border-black/10">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${getStepStatusColor(step.status)}`} />
                                    <div>
                                      <div className="text-sm font-medium">{step.name}</div>
                                      <div className="text-xs text-black/60">{step.details}</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-black/60">
                                    {step.duration ? formatDuration(step.duration) : step.status === 'running' ? 'Running...' : ''}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {job.generatedUrl && (
                              <div className="pt-2">
                                <div className="text-sm font-medium mb-1">Generated App:</div>
                                <a
                                  href={job.generatedUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                                >
                                  {job.generatedUrl}
                                </a>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <div className="space-y-4">
                {generationJobs.filter(j => j.status === 'completed').map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card className="border-2 border-green-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg text-green-800">{job.clientName}</CardTitle>
                            <CardDescription className="mt-1">
                              {job.templateName} • Completed {job.completedAt ? formatTimeAgo(job.completedAt) : 'Recently'}
                            </CardDescription>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Deployed</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-black/60">Total Time</div>
                            <div className="font-medium">{formatDuration(job.performance.totalTime)}</div>
                          </div>
                          <div>
                            <div className="text-black/60">Route Gen</div>
                            <div className="font-medium">{formatDuration(job.performance.routeGenerationTime)}</div>
                          </div>
                          <div>
                            <div className="text-black/60">Component Injection</div>
                            <div className="font-medium">{formatDuration(job.performance.componentInjectionTime)}</div>
                          </div>
                          <div>
                            <div className="text-black/60">Deployment</div>
                            <div className="font-medium">{formatDuration(job.performance.deploymentTime)}</div>
                          </div>
                        </div>

                        {job.generatedUrl && (
                          <div className="mt-4 pt-3 border-t">
                            <a
                              href={job.generatedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 text-sm underline font-medium"
                            >
                              View Generated App →
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="failed" className="mt-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-black mb-2">No Failed Generations</h3>
                <p className="text-black/60">All generation jobs have completed successfully</p>
              </div>
            </TabsContent>

            <TabsContent value="routes" className="mt-6">
              <div className="space-y-6">
                {routeGenerations.map((route, index) => (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card className="border-2 border-black/30">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Route: {route.route}</span>
                          <Badge variant="outline">{route.templateId}</Badge>
                        </CardTitle>
                        <CardDescription>
                          Generated {formatTimeAgo(route.generatedAt)} • {route.components.length} components • {route.variables.length} variables
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <div className="text-sm font-medium mb-3">Component Mappings</div>
                            <div className="space-y-2">
                              {route.components.map((comp, i) => (
                                <div key={i} className="p-2 rounded border border-black/20">
                                  <div className="font-mono text-sm">{comp.componentId}</div>
                                  <div className="text-xs text-black/60 mt-1">
                                    {comp.templatePath} → {comp.generatedPath}
                                  </div>
                                  <div className="text-xs text-purple-600 mt-1">
                                    Injection: {comp.injectionMethod}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-3">Performance Metrics</div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-black/60">Compilation Time:</span>
                                <span>{formatDuration(route.performance.compilationTime)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-black/60">Bundle Size:</span>
                                <span>{(route.performance.bundleSize / 1024).toFixed(1)} KB</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-black/60">Load Time:</span>
                                <span>{route.performance.loadTime}ms</span>
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="text-sm font-medium mb-2">Variable Mappings</div>
                              <div className="space-y-1">
                                {route.variables.slice(0, 3).map((variable, i) => (
                                  <div key={i} className="text-xs">
                                    <span className="font-mono">{variable.variable}</span>
                                    <span className="text-black/60 mx-1">→</span>
                                    <span className="text-blue-600">{JSON.stringify(variable.resolvedValue)}</span>
                                  </div>
                                ))}
                                {route.variables.length > 3 && (
                                  <div className="text-xs text-black/60">+{route.variables.length - 3} more variables</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}