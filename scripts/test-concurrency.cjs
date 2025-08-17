#!/usr/bin/env node

const { ConcurrencyLimiter } = require('../lib/concurrency.js');

console.log('🧪 Testing Concurrency System...');

// Create test limiters
const healthCheckLimiter = new ConcurrencyLimiter({
    maxConcurrent: 5,
    maxQueueSize: 10,
    priorityLevels: 3,
    timeoutMs: 5000
});

const buildLimiter = new ConcurrencyLimiter({
    maxConcurrent: 3,
    maxQueueSize: 20,
    priorityLevels: 5,
    timeoutMs: 30000
});

const testLimiter = new ConcurrencyLimiter({
    maxConcurrent: 5,
    maxQueueSize: 15,
    priorityLevels: 4,
    timeoutMs: 15000
});

// Test operations
async function testConcurrency() {
    console.log('\n📊 Initial Status:');
    console.log('Health Check Limiter:', healthCheckLimiter.getStatus());
    console.log('Build Limiter:', buildLimiter.getStatus());
    console.log('Test Limiter:', testLimiter.getStatus());

    // Test concurrent operations
    console.log('\n🚀 Testing concurrent operations...');
    
    const operations = [];
    for (let i = 0; i < 8; i++) {
        operations.push({
            operation: () => new Promise(resolve => {
                setTimeout(() => {
                    console.log(`  Operation ${i + 1} completed`);
                    resolve(`Result ${i + 1}`);
                }, 1000 + Math.random() * 2000);
            }),
            priority: Math.floor(Math.random() * 3) + 1,
            metadata: { id: i + 1 }
        });
    }

    try {
        const results = await healthCheckLimiter.executeBatch(operations);
        console.log('\n✅ All operations completed:', results.length);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    console.log('\n📊 Final Status:');
    console.log('Health Check Limiter:', healthCheckLimiter.getStatus());
    console.log('Metrics:', healthCheckLimiter.getMetrics());
}

// Run test
testConcurrency().catch(console.error);
