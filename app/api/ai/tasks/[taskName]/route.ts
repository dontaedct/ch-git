/**
 * 🧠 AI SYSTEM - AI Task Execution API
 * 
 * Universal Header Compliant API endpoint for AI task execution
 * with strict JSON output, rate limiting, and auth checks.
 */

import { NextRequest, NextResponse } from "next/server";
import { createRealSupabaseClient } from "@/lib/supabase/server";
import { run as aiRun } from "@/lib/ai";
import { createRouteLogger } from "@/lib/logger";
import { isAIEnabled } from "@/lib/ai/flags";

// Force Node.js runtime for AI operations (never Edge)
export const runtime = "nodejs";

// Prevent prerendering - this route must be dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  req: NextRequest,
  { params }: { params: { taskName: string } }
) {
  const startTime = Date.now();
  const routeLogger = createRouteLogger('POST', `/api/ai/tasks/${params.taskName}`);
  
  try {
    // AI feature flag guard - deny by default
    if (!isAIEnabled()) {
      routeLogger.warn("AI access blocked by feature flag", { 
        taskName: params.taskName,
        aiEnabled: false 
      });
      return NextResponse.json(
        { ok: false, error: 'AI disabled by flag' }, 
        { status: 503 }
      );
    }

    // Parse JSON body: { input: any }
    let body: { input: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // Auth check using existing Supabase pattern
    const supabase = await createRealSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      routeLogger.warn("Unauthorized access attempt", { error: authError?.message });
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Call ai.run(taskName, input)
    const result = await aiRun(params.taskName, body.input);

    // Return strict JSON format
    if (result.success) {
      return NextResponse.json({
        ok: true,
        data: result.data,
        provider: result.provider,
        timestamp: result.timestamp
      });
    } else {
      return NextResponse.json(
        { 
          ok: false, 
          error: result.error ?? "Task execution failed",
          provider: result.provider,
          timestamp: result.timestamp
        },
        { status: 400 }
      );
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    routeLogger.error("Task execution error", { 
      taskName: params.taskName, 
      error: errorMessage,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { 
        ok: false, 
        error: "Internal server error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
