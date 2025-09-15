/**
 * Hero Tasks - Search Suggestions API
 * Created: 2025-09-08T16:07:10.000Z
 * Version: 1.0.0
 * 
 * API endpoint for providing intelligent search suggestions based on user history and popular searches.
 */

import { NextRequest, NextResponse } from "next/server";
import { createRealSupabaseClient } from "@/lib/supabase/server";
import { createRouteLogger } from "@/lib/logger";

// Force Node.js runtime for database operations
export const runtime = "nodejs";

// Prevent prerendering - this route must be dynamic
export const revalidate = 0;

// ============================================================================
// GET SEARCH SUGGESTIONS
// ============================================================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const routeLogger = createRouteLogger('GET', '/api/hero-tasks/search/suggestions');
  
  try {
    const supabase = await createRealSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      routeLogger.warn("Unauthorized access attempt", { error: authError?.message });
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recent searches for this user
    const { data: recentSearches, error: recentError } = await supabase
      .from('hero_search_analytics')
      .select('search_text')
      .eq('user_id', user.id)
      .not('search_text', 'is', null)
      .order('search_timestamp', { ascending: false })
      .limit(20);

    if (recentError) {
      console.error('Failed to fetch recent searches:', recentError);
    }

    // Get popular searches across all users
    const { data: popularSearches, error: popularError } = await supabase
      .from('hero_search_analytics')
      .select('search_text')
      .not('search_text', 'is', null)
      .order('search_timestamp', { ascending: false })
      .limit(50);

    if (popularError) {
      console.error('Failed to fetch popular searches:', popularError);
    }

    // Get popular task titles and descriptions for suggestions
    const { data: taskContent, error: taskError } = await supabase
      .from('hero_tasks')
      .select('title, description, tags')
      .limit(100);

    if (taskError) {
      console.error('Failed to fetch task content:', taskError);
    }

    // Process and combine suggestions
    const suggestions = processSuggestions(
      recentSearches || [],
      popularSearches || [],
      taskContent || [],
      query,
      limit
    );

    routeLogger.info("Search suggestions generated", { 
      query,
      suggestionCount: suggestions.length,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: suggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    routeLogger.error("Get search suggestions error", { 
      error: errorMessage,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to get suggestions",
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function processSuggestions(
  recentSearches: any[],
  popularSearches: any[],
  taskContent: any[],
  query: string,
  limit: number
) {
  const suggestions: Array<{
    text: string;
    type: 'recent' | 'popular' | 'suggestion';
    count?: number;
  }> = [];

  // Extract unique search texts
  const recentTexts = recentSearches
    .map(s => s.search_text)
    .filter((text, index, arr) => text && arr.indexOf(text) === index)
    .slice(0, 5);

  const popularTexts = popularSearches
    .map(s => s.search_text)
    .filter((text, index, arr) => text && arr.indexOf(text) === index)
    .slice(0, 10);

  // Extract keywords from task content
  const taskKeywords = new Set<string>();
  taskContent.forEach(task => {
    if (task.title) {
      const words = task.title.toLowerCase().split(/\s+/);
      words.forEach((word: string) => {
        if (word.length > 2) {
          taskKeywords.add(word);
        }
      });
    }
    if (task.description) {
      const words = task.description.toLowerCase().split(/\s+/);
      words.forEach((word: string) => {
        if (word.length > 2) {
          taskKeywords.add(word);
        }
      });
    }
    if (task.tags && Array.isArray(task.tags)) {
      task.tags.forEach((tag: string) => {
        if (tag && tag.length > 2) {
          taskKeywords.add(tag.toLowerCase());
        }
      });
    }
  });

  // Add recent searches
  recentTexts.forEach(text => {
    if (query === '' || text.toLowerCase().includes(query.toLowerCase())) {
      suggestions.push({
        text,
        type: 'recent'
      });
    }
  });

  // Add popular searches (excluding recent ones)
  popularTexts.forEach(text => {
    if (!recentTexts.includes(text) && 
        (query === '' || text.toLowerCase().includes(query.toLowerCase()))) {
      suggestions.push({
        text,
        type: 'popular'
      });
    }
  });

  // Add keyword suggestions
  const keywordArray = Array.from(taskKeywords);
  keywordArray.forEach(keyword => {
    if (query === '' || keyword.includes(query.toLowerCase())) {
      suggestions.push({
        text: keyword,
        type: 'suggestion'
      });
    }
  });

  // Remove duplicates and limit results
  const uniqueSuggestions = suggestions
    .filter((suggestion, index, arr) => 
      arr.findIndex(s => s.text === suggestion.text) === index
    )
    .slice(0, limit);

  return uniqueSuggestions;
}
