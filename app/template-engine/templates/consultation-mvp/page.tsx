/**
 * @fileoverview MVP Template Specification Interface
 * Detailed specification for consultation workflow template
 * HT-029.1.2 Implementation
 */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
  description: string;
  validation?: string;
}

interface TemplateSection {
  id: string;
  name: string;
  type: 'landing' | 'questionnaire' | 'analysis' | 'pdf' | 'follow-up';
  description: string;
  variables: string[];
  components: string[];
  workflow: string[];
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'page' | 'process' | 'integration' | 'output';
  description: string;
  dependencies: string[];
  estimatedTime: string;
  automation: boolean;
  userInput: boolean;
}

export default function ConsultationMVPPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const templateSpec = {
    id: "consultation-mvp",
    name: "Consultation MVP Template",
    version: "2.1.0",
    description: "Complete consultation workflow template enabling rapid deployment of client consultation micro-apps",
    status: "active",
    lastModified: "2024-01-15T10:30:00Z",
    performance: {
      generationTime: "1.8 minutes",
      successRate: "97.2%",
      avgRating: 4.8,
      usageCount: 145
    }
  };

  const workflowSteps: WorkflowStep[] = [
    {
      id: "landing-page",
      name: "Landing Page",
      type: "page",
      description: "Professional landing page with value proposition and consultation CTA",
      dependencies: [],
      estimatedTime: "30s generation",
      automation: true,
      userInput: false
    },
    {
      id: "questionnaire-flow",
      name: "Questionnaire Flow",
      type: "page",
      description: "Multi-step questionnaire with conditional logic and progress tracking",
      dependencies: ["landing-page"],
      estimatedTime: "5-15 min user time",
      automation: false,
      userInput: true
    },
    {
      id: "ai-analysis",
      name: "AI Analysis Engine",
      type: "process",
      description: "AI-powered analysis of questionnaire responses with recommendations",
      dependencies: ["questionnaire-flow"],
      estimatedTime: "45s processing",
      automation: true,
      userInput: false
    },
    {
      id: "pdf-generation",
      name: "PDF Report Generation",
      type: "output",
      description: "Professional consultation report with insights and recommendations",
      dependencies: ["ai-analysis"],
      estimatedTime: "30s generation",
      automation: true,
      userInput: false
    },
    {
      id: "follow-up-automation",
      name: "Follow-up Automation",
      type: "integration",
      description: "Automated email sequence with scheduling and next steps",
      dependencies: ["pdf-generation"],
      estimatedTime: "Immediate",
      automation: true,
      userInput: false
    }
  ];

  const templateSections: TemplateSection[] = [
    {
      id: "landing",
      name: "Landing Page Section",
      type: "landing",
      description: "Hero section with value proposition, benefits overview, and consultation CTA",
      variables: ["companyName", "serviceDescription", "ctaText", "heroImage"],
      components: ["Hero", "Benefits", "Testimonials", "CTA"],
      workflow: ["Load Page", "Track Visitor", "Display CTA", "Capture Lead"]
    },
    {
      id: "questionnaire",
      name: "Questionnaire Flow",
      type: "questionnaire",
      description: "Multi-step business analysis questionnaire with conditional logic",
      variables: ["businessProfile", "challenges", "goals", "technicalContext", "projectScope"],
      components: ["ProgressBar", "QuestionCard", "ValidationEngine", "ConditionalLogic"],
      workflow: ["Start Assessment", "Progress Tracking", "Validate Inputs", "Save Progress", "Complete"]
    },
    {
      id: "analysis",
      name: "AI Analysis Engine",
      type: "analysis",
      description: "AI-powered analysis of responses with intelligent recommendations",
      variables: ["analysisPrompt", "recommendationLogic", "scoringMatrix", "industryBenchmarks"],
      components: ["AIProcessor", "ScoreCalculator", "RecommendationEngine", "InsightGenerator"],
      workflow: ["Process Responses", "Calculate Scores", "Generate Insights", "Create Recommendations"]
    },
    {
      id: "pdf",
      name: "PDF Report Generation",
      type: "pdf",
      description: "Professional consultation report with branding and recommendations",
      variables: ["reportTemplate", "chartData", "recommendations", "nextSteps", "branding"],
      components: ["PDFEngine", "ChartGenerator", "BrandingApplier", "ReportComposer"],
      workflow: ["Compile Data", "Generate Charts", "Apply Branding", "Compose PDF", "Deliver Report"]
    },
    {
      id: "follow-up",
      name: "Follow-up Automation",
      type: "follow-up",
      description: "Automated email sequences and calendar integration for next steps",
      variables: ["emailTemplates", "calendarSettings", "followUpSchedule", "crmIntegration"],
      components: ["EmailEngine", "CalendarIntegration", "CRMSync", "AutomationTriggers"],
      workflow: ["Send Report", "Schedule Follow-up", "Sync CRM", "Track Engagement"]
    }
  ];

  const templateVariables: TemplateVariable[] = [
    { name: "companyName", type: "text", required: true, description: "Client company name for branding", validation: "min:2,max:100" },
    { name: "serviceDescription", type: "text", required: true, description: "Description of consultation services offered", validation: "min:10,max:500" },
    { name: "ctaText", type: "text", required: false, defaultValue: "Get Your Free Analysis", description: "Call-to-action button text" },
    { name: "heroImage", type: "text", required: false, description: "URL for hero section background image" },
    { name: "businessProfile", type: "object", required: true, description: "Complete business profile data from questionnaire" },
    { name: "challenges", type: "array", required: true, description: "List of business challenges identified" },
    { name: "goals", type: "array", required: true, description: "Business goals and objectives" },
    { name: "technicalContext", type: "object", required: false, description: "Technical requirements and current systems" },
    { name: "projectScope", type: "object", required: true, description: "Project parameters including budget and timeline" },
    { name: "analysisPrompt", type: "text", required: true, description: "AI analysis prompt template" },
    { name: "recommendationLogic", type: "object", required: true, description: "Logic for generating recommendations" },
    { name: "scoringMatrix", type: "object", required: true, description: "Scoring system for business assessment" },
    { name: "industryBenchmarks", type: "object", required: false, description: "Industry-specific benchmarks for comparison" },
    { name: "reportTemplate", type: "text", required: true, description: "PDF report template layout" },
    { name: "chartData", type: "object", required: true, description: "Data for generating charts and visualizations" },
    { name: "recommendations", type: "array", required: true, description: "AI-generated recommendations list" },
    { name: "nextSteps", type: "array", required: true, description: "Recommended next steps for client" },
    { name: "branding", type: "object", required: true, description: "Client branding configuration" },
    { name: "emailTemplates", type: "object", required: true, description: "Email template collection" },
    { name: "calendarSettings", type: "object", required: false, description: "Calendar integration settings" },
    { name: "followUpSchedule", type: "object", required: true, description: "Automated follow-up schedule" },
    { name: "crmIntegration", type: "object", required: false, description: "CRM integration configuration" }
  ];

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'page': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'process': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'integration': return 'bg-green-100 text-green-800 border-green-200';
      case 'output': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSectionTypeColor = (type: string) => {
    switch (type) {
      case 'landing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'questionnaire': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'analysis': return 'bg-green-100 text-green-800 border-green-200';
      case 'pdf': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'follow-up': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVariableTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-50 text-blue-700';
      case 'number': return 'bg-green-50 text-green-700';
      case 'date': return 'bg-purple-50 text-purple-700';
      case 'boolean': return 'bg-yellow-50 text-yellow-700';
      case 'array': return 'bg-orange-50 text-orange-700';
      case 'object': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

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
                {templateSpec.name}
              </h1>
              <p className="text-black/60 mt-2">
                {templateSpec.description} • Version {templateSpec.version}
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex gap-3">
              <Link href="/template-engine/templates">
                <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                  ← Templates
                </Button>
              </Link>
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                Clone Template
              </Button>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                Deploy Instance
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Performance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="border-2 border-green-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Generation Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{templateSpec.performance.generationTime}</div>
              <Badge variant="outline" className="mt-1 text-xs border-green-300 text-green-600">Optimized</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{templateSpec.performance.successRate}</div>
              <Badge variant="outline" className="mt-1 text-xs border-blue-300 text-blue-600">Reliable</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">User Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">⭐ {templateSpec.performance.avgRating}</div>
              <Badge variant="outline" className="mt-1 text-xs border-purple-300 text-purple-600">Excellent</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Usage Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{templateSpec.performance.usageCount}</div>
              <Badge variant="outline" className="mt-1 text-xs border-orange-300 text-orange-600">Popular</Badge>
            </CardContent>
          </Card>
        </motion.div>

        {/* Template Specification Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Workflow Overview</TabsTrigger>
              <TabsTrigger value="sections">Template Sections</TabsTrigger>
              <TabsTrigger value="variables">Data Schema</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="deployment">Deployment</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card className="border-2 border-black/30">
                <CardHeader>
                  <CardTitle>Consultation Workflow Steps</CardTitle>
                  <CardDescription>End-to-end workflow from landing page to follow-up automation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workflowSteps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between p-4 rounded-lg border border-black/20"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-black">{step.name}</div>
                            <div className="text-sm text-black/60">{step.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`${getStepTypeColor(step.type)} text-xs`}>
                            {step.type}
                          </Badge>
                          <div className="text-sm text-black/60">{step.estimatedTime}</div>
                          <div className="flex gap-1">
                            {step.automation && (
                              <Badge variant="outline" className="text-xs border-green-300 text-green-600">Auto</Badge>
                            )}
                            {step.userInput && (
                              <Badge variant="outline" className="text-xs border-blue-300 text-blue-600">User</Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sections" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {templateSections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`cursor-pointer transition-all duration-300 ${selectedSection === section.id ? 'scale-105' : 'hover:scale-102'}`}
                    onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                  >
                    <Card className={`border-2 border-black/30 hover:border-black/50 ${selectedSection === section.id ? 'ring-2 ring-black/20 border-black' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{section.name}</CardTitle>
                            <CardDescription className="mt-1">{section.description}</CardDescription>
                          </div>
                          <Badge className={`${getSectionTypeColor(section.type)} text-xs`}>
                            {section.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs font-medium text-black/60 mb-1">Components ({section.components.length})</div>
                            <div className="flex flex-wrap gap-1">
                              {section.components.map((component, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">
                                  {component}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-black/60 mb-1">Variables ({section.variables.length})</div>
                            <div className="flex flex-wrap gap-1">
                              {section.variables.slice(0, 3).map((variable, i) => (
                                <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded border border-purple-200">
                                  {variable}
                                </span>
                              ))}
                              {section.variables.length > 3 && (
                                <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded border border-gray-200">
                                  +{section.variables.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          {selectedSection === section.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="border-t pt-3"
                            >
                              <div className="text-xs font-medium text-black/60 mb-1">Workflow Steps</div>
                              <div className="space-y-1">
                                {section.workflow.map((step, i) => (
                                  <div key={i} className="text-xs text-black/70 flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-xs font-bold text-black/60">
                                      {i + 1}
                                    </span>
                                    {step}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="variables" className="mt-6">
              <Card className="border-2 border-black/30">
                <CardHeader>
                  <CardTitle>Template Data Schema</CardTitle>
                  <CardDescription>Complete variable specification and data requirements ({templateVariables.length} variables)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {templateVariables.map((variable, index) => (
                      <motion.div
                        key={variable.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="flex items-center justify-between p-3 rounded-lg border border-black/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="font-mono text-sm font-medium text-black">{variable.name}</div>
                          <Badge className={`${getVariableTypeColor(variable.type)} text-xs`}>
                            {variable.type}
                          </Badge>
                          {variable.required && (
                            <Badge variant="outline" className="text-xs border-red-300 text-red-600">Required</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-black/70">{variable.description}</div>
                          {variable.validation && (
                            <div className="text-xs text-black/50 font-mono">{variable.validation}</div>
                          )}
                          {variable.defaultValue && (
                            <div className="text-xs text-green-600">Default: {JSON.stringify(variable.defaultValue)}</div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configuration" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-black/30">
                  <CardHeader>
                    <CardTitle>Template Configuration</CardTitle>
                    <CardDescription>Core template settings and behavior</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-black mb-2">Template Metadata</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-black/60">Template ID:</span>
                            <span className="font-mono">{templateSpec.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black/60">Version:</span>
                            <span>{templateSpec.version}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black/60">Status:</span>
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">{templateSpec.status}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black/60">Last Modified:</span>
                            <span>{new Date(templateSpec.lastModified).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-black mb-2">Performance Targets</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-black/60">Target Generation Time:</span>
                            <span>&lt; 2 minutes</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black/60">Min Success Rate:</span>
                            <span>&gt; 95%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black/60">Template Loading:</span>
                            <span>&lt; 5 seconds</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black/60">Component Injection:</span>
                            <span>&lt; 10 seconds</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-black/30">
                  <CardHeader>
                    <CardTitle>Integration Settings</CardTitle>
                    <CardDescription>External service integrations and APIs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-black mb-2">Required Integrations</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 rounded bg-blue-50 border border-blue-200">
                            <span className="text-blue-800 text-sm">AI Analysis Engine</span>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">Required</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded bg-green-50 border border-green-200">
                            <span className="text-green-800 text-sm">PDF Generation Service</span>
                            <Badge className="bg-green-100 text-green-800 text-xs">Required</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded bg-purple-50 border border-purple-200">
                            <span className="text-purple-800 text-sm">Email Automation</span>
                            <Badge className="bg-purple-100 text-purple-800 text-xs">Required</Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-black mb-2">Optional Integrations</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-200">
                            <span className="text-gray-800 text-sm">CRM Integration</span>
                            <Badge variant="outline" className="text-xs">Optional</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-200">
                            <span className="text-gray-800 text-sm">Calendar Scheduling</span>
                            <Badge variant="outline" className="text-xs">Optional</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-200">
                            <span className="text-gray-800 text-sm">Analytics Tracking</span>
                            <Badge variant="outline" className="text-xs">Optional</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="deployment" className="mt-6">
              <Card className="border-2 border-black/30">
                <CardHeader>
                  <CardTitle>Deployment Configuration</CardTitle>
                  <CardDescription>Template deployment settings and client app generation parameters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-black mb-3">Deployment Pipeline</div>
                        <div className="space-y-2">
                          {[
                            "Template Validation",
                            "Variable Substitution",
                            "Component Assembly",
                            "Route Generation",
                            "Asset Optimization",
                            "Build Process",
                            "Quality Assurance",
                            "Production Deployment"
                          ].map((step, index) => (
                            <div key={step} className="flex items-center gap-3 p-2 rounded border border-black/20">
                              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <span className="text-sm">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-black mb-3">Deployment Targets</div>
                        <div className="space-y-2">
                          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                            <div className="font-medium text-green-800 text-sm">Production Ready</div>
                            <div className="text-green-600 text-xs mt-1">Fully automated deployment pipeline</div>
                          </div>
                          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="font-medium text-blue-800 text-sm">≤ 7-day Delivery</div>
                            <div className="text-blue-600 text-xs mt-1">Complete client app in under one week</div>
                          </div>
                          <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                            <div className="font-medium text-purple-800 text-sm">Zero-Config Setup</div>
                            <div className="text-purple-600 text-xs mt-1">Minimal client configuration required</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-black mb-3">Quality Assurance</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-black/60">Template Compilation:</span>
                            <span className="text-green-600">✓ Automated</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black/60">Component Testing:</span>
                            <span className="text-green-600">✓ Automated</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black/60">Performance Testing:</span>
                            <span className="text-green-600">✓ Automated</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black/60">Security Validation:</span>
                            <span className="text-green-600">✓ Automated</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}