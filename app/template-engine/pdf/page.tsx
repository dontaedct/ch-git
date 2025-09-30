/**
 * @fileoverview PDF Generation Interface
 * Advanced PDF generation system for consultation reports
 * HT-029.3.2 Implementation
 */
"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  FileText,
  Settings,
  Eye,
  Palette,
  Layout,
  Database,
  Upload,
  Save,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Printer,
  Mail,
  Share2,
  Archive,
  Clock,
  User,
  Building,
  BarChart3,
  Target,
  Zap,
  Shield,
  Globe,
  Code2,
  Copy
} from "lucide-react";

interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  category: 'consultation' | 'assessment' | 'report' | 'proposal';
  sections: PDFSection[];
  styling: PDFStyling;
  settings: PDFSettings;
  variables: Record<string, any>;
}

interface PDFSection {
  id: string;
  type: 'cover' | 'executive_summary' | 'assessment' | 'recommendations' | 'charts' | 'appendix' | 'contact';
  title: string;
  enabled: boolean;
  order: number;
  content: {
    template: string;
    variables: string[];
    charts?: ChartConfig[];
  };
  formatting: {
    pageBreak: boolean;
    margins: [number, number, number, number];
    columns: number;
  };
}

interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'radar' | 'scatter';
  title: string;
  dataSource: string;
  styling: {
    colors: string[];
    showLegend: boolean;
    showGrid: boolean;
  };
}

interface PDFStyling {
  theme: 'professional' | 'modern' | 'minimal' | 'corporate';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  fonts: {
    heading: string;
    body: string;
    size: {
      h1: number;
      h2: number;
      h3: number;
      body: number;
      caption: number;
    };
  };
  layout: {
    pageSize: 'A4' | 'Letter' | 'Legal';
    orientation: 'portrait' | 'landscape';
    margins: [number, number, number, number];
    columns: number;
    spacing: number;
  };
  branding: {
    logo?: string;
    watermark?: string;
    footer: string;
    header: string;
  };
}

interface PDFSettings {
  quality: 'draft' | 'standard' | 'high';
  compression: boolean;
  password?: string;
  permissions: {
    print: boolean;
    copy: boolean;
    edit: boolean;
    annotate: boolean;
  };
  metadata: {
    title: string;
    author: string;
    subject: string;
    keywords: string[];
  };
  delivery: {
    autoEmail: boolean;
    emailTemplate?: string;
    webhook?: string;
    storage: 'local' | 'cloud' | 'both';
  };
}

interface GenerationProgress {
  step: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message: string;
}

