#!/usr/bin/env node

/**
 * @fileoverview Hero Tasks CLI Tool
 * @module bin/hero-tasks-cli
 * @author OSS Hero System
 * @version 1.0.0
 * @created 2025-09-08T17:10:48.000Z
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// =============================================================================
// CLI CONFIGURATION
// =============================================================================

const CLI_CONFIG = {
  name: 'hero-tasks',
  version: '1.0.0',
  description: 'Hero Tasks Command Line Interface',
  apiBaseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

// =============================================================================
// UTILITIES
// =============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ Error: ${message}`, colors.red);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// =============================================================================
// API CLIENT
// =============================================================================

class HeroTasksAPIClient {
  constructor(baseUrl = CLI_CONFIG.apiBaseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getTasks(filters = {}) {
    return this.request('/api/hero-tasks', {
      method: 'GET',
    });
  }

  async createTask(taskData) {
    return this.request('/api/hero-tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId, taskData) {
    return this.request(`/api/hero-tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId) {
    return this.request(`/api/hero-tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async getTask(taskId) {
    return this.request(`/api/hero-tasks/${taskId}`);
  }

  async searchTasks(query) {
    return this.request('/api/hero-tasks/search', {
      method: 'POST',
      body: JSON.stringify(query),
    });
  }

  async getAnalytics() {
    return this.request('/api/hero-tasks/analytics');
  }
}

// =============================================================================
// CLI COMMANDS
// =============================================================================

class HeroTasksCLI {
  constructor() {
    this.api = new HeroTasksAPIClient();
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  async promptPassword(question) {
    return new Promise((resolve) => {
      process.stdout.write(question);
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      
      let password = '';
      process.stdin.on('data', (char) => {
        char = char + '';
        switch (char) {
          case '\n':
          case '\r':
          case '\u0004':
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdout.write('\n');
            resolve(password);
            break;
          case '\u0003':
            process.exit();
            break;
          case '\u007f':
            if (password.length > 0) {
              password = password.slice(0, -1);
              process.stdout.write('\b \b');
            }
            break;
          default:
            password += char;
            process.stdout.write('*');
            break;
        }
      });
    });
  }

  async listTasks(options = {}) {
    try {
      info('Fetching tasks...');
      const response = await this.api.getTasks();
      
      if (!response.success || !response.data) {
        error('Failed to fetch tasks');
        return;
      }

      const tasks = response.data;
      
      if (tasks.length === 0) {
        info('No tasks found');
        return;
      }

      log('\n📋 Hero Tasks:', colors.bright);
      log('─'.repeat(80), colors.dim);

      tasks.forEach((task, index) => {
        const statusEmoji = this.getStatusEmoji(task.status);
        const priorityColor = this.getPriorityColor(task.priority);
        
        log(`${index + 1}. ${statusEmoji} ${task.task_number}: ${task.title}`, colors.bright);
        log(`   Status: ${task.status} | Priority: ${task.priority} | Type: ${task.type}`, priorityColor);
        
        if (task.description) {
          log(`   Description: ${task.description.substring(0, 60)}${task.description.length > 60 ? '...' : ''}`, colors.dim);
        }
        
        if (task.due_date) {
          const dueDate = new Date(task.due_date);
          const isOverdue = dueDate < new Date() && task.status !== 'completed';
          log(`   Due: ${dueDate.toLocaleDateString()} ${isOverdue ? '⚠️ OVERDUE' : ''}`, isOverdue ? colors.red : colors.dim);
        }
        
        log('');
      });

      log(`Total: ${tasks.length} tasks`, colors.dim);
    } catch (err) {
      error(`Failed to list tasks: ${err.message}`);
    }
  }

  async createTask() {
    try {
      log('\n🆕 Create New Task', colors.bright);
      log('─'.repeat(40), colors.dim);

      const title = await this.prompt('Task title: ');
      if (!title.trim()) {
        error('Task title is required');
        return;
      }

      const description = await this.prompt('Description (optional): ');
      const priority = await this.prompt('Priority (critical/high/medium/low) [medium]: ') || 'medium';
      const type = await this.prompt('Type (feature/bug_fix/refactor/documentation/test) [feature]: ') || 'feature';

      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        priority: priority.trim(),
        type: type.trim(),
        status: 'draft',
        tags: [],
      };

      info('Creating task...');
      const response = await this.api.createTask(taskData);

      if (response.success) {
        success(`Task created: ${response.data.task_number}`);
        log(`Title: ${response.data.title}`, colors.dim);
        log(`Status: ${response.data.status}`, colors.dim);
        log(`Priority: ${response.data.priority}`, colors.dim);
      } else {
        error(`Failed to create task: ${response.error}`);
      }
    } catch (err) {
      error(`Failed to create task: ${err.message}`);
    }
  }

  async updateTaskStatus() {
    try {
      log('\n🔄 Update Task Status', colors.bright);
      log('─'.repeat(40), colors.dim);

      const taskNumber = await this.prompt('Task number (e.g., HT-001): ');
      if (!taskNumber.trim()) {
        error('Task number is required');
        return;
      }

      const status = await this.prompt('New status (draft/ready/in_progress/completed/blocked/cancelled): ');
      if (!status.trim()) {
        error('Status is required');
        return;
      }

      // First, get the task to find its ID
      const tasksResponse = await this.api.getTasks();
      if (!tasksResponse.success) {
        error('Failed to fetch tasks');
        return;
      }

      const task = tasksResponse.data.find(t => t.task_number === taskNumber.trim());
      if (!task) {
        error(`Task ${taskNumber} not found`);
        return;
      }

      info(`Updating ${taskNumber}...`);
      const response = await this.api.updateTask(task.id, { status: status.trim() });

      if (response.success) {
        success(`Task ${taskNumber} updated to ${status}`);
      } else {
        error(`Failed to update task: ${response.error}`);
      }
    } catch (err) {
      error(`Failed to update task: ${err.message}`);
    }
  }

  async searchTasks() {
    try {
      log('\n🔍 Search Tasks', colors.bright);
      log('─'.repeat(40), colors.dim);

      const query = await this.prompt('Search query: ');
      if (!query.trim()) {
        error('Search query is required');
        return;
      }

      info('Searching tasks...');
      const response = await this.api.searchTasks({
        filters: {
          search_text: query.trim(),
        },
      });

      if (!response.success || !response.data) {
        error('Failed to search tasks');
        return;
      }

      const tasks = response.data.tasks;
      
      if (tasks.length === 0) {
        info('No tasks found matching your search');
        return;
      }

      log(`\n🔍 Search Results for "${query}":`, colors.bright);
      log('─'.repeat(60), colors.dim);

      tasks.forEach((task, index) => {
        const statusEmoji = this.getStatusEmoji(task.status);
        log(`${index + 1}. ${statusEmoji} ${task.task_number}: ${task.title}`, colors.bright);
        log(`   Status: ${task.status} | Priority: ${task.priority}`, colors.dim);
        log('');
      });

      log(`Found ${tasks.length} tasks`, colors.dim);
    } catch (err) {
      error(`Failed to search tasks: ${err.message}`);
    }
  }

  async showAnalytics() {
    try {
      info('Fetching analytics...');
      const response = await this.api.getAnalytics();

      if (!response.success || !response.data) {
        error('Failed to fetch analytics');
        return;
      }

      const analytics = response.data;

      log('\n📊 Task Analytics', colors.bright);
      log('─'.repeat(50), colors.dim);

      log(`Total Tasks: ${analytics.total_tasks}`, colors.bright);
      log(`Completion Rate: ${analytics.completion_rate.toFixed(1)}%`, colors.green);
      log(`Overdue Tasks: ${analytics.overdue_tasks}`, analytics.overdue_tasks > 0 ? colors.red : colors.green);
      log(`Blocked Tasks: ${analytics.blocked_tasks}`, analytics.blocked_tasks > 0 ? colors.yellow : colors.green);

      log('\n📈 Status Breakdown:', colors.bright);
      Object.entries(analytics.tasks_by_status).forEach(([status, count]) => {
        if (count > 0) {
          const emoji = this.getStatusEmoji(status);
          log(`  ${emoji} ${status}: ${count}`, colors.dim);
        }
      });

      log('\n🎯 Priority Breakdown:', colors.bright);
      Object.entries(analytics.tasks_by_priority).forEach(([priority, count]) => {
        if (count > 0) {
          const color = this.getPriorityColor(priority);
          log(`  ${priority}: ${count}`, color);
        }
      });

      if (analytics.average_duration_hours > 0) {
        log(`\n⏱️  Average Duration: ${analytics.average_duration_hours.toFixed(1)} hours`, colors.dim);
      }
    } catch (err) {
      error(`Failed to fetch analytics: ${err.message}`);
    }
  }

  async deleteTask() {
    try {
      log('\n🗑️  Delete Task', colors.bright);
      log('─'.repeat(40), colors.dim);

      const taskNumber = await this.prompt('Task number to delete (e.g., HT-001): ');
      if (!taskNumber.trim()) {
        error('Task number is required');
        return;
      }

      // First, get the task to find its ID and show details
      const tasksResponse = await this.api.getTasks();
      if (!tasksResponse.success) {
        error('Failed to fetch tasks');
        return;
      }

      const task = tasksResponse.data.find(t => t.task_number === taskNumber.trim());
      if (!task) {
        error(`Task ${taskNumber} not found`);
        return;
      }

      log(`\nTask Details:`, colors.bright);
      log(`  Number: ${task.task_number}`, colors.dim);
      log(`  Title: ${task.title}`, colors.dim);
      log(`  Status: ${task.status}`, colors.dim);
      log(`  Priority: ${task.priority}`, colors.dim);

      const confirm = await this.prompt('\nAre you sure you want to delete this task? (yes/no): ');
      if (confirm.toLowerCase() !== 'yes') {
        info('Task deletion cancelled');
        return;
      }

      info(`Deleting ${taskNumber}...`);
      const response = await this.api.deleteTask(task.id);

      if (response.success) {
        success(`Task ${taskNumber} deleted successfully`);
      } else {
        error(`Failed to delete task: ${response.error}`);
      }
    } catch (err) {
      error(`Failed to delete task: ${err.message}`);
    }
  }

  async showHelp() {
    log(`${colors.bright}${CLI_CONFIG.name} v${CLI_CONFIG.version}${colors.reset}`);
    log(CLI_CONFIG.description);
    log('');
    log('Usage:', colors.bright);
    log('  hero-tasks <command> [options]');
    log('');
    log('Commands:', colors.bright);
    log('  list                    List all tasks');
    log('  create                  Create a new task');
    log('  update                  Update task status');
    log('  search                  Search tasks');
    log('  analytics               Show task analytics');
    log('  delete                  Delete a task');
    log('  help                    Show this help');
    log('  version                 Show version');
    log('');
    log('Examples:', colors.bright);
    log('  hero-tasks list');
    log('  hero-tasks create');
    log('  hero-tasks update');
    log('  hero-tasks search');
    log('  hero-tasks analytics');
    log('');
    log('Configuration:', colors.bright);
    log('  Set NEXT_PUBLIC_APP_URL environment variable to change API endpoint');
    log('  Default: http://localhost:3000');
  }

  showVersion() {
    log(`${CLI_CONFIG.name} v${CLI_CONFIG.version}`);
  }

  getStatusEmoji(status) {
    const emojis = {
      draft: '📝',
      ready: '✅',
      in_progress: '🚀',
      completed: '🎉',
      blocked: '🚫',
      cancelled: '❌',
    };
    return emojis[status] || '❓';
  }

  getPriorityColor(priority) {
    const colors = {
      critical: colors.red,
      high: colors.yellow,
      medium: colors.blue,
      low: colors.green,
    };
    return colors[priority] || colors.dim;
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'list':
        case 'ls':
          await this.listTasks();
          break;
        case 'create':
        case 'new':
          await this.createTask();
          break;
        case 'update':
        case 'up':
          await this.updateTaskStatus();
          break;
        case 'search':
          await this.searchTasks();
          break;
        case 'analytics':
        case 'stats':
          await this.showAnalytics();
          break;
        case 'delete':
        case 'rm':
          await this.deleteTask();
          break;
        case 'help':
        case '--help':
        case '-h':
          this.showHelp();
          break;
        case 'version':
        case '--version':
        case '-v':
          this.showVersion();
          break;
        default:
          if (!command) {
            this.showHelp();
          } else {
            error(`Unknown command: ${command}`);
            log('Use "hero-tasks help" to see available commands');
          }
      }
    } catch (err) {
      error(`Command failed: ${err.message}`);
    } finally {
      this.rl.close();
    }
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  const cli = new HeroTasksCLI();
  await cli.run();
}

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  error(`Unhandled rejection: ${err?.message || err}`);
  process.exit(1);
});

// Run the CLI
main();
