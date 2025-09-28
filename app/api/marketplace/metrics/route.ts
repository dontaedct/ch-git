import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return mock marketplace metrics for development
    const metrics = {
      success: true,
      data: {
        totalTemplates: 47,
        activeListings: 42,
        downloads: 1284,
        averageRating: 4.7,
        revenue: 15750,
        topTemplate: 'E-commerce Starter',
        status: 'active'
      }
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching marketplace metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch marketplace metrics' },
      { status: 500 }
    );
  }
}