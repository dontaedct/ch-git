'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  TrendingUp,
  DollarSign,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Target,
  FileText,
  Download,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface ClientRequirement {
  id: string;
  clientId: string;
  clientName: string;
  businessDescription: string;
  goals: string;
  targetMarket: string;
  budget: number;
  timeline: string;
  expectedUsers: number;
  integrationNeeds: string[];
  performanceNeeds: string[];
  securityNeeds: string[];
  complianceRequirements: string[];
  technologyPreferences: string[];
  competitorInfo: string;
  budgetNotes: string;
  status: 'draft' | 'analyzing' | 'completed' | 'approved';
  createdAt: Date;
  updatedAt: Date;
}

interface RequirementsAnalysis {
  id: string;
  clientId: string;
  businessNeeds: {
    industry: string;
    businessModel: string;
    targetAudience: string[];
    coreObjectives: string[];
    successMetrics: string[];
    timelineConstraints: string;
    competitiveFactors: string[];
  };
  budgetConstraints: {
    totalBudget: number;
    development: number;
    customization: number;
    deployment: number;
    maintenance: number;
    budgetFlexibility: string;
    costOptimizations: string[];
  };
  technicalRequirements: {
    complexity: string;
    integrations: string[];
    scalabilityNeeds: string;
    performanceRequirements: string[];
    securityRequirements: string[];
    complianceNeeds: string[];
    technologyPreferences: string[];
  };
  riskAssessment: {
    technicalRisks: string[];
    budgetRisks: string[];
    timelineRisks: string[];
    businessRisks: string[];
    mitigation: string[];
    overallRisk: string;
  };
  recommendations: {
    templateRecommendations: string[];
    customizationApproach: string;
    implementationStrategy: string;
    budgetOptimizations: string[];
    timelineAdjustments: string[];
    riskMitigations: string[];
  };
  confidence: number;
  timestamp: Date;
}

