import { NextRequest, NextResponse } from 'next/server';
// TODO: Re-enable when monitoring system is implemented
// import { ErrorTracker, startErrorTracking } from '@/lib/monitoring/error-tracking';

// Temporary stubs for MVP
type ErrorTracker = any;
const startErrorTracking = async () => ({
  getErrors: async () => ({ errors: [] }),
  getErrorDetails: async () => null,
  resolveError: async () => ({ success: true })
});

let errorTracker: ErrorTracker | null = null;

// Initialize error tracker on first request
async function getErrorTracker(): Promise<ErrorTracker> {
  if (!errorTracker) {
    errorTracker = await startErrorTracking();
  }
  return errorTracker;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const unresolved = searchParams.get('unresolved') === 'true';

    const tracker = await getErrorTracker();

    if (unresolved) {
      const errors = await tracker.getUnresolvedErrors();
      return NextResponse.json({
        errors,
        count: errors.length,
        timestamp: new Date().toISOString(),
      });
    } else {
      const analytics = await tracker.getErrorAnalytics(timeRange);
      return NextResponse.json({
        timeRange,
        analytics,
        timestamp: new Date().toISOString(),
      });
    }

  } catch (error) {
    console.error('Error tracking failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const tracker = await getErrorTracker();

    switch (action) {
      case 'track_error':
        await tracker.trackError(data);
        break;

      case 'track_js_error':
        tracker.trackJSError(new Error(data.message), data.source, data.metadata);
        break;

      case 'track_api_error':
        tracker.trackAPIError(
          new Error(data.message),
          data.endpoint,
          data.method,
          data.statusCode,
          data.metadata
        );
        break;

      case 'track_database_error':
        tracker.trackDatabaseError(
          new Error(data.message),
          data.query,
          data.metadata
        );
        break;

      case 'track_user_error':
        tracker.trackUserError(
          new Error(data.message),
          data.userId,
          data.sessionId,
          data.url,
          data.metadata
        );
        break;

      case 'resolve_error':
        await tracker.resolveError(data.errorId, data.resolvedBy);
        break;

      case 'create_alert_rule':
        const rule = await tracker.createAlertRule(data);
        return NextResponse.json({ rule });

      case 'update_alert_rule':
        await tracker.updateAlertRule(data.ruleId, data.updates);
        return NextResponse.json({ message: 'Alert rule updated' });

      case 'delete_alert_rule':
        await tracker.deleteAlertRule(data.ruleId);
        return NextResponse.json({ message: 'Alert rule deleted' });

      case 'start':
        await tracker.start();
        return NextResponse.json({ message: 'Error tracking started' });

      case 'stop':
        tracker.stop();
        return NextResponse.json({ message: 'Error tracking stopped' });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ message: 'Action completed successfully' });

  } catch (error) {
    console.error('Error tracking action failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}