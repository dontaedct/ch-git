/**
 * @fileoverview useEffect Dependency Analysis and Fix Tool
 * @module lib/analysis/use-effect-analyzer
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: useEffect Dependency Analysis and Fix Tool
 * Purpose: Analyze and fix useEffect dependency issues
 * Safety: Comprehensive analysis with automated fixes
 */

import { parse } from '@babel/parser'
import traverse, { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

interface UseEffectIssue {
  line: number
  type: 'missing-dependency' | 'unnecessary-dependency' | 'stale-closure' | 'infinite-loop'
  message: string
  suggestion: string
  severity: 'error' | 'warning' | 'info'
}

interface UseEffectAnalysis {
  file: string
  issues: UseEffectIssue[]
  suggestions: string[]
}

/**
 * Analyze useEffect hooks for dependency issues
 */
export function analyzeUseEffectDependencies(filePath: string): UseEffectAnalysis {
  const content = readFileSync(filePath, 'utf-8')
  const ast = parse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript', 'decorators-legacy']
  })

  const issues: UseEffectIssue[] = []
  const suggestions: string[] = []

  traverse(ast, {
    CallExpression(path) {
      if (
        path.node.callee.type === 'Identifier' &&
        path.node.callee.name === 'useEffect'
      ) {
        const args = path.node.arguments
        if (args.length < 2) return

        const effectFunction = args[0]
        const dependencies = args[1]

        if (
          effectFunction.type === 'ArrowFunctionExpression' ||
          effectFunction.type === 'FunctionExpression'
        ) {
          analyzeEffectFunction(effectFunction, dependencies, path, issues, suggestions)
        }
      }
    }
  })

  return {
    file: filePath,
    issues,
    suggestions
  }
}

function analyzeEffectFunction(
  effectFunction: any,
  dependencies: any,
  path: any,
  issues: UseEffectIssue[],
  suggestions: string[]
) {
  const line = path.node.loc?.start.line || 0
  
  // Check for missing dependencies
  if (dependencies.type === 'ArrayExpression') {
    const dependencyValues = dependencies.elements.map((el: any) => 
      el?.type === 'Identifier' ? el.name : null
    ).filter(Boolean)

    const usedVariables = extractUsedVariables(effectFunction)
    const missingDeps = usedVariables.filter(v => !dependencyValues.includes(v))

    if (missingDeps.length > 0) {
      issues.push({
        line,
        type: 'missing-dependency',
        message: `Missing dependencies: ${missingDeps.join(', ')}`,
        suggestion: `Add missing dependencies: [${[...dependencyValues, ...missingDeps].join(', ')}]`,
        severity: 'warning'
      })
    }

    // Check for unnecessary dependencies
    const unnecessaryDeps = dependencyValues.filter((dep: string) => 
      !usedVariables.includes(dep)
    )

    if (unnecessaryDeps.length > 0) {
      issues.push({
        line,
        type: 'unnecessary-dependency',
        message: `Unnecessary dependencies: ${unnecessaryDeps.join(', ')}`,
        suggestion: `Remove unnecessary dependencies: [${dependencyValues.filter((d: string) => !unnecessaryDeps.includes(d)).join(', ')}]`,
        severity: 'info'
      })
    }
  }

  // Check for potential infinite loops
  if (dependencies.type === 'ArrayExpression' && dependencies.elements.length === 0) {
    const hasStateUpdates = checkForStateUpdates(effectFunction)
    if (hasStateUpdates) {
      issues.push({
        line,
        type: 'infinite-loop',
        message: 'Potential infinite loop: useEffect with empty dependencies contains state updates',
        suggestion: 'Add proper dependencies or use useCallback/useMemo to stabilize references',
        severity: 'error'
      })
    }
  }
}

function extractUsedVariables(node: any): string[] {
  const variables = new Set<string>()
  
  traverse(node, {
    Identifier(path) {
      const name = path.node.name
      // Skip function parameters and declarations
      if (
        path.isReferencedIdentifier() === false ||
        t.isFunctionDeclaration(path.node) ||
        t.isVariableDeclarator(path.node)
      ) {
        return
      }
      
      // Skip React hooks and common patterns
      const skipPatterns = [
        'console', 'window', 'document', 'navigator', 'localStorage', 'sessionStorage',
        'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
        'addEventListener', 'removeEventListener'
      ]
      
      if (!skipPatterns.includes(name)) {
        variables.add(name)
      }
    }
  })

  return Array.from(variables)
}

