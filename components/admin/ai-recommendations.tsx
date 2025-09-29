/**
 * @fileoverview AI Recommendations Display Components - HT-032.2.1
 * @module components/admin/ai-recommendations
 * @author HT-032.2.1 - AI-Powered Template Discovery & Intelligent Recommendations
 * @version 1.0.0
 *
 * HT-032.2.1: AI-Powered Template Discovery & Intelligent Recommendations
 *
 * Specialized components for displaying AI-powered template recommendations
 * with intelligent insights, confidence scores, and personalized reasoning.
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Star,
  Clock,
  CheckCircle,
  Zap,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Info,
  AlertCircle
} from 'lucide-react';
import type { TemplateRecommendation } from '@/lib/ai/template-recommendations';

interface AIRecommendationCardProps {
  recommendation: TemplateRecommendation;
  rank?: number;
  showRank?: boolean;
  showConfidence?: boolean;
  onExplore?: (templateId: string) => void;
  onFeedback?: (templateId: string, feedback: 'positive' | 'negative') => void;
}

interface AIInsightsPanelProps {
  recommendations: TemplateRecommendation[];
  totalAnalyzed: number;
  confidenceThreshold?: number;
}

interface RecommendationReasoningProps {
  reasoning: string;
  confidence: number;
  factors?: string[];
  isTopPick?: boolean;
}

interface TrendingInsightProps {
  template: TemplateRecommendation;
  showGrowthMetrics?: boolean;
}

interface PersonalizedMatchProps {
  template: TemplateRecommendation;
  userContext?: any;
  matchFactors?: string[];
}

/**
 * AI Recommendation Card Component
 */
