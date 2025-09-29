import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return mock handover progress for development
    const progress = {
      success: true,
      data: {
        activeHandovers: 4,
        completedThisWeek: 7,
        avgPreparationTime: '4.2 hours',
        clientSatisfaction: 96.5,
        pendingDeliveries: 2,
        status: 'on-track'
      }
    };

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching handover progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch handover progress' },
      { status: 500 }
    );
  }
}