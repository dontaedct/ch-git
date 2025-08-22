#!/usr/bin/env node

/**
 * Test script for the design safety report functionality
 * Run with: node scripts/test-design-report.mjs
 */

import { promises as fs } from 'fs'
import path from 'path'

// Mock data for testing
const mockData = {
  'eslint-summary.json': {
    timestamp: new Date().toISOString(),
    status: 'PASSED',
    metrics: {
      eslintErrors: 0,
      eslintWarnings: 2
    },
    violations: []
  },
  'contracts-summary.json': {
    timestamp: new Date().toISOString(),
    status: 'PASSED',
    metrics: {
      contractViolations: 0
    },
    violations: []
  },
  'a11y-summary.json': {
    timestamp: new Date().toISOString(),
    status: 'PASSED',
    metrics: {
      a11yIssues: 0
    },
    violations: []
  },
  'visual-summary.json': {
    timestamp: new Date().toISOString(),
    status: 'PASSED',
    metrics: {
      visualDiffs: 0
    },
    violations: []
  },
  'lhci-summary.json': {
    timestamp: new Date().toISOString(),
    status: 'PASSED',
    metrics: {
      lhciScore: 0.95
    },
    violations: []
  },
  'design-safety-summary.json': {
    timestamp: new Date().toISOString(),
    workflow: 'design-safety',
    runId: 'test-123',
    ref: 'refs/heads/main',
    sha: 'test-sha-123',
    sections: {
      designGuardian: {
        eslint: 'PASSED',
        contracts: 'PASSED'
      },
      a11yRanger: {
        status: 'PASSED'
      },
      visualWatch: {
        status: 'PASSED'
      },
      uxBudgeteer: {
        status: 'PASSED'
      }
    }
  }
}

async function createTestCache() {
  const cacheDir = path.join(process.cwd(), '.cache', 'design-safety')
  
  try {
    // Create cache directory
    await fs.mkdir(cacheDir, { recursive: true })
    console.log('✅ Created cache directory:', cacheDir)
    
    // Create mock summary files
    for (const [filename, data] of Object.entries(mockData)) {
      const filePath = path.join(cacheDir, filename)
      await fs.writeFile(filePath, JSON.stringify(data, null, 2))
      console.log(`✅ Created ${filename}`)
    }
    
    console.log('\n🎉 Test cache created successfully!')
    console.log('You can now visit /design-report in your browser to see the data.')
    
  } catch (error) {
    console.error('❌ Error creating test cache:', error)
  }
}

async function cleanupTestCache() {
  const cacheDir = path.join(process.cwd(), '.cache', 'design-safety')
  
  try {
    await fs.rm(cacheDir, { recursive: true, force: true })
    console.log('✅ Cleaned up test cache directory')
  } catch (error) {
    console.error('❌ Error cleaning up test cache:', error)
  }
}

// Main execution
const command = process.argv[2]

switch (command) {
  case 'cleanup':
    await cleanupTestCache()
    break
  case 'create':
  default:
    await createTestCache()
    break
}
