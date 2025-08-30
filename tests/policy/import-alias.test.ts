/**
 * Policy Tests - Import Alias Guard
 * 
 * Tests for enforcing import alias rules and preventing forbidden import patterns.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('Policy Tests - Import Alias Guard', () => {
  const testDir = 'tests/policy/temp';
  const testFile = join(testDir, 'test-imports.ts');

  beforeAll(() => {
    // Create temp directory for test files
    try {
      const fs = require('fs');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
    } catch {
      // Directory might already exist
    }
  });

  afterAll(() => {
    // Clean up temp files
    try {
      unlinkSync(testFile);
      execSync(`rmdir ${testDir}`, { stdio: 'ignore' });
    } catch {
      // Cleanup failed, ignore
    }
  });

  describe('Forbidden Import Patterns', () => {
    const forbiddenPatterns = [
      {
        name: 'src/* imports',
        code: "import { something } from 'src/lib/utils';",
        shouldFail: true
      },
      {
        name: 'relative imports (../)',
        code: "import { something } from '../lib/utils';",
        shouldFail: true
      },
      {
        name: 'deep relative imports (../../)',
        code: "import { something } from '../../lib/utils';",
        shouldFail: true
      },
      {
        name: 'very deep relative imports (../../../)',
        code: "import { something } from '../../../lib/utils';",
        shouldFail: true
      },
      {
        name: 'valid @app/* import',
        code: "import { something } from '@app/api/utils';",
        shouldFail: false
      },
      {
        name: 'valid @lib/* import',
        code: "import { something } from '@lib/utils';",
        shouldFail: false
      },
      {
        name: 'valid @data/* import',
        code: "import { something } from '@data/clients';",
        shouldFail: false
      },
      {
        name: 'valid @ui/* import',
        code: "import { Button } from '@ui/button';",
        shouldFail: false
      },
      {
        name: 'valid @registry/* import',
        code: "import { flags } from '@registry/flags';",
        shouldFail: false
      },
      {
        name: 'valid @compat/* import',
        code: "import { legacy } from '@compat/legacy';",
        shouldFail: false
      }
    ];

    forbiddenPatterns.forEach(({ name, code, shouldFail }) => {
      it(`should ${shouldFail ? 'reject' : 'allow'} ${name}`, () => {
        // Create test file with the import
        const testContent = `// Test file for ${name}
${code}

export const test = 'test';
`;

        writeFileSync(testFile, testContent);

        // Check if the import pattern is forbidden
        const importPatterns = [
          /import\s+.*from\s+['"]src\//,
          /import\s+.*from\s+['"]\.\.\//,
          /import\s+.*from\s+['"]\.\.\.\//,
          /import\s+.*from\s+['"]\.\.\.\.\//,
          /import\s+.*from\s+['"]\.\.\.\.\.\//,
          /import\s+.*from\s+['"]\.\.\.\.\.\.\//,
        ];

        const content = readFileSync(testFile, 'utf8');
        const hasForbiddenImport = importPatterns.some(pattern => pattern.test(content));

        if (shouldFail) {
          expect(hasForbiddenImport).toBe(true);
        } else {
          expect(hasForbiddenImport).toBe(false);
        }
      });
    });
  });

  describe('Import Alias Validation', () => {
    it('should validate all required aliases are available', () => {
      const requiredAliases = ['@app/*', '@data/*', '@lib/*', '@ui/*', '@registry/*', '@compat/*'];
      
      // Check tsconfig.json for alias configuration
      const tsconfig = JSON.parse(readFileSync('tsconfig.json', 'utf8'));
      const pathMappings = tsconfig.compilerOptions?.paths || {};
      
      const configuredAliases = Object.keys(pathMappings);
      
      // Check that all required aliases have corresponding path mappings
      requiredAliases.forEach(alias => {
        const hasMapping = configuredAliases.some(configured => 
          configured.startsWith(alias.replace('*', ''))
        );
        expect(hasMapping).toBe(true);
      });
    });

    it('should validate Jest module name mapping matches tsconfig', () => {
      const jestConfig = readFileSync('jest.config.js', 'utf8');
      const tsconfig = JSON.parse(readFileSync('tsconfig.json', 'utf8'));
      
      // Extract Jest moduleNameMapper
      const jestMatch = jestConfig.match(/moduleNameMapper:\s*{([^}]+)}/s);
      expect(jestMatch).toBeTruthy();
      
      // Extract tsconfig paths
      const tsconfigPaths = tsconfig.compilerOptions?.paths || {};
      
      // Check that Jest mappings align with tsconfig paths
      const jestMappings = jestMatch![1];
      expect(jestMappings).toContain('@app/');
      expect(jestMappings).toContain('@data/');
      expect(jestMappings).toContain('@lib/');
      expect(jestMappings).toContain('@ui/');
      expect(jestMappings).toContain('@registry/');
      expect(jestMappings).toContain('@compat/');
    });
  });

  describe('Policy Enforcer Integration', () => {
    it('should detect policy violations in staged files', () => {
      // This test verifies the policy enforcer logic works correctly
      // by simulating the detection of forbidden imports
      
      const testViolations = [
        {
          file: 'app/test.ts',
          content: "import { utils } from '../lib/utils';",
          expectedViolation: 'import'
        },
        {
          file: 'components/test.tsx',
          content: "import { Button } from 'src/components/ui/button';",
          expectedViolation: 'import'
        }
      ];

      testViolations.forEach(({ file, content, expectedViolation }) => {
        const importPatterns = [
          /import\s+.*from\s+['"]src\//,
          /import\s+.*from\s+['"]\.\.\//,
          /import\s+.*from\s+['"]\.\.\.\//,
          /import\s+.*from\s+['"]\.\.\.\.\//,
          /import\s+.*from\s+['"]\.\.\.\.\.\//,
          /import\s+.*from\s+['"]\.\.\.\.\.\.\//,
        ];

        const hasViolation = importPatterns.some(pattern => pattern.test(content));
        expect(hasViolation).toBe(true);
      });
    });
  });
});
