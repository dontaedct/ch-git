#!/usr/bin/env node

/**
 * UI Polish Hero Task Creator
 * 
 * This script creates the UI Polish Hero Task in the Hero Tasks system
 * following the proper format and structure.
 * 
 * Usage: npm run create-ui-polish-task
 */

import { 
  UI_POLISH_MAIN_TASK, 
  UI_POLISH_SUBTASKS, 
  ADAV_CHECKLISTS,
  APPROVAL_REQUIREMENTS,
  SUCCESS_METRICS 
} from '../docs/ui-polish-hero-task';

// =============================================================================
// TASK CREATION SCRIPT
// =============================================================================

async function createUiPolishTask() {
  try {
    console.log('🎨 Creating UI Polish Hero Task...');
    
    // Create main task
    const mainTaskResponse = await fetch('/api/hero-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(UI_POLISH_MAIN_TASK),
    });

    if (!mainTaskResponse.ok) {
      throw new Error(`Failed to create main task: ${mainTaskResponse.statusText}`);
    }

    const mainTaskResult = await mainTaskResponse.json();
    
    if (!mainTaskResult.success) {
      throw new Error(`Failed to create main task: ${mainTaskResult.error}`);
    }

    const mainTaskId = mainTaskResult.data.id;
    console.log(`✅ Main task created: ${mainTaskResult.data.task_number}`);

    // Create subtasks
    const subtaskPromises = UI_POLISH_SUBTASKS.map(async (subtaskData, index) => {
      const subtaskRequest = {
        ...subtaskData,
        task_id: mainTaskId,
        metadata: {
          ...subtaskData.metadata,
          subtask_number: index + 1,
          workflow_checklist: ADAV_CHECKLISTS
        }
      };

      const response = await fetch('/api/hero-tasks/subtasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subtaskRequest),
      });

      if (!response.ok) {
        throw new Error(`Failed to create subtask ${index + 1}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`Failed to create subtask ${index + 1}: ${result.error}`);
      }

      return result.data;
    });

    const subtasks = await Promise.all(subtaskPromises);
    console.log(`✅ Created ${subtasks.length} subtasks`);

    // Create approval requirements as comments
    const approvalPromises = APPROVAL_REQUIREMENTS.map(async (approval) => {
      const commentRequest = {
        task_id: mainTaskId,
        content: `**APPROVAL REQUIRED**: ${approval.reason}\n\n**Minimal Alternative**: ${approval.minimal_alternative}`,
        comment_type: 'decision'
      };

      const response = await fetch('/api/hero-tasks/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentRequest),
      });

      return response.ok;
    });

    await Promise.all(approvalPromises);
    console.log('✅ Added approval requirements');

    // Create success metrics as metadata
    const metricsUpdate = {
      metadata: {
        ...UI_POLISH_MAIN_TASK.metadata,
        success_metrics: SUCCESS_METRICS,
        approval_requirements: APPROVAL_REQUIREMENTS,
        workflow_checklists: ADAV_CHECKLISTS
      }
    };

    const metricsResponse = await fetch(`/api/hero-tasks/${mainTaskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metricsUpdate),
    });

    if (metricsResponse.ok) {
      console.log('✅ Updated task metadata with success metrics');
    }

    console.log('\n🎉 UI Polish Hero Task created successfully!');
    console.log(`📋 Task Number: ${mainTaskResult.data.task_number}`);
    console.log(`🔗 View at: /hero-tasks/${mainTaskId}`);
    console.log('\n📝 Next Steps:');
    console.log('1. Review the task in the Hero Tasks dashboard');
    console.log('2. Start with SUB-TASK 1: Feature flag + No-Duplicate Guardrails');
    console.log('3. Follow ADAV methodology for each subtask');
    console.log('4. Request approvals for flagged items');

  } catch (error) {
    console.error('❌ Failed to create UI Polish Hero Task:', error);
    process.exit(1);
  }
}

// =============================================================================
// EXECUTION
// =============================================================================

if (require.main === module) {
  createUiPolishTask();
}

export { createUiPolishTask };
