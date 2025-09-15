/**
 * @fileoverview Hero Tasks VS Code Extension
 * @module vscode-extension/src/extension
 * @author OSS Hero System
 * @version 1.0.0
 * @created 2025-09-08T17:10:48.000Z
 */

import * as vscode from 'vscode';

interface HeroTask {
  id: string;
  task_number: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  type: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  assignee_id?: string;
  tags: string[];
}

interface TaskTreeItem extends vscode.TreeItem {
  task: HeroTask;
}

class HeroTasksProvider implements vscode.TreeDataProvider<HeroTask> {
  private _onDidChangeTreeData: vscode.EventEmitter<HeroTask | undefined | null | void> = new vscode.EventEmitter<HeroTask | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<HeroTask | undefined | null | void> = this._onDidChangeTreeData.event;

  private tasks: HeroTask[] = [];
  private apiUrl: string;

  constructor() {
    const config = vscode.workspace.getConfiguration('hero-tasks');
    this.apiUrl = config.get('apiUrl', 'http://localhost:3000');
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: HeroTask): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(
      `${element.task_number}: ${element.title}`,
      vscode.TreeItemCollapsibleState.None
    );

    treeItem.description = `${element.status} | ${element.priority}`;
    treeItem.tooltip = element.description || element.title;
    treeItem.contextValue = 'hero-task';

    // Set icon based on status
    switch (element.status) {
      case 'completed':
        treeItem.iconPath = new vscode.ThemeIcon('check');
        break;
      case 'in_progress':
        treeItem.iconPath = new vscode.ThemeIcon('play');
        break;
      case 'blocked':
        treeItem.iconPath = new vscode.ThemeIcon('error');
        break;
      case 'draft':
        treeItem.iconPath = new vscode.ThemeIcon('edit');
        break;
      default:
        treeItem.iconPath = new vscode.ThemeIcon('circle-outline');
    }

