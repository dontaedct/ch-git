/**
 * @fileoverview AI-Assisted Setup Wizard - HT-031.1.1
 * @module components/ai/intelligent-wizard
 * @author HT-031.1.1 - AI-Powered Enhancement & Intelligent Automation
 * @version 1.0.0
 *
 * HT-031.1.1: AI-Powered App Generation & Template Intelligence
 *
 * Intelligent setup wizard that guides users through the app creation process
 * with AI-powered suggestions, smart form validation, and automated configuration.
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Sparkles,
  Brain, Target, Settings, Palette, Zap, Shield, Clock, DollarSign,
  Users, TrendingUp, Globe, Smartphone, Laptop, Server, Database,
  Mail, Calendar, CreditCard, BarChart3, FileText, Search, Filter
} from 'lucide-react';
import { generateAppWithAI, ClientRequirementsSchema, type ClientRequirements } from '@/lib/ai/app-generator';
import { getIntelligentTemplateRecommendations, type TemplateSelectionCriteria } from '@/lib/ai/template-intelligence';

/**
 * Wizard Step Configuration
 */
interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  fields: string[];
  optional?: boolean;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'business',
    title: 'Business Information',
    description: 'Tell us about your business and goals',
    icon: Target,
    fields: ['companyName', 'industry', 'businessType', 'targetAudience'],
  },
  {
    id: 'features',
    title: 'Required Features',
    description: 'What functionality do you need?',
    icon: Settings,
    fields: ['features', 'technicalRequirements'],
  },
  {
    id: 'branding',
    title: 'Branding & Design',
    description: 'Customize your app\'s appearance',
    icon: Palette,
    fields: ['branding'],
    optional: true,
  },
  {
    id: 'constraints',
    title: 'Project Constraints',
    description: 'Timeline, budget, and technical requirements',
    icon: Clock,
    fields: ['timeline', 'budget', 'technicalComplexity'],
  },
  {
    id: 'review',
    title: 'Review & Generate',
    description: 'Review your requirements and generate your app',
    icon: Sparkles,
    fields: [],
  },
];

/**
 * AI Suggestions Interface
 */
interface AISuggestion {
  type: 'feature' | 'integration' | 'optimization' | 'warning';
  title: string;
  description: string;
  confidence: number;
  action?: () => void;
}

/**
 * Intelligent Wizard Component
 */
