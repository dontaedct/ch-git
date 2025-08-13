#!/usr/bin/env tsx

import { Project, SyntaxKind, Node, ts } from 'ts-morph';
import { glob } from 'fast-glob';
import { blue, green, red, yellow, cyan } from 'picocolors';

interface RenameOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

class RenameRunner {
  private project: Project;
  private options: RenameOptions;

  constructor(options: RenameOptions = {}) {
    this.options = options;
    this.project = new Project({
      tsConfigFilePath: 'tsconfig.json',
    });
  }

  async renameSymbol(oldName: string, newName: string): Promise<void> {
    console.log(blue(`🔍 Renaming symbol: ${oldName} → ${newName}`));
    
    const files = this.project.getSourceFiles();
    let totalChanges = 0;

    for (const file of files) {
      const changes = this.renameSymbolInFile(file, oldName, newName);
      if (changes > 0) {
        totalChanges += changes;
        if (this.options.verbose) {
          console.log(`  ${file.getFilePath()}: ${changes} changes`);
        }
      }
    }

    if (totalChanges > 0) {
      console.log(green(`✅ Renamed ${totalChanges} occurrences of ${oldName} → ${newName}`));
      
      // Add deprecated re-export in @compat if needed
      await this.addCompatReexport(oldName, newName);
      
      if (!this.options.dryRun) {
        await this.project.save();
      }
    } else {
      console.log(yellow(`⚠️  No occurrences of ${oldName} found`));
    }
  }

  private renameSymbolInFile(file: any, oldName: string, newName: string): number {
    let changes = 0;
    
    // Find all identifiers with the old name
    const identifiers = file.getDescendantsOfKind(SyntaxKind.Identifier);
    
    for (const identifier of identifiers) {
      if (identifier.getText() === oldName) {
        // Check if it's a declaration or reference
        const parent = identifier.getParent();
        if (parent && this.shouldRenameIdentifier(parent, identifier)) {
          identifier.rename(newName);
          changes++;
        }
      }
    }

    return changes;
  }

  private shouldRenameIdentifier(parent: Node, identifier: Node): boolean {
    // Don't rename if it's a property name in an object literal
    if (parent.getKind() === SyntaxKind.PropertyAssignment) {
      const propertyAssignment = parent as any;
      if (propertyAssignment.getNameNode() === identifier) {
        return false;
      }
    }
    
    // Don't rename if it's a property name in a property signature
    if (parent.getKind() === SyntaxKind.PropertySignature) {
      const propertySignature = parent as any;
      if (propertySignature.getNameNode() === identifier) {
        return false;
      }
    }

    return true;
  }

  async renameImport(oldPath: string, newPath: string): Promise<void> {
    console.log(blue(`🔍 Renaming import: ${oldPath} → ${newPath}`));
    
    const files = this.project.getSourceFiles();
    let totalChanges = 0;

    for (const file of files) {
      const changes = this.renameImportInFile(file, oldPath, newPath);
      if (changes > 0) {
        totalChanges += changes;
        if (this.options.verbose) {
          console.log(`  ${file.getFilePath()}: ${changes} changes`);
        }
      }
    }

    if (totalChanges > 0) {
      console.log(green(`✅ Updated ${totalChanges} import statements`));
      
      // Add compat re-export if needed
      await this.addCompatReexport(oldPath, newPath);
      
      if (!this.options.dryRun) {
        await this.project.save();
      }
    } else {
      console.log(yellow(`⚠️  No imports of ${oldPath} found`));
    }
  }

  private renameImportInFile(file: any, oldPath: string, newPath: string): number {
    let changes = 0;
    
    const importDeclarations = file.getImportDeclarations();
    
    for (const importDecl of importDeclarations) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      if (moduleSpecifier === oldPath) {
        importDecl.setModuleSpecifier(newPath);
        changes++;
      }
    }

