/**
 * Hero Tasks Database Population Script
 * 
 * This script populates the Hero Tasks database with HT-001, HT-002, and HT-003
 * based on the consolidated task definitions and completion summaries.
 * 
 * Universal Header: @scripts/populate-hero-tasks.ts
 */

import { createClient } from '@/lib/supabase/client';
import {
  HT_001_MAIN_TASK,
  HT_001_SUBTASKS,
  HT_001_ADAV_CHECKLISTS,
  HT_001_SUCCESS_METRICS
} from '../docs/hero-tasks/HT-001/main-task';
import {
  HT_002_MAIN_TASK,
  HT_002_SUBTASKS,
  HT_002_ADAV_CHECKLISTS,
  HT_002_SUCCESS_METRICS
} from '../docs/hero-tasks/HT-002/main-task';
import {
  UI_POLISH_MAIN_TASK,
  UI_POLISH_SUBTASKS,
  ADAV_CHECKLISTS,
  SUCCESS_METRICS
} from '../docs/hero-tasks/HT-003/ui-polish-hero-task';

// =============================================================================
// DATABASE CLIENT
// =============================================================================

const supabase = createClient();

// =============================================================================
// TASK POPULATION FUNCTIONS
// =============================================================================

async function createMainTask(taskData: any) {
  try {
    const { data, error } = await supabase
      .from('hero_tasks')
      .insert({
        task_number: taskData.task_number || generateTaskNumber(),
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority || 'medium',
        type: taskData.type || 'feature',
        status: taskData.status || 'draft',
        estimated_duration_hours: taskData.estimated_duration_hours,
        actual_duration_hours: taskData.actual_duration_hours,
        current_phase: taskData.current_phase || 'audit',
        tags: taskData.tags || [],
        metadata: taskData.metadata || {},
        audit_trail: taskData.audit_trail || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(taskData.status === 'completed' && { completed_at: new Date().toISOString() }),
        ...(taskData.status === 'in_progress' && { started_at: new Date().toISOString() })
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create main task: ${error.message}`);
    }

    console.log(`✅ Created main task: ${data.title}`);
    return data;
  } catch (error) {
    console.error(`❌ Error creating main task:`, error);
    throw error;
  }
}

async function createSubtasks(mainTaskId: string, subtasks: any[]) {
  const createdSubtasks = [];
  
  for (const subtask of subtasks) {
    try {
      const { data, error } = await supabase
        .from('hero_subtasks')
        .insert({
          task_id: mainTaskId,
          subtask_number: subtask.title.split(':')[0], // Extract HT-001.1, etc.
          title: subtask.title,
          description: subtask.description,
          priority: subtask.priority || 'medium',
          type: subtask.type || 'feature',
          status: subtask.status || 'draft',
          estimated_duration_hours: subtask.estimated_duration_hours,
          actual_duration_hours: subtask.actual_duration_hours,
          tags: subtask.tags || [],
          metadata: subtask.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...(subtask.status === 'completed' && { completed_at: new Date().toISOString() }),
          ...(subtask.status === 'in_progress' && { started_at: new Date().toISOString() })
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create subtask: ${error.message}`);
      }

      console.log(`✅ Created subtask: ${data.title}`);
      createdSubtasks.push(data);
    } catch (error) {
      console.error(`❌ Error creating subtask ${subtask.title}:`, error);
      throw error;
    }
  }
  
  return createdSubtasks;
}

function generateTaskNumber(): string {
  // This would normally query the database for the next number
  // For now, we'll use a simple approach
  return 'HT-001'; // Will be overridden by database function
}

// =============================================================================
// MAIN POPULATION FUNCTION
// =============================================================================

