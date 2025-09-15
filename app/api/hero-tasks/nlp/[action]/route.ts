/**
 * Natural Language Processing API Endpoints
 * HT-004.4.2: API routes for natural language task creation and content parsing
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRealSupabaseClient } from '@/lib/supabase/server';
import { 
  NaturalLanguageProcessor,
  parseNaturalLanguageTask,
  extractTaskEntities,
  recognizeTaskIntent,
  NLPConfig
} from '@/lib/ai/natural-language-processing';
import { createRouteLogger } from '@/lib/logging/route-logger';

const routeLogger = createRouteLogger('POST', '/api/hero-tasks/nlp');

export const revalidate = 0;

/**
 * POST /api/hero-tasks/nlp/[action]
 * Handle natural language processing requests
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { action: string } }
) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    let body: { 
      input: string;
      config?: Partial<NLPConfig>;
    };
    
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // Auth check
    const supabase = await createRealSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      routeLogger.warn("Unauthorized access attempt", { error: authError?.message });
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Route to appropriate handler based on action
    switch (params.action) {
      case 'parse':
        return await handleParse(body, user.id);
      case 'entities':
        return await handleEntities(body, user.id);
      case 'intent':
        return await handleIntent(body, user.id);
      case 'create-task':
        return await handleCreateTask(body, user.id);
      default:
        return NextResponse.json(
          { ok: false, error: "Invalid action" },
          { status: 400 }
        );
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    routeLogger.error("NLP API error", { error: errorMessage });
    
    return NextResponse.json(
      { 
        ok: false, 
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Handle natural language parsing request
 */
async function handleParse(
  body: { input: string; config?: Partial<NLPConfig> },
  userId: string
) {
  try {
    const { input, config } = body;
    
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { ok: false, error: "Input text is required" },
        { status: 400 }
      );
    }

    const parseResult = await parseNaturalLanguageTask(input, config);
    
    // Log the request for analytics
    routeLogger.info("Natural language parsed", {
      userId,
      inputLength: input.length,
      entitiesCount: parseResult.entities.length,
      suggestionsCount: parseResult.suggestions.length,
      confidence: parseResult.confidence
    });

    return NextResponse.json({
      ok: true,
      data: {
        parse_result: parseResult,
        input,
        processed_at: new Date().toISOString(),
        user_id: userId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    routeLogger.error("Error parsing natural language", { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

/**
 * Handle entity extraction request
 */
async function handleEntities(
  body: { input: string; config?: Partial<NLPConfig> },
  userId: string
) {
  try {
    const { input, config } = body;
    
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { ok: false, error: "Input text is required" },
        { status: 400 }
      );
    }

    const entities = await extractTaskEntities(input, config);
    
    // Log the request for analytics
    routeLogger.info("Entities extracted", {
      userId,
      inputLength: input.length,
      entitiesCount: entities.length,
      entityTypes: entities.map(e => e.type)
    });

    return NextResponse.json({
      ok: true,
      data: {
        entities,
        input,
        extracted_at: new Date().toISOString(),
        user_id: userId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    routeLogger.error("Error extracting entities", { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

/**
 * Handle intent recognition request
 */
async function handleIntent(
  body: { input: string; config?: Partial<NLPConfig> },
  userId: string
) {
  try {
    const { input, config } = body;
    
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { ok: false, error: "Input text is required" },
        { status: 400 }
      );
    }

    const intent = await recognizeTaskIntent(input, config);
    
    // Log the request for analytics
    routeLogger.info("Intent recognized", {
      userId,
      inputLength: input.length,
      intent: intent.action,
      confidence: intent.confidence
    });

    return NextResponse.json({
      ok: true,
      data: {
        intent,
        input,
        recognized_at: new Date().toISOString(),
        user_id: userId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    routeLogger.error("Error recognizing intent", { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

/**
 * Handle create task from natural language request
 */
async function handleCreateTask(
  body: { input: string; config?: Partial<NLPConfig> },
  userId: string
) {
  try {
    const { input, config } = body;
    
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { ok: false, error: "Input text is required" },
        { status: 400 }
      );
    }

    // Parse the natural language input
    const parseResult = await parseNaturalLanguageTask(input, config);
    
    // Create task from parsed data
    const supabase = await createRealSupabaseClient();
    
    // Generate task number
    const { data: taskNumberData } = await supabase
      .rpc('generate_next_task_number');
    
    const taskData = {
      task_number: taskNumberData,
      title: parseResult.parsed_task.title || input,
      description: parseResult.parsed_task.description,
      priority: parseResult.parsed_task.priority || 'medium',
      type: parseResult.parsed_task.type || 'feature',
      due_date: parseResult.parsed_task.due_date,
      estimated_duration_hours: parseResult.parsed_task.estimated_hours,
      tags: parseResult.parsed_task.tags || [],
      metadata: {
        ...parseResult.parsed_task.metadata,
        nlp_confidence: parseResult.confidence,
        nlp_intent: parseResult.intent.action,
        nlp_entities: parseResult.entities.map(e => ({
          type: e.type,
          value: e.value,
          confidence: e.confidence
        })),
        created_from_nlp: true,
        original_input: input
      },
      created_by: userId
    };

    const { data: task, error: taskError } = await supabase
      .from('hero_tasks')
      .insert(taskData)
      .select()
      .single();

    if (taskError) {
      throw new Error(`Failed to create task: ${taskError.message}`);
    }

    // Log the request for analytics
    routeLogger.info("Task created from natural language", {
      userId,
      inputLength: input.length,
      taskId: task.id,
      confidence: parseResult.confidence,
      entitiesCount: parseResult.entities.length
    });

    return NextResponse.json({
      ok: true,
      data: {
        task,
        parse_result: parseResult,
        input,
        created_at: new Date().toISOString(),
        user_id: userId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    routeLogger.error("Error creating task from natural language", { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}
