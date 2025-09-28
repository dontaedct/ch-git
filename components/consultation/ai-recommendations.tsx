'use client'

/**
 * AI Recommendations Display Component
 *
 * Interactive component for displaying AI-generated service recommendations
 * with detailed explanations, scoring, and selection functionality.
 */

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  ArrowRight,
  Info,
  Lightbulb,
  Target
} from 'lucide-react'
import type { ServiceMatch, MatchingResult } from '@/lib/consultation/service-matcher'
import type { ServicePackage } from '@/lib/ai/consultation-generator'

export interface AIRecommendationsProps {
  matchingResult: MatchingResult;
  onServiceSelect?: (service: ServicePackage) => void;
  onGetDetails?: (serviceId: string) => void;
  showScoring?: boolean;
  maxDisplay?: number;
}

/**
 * Display AI-generated service recommendations with interactive elements
 */
export function AIRecommendations({
  matchingResult,
  onServiceSelect,
  onGetDetails,
  showScoring = true,
  maxDisplay = 5
}: AIRecommendationsProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [expandedReasons, setExpandedReasons] = useState<Set<string>>(new Set());

  const handleServiceSelect = useCallback((service: ServicePackage) => {
    setSelectedService(service.id);
    onServiceSelect?.(service);
  }, [onServiceSelect]);

  const toggleReasons = useCallback((serviceId: string) => {
    setExpandedReasons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  }, []);

  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationTypeIcon = (type: 'primary' | 'alternative' | 'consider') => {
    switch (type) {
      case 'primary': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'alternative': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'consider': return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const displayMatches = [
    ...matchingResult.primary_matches,
    ...matchingResult.alternative_matches
  ].slice(0, maxDisplay);

  return (
    <div className="space-y-6">
      {/* Header with overall confidence */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Lightbulb className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold text-gray-900">
            AI-Powered Service Recommendations
          </h3>
        </div>

        {showScoring && (
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>
                Matching Confidence: {Math.round(matchingResult.matching_confidence * 100)}%
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <span>
              {matchingResult.total_services_evaluated} services evaluated
            </span>
          </div>
        )}
      </div>

      {/* Primary recommendations */}
      {matchingResult.primary_matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <h4 className="text-lg font-medium text-gray-900">Top Recommendations</h4>
          </div>

          <div className="grid gap-4">
            {matchingResult.primary_matches.map((match) => (
              <ServiceMatchCard
                key={match.service.id}
                match={match}
                isSelected={selectedService === match.service.id}
                isExpanded={expandedReasons.has(match.service.id)}
                onSelect={handleServiceSelect}
                onToggleReasons={toggleReasons}
                onGetDetails={onGetDetails}
                showScoring={showScoring}
                getConfidenceColor={getConfidenceColor}
                getRecommendationTypeIcon={getRecommendationTypeIcon}
              />
            ))}
          </div>
        </div>
      )}

      {/* Alternative recommendations */}
      {matchingResult.alternative_matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h4 className="text-lg font-medium text-gray-900">Alternative Options</h4>
          </div>

          <div className="grid gap-4">
            {matchingResult.alternative_matches.slice(0, 3).map((match) => (
              <ServiceMatchCard
                key={match.service.id}
                match={match}
                isSelected={selectedService === match.service.id}
                isExpanded={expandedReasons.has(match.service.id)}
                onSelect={handleServiceSelect}
                onToggleReasons={toggleReasons}
                onGetDetails={onGetDetails}
                showScoring={showScoring}
                getConfidenceColor={getConfidenceColor}
                getRecommendationTypeIcon={getRecommendationTypeIcon}
              />
            ))}
          </div>
        </div>
      )}

      {/* No recommendations fallback */}
      {displayMatches.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <div className="space-y-3">
              <Info className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-medium text-gray-900">
                No Strong Matches Found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Based on your responses, we couldn't find services that closely match your needs.
                Our team will review your requirements and provide custom recommendations.
              </p>
              <Button variant="outline" className="mt-4">
                Request Custom Consultation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Individual service match card component
 */
interface ServiceMatchCardProps {
  match: ServiceMatch;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (service: ServicePackage) => void;
  onToggleReasons: (serviceId: string) => void;
  onGetDetails?: (serviceId: string) => void;
  showScoring: boolean;
  getConfidenceColor: (confidence: 'high' | 'medium' | 'low') => string;
  getRecommendationTypeIcon: (type: 'primary' | 'alternative' | 'consider') => React.ReactNode;
}

function ServiceMatchCard({
  match,
  isSelected,
  isExpanded,
  onSelect,
  onToggleReasons,
  onGetDetails,
  showScoring,
  getConfidenceColor,
  getRecommendationTypeIcon
}: ServiceMatchCardProps) {
  const { service, match_score, match_reasons, confidence_level, recommendation_type } = match;

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      isSelected ? 'ring-2 ring-primary shadow-md' : ''
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              {getRecommendationTypeIcon(recommendation_type)}
              <CardTitle className="text-lg">{service.title}</CardTitle>
              <Badge
                variant="outline"
                className={`text-xs font-medium px-2 py-1 ${getConfidenceColor(confidence_level)}`}
              >
                {confidence_level} confidence
              </Badge>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              {service.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary" className="text-xs">
                {service.tier.charAt(0).toUpperCase() + service.tier.slice(1)}
              </Badge>
              {service.price_band && (
                <Badge variant="outline" className="text-xs">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {service.price_band}
                </Badge>
              )}
              {service.timeline && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {service.timeline}
                </Badge>
              )}
            </div>
          </div>

          {showScoring && (
            <div className="text-right space-y-1 ml-4">
              <div className="text-2xl font-bold text-primary">
                {Math.round(match_score * 100)}%
              </div>
              <div className="text-xs text-gray-500">Match Score</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Match reasons */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleReasons(service.id)}
            className="h-auto p-0 text-primary hover:text-primary/80"
          >
            <span className="text-sm font-medium">
              Why this fits ({match_reasons.length} reasons)
            </span>
            <ArrowRight className={`w-4 h-4 ml-1 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`} />
          </Button>

          {isExpanded && (
            <div className="mt-3 space-y-2">
              {match_reasons.map((reason, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service includes */}
        {service.includes.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-2">What's Included</h5>
            <div className="grid gap-1">
              {service.includes.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
              {service.includes.length > 3 && (
                <div className="text-sm text-gray-500 ml-3.5">
                  +{service.includes.length - 3} more features
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => onSelect(service)}
            className="flex-1"
            variant={isSelected ? "default" : "outline"}
          >
            {isSelected ? 'Selected' : 'Select This Service'}
          </Button>

          {onGetDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGetDetails(service.id)}
              className="px-3"
            >
              Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Quick recommendations summary component
 */
export function QuickRecommendationsSummary({
  recommendations
}: {
  recommendations: ServicePackage[]
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900">Quick Recommendations</h4>

      <div className="grid gap-3">
        {recommendations.map((service, index) => (
          <div key={service.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary">{index + 1}</span>
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-medium text-gray-900 truncate">
                {service.title}
              </h5>
              <p className="text-xs text-gray-600 truncate">
                {service.description}
              </p>
            </div>

            <Badge variant="outline" className="text-xs shrink-0">
              {service.tier}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}