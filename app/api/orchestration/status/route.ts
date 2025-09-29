import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return mock orchestration status for development
    const status = {
      success: true,
      data: {
        activeWorkflows: 3,
        totalExecutions: 142,
        successRate: 98.5,
        avgExecutionTime: '2.3s',
        status: 'healthy',
        lastExecution: new Date().toISOString()
      }
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching orchestration status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orchestration status' },
      { status: 500 }
    );
  }
}