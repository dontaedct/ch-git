/**
 * GitHub Integration System for Hero Tasks
 * HT-004.4.3: GitHub integration with PR/commit/issue linking and automatic sync
 * 
 * This module provides GitHub integration capabilities including:
 * - Linking PRs, commits, and issues to Hero Tasks
 * - Automatic task status updates based on GitHub events
 * - Bidirectional sync between GitHub and Hero Tasks
 * - Webhook handling for real-time updates
 * - GitHub API integration for repository management
 */

import { HeroTask, TaskStatus, TaskPriority, TaskType, WorkflowPhase } from '../../types/hero-tasks';

// ============================================================================
// GITHUB INTEGRATION INTERFACES
// ============================================================================

export interface GitHubIntegration {
  id: string;
  user_id: string;
  repository_owner: string;
  repository_name: string;
  github_token: string;
  webhook_secret: string;
  webhook_url: string;
  is_active: boolean;
  sync_settings: GitHubSyncSettings;
  created_at: string;
  updated_at: string;
}

export interface GitHubSyncSettings {
  auto_link_prs: boolean;
  auto_link_commits: boolean;
  auto_link_issues: boolean;
  auto_update_task_status: boolean;
  sync_task_comments: boolean;
  sync_task_labels: boolean;
  auto_create_tasks_from_issues: boolean;
  task_status_mapping: TaskStatusMapping;
  priority_mapping: PriorityMapping;
}

export interface TaskStatusMapping {
  open: TaskStatus;
  closed: TaskStatus;
  merged: TaskStatus;
  draft: TaskStatus;
  in_progress: TaskStatus;
}

export interface PriorityMapping {
  low: TaskPriority;
  medium: TaskPriority;
  high: TaskPriority;
  critical: TaskPriority;
}

export interface GitHubWebhookEvent {
  action: string;
  repository: GitHubRepository;
  pull_request?: GitHubPullRequest;
  issue?: GitHubIssue;
  commit?: GitHubCommit;
  sender: GitHubUser;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubUser;
  html_url: string;
  description: string;
  language: string;
  default_branch: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  draft: boolean;
  merged: boolean;
  mergeable: boolean;
  head: GitHubBranch;
  base: GitHubBranch;
  user: GitHubUser;
  assignees: GitHubUser[];
  labels: GitHubLabel[];
  created_at: string;
  updated_at: string;
  closed_at?: string;
  merged_at?: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  user: GitHubUser;
  assignees: GitHubUser[];
  labels: GitHubLabel[];
  created_at: string;
  updated_at: string;
  closed_at?: string;
  html_url: string;
}

export interface GitHubCommit {
  id: string;
  sha: string;
  message: string;
  author: GitHubCommitAuthor;
  committer: GitHubCommitAuthor;
  tree: GitHubTree;
  parents: GitHubParent[];
  html_url: string;
  stats?: GitHubCommitStats;
  files?: GitHubCommitFile[];
}

export interface GitHubCommitAuthor {
  name: string;
  email: string;
  date: string;
}

export interface GitHubTree {
  sha: string;
  url: string;
}

export interface GitHubParent {
  sha: string;
  url: string;
  html_url: string;
}

export interface GitHubCommitStats {
  additions: number;
  deletions: number;
  total: number;
}

export interface GitHubCommitFile {
  filename: string;
  additions: number;
  deletions: number;
  changes: number;
  status: string;
  raw_url: string;
  blob_url: string;
  patch?: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  html_url: string;
  type: 'User' | 'Bot';
}

export interface GitHubBranch {
  ref: string;
  sha: string;
  label: string;
  user: GitHubUser;
  repo: GitHubRepository;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description: string;
}

export interface GitHubLink {
  id: string;
  task_id: string;
  github_type: 'pull_request' | 'issue' | 'commit';
  github_id: string;
  github_number?: number;
  github_url: string;
  github_title: string;
  github_state: string;
  github_author: string;
  github_assignees: string[];
  github_labels: string[];
  last_synced_at: string;
  sync_status: 'synced' | 'pending' | 'error';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface GitHubSyncResult {
  success: boolean;
  task_id: string;
  github_type: string;
  github_id: string;
  action: 'created' | 'updated' | 'linked' | 'synced';
  changes: Record<string, any>;
  error?: string;
}

// ============================================================================
// GITHUB INTEGRATION ENGINE
// ============================================================================

export class GitHubIntegrationEngine {
  private supabase: any;
  private githubApi: GitHubAPI;

