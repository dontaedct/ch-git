#!/usr/bin/env node

/**
 * Advanced Todo System - Hero League Task Management
 * Natural language interface for managing project tasks
 * Integrates with existing command systems and follows universal header rules
 */

const fs = require('fs');
const path = require('path');

// Todo categories with priority levels
const CATEGORIES = {
  'critical': {
    name: '🚨 Critical (S-tier Villains)',
    priority: 1,
    color: 'red',
    description: 'Immediate threats that must be contained'
  },
  'high': {
    name: '🔥 High Priority (A-tier Villains)',
    priority: 2,
    color: 'orange',
    description: 'Major threats that need containment soon'
  },
  'medium': {
    name: '⚡ Medium Priority (B-tier Villains)',
    priority: 3,
    color: 'yellow',
    description: 'Important improvements and promotions'
  },
  'low': {
    name: '💡 Low Priority (C-tier & Enhancements)',
    priority: 4,
    color: 'blue',
    description: 'Nice-to-have features and optimizations'
  },
  'completed': {
    name: '✅ Completed Heroes',
    priority: 5,
    color: 'green',
    description: 'Successfully promoted and contained'
  }
};

// Priority mapping for natural language
const PRIORITY_MAP = {
  'critical': ['critical', 'urgent', 'emergency', 'immediate', 'now', 'asap', 'fire', 'crisis'],
  'high': ['high', 'important', 'major', 'significant', 'priority', 'soon'],
  'medium': ['medium', 'moderate', 'normal', 'standard', 'regular'],
  'low': ['low', 'minor', 'small', 'nice', 'enhancement', 'optimization', 'later']
};

class TodoSystem {
  constructor() {
    this.todoFile = path.join(process.cwd(), 'TODO.md');
    this.todos = this.loadTodos();
  }

  loadTodos() {
    if (!fs.existsSync(this.todoFile)) {
      return this.initializeTodoFile();
    }
    
    try {
      const content = fs.readFileSync(this.todoFile, 'utf8');
      return this.parseTodoFile(content);
    } catch (error) {
      console.error('❌ Error loading todos:', error.message);
      return this.initializeTodoFile();
    }
  }

  initializeTodoFile() {
    const initialTodos = {
      critical: [
        {
          id: 'CRIT-001',
          title: 'Contain Brute-Force Hydra',
          description: 'Implement rate limiting on all API endpoints',
          category: 'critical',
          created: new Date().toISOString(),
          due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
          assignee: 'System',
          status: 'pending',
          tags: ['security', 'rate-limiting', 'api'],
          dependencies: [],
          effort: '3-5 days',
          impact: 'Critical security vulnerability',
          counterHero: 'Rate Limiter Paladin'
        },
        {
          id: 'CRIT-002',
          title: 'Exile Audit Phantom',
          description: 'Implement comprehensive audit logging for all security events',
          category: 'critical',
          created: new Date().toISOString(),
          due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          assignee: 'System',
          status: 'pending',
          tags: ['security', 'audit', 'logging'],
          dependencies: [],
          effort: '2-3 days',
          impact: 'No compliance trail for security events',
          counterHero: 'Audit Scribe'
        },
        {
          id: 'CRIT-003',
          title: 'Activate Observatory Trio',
          description: 'Wire Sentry fully with alerting and metrics',
          category: 'critical',
          created: new Date().toISOString(),
          due: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          assignee: 'System',
          status: 'pending',
          tags: ['monitoring', 'sentry', 'alerting'],
          dependencies: [],
          effort: '1-2 days',
          impact: 'Blind to production issues',
          counterHero: 'Observatory Trio'
        }
      ],
      high: [
        {
          id: 'HIGH-001',
          title: 'Cage Release Minotaur',
          description: 'Implement staging environment with CI/CD gates and rollback',
          category: 'high',
          created: new Date().toISOString(),
          due: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks
          assignee: 'System',
          status: 'pending',
          tags: ['deployment', 'staging', 'ci-cd'],
          dependencies: ['CRIT-003'],
          effort: '1 week',
          impact: 'Deployment risk and no rollback capability',
          counterHero: 'Staging Architect'
        }
      ],
      medium: [
        {
          id: 'MED-001',
          title: 'Promote Auth Gate to B-tier',
          description: 'Implement session hardening, CSRF protection, and device tracking',
          category: 'medium',
          created: new Date().toISOString(),
          due: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks
          assignee: 'System',
          status: 'pending',
          tags: ['security', 'auth', 'sessions'],
          dependencies: ['CRIT-001'],
          effort: '3-4 days',
          impact: 'Session security vulnerabilities',
          counterHero: 'Session Warden'
        }
      ],
      low: [
        {
          id: 'LOW-001',
          title: 'Enhance Command Oracle',
          description: 'Add more interactive features and better categorization',
          category: 'low',
          created: new Date().toISOString(),
          due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month
          assignee: 'System',
          status: 'pending',
          tags: ['ux', 'commands', 'helper'],
          dependencies: [],
          effort: '1-2 days',
          impact: 'Better developer experience',
          counterHero: 'Command Oracle'
        }
      ],
      completed: []
    };

    this.saveTodos(initialTodos);
    return initialTodos;
  }