export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({
  recommendation,
  rank,
  showRank = false,
  showConfidence = true,
  onExplore,
  onFeedback
}) => {
  const handleExplore = () => onExplore?.(recommendation.id);
  const handleFeedback = (feedback: 'positive' | 'negative') => {
    onFeedback?.(recommendation.id, feedback);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group relative">
      {showRank && rank && (
        <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
          {rank}
        </div>
      )}
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {recommendation.name}
              {recommendation.isAIRecommended && (
                <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-blue-500">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Pick
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {recommendation.description}
            </CardDescription>
          </div>
          <Badge variant="outline">{recommendation.category}</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* AI Reasoning */}
          <RecommendationReasoning
            reasoning={recommendation.aiReasoning}
            confidence={recommendation.metadata.confidenceLevel}
            isTopPick={rank === 1}
          />

          {/* Template Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">{recommendation.userSatisfactionScore.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-medium">{Math.round(recommendation.successRate * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{recommendation.averageSetupTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="font-medium">{recommendation.popularityScore}%</span>
            </div>
          </div>

          {/* Best Use Cases */}
          <div>
            <p className="text-sm font-medium mb-2">Perfect for:</p>
            <div className="flex flex-wrap gap-1">
              {recommendation.bestUseCases.slice(0, 3).map((useCase, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {useCase}
                </Badge>
              ))}
            </div>
          </div>

          {/* Trending Industries */}
          {recommendation.trendingIndustries.length > 0 && (
            <TrendingInsight 
              template={recommendation} 
              showGrowthMetrics={false}
            />
          )}

          {/* Competitive Advantages */}
          <div>
            <p className="text-sm font-medium mb-2">Key advantages:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {recommendation.competitiveAdvantages.slice(0, 2).map((advantage, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <Zap className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                  {advantage}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleFeedback('positive')}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleFeedback('negative')}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <ThumbsDown className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              {showConfidence && (
                <div className="text-xs text-muted-foreground">
                  {Math.round(recommendation.metadata.confidenceLevel * 100)}% confidence
                </div>
              )}
              <Button size="sm" onClick={handleExplore}>
                Explore
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * AI Insights Panel Component
 */
export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  recommendations,
  totalAnalyzed,
  confidenceThreshold = 0.7
}) => {
  const highConfidenceRecs = recommendations.filter(
    rec => rec.metadata.confidenceLevel >= confidenceThreshold
  );
  const aiRecommendedCount = recommendations.filter(rec => rec.isAIRecommended).length;
  const averageConfidence = recommendations.reduce(
    (sum, rec) => sum + rec.metadata.confidenceLevel, 0
  ) / recommendations.length;

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Analysis Summary
        </CardTitle>
        <CardDescription>
          Intelligent insights from analyzing {totalAnalyzed} templates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{aiRecommendedCount}</div>
              <div className="text-sm text-purple-700">AI Recommended</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{highConfidenceRecs.length}</div>
              <div className="text-sm text-blue-700">High Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(averageConfidence * 100)}%
              </div>
              <div className="text-sm text-green-700">Avg Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalAnalyzed}</div>
              <div className="text-sm text-orange-700">Templates Analyzed</div>
            </div>
          </div>

          {/* Confidence Distribution */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Recommendation Confidence</span>
              <span className="text-xs text-muted-foreground">
                {Math.round(averageConfidence * 100)}% average
              </span>
            </div>
            <Progress 
              value={averageConfidence * 100} 
              className="h-2 bg-purple-100"
            />
          </div>

          {/* AI Insights */}
          <div className="bg-white/50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-purple-600 mt-0.5" />
              <div className="text-sm text-purple-800">
                <p className="font-medium mb-1">AI Analysis Insights:</p>
                <ul className="space-y-1 text-xs">
                  <li>• {aiRecommendedCount} templates show exceptional alignment with your needs</li>
                  <li>• {highConfidenceRecs.length} recommendations exceed {Math.round(confidenceThreshold * 100)}% confidence threshold</li>
                  <li>• Analysis considers user feedback, success rates, and market trends</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Recommendation Reasoning Component
 */
export const RecommendationReasoning: React.FC<RecommendationReasoningProps> = ({
  reasoning,
  confidence,
  factors = [],
  isTopPick = false
}) => {
  return (
    <div className={`p-3 rounded-lg border ${
      isTopPick 
        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
        : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
    }`}>
      <div className="flex items-start gap-2">
        <Brain className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
          isTopPick ? 'text-orange-600' : 'text-purple-600'
        }`} />
        <div className="flex-1">
          <p className={`text-sm mb-2 ${
            isTopPick ? 'text-orange-800' : 'text-purple-800'
          }`}>
            {reasoning}
          </p>
          
          {factors.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium mb-1">Key factors:</p>
              <div className="flex flex-wrap gap-1">
                {factors.map((factor, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className={`text-xs ${
              isTopPick ? 'text-orange-600' : 'text-purple-600'
            }`}>
              AI Confidence:
            </span>
            <Progress 
              value={confidence * 100} 
              className={`h-1 flex-1 ${
                isTopPick ? 'bg-orange-200' : 'bg-purple-200'
              }`}
            />
            <span className={`text-xs font-medium ${
              isTopPick ? 'text-orange-600' : 'text-purple-600'
            }`}>
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Trending Insight Component
 */
export const TrendingInsight: React.FC<TrendingInsightProps> = ({
  template,
  showGrowthMetrics = true
}) => {
  return (
    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
      <div className="flex items-start gap-2">
        <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-green-800 mb-2">
            <span className="font-medium">Trending</span> in {template.trendingIndustries.join(', ')}
          </p>
          
          {showGrowthMetrics && (
            <div className="flex items-center gap-4 text-xs text-green-700">
              <span>📈 Growing adoption</span>
              <span>⭐ High satisfaction</span>
              <span>🚀 Market momentum</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Personalized Match Component
 */
export const PersonalizedMatch: React.FC<PersonalizedMatchProps> = ({
  template,
  userContext,
  matchFactors = []
}) => {
  return (
    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
      <div className="flex items-start gap-2">
        <Target className="w-4 h-4 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-blue-800 mb-2">
            <span className="font-medium">Personalized match</span> based on your profile
          </p>
          
          {matchFactors.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {matchFactors.map((factor, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  {factor}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * AI Recommendation Summary Component
 */
export const AIRecommendationSummary: React.FC<{
  totalRecommendations: number;
  aiRecommendations: number;
  averageConfidence: number;
  topCategory: string;
}> = ({ totalRecommendations, aiRecommendations, averageConfidence, topCategory }) => {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI-Powered Recommendations Ready
          </h3>
          <p className="text-sm text-purple-100">
            {aiRecommendations} of {totalRecommendations} templates are AI-recommended • 
            {Math.round(averageConfidence * 100)}% average confidence • 
            Top category: {topCategory}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{aiRecommendations}</div>
          <div className="text-xs text-purple-200">AI Picks</div>
        </div>
      </div>
    </div>
  );
};

/**
 * Recommendation Quality Indicator Component
 */
export const RecommendationQualityIndicator: React.FC<{
  confidence: number;
  dataPoints: number;
  lastAnalyzed: string;
}> = ({ confidence, dataPoints, lastAnalyzed }) => {
  const getQualityColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-600 bg-green-100';
    if (conf >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQualityLabel = (conf: number) => {
    if (conf >= 0.8) return 'High Quality';
    if (conf >= 0.6) return 'Good Quality';
    return 'Lower Confidence';
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <Badge className={getQualityColor(confidence)}>
        {getQualityLabel(confidence)}
      </Badge>
      <span className="text-muted-foreground">
        {dataPoints} data points • Updated {new Date(lastAnalyzed).toLocaleDateString()}
      </span>
    </div>
  );
};

/**
 * AI Processing Status Component
 */
export const AIProcessingStatus: React.FC<{
  isProcessing: boolean;
  stage?: string;
  progress?: number;
}> = ({ isProcessing, stage = 'Analyzing templates', progress }) => {
  if (!isProcessing) return null;

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-blue-900">{stage}...</p>
            <p className="text-sm text-blue-700">
              AI is analyzing templates and generating personalized recommendations
            </p>
            {progress !== undefined && (
              <Progress value={progress} className="mt-2 h-1 bg-blue-200" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
