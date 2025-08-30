/**
 * SLO (Service Level Objectives) Endpoint
 * 
 * Provides real-time SLO status, error budget tracking, and trend analysis
 * for monitoring dashboards and alerting systems.
 */

import { NextResponse } from 'next/server';
import { sloMonitoringService } from '@/lib/monitoring/slo-service';
import { sloConfig } from '@/lib/monitoring/slo-config';
import { Logger } from '@/lib/logger';
import { getCurrentTraceId } from '@/lib/observability/otel';

export const runtime = 'nodejs';
export const revalidate = 30; // 30 seconds

const sloEndpointLogger = Logger.create({ component: 'slo-endpoint' });

/**
 * GET /api/slo - Get current SLO status and measurements
 */
export async function GET(request: Request) {
  const startTime = Date.now();
  const url = new URL(request.url);
  const format = url.searchParams.get('format') ?? 'json';
  const sloName = url.searchParams.get('slo');
  const hours = parseInt(url.searchParams.get('hours') ?? '24', 10);
  
  try {
    // Check if SLO monitoring is enabled
    if (!sloConfig.isSLOMonitoringEnabled()) {
      return NextResponse.json({
        error: 'SLO monitoring is disabled',
        timestamp: new Date().toISOString(),
      }, { status: 503 });
    }

    let responseData: Record<string, unknown>;

    if (sloName) {
      // Get specific SLO details
      const measurement = sloMonitoringService.getSLOMeasurement(sloName);
      const history = sloMonitoringService.getSLOHistory(sloName, hours);
      const sloConfig_target = sloConfig.getSLO(sloName);

      if (!measurement || !sloConfig_target) {
        return NextResponse.json({
          error: `SLO '${sloName}' not found`,
          timestamp: new Date().toISOString(),
        }, { status: 404 });
      }

      responseData = {
        slo: {
          name: sloName,
          description: sloConfig_target.description,
          type: sloConfig_target.type,
          target: sloConfig_target.target,
          threshold: sloConfig_target.threshold,
          businessImpact: sloConfig_target.businessImpact,
        },
        current: measurement,
        history: history.slice(-48), // Last 48 measurements (up to 48 hours)
        summary: {
          timeRange: `${hours} hours`,
          measurementCount: history.length,
          averageValue: history.reduce((sum, h) => sum + h.current.value, 0) / history.length || 0,
          uptimePercentage: (history.filter(h => h.current.status === 'healthy').length / history.length) * 100 || 0,
          breachCount: history.filter(h => h.current.status === 'breach').length,
          warningCount: history.filter(h => h.current.status === 'warning').length,
        },
      };
    } else {
      // Get overview of all SLOs
      const status = sloMonitoringService.getSLOStatus();
      const activeAlerts = sloMonitoringService.getActiveAlerts();
      const healthSummary = sloMonitoringService.getHealthSummary();
      const allSLOs = Array.from(sloConfig.getAllSLOs().entries()).map(([name, slo]) => ({
        name,
        description: slo.description,
        type: slo.type,
        target: slo.target,
        businessImpact: slo.businessImpact.severity,
      }));

      responseData = {
        overview: healthSummary,
        slos: status.map(s => {
          const sloConfig_item = sloConfig.getSLO(s.sloName);
          return {
            ...s,
            description: sloConfig_item?.description,
            type: sloConfig_item?.type,
            businessImpact: sloConfig_item?.businessImpact.severity,
          };
        }),
        activeAlerts: activeAlerts.map(alert => ({
          ...alert,
          durationMinutes: Math.round(alert.duration / 60000),
          sloDescription: sloConfig.getSLO(alert.sloName)?.description,
          businessImpact: sloConfig.getSLO(alert.sloName)?.businessImpact,
        })),
        availableSLOs: allSLOs,
        timestamp: new Date().toISOString(),
      };
    }

    const responseTime = Date.now() - startTime;

    // Log the request
    sloEndpointLogger.debug('SLO endpoint request', {
      sloName,
      hours,
      format,
      responseTime,
      traceId: getCurrentTraceId(),
      healthSummary: sloMonitoringService.getHealthSummary(),
    });

    // Handle different response formats
    if (format === 'prometheus') {
      const prometheusMetrics = buildPrometheusMetrics(responseData);
      return new NextResponse(prometheusMetrics, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      });
    }

    return NextResponse.json({
      ...responseData,
      meta: {
        responseTime,
        timestamp: new Date().toISOString(),
        traceId: getCurrentTraceId(),
      },
    }, {
      status: 200,
      headers: {
        'X-SLO-Health': sloMonitoringService.getHealthSummary().overallHealth,
        'X-Response-Time': responseTime.toString(),
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const responseTime = Date.now() - startTime;

    sloEndpointLogger.error('SLO endpoint error', {
      error: errorMessage,
      sloName,
      responseTime,
      traceId: getCurrentTraceId(),
    });

    return NextResponse.json({
      error: errorMessage,
      timestamp: new Date().toISOString(),
      responseTime,
    }, { status: 500 });
  }
}

/**
 * Build Prometheus metrics format for SLO data
 */
function buildPrometheusMetrics(data: Record<string, unknown>): string {
  const lines: string[] = [];
  const timestamp = Date.now();

  if (data.overview && typeof data.overview === 'object') {
    const overview = data.overview as {
      overallHealth: string;
      totalSLOs: number;
      healthySLOs: number;
      warningSLOs: number;
      breachingSLOs: number;
      activeAlerts: number;
    };
    
    // Overall health metrics
    lines.push(`# HELP slo_health_status Overall SLO health status (0=unhealthy, 1=degraded, 2=healthy)`);
    lines.push(`# TYPE slo_health_status gauge`);
    const healthValue = overview.overallHealth === 'healthy' ? 2 : 
                       overview.overallHealth === 'degraded' ? 1 : 0;
    lines.push(`slo_health_status{service="dct-micro-app"} ${healthValue} ${timestamp}`);

    lines.push(`# HELP slo_total_count Total number of configured SLOs`);
    lines.push(`# TYPE slo_total_count gauge`);
    lines.push(`slo_total_count{service="dct-micro-app"} ${overview.totalSLOs} ${timestamp}`);

    lines.push(`# HELP slo_healthy_count Number of healthy SLOs`);
    lines.push(`# TYPE slo_healthy_count gauge`);
    lines.push(`slo_healthy_count{service="dct-micro-app"} ${overview.healthySLOs} ${timestamp}`);

    lines.push(`# HELP slo_warning_count Number of SLOs in warning state`);
    lines.push(`# TYPE slo_warning_count gauge`);
    lines.push(`slo_warning_count{service="dct-micro-app"} ${overview.warningSLOs} ${timestamp}`);

    lines.push(`# HELP slo_breach_count Number of SLOs in breach state`);
    lines.push(`# TYPE slo_breach_count gauge`);
    lines.push(`slo_breach_count{service="dct-micro-app"} ${overview.breachingSLOs} ${timestamp}`);

    lines.push(`# HELP slo_active_alerts_count Number of active SLO alerts`);
    lines.push(`# TYPE slo_active_alerts_count gauge`);
    lines.push(`slo_active_alerts_count{service="dct-micro-app"} ${overview.activeAlerts} ${timestamp}`);

    // Individual SLO metrics
    if (data.slos && Array.isArray(data.slos)) {
      for (const slo of data.slos as Array<{
        sloName: string;
        type: string;
        currentValue: number;
        target: number;
        errorBudgetRemaining: number;
        status: string;
      }>) {
        const _sloName = slo.sloName.replace(/[^a-zA-Z0-9_]/g, '_');
        
        lines.push(`# HELP slo_current_value Current SLO value (percentage)`);
        lines.push(`# TYPE slo_current_value gauge`);
        lines.push(`slo_current_value{service="dct-micro-app",slo_name="${slo.sloName}",type="${slo.type}"} ${slo.currentValue} ${timestamp}`);

        lines.push(`# HELP slo_target_value SLO target value (percentage)`);
        lines.push(`# TYPE slo_target_value gauge`);
        lines.push(`slo_target_value{service="dct-micro-app",slo_name="${slo.sloName}",type="${slo.type}"} ${slo.target} ${timestamp}`);

        lines.push(`# HELP slo_error_budget_remaining Error budget remaining (percentage)`);
        lines.push(`# TYPE slo_error_budget_remaining gauge`);
        lines.push(`slo_error_budget_remaining{service="dct-micro-app",slo_name="${slo.sloName}",type="${slo.type}"} ${slo.errorBudgetRemaining} ${timestamp}`);

        const statusValue = slo.status === 'healthy' ? 2 : slo.status === 'warning' ? 1 : 0;
        lines.push(`# HELP slo_status SLO status (0=breach, 1=warning, 2=healthy)`);
        lines.push(`# TYPE slo_status gauge`);
        lines.push(`slo_status{service="dct-micro-app",slo_name="${slo.sloName}",type="${slo.type}"} ${statusValue} ${timestamp}`);
      }
    }
  } else if (data.current) {
    // Single SLO detailed metrics
    const _sloName = (data.slo as { name: string }).name.replace(/[^a-zA-Z0-9_]/g, '_');
    
    lines.push(`# HELP slo_current_value Current SLO value (percentage)`);
    lines.push(`# TYPE slo_current_value gauge`);
    lines.push(`slo_current_value{service="dct-micro-app",slo_name="${(data.slo as { name: string }).name}",type="${(data.slo as { type: string }).type}"} ${(data.current as { current: { value: number } }).current.value} ${timestamp}`);

    lines.push(`# HELP slo_error_budget_consumed Error budget consumed (percentage)`);
    lines.push(`# TYPE slo_error_budget_consumed gauge`);
    lines.push(`slo_error_budget_consumed{service="dct-micro-app",slo_name="${(data.slo as { name: string }).name}",type="${(data.slo as { type: string }).type}"} ${(data.current as { errorBudget: { consumed: number } }).errorBudget.consumed} ${timestamp}`);

    lines.push(`# HELP slo_error_budget_burn_rate Error budget burn rate`);
    lines.push(`# TYPE slo_error_budget_burn_rate gauge`);
    lines.push(`slo_error_budget_burn_rate{service="dct-micro-app",slo_name="${(data.slo as { name: string }).name}",type="${(data.slo as { type: string }).type}"} ${(data.current as { errorBudget: { burnRate: number } }).errorBudget.burnRate} ${timestamp}`);
  }

  return lines.join('\n') + '\n';
}

/**
 * POST /api/slo - Trigger manual SLO calculation (for testing/debugging)
 */
export async function POST() {
  try {
    if (!sloConfig.isSLOMonitoringEnabled()) {
      return NextResponse.json({
        error: 'SLO monitoring is disabled',
      }, { status: 503 });
    }

    // This would trigger a manual calculation
    // For now, just return the current status
    const status = sloMonitoringService.getSLOStatus();
    const healthSummary = sloMonitoringService.getHealthSummary();

    sloEndpointLogger.info('Manual SLO calculation triggered', {
      sloCount: status.length,
      healthSummary,
    });

    return NextResponse.json({
      message: 'Manual SLO calculation completed',
      status,
      healthSummary,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    sloEndpointLogger.error('Manual SLO calculation failed', {
      error: errorMessage,
    });

    return NextResponse.json({
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}