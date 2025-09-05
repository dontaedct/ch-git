#!/usr/bin/env tsx

/**
 * Hero Task Creation Script
 * 
 * SAFE, NON-DISRUPTIVE script to create new hero tasks following
 * the established HT-001, HT-002, HT-003 patterns.
 * 
 * Universal Header: @scripts/create-hero-task.ts
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

interface TaskCreationRequest {
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'feature' | 'bug_fix' | 'refactor' | 'documentation' | 'test' | 'security' | 'performance' | 'integration' | 'migration' | 'maintenance' | 'research' | 'planning' | 'review' | 'deployment' | 'monitoring';
  estimatedHours: number;
  phases: number;
  tags: string[];
  deliverables: string[];
  successCriteria: Record<string, string>;
}

class HeroTaskCreator {
  private projectRoot: string;
  private heroTasksDir: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.heroTasksDir = join(this.projectRoot, 'docs', 'hero-tasks');
  }

  /**
   * Get the next available task number
   */
  private getNextTaskNumber(): string {
    try {
      const entries = readdirSync(this.heroTasksDir, { withFileTypes: true });
      const taskDirs = entries
        .filter(entry => entry.isDirectory() && entry.name.match(/^HT-\d{3}$/))
        .map(entry => entry.name)
        .sort();

      if (taskDirs.length === 0) {
        return 'HT-001';
      }

      const lastTask = taskDirs[taskDirs.length - 1];
      const lastNumber = parseInt(lastTask.replace('HT-', ''));
      const nextNumber = lastNumber + 1;
      
      return `HT-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error getting next task number:', error);
      return 'HT-001';
    }
  }

  /**
   * Create TypeScript task definition file
   */
  private createTypeScriptFile(taskNumber: string, request: TaskCreationRequest): void {
    const taskDir = join(this.heroTasksDir, taskNumber);
    const tsFilePath = join(taskDir, 'main-task.ts');

    const tsContent = `/**
 * ${taskNumber}: ${request.title}
 * 
 * This file contains the complete Hero Task definition for ${taskNumber},
 * following the Hero Tasks system format with proper task numbering, subtasks,
 * and ADAV methodology integration.
 * 
 * Universal Header: @docs/hero-tasks/${taskNumber}/main-task.ts
 */

import {
  HeroTask,
  HeroSubtask,
  HeroAction,
  CreateHeroTaskRequest,
  CreateHeroSubtaskRequest,
  CreateHeroActionRequest,
  TaskStatus,
  TaskPriority,
  TaskType,
  WorkflowPhase,
  WorkflowChecklistItem
} from '@/types/hero-tasks';

// =============================================================================
// MAIN TASK DEFINITION
// =============================================================================

export const ${taskNumber.replace('-', '_')}_MAIN_TASK: CreateHeroTaskRequest = {
  title: "${taskNumber}: ${request.title}",
  description: \`${request.description}

**Status:** PENDING
**Methodology:** AUDIT → DECIDE → APPLY → VERIFY
**Total Subtasks:** ${request.phases} major implementation phases
**Estimated Hours:** ${request.estimatedHours}\`,
  priority: TaskPriority.${request.priority.toUpperCase()},
  type: TaskType.${request.type.toUpperCase()},
  estimated_duration_hours: ${request.estimatedHours},
  tags: [
    ${request.tags.map(tag => `'${tag}'`).join(',\n    ')}
  ],
  metadata: {
    run_date: new Date().toISOString(),
    phases: ${request.phases},
    total_steps: ${request.phases * 4}, // Approximate steps per phase
    estimated_hours: ${request.estimatedHours},
    methodology: 'AUDIT → DECIDE → APPLY → VERIFY',
    deliverables: [
      ${request.deliverables.map(deliverable => `'${deliverable}'`).join(',\n      ')}
    ],
    success_criteria: ${JSON.stringify(request.successCriteria, null, 6)}
  }
};

// =============================================================================
// SUBTASKS DEFINITION
// =============================================================================

export const ${taskNumber.replace('-', '_')}_SUBTASKS: CreateHeroSubtaskRequest[] = [
${Array.from({ length: request.phases }, (_, i) => `  {
    task_id: '', // Will be set when main task is created
    title: "${taskNumber}.${i + 1}: Phase ${i + 1} — [Phase Name]",
    description: "Phase ${i + 1} implementation details and objectives.",
    priority: TaskPriority.${request.priority.toUpperCase()},
    type: TaskType.${request.type.toUpperCase()},
    estimated_duration_hours: ${Math.ceil(request.estimatedHours / request.phases)},
    tags: ['phase-${i + 1}', 'implementation'],
    metadata: {
      phase_number: ${i + 1},
      phase_objectives: [
        'Define phase objectives',
        'Implement phase deliverables',
        'Test and validate phase outcomes'
      ]
    }
  }`).join(',\n')}
];

// =============================================================================
// ADAV CHECKLISTS
// =============================================================================

export const ${taskNumber.replace('-', '_')}_ADAV_CHECKLISTS: Record<WorkflowPhase, WorkflowChecklistItem[]> = {
  audit: [
    {
      id: 'audit-current-state',
      description: 'Review current system state and requirements',
      completed: false,
      required: true
    },
    {
      id: 'audit-dependencies',
      description: 'Identify dependencies and constraints',
      completed: false,
      required: true
    }
  ],
  decide: [
    {
      id: 'decide-approach',
      description: 'Define implementation approach and strategy',
      completed: false,
      required: true
    },
    {
      id: 'decide-resources',
      description: 'Plan resources and timeline',
      completed: false,
      required: true
    }
  ],
  apply: [
    {
      id: 'apply-implementation',
      description: 'Execute implementation according to plan',
      completed: false,
      required: true
    },
    {
      id: 'apply-testing',
      description: 'Implement testing and validation',
      completed: false,
      required: true
    }
  ],
  verify: [
    {
      id: 'verify-functionality',
      description: 'Verify all functionality works as expected',
      completed: false,
      required: true
    },
    {
      id: 'verify-quality',
      description: 'Verify quality standards are met',
      completed: false,
      required: true
    }
  ]
};

// =============================================================================
// SUCCESS METRICS
// =============================================================================

export const ${taskNumber.replace('-', '_')}_SUCCESS_METRICS = {
${Object.entries(request.successCriteria).map(([key, value]) => `  ${key}: {
    target: '${value}',
    measurement: 'To be defined',
    achieved: false
  }`).join(',\n')}
};

// =============================================================================
// EXPORTS
// =============================================================================

// All exports are already declared above with the const declarations
`;

    writeFileSync(tsFilePath, tsContent);
    console.log(`✅ Created TypeScript file: ${tsFilePath}`);
  }

  /**
   * Create JSON structure file
   */
  private createJsonFile(taskNumber: string, request: TaskCreationRequest): void {
    const taskDir = join(this.heroTasksDir, taskNumber);
    const jsonFilePath = join(taskDir, `${taskNumber}_HERO_TASK_STRUCTURE.json`);

    const jsonContent = {
      mainTask: {
        task_number: taskNumber,
        title: `${taskNumber}: ${request.title}`,
        description: `${request.description}\n\n**Status:** PENDING\n**Methodology:** AUDIT → DECIDE → APPLY → VERIFY\n**Total Subtasks:** ${request.phases} major implementation phases\n**Estimated Hours:** ${request.estimatedHours}`,
        type: request.type,
        priority: request.priority,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: request.tags,
        metadata: {
          run_date: new Date().toISOString(),
          phases: request.phases,
          total_steps: request.phases * 4,
          estimated_hours: request.estimatedHours,
          methodology: 'AUDIT → DECIDE → APPLY → VERIFY',
          deliverables: request.deliverables,
          success_criteria: request.successCriteria
        }
      },
      subtasks: Array.from({ length: request.phases }, (_, i) => ({
        subtask_number: `${taskNumber}.${i + 1}`,
        title: `Phase ${i + 1} — [Phase Name]`,
        description: `Phase ${i + 1} implementation details and objectives.`,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: [`phase-${i + 1}`, 'implementation'],
        metadata: {
          phase_number: i + 1,
          phase_objectives: [
            'Define phase objectives',
            'Implement phase deliverables',
            'Test and validate phase outcomes'
          ]
        }
      }))
    };

    writeFileSync(jsonFilePath, JSON.stringify(jsonContent, null, 2));
    console.log(`✅ Created JSON file: ${jsonFilePath}`);
  }

  /**
   * Create directory structure
   */
  private createDirectoryStructure(taskNumber: string): void {
    const taskDir = join(this.heroTasksDir, taskNumber);
    const subtasksDir = join(taskDir, 'subtasks');
    const completionSummariesDir = join(taskDir, 'completion-summaries');

    // Create main task directory
    if (!existsSync(taskDir)) {
      mkdirSync(taskDir, { recursive: true });
      console.log(`✅ Created task directory: ${taskDir}`);
    }

    // Create subtasks directory
    if (!existsSync(subtasksDir)) {
      mkdirSync(subtasksDir, { recursive: true });
      console.log(`✅ Created subtasks directory: ${subtasksDir}`);
    }

    // Create completion-summaries directory
    if (!existsSync(completionSummariesDir)) {
      mkdirSync(completionSummariesDir, { recursive: true });
      console.log(`✅ Created completion-summaries directory: ${completionSummariesDir}`);
    }
  }

  /**
   * Create a new hero task
   */
  public createTask(request: TaskCreationRequest): void {
    try {
      console.log('🎯 Creating new Hero Task...');
      console.log('=====================================');

      // Get next task number
      const taskNumber = this.getNextTaskNumber();
      console.log(`📋 Task Number: ${taskNumber}`);

      // Create directory structure
      this.createDirectoryStructure(taskNumber);

      // Create TypeScript file
      this.createTypeScriptFile(taskNumber, request);

      // Create JSON file
      this.createJsonFile(taskNumber, request);

      console.log('=====================================');
      console.log('✅ Hero Task created successfully!');
      console.log(`📁 Location: docs/hero-tasks/${taskNumber}/`);
      console.log(`🔍 Run 'npm run hero:tasks:verify' to see the new task`);
      console.log('=====================================');

    } catch (error) {
      console.error('❌ Error creating hero task:', error);
      process.exit(1);
    }
  }
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🎯 Hero Task Creator');
    console.log('===================');
    console.log('');
    console.log('Usage: npm run create:hero-task -- <title>');
    console.log('');
    console.log('Example:');
    console.log('  npm run create:hero-task -- "Database Migration System"');
    console.log('');
    console.log('This will create a new hero task following the established patterns.');
    console.log('The script will prompt for additional details.');
    process.exit(0);
  }

  const title = args.join(' ');
  
  // For now, create a basic task structure
  // In a real implementation, you'd prompt for more details
  const request: TaskCreationRequest = {
    title,
    description: `Implementation of ${title.toLowerCase()}. This task follows the AUDIT → DECIDE → APPLY → VERIFY methodology to ensure systematic execution.`,
    priority: 'high',
    type: 'feature',
    estimatedHours: 16,
    phases: 4,
    tags: ['implementation', 'feature'],
    deliverables: [
      'Core functionality implementation',
      'Testing and validation',
      'Documentation',
      'Deployment'
    ],
    successCriteria: {
      functionality: 'All features working as expected',
      performance: 'Meets performance requirements',
      quality: 'Passes all quality checks'
    }
  };

  const creator = new HeroTaskCreator();
  creator.createTask(request);
}

// Run main function if this is the main module
main();

export { HeroTaskCreator, TaskCreationRequest };
