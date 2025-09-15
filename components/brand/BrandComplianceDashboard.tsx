/**
 * @fileoverview HT-011.4.3: Brand Compliance Dashboard Component
 * @module components/brand/BrandComplianceDashboard
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.4.3 - Create Brand Compliance Checking System
 * Focus: Admin dashboard for brand compliance management and monitoring
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (branding system enhancement)
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ComplianceCheckResult, 
  ComplianceRuleResult, 
  ComplianceCategory 
} from '@/lib/branding/brand-compliance-engine';
import {
  ComplianceAlert,
  type ComplianceMonitoringStats,
  ComplianceEvent
} from '@/lib/branding/compliance-monitoring-service';
import { TenantBrandConfig } from '@/lib/branding/types';

/**
 * Compliance dashboard props
 */
interface BrandComplianceDashboardProps {
  /** Tenant brand configuration */
  config: TenantBrandConfig | null;
  /** Tenant ID */
  tenantId?: string;
  /** Dashboard mode */
  mode?: 'overview' | 'detailed' | 'alerts' | 'history';
  /** Enable real-time updates */
  enableRealTime?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Compliance score indicator component
 */
interface ComplianceScoreIndicatorProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ComplianceScoreIndicator({ 
  score, 
  size = 'md', 
  showLabel = true 
}: ComplianceScoreIndicatorProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return '✅';
    if (score >= 70) return '⚠️';
    if (score >= 50) return '🔶';
    return '❌';
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl'
  };

