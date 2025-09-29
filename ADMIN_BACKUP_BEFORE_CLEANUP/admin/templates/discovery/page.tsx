/**
 * @fileoverview AI-Powered Template Discovery Interface - HT-032.2.1
 * @module app/admin/templates/discovery/page
 * @author HT-032.2.1 - AI-Powered Template Discovery & Intelligent Recommendations
 * @version 1.0.0
 *
 * HT-032.2.1: AI-Powered Template Discovery & Intelligent Recommendations
 *
 * AI-powered template discovery interface that integrates with HT-031's AI system
 * to create intelligent template discovery, AI-powered recommendations, and smart
 * template suggestions based on user needs and usage patterns.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search, Sparkles, Target, TrendingUp, Brain } from 'lucide-react';
import { TemplateDiscoveryEngine } from '@/lib/ai/template-discovery';
import { TemplateRecommendationEngine } from '@/lib/ai/template-recommendations';
import { TemplateAnalyzer } from '@/lib/ai/template-analyzer';
import type { TemplateDiscoveryResult, TemplateAnalysis } from '@/lib/ai/template-discovery';
import type { TemplateRecommendation } from '@/lib/ai/template-recommendations';

interface DiscoveryFilters {
  industry: string;
  businessType: string;
  complexity: string;
  budget: string;
  timeline: string;
  useCase: string;
}

interface DiscoveryState {
  isLoading: boolean;
  results: TemplateDiscoveryResult[];
  recommendations: TemplateRecommendation[];
  analysis: TemplateAnalysis | null;
  error: string | null;
  searchQuery: string;
  filters: DiscoveryFilters;
}

const initialFilters: DiscoveryFilters = {
  industry: '',
  businessType: '',
  complexity: '',
  budget: '',
  timeline: '',
  useCase: ''
};

const initialState: DiscoveryState = {
  isLoading: false,
  results: [],
  recommendations: [],
  analysis: null,
  error: null,
  searchQuery: '',
  filters: initialFilters
};

export default function TemplateDiscoveryPage() {
  const [state, setState] = useState<DiscoveryState>(initialState);
  const [activeTab, setActiveTab] = useState('search');

  // Initialize AI engines
  const discoveryEngine = new TemplateDiscoveryEngine();
  const recommendationEngine = new TemplateRecommendationEngine();
  const templateAnalyzer = new TemplateAnalyzer();

  useEffect(() => {
    // Load initial template data and popular recommendations
    loadPopularTemplates();
  }, []);

  const loadPopularTemplates = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const popularRecommendations = await recommendationEngine.getPopularTemplates();
      const initialAnalysis = await templateAnalyzer.getTemplateOverview();
      
      setState(prev => ({
        ...prev,
        recommendations: popularRecommendations,
        analysis: initialAnalysis,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load popular templates',
        isLoading: false
      }));
    }
  };

  const handleSearch = async () => {
    if (!state.searchQuery.trim()) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const discoveryResults = await discoveryEngine.searchTemplates({
        query: state.searchQuery,
        filters: state.filters
      });
      
      const aiRecommendations = await recommendationEngine.getRecommendationsForQuery(
        state.searchQuery,
        state.filters
      );
      
      setState(prev => ({
        ...prev,
        results: discoveryResults,
        recommendations: aiRecommendations,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Search failed',
        isLoading: false
      }));
    }
  };

  const handleIntelligentDiscovery = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const intelligentResults = await discoveryEngine.discoverTemplatesIntelligently({
        businessContext: {
          industry: state.filters.industry,
          businessType: state.filters.businessType
        },
        requirements: {
          useCase: state.filters.useCase,
          complexity: state.filters.complexity,
          budget: state.filters.budget,
          timeline: state.filters.timeline
        }
      });
      
      const analysis = await templateAnalyzer.analyzeUserRequirements({
        filters: state.filters,
        searchQuery: state.searchQuery
      });
      
      setState(prev => ({
        ...prev,
        results: intelligentResults,
        analysis,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Intelligent discovery failed',
        isLoading: false
      }));
    }
  };

  const updateFilter = (key: keyof DiscoveryFilters, value: string) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value }
    }));
  };

  const clearFilters = () => {
    setState(prev => ({
      ...prev,
      filters: initialFilters,
      searchQuery: ''
    }));
  };

  const renderSearchInterface = () => (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="search-query">Describe what you want to build</Label>
          <Input
            id="search-query"
            placeholder="e.g., consultation booking system, lead generation form, client portal..."
            value={state.searchQuery}
            onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="flex gap-2 items-end">
          <Button onClick={handleSearch} disabled={state.isLoading}>
            {state.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </Button>
          <Button variant="outline" onClick={handleIntelligentDiscovery} disabled={state.isLoading}>
            <Brain className="w-4 h-4" />
            AI Discovery
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Select value={state.filters.industry} onValueChange={(value) => updateFilter('industry', value)}>
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
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="hospitality">Hospitality</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="business-type">Business Type</Label>
          <Select value={state.filters.businessType} onValueChange={(value) => updateFilter('businessType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="service-provider">Service Provider</SelectItem>
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
          <Label htmlFor="complexity">Complexity</Label>
          <Select value={state.filters.complexity} onValueChange={(value) => updateFilter('complexity', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Complexity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Simple</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="complex">Complex</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="budget">Budget</Label>
          <Select value={state.filters.budget} onValueChange={(value) => updateFilter('budget', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Budget" />
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
          <Select value={state.filters.timeline} onValueChange={(value) => updateFilter('timeline', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Timeline" />
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

        <div className="flex items-end">
          <Button variant="outline" onClick={clearFilters} size="sm">
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Use Case Description */}
      <div>
        <Label htmlFor="use-case">Describe your specific use case (optional)</Label>
        <Textarea
          id="use-case"
          placeholder="Provide more details about your specific requirements, target audience, and goals..."
          value={state.filters.useCase}
          onChange={(e) => updateFilter('useCase', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-6">
      {state.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{state.error}</p>
          </CardContent>
        </Card>
      )}

      {state.results.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Search Results ({state.results.length})
          </h3>
          <div className="grid gap-4">
            {state.results.map((result, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{result.name}</CardTitle>
                      <CardDescription>{result.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={result.score > 80 ? 'default' : result.score > 60 ? 'secondary' : 'outline'}>
                        {result.score}% match
                      </Badge>
                      <Badge variant="outline">{result.complexity}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Key Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {result.features.map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Setup Time:</span>
                        <p className="text-muted-foreground">{result.setupTime}</p>
                      </div>
                      <div>
                        <span className="font-medium">Success Rate:</span>
                        <p className="text-muted-foreground">{Math.round(result.successRate * 100)}%</p>
                      </div>
                      <div>
                        <span className="font-medium">Industry Fit:</span>
                        <p className="text-muted-foreground">{result.industryFit}%</p>
                      </div>
                      <div>
                        <span className="font-medium">Confidence:</span>
                        <p className="text-muted-foreground">{Math.round(result.confidence * 100)}%</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <p className="text-sm text-muted-foreground">{result.reasoning}</p>
                      <Button size="sm">
                        View Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        AI-Powered Recommendations
      </h3>
      
      <div className="grid gap-4">
        {state.recommendations.map((recommendation, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {recommendation.name}
                    {recommendation.isAIRecommended && (
                      <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-blue-500">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Pick
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{recommendation.description}</CardDescription>
                </div>
                <Badge variant="outline">{recommendation.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Popularity:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${recommendation.popularityScore}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground">{recommendation.popularityScore}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Success Rate:</span>
                    <p className="text-muted-foreground">{Math.round(recommendation.successRate * 100)}%</p>
                  </div>
                  <div>
                    <span className="font-medium">Setup Time:</span>
                    <p className="text-muted-foreground">{recommendation.averageSetupTime}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Why we recommend this:</p>
                  <p className="text-sm text-muted-foreground">{recommendation.aiReasoning}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Best for:</p>
                  <div className="flex flex-wrap gap-1">
                    {recommendation.bestUseCases.map((useCase, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {useCase}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">
                      Trending in {recommendation.trendingIndustries.join(', ')}
                    </span>
                  </div>
                  <Button size="sm">
                    Explore Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-6">
      {state.analysis && (
        <>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Analysis & Insights
          </h3>
          
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Market Analysis</CardTitle>
                <CardDescription>AI-powered insights about your requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Market Demand:</p>
                    <p className="text-sm text-muted-foreground">{state.analysis.marketDemand}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Competitive Landscape:</p>
                    <p className="text-sm text-muted-foreground">{state.analysis.competitiveLandscape}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Success Factors:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {state.analysis.successFactors.map((factor, idx) => (
                        <li key={idx}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
                <CardDescription>AI suggestions to improve your template selection</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  {state.analysis.optimizationSuggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          AI-Powered Template Discovery
        </h1>
        <p className="text-muted-foreground">
          Discover the perfect template for your project using AI-powered analysis and intelligent recommendations.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Smart Search</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="analysis">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {renderSearchInterface()}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {renderResults()}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {renderRecommendations()}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {renderAnalysis()}
        </TabsContent>
      </Tabs>

      {state.isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p>AI is analyzing your requirements...</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