function checkForStateUpdates(node: any): boolean {
  let hasStateUpdates = false
  
  traverse(node, {
    CallExpression(path) {
      const callee = path.node.callee
      if (
        callee.type === 'Identifier' &&
        (callee.name.startsWith('set') || callee.name === 'dispatch')
      ) {
        hasStateUpdates = true
      }
    }
  })

  return hasStateUpdates
}

/**
 * Generate fixes for useEffect issues
 */
export function generateUseEffectFixes(analysis: UseEffectAnalysis): string {
  const fixes: string[] = []
  
  analysis.issues.forEach(issue => {
    switch (issue.type) {
      case 'missing-dependency':
        fixes.push(`// Line ${issue.line}: ${issue.message}`)
        fixes.push(`// Fix: ${issue.suggestion}`)
        break
      case 'unnecessary-dependency':
        fixes.push(`// Line ${issue.line}: ${issue.message}`)
        fixes.push(`// Fix: ${issue.suggestion}`)
        break
      case 'infinite-loop':
        fixes.push(`// Line ${issue.line}: ${issue.message}`)
        fixes.push(`// Fix: ${issue.suggestion}`)
        break
    }
  })

  return fixes.join('\n')
}

/**
 * Common useEffect patterns and best practices
 */
export const useEffectPatterns = {
  // Event listeners
  eventListener: `
// ✅ Good: Proper cleanup
useEffect(() => {
  const handleResize = () => {
    setWindowWidth(window.innerWidth)
  }
  
  window.addEventListener('resize', handleResize)
  
  return () => {
    window.removeEventListener('resize', handleResize)
  }
}, []) // Empty deps OK for event listeners
`,

  // API calls
  apiCall: `
// ✅ Good: Proper dependencies
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(\`/api/data/\${id}\`)
      const data = await response.json()
      setData(data)
    } catch (error) {
      setError(error)
    }
  }
  
  fetchData()
}, [id]) // Include all dependencies
`,

  // Timers
  timer: `
// ✅ Good: Proper cleanup
useEffect(() => {
  const timer = setInterval(() => {
    setCount(prev => prev + 1)
  }, 1000)
  
  return () => {
    clearInterval(timer)
  }
}, []) // Empty deps OK for timers
`,

  // Local storage
  localStorage: `
// ✅ Good: Proper dependencies
useEffect(() => {
  const savedValue = localStorage.getItem(key)
  if (savedValue) {
    setValue(JSON.parse(savedValue))
  }
}, [key]) // Include key dependency
`,

  // Focus management
  focus: `
// ✅ Good: Proper dependencies
useEffect(() => {
  if (shouldFocus && inputRef.current) {
    inputRef.current.focus()
  }
}, [shouldFocus]) // Include shouldFocus dependency
`,

  // Subscription
  subscription: `
// ✅ Good: Proper cleanup
useEffect(() => {
  const subscription = eventEmitter.on('event', handleEvent)
  
  return () => {
    subscription.unsubscribe()
  }
}, [handleEvent]) // Include handleEvent dependency
`
}

/**
 * Generate comprehensive useEffect best practices guide
 */
export function generateBestPracticesGuide(): string {
  return `
# useEffect Best Practices Guide

## 1. Always Include Dependencies
- Include all variables from component scope that are used inside useEffect
- Use ESLint plugin: eslint-plugin-react-hooks
- Don't ignore dependency warnings

## 2. Cleanup Functions
- Always return cleanup functions for subscriptions, timers, and event listeners
- Use AbortController for fetch requests
- Clean up DOM event listeners

## 3. Avoid Infinite Loops
- Don't update state that triggers the same useEffect
- Use useCallback and useMemo to stabilize references
- Consider if the effect is necessary

## 4. Performance Optimization
- Use dependency arrays to control when effects run
- Avoid running effects on every render
- Consider splitting complex effects into multiple simpler ones

## 5. Common Patterns
${Object.entries(useEffectPatterns).map(([name, pattern]) => 
  `### ${name}\n${pattern}`
).join('\n')}

## 6. Tools and Linting
- Use ESLint with react-hooks plugin
- Enable exhaustive-deps rule
- Use React DevTools Profiler to identify performance issues
`
}

export default analyzeUseEffectDependencies
