/**
 * @fileoverview HT-012.3.1: Comparison Matrix Component
 * @module components/test-pages/ComparisonMatrix
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Badge } from '@ui/badge';
import { CheckCircle, Star, Zap, AlertCircle, TrendingUp, Shield } from 'lucide-react';

interface StyleOption {
  id: string;
  name: string;
  description: string;
  route: string;
  preview: string;
  metrics: {
    loadTime: number;
    visualAppeal: number;
    brandAlignment: number;
    mobileExperience: number;
    accessibility: number;
    modernFeel: number;
    professionalAppearance: number;
  };
  pros: string[];
  cons: string[];
}

interface ComparisonCriteria {
  id: string;
  name: string;
  weight: number;
  description: string;
  icon?: React.ReactNode;
}

interface ComparisonMatrixProps {
  styles: StyleOption[];
  criteria: ComparisonCriteria[];
  showWeights?: boolean;
  compact?: boolean;
}

export function ComparisonMatrix({ 
  styles, 
  criteria, 
  showWeights = true,
  compact = false 
}: ComparisonMatrixProps) {
  const calculateOverallScore = (style: StyleOption): number => {
    let totalScore = 0;
    let totalWeight = 0;
    
    criteria.forEach(criterion => {
      const score = style.metrics[criterion.id as keyof StyleOption['metrics']];
      if (score !== undefined) {
        totalScore += score * criterion.weight;
        totalWeight += criterion.weight;
      }
    });
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 9) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 9) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 7) return <Star className="w-4 h-4 text-yellow-600" />;
    if (score >= 5) return <Zap className="w-4 h-4 text-orange-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  const getBestScore = (criterionId: string): number => {
    return Math.max(...styles.map(style => 
      style.metrics[criterionId as keyof StyleOption['metrics']] || 0
    ));
  };

  const getWorstScore = (criterionId: string): number => {
    return Math.min(...styles.map(style => 
      style.metrics[criterionId as keyof StyleOption['metrics']] || 0
    ));
  };

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {styles.map((style) => (
              <div key={style.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{style.name}</h4>
                  <p className="text-sm text-gray-600">{style.description}</p>
                </div>
                <Badge className={getScoreColor(calculateOverallScore(style))}>
                  {calculateOverallScore(style)}/10
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Detailed Comparison Matrix</CardTitle>
        <p className="text-sm text-gray-600">
          Compare all styles across key criteria. Higher scores indicate better performance.
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-3 font-semibold text-gray-700 min-w-[150px]">
                  Criteria
                  {showWeights && <span className="text-xs text-gray-500 block">(Weight)</span>}
                </th>
                {styles.map((style) => (
                  <th key={style.id} className="text-center p-3 font-semibold text-gray-700 min-w-[120px]">
                    <div className="space-y-1">
                      <div className="text-sm">{style.name}</div>
                      <Badge variant="outline" className={getScoreColor(calculateOverallScore(style))}>
                        {calculateOverallScore(style)}/10
                      </Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion) => {
                const bestScore = getBestScore(criterion.id);
                const worstScore = getWorstScore(criterion.id);
                
                return (
                  <tr key={criterion.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {criterion.icon}
                        <div>
                          <div className="font-medium text-sm">{criterion.name}</div>
                          {showWeights && (
                            <div className="text-xs text-gray-500">
                              Weight: {criterion.weight}%
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {styles.map((style) => {
                      const score = style.metrics[criterion.id as keyof StyleOption['metrics']] || 0;
                      const isBest = score === bestScore && bestScore !== worstScore;
                      const isWorst = score === worstScore && bestScore !== worstScore;
                      
                      return (
                        <td key={style.id} className="p-3 text-center">
                          <div className={`flex items-center justify-center space-x-2 p-2 rounded-lg ${
                            isBest ? 'bg-green-50 border border-green-200' :
                            isWorst ? 'bg-red-50 border border-red-200' :
                            'bg-gray-50'
                          }`}>
                            {getScoreIcon(score)}
                            <span className={`font-semibold ${
                              isBest ? 'text-green-700' :
                              isWorst ? 'text-red-700' :
                              'text-gray-700'
                            }`}>
                              {score}
                            </span>
                            {isBest && <TrendingUp className="w-3 h-3 text-green-600" />}
                            {isWorst && <AlertCircle className="w-3 h-3 text-red-600" />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td className="p-3 font-bold text-gray-800">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Overall Score</span>
                  </div>
                </td>
                {styles.map((style) => (
                  <td key={style.id} className="p-3 text-center">
                    <Badge className={`${getScoreColor(calculateOverallScore(style))} text-lg px-3 py-1`}>
                      {calculateOverallScore(style)}/10
                    </Badge>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">
              {styles.reduce((max, style) => 
                Math.max(max, calculateOverallScore(style)), 0
              )}
            </div>
            <div className="text-sm text-green-600">Highest Score</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">
              {Math.round(
                styles.reduce((sum, style) => sum + calculateOverallScore(style), 0) / styles.length
              )}
            </div>
            <div className="text-sm text-blue-600">Average Score</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">
              {styles.length}
            </div>
            <div className="text-sm text-purple-600">Styles Compared</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricScoreProps {
  value: number;
  max: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function MetricScore({ value, max, showIcon = true, size = 'md' }: MetricScoreProps) {
  const percentage = (value / max) * 100;
  
  const getScoreColor = (score: number): string => {
    if (score >= 9) return 'text-green-600 bg-green-50';
    if (score >= 7) return 'text-yellow-600 bg-yellow-50';
    if (score >= 5) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 9) return <CheckCircle className="w-3 h-3" />;
    if (score >= 7) return <Star className="w-3 h-3" />;
    if (score >= 5) return <Zap className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div className="flex items-center space-x-2">
      {showIcon && getScoreIcon(value)}
      <div className="flex items-center space-x-2">
        <div className={`w-16 bg-gray-200 rounded-full h-2`}>
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className={`font-medium ${sizeClasses[size]} ${getScoreColor(value)} rounded`}>
          {value}/{max}
        </span>
      </div>
    </div>
  );
}
