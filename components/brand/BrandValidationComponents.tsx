/**
 * @fileoverview HT-011.2.7: Brand Configuration Validation Components
 * @module components/brand/BrandValidationComponents
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.2.7 - Implement Brand Configuration Validation
 * Focus: React components for brand configuration validation UI
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (branding system enhancement)
 */

'use client';

import React from 'react';
import { 
  BrandValidationResult, 
  BrandValidationError, 
  BrandValidationWarning 
} from '@/lib/branding/brand-config-validation';
import { useBrandValidation, useValidationStatistics } from '@/hooks/useBrandValidation';
import { TenantBrandConfig } from '@/lib/branding/types';

/**
 * Validation status indicator component
 */
interface ValidationStatusIndicatorProps {
  result: BrandValidationResult | null;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export function ValidationStatusIndicator({ 
  result, 
  size = 'md', 
  showScore = true 
}: ValidationStatusIndicatorProps) {
  if (!result) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}>
        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
        <span>Not validated</span>
      </div>
    );
  }

  const { valid, overallScore, errors, warnings } = result;
  const errorCount = errors.length;
  const warningCount = warnings.length;

  const getStatusColor = () => {
    if (errorCount > 0) return 'text-red-600 bg-red-100';
    if (warningCount > 0) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusIcon = () => {
    if (errorCount > 0) return '❌';
    if (warningCount > 0) return '⚠️';
    return '✅';
  };

  const getStatusText = () => {
    if (errorCount > 0) return `${errorCount} error${errorCount > 1 ? 's' : ''}`;
    if (warningCount > 0) return `${warningCount} warning${warningCount > 1 ? 's' : ''}`;
    return 'Valid';
  };

  return (
    <div className={`flex items-center gap-2 ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}>
      <div className={`w-3 h-3 rounded-full flex items-center justify-center ${getStatusColor()}`}>
        <span className="text-xs">{getStatusIcon()}</span>
      </div>
      <span className={getStatusColor().split(' ')[0]}>{getStatusText()}</span>
      {showScore && (
        <span className="text-gray-500 text-sm">
          ({overallScore}/100)
        </span>
      )}
    </div>
  );
}

/**
 * Validation error list component
 */
interface ValidationErrorListProps {
  errors: BrandValidationError[];
  warnings: BrandValidationWarning[];
  showSuggestions?: boolean;
  maxItems?: number;
}

export function ValidationErrorList({ 
  errors, 
  warnings, 
  showSuggestions = true,
  maxItems = 10 
}: ValidationErrorListProps) {
  const allIssues = [
    ...errors.map(error => ({ ...error, type: 'error' as const })),
    ...warnings.map(warning => ({ ...warning, type: 'warning' as const }))
  ].slice(0, maxItems);

  if (allIssues.length === 0) {
    return (
      <div className="text-green-600 text-sm flex items-center gap-2">
        <span>✅</span>
        <span>No validation issues found</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {allIssues.map((issue, index) => (
        <div 
          key={index}
          className={`p-3 rounded-lg border-l-4 ${
            issue.type === 'error' 
              ? 'bg-red-50 border-red-400 text-red-800' 
              : 'bg-yellow-50 border-yellow-400 text-yellow-800'
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="text-sm">
              {issue.type === 'error' ? '❌' : '⚠️'}
            </span>
            <div className="flex-1">
              <div className="font-medium text-sm">
                {issue.message}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Path: {issue.path}
              </div>
              {showSuggestions && issue.suggestion && (
                <div className="text-xs text-gray-700 mt-1 italic">
                  💡 {issue.suggestion}
                </div>
              )}
              {issue.wcagLevel && (
                <div className="text-xs text-blue-600 mt-1">
                  WCAG {issue.wcagLevel} Level
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      {allIssues.length >= maxItems && (
        <div className="text-gray-500 text-sm text-center">
          ... and {errors.length + warnings.length - maxItems} more issues
        </div>
      )}
    </div>
  );
}

/**
 * Validation score breakdown component
 */
interface ValidationScoreBreakdownProps {
  result: BrandValidationResult;
  showDetails?: boolean;
}

export function ValidationScoreBreakdown({ 
  result, 
  showDetails = true 
}: ValidationScoreBreakdownProps) {
  const scores = [
    { 
      label: 'Accessibility', 
      score: result.accessibilityScore, 
      color: 'bg-blue-500',
      issues: result.errors.filter(e => e.category === 'accessibility').length
    },
    { 
      label: 'Usability', 
      score: result.usabilityScore, 
      color: 'bg-green-500',
      issues: result.errors.filter(e => e.category === 'usability').length
    },
    { 
      label: 'Design', 
      score: result.designScore, 
      color: 'bg-purple-500',
      issues: result.errors.filter(e => e.category === 'design').length
    },
    { 
      label: 'Branding', 
      score: result.brandScore, 
      color: 'bg-orange-500',
      issues: result.errors.filter(e => e.category === 'branding').length
    }
  ];

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700">Score Breakdown</div>
      
      {scores.map(({ label, score, color, issues }) => (
        <div key={label} className="space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{label}</span>
            <div className="flex items-center gap-2">
              {issues > 0 && (
                <span className="text-red-500 text-xs">
                  {issues} issue{issues > 1 ? 's' : ''}
                </span>
              )}
              <span className="font-medium">{score}/100</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${color} transition-all duration-300`}
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>
      ))}

      {showDetails && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">WCAG Compliance</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Level A</span>
              <span className={result.wcagCompliance.levelA ? 'text-green-600' : 'text-red-600'}>
                {result.wcagCompliance.levelA ? '✅ Pass' : '❌ Fail'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Level AA</span>
              <span className={result.wcagCompliance.levelAA ? 'text-green-600' : 'text-red-600'}>
                {result.wcagCompliance.levelAA ? '✅ Pass' : '❌ Fail'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Level AAA</span>
              <span className={result.wcagCompliance.levelAAA ? 'text-green-600' : 'text-red-600'}>
                {result.wcagCompliance.levelAAA ? '✅ Pass' : '❌ Fail'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Brand validation panel component
 */
interface BrandValidationPanelProps {
  config: TenantBrandConfig | null;
  className?: string;
  showStatistics?: boolean;
  showHistory?: boolean;
}

export function BrandValidationPanel({ 
  config, 
  className = '',
  showStatistics = true,
  showHistory = false
}: BrandValidationPanelProps) {
  const {
    result,
    isValidating,
    error,
    summary,
    statistics,
    validate,
    clearValidation
  } = useBrandValidation(config, {
    autoValidate: true,
    debounceMs: 500
  });

  if (isValidating) {
    return (
      <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-gray-600">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span>Validating brand configuration...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 border border-red-200 rounded-lg bg-red-50 ${className}`}>
        <div className="text-red-800">
          <div className="font-medium">Validation Error</div>
          <div className="text-sm mt-1">{error}</div>
          <button 
            onClick={() => config && validate()}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry Validation
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
        <div className="text-gray-600 text-center">
          <div className="text-sm">No brand configuration to validate</div>
          <button 
            onClick={() => config && validate()}
            className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Validate Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Validation Status */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Validation Status</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => validate()}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Re-validate
            </button>
            <button 
              onClick={clearValidation}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
        
        <ValidationStatusIndicator result={result} size="lg" />
        
        {summary && (
          <div className="mt-3 text-sm text-gray-600">
            {summary.message}
          </div>
        )}
      </div>

      {/* Score Breakdown */}
      {showStatistics && (
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Score Breakdown</h3>
          <ValidationScoreBreakdown result={result} />
        </div>
      )}

      {/* Issues List */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Issues</h3>
        <ValidationErrorList 
          errors={result.errors} 
          warnings={result.warnings}
          showSuggestions={true}
          maxItems={20}
        />
      </div>

      {/* Validation Metadata */}
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="text-sm text-gray-600 space-y-1">
          <div>Last validated: {result.timestamp.toLocaleString()}</div>
          <div>Validation duration: {result.duration}ms</div>
          <div>Total checks: {result.errors.length + result.warnings.length}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Validation progress component
 */
interface ValidationProgressProps {
  isValidating: boolean;
  progress?: number;
  message?: string;
}

export function ValidationProgress({ 
  isValidating, 
  progress = 0, 
  message = 'Validating...' 
}: ValidationProgressProps) {
  if (!isValidating) return null;

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-64">
      <div className="flex items-center gap-3">
        <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">{message}</div>
          {progress > 0 && (
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{progress}% complete</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Validation statistics widget
 */
interface ValidationStatisticsWidgetProps {
  tenantId?: string;
  className?: string;
}

export function ValidationStatisticsWidget({ 
  tenantId, 
  className = '' 
}: ValidationStatisticsWidgetProps) {
  const { statistics, isLoading, error } = useValidationStatistics();

  if (isLoading) {
    return (
      <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 border border-red-200 rounded-lg bg-red-50 ${className}`}>
        <div className="text-red-800 text-sm">
          Failed to load statistics: {error}
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
        <div className="text-gray-600 text-sm">No validation statistics available</div>
      </div>
    );
  }

  return (
    <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
      <h3 className="font-medium text-gray-900 mb-3">Validation Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-600">Total Validations</div>
          <div className="font-medium text-lg">{statistics.totalValidations}</div>
        </div>
        
        <div>
          <div className="text-gray-600">Average Score</div>
          <div className="font-medium text-lg">{statistics.averageScore}/100</div>
        </div>
        
        <div>
          <div className="text-gray-600">Error Rate</div>
          <div className="font-medium text-lg">{statistics.errorRate.toFixed(1)}%</div>
        </div>
        
        <div>
          <div className="text-gray-600">Warning Rate</div>
          <div className="font-medium text-lg">{statistics.warningRate.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}
