/**
 * GitHub Integration Components
 * HT-004.4.3: React components for GitHub integration with PR/commit/issue linking
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Github, 
  GitPullRequest, 
  GitCommit, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Tag,
  ExternalLink,
  Link,
  RefreshCw,
  Settings,
  Loader2,
  Plus,
  Search,
  Filter,
  Calendar,
  Code,
  FileText
} from 'lucide-react';
import { TaskPriority, TaskType } from '@/types/hero-tasks';

// ============================================================================
// INTERFACES
// ============================================================================

interface GitHubIntegration {
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

interface GitHubSyncSettings {
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

interface TaskStatusMapping {
  open: string;
  closed: string;
  merged: string;
  draft: string;
  in_progress: string;
}

interface PriorityMapping {
  low: string;
  medium: string;
  high: string;
  critical: string;
}

interface GitHubLink {
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

interface GitHubPR {
  number: number;
  title: string;
  state: 'open' | 'closed';
  draft: boolean;
  merged: boolean;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  labels: Array<{
    name: string;
    color: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface GitHubIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  labels: Array<{
    name: string;
    color: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface GitHubCommit {
  sha: string;
  message: string;
  html_url: string;
  author: {
    name: string;
    email: string;
  };
  committer: {
    name: string;
    email: string;
  };
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

// ============================================================================
// GITHUB INTEGRATION SETUP COMPONENT
// ============================================================================

export function GitHubIntegrationSetup() {
  const [repositoryOwner, setRepositoryOwner] = useState('');
  const [repositoryName, setRepositoryName] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [syncSettings, setSyncSettings] = useState<Partial<GitHubSyncSettings>>({
    auto_link_prs: true,
    auto_link_commits: true,
    auto_link_issues: true,
    auto_update_task_status: true,
    sync_task_comments: true,
    sync_task_labels: true,
    auto_create_tasks_from_issues: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const initializeIntegration = async () => {
    if (!repositoryOwner || !repositoryName || !githubToken) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/github/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repository_owner: repositoryOwner,
          repository_name: repositoryName,
          github_token: githubToken,
          sync_settings: syncSettings
        })
      });

      const data = await response.json();

      if (data.ok) {
        setSuccess('GitHub integration initialized successfully!');
        setRepositoryOwner('');
        setRepositoryName('');
        setGithubToken('');
      } else {
        setError(data.error || 'Failed to initialize integration');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5 text-gray-800" />
          GitHub Integration Setup
        </CardTitle>
        <CardDescription>
          Connect your GitHub repository to Hero Tasks for automatic PR, issue, and commit linking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Repository Owner</label>
            <Input
              placeholder="e.g., microsoft"
              value={repositoryOwner}
              onChange={(e) => setRepositoryOwner(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Repository Name</label>
            <Input
              placeholder="e.g., vscode"
              value={repositoryName}
              onChange={(e) => setRepositoryName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">GitHub Personal Access Token</label>
          <Input
            type="password"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Create a token with repo access at github.com/settings/tokens
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Sync Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={syncSettings.auto_link_prs}
                onChange={(e) => setSyncSettings(prev => ({ ...prev, auto_link_prs: e.target.checked }))}
              />
              <span className="text-sm">Auto-link Pull Requests</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={syncSettings.auto_link_commits}
                onChange={(e) => setSyncSettings(prev => ({ ...prev, auto_link_commits: e.target.checked }))}
              />
              <span className="text-sm">Auto-link Commits</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={syncSettings.auto_link_issues}
                onChange={(e) => setSyncSettings(prev => ({ ...prev, auto_link_issues: e.target.checked }))}
              />
              <span className="text-sm">Auto-link Issues</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={syncSettings.auto_update_task_status}
                onChange={(e) => setSyncSettings(prev => ({ ...prev, auto_update_task_status: e.target.checked }))}
              />
              <span className="text-sm">Auto-update Task Status</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={syncSettings.sync_task_comments}
                onChange={(e) => setSyncSettings(prev => ({ ...prev, sync_task_comments: e.target.checked }))}
              />
              <span className="text-sm">Sync Task Comments</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={syncSettings.sync_task_labels}
                onChange={(e) => setSyncSettings(prev => ({ ...prev, sync_task_labels: e.target.checked }))}
              />
              <span className="text-sm">Sync Task Labels</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={syncSettings.auto_create_tasks_from_issues}
                onChange={(e) => setSyncSettings(prev => ({ ...prev, auto_create_tasks_from_issues: e.target.checked }))}
              />
              <span className="text-sm">Auto-create Tasks from Issues</span>
            </label>
          </div>
        </div>

        <Button 
          onClick={initializeIntegration} 
          disabled={loading || !repositoryOwner || !repositoryName || !githubToken}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initializing...
            </>
          ) : (
            <>
              <Github className="mr-2 h-4 w-4" />
              Initialize Integration
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// GITHUB LINKING COMPONENT
// ============================================================================

export function GitHubLinking({ taskId }: { taskId: string }) {
  const [repositoryOwner, setRepositoryOwner] = useState('');
  const [repositoryName, setRepositoryName] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [linkType, setLinkType] = useState<'pr' | 'issue' | 'commit'>('pr');
  const [linkValue, setLinkValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const linkGitHubItem = async () => {
    if (!repositoryOwner || !repositoryName || !githubToken || !linkValue) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let endpoint = '';
      let body: any = {
        task_id: taskId,
        repository_owner: repositoryOwner,
        repository_name: repositoryName,
        github_token: githubToken
      };

      switch (linkType) {
        case 'pr':
          endpoint = '/api/github/link-pr';
          body.pr_number = parseInt(linkValue);
          break;
        case 'issue':
          endpoint = '/api/github/link-issue';
          body.issue_number = parseInt(linkValue);
          break;
        case 'commit':
          endpoint = '/api/github/link-commit';
          body.commit_sha = linkValue;
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.ok) {
        setSuccess(`${linkType.toUpperCase()} linked successfully!`);
        setLinkValue('');
      } else {
        setError(data.error || `Failed to link ${linkType}`);
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5 text-blue-500" />
          Link GitHub Item
        </CardTitle>
        <CardDescription>
          Link a GitHub PR, issue, or commit to this task
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Repository Owner</label>
            <Input
              placeholder="e.g., microsoft"
              value={repositoryOwner}
              onChange={(e) => setRepositoryOwner(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Repository Name</label>
            <Input
              placeholder="e.g., vscode"
              value={repositoryName}
              onChange={(e) => setRepositoryName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">GitHub Personal Access Token</label>
          <Input
            type="password"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Link Type</label>
          <select
            className="w-full p-2 border rounded"
            value={linkType}
            onChange={(e) => setLinkType(e.target.value as 'pr' | 'issue' | 'commit')}
          >
            <option value="pr">Pull Request</option>
            <option value="issue">Issue</option>
            <option value="commit">Commit</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {linkType === 'pr' ? 'PR Number' : linkType === 'issue' ? 'Issue Number' : 'Commit SHA'}
          </label>
          <Input
            placeholder={linkType === 'commit' ? 'abc123def456...' : '123'}
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
          />
        </div>

        <Button 
          onClick={linkGitHubItem} 
          disabled={loading || !repositoryOwner || !repositoryName || !githubToken || !linkValue}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Linking...
            </>
          ) : (
            <>
              <Link className="mr-2 h-4 w-4" />
              Link {linkType.toUpperCase()}
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// GITHUB LINKS DISPLAY COMPONENT
// ============================================================================

export function GitHubLinksDisplay({ taskId }: { taskId: string }) {
  const [links, setLinks] = useState<GitHubLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGitHubLinks();
  }, [taskId]);

  const fetchGitHubLinks = async () => {
    try {
      // This would fetch GitHub links for the task
      // For now, using mock data
      setLinks([
        {
          id: '1',
          task_id: taskId,
          github_type: 'pull_request',
          github_id: '123',
          github_number: 42,
          github_url: 'https://github.com/owner/repo/pull/42',
          github_title: 'Fix login bug',
          github_state: 'open',
          github_author: 'developer',
          github_assignees: ['reviewer'],
          github_labels: ['bug', 'frontend'],
          last_synced_at: new Date().toISOString(),
          sync_status: 'synced',
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } catch (err) {
      setError('Failed to fetch GitHub links');
    } finally {
      setLoading(false);
    }
  };

  const getGitHubIcon = (type: string) => {
    switch (type) {
      case 'pull_request':
        return <GitPullRequest className="h-4 w-4" />;
      case 'issue':
        return <AlertTriangle className="h-4 w-4" />;
      case 'commit':
        return <GitCommit className="h-4 w-4" />;
      default:
        return <Github className="h-4 w-4" />;
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'merged':
        return 'bg-purple-100 text-purple-800';
      case 'committed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (links.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5 text-gray-800" />
            GitHub Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No GitHub items linked to this task yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5 text-gray-800" />
          GitHub Links
        </CardTitle>
        <CardDescription>
          GitHub items linked to this task
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {links.map((link) => (
          <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getGitHubIcon(link.github_type)}
              <div>
                <div className="flex items-center gap-2">
                  <a
                    href={link.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline"
                  >
                    {link.github_title}
                  </a>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>#{link.github_number || link.github_id}</span>
                  <Badge className={`${getStateColor(link.github_state)} text-xs`}>
                    {link.github_state}
                  </Badge>
                  <span>by {link.github_author}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {link.github_labels.map((label, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {label}
                </Badge>
              ))}
              <Badge 
                variant={link.sync_status === 'synced' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {link.sync_status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// GITHUB INTEGRATION DASHBOARD
// ============================================================================

export function GitHubIntegrationDashboard() {
  const [activeTab, setActiveTab] = useState<'setup' | 'links'>('setup');

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'setup' ? 'default' : 'outline'}
          onClick={() => setActiveTab('setup')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Setup Integration
        </Button>
        <Button
          variant={activeTab === 'links' ? 'default' : 'outline'}
          onClick={() => setActiveTab('links')}
        >
          <Link className="mr-2 h-4 w-4" />
          Manage Links
        </Button>
      </div>

      {activeTab === 'setup' && <GitHubIntegrationSetup />}
      {activeTab === 'links' && (
        <div className="space-y-4">
          <GitHubLinking taskId="current-task" />
          <GitHubLinksDisplay taskId="current-task" />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5 text-gray-800" />
            GitHub Integration Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <GitPullRequest className="h-8 w-8 mx-auto text-blue-500" />
              <h3 className="font-medium">Pull Request Linking</h3>
              <p className="text-sm text-muted-foreground">
                Link PRs to tasks and sync status automatically
              </p>
            </div>
            <div className="text-center space-y-2">
              <AlertTriangle className="h-8 w-8 mx-auto text-orange-500" />
              <h3 className="font-medium">Issue Integration</h3>
              <p className="text-sm text-muted-foreground">
                Connect GitHub issues to tasks with bidirectional sync
              </p>
            </div>
            <div className="text-center space-y-2">
              <GitCommit className="h-8 w-8 mx-auto text-green-500" />
              <h3 className="font-medium">Commit Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Track commits and automatically link them to tasks
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
