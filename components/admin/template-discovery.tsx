/**
 * @fileoverview Template Discovery Interface Components - HT-032.2.1
 * @module components/admin/template-discovery
 * @author HT-032.2.1 - AI-Powered Template Discovery & Intelligent Recommendations
 * @version 1.0.0
 *
 * HT-032.2.1: AI-Powered Template Discovery & Intelligent Recommendations
 *
 * Reusable template discovery interface components for AI-powered template
 * discovery, search, and intelligent recommendations.
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Brain, 
  Zap, 
  Users,
  ArrowRight,
  Download,
  Eye,
  Heart
} from 'lucide-react';
import type { TemplateDiscoveryResult } from '@/lib/ai/template-discovery';
import type { TemplateRecommendation } from '@/lib/ai/template-recommendations';

interface TemplateCardProps {
  template: TemplateDiscoveryResult | TemplateRecommendation;
  variant?: 'default' | 'compact' | 'detailed';
  showAIBadge?: boolean;
  onExplore?: (templateId: string) => void;
  onPreview?: (templateId: string) => void;
  onFavorite?: (templateId: string) => void;
}

interface TemplateGridProps {
  templates: (TemplateDiscoveryResult | TemplateRecommendation)[];
  isLoading?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  showAIBadges?: boolean;
  onExplore?: (templateId: string) => void;
  onPreview?: (templateId: string) => void;
  onFavorite?: (templateId: string) => void;
}

interface TemplateStatsProps {
  template: TemplateDiscoveryResult | TemplateRecommendation;
  layout?: 'horizontal' | 'vertical';
}

interface AIInsightProps {
  reasoning: string;
  confidence?: number;
  isRecommended?: boolean;
}

/**
 * Template Card Component
 */
