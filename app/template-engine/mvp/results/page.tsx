/**
 * @fileoverview MVP Consultation Results Template
 * Results page template for consultation workflow with PDF generation
 * HT-029.3.1 Implementation
 */
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Calendar,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  Clock,
  Star,
  BarChart3,
  FileText,
  Mail,
  Phone,
  ChevronLeft,
  Lightbulb,
  Zap,
  AlertTriangle,
  Trophy
} from "lucide-react";

interface ConsultationData {
  clientInfo: {
    name: string;
    email: string;
    company: string;
    role: string;
  };
  businessProfile: {
    stage: string;
    size: string;
    revenue: string;
    industry: string;
  };
  objectives: {
    primaryGoal: string;
    timeline: string;
    budget: string;
    challenges: string[];
  };
  assessment: {
    score: number;
    strengths: string[];
    opportunities: string[];
    threats: string[];
  };
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    timeline: string;
    expectedROI: string;
  }>;
  nextSteps: Array<{
    step: string;
    description: string;
    deadline: string;
  }>;
}

export default function MVPConsultationResultsTemplate() {
  const [consultationData, setConsultationData] = useState<ConsultationData>({
    clientInfo: {
      name: "Sarah Johnson",
      email: "sarah@techstart.com",
      company: "TechStart Solutions",
      role: "Founder/CEO"
    },
    businessProfile: {
      stage: "Growth stage (2-5 years)",
      size: "11-50 employees",
      revenue: "$500K - $1M",
      industry: "Technology Services"
    },
    objectives: {
      primaryGoal: "Increase revenue",
      timeline: "Short term (1-3 months)",
      budget: "$15,000 - $50,000",
      challenges: ["Generating quality leads", "Converting leads to sales", "Operational inefficiencies"]
    },
    assessment: {
      score: 72,
      strengths: [
        "Strong technical expertise and product quality",
        "Loyal customer base with high satisfaction",
        "Experienced leadership team",
        "Solid operational foundation"
      ],
      opportunities: [
        "Untapped market segments in enterprise sector",
        "Digital marketing optimization potential",
        "Process automation opportunities",
        "Partnership and referral program development"
      ],
      threats: [
        "Increasing competition from larger players",
        "Economic uncertainty affecting client budgets",
        "Talent acquisition challenges"
      ]
    },
    recommendations: [
      {
        title: "Implement Lead Generation System",
        description: "Deploy an automated lead generation system using content marketing, SEO optimization, and targeted LinkedIn outreach to generate 50+ qualified leads per month.",
        priority: "high",
        impact: "high",
        effort: "medium",
        timeline: "4-6 weeks",
        expectedROI: "300-500%"
      },
      {
        title: "Sales Process Optimization",
        description: "Restructure sales process with CRM implementation, sales training, and follow-up automation to improve conversion rates from 15% to 35%.",
        priority: "high",
        impact: "high",
        effort: "medium",
        timeline: "3-4 weeks",
        expectedROI: "250-400%"
      },
      {
        title: "Enterprise Market Expansion",
        description: "Develop enterprise service offerings and establish strategic partnerships to access larger clients and increase average deal size by 200%.",
        priority: "medium",
        impact: "high",
        effort: "high",
        timeline: "8-12 weeks",
        expectedROI: "400-600%"
      },
      {
        title: "Operational Automation",
        description: "Automate repetitive tasks and implement project management systems to increase team productivity by 30% and reduce operational costs.",
        priority: "medium",
        impact: "medium",
        effort: "low",
        timeline: "2-3 weeks",
        expectedROI: "150-250%"
      }
    ],
    nextSteps: [
      {
        step: "Strategy Session",
        description: "Schedule a detailed strategy session to discuss recommendations and create implementation roadmap",
        deadline: "Within 3 days"
      },
      {
        step: "Quick Wins Implementation",
        description: "Begin implementing high-impact, low-effort improvements to generate immediate results",
        deadline: "Within 1 week"
      },
      {
        step: "System Setup",
        description: "Set up core systems for lead generation and sales process optimization",
        deadline: "Within 2 weeks"
      }
    ]
  });

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);

    try {
      // Prepare client data for PDF generation
      const clientData = {
        contactInfo: {
          name: consultationData.clientInfo.name,
          email: consultationData.clientInfo.email,
          company: consultationData.clientInfo.company,
          role: consultationData.clientInfo.role
        },
        responses: [
          { questionId: 'business-stage', value: consultationData.businessProfile.stage, timestamp: new Date() },
          { questionId: 'business-size', value: consultationData.businessProfile.size, timestamp: new Date() },
          { questionId: 'business-revenue', value: consultationData.businessProfile.revenue, timestamp: new Date() },
          { questionId: 'primary-goal', value: consultationData.objectives.primaryGoal, timestamp: new Date() },
          { questionId: 'timeline', value: consultationData.objectives.timeline, timestamp: new Date() },
          { questionId: 'budget', value: consultationData.objectives.budget, timestamp: new Date() },
          { questionId: 'challenges', value: consultationData.objectives.challenges, timestamp: new Date() }
        ],
        submittedAt: new Date(),
        sessionId: `session-${Date.now()}`
      };

      // Call PDF generation API
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: 'consultation-report',
          clientData,
          customization: {
            branding: {
              colors: {
                primary: '#3B82F6',
                secondary: '#1E40AF'
              }
            }
          },
          delivery: {
            email: false,
            storage: 'local'
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        // Create and download PDF
        const blob = new Blob([`PDF Report for ${consultationData.clientInfo.company}\n\nGenerated: ${new Date().toISOString()}\nFilename: ${result.data.filename}`], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.data.filename || `consultation-report-${consultationData.clientInfo.company.toLowerCase().replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        console.error('PDF generation failed:', result.error);
        alert('PDF generation failed. Please try again.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }

    setIsGeneratingPDF(false);
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors];
  };

  const getImpactIcon = (impact: string) => {
    const icons = {
      high: <TrendingUp className="h-4 w-4" />,
      medium: <BarChart3 className="h-4 w-4" />,
      low: <Target className="h-4 w-4" />
    };
    return icons[impact as keyof typeof icons];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MVP Results Template</h1>
              <p className="text-gray-600 mt-2">
                Configure your consultation results and PDF report template
              </p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Preview Mode
              </Button>
              <Link href="/template-engine">
                <Button variant="outline">Back to Engine</Button>
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
                <CardDescription>
                  Customize the consultation report template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Report Sections</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Executive Summary', enabled: true },
                        { name: 'Business Assessment', enabled: true },
                        { name: 'SWOT Analysis', enabled: true },
                        { name: 'Recommendations', enabled: true },
                        { name: 'Implementation Roadmap', enabled: true },
                        { name: 'ROI Projections', enabled: true },
                        { name: 'Next Steps', enabled: true }
                      ].map((section) => (
                        <div key={section.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{section.name}</span>
                          <Badge variant={section.enabled ? "default" : "secondary"}>
                            {section.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>PDF Template Settings</CardTitle>
                <CardDescription>
                  Configure PDF generation and branding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Include Company Logo</span>
                    <Badge className="bg-green-100 text-green-800">Yes</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Page Format</span>
                    <Badge variant="secondary">A4 Portrait</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Color Theme</span>
                    <Badge variant="secondary">Professional Blue</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Include Charts</span>
                    <Badge className="bg-green-100 text-green-800">Yes</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Watermark</span>
                    <Badge variant="secondary">Confidential</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/template-engine/mvp/questionnaire" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Questionnaire</span>
            </Link>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Template
              </Button>
              <Button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Business Consultation Report
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Prepared for {consultationData.clientInfo.company}
                </p>
                <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Confidential Report</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Executive Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span>Executive Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getScoreColor(consultationData.assessment.score)}`}>
                    {consultationData.assessment.score}
                  </div>
                  <p className="text-sm text-gray-600">Overall Business Score</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    300-500%
                  </div>
                  <p className="text-sm text-gray-600">Projected ROI</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    4-6
                  </div>
                  <p className="text-sm text-gray-600">Weeks to Results</p>
                </div>
              </div>
              <Separator className="my-6" />
              <p className="text-gray-700 leading-relaxed">
                Based on our comprehensive analysis of {consultationData.clientInfo.company}, we've identified significant
                opportunities for growth and optimization. Your business demonstrates strong fundamentals with a score of {consultationData.assessment.score}/100,
                indicating solid potential for rapid improvement through targeted strategies.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Business Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span>Business Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-green-700 mb-4 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Key Strengths</span>
                  </h3>
                  <ul className="space-y-2">
                    {consultationData.assessment.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-700 mb-4 flex items-center space-x-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>Growth Opportunities</span>
                  </h3>
                  <ul className="space-y-2">
                    {consultationData.assessment.opportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{opportunity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="font-semibold text-yellow-700 mb-4 flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Areas of Concern</span>
                </h3>
                <ul className="space-y-2">
                  {consultationData.assessment.threats.map((threat, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{threat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <span>Strategic Recommendations</span>
              </CardTitle>
              <CardDescription>
                Prioritized action items to achieve your business objectives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {consultationData.recommendations.map((recommendation, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {recommendation.title}
                        </h3>
                        <p className="text-gray-700 mb-4">
                          {recommendation.description}
                        </p>
                      </div>
                      <Badge className={getPriorityColor(recommendation.priority)}>
                        {recommendation.priority} priority
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        {getImpactIcon(recommendation.impact)}
                        <div>
                          <p className="font-medium">Impact</p>
                          <p className="text-gray-600 capitalize">{recommendation.impact}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Timeline</p>
                          <p className="text-gray-600">{recommendation.timeline}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Expected ROI</p>
                          <p className="text-gray-600">{recommendation.expectedROI}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Effort</p>
                          <p className="text-gray-600 capitalize">{recommendation.effort}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowRight className="h-5 w-5 text-green-600" />
                <span>Next Steps</span>
              </CardTitle>
              <CardDescription>
                Immediate actions to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consultationData.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{step.step}</h3>
                      <p className="text-gray-700 mb-2">{step.description}</p>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {step.deadline}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact and Next Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-blue-800 mb-6 max-w-2xl mx-auto">
                Let's schedule a strategy session to discuss these recommendations and create a detailed implementation plan tailored to your specific needs.
              </p>
              <div className="flex justify-center space-x-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Strategy Session
                </Button>
                <Button variant="outline" size="lg">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Questions
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="text-sm text-blue-700">
                <p className="mb-2">This report was prepared specifically for {consultationData.clientInfo.company}</p>
                <p>For questions about this report, contact us at consulting@yourbusiness.com</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}