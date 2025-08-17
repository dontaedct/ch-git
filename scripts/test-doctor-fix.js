#!/usr/bin/env node

/**
 * Test script to verify doctor fix works without infinite loops
 * @file scripts/test-doctor-fix.js
 * @author MIT Hero System
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing doctor fix to prevent infinite loops...\n');

// Test the lightweight version first (should be fastest)
console.log('1️⃣ Testing doctor:ultra-light...');
const lightTest = spawn('npm', ['run', 'doctor:ultra-light'], {
  stdio: 'pipe',
  timeout: 30000 // 30 second timeout
});

let lightOutput = '';
let lightError = '';

lightTest.stdout.on('data', (data) => {
  lightOutput += data.toString();
  process.stdout.write(data);
});

lightTest.stderr.on('data', (data) => {
  lightError += data.toString();
  process.stderr.write(data);
});

lightTest.on('close', (code) => {
  console.log(`\n✅ doctor:ultra-light completed with code: ${code}`);
  
  if (code === 0) {
    console.log('🎉 Lightweight doctor test passed!');
    
    // Now test the regular doctor with a short timeout
    console.log('\n2️⃣ Testing regular doctor with timeout protection...');
    testRegularDoctor();
  } else {
    console.log('❌ Lightweight doctor test failed');
    console.log('Error output:', lightError);
    process.exit(1);
  }
});

lightTest.on('error', (error) => {
  console.error('❌ Failed to start lightweight doctor:', error.message);
  process.exit(1);
});

function testRegularDoctor() {
  const regularTest = spawn('npm', ['run', 'doctor:fast'], {
    stdio: 'pipe',
    timeout: 60000 // 60 second timeout
  });

  let regularOutput = '';
  let regularError = '';

  regularTest.stdout.on('data', (data) => {
    regularOutput += data.toString();
    process.stdout.write(data);
  });

  regularTest.stderr.on('data', (data) => {
    regularError += data.toString();
    process.stderr.write(data);
  });

  regularTest.on('close', (code) => {
    console.log(`\n✅ Regular doctor completed with code: ${code}`);
    
    if (code === 0) {
      console.log('🎉 Regular doctor test passed!');
      console.log('\n✅ All tests passed! The infinite loop issue has been fixed.');
    } else {
      console.log('❌ Regular doctor test failed');
      console.log('Error output:', regularError);
      process.exit(1);
    }
  });

  regularTest.on('error', (error) => {
    console.error('❌ Failed to start regular doctor:', error.message);
    process.exit(1);
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  lightTest.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test terminated');
  lightTest.kill('SIGTERM');
  process.exit(0);
});
