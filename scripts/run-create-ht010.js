#!/usr/bin/env node

/**
 * HT-010 Task Creation Runner
 * Runs the HT-010 task creation script
 */

import { createHT010Task } from './create-ht010-task';

async function main() {
  console.log('🚀 Creating HT-010: Multi-Style Homepage Test Pages task...');
  
  const result = await createHT010Task();
  
  if (result.success) {
    console.log('✅ HT-010 task created successfully!');
    console.log('📋 Task Details:');
    console.log(`   - Task Number: ${result.task.task_number}`);
    console.log(`   - Title: ${result.task.title}`);
    console.log(`   - Status: ${result.task.status}`);
    console.log(`   - Priority: ${result.task.priority}`);
    console.log(`   - Estimated Hours: ${result.task.metadata?.estimated_hours}`);
    console.log(`   - Phases: ${result.task.metadata?.phases}`);
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('   1. Access the Hero Tasks dashboard to view the new task');
    console.log('   2. Begin with Phase 0: Design Research & Test Environment Setup');
    console.log('   3. Follow the AUDIT → DECIDE → APPLY → VERIFY methodology');
    console.log('');
    console.log('📁 Task Structure:');
    console.log('   - Main Task: HT-010');
    console.log('   - Subtasks: HT-010.0 through HT-010.7');
    console.log('   - Design Styles: 6 distinct visual prototypes');
    console.log('   - File Location: /app/test-pages/ directory');
  } else {
    console.error('❌ Failed to create HT-010 task:', result.error);
    process.exit(1);
  }
}

main().catch(console.error);