  parseTodoFile(content) {
    const todos = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      completed: []
    };

    let currentCategory = '';
    let currentTodo = null;

    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        // Category header - use this to determine current section
        const categoryMatch = line.match(/## (.*)/);
        if (categoryMatch) {
          const categoryName = categoryMatch[1].toLowerCase();
          if (categoryName.includes('critical')) currentCategory = 'critical';
          else if (categoryName.includes('high')) currentCategory = 'high';
          else if (categoryName.includes('medium')) currentCategory = 'medium';
          else if (categoryName.includes('low')) currentCategory = 'low';
          else if (categoryName.includes('completed')) currentCategory = 'completed';
        }
      } else if (line.startsWith('### ')) {
        // Todo item - start new todo
        if (currentTodo && currentCategory) {
          // Ensure the todo has the correct category from the section
          currentTodo.category = currentCategory;
          todos[currentCategory].push(currentTodo);
        }
        
        const titleMatch = line.match(/### (.*)/);
        if (titleMatch) {
          currentTodo = {
            id: '', // Will be filled from ID line
            title: titleMatch[1].trim(),
            category: currentCategory, // Set the category based on current section
            created: new Date().toISOString(),
            due: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // Default 3 weeks
            status: 'pending',
            tags: [],
            dependencies: [],
            effort: 'Unknown',
            impact: 'Unknown',
            counterHero: 'Unknown'
          };
        }
      } else if (line.includes('**Status:**') && currentTodo) {
        const statusMatch = line.match(/\*\*Status:\*\* (.*)/);
        if (statusMatch) currentTodo.status = statusMatch[1].trim();
      } else if (line.includes('**Effort:**') && currentTodo) {
        const effortMatch = line.match(/\*\*Effort:\*\* (.*)/);
        if (effortMatch) currentTodo.effort = effortMatch[1].trim();
      } else if (line.includes('**Impact:**') && currentTodo) {
        const impactMatch = line.match(/\*\*Impact:\*\* (.*)/);
        if (impactMatch) currentTodo.impact = impactMatch[1].trim();
      } else if (line.includes('**ID:**') && currentTodo) {
        const idMatch = line.match(/\*\*ID:\*\* (.*)/);
        if (idMatch) currentTodo.id = idMatch[1].trim();
      } else if (line.includes('**Due:**') && currentTodo) {
        const dueMatch = line.match(/\*\*Due:\*\* (.*)/);
        if (dueMatch) {
          const dueDate = new Date(dueMatch[1].trim());
          if (!isNaN(dueDate.getTime())) {
            currentTodo.due = dueDate.toISOString();
          }
        }
      } else if (line.includes('**Counter-Hero:**') && currentTodo) {
        const heroMatch = line.match(/\*\*Counter-Hero:\*\* (.*)/);
        if (heroMatch) currentTodo.counterHero = heroMatch[1].trim();
      }
    }

    // Add the last todo
    if (currentTodo && currentCategory) {
      currentTodo.category = currentCategory;
      todos[currentCategory].push(currentTodo);
    }

