/**
 * @fileoverview HT-008.10.5: Design System Automation and Versioning
 * @module scripts/design-system-automation.ts
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.10.5 - Design System Automation and Versioning
 * Focus: Automated versioning, changelog generation, and release management
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design system automation)
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

interface VersionInfo {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
}

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch' | 'prerelease';
  changes: {
    added?: string[];
    changed?: string[];
    deprecated?: string[];
    removed?: string[];
    fixed?: string[];
    security?: string[];
  };
}

interface DesignSystemConfig {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  repository: string;
  homepage: string;
  keywords: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
}

class DesignSystemAutomation {
  private config: DesignSystemConfig;
  private changelogPath: string;
  private packageJsonPath: string;

  constructor() {
    this.packageJsonPath = join(process.cwd(), 'package.json');
    this.changelogPath = join(process.cwd(), 'CHANGELOG.md');
    this.config = this.loadConfig();
  }

  async automate(): Promise<void> {
    console.log('🚀 Starting Design System Automation...\n');

    await this.validateEnvironment();
    await this.updateVersion();
    await this.generateChangelog();
    await this.updateDocumentation();
    await this.runTests();
    await this.buildPackage();
    await this.createRelease();
    await this.updateDependencies();
    await this.generateReports();
  }

  private loadConfig(): DesignSystemConfig {
    const packageJson = JSON.parse(readFileSync(this.packageJsonPath, 'utf-8'));
    
    return {
      name: packageJson.name || 'design-system',
      version: packageJson.version || '1.0.0',
      description: packageJson.description || 'Enterprise Design System',
      author: packageJson.author || 'OSS Hero System',
      license: packageJson.license || 'MIT',
      repository: packageJson.repository?.url || '',
      homepage: packageJson.homepage || '',
      keywords: packageJson.keywords || ['design-system', 'ui', 'components'],
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {},
      scripts: packageJson.scripts || {},
    };
  }

  private async validateEnvironment(): Promise<void> {
    console.log('🔍 Validating Environment...');

    // Check if git is available
    try {
      execSync('git --version', { stdio: 'pipe' });
    } catch {
      throw new Error('Git is required for automation');
    }

    // Check if npm is available
    try {
      execSync('npm --version', { stdio: 'pipe' });
    } catch {
      throw new Error('npm is required for automation');
    }

    // Check if we're in a git repository
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    } catch {
      throw new Error('Not in a git repository');
    }

    console.log('✅ Environment validation passed');
  }

  private async updateVersion(): Promise<void> {
    console.log('📦 Updating Version...');

    const currentVersion = this.parseVersion(this.config.version);
    const newVersion = this.determineNextVersion(currentVersion);
    const newVersionString = this.formatVersion(newVersion);

    // Update package.json
    const packageJson = JSON.parse(readFileSync(this.packageJsonPath, 'utf-8'));
    packageJson.version = newVersionString;
    writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Update design tokens version
    const tokensPath = join(process.cwd(), 'lib/design-tokens/tokens.ts');
    if (existsSync(tokensPath)) {
      let tokensContent = readFileSync(tokensPath, 'utf-8');
      tokensContent = tokensContent.replace(
        /@version \d+\.\d+\.\d+/,
        `@version ${newVersionString}`
      );
      writeFileSync(tokensPath, tokensContent);
    }

    this.config.version = newVersionString;
    console.log(`✅ Version updated to ${newVersionString}`);
  }

  private parseVersion(version: string): VersionInfo {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/);
    if (!match) {
      throw new Error(`Invalid version format: ${version}`);
    }

    return {
      major: parseInt(match[1]),
      minor: parseInt(match[2]),
      patch: parseInt(match[3]),
      prerelease: match[4],
      build: match[5],
    };
  }

  private determineNextVersion(current: VersionInfo): VersionInfo {
    // Check git commits since last tag to determine version bump
    try {
      const lastTag = execSync('git describe --tags --abbrev=0', { stdio: 'pipe' }).toString().trim();
      const commits = execSync(`git log ${lastTag}..HEAD --oneline`, { stdio: 'pipe' }).toString();
      
      const commitLines = commits.split('\n').filter(line => line.trim());
      
      let hasBreaking = false;
      let hasFeature = false;
      let hasFix = false;

      for (const commit of commitLines) {
        if (commit.includes('BREAKING CHANGE') || commit.includes('!:')) {
          hasBreaking = true;
        } else if (commit.startsWith('feat:') || commit.startsWith('feature:')) {
          hasFeature = true;
        } else if (commit.startsWith('fix:') || commit.startsWith('bugfix:')) {
          hasFix = true;
        }
      }

      if (hasBreaking) {
        return { major: current.major + 1, minor: 0, patch: 0 };
      } else if (hasFeature) {
        return { major: current.major, minor: current.minor + 1, patch: 0 };
      } else if (hasFix) {
        return { major: current.major, minor: current.minor, patch: current.patch + 1 };
      }
    } catch {
      // If no tags exist, default to patch bump
    }

    return { major: current.major, minor: current.minor, patch: current.patch + 1 };
  }

  private formatVersion(version: VersionInfo): string {
    let versionString = `${version.major}.${version.minor}.${version.patch}`;
    if (version.prerelease) {
      versionString += `-${version.prerelease}`;
    }
    if (version.build) {
      versionString += `+${version.build}`;
    }
    return versionString;
  }

  private async generateChangelog(): Promise<void> {
    console.log('📝 Generating Changelog...');

    const changelogEntry = await this.createChangelogEntry();
    const changelogContent = this.formatChangelogEntry(changelogEntry);

    // Read existing changelog
    let existingChangelog = '';
    if (existsSync(this.changelogPath)) {
      existingChangelog = readFileSync(this.changelogPath, 'utf-8');
    }

    // Prepend new entry
    const newChangelog = changelogContent + '\n' + existingChangelog;
    writeFileSync(this.changelogPath, newChangelog);

    console.log('✅ Changelog generated');
  }

  private async createChangelogEntry(): Promise<ChangelogEntry> {
    const version = this.config.version;
    const date = new Date().toISOString().split('T')[0];
    
    // Get commits since last tag
    let commits: string[] = [];
    try {
      const lastTag = execSync('git describe --tags --abbrev=0', { stdio: 'pipe' }).toString().trim();
      const commitOutput = execSync(`git log ${lastTag}..HEAD --oneline`, { stdio: 'pipe' }).toString();
      commits = commitOutput.split('\n').filter(line => line.trim());
    } catch {
      // If no tags exist, get all commits
      const commitOutput = execSync('git log --oneline', { stdio: 'pipe' }).toString();
      commits = commitOutput.split('\n').filter(line => line.trim());
    }

    // Categorize commits
    const changes = {
      added: [] as string[],
      changed: [] as string[],
      deprecated: [] as string[],
      removed: [] as string[],
      fixed: [] as string[],
      security: [] as string[],
    };

    for (const commit of commits) {
      if (commit.includes('BREAKING CHANGE') || commit.includes('!:')) {
        changes.changed.push(commit);
      } else if (commit.startsWith('feat:') || commit.startsWith('feature:')) {
        changes.added.push(commit);
      } else if (commit.startsWith('fix:') || commit.startsWith('bugfix:')) {
        changes.fixed.push(commit);
      } else if (commit.startsWith('security:')) {
        changes.security.push(commit);
      } else if (commit.startsWith('deprecate:')) {
        changes.deprecated.push(commit);
      } else if (commit.startsWith('remove:')) {
        changes.removed.push(commit);
      } else {
        changes.changed.push(commit);
      }
    }

    // Determine version type
    let type: 'major' | 'minor' | 'patch' | 'prerelease' = 'patch';
    if (changes.changed.some(c => c.includes('BREAKING CHANGE'))) {
      type = 'major';
    } else if (changes.added.length > 0) {
      type = 'minor';
    }

    return {
      version,
      date,
      type,
      changes,
    };
  }

  private formatChangelogEntry(entry: ChangelogEntry): string {
    let changelog = `## [${entry.version}] - ${entry.date}\n\n`;

    if (entry.changes.added.length > 0) {
      changelog += '### Added\n';
      entry.changes.added.forEach(change => {
        changelog += `- ${change}\n`;
      });
      changelog += '\n';
    }

    if (entry.changes.changed.length > 0) {
      changelog += '### Changed\n';
      entry.changes.changed.forEach(change => {
        changelog += `- ${change}\n`;
      });
      changelog += '\n';
    }

    if (entry.changes.fixed.length > 0) {
      changelog += '### Fixed\n';
      entry.changes.fixed.forEach(change => {
        changelog += `- ${change}\n`;
      });
      changelog += '\n';
    }

    if (entry.changes.security.length > 0) {
      changelog += '### Security\n';
      entry.changes.security.forEach(change => {
        changelog += `- ${change}\n`;
      });
      changelog += '\n';
    }

    if (entry.changes.deprecated.length > 0) {
      changelog += '### Deprecated\n';
      entry.changes.deprecated.forEach(change => {
        changelog += `- ${change}\n`;
      });
      changelog += '\n';
    }

    if (entry.changes.removed.length > 0) {
      changelog += '### Removed\n';
      entry.changes.removed.forEach(change => {
        changelog += `- ${change}\n`;
      });
      changelog += '\n';
    }

    return changelog;
  }

  private async updateDocumentation(): Promise<void> {
    console.log('📚 Updating Documentation...');

    // Update design system documentation
    const docPath = join(process.cwd(), 'docs/DESIGN_SYSTEM_DOCUMENTATION.md');
    if (existsSync(docPath)) {
      let docContent = readFileSync(docPath, 'utf-8');
      docContent = docContent.replace(
        /\*\*Version:\*\* \d+\.\d+\.\d+/,
        `**Version:** ${this.config.version}`
      );
      docContent = docContent.replace(
        /\*\*Last Updated:\*\* \d{4}-\d{2}-\d{2}/,
        `**Last Updated:** ${new Date().toISOString().split('T')[0]}`
      );
      writeFileSync(docPath, docContent);
    }

    console.log('✅ Documentation updated');
  }

  private async runTests(): Promise<void> {
    console.log('🧪 Running Tests...');

    try {
      execSync('npm run design-system:test', { stdio: 'inherit' });
      console.log('✅ Tests passed');
    } catch {
      throw new Error('Tests failed');
    }
  }

  private async buildPackage(): Promise<void> {
    console.log('🏗️ Building Package...');

    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Package built successfully');
    } catch {
      throw new Error('Build failed');
    }
  }

  private async createRelease(): Promise<void> {
    console.log('🚀 Creating Release...');

    try {
      // Create git tag
      execSync(`git tag v${this.config.version}`, { stdio: 'inherit' });
      
      // Push tag
      execSync(`git push origin v${this.config.version}`, { stdio: 'inherit' });
      
      console.log(`✅ Release v${this.config.version} created`);
    } catch (error) {
      console.warn('⚠️ Release creation failed:', error);
    }
  }

  private async updateDependencies(): Promise<void> {
    console.log('📦 Updating Dependencies...');

    try {
      // Check for outdated dependencies
      execSync('npm outdated', { stdio: 'pipe' });
      
      // Update dependencies (optional)
      // execSync('npm update', { stdio: 'inherit' });
      
      console.log('✅ Dependencies checked');
    } catch {
      console.log('ℹ️ No outdated dependencies found');
    }
  }

  private async generateReports(): Promise<void> {
    console.log('📊 Generating Reports...');

    try {
      // Generate bundle analysis
      execSync('npm run bundle:analyze', { stdio: 'pipe' });
      
      // Generate test coverage
      execSync('npm run test:coverage', { stdio: 'pipe' });
      
      // Generate design system validation report
      execSync('npm run design-system:validate', { stdio: 'pipe' });
      
      console.log('✅ Reports generated');
    } catch (error) {
      console.warn('⚠️ Report generation failed:', error);
    }
  }
}

// Main execution
async function main() {
  const automation = new DesignSystemAutomation();
  await automation.automate();
  
  console.log('\n🎉 Design System Automation Complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

export { DesignSystemAutomation };
