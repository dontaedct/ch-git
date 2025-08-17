#!/usr/bin/env node

/**
 * Heartbeat System Demo
 * 
 * Demonstrates the heartbeat system for long-running tasks
 * Shows progress updates, memory monitoring, and structured output
 * 
 * MIT-HERO-MOD: Now uses @dct/mit-hero-core package
 */

// Import from MIT Hero Core package instead of deep import
const { createHeroCore, createHeroSystem, generateReport } = require('@dct/mit-hero-core');

// Fallback to original heartbeat system for now since the package doesn't have heartbeat functionality yet
let heartbeat;
let HeartbeatEmitter;
try {
  const heartbeatModule = require('../lib/heartbeat.js');
  heartbeat = heartbeatModule.heartbeat;
  HeartbeatEmitter = heartbeatModule.HeartbeatEmitter;
} catch (error) {
  console.error('❌ Heartbeat system not available:', error.message);
  process.exit(1);
}

async function demoHeartbeatSystem() {
  console.log('🚀 Heartbeat System Demo Starting...\n');

  // Example 1: Simple heartbeat usage
  console.log('📋 Example 1: Simple Heartbeat Usage');
  const simpleOp = `demo-simple-${Date.now()}`;
  heartbeat.start(simpleOp, 'Simple Operation', 10);
  
  for (let i = 0; i <= 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 500));
    heartbeat.update(simpleOp, i, `Step ${i}/10 completed`);
  }
  
  heartbeat.complete(simpleOp, 'Simple operation completed');
  console.log('✅ Simple heartbeat demo completed\n');

  // Example 2: Custom HeartbeatEmitter with events
  console.log('📋 Example 2: Custom HeartbeatEmitter with Events');
  const customHeartbeat = new HeartbeatEmitter({
    interval: 2000, // 2 second intervals
    includeMemory: true,
    includeCPU: true,
    consoleOutput: false // We'll handle output manually
  });

  // Listen to heartbeat events
  customHeartbeat.on('heartbeat', (data) => {
    console.log(`💓 Custom Heartbeat: ${data.operationName} - ${data.progress.toFixed(1)}% - ${data.status}`);
    if (data.memory) {
      const memMB = (data.memory.heapUsed / 1024 / 1024).toFixed(1);
      console.log(`   Memory: ${memMB}MB`);
    }
  });

  customHeartbeat.on('operation:complete', (data) => {
    console.log(`✅ Custom Operation Complete: ${data.operationName}`);
  });

  const customOp = `demo-custom-${Date.now()}`;
  customHeartbeat.startOperation(customOp, 'Custom Operation', 5);

  for (let i = 0; i <= 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 800));
    customHeartbeat.updateProgress(customOp, i, `Custom step ${i}/5`);
  }

  customHeartbeat.completeOperation(customOp, 'Custom operation finished');
  console.log('✅ Custom heartbeat demo completed\n');

  // Example 3: Multiple concurrent operations
  console.log('📋 Example 3: Multiple Concurrent Operations');
  const operations = [
    { id: `op1-${Date.now()}`, name: 'Data Processing', steps: 8 },
    { id: `op2-${Date.now()}`, name: 'File Upload', steps: 6 },
    { id: `op3-${Date.now()}`, name: 'API Calls', steps: 4 }
  ];

  // Start all operations
  operations.forEach(op => {
    heartbeat.start(op.id, op.name, op.steps);
  });

  // Simulate concurrent processing
  const promises = operations.map(async (op) => {
    for (let i = 0; i <= op.steps; i++) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 200));
      heartbeat.update(op.id, i, `Step ${i}/${op.steps} completed`);
    }
    heartbeat.complete(op.id, 'Operation completed successfully');
  });

  await Promise.all(promises);
  console.log('✅ Concurrent operations demo completed\n');

  // Example 4: Progress bar demonstration
  console.log('📋 Example 4: Progress Bar Demonstration');
  const progressOp = `demo-progress-${Date.now()}`;
  heartbeat.start(progressOp, 'Progress Bar Demo', 20);
  
  for (let i = 0; i <= 20; i++) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const status = i === 0 ? 'Starting...' : 
                  i === 20 ? 'Finalizing...' : 
                  `Processing item ${i}/20`;
    heartbeat.update(progressOp, i, status);
  }
  
  heartbeat.complete(progressOp, 'Progress demo completed');
  console.log('✅ Progress bar demo completed\n');

  // Example 5: Error handling and cancellation
  console.log('📋 Example 5: Error Handling and Cancellation');
  const errorOp = `demo-error-${Date.now()}`;
  heartbeat.start(errorOp, 'Error Demo', 10);
  
  try {
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      heartbeat.update(errorOp, i, `Step ${i}/10 completed`);
    }
    
    // Simulate an error
    throw new Error('Simulated error occurred');
  } catch (error) {
    heartbeat.complete(errorOp, `Failed: ${error.message}`);
    console.log(`❌ Error demo completed with error: ${error.message}\n`);
  }

  // Example 6: Memory-intensive operation simulation
  console.log('📋 Example 6: Memory-Intensive Operation');
  const memoryOp = `demo-memory-${Date.now()}`;
  heartbeat.start(memoryOp, 'Memory-Intensive Task', 15);
  
  const memoryArrays = [];
  for (let i = 0; i <= 15; i++) {
    // Simulate memory allocation
    if (i % 3 === 0) {
      memoryArrays.push(new Array(100000).fill(Math.random()));
    }
    
    await new Promise(resolve => setTimeout(resolve, 600));
    heartbeat.update(memoryOp, i, `Memory step ${i}/15 (arrays: ${memoryArrays.length})`);
  }
  
  // Clean up memory
  memoryArrays.length = 0;
  heartbeat.complete(memoryOp, 'Memory demo completed');
  console.log('✅ Memory-intensive demo completed\n');

  console.log('🎉 All heartbeat system demos completed successfully!');
  console.log('\n💡 Key Features Demonstrated:');
  console.log('   • Progress tracking with percentages and ETA');
  console.log('   • Memory usage monitoring');
  console.log('   • Multiple concurrent operations');
  console.log('   • Event-driven architecture');
  console.log('   • Progress bars and status updates');
  console.log('   • Error handling and cancellation');
  console.log('   • Memory leak prevention');
}

// Run the demo
if (require.main === module) {
  demoHeartbeatSystem().catch(console.error);
}

module.exports = { demoHeartbeatSystem };
