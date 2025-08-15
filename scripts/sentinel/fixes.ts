/**
 * Fix Engine for Sentinel Gate
 * 
 * Applies safe auto-fixes for common issues detected during analysis
 */

import * as fs from 'fs';
import * as path from 'path';

export interface FixResult {
  success: boolean;
  appliedFixes: string[];
  failedFixes: string[];
  errors: string[];
}

export interface FixContext {
  changedFiles: string[];
  projectRoot: string;
}

export class FixEngine {
  private projectRoot: string;
  
  constructor() {
    this.projectRoot = process.cwd();
  }
  
  /**
   * Apply suggested fixes to resolve issues
   */
  async applyFixes(suggestedFixes: string[], changedFiles: string[]): Promise<FixResult> {
    const context: FixContext = {
      changedFiles,
      projectRoot: this.projectRoot
    };
    
    const result: FixResult = {
      success: true,
      appliedFixes: [],
      failedFixes: [],
      errors: []
    };
    
    console.log('🔧 Applying suggested fixes...');
    
    for (const fix of suggestedFixes) {
      try {
        const fixResult = await this.applyFix(fix, context);
        if (fixResult.success) {
          result.appliedFixes.push(fix);
          console.log(`✅ Applied fix: ${fix}`);
        } else {
          result.failedFixes.push(fix);
          result.errors.push(fixResult.error || `Unknown error applying ${fix}`);
          console.log(`⚠️ Failed to apply fix: ${fix}`);
        }
      } catch (error) {
        result.failedFixes.push(fix);
        result.errors.push(`Error applying ${fix}: ${error.message}`);
        console.log(`❌ Error applying fix: ${fix}`);
      }
    }
    
    // Overall success if at least one fix was applied
    result.success = result.appliedFixes.length > 0;
    
    return result;
  }
  
  /**
   * Apply a specific fix
   */
  private async applyFix(fix: string, context: FixContext): Promise<{ success: boolean; error?: string }> {
    switch (fix) {
      case 'wrap-new-route-with-feature-flag':
        return this.wrapRouteWithFeatureFlag(context);
        
      case 'add-codeowner-stub':
        return this.addCodeownerStub(context);
        
      case 'add-migration-markers':
        return this.addMigrationMarkers(context);
        
      default:
        return { success: false, error: `Unknown fix type: ${fix}` };
    }
  }
  
