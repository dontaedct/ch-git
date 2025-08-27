/**
 * Forbidden Tokens Test
 * 
 * This test scans the codebase for banned tokens to ensure no CoachHub/fitness
 * domain content remains after the surgery.
 */

import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

test.describe('Forbidden Tokens Scan', () => {
  test('no CoachHub branding tokens exist', async () => {
    const bannedPatterns = [
      /CoachHub/gi,
      /coach-hub/gi,
      /coach_hub/gi,
      /Coach Hub/gi,
    ];

    const results = await scanForPatterns(bannedPatterns);
    expect(results).toHaveLength(0);
  });

  test('no fitness domain entities exist', async () => {
    const bannedPatterns = [
      /\btrainer(s)?\b/gi,
      /\bclient(s)?\b/gi,
      /\bsession(s)?\b/gi,
    ];

    const results = await scanForPatterns(bannedPatterns);
    expect(results).toHaveLength(0);
  });

  test('no fitness terms exist', async () => {
    const bannedPatterns = [
      /\bworkout\b/gi,
      /\bmeal\b/gi,
      /\bfitness\b/gi,
      /\btraining\b/gi,
      /\bnutrition\b/gi,
      /\bcoaching\b/gi,
      /\bsets?\b/gi,
    ];

    const results = await scanForPatterns(bannedPatterns);
    expect(results).toHaveLength(0);
  });

  test('no fitness actions exist', async () => {
    const bannedPatterns = [
      /\bbook(ing)?[-_ ]?session(s)?\b/gi,
    ];

    const results = await scanForPatterns(bannedPatterns);
    expect(results).toHaveLength(0);
  });

  test('no business-specific file paths exist in generic OSS Hero template', async () => {
    const bannedPaths = [
      // These paths should not exist in a generic micro app template
      // They represent business-specific functionality that should be customized
      'fitness',
      'workout',
      'training',
      'coaching',
      'nutrition',
    ];

    const results = await scanForPaths(bannedPaths);
    expect(results).toHaveLength(0);
  });
});

async function scanForPatterns(patterns: RegExp[]): Promise<string[]> {
  const results: string[] = [];
  
  try {
    for (const pattern of patterns) {
      const grepResult = execSync(
        `grep -r "${pattern.source}" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=backup --exclude-dir=.guardian-backups || true`,
        { encoding: 'utf8' }
      );
      
      if (grepResult.trim()) {
        const lines = grepResult.trim().split('\n');
        results.push(...lines.filter(line => line.trim()));
      }
    }
  } catch (error) {
    // grep returns non-zero when no matches found, which is expected
  }
  
  return results;
}

async function scanForPaths(paths: string[]): Promise<string[]> {
  const results: string[] = [];
  
  try {
    for (const path of paths) {
      const findResult = execSync(
        `find . -name "*${path}*" -type f --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=backup --exclude-dir=.guardian-backups 2>/dev/null || true`,
        { encoding: 'utf8' }
      );
      
      if (findResult.trim()) {
        const lines = findResult.trim().split('\n');
        results.push(...lines.filter(line => line.trim()));
      }
    }
  } catch (error) {
    // find returns non-zero when no matches found, which is expected
  }
  
  return results;
}