    return todos;
  }

  generateId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${timestamp}-${random}`.toUpperCase();
  }

  addTodo(title, description = '', category = 'medium', priority = 'medium') {
    // Auto-detect category from priority keywords
    const detectedCategory = this.detectCategoryFromPriority(priority);
    let finalCategory = category !== 'medium' ? category : detectedCategory;
    
    // Ensure the category exists in todos
    if (!this.todos[finalCategory]) {
      console.warn(`⚠️ Category '${finalCategory}' not found, defaulting to 'medium'`);
      finalCategory = 'medium';
    }

    const todo = {
      id: this.generateId(),
      title: title.trim(),
      description: description.trim(),
      category: finalCategory,
      created: new Date().toISOString(),
      due: this.calculateDueDate(finalCategory),
      assignee: 'System',
      status: 'pending',
      tags: this.extractTags(title + ' ' + description),
      dependencies: [],
      effort: this.estimateEffort(title + ' ' + description),
      impact: this.assessImpact(finalCategory),
      counterHero: this.suggestCounterHero(title + ' ' + description)
    };

    this.todos[finalCategory].push(todo);
    this.saveTodos(this.todos);
    
    console.log(`✅ Added "${todo.title}" to ${CATEGORIES[finalCategory].name}`);
    console.log(`🆔 ID: ${todo.id} | 📅 Due: ${new Date(todo.due).toLocaleDateString()}`);
    
    return todo;
  }

  detectCategoryFromPriority(priority) {
    const priorityLower = priority.toLowerCase();
    
    for (const [category, keywords] of Object.entries(PRIORITY_MAP)) {
      if (keywords.some(keyword => priorityLower.includes(keyword))) {
        return category;
      }
    }
    
    return 'medium'; // Default
  }

  calculateDueDate(category) {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    switch (category) {
      case 'critical': return new Date(now + 7 * dayMs).toISOString(); // 1 week
      case 'high': return new Date(now + 14 * dayMs).toISOString(); // 2 weeks
      case 'medium': return new Date(now + 21 * dayMs).toISOString(); // 3 weeks
      case 'low': return new Date(now + 30 * dayMs).toISOString(); // 1 month
      default: return new Date(now + 21 * dayMs).toISOString();
    }
  }

  extractTags(text) {
    const commonTags = [
      'security', 'performance', 'testing', 'deployment', 'monitoring',
      'auth', 'api', 'database', 'ui', 'ux', 'documentation',
      'automation', 'ci-cd', 'staging', 'production', 'rollback',
      'rate-limiting', 'audit', 'logging', 'sentry', 'playwright',
      'redis', 'caching', 'indexes', 'secrets', 'compliance'
    ];
    
    const textLower = text.toLowerCase();
    return commonTags.filter(tag => textLower.includes(tag));
  }

  estimateEffort(text) {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('implement') || textLower.includes('build') || textLower.includes('create')) {
      if (textLower.includes('simple') || textLower.includes('basic')) return '1-2 days';
      if (textLower.includes('complex') || textLower.includes('advanced')) return '1-2 weeks';
      return '3-5 days';
    }
    
    if (textLower.includes('fix') || textLower.includes('update') || textLower.includes('modify')) {
      return '1-3 days';
    }
    
    if (textLower.includes('review') || textLower.includes('audit') || textLower.includes('test')) {
      return '1-2 days';
    }
    
    return '2-4 days';
  }

  assessImpact(category) {
    switch (category) {
      case 'critical': return 'Critical security or stability risk';
      case 'high': return 'Major functionality or security impact';
      case 'medium': return 'Important improvement or feature';
      case 'low': return 'Nice-to-have enhancement';
      default: return 'Unknown impact';
    }
  }

  suggestCounterHero(text) {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('rate') || textLower.includes('limit') || textLower.includes('brute')) {
      return 'Rate Limiter Paladin';
    }
    
    if (textLower.includes('audit') || textLower.includes('log') || textLower.includes('compliance')) {
      return 'Audit Scribe';
    }
    
    if (textLower.includes('session') || textLower.includes('auth') || textLower.includes('csrf')) {
      return 'Session Warden';
    }
    
    if (textLower.includes('sentry') || textLower.includes('monitor') || textLower.includes('alert')) {
      return 'Observatory Trio';
    }
    
    if (textLower.includes('staging') || textLower.includes('deploy') || textLower.includes('rollback')) {
      return 'Staging Architect';
    }
    
    if (textLower.includes('load') || textLower.includes('performance') || textLower.includes('cache')) {
      return 'Load Champion';
    }
    
    if (textLower.includes('test') || textLower.includes('e2e') || textLower.includes('playwright')) {
      return 'Boundary Judge';
    }
    
    return 'System Hero';
  }

  completeTodo(id) {
    let foundTodo = null;
    let foundCategory = null;
    
    for (const [category, todos] of Object.entries(this.todos)) {
      if (category === 'completed') continue;
      
      const index = todos.findIndex(todo => todo.id === id);
      if (index !== -1) {
        foundTodo = todos[index];
        foundCategory = category;
        todos.splice(index, 1);
        break;
      }
    }
    
    if (foundTodo) {
      foundTodo.status = 'completed';
      foundTodo.completed = new Date().toISOString();
      this.todos.completed.push(foundTodo);
      this.saveTodos(this.todos);
      
      console.log(`🎉 Completed: "${foundTodo.title}"`);
      console.log(`🏆 Hero promoted: ${foundTodo.counterHero}`);
      
      return foundTodo;
    }
    
    console.log(`❌ Todo with ID ${id} not found`);
    return null;
  }

  listTodos(category = null) {
    if (category && this.todos[category]) {
      this.displayCategory(category, this.todos[category]);
    } else {
      for (const [cat, todos] of Object.entries(this.todos)) {
        if (todos.length > 0) {
          this.displayCategory(cat, todos);
        }
      }
    }
  }

  displayCategory(category, todos) {
    const catInfo = CATEGORIES[category];
    console.log(`\n${catInfo.name} (${todos.length} items)`);
    console.log(`${catInfo.description}`);
    console.log('─'.repeat(50));
    
    if (todos.length === 0) {
      console.log('✨ No items in this category');
      return;
    }
    
    todos.forEach(todo => {
      const status = todo.status === 'completed' ? '✅' : '⏳';
      const due = new Date(todo.due).toLocaleDateString();
      const effort = todo.effort;
      
      console.log(`${status} [${todo.id}] ${todo.title}`);
      console.log(`   📅 Due: ${due} | ⏱️ Effort: ${effort} | 🦸‍♂️ Hero: ${todo.counterHero}`);
      
      if (todo.description) {
        console.log(`   📝 ${todo.description}`);
      }
      
      if (todo.tags.length > 0) {
        console.log(`   🏷️ Tags: ${todo.tags.join(', ')}`);
      }
      
      console.log('');
    });
  }

  searchTodos(query) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    for (const [category, todos] of Object.entries(this.todos)) {
      for (const todo of todos) {
        if ((todo.title && todo.title.toLowerCase().includes(queryLower)) ||
            (todo.description && todo.description.toLowerCase().includes(queryLower)) ||
            (todo.tags && todo.tags.some(tag => tag.toLowerCase().includes(queryLower))) ||
            (todo.counterHero && todo.counterHero.toLowerCase().includes(queryLower))) {
          results.push({ ...todo, category });
        }
      }
    }
    
    if (results.length === 0) {
      console.log(`🔍 No todos found matching "${query}"`);
      return [];
    }
    
    console.log(`🔍 Found ${results.length} todos matching "${query}":`);
    results.forEach(result => {
      const status = result.status === 'completed' ? '✅' : '⏳';
      console.log(`${status} [${result.id}] ${result.title} (${CATEGORIES[result.category].name})`);
    });
    
    return results;
  }

  getStats() {
    const stats = {};
    let total = 0;
    
    for (const [category, todos] of Object.entries(this.todos)) {
      const count = todos.length;
      stats[category] = count;
      total += count;
    }
    
    console.log('\n📊 Todo System Statistics');
    console.log('─'.repeat(30));
    console.log(`Total Items: ${total}`);
    
    for (const [category, count] of Object.entries(stats)) {
      if (count > 0) {
        const percentage = ((count / total) * 100).toFixed(1);
        console.log(`${CATEGORIES[category].name}: ${count} (${percentage}%)`);
      }
    }
    
    const completed = stats.completed || 0;
    const pending = total - completed;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';
    
    console.log(`\n🎯 Completion Rate: ${completionRate}%`);
    console.log(`⏳ Pending: ${pending} | ✅ Completed: ${completed}`);
    
    return stats;
  }

  saveTodos(todos) {
    let markdown = `# 🦸‍♂️ Hero League Todo System
