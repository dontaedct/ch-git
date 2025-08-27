#!/usr/bin/env tsx

/**
 * Security secrets scanner
 * 
 * This script scans the codebase for potential hardcoded secrets and
 * security vulnerabilities related to environment variable usage.
 * 
 * Usage:
 *   npm run security:secrets                    # Scan for secrets
 *   npm run security:secrets -- --fix          # Auto-fix issues where possible
 *   npm run security:secrets -- --verbose      # Detailed output
 * 
 * Universal Header: @scripts/security-secrets
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

interface SecurityIssue {
  file: string;
  line: number;
  type: "hardcoded_secret" | "exposed_secret" | "insecure_pattern" | "missing_validation";
  severity: "high" | "medium" | "low";
  message: string;
  suggestion?: string;
}

interface ScanOptions {
  fix: boolean;
  verbose: boolean;
  help: boolean;
  excludePatterns: string[];
}

// Common secret patterns to detect
const SECRET_PATTERNS = [
  // API Keys
  { pattern: /(api[_-]?key|apikey)\s*[:=]\s*["']([^"']{20,})["']/gi, type: "hardcoded_secret" as const },
  { pattern: /(secret[_-]?key|secretkey)\s*[:=]\s*["']([^"']{20,})["']/gi, type: "hardcoded_secret" as const },
  { pattern: /(access[_-]?token|accesstoken)\s*[:=]\s*["']([^"']{20,})["']/gi, type: "hardcoded_secret" as const },
  { pattern: /(private[_-]?key|privatekey)\s*[:=]\s*["']([^"']{20,})["']/gi, type: "hardcoded_secret" as const },
  
  // Database credentials
  { pattern: /(password|pwd)\s*[:=]\s*["']([^"']{8,})["']/gi, type: "hardcoded_secret" as const },
  { pattern: /(database[_-]?url|db[_-]?url)\s*[:=]\s*["']([^"']{20,})["']/gi, type: "hardcoded_secret" as const },
  
  // JWT and tokens
  { pattern: /(jwt[_-]?secret|jwtscret)\s*[:=]\s*["']([^"']{20,})["']/gi, type: "hardcoded_secret" as const },
  { pattern: /(bearer[_-]?token|bearertoken)\s*[:=]\s*["']([^"']{20,})["']/gi, type: "hardcoded_secret" as const },
  
  // Service-specific
  { pattern: /(stripe[_-]?secret|stripesecret)\s*[:=]\s*["']([^"']{20,})["']/gi, type: "hardcoded_secret" as const },
  { pattern: /(github[_-]?token|githubtoken)\s*[:=]\s*["']([^"']{20,})["']/gi, type: "hardcoded_secret" as const },
  { pattern: /(slack[_-]?token|slacktoken)\s*[:=]\s*["']([^"']{20,})["']/gi, type: "hardcoded_secret" as const },
  { pattern: /(sentry[_-]?dsn|sentrydsn)\s*[:=]\s*["']([^"']{20,})["']/gi, type: "hardcoded_secret" as const },
];

// Patterns that indicate secrets being exposed to client
const EXPOSED_SECRET_PATTERNS = [
  { pattern: /NEXT_PUBLIC_.*SECRET/gi, type: "exposed_secret" as const },
  { pattern: /NEXT_PUBLIC_.*PRIVATE/gi, type: "exposed_secret" as const },
  { pattern: /NEXT_PUBLIC_.*PASSWORD/gi, type: "exposed_secret" as const },
  { pattern: /NEXT_PUBLIC_.*AUTH/gi, type: "exposed_secret" as const },
  { pattern: /NEXT_PUBLIC_.*CREDENTIAL/gi, type: "exposed_secret" as const },
];

// Insecure patterns
const INSECURE_PATTERNS = [
  { pattern: /process\.env\.([A-Z_]+)\s*\|\|\s*["']([^"']{8,})["']/g, type: "insecure_pattern" as const },
  { pattern: /process\.env\.([A-Z_]+)\s*\?\?\s*["']([^"']{8,})["']/g, type: "insecure_pattern" as const },
];

// Files to exclude from scanning
const DEFAULT_EXCLUDE_PATTERNS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  "test-results",
  "playwright-report",
  "*.log",
  "*.tmp",
  "*.backup",
  "env.example",
  ".env.example",
  "CHANGE_JOURNAL.md",
  "docs",
  "scripts/check-env.ts",
  "scripts/security-secrets.ts",
];

// File extensions to scan
const SCAN_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".yml", ".yaml"];

function parseArgs(): ScanOptions {
  const args = process.argv.slice(2);
  
  return {
    fix: args.includes("--fix"),
    verbose: args.includes("--verbose") || args.includes("-v"),
    help: args.includes("--help") || args.includes("-h"),
    excludePatterns: args.filter(arg => arg.startsWith("--exclude=")).map(arg => arg.split("=")[1]),
  };
}

function printHelp() {
  console.log(`
Security Secrets Scanner

Usage:
  npm run security:secrets [options]

Options:
  --fix                    Auto-fix issues where possible
  --verbose, -v           Show detailed output
  --exclude=pattern       Exclude files matching pattern
  --help, -h              Show this help message

Examples:
  npm run security:secrets                    # Scan for secrets
  npm run security:secrets -- --fix          # Auto-fix issues
  npm run security:secrets -- --verbose      # Detailed output
  npm run security:secrets -- --exclude=*.md # Exclude markdown files
`);
}

function shouldExcludeFile(filePath: string, excludePatterns: string[]): boolean {
  const allPatterns = [...DEFAULT_EXCLUDE_PATTERNS, ...excludePatterns];
  
  // Always exclude the security scanner itself
  if (filePath.includes("security-secrets.ts")) {
    return true;
  }
  
  return allPatterns.some(pattern => {
    if (pattern.includes("*")) {
      const regex = new RegExp(pattern.replace(/\*/g, ".*"));
      return regex.test(filePath);
    }
    return filePath.includes(pattern);
  });
}