  return (
    <div className={`flex items-center gap-3 ${sizeClasses[size]}`}>
      <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${getScoreColor(score)}`}>
        <span className="font-bold">{score}</span>
      </div>
      {showLabel && (
        <div>
          <div className="text-sm font-medium text-gray-900">
            Compliance Score
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <span>{getScoreIcon(score)}</span>
            <span>
              {score >= 90 ? 'Excellent' : 
               score >= 70 ? 'Good' : 
               score >= 50 ? 'Fair' : 'Poor'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compliance category breakdown component
 */
interface ComplianceCategoryBreakdownProps {
  result: ComplianceCheckResult;
  showDetails?: boolean;
}

export function ComplianceCategoryBreakdown({ 
  result, 
  showDetails = true 
}: ComplianceCategoryBreakdownProps) {
  const categories: { 
    key: ComplianceCategory; 
    label: string; 
    color: string; 
    icon: string; 
  }[] = [
    { key: 'accessibility', label: 'Accessibility', color: 'bg-blue-500', icon: '♿' },
    { key: 'usability', label: 'Usability', color: 'bg-green-500', icon: '🎯' },
    { key: 'design-consistency', label: 'Design Consistency', color: 'bg-purple-500', icon: '🎨' },
    { key: 'industry-standards', label: 'Industry Standards', color: 'bg-orange-500', icon: '🏢' },
    { key: 'brand-guidelines', label: 'Brand Guidelines', color: 'bg-pink-500', icon: '📋' },
    { key: 'performance', label: 'Performance', color: 'bg-indigo-500', icon: '⚡' },
    { key: 'security', label: 'Security', color: 'bg-red-500', icon: '🔒' }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Compliance Breakdown</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(({ key, label, color, icon }) => {
          const summary = result.categorySummary[key];
          if (!summary || summary.total === 0) return null;

          return (
            <div key={key} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{icon}</span>
                <span className="font-medium text-gray-900">{label}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Score</span>
                  <span className="font-medium">{summary.score}/100</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${color} transition-all duration-300`}
                    style={{ width: `${summary.score}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{summary.passed} passed</span>
                  <span>{summary.failed} failed</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showDetails && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">WCAG Compliance</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium">Level A</div>
              <div className={result.wcagCompliance.levelA ? 'text-green-600' : 'text-red-600'}>
                {result.wcagCompliance.levelA ? '✅ Pass' : '❌ Fail'}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">Level AA</div>
              <div className={result.wcagCompliance.levelAA ? 'text-green-600' : 'text-red-600'}>
                {result.wcagCompliance.levelAA ? '✅ Pass' : '❌ Fail'}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">Level AAA</div>
              <div className={result.wcagCompliance.levelAAA ? 'text-green-600' : 'text-red-600'}>
                {result.wcagCompliance.levelAAA ? '✅ Pass' : '❌ Fail'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compliance issues list component
 */
interface ComplianceIssuesListProps {
  issues: ComplianceRuleResult[];
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  maxItems?: number;
}

export function ComplianceIssuesList({ 
  issues, 
  title, 
  severity, 
  maxItems = 10 
}: ComplianceIssuesListProps) {
  const displayIssues = issues.slice(0, maxItems);
  const remainingCount = issues.length - maxItems;

  if (displayIssues.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '🔶';
      case 'low': return 'ℹ️';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
        <span>{getSeverityIcon(severity)}</span>
        <span>{title}</span>
        <span className="text-sm font-normal text-gray-500">({issues.length})</span>
      </h3>
      
      <div className="space-y-2">
        {displayIssues.map((issue, index) => (
          <div 
            key={index}
            className={`p-3 rounded-lg border-l-4 ${getSeverityColor(severity)}`}
          >
            <div className="flex items-start gap-2">
              <span className="text-sm">{getSeverityIcon(severity)}</span>
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {issue.ruleName}
                </div>
                <div className="text-sm mt-1">
                  {issue.message}
                </div>
                {issue.suggestion && (
                  <div className="text-xs text-gray-600 mt-1 italic">
                    💡 {issue.suggestion}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span>Score: {issue.score}/100</span>
                  {issue.wcagLevel && <span>WCAG {issue.wcagLevel}</span>}
                  {issue.industryStandard && <span>{issue.industryStandard}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="text-center text-sm text-gray-500 py-2">
            ... and {remainingCount} more {severity} issue{remainingCount > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compliance alerts panel component
 */
interface ComplianceAlertsPanelProps {
  alerts: ComplianceAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  maxItems?: number;
}

export function ComplianceAlertsPanel({ 
  alerts, 
  onAcknowledgeAlert, 
  maxItems = 20 
}: ComplianceAlertsPanelProps) {
  const displayAlerts = alerts.slice(0, maxItems);
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  if (displayAlerts.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="text-4xl mb-2">✅</div>
        <div className="text-lg font-medium">No Compliance Alerts</div>
        <div className="text-sm">All compliance checks are passing</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Compliance Alerts</h3>
        <div className="text-sm text-gray-500">
          {unacknowledgedAlerts.length} unacknowledged
        </div>
      </div>

      <div className="space-y-3">
        {displayAlerts.map((alert) => (
          <div 
            key={alert.id}
            className={`p-4 rounded-lg border ${
              alert.acknowledged 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-white border-gray-300 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {alert.timestamp.toLocaleString()}
                  </span>
                </div>
                
                <div className="font-medium text-gray-900 mb-1">
                  {alert.title}
                </div>
                
                <div className="text-sm text-gray-600">
                  {alert.message}
                </div>
              </div>
              
              {!alert.acknowledged && (
                <button
                  onClick={() => onAcknowledgeAlert(alert.id)}
                  className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Compliance monitoring statistics component
 */
interface ComplianceMonitoringStatsProps {
  stats: ComplianceMonitoringStats;
  className?: string;
}

export function ComplianceMonitoringStats({ 
  stats, 
  className = '' 
}: ComplianceMonitoringStatsProps) {
  return (
    <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Monitoring Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalChecks}</div>
          <div className="text-sm text-gray-600">Total Checks</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.averageScore}</div>
          <div className="text-sm text-gray-600">Avg Score</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{Math.round(stats.complianceRate * 100)}%</div>
          <div className="text-sm text-gray-600">Compliance Rate</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.unacknowledgedAlerts}</div>
          <div className="text-sm text-gray-600">Active Alerts</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Brand Compliance Dashboard component
 */
export function BrandComplianceDashboard({
  config,
  tenantId,
  mode = 'overview',
  enableRealTime = true,
  className = ''
}: BrandComplianceDashboardProps) {
  const [complianceResult, setComplianceResult] = useState<ComplianceCheckResult | null>(null);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [stats, setStats] = useState<ComplianceMonitoringStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState(mode);

  /**
   * Perform compliance check
   */
  const performComplianceCheck = useCallback(async () => {
    if (!config) return;

    setIsLoading(true);
    setError(null);

    try {
      // Import compliance monitoring service dynamically
      const { ComplianceMonitoringUtils } = await import('@/lib/branding/compliance-monitoring-service');
      
      const result = await ComplianceMonitoringUtils.performComplianceCheck(config);
      setComplianceResult(result);
      
      // Update alerts and stats
      const updatedAlerts = ComplianceMonitoringUtils.getComplianceAlerts(tenantId);
      setAlerts(updatedAlerts);
      
      const updatedStats = ComplianceMonitoringUtils.getMonitoringStats();
      setStats(updatedStats);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Compliance check failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [config, tenantId]);

  /**
   * Acknowledge alert
   */
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      const { ComplianceMonitoringUtils } = await import('@/lib/branding/compliance-monitoring-service');
      
      // In a real implementation, this would call an API endpoint
      // For now, we'll just update the local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
      
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  }, []);

  /**
   * Load initial data
   */
  useEffect(() => {
    if (config) {
      performComplianceCheck();
    }
  }, [config, performComplianceCheck]);

  /**
   * Set up real-time updates
   */
  useEffect(() => {
    if (!enableRealTime || !tenantId) return;

    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket(`ws://localhost:3000/api/compliance-monitor?tenantId=${tenantId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'compliance_update') {
        performComplianceCheck();
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [enableRealTime, tenantId, performComplianceCheck]);

  if (isLoading) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <div className="text-gray-600">Running compliance check...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="text-red-600 mb-4">
          <div className="text-4xl mb-2">❌</div>
          <div className="font-medium">Compliance Check Failed</div>
          <div className="text-sm mt-1">{error}</div>
        </div>
        <button 
          onClick={performComplianceCheck}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!complianceResult) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="text-gray-500">
          <div className="text-4xl mb-2">📋</div>
          <div className="text-lg font-medium">No Compliance Data</div>
          <div className="text-sm mt-1">Run a compliance check to get started</div>
        </div>
        <button 
          onClick={performComplianceCheck}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Run Compliance Check
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Brand Compliance Dashboard</h2>
          <p className="text-gray-600">Monitor and manage brand compliance across all dimensions</p>
        </div>
        
        <div className="flex items-center gap-4">
          <ComplianceScoreIndicator 
            score={complianceResult.overallScore} 
            size="lg" 
          />
          <button 
            onClick={performComplianceCheck}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'detailed', label: 'Detailed', icon: '🔍' },
            { key: 'alerts', label: 'Alerts', icon: '🚨' },
            { key: 'history', label: 'History', icon: '📈' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setCurrentMode(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentMode === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{icon}</span>
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content based on mode */}
      {currentMode === 'overview' && (
        <div className="space-y-6">
          <ComplianceCategoryBreakdown result={complianceResult} />
          
          {stats && (
            <ComplianceMonitoringStats stats={stats} />
          )}
        </div>
      )}

      {currentMode === 'detailed' && (
        <div className="space-y-6">
          <ComplianceIssuesList 
            issues={complianceResult.criticalIssues}
            title="Critical Issues"
            severity="critical"
          />
          
          <ComplianceIssuesList 
            issues={complianceResult.highPriorityIssues}
            title="High Priority Issues"
            severity="high"
          />
          
          <ComplianceIssuesList 
            issues={complianceResult.mediumPriorityIssues}
            title="Medium Priority Issues"
            severity="medium"
          />
          
          <ComplianceIssuesList 
            issues={complianceResult.lowPriorityIssues}
            title="Low Priority Issues"
            severity="low"
          />
        </div>
      )}

      {currentMode === 'alerts' && (
        <ComplianceAlertsPanel 
          alerts={alerts}
          onAcknowledgeAlert={acknowledgeAlert}
        />
      )}

      {currentMode === 'history' && (
        <div className="p-6 text-center text-gray-500">
          <div className="text-4xl mb-2">📈</div>
          <div className="text-lg font-medium">Compliance History</div>
          <div className="text-sm mt-1">Historical compliance data and trends</div>
        </div>
      )}
    </div>
  );
}
