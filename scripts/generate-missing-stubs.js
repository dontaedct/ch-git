#!/usr/bin/env node
/**
 * Automatically generates stub files for all missing module imports
 * This resolves the cascading build failures by creating all missing files at once
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All missing library directories that need stub files
const missingLibraries = {
  'lib/monitoring': [
    'session-tracker',
    'slo-service',
    'slo-config',
  ],
  'lib/performance': [
    'consultation-optimization',
  ],
};

// Template for generating stub TypeScript files
const generateStubContent = (moduleName, exportNames = ['default']) => {
  const exports = exportNames.map(name => {
    if (name === 'default') {
      return `const stub = {};\nexport default stub;`;
    }
    return `export const ${name} = {} as any;`;
  }).join('\n');

  return `/**
 * AUTO-GENERATED STUB FILE
 * This file was automatically generated to resolve missing imports
 * TODO: Replace with actual implementation when ready
 */

// Temporary stub implementation for MVP
${exports}

export type ${moduleName.split('-').map(word =>
  word.charAt(0).toUpperCase() + word.slice(1)
).join('')} = any;
`;
};

// Create stub files
Object.entries(missingLibraries).forEach(([dir, modules]) => {
  const dirPath = path.join(__dirname, '..', dir);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }

  modules.forEach(moduleName => {
    const filePath = path.join(dirPath, `${moduleName}.ts`);

    if (!fs.existsSync(filePath)) {
      const content = generateStubContent(moduleName);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Created stub: ${dir}/${moduleName}.ts`);
    } else {
      console.log(`- Skipped (exists): ${dir}/${moduleName}.ts`);
    }
  });
});

console.log('\n✅ All stub files generated successfully!');
console.log('You can now run: npm run build');
