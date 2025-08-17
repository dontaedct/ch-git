#!/usr/bin/env node

/**
 * Auto-Generated Command Library
 * This script automatically scans package.json and creates a comprehensive command reference
 * Run this whenever you want to update the command library
 */

const fs = require('fs');
const path = require('path');

// Command categories with descriptions
const CATEGORIES = {
  'health': {
    name: '🏥 Health & Safety Checks',
    description: 'Commands to check if your code is healthy and safe',
    priority: 1
  },
  'development': {
    name: '🚀 Development & Building',
    description: 'Commands for developing, testing, and building your app',
    priority: 2
  },
  'git': {
    name: '📚 Git & Version Control',
    description: 'Commands for managing your code repository safely',
    priority: 3
  },
  'guardian': {
    name: '🛡️ Guardian & Automation',
    description: 'Commands for automated monitoring and backup systems',
    priority: 4
  },
  'workflow': {
    name: '⚡ Quick Workflows',
    description: 'Pre-built command combinations for common tasks',
    priority: 5
  },
  'rename': {
    name: '🔄 Safe Renaming',
    description: 'Commands for safely renaming files, imports, and symbols',
    priority: 6
  },
  'reporting': {
    name: '📊 Reports & Analysis',
    description: 'Commands for generating reports and analyzing your code',
    priority: 7
  },
  'maintenance': {
    name: '🔧 Maintenance & Utilities',
    description: 'Commands for keeping your project healthy and organized',
    priority: 8
  }
};

