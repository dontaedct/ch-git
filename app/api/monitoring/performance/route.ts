import { NextRequest, NextResponse } from 'next/server';
import { PerformanceMonitor, startPerformanceMonitoring } from '@/lib/monitoring/performance-metrics';

let performanceMonitor: PerformanceMonitor | null = null;

// Initialize performance monitor on first request
async function getPerformanceMonitor(): Promise<PerformanceMonitor> {
  if (!performanceMonitor) {
    performanceMonitor = await startPerformanceMonitoring();
  }
  return performanceMonitor;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';

    const monitor = await getPerformanceMonitor();
    const analytics = await monitor.getPerformanceAnalytics(timeRange);

    return NextResponse.json({
      timeRange,
      analytics,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Performance analytics failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    const monitor = await getPerformanceMonitor();

    switch (type) {
      case 'api_metric':
        monitor.recordAPIMetric(data);
        break;

      case 'database_metric':
        monitor.recordDatabaseMetric(data);
        break;

      case 'ux_metric':
        monitor.recordUXMetric(data);
        break;

      case 'start':
        await monitor.start();
        return NextResponse.json({ message: 'Performance monitoring started' });

      case 'stop':
        monitor.stop();
        return NextResponse.json({ message: 'Performance monitoring stopped' });

      default:
        return NextResponse.json(
          { error: 'Invalid metric type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ message: 'Metric recorded successfully' });

  } catch (error) {
    console.error('Performance monitoring failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}