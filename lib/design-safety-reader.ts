import { promises as fs } from 'fs'
import path from 'path'

export interface DesignSafetySummary {
  timestamp: string
  status: 'PASSED' | 'FAILED' | 'WARNING' | 'UNKNOWN'
  violations: Array<{
    type: string
    severity: 'critical' | 'warning' | 'info'
    message: string
    file?: string
    line?: number
  }>
  metrics?: {
    eslintErrors?: number
    eslintWarnings?: number
    contractViolations?: number
    a11yIssues?: number
    visualDiffs?: number
    lhciScore?: number
  }
}

export interface CombinedDesignSafetySummary {
  timestamp: string
  workflow: string
  runId: string
  ref: string
  sha: string
  sections: {
    designGuardian: {
      eslint: string
      contracts: string
    }
    a11yRanger: {
      status: string
    }
    visualWatch: {
      status: string
    }
    uxBudgeteer: {
      status: string
    }
  }
}

export interface DesignSafetyData {
  eslint?: DesignSafetySummary
  contracts?: DesignSafetySummary
  a11y?: DesignSafetySummary
  visual?: DesignSafetySummary
  lhci?: DesignSafetySummary
  combined?: CombinedDesignSafetySummary
  lastUpdated?: string
}

/**
 * Reads design safety summaries from the cache directory
 * Tolerates missing files gracefully
 */
export async function readDesignSafetyData(): Promise<DesignSafetyData> {
  const cacheDir = path.join(process.cwd(), '.cache', 'design-safety')
  const data: DesignSafetyData = {}

  try {
    // Check if cache directory exists
    try {
      await fs.access(cacheDir)
    } catch {
      // Cache directory doesn't exist yet
      return data
    }

    // Read individual summaries
    const files = await fs.readdir(cacheDir)
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue
      
      try {
        const filePath = path.join(cacheDir, file)
        const content = await fs.readFile(filePath, 'utf-8')
        const summary = JSON.parse(content)
        
        switch (file) {
          case 'eslint-summary.json':
            data.eslint = summary
            break
          case 'contracts-summary.json':
            data.contracts = summary
            break
          case 'a11y-summary.json':
            data.a11y = summary
            break
          case 'visual-summary.json':
            data.visual = summary
            break
          case 'lhci-summary.json':
            data.lhci = summary
            break
          case 'design-safety-summary.json':
            data.combined = summary
            break
        }
      } catch (error) {
        console.warn(`Failed to read ${file}:`, error)
      }
    }

    // Determine last updated timestamp
    const timestamps = [
      data.eslint?.timestamp,
      data.contracts?.timestamp,
      data.a11y?.timestamp,
      data.visual?.timestamp,
      data.lhci?.timestamp,
      data.combined?.timestamp
    ].filter(Boolean) as string[]

    if (timestamps.length > 0) {
      data.lastUpdated = timestamps.sort().pop() ?? undefined
    }

  } catch (error) {
    console.warn('Failed to read design safety data:', error)
  }

  return data
}

/**
 * Gets a summary status for display
 */
export function getDesignSafetyStatus(data: DesignSafetyData): {
  overall: 'PASSED' | 'FAILED' | 'WARNING' | 'UNKNOWN'
  hasData: boolean
  lastRun: string | null
} {
  if (!data.combined && !data.eslint) {
    return { overall: 'UNKNOWN', hasData: false, lastRun: null }
  }

  const statuses = [
    data.eslint?.status,
    data.contracts?.status,
    data.a11y?.status,
    data.visual?.status,
    data.lhci?.status
  ].filter(Boolean) as string[]

  let overall: 'PASSED' | 'FAILED' | 'WARNING' | 'UNKNOWN' = 'UNKNOWN'
  
  if (statuses.includes('FAILED')) {
    overall = 'FAILED'
  } else if (statuses.includes('WARNING')) {
    overall = 'WARNING'
  } else if (statuses.every(s => s === 'PASSED')) {
    overall = 'PASSED'
  }

  return {
    overall,
    hasData: true,
    lastRun: data.lastUpdated ?? null
  }
}

/**
 * Formats timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleString()
  } catch {
    return timestamp
  }
}
