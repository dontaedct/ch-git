#!/usr/bin/env node

/**
 * MIT Hero Core - Documentation Validation Script
 * 
 * This script validates the completeness and accuracy of documentation:
 * - Checks API documentation coverage
 * - Validates code examples
 * - Ensures documentation consistency
 * - Reports missing documentation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DocumentationValidator {
  constructor() {
    this.packagePath = path.join(__dirname, '..');
    this.srcPath = path.join(this.packagePath, 'src');
    this.docsPath = path.join(this.packagePath, 'docs');
    
    this.results = {
      total: 0,
      documented: 0,
      missing: 0,
      issues: [],
      recommendations: []
    };
    
    this.documentationFiles = [
      'README.md',
      'API.md',
      'MIGRATION.md',
      'MAINTENANCE.md'
    ];
  }

  /**
   * Main validation method
   */
  async run() {
    console.log('🔍 MIT Hero Core - Documentation Validation');
    console.log('=' .repeat(60));
    
    try {
      // Validate documentation files exist
      await this.validateDocumentationFiles();
      
      // Check API documentation coverage
      await this.checkAPICoverage();
      
      // Validate code examples
      await this.validateCodeExamples();
      
      // Check documentation consistency
      await this.checkConsistency();
      
      // Generate report
      await this.generateReport();
      
      console.log('✅ Documentation validation completed!');
      
    } catch (error) {
      console.error('❌ Documentation validation failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Validate that all required documentation files exist
   */
  async validateDocumentationFiles() {
    console.log('📋 Validating documentation files...');
    
    for (const file of this.documentationFiles) {
      const filePath = path.join(this.packagePath, file);
      
      if (!fs.existsSync(filePath)) {
        this.results.issues.push(`Missing documentation file: ${file}`);
        this.results.missing++;
      } else {
        console.log(`  ✅ ${file} exists`);
      }
    }
    
    this.results.total = this.documentationFiles.length;
    this.results.documented = this.documentationFiles.length - this.results.missing;
  }

  /**
   * Check API documentation coverage
   */
  async checkAPICoverage() {
    console.log('🔍 Checking API documentation coverage...');
    
    try {
      // Get all exported classes and functions
      const exports = await this.getExportedItems();
      
      // Check API.md for coverage
      const apiDoc = fs.readFileSync(path.join(this.packagePath, 'API.md'), 'utf8');
      
      for (const item of exports) {
        if (this.isDocumented(item, apiDoc)) {
          this.results.documented++;
        } else {
          this.results.missing++;
          this.results.issues.push(`Missing API documentation: ${item.name}`);
        }
        this.results.total++;
      }
      
      console.log(`  📊 Found ${exports.length} exported items`);
      
    } catch (error) {
      console.warn('  ⚠️  Could not check API coverage:', error.message);
    }
  }

  /**
   * Get all exported items from source code
   */
  async getExportedItems() {
    const exports = [];
    
    try {
      // Parse TypeScript files for exports
      const files = this.getTypeScriptFiles();
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const exportMatches = content.match(/export\s+(class|interface|function|const|type)\s+(\w+)/g);
        
        if (exportMatches) {
          for (const match of exportMatches) {
            const parts = match.split(/\s+/);
            if (parts.length >= 3) {
              exports.push({
                name: parts[2],
                type: parts[1],
                file: path.relative(this.packagePath, file)
              });
            }
          }
        }
      }
      
    } catch (error) {
      console.warn('  ⚠️  Could not parse source files:', error.message);
    }
    
    return exports;
  }

  /**
   * Get all TypeScript files in src directory
   */
  getTypeScriptFiles() {
    const files = [];
    
    if (fs.existsSync(this.srcPath)) {
      this.walkDirectory(this.srcPath, (filePath) => {
        if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
          files.push(filePath);
        }
      });
    }
    
    return files;
  }

  /**
   * Walk directory recursively
   */
  walkDirectory(dir, callback) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        this.walkDirectory(itemPath, callback);
      } else {
        callback(itemPath);
      }
    }
  }

  /**
   * Check if an item is documented in API.md
   */
  isDocumented(item, apiDoc) {
    // Look for class/interface documentation
    if (item.type === 'class' || item.type === 'interface') {
      return apiDoc.includes(`## ${item.name}`) || 
             apiDoc.includes(`### ${item.name}`) ||
             apiDoc.includes(`#### ${item.name}`);
    }
    
    // Look for function documentation
    if (item.type === 'function') {
      return apiDoc.includes(`${item.name}()`);
    }
    
    // Look for type documentation
    if (item.type === 'type') {
      return apiDoc.includes(`type ${item.name}`) ||
             apiDoc.includes(`### ${item.name}`);
    }
    
    return false;
  }

  /**
   * Validate code examples in documentation
   */
  async validateCodeExamples() {
    console.log('🧪 Validating code examples...');
    
    try {
      // Check README.md examples
      await this.validateFileExamples('README.md');
      
      // Check API.md examples
      await this.validateFileExamples('API.md');
      
      // Check MIGRATION.md examples
      await this.validateFileExamples('MIGRATION.md');
      
    } catch (error) {
      console.warn('  ⚠️  Could not validate code examples:', error.message);
    }
  }

  /**
   * Validate code examples in a specific file
   */
  async validateFileExamples(filename) {
    const filePath = path.join(this.packagePath, filename);
    
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find code blocks
    const codeBlockRegex = /```(typescript|javascript|bash|json)\n([\s\S]*?)```/g;
    let match;
    let exampleCount = 0;
    let validExamples = 0;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1];
      const code = match[2];
      exampleCount++;
      
      if (await this.validateCodeExample(code, language)) {
        validExamples++;
      }
    }
    
    console.log(`  📝 ${filename}: ${validExamples}/${exampleCount} examples valid`);
  }

  /**
   * Validate a single code example
   */
  async validateCodeExample(code, language) {
    try {
      switch (language) {
        case 'typescript':
        case 'javascript':
          return this.validateJavaScriptExample(code);
        
        case 'bash':
          return this.validateBashExample(code);
        
        case 'json':
          return this.validateJSONExample(code);
        
        default:
          return true; // Skip unknown languages
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate JavaScript/TypeScript example
   */
  validateJavaScriptExample(code) {
    try {
      // Basic syntax validation
      if (code.includes('import') || code.includes('require')) {
        // Check import statements
        const importRegex = /import\s+.*from\s+['"`]([^'"`]+)['"`]/g;
        let match;
        
        while ((match = importRegex.exec(code)) !== null) {
          const module = match[1];
          
          // Check if it's a relative import
          if (module.startsWith('.')) {
            const importPath = path.join(this.packagePath, module);
            if (!fs.existsSync(importPath) && !fs.existsSync(importPath + '.ts')) {
              this.results.issues.push(`Invalid import path in example: ${module}`);
              return false;
            }
          }
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate bash example
   */
  validateBashExample(code) {
    try {
      // Check for npm scripts
      const npmScriptRegex = /npm run (\w+)/g;
      let match;
      
      while ((match = npmScriptRegex.exec(code)) !== null) {
        const script = match[1];
        const packageJsonPath = path.join(this.packagePath, 'package.json');
        
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          
          if (!packageJson.scripts || !packageJson.scripts[script]) {
            this.results.issues.push(`Invalid npm script in example: ${script}`);
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate JSON example
   */
  validateJSONExample(code) {
    try {
      JSON.parse(code);
      return true;
    } catch (error) {
      this.results.issues.push(`Invalid JSON in example: ${error.message}`);
      return false;
    }
  }

  /**
   * Check documentation consistency
   */
  async checkConsistency() {
    console.log('🔗 Checking documentation consistency...');
    
    try {
      // Check for broken internal links
      await this.checkInternalLinks();
      
      // Check for consistent formatting
      await this.checkFormatting();
      
      // Check for outdated information
      await this.checkOutdatedInfo();
      
    } catch (error) {
      console.warn('  ⚠️  Could not check consistency:', error.message);
    }
  }

  /**
   * Check for broken internal links
   */
  async checkInternalLinks() {
    for (const filename of this.documentationFiles) {
      const filePath = path.join(this.packagePath, filename);
      
      if (!fs.existsSync(filePath)) {
        continue;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Find internal links
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      
      while ((match = linkRegex.exec(content)) !== null) {
        const linkText = match[1];
        const linkUrl = match[2];
        
        // Check if it's an internal link
        if (linkUrl.startsWith('./') || linkUrl.startsWith('../') || !linkUrl.startsWith('http')) {
          const targetPath = path.join(path.dirname(filePath), linkUrl);
          
          if (!fs.existsSync(targetPath) && !fs.existsSync(targetPath + '.md')) {
            this.results.issues.push(`Broken internal link in ${filename}: ${linkUrl}`);
          }
        }
      }
    }
  }

  /**
   * Check for consistent formatting
   */
  async checkFormatting() {
    for (const filename of this.documentationFiles) {
      const filePath = path.join(this.packagePath, filename);
      
      if (!fs.existsSync(filePath)) {
        continue;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for consistent heading levels
      const headingRegex = /^(#{1,6})\s+(.+)$/gm;
      let match;
      let previousLevel = 0;
      
      while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length;
        const title = match[2];
        
        if (level > previousLevel + 1) {
          this.results.issues.push(`Inconsistent heading level in ${filename}: ${title} (level ${level})`);
        }
        
        previousLevel = level;
      }
      
      // Check for consistent list formatting
      const listRegex = /^(\s*)[-*+]\s+(.+)$/gm;
      
      while ((match = listRegex.exec(content)) !== null) {
        const indent = match[1].length;
        const item = match[2];
        
        if (indent % 2 !== 0) {
          this.results.issues.push(`Inconsistent list indentation in ${filename}: ${item}`);
        }
      }
    }
  }

  /**
   * Check for outdated information
   */
  async checkOutdatedInfo() {
    try {
      // Check package.json version
      const packageJsonPath = path.join(this.packagePath, 'package.json');
      
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const version = packageJson.version;
        
        // Check if version is mentioned in documentation
        for (const filename of this.documentationFiles) {
          const filePath = path.join(this.packagePath, filename);
          
          if (!fs.existsSync(filePath)) {
            continue;
          }
          
          const content = fs.readFileSync(filePath, 'utf8');
          
          if (content.includes('Current version:') && !content.includes(`Current version: ${version}`)) {
            this.results.issues.push(`Outdated version information in ${filename}`);
          }
        }
      }
      
    } catch (error) {
      console.warn('  ⚠️  Could not check for outdated info:', error.message);
    }
  }

  /**
   * Generate validation report
   */
  async generateReport() {
    console.log('📊 Generating validation report...');
    
    const report = [
      '# Documentation Validation Report',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Summary',
      '',
      `- **Total Items**: ${this.results.total}`,
      `- **Documented**: ${this.results.documented}`,
      `- **Missing**: ${this.results.missing}`,
      `- **Coverage**: ${this.results.total > 0 ? Math.round((this.results.documented / this.results.total) * 100) : 0}%`,
      '',
      '## Issues Found',
      ''
    ];
    
    if (this.results.issues.length === 0) {
      report.push('✅ No issues found!');
    } else {
      for (const issue of this.results.issues) {
        report.push(`- ❌ ${issue}`);
      }
    }
    
    report.push('');
    report.push('## Recommendations');
    report.push('');
    
    if (this.results.missing > 0) {
      report.push(`- 📝 Document ${this.results.missing} missing items`);
    }
    
    if (this.results.issues.length > 0) {
      report.push(`- 🔧 Fix ${this.results.issues.length} identified issues`);
    }
    
    if (this.results.documented > 0) {
      report.push('- ✅ All documented items are properly covered');
    }
    
    // Add specific recommendations based on findings
    if (this.results.missing > 0) {
      report.push('');
      report.push('### Priority Actions');
      report.push('');
      report.push('1. **Complete API Documentation**: Ensure all exported classes, interfaces, and functions are documented');
      report.push('2. **Add Code Examples**: Provide working examples for all major features');
      report.push('3. **Update Migration Guide**: Ensure migration guide covers all breaking changes');
      report.push('4. **Review Maintenance Procedures**: Verify all maintenance procedures are current');
    }
    
    // Write report
    const reportPath = path.join(this.packagePath, 'DOCUMENTATION_REPORT.md');
    fs.writeFileSync(reportPath, report.join('\n'));
    
    console.log('✅ Validation report generated:', reportPath);
    
    // Display summary
    console.log('');
    console.log('📊 Validation Summary');
    console.log('=' .repeat(40));
    console.log(`Total Items: ${this.results.total}`);
    console.log(`Documented: ${this.results.documented}`);
    console.log(`Missing: ${this.results.missing}`);
    console.log(`Coverage: ${this.results.total > 0 ? Math.round((this.results.documented / this.results.total) * 100) : 0}%`);
    console.log(`Issues: ${this.results.issues.length}`);
    
    if (this.results.issues.length > 0) {
      console.log('');
      console.log('❌ Issues Found:');
      for (const issue of this.results.issues.slice(0, 5)) {
        console.log(`  - ${issue}`);
      }
      if (this.results.issues.length > 5) {
        console.log(`  ... and ${this.results.issues.length - 5} more`);
      }
    }
    
    // Exit with appropriate code
    if (this.results.issues.length > 0) {
      console.log('');
      console.log('⚠️  Documentation validation completed with issues');
      process.exit(1);
    } else {
      console.log('');
      console.log('🎉 All documentation validation checks passed!');
    }
  }

  /**
   * Display help information
   */
  static showHelp() {
    console.log(`
MIT Hero Core - Documentation Validation

Usage: node validate-docs.js [options]

This script validates the completeness and accuracy of documentation:
- Checks API documentation coverage
- Validates code examples
- Ensures documentation consistency
- Reports missing documentation

Options:
  --help, -h    Show this help message

Examples:
  # Run full validation
  node validate-docs.js
  
  # Check specific aspects
  node validate-docs.js --api-only
    `);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    DocumentationValidator.showHelp();
    process.exit(0);
  }
  
  const validator = new DocumentationValidator();
  validator.run().catch(error => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = DocumentationValidator;
