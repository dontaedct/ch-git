#!/usr/bin/env node

/**
 * Git Guardian Bot - Lightweight & Efficient
 * Follows universal header rules and makes Git self-healing
 * 
 * Features:
 * - Quick health checks (under 2 seconds)
 * - Minimal file operations
 * - Smart caching
 * - Emergency recovery only when needed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitGuardian {
    constructor() {
        this.projectRoot = process.cwd();
        this.cacheFile = path.join(this.projectRoot, '.git-guardian-cache.json');
        this.maxCacheAge = 30000; // 30 seconds
    }

    /**
     * Main guardian function - quick and efficient
     */
    async guard() {
        console.log('🛡️  Git Guardian Bot (Lightweight)');
        console.log('====================================');

        try {
            // Quick health check with caching
            const health = await this.quickHealthCheck();
            
            if (health.status === 'healthy') {
                console.log('✅ Git is healthy - no action needed');
                return health;
            }

            // Apply minimal fixes
            if (health.issues.length > 0) {
                console.log('🔧 Applying quick fixes...');
                await this.applyQuickFixes(health.issues);
            }

            // Final verification
            const finalHealth = await this.quickHealthCheck();
            console.log(`✅ Guardian completed: ${finalHealth.status}`);
            return finalHealth;

        } catch (error) {
            console.error('❌ Guardian error:', error.message);
            return { status: 'error', issues: [{ error: error.message }] };
        }
    }

    /**
     * Quick health check with smart caching
     */
    async quickHealthCheck() {
        // Check cache first
        if (this.isCacheValid()) {
            const cached = this.loadCache();
            if (cached.status === 'healthy') {
                return cached;
            }
        }

        const issues = [];
        
        // Only check critical items
        try {
            // Git status check
            execSync('git status --porcelain', { stdio: 'pipe' });
        } catch (error) {
            issues.push({ check: 'Git Status', error: 'Git not initialized or corrupted' });
        }

        try {
            // Hook directory check
            if (!fs.existsSync('.husky') && !fs.existsSync('.git/hooks')) {
                issues.push({ check: 'Hooks', error: 'No hook directories found' });
            }
        } catch (error) {
            issues.push({ check: 'Hooks', error: 'Hook check failed' });
        }

        const status = issues.length === 0 ? 'healthy' : 'unhealthy';
        const health = { status, issues, timestamp: Date.now() };
        
        // Cache the result
        this.saveCache(health);
        
        return health;
    }

    /**
     * Apply quick fixes without heavy operations
     */
    async applyQuickFixes(issues) {
        for (const issue of issues) {
            try {
                switch (issue.check) {
                    case 'Git Status':
                        if (issue.error.includes('not initialized')) {
                            execSync('git init', { stdio: 'pipe' });
                        }
                        break;
                    case 'Hooks':
                        if (!fs.existsSync('.husky')) {
                            fs.mkdirSync('.husky', { recursive: true });
                        }
                        break;
                }
            } catch (error) {
                console.log(`⚠️  Quick fix failed for ${issue.check}: ${error.message}`);
            }
        }
    }

    /**
     * Cache management
     */
    isCacheValid() {
        try {
            if (!fs.existsSync(this.cacheFile)) return false;
            const stats = fs.statSync(this.cacheFile);
            return (Date.now() - stats.mtime.getTime()) < this.maxCacheAge;
        } catch {
            return false;
        }
    }

    loadCache() {
        try {
            const data = fs.readFileSync(this.cacheFile, 'utf8');
            return JSON.parse(data);
        } catch {
            return { status: 'unknown', issues: [] };
        }
    }

    saveCache(health) {
        try {
            fs.writeFileSync(this.cacheFile, JSON.stringify(health, null, 2));
        } catch {
            // Ignore cache save errors
        }
    }

    /**
     * Emergency recovery - minimal and safe
     */
    async emergencyRecovery() {
        console.log('🚨 Emergency recovery mode...');
        try {
            // Only reinstall hooks if they're missing
            if (!fs.existsSync('.husky') && !fs.existsSync('.git/hooks')) {
                execSync('npx husky install', { stdio: 'pipe' });
            }
        } catch (error) {
            console.log('⚠️  Emergency recovery limited - manual intervention may be needed');
        }
    }
}

// CLI execution
if (require.main === module) {
    const guardian = new GitGuardian();
    guardian.guard().catch(console.error);
}

module.exports = GitGuardian;