export function IntelligentWizard() {
  const { resolvedTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [requirements, setRequirements] = useState<Partial<ClientRequirements>>({});
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDark = resolvedTheme === 'dark';

  /**
   * Validate current step
   */
  const validateStep = useCallback((stepIndex: number): boolean => {
    const step = WIZARD_STEPS[stepIndex];
    if (!step || step.optional) return true;

    const stepErrors: Record<string, string> = {};
    
    step.fields.forEach(field => {
      const value = requirements[field as keyof ClientRequirements];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        stepErrors[field] = `${field} is required`;
      }
    });

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [requirements]);

  /**
   * Get AI suggestions for current step
   */
  const getAISuggestions = useCallback(async (stepIndex: number) => {
    const step = WIZARD_STEPS[stepIndex];
    if (!step) return;

    try {
      // Simulate AI analysis based on current requirements
      const suggestions: AISuggestion[] = [];

      switch (step.id) {
        case 'business':
          if (requirements.industry) {
            suggestions.push({
              type: 'feature',
              title: 'Industry-Specific Features',
              description: `Based on your ${requirements.industry} industry, consider adding specialized features`,
              confidence: 0.85,
              action: () => {
                setRequirements(prev => ({
                  ...prev,
                  features: [...(prev.features || []), 'industry-specific-forms', 'specialized-analytics']
                }));
              }
            });
          }
          break;

        case 'features':
          if (requirements.features?.includes('booking')) {
            suggestions.push({
              type: 'integration',
              title: 'Calendar Integration',
              description: 'Booking features work best with calendar integration',
              confidence: 0.9,
              action: () => {
                setRequirements(prev => ({
                  ...prev,
                  integrations: [...(prev.integrations || []), 'google-calendar', 'outlook-calendar']
                }));
              }
            });
          }
          break;

        case 'constraints':
          if (requirements.timeline === 'urgent') {
            suggestions.push({
              type: 'warning',
              title: 'Timeline Consideration',
              description: 'For urgent timelines, consider starting with core features only',
              confidence: 0.8
            });
          }
          break;
      }

      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
    }
  }, [requirements]);

  /**
   * Move to next step
   */
  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      getAISuggestions(currentStep + 1);
      setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));
      setErrors({});
    }
  }, [currentStep, validateStep, getAISuggestions]);

  /**
   * Move to previous step
   */
  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setErrors({});
  }, []);

  /**
   * Generate app with AI
   */
  const generateApp = useCallback(async () => {
    if (!validateStep(currentStep)) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate generation progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Validate requirements
      const validatedRequirements = ClientRequirementsSchema.parse({
        businessType: requirements.businessType || 'service',
        targetAudience: requirements.targetAudience || 'general',
        mainGoals: requirements.mainGoals || ['grow business'],
        features: requirements.features || [],
        timeline: requirements.timeline || '2-weeks',
        budget: requirements.budget || 'standard',
        branding: {
          companyName: requirements.branding?.companyName || '',
          industry: requirements.branding?.industry || '',
          brandColors: requirements.branding?.brandColors || [],
          logoUrl: requirements.branding?.logoUrl,
        },
        technicalRequirements: {
          userManagement: requirements.technicalRequirements?.userManagement || false,
          paymentProcessing: requirements.technicalRequirements?.paymentProcessing || false,
          analytics: requirements.technicalRequirements?.analytics || true,
          mobileResponsive: requirements.technicalRequirements?.mobileResponsive || true,
          seoOptimized: requirements.technicalRequirements?.seoOptimized || true,
        },
        integrations: requirements.integrations || [],
      });

      // Generate app with AI
      const result = await generateAppWithAI(validatedRequirements);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      setTimeout(() => {
        setAnalysisResult(result);
        setIsGenerating(false);
      }, 1000);

    } catch (error) {
      console.error('Error generating app:', error);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [requirements, currentStep, validateStep]);

  /**
   * Update requirements
   */
  const updateRequirements = useCallback((field: string, value: any) => {
    setRequirements(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  /**
   * Get step progress
   */
  const getStepProgress = () => {
    return ((currentStep + 1) / WIZARD_STEPS.length) * 100;
  };

  /**
   * Render business information step
   */
  const renderBusinessStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            placeholder="Enter your company name"
            value={requirements.branding?.companyName || ''}
            onChange={(e) => updateRequirements('branding', {
              ...requirements.branding,
              companyName: e.target.value
            })}
            className={errors.branding ? 'border-red-500' : ''}
          />
          {errors.branding && <p className="text-sm text-red-500">{errors.branding}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry *</Label>
          <Select
            value={requirements.branding?.industry || ''}
            onValueChange={(value) => updateRequirements('branding', {
              ...requirements.branding,
              industry: value
            })}
          >
            <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consulting">Consulting</SelectItem>
              <SelectItem value="coaching">Coaching</SelectItem>
              <SelectItem value="therapy">Therapy & Counseling</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="retail">Retail & E-commerce</SelectItem>
              <SelectItem value="real-estate">Real Estate</SelectItem>
              <SelectItem value="legal">Legal Services</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.industry && <p className="text-sm text-red-500">{errors.industry}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessType">Business Type *</Label>
        <Select
          value={requirements.businessType || ''}
          onValueChange={(value) => updateRequirements('businessType', value)}
        >
          <SelectTrigger className={errors.businessType ? 'border-red-500' : ''}>
            <SelectValue placeholder="What type of business do you run?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="service">Service-based business</SelectItem>
            <SelectItem value="consulting">Consulting firm</SelectItem>
            <SelectItem value="ecommerce">E-commerce store</SelectItem>
            <SelectItem value="agency">Marketing agency</SelectItem>
            <SelectItem value="nonprofit">Non-profit organization</SelectItem>
            <SelectItem value="education">Educational institution</SelectItem>
            <SelectItem value="healthcare">Healthcare practice</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.businessType && <p className="text-sm text-red-500">{errors.businessType}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAudience">Target Audience *</Label>
        <Textarea
          id="targetAudience"
          placeholder="Describe your target audience (e.g., small business owners, consumers, B2B clients)"
          value={requirements.targetAudience || ''}
          onChange={(e) => updateRequirements('targetAudience', e.target.value)}
          className={errors.targetAudience ? 'border-red-500' : ''}
          rows={3}
        />
        {errors.targetAudience && <p className="text-sm text-red-500">{errors.targetAudience}</p>}
      </div>
    </div>
  );

  /**
   * Render features step
   */
  const renderFeaturesStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Required Features *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { id: 'booking', label: 'Booking & Scheduling', icon: Calendar },
            { id: 'forms', label: 'Lead Forms', icon: FileText },
            { id: 'payments', label: 'Payment Processing', icon: CreditCard },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'user-management', label: 'User Management', icon: Users },
            { id: 'email', label: 'Email Automation', icon: Mail },
            { id: 'calendar', label: 'Calendar Integration', icon: Calendar },
            { id: 'documentation', label: 'Document Generation', icon: FileText },
            { id: 'search', label: 'Search Functionality', icon: Search },
          ].map((feature) => (
            <div key={feature.id} className="flex items-center space-x-2">
              <Checkbox
                id={feature.id}
                checked={requirements.features?.includes(feature.id) || false}
                onCheckedChange={(checked) => {
                  const currentFeatures = requirements.features || [];
                  if (checked) {
                    updateRequirements('features', [...currentFeatures, feature.id]);
                  } else {
                    updateRequirements('features', currentFeatures.filter(f => f !== feature.id));
                  }
                }}
              />
              <Label htmlFor={feature.id} className="flex items-center space-x-2 cursor-pointer">
                <feature.icon className="w-4 h-4" />
                <span>{feature.label}</span>
              </Label>
            </div>
          ))}
        </div>
        {errors.features && <p className="text-sm text-red-500">{errors.features}</p>}
      </div>

      <div className="space-y-4">
        <Label>Technical Requirements</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'mobileResponsive', label: 'Mobile Responsive', icon: Smartphone },
            { id: 'seoOptimized', label: 'SEO Optimized', icon: Search },
            { id: 'analytics', label: 'Built-in Analytics', icon: BarChart3 },
            { id: 'userManagement', label: 'User Management', icon: Users },
            { id: 'paymentProcessing', label: 'Payment Processing', icon: CreditCard },
            { id: 'contentManagement', label: 'Content Management', icon: FileText },
          ].map((req) => (
            <div key={req.id} className="flex items-center space-x-2">
              <Checkbox
                id={req.id}
                checked={requirements.technicalRequirements?.[req.id as keyof typeof requirements.technicalRequirements] || false}
                onCheckedChange={(checked) => updateRequirements('technicalRequirements', {
                  ...requirements.technicalRequirements,
                  [req.id]: checked
                })}
              />
              <Label htmlFor={req.id} className="flex items-center space-x-2 cursor-pointer">
                <req.icon className="w-4 h-4" />
                <span>{req.label}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /**
   * Render branding step
   */
  const renderBrandingStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
        <Input
          id="logoUrl"
          placeholder="https://example.com/logo.png"
          value={requirements.branding?.logoUrl || ''}
          onChange={(e) => updateRequirements('branding', {
            ...requirements.branding,
            logoUrl: e.target.value
          })}
        />
      </div>

      <div className="space-y-4">
        <Label>Brand Colors (Optional)</Label>
        <div className="grid grid-cols-3 gap-4">
          {['primary', 'secondary', 'accent'].map((color) => (
            <div key={color} className="space-y-2">
              <Label htmlFor={`${color}Color`} className="capitalize">{color} Color</Label>
              <div className="flex space-x-2">
                <Input
                  id={`${color}Color`}
                  type="color"
                  className="w-16 h-10 p-1 border rounded"
                  value={requirements.branding?.brandColors?.[color === 'primary' ? 0 : color === 'secondary' ? 1 : 2] || '#3B82F6'}
                  onChange={(e) => {
                    const colors = requirements.branding?.brandColors || ['#3B82F6', '#1E40AF', '#F59E0B'];
                    const index = color === 'primary' ? 0 : color === 'secondary' ? 1 : 2;
                    colors[index] = e.target.value;
                    updateRequirements('branding', {
                      ...requirements.branding,
                      brandColors: colors
                    });
                  }}
                />
                <Input
                  placeholder="#3B82F6"
                  value={requirements.branding?.brandColors?.[color === 'primary' ? 0 : color === 'secondary' ? 1 : 2] || ''}
                  onChange={(e) => {
                    const colors = requirements.branding?.brandColors || ['#3B82F6', '#1E40AF', '#F59E0B'];
                    const index = color === 'primary' ? 0 : color === 'secondary' ? 1 : 2;
                    colors[index] = e.target.value;
                    updateRequirements('branding', {
                      ...requirements.branding,
                      brandColors: colors
                    });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /**
   * Render constraints step
   */
  const renderConstraintsStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="timeline">Project Timeline *</Label>
          <Select
            value={requirements.timeline || ''}
            onValueChange={(value) => updateRequirements('timeline', value)}
          >
            <SelectTrigger className={errors.timeline ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select your timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">Urgent (1-3 days)</SelectItem>
              <SelectItem value="1-week">1 week</SelectItem>
              <SelectItem value="2-weeks">2 weeks</SelectItem>
              <SelectItem value="1-month">1 month</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
          {errors.timeline && <p className="text-sm text-red-500">{errors.timeline}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Budget Tier *</Label>
          <Select
            value={requirements.budget || ''}
            onValueChange={(value) => updateRequirements('budget', value)}
          >
            <SelectTrigger className={errors.budget ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select your budget tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic ($0-500)</SelectItem>
              <SelectItem value="standard">Standard ($500-2000)</SelectItem>
              <SelectItem value="premium">Premium ($2000-5000)</SelectItem>
              <SelectItem value="enterprise">Enterprise ($5000+)</SelectItem>
            </SelectContent>
          </Select>
          {errors.budget && <p className="text-sm text-red-500">{errors.budget}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="technicalComplexity">Technical Complexity *</Label>
        <Select
          value={requirements.technicalComplexity || ''}
          onValueChange={(value) => updateRequirements('technicalComplexity', value)}
        >
          <SelectTrigger className={errors.technicalComplexity ? 'border-red-500' : ''}>
            <SelectValue placeholder="How complex should the solution be?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="simple">Simple (Basic features only)</SelectItem>
            <SelectItem value="moderate">Moderate (Standard features)</SelectItem>
            <SelectItem value="complex">Complex (Advanced features)</SelectItem>
            <SelectItem value="enterprise">Enterprise (Full-featured solution)</SelectItem>
          </SelectContent>
        </Select>
        {errors.technicalComplexity && <p className="text-sm text-red-500">{errors.technicalComplexity}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="expectedUsers">Expected Users</Label>
        <Input
          id="expectedUsers"
          type="number"
          placeholder="100"
          value={requirements.expectedUsers || ''}
          onChange={(e) => updateRequirements('expectedUsers', parseInt(e.target.value) || 0)}
        />
      </div>
    </div>
  );

  /**
   * Render review step
   */
  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Business Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Company:</strong> {requirements.branding?.companyName}</div>
            <div><strong>Industry:</strong> {requirements.branding?.industry}</div>
            <div><strong>Type:</strong> {requirements.businessType}</div>
            <div><strong>Audience:</strong> {requirements.targetAudience}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {requirements.features?.map((feature) => (
                <Badge key={feature} variant="secondary">{feature}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Constraints</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Timeline:</strong> {requirements.timeline}</div>
            <div><strong>Budget:</strong> {requirements.budget}</div>
            <div><strong>Complexity:</strong> {requirements.technicalComplexity}</div>
            <div><strong>Users:</strong> {requirements.expectedUsers || 'Not specified'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>Branding</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Logo:</strong> {requirements.branding?.logoUrl ? 'Provided' : 'Not provided'}</div>
            <div><strong>Colors:</strong> {requirements.branding?.brandColors?.length || 0} colors</div>
          </CardContent>
        </Card>
      </div>

      {isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Your App</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={generationProgress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              {generationProgress < 30 && 'Analyzing your requirements...'}
              {generationProgress >= 30 && generationProgress < 60 && 'Selecting optimal template...'}
              {generationProgress >= 60 && generationProgress < 90 && 'Configuring features...'}
              {generationProgress >= 90 && 'Finalizing setup...'}
            </p>
          </CardContent>
        </Card>
      )}

      {analysisResult && !isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>App Generated Successfully!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Recommended Template</h4>
                <Badge variant="default">{analysisResult.analysis.recommendedTemplate}</Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {analysisResult.analysis.reasoning}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Confidence Score</h4>
                <div className="flex items-center space-x-2">
                  <Progress value={analysisResult.analysis.confidence * 100} className="flex-1" />
                  <span className="text-sm font-medium">
                    {Math.round(analysisResult.analysis.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
            <Button className="w-full" size="lg">
              Deploy Your App
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  /**
   * Render current step content
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBusinessStep();
      case 1:
        return renderFeaturesStep();
      case 2:
        return renderBrandingStep();
      case 3:
        return renderConstraintsStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "min-h-screen p-6 transition-all duration-500",
      isDark ? "bg-black text-white" : "bg-white text-black"
    )}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold">AI-Powered App Generator</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Create your perfect app in minutes with intelligent recommendations
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep + 1} of {WIZARD_STEPS.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(getStepProgress())}% Complete
            </span>
          </div>
          <Progress value={getStepProgress()} className="w-full" />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {WIZARD_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center space-y-2 flex-1",
                index <= currentStep ? "text-blue-500" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                index < currentStep ? "bg-blue-500 border-blue-500 text-white" :
                index === currentStep ? "border-blue-500 text-blue-500" :
                "border-muted-foreground text-muted-foreground"
              )}>
                {index < currentStep ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span className="text-xs font-medium text-center">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {React.createElement(WIZARD_STEPS[currentStep].icon, { className: "w-5 h-5" })}
              <span>{WIZARD_STEPS[currentStep].title}</span>
            </CardTitle>
            <p className="text-muted-foreground">
              {WIZARD_STEPS[currentStep].description}
            </p>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span>AI Suggestions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-lg border flex items-start space-x-3",
                      suggestion.type === 'warning' ? "border-yellow-200 bg-yellow-50" :
                      suggestion.type === 'feature' ? "border-blue-200 bg-blue-50" :
                      "border-gray-200 bg-gray-50"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                      suggestion.type === 'warning' ? "bg-yellow-500 text-white" :
                      suggestion.type === 'feature' ? "bg-blue-500 text-white" :
                      "bg-gray-500 text-white"
                    )}>
                      {suggestion.type === 'warning' ? <AlertCircle className="w-4 h-4" /> :
                       suggestion.type === 'feature' ? <Zap className="w-4 h-4" /> :
                       <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{suggestion.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Confidence: {Math.round(suggestion.confidence * 100)}%
                        </span>
                        {suggestion.action && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={suggestion.action}
                          >
                            Apply
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="flex space-x-2">
            {currentStep === WIZARD_STEPS.length - 1 ? (
              <Button
                onClick={generateApp}
                disabled={isGenerating}
                className="flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate App</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
