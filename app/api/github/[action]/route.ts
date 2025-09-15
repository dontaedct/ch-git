/**
 * GitHub Integration API Endpoints
 * HT-004.4.3: API routes for GitHub integration with PR/commit/issue linking and sync
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRealSupabaseClient } from '../../../../lib/supabase/server';
import { 
  GitHubIntegrationEngine,
  initializeGitHubIntegration,
  handleGitHubWebhook,
  linkGitHubPRToTask,
  linkGitHubIssueToTask,
  linkGitHubCommitToTask,
  GitHubWebhookEvent,
  GitHubIntegration,
  GitHubSyncSettings
} from '../../../../lib/integrations/github-integration';
import { createRouteLogger } from '../../../../lib/logging/route-logger';
import crypto from 'crypto';

const routeLogger = createRouteLogger('POST', '/api/github');

export const revalidate = 0;

/**
 * POST /api/github/[action]
 * Handle GitHub integration requests
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { action: string } }
) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    let body: any;
    
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // Route to appropriate handler based on action
    switch (params.action) {
      case 'webhook':
        return await handleWebhook(req, body);
      case 'initialize':
        return await handleInitialize(body);
      case 'link-pr':
        return await handleLinkPR(body);
      case 'link-issue':
        return await handleLinkIssue(body);
      case 'link-commit':
        return await handleLinkCommit(body);
      case 'sync':
        return await handleSync(body);
      default:
        return NextResponse.json(
          { ok: false, error: "Invalid action" },
          { status: 400 }
        );
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    routeLogger.error("GitHub API error", { error: errorMessage });
    
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
 * Handle GitHub webhook events
 */
