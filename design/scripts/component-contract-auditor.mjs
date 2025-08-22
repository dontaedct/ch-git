#!/usr/bin/env node

/**
 * Component Contract Auditor
 * 
 * Validates UI component API contracts and exits non-zero on violations.
 * This ensures design guardian rules are enforced as errors.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Component Contract Auditor starting...');

// Simple audit function
function auditComponents() {
  console.log('📁 Auditing components...');
  
  const components = [
    'components/ui/button.tsx',
    'components/ui/input.tsx',
    'components/ui/card.tsx',
    'components/header.tsx',
    'components/intake-form.tsx'
  ];
  
  let auditedCount = 0;
  let violations = 0;
  
  for (const component of components) {
    const fullPath = join(process.cwd(), component);
    if (existsSync(fullPath)) {
      auditedCount++;
      console.log(`  ✅ Audited: ${component}`);
      
      try {
        const content = readFileSync(fullPath, 'utf8');
        
        // Check for import boundary violations
        if (/import.*from.*['"]@data\//.test(content)) {
          console.log(`  ❌ VIOLATION: ${component} imports from @data/`);
          violations++;
        }
        
        if (/import.*from.*['"]@lib\/supabase/.test(content)) {
          console.log(`  ❌ VIOLATION: ${component} imports from @lib/supabase`);
          violations++;
        }
        
        if (/import.*from.*['"]@app\/api\//.test(content)) {
          console.log(`  ❌ VIOLATION: ${component} imports from @app/api/`);
          violations++;
        }
        
      } catch (error) {
        console.log(`  ❌ Error reading ${component}: ${error.message}`);
        violations++;
      }
    } else {
      console.log(`  ⚠️  Not found: ${component}`);
    }
  }
  
  console.log('\n📊 Audit Summary:');
  console.log(`   Components audited: ${auditedCount}`);
  console.log(`   Violations found: ${violations}`);
  
  if (violations > 0) {
    console.log('\n❌ Design Guardian rules violated!');
    console.log('   UI contracts must pass before merge.');
    process.exit(1);
  } else {
    console.log('\n✅ All components pass design guardian rules!');
  }
}

// Run the audit
auditComponents();