// Command descriptions and usage examples
const COMMAND_DESCRIPTIONS = {
  // Health & Safety
  'doctor': {
    description: 'Comprehensive TypeScript and import health check',
    usage: 'npm run doctor',
    when: 'Use daily to check for errors',
    example: 'npm run doctor',
    category: 'health'
  },
  'doctor:ultra-light': {
    description: 'Fast health check (5-10 seconds)',
    usage: 'npm run doctor:ultra-light',
    when: 'Use before committing code',
    example: 'npm run doctor:ultra-light',
    category: 'health'
  },
  'lint': {
    description: 'Check code style and find problems',
    usage: 'npm run lint',
    when: 'Use before committing or when code looks messy',
    example: 'npm run lint',
    category: 'health'
  },
  'lint:fix': {
    description: 'Automatically fix code style issues',
    usage: 'npm run lint:fix',
    when: 'After lint finds problems',
    example: 'npm run lint:fix',
    category: 'health'
  },
  'typecheck': {
    description: 'Check TypeScript types only',
    usage: 'npm run typecheck',
    when: 'When you only want to check types',
    example: 'npm run typecheck',
    category: 'health'
  },

  // Development
  'dev': {
    description: 'Start development server',
    usage: 'npm run dev',
    when: 'When you want to work on your app',
    example: 'npm run dev',
    category: 'development'
  },
  'build': {
    description: 'Build app for production',
    usage: 'npm run build',
    when: 'Before deploying or testing production build',
    example: 'npm run build',
    category: 'development'
  },
  'start': {
    description: 'Start production server',
    usage: 'npm run start',
    when: 'After building, to test production version',
    example: 'npm run start',
    category: 'development'
  },
  'test': {
    description: 'Run all tests',
    usage: 'npm run test',
    when: 'Before committing or when you make changes',
    example: 'npm run test',
    category: 'development'
  },
  'test:watch': {
    description: 'Run tests and watch for changes',
    usage: 'npm run test:watch',
    when: 'During development to see test results instantly',
    example: 'npm run test:watch',
    category: 'development'
  },

  // Git Safety
  'git:health': {
    description: 'Check git hooks and safety systems',
    usage: 'npm run git:health',
    when: 'When git seems broken or before important operations',
    example: 'npm run git:health',
    category: 'git'
  },
  'git:repair': {
    description: 'Automatically fix git problems',
    usage: 'npm run git:repair',
    when: 'When git:health shows problems',
    example: 'npm run git:repair',
    category: 'git'
  },
  'git:smart': {
    description: 'Manage git hooks intelligently',
    usage: 'npm run git:smart',
    when: 'Setting up git safety for the first time',
    example: 'npm run git:smart',
    category: 'git'
  },
  'git:auto': {
    description: 'Monitor git for problems automatically',
    usage: 'npm run git:auto',
    when: 'Setting up continuous git monitoring',
    example: 'npm run git:auto',
    category: 'git'
  },

  // Guardian & Automation
  'guardian': {
    description: 'Run guardian system once',
    usage: 'npm run guardian',
    when: 'Manual backup or health check',
    example: 'npm run guardian',
    category: 'guardian'
  },
  'guardian:start': {
    description: 'Start guardian monitoring system',
    usage: 'npm run guardian:start',
    when: 'Setting up automatic monitoring',
    example: 'npm run guardian:start',
    category: 'guardian'
  },
  'guardian:health': {
    description: 'Check guardian system health',
    usage: 'npm run guardian:health',
    when: 'Checking if monitoring is working',
    example: 'npm run guardian:health',
    category: 'guardian'
  },
  'guardian:backup': {
    description: 'Create manual backup',
    usage: 'npm run guardian:backup',
    when: 'Before major changes or manually',
    example: 'npm run guardian:backup',
    category: 'guardian'
  },

  // Quick Workflows
  'check:quick': {
    description: 'Fast health check (5-10 seconds)',
    usage: 'npm run check:quick',
    when: 'Daily use, before committing',
    example: 'npm run check:quick',
    category: 'workflow'
  },
  'check:full': {
    description: 'Full safety check (30-60 seconds)',
    usage: 'npm run check:full',
    when: 'Before pushing or important changes',
    example: 'npm run check:full',
    category: 'workflow'
  },
  'workflow:check': {
    description: 'Same as check:quick (easier to remember)',
    usage: 'npm run workflow:check',
    when: 'Daily use, before committing',
    example: 'npm run workflow:check',
    category: 'workflow'
  },
  'workflow:safe': {
    description: 'Same as check:full (easier to remember)',
    usage: 'npm run workflow:safe',
    when: 'Before pushing or important changes',
    example: 'npm run workflow:safe',
    category: 'workflow'
  },
  'workflow:ready': {
    description: 'Production ready check (everything)',
    usage: 'npm run workflow:ready',
    when: 'Before deploying',
    example: 'npm run workflow:ready',
    category: 'workflow'
  },
  'ci': {
    description: 'Full production check (lint + test + build)',
    usage: 'npm run ci',
    when: 'Before deploying or when you want to be sure',
    example: 'npm run ci',
    category: 'workflow'
  },
  'safe': {
    description: 'Full safety check with guardian health',
    usage: 'npm run safe',
    when: 'Before important changes',
    example: 'npm run safe',
    category: 'workflow'
  },

  // Safe Renaming
  'rename:symbol': {
    description: 'Safely rename a symbol across the codebase',
    usage: 'npm run rename:symbol -- OldName NewName',
    when: 'Renaming functions, variables, or classes',
    example: 'npm run rename:symbol -- oldFunction newFunction',
    category: 'rename'
  },
  'rename:import': {
    description: 'Safely rename import paths',
    usage: 'npm run rename:import -- @old/path @new/path',
    when: 'Moving files or reorganizing imports',
    example: 'npm run rename:import -- @data/old @data/new',
    category: 'rename'
  },
  'rename:route': {
    description: 'Safely rename API routes',
    usage: 'npm run rename:route -- oldRoute newRoute',
    when: 'Changing API endpoint names',
    example: 'npm run rename:route -- users clients',
    category: 'rename'
  },
  'rename:table': {
    description: 'Safely rename database tables',
    usage: 'npm run rename:table -- old_table new_table',
    when: 'Changing database structure',
    example: 'npm run rename:table -- user_table client_table',
    category: 'rename'
  },

  // Reporting
  'report:cursor': {
    description: 'Generate Cursor AI report',
    usage: 'npm run report:cursor',
    when: 'When you want to analyze your codebase',
    example: 'npm run report:cursor',
    category: 'reporting'
  },
  'report:cursor:api': {
    description: 'Generate API development report',
    usage: 'npm run report:cursor:api',
    when: 'Focusing on API development',
    example: 'npm run report:cursor:api',
    category: 'reporting'
  },
  'report:cursor:ui': {
    description: 'Generate UI component report',
    usage: 'npm run report:cursor:ui',
    when: 'Focusing on UI development',
    example: 'npm run report:cursor:ui',
    category: 'reporting'
  },

  // Maintenance
  'helper': {
    description: 'Interactive command helper menu',
    usage: 'npm run helper',
    when: 'When you\'re not sure what command to use',
    example: 'npm run helper',
    category: 'maintenance'
  },
  'pre-commit': {
    description: 'Run pre-commit checks',
    usage: 'npm run pre-commit',
    when: 'Before committing (usually automatic)',
    example: 'npm run pre-commit',
    category: 'maintenance'
  },
  'pre-push': {
    description: 'Run pre-push safety checks',
    usage: 'npm run pre-push',
    when: 'Before pushing (usually automatic)',
    example: 'npm run pre-push',
    category: 'maintenance'
  }
};