  constructor() {
    this.githubApi = new GitHubAPI();
  }

  /**
   * Initialize GitHub integration for a repository
   */
  async initializeIntegration(
    userId: string,
    repositoryOwner: string,
    repositoryName: string,
    githubToken: string,
    syncSettings: Partial<GitHubSyncSettings> = {}
  ): Promise<GitHubIntegration> {
    try {
      // Verify GitHub access
      const repo = await this.githubApi.getRepository(repositoryOwner, repositoryName, githubToken);
      if (!repo) {
        throw new Error('Repository not found or access denied');
      }

      // Generate webhook secret
      const webhookSecret = this.generateWebhookSecret();
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/github/webhook`;

      // Create webhook
      const webhook = await this.githubApi.createWebhook(
        repositoryOwner,
        repositoryName,
        webhookUrl,
        webhookSecret,
        githubToken
      );

      if (!webhook) {
        throw new Error('Failed to create GitHub webhook');
      }

      // Default sync settings
      const defaultSyncSettings: GitHubSyncSettings = {
        auto_link_prs: true,
        auto_link_commits: true,
        auto_link_issues: true,
        auto_update_task_status: true,
        sync_task_comments: true,
        sync_task_labels: true,
        auto_create_tasks_from_issues: false,
        task_status_mapping: {
          open: TaskStatus.IN_PROGRESS,
          closed: TaskStatus.COMPLETED,
          merged: TaskStatus.COMPLETED,
          draft: TaskStatus.DRAFT,
          in_progress: TaskStatus.IN_PROGRESS
        },
        priority_mapping: {
          low: TaskPriority.LOW,
          medium: TaskPriority.MEDIUM,
          high: TaskPriority.HIGH,
          critical: TaskPriority.CRITICAL
        },
        ...syncSettings
      };

      // Store integration in database
      const integration: GitHubIntegration = {
        id: crypto.randomUUID(),
        user_id: userId,
        repository_owner: repositoryOwner,
        repository_name: repositoryName,
        github_token: githubToken,
        webhook_secret: webhookSecret,
        webhook_url: webhookUrl,
        is_active: true,
        sync_settings: defaultSyncSettings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to database (implementation would depend on your database setup)
      // await this.saveIntegration(integration);

      return integration;
    } catch (error) {
      console.error('Error initializing GitHub integration:', error);
      throw error;
    }
  }

  /**
   * Handle GitHub webhook events
   */
  async handleWebhookEvent(
    event: GitHubWebhookEvent,
    integration: GitHubIntegration
  ): Promise<GitHubSyncResult[]> {
    const results: GitHubSyncResult[] = [];

    try {
      switch (event.action) {
        case 'opened':
        case 'closed':
        case 'reopened':
          if (event.pull_request) {
            const result = await this.handlePullRequestEvent(event.pull_request, integration);
            if (result) results.push(result);
          } else if (event.issue) {
            const result = await this.handleIssueEvent(event.issue, integration);
            if (result) results.push(result);
          }
          break;

        case 'created':
          if (event.commit) {
            const result = await this.handleCommitEvent(event.commit, integration);
            if (result) results.push(result);
          }
          break;

        case 'synchronize':
          if (event.pull_request) {
            const result = await this.handlePullRequestSync(event.pull_request, integration);
            if (result) results.push(result);
          }
          break;

        case 'labeled':
        case 'unlabeled':
          if (event.pull_request) {
            const result = await this.handlePullRequestLabelEvent(event.pull_request, integration);
            if (result) results.push(result);
          } else if (event.issue) {
            const result = await this.handleIssueLabelEvent(event.issue, integration);
            if (result) results.push(result);
          }
          break;
      }

      return results;
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }

  /**
   * Link a GitHub PR to a Hero Task
   */
  async linkPullRequestToTask(
    taskId: string,
    pullRequest: GitHubPullRequest,
    integration: GitHubIntegration
  ): Promise<GitHubLink> {
    const link: GitHubLink = {
      id: crypto.randomUUID(),
      task_id: taskId,
      github_type: 'pull_request',
      github_id: pullRequest.id.toString(),
      github_number: pullRequest.number,
      github_url: pullRequest.html_url,
      github_title: pullRequest.title,
      github_state: pullRequest.state,
      github_author: pullRequest.user.login,
      github_assignees: pullRequest.assignees.map(a => a.login),
      github_labels: pullRequest.labels.map(l => l.name),
      last_synced_at: new Date().toISOString(),
      sync_status: 'synced',
      metadata: {
        draft: pullRequest.draft,
        merged: pullRequest.merged,
        mergeable: pullRequest.mergeable,
        head_branch: pullRequest.head.ref,
        base_branch: pullRequest.base.ref
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save link to database
    // await this.saveGitHubLink(link);

    // Update task status if auto-sync is enabled
    if (integration.sync_settings.auto_update_task_status) {
      await this.updateTaskStatusFromPR(taskId, pullRequest, integration);
    }

    return link;
  }

  /**
   * Link a GitHub issue to a Hero Task
   */
  async linkIssueToTask(
    taskId: string,
    issue: GitHubIssue,
    integration: GitHubIntegration
  ): Promise<GitHubLink> {
    const link: GitHubLink = {
      id: crypto.randomUUID(),
      task_id: taskId,
      github_type: 'issue',
      github_id: issue.id.toString(),
      github_number: issue.number,
      github_url: issue.html_url,
      github_title: issue.title,
      github_state: issue.state,
      github_author: issue.user.login,
      github_assignees: issue.assignees.map(a => a.login),
      github_labels: issue.labels.map(l => l.name),
      last_synced_at: new Date().toISOString(),
      sync_status: 'synced',
      metadata: {
        is_pr: false
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save link to database
    // await this.saveGitHubLink(link);

    // Update task status if auto-sync is enabled
    if (integration.sync_settings.auto_update_task_status) {
      await this.updateTaskStatusFromIssue(taskId, issue, integration);
    }

    return link;
  }

  /**
   * Link a GitHub commit to a Hero Task
   */
  async linkCommitToTask(
    taskId: string,
    commit: GitHubCommit,
    integration: GitHubIntegration
  ): Promise<GitHubLink> {
    const link: GitHubLink = {
      id: crypto.randomUUID(),
      task_id: taskId,
      github_type: 'commit',
      github_id: commit.sha,
      github_url: commit.html_url,
      github_title: commit.message.split('\n')[0], // First line of commit message
      github_state: 'committed',
      github_author: commit.author.name,
      github_assignees: [],
      github_labels: [],
      last_synced_at: new Date().toISOString(),
      sync_status: 'synced',
      metadata: {
        commit_sha: commit.sha,
        commit_message: commit.message,
        author_email: commit.author.email,
        commit_date: commit.author.date,
        stats: commit.stats
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save link to database
    // await this.saveGitHubLink(link);

    return link;
  }

  /**
   * Create a Hero Task from a GitHub issue
   */
  async createTaskFromIssue(
    issue: GitHubIssue,
    integration: GitHubIntegration
  ): Promise<HeroTask> {
    // Determine task priority from labels
    const priority = this.determinePriorityFromLabels(issue.labels, integration.sync_settings.priority_mapping);
    
    // Determine task type from labels and content
    const taskType = this.determineTaskTypeFromIssue(issue);

    const task: HeroTask = {
      id: crypto.randomUUID(),
      task_number: await this.generateTaskNumber(),
      title: issue.title,
      description: issue.body || '',
      priority,
      type: taskType,
      status: issue.state === 'open' ? TaskStatus.IN_PROGRESS : TaskStatus.COMPLETED,
      tags: issue.labels.map(l => l.name),
      current_phase: WorkflowPhase.APPLY,
      audit_trail: [],
      metadata: {
        github_issue_number: issue.number,
        github_issue_url: issue.html_url,
        github_author: issue.user.login,
        github_assignees: issue.assignees.map(a => a.login),
        github_labels: issue.labels.map(l => l.name),
        created_from_github: true,
        github_integration_id: integration.id
      },
      created_by: integration.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save task to database
    // await this.saveTask(task);

    // Link the issue to the task
    await this.linkIssueToTask(task.id, issue, integration);

    return task;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async handlePullRequestEvent(
    pr: GitHubPullRequest,
    integration: GitHubIntegration
  ): Promise<GitHubSyncResult | null> {
    // Find existing task linked to this PR
    const existingLink = await this.findGitHubLink(pr.id.toString(), 'pull_request');
    
    if (existingLink) {
      // Update existing task
      await this.updateTaskStatusFromPR(existingLink.task_id, pr, integration);
      return {
        success: true,
        task_id: existingLink.task_id,
        github_type: 'pull_request',
        github_id: pr.id.toString(),
        action: 'updated',
        changes: {
          status: pr.state,
          merged: pr.merged,
          draft: pr.draft
        }
      };
    } else if (integration.sync_settings.auto_link_prs) {
      // Auto-link to existing task or create new one
      const taskId = await this.findOrCreateTaskForPR(pr, integration);
      if (taskId) {
        await this.linkPullRequestToTask(taskId, pr, integration);
        return {
          success: true,
          task_id: taskId,
          github_type: 'pull_request',
          github_id: pr.id.toString(),
          action: 'linked',
          changes: {}
        };
      }
    }

    return null;
  }

  private async handleIssueEvent(
    issue: GitHubIssue,
    integration: GitHubIntegration
  ): Promise<GitHubSyncResult | null> {
    // Find existing task linked to this issue
    const existingLink = await this.findGitHubLink(issue.id.toString(), 'issue');
    
    if (existingLink) {
      // Update existing task
      await this.updateTaskStatusFromIssue(existingLink.task_id, issue, integration);
      return {
        success: true,
        task_id: existingLink.task_id,
        github_type: 'issue',
        github_id: issue.id.toString(),
        action: 'updated',
        changes: {
          status: issue.state
        }
      };
    } else if (integration.sync_settings.auto_create_tasks_from_issues) {
      // Create new task from issue
      const task = await this.createTaskFromIssue(issue, integration);
      return {
        success: true,
        task_id: task.id,
        github_type: 'issue',
        github_id: issue.id.toString(),
        action: 'created',
        changes: {}
      };
    }

    return null;
  }

  private async handleCommitEvent(
    commit: GitHubCommit,
    integration: GitHubIntegration
  ): Promise<GitHubSyncResult | null> {
    // Check if commit message contains task reference
    const taskReference = this.extractTaskReferenceFromCommit(commit.message);
    
    if (taskReference) {
      const task = await this.findTaskByReference(taskReference);
      if (task) {
        await this.linkCommitToTask(task.id, commit, integration);
        return {
          success: true,
          task_id: task.id,
          github_type: 'commit',
          github_id: commit.sha,
          action: 'linked',
          changes: {}
        };
      }
    }

    return null;
  }

  private async handlePullRequestSync(
    pr: GitHubPullRequest,
    integration: GitHubIntegration
  ): Promise<GitHubSyncResult | null> {
    const existingLink = await this.findGitHubLink(pr.id.toString(), 'pull_request');
    
    if (existingLink) {
      // Update task with latest PR changes
      await this.updateTaskFromPR(existingLink.task_id, pr, integration);
      return {
        success: true,
        task_id: existingLink.task_id,
        github_type: 'pull_request',
        github_id: pr.id.toString(),
        action: 'synced',
        changes: {
          updated_at: pr.updated_at,
          labels: pr.labels.map(l => l.name),
          assignees: pr.assignees.map(a => a.login)
        }
      };
    }

    return null;
  }

  private async handlePullRequestLabelEvent(
    pr: GitHubPullRequest,
    integration: GitHubIntegration
  ): Promise<GitHubSyncResult | null> {
    const existingLink = await this.findGitHubLink(pr.id.toString(), 'pull_request');
    
    if (existingLink) {
      // Update task labels and priority
      await this.updateTaskLabelsFromPR(existingLink.task_id, pr, integration);
      return {
        success: true,
        task_id: existingLink.task_id,
        github_type: 'pull_request',
        github_id: pr.id.toString(),
        action: 'updated',
        changes: {
          labels: pr.labels.map(l => l.name),
          priority: this.determinePriorityFromLabels(pr.labels, integration.sync_settings.priority_mapping)
        }
      };
    }

    return null;
  }

  private async handleIssueLabelEvent(
    issue: GitHubIssue,
    integration: GitHubIntegration
  ): Promise<GitHubSyncResult | null> {
    const existingLink = await this.findGitHubLink(issue.id.toString(), 'issue');
    
    if (existingLink) {
      // Update task labels and priority
      await this.updateTaskLabelsFromIssue(existingLink.task_id, issue, integration);
      return {
        success: true,
        task_id: existingLink.task_id,
        github_type: 'issue',
        github_id: issue.id.toString(),
        action: 'updated',
        changes: {
          labels: issue.labels.map(l => l.name),
          priority: this.determinePriorityFromLabels(issue.labels, integration.sync_settings.priority_mapping)
        }
      };
    }

    return null;
  }

  private async updateTaskStatusFromPR(
    taskId: string,
    pr: GitHubPullRequest,
    integration: GitHubIntegration
  ): Promise<void> {
    const statusMapping = integration.sync_settings.task_status_mapping;
    let newStatus: TaskStatus;

    if (pr.merged) {
      newStatus = statusMapping.merged;
    } else if (pr.state === 'closed') {
      newStatus = statusMapping.closed;
    } else if (pr.draft) {
      newStatus = statusMapping.draft;
    } else {
      newStatus = statusMapping.open;
    }

    // Update task status in database
    // await this.updateTaskStatus(taskId, newStatus);
  }

  private async updateTaskStatusFromIssue(
    taskId: string,
    issue: GitHubIssue,
    integration: GitHubIntegration
  ): Promise<void> {
    const statusMapping = integration.sync_settings.task_status_mapping;
    const newStatus = issue.state === 'open' ? statusMapping.open : statusMapping.closed;

    // Update task status in database
    // await this.updateTaskStatus(taskId, newStatus);
  }

  private async updateTaskFromPR(
    taskId: string,
    pr: GitHubPullRequest,
    integration: GitHubIntegration
  ): Promise<void> {
    // Update task with latest PR information
    const updates = {
      title: pr.title,
      description: pr.body,
      tags: pr.labels.map(l => l.name),
      priority: this.determinePriorityFromLabels(pr.labels, integration.sync_settings.priority_mapping),
      updated_at: new Date().toISOString()
    };

    // Update task in database
    // await this.updateTask(taskId, updates);
  }

  private async updateTaskLabelsFromPR(
    taskId: string,
    pr: GitHubPullRequest,
    integration: GitHubIntegration
  ): Promise<void> {
    const updates = {
      tags: pr.labels.map(l => l.name),
      priority: this.determinePriorityFromLabels(pr.labels, integration.sync_settings.priority_mapping),
      updated_at: new Date().toISOString()
    };

    // Update task in database
    // await this.updateTask(taskId, updates);
  }

  private async updateTaskLabelsFromIssue(
    taskId: string,
    issue: GitHubIssue,
    integration: GitHubIntegration
  ): Promise<void> {
    const updates = {
      tags: issue.labels.map(l => l.name),
      priority: this.determinePriorityFromLabels(issue.labels, integration.sync_settings.priority_mapping),
      updated_at: new Date().toISOString()
    };

    // Update task in database
    // await this.updateTask(taskId, updates);
  }

  private determinePriorityFromLabels(
    labels: GitHubLabel[],
    priorityMapping: PriorityMapping
  ): TaskPriority {
    const labelNames = labels.map(l => l.name.toLowerCase());
    
    if (labelNames.includes('critical') || labelNames.includes('urgent')) {
      return priorityMapping.critical;
    } else if (labelNames.includes('high') || labelNames.includes('important')) {
      return priorityMapping.high;
    } else if (labelNames.includes('low') || labelNames.includes('minor')) {
      return priorityMapping.low;
    } else {
      return priorityMapping.medium;
    }
  }

  private determineTaskTypeFromIssue(issue: GitHubIssue): TaskType {
    const labelNames = issue.labels.map(l => l.name.toLowerCase());
    const title = issue.title.toLowerCase();
    const body = (issue.body || '').toLowerCase();
    const content = `${title} ${body}`;

    if (labelNames.includes('bug') || content.includes('bug') || content.includes('fix')) {
      return TaskType.BUG_FIX;
    } else if (labelNames.includes('feature') || content.includes('feature') || content.includes('new')) {
      return TaskType.FEATURE;
    } else if (labelNames.includes('refactor') || content.includes('refactor')) {
      return TaskType.REFACTOR;
    } else if (labelNames.includes('docs') || content.includes('documentation')) {
      return TaskType.DOCUMENTATION;
    } else if (labelNames.includes('test') || content.includes('test')) {
      return TaskType.TEST;
    } else if (labelNames.includes('security') || content.includes('security')) {
      return TaskType.SECURITY;
    } else if (labelNames.includes('performance') || content.includes('performance')) {
      return TaskType.PERFORMANCE;
    } else if (labelNames.includes('integration') || content.includes('integration')) {
      return TaskType.INTEGRATION;
    } else if (labelNames.includes('migration') || content.includes('migration')) {
      return TaskType.MIGRATION;
    } else {
      return TaskType.FEATURE; // Default
    }
  }

  private extractTaskReferenceFromCommit(message: string): string | null {
    // Look for patterns like "HT-123", "Task-456", "#789", etc.
    const patterns = [
      /HT-\d+/g,
      /Task-\d+/g,
      /#\d+/g,
      /task\s*#?\d+/gi
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }

  private async findTaskByReference(reference: string): Promise<HeroTask | null> {
    // Find task by reference in database
    // Implementation would depend on your database setup
    return null;
  }

  private async findGitHubLink(githubId: string, githubType: string): Promise<GitHubLink | null> {
    // Find existing GitHub link in database
    // Implementation would depend on your database setup
    return null;
  }

  private async findOrCreateTaskForPR(
    pr: GitHubPullRequest,
    integration: GitHubIntegration
  ): Promise<string | null> {
    // Try to find existing task that matches PR title or content
    // If not found and auto-create is enabled, create new task
    // Implementation would depend on your database setup
    return null;
  }

  private generateWebhookSecret(): string {
    return crypto.randomUUID().replace(/-/g, '');
  }

  private async generateTaskNumber(): Promise<string> {
    // Generate next task number
    // Implementation would depend on your database setup
    return `HT-${Date.now()}`;
  }
}

// ============================================================================
// GITHUB API CLIENT
// ============================================================================

export class GitHubAPI {
  private baseUrl = 'https://api.github.com';

  async getRepository(owner: string, repo: string, token: string): Promise<GitHubRepository | null> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching repository:', error);
      return null;
    }
  }

  async createWebhook(
    owner: string,
    repo: string,
    webhookUrl: string,
    secret: string,
    token: string
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/hooks`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'web',
          active: true,
          events: ['pull_request', 'issues', 'push'],
          config: {
            url: webhookUrl,
            content_type: 'json',
            secret: secret
          }
        })
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating webhook:', error);
      return null;
    }
  }

  async getPullRequest(
    owner: string,
    repo: string,
    prNumber: number,
    token: string
  ): Promise<GitHubPullRequest | null> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching pull request:', error);
      return null;
    }
  }

  async getIssue(
    owner: string,
    repo: string,
    issueNumber: number,
    token: string
  ): Promise<GitHubIssue | null> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching issue:', error);
      return null;
    }
  }

  async getCommit(
    owner: string,
    repo: string,
    sha: string,
    token: string
  ): Promise<GitHubCommit | null> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching commit:', error);
      return null;
    }
  }
}

