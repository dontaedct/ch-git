#!/usr/bin/env tsx

/**
 * @fileoverview HT-006 Where-Used Scanner - Comprehensive Symbol Analysis
 * @description ts-morph powered analysis for safe refactoring
 * @version 1.0.0
 * @author HT-006 Phase 4 - Refactoring Toolkit
 * @task HT-006.4 - Refactoring Toolkit Implementation
 */

import { Project, SyntaxKind, Node, ts, SourceFile } from 'ts-morph';
import { glob } from 'fast-glob';
import pc from 'picocolors';
import * as path from 'path';

interface WhereUsedOptions {
  verbose?: boolean;
  json?: boolean;
  includeTypes?: boolean;
  includeImports?: boolean;
}

interface UsageInfo {
  file: string;
  line: number;
  column: number;
  context: string;
  type: 'import' | 'reference' | 'declaration' | 'type-reference';
  isExported?: boolean;
  isImported?: boolean;
}

interface WhereUsedResult {
  symbol: string;
  totalUsages: number;
  files: string[];
  usages: UsageInfo[];
  summary: {
    declarations: number;
    imports: number;
    references: number;
    typeReferences: number;
  };
}

class WhereUsedScanner {
  private project: Project;
  private options: WhereUsedOptions;

  constructor(options: WhereUsedOptions = {}) {
    this.options = options;
    this.project = new Project({
      tsConfigFilePath: 'tsconfig.json',
    });
  }

  async findUsages(symbol: string): Promise<WhereUsedResult> {
    console.log(pc.blue(`🔍 Scanning for usages of: ${symbol}`));
    
    const files = this.project.getSourceFiles();
    const usages: UsageInfo[] = [];
    const filesWithUsages = new Set<string>();

    for (const file of files) {
      const fileUsages = this.findUsagesInFile(file, symbol);
      if (fileUsages.length > 0) {
        usages.push(...fileUsages);
        filesWithUsages.add(file.getFilePath());
      }
    }

    const result: WhereUsedResult = {
      symbol,
      totalUsages: usages.length,
      files: Array.from(filesWithUsages),
      usages,
      summary: {
        declarations: usages.filter(u => u.type === 'declaration').length,
        imports: usages.filter(u => u.type === 'import').length,
        references: usages.filter(u => u.type === 'reference').length,
        typeReferences: usages.filter(u => u.type === 'type-reference').length,
      }
    };

    this.displayResults(result);
    return result;
  }

  private findUsagesInFile(file: SourceFile, symbol: string): UsageInfo[] {
    const usages: UsageInfo[] = [];
    
    // Find all identifiers with the symbol name
    const identifiers = file.getDescendantsOfKind(SyntaxKind.Identifier);
    
    for (const identifier of identifiers) {
      if (identifier.getText() === symbol) {
        const usage = this.analyzeIdentifierUsage(file, identifier, symbol);
        if (usage) {
          usages.push(usage);
        }
      }
    }

    // Also check import declarations
    const importDeclarations = file.getImportDeclarations();
    for (const importDecl of importDeclarations) {
      const namedImports = importDecl.getNamedImports();
      for (const namedImport of namedImports) {
        if (namedImport.getName() === symbol) {
          usages.push({
            file: file.getFilePath(),
            line: importDecl.getStartLineNumber(),
            column: importDecl.getStart(),
            context: `import { ${symbol} } from '${importDecl.getModuleSpecifierValue()}'`,
            type: 'import',
            isImported: true,
          });
        }
      }
    }

    return usages;
  }

  private analyzeIdentifierUsage(file: SourceFile, identifier: Node, symbol: string): UsageInfo | null {
    const parent = identifier.getParent();
    if (!parent) return null;

    const line = identifier.getStartLineNumber();
    const column = identifier.getStart();
    const context = this.getContextString(identifier);

    // Determine usage type
    let type: UsageInfo['type'] = 'reference';
    let isExported = false;
    let isImported = false;

    // Check if it's a declaration
    if (this.isDeclaration(parent)) {
      type = 'declaration';
      isExported = this.isExported(parent);
    }
    // Check if it's a type reference
    else if (this.isTypeReference(parent)) {
      type = 'type-reference';
    }
    // Check if it's an import
    else if (this.isImportUsage(parent)) {
      type = 'import';
      isImported = true;
    }

    return {
      file: file.getFilePath(),
      line,
      column,
      context,
      type,
      isExported,
      isImported,
    };
  }

