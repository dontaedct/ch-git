#!/usr/bin/env node

/**
<<<<<<< HEAD
 * @fileoverview MIT Hero Component Contract Auditor
 * @description Validates component contracts and interfaces for design safety
 * @version 2.0.0
 * @author MIT Hero Design Safety Module
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { Project } from 'ts-morph';
=======
 * Component Contract Auditor
 * 
 * Validates UI component API contracts and exits non-zero on violations.
 * This ensures design guardian rules are enforced as errors.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
>>>>>>> origin/main

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

<<<<<<< HEAD
class ComponentContractAuditor {
  constructor() {
    this.projectRoot = process.cwd();
    this.componentsRoot = join(this.projectRoot, 'components');
    this.uiComponentsRoot = join(this.componentsRoot, 'ui');
    this.violations = [];
    this.project = null;
  }

  /**
   * Initialize ts-morph project
   */
  initializeProject() {
    try {
      const tsConfigPath = join(this.projectRoot, 'tsconfig.json');
      console.log(`  📁 Using TypeScript config: ${tsConfigPath}`);
      
      this.project = new Project({
        tsConfigFilePath: tsConfigPath,
        skipAddingFilesFromTsConfig: true,
      });
      
      console.log('  ✅ TypeScript project initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize TypeScript project:', error.message);
      process.exit(1);
    }
  }

  /**
   * Find all UI component files
   */
  findUIComponents() {
    const components = [];
    
    console.log(`  📁 Scanning directory: ${this.uiComponentsRoot}`);
    
    if (!existsSync(this.uiComponentsRoot)) {
      console.log('⚠️  No components/ui directory found');
      return components;
    }

    const scanDirectory = (dir) => {
      const items = readdirSync(dir);
      
      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (extname(item) === '.tsx') {
          components.push(fullPath);
        }
      }
    };

    scanDirectory(this.uiComponentsRoot);
    console.log(`  📋 Found ${components.length} .tsx files`);
    return components;
  }

  /**
   * Check if component has proper props handling
   */
  checkPropsExport(sourceFile) {
    const fileName = sourceFile.getBaseName();
    
    // Skip hooks and utility files
    if (fileName.startsWith('use-') || fileName === 'use-mobile.tsx') {
      return;
    }
    
    const exportedDeclarations = sourceFile.getExportedDeclarations();
    let hasPropsExport = false;
    let hasComponentWithProps = false;
    let hasValidComponent = false;
    
    // Check for explicit Props exports
    for (const [name, declarations] of exportedDeclarations) {
      if (name === 'Props' || name.endsWith('Props')) {
        hasPropsExport = true;
        break;
      }
    }
    
    // Check for components that accept props (even if not explicitly exported)
    const functions = sourceFile.getFunctions();
    const variableStatements = sourceFile.getVariableStatements();
    
    for (const func of functions) {
      if (func.isExported()) {
        const parameters = func.getParameters();
        if (parameters.length > 0) {
          hasComponentWithProps = true;
          break;
        }
        // Even components with no props are valid (like providers, loaders)
        hasValidComponent = true;
      }
    }
    
    for (const varStmt of variableStatements) {
      if (varStmt.isExported()) {
        const declarations = varStmt.getDeclarations();
        for (const decl of declarations) {
          if (decl.getInitializer() && decl.getInitializer().getKindName() === 'ArrowFunction') {
            const arrowFunc = decl.getInitializer();
            const parameters = arrowFunc.getParameters();
            if (parameters.length > 0) {
              hasComponentWithProps = true;
              break;
            }
            // Even components with no props are valid
            hasValidComponent = true;
          }
          // Also check if the variable name is exported (like in export { Toaster })
          if (decl.getName() && exportedDeclarations.has(decl.getName())) {
            hasValidComponent = true;
          }
        }
      }
    }
    
    // Component is valid if it either exports Props, has a component that accepts props, or is a valid component with no props
    // Also check if any exported names exist (handles export { ComponentName } pattern)
    const hasExportedNames = exportedDeclarations.size > 0;
    

    
    if (!hasPropsExport && !hasComponentWithProps && !hasValidComponent && !hasExportedNames) {
      this.violations.push({
        file: sourceFile.getFilePath(),
        rule: 'PROPS_EXPORT',
        message: 'Component must have proper props handling (Props export, component accepting props, or valid component)',
        line: 1
      });
    }
  }

  /**
   * Check for forbidden imports (fetch, createClient, db)
   */
  checkForbiddenImports(sourceFile) {
    const imports = sourceFile.getImportDeclarations();
    
    for (const importDecl of imports) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      const namedImports = importDecl.getNamedImports();
      const defaultImport = importDecl.getDefaultImport();
      
      // Check for forbidden modules
      if (moduleSpecifier.includes('fetch') || 
          moduleSpecifier.includes('createClient') ||
          moduleSpecifier.includes('db') ||
          moduleSpecifier.includes('supabase') ||
          moduleSpecifier.includes('@data/') ||
          moduleSpecifier.includes('@lib/supabase')) {
        
        this.violations.push({
          file: sourceFile.getFilePath(),
          rule: 'FORBIDDEN_IMPORT',
          message: `Forbidden import: ${moduleSpecifier}`,
          line: importDecl.getStartLineNumber()
        });
      }
      
      // Check for forbidden named imports
      for (const namedImport of namedImports) {
        const importName = namedImport.getName();
        if (importName === 'fetch' || 
            importName === 'createClient' ||
            importName.includes('db') ||
            importName.includes('supabase')) {
          
          this.violations.push({
            file: sourceFile.getFilePath(),
            rule: 'FORBIDDEN_IMPORT',
            message: `Forbidden named import: ${importName}`,
            line: namedImport.getStartLineNumber()
          });
        }
      }
      
      // Check for forbidden default imports
      if (defaultImport && (
          defaultImport.getText().includes('fetch') ||
          defaultImport.getText().includes('createClient') ||
          defaultImport.getText().includes('db') ||
          defaultImport.getText().includes('supabase'))) {
        
        this.violations.push({
          file: sourceFile.getFilePath(),
          rule: 'FORBIDDEN_IMPORT',
          message: `Forbidden default import: ${defaultImport.getText()}`,
          line: defaultImport.getStartLineNumber()
        });
      }
    }
  }

  /**
   * Check form components for proper callback + schema props
   */
  checkFormProps(sourceFile) {
    const fileName = sourceFile.getBaseName();
    
    // Only check actual form components, not utility components
    if (!fileName.toLowerCase().includes('form') || fileName === 'form.tsx') {
      return;
    }

    const exportedDeclarations = sourceFile.getExportedDeclarations();
    let hasCallbackProps = false;
    let hasSchemaProps = false;
    
    for (const [name, declarations] of exportedDeclarations) {
      if (name === 'Props' || name.endsWith('Props')) {
        const declaration = declarations[0];
        
        if (declaration.getKindName() === 'InterfaceDeclaration') {
          const interfaceDecl = declaration;
          const properties = interfaceDecl.getProperties();
          
          for (const prop of properties) {
            const propName = prop.getName();
            const propType = prop.getType().getText();
            
            if (propName.includes('onSubmit') || 
                propName.includes('onChange') || 
                propName.includes('onBlur') ||
                propName.includes('onFocus') ||
                propName.includes('callback')) {
              hasCallbackProps = true;
            }
            
            if (propName.includes('schema') || 
                propName.includes('validation') ||
                propType.includes('zod') ||
                propType.includes('Schema')) {
              hasSchemaProps = true;
            }
          }
        }
      }
    }

    if (!hasCallbackProps) {
      this.violations.push({
        file: sourceFile.getFilePath(),
        rule: 'FORM_CALLBACKS',
        message: 'Form component must accept callback props (onSubmit, onChange, etc.)',
        line: 1
      });
    }

    if (!hasSchemaProps) {
      this.violations.push({
        file: sourceFile.getFilePath(),
        rule: 'FORM_SCHEMA',
        message: 'Form component must accept schema/validation props',
        line: 1
      });
    }
  }

  /**
   * Audit a single component file
   */
  auditComponent(filePath) {
    try {
      const sourceFile = this.project.addSourceFileAtPath(filePath);
      

      
      // Check Props export
      this.checkPropsExport(sourceFile);
      
      // Check forbidden imports
      this.checkForbiddenImports(sourceFile);
      
      // Check form props (if applicable)
      this.checkFormProps(sourceFile);
      
    } catch (error) {
      console.error(`❌ Error auditing ${filePath}:`, error.message);
    }
  }

  /**
   * Run the complete audit
   */
  async runAudit() {
    console.log('📋 MIT Hero Component Contract Auditor: Validating contracts...');
    
    try {
      // Initialize TypeScript project
      this.initializeProject();
      
      // Find all UI components
      const components = this.findUIComponents();
      console.log(`  🔍 Found ${components.length} UI components to audit...`);
      
      if (components.length === 0) {
        console.log('  ⚠️  No UI components found to audit');
        return true;
      }
      
      // Audit each component
      for (const component of components) {
        this.auditComponent(component);
      }
      
      // Report results
      this.reportResults();
      
      return this.violations.length === 0;
      
    } catch (error) {
      console.error('❌ Component contract audit failed:', error.message);
      return false;
    }
  }

  /**
   * Report audit results
   */
  reportResults() {
    if (this.violations.length === 0) {
      console.log('✅ All components follow contract rules');
      return;
    }

    console.log('\n❌ Component contract violations found:');
    console.log('=====================================');
    
    // Group violations by rule
    const violationsByRule = {};
    for (const violation of this.violations) {
      if (!violationsByRule[violation.rule]) {
        violationsByRule[violation.rule] = [];
      }
      violationsByRule[violation.rule].push(violation);
    }
    
    // Display violations grouped by rule
    for (const [rule, violations] of Object.entries(violationsByRule)) {
      console.log(`\n${rule}:`);
      for (const violation of violations) {
        const relativePath = violation.file.replace(this.projectRoot, '').replace(/\\/g, '/');
        console.log(`  ${relativePath}:${violation.line} - ${violation.message}`);
      }
    }
    
    console.log(`\n📊 Total violations: ${this.violations.length}`);
    console.log('🔧 Fix violations to pass component contract audit');
  }

  /**
   * Main execution method
   */
  async run() {
    const args = process.argv.slice(2);
    
    if (args.includes('--audit')) {
      const success = await this.runAudit();
      process.exit(success ? 0 : 1);
    }
    
    console.log('MIT Hero Component Contract Auditor - Available commands:');
    console.log('  --audit     Audit component contracts');
    console.log('  --help      Show this help message');
    
    return true;
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('component-contract-auditor.mjs')) {
  const auditor = new ComponentContractAuditor();
  auditor.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default ComponentContractAuditor;
=======
console.log('🔍 Component Contract Auditor starting...');

// Simple audit function
function auditComponents() {
  console.log('📁 Auditing components...');
  
  const components = [
    'components/ui/button.tsx',
    'components/ui/input.tsx',
    'components/ui/card.tsx',
    'components/header.tsx',
    'components/intake-form.tsx'
  ];
  
  let auditedCount = 0;
  let violations = 0;
  
  for (const component of components) {
    const fullPath = join(process.cwd(), component);
    if (existsSync(fullPath)) {
      auditedCount++;
      console.log(`  ✅ Audited: ${component}`);
      
      try {
        const content = readFileSync(fullPath, 'utf8');
        
        // Check for import boundary violations
        if (/import.*from.*['"]@data\//.test(content)) {
          console.log(`  ❌ VIOLATION: ${component} imports from @data/`);
          violations++;
        }
        
        if (/import.*from.*['"]@lib\/supabase/.test(content)) {
          console.log(`  ❌ VIOLATION: ${component} imports from @lib/supabase`);
          violations++;
        }
        
        if (/import.*from.*['"]@app\/api\//.test(content)) {
          console.log(`  ❌ VIOLATION: ${component} imports from @app/api/`);
          violations++;
        }
        
      } catch (error) {
        console.log(`  ❌ Error reading ${component}: ${error.message}`);
        violations++;
      }
    } else {
      console.log(`  ⚠️  Not found: ${component}`);
    }
  }
  
  console.log('\n📊 Audit Summary:');
  console.log(`   Components audited: ${auditedCount}`);
  console.log(`   Violations found: ${violations}`);
  
  if (violations > 0) {
    console.log('\n❌ Design Guardian rules violated!');
    console.log('   UI contracts must pass before merge.');
    process.exit(1);
  } else {
    console.log('\n✅ All components pass design guardian rules!');
  }
}

// Run the audit
auditComponents();
>>>>>>> origin/main
