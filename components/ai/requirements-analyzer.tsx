'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Play,
  Pause,
  RotateCcw,
  Info,
  Lightbulb,
  Shield,
  Zap
} from 'lucide-react';

interface RequirementsAnalyzerProps {
  clientId?: string;
  initialRequirements?: Partial<ClientRequirements>;
  onAnalysisComplete?: (analysis: RequirementsAnalysis) => void;
  className?: string;
}

interface ClientRequirements {
  clientId: string;
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
}

interface RequirementsAnalysis {
  id: string;
  clientId: string;
  businessNeeds: BusinessNeedsAnalysis;
  budgetConstraints: BudgetAnalysis;
  technicalRequirements: TechnicalAnalysis;
  riskAssessment: RiskAnalysis;
  recommendations: RecommendationSet;
  confidence: number;
  timestamp: Date;
}

interface BusinessNeedsAnalysis {
  industry: string;
  businessModel: string;
  targetAudience: string[];
  coreObjectives: string[];
  successMetrics: string[];
  timelineConstraints: string;
  competitiveFactors: string[];
}

interface BudgetAnalysis {
  totalBudget: number;
  development: number;
  customization: number;
  deployment: number;
  maintenance: number;
  budgetFlexibility: string;
  costOptimizations: string[];
}

interface TechnicalAnalysis {
  complexity: string;
  integrations: string[];
  scalabilityNeeds: string;
  performanceRequirements: string[];
  securityRequirements: string[];
  complianceNeeds: string[];
  technologyPreferences: string[];
}

interface RiskAnalysis {
  technicalRisks: string[];
  budgetRisks: string[];
  timelineRisks: string[];
  businessRisks: string[];
  mitigation: string[];
  overallRisk: string;
}

interface RecommendationSet {
  templateRecommendations: string[];
  customizationApproach: string;
  implementationStrategy: string;
  budgetOptimizations: string[];
  timelineAdjustments: string[];
  riskMitigations: string[];
}

interface AnalysisStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  progress: number;
  duration?: number;
}