// ============================================================================
// EXPORTED UTILITY FUNCTIONS
// ============================================================================

export async function initializeGitHubIntegration(
  userId: string,
  repositoryOwner: string,
  repositoryName: string,
  githubToken: string,
  syncSettings?: Partial<GitHubSyncSettings>
): Promise<GitHubIntegration> {
  const engine = new GitHubIntegrationEngine();
  return engine.initializeIntegration(userId, repositoryOwner, repositoryName, githubToken, syncSettings);
}

export async function handleGitHubWebhook(
  event: GitHubWebhookEvent,
  integration: GitHubIntegration
): Promise<GitHubSyncResult[]> {
  const engine = new GitHubIntegrationEngine();
  return engine.handleWebhookEvent(event, integration);
}

export async function linkGitHubPRToTask(
  taskId: string,
  pullRequest: GitHubPullRequest,
  integration: GitHubIntegration
): Promise<GitHubLink> {
  const engine = new GitHubIntegrationEngine();
  return engine.linkPullRequestToTask(taskId, pullRequest, integration);
}

export async function linkGitHubIssueToTask(
  taskId: string,
  issue: GitHubIssue,
  integration: GitHubIntegration
): Promise<GitHubLink> {
  const engine = new GitHubIntegrationEngine();
  return engine.linkIssueToTask(taskId, issue, integration);
}

export async function linkGitHubCommitToTask(
  taskId: string,
  commit: GitHubCommit,
  integration: GitHubIntegration
): Promise<GitHubLink> {
  const engine = new GitHubIntegrationEngine();
  return engine.linkCommitToTask(taskId, commit, integration);
}