export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  variant = 'default',
  showAIBadge = true,
  onExplore,
  onPreview,
  onFavorite
}) => {
  const isRecommendation = 'isAIRecommended' in template;
  const isAIRecommended = isRecommendation ? template.isAIRecommended : false;
  
  const handleExplore = () => onExplore?.(template.id);
  const handlePreview = () => onPreview?.(template.id);
  const handleFavorite = () => onFavorite?.(template.id);

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h4 className="font-medium flex items-center gap-2">
                {template.name}
                {isAIRecommended && showAIBadge && (
                  <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-blue-500 text-xs">
                    <Brain className="w-3 h-3 mr-1" />
                    AI
                  </Badge>
                )}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
            </div>
            <Badge variant="outline" className="text-xs">{template.category}</Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                {isRecommendation ? template.userSatisfactionScore.toFixed(1) : '4.2'}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                {Math.round(template.successRate * 100)}%
              </span>
            </div>
            <Button size="sm" variant="ghost" onClick={handleExplore}>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className="hover:shadow-lg transition-shadow group">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-xl flex items-center gap-2">
                {template.name}
                {isAIRecommended && showAIBadge && (
                  <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-blue-500">
                    <Brain className="w-4 h-4 mr-1" />
                    AI Recommended
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-2">{template.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{template.category}</Badge>
              <Badge variant="secondary">{'complexity' in template ? template.complexity : 'Medium'}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* AI Insight */}
            {isAIRecommended && (
              <AIInsight 
                reasoning={isRecommendation ? template.aiReasoning : template.reasoning}
                confidence={isRecommendation ? template.metadata.confidenceLevel : template.confidence}
                isRecommended={isAIRecommended}
              />
            )}

            {/* Template Stats */}
            <TemplateStats template={template} layout="horizontal" />

            {/* Features */}
            <div>
              <p className="font-medium mb-2">Key Features:</p>
              <div className="flex flex-wrap gap-1">
                {('features' in template ? template.features : []).slice(0, 6).map((feature: any, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {feature.replace(/-/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Best Use Cases */}
            {isRecommendation && (
              <div>
                <p className="font-medium mb-2">Perfect for:</p>
                <div className="flex flex-wrap gap-1">
                  {template.bestUseCases.slice(0, 3).map((useCase, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {useCase}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Competitive Advantages */}
            {isRecommendation && template.competitiveAdvantages.length > 0 && (
              <div>
                <p className="font-medium mb-2">Advantages:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {template.competitiveAdvantages.slice(0, 3).map((advantage, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Zap className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                      {advantage}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleExplore} className="flex-1">
                <ArrowRight className="w-4 h-4 mr-2" />
                Explore Template
              </Button>
              <Button variant="outline" size="icon" onClick={handlePreview}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleFavorite}>
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="hover:shadow-lg transition-shadow group">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {template.name}
              {isAIRecommended && showAIBadge && (
                <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-blue-500">
                  <Brain className="w-3 h-3 mr-1" />
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
          {/* Template Stats */}
          <TemplateStats template={template} />

          {/* AI Reasoning */}
          {isAIRecommended && (
            <AIInsight 
              reasoning={isRecommendation ? template.aiReasoning : template.reasoning}
              confidence={isRecommendation ? template.metadata.confidenceLevel : template.confidence}
              isRecommended={isAIRecommended}
            />
          )}

          {/* Features */}
          <div>
            <p className="text-sm font-medium mb-2">Features:</p>
            <div className="flex flex-wrap gap-1">
              {('features' in template ? template.features : []).slice(0, 4).map((feature: any, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {feature.replace(/-/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              {isRecommendation 
                ? `${Math.round(template.metadata.confidenceLevel * 100)}% confidence`
                : `${Math.round(template.confidence * 100)}% match`
              }
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handlePreview}>
                Preview
              </Button>
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
 * Template Grid Component
 */
export const TemplateGrid: React.FC<TemplateGridProps> = ({
  templates,
  isLoading = false,
  variant = 'default',
  showAIBadges = true,
  onExplore,
  onPreview,
  onFavorite
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Brain className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Templates Found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or explore our popular templates.
        </p>
      </Card>
    );
  }

  const gridClasses = {
    compact: 'grid gap-4 md:grid-cols-2 lg:grid-cols-4',
    default: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3',
    detailed: 'grid gap-8 lg:grid-cols-2'
  };

  return (
    <div className={gridClasses[variant]}>
      {templates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          variant={variant}
          showAIBadge={showAIBadges}
          onExplore={onExplore}
          onPreview={onPreview}
          onFavorite={onFavorite}
        />
      ))}
    </div>
  );
};

/**
 * Template Stats Component
 */
export const TemplateStats: React.FC<TemplateStatsProps> = ({
  template,
  layout = 'horizontal'
}) => {
  const isRecommendation = 'isAIRecommended' in template;
  const rating = isRecommendation ? template.userSatisfactionScore : 4.2;
  const downloads = isRecommendation ? template.metadata.dataPoints * 100 : (template as any).downloads || 500;

  const stats = [
    {
      icon: Star,
      label: 'Rating',
      value: rating.toFixed(1),
      color: 'text-yellow-500'
    },
    {
      icon: CheckCircle,
      label: 'Success',
      value: `${Math.round(template.successRate * 100)}%`,
      color: 'text-green-500'
    },
    {
      icon: Clock,
      label: 'Setup',
      value: ('setupTime' in template ? template.setupTime : isRecommendation && 'averageSetupTime' in template ? template.averageSetupTime : '2-4 hrs'),
      color: 'text-blue-500'
    },
    {
      icon: TrendingUp,
      label: 'Popularity',
      value: `${isRecommendation ? template.popularityScore : template.score}%`,
      color: 'text-purple-500'
    }
  ];

  if (layout === 'vertical') {
    return (
      <div className="space-y-3">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconComponent className={`w-4 h-4 ${stat.color}`} />
                <span className="text-sm">{stat.label}</span>
              </div>
              <span className="font-medium">{stat.value}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div key={idx} className="flex items-center gap-2">
            <IconComponent className={`w-4 h-4 ${stat.color}`} />
            <span className="font-medium">{stat.value}</span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * AI Insight Component
 */
export const AIInsight: React.FC<AIInsightProps> = ({
  reasoning,
  confidence,
  isRecommended = false
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-200">
      <div className="flex items-start gap-2">
        <Brain className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-purple-800 mb-2">{reasoning}</p>
          {confidence && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-600">AI Confidence:</span>
              <Progress 
                value={confidence * 100} 
                className="h-1 flex-1 bg-purple-200" 
              />
              <span className="text-xs text-purple-600 font-medium">
                {Math.round(confidence * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Template Metrics Component
 */
export const TemplateMetrics: React.FC<{
  template: TemplateDiscoveryResult | TemplateRecommendation;
}> = ({ template }) => {
  const isRecommendation = 'isAIRecommended' in template;
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-xl font-bold text-green-600">
              {Math.round(template.successRate * 100)}%
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Star className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">User Rating</p>
            <p className="text-xl font-bold text-yellow-600">
              {isRecommendation ? template.userSatisfactionScore.toFixed(1) : '4.2'}
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Setup Time</p>
            <p className="text-lg font-bold text-blue-600">
              {('setupTime' in template ? template.setupTime : isRecommendation && 'averageSetupTime' in template ? template.averageSetupTime : '2-4 hrs')}
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Popularity</p>
            <p className="text-xl font-bold text-purple-600">
              {isRecommendation ? template.popularityScore : template.score}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * Template Search Summary Component
 */
export const TemplateSearchSummary: React.FC<{
  query: string;
  totalResults: number;
  aiRecommendations: number;
  filters?: Record<string, string>;
}> = ({ query, totalResults, aiRecommendations, filters }) => {
  const activeFilters = filters ? Object.entries(filters).filter(([_, value]) => value) : [];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-blue-900 mb-1">
            Search Results for "{query}"
          </h3>
          <p className="text-sm text-blue-700">
            Found {totalResults} templates • {aiRecommendations} AI-recommended
          </p>
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {activeFilters.map(([key, value], idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {key}: {value}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <Brain className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  );
};
