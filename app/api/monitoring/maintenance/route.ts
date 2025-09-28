import { NextRequest, NextResponse } from 'next/server';
import { maintenanceManager } from '@/lib/monitoring/maintenance-mode';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        const isActive = maintenanceManager.isMaintenanceActive();
        const currentMaintenance = maintenanceManager.getCurrentMaintenance();
        
        return NextResponse.json({
          active: isActive,
          maintenance: currentMaintenance,
          timestamp: new Date().toISOString(),
        });

      case 'page':
        const maintenancePage = maintenanceManager.getMaintenancePageHTML();
        return new NextResponse(maintenancePage, {
          headers: {
            'Content-Type': 'text/html',
          },
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Maintenance status check failed:', error);
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

    switch (action) {
      case 'enable':
        const maintenance = await maintenanceManager.enableMaintenance(
          data.config,
          data.createdBy,
          data.reason,
          data.impact,
          data.affectedServices
        );
        return NextResponse.json({ maintenance });

      case 'disable':
        await maintenanceManager.disableMaintenance(data.endedBy);
        return NextResponse.json({ message: 'Maintenance mode disabled' });

      case 'schedule':
        const schedule = await maintenanceManager.scheduleMaintenance(data);
        return NextResponse.json({ schedule });

      case 'cancel_schedule':
        await maintenanceManager.cancelScheduledMaintenance(data.scheduleId, data.cancelledBy);
        return NextResponse.json({ message: 'Scheduled maintenance cancelled' });

      case 'check_access':
        const allowed = maintenanceManager.shouldAllowRequest(
          data.ip,
          data.userId,
          data.path,
          data.userAgent
        );
        return NextResponse.json({ allowed });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Maintenance action failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
