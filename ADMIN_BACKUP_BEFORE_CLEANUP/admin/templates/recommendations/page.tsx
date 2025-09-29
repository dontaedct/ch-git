/**
 * @fileoverview AI-Powered Template Recommendations Interface - HT-032.2.1
 * @module app/admin/templates/recommendations/page
 * @author HT-032.2.1 - AI-Powered Template Discovery & Intelligent Recommendations
 * @version 1.0.0
 *
 * HT-032.2.1: AI-Powered Template Discovery & Intelligent Recommendations
 *
 * AI-powered template recommendations interface that provides intelligent
 * template suggestions, personalized recommendations, and trending templates
 * based on user behavior and market analysis.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, 
  Sparkles, 
  TrendingUp, 
  User, 
  Star, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Brain,
  Target,
  Zap
} from 'lucide-react';
import { TemplateRecommendationEngine } from '@/lib/ai/template-recommendations';
import type { 
  TemplateRecommendation, 
  RecommendationContext 
} from '@/lib/ai/template-recommendations';

interface RecommendationsState {
  isLoading: boolean;
  popularTemplates: TemplateRecommendation[];
  personalizedRecommendations: TemplateRecommendation[];
  trendingTemplates: TemplateRecommendation[];
  error: string | null;
  userContext: RecommendationContext;
}

const initialUserContext: RecommendationContext = {
  userProfile: {
    industry: '',
    businessType: '',
    experienceLevel: 'intermediate',
    previousTemplates: [],
    preferredComplexity: 'moderate',
  },
  projectContext: {
    budget: '',
    timeline: '',
    teamSize: 1,
    specificRequirements: [],
  },
  marketContext: {
    targetAudience: '',
    competitiveAnalysis: false,
    scalabilityNeeds: '',
  },
};

const initialState: RecommendationsState = {
  isLoading: false,
  popularTemplates: [],
  personalizedRecommendations: [],
  trendingTemplates: [],
  error: null,
  userContext: initialUserContext,
};

export default function TemplateRecommendationsPage() {
  const [state, setState] = useState<RecommendationsState>(initialState);
  const [activeTab, setActiveTab] = useState('popular');
  const [showPersonalizationForm, setShowPersonalizationForm] = useState(false);

  // Initialize recommendation engine
  const recommendationEngine = new TemplateRecommendationEngine();

  useEffect(() => {
    // Load initial recommendations
    loadInitialRecommendations();
  }, []);

  const loadInitialRecommendations = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const [popularTemplates, trendingTemplates] = await Promise.all([
        recommendationEngine.getPopularTemplates(12),
        recommendationEngine.getTrendingTemplates(8)
      ]);
      
      setState(prev => ({
        ...prev,
        popularTemplates,
        trendingTemplates,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load recommendations',
        isLoading: false
      }));
    }
  };

  const loadPersonalizedRecommendations = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const personalizedRecommendations = await recommendationEngine.getPersonalizedRecommendations(
        state.userContext,
        10
      );
      
      setState(prev => ({
        ...prev,
        personalizedRecommendations,
        isLoading: false
      }));
      
      setActiveTab('personalized');
      setShowPersonalizationForm(false);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load personalized recommendations',
        isLoading: false
      }));
    }
  };

  const updateUserContext = (section: keyof RecommendationContext, field: string, value: any) => {
    setState(prev => ({
      ...prev,
      userContext: {
        ...prev.userContext,
        [section]: {
          ...prev.userContext[section],
          [field]: value
        }
      }
    }));
  };

  const addRequirement = (requirement: string) => {
    if (requirement.trim() && !state.userContext.projectContext?.specificRequirements?.includes(requirement)) {
      setState(prev => ({
        ...prev,
        userContext: {
          ...prev.userContext,
          projectContext: {
            ...prev.userContext.projectContext,
            specificRequirements: [
              ...(prev.userContext.projectContext?.specificRequirements || []),
              requirement
            ]
          }
        }
      }));
    }
  };

  const removeRequirement = (requirement: string) => {
    setState(prev => ({
      ...prev,
      userContext: {
        ...prev.userContext,
        projectContext: {
          ...prev.userContext.projectContext,
          specificRequirements: prev.userContext.projectContext?.specificRequirements?.filter(
            req => req !== requirement
          ) || []
        }
      }
    }));
  };

  const renderTemplateCard = (template: TemplateRecommendation, showAIBadge: boolean = true) => (
    <Card key={template.id} className="hover:shadow-lg transition-shadow group">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {template.name}
              {template.isAIRecommended && showAIBadge && (
                <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-blue-500">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Pick
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">{template.description}</CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">{template.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">{template.userSatisfactionScore.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-medium">{Math.round(template.successRate * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{template.averageSetupTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="font-medium">{template.popularityScore}%</span>
            </div>
          </div>

          {/* AI Reasoning */}
          {template.isAIRecommended && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800 flex items-start gap-2">
                <Brain className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {template.aiReasoning}
              </p>
            </div>
          )}

          {/* Best Use Cases */}
          <div>
            <p className="text-sm font-medium mb-2">Perfect for:</p>
            <div className="flex flex-wrap gap-1">
              {template.bestUseCases.slice(0, 3).map((useCase, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {useCase}
                </Badge>
              ))}
            </div>
          </div>

          {/* Trending Industries */}
          {template.trendingIndustries.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Trending in:</p>
              <div className="flex flex-wrap gap-1">
                {template.trendingIndustries.slice(0, 2).map((industry, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Competitive Advantages */}
          <div>
            <p className="text-sm font-medium mb-2">Key advantages:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {template.competitiveAdvantages.slice(0, 2).map((advantage, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <Zap className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                  {advantage}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Confidence: {Math.round(template.metadata.confidenceLevel * 100)}%
            </div>
            <Button size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
              Explore Template
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPersonalizationForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Personalize Your Recommendations
        </CardTitle>
        <CardDescription>
          Tell us about your project to get AI-powered personalized template recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* User Profile */}
          <div>
            <h4 className="font-medium mb-3">Your Profile</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select 
                  value={state.userContext.userProfile?.industry || ''} 
                  onValueChange={(value) => updateUserContext('userProfile', 'industry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="beauty">Beauty & Wellness</SelectItem>
                    <SelectItem value="professional-services">Professional Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="business-type">Business Type</Label>
                <Select 
                  value={state.userContext.userProfile?.businessType || ''} 
                  onValueChange={(value) => updateUserContext('userProfile', 'businessType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="coach">Coach</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Select 
                  value={state.userContext.userProfile?.experienceLevel || 'intermediate'} 
                  onValueChange={(value) => updateUserContext('userProfile', 'experienceLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Project Context */}
          <div>
            <h4 className="font-medium mb-3">Project Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="budget">Budget</Label>
                <Select 
                  value={state.userContext.projectContext?.budget || ''} 
                  onValueChange={(value) => updateUserContext('projectContext', 'budget', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Select 
                  value={state.userContext.projectContext?.timeline || ''} 
                  onValueChange={(value) => updateUserContext('projectContext', 'timeline', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent (1-3 days)</SelectItem>
                    <SelectItem value="1-week">1 Week</SelectItem>
                    <SelectItem value="2-weeks">2 Weeks</SelectItem>
                    <SelectItem value="1-month">1 Month</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="team-size">Team Size</Label>
                <Input
                  id="team-size"
                  type="number"
                  min="1"
                  value={state.userContext.projectContext?.teamSize || 1}
                  onChange={(e) => updateUserContext('projectContext', 'teamSize', parseInt(e.target.value) || 1)}
                />
              </div>

              <div>
                <Label htmlFor="scalability">Scalability Needs</Label>
                <Select 
                  value={state.userContext.marketContext?.scalabilityNeeds || ''} 
                  onValueChange={(value) => updateUserContext('marketContext', 'scalabilityNeeds', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Scalability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small Scale</SelectItem>
                    <SelectItem value="medium">Medium Scale</SelectItem>
                    <SelectItem value="large">Large Scale</SelectItem>
                    <SelectItem value="enterprise">Enterprise Scale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Specific Requirements */}
          <div>
            <Label htmlFor="target-audience">Target Audience</Label>
            <Textarea
              id="target-audience"
              placeholder="Describe your target audience..."
              value={state.userContext.marketContext?.targetAudience || ''}
              onChange={(e) => updateUserContext('marketContext', 'targetAudience', e.target.value)}
              rows={2}
            />
          </div>

          {/* Specific Requirements */}
          <div>
            <h4 className="font-medium mb-3">Specific Requirements</h4>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a specific requirement..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addRequirement(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add a specific requirement..."]') as HTMLInputElement;
                    if (input?.value) {
                      addRequirement(input.value);
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              {state.userContext.projectContext?.specificRequirements && 
               state.userContext.projectContext.specificRequirements.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {state.userContext.projectContext.specificRequirements.map((req, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeRequirement(req)}
                    >
                      {req} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={loadPersonalizedRecommendations} disabled={state.isLoading}>
              {state.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Target className="w-4 h-4 mr-2" />
              )}
              Get Personalized Recommendations
            </Button>
            <Button variant="outline" onClick={() => setShowPersonalizationForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          AI-Powered Template Recommendations
        </h1>
        <p className="text-muted-foreground">
          Discover the perfect templates with intelligent recommendations powered by AI analysis and market insights.
        </p>
      </div>

      {state.error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{state.error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="personalized">Personalized</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>
          
          {activeTab === 'personalized' && (
            <Button 
              variant="outline" 
              onClick={() => setShowPersonalizationForm(!showPersonalizationForm)}
            >
              <User className="w-4 h-4 mr-2" />
              {showPersonalizationForm ? 'Hide' : 'Customize'}
            </Button>
          )}
        </div>

        <TabsContent value="popular" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Most Popular Templates
            </h3>
            <p className="text-muted-foreground mb-6">
              Top-rated templates chosen by thousands of users with proven success rates.
            </p>
            
            {state.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading popular templates...</span>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {state.popularTemplates.map(template => renderTemplateCard(template))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="personalized" className="space-y-6">
          {showPersonalizationForm && renderPersonalizationForm()}
          
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Personalized for You
            </h3>
            
            {state.personalizedRecommendations.length === 0 ? (
              <Card className="p-8 text-center">
                <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="text-lg font-medium mb-2">Get Personalized Recommendations</h4>
                <p className="text-muted-foreground mb-4">
                  Share your project details to receive AI-powered template recommendations tailored specifically for your needs.
                </p>
                <Button onClick={() => setShowPersonalizationForm(true)}>
                  <Target className="w-4 h-4 mr-2" />
                  Start Personalization
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {state.personalizedRecommendations.map(template => renderTemplateCard(template))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Trending Templates
            </h3>
            <p className="text-muted-foreground mb-6">
              Templates gaining popularity with strong growth and positive market momentum.
            </p>
            
            {state.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading trending templates...</span>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {state.trendingTemplates.map(template => renderTemplateCard(template, false))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
