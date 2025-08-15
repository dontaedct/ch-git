#!/usr/bin/env node

/**
 * Git Auto-Recovery System - Lightweight & Efficient
 * Provides minimal recovery without heavy operations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitAutoRecovery {
    constructor() {
        this.projectRoot = process.cwd();
        this.recoveryFile = path.join(this.projectRoot, '.git-recovery-state.json');
    }

    /**
     * Start auto-recovery - quick and safe
     */
    async startAutoRecovery() {
        console.log('🔄 Git Auto-Recovery (Lightweight)');
        console.log('===================================');

        try {
            const health = await this.runHealthCheck();
            
            if (health.status === 'healthy') {
                console.log('✅ No recovery needed - Git is healthy');
                return health;
            }

            // Apply minimal recovery
            if (health.issues.length > 0) {
                console.log('🔧 Applying minimal recovery...');
                await this.applyMinimalRecovery(health.issues);
            }

            const finalHealth = await this.runHealthCheck();
            console.log(`✅ Recovery completed: ${finalHealth.status}`);
            return finalHealth;

        } catch (error) {
            console.error('❌ Recovery error:', error.message);
            return { status: 'error', issues: [{ error: error.message }] };
        }
    }

    /**
     * Quick health check
     */
    async runHealthCheck() {
        const issues = [];
        
        try {
            // Basic Git check
            execSync('git status --porcelain', { stdio: 'pipe' });
        } catch (error) {
            issues.push({ type: 'git_corrupted', severity: 'high' });
        }

        try {
            // Hook check
            if (!fs.existsSync('.husky') && !fs.existsSync('.git/hooks')) {
                issues.push({ type: 'hooks_missing', severity: 'medium' });
            }
        } catch (error) {
            issues.push({ type: 'hook_check_failed', severity: 'low' });
        }

        const status = issues.length === 0 ? 'healthy' : 'unhealthy';
        return { status, issues };
    }

    /**
     * Apply minimal recovery without heavy operations
     */
    async applyMinimalRecovery(issues) {
        for (const issue of issues) {
            try {
                switch (issue.type) {
                    case 'git_corrupted':
                        // Only reinit if absolutely necessary
                        if (!fs.existsSync('.git')) {
                            execSync('git init', { stdio: 'pipe' });
                        }
                        break;
                    case 'hooks_missing':
                        if (!fs.existsSync('.husky')) {
                            fs.mkdirSync('.husky', { recursive: true });
                        }
                        break;
                }
            } catch (error) {
                console.log(`⚠️  Recovery failed for ${issue.type}: ${error.message}`);
            }
        }
    }

    /**
     * Emergency recovery - minimal and safe
     */
    async emergencyRecovery() {
        console.log('🚨 Emergency recovery mode...');
        try {
            // Only do essential recovery
            if (!fs.existsSync('.git')) {
                execSync('git init', { stdio: 'pipe' });
            }
            if (!fs.existsSync('.husky')) {
                fs.mkdirSync('.husky', { recursive: true });
            }
        } catch (error) {
            console.log('⚠️  Emergency recovery limited - manual intervention may be needed');
        }
    }
}

// CLI execution
if (require.main === module) {
    const recovery = new GitAutoRecovery();
    recovery.startAutoRecovery().catch(console.error);
}

module.exports = GitAutoRecovery;