    // Set color based on priority
    switch (element.priority) {
      case 'critical':
        treeItem.iconPath = new vscode.ThemeIcon('alert', new vscode.ThemeColor('errorForeground'));
        break;
      case 'high':
        treeItem.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('charts.orange'));
        break;
      case 'medium':
        treeItem.iconPath = new vscode.ThemeIcon('info', new vscode.ThemeColor('charts.blue'));
        break;
      case 'low':
        treeItem.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
        break;
    }

    return treeItem;
  }

  getChildren(element?: HeroTask): Thenable<HeroTask[]> {
    if (!element) {
      return this.fetchTasks();
    }
    return Promise.resolve([]);
  }

  private async fetchTasks(): Promise<HeroTask[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/hero-tasks`);
      const data = await response.json();
      
      if (data.success && data.data) {
        this.tasks = data.data;
        return this.tasks;
      } else {
        vscode.window.showErrorMessage('Failed to fetch tasks from Hero Tasks API');
        return [];
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error fetching tasks: ${error}`);
      return [];
    }
  }

  async createTask(): Promise<void> {
    const title = await vscode.window.showInputBox({
      prompt: 'Enter task title',
      placeHolder: 'Task title'
    });

    if (!title) {
      return;
    }

    const description = await vscode.window.showInputBox({
      prompt: 'Enter task description (optional)',
      placeHolder: 'Task description'
    });

    const priority = await vscode.window.showQuickPick(
      ['critical', 'high', 'medium', 'low'],
      {
        placeHolder: 'Select priority',
        canPickMany: false
      }
    );

    if (!priority) {
      return;
    }

    const type = await vscode.window.showQuickPick(
      ['feature', 'bug_fix', 'refactor', 'documentation', 'test'],
      {
        placeHolder: 'Select task type',
        canPickMany: false
      }
    );

    if (!type) {
      return;
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/hero-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: description || null,
          priority,
          type,
          status: 'draft',
          tags: []
        })
      });

      const data = await response.json();

      if (data.success) {
        vscode.window.showInformationMessage(`Task created: ${data.data.task_number}`);
        this.refresh();
      } else {
        vscode.window.showErrorMessage(`Failed to create task: ${data.error}`);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error creating task: ${error}`);
    }
  }

  async updateTaskStatus(task: HeroTask): Promise<void> {
    const status = await vscode.window.showQuickPick(
      ['draft', 'ready', 'in_progress', 'completed', 'blocked', 'cancelled'],
      {
        placeHolder: 'Select new status',
        canPickMany: false
      }
    );

    if (!status) {
      return;
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/hero-tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status
        })
      });

      const data = await response.json();

      if (data.success) {
        vscode.window.showInformationMessage(`Task ${task.task_number} updated to ${status}`);
        this.refresh();
      } else {
        vscode.window.showErrorMessage(`Failed to update task: ${data.error}`);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error updating task: ${error}`);
    }
  }

  async showTaskDetails(task: HeroTask): Promise<void> {
    const panel = vscode.window.createWebviewPanel(
      'heroTaskDetails',
      `Task ${task.task_number}`,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task ${task.task_number}</title>
        <style>
          body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            line-height: 1.6;
          }
          .task-header {
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .task-title {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .task-meta {
            display: flex;
            gap: 20px;
            margin-bottom: 10px;
          }
          .meta-item {
            display: flex;
            flex-direction: column;
          }
          .meta-label {
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 5px;
          }
          .meta-value {
            font-weight: bold;
          }
          .status-completed { color: var(--vscode-charts-green); }
          .status-in_progress { color: var(--vscode-charts-blue); }
          .status-blocked { color: var(--vscode-charts-red); }
          .status-draft { color: var(--vscode-charts-yellow); }
          .priority-critical { color: var(--vscode-charts-red); }
          .priority-high { color: var(--vscode-charts-orange); }
          .priority-medium { color: var(--vscode-charts-blue); }
          .priority-low { color: var(--vscode-charts-green); }
          .task-description {
            margin-top: 20px;
            padding: 15px;
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
          }
          .task-tags {
            margin-top: 15px;
          }
          .tag {
            display: inline-block;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            margin-right: 8px;
            margin-bottom: 8px;
          }
        </style>
      </head>
      <body>
        <div class="task-header">
          <div class="task-title">${task.title}</div>
          <div class="task-meta">
            <div class="meta-item">
              <div class="meta-label">Task Number</div>
              <div class="meta-value">${task.task_number}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Status</div>
              <div class="meta-value status-${task.status}">${task.status}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Priority</div>
              <div class="meta-value priority-${task.priority}">${task.priority}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Type</div>
              <div class="meta-value">${task.type}</div>
            </div>
          </div>
          ${task.due_date ? `
            <div class="meta-item">
              <div class="meta-label">Due Date</div>
              <div class="meta-value">${new Date(task.due_date).toLocaleDateString()}</div>
            </div>
          ` : ''}
        </div>
        
        ${task.description ? `
          <div class="task-description">
            <strong>Description:</strong><br>
            ${task.description}
          </div>
        ` : ''}
        
        ${task.tags && task.tags.length > 0 ? `
          <div class="task-tags">
            <strong>Tags:</strong><br>
            ${task.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--vscode-panel-border);">
          <small style="color: var(--vscode-descriptionForeground);">
            Created: ${new Date(task.created_at).toLocaleString()}<br>
            Updated: ${new Date(task.updated_at).toLocaleString()}
          </small>
        </div>
      </body>
      </html>
    `;

    panel.webview.html = html;
  }

  async showAnalytics(): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/api/hero-tasks/analytics`);
      const data = await response.json();

      if (data.success && data.data) {
        const analytics = data.data;
        
        const panel = vscode.window.createWebviewPanel(
          'heroTasksAnalytics',
          'Hero Tasks Analytics',
          vscode.ViewColumn.One,
          {
            enableScripts: true,
            retainContextWhenHidden: true
          }
        );

        const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hero Tasks Analytics</title>
            <style>
              body {
                font-family: var(--vscode-font-family);
                font-size: var(--vscode-font-size);
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
                padding: 20px;
                line-height: 1.6;
              }
              .analytics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
              }
              .stat-card {
                background-color: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 8px;
                padding: 20px;
                text-align: center;
              }
              .stat-value {
                font-size: 2em;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .stat-label {
                color: var(--vscode-descriptionForeground);
                font-size: 0.9em;
              }
              .completion-rate { color: var(--vscode-charts-green); }
              .overdue-tasks { color: var(--vscode-charts-red); }
              .blocked-tasks { color: var(--vscode-charts-orange); }
              .total-tasks { color: var(--vscode-charts-blue); }
              .breakdown-section {
                margin-top: 30px;
              }
              .breakdown-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin-top: 15px;
              }
              .breakdown-item {
                background-color: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                padding: 15px;
                text-align: center;
              }
              .breakdown-value {
                font-size: 1.5em;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .breakdown-label {
                color: var(--vscode-descriptionForeground);
                font-size: 0.8em;
              }
            </style>
          </head>
          <body>
            <h1>📊 Hero Tasks Analytics</h1>
            
            <div class="analytics-grid">
              <div class="stat-card">
                <div class="stat-value total-tasks">${analytics.total_tasks}</div>
                <div class="stat-label">Total Tasks</div>
              </div>
              <div class="stat-card">
                <div class="stat-value completion-rate">${analytics.completion_rate.toFixed(1)}%</div>
                <div class="stat-label">Completion Rate</div>
              </div>
              <div class="stat-card">
                <div class="stat-value overdue-tasks">${analytics.overdue_tasks}</div>
                <div class="stat-label">Overdue Tasks</div>
              </div>
              <div class="stat-card">
                <div class="stat-value blocked-tasks">${analytics.blocked_tasks}</div>
                <div class="stat-label">Blocked Tasks</div>
              </div>
            </div>

            <div class="breakdown-section">
              <h2>📈 Status Breakdown</h2>
              <div class="breakdown-grid">
                ${Object.entries(analytics.tasks_by_status).map(([status, count]) => `
                  <div class="breakdown-item">
                    <div class="breakdown-value">${count}</div>
                    <div class="breakdown-label">${status}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="breakdown-section">
              <h2>🎯 Priority Breakdown</h2>
              <div class="breakdown-grid">
                ${Object.entries(analytics.tasks_by_priority).map(([priority, count]) => `
                  <div class="breakdown-item">
                    <div class="breakdown-value">${count}</div>
                    <div class="breakdown-label">${priority}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            ${analytics.average_duration_hours > 0 ? `
              <div class="breakdown-section">
                <h2>⏱️ Average Duration</h2>
                <div class="stat-card">
                  <div class="stat-value">${analytics.average_duration_hours.toFixed(1)} hours</div>
                  <div class="stat-label">Per Task</div>
                </div>
              </div>
            ` : ''}
          </body>
          </html>
        `;

        panel.webview.html = html;
      } else {
        vscode.window.showErrorMessage('Failed to fetch analytics');
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error fetching analytics: ${error}`);
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new HeroTasksProvider();
  
  // Register tree data provider
  vscode.window.registerTreeDataProvider('hero-tasks-view', provider);
  vscode.window.registerTreeDataProvider('hero-tasks-panel-view', provider);

  // Register commands
  const commands = [
    vscode.commands.registerCommand('hero-tasks.openPanel', () => {
      vscode.commands.executeCommand('hero-tasks-panel-view.focus');
    }),
    
    vscode.commands.registerCommand('hero-tasks.createTask', () => {
      provider.createTask();
    }),
    
    vscode.commands.registerCommand('hero-tasks.refreshTasks', () => {
      provider.refresh();
    }),
    
    vscode.commands.registerCommand('hero-tasks.updateTaskStatus', (task: HeroTask) => {
      provider.updateTaskStatus(task);
    }),
    
    vscode.commands.registerCommand('hero-tasks.showAnalytics', () => {
      provider.showAnalytics();
    })
  ];

  // Register tree item click handler
  const treeItemClickHandler = vscode.commands.registerCommand('hero-tasks.showTaskDetails', (task: HeroTask) => {
    provider.showTaskDetails(task);
  });

  // Add all commands to context
  context.subscriptions.push(...commands, treeItemClickHandler);

  // Auto-refresh if enabled
  const config = vscode.workspace.getConfiguration('hero-tasks');
  if (config.get('autoRefresh', true)) {
    const refreshInterval = config.get('refreshInterval', 30000);
    const interval = setInterval(() => {
      provider.refresh();
    }, refreshInterval);

    context.subscriptions.push({
      dispose: () => clearInterval(interval)
    });
  }

  vscode.window.showInformationMessage('Hero Tasks extension activated!');
}

export function deactivate() {
  // Cleanup if needed
}
