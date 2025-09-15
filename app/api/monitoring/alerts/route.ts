/**
 * @fileoverview HT-008.8.8: Comprehensive Alerting API Endpoint
 * @module app/api/monitoring/alerts/route
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.8 - Add comprehensive alerting and notification system
 * Focus: API endpoint for alerting system management and monitoring
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (production alerting, incident management)
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  alertingSystem, 
  AlertDefinition, 
  EscalationPolicy,
  AlertInstance,
  AlertSeverity,
  AlertCategory,
  NotificationChannel 
} from '@/lib/monitoring/alerting-system';
import { Logger } from '@/lib/logger';
import { withSentry } from '@/lib/sentry-wrapper';
import { z } from 'zod';

const logger = Logger.create({ component: 'alerting-api' });

// Request schemas
const CreateAlertSchema = z.object({
  definitionId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
});

const AcknowledgeAlertSchema = z.object({
  alertId: z.string().min(1),
  acknowledgedBy: z.string().min(1),
  note: z.string().optional(),
});

const ResolveAlertSchema = z.object({
  alertId: z.string().min(1),
  resolvedBy: z.string().min(1),
  resolution: z.string().optional(),
});

const RegisterAlertDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.nativeEnum(AlertCategory),
  severity: z.nativeEnum(AlertSeverity),
  conditions: z.array(z.object({
    metric: z.string(),
    operator: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']),
    threshold: z.number(),
    timeWindow: z.number(),
  })),
  channels: z.array(z.nativeEnum(NotificationChannel)),
  escalationPolicy: z.string().optional(),
  suppressionRules: z.object({
    duration: z.number(),
    maxOccurrences: z.number(),
  }).optional(),
  tags: z.array(z.string()),
  runbookUrl: z.string().url().optional(),
});

const RegisterEscalationPolicySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  levels: z.array(z.object({
    level: z.number(),
    delay: z.number(),
    channels: z.array(z.nativeEnum(NotificationChannel)),
    recipients: z.array(z.string()),
    conditions: z.object({
      businessHours: z.boolean().optional(),
      severity: z.array(z.nativeEnum(AlertSeverity)).optional(),
    }).optional(),
  })),
});

/**
 * Create a new alert
 */
export const POST = withSentry(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = CreateAlertSchema.parse(body);

    const alert = await alertingSystem.createAlert(
      validatedData.definitionId,
      validatedData.title,
      validatedData.description,
      validatedData.metadata,
      validatedData.tags
    );

    if (!alert) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create alert',
      }, { status: 400 });
    }

    logger.info('Alert created via API', {
      alertId: alert.id,
      definitionId: validatedData.definitionId,
      title: validatedData.title,
      severity: alert.severity,
    });

    return NextResponse.json({
      success: true,
      alert,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to create alert', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to create alert',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
});

/**
 * Get alerts and statistics
 */
export const GET = withSentry(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');
    const includeHistory = searchParams.get('includeHistory') === 'true';
    const includeStatistics = searchParams.get('includeStatistics') === 'true';
    const limit = searchParams.get('limit');

    if (alertId) {
      // Get specific alert (this would need to be implemented in the alerting system)
      return NextResponse.json({
        success: false,
        error: 'Get specific alert not implemented',
      }, { status: 501 });
    }

    // Get active alerts
    const activeAlerts = alertingSystem.getActiveAlerts();
    
    let alertHistory: AlertInstance[] = [];
    if (includeHistory) {
      const historyLimit = limit ? parseInt(limit) : 100;
      alertHistory = alertingSystem.getAlertHistory(historyLimit);
    }

    let statistics: any = null;
    if (includeStatistics) {
      statistics = alertingSystem.getAlertStatistics();
    }

    logger.info('Alert data retrieved', {
      activeAlerts: activeAlerts.length,
      historyEntries: alertHistory.length,
      includeStatistics,
    });

    return NextResponse.json({
      success: true,
      activeAlerts,
      alertHistory,
      statistics,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to get alert data', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to get alert data',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
});

/**
 * Acknowledge an alert
 */
export const PUT = withSentry(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = AcknowledgeAlertSchema.parse(body);

    const success = await alertingSystem.acknowledgeAlert(
      validatedData.alertId,
      validatedData.acknowledgedBy,
      validatedData.note
    );

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to acknowledge alert',
      }, { status: 400 });
    }

    logger.info('Alert acknowledged via API', {
      alertId: validatedData.alertId,
      acknowledgedBy: validatedData.acknowledgedBy,
    });

    return NextResponse.json({
      success: true,
      alertId: validatedData.alertId,
      acknowledgedBy: validatedData.acknowledgedBy,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to acknowledge alert', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to acknowledge alert',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
});

/**
 * Resolve an alert
 */
export const DELETE = withSentry(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = ResolveAlertSchema.parse(body);

    const success = await alertingSystem.resolveAlert(
      validatedData.alertId,
      validatedData.resolvedBy,
      validatedData.resolution
    );

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to resolve alert',
      }, { status: 400 });
    }

    logger.info('Alert resolved via API', {
      alertId: validatedData.alertId,
      resolvedBy: validatedData.resolvedBy,
    });

    return NextResponse.json({
      success: true,
      alertId: validatedData.alertId,
      resolvedBy: validatedData.resolvedBy,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to resolve alert', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to resolve alert',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
});

/**
 * Register alert definition
 */
export const PATCH = withSentry(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = RegisterAlertDefinitionSchema.parse(body);

    const definition: AlertDefinition = {
      id: validatedData.id,
      name: validatedData.name,
      description: validatedData.description,
      category: validatedData.category,
      severity: validatedData.severity,
      conditions: validatedData.conditions,
      channels: validatedData.channels,
      escalationPolicy: validatedData.escalationPolicy,
      suppressionRules: validatedData.suppressionRules,
      tags: validatedData.tags,
      runbookUrl: validatedData.runbookUrl,
    };

    alertingSystem.registerAlertDefinition(definition);

    logger.info('Alert definition registered via API', {
      definitionId: validatedData.id,
      name: validatedData.name,
      severity: validatedData.severity,
    });

    return NextResponse.json({
      success: true,
      definitionId: validatedData.id,
      message: 'Alert definition registered',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to register alert definition', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to register alert definition',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
});

/**
 * Register escalation policy
 */
export const HEAD = withSentry(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = RegisterEscalationPolicySchema.parse(body);

    const policy: EscalationPolicy = {
      id: validatedData.id,
      name: validatedData.name,
      description: validatedData.description,
      levels: validatedData.levels.map(level => ({
        level: level.level,
        delay: level.delay,
        channels: level.channels,
        recipients: level.recipients,
        conditions: level.conditions,
      })),
    };

    alertingSystem.registerEscalationPolicy(policy);

    logger.info('Escalation policy registered via API', {
      policyId: validatedData.id,
      name: validatedData.name,
      levels: validatedData.levels.length,
    });

    return NextResponse.json({
      success: true,
      policyId: validatedData.id,
      message: 'Escalation policy registered',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to register escalation policy', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to register escalation policy',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
});
