#!/usr/bin/env tsx

import chokidar from 'chokidar';
import { Project, SyntaxKind, Node, ts } from 'ts-morph';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RenameEvent {
  oldPath: string;
  newPath: string;
  timestamp: number;
}

class ImportPathUpdater {
  private project: Project;
  private renameEvents: RenameEvent[] = [];
  private isProcessing = false;
  private throttleTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.project = new Project({
      tsConfigFilePath: path.join(__dirname, '..', 'tsconfig.json'),
    });
  }

  private getRelativePath(fromPath: string, toPath: string): string {
    const relative = path.relative(path.dirname(fromPath), toPath);
    return relative.startsWith('.') ? relative : `./${relative}`;
  }

  private updateImportPaths(oldPath: string, newPath: string) {
    try {
      // Get all source files that might import the moved file
      const sourceFiles = this.project.getSourceFiles();
      let updatedCount = 0;

      for (const sourceFile of sourceFiles) {
        const filePath = sourceFile.getFilePath();
        
        // Skip the moved file itself
        if (filePath === oldPath || filePath === newPath) {
          continue;
        }

        let hasChanges = false;

        // Update import declarations
        const importDeclarations = sourceFile.getImportDeclarations();
        for (const importDecl of importDeclarations) {
          const moduleSpecifier = importDecl.getModuleSpecifierValue();
          
          if (moduleSpecifier && !moduleSpecifier.startsWith('@')) {
            // Resolve relative imports
            const resolvedPath = path.resolve(path.dirname(filePath), moduleSpecifier);
            const normalizedOldPath = path.resolve(oldPath);
            const normalizedNewPath = path.resolve(newPath);
            
            if (resolvedPath === normalizedOldPath) {
              // Calculate new relative path
              const newRelativePath = this.getRelativePath(filePath, newPath);
              importDecl.setModuleSpecifier(newRelativePath);
              hasChanges = true;
            }
          }
        }

        // Update require statements
        const requireExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
        for (const callExpr of requireExpressions) {
          const expression = callExpr.getExpression();
          if (expression.getText() === 'require') {
            const args = callExpr.getArguments();
            if (args.length > 0) {
              const arg = args[0];
              if (arg.getKind() === SyntaxKind.StringLiteral) {
                const stringLiteral = arg as ts.StringLiteral;
                const moduleSpecifier = stringLiteral.text;
                
                if (moduleSpecifier && !moduleSpecifier.startsWith('@')) {
                  const resolvedPath = path.resolve(path.dirname(filePath), moduleSpecifier);
                  const normalizedOldPath = path.resolve(oldPath);
                  
                  if (resolvedPath === normalizedOldPath) {
                    const newRelativePath = this.getRelativePath(filePath, newPath);
                    // Use ts-morph's setLiteralValue method
                    (arg as any).setLiteralValue(newRelativePath);
                    hasChanges = true;
                  }
                }
              }
            }
          }
        }

        if (hasChanges) {
          sourceFile.saveSync();
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        console.log(`✅ Updated ${updatedCount} files with new import paths`);
      }
    } catch (error) {
      console.error(`❌ Error updating import paths:`, error);
    }
  }

  private processRenameEvents() {
    if (this.isProcessing || this.renameEvents.length === 0) {
      return;
    }

    this.isProcessing = true;
    const events = [...this.renameEvents];
    this.renameEvents = [];

    console.log(`\n🔄 Processing ${events.length} rename events...`);

    for (const event of events) {
      const oldName = path.basename(event.oldPath);
      const newName = path.basename(event.newPath);
      const oldDir = path.dirname(event.oldPath);
      const newDir = path.dirname(event.newPath);

      if (oldDir !== newDir) {
        console.log(`📁 File moved: ${oldName} → ${path.relative(process.cwd(), event.newPath)}`);
        this.updateImportPaths(event.oldPath, event.newPath);
      } else {
        console.log(`🔄 File renamed: ${oldName} → ${newName}`);
        this.updateImportPaths(event.oldPath, event.newPath);
      }
    }

    console.log(`\n✨ Rename processing complete\n`);
    this.isProcessing = false;
  }

  private throttleProcess() {
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout);
    }

    this.throttleTimeout = setTimeout(() => {
      this.processRenameEvents();
    }, 1000); // 1 second throttle
  }

  public addRenameEvent(oldPath: string, newPath: string) {
    this.renameEvents.push({
      oldPath,
      newPath,
      timestamp: Date.now(),
    });

    this.throttleProcess();
  }

  public startWatching() {
    console.log('🔍 Starting file rename watcher...');
    console.log('📁 Watching for file moves and renames in app/, components/, lib/, hooks/');
    console.log('⏱️  Throttled processing (1s delay)\n');

    const watcher = chokidar.watch(['app/**/*', 'components/**/*', 'lib/**/*', 'hooks/**/*'], {
      ignored: /(node_modules|\.git|\.next|\.swp|\.tmp)/,
      persistent: true,
      ignoreInitial: true,
    });

    // Track file paths for rename detection
    const filePaths = new Map<string, number>();

    watcher
      .on('add', (filePath: string) => {
        filePaths.set(filePath, Date.now());
      })
      .on('unlink', (filePath: string) => {
        filePaths.delete(filePath);
      })
      .on('move', (oldPath: string, newPath: string) => {
        console.log(`🔄 Detected move: ${path.relative(process.cwd(), oldPath)} → ${path.relative(process.cwd(), newPath)}`);
        this.addRenameEvent(oldPath, newPath);
      })
      .on('change', (filePath: string) => {
        // Update timestamp for change events
        if (filePaths.has(filePath)) {
          filePaths.set(filePath, Date.now());
        }
      })
      .on('error', (error: Error) => {
        console.error('❌ Watcher error:', error);
      });

    console.log('✅ File watcher started successfully');
    console.log('Press Ctrl+C to stop\n');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down file watcher...');
      watcher.close();
      process.exit(0);
    });
  }
}

// Start the watcher
const updater = new ImportPathUpdater();
updater.startWatching();
