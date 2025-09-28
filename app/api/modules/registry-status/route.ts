import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return mock modules registry status for development
    const status = {
      success: true,
      data: {
        totalModules: 33,
        activeModules: 28,
        pendingUpdates: 2,
        systemHealth: 97.8,
        lastUpdate: new Date().toISOString(),
        status: 'operational'
      }
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching modules registry status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch modules registry status' },
      { status: 500 }
    );
  }
}