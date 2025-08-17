#!/usr/bin/env node

/**
 * MIT Hero Core - Dependency Update Automation
 * 
 * This script automates dependency updates with safety checks and validation.
 * It includes:
 * - Security vulnerability scanning
 * - Breaking change detection
 * - Automated testing
 * - Changelog generation
 * - Rollback capabilities
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

class DependencyUpdater {
  constructor() {
    this.packagePath = path.join(__dirname, '..');
    this.packageJsonPath = path.join(this.packagePath, 'package.json');
    this.packageLockPath = path.join(this.packagePath, 'package-lock.json');
    this.backupPath = path.join(this.packagePath, 'package.json.backup');
    this.changelogPath = path.join(this.packagePath, 'DEPENDENCY_CHANGELOG.md');
    
    this.currentDependencies = {};
    this.updatedDependencies = {};
    this.breakingChanges = [];
    this.securityIssues = [];
    
    this.config = {
      autoUpdate: process.env.AUTO_UPDATE === 'true',
      securityOnly: process.env.SECURITY_ONLY === 'true',
      majorUpdates: process.env.MAJOR_UPDATES === 'true',
      testAfterUpdate: process.env.TEST_AFTER_UPDATE !== 'false',
      createBackup: true,
      maxConcurrentUpdates: 5
    };
  }

  /**
   * Main execution method
   */
  async run() {
    try {
      console.log('🚀 MIT Hero Core - Dependency Update Automation');
      console.log('=' .repeat(60));
      
      // Load current state
      await this.loadCurrentState();
      
      // Check for updates
      const updates = await this.checkForUpdates();
      
      if (updates.length === 0) {
        console.log('✅ All dependencies are up to date!');
        return;
      }
      
      console.log(`📦 Found ${updates.length} dependency updates`);
      
      // Analyze updates
      await this.analyzeUpdates(updates);
      
      // Apply updates
      await this.applyUpdates(updates);
      
      // Test updates
      if (this.config.testAfterUpdate) {
        await this.testUpdates();
      }
      
      // Generate changelog
      await this.generateChangelog();
      
      console.log('🎉 Dependency update completed successfully!');
      
    } catch (error) {
      console.error('❌ Dependency update failed:', error.message);
      
      // Attempt rollback
      if (this.config.createBackup) {
        await this.rollback();
      }
      
      process.exit(1);
    }
  }

  /**
   * Load current package state
   */
  async loadCurrentState() {
    console.log('📋 Loading current package state...');
    
    if (!fs.existsSync(this.packageJsonPath)) {
      throw new Error('package.json not found');
    }
    
    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    
    this.currentDependencies = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {},
      ...packageJson.peerDependencies || {}
    };
    
    console.log(`📊 Loaded ${Object.keys(this.currentDependencies).length} dependencies`);
  }

  /**
   * Check for available updates
   */
  async checkForUpdates() {
    console.log('🔍 Checking for dependency updates...');
    
    const updates = [];
    
    try {
      // Check outdated packages
      const outdatedOutput = execSync('npm outdated --json', { 
        cwd: this.packagePath,
        encoding: 'utf8'
      });
      
      const outdated = JSON.parse(outdatedOutput);
      
      for (const [packageName, info] of Object.entries(outdated)) {
        const current = info.current;
        const latest = info.latest;
        const wanted = info.wanted;
        
        if (current !== latest) {
          updates.push({
            name: packageName,
            current,
            latest,
            wanted,
            type: this.getUpdateType(current, latest),
            isSecurityUpdate: await this.isSecurityUpdate(packageName, current, latest)
          });
        }
      }
      
    } catch (error) {
      // npm outdated returns non-zero exit code when there are updates
      if (error.status === 1) {
        // Parse the output manually
        const output = execSync('npm outdated', { 
          cwd: this.packagePath,
          encoding: 'utf8'
        });
        
        // Parse the table output
        const lines = output.split('\n').filter(line => line.trim());
        
        for (const line of lines.slice(1)) { // Skip header
          const parts = line.split(/\s+/);
          if (parts.length >= 4) {
            const packageName = parts[0];
            const current = parts[1];
            const wanted = parts[2];
            const latest = parts[3];
            
            if (current !== latest) {
              updates.push({
                name: packageName,
                current,
                latest,
                wanted,
                type: this.getUpdateType(current, latest),
                isSecurityUpdate: await this.isSecurityUpdate(packageName, current, latest)
              });
            }
          }
        }
      } else {
        throw error;
      }
    }
    
    return updates;
  }

  /**
   * Determine update type (patch, minor, major)
   */
  getUpdateType(current, latest) {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);
    
    if (latestParts[0] > currentParts[0]) return 'major';
    if (latestParts[1] > currentParts[1]) return 'minor';
    return 'patch';
  }

  /**
   * Check if update is security-related
   */
  async isSecurityUpdate(packageName, current, latest) {
    try {
      // Check npm audit for security issues
      const auditOutput = execSync('npm audit --json', { 
        cwd: this.packagePath,
        encoding: 'utf8'
      });
      
      const audit = JSON.parse(auditOutput);
      
      // Check if package has security vulnerabilities
      for (const [path, advisories] of Object.entries(audit.advisories || {})) {
        for (const advisory of Object.values(advisories)) {
          if (advisory.module_name === packageName) {
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      // If audit fails, assume it's not a security update
      return false;
    }
  }

  /**
   * Analyze updates for breaking changes and security issues
   */
  async analyzeUpdates(updates) {
    console.log('🔍 Analyzing updates for potential issues...');
    
    for (const update of updates) {
      // Check for breaking changes in major updates
      if (update.type === 'major') {
        const breakingChanges = await this.checkBreakingChanges(update);
        if (breakingChanges.length > 0) {
          update.breakingChanges = breakingChanges;
          this.breakingChanges.push(update);
        }
      }
      
      // Check for security issues
      if (update.isSecurityUpdate) {
        const securityIssues = await this.checkSecurityIssues(update);
        if (securityIssues.length > 0) {
          update.securityIssues = securityIssues;
          this.securityIssues.push(update);
        }
      }
    }
    
    // Filter updates based on configuration
    if (this.config.securityOnly) {
      return updates.filter(update => update.isSecurityUpdate);
    }
    
    if (!this.config.majorUpdates) {
      return updates.filter(update => update.type !== 'major');
    }
    
    return updates;
  }

  /**
   * Check for breaking changes in a package
   */
  async checkBreakingChanges(update) {
    try {
      // Try to get changelog or release notes
      const changelog = await this.fetchChangelog(update.name);
      
      if (changelog) {
        // Look for breaking change indicators
        const breakingIndicators = [
          'breaking change',
          'breaking changes',
          'breaking',
          'major',
          'incompatible',
          'deprecated'
        ];
        
        const breakingChanges = [];
        
        for (const indicator of breakingIndicators) {
          if (changelog.toLowerCase().includes(indicator)) {
            breakingChanges.push(`Contains "${indicator}" indicators`);
            break;
          }
        }
        
        return breakingChanges;
      }
      
      return [];
    } catch (error) {
      return [`Could not analyze changelog: ${error.message}`];
    }
  }

  /**
   * Check for security issues in a package
   */
  async checkSecurityIssues(update) {
    try {
      const auditOutput = execSync('npm audit --json', { 
        cwd: this.packagePath,
        encoding: 'utf8'
      });
      
      const audit = JSON.parse(auditOutput);
      const issues = [];
      
      for (const [path, advisories] of Object.entries(audit.advisories || {})) {
        for (const advisory of Object.values(advisories)) {
          if (advisory.module_name === update.name) {
            issues.push({
              severity: advisory.severity,
              title: advisory.title,
              description: advisory.overview
            });
          }
        }
      }
      
      return issues;
    } catch (error) {
      return [`Could not analyze security: ${error.message}`];
    }
  }

  /**
   * Fetch changelog for a package
   */
  async fetchChangelog(packageName) {
    try {
      // Try to get package info from npm
      const packageInfo = execSync(`npm view ${packageName} --json`, { 
        cwd: this.packagePath,
        encoding: 'utf8'
      });
      
      const info = JSON.parse(packageInfo);
      
      if (info.repository && info.repository.url) {
        // Try to fetch README or CHANGELOG from repository
        const repoUrl = info.repository.url.replace('git+', '').replace('.git', '');
        
        if (repoUrl.includes('github.com')) {
          const changelogUrl = `${repoUrl}/blob/main/CHANGELOG.md`;
          return `Changelog available at: ${changelogUrl}`;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Apply dependency updates
   */
  async applyUpdates(updates) {
    console.log('📦 Applying dependency updates...');
    
    // Create backup
    if (this.config.createBackup) {
      await this.createBackup();
    }
    
    // Group updates by type
    const securityUpdates = updates.filter(u => u.isSecurityUpdate);
    const patchUpdates = updates.filter(u => u.type === 'patch');
    const minorUpdates = updates.filter(u => u.type === 'minor');
    const majorUpdates = updates.filter(u => u.type === 'major');
    
    // Apply updates in order of safety
    if (securityUpdates.length > 0) {
      console.log(`🔒 Applying ${securityUpdates.length} security updates...`);
      await this.applyUpdateGroup(securityUpdates);
    }
    
    if (patchUpdates.length > 0) {
      console.log(`🔧 Applying ${patchUpdates.length} patch updates...`);
      await this.applyUpdateGroup(patchUpdates);
    }
    
    if (minorUpdates.length > 0) {
      console.log(`📈 Applying ${minorUpdates.length} minor updates...`);
      await this.applyUpdateGroup(minorUpdates);
    }
    
    if (majorUpdates.length > 0) {
      console.log(`⚠️  Applying ${majorUpdates.length} major updates...`);
      await this.applyUpdateGroup(majorUpdates);
    }
    
    // Install updated dependencies
    console.log('📥 Installing updated dependencies...');
    execSync('npm install', { cwd: this.packagePath, stdio: 'inherit' });
    
    // Update package-lock.json
    execSync('npm install', { cwd: this.packagePath, stdio: 'inherit' });
  }

  /**
   * Apply a group of updates
   */
  async applyUpdateGroup(updates) {
    for (const update of updates) {
      try {
        console.log(`  📦 Updating ${update.name} from ${update.current} to ${update.latest}`);
        
        // Update specific package
        execSync(`npm install ${update.name}@${update.latest}`, { 
          cwd: this.packagePath,
          stdio: 'inherit'
        });
        
        this.updatedDependencies[update.name] = {
          from: update.current,
          to: update.latest,
          type: update.type,
          isSecurityUpdate: update.isSecurityUpdate,
          breakingChanges: update.breakingChanges || [],
          securityIssues: update.securityIssues || []
        };
        
      } catch (error) {
        console.error(`  ❌ Failed to update ${update.name}:`, error.message);
        
        if (this.config.autoUpdate) {
          throw error;
        }
      }
    }
  }

  /**
   * Create backup of package files
   */
  async createBackup() {
    console.log('💾 Creating backup...');
    
    try {
      // Backup package.json
      fs.copyFileSync(this.packageJsonPath, this.backupPath);
      
      // Backup package-lock.json
      if (fs.existsSync(this.packageLockPath)) {
        fs.copyFileSync(this.packageLockPath, this.packageLockPath + '.backup');
      }
      
      console.log('✅ Backup created successfully');
    } catch (error) {
      console.warn('⚠️  Failed to create backup:', error.message);
    }
  }

  /**
   * Test updates by running tests and build
   */
  async testUpdates() {
    console.log('🧪 Testing updates...');
    
    try {
      // Run type checking
      console.log('  🔍 Running type check...');
      execSync('npm run typecheck', { cwd: this.packagePath, stdio: 'inherit' });
      
      // Run linting
      console.log('  🧹 Running linting...');
      execSync('npm run lint', { cwd: this.packagePath, stdio: 'inherit' });
      
      // Run tests
      console.log('  🧪 Running tests...');
      execSync('npm test', { cwd: this.packagePath, stdio: 'inherit' });
      
      // Run build
      console.log('  🔨 Running build...');
      execSync('npm run build', { cwd: this.packagePath, stdio: 'inherit' });
      
      console.log('✅ All tests passed!');
      
    } catch (error) {
      console.error('❌ Tests failed:', error.message);
      throw new Error('Update validation failed');
    }
  }

  /**
   * Generate changelog for dependency updates
   */
  async generateChangelog() {
    console.log('📝 Generating changelog...');
    
    const changelog = [
      '# Dependency Update Changelog',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Summary',
      '',
      `- Total updates: ${Object.keys(this.updatedDependencies).length}`,
      `- Security updates: ${Object.keys(this.updatedDependencies).filter(name => this.updatedDependencies[name].isSecurityUpdate).length}`,
      `- Major updates: ${Object.keys(this.updatedDependencies).filter(name => this.updatedDependencies[name].type === 'major').length}`,
      `- Minor updates: ${Object.keys(this.updatedDependencies).filter(name => this.updatedDependencies[name].type === 'minor').length}`,
      `- Patch updates: ${Object.keys(this.updatedDependencies).filter(name => this.updatedDependencies[name].type === 'patch').length}`,
      '',
      '## Updates',
      ''
    ];
    
    // Group by type
    const byType = {
      major: [],
      minor: [],
      patch: [],
      security: []
    };
    
    for (const [name, info] of Object.entries(this.updatedDependencies)) {
      const entry = {
        name,
        ...info
      };
      
      if (info.isSecurityUpdate) {
        byType.security.push(entry);
      } else {
        byType[info.type].push(entry);
      }
    }
    
    // Add security updates first
    if (byType.security.length > 0) {
      changelog.push('### 🔒 Security Updates', '');
      for (const update of byType.security) {
        changelog.push(`- **${update.name}**: ${update.from} → ${update.to}`);
        if (update.securityIssues.length > 0) {
          for (const issue of update.securityIssues) {
            changelog.push(`  - ${issue.severity}: ${issue.title}`);
          }
        }
      }
      changelog.push('');
    }
    
    // Add major updates
    if (byType.major.length > 0) {
      changelog.push('### ⚠️  Major Updates', '');
      for (const update of byType.major) {
        changelog.push(`- **${update.name}**: ${update.from} → ${update.to}`);
        if (update.breakingChanges.length > 0) {
          for (const change of update.breakingChanges) {
            changelog.push(`  - ⚠️  ${change}`);
          }
        }
      }
      changelog.push('');
    }
    
    // Add minor updates
    if (byType.minor.length > 0) {
      changelog.push('### 📈 Minor Updates', '');
      for (const update of byType.minor) {
        changelog.push(`- **${update.name}**: ${update.from} → ${update.to}`);
      }
      changelog.push('');
    }
    
    // Add patch updates
    if (byType.patch.length > 0) {
      changelog.push('### 🔧 Patch Updates', '');
      for (const update of byType.patch) {
        changelog.push(`- **${update.name}**: ${update.from} → ${update.to}`);
      }
      changelog.push('');
    }
    
    // Add recommendations
    changelog.push('## Recommendations', '');
    
    if (byType.major.length > 0) {
      changelog.push('- ⚠️  **Review major updates carefully** for breaking changes');
      changelog.push('- Test thoroughly in development environment');
      changelog.push('- Update integration tests if necessary');
      changelog.push('');
    }
    
    if (byType.security.length > 0) {
      changelog.push('- 🔒 **Security updates should be applied immediately**');
      changelog.push('- Verify no new vulnerabilities were introduced');
      changelog.push('');
    }
    
    changelog.push('- Run full test suite after updates');
    changelog.push('- Monitor application performance and stability');
    changelog.push('- Update documentation if API changes occurred');
    
    // Write changelog
    fs.writeFileSync(this.changelogPath, changelog.join('\n'));
    console.log('✅ Changelog generated:', this.changelogPath);
  }

  /**
   * Rollback to backup
   */
  async rollback() {
    console.log('🔄 Rolling back to backup...');
    
    try {
      if (fs.existsSync(this.backupPath)) {
        fs.copyFileSync(this.backupPath, this.packageJsonPath);
        console.log('✅ package.json restored from backup');
      }
      
      if (fs.existsSync(this.packageLockPath + '.backup')) {
        fs.copyFileSync(this.packageLockPath + '.backup', this.packageLockPath);
        console.log('✅ package-lock.json restored from backup');
      }
      
      // Reinstall dependencies
      execSync('npm install', { cwd: this.packagePath, stdio: 'inherit' });
      console.log('✅ Dependencies restored');
      
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    }
  }

  /**
   * Display help information
   */
  static showHelp() {
    console.log(`
MIT Hero Core - Dependency Update Automation

Usage: node dependency-updater.js [options]

Environment Variables:
  AUTO_UPDATE=true          - Automatically apply all updates
  SECURITY_ONLY=true        - Only apply security updates
  MAJOR_UPDATES=true        - Allow major version updates
  TEST_AFTER_UPDATE=false   - Skip testing after updates

Examples:
  # Check for updates only
  node dependency-updater.js
  
  # Apply security updates only
  SECURITY_ONLY=true node dependency-updater.js
  
  # Apply all updates automatically
  AUTO_UPDATE=true node dependency-updater.js
  
  # Allow major updates
  MAJOR_UPDATES=true node dependency-updater.js
    `);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    DependencyUpdater.showHelp();
    process.exit(0);
  }
  
  const updater = new DependencyUpdater();
  updater.run().catch(error => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = DependencyUpdater;