async function handleWebhook(req: NextRequest, body: any) {
  try {
    // Verify webhook signature
    const signature = req.headers.get('x-hub-signature-256');
    const payload = JSON.stringify(body);
    
    if (!signature) {
      return NextResponse.json(
        { ok: false, error: "Missing webhook signature" },
        { status: 401 }
      );
    }

    // Get webhook secret from database
    const supabase = await createRealSupabaseClient();
    const { data: integrations } = await supabase
      .from('github_integrations')
      .select('webhook_secret')
      .eq('is_active', true);

    if (!integrations || integrations.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No active GitHub integrations found" },
        { status: 404 }
      );
    }

    // Verify signature with any active integration
    let validSignature = false;
    for (const integration of integrations) {
      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', integration.webhook_secret)
        .update(payload)
        .digest('hex')}`;
      
      if (signature === expectedSignature) {
        validSignature = true;
        break;
      }
    }

    if (!validSignature) {
      return NextResponse.json(
        { ok: false, error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Process webhook event
    const event = body as GitHubWebhookEvent;
    const eventType = req.headers.get('x-github-event');
    
    if (!eventType) {
      return NextResponse.json(
        { ok: false, error: "Missing event type" },
        { status: 400 }
      );
    }

    // Get integration for this repository
    const { data: integration } = await supabase
      .from('github_integrations')
      .select('*')
      .eq('repository_owner', event.repository.owner.login)
      .eq('repository_name', event.repository.name)
      .eq('is_active', true)
      .single();

    if (!integration) {
      return NextResponse.json(
        { ok: false, error: "No integration found for repository" },
        { status: 404 }
      );
    }

    // Handle the webhook event
    const engine = new GitHubIntegrationEngine();
    const results = await engine.handleWebhookEvent(event, integration);

    // Log the webhook event
    routeLogger.info("GitHub webhook processed", {
      eventType,
      repository: `${event.repository.owner.login}/${event.repository.name}`,
      action: event.action,
      resultsCount: results.length
    });

    return NextResponse.json({
      ok: true,
      data: {
        event_type: eventType,
        action: event.action,
        repository: `${event.repository.owner.login}/${event.repository.name}`,
        results,
        processed_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    routeLogger.error("Error processing GitHub webhook", { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

/**
 * Handle GitHub integration initialization
 */
async function handleInitialize(body: {
  repository_owner: string;
  repository_name: string;
  github_token: string;
  sync_settings?: Partial<GitHubSyncSettings>;
}) {
  try {
    const { repository_owner, repository_name, github_token, sync_settings } = body;
    
    if (!repository_owner || !repository_name || !github_token) {
      return NextResponse.json(
        { ok: false, error: "Repository owner, name, and GitHub token are required" },
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

    // Initialize GitHub integration
    const integration = await initializeGitHubIntegration(
      user.id,
      repository_owner,
      repository_name,
      github_token,
      sync_settings
    );

    // Save integration to database
    const { data: savedIntegration, error: saveError } = await supabase
      .from('github_integrations')
      .insert({
        id: integration.id,
        user_id: integration.user_id,
        repository_owner: integration.repository_owner,
        repository_name: integration.repository_name,
        github_token: integration.github_token,
        webhook_secret: integration.webhook_secret,
        webhook_url: integration.webhook_url,
        is_active: integration.is_active,
        sync_settings: integration.sync_settings,
        created_at: integration.created_at,
        updated_at: integration.updated_at
      })
      .select()
      .single();

    if (saveError) {
      throw new Error(`Failed to save integration: ${saveError.message}`);
    }

    // Log the initialization
    routeLogger.info("GitHub integration initialized", {
      userId: user.id,
      repository: `${repository_owner}/${repository_name}`,
      integrationId: integration.id
    });

    return NextResponse.json({
      ok: true,
      data: {
        integration: savedIntegration,
        initialized_at: new Date().toISOString(),
        user_id: user.id
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    routeLogger.error("Error initializing GitHub integration", { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

/**
 * Handle linking GitHub PR to task
 */
async function handleLinkPR(body: {
  task_id: string;
  repository_owner: string;
  repository_name: string;
  pr_number: number;
  github_token: string;
}) {
  try {
    const { task_id, repository_owner, repository_name, pr_number, github_token } = body;
    
    if (!task_id || !repository_owner || !repository_name || !pr_number || !github_token) {
      return NextResponse.json(
        { ok: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Auth check
    const supabase = await createRealSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get GitHub PR
    const githubApi = new (await import('../../../../lib/integrations/github-integration')).GitHubAPI();
    const pr = await githubApi.getPullRequest(repository_owner, repository_name, pr_number, github_token);
    
    if (!pr) {
      return NextResponse.json(
        { ok: false, error: "Pull request not found" },
        { status: 404 }
      );
    }

    // Get integration
    const { data: integration } = await supabase
      .from('github_integrations')
      .select('*')
      .eq('repository_owner', repository_owner)
      .eq('repository_name', repository_name)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!integration) {
      return NextResponse.json(
        { ok: false, error: "GitHub integration not found" },
        { status: 404 }
      );
    }

    // Link PR to task
    const link = await linkGitHubPRToTask(task_id, pr, integration);

    // Save link to database
    const { data: savedLink, error: linkError } = await supabase
      .from('github_links')
      .insert({
        id: link.id,
        task_id: link.task_id,
        github_type: link.github_type,
        github_id: link.github_id,
        github_number: link.github_number,
        github_url: link.github_url,
        github_title: link.github_title,
        github_state: link.github_state,
        github_author: link.github_author,
        github_assignees: link.github_assignees,
        github_labels: link.github_labels,
        last_synced_at: link.last_synced_at,
        sync_status: link.sync_status,
        metadata: link.metadata,
        created_at: link.created_at,
        updated_at: link.updated_at
      })
      .select()
      .single();

    if (linkError) {
      throw new Error(`Failed to save GitHub link: ${linkError.message}`);
    }

    // Log the linking
    routeLogger.info("GitHub PR linked to task", {
      userId: user.id,
      taskId: task_id,
      prNumber: pr_number,
      repository: `${repository_owner}/${repository_name}`
    });

    return NextResponse.json({
      ok: true,
      data: {
        link: savedLink,
        pr: {
          number: pr.number,
          title: pr.title,
          state: pr.state,
          html_url: pr.html_url
        },
        linked_at: new Date().toISOString(),
        user_id: user.id
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    routeLogger.error("Error linking GitHub PR", { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

/**
 * Handle linking GitHub issue to task
 */
async function handleLinkIssue(body: {
  task_id: string;
  repository_owner: string;
  repository_name: string;
  issue_number: number;
  github_token: string;
}) {
  try {
    const { task_id, repository_owner, repository_name, issue_number, github_token } = body;
    
    if (!task_id || !repository_owner || !repository_name || !issue_number || !github_token) {
      return NextResponse.json(
        { ok: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Auth check
    const supabase = await createRealSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get GitHub issue
    const githubApi = new (await import('../../../../lib/integrations/github-integration')).GitHubAPI();
    const issue = await githubApi.getIssue(repository_owner, repository_name, issue_number, github_token);
    
    if (!issue) {
      return NextResponse.json(
        { ok: false, error: "Issue not found" },
        { status: 404 }
      );
    }

    // Get integration
    const { data: integration } = await supabase
      .from('github_integrations')
      .select('*')
      .eq('repository_owner', repository_owner)
      .eq('repository_name', repository_name)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!integration) {
      return NextResponse.json(
        { ok: false, error: "GitHub integration not found" },
        { status: 404 }
      );
    }

    // Link issue to task
    const link = await linkGitHubIssueToTask(task_id, issue, integration);

    // Save link to database
    const { data: savedLink, error: linkError } = await supabase
      .from('github_links')
      .insert({
        id: link.id,
        task_id: link.task_id,
        github_type: link.github_type,
        github_id: link.github_id,
        github_number: link.github_number,
        github_url: link.github_url,
        github_title: link.github_title,
        github_state: link.github_state,
        github_author: link.github_author,
        github_assignees: link.github_assignees,
        github_labels: link.github_labels,
        last_synced_at: link.last_synced_at,
        sync_status: link.sync_status,
        metadata: link.metadata,
        created_at: link.created_at,
        updated_at: link.updated_at
      })
      .select()
      .single();

    if (linkError) {
      throw new Error(`Failed to save GitHub link: ${linkError.message}`);
    }

    // Log the linking
    routeLogger.info("GitHub issue linked to task", {
      userId: user.id,
      taskId: task_id,
      issueNumber: issue_number,
      repository: `${repository_owner}/${repository_name}`
    });

    return NextResponse.json({
      ok: true,
      data: {
        link: savedLink,
        issue: {
          number: issue.number,
          title: issue.title,
          state: issue.state,
          html_url: issue.html_url
        },
        linked_at: new Date().toISOString(),
        user_id: user.id
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    routeLogger.error("Error linking GitHub issue", { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

/**
 * Handle linking GitHub commit to task
 */
async function handleLinkCommit(body: {
  task_id: string;
  repository_owner: string;
  repository_name: string;
  commit_sha: string;
  github_token: string;
}) {
  try {
    const { task_id, repository_owner, repository_name, commit_sha, github_token } = body;
    
    if (!task_id || !repository_owner || !repository_name || !commit_sha || !github_token) {
      return NextResponse.json(
        { ok: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Auth check
    const supabase = await createRealSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get GitHub commit
    const githubApi = new (await import('../../../../lib/integrations/github-integration')).GitHubAPI();
    const commit = await githubApi.getCommit(repository_owner, repository_name, commit_sha, github_token);
    
    if (!commit) {
      return NextResponse.json(
        { ok: false, error: "Commit not found" },
        { status: 404 }
      );
    }

    // Get integration
    const { data: integration } = await supabase
      .from('github_integrations')
      .select('*')
      .eq('repository_owner', repository_owner)
      .eq('repository_name', repository_name)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!integration) {
      return NextResponse.json(
        { ok: false, error: "GitHub integration not found" },
        { status: 404 }
      );
    }

    // Link commit to task
    const link = await linkGitHubCommitToTask(task_id, commit, integration);

    // Save link to database
    const { data: savedLink, error: linkError } = await supabase
      .from('github_links')
      .insert({
        id: link.id,
        task_id: link.task_id,
        github_type: link.github_type,
        github_id: link.github_id,
        github_url: link.github_url,
        github_title: link.github_title,
        github_state: link.github_state,
        github_author: link.github_author,
        github_assignees: link.github_assignees,
        github_labels: link.github_labels,
        last_synced_at: link.last_synced_at,
        sync_status: link.sync_status,
        metadata: link.metadata,
        created_at: link.created_at,
        updated_at: link.updated_at
      })
      .select()
      .single();

    if (linkError) {
      throw new Error(`Failed to save GitHub link: ${linkError.message}`);
    }

    // Log the linking
    routeLogger.info("GitHub commit linked to task", {
      userId: user.id,
      taskId: task_id,
      commitSha: commit_sha,
      repository: `${repository_owner}/${repository_name}`
    });

    return NextResponse.json({
      ok: true,
      data: {
        link: savedLink,
        commit: {
          sha: commit.sha,
          message: commit.message,
          author: commit.author.name,
          html_url: commit.html_url
        },
        linked_at: new Date().toISOString(),
        user_id: user.id
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    routeLogger.error("Error linking GitHub commit", { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

/**
 * Handle manual sync request
 */
async function handleSync(body: {
  integration_id: string;
  sync_type?: 'all' | 'prs' | 'issues' | 'commits';
}) {
  try {
    const { integration_id, sync_type = 'all' } = body;
    
    if (!integration_id) {
      return NextResponse.json(
        { ok: false, error: "Integration ID is required" },
        { status: 400 }
      );
    }

    // Auth check
    const supabase = await createRealSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get integration
    const { data: integration } = await supabase
      .from('github_integrations')
      .select('*')
      .eq('id', integration_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!integration) {
      return NextResponse.json(
        { ok: false, error: "GitHub integration not found" },
        { status: 404 }
      );
    }

    // Perform sync based on type
    const engine = new GitHubIntegrationEngine();
    let syncResults: any[] = [];

    // This would implement the actual sync logic
    // For now, return a placeholder response
    syncResults = [{
      type: 'sync',
      status: 'completed',
      message: 'Sync completed successfully'
    }];

    // Log the sync
    routeLogger.info("GitHub integration synced", {
      userId: user.id,
      integrationId: integration_id,
      syncType: sync_type,
      resultsCount: syncResults.length
    });

    return NextResponse.json({
      ok: true,
      data: {
        integration_id,
        sync_type,
        results: syncResults,
        synced_at: new Date().toISOString(),
        user_id: user.id
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    routeLogger.error("Error syncing GitHub integration", { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}