export default function PDFGenerationInterface() {
  const [activeTemplate, setActiveTemplate] = useState<PDFTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentTab, setCurrentTab] = useState("templates");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [templates] = useState<PDFTemplate[]>([
    {
      id: 'consultation-report',
      name: 'Business Consultation Report',
      description: 'Comprehensive consultation report with SWOT analysis and recommendations',
      category: 'consultation',
      sections: [
        {
          id: 'cover',
          type: 'cover',
          title: 'Cover Page',
          enabled: true,
          order: 1,
          content: {
            template: 'cover-consultation',
            variables: ['clientName', 'companyName', 'consultantName', 'date', 'logo']
          },
          formatting: {
            pageBreak: true,
            margins: [0, 0, 0, 0],
            columns: 1
          }
        },
        {
          id: 'executive-summary',
          type: 'executive_summary',
          title: 'Executive Summary',
          enabled: true,
          order: 2,
          content: {
            template: 'executive-summary-consultation',
            variables: ['businessScore', 'keyFindings', 'recommendationSummary', 'expectedROI']
          },
          formatting: {
            pageBreak: true,
            margins: [20, 20, 20, 20],
            columns: 1
          }
        },
        {
          id: 'business-assessment',
          type: 'assessment',
          title: 'Business Assessment',
          enabled: true,
          order: 3,
          content: {
            template: 'swot-analysis',
            variables: ['strengths', 'weaknesses', 'opportunities', 'threats', 'assessmentScore'],
            charts: [
              {
                id: 'business-score-chart',
                type: 'radar',
                title: 'Business Performance Radar',
                dataSource: 'assessmentMetrics',
                styling: {
                  colors: ['#3B82F6', '#10B981', '#F59E0B'],
                  showLegend: true,
                  showGrid: true
                }
              }
            ]
          },
          formatting: {
            pageBreak: true,
            margins: [20, 20, 20, 20],
            columns: 1
          }
        },
        {
          id: 'recommendations',
          type: 'recommendations',
          title: 'Strategic Recommendations',
          enabled: true,
          order: 4,
          content: {
            template: 'recommendations-detailed',
            variables: ['recommendations', 'timeline', 'budget', 'expectedOutcomes'],
            charts: [
              {
                id: 'roi-projection',
                type: 'line',
                title: 'ROI Projection Over Time',
                dataSource: 'roiData',
                styling: {
                  colors: ['#059669', '#DC2626'],
                  showLegend: true,
                  showGrid: true
                }
              }
            ]
          },
          formatting: {
            pageBreak: true,
            margins: [20, 20, 20, 20],
            columns: 1
          }
        },
        {
          id: 'implementation-roadmap',
          type: 'charts',
          title: 'Implementation Roadmap',
          enabled: true,
          order: 5,
          content: {
            template: 'gantt-timeline',
            variables: ['milestones', 'timeline', 'dependencies', 'resources'],
            charts: [
              {
                id: 'implementation-timeline',
                type: 'bar',
                title: 'Implementation Timeline',
                dataSource: 'timelineData',
                styling: {
                  colors: ['#6366F1', '#8B5CF6'],
                  showLegend: false,
                  showGrid: true
                }
              }
            ]
          },
          formatting: {
            pageBreak: true,
            margins: [20, 20, 20, 20],
            columns: 1
          }
        },
        {
          id: 'next-steps',
          type: 'contact',
          title: 'Next Steps & Contact',
          enabled: true,
          order: 6,
          content: {
            template: 'next-steps-contact',
            variables: ['nextSteps', 'contactInfo', 'schedulingLink', 'disclaimer']
          },
          formatting: {
            pageBreak: false,
            margins: [20, 20, 20, 20],
            columns: 1
          }
        }
      ],
      styling: {
        theme: 'professional',
        colors: {
          primary: '#3B82F6',
          secondary: '#1E40AF',
          accent: '#F59E0B',
          text: '#1F2937',
          background: '#FFFFFF'
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter',
          size: {
            h1: 24,
            h2: 20,
            h3: 16,
            body: 12,
            caption: 10
          }
        },
        layout: {
          pageSize: 'A4',
          orientation: 'portrait',
          margins: [20, 20, 20, 20],
          columns: 1,
          spacing: 12
        },
        branding: {
          footer: '© 2025 Your Business Solutions - Confidential',
          header: 'Business Consultation Report'
        }
      },
      settings: {
        quality: 'high',
        compression: true,
        permissions: {
          print: true,
          copy: false,
          edit: false,
          annotate: true
        },
        metadata: {
          title: 'Business Consultation Report',
          author: 'Your Business Solutions',
          subject: 'Consultation Analysis and Recommendations',
          keywords: ['business', 'consultation', 'analysis', 'recommendations']
        },
        delivery: {
          autoEmail: true,
          storage: 'both'
        }
      },
      variables: {
        clientName: 'Sarah Johnson',
        companyName: 'TechStart Solutions',
        consultantName: 'Business Solutions Team',
        businessScore: 72,
        expectedROI: '300-500%'
      }
    }
  ]);

  const generationSteps = [
    { step: 'Data Processing', message: 'Processing questionnaire responses...' },
    { step: 'Template Compilation', message: 'Compiling PDF template...' },
    { step: 'Chart Generation', message: 'Generating charts and visualizations...' },
    { step: 'Content Assembly', message: 'Assembling document sections...' },
    { step: 'PDF Rendering', message: 'Rendering final PDF document...' },
    { step: 'Quality Check', message: 'Performing quality validation...' },
    { step: 'Delivery Setup', message: 'Preparing for delivery...' }
  ];

  useEffect(() => {
    if (templates.length > 0) {
      setActiveTemplate(templates[0]);
    }
  }, [templates]);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setGenerationProgress([]);

    for (let i = 0; i < generationSteps.length; i++) {
      const step = generationSteps[i];

      // Add step to progress
      setGenerationProgress(prev => [
        ...prev,
        { ...step, progress: 0, status: 'processing' }
      ]);

      // Simulate step progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setGenerationProgress(prev =>
          prev.map((p, index) =>
            index === i
              ? { ...p, progress, status: progress === 100 ? 'completed' : 'processing' }
              : p
          )
        );
      }
    }

    // Simulate PDF download
    await new Promise(resolve => setTimeout(resolve, 500));

    const blob = new Blob(['Sample PDF content'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultation-report-${activeTemplate?.variables.companyName?.toLowerCase().replace(/\s+/g, '-') || 'client'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsGenerating(false);
  };

  const handlePreviewPDF = () => {
    setPreviewMode(true);
  };

  const themes = [
    { id: 'professional', name: 'Professional', colors: ['#3B82F6', '#1E40AF', '#F8FAFC'] },
    { id: 'modern', name: 'Modern', colors: ['#6366F1', '#8B5CF6', '#F9FAFB'] },
    { id: 'minimal', name: 'Minimal', colors: ['#374151', '#6B7280', '#FFFFFF'] },
    { id: 'corporate', name: 'Corporate', colors: ['#1F2937', '#059669', '#F3F4F6'] }
  ];

  const renderProgressStep = (step: GenerationProgress, index: number) => {
    const getStatusIcon = () => {
      switch (step.status) {
        case 'completed':
          return <CheckCircle2 className="h-5 w-5 text-green-600" />;
        case 'processing':
          return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
        case 'error':
          return <AlertCircle className="h-5 w-5 text-red-600" />;
        default:
          return <Clock className="h-5 w-5 text-gray-400" />;
      }
    };

    return (
      <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
        {getStatusIcon()}
        <div className="flex-1">
          <p className="font-medium text-gray-900">{step.step}</p>
          <p className="text-sm text-gray-600">{step.message}</p>
          {step.status === 'processing' && (
            <Progress value={step.progress} className="mt-2" />
          )}
        </div>
      </div>
    );
  };

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">PDF Preview</h1>
            <div className="space-x-4">
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                Exit Preview
              </Button>
              <Button onClick={handleGeneratePDF}>
                <Download className="h-4 w-4 mr-2" />
                Generate PDF
              </Button>
            </div>
          </div>

          {/* PDF Preview Canvas */}
          <Card>
            <CardContent className="p-8">
              <div className="bg-white shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
                {/* Cover Page Preview */}
                <div className="p-8 text-center border-b">
                  <div className="mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <Building className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Business Consultation Report
                  </h1>
                  <p className="text-lg text-gray-600 mb-8">
                    Prepared for {activeTemplate?.variables.companyName}
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>Consultant: {activeTemplate?.variables.consultantName}</p>
                    <p>Date: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Executive Summary Preview */}
                <div className="p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Executive Summary</h2>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {activeTemplate?.variables.businessScore}
                      </div>
                      <p className="text-sm text-gray-600">Overall Score</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {activeTemplate?.variables.expectedROI}
                      </div>
                      <p className="text-sm text-gray-600">Expected ROI</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">4-6</div>
                      <p className="text-sm text-gray-600">Weeks to Results</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Based on our comprehensive analysis, your business demonstrates strong potential
                    for growth through targeted optimization strategies...
                  </p>
                </div>

                {/* Chart Preview */}
                <div className="p-8 border-t">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Business Assessment</h2>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Performance Radar Chart</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PDF Generation Interface</h1>
              <p className="text-gray-600 mt-1">
                Create professional consultation reports from questionnaire data
              </p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={handlePreviewPDF}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleGeneratePDF} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
              <Link href="/template-engine/mvp/questionnaire">
                <Button variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Test Pipeline
                </Button>
              </Link>
              <Link href="/template-engine">
                <Button variant="outline">Back to Engine</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Generation Progress */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Generating PDF Report</span>
                </CardTitle>
                <CardDescription>
                  Processing questionnaire data and generating your consultation report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generationProgress.map((step, index) => renderProgressStep(step, index))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="styling">Styling</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>PDF Templates</CardTitle>
                    <CardDescription>
                      Choose a template for your consultation reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            activeTemplate?.id === template.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setActiveTemplate(template)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                              <div className="flex items-center space-x-4">
                                <Badge variant="outline">{template.category}</Badge>
                                <span className="text-sm text-gray-500">
                                  {template.sections.filter(s => s.enabled).length} sections
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Template Sections</CardTitle>
                    <CardDescription>
                      Configure which sections to include
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activeTemplate?.sections.map((section) => (
                        <div key={section.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{section.title}</p>
                            <p className="text-sm text-gray-600">
                              {section.content.variables.length} variables
                            </p>
                          </div>
                          <Switch checked={section.enabled} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Template
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Save className="h-4 w-4 mr-2" />
                      Save Template
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Mapping</CardTitle>
                  <CardDescription>
                    Map questionnaire responses to PDF content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Client Information</span>
                        <Badge className="bg-green-100 text-green-800">Mapped</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Name, Email, Company → Contact section
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Business Assessment</span>
                        <Badge className="bg-green-100 text-green-800">Mapped</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Stage, Revenue, Size → Assessment charts
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Goals & Challenges</span>
                        <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Primary goal mapped, challenges need mapping
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Variable Preview</CardTitle>
                  <CardDescription>
                    Preview how questionnaire data will appear
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">Client Name</span>
                      <span className="text-sm text-gray-600">{activeTemplate?.variables.clientName}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">Company</span>
                      <span className="text-sm text-gray-600">{activeTemplate?.variables.companyName}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">Business Score</span>
                      <span className="text-sm text-gray-600">{activeTemplate?.variables.businessScore}/100</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">Expected ROI</span>
                      <span className="text-sm text-gray-600">{activeTemplate?.variables.expectedROI}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="styling" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theme Selection</CardTitle>
                  <CardDescription>
                    Choose a visual theme for your PDF reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {themes.map((theme) => (
                      <div
                        key={theme.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          activeTemplate?.styling.theme === theme.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          if (activeTemplate) {
                            setActiveTemplate({
                              ...activeTemplate,
                              styling: { ...activeTemplate.styling, theme: theme.id as any }
                            });
                          }
                        }}
                      >
                        <div className="flex space-x-2 mb-2">
                          {theme.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="font-medium">{theme.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Layout Settings</CardTitle>
                  <CardDescription>
                    Configure page layout and formatting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Page Size</label>
                    <select
                      value={activeTemplate?.styling.layout.pageSize}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="A4">A4</option>
                      <option value="Letter">Letter</option>
                      <option value="Legal">Legal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Orientation</label>
                    <select
                      value={activeTemplate?.styling.layout.orientation}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <label className="text-sm font-medium">Include Header/Footer</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <label className="text-sm font-medium">Show Page Numbers</label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>PDF Settings</CardTitle>
                  <CardDescription>
                    Configure PDF generation options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quality</label>
                    <select
                      value={activeTemplate?.settings.quality}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="standard">Standard</option>
                      <option value="high">High Quality</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={activeTemplate?.settings.compression} />
                    <label className="text-sm font-medium">Enable Compression</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={activeTemplate?.settings.permissions.print} />
                    <label className="text-sm font-medium">Allow Printing</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={!activeTemplate?.settings.permissions.copy} />
                    <label className="text-sm font-medium">Prevent Copying</label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Options</CardTitle>
                  <CardDescription>
                    Configure how PDFs are delivered to clients
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch checked={activeTemplate?.settings.delivery.autoEmail} />
                    <label className="text-sm font-medium">Auto-send via Email</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Storage Location</label>
                    <select
                      value={activeTemplate?.settings.delivery.storage}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="local">Local Storage</option>
                      <option value="cloud">Cloud Storage</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Webhook URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://your-webhook-url.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Integration Status</CardTitle>
                <CardDescription>
                  PDF generation system integration status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Questionnaire Integration</p>
                        <p className="text-sm text-green-700">Connected</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Template System</p>
                        <p className="text-sm text-green-700">Ready</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">PDF Pipeline</p>
                        <p className="text-sm text-blue-700">Operational</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}