/**
 * @fileoverview Conversion Funnel Analysis Component
 * Displays conversion funnel with drop-off analysis and optimization insights
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useConversionTracking, ConversionFunnel } from '@/lib/hooks/use-analytics';
import {
  TrendingDown, TrendingUp, Users, MousePointer, FileText, Target,
  AlertTriangle, CheckCircle, ArrowRight, BarChart3, Lightbulb
} from 'lucide-react';

interface ConversionFunnelProps {
  appId?: string;
  className?: string;
  showOptimizationTips?: boolean;
}

export function ConversionFunnelComponent({
  appId,
  className,
  showOptimizationTips = true
}: ConversionFunnelProps) {
  const { funnelData, loading } = useConversionTracking(appId);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const getStepIcon = (step: string) => {
    switch (step.toLowerCase()) {
      case 'visitors': return <Users className="w-5 h-5" />;
      case 'page views': return <MousePointer className="w-5 h-5" />;
      case 'form starts': return <FileText className="w-5 h-5" />;
      case 'form completions': return <CheckCircle className="w-5 h-5" />;
      case 'conversions': return <Target className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getStepColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-yellow-500',
      'bg-orange-500',
      'bg-red-500'
    ];
    return colors[index % colors.length];
  };

  const getDropoffSeverity = (dropoffRate: number) => {
    if (dropoffRate < 20) return { level: 'low', color: 'text-green-600', bg: 'bg-green-50' };
    if (dropoffRate < 50) return { level: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'high', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const getOptimizationTips = (step: string, dropoffRate: number) => {
    const tips: Record<string, string[]> = {
      'visitors': [
        'Improve page load speed',
        'Optimize for mobile devices',
        'Enhance SEO and meta descriptions'
      ],
      'page views': [
        'Add compelling call-to-action buttons',
        'Improve page navigation',
        'Reduce page complexity'
      ],
      'form starts': [
        'Simplify form fields',
        'Add progress indicators',
        'Improve form design and layout'
      ],
      'form completions': [
        'Reduce form length',
        'Add auto-save functionality',
        'Improve error messaging'
      ],
      'conversions': [
        'Follow up with email sequences',
        'Add social proof and testimonials',
        'Optimize pricing and offers'
      ]
    };

    return tips[step.toLowerCase()] || ['Analyze user behavior patterns'];
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!funnelData || funnelData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No conversion data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalVisitors = funnelData[0]?.count || 0;
  const totalConversions = funnelData[funnelData.length - 1]?.count || 0;
  const overallConversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Funnel Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Conversion Funnel Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalVisitors.toLocaleString()}</div>
              <div className="text-sm text-blue-600">Total Visitors</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalConversions.toLocaleString()}</div>
              <div className="text-sm text-green-600">Total Conversions</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{overallConversionRate.toFixed(1)}%</div>
              <div className="text-sm text-purple-600">Overall Rate</div>
            </div>
          </div>

          {/* Funnel Steps */}
          <div className="space-y-4">
            {funnelData.map((step, index) => {
              const isLast = index === funnelData.length - 1;
              const nextStep = funnelData[index + 1];
              const dropoffRate = step.dropoffRate || 0;
              const severity = getDropoffSeverity(dropoffRate);
              const isSelected = selectedStep === index;

              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={cn(
                    "relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer",
                    isSelected ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => setSelectedStep(isSelected ? null : index)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg text-white", getStepColor(index))}>
                        {getStepIcon(step.step)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{step.step}</h3>
                        <p className="text-sm text-gray-600">
                          {step.count.toLocaleString()} users ({step.percentage.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    
                    {!isLast && (
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm">
                          {dropoffRate > 30 ? (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          ) : (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          )}
                          <span className={cn("font-medium", severity.color)}>
                            {dropoffRate.toFixed(1)}% drop-off
                          </span>
                        </div>
                        <div className={cn("text-xs px-2 py-1 rounded-full mt-1", severity.bg, severity.color)}>
                          {severity.level} impact
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <Progress 
                      value={step.percentage} 
                      className="h-2"
                    />
                  </div>

                  {/* Drop-off Analysis */}
                  {!isLast && nextStep && (
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Continuing to next step: {nextStep.count.toLocaleString()}</span>
                      <span>Drop-off: {(step.count - nextStep.count).toLocaleString()}</span>
                    </div>
                  )}

                  {/* Optimization Tips */}
                  {isSelected && showOptimizationTips && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-sm">Optimization Tips</span>
                      </div>
                      <ul className="space-y-2">
                        {getOptimizationTips(step.step, dropoffRate).map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Arrow to next step */}
                  {!isLast && (
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                      <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-gray-500" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Funnel Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Funnel Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Biggest Drop-off */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h4 className="font-semibold text-red-800">Biggest Drop-off</h4>
              </div>
              {(() => {
                const biggestDropoff = funnelData
                  .filter(step => step.dropoffRate)
                  .reduce((max, step) => 
                    (step.dropoffRate || 0) > (max.dropoffRate || 0) ? step : max
                  );
                
                return biggestDropoff ? (
                  <div>
                    <p className="text-red-700 font-medium">{biggestDropoff.step}</p>
                    <p className="text-red-600 text-sm">
                      {biggestDropoff.dropoffRate?.toFixed(1)}% of users drop off here
                    </p>
                  </div>
                ) : (
                  <p className="text-red-600 text-sm">No significant drop-offs detected</p>
                );
              })()}
            </div>

            {/* Best Performing Step */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold text-green-800">Best Performance</h4>
              </div>
              {(() => {
                const bestStep = funnelData
                  .filter(step => step.dropoffRate !== undefined)
                  .reduce((min, step) => 
                    (step.dropoffRate || 0) < (min.dropoffRate || 0) ? step : min
                  );
                
                return bestStep ? (
                  <div>
                    <p className="text-green-700 font-medium">{bestStep.step}</p>
                    <p className="text-green-600 text-sm">
                      Only {bestStep.dropoffRate?.toFixed(1)}% drop-off rate
                    </p>
                  </div>
                ) : (
                  <p className="text-green-600 text-sm">All steps performing well</p>
                );
              })()}
            </div>
          </div>

          {/* Overall Recommendations */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3">Overall Recommendations</h4>
            <div className="space-y-2">
              {overallConversionRate < 5 && (
                <p className="text-blue-700 text-sm">
                  • Overall conversion rate is below industry average. Focus on improving user experience and reducing friction.
                </p>
              )}
              {funnelData.some(step => (step.dropoffRate || 0) > 50) && (
                <p className="text-blue-700 text-sm">
                  • High drop-off rates detected. Consider A/B testing different approaches for problematic steps.
                </p>
              )}
              {funnelData.length < 4 && (
                <p className="text-blue-700 text-sm">
                  • Consider adding more tracking points to better understand user journey.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ConversionFunnelComponent;