*Advanced Task Management for System Heroes*

> **💡 Pro Tip**: Use \`npm run todo:add [task]\` to add new items, or \`npm run todo:list\` to view all tasks.

## 📊 Quick Stats

- **Total Items**: ${Object.values(todos).reduce((sum, arr) => sum + arr.length, 0)}
- **Critical**: ${todos.critical.length} | **High**: ${todos.high.length} | **Medium**: ${todos.medium.length} | **Low**: ${todos.low.length}
- **Completed**: ${todos.completed.length}

---

`;

    // Add each category
    for (const [category, items] of Object.entries(todos)) {
      if (items.length === 0) continue;
      
      const catInfo = CATEGORIES[category];
      markdown += `## ${catInfo.name}\n`;
      markdown += `${catInfo.description}\n\n`;
      
      items.forEach(todo => {
        const status = todo.status === 'completed' ? '✅' : '⏳';
        const due = new Date(todo.due).toLocaleDateString();
        
        markdown += `### ${status} ${todo.title}\n`;
        markdown += `**ID:** ${todo.id} | **Due:** ${due} | **Effort:** ${todo.effort}\n\n`;
        
        if (todo.description) {
          markdown += `${todo.description}\n\n`;
        }
        
        markdown += `**Status:** ${todo.status}\n`;
        markdown += `**Impact:** ${todo.impact}\n`;
        markdown += `**Counter-Hero:** ${todo.counterHero}\n`;
        
        if (todo.tags.length > 0) {
          markdown += `**Tags:** ${todo.tags.join(', ')}\n`;
        }
        
        if (todo.dependencies.length > 0) {
          markdown += `**Dependencies:** ${todo.dependencies.join(', ')}\n`;
        }
        
        markdown += '\n---\n\n';
      });
    }
    
    markdown += `*Last Updated: ${new Date().toLocaleString()}*\n`;
    markdown += `*Hero League Status: Active - ${todos.completed.length} Heroes Promoted*\n`;
    
    fs.writeFileSync(this.todoFile, markdown, 'utf8');
  }

  // Natural language processing for adding todos
  processNaturalLanguage(input) {
    const inputLower = input.toLowerCase();
    
    // Extract priority
    let priority = 'medium';
    for (const [pri, keywords] of Object.entries(PRIORITY_MAP)) {
      if (keywords.some(keyword => inputLower.includes(keyword))) {
        priority = pri;
        break;
      }
    }
    
    // Extract title (everything after "add" or "create")
    let title = input;
    if (inputLower.includes('add ')) {
      title = input.substring(inputLower.indexOf('add ') + 4);
    } else if (inputLower.includes('create ')) {
      title = input.substring(inputLower.indexOf('create ') + 7);
    }
    
    // Clean up the title
    title = title.replace(/to the todo list/gi, '').replace(/to the to do list/gi, '').trim();
    
    if (!title) {
      console.log('❌ Please provide a task description');
      return null;
    }
    
    return this.addTodo(title, '', 'medium', priority);
  }
}