export function RequirementsAnalyzer({
  clientId,
  initialRequirements,
  onAnalysisComplete,
  className
}: RequirementsAnalyzerProps) {
  const [requirements, setRequirements] = useState<Partial<ClientRequirements>>(
    initialRequirements || {
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
      budgetNotes: ''
    }
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<RequirementsAnalysis | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    {
      id: 'business-analysis',
      name: 'Business Needs Analysis',
      description: 'Analyzing industry, business model, and objectives',
      status: 'pending',
      progress: 0
    },
    {
      id: 'budget-analysis',
      name: 'Budget Constraints Analysis',
      description: 'Processing budget breakdown and optimization opportunities',
      status: 'pending',
      progress: 0
    },
    {
      id: 'technical-analysis',
      name: 'Technical Requirements Processing',
      description: 'Evaluating technical complexity and architecture needs',
      status: 'pending',
      progress: 0
    },
    {
      id: 'risk-assessment',
      name: 'Risk Assessment',
      description: 'Identifying and evaluating project risks',
      status: 'pending',
      progress: 0
    },
    {
      id: 'recommendations',
      name: 'Generating Recommendations',
      description: 'Creating AI-powered recommendations and strategies',
      status: 'pending',
      progress: 0
    }
  ]);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (clientId) {
      setRequirements(prev => ({ ...prev, clientId }));
    }
  }, [clientId]);

  const validateRequirements = (): boolean => {
    const errors: string[] = [];

    if (!requirements.businessDescription?.trim()) {
      errors.push('Business description is required');
    }
    if (!requirements.goals?.trim()) {
      errors.push('Business goals are required');
    }
    if (!requirements.targetMarket?.trim()) {
      errors.push('Target market description is required');
    }
    if (!requirements.budget || requirements.budget <= 0) {
      errors.push('Valid budget amount is required');
    }
    if (!requirements.timeline?.trim()) {
      errors.push('Timeline is required');
    }
    if (!requirements.expectedUsers || requirements.expectedUsers <= 0) {
      errors.push('Expected users count is required');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const simulateAnalysisStep = (stepId: string, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      setCurrentStep(stepId);

      // Update step status to in-progress
      setAnalysisSteps(prev => prev.map(step =>
        step.id === stepId
          ? { ...step, status: 'in-progress', progress: 0 }
          : step
      ));

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          // Update step status to completed
          setAnalysisSteps(prev => prev.map(step =>
            step.id === stepId
              ? { ...step, status: 'completed', progress: 100, duration }
              : step
          ));

          resolve();
        } else {
          setAnalysisSteps(prev => prev.map(step =>
            step.id === stepId
              ? { ...step, progress }
              : step
          ));
        }
      }, 100);
    });
  };

  const handleAnalyzeRequirements = async () => {
    if (!validateRequirements()) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      // Reset analysis steps
      setAnalysisSteps(prev => prev.map(step => ({
        ...step,
        status: 'pending',
        progress: 0,
        duration: undefined
      })));

      // Simulate AI analysis steps
      await simulateAnalysisStep('business-analysis', 2000);
      await simulateAnalysisStep('budget-analysis', 1500);
      await simulateAnalysisStep('technical-analysis', 2500);
      await simulateAnalysisStep('risk-assessment', 1800);
      await simulateAnalysisStep('recommendations', 2200);

      // Generate mock analysis results
      const mockAnalysis: RequirementsAnalysis = {
        id: `analysis-${Date.now()}`,
        clientId: requirements.clientId || 'unknown',
        businessNeeds: {
          industry: detectIndustry(requirements.businessDescription || ''),
          businessModel: detectBusinessModel(requirements.businessDescription || ''),
          targetAudience: extractTargetAudience(requirements.targetMarket || ''),
          coreObjectives: extractObjectives(requirements.goals || ''),
          successMetrics: generateSuccessMetrics(requirements.goals || ''),
          timelineConstraints: classifyTimeline(requirements.timeline || ''),
          competitiveFactors: extractCompetitiveFactors(requirements.competitorInfo || '')
        },
        budgetConstraints: {
          totalBudget: requirements.budget || 0,
          development: (requirements.budget || 0) * 0.5,
          customization: (requirements.budget || 0) * 0.3,
          deployment: (requirements.budget || 0) * 0.1,
          maintenance: (requirements.budget || 0) * 0.1,
          budgetFlexibility: assessBudgetFlexibility(requirements.budgetNotes || ''),
          costOptimizations: generateCostOptimizations(requirements)
        },
        technicalRequirements: {
          complexity: assessComplexity(requirements),
          integrations: requirements.integrationNeeds || [],
          scalabilityNeeds: assessScalability(requirements.expectedUsers || 0),
          performanceRequirements: requirements.performanceNeeds || [],
          securityRequirements: requirements.securityNeeds || [],
          complianceNeeds: requirements.complianceRequirements || [],
          technologyPreferences: requirements.technologyPreferences || []
        },
        riskAssessment: {
          technicalRisks: assessTechnicalRisks(requirements),
          budgetRisks: assessBudgetRisks(requirements),
          timelineRisks: assessTimelineRisks(requirements),
          businessRisks: assessBusinessRisks(requirements),
          mitigation: generateMitigationStrategies(requirements),
          overallRisk: calculateOverallRisk(requirements)
        },
        recommendations: {
          templateRecommendations: recommendTemplates(requirements),
          customizationApproach: recommendCustomizationApproach(requirements),
          implementationStrategy: recommendImplementationStrategy(requirements),
          budgetOptimizations: recommendBudgetOptimizations(requirements),
          timelineAdjustments: recommendTimelineAdjustments(requirements),
          riskMitigations: recommendRiskMitigations(requirements)
        },
        confidence: calculateConfidence(requirements),
        timestamp: new Date()
      };

      setAnalysis(mockAnalysis);
      onAnalysisComplete?.(mockAnalysis);

    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisSteps(prev => prev.map(step =>
        step.status === 'in-progress'
          ? { ...step, status: 'error' }
          : step
      ));
    } finally {
      setIsAnalyzing(false);
      setCurrentStep('');
    }
  };

  // Helper functions for AI analysis simulation
  const detectIndustry = (description: string): string => {
    const industries = ['technology', 'healthcare', 'finance', 'retail', 'manufacturing'];
    const text = description.toLowerCase();
    for (const industry of industries) {
      if (text.includes(industry)) return industry;
    }
    return 'general-business';
  };

  const detectBusinessModel = (description: string): string => {
    const text = description.toLowerCase();
    if (text.includes('business') && text.includes('business')) return 'B2B';
    if (text.includes('consumer') || text.includes('customer')) return 'B2C';
    return 'B2C';
  };

  const extractTargetAudience = (targetMarket: string): string[] => {
    return targetMarket.split(',').map(item => item.trim()).filter(item => item.length > 0);
  };

  const extractObjectives = (goals: string): string[] => {
    return goals.split('.').map(item => item.trim()).filter(item => item.length > 0);
  };

  const generateSuccessMetrics = (goals: string): string[] => {
    const metrics = ['User satisfaction > 90%', 'Performance improvement 40%', 'Cost reduction 25%'];
    return metrics;
  };

  const classifyTimeline = (timeline: string): string => {
    const text = timeline.toLowerCase();
    if (text.includes('urgent') || text.includes('asap')) return 'urgent';
    if (text.includes('flexible')) return 'flexible';
    return 'standard';
  };

  const extractCompetitiveFactors = (competitorInfo: string): string[] => {
    return competitorInfo.split(',').map(item => item.trim()).filter(item => item.length > 0);
  };

  const assessBudgetFlexibility = (budgetNotes: string): string => {
    const text = budgetNotes.toLowerCase();
    if (text.includes('flexible') || text.includes('negotiable')) return 'flexible';
    if (text.includes('fixed') || text.includes('strict')) return 'strict';
    return 'moderate';
  };

  const generateCostOptimizations = (req: Partial<ClientRequirements>): string[] => {
    const optimizations = ['Template-based development', 'Phased implementation', 'Cloud infrastructure'];
    return optimizations;
  };

  const assessComplexity = (req: Partial<ClientRequirements>): string => {
    let score = 0;
    if ((req.integrationNeeds?.length || 0) > 3) score += 2;
    if ((req.expectedUsers || 0) > 1000) score += 1;
    if ((req.securityNeeds?.length || 0) > 2) score += 2;

    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  };

  const assessScalability = (users: number): string => {
    if (users > 10000) return 'high-scale';
    if (users > 1000) return 'medium-scale';
    return 'standard-scale';
  };

  const assessTechnicalRisks = (req: Partial<ClientRequirements>): string[] => {
    const risks = [];
    if ((req.integrationNeeds?.length || 0) > 3) {
      risks.push('Complex integration requirements may cause delays');
    }
    return risks;
  };

  const assessBudgetRisks = (req: Partial<ClientRequirements>): string[] => {
    const risks = [];
    if ((req.budget || 0) < 5000) {
      risks.push('Limited budget may constrain feature scope');
    }
    return risks;
  };

  const assessTimelineRisks = (req: Partial<ClientRequirements>): string[] => {
    const risks = [];
    if (req.timeline?.includes('urgent')) {
      risks.push('Aggressive timeline may impact quality');
    }
    return risks;
  };

  const assessBusinessRisks = (req: Partial<ClientRequirements>): string[] => {
    const risks = [];
    if (!req.targetMarket || req.targetMarket.length < 10) {
      risks.push('Unclear target market definition may affect solution fit');
    }
    return risks;
  };

  const generateMitigationStrategies = (req: Partial<ClientRequirements>): string[] => {
    return ['Regular client checkpoints', 'Agile development approach', 'Risk monitoring'];
  };

  const calculateOverallRisk = (req: Partial<ClientRequirements>): string => {
    const risks = [
      ...assessTechnicalRisks(req),
      ...assessBudgetRisks(req),
      ...assessTimelineRisks(req),
      ...assessBusinessRisks(req)
    ];

    if (risks.length >= 3) return 'high';
    if (risks.length >= 1) return 'medium';
    return 'low';
  };

  const recommendTemplates = (req: Partial<ClientRequirements>): string[] => {
    return ['business-dashboard-template', 'saas-starter-template'];
  };

  const recommendCustomizationApproach = (req: Partial<ClientRequirements>): string => {
    const complexity = assessComplexity(req);
    if (complexity === 'high') return 'comprehensive-custom-development';
    if (complexity === 'low') return 'template-based-minimal-customization';
    return 'hybrid-template-customization';
  };

  const recommendImplementationStrategy = (req: Partial<ClientRequirements>): string => {
    if (req.timeline?.includes('urgent')) return 'rapid-mvp-deployment';
    return 'agile-phased-implementation';
  };

  const recommendBudgetOptimizations = (req: Partial<ClientRequirements>): string[] => {
    return ['Use pre-built components', 'Template customization vs full custom'];
  };

  const recommendTimelineAdjustments = (req: Partial<ClientRequirements>): string[] => {
    return ['MVP approach', 'Feature prioritization'];
  };

  const recommendRiskMitigations = (req: Partial<ClientRequirements>): string[] => {
    return ['Technical validation early', 'Regular client communication'];
  };

  const calculateConfidence = (req: Partial<ClientRequirements>): number => {
    let confidence = 0.5;
    if (req.businessDescription && req.businessDescription.length > 100) confidence += 0.2;
    if (req.goals && req.goals.length > 50) confidence += 0.1;
    if (req.budget && req.budget > 0) confidence += 0.1;
    if (req.expectedUsers && req.expectedUsers > 0) confidence += 0.1;
    return Math.min(confidence, 1.0);
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <RotateCcw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
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
    <div className={`space-y-6 ${className}`}>
      {/* Requirements Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Requirements Analyzer
          </CardTitle>
          <CardDescription>
            Input client requirements for comprehensive AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {validationErrors.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please fix the following issues:
                <ul className="list-disc list-inside mt-2">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                value={requirements.budget || ''}
                onChange={(e) => setRequirements(prev => ({
                  ...prev,
                  budget: Number(e.target.value)
                }))}
                placeholder="Enter total budget"
              />
            </div>
            <div>
              <Label htmlFor="expectedUsers">Expected Users</Label>
              <Input
                id="expectedUsers"
                type="number"
                value={requirements.expectedUsers || ''}
                onChange={(e) => setRequirements(prev => ({
                  ...prev,
                  expectedUsers: Number(e.target.value)
                }))}
                placeholder="Number of expected users"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="businessDescription">Business Description</Label>
            <Textarea
              id="businessDescription"
              value={requirements.businessDescription || ''}
              onChange={(e) => setRequirements(prev => ({
                ...prev,
                businessDescription: e.target.value
              }))}
              placeholder="Describe the client's business, industry, and context"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="goals">Business Goals & Objectives</Label>
            <Textarea
              id="goals"
              value={requirements.goals || ''}
              onChange={(e) => setRequirements(prev => ({
                ...prev,
                goals: e.target.value
              }))}
              placeholder="What does the client want to achieve? Include specific metrics if available."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetMarket">Target Market</Label>
              <Textarea
                id="targetMarket"
                value={requirements.targetMarket || ''}
                onChange={(e) => setRequirements(prev => ({
                  ...prev,
                  targetMarket: e.target.value
                }))}
                placeholder="Describe the target audience and market"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="timeline">Timeline</Label>
              <Select
                value={requirements.timeline || ''}
                onValueChange={(value) => setRequirements(prev => ({
                  ...prev,
                  timeline: value
                }))}
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
            <Label htmlFor="competitorInfo">Competitor Information</Label>
            <Textarea
              id="competitorInfo"
              value={requirements.competitorInfo || ''}
              onChange={(e) => setRequirements(prev => ({
                ...prev,
                competitorInfo: e.target.value
              }))}
              placeholder="Information about competitors and market differentiation"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="budgetNotes">Budget Flexibility Notes</Label>
            <Textarea
              id="budgetNotes"
              value={requirements.budgetNotes || ''}
              onChange={(e) => setRequirements(prev => ({
                ...prev,
                budgetNotes: e.target.value
              }))}
              placeholder="Any notes about budget flexibility or constraints"
              rows={2}
            />
          </div>

          <Button
            onClick={handleAnalyzeRequirements}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Requirements...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze Requirements
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI Analysis in Progress
            </CardTitle>
            <CardDescription>
              Processing requirements through multiple AI analysis engines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisSteps.map((step) => (
              <div key={step.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStepIcon(step.status)}
                    <span className="font-medium">{step.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {step.duration && `${step.duration}ms`}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                <Progress value={step.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Analysis Complete
              </CardTitle>
              <CardDescription>
                Confidence: {Math.round(analysis.confidence * 100)}% •
                Overall Risk: <Badge className={getRiskColor(analysis.riskAssessment.overallRisk)}>
                  {analysis.riskAssessment.overallRisk}
                </Badge>
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Needs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Business Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Industry & Model</Label>
                  <div className="flex gap-2 mt-1">
                    <Badge>{analysis.businessNeeds.industry}</Badge>
                    <Badge variant="outline">{analysis.businessNeeds.businessModel}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Core Objectives</Label>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                    {analysis.businessNeeds.coreObjectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Budget Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Budget Breakdown
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
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${analysis.budgetConstraints.totalBudget.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Technical Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Complexity</Label>
                  <Badge className="ml-2">{analysis.technicalRequirements.complexity}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Scalability</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {analysis.technicalRequirements.scalabilityNeeds}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Integrations</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.technicalRequirements.integrations.map((int, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {int}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Templates</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.recommendations.templateRecommendations.map((template, i) => (
                      <Badge key={i} className="text-xs">
                        {template}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Approach</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {analysis.recommendations.customizationApproach}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Strategy</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {analysis.recommendations.implementationStrategy}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}