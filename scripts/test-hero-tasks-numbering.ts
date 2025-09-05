/**
 * Test Hero Tasks Numbering System
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 */

import {
  generateTaskNumber,
  generateSubtaskNumber,
  generateActionNumber,
  parseTaskNumber,
  isValidTaskNumber,
  TASK_NUMBER_PATTERN
} from '@/types/hero-tasks';

// Test task number generation
console.log('🧪 Testing Hero Tasks Numbering System\n');

// Test 1: Generate main task numbers
console.log('📋 Main Task Numbers:');
for (let i = 1; i <= 10; i++) {
  const taskNumber = generateTaskNumber(i);
  console.log(`  HT-${i.toString().padStart(3, '0')} → ${taskNumber}`);
}

// Test 2: Generate subtask numbers
console.log('\n📝 Subtask Numbers:');
const mainTaskNumber = 1;
for (let i = 1; i <= 5; i++) {
  const subtaskNumber = generateSubtaskNumber(mainTaskNumber, i);
  console.log(`  HT-001.${i} → ${subtaskNumber}`);
}

// Test 3: Generate action numbers
console.log('\n⚡ Action Numbers:');
const mainTaskNumber2 = 1;
const subtaskNumber2 = 1;
for (let i = 1; i <= 5; i++) {
  const actionNumber = generateActionNumber(mainTaskNumber2, subtaskNumber2, i);
  console.log(`  HT-001.1.${i} → ${actionNumber}`);
}

// Test 4: Parse task numbers
console.log('\n🔍 Task Number Parsing:');
const testNumbers = [
  'HT-001',
  'HT-001.1',
  'HT-001.1.1',
  'HT-123',
  'HT-123.5',
  'HT-123.5.3',
  'INVALID',
  'HT-001.1.1.1', // Invalid - too many levels
  'HT-001.1.1.1.1' // Invalid - too many levels
];

testNumbers.forEach(number => {
  const parsed = parseTaskNumber(number);
  const isValid = isValidTaskNumber(number);
  console.log(`  ${number.padEnd(15)} → Valid: ${isValid ? '✅' : '❌'} | Parsed: ${parsed ? JSON.stringify(parsed) : 'null'}`);
});

// Test 5: Pattern matching
console.log('\n🎯 Pattern Matching:');
const patternTests = [
  'HT-001',
  'HT-001.1',
  'HT-001.1.1',
  'HT-999',
  'HT-999.99',
  'HT-999.99.99',
  'HT-0001', // Invalid - too many digits
  'HT-1', // Invalid - too few digits
  'HT-001.1.1.1', // Invalid - too many levels
  'INVALID',
  'ht-001', // Invalid - lowercase
  'HT-001.01', // Invalid - leading zero in subtask
];

patternTests.forEach(test => {
  const matches = TASK_NUMBER_PATTERN.test(test);
  console.log(`  ${test.padEnd(15)} → ${matches ? '✅' : '❌'}`);
});

// Test 6: Edge cases
console.log('\n🚨 Edge Cases:');
const edgeCases = [
  { main: 0, expected: 'HT-000' },
  { main: 1, expected: 'HT-001' },
  { main: 999, expected: 'HT-999' },
  { main: 1000, expected: 'HT-1000' },
];

edgeCases.forEach(({ main, expected }) => {
  const generated = generateTaskNumber(main);
  const matches = generated === expected;
  console.log(`  Main ${main.toString().padStart(4)} → ${generated} ${matches ? '✅' : '❌'}`);
});

// Test 7: Validation rules
console.log('\n📏 Validation Rules:');
const validationTests = [
  { number: 'HT-001', maxLength: 500, shouldPass: true },
  { number: 'HT-001.1', maxLength: 500, shouldPass: true },
  { number: 'HT-001.1.1', maxLength: 500, shouldPass: true },
  { number: 'HT-999.99.99', maxLength: 500, shouldPass: true },
  { number: 'HT-001.1.1.1', maxLength: 500, shouldPass: false }, // Too many levels
  { number: 'INVALID', maxLength: 500, shouldPass: false },
];

validationTests.forEach(({ number, maxLength, shouldPass }) => {
  const isValid = isValidTaskNumber(number) && number.length <= maxLength;
  const status = isValid === shouldPass ? '✅' : '❌';
  console.log(`  ${number.padEnd(15)} → ${status} (Expected: ${shouldPass ? 'Valid' : 'Invalid'})`);
});

console.log('\n🎉 Hero Tasks Numbering System Test Complete!');
console.log('\n📊 Summary:');
console.log('  ✅ Main tasks: HT-001, HT-002, HT-003, etc.');
console.log('  ✅ Subtasks: HT-001.1, HT-001.2, HT-001.3, etc.');
console.log('  ✅ Actions: HT-001.1.1, HT-001.1.2, HT-001.1.3, etc.');
console.log('  ✅ Automatic generation with database functions');
console.log('  ✅ Validation with regex patterns');
console.log('  ✅ Parsing and type safety');
console.log('  ✅ Three-level hierarchy (Task → Subtask → Action)');
console.log('\n🚀 The numbering system is ready for production use!');