// CLI interface
function main() {
  const todoSystem = new TodoSystem();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🦸‍♂️ Hero League Todo System');
    console.log('Usage: npm run todo:[command] [args...]');
    console.log('\nCommands:');
    console.log('  npm run todo:add [task]     - Add new todo (auto-detects priority)');
    console.log('  npm run todo:list            - List all todos');
    console.log('  npm run todo:list [category] - List todos in specific category');
    console.log('  npm run todo:complete [id]   - Mark todo as completed');
    console.log('  npm run todo:search [query]  - Search todos');
    console.log('  npm run todo:stats           - Show statistics');
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'add':
      if (args.length < 2) {
        console.log('❌ Please provide a task description');
        return;
      }
      const taskDescription = args.slice(1).join(' ');
      todoSystem.processNaturalLanguage(taskDescription);
      break;
      
    case 'list':
      const category = args[1] || null;
      todoSystem.listTodos(category);
      break;
      
    case 'complete':
      if (args.length < 2) {
        console.log('❌ Please provide a todo ID');
        return;
      }
      todoSystem.completeTodo(args[1]);
      break;
      
    case 'search':
      if (args.length < 2) {
        console.log('❌ Please provide a search query');
        return;
      }
      todoSystem.searchTodos(args[1]);
      break;
      
    case 'stats':
      todoSystem.getStats();
      break;
      
    default:
      console.log(`❌ Unknown command: ${command}`);
      console.log('Use: npm run todo:add, npm run todo:list, npm run todo:complete, npm run todo:search, npm run todo:stats');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { TodoSystem, CATEGORIES, PRIORITY_MAP };