function scanFile(filePath: string): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  
  try {
    const content = readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for hardcoded secrets
      SECRET_PATTERNS.forEach(({ pattern, type }) => {
        const matches = [...line.matchAll(pattern)];
        matches.forEach(match => {
          // Skip if it's in a comment or example
          if (line.trim().startsWith("//") || line.trim().startsWith("#") || line.includes("example")) {
            return;
          }
          
          // Skip if it's a dummy value for CI/testing
          const value = match[2] || match[0];
          if (value && (
            value.includes("dummy") || 
            value.includes("test") || 
            value.includes("example") ||
            value.includes("placeholder") ||
            value.includes("your_") ||
            value.includes("123456")
          )) {
            return;
          }
          
          issues.push({
            file: filePath,
            line: lineNumber,
            type,
            severity: "high",
            message: `Potential hardcoded secret detected: ${match[1]}`,
            suggestion: "Use environment variables instead of hardcoded secrets",
          });
        });
      });
      
      // Check for exposed secrets
      EXPOSED_SECRET_PATTERNS.forEach(({ pattern, type }) => {
        const matches = [...line.matchAll(pattern)];
        matches.forEach(match => {
          issues.push({
            file: filePath,
            line: lineNumber,
            type,
            severity: "high",
            message: `Secret exposed to client: ${match[0]}`,
            suggestion: "NEXT_PUBLIC_* variables are exposed to the client. Use server-only variables instead.",
          });
        });
      });
      
      // Check for insecure patterns
      INSECURE_PATTERNS.forEach(({ pattern, type }) => {
        const matches = [...line.matchAll(pattern)];
        matches.forEach(match => {
          issues.push({
            file: filePath,
            line: lineNumber,
            type,
            severity: "medium",
            message: `Insecure fallback pattern: ${match[0]}`,
            suggestion: "Use proper environment validation instead of fallback values",
          });
        });
      });
    });
    
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}:`, error);
  }
  
  return issues;
}

function scanDirectory(dirPath: string, excludePatterns: string[]): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  
  try {
    const entries = readdirSync(dirPath);
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stat = statSync(fullPath);
      
      if (shouldExcludeFile(fullPath, excludePatterns)) {
        continue;
      }
      
      if (stat.isDirectory()) {
        issues.push(...scanDirectory(fullPath, excludePatterns));
      } else if (stat.isFile() && SCAN_EXTENSIONS.includes(extname(fullPath))) {
        issues.push(...scanFile(fullPath));
      }
    }
    
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dirPath}:`, error);
  }
  
  return issues;
}

function printIssues(issues: SecurityIssue[], verbose: boolean) {
  if (issues.length === 0) {
    console.log("✅ No security issues found!");
    return;
  }
  
  console.log(`\n🚨 Found ${issues.length} security issue(s):\n`);
  
  // Group by severity
  const highIssues = issues.filter(i => i.severity === "high");
  const mediumIssues = issues.filter(i => i.severity === "medium");
  const lowIssues = issues.filter(i => i.severity === "low");
  
  const printIssueGroup = (group: SecurityIssue[], severity: string) => {
    if (group.length === 0) return;
    
    console.log(`\n${severity.toUpperCase()} SEVERITY (${group.length} issues):`);
    console.log("=" .repeat(50));
    
    group.forEach(issue => {
      console.log(`\n📍 ${issue.file}:${issue.line}`);
      console.log(`   Type: ${issue.type}`);
      console.log(`   Message: ${issue.message}`);
      if (issue.suggestion) {
        console.log(`   Suggestion: ${issue.suggestion}`);
      }
      
      if (verbose) {
        try {
          const content = readFileSync(issue.file, "utf8");
          const lines = content.split("\n");
          const line = lines[issue.line - 1];
          console.log(`   Code: ${line?.trim()}`);
        } catch (error) {
          console.log(`   Code: (could not read file)`);
        }
      }
    });
  };
  
  printIssueGroup(highIssues, "HIGH");
  printIssueGroup(mediumIssues, "MEDIUM");
  printIssueGroup(lowIssues, "LOW");
}

function main() {
  const options = parseArgs();
  
  if (options.help) {
    printHelp();
    process.exit(0);
  }
  
  console.log("🔍 Security Secrets Scanner");
  console.log("===========================\n");
  
  console.log("Scanning codebase for security issues...");
  
  const issues = scanDirectory(".", options.excludePatterns);
  
  printIssues(issues, options.verbose);
  
  if (issues.length > 0) {
    console.log("\n💡 Recommendations:");
    console.log("   1. Move hardcoded secrets to environment variables");
    console.log("   2. Use server-only environment variables for sensitive data");
    console.log("   3. Implement proper environment validation");
    console.log("   4. Review NEXT_PUBLIC_* variables for sensitive data");
    
    if (options.fix) {
      console.log("\n🔧 Auto-fix is not implemented yet. Please fix issues manually.");
    }
    
    process.exit(1);
  }
  
  console.log("\n🎉 Security scan completed successfully!");
  process.exit(0);
}

// Run the scanner
main();
