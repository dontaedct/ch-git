/**
 * API Route for Real Agency Data
 * Provides real database data instead of mock data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRealAgencyMetrics, getRealClients, createTestClient, createTestMicroApp, getRealRecentActivity, createAuditLogEntry } from '@/lib/services/realDataService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'metrics':
        const metrics = await getRealAgencyMetrics();
        return NextResponse.json({ success: true, data: metrics });

      case 'clients':
        const clients = await getRealClients();
        return NextResponse.json({ success: true, data: clients });

      case 'recent-activity':
        const recentActivity = await getRealRecentActivity();
        return NextResponse.json({ success: true, data: recentActivity });

      case 'create-test-data':
        // Create test client and micro-app
        const testClient = await createTestClient('test-client@example.com');
        if (testClient) {
          const testMicroApp = await createTestMicroApp(testClient.id);
          
          // Create audit log entries for the test data creation
          await createAuditLogEntry('Client Created', 'client', testClient.id, { email: testClient.email });
          if (testMicroApp) {
            await createAuditLogEntry('Micro-App Created', 'micro-app', testMicroApp.id, { client_id: testClient.id });
          }
          
          return NextResponse.json({ 
            success: true, 
            data: { client: testClient, microApp: testMicroApp } 
          });
        }
        return NextResponse.json({ success: false, error: 'Failed to create test client' });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email } = body;

    switch (action) {
      case 'create-client':
        if (!email) {
          return NextResponse.json({ success: false, error: 'Email is required' });
        }
        const client = await createTestClient(email);
        return NextResponse.json({ success: true, data: client });

      case 'create-micro-app':
        const { clientId } = body;
        if (!clientId) {
          return NextResponse.json({ success: false, error: 'Client ID is required' });
        }
        const microApp = await createTestMicroApp(clientId);
        return NextResponse.json({ success: true, data: microApp });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