  private isDeclaration(node: Node): boolean {
    const kind = node.getKind();
    return [
      SyntaxKind.VariableDeclaration,
      SyntaxKind.FunctionDeclaration,
      SyntaxKind.ClassDeclaration,
      SyntaxKind.InterfaceDeclaration,
      SyntaxKind.TypeAliasDeclaration,
      SyntaxKind.EnumDeclaration,
      SyntaxKind.ModuleDeclaration,
    ].includes(kind);
  }

  private isExported(node: Node): boolean {
    // Check if the declaration has export modifier
    try {
      const modifiers = (node as any).getModifiers?.();
      return modifiers ? modifiers.some((mod: any) => mod.getKind() === SyntaxKind.ExportKeyword) : false;
    } catch {
      return false;
    }
  }

  private isTypeReference(node: Node): boolean {
    const parent = node.getParent();
    if (!parent) return false;

    const kind = parent.getKind();
    return [
      SyntaxKind.TypeReference,
      SyntaxKind.TypeParameter,
      SyntaxKind.TypeAliasDeclaration,
      SyntaxKind.InterfaceDeclaration,
    ].includes(kind);
  }

  private isImportUsage(node: Node): boolean {
    const parent = node.getParent();
    if (!parent) return false;

    const kind = parent.getKind();
    return [
      SyntaxKind.ImportDeclaration,
      SyntaxKind.NamedImports,
      SyntaxKind.ImportSpecifier,
    ].includes(kind);
  }

  private getContextString(node: Node): string {
    const parent = node.getParent();
    if (!parent) return node.getText();

    // Get a reasonable context around the identifier
    const start = Math.max(0, node.getStart() - 50);
    const end = Math.min(parent.getEnd(), node.getEnd() + 50);
    const context = parent.getSourceFile().getFullText().substring(start, end);
    
    return context.replace(/\s+/g, ' ').trim();
  }