function generateCommandLibrary() {
  try {
    // Read package.json
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const scripts = packageData.scripts || {};

    // Group commands by category
    const categorizedCommands = {};
    const uncategorizedCommands = [];

    Object.keys(scripts).forEach(command => {
      const commandInfo = COMMAND_DESCRIPTIONS[command];
      
      if (commandInfo) {
        const category = commandInfo.category;
        if (!categorizedCommands[category]) {
          categorizedCommands[category] = [];
        }
        categorizedCommands[category].push({
          command,
          ...commandInfo
        });
      } else {
        // For commands not in our descriptions, try to categorize them
        let category = 'maintenance';
        if (command.includes('doctor') || command.includes('lint') || command.includes('check')) {
          category = 'health';
        } else if (command.includes('dev') || command.includes('build') || command.includes('test')) {
          category = 'development';
        } else if (command.includes('git')) {
          category = 'git';
        } else if (command.includes('guardian')) {
          category = 'guardian';
        } else if (command.includes('workflow') || command.includes('safe') || command.includes('ci')) {
          category = 'workflow';
        } else if (command.includes('rename')) {
          category = 'rename';
        } else if (command.includes('report')) {
          category = 'reporting';
        }

        if (!categorizedCommands[category]) {
          categorizedCommands[category] = [];
        }
        categorizedCommands[category].push({
          command,
          description: `Command: ${command}`,
          usage: `npm run ${command}`,
          when: 'Use when needed',
          example: `npm run ${command}`,
          category
        });
      }
    });

    // Sort categories by priority
    const sortedCategories = Object.keys(CATEGORIES).sort((a, b) => 
      CATEGORIES[a].priority - CATEGORIES[b].priority
    );

    // Generate the markdown
    let markdown = `# 🚀 Complete Command Library
*Auto-generated from your package.json - Always up-to-date!*

> **💡 Pro Tip**: Run \`npm run helper\` for an interactive menu, or use \`npm run check:quick\` for daily health checks.

## 📋 **Quick Start Commands (Use These Daily)**

| Command | What It Does | When To Use |
|---------|--------------|-------------|
| \`npm run check:quick\` | Fast health check (5-10 seconds) | **Every morning, before committing** |
| \`npm run helper\` | Interactive command menu | **When you're confused** |
| \`npm run dev\` | Start development server | **When working on your app** |

## 🎯 **Daily Workflow**

### **Morning (5 minutes)**
\`\`\`bash
npm run check:quick     # Make sure everything is working
\`\`\`

### **Before Committing (2 minutes)**
\`\`\`bash
npm run check:quick     # Quick safety check
\`\`\`

### **Before Pushing (5 minutes)**
\`\`\`bash
npm run check:full      # Full safety check
\`\`\`

### **Before Deploying (10 minutes)**
\`\`\`bash
npm run workflow:ready  # Production ready check
\`\`\`

---

`;

    // Add each category
    sortedCategories.forEach(categoryKey => {
      const category = CATEGORIES[categoryKey];
      const commands = categorizedCommands[categoryKey] || [];
      
      if (commands.length > 0) {
        markdown += `## ${category.name}\n`;
        markdown += `${category.description}\n\n`;
        
        // Sort commands alphabetically within category
        commands.sort((a, b) => a.command.localeCompare(b.command));
        
        markdown += '| Command | Description | Usage | When To Use |\n';
        markdown += '|---------|-------------|-------|-------------|\n';
        
        commands.forEach(cmd => {
          markdown += `| \`${cmd.command}\` | ${cmd.description} | \`${cmd.usage}\` | ${cmd.when} |\n`;
        });
        
        markdown += '\n';
      }
    });

    // Add troubleshooting section
    markdown += `## 🚨 **When Things Go Wrong**

### **TypeScript Errors**
\`\`\`bash
npm run doctor          # Find the problems
npm run doctor:fix      # Try to fix automatically
\`\`\`

### **Linting Errors**
\`\`\`bash
npm run lint            # See what's wrong
npm run lint:fix        # Try to fix automatically
\`\`\`

### **Git Problems**
\`\`\`bash
npm run git:repair      # Fix git issues
npm run git:health      # Check if it's fixed
\`\`\`

## 💡 **Pro Tips**

1. **Always run \`npm run check:quick\` before committing**
2. **Use \`npm run helper\` when you forget what to do**
3. **The \`workflow:*\` commands are easier to remember**
4. **If something breaks, run \`npm run git:repair\` first**
5. **Keep this file open while developing**

## 🔄 **Command Aliases (Easier to Remember)**

- \`check:quick\` = \`workflow:check\`
- \`check:full\` = \`workflow:safe\`  
- \`ci\` = \`workflow:ready\`

## 📱 **Quick Reference Card**

**Daily**: \`npm run check:quick\`
**Before Commit**: \`npm run check:quick\`
**Before Push**: \`npm run check:full\`
**Before Deploy**: \`npm run workflow:ready\`
**Help**: \`npm run helper\`
**Git Problems**: \`npm run git:repair\`

---

*This document was automatically generated on ${new Date().toLocaleString()}. It will always be up-to-date with your latest commands!*
`;

    // Write the file
    const outputPath = path.join(process.cwd(), 'COMMAND_LIBRARY.md');
    fs.writeFileSync(outputPath, markdown, 'utf8');

    console.log('✅ Command library generated successfully!');
    console.log(`📁 File created: ${outputPath}`);
    console.log('🚀 You can now use "show commands" in Cursor AI to see this!');

    return outputPath;
  } catch (error) {
    console.error('❌ Error generating command library:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateCommandLibrary();
}

module.exports = { generateCommandLibrary };
