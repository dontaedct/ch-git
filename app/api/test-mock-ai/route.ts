import { NextResponse } from "next/server";
import { run as aiRun } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskName, input } = body;

    // Test the AI system directly (bypasses auth for testing)
    const result = await aiRun(taskName, input);

    return NextResponse.json({
      success: result.success,
      data: result.data,
      provider: result.provider,
      timestamp: result.timestamp,
      error: result.error
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