    return changes;
  }

  async renameRoute(oldKey: string, newKey: string): Promise<void> {
    console.log(blue(`🔍 Renaming route: ${oldKey} → ${newKey}`));
    
    // First update the registry
    const routesFile = this.project.getSourceFile('lib/registry/routes.ts');
    if (!routesFile) {
      console.log(red(`❌ Routes registry not found at lib/registry/routes.ts`));
      return;
    }

    let registryChanges = this.updateRouteRegistry(routesFile, oldKey, newKey);
    
    if (registryChanges > 0) {
      console.log(green(`✅ Updated routes registry: ${registryChanges} changes`));
      
      // Now apply codemod to usages
      const files = this.project.getSourceFiles();
      let usageChanges = 0;

      for (const file of files) {
        const changes = this.renameRouteUsage(file, oldKey, newKey);
        if (changes > 0) {
          usageChanges += changes;
          if (this.options.verbose) {
            console.log(`  ${file.getFilePath()}: ${changes} changes`);
          }
        }
      }

      console.log(green(`✅ Updated ${usageChanges} route usages`));
      
      if (!this.options.dryRun) {
        await this.project.save();
      }
    } else {
      console.log(yellow(`⚠️  Route key ${oldKey} not found in registry`));
    }
  }

  private updateRouteRegistry(routesFile: any, oldKey: string, newKey: string): number {
    let changes = 0;
    
    // Find and replace the old key with the new key
    const text = routesFile.getFullText();
    const regex = new RegExp(`(['"])${oldKey}\\1`, 'g');
    const newText = text.replace(regex, `$1${newKey}$1`);
    
    if (newText !== text) {
      routesFile.replaceWithText(newText);
      changes++;
    }

    return changes;
  }

  private renameRouteUsage(file: any, oldKey: string, newKey: string): number {
    let changes = 0;
    
    // Look for string literals that match the old route key
    const stringLiterals = file.getDescendantsOfKind(SyntaxKind.StringLiteral);
    
    for (const stringLit of stringLiterals) {
      if (stringLit.getLiteralValue() === oldKey) {
        stringLit.setLiteralValue(newKey);
        changes++;
      }
    }

    return changes;
  }

  async renameTable(oldTable: string, newTable: string): Promise<void> {
    console.log(blue(`🔍 Renaming table: ${oldTable} → ${newTable}`));
    
    // Update the registry
    const tablesFile = this.project.getSourceFile('lib/registry/tables.ts');
    if (!tablesFile) {
      console.log(red(`❌ Tables registry not found at lib/registry/tables.ts`));
      return;
    }

    let registryChanges = this.updateTableRegistry(tablesFile, oldTable, newTable);
    
    if (registryChanges > 0) {
      console.log(green(`✅ Updated tables registry: ${registryChanges} changes`));
      
      // Surface TODO for SQL migration
      console.log(yellow(`⚠️  TODO: Run SQL migration to rename table ${oldTable} → ${newTable}`));
      console.log(yellow(`     ALTER TABLE ${oldTable} RENAME TO ${newTable};`));
      
      if (!this.options.dryRun) {
        await this.project.save();
      }
    } else {
      console.log(yellow(`⚠️  Table ${oldTable} not found in registry`));
    }
  }

  private updateTableRegistry(tablesFile: any, oldTable: string, newTable: string): number {
    let changes = 0;
    
    // Find and replace the old table name with the new table name
    const text = tablesFile.getFullText();
    const regex = new RegExp(`(['"])${oldTable}\\1`, 'g');
    const newText = text.replace(regex, `$1${newTable}$1`);
    
    if (newText !== text) {
      tablesFile.replaceWithText(newText);
      changes++;
    }

    return changes;
  }

  private async addCompatReexport(oldName: string, newName: string): Promise<void> {
    // This is a placeholder for adding deprecated re-exports in @compat/*
    // Implementation would depend on the specific structure of the compat module
    console.log(cyan(`ℹ️  Consider adding deprecated re-export in @compat/* for ${oldName}`));
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log(red('❌ Usage: tsx scripts/rename.ts <command> <old> <new> [options]'));
    console.log('');
    console.log('Commands:');
    console.log('  symbol <OldName> <NewName>     - Rename symbol project-wide');
    console.log('  import <OldPath> <NewPath>     - Update import specifiers');
    console.log('  route <oldKey> <newKey>        - Update route registry and usages');
    console.log('  table <old_table> <new_table>  - Update table registry');
    console.log('');
    console.log('Options:');
    console.log('  --dry-run                      - Show changes without applying');
    console.log('  --verbose                      - Show detailed output');
    process.exit(1);
  }

  const [command, oldName, newName, ...options] = args;
  
  if (!oldName || !newName) {
    console.log(red('❌ Missing required arguments: <old> <new>'));
    process.exit(1);
  }
  
  const renameOptions: RenameOptions = {
    dryRun: options.includes('--dry-run'),
    verbose: options.includes('--verbose'),
  };

  const runner = new RenameRunner(renameOptions);

  try {
    switch (command) {
      case 'symbol':
        await runner.renameSymbol(oldName, newName);
        break;
      case 'import':
        await runner.renameImport(oldName, newName);
        break;
      case 'route':
        await runner.renameRoute(oldName, newName);
        break;
      case 'table':
        await runner.renameTable(oldName, newName);
        break;
      default:
        console.log(red(`❌ Unknown command: ${command}`));
        process.exit(1);
    }
  } catch (error) {
    console.error(red(`❌ Error: ${error}`));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