async function populateHeroTasks() {
  console.log('🚀 Starting Hero Tasks database population...');
  
  try {
    // Check if tasks already exist
    const { data: existingTasks, error: checkError } = await supabase
      .from('hero_tasks')
      .select('task_number')
      .in('task_number', ['HT-001', 'HT-002', 'HT-003']);

    if (checkError) {
      throw new Error(`Failed to check existing tasks: ${checkError.message}`);
    }

    if (existingTasks && existingTasks.length > 0) {
      console.log('⚠️  Tasks already exist in database:', existingTasks.map(t => t.task_number));
      console.log('Skipping population to avoid duplicates.');
      return;
    }

    // Populate HT-001 (UI/UX Foundation)
    console.log('\n📋 Creating HT-001: UI/UX Foundation & Component System...');
    const ht001Task = await createMainTask({
      ...HT_001_MAIN_TASK,
      task_number: 'HT-001',
      status: 'completed',
      completed_at: '2025-01-27T15:00:00.000Z'
    });
    
    await createSubtasks(ht001Task.id, HT_001_SUBTASKS.map(subtask => ({
      ...subtask,
      task_id: ht001Task.id
    })));

    // Populate HT-002 (Linear/Vercel Homepage)
    console.log('\n📋 Creating HT-002: Linear/Vercel-Inspired Homepage Transformation...');
    const ht002Task = await createMainTask({
      ...HT_002_MAIN_TASK,
      task_number: 'HT-002',
      status: 'in_progress',
      started_at: '2025-01-27T10:00:00.000Z'
    });
    
    await createSubtasks(ht002Task.id, HT_002_SUBTASKS.map(subtask => ({
      ...subtask,
      task_id: ht002Task.id
    })));

    // Populate HT-003 (UI Polish)
    console.log('\n📋 Creating HT-003: UI Polish — Swift-Inspired Aesthetic...');
    const ht003Task = await createMainTask({
      ...UI_POLISH_MAIN_TASK,
      task_number: 'HT-003',
      status: 'draft'
    });
    
    await createSubtasks(ht003Task.id, UI_POLISH_SUBTASKS.map(subtask => ({
      ...subtask,
      task_id: ht003Task.id
    })));

    console.log('\n🎉 Hero Tasks database population completed successfully!');
    console.log('\n📊 Summary:');
    console.log('✅ HT-001: UI/UX Foundation (COMPLETED)');
    console.log('🔄 HT-002: Linear/Vercel Homepage (IN_PROGRESS)');
    console.log('📝 HT-003: UI Polish (DRAFT)');

  } catch (error) {
    console.error('❌ Error populating Hero Tasks:', error);
    throw error;
  }
}

// =============================================================================
// VERIFICATION FUNCTION
// =============================================================================

async function verifyPopulation() {
  console.log('\n🔍 Verifying Hero Tasks population...');
  
  try {
    const { data: tasks, error } = await supabase
      .from('hero_tasks')
      .select(`
        *,
        subtasks:hero_subtasks(*)
      `)
      .in('task_number', ['HT-001', 'HT-002', 'HT-003']);

    if (error) {
      throw new Error(`Failed to verify tasks: ${error.message}`);
    }

    console.log(`✅ Found ${tasks.length} main tasks:`);
    tasks.forEach(task => {
      console.log(`  - ${task.task_number}: ${task.title} (${task.status})`);
      console.log(`    Subtasks: ${task.subtasks.length}`);
    });

    // Check analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('hero_tasks')
      .select('status, priority, type');

    if (!analyticsError && analytics) {
      const statusCounts = analytics.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('\n📊 Task Status Summary:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count}`);
      });
    }

  } catch (error) {
    console.error('❌ Error verifying population:', error);
    throw error;
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  try {
    await populateHeroTasks();
    await verifyPopulation();
    
    console.log('\n🎯 Next steps:');
    console.log('1. Visit the Hero Tasks dashboard to view populated tasks');
    console.log('2. Test workflow transitions and ADAV methodology');
    console.log('3. Verify analytics and reporting functionality');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main();

export { populateHeroTasks, verifyPopulation };
