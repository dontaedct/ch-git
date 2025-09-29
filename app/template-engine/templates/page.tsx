/**
 * @fileoverview Template Management Interface
 * Comprehensive template management, creation, and configuration
 * HT-029.1.2 Implementation
 */
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TemplateSpec {
  id: string;
  name: string;
  type: 'consultation' | 'landing' | 'questionnaire' | 'document' | 'micro-app';
  status: 'active' | 'draft' | 'archived' | 'testing';
  version: string;
  description: string;
  workflow: string[];
  components: number;
  lastModified: Date;
  createdBy: string;
  usageCount: number;
  performance: {
    generationTime: number;
    successRate: number;
    avgRating: number;
  };
  features: string[];
  dataSchema: {
    variables: number;
    sections: number;
    layouts: number;
  };
}

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  count: number;
  icon: string;
  color: string;
}

export default function TemplateManagementPage() {
  const [templates, setTemplates] = useState<TemplateSpec[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const categories: TemplateCategory[] = [
    { id: "all", name: "All Templates", description: "View all available templates", count: 0, icon: "📋", color: "gray" },
    { id: "consultation", name: "Consultation", description: "Client consultation workflows", count: 0, icon: "💬", color: "blue" },
    { id: "landing", name: "Landing Pages", description: "Marketing and landing pages", count: 0, icon: "🚀", color: "green" },
    { id: "questionnaire", name: "Questionnaires", description: "Data collection forms", count: 0, icon: "❓", color: "purple" },
    { id: "document", name: "Documents", description: "PDF and document templates", count: 0, icon: "📄", color: "orange" },
    { id: "micro-app", name: "Micro Apps", description: "Complete application templates", count: 0, icon: "🔧", color: "red" }
  ];

  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockTemplates: TemplateSpec[] = [
        {
          id: "consultation-mvp",
          name: "Consultation MVP",
          type: "consultation",
          status: "active",
          version: "2.1.0",
          description: "Complete consultation workflow with landing page, questionnaire, and PDF generation",
          workflow: ["Landing Page", "Questionnaire Flow", "AI Analysis", "PDF Generation", "Follow-up"],
          components: 8,
          lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          createdBy: "Template Engine",
          usageCount: 145,
          performance: { generationTime: 1.8, successRate: 97.2, avgRating: 4.8 },
          features: ["AI Integration", "Multi-step Forms", "PDF Export", "Email Automation", "Analytics"],
          dataSchema: { variables: 24, sections: 6, layouts: 3 }
        },
        {
          id: "landing-basic",
          name: "Basic Landing Page",
          type: "landing",
          status: "active",
          version: "1.5.2",
          description: "Clean, responsive landing page template with lead capture",
          workflow: ["Hero Section", "Features", "CTA", "Contact Form"],
          components: 5,
          lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          createdBy: "Design Team",
          usageCount: 89,
          performance: { generationTime: 0.8, successRate: 99.1, avgRating: 4.6 },
          features: ["Responsive Design", "SEO Optimized", "Form Integration", "Analytics"],
          dataSchema: { variables: 12, sections: 4, layouts: 2 }
        },
        {
          id: "questionnaire-advanced",
          name: "Advanced Questionnaire",
          type: "questionnaire",
          status: "testing",
          version: "1.2.0",
          description: "Multi-step questionnaire with conditional logic and real-time validation",
          workflow: ["Progress Tracking", "Conditional Logic", "Real-time Validation", "Data Export"],
          components: 12,
          lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          createdBy: "Engineering Team",
          usageCount: 23,
          performance: { generationTime: 2.1, successRate: 94.8, avgRating: 4.3 },
          features: ["Conditional Logic", "Multi-format Export", "Real-time Validation", "Progress Save"],
          dataSchema: { variables: 18, sections: 8, layouts: 4 }
        },
        {
          id: "pdf-consultation",
          name: "PDF Consultation Report",
          type: "document",
          status: "active",
          version: "1.8.1",
          description: "Professional consultation report template with charts and recommendations",
          workflow: ["Data Analysis", "Chart Generation", "Recommendations", "PDF Export"],
          components: 6,
          lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          createdBy: "Content Team",
          usageCount: 167,
          performance: { generationTime: 3.2, successRate: 98.5, avgRating: 4.9 },
          features: ["Dynamic Charts", "AI Recommendations", "Professional Layout", "Branding"],
          dataSchema: { variables: 32, sections: 5, layouts: 2 }
        }
      ];

      setTemplates(mockTemplates);
      setIsLoading(false);
    };

    loadTemplates();
  }, []);

  // Update category counts
  const updatedCategories = categories.map(category => ({
    ...category,
    count: category.id === "all"
      ? templates.length
      : templates.filter(t => t.type === category.id).length
  }));

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === "all" || template.type === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'testing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'archived': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'landing': return 'bg-green-100 text-green-800 border-green-200';
      case 'questionnaire': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'document': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'micro-app': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (color: string) => {
    const colors = {
      gray: 'border-gray-300 hover:border-gray-400',
      blue: 'border-blue-300 hover:border-blue-400',
      green: 'border-green-300 hover:border-green-400',
      purple: 'border-purple-300 hover:border-purple-400',
      orange: 'border-orange-300 hover:border-orange-400',
      red: 'border-red-300 hover:border-red-400'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.round(diffDays / 7)} weeks ago`;
    return `${Math.round(diffDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black/60">Loading template management...</p>
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
                Template Management
              </h1>
              <p className="text-black/60 mt-2">
                Create, configure, and manage template specifications for rapid deployment
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex gap-3">
              <Link href="/template-engine">
                <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                  ← Dashboard
                </Button>
              </Link>
              <Link href="/template-engine/templates/consultation-mvp">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  View MVP Template
                </Button>
              </Link>
              <Button className="bg-black text-white hover:bg-gray-800">
                Create Template
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Template Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {updatedCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className={`cursor-pointer transition-all duration-300 ${selectedCategory === category.id ? 'scale-105' : 'hover:scale-102'}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <Card className={`border-2 ${selectedCategory === category.id ? 'border-black bg-black/5' : getCategoryColor(category.color)}`}>
                  <CardHeader className="pb-3">
                    <div className="text-center">
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <CardTitle className="text-sm font-bold">{category.name}</CardTitle>
                      <div className="text-2xl font-bold text-black mt-1">{category.count}</div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search templates by name, description, or features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-black/30 focus:border-black outline-none transition-all duration-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-black/60">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Templates Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className={`group cursor-pointer transition-all duration-300 ${selectedTemplate === template.id ? 'scale-105' : 'hover:scale-102'}`}
              onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
            >
              <Card className={`border-2 border-black/30 hover:border-black/50 ${selectedTemplate === template.id ? 'ring-2 ring-black/20 border-black' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold">{template.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">v{template.version}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={`${getStatusColor(template.status)} text-xs`}>
                        {template.status}
                      </Badge>
                      <Badge className={`${getTypeColor(template.type)} text-xs`}>
                        {template.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-black/70 mb-4">{template.description}</p>

                  {/* Workflow Steps */}
                  <div className="mb-4">
                    <div className="text-xs font-medium text-black/60 mb-2">Workflow Steps</div>
                    <div className="flex flex-wrap gap-1">
                      {template.workflow.slice(0, 3).map((step, i) => (
                        <span key={i} className="px-2 py-1 bg-black/5 text-black/70 text-xs rounded border border-black/20">
                          {step}
                        </span>
                      ))}
                      {template.workflow.length > 3 && (
                        <span className="px-2 py-1 bg-black/5 text-black/70 text-xs rounded border border-black/20">
                          +{template.workflow.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                    <div className="text-center">
                      <div className="font-medium text-green-600">{template.performance.generationTime}m</div>
                      <div className="text-black/60">Gen Time</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-blue-600">{template.performance.successRate}%</div>
                      <div className="text-black/60">Success</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-purple-600">⭐ {template.performance.avgRating}</div>
                      <div className="text-black/60">Rating</div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedTemplate === template.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 border-t pt-3"
                    >
                      <div>
                        <div className="text-xs font-medium text-black/60 mb-1">Features</div>
                        <div className="flex flex-wrap gap-1">
                          {template.features.map((feature, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{feature}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-medium text-black/60 mb-1">Data Schema</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>Variables: <span className="font-medium">{template.dataSchema.variables}</span></div>
                          <div>Sections: <span className="font-medium">{template.dataSchema.sections}</span></div>
                          <div>Layouts: <span className="font-medium">{template.dataSchema.layouts}</span></div>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-black/60">
                        <span>Used {template.usageCount} times</span>
                        <span>Modified {formatTimeAgo(template.lastModified)}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    {template.id === 'consultation-mvp' ? (
                      <Link href="/template-engine/templates/consultation-mvp" className="flex-1">
                        <Button variant="default" className="w-full bg-blue-600 text-white hover:bg-blue-700 text-sm">
                          View Specification
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="default" className="flex-1 bg-black text-white hover:bg-gray-800 text-sm">
                        Configure
                      </Button>
                    )}
                    <Button variant="outline" className="px-3 border-black/30 text-black hover:border-black/50 text-sm">
                      Clone
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-black mb-2">No templates found</h3>
            <p className="text-black/60">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}