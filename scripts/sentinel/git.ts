/**
 * Git Analysis Utilities for Sentinel Gate
 * 
 * Handles git diff operations and change detection against the default branch
 */

import { execSync } from 'child_process';

export interface GitChange {
  file: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed';
  diff?: string;
}

export class GitAnalyzer {
  private defaultBranch: string;
  
  constructor(defaultBranch: string = 'origin/main') {
    this.defaultBranch = defaultBranch;
  }
  
  /**
   * Get list of changed files against the default branch
   */
  async getChangedFiles(): Promise<string[]> {
    try {
      // Check if we're in a git repository
      if (!this.isGitRepository()) {
        return [];
      }
      
      // Get the current branch
      const currentBranch = this.getCurrentBranch();
      
      // If we're on the default branch, no changes to analyze
      if (currentBranch === this.defaultBranch.replace('origin/', '')) {
        return [];
      }
      
      // Get changed files
      const changedFiles = this.getDiffFiles();
      return changedFiles;
      
    } catch (error) {
      console.warn('⚠️ Git analysis warning:', error.message);
      return [];
    }
  }
  
  /**
   * Get detailed changes with status and diff information
   */
  async getDetailedChanges(): Promise<GitChange[]> {
    try {
      const changedFiles = await this.getChangedFiles();
      const detailedChanges: GitChange[] = [];
      
      for (const file of changedFiles) {
        const status = this.getFileStatus(file);
        const diff = this.getFileDiff(file);
        
        detailedChanges.push({
          file,
          status,
          diff
        });
      }
      
      return detailedChanges;
      
    } catch (error) {
      console.warn('⚠️ Detailed git analysis warning:', error.message);
      return [];
    }
  }
  
  /**
   * Check if current directory is a git repository
   */
  private isGitRepository(): boolean {
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Get current git branch
   */
  private getCurrentBranch(): string {
    try {
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      return branch;
    } catch {
      return 'unknown';
    }
  }
  
  /**
   * Get list of changed files from git diff
   */
  private getDiffFiles(): string[] {
    try {
      const diffOutput = execSync(
        `git diff --name-only ${this.defaultBranch}...HEAD`,
        { encoding: 'utf8' }
      );
      
      if (!diffOutput.trim()) {
        return [];
      }
      
      return diffOutput.trim().split('\n').filter(Boolean);
      
    } catch (error) {
      console.warn('⚠️ Git diff warning:', error.message);
      return [];
    }
  }
  
  /**
   * Get the status of a specific file
   */
  private getFileStatus(file: string): GitChange['status'] {
    try {
      const statusOutput = execSync(
        `git status --porcelain "${file}"`,
        { encoding: 'utf8' }
      ).trim();
      
      if (!statusOutput) {
        return 'modified';
      }
      
      const statusCode = statusOutput.charAt(0);
      switch (statusCode) {
        case 'A': return 'added';
        case 'D': return 'deleted';
        case 'R': return 'renamed';
        case 'M': return 'modified';
        default: return 'modified';
      }
      
    } catch {
      return 'modified';
    }
  }
  
  /**
   * Get the diff for a specific file
   */
  private getFileDiff(file: string): string | undefined {
    try {
      const diffOutput = execSync(
        `git diff ${this.defaultBranch}...HEAD -- "${file}"`,
        { encoding: 'utf8' }
      );
      
      return diffOutput.trim() || undefined;
      
    } catch {
      return undefined;
    }
  }
  
  /**
   * Get the commit hash of the default branch
   */
  getDefaultBranchHash(): string {
    try {
      const hash = execSync(
        `git rev-parse ${this.defaultBranch}`,
        { encoding: 'utf8' }
      ).trim();
      return hash;
    } catch {
      return 'unknown';
    }
  }
  
  /**
   * Get the commit hash of the current HEAD
   */
  getCurrentHash(): string {
    try {
      const hash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      return hash;
    } catch {
      return 'unknown';
    }
  }
}