  private displayResults(result: WhereUsedResult): void {
    if (this.options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log(pc.green(`\n📊 Usage Analysis for: ${result.symbol}`));
    console.log(pc.gray('─'.repeat(60)));
    
    console.log(pc.cyan(`Total Usages: ${result.totalUsages}`));
    console.log(pc.cyan(`Files Affected: ${result.files.length}`));
    console.log('');
    
    console.log(pc.yellow('Summary:'));
    console.log(`  📝 Declarations: ${result.summary.declarations}`);
    console.log(`  📥 Imports: ${result.summary.imports}`);
    console.log(`  🔗 References: ${result.summary.references}`);
    console.log(`  🏷️  Type References: ${result.summary.typeReferences}`);
    console.log('');

    if (this.options.verbose && result.usages.length > 0) {
      console.log(pc.yellow('Detailed Usages:'));
      console.log(pc.gray('─'.repeat(60)));
      
      // Group by file
      const usagesByFile = result.usages.reduce((acc, usage) => {
        if (!acc[usage.file]) acc[usage.file] = [];
        acc[usage.file].push(usage);
        return acc;
      }, {} as Record<string, UsageInfo[]>);

      for (const [file, usages] of Object.entries(usagesByFile)) {
        const relativePath = path.relative(process.cwd(), file);
        console.log(pc.blue(`\n📁 ${relativePath}`));
        
        for (const usage of usages) {
          const typeIcon = this.getTypeIcon(usage.type);
          console.log(`  ${typeIcon} Line ${usage.line}: ${usage.context}`);
        }
      }
    }

    console.log('');
  }

  private getTypeIcon(type: UsageInfo['type']): string {
    switch (type) {
      case 'declaration': return '📝';
      case 'import': return '📥';
      case 'reference': return '🔗';
      case 'type-reference': return '🏷️';
      default: return '❓';
    }
  }

  async findComponentUsages(componentName: string): Promise<WhereUsedResult> {
    console.log(pc.blue(`🔍 Finding component usages: ${componentName}`));
    
    // Find both direct usages and JSX usages
    const files = this.project.getSourceFiles();
    const usages: UsageInfo[] = [];
    const filesWithUsages = new Set<string>();

    for (const file of files) {
      const fileUsages = this.findComponentUsagesInFile(file, componentName);
      if (fileUsages.length > 0) {
        usages.push(...fileUsages);
        filesWithUsages.add(file.getFilePath());
      }
    }

    const result: WhereUsedResult = {
      symbol: componentName,
      totalUsages: usages.length,
      files: Array.from(filesWithUsages),
      usages,
      summary: {
        declarations: usages.filter(u => u.type === 'declaration').length,
        imports: usages.filter(u => u.type === 'import').length,
        references: usages.filter(u => u.type === 'reference').length,
        typeReferences: usages.filter(u => u.type === 'type-reference').length,
      }
    };

    this.displayResults(result);
    return result;
  }

  private findComponentUsagesInFile(file: SourceFile, componentName: string): UsageInfo[] {
    const usages: UsageInfo[] = [];
    
    // Find JSX elements with the component name
    const jsxElements = file.getDescendantsOfKind(SyntaxKind.JsxElement);
    for (const element of jsxElements) {
      const openingElement = element.getOpeningElement();
      const tagName = openingElement.getTagNameNode();
      
      if (tagName && tagName.getText() === componentName) {
        usages.push({
          file: file.getFilePath(),
          line: element.getStartLineNumber(),
          column: element.getStart(),
          context: this.getJSXContext(element),
          type: 'reference',
        });
      }
    }

    // Also find self-closing JSX elements
    const selfClosingElements = file.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
    for (const element of selfClosingElements) {
      const tagName = element.getTagNameNode();
      
      if (tagName && tagName.getText() === componentName) {
        usages.push({
          file: file.getFilePath(),
          line: element.getStartLineNumber(),
          column: element.getStart(),
          context: this.getJSXContext(element),
          type: 'reference',
        });
      }
    }

    // Find regular identifier usages
    const identifierUsages = this.findUsagesInFile(file, componentName);
    usages.push(...identifierUsages);

    return usages;
  }

  private getJSXContext(node: Node): string {
    const text = node.getText();
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(pc.red('❌ Usage: tsx scripts/where-used.ts <symbol> [options]'));
    console.log('');
    console.log('Options:');
    console.log('  --verbose     - Show detailed output with file locations');
    console.log('  --json        - Output results in JSON format');
    console.log('  --types       - Include type references in analysis');
    console.log('  --imports     - Include import statements in analysis');
    console.log('  --component   - Treat as React component (find JSX usages)');
    console.log('');
    console.log('Examples:');
    console.log('  tsx scripts/where-used.ts Button');
    console.log('  tsx scripts/where-used.ts Button --verbose');
    console.log('  tsx scripts/where-used.ts Button --component --json');
    process.exit(1);
  }

  const symbol = args[0];
  const options: WhereUsedOptions = {
    verbose: args.includes('--verbose'),
    json: args.includes('--json'),
    includeTypes: args.includes('--types'),
    includeImports: args.includes('--imports'),
  };

  const scanner = new WhereUsedScanner(options);

  try {
    if (args.includes('--component')) {
      await scanner.findComponentUsages(symbol);
    } else {
      await scanner.findUsages(symbol);
    }
  } catch (error) {
    console.error(pc.red(`❌ Error: ${error}`));
    process.exit(1);
  }
}

// Fix ES module detection for Windows paths
const currentFile = import.meta.url.replace('file:///', '').replace(/\//g, '\\');
const scriptFile = process.argv[1].replace(/\//g, '\\');

if (currentFile === scriptFile) {
  main();
}