  /**
   * Wrap new routes with feature flags
   */
  private async wrapRouteWithFeatureFlag(context: FixContext): Promise<{ success: boolean; error?: string }> {
    try {
      const routeFiles = context.changedFiles.filter(file => 
        /^app\/.*\/page\.tsx?$/.test(file) ||
        /^app\/.*\/route\.ts$/.test(file)
      );
      
      if (routeFiles.length === 0) {
        return { success: true }; // No routes to fix
      }
      
      let fixedCount = 0;
      
      for (const routeFile of routeFiles) {
        const filePath = path.join(context.projectRoot, routeFile);
        if (!fs.existsSync(filePath)) continue;
        
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check if already wrapped with FeatureGate
        if (content.includes('FeatureGate') || content.includes('feature-flag')) {
          continue; // Already fixed
        }
        
        // Simple heuristic: if it's a page component, wrap it
        if (routeFile.endsWith('.tsx') || routeFile.endsWith('.ts')) {
          const newContent = this.wrapContentWithFeatureFlag(content, routeFile);
          fs.writeFileSync(filePath, newContent, 'utf8');
          fixedCount++;
        }
      }
      
      return { success: true };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Wrap content with FeatureGate component
   */
  private wrapContentWithFeatureFlag(content: string, fileName: string): string {
    // Generate a feature flag name based on the route
    const routePath = fileName.replace(/^app\//, '').replace(/\/page\.tsx?$/, '').replace(/\/route\.ts$/, '');
    const flagName = routePath.replace(/\//g, '-') || 'new-route';
    
    // Check if FeatureGate is already imported
    if (!content.includes('FeatureGate')) {
      // Add import at the top
      const importStatement = `import { FeatureGate } from '@/components/FeatureGate';\n`;
      content = importStatement + content;
    }
    
    // Find the main export and wrap it
    // This is a simplified approach - in practice, you'd want more sophisticated parsing
    if (content.includes('export default')) {
      content = content.replace(
        /export default function (\w+)/,
        `export default function $1`
      );
      
      // Wrap the entire component with FeatureGate
      const wrappedContent = `export default function ${routePath.split('/').pop() || 'Page'}() {
  return (
    <FeatureGate flag="${flagName}">
      ${content.replace(/export default function \w+\([^)]*\)\s*{([\s\S]*)}/, '$1')}
    </FeatureGate>
  );
}`;
      
      return wrappedContent;
    }
    
    return content;
  }
  
  /**
   * Add codeowner stub
   */
  private async addCodeownerStub(context: FixContext): Promise<{ success: boolean; error?: string }> {
    try {
      const codeownerPath = path.join(context.projectRoot, '.github/CODEOWNERS');
      
      // Create .github directory if it doesn't exist
      const githubDir = path.dirname(codeownerPath);
      if (!fs.existsSync(githubDir)) {
        fs.mkdirSync(githubDir, { recursive: true });
      }
      
      // Check if CODEOWNERS already exists
      if (fs.existsSync(codeownerPath)) {
        return { success: true }; // Already exists
      }
      
      // Create stub CODEOWNERS file
      const stubContent = `# CODEOWNERS
# This file defines who is responsible for which parts of the codebase
# 
# Format: path/to/file @username @team
# 
# Examples:
# /app/ @frontend-team
# /lib/ @backend-team
# /supabase/migrations/ @db-team
# 
# TODO: Add actual code owners for this project
# 
# Global owners (entire repository)
* @project-admin
`;
      
      fs.writeFileSync(codeownerPath, stubContent, 'utf8');
      return { success: true };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Add migration markers to SQL files
   */
  private async addMigrationMarkers(context: FixContext): Promise<{ success: boolean; error?: string }> {
    try {
      const migrationFiles = context.changedFiles.filter(file => 
        /\.sql$/.test(file)
      );
      
      if (migrationFiles.length === 0) {
        return { success: true }; // No migrations to fix
      }
      
      let fixedCount = 0;
      
      for (const migrationFile of migrationFiles) {
        const filePath = path.join(context.projectRoot, migrationFile);
        if (!fs.existsSync(filePath)) continue;
        
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check if already has markers
        if (content.includes('-- #expand') || content.includes('-- #contract')) {
          continue; // Already has markers
        }
        
        // Add migration markers
        const newContent = this.addMigrationMarkersToContent(content, migrationFile);
        fs.writeFileSync(filePath, newContent, 'utf8');
        fixedCount++;
      }
      
      return { success: true };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Add migration markers to SQL content
   */
  private addMigrationMarkersToContent(content: string, fileName: string): string {
    // Simple heuristic: if it contains CREATE, it's likely an expansion
    // if it contains DROP, it's likely a contraction
    const isExpansion = /CREATE|ADD|INSERT/i.test(content);
    const isContraction = /DROP|DELETE|REMOVE/i.test(content);
    
    let newContent = content;
    
    // Add header comment
    const headerComment = `-- Migration: ${fileName}
-- Generated by Sentinel Gate CLI
-- Timestamp: ${new Date().toISOString()}
`;
    
    newContent = headerComment + newContent;
    
    // Add appropriate marker
    if (isExpansion) {
      newContent += '\n\n-- #expand: This migration adds new functionality or data';
    } else if (isContraction) {
      newContent += '\n\n-- #contract: This migration removes functionality or data';
    } else {
      newContent += '\n\n-- #neutral: This migration modifies existing functionality';
    }
    
    return newContent;
  }
  
  /**
   * Check if a fix is applicable
   */
  isFixApplicable(fix: string, context: FixContext): boolean {
    switch (fix) {
      case 'wrap-new-route-with-feature-flag':
        return context.changedFiles.some(file => 
          /^app\/.*\/page\.tsx?$/.test(file) ||
          /^app\/.*\/route\.ts$/.test(file)
        );
        
      case 'add-codeowner-stub':
        return !fs.existsSync(path.join(context.projectRoot, '.github/CODEOWNERS'));
        
      case 'add-migration-markers':
        return context.changedFiles.some(file => /\.sql$/.test(file));
        
      default:
        return false;
    }
  }
  
  /**
   * Get available fixes for the current context
   */
  getAvailableFixes(context: FixContext): string[] {
    const availableFixes: string[] = [];
    
    if (this.isFixApplicable('wrap-new-route-with-feature-flag', context)) {
      availableFixes.push('wrap-new-route-with-feature-flag');
    }
    
    if (this.isFixApplicable('add-codeowner-stub', context)) {
      availableFixes.push('add-codeowner-stub');
    }
    
    if (this.isFixApplicable('add-migration-markers', context)) {
      availableFixes.push('add-migration-markers');
    }
    
    return availableFixes;
  }
}
