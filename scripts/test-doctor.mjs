#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🧪 Testing doctor scripts...');

// Test the ultra-lightweight doctor command first (fastest)
console.log('\n🔍 Testing ultra-lightweight doctor...');
const ultraLightProcess = spawn('npm', ['run', 'doctor:ultra-light'], {
  stdio: 'pipe',
  shell: true
});

let ultraLightOutput = '';
let ultraLightHasOutput = false;

ultraLightProcess.stdout.on('data', (data) => {
  ultraLightOutput += data.toString();
  ultraLightHasOutput = true;
  process.stdout.write(data);
});

ultraLightProcess.stderr.on('data', (data) => {
  ultraLightOutput += data.toString();
  ultraLightHasOutput = true;
  process.stderr.write(data);
});

// Set a timeout to prevent hanging
const ultraLightTimeout = setTimeout(() => {
  console.log('\n⏰ Ultra-lightweight test timed out after 20 seconds');
  ultraLightProcess.kill('SIGTERM');
  process.exit(1);
}, 20000);

ultraLightProcess.on('close', (code) => {
  clearTimeout(ultraLightTimeout);
  
  if (code === 0) {
    console.log('\n✅ Ultra-lightweight doctor completed successfully');
    
    if (ultraLightHasOutput) {
      console.log('📋 Output received, script is working');
    } else {
      console.log('⚠️  No output received, but script completed');
    }
    
    // Now test the regular doctor command
    testRegularDoctor();
  } else {
    console.log(`\n❌ Ultra-lightweight doctor failed with code ${code}`);
    process.exit(1);
  }
});

ultraLightProcess.on('error', (error) => {
  clearTimeout(ultraLightTimeout);
  console.error('\n💥 Failed to start ultra-lightweight doctor:', error.message);
  process.exit(1);
});

function testRegularDoctor() {
  console.log('\n🔍 Testing regular doctor...');
  
  // Test the basic doctor command
  const doctorProcess = spawn('npm', ['run', 'doctor'], {
    stdio: 'pipe',
    shell: true
  });

let output = '';
let hasOutput = false;

doctorProcess.stdout.on('data', (data) => {
  output += data.toString();
  hasOutput = true;
  process.stdout.write(data);
});

doctorProcess.stderr.on('data', (data) => {
  output += data.toString();
  hasOutput = true;
  process.stderr.write(data);
});

// Set a timeout to prevent hanging
const timeout = setTimeout(() => {
  console.log('\n⏰ Test timed out after 30 seconds');
  doctorProcess.kill('SIGTERM');
  process.exit(1);
}, 30000);

doctorProcess.on('close', (code) => {
  clearTimeout(timeout);
  
  if (code === 0) {
    console.log('\n✅ Doctor script completed successfully');
    
    if (hasOutput) {
      console.log('📋 Output received, script is working');
    } else {
      console.log('⚠️  No output received, but script completed');
    }
  } else {
    console.log(`\n❌ Doctor script failed with code ${code}`);
    process.exit(1);
  }
});

doctorProcess.on('error', (error) => {
  clearTimeout(timeout);
  console.error('\n💥 Failed to start doctor script:', error.message);
  process.exit(1);
});