export default function ClientRequirementsPage() {
  const [requirements, setRequirements] = useState<ClientRequirement[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<ClientRequirement | null>(null);
  const [analysis, setAnalysis] = useState<RequirementsAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('requirements');
  const [newRequirement, setNewRequirement] = useState<Partial<ClientRequirement>>({
    clientName: '',
    businessDescription: '',
    goals: '',
    targetMarket: '',
    budget: 0,
    timeline: '',
    expectedUsers: 0,
    integrationNeeds: [],
    performanceNeeds: [],
    securityNeeds: [],
    complianceRequirements: [],
    technologyPreferences: [],
    competitorInfo: '',
    budgetNotes: '',
    status: 'draft'
  });

  useEffect(() => {
    loadRequirements();
  }, []);

  const loadRequirements = async () => {
    // Simulate API call
    const mockRequirements: ClientRequirement[] = [
      {
        id: '1',
        clientId: 'client-1',
        clientName: 'TechStart Solutions',
        businessDescription: 'A technology startup focused on providing digital transformation solutions for small businesses.',
        goals: 'Increase operational efficiency by 40%. Reduce manual processes. Improve customer satisfaction.',
        targetMarket: 'Small to medium businesses in technology sector',
        budget: 15000,
        timeline: 'flexible - 3-4 months',
        expectedUsers: 500,
        integrationNeeds: ['payment-processing', 'crm', 'analytics'],
        performanceNeeds: ['real-time-updates', 'mobile-responsive'],
        securityNeeds: ['basic-security', 'data-encryption'],
        complianceRequirements: ['gdpr'],
        technologyPreferences: ['react', 'node.js'],
        competitorInfo: 'Competing with established enterprise solutions, need to differentiate on ease of use',
        budgetNotes: 'Budget is moderately flexible, can increase by 20% if justified',
        status: 'completed',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: '2',
        clientId: 'client-2',
        clientName: 'HealthCare Plus',
        businessDescription: 'Healthcare provider looking to digitize patient management and appointment scheduling.',
        goals: 'Streamline patient intake. Reduce appointment scheduling time. Improve patient experience.',
        targetMarket: 'Healthcare patients and medical staff',
        budget: 25000,
        timeline: 'urgent - 6 weeks',
        expectedUsers: 2000,
        integrationNeeds: ['ehr-system', 'payment-processing', 'calendar'],
        performanceNeeds: ['high-availability', 'fast-response'],
        securityNeeds: ['hipaa-compliance', 'advanced-security'],
        complianceRequirements: ['hipaa', 'gdpr'],
        technologyPreferences: ['secure-cloud', 'mobile-first'],
        competitorInfo: 'Competing with legacy healthcare systems',
        budgetNotes: 'Fixed budget due to healthcare regulations',
        status: 'analyzing',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-19')
      }
    ];
    setRequirements(mockRequirements);
  };

  const handleAnalyzeRequirements = async (requirement: ClientRequirement) => {
    setIsAnalyzing(true);
    setSelectedRequirement(requirement);

    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis: RequirementsAnalysis = {
        id: `analysis-${requirement.id}`,
        clientId: requirement.clientId,
        businessNeeds: {
          industry: 'technology',
          businessModel: 'B2B',
          targetAudience: ['small-businesses', 'technology-sector'],
          coreObjectives: ['efficiency-improvement', 'process-automation', 'customer-satisfaction'],
          successMetrics: ['40% efficiency increase', 'User satisfaction > 90%', 'Process automation 80%'],
          timelineConstraints: 'flexible',
          competitiveFactors: ['ease-of-use', 'cost-effectiveness', 'rapid-implementation']
        },
        budgetConstraints: {
          totalBudget: requirement.budget,
          development: requirement.budget * 0.5,
          customization: requirement.budget * 0.3,
          deployment: requirement.budget * 0.1,
          maintenance: requirement.budget * 0.1,
          budgetFlexibility: 'moderate',
          costOptimizations: ['Template-based development', 'Phased implementation', 'Cloud infrastructure']
        },
        technicalRequirements: {
          complexity: 'medium',
          integrations: requirement.integrationNeeds,
          scalabilityNeeds: 'medium-scale',
          performanceRequirements: requirement.performanceNeeds,
          securityRequirements: requirement.securityNeeds,
          complianceNeeds: requirement.complianceRequirements,
          technologyPreferences: requirement.technologyPreferences
        },
        riskAssessment: {
          technicalRisks: ['Integration complexity with legacy CRM systems'],
          budgetRisks: ['Scope creep potential'],
          timelineRisks: ['Client feedback delay'],
          businessRisks: ['Market competition'],
          mitigation: ['Agile development approach', 'Clear scope definition', 'Regular client communication'],
          overallRisk: 'medium'
        },
        recommendations: {
          templateRecommendations: ['business-dashboard-template', 'saas-starter-template'],
          customizationApproach: 'hybrid-template-customization',
          implementationStrategy: 'agile-phased-implementation',
          budgetOptimizations: ['Use pre-built components', 'Template customization vs full custom'],
          timelineAdjustments: ['MVP approach', 'Feature prioritization'],
          riskMitigations: ['Regular client checkpoints', 'Technical validation early']
        },
        confidence: 0.87,
        timestamp: new Date()
      };

      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
      setActiveTab('analysis');

      // Update requirement status
      setRequirements(prev => prev.map(req =>
        req.id === requirement.id
          ? { ...req, status: 'completed' as const }
          : req
      ));
    }, 3000);
  };

  const handleCreateRequirement = async () => {
    const requirement: ClientRequirement = {
      id: `req-${Date.now()}`,
      clientId: `client-${Date.now()}`,
      ...newRequirement as ClientRequirement,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setRequirements(prev => [...prev, requirement]);
    setNewRequirement({
      clientName: '',
      businessDescription: '',
      goals: '',
      targetMarket: '',
      budget: 0,
      timeline: '',
      expectedUsers: 0,
      integrationNeeds: [],
      performanceNeeds: [],
      securityNeeds: [],
      complianceRequirements: [],
      technologyPreferences: [],
      competitorInfo: '',
      budgetNotes: '',
      status: 'draft'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'analyzing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Requirements Analysis</h1>
          <p className="text-muted-foreground">
            AI-powered analysis of client business needs, budget constraints, and technical requirements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Analysis
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="analysis" disabled={!analysis}>
            Analysis {analysis && <CheckCircle className="h-4 w-4 ml-1" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requirements" className="space-y-6">
          <div className="grid gap-6">
            {requirements.map((requirement) => (
              <Card key={requirement.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {requirement.clientName}
                        <Badge className={getStatusColor(requirement.status)}>
                          {requirement.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Budget: ${requirement.budget.toLocaleString()} •
                        Users: {requirement.expectedUsers.toLocaleString()} •
                        Timeline: {requirement.timeline}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {requirement.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequirement(requirement);
                            // Load existing analysis
                            setActiveTab('analysis');
                          }}
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          View Analysis
                        </Button>
                      )}
                      {requirement.status !== 'analyzing' && requirement.status !== 'completed' && (
                        <Button
                          onClick={() => handleAnalyzeRequirements(requirement)}
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? (
                            <Pause className="h-4 w-4 mr-2" />
                          ) : (
                            <Play className="h-4 w-4 mr-2" />
                          )}
                          Analyze Requirements
                        </Button>
                      )}
                      {requirement.status === 'analyzing' && (
                        <Button variant="outline" disabled>
                          <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Business Description</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {requirement.businessDescription}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Goals</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {requirement.goals}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Target Market</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {requirement.targetMarket}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {requirement.integrationNeeds.map((need, index) => (
                        <Badge key={index} variant="secondary">
                          {need}
                        </Badge>
                      ))}
                      {requirement.performanceNeeds.map((need, index) => (
                        <Badge key={index} variant="outline">
                          {need}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Requirements</CardTitle>
              <CardDescription>
                Capture client business needs and requirements for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={newRequirement.clientName || ''}
                    onChange={(e) => setNewRequirement(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newRequirement.budget || ''}
                    onChange={(e) => setNewRequirement(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    placeholder="Enter budget amount"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="businessDescription">Business Description</Label>
                <Textarea
                  id="businessDescription"
                  value={newRequirement.businessDescription || ''}
                  onChange={(e) => setNewRequirement(prev => ({ ...prev, businessDescription: e.target.value }))}
                  placeholder="Describe the client's business and industry"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="goals">Business Goals</Label>
                <Textarea
                  id="goals"
                  value={newRequirement.goals || ''}
                  onChange={(e) => setNewRequirement(prev => ({ ...prev, goals: e.target.value }))}
                  placeholder="What does the client want to achieve?"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetMarket">Target Market</Label>
                  <Textarea
                    id="targetMarket"
                    value={newRequirement.targetMarket || ''}
                    onChange={(e) => setNewRequirement(prev => ({ ...prev, targetMarket: e.target.value }))}
                    placeholder="Describe target audience"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <Select
                    value={newRequirement.timeline || ''}
                    onValueChange={(value) => setNewRequirement(prev => ({ ...prev, timeline: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent (&lt; 6 weeks)</SelectItem>
                      <SelectItem value="standard">Standard (2-3 months)</SelectItem>
                      <SelectItem value="flexible">Flexible (3-6 months)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="expectedUsers">Expected Users</Label>
                <Input
                  id="expectedUsers"
                  type="number"
                  value={newRequirement.expectedUsers || ''}
                  onChange={(e) => setNewRequirement(prev => ({ ...prev, expectedUsers: Number(e.target.value) }))}
                  placeholder="Number of expected users"
                />
              </div>

              <div>
                <Label htmlFor="competitorInfo">Competitor Information</Label>
                <Textarea
                  id="competitorInfo"
                  value={newRequirement.competitorInfo || ''}
                  onChange={(e) => setNewRequirement(prev => ({ ...prev, competitorInfo: e.target.value }))}
                  placeholder="Information about competitors and market position"
                  rows={2}
                />
              </div>

              <Button onClick={handleCreateRequirement} className="w-full">
                Create Requirements
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {analysis && selectedRequirement && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Requirements Analysis - {selectedRequirement.clientName}
                      </CardTitle>
                      <CardDescription>
                        AI-powered analysis completed with {Math.round(analysis.confidence * 100)}% confidence
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskColor(analysis.riskAssessment.overallRisk)}>
                        {analysis.riskAssessment.overallRisk} risk
                      </Badge>
                      <Progress value={analysis.confidence * 100} className="w-20" />
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Business Needs Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Industry & Business Model</Label>
                      <div className="flex gap-2 mt-1">
                        <Badge>{analysis.businessNeeds.industry}</Badge>
                        <Badge variant="outline">{analysis.businessNeeds.businessModel}</Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Core Objectives</Label>
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                        {analysis.businessNeeds.coreObjectives.map((objective, index) => (
                          <li key={index}>{objective}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Success Metrics</Label>
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                        {analysis.businessNeeds.successMetrics.map((metric, index) => (
                          <li key={index}>{metric}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Target Audience</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.businessNeeds.targetAudience.map((audience, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {audience}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Budget Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Development</span>
                        <span>${analysis.budgetConstraints.development.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Customization</span>
                        <span>${analysis.budgetConstraints.customization.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Deployment</span>
                        <span>${analysis.budgetConstraints.deployment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Maintenance</span>
                        <span>${analysis.budgetConstraints.maintenance.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total Budget</span>
                        <span>${analysis.budgetConstraints.totalBudget.toLocaleString()}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Budget Flexibility</Label>
                      <Badge className="ml-2" variant="outline">
                        {analysis.budgetConstraints.budgetFlexibility}
                      </Badge>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Cost Optimizations</Label>
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                        {analysis.budgetConstraints.costOptimizations.map((optimization, index) => (
                          <li key={index}>{optimization}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Technical Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Complexity Level</Label>
                      <Badge className="ml-2">{analysis.technicalRequirements.complexity}</Badge>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Scalability Needs</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {analysis.technicalRequirements.scalabilityNeeds}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Required Integrations</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.technicalRequirements.integrations.map((integration, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {integration}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Performance Requirements</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.technicalRequirements.performanceRequirements.map((req, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Security & Compliance</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.technicalRequirements.securityRequirements.map((req, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                        {analysis.technicalRequirements.complianceNeeds.map((req, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Risk Level</span>
                      <Badge className={getRiskColor(analysis.riskAssessment.overallRisk)}>
                        {analysis.riskAssessment.overallRisk}
                      </Badge>
                    </div>

                    {analysis.riskAssessment.technicalRisks.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Technical Risks</Label>
                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                          {analysis.riskAssessment.technicalRisks.map((risk, index) => (
                            <li key={index}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.riskAssessment.budgetRisks.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Budget Risks</Label>
                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                          {analysis.riskAssessment.budgetRisks.map((risk, index) => (
                            <li key={index}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium">Mitigation Strategies</Label>
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                        {analysis.riskAssessment.mitigation.map((strategy, index) => (
                          <li key={index}>{strategy}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium">Template Recommendations</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.recommendations.templateRecommendations.map((template, index) => (
                          <Badge key={index} variant="default" className="text-xs">
                            {template}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Implementation Strategy</Label>
                      <Badge variant="outline" className="ml-2">
                        {analysis.recommendations.implementationStrategy}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Customization Approach</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analysis.recommendations.customizationApproach}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium">Budget Optimizations</Label>
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                        {analysis.recommendations.budgetOptimizations.map((optimization, index) => (
                          <li key={index}>{optimization}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Timeline Adjustments</Label>
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                        {analysis.recommendations.timelineAdjustments.map((adjustment, index) => (
                          <li key={index}>{adjustment}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Risk Mitigations</Label>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                      {analysis.recommendations.riskMitigations.map((mitigation, index) => (
                        <li key={index}>{mitigation}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}